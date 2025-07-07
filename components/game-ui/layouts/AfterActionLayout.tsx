'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useUIStore, GameState } from '@/lib/stores/uiStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useGameStore } from '@/lib/stores/gameStore';
import { NeuraPanel, NeuraButton } from '@/components/neura';
import { Trophy, Star, DollarSign, Users, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

interface AfterActionLayoutProps {
  children: ReactNode;
}

export function AfterActionLayout({ children: _children }: AfterActionLayoutProps) {
  const { setState, contextData } = useUIStore();
  const { partners } = usePartnerStore();
  const { currentTips, level, gainExperience } = useGameStore();

  const activePartners = Object.values(partners).slice(0, 3); // Take first 3 partners
  const missionResult = contextData?.combatResult || contextData?.eventResult || 'success';
  const rewards = contextData?.rewards;
  const _encounterData = contextData?.nodeData;

  const handleContinue = () => {
    // Award experience and process rewards
    if (missionResult === 'success' || missionResult === 'victory') {
      if (rewards?.experience) {
        gainExperience(rewards.experience);
      }
    }
    
    // Return to adventure map
    setState(GameState.ADVENTURE_MAP, {
      mapData: contextData?.mapData
    });
  };

  const isSuccess = missionResult === 'success' || missionResult === 'victory';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-purple-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isSuccess ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400" />
              )}
              <h1 className={`text-xl font-bold font-mono ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                AFTER ACTION REPORT
              </h1>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-yellow-400 font-mono">
              💰 {currentTips.toLocaleString()} TIPS
            </p>
            <p className="text-blue-400 text-sm">
              Level {level}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Mission Result */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <NeuraPanel variant="primary">
              <div className="p-6 text-center">
                <div className={`text-4xl mb-4`}>
                  {isSuccess ? '🎉' : '💥'}
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                  {isSuccess ? 'MISSION SUCCESS' : 'MISSION FAILED'}
                </h2>
                <p className="text-gray-300">
                  {isSuccess 
                    ? 'Your team successfully completed the objective. Great work!'
                    : 'The mission didn\'t go as planned, but valuable experience was gained.'
                  }
                </p>
              </div>
            </NeuraPanel>
          </motion.div>

          {/* Rewards Section */}
          {isSuccess && rewards && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <NeuraPanel variant="secondary">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    REWARDS EARNED
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rewards.tips && (
                      <div className="bg-yellow-900/30 p-4 rounded border border-yellow-500/30">
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-6 h-6 text-yellow-400" />
                          <div>
                            <p className="text-yellow-400 font-medium">Tips Earned</p>
                            <p className="text-white text-lg font-bold">+{rewards.tips}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {rewards.experience && (
                      <div className="bg-blue-900/30 p-4 rounded border border-blue-500/30">
                        <div className="flex items-center gap-3">
                          <Star className="w-6 h-6 text-blue-400" />
                          <div>
                            <p className="text-blue-400 font-medium">Experience</p>
                            <p className="text-white text-lg font-bold">+{rewards.experience} XP</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </NeuraPanel>
            </motion.div>
          )}

          {/* Squad Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <NeuraPanel variant="secondary">
              <div className="p-6">
                <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  SQUAD PERFORMANCE
                </h3>
                
                <div className="space-y-3">
                  {activePartners.map((partner, _index) => (
                    <div key={partner.id} className="bg-gray-800/50 p-3 rounded border border-purple-500/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {partner.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{partner.name}</p>
                          <p className="text-gray-400 text-sm">Level {partner.level} {partner.class}</p>
                        </div>
                        <div className="text-right">
                          <p className={isSuccess ? 'text-green-400' : 'text-orange-400'}>
                            {isSuccess ? 'Excellent' : 'Good'}
                          </p>
                          {isSuccess && (
                            <p className="text-blue-400 text-xs">+10 Bond XP</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </NeuraPanel>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <NeuraButton
            variant="ghost"
            onClick={() => setState(GameState.COURIER_HUB)}
          >
            Return to Hub
          </NeuraButton>
          
          <NeuraButton
            variant="primary"
            size="lg"
            onClick={handleContinue}
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Continue Mission
          </NeuraButton>
        </div>
      </div>

      {/* Footer Status */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-t border-purple-500/30 p-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>REPORT STATUS: COMPLETE</span>
          <span>NEXT: CONTINUE OPERATIONS</span>
        </div>
      </div>
    </div>
  );
}