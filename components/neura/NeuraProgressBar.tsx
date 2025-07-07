'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeuraProgressBarProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  label?: string;
  showValue?: boolean;
  animated?: boolean;
  segments?: number;
}

export function NeuraProgressBar({ 
  value, 
  max = 100,
  className, 
  variant = 'primary',
  label,
  showValue = true,
  animated = true,
  segments = 10
}: NeuraProgressBarProps) {
  const percentage = Math.min(Math.max(value / max * 100, 0), 100);
  
  const variantStyles = {
    primary: {
      bg: 'bg-cyan-500',
      glow: 'shadow-cyan-500/50',
      border: 'border-cyan-500/50',
    },
    secondary: {
      bg: 'bg-purple-500',
      glow: 'shadow-purple-500/50',
      border: 'border-purple-500/50',
    },
    danger: {
      bg: 'bg-red-500',
      glow: 'shadow-red-500/50',
      border: 'border-red-500/50',
    },
    success: {
      bg: 'bg-green-500',
      glow: 'shadow-green-500/50',
      border: 'border-green-500/50',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label and value */}
      {(label || showValue) && (
        <div className="flex justify-between items-center text-sm font-mono">
          {label && (
            <span className="text-gray-300 uppercase tracking-wide">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-white font-semibold">
              {Math.round(value)}/{max}
            </span>
          )}
        </div>
      )}
      
      {/* Progress bar container */}
      <div className={cn(
        'relative h-4 bg-gray-900/80 border-2 overflow-hidden',
        style.border
      )}>
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="h-full w-full"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent ${100/segments}%, rgba(255,255,255,0.1) ${100/segments}%, rgba(255,255,255,0.1) ${100/segments + 1}%)`,
            }}
          />
        </div>
        
        {/* Progress fill */}
        <motion.div
          className={cn(
            'relative h-full transition-all duration-300',
            style.bg,
            animated && 'shadow-lg',
            style.glow
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Inner gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
          
          {/* Scanning line effect */}
          {animated && percentage > 0 && (
            <motion.div
              className="absolute top-0 right-0 w-1 h-full bg-white/60"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.div>
        
        {/* Segments overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: segments - 1 }, (_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-0.5 bg-gray-800"
              style={{ left: `${((i + 1) / segments) * 100}%` }}
            />
          ))}
        </div>
        
        {/* Corner indicators */}
        <div className="absolute top-0 left-0 w-1 h-1 bg-current opacity-60" />
        <div className="absolute top-0 right-0 w-1 h-1 bg-current opacity-60" />
        <div className="absolute bottom-0 left-0 w-1 h-1 bg-current opacity-60" />
        <div className="absolute bottom-0 right-0 w-1 h-1 bg-current opacity-60" />
      </div>
      
      {/* Percentage indicator */}
      {animated && (
        <motion.div
          className="text-xs font-mono text-gray-400 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(percentage)}% COMPLETE
        </motion.div>
      )}
    </div>
  );
}