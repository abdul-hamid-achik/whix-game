'use client';

import { motion } from 'framer-motion';
import { useUIStore } from '@/lib/stores/uiStore';

export function LoadingOverlay() {
  const { loadingMessage } = useUIStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="text-center">
        {/* Cyberpunk loading animation */}
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-cyan-500/30 rounded-full">
            <motion.div
              className="w-16 h-16 border-4 border-transparent border-t-cyan-400 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          
          {/* Glitch effect */}
          <motion.div
            className="absolute inset-0 w-16 h-16 border-4 border-cyan-400/50 rounded-full"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <motion.h3
            className="text-xl font-mono text-cyan-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            NEURAL INTERFACE
          </motion.h3>
          
          <p className="text-gray-400 font-mono">
            {loadingMessage || 'Establishing connection...'}
          </p>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-1 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-cyan-400 rounded-full"
                animate={{ 
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>

        {/* Scanlines effect */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.3) 2px, rgba(0, 255, 255, 0.3) 4px)',
          }}
        />
      </div>
    </motion.div>
  );
}