'use client';

import { motion } from 'framer-motion';
import { Palette, Zap, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/lib/theme/theme-provider';
import { themes, ThemeName } from '@/lib/theme/theme-config';
import { cn } from '@/lib/utils';

export function ThemeSwitcher() {
  const { themeName, setTheme, glitchEnabled, toggleGlitchEffect } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Palette className="h-5 w-5" />
          {glitchEnabled && (
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 bg-accent-neon rounded-full"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>UI Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {(Object.keys(themes) as ThemeName[]).map((name) => {
          const theme = themes[name];
          return (
            <DropdownMenuItem
              key={name}
              onClick={() => setTheme(name)}
              className={cn(
                'cursor-pointer',
                themeName === name && 'bg-secondary'
              )}
            >
              <div className="flex items-center gap-3 w-full">
                <div
                  className="w-4 h-4 rounded"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary[500]} 0%, ${theme.colors.accent.neon} 100%)`,
                  }}
                />
                <span className="flex-1">{theme.name}</span>
                {themeName === name && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-primary rounded-full"
                  />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="text-sm">Glitch Effects</span>
            </div>
            <Switch
              checked={glitchEnabled}
              onCheckedChange={toggleGlitchEffect}
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact theme indicator for mobile
export function ThemeIndicator() {
  const { theme, glitchEnabled } = useTheme();
  
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'w-6 h-6 rounded-full border-2',
          glitchEnabled && 'animate-pulse'
        )}
        style={{
          borderColor: theme.colors.accent.neon,
          background: `linear-gradient(135deg, ${theme.colors.primary[500]} 0%, ${theme.colors.accent.cyber} 100%)`,
        }}
      />
      <span className="text-xs text-muted-foreground font-display">
        {theme.name}
      </span>
    </div>
  );
}

// Theme preview card for settings
export function ThemePreview({ 
  themeName,
  selected,
  onSelect 
}: {
  themeName: ThemeName;
  selected: boolean;
  onSelect: () => void;
}) {
  const theme = themes[themeName];
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      className={cn(
        'relative p-4 rounded-lg border-2 transition-all',
        selected ? 'border-primary' : 'border-secondary hover:border-primary/50'
      )}
    >
      {/* Preview */}
      <div className="w-full h-32 rounded mb-3 overflow-hidden relative">
        {/* Background */}
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: theme.colors.background.primary }}
        />
        
        {/* UI Elements Preview */}
        <div className="relative p-2 space-y-2">
          {/* Header */}
          <div 
            className="h-6 rounded"
            style={{ 
              background: `linear-gradient(90deg, ${theme.colors.primary[500]} 0%, ${theme.colors.accent.neon} 100%)` 
            }}
          />
          
          {/* Content blocks */}
          <div className="flex gap-2">
            <div 
              className="flex-1 h-4 rounded"
              style={{ backgroundColor: theme.colors.background.secondary }}
            />
            <div 
              className="flex-1 h-4 rounded"
              style={{ backgroundColor: theme.colors.background.tertiary }}
            />
          </div>
          
          {/* Text lines */}
          <div className="space-y-1">
            <div 
              className="h-2 w-3/4 rounded"
              style={{ backgroundColor: theme.colors.text.secondary }}
            />
            <div 
              className="h-2 w-1/2 rounded"
              style={{ backgroundColor: theme.colors.text.muted }}
            />
          </div>
          
          {/* Accent elements */}
          <div className="flex gap-1 absolute bottom-2 right-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: theme.colors.accent.cyber }}
            />
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: theme.colors.accent.electric }}
            />
          </div>
        </div>
      </div>
      
      {/* Theme name */}
      <h4 className="font-semibold text-sm">{theme.name}</h4>
      
      {/* Selected indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
        >
          <Eye className="w-3 h-3 text-primary-foreground" />
        </motion.div>
      )}
    </motion.button>
  );
}