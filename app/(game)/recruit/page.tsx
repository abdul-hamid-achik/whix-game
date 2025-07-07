'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Package, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStore } from '@/lib/stores/gameStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { generatePartner, generateMultiplePulls, applyPitySystem } from '@/lib/game/partnerGenerator';
import { cn } from '@/lib/utils';

export default function RecruitPage() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [pulledPartners, setPulledPartners] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const { currentTips, spendTips } = useGameStore();
  const { addPartner, recordPull, pullsSinceEpic, pullsSinceLegendary } = usePartnerStore();
  
  const SINGLE_PULL_COST = 100;
  const MULTI_PULL_COST = 900;
  
  const handlePull = async (pullType: 'single' | 'multi') => {
    const cost = pullType === 'single' ? SINGLE_PULL_COST : MULTI_PULL_COST;
    
    if (!spendTips(cost)) {
      return; // Not enough tips
    }
    
    setIsAnimating(true);
    setPulledPartners([]);
    setShowResults(false);
    
    // Simulate pull animation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let partners;
    if (pullType === 'single') {
      const pityRarity = applyPitySystem(pullsSinceEpic, pullsSinceLegendary);
      const partner = generatePartner(pityRarity);
      partners = [partner];
    } else {
      partners = generateMultiplePulls(10, true);
    }
    
    // Record pull for pity system
    recordPull(partners.map(p => p.rarity));
    
    // Add partners to store
    partners.forEach(partner => addPartner(partner));
    
    setPulledPartners(partners);
    setShowResults(true);
    setIsAnimating(false);
  };
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };
  
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Partner Recruitment
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find new partners to join your resistance against Whix
        </p>
        <div className="mt-4 flex justify-center gap-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-green-500" />
            <span className="font-semibold">{currentTips} Tips</span>
          </div>
          <div className="text-sm text-gray-500">
            Pity: Epic {pullsSinceEpic}/50 • Legendary {pullsSinceLegendary}/90
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="border-2 hover:border-blue-500 transition-colors">
          <CardHeader>
            <CardTitle>Single Recruitment</CardTitle>
            <CardDescription>Recruit one partner</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold mb-4">{SINGLE_PULL_COST} Tips</div>
              <Button 
                onClick={() => handlePull('single')}
                disabled={currentTips < SINGLE_PULL_COST || isAnimating}
                className="w-full"
                variant="game"
              >
                <Sparkles className="mr-2" />
                Recruit One
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 hover:border-purple-500 transition-colors relative">
          <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            10% OFF
          </div>
          <CardHeader>
            <CardTitle>10x Recruitment</CardTitle>
            <CardDescription>Guaranteed Rare or better!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold mb-4">{MULTI_PULL_COST} Tips</div>
              <Button 
                onClick={() => handlePull('multi')}
                disabled={currentTips < MULTI_PULL_COST || isAnimating}
                className="w-full"
                variant="game"
              >
                <Star className="mr-2" />
                Recruit Ten
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-16 h-16 text-yellow-400" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {showResults && pulledPartners.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Recruitment Results!</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {pulledPartners.map((partner, index) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "relative overflow-hidden border-2",
                  partner.rarity === 'legendary' && "border-yellow-500",
                  partner.rarity === 'epic' && "border-purple-500",
                  partner.rarity === 'rare' && "border-blue-500"
                )}>
                  <div className={cn(
                    "absolute inset-0 opacity-20 bg-gradient-to-br",
                    getRarityColor(partner.rarity)
                  )} />
                  <CardHeader className="relative">
                    <CardTitle className="text-lg">{partner.name}</CardTitle>
                    <CardDescription>
                      {partner.class.charAt(0).toUpperCase() + partner.class.slice(1)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-sm space-y-1">
                      <div className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                        {partner.primaryTrait.replace(/_/g, ' ').split(' ').map((word: string) => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </div>
                      <div className={cn(
                        "text-xs font-bold uppercase",
                        partner.rarity === 'legendary' && "text-yellow-500",
                        partner.rarity === 'epic' && "text-purple-500",
                        partner.rarity === 'rare' && "text-blue-500",
                        partner.rarity === 'common' && "text-gray-500"
                      )}>
                        {partner.rarity}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}