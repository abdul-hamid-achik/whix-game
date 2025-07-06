import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CombatUnit, CombatPosition } from '@/lib/game/combat';
import { TraitIcon } from './TraitIcon';
import { Heart, Shield, Zap } from 'lucide-react';

interface CombatGridProps {
  units: CombatUnit[];
  selectedUnit?: CombatUnit | null;
  validMoves?: CombatPosition[];
  validTargets?: CombatUnit[];
  onCellClick: (position: CombatPosition) => void;
  onUnitClick: (unit: CombatUnit) => void;
}

export function CombatGrid({
  units,
  selectedUnit,
  validMoves = [],
  validTargets = [],
  onCellClick,
  onUnitClick,
}: CombatGridProps) {
  const grid = Array(5).fill(null).map(() => Array(5).fill(null));
  
  // Place units on grid
  units.forEach(unit => {
    if (unit.position.x >= 0 && unit.position.x < 5 && unit.position.y >= 0 && unit.position.y < 5) {
      grid[unit.position.y][unit.position.x] = unit;
    }
  });
  
  const isValidMove = (x: number, y: number) => {
    return validMoves.some(pos => pos.x === x && pos.y === y);
  };
  
  const isValidTarget = (unit: CombatUnit) => {
    return validTargets.some(target => target.id === unit.id);
  };
  
  return (
    <div className="inline-block bg-gray-900 p-4 rounded-lg shadow-2xl">
      <div className="grid grid-cols-5 gap-1">
        {grid.map((row, y) => 
          row.map((unit, x) => (
            <motion.div
              key={`${x}-${y}`}
              className={cn(
                "w-20 h-20 border-2 rounded-lg relative cursor-pointer transition-all",
                "bg-gray-800 hover:bg-gray-700",
                selectedUnit && unit?.id === selectedUnit.id && "ring-2 ring-yellow-400",
                isValidMove(x, y) && "bg-green-900/50 border-green-400",
                unit && isValidTarget(unit) && "bg-red-900/50 border-red-400"
              )}
              onClick={() => unit ? onUnitClick(unit) : onCellClick({ x, y })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {unit && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 p-1 flex flex-col items-center justify-center"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold",
                    unit.type === 'partner' ? "bg-blue-600" : "bg-red-600"
                  )}>
                    {unit.name.charAt(0)}
                  </div>
                  
                  {/* Health bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b">
                    <div 
                      className={cn(
                        "h-full rounded-b transition-all",
                        unit.type === 'partner' ? "bg-green-500" : "bg-red-500"
                      )}
                      style={{ width: `${(unit.stats.currentHealth / unit.stats.maxHealth) * 100}%` }}
                    />
                  </div>
                  
                  {/* Unit indicators */}
                  {unit.hasActed && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-gray-500 rounded-full" />
                  )}
                  
                  {!unit.isActive && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg" />
                  )}
                </motion.div>
              )}
              
              {/* Grid coordinates (for debugging) */}
              <div className="absolute bottom-0 right-0 text-xs text-gray-500 p-1">
                {x},{y}
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      {/* Turn order display */}
      <div className="mt-4 flex gap-2 justify-center">
        <div className="text-sm text-gray-400">Turn Order:</div>
        <div className="flex gap-1">
          {units
            .filter(u => u.isActive)
            .sort((a, b) => b.stats.speed - a.stats.speed)
            .slice(0, 5)
            .map((unit, index) => (
              <div
                key={unit.id}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                  unit.type === 'partner' ? "bg-blue-600" : "bg-red-600",
                  index === 0 && "ring-2 ring-yellow-400"
                )}
              >
                {unit.name.charAt(0)}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}