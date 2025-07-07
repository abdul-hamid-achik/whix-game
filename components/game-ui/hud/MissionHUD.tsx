'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Package, Battery, AlertTriangle, Users } from 'lucide-react';
import { useGameStore } from '@/lib/stores/gameStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useMissionStore } from '@/lib/stores/missionStore';
import { useUIStore, GameState } from '@/lib/stores/uiStore';

interface MissionHUDProps {
  missionType?: 'delivery' | 'combat' | 'social' | 'puzzle';
  objective?: string;
  timeLimit?: number;
  showSquadStatus?: boolean;
}

export function MissionHUD({ 
  missionType = 'delivery',
  objective = 'Complete the mission',
  timeLimit,
  showSquadStatus = true
}: MissionHUDProps) {
  const { currentTips, level } = useGameStore();
  const { partners } = usePartnerStore();
  const { activeMissions } = useMissionStore();
  const { currentState } = useUIStore();
  
  const activePartners = Object.values(partners).slice(0, 3);
  const _currentMission = activeMissions[0];
  
  // Only show HUD during actual mission states
  const shouldShowHUD = [
    GameState.TACTICAL_COMBAT,
    GameState.EVENT_RESOLUTION,
    GameState.ADVENTURE_MAP
  ].includes(currentState);

  if (!shouldShowHUD) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-4 right-4 z-50 pointer-events-none"
      >
        <div className="max-w-6xl mx-auto">
          {/* Main HUD Bar */}
          <div className="bg-gray-900/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3 pointer-events-auto">
            <div className="flex items-center justify-between">
              {/* Left Section - Mission Info */}
              <div className="flex items-center gap-6">
                {/* Mission Type Indicator */}
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    missionType === 'combat' ? 'bg-red-500' :
                    missionType === 'delivery' ? 'bg-blue-500' :
                    missionType === 'social' ? 'bg-purple-500' :
                    'bg-green-500'
                  }`} />
                  <span className="text-cyan-400 font-mono text-sm uppercase">
                    {missionType} OPERATION
                  </span>
                </div>
                
                {/* Objective */}
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{objective}</span>
                </div>
                
                {/* Timer (if applicable) */}
                {timeLimit && (
                  <div className="flex items-center gap-2 text-orange-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono">{Math.floor(timeLimit / 60)}:{(timeLimit % 60).toString().padStart(2, '0')}</span>
                  </div>
                )}
              </div>
              
              {/* Center Section - Quick Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-mono">{currentTips}</span>
                </div>
                <div className="text-gray-400">
                  Level {level}
                </div>
              </div>
              
              {/* Right Section - Squad Status */}
              {showSquadStatus && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  {activePartners.map((partner, index) => (
                    <motion.div
                      key={partner.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      {/* Partner Avatar */}
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {partner.name.charAt(0)}
                      </div>
                      
                      {/* Health Indicator */}
                      <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-300"
                          style={{ width: '100%' }}
                        />
                      </div>
                      
                      {/* Status Effects */}
                      {partner.currentEnergy < 30 && (
                        <div className="absolute -top-1 -right-1">
                          <Battery className="w-3 h-3 text-red-400" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Alert Banner (if needed) */}
          {missionType === 'combat' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 bg-red-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg p-2 pointer-events-auto"
            >
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">COMBAT ALERT:</span>
                <span>Corporate security forces detected</span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}