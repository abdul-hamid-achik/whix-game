'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useKeyboardNavigation } from '@/lib/hooks/useKeyboardNavigation';

interface KeyboardShortcutsProps {
  onClose?: () => void;
}

const categoryLabels = {
  navigation: 'Navigation',
  gameplay: 'Gameplay',
  menu: 'Menu Access',
  accessibility: 'Accessibility',
  debug: 'Debug (Dev only)',
};

const categoryIcons = {
  navigation: '🧭',
  gameplay: '🎮',
  menu: '📋',
  accessibility: '♿',
  debug: '🛠️',
};

export function KeyboardShortcuts({ onClose }: KeyboardShortcutsProps) {
  const { getHotkeysByCategory } = useKeyboardNavigation();
  
  // Group hotkeys by category
  const hotkeysByCategory = React.useMemo(() => {
    const categories: Record<string, any[]> = {};
    const allHotkeys = getHotkeysByCategory();
    
    allHotkeys.forEach(hotkey => {
      const category = hotkey.category || 'navigation';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(hotkey);
    });
    
    return categories;
  }, [getHotkeysByCategory]);

  const formatKey = (key: string) => {
    // Format key combinations for display
    return key
      .split(',')
      .map(k => k.trim())
      .map(k => {
        return k
          .split('+')
          .map(part => {
            // Capitalize special keys
            const specialKeys: Record<string, string> = {
              'cmd': '⌘',
              'ctrl': 'Ctrl',
              'shift': 'Shift',
              'alt': 'Alt',
              'option': 'Option',
              'esc': 'Esc',
              'enter': 'Enter',
              'space': 'Space',
              'up': '↑',
              'down': '↓',
              'left': '←',
              'right': '→',
              'tab': 'Tab',
              'backspace': '⌫',
              'delete': 'Del',
              'plus': '+',
              'minus': '-',
            };
            
            return specialKeys[part.toLowerCase()] || part.toUpperCase();
          })
          .join(' + ');
      })
      .join(' or ');
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <span className="sr-only">Close</span>
            ×
          </Button>
        )}
      </div>
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Press these keys to quickly navigate and control the game.
        </div>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {Object.entries(hotkeysByCategory).map(([category, hotkeys]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <h3 className="font-soviet text-lg uppercase tracking-wider flex items-center gap-2">
                  <span className="text-xl">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h3>
                
                <div className="grid gap-2">
                  {hotkeys.map((hotkey: any) => (
                    <div
                      key={hotkey.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        "bg-gray-800/50 border border-gray-700/50",
                        "hover:bg-gray-800/70 transition-colors"
                      )}
                    >
                      <span className="text-sm">{hotkey.description}</span>
                      <div className="flex items-center gap-1">
                        {formatKey(hotkey.key).split(' or ').map((keyCombo, idx) => (
                          <React.Fragment key={idx}>
                            {idx > 0 && <span className="text-gray-500 mx-1">or</span>}
                            <kbd className={cn(
                              "px-2 py-1 text-xs font-mono",
                              "bg-gray-900 border border-gray-700 rounded",
                              "shadow-[0_2px_0_0_rgba(0,0,0,0.5)]"
                            )}>
                              {keyCombo}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold">Pro tip:</span> Press{' '}
            <kbd className="px-1 py-0.5 text-xs bg-gray-800 border border-gray-700 rounded">Tab</kbd>{' '}
            to navigate between elements
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="focus-soviet"
          >
            Close (Esc)
          </Button>
        </div>
      </div>
    </div>
  );
}