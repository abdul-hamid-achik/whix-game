import { z } from 'zod';
import hotkeys from 'hotkeys-js';
import { GameState } from '@/lib/stores/uiStore';

// Hotkey action schema
export const HotkeyActionSchema = z.object({
  id: z.string(),
  key: z.string(), // The key combination (e.g., 'ctrl+s', 'esc', '1')
  description: z.string(),
  category: z.enum(['navigation', 'gameplay', 'menu', 'accessibility', 'debug']),
  gameStates: z.array(z.nativeEnum(GameState)).optional(), // Only active in specific states
  global: z.boolean().default(false), // Active in all states
  handler: z.function().args().returns(z.void()),
  preventRepeat: z.boolean().default(true),
  allowInInput: z.boolean().default(false), // Allow when typing in input fields
});

export type HotkeyAction = z.infer<typeof HotkeyActionSchema>;

// Focus trap schema for modal/dialog navigation
export const FocusTrapSchema = z.object({
  container: typeof window !== 'undefined' ? z.instanceof(HTMLElement) : z.any(),
  initialFocus: typeof window !== 'undefined' ? z.instanceof(HTMLElement).optional() : z.any().optional(),
  returnFocus: typeof window !== 'undefined' ? z.instanceof(HTMLElement).optional() : z.any().optional(),
  allowEscape: z.boolean().default(true),
});

export type FocusTrap = z.infer<typeof FocusTrapSchema>;

// Keyboard navigation context schema
export const KeyboardNavigationContextSchema = z.object({
  currentGameState: z.nativeEnum(GameState),
  focusableElements: typeof window !== 'undefined' ? z.array(z.instanceof(HTMLElement)) : z.array(z.any()),
  currentFocusIndex: z.number(),
  isMenuOpen: z.boolean(),
  isPaused: z.boolean(),
  shortcuts: z.array(HotkeyActionSchema),
});

export type KeyboardNavigationContext = z.infer<typeof KeyboardNavigationContextSchema>;

