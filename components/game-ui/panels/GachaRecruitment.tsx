'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Star, Package, Gift, ChevronRight,
  Info, TrendingUp,
  Coins, Gem, Clock, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/lib/stores/gameStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { ClientGachaSystem } from '@/lib/cms/client-gacha-system';
import { Partner, Rarity } from '@/lib/game/classes';

interface GachaRecruitmentProps {
  onClose?: () => void;
}

interface Banner {
  id: string;
  name: string;
  description: string;
  type: 'standard' | 'limited' | 'special';
  featuredPartners: string[];
  rateUp: Partial<Record<Rarity, number>>;
  cost: {
    single: number;
    multi: number;
  };
  endsAt?: Date;
  pityThreshold: number;
}

const MOCK_BANNERS: Banner[] = [
  {
    id: 'standard',
    name: 'Standard Recruitment',
    description: 'Regular pool with all available partners',
    type: 'standard',
    featuredPartners: [],
    rateUp: {},
    cost: {
      single: 100,
      multi: 900
    },
    pityThreshold: 90
  },
  {
    id: 'tech-specialist',
    name: 'Tech Specialist Banner',
    description: 'Increased rates for Analyst and Investigator partners!',
    type: 'limited',
    featuredPartners: ['katarina-volkov', 'dev-null'],
    rateUp: {
      legendary: 1.5,
      epic: 2
    },
    cost: {
      single: 150,
      multi: 1350
    },
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    pityThreshold: 80
  }
];

const RARITY_COLORS = {
  common: { bg: 'from-gray-600 to-gray-700', glow: 'shadow-gray-500/50' },
  rare: { bg: 'from-blue-600 to-blue-700', glow: 'shadow-blue-500/50' },
  epic: { bg: 'from-purple-600 to-purple-700', glow: 'shadow-purple-500/50' },
  legendary: { bg: 'from-orange-600 to-orange-700', glow: 'shadow-orange-500/50' }
};

const RARITY_PARTICLES = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 5
};

