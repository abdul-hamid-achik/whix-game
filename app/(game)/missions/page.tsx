'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, Users, Brain, Search, Clock, 
  DollarSign, Star, AlertCircle, ChevronRight 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGameStore } from '@/lib/stores/gameStore';
import { useMissionStore } from '@/lib/stores/missionStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { Mission, MissionType } from '@/lib/game/missions';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

const missionTypeIcons: Record<MissionType, LucideIcon> = {
  standard_delivery: Package,
  customer_negotiation: Users,
  quality_control: Search,
  data_analysis: Brain,
  investigation: Search,
  special_event: AlertCircle,
  story: Clock,
  daily: Clock,
  weekly: Star,
};

const difficultyColors = {
  easy: 'bg-green-500',
  normal: 'bg-blue-500',
  hard: 'bg-orange-500',
  expert: 'bg-red-500',
  nightmare: 'bg-purple-500',
};

// Client-only date component to prevent hydration mismatch
function ClientDate({ date }: { date: string | Date | number }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <span>Loading...</span>;
  }
  
  return <span>{new Date(date).toLocaleDateString()}</span>;
}

export default function MissionsPage() {
  const { level } = useGameStore();
  const { getActivePartners } = usePartnerStore();
  const {
    availableMissions,
    dailyMissions,
    weeklyMission,
    specialEvent,
    activeMissions,
    refreshAvailableMissions,
    generateDailyMissions,
    generateWeeklyMission,
    startMission,
    canStartMission,
  } = useMissionStore();
  
  useEffect(() => {
    refreshAvailableMissions(level);
    generateDailyMissions(level);
    generateWeeklyMission(level);
  }, [level]);
  
  const activePartners = getActivePartners();
  const canStart = activeMissions.length < 3; // Max 3 active missions
  
  const handleStartMission = (mission: Mission) => {
    if (!canStart || activePartners.length === 0) return;
    
    const partnerIds = activePartners.map(p => p.id);
    startMission(mission.id, partnerIds);
    
    // Navigate to appropriate mission page based on type
    if (mission.type === 'special_event') {
      window.location.href = '/combat';
    } else if (mission.type === 'customer_negotiation') {
      window.location.href = '/missions/social';
    } else if (mission.type === 'data_analysis') {
      window.location.href = '/missions/puzzle';
    } else {
      // Standard missions handled differently
      window.location.href = '/missions';
    }
  };
  
  const MissionCard = ({ mission }: { mission: Mission }) => {
    const Icon = missionTypeIcons[mission.type];
    const canPlay = canStartMission(mission, activePartners[0]?.stats || {});
    
    return (
      <Card className={cn(
        "transition-all",
        canPlay && canStart ? "hover:shadow-lg cursor-pointer" : "opacity-60"
      )}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">{mission.title}</CardTitle>
            </div>
            <Badge className={cn("text-xs", difficultyColors[mission.difficulty])}>
              {mission.difficulty}
            </Badge>
          </div>
          <CardDescription>{mission.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Objectives */}
            <div className="text-sm">
              <span className="font-medium">Objectives:</span>
              <ul className="mt-1 space-y-1">
                {mission.objectives.map(obj => (
                  <li key={obj.id} className="text-muted-foreground">
                    • {obj.description}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Rewards */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span>{mission.rewards.tips} tips</span>
              </div>
              {mission.rewards.starFragments && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{mission.rewards.starFragments}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="text-purple-500">+{mission.rewards.experience} XP</span>
              </div>
            </div>
            
            {/* Requirements */}
            {mission.requirements && (
              <div className="text-xs text-muted-foreground">
                {mission.requirements.level && (
                  <span>Requires Level {mission.requirements.level}</span>
                )}
                {mission.requirements.stats && (
                  <span className="ml-2">
                    Stats: {Object.entries(mission.requirements.stats)
                      .map(([stat, val]) => `${stat} ${val}+`)
                      .join(', ')}
                  </span>
                )}
              </div>
            )}
            
            {/* Action Button */}
            <Button
              className="w-full"
              variant={canPlay && canStart ? "game" : "secondary"}
              disabled={!canPlay || !canStart}
              onClick={() => handleStartMission(mission)}
            >
              {!canStart ? 'Mission Slots Full' : !canPlay ? 'Requirements Not Met' : 'Start Mission'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Available Missions</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose your missions wisely - active slots: {activeMissions.length}/3
        </p>
      </div>
      
      {/* Special Event Banner */}
      {specialEvent && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="border-2 border-yellow-500 bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-500">
                <AlertCircle className="w-6 h-6" />
                Special Event Available!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MissionCard mission={specialEvent} />
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="active">Active ({activeMissions.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableMissions.map((mission, index) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MissionCard mission={mission} />
              </motion.div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="daily">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dailyMissions.map((mission, index) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MissionCard mission={mission} />
              </motion.div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="weekly">
          {weeklyMission ? (
            <div className="max-w-2xl">
              <MissionCard mission={weeklyMission} />
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Weekly mission resets in a few days</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="active">
          {activeMissions.length > 0 ? (
            <div className="space-y-4">
              {activeMissions.map(mission => (
                <Card key={mission.missionId}>
                  <CardHeader>
                    <CardTitle>Mission in Progress</CardTitle>
                    <CardDescription>
                      Started <ClientDate date={mission.startedAt} />
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(mission.objectiveProgress).map(([objId, progress]) => (
                        <div key={objId} className="flex justify-between items-center">
                          <span className="text-sm">{objId}</span>
                          <span className="text-sm font-medium">{progress}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No active missions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Warning if no active partners */}
      {activePartners.length === 0 && (
        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-900/50 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm">
                You need active partners to start missions.{' '}
                <Link href="/partners" className="text-primary hover:underline">
                  Manage your team
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}