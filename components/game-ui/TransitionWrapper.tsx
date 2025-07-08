'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { useGameStateTransition } from '@/lib/hooks/useGameStateTransition';
import { GameState } from '@/lib/stores/uiStore';

// Schema for TransitionWrapper props
const TransitionWrapperPropsSchema = z.object({
  children: z.any(), // React.ReactNode
  gameState: z.nativeEnum(GameState),
  className: z.string().optional(),
});

type TransitionWrapperProps = z.infer<typeof TransitionWrapperPropsSchema>;

// Animation variants for different game states
const stateVariants = {
  [GameState.COURIER_HUB]: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
  [GameState.MISSION_BRIEFING]: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  },
  [GameState.PARTNER_SELECTION]: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  [GameState.ADVENTURE_MAP]: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  },
  [GameState.TACTICAL_COMBAT]: {
    initial: { opacity: 0, scale: 1.1, filter: 'blur(10px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
  },
  [GameState.EVENT_RESOLUTION]: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  [GameState.AFTER_ACTION]: {
    initial: { opacity: 0, scale: 0.8, rotateY: -180 },
    animate: { opacity: 1, scale: 1, rotateY: 0 },
    exit: { opacity: 0, scale: 0.8, rotateY: 180 },
  },
  default: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
};

// Soviet-Aztec themed transition overlay
const SovietAztecOverlay: React.FC<{ progress: number }> = ({ progress }) => {
  if (progress === 0 || progress === 1) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Stone pattern effect */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(220, 38, 38, ${0.1 * progress}) 10px,
            rgba(220, 38, 38, ${0.1 * progress}) 20px
          )`,
          opacity: progress < 0.5 ? progress * 2 : (1 - progress) * 2,
        }}
      />
      
      {/* Aztec sun ray effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            circle at center,
            transparent ${progress * 50}%,
            rgba(217, 119, 6, 0.1) ${progress * 100}%
          )`,
        }}
      />
      
      {/* Soviet star pattern */}
      {progress > 0.3 && progress < 0.7 && (
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='50,15 61,35 82,35 67,50 73,71 50,55 27,71 33,50 18,35 39,35' fill='%23dc2626' opacity='0.3'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px',
          }}
        />
      )}
    </div>
  );
};

export function TransitionWrapper(props: TransitionWrapperProps) {
  // Parse and validate props with Zod
  const { children, gameState, className = '' } = TransitionWrapperPropsSchema.parse(props);
  const { isTransitioning, transitionProgress, transitionStyles } = useGameStateTransition();
  const variants = stateVariants[gameState] || stateVariants.default;

  return (
    <>
      {/* Soviet-Aztec overlay for transitions */}
      <SovietAztecOverlay progress={transitionProgress} />
      
      {/* Main content with transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={gameState}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1], // Custom easing curve
          }}
          className={className}
          style={isTransitioning ? transitionStyles : {}}
          onAnimationComplete={() => {
            console.log('Animation complete for state:', gameState);
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

// HOC for easy wrapping of game state components
export function withTransition<P extends object>(
  Component: React.ComponentType<P>,
  gameState: GameState
) {
  return function TransitionedComponent(props: P) {
    return (
      <TransitionWrapper gameState={gameState}>
        <Component {...props} />
      </TransitionWrapper>
    );
  };
}