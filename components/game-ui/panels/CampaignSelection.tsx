'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sword, Trophy, Calendar, Users, Lock, Star, 
  ChevronRight, Clock, Zap, AlertTriangle,
  Infinity, GraduationCap, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/lib/stores/gameStore';
import { 
  Campaign, 
  CampaignType, 
  campaignManager 
} from '@/lib/systems/campaign-system';

interface CampaignSelectionProps {
  onSelectCampaign: (campaign: Campaign) => void;
  onClose?: () => void;
}

const CAMPAIGN_TYPE_ICONS: Record<CampaignType, React.ReactNode> = {
  story: <Sword className="w-5 h-5" />,
  endless: <Infinity className="w-5 h-5" />,
  challenge: <Trophy className="w-5 h-5" />,
  seasonal: <Calendar className="w-5 h-5" />,
  training: <GraduationCap className="w-5 h-5" />,
  community: <Users className="w-5 h-5" />,
};

const CAMPAIGN_TYPE_COLORS: Record<CampaignType, string> = {
  story: 'text-purple-400 border-purple-400/50',
  endless: 'text-red-400 border-red-400/50',
  challenge: 'text-yellow-400 border-yellow-400/50',
  seasonal: 'text-green-400 border-green-400/50',
  training: 'text-blue-400 border-blue-400/50',
  community: 'text-pink-400 border-pink-400/50',
};

