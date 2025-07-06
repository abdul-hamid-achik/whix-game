import React from 'react';
import { 
  Zap, Brain, Eye, Target, Search, RefreshCw, Waves,
  LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NeurodivergentTrait } from '@/lib/game/traits';

interface TraitIconProps {
  trait: NeurodivergentTrait;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

const traitIcons: Record<NeurodivergentTrait, LucideIcon> = {
  hyperfocus: Zap,
  pattern_recognition: Brain,
  enhanced_senses: Eye,
  systematic_thinking: Target,
  attention_to_detail: Search,
  routine_mastery: RefreshCw,
  sensory_processing: Waves,
};

const traitColors: Record<NeurodivergentTrait, string> = {
  hyperfocus: 'text-yellow-500',
  pattern_recognition: 'text-purple-500',
  enhanced_senses: 'text-blue-500',
  systematic_thinking: 'text-green-500',
  attention_to_detail: 'text-orange-500',
  routine_mastery: 'text-indigo-500',
  sensory_processing: 'text-cyan-500',
};

export function TraitIcon({ trait, size = 'md', className, showTooltip = false }: TraitIconProps) {
  const Icon = traitIcons[trait];
  const color = traitColors[trait];
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };
  
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <Icon className={cn(sizeClasses[size], color)} />
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
          {trait.replace(/_/g, ' ').split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </div>
      )}
    </div>
  );
}