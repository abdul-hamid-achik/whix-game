'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useGameStore } from '@/lib/stores/gameStore';
import { useUIStore, GameState } from '@/lib/stores/uiStore';
import { NeuraPanel, NeuraButton } from '@/components/neura';
import { ArrowLeft, Play, Users, Target, Clock, AlertTriangle } from 'lucide-react';

interface MissionBriefingLayoutProps {
  children: ReactNode;
}

const MissionBriefingDataSchema = z.object({
  chapterTitle: z.string().optional(),
  missionType: z.string().optional(),
  difficulty: z.string().optional(),
});

export function MissionBriefingLayout({ children: _children }: MissionBriefingLayoutProps) {
  const { partners } = usePartnerStore();
  const { currentTips, level } = useGameStore();
  const { setState, contextData } = useUIStore();

  const activePartners = Object.values(partners).slice(0, 3);
  const missionData = MissionBriefingDataSchema.parse(contextData || {});

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-purple-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <NeuraButton
              variant="ghost"
              size="sm"
              onClick={() => setState(GameState.COURIER_HUB)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Hub
            </NeuraButton>
            <div>
              <h1 className="text-xl font-bold text-purple-400 font-mono">
                MISSION BRIEFING
              </h1>
              <p className="text-gray-400 text-sm">
                {missionData?.chapterTitle || 'Chapter 2: Cathedral Conspiracy'}
              </p>
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
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          {/* Mission Details */}
          <div className="lg:col-span-2">
            <NeuraPanel variant="primary">
              <div className="p-6">
                <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  MISSION PARAMETERS
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">OBJECTIVE</p>
                      <p className="text-white font-medium">{missionData?.missionType || 'Story Mission'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">DIFFICULTY</p>
                      <p className="text-orange-400 font-medium">{missionData?.difficulty || 'Normal'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-2">MISSION BRIEFING</p>
                    <div className="bg-gray-800/50 p-4 rounded border border-cyan-500/20">
                      <p className="text-gray-200 leading-relaxed">
                        Intelligence reports indicate unusual WHIX activity in the Cathedral District. 
                        Your mission is to investigate the corporate facility and gather evidence of 
                        their latest neural manipulation experiments. Exercise extreme caution - 
                        security protocols have been upgraded.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">High-risk operation. Injury probability: 35%</span>
                  </div>
                </div>
              </div>
            </NeuraPanel>
          </div>

          {/* Squad Composition */}
          <div>
            <NeuraPanel variant="secondary">
              <div className="p-6">
                <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  ACTIVE SQUAD
                </h3>
                
                <div className="space-y-3">
                  {activePartners.map((partner, index) => (
                    <motion.div
                      key={partner.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-800/50 p-3 rounded border border-purple-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {partner.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{partner.name}</p>
                          <p className="text-gray-400 text-sm">Level {partner.level} {partner.class}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 text-sm">Ready</p>
                          <p className="text-gray-400 text-xs">100% Energy</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-900/30 rounded border border-blue-500/30">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Estimated Duration</span>
                  </div>
                  <p className="text-white">45-60 minutes</p>
                </div>
              </div>
            </NeuraPanel>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <NeuraButton
            variant="ghost"
            onClick={() => setState(GameState.PARTNER_SELECTION)}
          >
            Change Squad
          </NeuraButton>
          
          <NeuraButton
            variant="primary"
            size="lg"
            onClick={() => setState(GameState.ADVENTURE_MAP, {
              missionType: missionData?.missionType,
              difficulty: missionData?.difficulty,
              chapterTitle: missionData?.chapterTitle
            })}
          >
            <Play className="w-5 h-5 mr-2" />
            Begin Mission
          </NeuraButton>
        </div>
      </div>

      {/* Footer Status */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-t border-purple-500/30 p-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>MISSION STATUS: BRIEFING COMPLETE</span>
          <span>NEURAL LINK: SYNCHRONIZED</span>
        </div>
      </div>
    </div>
  );
}