'use client';

import { motion } from 'framer-motion';
import { Battery, AlertTriangle, Coffee, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePartnerStore } from '@/lib/stores/partnerStore';

interface PartnerEnergyDisplayProps {
  className?: string;
  onRestPartner?: (partnerId: string, restType: 'poor' | 'normal' | 'good') => void;
}

export function PartnerEnergyDisplay({ className, onRestPartner }: PartnerEnergyDisplayProps) {
  const { getActivePartners, restPartner } = usePartnerStore();
  const activePartners = getActivePartners();
  
  const getEnergyColor = (percent: number) => {
    if (percent > 60) return 'bg-green-500';
    if (percent > 30) return 'bg-yellow-500';
    if (percent > 15) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  const getEnergyStatus = (percent: number) => {
    if (percent > 80) return { label: 'Energized', icon: Zap, color: 'text-green-500' };
    if (percent > 60) return { label: 'Good', icon: Battery, color: 'text-green-500' };
    if (percent > 40) return { label: 'Tired', icon: Battery, color: 'text-yellow-500' };
    if (percent > 20) return { label: 'Exhausted', icon: AlertTriangle, color: 'text-orange-500' };
    return { label: 'Burnout Risk', icon: AlertTriangle, color: 'text-red-500' };
  };
  
  const handleRest = (partnerId: string, restType: 'poor' | 'normal' | 'good') => {
    restPartner(partnerId, restType);
    onRestPartner?.(partnerId, restType);
  };
  
  if (activePartners.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          No active partners
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Battery className="w-5 h-5" />
          Partner Energy & Fatigue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activePartners.map((partner) => {
          const energyPercent = Math.round((partner.currentEnergy / partner.maxEnergy) * 100);
          const status = getEnergyStatus(energyPercent);
          const StatusIcon = status.icon;
          
          return (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 p-4 bg-muted/50 rounded-lg"
            >
              {/* Partner Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{partner.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusIcon className={cn("w-4 h-4", status.color)} />
                    <span className={cn("text-sm", status.color)}>
                      {status.label}
                    </span>
                    {partner.isInjured && (
                      <Badge variant="destructive" className="text-xs">
                        Forced Rest
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {partner.currentEnergy}/{partner.maxEnergy}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {energyPercent}% Energy
                  </p>
                </div>
              </div>
              
              {/* Energy Bar */}
              <div className="space-y-1">
                <div className="relative h-3 overflow-hidden rounded-full bg-secondary">
                  <div 
                    className={cn("h-full transition-all", getEnergyColor(energyPercent))}
                    style={{ width: `${energyPercent}%` }}
                  />
                </div>
                {energyPercent < 30 && (
                  <p className="text-xs text-orange-500">
                    ⚠️ Low energy - partner needs rest soon
                  </p>
                )}
              </div>
              
              {/* Fatigue Factors */}
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>• Loses 2 energy per move</p>
                <p>• Loses 5 energy per encounter</p>
                {partner.currentEnergy < 20 && (
                  <p className="text-red-500">• At risk of burnout!</p>
                )}
              </div>
              
              {/* Rest Options */}
              {!partner.isInjured && energyPercent < 50 && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRest(partner.id, 'poor')}
                    className="flex-1"
                  >
                    <Coffee className="w-3 h-3 mr-1" />
                    Quick Break
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRest(partner.id, 'normal')}
                    className="flex-1"
                  >
                    Rest
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRest(partner.id, 'good')}
                    className="flex-1"
                  >
                    Full Rest
                  </Button>
                </div>
              )}
              
              {/* Burnout Warning */}
              {partner.isInjured && partner.injuryRecoveryTime && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                  <p className="text-sm text-red-500 font-medium">
                    Forced Rest Due to Exhaustion
                  </p>
                  <p className="text-xs text-red-400 mt-1">
                    Recovery in {Math.ceil((partner.injuryRecoveryTime - Date.now()) / (1000 * 60))} minutes
                  </p>
                </div>
              )}
              
              {/* Trait-based Energy Bonuses */}
              {partner.primaryTrait === 'routine_mastery' && (
                <p className="text-xs text-blue-500">
                  💡 Routine Mastery: +20% energy efficiency
                </p>
              )}
              {partner.primaryTrait === 'hyperfocus' && (
                <p className="text-xs text-purple-500">
                  💡 Hyperfocus: Can work longer but crashes harder
                </p>
              )}
            </motion.div>
          );
        })}
        
        {/* Work-Life Balance Score */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Team Work-Life Balance</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(
                activePartners.reduce((sum, p) => sum + (p.currentEnergy / p.maxEnergy) * 100, 0) / 
                activePartners.length
              )}%
            </span>
          </div>
          <Progress 
            value={
              activePartners.reduce((sum, p) => sum + (p.currentEnergy / p.maxEnergy) * 100, 0) / 
              activePartners.length
            }
            className="h-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Maintain above 50% to avoid burnout and keep partners happy
          </p>
        </div>
      </CardContent>
    </Card>
  );
}