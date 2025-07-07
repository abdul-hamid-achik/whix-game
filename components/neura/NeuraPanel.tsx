'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeuraPanelProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  glitch?: boolean;
  scanlines?: boolean;
  title?: string;
}

export function NeuraPanel({ 
  children, 
  className, 
  variant = 'primary',
  glitch = false,
  scanlines = true,
  title 
}: NeuraPanelProps) {
  const variantStyles = {
    primary: 'border-cyan-500/50 bg-gray-900/80 text-cyan-400',
    secondary: 'border-purple-500/50 bg-gray-900/80 text-purple-400',
    danger: 'border-red-500/50 bg-gray-900/80 text-red-400',
    success: 'border-green-500/50 bg-gray-900/80 text-green-400',
  };

  const accentColors = {
    primary: 'bg-cyan-500',
    secondary: 'bg-purple-500',
    danger: 'bg-red-500',
    success: 'bg-green-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'panel-aztec relative overflow-hidden',
        variantStyles[variant],
        glitch && 'animate-pulse',
        className
      )}
    >
      {/* Stone texture effect */}
      {scanlines && (
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-stone-texture" />
      )}
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4">
        <div className={cn('w-full h-0.5', accentColors[variant])} />
        <div className={cn('w-0.5 h-full', accentColors[variant])} />
      </div>
      <div className="absolute top-0 right-0 w-4 h-4">
        <div className={cn('w-full h-0.5', accentColors[variant])} />
        <div className={cn('w-0.5 h-full ml-auto', accentColors[variant])} />
      </div>
      
      {/* Title bar */}
      {title && (
        <div className="px-4 py-2 border-b border-current/30 bg-black/40">
          <div className="font-soviet text-sm font-semibold uppercase tracking-wider">
            {title}
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 p-4">
        {children}
      </div>
      
      {/* Glitch effect */}
      {glitch && (
        <motion.div
          className="absolute inset-0 bg-red-500/20 mix-blend-multiply"
          animate={{
            opacity: [0, 0.3, 0, 0.5, 0],
            x: [0, -2, 2, -1, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />
      )}
    </motion.div>
  );
}