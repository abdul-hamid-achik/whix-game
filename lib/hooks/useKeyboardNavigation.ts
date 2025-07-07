'use client';

import { useEffect, useRef, useCallback } from 'react';
import { z } from 'zod';
import { useUIStore, GameState } from '@/lib/stores/uiStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { 
  keyboardNavigationSystem, 
  HotkeyAction,
  FocusTrap 
} from '@/lib/systems/keyboard-navigation-system';

// Hook options schema
const UseKeyboardNavigationOptionsSchema = z.object({
  enabled: z.boolean().default(true),
  gameStateSync: z.boolean().default(true),
  customHotkeys: z.array(z.any()).optional(), // HotkeyAction[]
});

type UseKeyboardNavigationOptions = z.infer<typeof UseKeyboardNavigationOptionsSchema>;

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = { enabled: true, gameStateSync: true }) {
  // Parse and validate options with Zod
  const validatedOptions = UseKeyboardNavigationOptionsSchema.parse(options);
  const { enabled, gameStateSync, customHotkeys = [] } = validatedOptions;
  const { currentState: currentGameState, showPanel, hidePanel, setState } = useUIStore();
  // TODO: Implement pause functionality in gameStore
  // const { pauseGame, resumeGame, isPaused } = useGameStore();
  const { getActivePartners } = usePartnerStore();
  const registeredHotkeys = useRef<Set<string>>(new Set());

  // Sync game state with keyboard navigation system
  useEffect(() => {
    if (gameStateSync) {
      keyboardNavigationSystem.setGameState(currentGameState);
    }
  }, [currentGameState, gameStateSync]);

  // Register default hotkeys
  useEffect(() => {
    if (!enabled) return;

    const defaultHotkeys = keyboardNavigationSystem.getDefaultHotkeys();
    
    // Define handlers for default hotkeys
    const handlers: Record<string, () => void> = {
      'open-menu': () => {
        // TODO: Implement pause functionality
        // if (isPaused) {
        //   resumeGame();
        // } else {
        //   pauseGame();
        // }
        showPanel('settings', {
          position: 'overlay',
          size: 'large',
        });
      },
      'help': () => {
        showPanel('keyboardShortcuts', {
          position: 'overlay',
          size: 'large',
          zIndex: 1070,
        });
      },
      'search': () => {
        showPanel('quickSearch', {
          position: 'overlay',
          size: 'small',
        });
      },
      'go-to-hub': () => {
        setState(GameState.COURIER_HUB);
      },
      'view-partners': () => {
        showPanel('partnerManagement', {
          position: 'overlay',
          size: 'large',
        });
      },
      'view-missions': () => {
        showPanel('campaignSelection', {
          position: 'overlay',
          size: 'large',
        });
      },
      'view-shop': () => {
        showPanel('shopSystem', {
          position: 'overlay',
          size: 'large',
        });
      },
      'gacha-pull': () => {
        showPanel('gachaRecruitment', {
          position: 'overlay',
          size: 'large',
        });
      },
      'select-partner-1': () => {
        const partners = getActivePartners();
        if (partners[0]) {
          keyboardNavigationSystem.announce(`Selected ${partners[0].name}`);
        }
      },
      'select-partner-2': () => {
        const partners = getActivePartners();
        if (partners[1]) {
          keyboardNavigationSystem.announce(`Selected ${partners[1].name}`);
        }
      },
      'select-partner-3': () => {
        const partners = getActivePartners();
        if (partners[2]) {
          keyboardNavigationSystem.announce(`Selected ${partners[2].name}`);
        }
      },
      'increase-text-size': () => {
        const root = document.documentElement;
        const currentSize = parseFloat(getComputedStyle(root).fontSize);
        root.style.fontSize = `${currentSize * 1.1}px`;
        keyboardNavigationSystem.announce('Text size increased');
      },
      'decrease-text-size': () => {
        const root = document.documentElement;
        const currentSize = parseFloat(getComputedStyle(root).fontSize);
        root.style.fontSize = `${currentSize * 0.9}px`;
        keyboardNavigationSystem.announce('Text size decreased');
      },
      'toggle-high-contrast': () => {
        document.body.classList.toggle('high-contrast');
        const isHighContrast = document.body.classList.contains('high-contrast');
        keyboardNavigationSystem.announce(
          isHighContrast ? 'High contrast mode enabled' : 'High contrast mode disabled'
        );
      },
    };

    // Register each default hotkey with its handler
    Object.entries(defaultHotkeys).forEach(([_key, config]) => {
      const handler = handlers[config.id];
      if (handler !== undefined && !registeredHotkeys.current.has(config.id)) {
        const action: HotkeyAction = {
          ...config,
          handler,
        };
        keyboardNavigationSystem.registerHotkey(action);
        registeredHotkeys.current.add(config.id);
      }
    });

    // Register custom hotkeys
    customHotkeys.forEach((hotkey: HotkeyAction) => {
      if (!registeredHotkeys.current.has(hotkey.id)) {
        keyboardNavigationSystem.registerHotkey(hotkey);
        registeredHotkeys.current.add(hotkey.id);
      }
    });

    // Cleanup
    return () => {
      const hotkeyIds = Array.from(registeredHotkeys.current);
      hotkeyIds.forEach(id => {
        keyboardNavigationSystem.unregisterHotkey(id);
      });
      registeredHotkeys.current.clear();
    };
  }, [enabled, customHotkeys, showPanel, hidePanel, setState, getActivePartners]);

  // Create focus trap for a container
  const createFocusTrap = useCallback((container: HTMLElement, options?: Partial<FocusTrap>) => {
    keyboardNavigationSystem.createFocusTrap({
      container,
      allowEscape: true,
      ...options,
    });
  }, []);

  // Remove focus trap
  const removeFocusTrap = useCallback((container: HTMLElement) => {
    keyboardNavigationSystem.removeFocusTrap(container);
  }, []);

  // Announce to screen readers
  const announce = useCallback((message: string, priority?: 'polite' | 'assertive') => {
    keyboardNavigationSystem.announce(message, priority);
  }, []);

  // Get active hotkeys for display
  const getActiveHotkeys = useCallback(() => {
    return keyboardNavigationSystem.getActiveHotkeys();
  }, []);

  // Get all hotkeys by category
  const getHotkeysByCategory = useCallback((category?: string) => {
    return keyboardNavigationSystem.getHotkeys(category);
  }, []);

  return {
    createFocusTrap,
    removeFocusTrap,
    announce,
    getActiveHotkeys,
    getHotkeysByCategory,
    registerHotkey: (action: HotkeyAction) => {
      keyboardNavigationSystem.registerHotkey(action);
      registeredHotkeys.current.add(action.id);
    },
    unregisterHotkey: (id: string) => {
      keyboardNavigationSystem.unregisterHotkey(id);
      registeredHotkeys.current.delete(id);
    },
  };
}

