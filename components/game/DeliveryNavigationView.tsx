'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DeliveryGridView } from './DeliveryGridView';
import { SocialEncounterView } from './SocialEncounterView';
import { DeliveryHUD } from '@/components/game-ui/hud/DeliveryHUD';
import { DeliveryGridEngine, DeliveryUnit, DeliveryPosition } from '@/lib/game/delivery-grid';
import { DISTRICT_TEMPLATES, DistrictId } from '@/lib/game/district-templates';
import { useEncounterFromMarkdown } from '@/lib/hooks/useEncounter';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useMissionStore } from '@/lib/stores/missionStore';
import { useGameStore } from '@/lib/stores/gameStore';
import { useCustomerStore } from '@/lib/stores/customerStore';
import { CheckCircle, XCircle, Navigation, Package, User } from 'lucide-react';

interface DeliveryNavigationViewProps {
  districtId: DistrictId;
  onDeliveryComplete?: (success: boolean, rewards?: { tips?: number; experience?: number }) => void;
  className?: string;
}

type GamePhase = 'navigation' | 'encounter' | 'completed' | 'failed';

export function DeliveryNavigationView({
  districtId,
  onDeliveryComplete,
  className,
}: DeliveryNavigationViewProps) {
  const { getActivePartners } = usePartnerStore();
  const { currentMissionId, getMissionById, updateMissionProgress, completeMission } = useMissionStore();
  const { earnTips, gainExperience } = useGameStore();
  const { generateRandomCustomer, setActiveCustomer, recordInteraction } = useCustomerStore();
  
  // Game state
  const [gamePhase, setGamePhase] = useState<GamePhase>('navigation');
  const [gridEngine, setGridEngine] = useState<DeliveryGridEngine | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<DeliveryUnit | null>(null);
  const [validMoves, setValidMoves] = useState<DeliveryPosition[]>([]);
  const [currentEncounterId, setCurrentEncounterId] = useState<string | null>(null);
  const [turnNumber, setTurnNumber] = useState(1);
  const [gameResult, setGameResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // HUD state
  const [packageCondition, setPackageCondition] = useState(100);
  const [customerMood, setCustomerMood] = useState<'happy' | 'neutral' | 'impatient' | 'angry'>('neutral');
  const [encounterCount, setEncounterCount] = useState(0);
  
  // Customer state
  const [currentCustomer, setCurrentCustomer] = useState<ReturnType<typeof generateRandomCustomer> | null>(null);
  
  // Load encounter if needed
  const { encounter, loading: encounterLoading } = useEncounterFromMarkdown(currentEncounterId || '');
  
  // Initialize game
  useEffect(() => {
    const districtTemplate = DISTRICT_TEMPLATES[districtId];
    if (!districtTemplate) return;
    
    const engine = new DeliveryGridEngine(districtTemplate);
    
    // Create delivery unit from first active partner
    const activePartners = getActivePartners();
    if (activePartners.length === 0) {
      console.error('No active partners for delivery');
      return;
    }
    
    const partner = activePartners[0];
    const deliveryUnit: DeliveryUnit = {
      id: `delivery-${Date.now()}`,
      partnerId: partner.id,
      position: { x: 0, y: 0 }, // Start position
      package: {
        id: `package-${Date.now()}`,
        destination: { x: 8, y: 8 }, // Random destination for now
        type: 'food',
        timeRemaining: 15, // 15 minutes
      },
      actionPoints: 3,
      hasActed: false,
    };
    
    engine.addUnit(deliveryUnit);
    engine.setPartnerForUnit(deliveryUnit.id, partner); // Apply trait bonuses
    setGridEngine(engine);
    setSelectedUnit(deliveryUnit);
    setValidMoves(engine.getValidMoves(deliveryUnit));
    
    // Generate customer for this delivery
    const customer = generateRandomCustomer(districtId);
    setCurrentCustomer(customer);
    setActiveCustomer(customer.id);
  }, [districtId, getActivePartners, generateRandomCustomer, setActiveCustomer]);
  
  // Handle cell clicks
  const handleCellClick = useCallback((position: DeliveryPosition) => {
    if (!gridEngine || !selectedUnit || gamePhase !== 'navigation') return;
    
    // Check if it's a valid move
    const isValidMove = validMoves.some(move => move.x === position.x && move.y === position.y);
    if (!isValidMove) return;
    
    // Attempt to move
    const result = gridEngine.moveUnit(selectedUnit.id, position);
    
    if (result.success) {
      // Update unit state
      const updatedUnit = gridEngine.getUnit(selectedUnit.id);
      if (updatedUnit) {
        setSelectedUnit(updatedUnit);
        setValidMoves(gridEngine.getValidMoves(updatedUnit));
        
        // Check for delivery completion
        if (gridEngine.checkDeliveryComplete(selectedUnit.id)) {
          setGamePhase('completed');
          
          // Record customer interaction
          if (currentCustomer && selectedUnit) {
            const interaction = recordInteraction({
              customerId: currentCustomer.id,
              deliveryId: `delivery-${Date.now()}`,
              partnerId: selectedUnit.partnerId,
              deliveryTime: turnNumber * 2, // Approximate minutes (2 min per turn)
              packageCondition,
              orderAccuracy: true, // For now, assume order is correct
              specialRequestsMet: packageCondition > 70, // Simple logic for demo
              partnerBehavior: encounterCount === 0 ? 'professional' : 'rushed',
              customerResponse: customerMood
            });
            
            // Update rewards based on customer satisfaction
            const baseTips = 25;
            earnTips(interaction.tipAmount);
            gainExperience(Math.floor(50 * (packageCondition / 100)));
          }
          
          // Update mission progress if applicable
          const currentMission = currentMissionId ? getMissionById(currentMissionId) : null;
          if (currentMission) {
            // Find delivery objective and update progress
            const deliveryObjective = currentMission.objectives.find(obj => obj.type === 'deliver');
            if (deliveryObjective) {
              updateMissionProgress(currentMissionId, deliveryObjective.id, deliveryObjective.current + 1);
              
              // Check if mission is complete
              const allObjectivesComplete = currentMission.objectives.every(obj => 
                obj.current >= obj.required
              );
              
              if (allObjectivesComplete) {
                completeMission(currentMissionId, turnNumber <= 10); // Perfect if completed quickly
                
                // Apply mission rewards
                earnTips(currentMission.rewards.tips);
                gainExperience(currentMission.rewards.experience);
              }
            }
          }
          
          setGameResult({
            success: true,
            message: 'Delivery completed successfully! Customer is satisfied.',
          });
          return;
        }
        
        // Check for encounter
        if (result.encounter) {
          setCurrentEncounterId(result.encounter);
          setGamePhase('encounter');
          setEncounterCount(prev => prev + 1);
        }
      }
    }
  }, [gridEngine, selectedUnit, validMoves, gamePhase, currentMissionId, getMissionById, updateMissionProgress, completeMission, earnTips, gainExperience, turnNumber, currentCustomer, packageCondition, customerMood, encounterCount, recordInteraction]);
  
  // Handle unit selection
  const handleUnitSelect = useCallback((unitId: string) => {
    if (!gridEngine || gamePhase !== 'navigation') return;
    
    const unit = gridEngine.getUnit(unitId);
    if (unit) {
      setSelectedUnit(unit);
      setValidMoves(gridEngine.getValidMoves(unit));
    }
  }, [gridEngine, gamePhase]);
  
  // Handle encounter completion
  const handleEncounterComplete = useCallback((outcome: 'victory' | 'defeat', rewards?: { endDelivery?: boolean }) => {
    setGamePhase('navigation');
    setCurrentEncounterId(null);
    
    // Update mission progress for talk/survive objectives
    const currentMission = currentMissionId ? getMissionById(currentMissionId) : null;
    if (currentMission && outcome === 'victory') {
      // Update talk objectives (social encounters)
      const talkObjective = currentMission.objectives.find(obj => obj.type === 'talk');
      if (talkObjective) {
        updateMissionProgress(currentMissionId, talkObjective.id, talkObjective.current + 1);
      }
      
      // Update survive objectives (any completed encounter)
      const surviveObjective = currentMission.objectives.find(obj => obj.type === 'survive');
      if (surviveObjective) {
        updateMissionProgress(currentMissionId, surviveObjective.id, surviveObjective.current + 1);
      }
    }
    
    if (outcome === 'defeat') {
      // Some encounters might end the delivery
      if (rewards?.endDelivery) {
        setGamePhase('failed');
        setGameResult({
          success: false,
          message: 'Delivery failed due to encounter complications.',
        });
        return;
      }
    }
    
    // Continue navigation
    if (gridEngine && selectedUnit) {
      const updatedUnit = gridEngine.getUnit(selectedUnit.id);
      if (updatedUnit) {
        setSelectedUnit(updatedUnit);
        setValidMoves(gridEngine.getValidMoves(updatedUnit));
      }
    }
  }, [gridEngine, selectedUnit, currentMissionId, getMissionById, updateMissionProgress]);
  
  // Handle end turn
  const handleEndTurn = useCallback(() => {
    if (!gridEngine) return;
    
    gridEngine.resetTurn();
    setTurnNumber(prev => prev + 1);
    
    // Update package condition (degrades over time)
    setPackageCondition(prev => Math.max(0, prev - 5)); // Lose 5% per turn
    
    // Update customer mood based on time remaining
    const units = gridEngine.getAllUnits();
    if (units.length > 0) {
      const unit = units[0];
      const timeRemainingPercent = (unit.package.timeRemaining / 15) * 100; // Assuming 15 minutes initial
      
      if (timeRemainingPercent > 60) {
        setCustomerMood('happy');
      } else if (timeRemainingPercent > 40) {
        setCustomerMood('neutral');
      } else if (timeRemainingPercent > 20) {
        setCustomerMood('impatient');
      } else {
        setCustomerMood('angry');
      }
    }
    
    // Check if time ran out
    if (units.some(unit => unit.package.timeRemaining <= 0)) {
      setGamePhase('failed');
      setGameResult({
        success: false,
        message: 'Delivery failed: Time limit exceeded!',
      });
      return;
    }
    
    // Reset unit state
    if (selectedUnit) {
      const updatedUnit = gridEngine.getUnit(selectedUnit.id);
      if (updatedUnit) {
        setSelectedUnit(updatedUnit);
        setValidMoves(gridEngine.getValidMoves(updatedUnit));
      }
    }
  }, [gridEngine, selectedUnit]);
  
  // Handle game end
  useEffect(() => {
    if (gamePhase === 'completed' && gameResult?.success) {
      setTimeout(() => {
        onDeliveryComplete?.(true, { tips: 25, experience: 50 });
      }, 2000);
    } else if (gamePhase === 'failed') {
      setTimeout(() => {
        onDeliveryComplete?.(false);
      }, 2000);
    }
  }, [gamePhase, gameResult, onDeliveryComplete]);
  
  // Loading state
  if (!gridEngine) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing delivery route...</p>
        </div>
      </div>
    );
  }
  
  // Encounter phase
  if (gamePhase === 'encounter' && encounter && !encounterLoading) {
    return (
      <div className="h-full">
        <SocialEncounterView
          encounter={encounter}
          onComplete={handleEncounterComplete}
          className="h-full"
        />
      </div>
    );
  }
  
  // Game result screen
  if (gamePhase === 'completed' || gamePhase === 'failed') {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="mb-6">
            {gameResult?.success ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            )}
            <h2 className="text-2xl font-bold mb-2">
              {gameResult?.success ? 'Delivery Complete!' : 'Delivery Failed'}
            </h2>
            <p className="text-muted-foreground">{gameResult?.message}</p>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Navigation phase
  return (
    <div className={className}>
      {/* Delivery HUD */}
      {selectedUnit && (
        <DeliveryHUD
          deliveryUnit={selectedUnit}
          timeRemaining={selectedUnit.package.timeRemaining * 60} // Convert to seconds
          packageCondition={packageCondition}
          customerMood={customerMood}
          estimatedTips={Math.floor(25 * (packageCondition / 100) * (customerMood === 'happy' ? 1.2 : customerMood === 'angry' ? 0.7 : 1))}
          currentDistrict={districtId}
          encounterCount={encounterCount}
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full pt-24">
        {/* Main grid view */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-4 h-full">
              <DeliveryGridView
                gridSize={12}
                cells={gridEngine['grid']} // Access private property for demo
                units={gridEngine.getAllUnits()}
                selectedUnit={selectedUnit}
                validMoves={validMoves}
                onCellClick={handleCellClick}
                onUnitSelect={handleUnitSelect}
                className="h-full"
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Side panel */}
        <div className="space-y-4">
          {/* Turn info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Turn {turnNumber}</h3>
                <Button
                  onClick={handleEndTurn}
                  variant="outline"
                  size="sm"
                  disabled={!selectedUnit?.hasActed}
                >
                  End Turn
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Move your delivery partner to reach the destination while managing encounters.
              </div>
            </CardContent>
          </Card>
          
          {/* Customer info */}
          {currentCustomer && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="font-medium">{currentCustomer.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {currentCustomer.tier} Customer • {currentCustomer.currentMood}
                    </p>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>{currentCustomer.address.street}</p>
                    {currentCustomer.address.specialInstructions && (
                      <p className="text-xs text-muted-foreground">
                        {currentCustomer.address.specialInstructions}
                      </p>
                    )}
                  </div>
                  {currentCustomer.defaultRequests.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium mb-1">Special Requests:</p>
                      {currentCustomer.defaultRequests.map((req, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground">
                          • {req.type.replace(/_/g, ' ')}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* District info */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">
                {DISTRICT_TEMPLATES[districtId].name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Surveillance:</span>
                  <span className="capitalize">{DISTRICT_TEMPLATES[districtId].difficultyModifiers.surveillanceLevel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Traffic:</span>
                  <span className="capitalize">{DISTRICT_TEMPLATES[districtId].difficultyModifiers.trafficLevel}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Controls help */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Controls</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  <span>Click highlighted cells to move</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>Reach the starred destination</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}