'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useDesignTokens } from '@/lib/hooks/useDesignTokens';
import { cn } from '@/lib/utils';

export function TokenShowcase() {
  const { 
    tokens, 
    colorMode, 
    toggleColorMode, 
    accessibility,
    updateAccessibility,
    getAnimation 
  } = useDesignTokens();

  return (
    <div className="p-8 space-y-8">
      {/* Theme Controls */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Design System Controls</h2>
        
        <div className="flex gap-4">
          <button
            onClick={toggleColorMode}
            className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
          >
            Toggle {colorMode === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
          
          <button
            onClick={() => updateAccessibility({ highContrast: !accessibility.highContrast })}
            className={cn(
              "px-4 py-2 rounded transition-colors",
              accessibility.highContrast 
                ? "bg-yellow-500 text-black" 
                : "bg-gray-700 text-white hover:bg-gray-600"
            )}
          >
            High Contrast
          </button>
          
          <select
            value={accessibility.colorBlindMode}
            onChange={(e) => updateAccessibility({ colorBlindMode: e.target.value as any })}
            className="px-4 py-2 bg-gray-700 text-white rounded"
          >
            <option value="none">No Color Blind Mode</option>
            <option value="protanopia">Protanopia</option>
            <option value="deuteranopia">Deuteranopia</option>
            <option value="tritanopia">Tritanopia</option>
          </select>
        </div>
      </div>

      {/* Color Palette */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Color Palette</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(tokens.colors).map(([colorName, colorValue]) => {
            if (typeof colorValue === 'object' && 'rarity' in tokens.colors && colorName === 'rarity') {
              return (
                <div key={colorName} className="space-y-2">
                  <h4 className="font-medium capitalize">{colorName}</h4>
                  <div className="space-y-1">
                    {Object.entries(colorValue).map(([shade, value]) => (
                      <div key={shade} className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded border border-gray-600"
                          style={{ backgroundColor: value }}
                        />
                        <span className="text-sm">{shade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            
            if (typeof colorValue === 'object' && '500' in colorValue) {
              return (
                <div key={colorName} className="space-y-2">
                  <h4 className="font-medium capitalize">{colorName}</h4>
                  <div className="grid grid-cols-6 gap-1">
                    {Object.entries(colorValue).map(([shade, value]) => (
                      <div
                        key={shade}
                        className="w-full h-8 rounded"
                        style={{ backgroundColor: value }}
                        title={`${colorName}-${shade}`}
                      />
                    ))}
                  </div>
                </div>
              );
            }
            
            return null;
          })}
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Typography</h3>
        
        <div className="space-y-4">
          {Object.entries(tokens.typography.fontSize).map(([size, value]) => (
            <div key={size} style={{ fontSize: value }}>
              <span className="font-mono text-gray-500 text-sm">{size}: </span>
              The quick brown fox jumps over the lazy dog
            </div>
          ))}
        </div>
      </div>

      {/* Animations */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Animations</h3>
        
        <div className="flex gap-4">
          {Object.keys(tokens.animation.duration).map((duration) => {
            const anim = getAnimation(duration as any, 'cyberpunk');
            return (
              <motion.div
                key={duration}
                className="w-16 h-16 bg-cyan-500 rounded"
                animate={{ rotate: 360 }}
                transition={{
                  duration: parseFloat(anim.duration) / 1000,
                  ease: anim.easing as any,
                  repeat: Infinity,
                }}
              >
                <span className="text-xs text-white flex items-center justify-center h-full">
                  {duration}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Cyberpunk Effects */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Cyberpunk Effects</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-800 rounded cyber-grid">
            <h4 className="font-bold neon-glow text-cyan-400">Cyber Grid</h4>
            <p className="text-sm mt-2">Background grid pattern</p>
          </div>
          
          <div className="p-4 bg-gray-800 rounded cyber-scanlines">
            <h4 className="font-bold neon-glow-subtle text-purple-400">Scanlines</h4>
            <p className="text-sm mt-2">Retro CRT effect</p>
          </div>
          
          <div className="p-4 bg-gray-800 rounded digital-noise">
            <h4 className="font-bold holographic">Holographic</h4>
            <p className="text-sm mt-2">Animated gradient text</p>
          </div>
        </div>
      </div>

      {/* Component Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Component Examples</h3>
        
        <div className="space-y-4">
          <button className="btn-cyber bg-cyan-600 text-white hover:bg-cyan-700">
            Cyber Button
          </button>
          
          <div className="panel-cyber">
            <h4 className="text-cyber text-cyan-400 mb-2">Cyber Panel</h4>
            <p className="text-mono">
              This panel uses design tokens for consistent styling across the application.
            </p>
          </div>
          
          <div className="flex gap-2">
            {Object.entries(tokens.colors.rarity).map(([rarity, color]) => (
              <div
                key={rarity}
                className={cn(
                  "px-4 py-2 rounded border-2",
                  `rarity-${rarity}`
                )}
                style={{ borderColor: color, color }}
              >
                {rarity}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}