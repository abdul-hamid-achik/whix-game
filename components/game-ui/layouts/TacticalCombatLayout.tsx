'use client';

import { ReactNode, useState } from 'react';
import { useUIStore, GameState } from '@/lib/stores/uiStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useGameStore } from '@/lib/stores/gameStore';
import { NeuraButton } from '@/components/neura';
import { Sword, Shield, Zap, Target, Clock, Play } from 'lucide-react';
import { CombatGrid } from '../combat/CombatGrid';
import { ActionMenu, exampleActions } from '../combat/ActionMenu';
import { TurnTimeline } from '../combat/TurnTimeline';

interface TacticalCombatLayoutProps {
  children: ReactNode;
}

export function TacticalCombatLayout({ children: _children }: TacticalCombatLayoutProps) {
  const { setState, contextData, settings } = useUIStore();
  const { partners } = usePartnerStore();
  const { currentTips } = useGameStore();
  const appMode = settings.appMode || 'game';

  const activePartners = Object.values(partners).slice(0, 3); // Take first 3 partners
  const encounterData = contextData?.nodeData;
  const encounterType = contextData?.encounterType || 'combat';

  // Combat state
  const [currentTurn, setCurrentTurn] = useState(1);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<{x: number; y: number} | null>(null);
  const [isWaitingForTarget, setIsWaitingForTarget] = useState(false);
  
  // Example units for combat grid
  const [combatUnits, setCombatUnits] = useState([
    ...activePartners.map((p, i) => ({
      id: p.id,
      name: p.name,
      type: 'partner' as const,
      position: { x: 1, y: i + 1 },
      health: 100,
      maxHealth: 100,
      energy: 85,
      maxEnergy: 100,
      armor: 10
    })),
    // Example enemies/obstacles
    {
      id: 'enemy1',
      name: appMode === 'delivery' ? 'Traffic Jam' : 'Corporate Drone',
      type: 'enemy' as const,
      position: { x: 6, y: 1 },
      health: 80,
      maxHealth: 80,
      energy: 50,
      maxEnergy: 50,
      armor: 5
    },
    {
      id: 'enemy2',
      name: appMode === 'delivery' ? 'Road Construction' : 'Security Bot',
      type: 'enemy' as const,
      position: { x: 6, y: 3 },
      health: 120,
      maxHealth: 120,
      energy: 40,
      maxEnergy: 40,
      armor: 15
    }
  ]);

  const [activeUnitId, setActiveUnitId] = useState(combatUnits[0]?.id);
  const activeUnit = combatUnits.find(u => u.id === activeUnitId);

  const handleActionSelect = (actionId: string) => {
    setSelectedAction(actionId);
    // Some actions need targets
    if (['attack', 'neural-surge', 'heal'].includes(actionId)) {
      setIsWaitingForTarget(true);
    }
  };

  const handleTileClick = (position: {x: number; y: number}) => {
    if (isWaitingForTarget && selectedAction) {
      // Execute action on target
      console.log('Executing', selectedAction, 'on position', position);
      setSelectedAction(null);
      setIsWaitingForTarget(false);
      setSelectedPosition(null);
    } else if (selectedAction === 'move') {
      // Move unit
      setCombatUnits(units => units.map(u => 
        u.id === activeUnitId ? { ...u, position } : u
      ));
      setSelectedAction(null);
    } else {
      setSelectedPosition(position);
    }
  };

  const handleUnitClick = (unit: typeof combatUnits[0]) => {
    if (isWaitingForTarget && selectedAction) {
      handleTileClick(unit.position);
    } else {
      setActiveUnitId(unit.id);
    }
  };

  const handleEndTurn = () => {
    // Cycle to next unit
    const currentIndex = combatUnits.findIndex(u => u.id === activeUnitId);
    const nextIndex = (currentIndex + 1) % combatUnits.length;
    setActiveUnitId(combatUnits[nextIndex].id);
    
    // Increment turn when all units have acted
    if (nextIndex === 0) {
      setCurrentTurn(prev => prev + 1);
    }
    
    setSelectedAction(null);
    setIsWaitingForTarget(false);
  };

  const handleVictory = () => {
    setState(GameState.AFTER_ACTION, {
      ...contextData,
      combatResult: 'victory',
      rewards: encounterData?.rewards
    });
  };

  const _getActionIcon = (action: string) => {
    switch (action) {
      case 'attack': return <Sword className="w-4 h-4" />;
      case 'defend': return <Shield className="w-4 h-4" />;
      case 'special': return <Zap className="w-4 h-4" />;
      case 'focus': return <Target className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const _getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-400';
    if (health >= 50) return 'text-yellow-400';
    if (health >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Minimal Header */}
      <div className="bg-gray-900/90 backdrop-blur-sm border-b border-red-500/30 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                encounterType === 'boss' ? 'bg-red-500 animate-pulse' :
                encounterType === 'combat' ? 'bg-orange-500' :
                'bg-yellow-500'
              }`}></div>
              <h1 className="text-lg font-bold text-red-400 font-mono">
                {appMode === 'delivery' ? 
                  (encounterType === 'boss' ? 'VIP DELIVERY' : 'DELIVERY CHALLENGE') :
                  (encounterType === 'boss' ? 'BOSS ENCOUNTER' : 'TACTICAL COMBAT')
                }
              </h1>
            </div>
            <div className="text-gray-400 text-sm">
              {encounterData?.title || 'Unknown Encounter'}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="text-cyan-400 font-mono flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Turn {currentTurn}
            </span>
            <span className="text-yellow-400">
              💰 {currentTips.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Combat Area */}
      <div className="flex-1 flex">
        {/* Combat Visualization Area */}
        <div className="flex-1 relative bg-gray-950 p-4">
          {/* Combat Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-gray-950 to-orange-950/30"></div>
          
          {/* Combat Grid */}
          <div className="relative h-full flex items-center justify-center">
            <CombatGrid
              gridWidth={8}
              gridHeight={6}
              units={combatUnits}
              activeUnitId={activeUnitId}
              selectedPosition={selectedPosition || undefined}
              highlightedPositions={selectedAction === 'move' ? [
                { x: activeUnit?.position.x || 0, y: (activeUnit?.position.y || 0) - 1 },
                { x: activeUnit?.position.x || 0, y: (activeUnit?.position.y || 0) + 1 },
                { x: (activeUnit?.position.x || 0) - 1, y: activeUnit?.position.y || 0 },
                { x: (activeUnit?.position.x || 0) + 1, y: activeUnit?.position.y || 0 },
              ].filter(p => p.x >= 0 && p.x < 8 && p.y >= 0 && p.y < 6) : []}
              onTileClick={handleTileClick}
              onUnitClick={handleUnitClick}
              showGrid={true}
              isAnimating={true}
            />
          </div>
        </div>

        {/* Action Panel */}
        <div className="w-96 bg-gray-900/90 backdrop-blur-sm border-l border-red-500/30 p-4 space-y-4 overflow-y-auto">
          {/* Turn Timeline */}
          <TurnTimeline
            units={[
              ...combatUnits.map(u => ({
                id: u.id,
                name: u.name,
                type: u.type,
                initiative: u.type === 'partner' ? 15 + Math.floor(Math.random() * 10) : 10 + Math.floor(Math.random() * 10),
                isActive: u.id === activeUnitId
              }))
            ]}
            currentTurn={currentTurn}
            onUnitClick={(unitId) => setActiveUnitId(unitId)}
          />

          {/* Active Unit Actions */}
          {activeUnit && (
            <ActionMenu
              actions={exampleActions}
              currentEnergy={activeUnit.energy}
              maxEnergy={activeUnit.maxEnergy}
              onActionSelect={handleActionSelect}
              onEndTurn={handleEndTurn}
              onCancel={() => {
                setSelectedAction(null);
                setIsWaitingForTarget(false);
              }}
              selectedActionId={selectedAction || undefined}
              isWaitingForTarget={isWaitingForTarget}
            />
          )}

          {/* Quick Actions */}
          <div className="space-y-2">
            {combatUnits.filter(u => u.type === 'enemy').length === 0 && (
              <NeuraButton
                variant="primary"
                className="w-full"
                onClick={handleVictory}
              >
                Victory!
              </NeuraButton>
            )}
            
            <NeuraButton
              variant="ghost"
              className="w-full"
              onClick={() => setState(GameState.ADVENTURE_MAP, contextData)}
            >
              Retreat
            </NeuraButton>
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="bg-gray-900/90 backdrop-blur-sm border-t border-red-500/30 p-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>ACTIVE: {activeUnit?.name || 'Unknown'}</span>
          <span>ENEMIES REMAINING: {combatUnits.filter(u => u.type === 'enemy').length}</span>
        </div>
      </div>
    </div>
  );
}