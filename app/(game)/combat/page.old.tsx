'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Swords, Heart, Shield, Zap, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CombatGrid } from '@/components/game/CombatGrid';
import { EnhancedCombatView } from '@/components/game/EnhancedCombatView';
import { TraitIcon } from '@/components/game/TraitIcon';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useGameStore } from '@/lib/stores/gameStore';
import { useChapterMapStore } from '@/lib/stores/chapterMapStore';
import { useUIStore, GameState } from '@/lib/stores/uiStore';
import { ContentPartnerSchema, RewardsData } from '@/lib/schemas/game-schemas';
import { 
  CombatUnit, 
  CombatPosition, 
  generateEnemyTeam,
  getValidMoves,
  getTargetsInRange,
  calculateDamage,
  EnemyType,
  ENEMY_TEMPLATES
} from '@/lib/game/combat';
import { NEURODIVERGENT_TRAITS } from '@/lib/game/traits';
import { cn } from '@/lib/utils';

type CombatPhase = 'placement' | 'battle' | 'victory' | 'defeat';

export default function CombatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getActivePartners } = usePartnerStore();
  const { earnTips, earnStarFragment, gainExperience } = useGameStore();
  const { completeNode, currentChapter } = useChapterMapStore();
  const { setState } = useUIStore();
  
  // Check if this is a story combat (accessed from map)
  const isStoryCombat = searchParams.get('story') === 'true';
  const nodeId = searchParams.get('nodeId');
  const isBossBattle = searchParams.get('boss') === 'true';
  
  const [phase, setPhase] = useState<CombatPhase>('placement');
  const [playerUnits, setPlayerUnits] = useState<CombatUnit[]>([]);
  const [enemyUnits, setEnemyUnits] = useState<CombatUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<CombatUnit | null>(null);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [validMoves, setValidMoves] = useState<CombatPosition[]>([]);
  const [validTargets, setValidTargets] = useState<CombatUnit[]>([]);
  
  useEffect(() => {
    // Set UI state to combat mode
    setState(GameState.TACTICAL_COMBAT);
    initializeCombat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setState]);
  
  // If this is a story combat, use the enhanced view
  if (isStoryCombat) {
    const handleCombatEnd = (victory: boolean, rewards?: RewardsData) => {
      if (victory) {
        if (rewards) {
          earnTips(rewards.tips || 0);
          gainExperience(rewards.experience || 0);
        }
        
        // Complete the node in the chapter map
        if (nodeId) {
          completeNode(nodeId);
        }
        
        // Navigate back to story map
        setTimeout(() => {
          router.push('/story/map');
        }, 2000);
      } else {
        // On defeat, let player retry
        setTimeout(() => {
          router.push('/story/map');
        }, 2000);
      }
    };
    
    // Generate contextual enemies based on location
    const generateContextualEnemies = (): CombatUnit[] => {
      const enemyTypes: EnemyType[] = isBossBattle 
        ? ['corporate_manager', 'security_guard'] 
        : ['angry_customer', 'karen_customer', 'bourgeois_resident'];
      
      const numEnemies = isBossBattle ? 1 : 2 + Math.floor(currentChapter / 2);
      const enemies: CombatUnit[] = [];
      
      for (let i = 0; i < numEnemies; i++) {
        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const template = ENEMY_TEMPLATES[enemyType];
        const position: CombatPosition = {
          x: 4 + Math.floor(i / 2),
          y: 2 + (i % 3)
        };
        
        enemies.push({
          ...template,
          id: `enemy_${i}`,
          position,
          stats: {
            ...template.stats,
            // Scale with chapter
            maxHealth: Math.floor(template.stats.maxHealth * (1 + currentChapter * 0.2)),
            currentHealth: Math.floor(template.stats.maxHealth * (1 + currentChapter * 0.2)),
            attack: Math.floor(template.stats.attack * (1 + currentChapter * 0.1))
          }
        });
      }
      
      return enemies;
    };
    
    const partners = getActivePartners();
    const combatPartners: CombatUnit[] = partners.map((partner, index) => ({
      id: partner.id,
      name: partner.name,
      type: 'partner' as const,
      position: { x: 1 + Math.floor(index / 2), y: 2 + (index % 3) },
      stats: {
        currentHealth: 100,
        maxHealth: 100,
        attack: Math.floor((partner.stats.focus + partner.stats.logic) / 4),
        defense: Math.floor((partner.stats.stamina + partner.stats.perception) / 4),
        speed: partner.stats.focus,
      },
      traits: [partner.primaryTrait, partner.secondaryTrait].filter(Boolean) as string[],
      abilities: partner.primaryTrait ? [{
        id: partner.primaryTrait,
        name: NEURODIVERGENT_TRAITS[partner.primaryTrait as keyof typeof NEURODIVERGENT_TRAITS]?.combatAbility?.name || '',
        cooldown: NEURODIVERGENT_TRAITS[partner.primaryTrait as keyof typeof NEURODIVERGENT_TRAITS]?.combatAbility?.cooldown || 3,
        currentCooldown: 0,
      }] : [],
      isActive: true,
      hasActed: false,
    }));
    
    return (
      <EnhancedCombatView
        playerUnits={combatPartners}
        enemyUnits={generateContextualEnemies()}
        background={isBossBattle ? 'office' : 'street'}
        onCombatEnd={handleCombatEnd}
      />
    );
  }
  
  const initializeCombat = () => {
    let partners = getActivePartners();
    
    // Debug logging
    console.log('🎯 Combat Initialization:');
    console.log('  - Active partners:', partners);
    console.log('  - Partner count:', partners.length);
    console.log('  - Is story combat:', isStoryCombat);
    console.log('  - Node ID:', nodeId);
    
    // If no active partners, check if any partners exist at all
    const { partners: allPartners, addPartner, setActiveTeam } = usePartnerStore.getState();
    
    if (partners.length === 0) {
      console.warn('⚠️ No active partners available for combat!');
      
      // If no partners exist at all, create emergency demo partners
      if (allPartners.length === 0) {
        console.log('🚨 No partners exist! Creating emergency demo partners...');
        
        // Create a simple demo partner for combat that matches ContentPartner interface
        const demoPartnerData = {
          id: 'demo-partner-1',
          name: 'Demo Courier',
          class: 'courier' as const,
          primaryTrait: 'hyperfocus' as const,
          level: 1,
          rarity: 'common' as const,
          stats: {
            focus: 15,
            perception: 12,
            social: 10,
            logic: 8,
            stamina: 14,
          },
          personality: {
            traits: ['Energetic', 'Quick-thinking'],
            likes: ['Fast delivery', 'City exploration'],
            dislikes: ['Waiting', 'Bureaucracy'],
            backstory: 'A hyperactive courier ready for action.'
          },
          // ContentPartner required fields
          contentId: 'demo-partner-1',
          isContentBased: true as const,
          relationships: {
            player: 50,
            whix_corporate: -20
          },
          backstory: 'A hyperactive courier ready for action.'
        };
        
        // Validate with Zod schema
        const demoPartner = ContentPartnerSchema.parse(demoPartnerData);
        const newPartner = addPartner(demoPartner);
        setActiveTeam([newPartner.id]);
        partners = [newPartner];
        
        addToLog("🆘 Demo partner created for combat!");
      } else {
        // If partners exist but none are active, auto-select the first one
        console.log('🔧 Auto-selecting first available partner...');
        setActiveTeam([allPartners[0].id]);
        partners = [allPartners[0]];
        addToLog("📝 Auto-selected available partner for combat.");
      }
    }
    
    const playerStartPositions: CombatPosition[] = [
      { x: 1, y: 2 },
      { x: 0, y: 1 },
      { x: 0, y: 3 },
    ];
    
    const combatPartners: CombatUnit[] = partners.map((partner, index) => ({
      id: partner.id,
      name: partner.name,
      type: 'partner' as const,
      position: playerStartPositions[index] || { x: 0, y: 0 },
      stats: {
        currentHealth: 100,
        maxHealth: 100,
        attack: Math.floor((partner.stats.focus + partner.stats.logic) / 4),
        defense: Math.floor((partner.stats.stamina + partner.stats.perception) / 4),
        speed: partner.stats.focus,
      },
      traits: [partner.primaryTrait, partner.secondaryTrait].filter(Boolean) as string[],
      abilities: partner.primaryTrait ? [{
        id: partner.primaryTrait,
        name: NEURODIVERGENT_TRAITS[partner.primaryTrait as keyof typeof NEURODIVERGENT_TRAITS]?.combatAbility?.name || '',
        cooldown: NEURODIVERGENT_TRAITS[partner.primaryTrait as keyof typeof NEURODIVERGENT_TRAITS]?.combatAbility?.cooldown || 3,
        currentCooldown: 0,
      }] : [],
      isActive: true,
      hasActed: false,
    }));
    
    setPlayerUnits(combatPartners);
    setEnemyUnits(generateEnemyTeam(1));
    addToLog("Combat initiated! Place your partners and prepare for battle.");
  };
  
  const addToLog = (message: string) => {
    setCombatLog(prev => [message, ...prev].slice(0, 5));
  };
  
  const handleCellClick = (position: CombatPosition) => {
    if (!selectedUnit || phase !== 'battle') return;
    
    if (validMoves.some(pos => pos.x === position.x && pos.y === position.y)) {
      // Move unit
      const allUnits = [...playerUnits, ...enemyUnits];
      const updatedUnits = allUnits.map(unit => 
        unit.id === selectedUnit.id 
          ? { ...unit, position, hasActed: true }
          : unit
      );
      
      setPlayerUnits(updatedUnits.filter(u => u.type === 'partner'));
      setEnemyUnits(updatedUnits.filter(u => u.type === 'enemy'));
      addToLog(`${selectedUnit.name} moved to (${position.x}, ${position.y})`);
      
      endTurn();
    }
  };
  
  const handleUnitClick = (unit: CombatUnit) => {
    if (phase !== 'battle') return;
    
    if (validTargets.some(t => t.id === unit.id)) {
      // Attack target
      if (selectedUnit) {
        const damage = calculateDamage(selectedUnit, unit);
        const updatedUnit = {
          ...unit,
          stats: {
            ...unit.stats,
            currentHealth: Math.max(0, unit.stats.currentHealth - damage),
          },
          isActive: unit.stats.currentHealth - damage > 0,
        };
        
        if (unit.type === 'enemy') {
          setEnemyUnits(prev => prev.map(e => e.id === unit.id ? updatedUnit : e));
        } else {
          setPlayerUnits(prev => prev.map(p => p.id === unit.id ? updatedUnit : p));
        }
        
        addToLog(`${selectedUnit.name} attacked ${unit.name} for ${damage} damage!`);
        
        // Mark attacker as having acted
        const allUnits = [...playerUnits, ...enemyUnits];
        const updatedAttacker = allUnits.find(u => u.id === selectedUnit.id);
        if (updatedAttacker) {
          updatedAttacker.hasActed = true;
          if (updatedAttacker.type === 'partner') {
            setPlayerUnits(prev => prev.map(p => p.id === selectedUnit.id ? updatedAttacker : p));
          }
        }
        
        endTurn();
      }
    } else if (unit.type === 'partner' && !unit.hasActed && unit.isActive) {
      // Select friendly unit
      setSelectedUnit(unit);
      const allUnits = [...playerUnits, ...enemyUnits];
      setValidMoves(getValidMoves(unit, allUnits));
      setValidTargets(getTargetsInRange(unit, allUnits));
    }
  };
  
  const endTurn = () => {
    setSelectedUnit(null);
    setValidMoves([]);
    setValidTargets([]);
    
    // Check victory/defeat conditions
    const activeEnemies = enemyUnits.filter(e => e.isActive);
    const activePartners = playerUnits.filter(p => p.isActive);
    
    if (activeEnemies.length === 0) {
      setPhase('victory');
      handleVictory();
    } else if (activePartners.length === 0) {
      setPhase('defeat');
    } else {
      // Process AI turn if needed
      processNextTurn();
    }
  };
  
  const processNextTurn = () => {
    const allUnits = [...playerUnits, ...enemyUnits].filter(u => u.isActive && !u.hasActed);
    
    if (allUnits.length === 0) {
      // Reset for new round
      setPlayerUnits(prev => prev.map(u => ({ ...u, hasActed: false })));
      setEnemyUnits(prev => prev.map(u => ({ ...u, hasActed: false })));
      setCurrentTurn(prev => prev + 1);
      addToLog(`--- Turn ${currentTurn + 2} ---`);
    }
  };
  
  const handleVictory = () => {
    const baseTips = 150;
    const starFragments = Math.random() < 0.3 ? 1 : 0;
    
    earnTips(baseTips);
    if (starFragments > 0) {
      earnStarFragment(starFragments);
    }
    
    addToLog(`Victory! Earned ${baseTips} tips${starFragments > 0 ? ' and 1 star fragment!' : '!'}`);
  };
  
  const startBattle = () => {
    setPhase('battle');
    addToLog("Battle begins!");
  };
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          Combat Mission
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Defend against Whix&apos;s corporate enforcers
        </p>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Combat Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Battlefield</span>
                <span className="text-sm font-normal">Turn {currentTurn + 1}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <CombatGrid
                units={[...playerUnits, ...enemyUnits]}
                selectedUnit={selectedUnit}
                validMoves={validMoves}
                validTargets={validTargets}
                onCellClick={handleCellClick}
                onUnitClick={handleUnitClick}
              />
            </CardContent>
          </Card>
          
          {/* Action Buttons */}
          {phase === 'placement' && (
            <div className="mt-4 text-center">
              <Button onClick={startBattle} variant="game" size="lg">
                <Swords className="mr-2" />
                Start Battle
              </Button>
            </div>
          )}
          
          {phase === 'battle' && selectedUnit && selectedUnit.type === 'partner' && (
            <div className="mt-4 flex gap-2 justify-center">
              <Button variant="outline" onClick={() => endTurn()}>
                <SkipForward className="mr-2" />
                Skip Turn
              </Button>
              {selectedUnit.abilities?.map(ability => (
                <Button
                  key={ability.id}
                  variant="game"
                  disabled={ability.currentCooldown > 0}
                >
                  <TraitIcon trait={ability.id as keyof typeof NEURODIVERGENT_TRAITS} size="sm" className="mr-2" />
                  {ability.name}
                  {ability.currentCooldown > 0 && ` (${ability.currentCooldown})`}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Unit Info */}
          {selectedUnit && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedUnit.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      Health
                    </span>
                    <span>{selectedUnit.stats.currentHealth}/{selectedUnit.stats.maxHealth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Swords className="w-4 h-4 text-orange-500" />
                      Attack
                    </span>
                    <span>{selectedUnit.stats.attack}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-blue-500" />
                      Defense
                    </span>
                    <span>{selectedUnit.stats.defense}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      Speed
                    </span>
                    <span>{selectedUnit.stats.speed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Combat Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Combat Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {combatLog.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-gray-600 dark:text-gray-400"
                  >
                    {log}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Victory/Defeat Modals */}
      {(phase === 'victory' || phase === 'defeat') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        >
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className={cn(
                "text-2xl text-center",
                phase === 'victory' ? "text-green-500" : "text-red-500"
              )}>
                {phase === 'victory' ? 'Victory!' : 'Defeat...'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">
                {phase === 'victory' 
                  ? 'You successfully defended against the corporate enforcers!'
                  : 'Your team was overwhelmed. Try again with a different strategy.'}
              </p>
              <Button onClick={() => window.location.href = '/missions'}>
                Return to Missions
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}