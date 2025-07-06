import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CharacterPortraitProps {
  character: string;
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'thinking';
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

const characterColors: Record<string, string> = {
  miguel: 'from-blue-500 to-cyan-500',
  tania: 'from-purple-500 to-pink-500',
  kai: 'from-green-500 to-emerald-500',
  whix_manager: 'from-gray-500 to-gray-700',
  default: 'from-gray-400 to-gray-600',
};

const emotionExpressions: Record<string, string> = {
  neutral: '😐',
  happy: '😊',
  sad: '😢',
  angry: '😠',
  surprised: '😮',
  thinking: '🤔',
};

export function CharacterPortrait({ 
  character, 
  emotion = 'neutral', 
  side = 'left',
  size = 'md' 
}: CharacterPortraitProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };
  
  const gradient = characterColors[character] || characterColors.default;
  const expression = emotionExpressions[emotion];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cn(
        "relative",
        side === 'left' ? 'mr-4' : 'ml-4'
      )}
    >
      <div className={cn(
        "rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg",
        sizeClasses[size],
        gradient
      )}>
        <div className="text-white font-bold text-2xl">
          {character.charAt(0).toUpperCase()}
        </div>
      </div>
      
      {/* Emotion indicator */}
      <motion.div
        key={emotion}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 text-xl shadow-md"
      >
        {expression}
      </motion.div>
    </motion.div>
  );
}