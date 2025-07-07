'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { NeuraPanel } from '@/components/neura';
import { Clock, ChevronRight, Zap, Shield, Swords } from 'lucide-react';

interface TurnUnit {
  id: string;
  name: string;
  type: 'partner' | 'enemy';
  initiative: number;
  isActive?: boolean;
  isDelayed?: boolean;
  avatar?: string;
}

interface TurnTimelineProps {
  units: TurnUnit[];
  currentTurn: number;
  onUnitClick?: (unitId: string) => void;
}

export function TurnTimeline({ units, currentTurn, onUnitClick }: TurnTimelineProps) {
  // Sort units by initiative (higher goes first)
  const sortedUnits = [...units].sort((a, b) => b.initiative - a.initiative);
  
  // Find active unit index
  const activeIndex = sortedUnits.findIndex(u => u.isActive);

  return (
    <NeuraPanel variant="secondary" className="w-full">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-purple-400">TURN ORDER</h3>
          <span className="text-xs text-gray-500 ml-auto">Turn {currentTurn}</span>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-purple-500/30" />

          {/* Units */}
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {sortedUnits.map((unit, index) => {
                const isActive = unit.isActive;
                const isPast = activeIndex !== -1 && index < activeIndex;

                return (
                  <motion.div
                    key={unit.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: isPast ? 0.5 : 1, 
                      x: 0,
                      scale: isActive ? 1.05 : 1
                    }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="relative"
                  >
                    <button
                      onClick={() => onUnitClick?.(unit.id)}
                      className={`
                        w-full flex items-center gap-3 p-2 rounded-lg transition-all
                        ${isActive 
                          ? 'bg-purple-500/20 border border-purple-500' 
                          : 'hover:bg-gray-800/50'
                        }
                        ${unit.isDelayed ? 'opacity-50' : ''}
                      `}
                    >
                      {/* Timeline Dot */}
                      <div className="relative z-10">
                        <div className={`
                          w-4 h-4 rounded-full border-2
                          ${isActive 
                            ? 'bg-purple-500 border-purple-400 shadow-lg shadow-purple-500/50' 
                            : isPast
                              ? 'bg-gray-700 border-gray-600'
                              : 'bg-gray-800 border-purple-500/50'
                          }
                        `}>
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-purple-400"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ 
                                duration: 2, 
                                repeat: Infinity,
                                ease: 'easeInOut'
                              }}
                              style={{ opacity: 0.5 }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Unit Avatar */}
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${unit.type === 'partner' 
                          ? 'bg-blue-900/80 border border-blue-500' 
                          : 'bg-red-900/80 border border-red-500'
                        }
                      `}>
                        {unit.type === 'partner' ? (
                          <Shield className="w-5 h-5 text-blue-300" />
                        ) : (
                          <Swords className="w-5 h-5 text-red-300" />
                        )}
                      </div>

                      {/* Unit Info */}
                      <div className="flex-1 text-left">
                        <p className={`
                          text-sm font-medium
                          ${isActive ? 'text-purple-400' : 'text-white'}
                        `}>
                          {unit.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Initiative: {unit.initiative}
                        </p>
                      </div>

                      {/* Status Indicators */}
                      <div className="flex items-center gap-1">
                        {unit.isDelayed && (
                          <div className="text-xs text-orange-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Delayed
                          </div>
                        )}
                        {isActive && (
                          <ChevronRight className="w-4 h-4 text-purple-400" />
                        )}
                      </div>
                    </button>

                    {/* Next Turn Indicator */}
                    {index === activeIndex && index < sortedUnits.length - 1 && (
                      <div className="absolute left-8 -bottom-1 text-xs text-gray-500 flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" />
                        Next
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Initiative Tip */}
        <div className="mt-4 p-2 bg-gray-800/50 rounded text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3" />
            <span>Higher initiative acts first</span>
          </div>
        </div>
      </div>
    </NeuraPanel>
  );
}