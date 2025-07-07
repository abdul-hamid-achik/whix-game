// Aztec-Soviet delivery-themed color palettes and design tokens for WHIX
export const themes = {
  // Polanco Collective theme - Aztec patterns meet Soviet industrial design
  polancoCollective: {
    name: 'Polanco Collective',
    colors: {
      primary: {
        50: '#fef3c7', // Pale gold
        100: '#fde68a', // Light gold
        200: '#fcd34d', // Gold
        300: '#f59e0b', // Aztec gold
        400: '#d97706', // Deep gold
        500: '#b45309', // Rich gold
        600: '#92400e', // Bronze
        700: '#78350f', // Dark bronze
        800: '#451a03', // Deep bronze
        900: '#1c0701', // Almost black bronze
      },
      secondary: {
        50: '#fee2e2', // Light red
        100: '#fecaca', // Soft red
        200: '#fca5a5', // Red
        300: '#f87171', // Bright red
        400: '#ef4444', // Soviet red
        500: '#dc2626', // Deep red
        600: '#b91c1c', // Dark red
        700: '#991b1b', // Very dark red
        800: '#7f1d1d', // Maroon
        900: '#450a0a', // Dark maroon
      },
      accent: {
        neon: '#10b981', // Jade green (Aztec)
        cyber: '#8b5cf6', // Violet (Soviet tech)
        electric: '#06b6d4', // Turquoise (Aztec water)
        warning: '#f59e0b', // Gold (warning)
        danger: '#dc2626', // Deep red (danger)
      },
      background: {
        primary: '#1c1917', // Stone 900 (dark earth)
        secondary: '#292524', // Stone 800 (earth)
        tertiary: '#44403c', // Stone 700 (light earth)
        overlay: 'rgba(28, 25, 23, 0.9)',
      },
      text: {
        primary: '#fef3c7', // Pale gold
        secondary: '#d6d3d1', // Stone 300
        muted: '#a8a29e', // Stone 400
        inverse: '#1c1917',
      },
    },
    effects: {
      glow: {
        small: '0 0 8px rgba(180, 83, 9, 0.4)', // Gold glow
        medium: '0 0 16px rgba(180, 83, 9, 0.6)', // Stronger gold glow
        large: '0 0 24px rgba(180, 83, 9, 0.8)', // Intense gold glow
      },
      scanlines: 'repeating-linear-gradient(0deg, rgba(180, 83, 9, 0.1), rgba(180, 83, 9, 0.1) 1px, transparent 1px, transparent 3px)', // Aztec pattern overlay
      glitch: {
        text: 'aztec-shimmer 2s ease-in-out infinite',
        box: 'soviet-machinery 4s linear infinite',
      },
    },
    fonts: {
      display: "'Playfair Display', serif", // More Soviet-style serif
      body: "'IBM Plex Sans', sans-serif", // Soviet-inspired industrial sans
      pixel: "'Press Start 2P', cursive",
    },
  },

  // Default cyberpunk theme (keeping as alternative)
  neonRebel: {
    name: 'Neon Rebel',
    colors: {
      primary: {
        50: '#fef3c7',
        100: '#fde68a',
        200: '#fcd34d',
        300: '#fbbf24',
        400: '#f59e0b',
        500: '#ef4444', // Main red
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
      },
      secondary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
      },
      accent: {
        neon: '#00ff88',
        cyber: '#ff00ff',
        electric: '#00ffff',
        warning: '#ffaa00',
        danger: '#ff0055',
      },
      background: {
        primary: '#0a0a0a',
        secondary: '#1a1a1a',
        tertiary: '#2a2a2a',
        overlay: 'rgba(0, 0, 0, 0.8)',
      },
      text: {
        primary: '#ffffff',
        secondary: '#a0a0a0',
        muted: '#606060',
        inverse: '#000000',
      },
    },
    effects: {
      glow: {
        small: '0 0 10px',
        medium: '0 0 20px',
        large: '0 0 30px',
      },
      scanlines: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px)',
      glitch: {
        text: 'glitch-text 0.3s infinite',
        box: 'glitch-box 0.3s infinite',
      },
    },
    fonts: {
      display: "'Orbitron', monospace",
      body: "'JetBrains Mono', monospace",
      pixel: "'Press Start 2P', cursive",
    },
  },

  // Alternative themes
  midnightRun: {
    name: 'Midnight Run',
    colors: {
      primary: {
        50: '#f5f3ff',
        100: '#ede9fe',
        200: '#ddd6fe',
        300: '#c4b5fd',
        400: '#a78bfa',
        500: '#8b5cf6',
        600: '#7c3aed',
        700: '#6d28d9',
        800: '#5b21b6',
        900: '#4c1d95',
      },
      secondary: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
      },
      accent: {
        neon: '#a855f7',
        cyber: '#06b6d4',
        electric: '#f59e0b',
        warning: '#f97316',
        danger: '#ef4444',
      },
      background: {
        primary: '#030712',
        secondary: '#111827',
        tertiary: '#1f2937',
        overlay: 'rgba(3, 7, 18, 0.9)',
      },
      text: {
        primary: '#f9fafb',
        secondary: '#9ca3af',
        muted: '#6b7280',
        inverse: '#030712',
      },
    },
    effects: {
      glow: {
        small: '0 0 15px',
        medium: '0 0 25px',
        large: '0 0 35px',
      },
      scanlines: 'repeating-linear-gradient(0deg, rgba(148, 163, 184, 0.03), rgba(148, 163, 184, 0.03) 1px, transparent 1px, transparent 2px)',
      glitch: {
        text: 'glitch-text-subtle 0.5s infinite',
        box: 'glitch-box-subtle 0.5s infinite',
      },
    },
    fonts: {
      display: "'Space Grotesk', sans-serif",
      body: "'Inter', sans-serif",
      pixel: "'VT323', monospace",
    },
  },

  // Accessibility-friendly theme
  highContrast: {
    name: 'High Contrast',
    colors: {
      primary: {
        50: '#ffffff',
        100: '#ffffff',
        200: '#ffffff',
        300: '#ffffff',
        400: '#ffffff',
        500: '#ffffff',
        600: '#e5e5e5',
        700: '#cccccc',
        800: '#b3b3b3',
        900: '#999999',
      },
      secondary: {
        50: '#000000',
        100: '#1a1a1a',
        200: '#333333',
        300: '#4d4d4d',
        400: '#666666',
        500: '#808080',
        600: '#999999',
        700: '#b3b3b3',
        800: '#cccccc',
        900: '#e5e5e5',
      },
      accent: {
        neon: '#00ff00',
        cyber: '#ffff00',
        electric: '#00ffff',
        warning: '#ff8800',
        danger: '#ff0000',
      },
      background: {
        primary: '#000000',
        secondary: '#0a0a0a',
        tertiary: '#141414',
        overlay: 'rgba(0, 0, 0, 0.95)',
      },
      text: {
        primary: '#ffffff',
        secondary: '#e5e5e5',
        muted: '#cccccc',
        inverse: '#000000',
      },
    },
    effects: {
      glow: {
        small: '0 0 5px',
        medium: '0 0 10px',
        large: '0 0 15px',
      },
      scanlines: 'none',
      glitch: {
        text: 'none',
        box: 'none',
      },
    },
    fonts: {
      display: "'Arial', sans-serif",
      body: "'Arial', sans-serif",
      pixel: "'Courier New', monospace",
    },
  },
};

