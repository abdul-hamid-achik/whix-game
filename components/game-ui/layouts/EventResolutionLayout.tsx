'use client';

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { useUIStore, GameState } from '@/lib/stores/uiStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useGameStore } from '@/lib/stores/gameStore';
import { NeuraPanel, NeuraButton } from '@/components/neura';
import { Users, ArrowRight, CheckCircle, XCircle, Star } from 'lucide-react';
import { DiceRoller } from '../dice/DiceRoller';

interface EventResolutionLayoutProps {
  children: ReactNode;
}

export function EventResolutionLayout({ children: _children }: EventResolutionLayoutProps) {
  const { setState, contextData } = useUIStore();
  const { partners } = usePartnerStore();
  const { currentTips, level, earnTips } = useGameStore();
  
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [eventResult, setEventResult] = useState<'success' | 'failure' | null>(null);
  const [showDice, setShowDice] = useState(false);

  const activePartners = partners.slice(0, 3);
  const encounterData = contextData?.nodeData;
  const encounterType = contextData?.encounterType || 'social';

  const getPartnerStat = (partner: any, type: string): number => {
    switch (type) {
      case 'social': return Math.floor((partner.stats?.social || 50) / 10);
      case 'puzzle': return Math.floor((partner.stats?.logic || 50) / 10);
      case 'delivery': return Math.floor((partner.stats?.speed || 50) / 10);
      default: return Math.floor((partner.stats?.focus || 50) / 10);
    }
  };

  const getStatName = (type: string): string => {
    switch (type) {
      case 'social': return 'Social';
      case 'puzzle': return 'Logic';
      case 'delivery': return 'Speed';
      default: return 'Focus';
    }
  };

  const handlePartnerSelect = (partnerId: string) => {
    if (!eventResult) {
      setSelectedPartner(partnerId);
      setShowDice(true);
    }
  };

  const handleDiceResult = (result: any) => {
    const success = result.success;
    setEventResult(success ? 'success' : 'failure');
    
    if (success && encounterData?.rewards?.tips) {
      earnTips(encounterData.rewards.tips);
    }
  };

  const handleContinue = () => {
    setState(GameState.ADVENTURE_MAP, {
      ...contextData,
      eventResult: eventResult || undefined
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'social': return '💬';
      case 'puzzle': return '🧩';
      case 'story': return '📖';
      case 'delivery': return '📦';
      case 'rest': return '🛡️';
      case 'shop': return '🛒';
      default: return '❓';
    }
  };

  const selectedPartnerData = selectedPartner ? partners.find(p => p.id === selectedPartner) : null;
  const partnerBonus = selectedPartnerData ? {
    name: selectedPartnerData.name,
    bonus: getPartnerStat(selectedPartnerData, encounterType),
    stat: getStatName(encounterType)
  } : undefined;

  // Special handling for non-dice events
  const isNonDiceEvent = ['story', 'rest', 'shop'].includes(encounterType);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-purple-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{getEventIcon(encounterType)}</div>
            <div>
              <h1 className="text-xl font-bold text-purple-400 font-mono">
                EVENT RESOLUTION
              </h1>
              <p className="text-gray-400 text-sm">
                {encounterData?.title || 'Unknown Event'}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-yellow-400 font-mono">
              💰 {currentTips.toLocaleString()} TIPS
            </p>
            <p className="text-blue-400 text-sm">
              Level {level}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Event Description */}
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <NeuraPanel variant="primary">
              <div className="p-6">
                <h2 className="text-xl font-bold text-cyan-400 mb-4">
                  SITUATION BRIEFING
                </h2>
                
                <p className="text-gray-200 leading-relaxed mb-4">
                  {encounterData?.description || 
                  'A challenging situation has emerged during your delivery. Your team must work together to overcome this obstacle and continue the mission.'}
                </p>
                
                <div className="bg-gray-800/50 p-4 rounded border border-cyan-500/20">
                  <p className="text-cyan-400 text-sm font-medium mb-2">CHALLENGE TYPE: {encounterType.toUpperCase()}</p>
                  <p className="text-gray-300 text-sm">
                    {encounterType === 'social' && 'Requires strong communication and people skills.'}
                    {encounterType === 'puzzle' && 'Demands logical thinking and problem-solving abilities.'}
                    {encounterType === 'story' && 'A narrative moment that shapes your journey.'}
                    {encounterType === 'delivery' && 'Tests your speed and efficiency under pressure.'}
                    {encounterType === 'rest' && 'An opportunity to recover and prepare.'}
                    {encounterType === 'shop' && 'A chance to acquire new equipment and supplies.'}
                  </p>
                </div>
              </div>
            </NeuraPanel>

            {/* Dice Roller Section */}
            {!isNonDiceEvent && showDice && selectedPartner && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <NeuraPanel variant="secondary">
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-purple-400 mb-4 text-center">
                      RESOLUTION ROLL
                    </h3>
                    
                    <DiceRoller
                      numberOfDice={2}
                      difficulty={encounterData?.difficulty ? 8 + encounterData.difficulty : 10}
                      partnerBonus={partnerBonus}
                      onRoll={handleDiceResult}
                    />
                  </div>
                </NeuraPanel>
              </motion.div>
            )}

            {/* Result Display */}
            {eventResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <NeuraPanel variant={eventResult === 'success' ? 'primary' : 'secondary'}>
                  <div className="p-6 text-center">
                    <div className="mb-4">
                      {eventResult === 'success' ? (
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                      ) : (
                        <XCircle className="w-16 h-16 text-red-400 mx-auto" />
                      )}
                    </div>
                    
                    <h3 className={`text-2xl font-bold mb-2 ${
                      eventResult === 'success' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {eventResult === 'success' ? 'EVENT SUCCESS!' : 'EVENT FAILED'}
                    </h3>
                    
                    <p className="text-gray-300">
                      {eventResult === 'success' 
                        ? 'Your team successfully handled the situation!' 
                        : 'The situation didn\'t go as planned, but you gained valuable experience.'}
                    </p>
                    
                    {eventResult === 'success' && encounterData?.rewards?.tips && (
                      <div className="mt-4 text-yellow-400">
                        <Star className="w-5 h-5 inline mr-2" />
                        +{encounterData.rewards.tips} Tips earned!
                      </div>
                    )}
                  </div>
                </NeuraPanel>
              </motion.div>
            )}
          </div>
        </div>

        {/* Partner Selection */}
        <div className="w-80 bg-gray-900/80 backdrop-blur-sm border-l border-purple-500/30 p-4">
          <NeuraPanel variant="secondary">
            <div className="p-4">
              <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                {isNonDiceEvent ? 'ACTIVE SQUAD' : 'SELECT LEAD'}
              </h3>
              
              <div className="space-y-2">
                {activePartners.map(partner => {
                  const stat = getPartnerStat(partner, encounterType);
                  const isSelected = selectedPartner === partner.id;
                  
                  return (
                    <motion.div
                      key={partner.id}
                      className={`p-3 rounded border-2 transition-all ${
                        isNonDiceEvent
                          ? 'bg-gray-800/50 border-purple-500/20'
                          : isSelected 
                            ? 'border-purple-500 bg-purple-900/30' 
                            : 'border-gray-600 bg-gray-800/50 hover:border-purple-500/50 cursor-pointer'
                      } ${eventResult ? 'opacity-50' : ''}`}
                      onClick={() => !isNonDiceEvent && handlePartnerSelect(partner.id)}
                      whileHover={!isNonDiceEvent && !eventResult ? { scale: 1.02 } : {}}
                      whileTap={!isNonDiceEvent && !eventResult ? { scale: 0.98 } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {partner.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{partner.name}</p>
                          <p className="text-gray-400 text-sm">Level {partner.level} {partner.class}</p>
                        </div>
                      </div>
                      
                      {!isNonDiceEvent && (
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-gray-400">{getStatName(encounterType)}</span>
                          <span className="text-yellow-400 font-medium">+{stat}</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              
              {!isNonDiceEvent && !selectedPartner && !eventResult && (
                <p className="text-gray-500 text-sm text-center mt-4">
                  Select a partner to lead this challenge
                </p>
              )}
            </div>
          </NeuraPanel>

          <div className="mt-4">
            <NeuraButton
              variant="primary"
              className="w-full"
              onClick={handleContinue}
              disabled={!isNonDiceEvent && !eventResult}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue Journey
            </NeuraButton>
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-t border-purple-500/30 p-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>EVENT STATUS: {eventResult ? eventResult.toUpperCase() : 'ACTIVE'}</span>
          <span>NEXT: CONTINUE MISSION</span>
        </div>
      </div>
    </div>
  );
}