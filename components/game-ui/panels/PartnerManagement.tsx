'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Filter, 
  Heart, Zap, Shield, Brain, TrendingUp,
  X, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { StoredPartner } from '@/lib/schemas/game-schemas';
import { PARTNER_CLASSES, NEURODIVERGENT_TRAITS } from '@/lib/game/classes';
import { CharacterProgression } from './CharacterProgression';

interface PartnerManagementProps {
  onClose?: () => void;
}

const RARITY_COLORS = {
  common: 'text-gray-400 border-gray-400',
  rare: 'text-blue-400 border-blue-400',
  epic: 'text-purple-400 border-purple-400',
  legendary: 'text-orange-400 border-orange-400'
};

const RARITY_BACKGROUNDS = {
  common: 'from-gray-700 to-gray-800',
  rare: 'from-blue-700 to-blue-800',
  epic: 'from-purple-700 to-purple-800',
  legendary: 'from-orange-700 to-orange-800'
};

export function PartnerManagement({ }: PartnerManagementProps) {
  const { partners, activeTeam, addToActiveTeam, removeFromActiveTeam } = usePartnerStore();
  
  const [selectedPartner, setSelectedPartner] = useState<StoredPartner | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'level' | 'rarity' | 'bond'>('level');
  const [showProgressionView, setShowProgressionView] = useState(false);

  const partnersList = Object.values(partners);
  
  // Filter and sort partners
  const filteredPartners = partnersList
    .filter(partner => {
      if (searchQuery && !partner.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterClass !== 'all' && partner.class !== filterClass) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'level':
          return b.level - a.level;
        case 'rarity':
          const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        case 'bond':
          return b.bondLevel - a.bondLevel;
        default:
          return 0;
      }
    });

  const isInActiveTeam = (partnerId: string) => {
    return activeTeam.includes(partnerId);
  };

  const handleToggleActiveTeam = (partner: StoredPartner) => {
    if (isInActiveTeam(partner.id)) {
      removeFromActiveTeam(partner.id);
    } else if (activeTeam.length < 3) {
      addToActiveTeam(partner.id);
    }
  };

  const renderPartnerCard = (partner: StoredPartner) => {
    const classData = PARTNER_CLASSES[partner.class];
    const inTeam = isInActiveTeam(partner.id);
    const isSelected = selectedPartner?.id === partner.id;
    
    return (
      <motion.div
        key={partner.id}
        layoutId={partner.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className="relative"
      >
        <Card 
          className={cn(
            "cursor-pointer transition-all overflow-hidden",
            "bg-gray-800/50 border-gray-700 hover:border-gray-600",
            inTeam && "border-cyan-500/50 shadow-cyan-500/20 shadow-lg",
            isSelected && "border-cyan-400 shadow-cyan-400/30 shadow-xl"
          )}
          onClick={() => setSelectedPartner(partner)}
        >
          {/* Rarity gradient background */}
          <div className={cn(
            "absolute inset-0 opacity-10 bg-gradient-to-br",
            RARITY_BACKGROUNDS[partner.rarity]
          )} />
          
          <CardHeader className="pb-2 relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  {partner.name}
                  {inTeam && (
                    <Badge variant="outline" className="text-xs border-cyan-400 text-cyan-400">
                      Active
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", RARITY_COLORS[partner.rarity])}
                  >
                    {partner.rarity}
                  </Badge>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded",
                    "bg-gray-700 text-gray-300"
                  )}>
                    {classData.name}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-400">Level</p>
                <p className="text-2xl font-bold">{partner.level}</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3 relative">
            {/* Stats overview */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-gray-300">Bond: {partner.bondLevel}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">
                  Energy: {partner.currentEnergy}/{partner.maxEnergy}
                </span>
              </div>
            </div>
            
            {/* Traits */}
            <div className="flex flex-wrap gap-1">
              {[partner.primaryTrait, partner.secondaryTrait, partner.tertiaryTrait]
                .filter(Boolean)
                .map((trait, index) => (
                  <Badge 
                    key={index}
                    variant="secondary" 
                    className="text-xs bg-purple-900/30 text-purple-300"
                  >
                    {trait && NEURODIVERGENT_TRAITS[trait].name}
                  </Badge>
                ))}
            </div>
            
            {/* Quick actions */}
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant={inTeam ? "secondary" : "default"}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleActiveTeam(partner);
                }}
                className="flex-1"
              >
                {inTeam ? 'Remove' : 'Add to Team'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPartner(partner);
                  setShowProgressionView(true);
                }}
              >
                <TrendingUp className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderPartnerDetails = () => {
    if (!selectedPartner) return null;
    
    const classData = PARTNER_CLASSES[selectedPartner.class];
    
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{selectedPartner.name}</CardTitle>
                <p className="text-gray-400 mt-1">
                  Level {selectedPartner.level} {classData.name}
                </p>
              </div>
              <Badge 
                variant="outline" 
                className={cn("text-sm", RARITY_COLORS[selectedPartner.rarity])}
              >
                {selectedPartner.rarity}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Biography */}
            {selectedPartner.biography && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Biography
                </h4>
                <p className="text-sm text-gray-400">{selectedPartner.biography}</p>
              </div>
            )}
            
            {/* Stats */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Combat Stats
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(selectedPartner.stats).map(([stat, value]) => (
                  <div key={stat} className="bg-gray-700/50 rounded p-2">
                    <p className="text-xs text-gray-400 capitalize">{stat}</p>
                    <p className="text-lg font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Abilities */}
            {selectedPartner.abilities && selectedPartner.abilities.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Abilities
                </h4>
                <div className="space-y-2">
                  {selectedPartner.abilities.map((ability, index) => (
                    <div key={index} className="bg-gray-700/50 rounded p-2 text-sm">
                      <p className="font-medium text-cyan-400">{ability}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Traits with mastery */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Neurodivergent Traits
              </h4>
              <div className="space-y-2">
                {[
                  { trait: selectedPartner.primaryTrait, label: 'Primary' },
                  { trait: selectedPartner.secondaryTrait, label: 'Secondary' },
                  { trait: selectedPartner.tertiaryTrait, label: 'Tertiary' }
                ].filter(({ trait }) => trait).map(({ trait, label }) => {
                  if (!trait) return null;
                  const traitData = NEURODIVERGENT_TRAITS[trait];
                  const mastery = selectedPartner.traitMastery[trait];
                  
                  return (
                    <div key={trait} className="bg-gray-700/50 rounded p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="font-medium">{traitData.name}</p>
                          <p className="text-xs text-gray-400">{label} Trait</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Lv.{mastery.level}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{traitData.description}</p>
                      {traitData.combatAbility && (
                        <p className="text-xs text-purple-400">
                          Combat: {traitData.combatAbility}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setShowProgressionView(true)}
                className="flex-1"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Progression
              </Button>
              <Button
                variant={isInActiveTeam(selectedPartner.id) ? "secondary" : "default"}
                onClick={() => handleToggleActiveTeam(selectedPartner)}
              >
                {isInActiveTeam(selectedPartner.id) ? 'Remove from Team' : 'Add to Team'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (showProgressionView && selectedPartner) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowProgressionView(false)}
          className="absolute top-4 right-4 z-10"
        >
          <X className="w-4 h-4 mr-2" />
          Back to Partners
        </Button>
        <CharacterProgression 
          partner={selectedPartner}
          onClose={() => setShowProgressionView(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Partner Management</h2>
        <p className="text-gray-400">
          Manage your team of {partnersList.length} neurodivergent delivery partners
        </p>
      </div>

      {/* Active Team Display */}
      <Card className="mb-6 bg-cyan-900/20 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-400">Active Team ({activeTeam.length}/3)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((slot) => {
              const partnerId = activeTeam[slot];
              const partner = partnerId ? partners[partnerId] : null;
              
              return (
                <div
                  key={slot}
                  className={cn(
                    "p-4 rounded-lg border-2 border-dashed text-center",
                    partner ? "border-cyan-500 bg-cyan-900/30" : "border-gray-600 bg-gray-800/30"
                  )}
                >
                  {partner ? (
                    <div>
                      <p className="font-semibold">{partner.name}</p>
                      <p className="text-sm text-gray-400">
                        Lv.{partner.level} {PARTNER_CLASSES[partner.class].name}
                      </p>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Empty Slot</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md"
          >
            <option value="all">All Classes</option>
            {Object.entries(PARTNER_CLASSES).map(([key, data]) => (
              <option key={key} value={key}>{data.name}</option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'level' | 'rarity' | 'bond')}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md"
          >
            <option value="level">Sort by Level</option>
            <option value="rarity">Sort by Rarity</option>
            <option value="bond">Sort by Bond</option>
          </select>
        </div>
      </div>

      {/* Partners Grid and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScrollArea className="h-[600px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredPartners.map(partner => renderPartnerCard(partner))}
              </AnimatePresence>
              
              {filteredPartners.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No partners found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div>
          {renderPartnerDetails()}
        </div>
      </div>
    </div>
  );
}