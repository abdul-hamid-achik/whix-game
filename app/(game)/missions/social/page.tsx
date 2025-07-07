'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Heart, Brain, ChevronRight 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useGameStore } from '@/lib/stores/gameStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useChapterMapStore } from '@/lib/stores/chapterMapStore';
import { cn } from '@/lib/utils';

// Social encounter types
type EncounterType = 'negotiation' | 'complaint' | 'harassment' | 'inspection';

interface DialogOption {
  id: string;
  text: string;
  traitRequired?: string;
  statRequired?: { stat: string; value: number };
  effect: {
    stress?: number;
    reputation?: number;
    tips?: number;
    humanity?: number;
  };
  response: string;
}

interface SocialEncounter {
  id: string;
  type: EncounterType;
  character: {
    name: string;
    role: string;
    mood: 'angry' | 'neutral' | 'suspicious' | 'demanding';
  };
  situation: string;
  initialDialogue: string;
  dialogOptions: DialogOption[];
  successThreshold: number;
}

// Generate social encounters
const generateSocialEncounter = (_chapter: number): SocialEncounter => {
  const encounters: SocialEncounter[] = [
    {
      id: 'angry-customer-1',
      type: 'complaint',
      character: {
        name: 'Mrs. Rodriguez',
        role: 'Customer',
        mood: 'angry'
      },
      situation: 'Food arrived cold after a long delay',
      initialDialogue: "This is unacceptable! I've been waiting for over an hour and the food is ice cold! What kind of service is this?",
      dialogOptions: [
        {
          id: 'apologize',
          text: "I'm truly sorry about the delay. Let me see what I can do to make this right.",
          effect: { stress: 10, reputation: 5, tips: 20 },
          response: "Well... at least you're being professional about it. Here's a small tip."
        },
        {
          id: 'blame-restaurant',
          text: "The restaurant gave me the order late. It's not my fault.",
          effect: { stress: 5, reputation: -10, tips: 0 },
          response: "I don't care whose fault it is! You're all part of the same terrible system!"
        },
        {
          id: 'empathize',
          text: "I understand your frustration. This job is hard on all of us in this economy.",
          traitRequired: 'enhanced_senses',
          effect: { stress: 5, reputation: 10, tips: 30, humanity: 5 },
          response: "Oh... I suppose you're just trying to make a living too. Here, take this."
        },
        {
          id: 'document',
          text: "I'm recording this interaction for my protection. Please state your complaint clearly.",
          effect: { stress: 0, reputation: -5, tips: 5 },
          response: "Recording? Fine! Just take your tip and leave!"
        }
      ],
      successThreshold: 15
    },
    {
      id: 'karen-encounter',
      type: 'harassment',
      character: {
        name: 'Karen Wellington',
        role: 'Bourgeois Resident',
        mood: 'demanding'
      },
      situation: 'Demanding you use the service entrance',
      initialDialogue: "Excuse me! Delivery personnel are NOT allowed to use the main entrance! Don't you know the rules?",
      dialogOptions: [
        {
          id: 'comply',
          text: "I'll use the service entrance, ma'am.",
          effect: { stress: 15, reputation: 0, tips: 10, humanity: -5 },
          response: "Good. Know your place."
        },
        {
          id: 'explain',
          text: "The service entrance is locked. I called ahead as instructed.",
          statRequired: { stat: 'logic', value: 70 },
          effect: { stress: 5, reputation: 5, tips: 15 },
          response: "I... well, I suppose that's acceptable. Just this once."
        },
        {
          id: 'stand-ground',
          text: "I'm a person doing my job. I'll use whatever entrance is available.",
          effect: { stress: 20, reputation: -10, tips: 0, humanity: 10 },
          response: "How DARE you! I'm calling your company!"
        },
        {
          id: 'pattern-notice',
          text: "I notice you order from us three times a week. We always use this entrance.",
          traitRequired: 'pattern_recognition',
          effect: { stress: 0, reputation: 15, tips: 25 },
          response: "I... that's... fine, just hurry up!"
        }
      ],
      successThreshold: 20
    }
  ];
  
  return encounters[Math.floor(Math.random() * encounters.length)];
};