export function GachaRecruitment({ }: GachaRecruitmentProps) {
  const { currentTips, spendTips } = useGameStore();
  const { addPartner, gachaPulls = 0, updateGachaPulls } = usePartnerStore();
  const { showPanel } = useUIStore();
  
  const [selectedBanner, setSelectedBanner] = useState<Banner>(MOCK_BANNERS[0]);
  const [isPulling, setIsPulling] = useState(false);
  const [pullResults, setPullResults] = useState<Partner[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [pullHistory, setPullHistory] = useState<Partner[]>([]);
  
  // Calculate pity progress
  const pityProgress = gachaPulls % selectedBanner.pityThreshold;
  const guaranteedIn = selectedBanner.pityThreshold - pityProgress;
  
  const handleSinglePull = async () => {
    if (currentTips < selectedBanner.cost.single) return;
    if (!spendTips(selectedBanner.cost.single)) return;
    
    setIsPulling(true);
    setPullResults([]);
    
    // Simulate pull animation delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = await ClientGachaSystem.performPull();
    setPullResults([result.partner]);
    setPullHistory([result.partner, ...pullHistory.slice(0, 49)]); // Keep last 50
    
    // Add to partner store
    addPartner(result.partner);
    updateGachaPulls(gachaPulls + 1);
    
    setIsPulling(false);
    setShowResults(true);
  };
  
  const handleMultiPull = async () => {
    if (currentTips < selectedBanner.cost.multi) return;
    if (!spendTips(selectedBanner.cost.multi)) return;
    
    setIsPulling(true);
    setPullResults([]);
    
    // Simulate pull animation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const results = await ClientGachaSystem.performMultiPull();
    const partners = results.map(r => r.partner);
    setPullResults(partners);
    setPullHistory([...partners, ...pullHistory.slice(0, 40)]); // Keep last 50
    
    // Add all to partner store
    partners.forEach(partner => addPartner(partner));
    updateGachaPulls(gachaPulls + 10);
    
    setIsPulling(false);
    setShowResults(true);
  };
  
  const renderBannerCard = (banner: Banner) => {
    const isSelected = selectedBanner.id === banner.id;
    const timeLeft = banner.endsAt ? banner.endsAt.getTime() - Date.now() : null;
    const daysLeft = timeLeft ? Math.floor(timeLeft / (24 * 60 * 60 * 1000)) : null;
    
    return (
      <Card
        key={banner.id}
        className={cn(
          "cursor-pointer transition-all",
          "bg-gray-800/50 border-gray-700 hover:border-gray-600",
          isSelected && "border-cyan-400 shadow-cyan-400/30 shadow-lg"
        )}
        onClick={() => setSelectedBanner(banner)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{banner.name}</CardTitle>
              <p className="text-sm text-gray-400 mt-1">{banner.description}</p>
            </div>
            {banner.type === 'limited' && (
              <Badge variant="destructive" className="text-xs">
                {daysLeft}d left
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Featured partners preview */}
            {banner.featuredPartners.length > 0 && (
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Rate Up!
                </Badge>
              </div>
            )}
            
            {/* Cost */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span>{banner.cost.single} Tips</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4 text-yellow-400" />
                <span>{banner.cost.multi} Tips (10x)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderPullAnimation = () => {
    if (!isPulling) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      >
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity }
          }}
          className="relative"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 blur-xl" />
          <Gift className="w-16 h-16 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </motion.div>
      </motion.div>
    );
  };
  
  const renderPullResults = () => {
    if (!showResults || pullResults.length === 0) return null;
    
    return (
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Recruitment Results!
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {pullResults.map((partner, index) => {
              const rarityStyle = RARITY_COLORS[partner.rarity];
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className={cn(
                    "overflow-hidden border-2",
                    `shadow-2xl ${rarityStyle.glow}`,
                    partner.rarity === 'legendary' && "animate-pulse"
                  )}>
                    {/* Rarity background */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-20",
                      rarityStyle.bg
                    )} />
                    
                    {/* Particles effect */}
                    <div className="absolute inset-0">
                      {Array.from({ length: RARITY_PARTICLES[partner.rarity] }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full"
                          animate={{
                            x: [0, Math.random() * 200 - 100],
                            y: [0, -200],
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                          style={{
                            left: `${Math.random() * 100}%`,
                            bottom: 0
                          }}
                        />
                      ))}
                    </div>
                    
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">{partner.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {partner.rarity}
                          </Badge>
                        </div>
                        {partner.rarity === 'legendary' && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          >
                            <Star className="w-8 h-8 text-yellow-400" />
                          </motion.div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="relative">
                      <p className="text-sm text-gray-300 mb-3">
                        {partner.biography?.slice(0, 100)}...
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="secondary">
                          {partner.class}
                        </Badge>
                        <Badge variant="secondary" className="bg-purple-900/30">
                          {partner.primaryTrait}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setShowResults(false)}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowResults(false);
                showPanel('partnerManagement', {
                  position: 'overlay',
                  size: 'large'
                });
              }}
              className="flex-1"
            >
              View Partners
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-400" />
          Partner Recruitment
        </h2>
        <p className="text-gray-400">
          Recruit new neurodivergent partners to join your delivery team
        </p>
      </div>

      {/* Current Resources */}
      <Card className="mb-6 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-semibold">{currentTips.toLocaleString()} Tips</span>
              </div>
              <div className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-purple-400" />
                <span className="text-lg">0 Gems</span>
                <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Get More Tips
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Banner Selection */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold mb-3">Available Banners</h3>
          {MOCK_BANNERS.map(banner => renderBannerCard(banner))}
        </div>

        {/* Pull Interface */}
        <div className="space-y-4">
          {/* Pity System */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Pity System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span>{pityProgress}/{selectedBanner.pityThreshold}</span>
                  </div>
                  <Progress 
                    value={(pityProgress / selectedBanner.pityThreshold) * 100} 
                    className="h-2"
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Guaranteed epic or better in {guaranteedIn} pulls
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Rates Info */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5" />
                Drop Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-orange-400">Legendary</span>
                  <span>0.6%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-400">Epic</span>
                  <span>5.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">Rare</span>
                  <span>33.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Common</span>
                  <span>61%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pull Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSinglePull}
              disabled={isPulling || currentTips < selectedBanner.cost.single}
              className="w-full h-14 text-lg"
              size="lg"
            >
              <Gift className="w-5 h-5 mr-2" />
              Single Pull ({selectedBanner.cost.single} Tips)
            </Button>
            
            <Button
              onClick={handleMultiPull}
              disabled={isPulling || currentTips < selectedBanner.cost.multi}
              className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              <Package className="w-5 h-5 mr-2" />
              10x Pull ({selectedBanner.cost.multi} Tips)
            </Button>
            
            <p className="text-xs text-center text-gray-400">
              10x pulls guarantee at least one rare or better partner
            </p>
          </div>
        </div>
      </div>

      {/* Pull History */}
      {pullHistory.length > 0 && (
        <Card className="mt-6 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Pulls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {pullHistory.slice(0, 10).map((partner, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={cn(
                    "whitespace-nowrap",
                    partner.rarity === 'legendary' && "border-orange-400 text-orange-400",
                    partner.rarity === 'epic' && "border-purple-400 text-purple-400",
                    partner.rarity === 'rare' && "border-blue-400 text-blue-400"
                  )}
                >
                  {partner.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Animations */}
      <AnimatePresence>
        {renderPullAnimation()}
        {renderPullResults()}
      </AnimatePresence>
    </div>
  );
}