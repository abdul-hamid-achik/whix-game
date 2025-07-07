'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Package, Zap, Heart, 
  Brain, Coins, Gem, ChevronRight,
  Star, Lock, Sparkles,
  Gift, TrendingUp, Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/lib/stores/gameStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useUIStore } from '@/lib/stores/uiStore';

interface ShopSystemProps {
  onClose?: () => void;
}

interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: 'consumables' | 'equipment' | 'upgrades' | 'special' | 'currency';
  price: {
    tips?: number;
    gems?: number;
    starFragments?: number;
  };
  icon: React.ReactNode;
  stock?: number;
  discount?: number;
  requirements?: {
    level?: number;
    completedMissions?: number;
    ownedPartners?: number;
  };
  effects?: {
    energy?: number;
    experience?: number;
    bondBonus?: number;
    tipMultiplier?: number;
    duration?: number;
  };
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

const SHOP_ITEMS: ShopItem[] = [
  // Consumables
  {
    id: 'energy-drink',
    name: 'Neura Energy Drink',
    description: 'Instantly restore 50 energy to a partner',
    category: 'consumables',
    price: { tips: 200 },
    icon: <Zap className="w-6 h-6" />,
    stock: 10,
    effects: { energy: 50 },
    rarity: 'common'
  },
  {
    id: 'exp-boost',
    name: 'Experience Booster',
    description: '+50% experience gain for 10 missions',
    category: 'consumables',
    price: { tips: 500 },
    icon: <TrendingUp className="w-6 h-6" />,
    effects: { experience: 50, duration: 10 },
    rarity: 'rare'
  },
  {
    id: 'bond-enhancer',
    name: 'Synthetic Bonding Agent',
    description: 'Increase bond gain by 100% for 5 missions',
    category: 'consumables',
    price: { tips: 750 },
    icon: <Heart className="w-6 h-6" />,
    effects: { bondBonus: 100, duration: 5 },
    rarity: 'rare'
  },
  
  // Equipment
  {
    id: 'neural-interface',
    name: 'Advanced Neural Interface',
    description: 'Enhance partner stats by 10%',
    category: 'equipment',
    price: { tips: 2000 },
    icon: <Brain className="w-6 h-6" />,
    requirements: { level: 10 },
    rarity: 'epic'
  },
  {
    id: 'delivery-optimizer',
    name: 'Route Optimization Module',
    description: 'Reduce mission time by 20%',
    category: 'equipment',
    price: { tips: 1500 },
    icon: <Package className="w-6 h-6" />,
    requirements: { completedMissions: 50 },
    rarity: 'rare'
  },
  
  // Upgrades
  {
    id: 'team-slot',
    name: 'Team Expansion Permit',
    description: 'Add one more active team slot (Max 5)',
    category: 'upgrades',
    price: { tips: 5000 },
    icon: <Users className="w-6 h-6" />,
    stock: 2,
    requirements: { level: 15 },
    rarity: 'legendary'
  },
  {
    id: 'star-fragment-converter',
    name: 'Corporate Efficiency Module',
    description: 'Convert 100 tips to 1 star fragment daily',
    category: 'upgrades',
    price: { tips: 3000 },
    icon: <Star className="w-6 h-6" />,
    requirements: { level: 20 },
    rarity: 'epic'
  },
  
  // Special Offers
  {
    id: 'starter-pack',
    name: 'Beginner\'s Bundle',
    description: '5 Energy Drinks + 1000 Tips + 1 Rare Partner Token',
    category: 'special',
    price: { tips: 1000 },
    icon: <Gift className="w-6 h-6" />,
    stock: 1,
    discount: 50,
    rarity: 'rare'
  },
  {
    id: 'weekly-deal',
    name: 'Weekly Delivery Deal',
    description: '3 Experience Boosters + 2 Bond Enhancers',
    category: 'special',
    price: { tips: 1500 },
    icon: <Sparkles className="w-6 h-6" />,
    discount: 30,
    rarity: 'rare'
  },
  
  // Currency Exchange
  {
    id: 'tip-bundle-small',
    name: 'Small Tip Bundle',
    description: '1000 Tips',
    category: 'currency',
    price: { gems: 100 },
    icon: <Coins className="w-6 h-6" />,
    rarity: 'common'
  },
  {
    id: 'tip-bundle-large',
    name: 'Large Tip Bundle',
    description: '5000 Tips + 500 Bonus',
    category: 'currency',
    price: { gems: 450 },
    icon: <Coins className="w-6 h-6" />,
    rarity: 'rare'
  }
];


