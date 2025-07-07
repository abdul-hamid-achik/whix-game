'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, Users, Swords, Book, 
  DollarSign, Star, Zap, Target 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useGameStore } from '@/lib/stores/gameStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useMissionStore } from '@/lib/stores/missionStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { 
    currentTips, 
    companyStars, 
    tipCutPercentage, 
    level, 
    experience,
    missionsCompleted,
    removeExpiredBoosts,
    activeBoosts
  } = useGameStore();
  
  const { partners, getActivePartners, checkInjuryRecovery } = usePartnerStore();
  const { generateDailyMissions, dailyMissions } = useMissionStore();
  
  useEffect(() => {
    // Check for expired boosts and injured partners
    removeExpiredBoosts();
    checkInjuryRecovery();
    generateDailyMissions(level);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const activePartners = getActivePartners();
  const expForNextLevel = level * 100;
  const expProgress = (experience / expForNextLevel) * 100;
  
  const stats = [
    {
      title: 'Current Tips',
      value: currentTips.toLocaleString(),
      icon: DollarSign,
      color: 'text-green-500',
      description: `${tipCutPercentage}% goes to Whix`,
    },
    {
      title: 'Company Stars',
      value: `${companyStars}/5`,
      icon: Star,
      color: 'text-yellow-500',
      description: `${5 - companyStars} more to reduce tip cut`,
    },
    {
      title: 'Partners',
      value: partners.length,
      icon: Users,
      color: 'text-blue-500',
      description: `${activePartners.length} active`,
    },
    {
      title: 'Missions',
      value: missionsCompleted,
      icon: Target,
      color: 'text-purple-500',
      description: 'Completed',
    },
  ];
  
  const quickActions = [
    { href: '/recruit', label: 'Recruit Partners', icon: Users, color: 'from-purple-600 to-pink-600' },
    { href: '/missions', label: 'Start Mission', icon: Package, color: 'from-blue-600 to-cyan-600' },
    { href: '/combat', label: 'Combat Training', icon: Swords, color: 'from-red-600 to-orange-600' },
    { href: '/story', label: 'Story Mode', icon: Book, color: 'from-green-600 to-emerald-600' },
  ];
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Partner Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, Partner #{level}
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Level Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Level {level}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {experience}/{expForNextLevel} XP
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={expProgress} className="h-3" />
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={action.href}>
              <Card className="cursor-pointer hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className={cn(
                    "w-12 h-12 rounded-lg bg-gradient-to-r flex items-center justify-center mb-4",
                    action.color
                  )}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold">{action.label}</h3>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Boosts */}
        {activeBoosts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Active Boosts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeBoosts.map(boost => {
                  const timeLeft = Math.max(0, boost.expiresAt - Date.now());
                  const minutes = Math.floor(timeLeft / 60000);
                  
                  return (
                    <div key={boost.id} className="flex justify-between items-center p-2 bg-secondary rounded">
                      <span className="text-sm">
                        {boost.type.charAt(0).toUpperCase() + boost.type.slice(1)} +{boost.value * 100}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {minutes}m remaining
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Daily Missions Preview */}
        {dailyMissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Daily Missions</span>
                <Link href="/missions">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dailyMissions.slice(0, 3).map(mission => (
                  <div key={mission.id} className="flex justify-between items-center p-2">
                    <span className="text-sm">{mission.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {mission.rewards.tips} tips
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Whix Cut Warning */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 bg-red-900/20 border border-red-900/50 rounded-lg"
      >
        <div className="flex items-center gap-3">
          <div className="text-red-500">⚠️</div>
          <div>
            <p className="text-sm">
              Whix currently takes <span className="font-bold text-red-500">{tipCutPercentage}%</span> of your tips.
              Earn more Company Stars to reduce this cut by 15% per star!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}