// Default hotkeys for the game
const DEFAULT_HOTKEYS: Record<string, Omit<HotkeyAction, 'handler'>> = {
  // Global navigation
  OPEN_MENU: {
    id: 'open-menu',
    key: 'esc',
    description: 'Open/close main menu',
    category: 'navigation',
    global: true,
    preventRepeat: true,
    allowInInput: false,
  },
  HELP: {
    id: 'help',
    key: 'shift+/',
    description: 'Show keyboard shortcuts',
    category: 'accessibility',
    global: true,
    preventRepeat: true,
    allowInInput: false,
  },
  SEARCH: {
    id: 'search',
    key: 'ctrl+k,cmd+k',
    description: 'Open quick search',
    category: 'navigation',
    global: true,
    preventRepeat: true,
    allowInInput: false,
  },
  
  // Game state navigation
  GO_TO_HUB: {
    id: 'go-to-hub',
    key: 'h',
    description: 'Return to Courier Hub',
    category: 'navigation',
    gameStates: [
      GameState.AFTER_ACTION,
      GameState.PARTNER_SELECTION,
      GameState.MISSION_BRIEFING,
    ],
    global: false,
    preventRepeat: true,
    allowInInput: false,
  },
  
  // Hub actions
  VIEW_PARTNERS: {
    id: 'view-partners',
    key: 'p',
    description: 'Open Partner Management',
    category: 'menu',
    gameStates: [GameState.COURIER_HUB],
    global: false,
    preventRepeat: true,
    allowInInput: false,
  },
  VIEW_MISSIONS: {
    id: 'view-missions',
    key: 'm',
    description: 'View available missions',
    category: 'menu',
    gameStates: [GameState.COURIER_HUB],
    global: false,
    preventRepeat: true,
    allowInInput: false,
  },
  VIEW_SHOP: {
    id: 'view-shop',
    key: 's',
    description: 'Open Shop',
    category: 'menu',
    gameStates: [GameState.COURIER_HUB],
    global: false,
    preventRepeat: true,
    allowInInput: false,
  },
  GACHA_PULL: {
    id: 'gacha-pull',
    key: 'g',
    description: 'Open Gacha Recruitment',
    category: 'menu',
    gameStates: [GameState.COURIER_HUB],
    global: false,
    preventRepeat: true,
    allowInInput: false,
  },
  
  // Mission/Combat actions
  CONFIRM_ACTION: {
    id: 'confirm-action',
    key: 'space,enter',
    description: 'Confirm current action',
    category: 'gameplay',
    gameStates: [
      GameState.TACTICAL_COMBAT,
      GameState.EVENT_RESOLUTION,
      GameState.PARTNER_SELECTION,
    ],
    global: false,
    preventRepeat: true,
    allowInInput: false,
  },
  CANCEL_ACTION: {
    id: 'cancel-action',
    key: 'x,backspace',
    description: 'Cancel current action',
    category: 'gameplay',
    gameStates: [GameState.TACTICAL_COMBAT, GameState.EVENT_RESOLUTION],
    global: false,
    preventRepeat: true,
    allowInInput: false,
  },
  
  // Partner selection
  SELECT_PARTNER_1: {
    id: 'select-partner-1',
    key: '1',
    description: 'Select first partner',
    category: 'gameplay',
    gameStates: [GameState.PARTNER_SELECTION, GameState.TACTICAL_COMBAT],
    global: false,
    preventRepeat: true,
    allowInInput: false,
  },
  SELECT_PARTNER_2: {
    id: 'select-partner-2',
    key: '2',
    description: 'Select second partner',
    category: 'gameplay',
    gameStates: [GameState.PARTNER_SELECTION, GameState.TACTICAL_COMBAT],
    global: false,
    preventRepeat: true,
    allowInInput: false,
  },
  SELECT_PARTNER_3: {
    id: 'select-partner-3',
    key: '3',
    description: 'Select third partner',
    category: 'gameplay',
    gameStates: [GameState.PARTNER_SELECTION, GameState.TACTICAL_COMBAT],
    global: false,
    preventRepeat: true,
    allowInInput: false,
  },
  
  // Accessibility shortcuts
  INCREASE_TEXT_SIZE: {
    id: 'increase-text-size',
    key: 'ctrl+plus,cmd+plus',
    description: 'Increase text size',
    category: 'accessibility',
    global: true,
    preventRepeat: true,
    allowInInput: false,
  },
  DECREASE_TEXT_SIZE: {
    id: 'decrease-text-size',
    key: 'ctrl+minus,cmd+minus',
    description: 'Decrease text size',
    category: 'accessibility',
    global: true,
    preventRepeat: true,
    allowInInput: false,
  },
  TOGGLE_HIGH_CONTRAST: {
    id: 'toggle-high-contrast',
    key: 'alt+h',
    description: 'Toggle high contrast mode',
    category: 'accessibility',
    global: true,
    preventRepeat: true,
    allowInInput: false,
  },
  
  // Navigation within lists/grids
  NAVIGATE_UP: {
    id: 'navigate-up',
    key: 'up,w',
    description: 'Navigate up',
    category: 'navigation',
    global: false,
    preventRepeat: false,
    allowInInput: false,
  },
  NAVIGATE_DOWN: {
    id: 'navigate-down',
    key: 'down,s',
    description: 'Navigate down',
    category: 'navigation',
    global: false,
    preventRepeat: false,
    allowInInput: false,
  },
  NAVIGATE_LEFT: {
    id: 'navigate-left',
    key: 'left,a',
    description: 'Navigate left',
    category: 'navigation',
    global: false,
    preventRepeat: false,
    allowInInput: false,
  },
  NAVIGATE_RIGHT: {
    id: 'navigate-right',
    key: 'right,d',
    description: 'Navigate right',
    category: 'navigation',
    global: false,
    preventRepeat: false,
    allowInInput: false,
  },
  
  // Tab navigation
  NEXT_ELEMENT: {
    id: 'next-element',
    key: 'tab',
    description: 'Focus next element',
    category: 'navigation',
    global: true,
    preventRepeat: false,
    allowInInput: true,
  },
  PREVIOUS_ELEMENT: {
    id: 'previous-element',
    key: 'shift+tab',
    description: 'Focus previous element',
    category: 'navigation',
    global: true,
    preventRepeat: false,
    allowInInput: true,
  },
};

export class KeyboardNavigationSystem {
  private static instance: KeyboardNavigationSystem;
  private registeredHotkeys: Map<string, HotkeyAction> = new Map();
  private focusTraps: FocusTrap[] = [];
  private currentGameState: GameState = GameState.COURIER_HUB;
  private isEnabled: boolean = true;
  
