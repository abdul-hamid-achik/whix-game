'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useGameStore } from '@/lib/stores/gameStore';
import { useStoryStore } from '@/lib/stores/storyStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { NeuraPanel, NeuraButton, NeuraProgressBar } from '@/components/neura';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Play, 
  Settings, 
  Calendar, 
  Trophy,
  Zap,
  ChevronRight,
  Lock,
  Sword
} from 'lucide-react';

interface HubLayoutProps {
  children: ReactNode;
}

export function HubLayout({ children: _children }: HubLayoutProps) {
  const { partners, unlockedCharacters, getNextUnlocks, checkForUnlocks } = usePartnerStore();
  const { currentTips: tips, level, experience, totalTipsEarned, missionsCompleted } = useGameStore();
  const { completedChapters, storyFlags } = useStoryStore();
  const { showPanel } = useUIStore();
  
  // Check for new character unlocks
  const gameState = {
    level,
    completedChapters,
    totalTipsEarned,
    missionsCompleted,
    storyFlags,
  };
  
  // Check for unlocks on component mount
  React.useEffect(() => {
    checkForUnlocks(gameState);
  }, [level, completedChapters, totalTipsEarned, missionsCompleted]);
  
  const nextUnlocks = getNextUnlocks(gameState);
  const nearestUnlock = nextUnlocks[0]; // Get the closest unlock

  const activePartners = Object.values(partners).slice(0, 3); // Get first 3 partners as active
  const maxPartners = 8;
  const currentChapter = completedChapters.length + 1;
  const totalChapters = 7; // Based on content/chapters
  const unlockedPartners = unlockedCharacters.length;
  const totalPartners = 17; // Based on content/characters

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-cyan-500/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 font-mono">
              WHIX COURIER HUB
            </h1>
            <p className="text-gray-400 text-sm">
              Active Partners: {activePartners.length}/{maxPartners} | 
              Current Operation: Chapter {currentChapter}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-yellow-400 font-mono text-lg">
                💰 {tips.toLocaleString()} TIPS
              </p>
              <p className="text-blue-400 text-sm">
                Level {level} | {experience} XP
              </p>
            </div>
            
            <NeuraButton
              variant="ghost"
              size="sm"
              onClick={() => showPanel('settings', { position: 'overlay', size: 'medium' })}
            >
              <Settings className="w-4 h-4" />
            </NeuraButton>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          
          {/* Active Roster */}
          <NeuraPanel className="xl:col-span-2" variant="primary">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="text-cyan-400 font-mono font-bold uppercase tracking-wide">
                  ACTIVE ROSTER
                </h3>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Your current team of delivery partners
              </p>
              <div className="grid grid-cols-3 gap-3">
                {activePartners.slice(0, 3).map((partner, index) => (
                  <motion.div
                    key={partner.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center p-3 bg-gray-800/50 rounded-lg border border-cyan-500/20 hover:border-cyan-500/50 transition-colors cursor-pointer"
                    onClick={() => showPanel('partnerDetails', { position: 'overlay', size: 'large' })}
                  >
                    <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {partner.name.charAt(0)}
                    </div>
                    <p className="text-sm font-medium text-gray-200">{partner.name}</p>
                    <p className="text-xs text-gray-400">Lv.{partner.level}</p>
                    <div className="mt-2">
                      <NeuraProgressBar 
                        value={partner.experience} 
                        max={partner.level * 100}
                        variant="primary"
                        animated={false}
                        showValue={false}
                        segments={5}
                        className="h-1"
                      />
                    </div>
                  </motion.div>
                ))}
                
                {/* Empty slots */}
                {Array.from({ length: Math.max(0, 3 - activePartners.length) }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="text-center p-3 bg-gray-800/30 rounded-lg border border-gray-600/30 border-dashed"
                  >
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-700/50 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-xs text-gray-500">Empty Slot</p>
                  </div>
                ))}
              </div>
            </div>
          </NeuraPanel>

          {/* Campaigns */}
          <NeuraPanel variant="secondary">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Play className="w-5 h-5 text-purple-400" />
                <h3 className="text-purple-400 font-mono font-bold uppercase tracking-wide">
                  CAMPAIGNS
                </h3>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Choose your mission type
              </p>
              <div className="space-y-3">
                <NeuraButton 
                  className="w-full justify-start"
                  variant="secondary"
                  onClick={() => showPanel('campaignSelection', {
                    position: 'overlay',
                    size: 'large',
                  })}
                >
                  <Sword className="w-4 h-4 mr-2" />
                  Campaign Mode
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </NeuraButton>
                
                <NeuraButton 
                  className="w-full justify-start"
                  variant="ghost"
                  onClick={() => showPanel('dailyContracts', { 
                    position: 'overlay', 
                    size: 'fullscreen' 
                  })}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Daily Contracts
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </NeuraButton>
                
                <NeuraButton 
                  className="w-full justify-start"
                  variant="danger"
                  disabled
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Arena Mode
                  <Lock className="w-4 h-4 ml-auto" />
                </NeuraButton>
              </div>
            </div>
          </NeuraPanel>

          {/* Unlock Partners */}
          <NeuraPanel variant="success">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-green-400" />
                <h3 className="text-green-400 font-mono font-bold uppercase tracking-wide">
                  UNLOCK PARTNERS
                </h3>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Expand your team
              </p>
              {nearestUnlock ? (
                <div className="space-y-4">
                  <div className="text-center p-3 bg-gray-800/50 rounded border border-green-500/20">
                    <Lock className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-200">{nearestUnlock.characterId}</p>
                    <p className="text-xs text-gray-400">{nearestUnlock.unlockMessage}</p>
                  </div>
                  
                  <div className="space-y-2">
                    {nearestUnlock.type === 'tips' && (
                      <NeuraProgressBar
                        value={totalTipsEarned}
                        max={nearestUnlock.requirement.type === 'tips' ? nearestUnlock.requirement.totalEarned : 0}
                        variant="success"
                        label="TIPS REQUIRED"
                        segments={8}
                      />
                    )}
                    {nearestUnlock.type === 'level' && (
                      <NeuraProgressBar
                        value={level}
                        max={nearestUnlock.requirement.type === 'level' ? nearestUnlock.requirement.minLevel : 0}
                        variant="success"
                        label="LEVEL REQUIRED"
                        segments={8}
                      />
                    )}
                    {nearestUnlock.type === 'story' && (
                      <NeuraProgressBar
                        value={completedChapters.length}
                        max={1}
                        variant="success"
                        label="CHAPTERS COMPLETED"
                        segments={8}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 text-gray-400">
                  <Zap className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">All characters unlocked!</p>
                </div>
              )}
            </div>
          </NeuraPanel>

          {/* Progression */}
          <NeuraPanel variant="success">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-green-400" />
                <h3 className="text-green-400 font-mono font-bold uppercase tracking-wide">
                  PROGRESSION
                </h3>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Your journey progress
              </p>
              <div className="space-y-4">
                <NeuraProgressBar
                  value={completedChapters.length}
                  max={totalChapters}
                  variant="success"
                  label="CHAPTER PROGRESS"
                  segments={7}
                />
                
                <NeuraProgressBar
                  value={unlockedPartners}
                  max={totalPartners}
                  variant="success"
                  label="PARTNERS UNLOCKED"
                  segments={8}
                />
                
                <div className="pt-2">
                  <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-500/30">
                    Chapter {currentChapter} Available
                  </Badge>
                </div>
              </div>
            </div>
          </NeuraPanel>

          {/* Action Buttons */}
          <div className="xl:col-span-4 flex gap-4 justify-center">
            <NeuraButton 
              size="lg"
              variant="primary"
              className="px-8"
            >
              <Play className="w-5 h-5 mr-2" />
              START MISSION
            </NeuraButton>
            
            <NeuraButton 
              size="lg"
              variant="ghost"
              className="px-8"
              onClick={() => showPanel('neuralSettings', { position: 'overlay', size: 'large' })}
            >
              <Settings className="w-5 h-5 mr-2" />
              NEURAL SETTINGS
            </NeuraButton>
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-t border-cyan-500/30 p-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span>SYSTEM STATUS: ONLINE</span>
            <span>NEURAL LINK: STABLE</span>
            <span>CONNECTION: ENCRYPTED</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>WHIX COURIER NETWORK</span>
          </div>
        </div>
      </div>
    </div>
  );
}