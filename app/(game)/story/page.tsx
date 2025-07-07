'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Book, Lock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogueBox } from '@/components/story/DialogueBox';
import { CharacterPortrait } from '@/components/story/CharacterPortrait';
import { useGameStore } from '@/lib/stores/gameStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { 
  CHAPTER_1, 
  DialogueNode, 
  DialogueChoice,
  StoryChapter 
} from '@/lib/game/story/dialogueSystem';
import { cn } from '@/lib/utils';

export default function StoryPage() {
  const { unlockedChapters, saveStoryChoice } = useGameStore();
  const { getActivePartners } = usePartnerStore();
  
  const [selectedChapter, setSelectedChapter] = useState<StoryChapter | null>(null);
  const [currentDialogue, setCurrentDialogue] = useState<DialogueNode | null>(null);
  const [relationships, setRelationships] = useState<Record<string, number>>({});
  const [storyFlags, setStoryFlags] = useState<string[]>([]);
  
  const chapters = [CHAPTER_1]; // Add more chapters as they're created
  
  const startChapter = (chapter: StoryChapter) => {
    setSelectedChapter(chapter);
    const startNode = chapter.dialogues.find(d => d.id === chapter.startDialogue);
    setCurrentDialogue(startNode || null);
  };
  
  const canMakeChoice = (choice: DialogueChoice): boolean => {
    if (!choice.requirement) return true;
    
    const partners = getActivePartners();
    
    // Check trait requirement
    if (choice.requirement?.trait) {
      const hasTrait = partners.some(p => 
        p.primaryTrait === choice.requirement?.trait ||
        p.secondaryTrait === choice.requirement?.trait
      );
      if (!hasTrait) return false;
    }
    
    // Check stat requirement
    if (choice.requirement?.stat && choice.requirement?.minValue) {
      const hasStatValue = partners.some(p => 
        p.stats[choice.requirement!.stat as keyof typeof p.stats] >= choice.requirement!.minValue!
      );
      if (!hasStatValue) return false;
    }
    
    // Check previous choice requirement
    if (choice.requirement?.previousChoice) {
      // This would check against saved story choices
      return false; // Simplified for now
    }
    
    return true;
  };
  
  const handleChoice = (choice: DialogueChoice) => {
    // Save the choice
    saveStoryChoice(currentDialogue!.id, choice.id);
    
    // Apply outcomes
    if (choice.outcome.relationship) {
      setRelationships(prev => {
        const updated = { ...prev };
        Object.entries(choice.outcome.relationship!).forEach(([character, change]) => {
          updated[character] = (updated[character] || 0) + change;
        });
        return updated;
      });
    }
    
    if (choice.outcome.flags) {
      setStoryFlags(prev => [...prev, ...choice.outcome.flags!]);
    }
    
    // TODO: Handle rewards (tips, experience, items)
    
    // Move to next dialogue
    const nextNode = selectedChapter?.dialogues.find(d => d.id === choice.outcome.nextDialogue);
    setCurrentDialogue(nextNode || null);
  };
  
  const handleNext = () => {
    if (!currentDialogue || !selectedChapter) return;
    
    if (currentDialogue.isEnd) {
      // Chapter complete
      setSelectedChapter(null);
      setCurrentDialogue(null);
      return;
    }
    
    const nextNode = selectedChapter.dialogues.find(d => d.id === currentDialogue.nextId);
    setCurrentDialogue(nextNode || null);
  };
  
  const getCurrentSpeaker = () => {
    if (!currentDialogue || currentDialogue.speaker === 'narrator') return null;
    return selectedChapter?.characters.find(c => c.id === currentDialogue.speaker);
  };
  
  if (!selectedChapter) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Story Mode
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Experience the narrative of resistance in Neo Prosperity
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter, index) => {
            const isUnlocked = unlockedChapters.includes(index + 1);
            
            return (
              <Card 
                key={chapter.id}
                className={cn(
                  "cursor-pointer transition-all",
                  isUnlocked ? "hover:shadow-lg" : "opacity-50 cursor-not-allowed"
                )}
                onClick={() => isUnlocked && startChapter(chapter)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Book className="w-5 h-5" />
                      Chapter {index + 1}
                    </span>
                    {!isUnlocked && <Lock className="w-4 h-4" />}
                  </CardTitle>
                  <CardDescription>{chapter.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {chapter.description}
                  </p>
                  {isUnlocked && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <Star className="w-3 h-3" />
                      <span>Ready to play</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Relationship Status */}
        {Object.keys(relationships).length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(relationships).map(([character, value]) => (
                  <div key={character} className="text-center">
                    <div className="font-medium capitalize">{character}</div>
                    <div className="text-2xl font-bold text-primary">{value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
  
  // Story view
  const speaker = getCurrentSpeaker();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col">
      {/* Chapter Title */}
      <div className="text-center py-4 border-b border-gray-800">
        <h2 className="text-xl font-semibold text-gray-400">{selectedChapter.title}</h2>
      </div>
      
      {/* Story Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl">
          <AnimatePresence mode="wait">
            {currentDialogue && (
              <div className="flex items-start gap-4">
                {/* Character Portrait */}
                {speaker && (
                  <CharacterPortrait 
                    character={speaker.id}
                    emotion={currentDialogue.emotion}
                    side="left"
                  />
                )}
                
                {/* Dialogue Box */}
                <div className="flex-1">
                  <DialogueBox
                    dialogue={currentDialogue}
                    onChoice={handleChoice}
                    onNext={handleNext}
                    canMakeChoice={canMakeChoice}
                  />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Skip/Menu Options */}
      <div className="p-4 border-t border-gray-800 flex justify-between">
        <Button 
          variant="ghost" 
          onClick={() => {
            setSelectedChapter(null);
            setCurrentDialogue(null);
          }}
        >
          Exit Story
        </Button>
        <div className="text-sm text-gray-500">
          {storyFlags.length > 0 && (
            <span>Flags: {storyFlags.join(', ')}</span>
          )}
        </div>
      </div>
    </div>
  );
}