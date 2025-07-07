'use client';

import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeuraButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  glitch?: boolean;
}

export function NeuraButton({ 
  children, 
  className, 
  variant = 'primary',
  size = 'md',
  isLoading = false,
  glitch = false,
  disabled,
  ...props 
}: NeuraButtonProps) {
  const variantStyles = {
    primary: 'bg-cyan-600 hover:bg-cyan-700 border-cyan-500 text-white shadow-cyan-500/25',
    secondary: 'bg-purple-600 hover:bg-purple-700 border-purple-500 text-white shadow-purple-500/25',
    danger: 'bg-red-600 hover:bg-red-700 border-red-500 text-white shadow-red-500/25',
    success: 'bg-green-600 hover:bg-green-700 border-green-500 text-white shadow-green-500/25',
    ghost: 'bg-transparent hover:bg-gray-800/50 border-gray-600 text-gray-300 hover:text-white',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative inline-flex items-center justify-center font-mono font-semibold',
        'border-2 transition-all duration-200',
        'shadow-lg hover:shadow-xl',
        'clip-path-button',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity',
        variantStyles[variant],
        sizeStyles[size],
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
        glitch && 'animate-pulse',
        className
      )}
      disabled={disabled || isLoading}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
      }}
      {...props}
    >
      {/* Corner indicators */}
      <div className="absolute top-0 left-0 w-2 h-2">
        <div className="w-full h-0.5 bg-current opacity-60" />
        <div className="w-0.5 h-full bg-current opacity-60" />
      </div>
      <div className="absolute top-0 right-0 w-2 h-2">
        <div className="w-full h-0.5 bg-current opacity-60" />
        <div className="w-0.5 h-full ml-auto bg-current opacity-60" />
      </div>
      
      {/* Loading spinner */}
      {isLoading && (
        <motion.div
          className="mr-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
      
      {/* Content */}
      <span className="relative z-10 uppercase tracking-wide">
        {children}
      </span>
      
      {/* Glitch effect */}
      {glitch && (
        <motion.div
          className="absolute inset-0 bg-red-500/30 mix-blend-multiply"
          animate={{
            opacity: [0, 0.5, 0, 0.3, 0],
            x: [0, -1, 1, -0.5, 0],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
      )}
    </motion.button>
  );
}