export default function SocialMissionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { earnTips, gainExperience, adjustHumanity } = useGameStore();
  const { getActivePartners } = usePartnerStore();
  const { completeNode } = useChapterMapStore();
  
  const isStorySocial = searchParams.get('story') === 'true';
  const nodeId = searchParams.get('nodeId');
  
  const [encounter, setEncounter] = useState<SocialEncounter | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [stress, setStress] = useState(0);
  const [reputation, setReputation] = useState(50);
  const [phase, setPhase] = useState<'intro' | 'dialogue' | 'outcome'>('intro');
  const [outcome, setOutcome] = useState<{ success: boolean; message: string } | null>(null);
  
  const activePartner = getActivePartners()[0];
  
  useEffect(() => {
    // Generate encounter based on chapter
    const newEncounter = generateSocialEncounter(1);
    setEncounter(newEncounter);
  }, []);
  
  const canSelectOption = (option: DialogOption): boolean => {
    if (option.traitRequired && activePartner?.primaryTrait !== option.traitRequired && activePartner?.secondaryTrait !== option.traitRequired) {
      return false;
    }
    
    if (option.statRequired) {
      const partnerStat = activePartner?.stats[option.statRequired.stat as keyof typeof activePartner.stats] || 0;
      return partnerStat >= option.statRequired.value;
    }
    
    return true;
  };
  
  const handleDialogueChoice = () => {
    if (!encounter || !selectedOption) return;
    
    const option = encounter.dialogOptions.find(o => o.id === selectedOption);
    if (!option) return;
    
    // Apply effects
    if (option.effect.stress) setStress(prev => Math.min(100, prev + option.effect.stress!));
    if (option.effect.reputation) setReputation(prev => Math.max(0, Math.min(100, prev + option.effect.reputation!)));
    if (option.effect.tips) earnTips(option.effect.tips!);
    if (option.effect.humanity) adjustHumanity(option.effect.humanity!);
    
    // Calculate success
    const totalScore = reputation + (100 - stress);
    const success = totalScore >= encounter.successThreshold * 10;
    
    setOutcome({
      success,
      message: option.response
    });
    
    setPhase('outcome');
    
    // Give rewards
    if (success) {
      gainExperience(30);
      earnTips(50);
    } else {
      gainExperience(10);
    }
  };
  
  const handleComplete = () => {
    if (isStorySocial && nodeId) {
      completeNode(nodeId);
    }
    router.push(isStorySocial ? '/story/map' : '/missions');
  };
  
  if (!encounter) return null;
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Social Encounter</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Navigate this tense interaction carefully
        </p>
      </div>
      
      {/* Status bars */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Stress Level
                </span>
                <span className="text-sm font-mono">{stress}%</span>
              </div>
              <Progress value={stress} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Reputation
                </span>
                <span className="text-sm font-mono">{reputation}%</span>
              </div>
              <Progress value={reputation} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main encounter card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{encounter.character.name}</CardTitle>
              <CardDescription>{encounter.character.role}</CardDescription>
            </div>
            <Badge className={cn(
              encounter.character.mood === 'angry' && 'bg-red-600',
              encounter.character.mood === 'suspicious' && 'bg-yellow-600',
              encounter.character.mood === 'demanding' && 'bg-purple-600',
              encounter.character.mood === 'neutral' && 'bg-gray-600'
            )}>
              {encounter.character.mood}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {phase === 'intro' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Situation:</p>
                  <p>{encounter.situation}</p>
                </div>
                
                <Button onClick={() => setPhase('dialogue')} className="w-full">
                  Begin Interaction
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
            
            {phase === 'dialogue' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="font-medium flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4" />
                    {encounter.character.name}:
                  </p>
                  <p className="italic">"{encounter.initialDialogue}"</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Your response:</p>
                  <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                    {encounter.dialogOptions.map(option => {
                      const canSelect = canSelectOption(option);
                      return (
                        <Label
                          key={option.id}
                          htmlFor={option.id}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                            canSelect 
                              ? "hover:bg-gray-50 dark:hover:bg-gray-800" 
                              : "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <RadioGroupItem 
                            value={option.id} 
                            id={option.id}
                            disabled={!canSelect}
                          />
                          <div className="flex-1">
                            <p className="text-sm">{option.text}</p>
                            {option.traitRequired && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                Requires: {option.traitRequired}
                              </Badge>
                            )}
                            {option.statRequired && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                Requires: {option.statRequired.stat} {option.statRequired.value}+
                              </Badge>
                            )}
                          </div>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>
                
                <Button 
                  onClick={handleDialogueChoice}
                  disabled={!selectedOption}
                  className="w-full"
                >
                  Respond
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
            
            {phase === 'outcome' && outcome && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className={cn(
                  "p-4 rounded-lg border",
                  outcome.success 
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                )}>
                  <p className="font-medium flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4" />
                    {encounter.character.name}:
                  </p>
                  <p className="italic">"{outcome.message}"</p>
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className={cn(
                    "text-2xl font-bold",
                    outcome.success ? "text-green-600" : "text-yellow-600"
                  )}>
                    {outcome.success ? 'Success!' : 'Partial Success'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {outcome.success 
                      ? 'You handled that interaction well!'
                      : 'You survived the encounter, but it could have gone better.'}
                  </p>
                  
                  <div className="flex justify-center gap-4 pt-4">
                    <Badge variant="secondary">
                      +{outcome.success ? 30 : 10} XP
                    </Badge>
                    {outcome.success && (
                      <Badge variant="secondary">
                        +50 tips bonus
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button onClick={handleComplete} className="w-full">
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      
      {/* Partner info */}
      {activePartner && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Partner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{activePartner.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{activePartner.class}</p>
              </div>
              <div className="flex gap-2">
                {[activePartner.primaryTrait, activePartner.secondaryTrait].filter(Boolean).map(trait => (
                  <Badge key={trait} variant="outline" className="text-xs">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}