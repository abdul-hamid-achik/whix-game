'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useUIStore, GameState } from '@/lib/stores/uiStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Zap, 
  Heart,
  Shield,
  Brain,
  Eye,
  MessageCircle
} from 'lucide-react';

interface PartnerSelectionLayoutProps {
  children: ReactNode;
}

export function PartnerSelectionLayout({ children: _children }: PartnerSelectionLayoutProps) {
  const { partners, activeTeam, setActiveTeam, getPartnerById } = usePartnerStore();
  const { setState, contextData, goBack } = useUIStore();
  
  const [selectedPartners, setSelectedPartners] = useState<string[]>(activeTeam);
  const maxPartners = 3; // Maximum partners for a mission
  
  // Get mission context from UI store
  const missionType = contextData?.missionType || 'story';
  const difficulty = contextData?.difficulty || 'normal';
  const chapterTitle = contextData?.chapterTitle || 'Unknown Mission';
  
  // Filter available partners (not injured, have energy)
  const availablePartners = partners.filter(partner => 
    !partner.isInjured && partner.currentEnergy > 20
  );
  
  const togglePartnerSelection = (partnerId: string) => {
    setSelectedPartners(prev => {
      if (prev.includes(partnerId)) {
        return prev.filter(id => id !== partnerId);
      } else if (prev.length < maxPartners) {
        return [...prev, partnerId];
      }
      return prev;
    });
  };
  
  const startMission = () => {
    // Update active team
    setActiveTeam(selectedPartners);
    
    // Proceed to next state (adventure map or mission briefing)
    setState(GameState.ADVENTURE_MAP, {
      ...contextData,
      selectedPartners
    });
  };
  
  const getStatIcon = (stat: string) => {
    switch (stat) {
      case 'focus': return <Brain className="w-4 h-4 text-blue-400" />;
      case 'perception': return <Eye className="w-4 h-4 text-green-400" />;
      case 'social': return <MessageCircle className="w-4 h-4 text-purple-400" />;
      case 'logic': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'stamina': return <Shield className="w-4 h-4 text-red-400" />;
      default: return <Star className="w-4 h-4 text-gray-400" />;
    }
  };
  
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-green-400 border-green-500/30';
      case 'normal': return 'text-blue-400 border-blue-500/30';
      case 'hard': return 'text-orange-400 border-orange-500/30';
      case 'extreme': return 'text-red-400 border-red-500/30';
      default: return 'text-gray-400 border-gray-500/30';
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-cyan-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="text-cyan-400 hover:bg-cyan-500/10"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            
            <div>
              <h1 className="text-xl font-bold text-cyan-400 font-mono">
                PARTNER SELECTION
              </h1>
              <p className="text-gray-400 text-sm">
                Choose up to {maxPartners} partners for this mission
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-white font-semibold">{chapterTitle}</p>
            <Badge 
              variant="outline" 
              className={`text-xs capitalize ${getDifficultyColor(difficulty)}`}
            >
              {difficulty} {missionType}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-6">
          
          {/* Partner Selection Grid */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-900/60 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  AVAILABLE PARTNERS
                </CardTitle>
                <CardDescription>
                  Select partners who are ready for deployment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availablePartners.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No partners available for mission</p>
                    <p className="text-sm">Injured partners need time to recover</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {availablePartners.map((partner, index) => {
                      const isSelected = selectedPartners.includes(partner.id);
                      const canSelect = isSelected || selectedPartners.length < maxPartners;
                      
                      return (
                        <motion.div
                          key={partner.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card 
                            className={`cursor-pointer transition-all duration-200 ${
                              isSelected 
                                ? 'border-cyan-400 bg-cyan-500/10' 
                                : canSelect
                                ? 'border-gray-600 hover:border-cyan-500/50 hover:bg-cyan-500/5'
                                : 'border-gray-700 opacity-50'
                            }`}
                            onClick={() => canSelect && togglePartnerSelection(partner.id)}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-lg text-white">
                                    {partner.name}
                                  </CardTitle>
                                  <CardDescription className="capitalize">
                                    Level {partner.level} {partner.class}
                                  </CardDescription>
                                </div>
                                
                                {isSelected && (
                                  <Badge className="bg-cyan-500 text-white">
                                    Selected
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                            
                            <CardContent className="space-y-3">
                              {/* Energy Bar */}
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-400">Energy</span>
                                  <span className="text-white">{partner.currentEnergy}%</span>
                                </div>
                                <Progress 
                                  value={partner.currentEnergy} 
                                  className="h-2"
                                />
                              </div>
                              
                              {/* Primary Trait */}
                              <div className="flex items-center gap-2">
                                <Zap className="w-3 h-3 text-yellow-400" />
                                <span className="text-xs text-gray-300 capitalize">
                                  {partner.primaryTrait.replace('_', ' ')}
                                </span>
                              </div>
                              
                              {/* Top Stats */}
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                {Object.entries(partner.stats).slice(0, 3).map(([stat, value]) => (
                                  <div key={stat} className="flex items-center gap-1">
                                    {getStatIcon(stat)}
                                    <span className="text-gray-300">{value}</span>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Bond Level */}
                              <div className="flex items-center gap-2">
                                <Heart className="w-3 h-3 text-red-400" />
                                <span className="text-xs text-gray-300">
                                  Bond Level {partner.bondLevel || 0}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Mission Summary & Selected Partners */}
          <div className="space-y-4">
            {/* Mission Info */}
            <Card className="bg-gray-900/60 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400 text-lg">
                  MISSION BRIEFING
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Mission Type</p>
                  <p className="text-white font-semibold capitalize">{missionType}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Difficulty</p>
                  <Badge variant="outline" className={getDifficultyColor(difficulty)}>
                    {difficulty}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Team Size</p>
                  <p className="text-white font-semibold">
                    {selectedPartners.length}/{maxPartners} Partners
                  </p>
                  <Progress 
                    value={(selectedPartners.length / maxPartners) * 100} 
                    className="h-2 mt-1"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Selected Partners */}
            <Card className="bg-gray-900/60 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400 text-lg">
                  SELECTED TEAM
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="popLayout">
                  {selectedPartners.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No partners selected</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedPartners.map((partnerId, _index) => {
                        const partner = getPartnerById(partnerId);
                        if (!partner) return null;
                        
                        return (
                          <motion.div
                            key={partnerId}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {partner.name.charAt(0)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">
                                {partner.name}
                              </p>
                              <p className="text-gray-400 text-xs">
                                Lv.{partner.level} {partner.class}
                              </p>
                            </div>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => togglePartnerSelection(partnerId)}
                              className="text-gray-400 hover:text-white"
                            >
                              ×
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
            
            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={startMission}
                disabled={selectedPartners.length === 0}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                size="lg"
              >
                <ChevronRight className="w-4 h-4 mr-2" />
                {selectedPartners.length === 0 ? 'SELECT PARTNERS' : 'START MISSION'}
              </Button>
              
              <Button
                variant="outline"
                onClick={goBack}
                className="w-full border-gray-600 text-gray-400 hover:bg-gray-800"
              >
                Cancel Mission
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}