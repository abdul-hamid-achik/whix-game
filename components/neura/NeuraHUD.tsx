'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeuraHUDProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  status?: 'online' | 'offline' | 'warning' | 'error';
  compact?: boolean;
}

export function NeuraHUD({ 
  children, 
  className,
  title = 'WHIX SYSTEM',
  subtitle = 'NEURAL INTERFACE',
  status = 'online',
  compact = false
}: NeuraHUDProps) {
  const statusStyles = {
    online: 'text-green-400 animate-pulse',
    offline: 'text-gray-500',
    warning: 'text-yellow-400 animate-pulse',
    error: 'text-red-400 animate-pulse',
  };

  return (
    <div className={cn(
      'fixed inset-0 pointer-events-none z-50',
      'bg-gradient-to-b from-gray-900/20 via-transparent to-gray-900/20',
      className
    )}>
      {/* Top HUD bar */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pointer-events-auto absolute top-0 left-0 right-0 p-4"
      >
        <div className="flex items-center justify-between">
          {/* System info */}
          <div className="flex items-center gap-4">
            <div className="font-mono text-cyan-400">
              <div className="text-lg font-bold tracking-wider">{title}</div>
              {!compact && (
                <div className="text-xs text-gray-400 uppercase tracking-wide">
                  {subtitle}
                </div>
              )}
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', statusStyles[status])} />
              <span className="font-mono text-xs uppercase text-gray-400">
                {status}
              </span>
            </div>
          </div>
          
          {/* System time */}
          <div className="font-mono text-xs text-gray-400">
            {new Date().toLocaleTimeString('en-US', { 
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>
        
        {/* Divider line */}
        <div className="mt-2 h-0.5 bg-gradient-to-r from-cyan-500/50 via-cyan-500/20 to-transparent" />
      </motion.div>
      
      {/* Corner overlays */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-500/50" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-500/50" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-500/50" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-500/50" />
      
      {/* Content area */}
      <div className="absolute inset-16 pointer-events-auto">
        {children}
      </div>
      
      {/* Bottom status bar */}
      {!compact && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="pointer-events-auto absolute bottom-0 left-0 right-0 p-4"
        >
          <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent mb-2" />
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <div className="flex items-center gap-4">
              <span>SYSTEM STATUS: STABLE</span>
              <span>NEURAL LINK: ACTIVE</span>
              <span>ENCRYPTION: ENABLED</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>WHIX NETWORK</span>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Scanning lines effect */}
      <AnimatePresence>
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          exit={{ opacity: 0 }}
        >
          <div 
            className="h-full w-full"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0, 255, 255, 0.05) 4px, rgba(0, 255, 255, 0.05) 6px)',
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}