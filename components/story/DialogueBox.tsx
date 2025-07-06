import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DialogueNode, DialogueChoice } from '@/lib/game/story/dialogueSystem';
import { TraitIcon } from '../game/TraitIcon';

interface DialogueBoxProps {
  dialogue: DialogueNode;
  onChoice: (choice: DialogueChoice) => void;
  onNext: () => void;
  canMakeChoice?: (choice: DialogueChoice) => boolean;
}

export function DialogueBox({ dialogue, onChoice, onNext, canMakeChoice }: DialogueBoxProps) {
  const hasChoices = dialogue.choices && dialogue.choices.length > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="bg-gray-900/95 border-gray-700 shadow-2xl">
        <div className="p-6">
          {/* Speaker Name */}
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-primary">
              {dialogue.speaker === 'narrator' ? '' : dialogue.speaker.charAt(0).toUpperCase() + dialogue.speaker.slice(1)}
            </h3>
          </div>
          
          {/* Dialogue Text */}
          <motion.div
            key={dialogue.text}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <p className={cn(
              "text-lg leading-relaxed",
              dialogue.speaker === 'narrator' && "italic text-gray-400"
            )}>
              {dialogue.text}
            </p>
          </motion.div>
          
          {/* Choices or Continue Button */}
          {hasChoices ? (
            <div className="space-y-2">
              {dialogue.choices!.map((choice, index) => {
                const isAvailable = !canMakeChoice || canMakeChoice(choice);
                const hasTrait = choice.requirement?.trait;
                
                return (
                  <motion.div
                    key={choice.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      onClick={() => isAvailable && onChoice(choice)}
                      disabled={!isAvailable}
                      variant={hasTrait ? "outline" : "ghost"}
                      className={cn(
                        "w-full justify-start text-left h-auto py-3 px-4",
                        hasTrait && isAvailable && "border-primary/50 hover:border-primary"
                      )}
                    >
                      <div className="flex items-start gap-3 w-full">
                        {hasTrait && (
                          <div className="mt-0.5">
                            <TraitIcon trait={hasTrait} size="sm" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{choice.text}</div>
                          {choice.traitContext && isAvailable && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {choice.traitContext}
                            </div>
                          )}
                          {!isAvailable && choice.requirement && (
                            <div className="text-xs text-red-400 mt-1">
                              Requires: {choice.requirement.trait || 
                                `${choice.requirement.stat} ${choice.requirement.minValue}+`}
                            </div>
                          )}
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Button 
              onClick={onNext}
              variant="ghost"
              className="w-full justify-between"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}