import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Zap, Brain, Eye, Users, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PARTNER_CLASSES } from '@/lib/game/classes';
import { NEURODIVERGENT_TRAITS } from '@/lib/game/traits';

interface PartnerCardProps {
  partner: {
    id: string;
    name: string;
    class: string;
    primaryTrait: string;
    secondaryTrait?: string;
    level: number;
    rarity: string;
    stats: {
      focus: number;
      perception: number;
      social: number;
      logic: number;
      stamina: number;
    };
    currentEnergy?: number;
    maxEnergy?: number;
    bondLevel?: number;
  };
  onClick?: () => void;
  selected?: boolean;
  showDetails?: boolean;
}

const classIcons = {
  courier: Package,
  analyst: Brain,
  negotiator: Users,
  specialist: Zap,
  investigator: Eye,
};

export function PartnerCard({ partner, onClick, selected, showDetails = false }: PartnerCardProps) {
  const classInfo = PARTNER_CLASSES[partner.class as keyof typeof PARTNER_CLASSES];
  const Icon = classIcons[partner.class as keyof typeof classIcons] || Package;
  
  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={cn(
          "cursor-pointer transition-all",
          selected && "ring-2 ring-primary",
          "hover:shadow-lg"
        )}
        onClick={onClick}
      >
        <CardHeader className="relative pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{partner.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {classInfo?.name} • Lv.{partner.level}
              </CardDescription>
            </div>
            <div className={cn(
              "px-2 py-1 rounded text-xs font-bold text-white bg-gradient-to-r",
              getRarityGradient(partner.rarity)
            )}>
              {partner.rarity.toUpperCase()}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {/* Traits */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Traits</div>
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-1 bg-primary/10 rounded text-xs font-medium">
                  {NEURODIVERGENT_TRAITS[partner.primaryTrait as keyof typeof NEURODIVERGENT_TRAITS]?.name}
                </span>
                {partner.secondaryTrait && (
                  <span className="px-2 py-1 bg-secondary/10 rounded text-xs font-medium">
                    {NEURODIVERGENT_TRAITS[partner.secondaryTrait as keyof typeof NEURODIVERGENT_TRAITS]?.name}
                  </span>
                )}
              </div>
            </div>
            
            {/* Energy Bar */}
            {partner.currentEnergy !== undefined && partner.maxEnergy && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Energy</span>
                  <span>{partner.currentEnergy}/{partner.maxEnergy}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(partner.currentEnergy / partner.maxEnergy) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
            
            {/* Stats */}
            {showDetails && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Focus</span>
                  <span className="font-medium">{partner.stats.focus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Perception</span>
                  <span className="font-medium">{partner.stats.perception}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Social</span>
                  <span className="font-medium">{partner.stats.social}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Logic</span>
                  <span className="font-medium">{partner.stats.logic}</span>
                </div>
              </div>
            )}
            
            {/* Bond Level */}
            {partner.bondLevel !== undefined && (
              <div className="flex items-center gap-2 text-xs">
                <Heart className="w-3 h-3 text-red-500" />
                <span className="text-muted-foreground">Bond Level {partner.bondLevel}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}