  private constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }
  
  static getInstance(): KeyboardNavigationSystem {
    if (!this.instance) {
      this.instance = new KeyboardNavigationSystem();
    }
    return this.instance;
  }
  
  private initialize() {
    // Configure hotkeys
    hotkeys.filter = (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName;
      
      // Check if we should allow hotkeys in input fields
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName);
      if (isInput) {
        const hotkey = this.getHotkeyForEvent(event);
        return hotkey?.allowInInput || false;
      }
      
      return true;
    };
    
    // Set up focus management
    this.setupFocusManagement();
    
    // Set up ARIA live region for announcements
    this.setupAriaAnnouncements();
  }
  
  private setupFocusManagement() {
    if (typeof document === 'undefined') return;
    
    // Add focus visible styles when using keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });
    
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }
  
  private setupAriaAnnouncements() {
    if (typeof document === 'undefined') return;
    
    // Create ARIA live region for screen reader announcements
    const liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only'; // Screen reader only
    document.body.appendChild(liveRegion);
  }
  
  // Announce message to screen readers
  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (typeof document === 'undefined') return;
    
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }
  
  // Register a hotkey
  registerHotkey(action: HotkeyAction) {
    const { key, global, gameStates } = action;
    
    this.registeredHotkeys.set(action.id, action);
    
    hotkeys(key, (event) => {
      event.preventDefault();
      
      // Check if hotkey is active in current game state
      if (!global && gameStates && !gameStates.includes(this.currentGameState)) {
        return;
      }
      
      // Execute handler
      action.handler();
      
      // Announce action to screen readers
      this.announce(`${action.description} activated`);
    });
  }
  
  // Unregister a hotkey
  unregisterHotkey(id: string) {
    const action = this.registeredHotkeys.get(id);
    if (action) {
      hotkeys.unbind(action.key);
      this.registeredHotkeys.delete(id);
    }
  }
  
  // Update current game state
  setGameState(state: GameState) {
    this.currentGameState = state;
    this.announce(`Entered ${state.replace(/_/g, ' ').toLowerCase()}`);
  }
  
  // Get hotkey for event
  private getHotkeyForEvent(event: KeyboardEvent): HotkeyAction | undefined {
    // Build key string from event
    const parts: string[] = [];
    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    if (event.metaKey) parts.push('cmd');
    parts.push(event.key.toLowerCase());
    
    const key = parts.join('+');
    
    return Array.from(this.registeredHotkeys.values()).find(h => 
      h.key.split(',').some(k => k.trim() === key)
    );
  }
  
  // Create focus trap for modals/dialogs
  createFocusTrap(options: FocusTrap) {
    if (typeof document === 'undefined') return;
    
    const focusableSelector = [
      'a[href]:not([disabled])',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');
    
    const focusableElements = Array.from(
      options.container.querySelectorAll(focusableSelector)
    ) as HTMLElement[];
    
    if (focusableElements.length === 0) return;
    
    // Store current focus
    const previouslyFocused = document.activeElement as HTMLElement;
    
    // Focus initial element or first focusable
    const initialFocus = options.initialFocus || focusableElements[0];
    initialFocus.focus();
    
    // Trap focus handler
    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    };
    
    // Escape handler
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && options.allowEscape) {
        this.removeFocusTrap(options.container);
      }
    };
    
    options.container.addEventListener('keydown', trapFocus);
    options.container.addEventListener('keydown', escapeHandler);
    
    this.focusTraps.push({
      ...options,
      container: options.container,
      returnFocus: options.returnFocus || previouslyFocused,
    });
  }
  
  // Remove focus trap
  removeFocusTrap(container: HTMLElement) {
    const index = this.focusTraps.findIndex(trap => trap.container === container);
    if (index !== -1) {
      const trap = this.focusTraps[index];
      trap.returnFocus?.focus();
      this.focusTraps.splice(index, 1);
    }
  }
  
  // Get all registered hotkeys
  getHotkeys(category?: string): HotkeyAction[] {
    const hotkeys = Array.from(this.registeredHotkeys.values());
    if (category) {
      return hotkeys.filter(h => h.category === category);
    }
    return hotkeys;
  }
  
  // Get hotkeys for current game state
  getActiveHotkeys(): HotkeyAction[] {
    return Array.from(this.registeredHotkeys.values()).filter(h => 
      h.global || (h.gameStates && h.gameStates.includes(this.currentGameState))
    );
  }
  
  // Enable/disable keyboard navigation
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      hotkeys.unbind();
    } else {
      // Re-register all hotkeys
      this.registeredHotkeys.forEach(action => {
        this.registerHotkey(action);
      });
    }
  }
  
  // Get default hotkeys configuration
  getDefaultHotkeys(): typeof DEFAULT_HOTKEYS {
    return DEFAULT_HOTKEYS;
  }
}

// Export singleton instance
export const keyboardNavigationSystem = KeyboardNavigationSystem.getInstance();