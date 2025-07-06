'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Zap, Shield, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PartnerCard } from '@/components/game/PartnerCard';
import { TraitIcon } from '@/components/game/TraitIcon';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { PARTNER_CLASSES } from '@/lib/game/classes';
import { NEURODIVERGENT_TRAITS } from '@/lib/game/traits';
import { cn } from '@/lib/utils';

export default function PartnersPage() {
  const { 
    partners, 
    activeTeam, 
    setActiveTeam, 
    selectedPartnerId,
    selectPartner,
    getPartnerById 
  } = usePartnerStore();
  
  const [filter, setFilter] = useState<'all' | 'active' | 'injured'>('all');
  
  const selectedPartner = selectedPartnerId ? getPartnerById(selectedPartnerId) : null;
  
  const filteredPartners = partners.filter(partner => {
    if (filter === 'active') return activeTeam.includes(partner.id);
    if (filter === 'injured') return partner.isInjured;
    return true;
  });
  
  const toggleTeamMember = (partnerId: string) => {
    if (activeTeam.includes(partnerId)) {
      setActiveTeam(activeTeam.filter(id => id !== partnerId));
    } else if (activeTeam.length < 3) {
      setActiveTeam([...activeTeam, partnerId]);
    }
  };
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Partner Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Build your team of neurodivergent partners
        </p>
        <div className="mt-4 flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            <Users className="w-3 h-3 mr-1" />
            {partners.length} Total Partners
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Shield className="w-3 h-3 mr-1" />
            {activeTeam.length}/3 Active Team
          </Badge>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Partner List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Partners</CardTitle>
              <CardDescription>
                Select partners to view details and manage your active team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="all" onClick={() => setFilter('all')}>
                    All ({partners.length})
                  </TabsTrigger>
                  <TabsTrigger value="active" onClick={() => setFilter('active')}>
                    Active ({activeTeam.length})
                  </TabsTrigger>
                  <TabsTrigger value="injured" onClick={() => setFilter('injured')}>
                    Injured ({partners.filter(p => p.isInjured).length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value={filter} className="space-y-0">
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredPartners.map((partner, index) => (
                      <motion.div
                        key={partner.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <PartnerCard
                          partner={partner}
                          onClick={() => selectPartner(partner.id)}
                          selected={selectedPartnerId === partner.id}
                          showDetails
                        />
                      </motion.div>
                    ))}
                  </div>
                  
                  {filteredPartners.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No partners found in this category
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Partner Details */}
        <div className="space-y-4">
          {selectedPartner ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{selectedPartner.name}</CardTitle>
                  <CardDescription>
                    Level {selectedPartner.level} {PARTNER_CLASSES[selectedPartner.class as keyof typeof PARTNER_CLASSES]?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Stats */}
                    <div>
                      <h4 className="font-medium mb-2">Stats</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedPartner.stats).map(([stat, value]) => (
                          <div key={stat} className="flex justify-between items-center">
                            <span className="text-sm capitalize">{stat}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary"
                                  style={{ width: `${Math.min(100, value)}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium w-8">{value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Traits */}
                    <div>
                      <h4 className="font-medium mb-2">Neurodivergent Traits</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TraitIcon trait={selectedPartner.primaryTrait as any} size="sm" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {NEURODIVERGENT_TRAITS[selectedPartner.primaryTrait as keyof typeof NEURODIVERGENT_TRAITS]?.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {NEURODIVERGENT_TRAITS[selectedPartner.primaryTrait as keyof typeof NEURODIVERGENT_TRAITS]?.description}
                            </div>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {selectedPartner.traitMastery?.[selectedPartner.primaryTrait] || 'Bronze'} Mastery
                            </Badge>
                          </div>
                        </div>
                        
                        {selectedPartner.secondaryTrait && (
                          <div className="flex items-center gap-2">
                            <TraitIcon trait={selectedPartner.secondaryTrait as any} size="sm" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {NEURODIVERGENT_TRAITS[selectedPartner.secondaryTrait as keyof typeof NEURODIVERGENT_TRAITS]?.name}
                              </div>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {selectedPartner.traitMastery?.[selectedPartner.secondaryTrait] || 'Bronze'} Mastery
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Backstory */}
                    {selectedPartner.personality?.backstory && (
                      <div>
                        <h4 className="font-medium mb-2">Backstory</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedPartner.personality.backstory}
                        </p>
                      </div>
                    )}
                    
                    {/* Team Management */}
                    <div className="pt-4 border-t">
                      <Button
                        className="w-full"
                        variant={activeTeam.includes(selectedPartner.id) ? "secondary" : "default"}
                        onClick={() => toggleTeamMember(selectedPartner.id)}
                        disabled={selectedPartner.isInjured}
                      >
                        {selectedPartner.isInjured 
                          ? 'Partner is Injured' 
                          : activeTeam.includes(selectedPartner.id)
                          ? 'Remove from Active Team'
                          : 'Add to Active Team'}
                      </Button>
                      
                      {selectedPartner.isInjured && selectedPartner.injuryRecoveryTime && (
                        <p className="text-xs text-center mt-2 text-muted-foreground">
                          Recovers in {Math.ceil((selectedPartner.injuryRecoveryTime - Date.now()) / 60000)} minutes
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Bond Level */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="w-5 h-5 text-red-500" />
                    Bond Level {selectedPartner.bondLevel || 0}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-pink-500"
                        style={{ width: `${(selectedPartner.bondLevel || 0) * 10}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Increase bond level by using this partner in missions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Select a partner to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}