'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, Coins, TrendingUp, 
  CheckCircle, Package, Users, Gift,
  ChevronRight, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/lib/stores/gameStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useUIStore, GameState } from '@/lib/stores/uiStore';
import { performanceTracker } from '@/lib/systems/performance-tracking-system';

interface MissionRewardsProps {
  missionData: {
    type: 'story' | 'daily' | 'campaign' | 'side';
    difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
    name: string;
    objectives: Array<{
      description: string;
      completed: boolean;
    }>;
    performance: {
      timeSpent: number;
      damageDealt: number;
      damageTaken: number;
      itemsUsed: number;
      perfectClear: boolean;
    };
  };
  rewards: {
    baseTips: number;
    bonusTips: number;
    experience: number;
    starFragments?: number;
    items?: Array<{
      id: string;
      name: string;
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
      quantity: number;
    }>;
    partnerExperience: Record<string, number>;
    bondIncrease: Record<string, number>;
  };
  onContinue?: () => void;
}

const PERFORMANCE_RATINGS = {
  S: { threshold: 95, color: 'text-yellow-400', bonus: 2.0 },
  A: { threshold: 80, color: 'text-purple-400', bonus: 1.5 },
  B: { threshold: 65, color: 'text-blue-400', bonus: 1.2 },
  C: { threshold: 50, color: 'text-green-400', bonus: 1.0 },
  D: { threshold: 0, color: 'text-gray-400', bonus: 0.8 },
};

const RARITY_COLORS = {
  common: 'border-gray-400 text-gray-400',
  rare: 'border-blue-400 text-blue-400',
  epic: 'border-purple-400 text-purple-400',
  legendary: 'border-orange-400 text-orange-400'
};