export function CampaignSelection({ onSelectCampaign }: CampaignSelectionProps) {
  const [selectedType, setSelectedType] = useState<CampaignType>('story');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  const { level, completedCampaigns } = useGameStore();

  useEffect(() => {
    // Get available campaigns
    const available = campaignManager.getAvailableCampaigns(level, completedCampaigns || []);
    setCampaigns(available);
    
    // Generate weekly challenge if it's a new week
    const currentWeek = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const weeklyChallenge = campaignManager.generateWeeklyChallenge(currentWeek);
    if (!available.find(c => c.id === weeklyChallenge.id)) {
      setCampaigns([...available, weeklyChallenge]);
    }
  }, [level, completedCampaigns]);

  const filteredCampaigns = campaigns.filter(c => c.type === selectedType);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'casual': return 'text-green-400';
      case 'normal': return 'text-blue-400';
      case 'hard': return 'text-orange-400';
      case 'extreme': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const renderCampaignCard = (campaign: Campaign) => {
    const isCompleted = campaign.state === 'completed';
    const isActive = campaign.state === 'active';
    const isLocked = campaign.state === 'locked';
    
    return (
      <motion.div
        key={campaign.id}
        layoutId={campaign.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: isLocked ? 1 : 1.02 }}
        className="relative"
      >
        <Card 
          className={cn(
            "relative overflow-hidden cursor-pointer transition-all",
            "bg-gray-800/50 border-gray-700 hover:border-gray-600",
            isLocked && "opacity-50 cursor-not-allowed",
            isActive && "border-cyan-500/50 shadow-cyan-500/20 shadow-lg",
            selectedCampaign?.id === campaign.id && "border-cyan-400 shadow-cyan-400/30 shadow-xl"
          )}
          onClick={() => !isLocked && setSelectedCampaign(campaign)}
        >
          {/* Campaign banner */}
          {campaign.bannerImage && (
            <div className="h-32 overflow-hidden">
              <img 
                src={campaign.bannerImage} 
                alt={campaign.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn(
                    "p-1.5 rounded border",
                    CAMPAIGN_TYPE_COLORS[campaign.type]
                  )}>
                    {CAMPAIGN_TYPE_ICONS[campaign.type]}
                  </div>
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {campaign.description}
                </p>
              </div>
              
              {isLocked && (
                <div className="p-2 rounded-full bg-gray-700">
                  <Lock className="w-4 h-4 text-gray-500" />
                </div>
              )}
              
              {isCompleted && (
                <div className="p-2 rounded-full bg-green-900/50">
                  <Star className="w-4 h-4 text-green-400" />
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {/* Difficulty and progress */}
            <div className="flex items-center justify-between">
              <Badge 
                variant="outline" 
                className={cn("capitalize", getDifficultyColor(campaign.difficulty))}
              >
                {campaign.difficulty}
              </Badge>
              
              {campaign.type !== 'endless' && (
                <span className="text-sm text-gray-400">
                  {campaign.completedMissions}/{campaign.totalMissions} missions
                </span>
              )}
            </div>
            
            {/* Progress bar */}
            {campaign.type !== 'endless' && campaign.completedMissions > 0 && (
              <Progress 
                value={(campaign.completedMissions / campaign.totalMissions) * 100} 
                className="h-2"
              />
            )}
            
            {/* Features and modifiers */}
            <div className="flex flex-wrap gap-2">
              {campaign.features?.permadeath && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Permadeath
                </Badge>
              )}
              
              {campaign.features?.timedMissions && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Timed
                </Badge>
              )}
              
              {campaign.modifiers && campaign.modifiers.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  {campaign.modifiers.length} Modifiers
                </Badge>
              )}
            </div>
            
            {/* Requirements */}
            {campaign.requirements && (
              <div className="pt-2 border-t border-gray-700">
                {campaign.requirements.minLevel && level < campaign.requirements.minLevel && (
                  <p className="text-xs text-red-400">
                    Requires Level {campaign.requirements.minLevel}
                  </p>
                )}
                
                {campaign.requirements.completedCampaigns && (
                  <p className="text-xs text-orange-400">
                    Requires completion of other campaigns
                  </p>
                )}
              </div>
            )}
            
            {/* Best score */}
            {campaign.bestScore && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Best Score</span>
                <span className="font-mono text-cyan-400">
                  {campaign.bestScore.toLocaleString()}
                </span>
              </div>
            )}
          </CardContent>
          
          {/* Active campaign indicator */}
          {isActive && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-cyan-600 animate-pulse">
                Active
              </Badge>
            </div>
          )}
        </Card>
      </motion.div>
    );
  };

  const renderCampaignDetails = () => {
    if (!selectedCampaign) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded border",
                CAMPAIGN_TYPE_COLORS[selectedCampaign.type]
              )}>
                {CAMPAIGN_TYPE_ICONS[selectedCampaign.type]}
              </div>
              <div>
                <CardTitle>{selectedCampaign.name}</CardTitle>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedCampaign.description}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Campaign modifiers */}
            {selectedCampaign.modifiers && selectedCampaign.modifiers.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Active Modifiers</h4>
                <div className="space-y-2">
                  {selectedCampaign.modifiers.map(modifier => (
                    <div key={modifier.id} className="bg-gray-700/50 rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium">{modifier.name}</span>
                      </div>
                      <p className="text-sm text-gray-400">{modifier.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Partner restrictions */}
            {selectedCampaign.partnerRestrictions && (
              <div>
                <h4 className="font-semibold mb-2">Squad Requirements</h4>
                <ul className="space-y-1 text-sm text-gray-400">
                  {selectedCampaign.partnerRestrictions.maxSquadSize && (
                    <li>• Maximum squad size: {selectedCampaign.partnerRestrictions.maxSquadSize}</li>
                  )}
                  {selectedCampaign.partnerRestrictions.requiredClasses && (
                    <li>• Required classes: {selectedCampaign.partnerRestrictions.requiredClasses.join(', ')}</li>
                  )}
                  {selectedCampaign.partnerRestrictions.bannedClasses && (
                    <li>• Banned classes: {selectedCampaign.partnerRestrictions.bannedClasses.join(', ')}</li>
                  )}
                </ul>
              </div>
            )}
            
            {/* Completion rewards */}
            {selectedCampaign.completionRewards && (
              <div>
                <h4 className="font-semibold mb-2">Completion Rewards</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCampaign.completionRewards.tips && (
                    <div className="bg-gray-700/50 rounded p-2 text-center">
                      <p className="text-2xl font-bold text-cyan-400">
                        {selectedCampaign.completionRewards.tips}
                      </p>
                      <p className="text-xs text-gray-400">Tips</p>
                    </div>
                  )}
                  {selectedCampaign.completionRewards.experience && (
                    <div className="bg-gray-700/50 rounded p-2 text-center">
                      <p className="text-2xl font-bold text-purple-400">
                        {selectedCampaign.completionRewards.experience}
                      </p>
                      <p className="text-xs text-gray-400">Experience</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Start button */}
            <Button
              className="w-full"
              size="lg"
              onClick={() => onSelectCampaign(selectedCampaign)}
              disabled={selectedCampaign.state === 'locked'}
            >
              {selectedCampaign.state === 'active' ? 'Continue' : 'Start'} Run
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <p className="text-gray-400">
          Choose your next WHIX delivery run in the neon-lit streets of Neo-Tokyo
        </p>
      </div>

      <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as CampaignType)}>
        <TabsList className="grid grid-cols-6 mb-6">
          <TabsTrigger value="story">Story</TabsTrigger>
          <TabsTrigger value="endless">Endless</TabsTrigger>
          <TabsTrigger value="challenge">Challenge</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TabsContent value={selectedType} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredCampaigns.map(campaign => renderCampaignCard(campaign))}
                </AnimatePresence>
                
                {filteredCampaigns.length === 0 && (
                  <div className="col-span-2 text-center py-12">
                    <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                      No {selectedType} campaigns available yet
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>

          <div>
            {renderCampaignDetails()}
          </div>
        </div>
      </Tabs>
    </div>
  );
}