const RARITY_COLORS = {
  common: 'border-gray-400 text-gray-400',
  rare: 'border-blue-400 text-blue-400',
  epic: 'border-purple-400 text-purple-400',
  legendary: 'border-orange-400 text-orange-400'
};

export function ShopSystem({ }: ShopSystemProps) {
  const { currentTips, starFragments, level, spendTips } = useGameStore();
  const { partners } = usePartnerStore();
  const { showPanel } = useUIStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [purchasedItems, setPurchasedItems] = useState<Set<string>>(new Set());
  
  const filteredItems = SHOP_ITEMS.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );
  
  const canAfford = (item: ShopItem): boolean => {
    if (item.price.tips && currentTips < item.price.tips) return false;
    if (item.price.starFragments && starFragments < item.price.starFragments) return false;
    // Gems not implemented yet
    if (item.price.gems) return false;
    return true;
  };
  
  const meetsRequirements = (item: ShopItem): boolean => {
    if (!item.requirements) return true;
    if (item.requirements.level && level < item.requirements.level) return false;
    if (item.requirements.ownedPartners && Object.keys(partners).length < item.requirements.ownedPartners) return false;
    // Add more requirement checks as needed
    return true;
  };
  
  const isAvailable = (item: ShopItem): boolean => {
    if (item.stock !== undefined && purchasedItems.has(item.id)) {
      const purchaseCount = Array.from(purchasedItems).filter(id => id === item.id).length;
      if (purchaseCount >= item.stock) return false;
    }
    return canAfford(item) && meetsRequirements(item);
  };
  
  const handlePurchase = (item: ShopItem) => {
    if (!isAvailable(item)) return;
    
    // Deduct currency
    if (item.price.tips) {
      if (!spendTips(item.price.tips)) return;
    }
    
    // Apply effects based on item type
    switch (item.category) {
      case 'consumables':
        // Add to inventory (not implemented)
        break;
      case 'equipment':
        // Add to equipment system (not implemented)
        break;
      case 'upgrades':
        if (item.id === 'star-fragment-converter') {
          // Enable daily star fragment generation
        } else if (item.id === 'team-slot') {
          // Increase max team size
        }
        break;
      case 'special':
        // Handle bundle contents
        if (item.id === 'starter-pack') {
          // Add items to inventory
          // Add tips
          // Add partner token
        }
        break;
      case 'currency':
        // Currency exchange handled by payment system
        break;
    }
    
    // Track purchase
    setPurchasedItems(new Set([...purchasedItems, item.id]));
    setSelectedItem(null);
  };
  
  const renderItemCard = (item: ShopItem) => {
    const available = isAvailable(item);
    const soldOut = item.stock !== undefined && 
      Array.from(purchasedItems).filter(id => id === item.id).length >= item.stock;
    
    return (
      <motion.div
        key={item.id}
        whileHover={available ? { scale: 1.02 } : {}}
        className="relative"
      >
        <Card 
          className={cn(
            "cursor-pointer transition-all",
            "bg-gray-800/50 border-gray-700",
            available && "hover:border-gray-600",
            !available && "opacity-50",
            selectedItem?.id === item.id && "border-cyan-400 shadow-cyan-400/30 shadow-lg"
          )}
          onClick={() => available && setSelectedItem(item)}
        >
          {/* Discount badge */}
          {item.discount && (
            <div className="absolute -top-2 -right-2 z-10">
              <Badge className="bg-red-600 text-white">
                -{item.discount}%
              </Badge>
            </div>
          )}
          
          {/* Sold out overlay */}
          {soldOut && (
            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center z-20">
              <span className="text-red-400 font-bold text-lg">SOLD OUT</span>
            </div>
          )}
          
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-3 rounded-lg",
                item.rarity && RARITY_COLORS[item.rarity].replace('border-', 'bg-').replace('text-', 'bg-') + '/20'
              )}>
                {item.icon}
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">{item.name}</CardTitle>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs mt-1", item.rarity && RARITY_COLORS[item.rarity])}
                >
                  {item.rarity || 'common'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-400">{item.description}</p>
            
            {/* Price */}
            <div className="flex items-center gap-3">
              {item.price.tips && (
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className={cn(
                    "font-semibold",
                    item.discount && "line-through text-gray-500 text-sm"
                  )}>
                    {item.price.tips}
                  </span>
                  {item.discount && (
                    <span className="font-semibold text-yellow-400">
                      {Math.floor(item.price.tips * (1 - item.discount / 100))}
                    </span>
                  )}
                </div>
              )}
              {item.price.gems && (
                <div className="flex items-center gap-1">
                  <Gem className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold">{item.price.gems}</span>
                </div>
              )}
              {item.price.starFragments && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold">{item.price.starFragments}</span>
                </div>
              )}
            </div>
            
            {/* Requirements */}
            {item.requirements && !meetsRequirements(item) && (
              <div className="text-xs text-red-400 space-y-1">
                {item.requirements.level && level < item.requirements.level && (
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Requires Level {item.requirements.level}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Stock */}
            {item.stock !== undefined && (
              <div className="text-xs text-gray-400">
                Stock: {item.stock - Array.from(purchasedItems).filter(id => id === item.id).length}/{item.stock}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-cyan-400" />
          WHIX Company Store
        </h2>
        <p className="text-gray-400">
          Enhance your delivery operations with premium items and upgrades
        </p>
      </div>

      {/* Currency Display */}
      <Card className="mb-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-gray-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-semibold">{currentTips.toLocaleString()} Tips</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-cyan-400" />
                <span className="text-lg font-semibold">{starFragments} Fragments</span>
              </div>
              <div className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-purple-400" />
                <span className="text-lg">0 Gems</span>
                <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => showPanel('gachaRecruitment', {
                position: 'overlay',
                size: 'large'
              })}
            >
              Get More Currency
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shop Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="consumables">Consumables</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="upgrades">Upgrades</TabsTrigger>
          <TabsTrigger value="special">Special</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map(item => renderItemCard(item))}
            </AnimatePresence>
            
            {filteredItems.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No items in this category</p>
              </div>
            )}
          </div>
        </div>

        {/* Item Details */}
        <div>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-3 rounded-lg",
                      selectedItem.rarity && RARITY_COLORS[selectedItem.rarity].replace('border-', 'bg-').replace('text-', 'bg-') + '/20'
                    )}>
                      {selectedItem.icon}
                    </div>
                    <div>
                      <CardTitle>{selectedItem.name}</CardTitle>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs mt-1", selectedItem.rarity && RARITY_COLORS[selectedItem.rarity])}
                      >
                        {selectedItem.rarity || 'common'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-300">{selectedItem.description}</p>
                  
                  {/* Effects */}
                  {selectedItem.effects && (
                    <div>
                      <h4 className="font-semibold mb-2">Effects</h4>
                      <div className="space-y-1 text-sm text-gray-400">
                        {selectedItem.effects.energy && (
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span>+{selectedItem.effects.energy} Energy</span>
                          </div>
                        )}
                        {selectedItem.effects.experience && (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span>+{selectedItem.effects.experience}% Experience</span>
                          </div>
                        )}
                        {selectedItem.effects.bondBonus && (
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-pink-400" />
                            <span>+{selectedItem.effects.bondBonus}% Bond Gain</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Purchase button */}
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!isAvailable(selectedItem)}
                    onClick={() => handlePurchase(selectedItem)}
                  >
                    {!canAfford(selectedItem) ? 'Insufficient Funds' :
                     !meetsRequirements(selectedItem) ? 'Requirements Not Met' :
                     'Purchase'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}