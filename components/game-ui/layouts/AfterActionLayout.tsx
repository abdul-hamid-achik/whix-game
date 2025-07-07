'use client';

import { ReactNode } from 'react';
import { useUIStore, GameState } from '@/lib/stores/uiStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useGameStore } from '@/lib/stores/gameStore';
import { MissionRewards } from '../panels/MissionRewards';

interface AfterActionLayoutProps {
  children: ReactNode;
}

export function AfterActionLayout({ children: _children }: AfterActionLayoutProps) {
  const { setState, contextData } = useUIStore();
  const { partners } = usePartnerStore();
  const { currentTips, level } = useGameStore();

  const activePartners = Object.values(partners).slice(0, 3);
  const missionResult = contextData?.combatResult || contextData?.eventResult || 'success';
  const isSuccess = missionResult === 'success' || missionResult === 'victory';

  // Format mission data for MissionRewards component
  const missionData = {
    type: (contextData?.missionType || 'side') as 'story' | 'daily' | 'campaign' | 'side',
    difficulty: (contextData?.difficulty || 'normal') as 'easy' | 'normal' | 'hard' | 'extreme',
    name: contextData?.missionName || contextData?.nodeData?.title || 'Mission Complete',
    objectives: contextData?.objectives || [
      {
        description: 'Complete the mission',
        completed: isSuccess
      }
    ],
    performance: {
      timeSpent: contextData?.timeSpent || 300,
      damageDealt: contextData?.damageDealt || 1000,
      damageTaken: contextData?.damageTaken || 200,
      itemsUsed: contextData?.itemsUsed || 0,
      perfectClear: contextData?.perfectClear || false
    }
  };

  // Format rewards data
  const rewardsData = {
    baseTips: contextData?.rewards?.tips || 100,
    bonusTips: contextData?.rewards?.bonusTips || 0,
    experience: contextData?.rewards?.experience || 50,
    starFragments: contextData?.rewards?.starFragments,
    items: contextData?.rewards?.items,
    partnerExperience: contextData?.rewards?.partnerExperience || 
      activePartners.reduce((acc, partner) => {
        acc[partner.id] = 25;
        return acc;
      }, {} as Record<string, number>),
    bondIncrease: contextData?.rewards?.bondIncrease || 
      activePartners.reduce((acc, partner) => {
        acc[partner.id] = isSuccess ? 1 : 0;
        return acc;
      }, {} as Record<string, number>)
  };

  const handleContinue = () => {
    // Return to adventure map or hub
    if (contextData?.mapData) {
      setState(GameState.ADVENTURE_MAP, {
        mapData: contextData.mapData
      });
    } else {
      setState(GameState.COURIER_HUB);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-purple-500/30 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold font-mono text-purple-400">
            AFTER ACTION REPORT
          </h1>
          
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
      <div className="flex-1 overflow-y-auto">
        <MissionRewards
          missionData={missionData}
          rewards={rewardsData}
          onContinue={handleContinue}
        />
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