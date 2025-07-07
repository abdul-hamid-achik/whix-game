'use client';

import { ReactNode, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUIStore, GameState } from '@/lib/stores/uiStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useGameStore } from '@/lib/stores/gameStore';
import { useStoryStore } from '@/lib/stores/storyStore';
import { NeuraPanel, NeuraButton } from '@/components/neura';
import { Users, ArrowRight, CheckCircle, XCircle, Star, TrendingUp, Heart } from 'lucide-react';
import { DiceRoller } from '../dice/DiceRoller';
import { 
  randomEventSystem, 
  RandomEvent, 
  EventChoice, 
  EventOutcome 
} from '@/lib/systems/random-event-system';
import { EventChoiceCard } from '../event/EventChoiceCard';
import { cn } from '@/lib/utils';

interface EventResolutionLayoutProps {
  children: ReactNode;
}

export function EventResolutionLayout({ children: _children }: EventResolutionLayoutProps) {
  const { setState, contextData } = useUIStore();
  const { getActivePartners } = usePartnerStore();
  const { currentTips, level, earnTips, gainExperience, currentChapter, adjustHumanity } = useGameStore();
  const { storyFlags, addFlag } = useStoryStore();
  
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<EventChoice | null>(null);
  const [_selectedPartner, _setSelectedPartner] = useState<string | null>(null);
  const [eventResult, setEventResult] = useState<'success' | 'failure' | null>(null);
  const [showDice, setShowDice] = useState(false);
  const [outcome, setOutcome] = useState<EventOutcome | null>(null);
  
  // Helper to check if choice is selected with proper type narrowing
  const isChoiceSelected = (choice: EventChoice): boolean => {
    if (!selectedChoice) return false;
    return selectedChoice.id === choice.id;
  };

  const activePartners = getActivePartners();
  
  // Generate random event on mount
  useEffect(() => {
    const generatedEvent = randomEventSystem.generateEvent({
      activePartners,
      chapter: currentChapter || 1,
      location: 'urban',
      timeOfDay: 'afternoon',
      weather: undefined,
      storyFlags: storyFlags || [],
      previousEventId: undefined,
    });
    
    if (generatedEvent) {
      setCurrentEvent(generatedEvent);
    }
  }, [activePartners, currentChapter, storyFlags]);

  // Removed unused functions - getPartnerStat and getStatName

  const handleChoiceSelect = (choice: EventChoice) => {
    if (!eventResult && canSelectChoice(choice)) {
      setSelectedChoice(choice);
      if (choice.rollDifficulty) {
        setShowDice(true);
      } else {
        // Auto-success for choices without rolls
        handleEventOutcome(choice.outcomes.success);
      }
    }
  };

  const canSelectChoice = (choice: EventChoice): boolean => {
    if (!choice.requirements) return true;
    
    const req = choice.requirements;
    
    // Check trait requirements
    if (req.trait) {
      const hasTrait = activePartners.some(p => 
        p.primaryTrait === req.trait ||
        p.secondaryTrait === req.trait ||
        p.tertiaryTrait === req.trait
      );
      if (!hasTrait) return false;
    }
    
    // Check class requirements
    if (req.class) {
      const hasClass = activePartners.some(p => p.class === req.class);
      if (!hasClass) return false;
    }
    
    // Check level requirements
    if (req.minLevel && level < req.minLevel) return false;
    
    // Check tips requirements
    if (req.minTips && currentTips < req.minTips) return false;
    
    // Check story flags
    if (req.storyFlag && !storyFlags?.includes(req.storyFlag)) return false;
    
    return true;
  };

  const handleDiceResult = (result: { success: boolean; total: number; rolls: number[] }) => {
    const success = result.success;
    setEventResult(success ? 'success' : 'failure');
    
    if (selectedChoice) {
      const outcomeToUse = success 
        ? selectedChoice.outcomes.success 
        : selectedChoice.outcomes.failure || selectedChoice.outcomes.success;
      
      handleEventOutcome(outcomeToUse);
    }
  };

  const handleEventOutcome = (eventOutcome: EventOutcome) => {
    setOutcome(eventOutcome);
    
    // Apply effects
    const effects = eventOutcome.effects;
    
    if (effects.tips) {
      earnTips(effects.tips);
    }
    
    if (effects.experience) {
      gainExperience(effects.experience);
    }
    
    if (effects.humanityIndex) {
      adjustHumanity(effects.humanityIndex);
    }
    
    if (effects.partnerMorale) {
      // TODO: Update partner morale when system is ready
    }
    
    if (effects.unlockStoryFlag) {
      addFlag(effects.unlockStoryFlag);
    }
    
    if (effects.triggerCombat) {
      // Transition to combat after a delay
      setTimeout(() => {
        setState(GameState.TACTICAL_COMBAT, contextData);
      }, 2000);
    }
    
    if (effects.triggerNextEvent) {
      // TODO: Chain to next event
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
      case 'encounter': return '👥';
      case 'discovery': return '🔍';
      case 'crisis': return '⚠️';
      case 'opportunity': return '✨';
      case 'environmental': return '🌧️';
      case 'corporate': return '🏢';
      case 'technical': return '💻';
      case 'moral': return '⚖️';
      default: return '❓';
    }
  };

  // Find the partner with the required trait/class for the selected choice
  const getRelevantPartner = () => {
    if (!selectedChoice?.requirements) return activePartners[0];
    
    const req = selectedChoice.requirements;
    
    if (req.trait) {
      return activePartners.find(p => 
        p.primaryTrait === req.trait ||
        p.secondaryTrait === req.trait ||
        p.tertiaryTrait === req.trait
      ) || activePartners[0];
    }
    
    if (req.class) {
      return activePartners.find(p => p.class === req.class) || activePartners[0];
    }
    
    return activePartners[0];
  };
  
  const relevantPartner = getRelevantPartner();
  const partnerBonus = relevantPartner && selectedChoice ? {
    name: relevantPartner.name,
    bonus: Math.floor((relevantPartner.level || 1) / 2) + 2, // Simple bonus calculation
    stat: 'Skill'
  } : undefined;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-purple-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{getEventIcon(currentEvent?.type || 'encounter')}</div>
            <div>
              <h1 className="text-xl font-bold text-purple-400 font-mono">
                EVENT RESOLUTION
              </h1>
              <p className="text-gray-400 text-sm">
                {currentEvent?.title || 'Unknown Event'}
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
                  {currentEvent?.description || 
                  'A challenging situation has emerged during your delivery. Your team must work together to overcome this obstacle and continue the mission.'}
                </p>
                
                {currentEvent && (
                  <div className="bg-gray-800/50 p-4 rounded border border-cyan-500/20">
                    <p className="text-cyan-400 text-sm font-medium mb-2">
                      EVENT TYPE: {currentEvent.type.toUpperCase().replace(/_/g, ' ')}
                    </p>
                    <p className="text-gray-300 text-sm">
                      Rarity: <span className={cn(
                        "font-medium",
                        currentEvent.rarity === 'legendary' && "text-orange-400",
                        currentEvent.rarity === 'epic' && "text-purple-400",
                        currentEvent.rarity === 'rare' && "text-blue-400",
                        currentEvent.rarity === 'uncommon' && "text-green-400",
                        currentEvent.rarity === 'common' && "text-gray-400"
                      )}>{currentEvent.rarity}</span>
                    </p>
                  </div>
                )}
              </div>
            </NeuraPanel>

            {/* Event Choices */}
            {currentEvent && !selectedChoice && !eventResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <NeuraPanel variant="secondary">
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-purple-400 mb-4">
                      AVAILABLE ACTIONS
                    </h3>
                    
                    <div className="space-y-3">
                      {currentEvent.choices.map((choice) => (
                        <EventChoiceCard
                          key={choice.id}
                          choice={choice}
                          canSelect={canSelectChoice(choice)}
                          isSelected={isChoiceSelected(choice)}
                          onSelect={handleChoiceSelect}
                          disabled={!!eventResult}
                        />
                      ))}
                    </div>
                  </div>
                </NeuraPanel>
              </motion.div>
            )}

            {/* Dice Roller Section */}
            {selectedChoice && showDice && selectedChoice.rollDifficulty && (
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
                      difficulty={selectedChoice.rollDifficulty}
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
                    
                    <p className="text-gray-300 mb-4">
                      {outcome?.description || 
                        (eventResult === 'success' 
                          ? 'Your team successfully handled the situation!' 
                          : 'The situation didn\'t go as planned, but you gained valuable experience.')}
                    </p>
                    
                    {/* Display rewards */}
                    {outcome?.effects && (
                      <div className="space-y-2">
                        {outcome.effects.tips && (
                          <div className="text-yellow-400">
                            <Star className="w-5 h-5 inline mr-2" />
                            {outcome.effects.tips > 0 ? '+' : ''}{outcome.effects.tips} Tips
                          </div>
                        )}
                        {outcome.effects.experience && (
                          <div className="text-blue-400">
                            <TrendingUp className="w-5 h-5 inline mr-2" />
                            +{outcome.effects.experience} Experience
                          </div>
                        )}
                        {outcome.effects.humanityIndex && (
                          <div className={outcome.effects.humanityIndex > 0 ? 'text-green-400' : 'text-red-400'}>
                            <Heart className="w-5 h-5 inline mr-2" />
                            {outcome.effects.humanityIndex > 0 ? '+' : ''}{outcome.effects.humanityIndex} Humanity
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </NeuraPanel>
              </motion.div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 bg-gray-900/80 backdrop-blur-sm border-l border-purple-500/30 p-4">
          <NeuraPanel variant="secondary">
            <div className="p-4">
              <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                ACTIVE SQUAD
              </h3>
              
              <div className="space-y-2">
                {activePartners.map(partner => (
                  <motion.div
                    key={partner.id}
                    className="p-3 rounded border-2 bg-gray-800/50 border-purple-500/20"
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
                    
                    {/* Show relevant traits */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {[partner.primaryTrait, partner.secondaryTrait, partner.tertiaryTrait]
                        .filter(Boolean)
                        .map((trait, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-purple-900/30 text-purple-300 rounded">
                            {trait?.replace(/_/g, ' ')}
                          </span>
                        ))
                      }
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </NeuraPanel>

          <div className="mt-4">
            <NeuraButton
              variant="primary"
              className="w-full"
              onClick={handleContinue}
              disabled={!eventResult}
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