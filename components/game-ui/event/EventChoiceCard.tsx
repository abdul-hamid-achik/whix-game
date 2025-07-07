'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NeuraButton } from '@/components/neura';
import { 
  Lock, 
  Coins, 
  TrendingUp, 
  Package, 
  Flag,
  Dice6,
  Check
} from 'lucide-react';
import type { EventChoice } from '@/lib/systems/random-event-system';

// Props type
interface EventChoiceCardProps {
  choice: EventChoice;
  canSelect: boolean;
  isSelected: boolean;
  onSelect: (choice: EventChoice) => void;
  partnerName?: string;
  disabled?: boolean;
}

export function EventChoiceCard({ 
  choice, 
  canSelect, 
  isSelected, 
  onSelect, 
  partnerName,
  disabled = false 
}: EventChoiceCardProps) {
  const renderRequirements = () => {
    if (!choice.requirements) return null;
    
    const req = choice.requirements;
    const requirements = [];
    
    if (req.trait) {
      requirements.push(
        <div key="trait" className="flex items-center gap-1 text-xs">
          <div className="w-2 h-2 rounded-full bg-purple-400" />
          <span>Requires {req.trait.replace(/_/g, ' ')}</span>
        </div>
      );
    }
    
    if (req.class) {
      requirements.push(
        <div key="class" className="flex items-center gap-1 text-xs">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span>Requires {req.class}</span>
        </div>
      );
    }
    
    if (req.minLevel) {
      requirements.push(
        <div key="level" className="flex items-center gap-1 text-xs">
          <TrendingUp className="w-3 h-3" />
          <span>Level {req.minLevel}+</span>
        </div>
      );
    }
    
    if (req.minTips) {
      requirements.push(
        <div key="tips" className="flex items-center gap-1 text-xs">
          <Coins className="w-3 h-3" />
          <span>{req.minTips} Tips</span>
        </div>
      );
    }
    
    if (req.hasItem) {
      requirements.push(
        <div key="item" className="flex items-center gap-1 text-xs">
          <Package className="w-3 h-3" />
          <span>Requires {req.hasItem}</span>
        </div>
      );
    }
    
    if (req.storyFlag) {
      requirements.push(
        <div key="story" className="flex items-center gap-1 text-xs">
          <Flag className="w-3 h-3" />
          <span>Story requirement</span>
        </div>
      );
    }
    
    return (
      <div className={cn(
        "flex flex-wrap gap-2 mt-2",
        canSelect ? "text-gray-400" : "text-red-400"
      )}>
        {requirements}
      </div>
    );
  };
  
  const renderDifficulty = () => {
    if (!choice.rollDifficulty) return null;
    
    const difficultyColor = 
      choice.rollDifficulty <= 8 ? 'text-green-400' :
      choice.rollDifficulty <= 12 ? 'text-yellow-400' :
      choice.rollDifficulty <= 16 ? 'text-orange-400' :
      'text-red-400';
    
    return (
      <div className={cn("flex items-center gap-1 text-sm", difficultyColor)}>
        <Dice6 className="w-4 h-4" />
        <span>DC {choice.rollDifficulty}</span>
      </div>
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative",
        choice.isHidden && !canSelect && "opacity-50"
      )}
    >
      <NeuraButton
        variant={isSelected ? "primary" : "secondary"}
        className={cn(
          "w-full text-left p-4 h-auto",
          !canSelect && "opacity-50 cursor-not-allowed",
          isSelected && "ring-2 ring-cyan-400"
        )}
        onClick={() => canSelect && !disabled && onSelect(choice)}
        disabled={!canSelect || disabled}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <p className="font-medium pr-4">
              {partnerName && `[${partnerName}] `}
              {choice.text}
            </p>
            {!canSelect && <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />}
            {isSelected && <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
          </div>
          
          <div className="flex items-center justify-between">
            {renderDifficulty()}
            {renderRequirements()}
          </div>
        </div>
      </NeuraButton>
    </motion.div>
  );
}