// CSS animations for glitch effects
export const glitchAnimations = `
  @keyframes glitch-text {
    0% {
      text-shadow: 
        0.05em 0 0 rgba(255, 0, 0, 0.75),
        -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
        0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
    }
    15% {
      text-shadow: 
        0.05em 0 0 rgba(255, 0, 0, 0.75),
        -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
        0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
    }
    16% {
      text-shadow: 
        -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
        0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
        -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
    }
    49% {
      text-shadow: 
        -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
        0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
        -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
    }
    50% {
      text-shadow: 
        0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
        0.05em 0 0 rgba(0, 255, 0, 0.75),
        0 -0.05em 0 rgba(0, 0, 255, 0.75);
    }
    99% {
      text-shadow: 
        0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
        0.05em 0 0 rgba(0, 255, 0, 0.75),
        0 -0.05em 0 rgba(0, 0, 255, 0.75);
    }
    100% {
      text-shadow: 
        -0.025em 0 0 rgba(255, 0, 0, 0.75),
        -0.025em -0.025em 0 rgba(0, 255, 0, 0.75),
        -0.025em -0.05em 0 rgba(0, 0, 255, 0.75);
    }
  }

  @keyframes glitch-text-subtle {
    0%, 100% {
      text-shadow: none;
    }
    25% {
      text-shadow: 
        -1px 0 #f0f,
        1px 0 #0ff;
    }
  }

  @keyframes glitch-box {
    0%, 100% {
      transform: translate(0);
    }
    20% {
      transform: translate(-2px, 2px);
    }
    40% {
      transform: translate(-2px, -2px);
    }
    60% {
      transform: translate(2px, 2px);
    }
    80% {
      transform: translate(2px, -2px);
    }
  }

  @keyframes glitch-box-subtle {
    0%, 100% {
      transform: translate(0);
    }
    50% {
      transform: translate(-1px, 0);
    }
  }

  @keyframes neon-pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  @keyframes scanline {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(100vh);
    }
  }

  @keyframes kingdom-float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-4px);
    }
  }

  @keyframes magic-shimmer {
    0%, 100% {
      box-shadow: 0 0 5px rgba(16, 185, 129, 0.3);
    }
    50% {
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.6);
    }
  }

  @keyframes fantasy-glow {
    0%, 100% {
      text-shadow: 0 0 10px rgba(242, 117, 10, 0.5);
    }
    50% {
      text-shadow: 0 0 20px rgba(242, 117, 10, 0.8);
    }
  }

  @keyframes aztec-shimmer {
    0%, 100% {
      text-shadow: 0 0 8px rgba(180, 83, 9, 0.6);
    }
    33% {
      text-shadow: 0 0 12px rgba(16, 185, 129, 0.4), 0 0 8px rgba(180, 83, 9, 0.6);
    }
    66% {
      text-shadow: 0 0 12px rgba(6, 182, 212, 0.4), 0 0 8px rgba(180, 83, 9, 0.6);
    }
  }

  @keyframes soviet-machinery {
    0% {
      transform: translateX(0px);
      box-shadow: 0 0 8px rgba(220, 38, 38, 0.3);
    }
    25% {
      transform: translateX(1px);
      box-shadow: 0 0 12px rgba(180, 83, 9, 0.4);
    }
    50% {
      transform: translateX(0px);
      box-shadow: 0 0 8px rgba(220, 38, 38, 0.3);
    }
    75% {
      transform: translateX(-1px);
      box-shadow: 0 0 12px rgba(180, 83, 9, 0.4);
    }
    100% {
      transform: translateX(0px);
      box-shadow: 0 0 8px rgba(220, 38, 38, 0.3);
    }
  }
`;

export type ThemeName = keyof typeof themes;
export type Theme = typeof themes[ThemeName];