// Hook for accessible focus management
export function useAccessibleFocus(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Add ARIA attributes if not present
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }

    // Add focus styles
    const handleFocus = () => {
      element.classList.add('focus-visible');
    };

    const handleBlur = () => {
      element.classList.remove('focus-visible');
    };

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, [ref]);
}

// Hook for arrow key navigation in lists/grids
export function useArrowKeyNavigation(
  items: HTMLElement[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'grid';
    loop?: boolean;
    onSelect?: (index: number) => void;
  } = {}
) {
  const { orientation = 'vertical', loop = true, onSelect } = options;
  const currentIndex = useRef(0);

  useEffect(() => {
    if (items.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let newIndex = currentIndex.current;
      const lastIndex = items.length - 1;

      switch (e.key) {
        case 'ArrowUp':
          if (orientation !== 'horizontal') {
            e.preventDefault();
            newIndex = currentIndex.current - 1;
            if (newIndex < 0) newIndex = loop ? lastIndex : 0;
          }
          break;
        case 'ArrowDown':
          if (orientation !== 'horizontal') {
            e.preventDefault();
            newIndex = currentIndex.current + 1;
            if (newIndex > lastIndex) newIndex = loop ? 0 : lastIndex;
          }
          break;
        case 'ArrowLeft':
          if (orientation !== 'vertical') {
            e.preventDefault();
            newIndex = currentIndex.current - 1;
            if (newIndex < 0) newIndex = loop ? lastIndex : 0;
          }
          break;
        case 'ArrowRight':
          if (orientation !== 'vertical') {
            e.preventDefault();
            newIndex = currentIndex.current + 1;
            if (newIndex > lastIndex) newIndex = loop ? 0 : lastIndex;
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect?.(currentIndex.current);
          return;
        default:
          return;
      }

      if (newIndex !== currentIndex.current) {
        // Remove focus from current item
        items[currentIndex.current]?.setAttribute('tabindex', '-1');
        
        // Focus new item
        currentIndex.current = newIndex;
        const newItem = items[newIndex];
        newItem?.setAttribute('tabindex', '0');
        newItem?.focus();
        
        // Announce to screen readers
        const label = newItem?.getAttribute('aria-label') || newItem?.textContent || '';
        keyboardNavigationSystem.announce(`${label}, ${newIndex + 1} of ${items.length}`);
      }
    };

    // Set up initial tabindex
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');
      item.addEventListener('keydown', handleKeyDown);
    });

    return () => {
      items.forEach(item => {
        item.removeEventListener('keydown', handleKeyDown);
      });
    };
  }, [items, orientation, loop, onSelect]);

  return {
    focusItem: (index: number) => {
      if (index >= 0 && index < items.length) {
        items[currentIndex.current]?.setAttribute('tabindex', '-1');
        currentIndex.current = index;
        items[index]?.setAttribute('tabindex', '0');
        items[index]?.focus();
      }
    },
    currentIndex: currentIndex.current,
  };
}