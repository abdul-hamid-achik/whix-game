'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Shield, Zap, Sword, Target, SkipForward, Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { NeuraButton } from '@/components/neura';

interface CombatHUDProps {
  currentTurn: number;
  activeUnit?: {
    id: string;
    name: string;
    health: number;
    maxHealth: number;
    energy: number;
    maxEnergy: number;
    armor: number;
  };
  enemyCount: number;
  onEndTurn?: () => void;
  onPause?: () => void;
  isPaused?: boolean;
}

export function CombatHUD({
  currentTurn = 1,
  activeUnit,
  enemyCount = 0,
  onEndTurn,
  onPause,
  isPaused = false
}: CombatHUDProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  
  const actions = [
    { id: 'move', name: 'Move', icon: Target, cost: 1 },
    { id: 'attack', name: 'Attack', icon: Sword, cost: 2 },
    { id: 'defend', name: 'Defend', icon: Shield, cost: 1 },
    { id: 'special', name: 'Special', icon: Zap, cost: 3 }
  ];

  const healthPercentage = activeUnit ? (activeUnit.health / activeUnit.maxHealth) * 100 : 100;
  const energyPercentage = activeUnit ? (activeUnit.energy / activeUnit.maxEnergy) * 100 : 100;

  return (
    <AnimatePresence>
      {/* Top Combat Info Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="bg-gray-900/90 backdrop-blur-sm border border-red-500/30 rounded-lg px-6 py-3">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-red-400 text-xs font-medium">TURN</p>
              <p className="text-white text-2xl font-bold font-mono">{currentTurn}</p>
            </div>
            <div className="w-px h-10 bg-red-500/30" />
            <div className="text-center">
              <p className="text-red-400 text-xs font-medium">ENEMIES</p>
              <p className="text-white text-2xl font-bold font-mono">{enemyCount}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Action Bar */}
      {activeUnit && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-gray-900/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4">
            {/* Unit Status */}
            <div className="mb-4">
              <h3 className="text-cyan-400 font-medium text-center mb-2">{activeUnit.name}</h3>
              
              {/* Health Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    Health
                  </span>
                  <span className="text-white font-mono">
                    {activeUnit.health}/{activeUnit.maxHealth}
                  </span>
                </div>
                <div className="w-64 h-3 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${healthPercentage}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              
              {/* Energy Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Energy
                  </span>
                  <span className="text-white font-mono">
                    {activeUnit.energy}/{activeUnit.maxEnergy}
                  </span>
                </div>
                <div className="w-64 h-3 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${energyPercentage}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              
              {/* Armor */}
              {activeUnit.armor > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{activeUnit.armor} Armor</span>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {actions.map(action => {
                const canAfford = activeUnit.energy >= action.cost;
                const isSelected = selectedAction === action.id;
                
                return (
                  <NeuraButton
                    key={action.id}
                    variant={isSelected ? 'primary' : 'ghost'}
                    size="sm"
                    disabled={!canAfford}
                    onClick={() => setSelectedAction(action.id)}
                    className="flex flex-col items-center gap-1 py-3"
                  >
                    <action.icon className="w-5 h-5" />
                    <span className="text-xs">{action.name}</span>
                    <span className="text-xs text-gray-400">{action.cost}⚡</span>
                  </NeuraButton>
                );
              })}
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <NeuraButton
                variant="ghost"
                size="sm"
                onClick={onPause}
                className="flex items-center gap-2"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? 'Resume' : 'Pause'}
              </NeuraButton>
              
              <NeuraButton
                variant="primary"
                size="sm"
                onClick={onEndTurn}
                className="flex items-center gap-2"
              >
                <SkipForward className="w-4 h-4" />
                End Turn
              </NeuraButton>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}