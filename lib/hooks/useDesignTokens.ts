'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { defaultTokens, DesignTokens, generateCSSVariables } from '@/lib/design/tokens';

// Schema for theme preference - using parse for validation
const _ThemePreferenceSchema = z.enum(['light', 'dark', 'system']);
type ThemePreference = z.infer<typeof _ThemePreferenceSchema>;

// Schema for color mode - using parse for validation
const ColorModeSchema = z.enum(['light', 'dark']);
type ColorMode = z.infer<typeof ColorModeSchema>;

// Schema for accessibility preferences
const AccessibilityPreferencesSchema = z.object({
  reducedMotion: z.boolean(),
  highContrast: z.boolean(),
  colorBlindMode: z.enum(['none', 'protanopia', 'deuteranopia', 'tritanopia']),
});

type AccessibilityPreferences = z.infer<typeof AccessibilityPreferencesSchema>;

// Hook to use design tokens
export function useDesignTokens() {
  const [tokens, setTokens] = useState<DesignTokens>(defaultTokens);
  const [colorMode, setColorMode] = useState<ColorMode>('dark');
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [accessibility, setAccessibility] = useState<AccessibilityPreferences>(
    AccessibilityPreferencesSchema.parse({
      reducedMotion: false,
      highContrast: false,
      colorBlindMode: 'none',
    })
  );

  // Detect system color scheme
  useEffect(() => {
    if (themePreference === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setColorMode(ColorModeSchema.parse(mediaQuery.matches ? 'dark' : 'light'));
      
      const handleChange = (e: MediaQueryListEvent) => {
        setColorMode(ColorModeSchema.parse(e.matches ? 'dark' : 'light'));
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setColorMode(themePreference as ColorMode);
    }
  }, [themePreference]);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setAccessibility(prev => ({ ...prev, reducedMotion: mediaQuery.matches }));
    
    const handleChange = (e: MediaQueryListEvent) => {
      setAccessibility(prev => ({ ...prev, reducedMotion: e.matches }));
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply CSS variables to document
  useEffect(() => {
    const cssVars = generateCSSVariables(tokens);
    const styleElement = document.createElement('style');
    styleElement.id = 'design-tokens';
    styleElement.textContent = cssVars;
    
    // Remove existing style element if present
    const existing = document.getElementById('design-tokens');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(styleElement);
    
    return () => {
      styleElement.remove();
    };
  }, [tokens]);

  // Apply accessibility classes to body
  useEffect(() => {
    const classes = [];
    
    if (accessibility.reducedMotion) {
      classes.push('reduce-motion');
    }
    
    if (accessibility.highContrast) {
      classes.push('high-contrast');
    }
    
    if (accessibility.colorBlindMode !== 'none') {
      classes.push(`colorblind-${accessibility.colorBlindMode}`);
    }
    
    // Add color mode class
    classes.push(`theme-${colorMode}`);
    
    // Apply classes
    document.body.className = classes.join(' ');
  }, [accessibility, colorMode]);

  // Helper functions to get token values
  const getColor = (path: string): string => {
    const parts = path.split('.');
    let value: any = tokens.colors;
    
    for (const part of parts) {
      value = value[part];
      if (!value) return '';
    }
    
    return value;
  };

  const getSpacing = (size: string): string => {
    return (tokens.spacing as any)[size] || '0';
  };

  const getFontSize = (size: string): string => {
    return (tokens.typography.fontSize as any)[size] || tokens.typography.fontSize.base;
  };

  const getShadow = (size: string): string => {
    return (tokens.shadows as any)[size] || tokens.shadows.none;
  };

  const getRadius = (size: string): string => {
    return (tokens.borderRadius as any)[size] || tokens.borderRadius.none;
  };

  // Get animation properties with reduced motion support
  const getAnimation = (duration: keyof typeof tokens.animation.duration, easing: keyof typeof tokens.animation.easing = 'ease') => {
    if (accessibility.reducedMotion) {
      return {
        duration: '0ms',
        easing: 'linear',
      };
    }
    
    return {
      duration: tokens.animation.duration[duration],
      easing: tokens.animation.easing[easing],
    };
  };

  // Update tokens (for theme switching)
  const updateTokens = (updates: Partial<DesignTokens>) => {
    setTokens(prev => ({
      ...prev,
      ...updates,
    }));
  };

  // Toggle color mode
  const toggleColorMode = () => {
    const newMode = colorMode === 'dark' ? 'light' : 'dark';
    setColorMode(newMode);
    setThemePreference(newMode);
  };

  // Update accessibility preferences
  const updateAccessibility = (updates: Partial<AccessibilityPreferences>) => {
    setAccessibility(prev => ({
      ...prev,
      ...updates,
    }));
  };

  return {
    tokens,
    colorMode,
    themePreference,
    accessibility,
    getColor,
    getSpacing,
    getFontSize,
    getShadow,
    getRadius,
    getAnimation,
    updateTokens,
    toggleColorMode,
    setThemePreference,
    updateAccessibility,
  };
}

// CSS-in-JS helper using design tokens - removed due to rules-of-hooks violation