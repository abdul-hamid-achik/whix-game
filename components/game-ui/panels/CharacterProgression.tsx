'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Star, TrendingUp, Lock, CheckCircle, 
  ChevronRight, Award, Target, Sparkles, Eye, Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useGameStore } from '@/lib/stores/gameStore';
import { StoredPartner } from '@/lib/schemas/game-schemas';
import { NEURODIVERGENT_TRAITS, PARTNER_CLASSES } from '@/lib/game/classes';

interface CharacterProgressionProps {
  partner: StoredPartner;
  onClose?: () => void;
}

// Skill tree structure for each class
const SKILL_TREES = {
  courier: {
    name: 'Delivery Specialist',
    skills: [
      {
        id: 'speed-boost',
        name: 'Speed Boost',
        description: 'Increase movement speed by 20%',
        requiredLevel: 2,
        cost: 100,
        icon: <Zap className="w-4 h-4" />,
        prerequisites: [],
      },
      {
        id: 'route-mastery',
        name: 'Route Mastery',
        description: 'Unlock optimal pathing algorithms',
        requiredLevel: 5,
        cost: 250,
        icon: <Target className="w-4 h-4" />,
        prerequisites: ['speed-boost'],
      },
      {
        id: 'express-delivery',
        name: 'Express Delivery',
        description: 'Complete deliveries 50% faster',
        requiredLevel: 8,
        cost: 500,
        icon: <Star className="w-4 h-4" />,
        prerequisites: ['route-mastery'],
      },
    ],
  },
  analyst: {
    name: 'Data Specialist',
    skills: [
      {
        id: 'pattern-sight',
        name: 'Pattern Sight',
        description: 'Reveal hidden patterns in puzzles',
        requiredLevel: 2,
        cost: 100,
        icon: <Eye className="w-4 h-4" />,
        prerequisites: [],
      },
      {
        id: 'data-mining',
        name: 'Data Mining',
        description: 'Extract bonus information from missions',
        requiredLevel: 5,
        cost: 250,
        icon: <Target className="w-4 h-4" />,
        prerequisites: ['pattern-sight'],
      },
      {
        id: 'algorithmic-thinking',
        name: 'Algorithmic Thinking',
        description: 'Auto-solve simple puzzles',
        requiredLevel: 8,
        cost: 500,
        icon: <Sparkles className="w-4 h-4" />,
        prerequisites: ['data-mining'],
      },
    ],
  },
  negotiator: {
    name: 'Social Expert',
    skills: [
      {
        id: 'silver-tongue',
        name: 'Silver Tongue',
        description: 'Unlock persuasive dialogue options',
        requiredLevel: 2,
        cost: 100,
        icon: <Users className="w-4 h-4" />,
        prerequisites: [],
      },
      {
        id: 'reputation-boost',
        name: 'Reputation Boost',
        description: 'Earn 30% more tips from social missions',
        requiredLevel: 5,
        cost: 250,
        icon: <Award className="w-4 h-4" />,
        prerequisites: ['silver-tongue'],
      },
      {
        id: 'master-negotiator',
        name: 'Master Negotiator',
        description: 'Never fail social encounters',
        requiredLevel: 8,
        cost: 500,
        icon: <Star className="w-4 h-4" />,
        prerequisites: ['reputation-boost'],
      },
    ],
  },
  specialist: {
    name: 'Elite Service',
    skills: [
      {
        id: 'premium-access',
        name: 'Premium Access',
        description: 'Unlock high-paying special missions',
        requiredLevel: 2,
        cost: 100,
        icon: <Zap className="w-4 h-4" />,
        prerequisites: [],
      },
      {
        id: 'quality-guarantee',
        name: 'Quality Guarantee',
        description: 'Never fail quality control checks',
        requiredLevel: 5,
        cost: 250,
        icon: <CheckCircle className="w-4 h-4" />,
        prerequisites: ['premium-access'],
      },
      {
        id: 'vip-treatment',
        name: 'VIP Treatment',
        description: 'Double rewards from elite clients',
        requiredLevel: 8,
        cost: 500,
        icon: <Award className="w-4 h-4" />,
        prerequisites: ['quality-guarantee'],
      },
    ],
  },
  investigator: {
    name: 'Information Specialist',
    skills: [
      {
        id: 'keen-observation',
        name: 'Keen Observation',
        description: 'Reveal hidden clues and paths',
        requiredLevel: 2,
        cost: 100,
        icon: <Eye className="w-4 h-4" />,
        prerequisites: [],
      },
      {
        id: 'evidence-analysis',
        name: 'Evidence Analysis',
        description: 'Extract more information from clues',
        requiredLevel: 5,
        cost: 250,
        icon: <Target className="w-4 h-4" />,
        prerequisites: ['keen-observation'],
      },
      {
        id: 'case-closed',
        name: 'Case Closed',
        description: 'Instantly complete investigation missions',
        requiredLevel: 8,
        cost: 500,
        icon: <CheckCircle className="w-4 h-4" />,
        prerequisites: ['evidence-analysis'],
      },
    ],
  },
};

