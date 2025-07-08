'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/stores/uiStore';
import { cn } from '@/lib/utils';

interface VisualEffectsProps {
  scanlines?: boolean;
  glitch?: boolean;
  noise?: boolean;
  vignette?: boolean;
  flicker?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export function VisualEffects({
  scanlines = true,
  glitch = false,
  noise = true,
  vignette = true,
  flicker = false,
  intensity = 'low',
  className
}: VisualEffectsProps) {
  const { settings } = useUIStore();
  
  // Respect user settings for effects
  if (settings.reducedMotion) {
    return null;
  }

  const intensityValues = {
    low: { opacity: 0.03, frequency: 8000 },
    medium: { opacity: 0.06, frequency: 4000 },
    high: { opacity: 0.1, frequency: 2000 }
  };

  const currentIntensity = intensityValues[intensity];

  return (
    <>
      {/* Scanlines Effect */}
      {scanlines && (
        <div 
          className={cn(
            "pointer-events-none fixed inset-0 z-50",
            className
          )}
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 255, 255, ${currentIntensity.opacity}) 2px,
              rgba(0, 255, 255, ${currentIntensity.opacity}) 4px
            )`,
            backgroundSize: '100% 4px',
            animation: 'scanlines 8s linear infinite'
          }}
        />
      )}

      {/* Noise Effect */}
      {noise && (
        <div 
          className={cn(
            "pointer-events-none fixed inset-0 z-40",
            className
          )}
          style={{
            opacity: currentIntensity.opacity * 2,
            mixBlendMode: 'overlay',
            animation: `noise ${currentIntensity.frequency}ms steps(2) infinite`
          }}
        />
      )}

      {/* Vignette Effect */}
      {vignette && (
        <div 
          className={cn(
            "pointer-events-none fixed inset-0 z-30",
            className
          )}
          style={{
            background: `radial-gradient(
              ellipse at center,
              transparent 0%,
              transparent 40%,
              rgba(0, 0, 0, 0.2) 70%,
              rgba(0, 0, 0, 0.6) 100%
            )`
          }}
        />
      )}

      {/* Glitch Effect */}
      {glitch && <GlitchEffect intensity={intensity} />}

      {/* Flicker Effect */}
      {flicker && <FlickerEffect intensity={intensity} />}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }

        @keyframes noise {
          0%, 100% { 
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E");
          }
          50% { 
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E");
          }
        }
      `}</style>
    </>
  );
}

// Glitch Effect Component
function GlitchEffect({ intensity }: { intensity: 'low' | 'medium' | 'high' }) {
  const [isGlitching, setIsGlitching] = React.useState(false);

  React.useEffect(() => {
    const glitchChance = {
      low: 0.001,
      medium: 0.005,
      high: 0.01
    };

    const interval = setInterval(() => {
      if (Math.random() < glitchChance[intensity]) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 200);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [intensity]);

  return (
    <AnimatePresence>
      {isGlitching && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-50"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 0, 0, 0.1) 10%, transparent 20%)',
              transform: `translateX(${Math.random() * 100 - 50}px)`,
              mixBlendMode: 'screen'
            }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-50"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(0, 255, 0, 0.1) 15%, transparent 25%)',
              transform: `translateX(${Math.random() * 100 - 50}px) translateY(2px)`,
              mixBlendMode: 'screen'
            }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-50"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(0, 0, 255, 0.1) 20%, transparent 30%)',
              transform: `translateX(${Math.random() * 100 - 50}px) translateY(-2px)`,
              mixBlendMode: 'screen'
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}

// Flicker Effect Component
function FlickerEffect({ intensity }: { intensity: 'low' | 'medium' | 'high' }) {
  const [brightness, setBrightness] = React.useState(1);

  React.useEffect(() => {
    const flickerIntensity = {
      low: { min: 0.98, max: 1.02 },
      medium: { min: 0.95, max: 1.05 },
      high: { min: 0.9, max: 1.1 }
    };

    const { min, max } = flickerIntensity[intensity];

    const interval = setInterval(() => {
      setBrightness(min + Math.random() * (max - min));
    }, 100);

    return () => clearInterval(interval);
  }, [intensity]);

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-20"
      style={{
        backgroundColor: 'black',
        opacity: 1 - brightness,
        transition: 'opacity 0.1s'
      }}
    />
  );
}

// CRT Monitor Effect Component
export function CRTEffect({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* CRT curve effect */}
      <div 
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background: `radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 60%,
            rgba(0, 0, 0, 0.1) 90%,
            rgba(0, 0, 0, 0.3) 100%
          )`,
          borderRadius: '2%'
        }}
      />

      {/* CRT screen reflection */}
      <div 
        className="pointer-events-none absolute inset-0 z-30 opacity-10"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
          borderRadius: '2%'
        }}
      />
    </div>
  );
}

// Terminal Text Effect
export function TerminalText({ 
  text, 
  speed = 50,
  className,
  onComplete
}: { 
  text: string; 
  speed?: number;
  className?: string;
  onComplete?: () => void;
}) {
  const [displayedText, setDisplayedText] = React.useState('');
  const [showCursor, setShowCursor] = React.useState(true);

  React.useEffect(() => {
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    // Cursor blink
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(cursorInterval);
    };
  }, [text, speed, onComplete]);

  return (
    <span className={cn("font-mono", className)}>
      {displayedText}
      {showCursor && <span className="animate-pulse">_</span>}
    </span>
  );
}

// Matrix Rain Effect
export function MatrixRain({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35);

    return () => clearInterval(interval);
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className={cn(
        "pointer-events-none fixed inset-0 z-0 opacity-10",
        className
      )}
    />
  );
}