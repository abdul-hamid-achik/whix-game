'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { themes, ThemeName, Theme, glitchAnimations } from './theme-config';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  toggleGlitchEffect: () => void;
  glitchEnabled: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('polancoCollective');
  const [glitchEnabled, setGlitchEnabled] = useState(true);
  const theme = themes[themeName];

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('whix-theme') as ThemeName;
    const savedGlitch = localStorage.getItem('whix-glitch') === 'true';
    
    if (savedTheme && themes[savedTheme]) {
      setThemeName(savedTheme);
    }
    setGlitchEnabled(savedGlitch);
  }, []);

  useEffect(() => {
    // Apply theme CSS variables
    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(theme.colors).forEach(([colorGroup, colors]) => {
      if (typeof colors === 'object') {
        Object.entries(colors).forEach(([shade, value]) => {
          root.style.setProperty(`--color-${colorGroup}-${shade}`, value);
        });
      }
    });

    // Apply font variables
    Object.entries(theme.fonts).forEach(([fontType, fontFamily]) => {
      root.style.setProperty(`--font-${fontType}`, fontFamily);
    });

    // Apply effect variables
    Object.entries(theme.effects.glow).forEach(([size, value]) => {
      root.style.setProperty(`--glow-${size}`, value);
    });

    // Apply background effects
    if (theme.effects.scanlines !== 'none' && glitchEnabled) {
      root.style.setProperty('--scanlines', theme.effects.scanlines);
    } else {
      root.style.setProperty('--scanlines', 'none');
    }

    // Save to localStorage
    localStorage.setItem('whix-theme', themeName);
    localStorage.setItem('whix-glitch', String(glitchEnabled));
  }, [theme, themeName, glitchEnabled]);

  const setTheme = (name: ThemeName) => {
    setThemeName(name);
  };

  const toggleGlitchEffect = () => {
    setGlitchEnabled(!glitchEnabled);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeName,
        setTheme,
        toggleGlitchEffect,
        glitchEnabled,
      }}
    >
      {/* Inject global styles */}
      <style jsx global>{`
        ${glitchAnimations}

        :root {
          --transition-speed: 200ms;
          --border-radius: 0.5rem;
        }

        * {
          transition: background-color var(--transition-speed),
                      color var(--transition-speed),
                      border-color var(--transition-speed);
        }

        body {
          font-family: var(--font-body);
          background-color: var(--color-background-primary);
          color: var(--color-text-primary);
          position: relative;
          overflow-x: hidden;
        }

        /* Scanline effect overlay */
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: var(--scanlines);
          pointer-events: none;
          z-index: 1;
          opacity: ${glitchEnabled ? 0.05 : 0};
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }

        ::-webkit-scrollbar-track {
          background: var(--color-background-secondary);
          border-radius: var(--border-radius);
        }

        ::-webkit-scrollbar-thumb {
          background: var(--color-primary-500);
          border-radius: var(--border-radius);
          border: 2px solid var(--color-background-secondary);
        }

        ::-webkit-scrollbar-thumb:hover {
          background: var(--color-primary-600);
        }

        /* Selection styling */
        ::selection {
          background-color: var(--color-accent-neon);
          color: var(--color-background-primary);
        }

        /* Focus styling */
        *:focus {
          outline: 2px solid var(--color-accent-neon);
          outline-offset: 2px;
        }

        /* Neon glow utility classes */
        .neon-glow-sm {
          text-shadow: var(--glow-small) currentColor;
        }

        .neon-glow-md {
          text-shadow: var(--glow-medium) currentColor;
        }

        .neon-glow-lg {
          text-shadow: var(--glow-large) currentColor;
        }

        .neon-box-glow-sm {
          box-shadow: var(--glow-small) var(--color-accent-neon);
        }

        .neon-box-glow-md {
          box-shadow: var(--glow-medium) var(--color-accent-neon);
        }

        .neon-box-glow-lg {
          box-shadow: var(--glow-large) var(--color-accent-neon);
        }

        /* Glitch effect classes */
        .glitch-text {
          animation: ${glitchEnabled ? theme.effects.glitch.text : 'none'};
        }

        .glitch-box {
          animation: ${glitchEnabled ? theme.effects.glitch.box : 'none'};
        }

        /* Pixel font class */
        .font-pixel {
          font-family: var(--font-pixel);
          image-rendering: pixelated;
          -webkit-font-smoothing: none;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Display font class */
        .font-display {
          font-family: var(--font-display);
        }

        /* Cyberpunk grid background */
        .cyber-grid {
          background-image: 
            linear-gradient(var(--color-accent-neon) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-accent-neon) 1px, transparent 1px);
          background-size: 50px 50px;
          background-position: -1px -1px;
          opacity: 0.03;
        }

        /* Holographic effect */
        .holographic {
          background: linear-gradient(
            45deg,
            var(--color-accent-neon),
            var(--color-accent-cyber),
            var(--color-accent-electric),
            var(--color-accent-neon)
          );
          background-size: 200% 200%;
          animation: holographic-shift 3s ease-in-out infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes holographic-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* CRT monitor effect */
        .crt-effect {
          position: relative;
          overflow: hidden;
        }

        .crt-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.03) 50%,
            rgba(0, 0, 0, 0.03) 50%
          );
          background-size: 100% 4px;
          pointer-events: none;
          z-index: 1;
        }

        .crt-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            ellipse at center,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.1) 100%
          );
          pointer-events: none;
          z-index: 2;
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}