'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Timer, Thermometer, AlertCircle, 
  TrendingUp, MapPin, Battery, Star 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { DeliveryUnit } from '@/lib/game/delivery-grid';

interface DeliveryHUDProps {
  deliveryUnit?: DeliveryUnit;
  timeRemaining: number; // in seconds
  packageCondition: number; // 0-100
  customerMood: 'happy' | 'neutral' | 'impatient' | 'angry';
  estimatedTips: number;
  currentDistrict: string;
  encounterCount?: number;
  className?: string;
}

export function DeliveryHUD({
  deliveryUnit,
  timeRemaining,
  packageCondition,
  customerMood,
  estimatedTips,
  currentDistrict,
  encounterCount = 0,
  className
}: DeliveryHUDProps) {
  const { getPartnerById } = usePartnerStore();
  const [isUrgent, setIsUrgent] = useState(false);
  
  // Get partner info if available
  const partner = deliveryUnit ? getPartnerById(deliveryUnit.partnerId) : null;
  
  // Calculate urgency based on time remaining
  useEffect(() => {
    setIsUrgent(timeRemaining < 180); // Less than 3 minutes
  }, [timeRemaining]);
  
  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get mood color
  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'happy': return 'text-green-500';
      case 'neutral': return 'text-yellow-500';
      case 'impatient': return 'text-orange-500';
      case 'angry': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };
  
  // Get package condition color
  const getConditionColor = (condition: number) => {
    if (condition >= 80) return 'bg-green-500';
    if (condition >= 60) return 'bg-yellow-500';
    if (condition >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "fixed top-4 left-4 right-4 z-50 max-w-6xl mx-auto",
        className
      )}
    >
      <Card className="bg-background/95 backdrop-blur-sm border-2 border-primary/20 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4">
          {/* Timer Section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <Timer className={cn("w-4 h-4", isUrgent && "text-red-500 animate-pulse")} />
              <span className="text-xs text-muted-foreground">Time Remaining</span>
            </div>
            <div className={cn(
              "text-2xl font-mono font-bold",
              isUrgent ? "text-red-500" : "text-primary"
            )}>
              {formatTime(timeRemaining)}
            </div>
            {isUrgent && (
              <Badge variant="destructive" className="mt-1 text-xs">
                URGENT
              </Badge>
            )}
          </div>
          
          {/* Package Condition */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="w-4 h-4" />
              <span className="text-xs text-muted-foreground">Package Condition</span>
            </div>
            <div className="relative h-3 mb-1 overflow-hidden rounded-full bg-secondary">
              <div 
                className={cn("h-full transition-all", getConditionColor(packageCondition))}
                style={{ width: `${packageCondition}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{packageCondition}%</span>
              {packageCondition < 60 && (
                <AlertCircle className="w-3 h-3 text-orange-500" />
              )}
            </div>
          </div>
          
          {/* Customer Mood */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-xs text-muted-foreground">Customer Mood</span>
            </div>
            <div className={cn(
              "text-lg font-semibold capitalize",
              getMoodColor(customerMood)
            )}>
              {customerMood}
            </div>
            <div className="text-xs text-muted-foreground">
              {customerMood === 'happy' && 'Excellent service!'}
              {customerMood === 'neutral' && 'On track'}
              {customerMood === 'impatient' && 'Hurry up!'}
              {customerMood === 'angry' && 'Very upset!'}
            </div>
          </div>
          
          {/* Tips Estimate */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs text-muted-foreground">Est. Tips</span>
            </div>
            <div className="text-xl font-bold text-green-500">
              ${estimatedTips}
            </div>
            <div className="text-xs text-muted-foreground">
              {customerMood === 'happy' && '+20% mood bonus'}
              {customerMood === 'angry' && '-30% penalty'}
            </div>
          </div>
          
          {/* Location Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-xs text-muted-foreground">District</span>
            </div>
            <div className="text-sm font-medium capitalize">
              {currentDistrict}
            </div>
            {encounterCount > 0 && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {encounterCount} encounters
              </Badge>
            )}
          </div>
          
          {/* Partner Info */}
          {partner && (
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-1">
                <Battery className="w-4 h-4" />
                <span className="text-xs text-muted-foreground">Partner</span>
              </div>
              <div className="text-sm font-medium">{partner.name}</div>
              <div className="flex items-center gap-1 mt-1">
                <Progress 
                  value={(partner.currentEnergy / partner.maxEnergy) * 100} 
                  className="h-2 flex-1"
                />
                <span className="text-xs text-muted-foreground">
                  {partner.currentEnergy}/{partner.maxEnergy}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Alert Banner */}
        <AnimatePresence>
          {(isUrgent || packageCondition < 50 || customerMood === 'angry') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-primary/20"
            >
              <div className="px-4 py-2 bg-red-500/10 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-500 font-medium">
                  {isUrgent && 'Time running out! '}
                  {packageCondition < 50 && 'Package deteriorating! '}
                  {customerMood === 'angry' && 'Customer very upset!'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}