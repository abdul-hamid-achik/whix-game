'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp, Clock, Target, Zap, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  performanceTracker,
  LeaderboardType,
  LeaderboardEntry,
  StatisticsSummary,
  Achievement,
} from '@/lib/systems/performance-tracking-system';
import { useGameStore } from '@/lib/stores/gameStore';
import { cn } from '@/lib/utils';

type LeaderboardViewProps = {
  onClose: () => void;
};

// Leaderboard entry component
function LeaderboardEntryCard({ 
  entry, 
  isCurrentPlayer = false 
}: { 
  entry: LeaderboardEntry; 
  isCurrentPlayer?: boolean;
}) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border-yellow-600/50';
      case 2:
        return 'bg-gradient-to-r from-gray-600/20 to-gray-700/20 border-gray-500/50';
      case 3:
        return 'bg-gradient-to-r from-amber-700/20 to-amber-800/20 border-amber-600/50';
      default:
        return isCurrentPlayer ? 'bg-soviet-900/20 border-soviet-600/50' : 'bg-gray-800/50 border-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "p-4 rounded-lg border transition-all",
        getRankColor(entry.rank),
        isCurrentPlayer && "ring-2 ring-soviet-500"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10">
            {getRankIcon(entry.rank)}
          </div>
          <div>
            <p className="font-semibold">
              {entry.playerName}
              {isCurrentPlayer && (
                <Badge variant="outline" className="ml-2 text-xs">You</Badge>
              )}
            </p>
            <p className="text-xs text-gray-400">
              Score: {entry.score.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{Math.floor((entry.metrics.mission_time || 0) / 60)}m</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Target className="w-4 h-4" />
            <span>{entry.metrics.accuracy}%</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Zap className="w-4 h-4" />
            <span>{entry.metrics.combo_count}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Statistics card component
function StatisticsCard({ stats }: { stats: StatisticsSummary }) {
  const statItems = [
    { label: 'Total Missions', value: stats.totalMissions, icon: Trophy },
    { label: 'Success Rate', value: `${Math.round((stats.successfulMissions / stats.totalMissions) * 100)}%`, icon: Target },
    { label: 'Total Tips', value: stats.totalTipsEarned.toLocaleString(), icon: '💰' },
    { label: 'Best Combo', value: stats.bestCombo, icon: Zap },
    { label: 'Perfect Clears', value: stats.perfectMissions, icon: Star },
    { label: 'Avg Time', value: `${Math.floor(stats.averageMissionTime / 60)}m`, icon: Clock },
  ];

  return (
    <Card className="p-6 bg-gray-800/50 border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-soviet-500" />
        Your Statistics
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center p-3 bg-gray-900/50 rounded-lg"
          >
            <div className="text-2xl mb-1">
              {typeof stat.icon === 'string' ? stat.icon : <stat.icon className="w-6 h-6 mx-auto text-gray-400" />}
            </div>
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Achievement Points</span>
          <span className="font-bold">{stats.achievements.points}</span>
        </div>
        <Progress
          value={(stats.achievements.unlocked / stats.achievements.total) * 100}
          className="h-2"
        />
        <p className="text-xs text-gray-400 mt-1">
          {stats.achievements.unlocked} / {stats.achievements.total} unlocked
        </p>
      </div>
    </Card>
  );
}

// Achievement display component
function AchievementCard({ achievement }: { achievement: Achievement }) {
  const rarityColors = {
    common: 'border-gray-600',
    uncommon: 'border-green-600',
    rare: 'border-blue-600',
    epic: 'border-purple-600',
    legendary: 'border-yellow-600',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "p-4 rounded-lg border-2 transition-all",
        achievement.unlocked ? rarityColors[achievement.rarity] : 'border-gray-700',
        achievement.unlocked ? 'bg-gray-800/50' : 'bg-gray-900/50 opacity-75'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{achievement.icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold">{achievement.name}</h4>
          <p className="text-xs text-gray-400 mb-2">{achievement.description}</p>
          
          {!achievement.unlocked && (
            <div className="space-y-1">
              <Progress value={achievement.progress} className="h-1" />
              <p className="text-xs text-gray-500">{Math.round(achievement.progress)}% complete</p>
            </div>
          )}
          
          {achievement.unlocked && achievement.unlockedAt && (
            <p className="text-xs text-green-500">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function LeaderboardView({ onClose }: LeaderboardViewProps) {
  const { playerName } = useGameStore();
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<LeaderboardType>('daily');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [playerStats, setPlayerStats] = useState<StatisticsSummary | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activeTab, setActiveTab] = useState<'leaderboards' | 'achievements' | 'statistics'>('leaderboards');

  useEffect(() => {
    // Load leaderboard data
    const data = performanceTracker.getLeaderboard(selectedLeaderboard, 50);
    setLeaderboardData(data);
  }, [selectedLeaderboard]);

  useEffect(() => {
    // Load player statistics and achievements
    if (playerName) {
      const stats = performanceTracker.getPlayerStatistics(playerName);
      setPlayerStats(stats);
      
      const achievementList = performanceTracker.getAchievements(playerName);
      setAchievements(achievementList);
    }
  }, [playerName]);

  const leaderboardTypes: { value: LeaderboardType; label: string; icon: React.ReactNode }[] = [
    { value: 'daily', label: 'Daily', icon: <Clock className="w-4 h-4" /> },
    { value: 'weekly', label: 'Weekly', icon: <Trophy className="w-4 h-4" /> },
    { value: 'monthly', label: 'Monthly', icon: <Medal className="w-4 h-4" /> },
    { value: 'all_time', label: 'All Time', icon: <Crown className="w-4 h-4" /> },
    { value: 'arena', label: 'Arena', icon: <Target className="w-4 h-4" /> },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-soviet-900 to-aztec-900 p-6 relative">
        <div className="absolute inset-0 bg-stone-texture opacity-10" />
        <div className="relative">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Performance & Rankings
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-300 hover:text-white"
            >
              ✕
            </Button>
          </div>
        </div>
      </div>

      {/* Main tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mt-4">
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          {/* Leaderboards Tab */}
          <TabsContent value="leaderboards" className="h-full p-6">
            <div className="max-w-4xl mx-auto h-full flex flex-col gap-4">
              {/* Leaderboard type selector */}
              <div className="flex gap-2 flex-wrap justify-center">
                {leaderboardTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={selectedLeaderboard === type.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLeaderboard(type.value)}
                    className="flex items-center gap-1"
                  >
                    {type.icon}
                    {type.label}
                  </Button>
                ))}
              </div>

              {/* Leaderboard entries */}
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  <AnimatePresence mode="wait">
                    {leaderboardData.map((entry) => (
                      <LeaderboardEntryCard
                        key={`${selectedLeaderboard}-${entry.playerId}`}
                        entry={entry}
                        isCurrentPlayer={entry.playerId === playerName}
                      />
                    ))}
                  </AnimatePresence>
                  
                  {leaderboardData.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No entries yet. Be the first!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="h-full p-6">
            <ScrollArea className="h-full">
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements
                    .sort((a, b) => {
                      // Sort unlocked first, then by rarity
                      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
                      const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
                      return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
                    })
                    .map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="h-full p-6">
            <div className="max-w-2xl mx-auto">
              {playerStats && <StatisticsCard stats={playerStats} />}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}