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
    primary: 'border-cyan-500/50 bg-gray-900/80',
    secondary: 'border-purple-500/50 bg-gray-900/80',
    danger: 'border-red-500/50 bg-gray-900/80',
    success: 'border-green-500/50 bg-gray-900/80',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'relative border-2 backdrop-blur-sm',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none',
        'after:absolute after:inset-0 after:border after:border-white/10 after:pointer-events-none',
        variantStyles[variant],
        glitch && 'animate-pulse',
        className
      )}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
      }}
    >
      {/* Scanlines effect */}
      {scanlines && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div 
            className="h-full w-full"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)',
            }}
          />
        </div>
      )}
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4">
        <div className={cn('w-full h-0.5', `bg-${variant === 'primary' ? 'cyan' : variant === 'secondary' ? 'purple' : variant === 'danger' ? 'red' : 'green'}-500`)} />
        <div className={cn('w-0.5 h-full', `bg-${variant === 'primary' ? 'cyan' : variant === 'secondary' ? 'purple' : variant === 'danger' ? 'red' : 'green'}-500`)} />
      </div>
      <div className="absolute top-0 right-0 w-4 h-4">
        <div className={cn('w-full h-0.5', `bg-${variant === 'primary' ? 'cyan' : variant === 'secondary' ? 'purple' : variant === 'danger' ? 'red' : 'green'}-500`)} />
        <div className={cn('w-0.5 h-full ml-auto', `bg-${variant === 'primary' ? 'cyan' : variant === 'secondary' ? 'purple' : variant === 'danger' ? 'red' : 'green'}-500`)} />
      </div>
      
      {/* Title bar */}
      {title && (
        <div className={cn(
          'px-4 py-2 border-b border-current/30 bg-black/40',
          `text-${variant === 'primary' ? 'cyan' : variant === 'secondary' ? 'purple' : variant === 'danger' ? 'red' : 'green'}-400`
        )}>
          <div className="font-mono text-sm font-semibold uppercase tracking-wider">
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