'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useUIStore, GameState } from '@/lib/stores/uiStore';

// Schema for transition configuration
export const TransitionConfigSchema = z.object({
  duration: z.number().default(300),
  easing: z.enum(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear']).default('ease-in-out'),
  type: z.enum(['fade', 'slide', 'scale', 'glitch', 'soviet']).default('fade'),
  direction: z.enum(['left', 'right', 'up', 'down']).optional(),
});

export type TransitionConfig = z.infer<typeof TransitionConfigSchema>;

// Schema for transition state
const TransitionStateSchema = z.object({
  isTransitioning: z.boolean(),
  fromState: z.nativeEnum(GameState).nullable(),
  toState: z.nativeEnum(GameState).nullable(),
  progress: z.number().min(0).max(1),
});

type TransitionState = z.infer<typeof TransitionStateSchema>;

// Transition presets for different state changes
const TRANSITION_PRESETS: Record<string, TransitionConfig> = {
  // Hub to Mission transitions
  [`${GameState.COURIER_HUB}-${GameState.MISSION_BRIEFING}`]: {
    duration: 400,
    easing: 'ease-in-out',
    type: 'slide',
    direction: 'left',
  },
  [`${GameState.MISSION_BRIEFING}-${GameState.ADVENTURE_MAP}`]: {
    duration: 500,
    easing: 'ease-out',
    type: 'soviet',
  },
  [`${GameState.ADVENTURE_MAP}-${GameState.TACTICAL_COMBAT}`]: {
    duration: 300,
    easing: 'ease-in',
    type: 'glitch',
  },
  // Return transitions
  [`${GameState.AFTER_ACTION}-${GameState.COURIER_HUB}`]: {
    duration: 600,
    easing: 'ease-out',
    type: 'fade',
  },
  // Default transition
  default: {
    duration: 300,
    easing: 'ease-in-out',
    type: 'fade',
  },
};

export function useGameStateTransition() {
  const { currentState, previousState } = useUIStore();
  const [transitionState, setTransitionState] = useState<TransitionState>(
    TransitionStateSchema.parse({
      isTransitioning: false,
      fromState: null,
      toState: null,
      progress: 0,
    })
  );

  useEffect(() => {
    if (previousState && currentState !== previousState) {
      // Start transition
      const transitionKey = `${previousState}-${currentState}`;
      const config = TRANSITION_PRESETS[transitionKey] || TRANSITION_PRESETS.default;
      
      setTransitionState({
        isTransitioning: true,
        fromState: previousState,
        toState: currentState,
        progress: 0,
      });

      // Animate progress
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / config.duration, 1);
        
        setTransitionState(prev => ({
          ...prev,
          progress,
        }));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Transition complete
          setTransitionState({
            isTransitioning: false,
            fromState: null,
            toState: null,
            progress: 0,
          });
        }
      };

      requestAnimationFrame(animate);
    }
  }, [currentState, previousState]);

  const getTransitionStyles = () => {
    if (!transitionState.isTransitioning) {
      return {};
    }

    const transitionKey = `${transitionState.fromState}-${transitionState.toState}`;
    const config = TRANSITION_PRESETS[transitionKey] || TRANSITION_PRESETS.default;
    const { progress } = transitionState;

    switch (config.type) {
      case 'fade':
        return {
          opacity: progress,
          transition: `opacity ${config.duration}ms ${config.easing}`,
        };
      
      case 'slide':
        const slideDistance = 100;
        const offset = (1 - progress) * slideDistance;
        const transform = {
          left: `translateX(${offset}px)`,
          right: `translateX(-${offset}px)`,
          up: `translateY(${offset}px)`,
          down: `translateY(-${offset}px)`,
        }[config.direction || 'left'];
        
        return {
          transform,
          opacity: progress,
          transition: `all ${config.duration}ms ${config.easing}`,
        };
      
      case 'scale':
        return {
          transform: `scale(${0.9 + (0.1 * progress)})`,
          opacity: progress,
          transition: `all ${config.duration}ms ${config.easing}`,
        };
      
      case 'glitch':
        // Soviet-Aztec glitch effect
        const glitchOffset = Math.sin(progress * Math.PI * 8) * (1 - progress) * 5;
        return {
          transform: `translateX(${glitchOffset}px)`,
          opacity: progress > 0.5 ? 1 : progress * 2,
          filter: progress < 0.5 ? `hue-rotate(${glitchOffset * 10}deg)` : 'none',
          transition: `opacity ${config.duration}ms ${config.easing}`,
        };
      
      case 'soviet':
        // Soviet-Aztec transition with stone pattern overlay
        return {
          opacity: progress,
          transform: `scaleY(${0.95 + (0.05 * progress)})`,
          backgroundImage: progress < 0.5 
            ? `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(220, 38, 38, ${0.1 * (1 - progress * 2)}) 2px,
                rgba(220, 38, 38, ${0.1 * (1 - progress * 2)}) 4px
              )`
            : 'none',
          transition: `all ${config.duration}ms ${config.easing}`,
        };
      
      default:
        return {};
    }
  };

  return {
    isTransitioning: transitionState.isTransitioning,
    transitionProgress: transitionState.progress,
    transitionStyles: getTransitionStyles(),
    fromState: transitionState.fromState,
    toState: transitionState.toState,
  };
}