export function MissionRewards({ missionData, rewards, onContinue }: MissionRewardsProps) {
  const { earnTips, gainExperience, earnStarFragment } = useGameStore();
  const { getPartnerById, addPartnerExperience, increaseBondLevel } = usePartnerStore();
  const { setState } = useUIStore();
  
  const [animationStep, setAnimationStep] = useState(0);
  const [collectedRewards, setCollectedRewards] = useState(false);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [rating, setRating] = useState<'S' | 'A' | 'B' | 'C' | 'D'>('C');
  
  // Calculate performance score
  useEffect(() => {
    let score = 50; // Base score
    
    // Time bonus (faster = better)
    const expectedTime = missionData.difficulty === 'easy' ? 300 : 
                        missionData.difficulty === 'normal' ? 600 : 
                        missionData.difficulty === 'hard' ? 900 : 1200;
    const timeRatio = expectedTime / (missionData.performance.timeSpent || expectedTime);
    score += Math.min(20, timeRatio * 10);
    
    // Damage efficiency
    const damageRatio = missionData.performance.damageDealt / 
                       (missionData.performance.damageTaken || 1);
    score += Math.min(15, damageRatio * 5);
    
    // Perfect clear bonus
    if (missionData.performance.perfectClear) score += 15;
    
    // Objective completion
    const completedObjectives = missionData.objectives.filter(o => o.completed).length;
    const objectiveRatio = completedObjectives / missionData.objectives.length;
    score += objectiveRatio * 10;
    
    setPerformanceScore(Math.min(100, Math.round(score)));
    
    // Determine rating
    for (const [ratingKey, ratingData] of Object.entries(PERFORMANCE_RATINGS)) {
      if (score >= ratingData.threshold) {
        setRating(ratingKey as 'S' | 'A' | 'B' | 'C' | 'D');
        break;
      }
    }
  }, [missionData]);
  
  // Animation sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      if (animationStep < 5) {
        setAnimationStep(animationStep + 1);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [animationStep]);
  
  const handleCollectRewards = () => {
    if (collectedRewards) return;
    
    // Apply rewards
    const totalTips = rewards.baseTips + rewards.bonusTips;
    earnTips(totalTips);
    gainExperience(rewards.experience);
    
    if (rewards.starFragments) {
      earnStarFragment(rewards.starFragments);
    }
    
    // Apply partner rewards
    Object.entries(rewards.partnerExperience).forEach(([partnerId, exp]) => {
      addPartnerExperience(partnerId, exp);
    });
    
    Object.entries(rewards.bondIncrease).forEach(([partnerId, _increase]) => {
      increaseBondLevel(partnerId);
    });
    
    // Record performance
    const { playerName } = useGameStore.getState();
    if (playerName) {
      performanceTracker.recordPerformance({
        playerId: playerName,
        timestamp: new Date(),
        missionId: `mission_${Date.now()}`, // In real app, use actual mission ID
        missionType: missionData.type === 'story' ? 'story' : 
                     missionData.type === 'daily' ? 'daily' : 
                     missionData.type === 'campaign' ? 'weekly' : 'daily',
        metrics: {
          completionTime: missionData.performance.timeSpent,
          damageDealt: missionData.performance.damageDealt,
          damageTaken: missionData.performance.damageTaken,
          healingDone: 0, // Add if tracked
          tipsEarned: totalTips,
          accuracy: 100 - (missionData.performance.itemsUsed * 5), // Mock accuracy
          comboCount: Math.floor(missionData.performance.damageDealt / 100), // Mock combo
          perfectClear: missionData.performance.perfectClear,
          partnersUsed: Object.keys(rewards.partnerExperience),
          difficultyModifier: missionData.difficulty === 'extreme' ? 2.0 :
                             missionData.difficulty === 'hard' ? 1.5 :
                             missionData.difficulty === 'normal' ? 1.0 : 0.8,
        },
      });
    }
    
    setCollectedRewards(true);
  };
  
  const renderPerformanceRating = () => {
    const ratingData = PERFORMANCE_RATINGS[rating];
    
    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="text-center mb-6"
      >
        <div className={cn(
          "text-8xl font-bold mb-2",
          ratingData.color
        )}>
          {rating}
        </div>
        <div className="text-gray-400">Performance Rating</div>
        <div className="mt-4">
          <Progress 
            value={performanceScore} 
            className="h-3 mb-2"
          />
          <p className="text-sm text-gray-400">
            Score: {performanceScore}/100
          </p>
        </div>
      </motion.div>
    );
  };
  
  const renderObjectives = () => {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Mission Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {missionData.objectives.map((objective, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                {objective.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                )}
                <span className={cn(
                  "text-sm",
                  objective.completed ? "text-gray-300" : "text-gray-500 line-through"
                )}>
                  {objective.description}
                </span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderRewardsList = () => {
    const totalTips = Math.floor((rewards.baseTips + rewards.bonusTips) * PERFORMANCE_RATINGS[rating].bonus);
    
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-400" />
            Rewards Earned
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={animationStep >= 1 ? { opacity: 1, scale: 1 } : {}}
            className="flex items-center justify-between p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30"
          >
            <div className="flex items-center gap-3">
              <Coins className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="font-semibold">Tips Earned</p>
                <p className="text-sm text-gray-400">
                  Base: {rewards.baseTips} + Bonus: {rewards.bonusTips}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-yellow-400">
                {totalTips}
              </p>
              {rating !== 'C' && (
                <p className="text-xs text-gray-400">
                  x{PERFORMANCE_RATINGS[rating].bonus} multiplier
                </p>
              )}
            </div>
          </motion.div>
          
          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={animationStep >= 2 ? { opacity: 1, scale: 1 } : {}}
            className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg border border-blue-500/30"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <p className="font-semibold">Experience Gained</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              +{rewards.experience} XP
            </p>
          </motion.div>
          
          {/* Star Fragments */}
          {rewards.starFragments && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={animationStep >= 3 ? { opacity: 1, scale: 1 } : {}}
              className="flex items-center justify-between p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30"
            >
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-cyan-400" />
                <p className="font-semibold">Star Fragments</p>
              </div>
              <p className="text-2xl font-bold text-cyan-400">
                +{rewards.starFragments}
              </p>
            </motion.div>
          )}
          
          {/* Items */}
          {rewards.items && rewards.items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={animationStep >= 4 ? { opacity: 1, scale: 1 } : {}}
              className="space-y-2"
            >
              <h4 className="font-semibold flex items-center gap-2">
                <Package className="w-5 h-5" />
                Items Received
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {rewards.items.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-2 rounded border bg-gray-700/50",
                      RARITY_COLORS[item.rarity]
                    )}
                  >
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-400">x{item.quantity}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  const renderPartnerProgress = () => {
    const partnersWithRewards = Object.keys(rewards.partnerExperience);
    if (partnersWithRewards.length === 0) return null;
    
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            Partner Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {partnersWithRewards.map((partnerId, index) => {
              const partner = getPartnerById(partnerId);
              if (!partner) return null;
              
              const expGained = rewards.partnerExperience[partnerId];
              const bondGained = rewards.bondIncrease[partnerId] || 0;
              
              return (
                <motion.div
                  key={partnerId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={animationStep >= 5 ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {partner.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{partner.name}</p>
                        <p className="text-xs text-gray-400">Level {partner.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-400">+{expGained} XP</p>
                      {bondGained > 0 && (
                        <p className="text-xs text-pink-400">Bond +1</p>
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={(partner.experience / (partner.level * 100)) * 100} 
                    className="h-2"
                  />
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Mission Complete!</h1>
        <p className="text-gray-400">
          {missionData.name}
        </p>
        <Badge 
          variant="outline" 
          className="mt-2 capitalize"
        >
          {missionData.difficulty} difficulty
        </Badge>
      </motion.div>

      {/* Performance Rating */}
      {renderPerformanceRating()}

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          {renderObjectives()}
          {renderPartnerProgress()}
        </div>
        
        <div>
          {renderRewardsList()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          size="lg"
          variant={collectedRewards ? "outline" : "default"}
          onClick={handleCollectRewards}
          disabled={collectedRewards}
          className="min-w-[200px]"
        >
          {collectedRewards ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Rewards Collected
            </>
          ) : (
            <>
              <Gift className="w-5 h-5 mr-2" />
              Collect Rewards
            </>
          )}
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          onClick={() => {
            onContinue?.();
            setState(GameState.COURIER_HUB);
          }}
          className="min-w-[200px]"
        >
          Return to Hub
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}