export function CharacterProgression({ partner }: CharacterProgressionProps) {
  const [selectedTab, setSelectedTab] = useState('skills');
  const { spendTips } = useGameStore();
  const { upgradeTraitMastery } = usePartnerStore();
  const [unlockedSkills, setUnlockedSkills] = useState<string[]>([]);

  const classData = PARTNER_CLASSES[partner.class];
  const skillTree = SKILL_TREES[partner.class];
  
  // Calculate level progress
  const nextLevelExp = (partner.level + 1) * 100;
  const progressPercent = (partner.experience / nextLevelExp) * 100;

  const handleUnlockSkill = (skillId: string, cost: number) => {
    if (spendTips(cost)) {
      setUnlockedSkills([...unlockedSkills, skillId]);
      // In a real implementation, this would update the partner's skills
    }
  };

  const canUnlockSkill = (skill: any) => {
    if (unlockedSkills.includes(skill.id)) return false;
    if (partner.level < skill.requiredLevel) return false;
    if (skill.prerequisites.some((p: string) => !unlockedSkills.includes(p))) return false;
    return true;
  };

  const renderSkillTree = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">{skillTree.name}</h3>
          <p className="text-gray-400 text-sm">
            Unlock powerful abilities as {partner.name} levels up
          </p>
        </div>

        <div className="relative">
          {/* Skill connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="skillLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {skillTree.skills.map((skill, index) => {
              if (index === 0) return null;
              return (
                <line
                  key={`line-${skill.id}`}
                  x1="50"
                  y1={100 + (index - 1) * 120}
                  x2="50"
                  y2={100 + index * 120 - 20}
                  stroke="url(#skillLineGradient)"
                  strokeWidth="2"
                  strokeDasharray={unlockedSkills.includes(skill.prerequisites[0]) ? "0" : "5,5"}
                />
              );
            })}
          </svg>

          {/* Skills */}
          <div className="space-y-8 relative">
            {skillTree.skills.map((skill, index) => {
              const isUnlocked = unlockedSkills.includes(skill.id);
              const canUnlock = canUnlockSkill(skill);
              const isLocked = !isUnlocked && !canUnlock;

              return (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div
                    className={cn(
                      "w-20 h-20 rounded-full flex items-center justify-center relative",
                      "transition-all duration-300",
                      isUnlocked && "bg-cyan-500/20 border-2 border-cyan-500",
                      canUnlock && "bg-gray-700/50 border-2 border-gray-600 hover:border-cyan-500/50",
                      isLocked && "bg-gray-800/50 border-2 border-gray-700"
                    )}
                  >
                    <div className={cn(
                      "p-3 rounded-full",
                      isUnlocked && "bg-cyan-500 text-gray-900",
                      canUnlock && "bg-gray-600 text-gray-300",
                      isLocked && "bg-gray-700 text-gray-500"
                    )}>
                      {skill.icon}
                    </div>
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={cn(
                        "font-semibold",
                        isUnlocked && "text-cyan-400",
                        canUnlock && "text-white",
                        isLocked && "text-gray-500"
                      )}>
                        {skill.name}
                      </h4>
                      {skill.requiredLevel > partner.level && (
                        <span className="text-xs text-red-400">
                          Requires Level {skill.requiredLevel}
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      "text-sm mb-2",
                      isLocked ? "text-gray-600" : "text-gray-400"
                    )}>
                      {skill.description}
                    </p>
                    {!isUnlocked && canUnlock && (
                      <Button
                        size="sm"
                        onClick={() => handleUnlockSkill(skill.id, skill.cost)}
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
                        Unlock ({skill.cost} Tips)
                      </Button>
                    )}
                    {isUnlocked && (
                      <Badge className="bg-green-900/30 text-green-400">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderTraitMastery = () => {
    const traits = [
      partner.primaryTrait,
      partner.secondaryTrait,
      partner.tertiaryTrait
    ].filter(Boolean);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Trait Mastery</h3>
          <p className="text-gray-400 text-sm">
            Enhance {partner.name}'s neurodivergent traits for powerful bonuses
          </p>
        </div>

        <div className="space-y-4">
          {traits.map((trait) => {
            if (!trait) return null;
            const traitData = NEURODIVERGENT_TRAITS[trait];
            const mastery = partner.traitMastery[trait];
            
            return (
              <Card key={trait} className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg mb-1">
                        {traitData.name}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {traitData.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Level</p>
                      <p className="text-2xl font-bold text-cyan-400">
                        {mastery.level}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-400">Mastery Progress</span>
                        <span className="text-gray-300">
                          {mastery.experience} / {mastery.level * 100} XP
                        </span>
                      </div>
                      <Progress 
                        value={(mastery.experience / (mastery.level * 100)) * 100} 
                        className="h-2"
                      />
                    </div>

                    {mastery.level < 3 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => upgradeTraitMastery(partner.id, trait)}
                        className="w-full"
                      >
                        Upgrade to Level {mastery.level + 1}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}

                    {traitData.combatAbility && (
                      <div className="mt-3 p-3 bg-purple-900/20 rounded">
                        <p className="text-sm font-semibold text-purple-400 mb-1">
                          Combat Ability
                        </p>
                        <p className="text-sm text-gray-300">
                          {traitData.combatAbility}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStats = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Character Stats</h3>
          <p className="text-gray-400 text-sm">
            {partner.name}'s current abilities and attributes
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(partner.stats).map(([stat, value]) => (
            <Card key={stat} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="capitalize text-gray-400">{stat}</span>
                  <span className="text-2xl font-bold text-cyan-400">
                    {value}
                  </span>
                </div>
                <Progress value={value} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle>Mission Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Missions Completed</span>
              <span className="font-semibold">{partner.missions || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Bond Level</span>
              <span className="font-semibold text-pink-400">
                {partner.bondLevel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Current Energy</span>
              <span className="font-semibold text-yellow-400">
                {partner.currentEnergy}/{partner.maxEnergy}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold">{partner.name}</h2>
            <p className="text-gray-400 mt-1">
              Level {partner.level} {classData.name} • {partner.rarity}
            </p>
          </div>
          <div className={cn(
            "p-3 rounded-lg",
            "bg-gradient-to-br from-gray-800 to-gray-700",
            classData.color && `border-2 border-[${classData.color}]`
          )}>
            <TrendingUp className="w-8 h-8 text-cyan-400" />
          </div>
        </div>

        {/* Level Progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Experience</span>
            <span className="text-gray-300">
              {partner.experience} / {nextLevelExp} XP
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="traits">Traits</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="mt-6">
          {renderSkillTree()}
        </TabsContent>

        <TabsContent value="traits" className="mt-6">
          {renderTraitMastery()}
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          {renderStats()}
        </TabsContent>
      </Tabs>
    </div>
  );
}