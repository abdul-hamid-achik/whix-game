import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { keyboardNavigationSystem } from '@/lib/systems/keyboard-navigation-system';
import { GameState } from '@/lib/stores/uiStore';
import hotkeys from 'hotkeys-js';

// Access the mocked hotkeys function
const mockHotkeys = hotkeys as any;

// Mock hotkeys-js
vi.mock('hotkeys-js', () => {
  const mockHotkeys = vi.fn();
  mockHotkeys.unbind = vi.fn();
  mockHotkeys.filter = undefined;
  return {
    default: mockHotkeys,
  };
});

describe('KeyboardNavigationSystem', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock DOM methods
    global.document = {
      createElement: vi.fn(() => ({
        id: '',
        setAttribute: vi.fn(),
        className: '',
      })),
      body: {
        appendChild: vi.fn(),
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
        },
      },
      addEventListener: vi.fn(),
      getElementById: vi.fn(() => ({
        setAttribute: vi.fn(),
        textContent: '',
      })),
      activeElement: null,
    } as any;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Hotkey Registration', () => {
    it('should register hotkeys with proper handlers', () => {
      const mockHandler = vi.fn();
      const action = {
        id: 'test-action',
        key: 'ctrl+s',
        description: 'Test save action',
        category: 'navigation' as const,
        global: true,
        handler: mockHandler,
        preventRepeat: true,
        allowInInput: false,
      };

      keyboardNavigationSystem.registerHotkey(action);

      // Verify hotkeys was called
      expect(mockHotkeys).toHaveBeenCalledWith('ctrl+s', expect.any(Function));
    });

    it('should unregister hotkeys', () => {
      const action = {
        id: 'test-action',
        key: 'ctrl+s',
        description: 'Test save action',
        category: 'navigation' as const,
        global: true,
        handler: vi.fn(),
        preventRepeat: true,
        allowInInput: false,
      };

      keyboardNavigationSystem.registerHotkey(action);
      keyboardNavigationSystem.unregisterHotkey('test-action');

      expect(mockHotkeys.unbind).toHaveBeenCalledWith('ctrl+s');
    });
  });

  describe('Game State Management', () => {
    it('should update game state and announce changes', () => {
      const announceSpy = vi.spyOn(keyboardNavigationSystem, 'announce');
      
      keyboardNavigationSystem.setGameState(GameState.COURIER_HUB);
      
      expect(announceSpy).toHaveBeenCalledWith('Entered courier hub');
    });

    it('should filter hotkeys based on game state', () => {
      const globalAction = {
        id: 'global-action',
        key: 'esc',
        description: 'Global action',
        category: 'navigation' as const,
        global: true,
        handler: vi.fn(),
        preventRepeat: true,
        allowInInput: false,
      };

      const hubAction = {
        id: 'hub-action',
        key: 'p',
        description: 'Hub specific action',
        category: 'menu' as const,
        gameStates: [GameState.COURIER_HUB],
        global: false,
        handler: vi.fn(),
        preventRepeat: true,
        allowInInput: false,
      };

      keyboardNavigationSystem.registerHotkey(globalAction);
      keyboardNavigationSystem.registerHotkey(hubAction);
      keyboardNavigationSystem.setGameState(GameState.COURIER_HUB);

      const activeHotkeys = keyboardNavigationSystem.getActiveHotkeys();
      
      expect(activeHotkeys).toHaveLength(2);
      expect(activeHotkeys.map(h => h.id)).toContain('global-action');
      expect(activeHotkeys.map(h => h.id)).toContain('hub-action');

      // Change state and check again
      keyboardNavigationSystem.setGameState(GameState.TACTICAL_COMBAT);
      const combatHotkeys = keyboardNavigationSystem.getActiveHotkeys();
      
      expect(combatHotkeys.map(h => h.id)).toContain('global-action');
      expect(combatHotkeys.map(h => h.id)).not.toContain('hub-action');
    });
  });

  describe('Focus Management', () => {
    it('should create focus trap for modals', () => {
      const mockContainer = {
        querySelectorAll: vi.fn(() => [
          { focus: vi.fn() },
          { focus: vi.fn() },
        ]),
        addEventListener: vi.fn(),
      };

      keyboardNavigationSystem.createFocusTrap({
        container: mockContainer as any,
        allowEscape: true,
      });

      expect(mockContainer.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should remove focus trap and restore focus', () => {
      const mockContainer = {
        querySelectorAll: vi.fn(() => [
          { focus: vi.fn() }, // Need at least one focusable element
        ]),
        addEventListener: vi.fn(),
      };
      
      const mockReturnFocus = { focus: vi.fn() };

      keyboardNavigationSystem.createFocusTrap({
        container: mockContainer as any,
        returnFocus: mockReturnFocus as any,
        allowEscape: true,
      });

      keyboardNavigationSystem.removeFocusTrap(mockContainer as any);

      expect(mockReturnFocus.focus).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should announce messages to screen readers', () => {
      const mockLiveRegion = {
        setAttribute: vi.fn(),
        textContent: '',
      };
      
      global.document.getElementById = vi.fn(() => mockLiveRegion);

      keyboardNavigationSystem.announce('Test announcement', 'assertive');

      expect(mockLiveRegion.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
      expect(mockLiveRegion.textContent).toBe('Test announcement');
    });

    it('should get hotkeys by category', () => {
      // Create a fresh instance to avoid interference from other tests
      // Since KeyboardNavigationSystem is a singleton, we need to clear its state
      // Let's first clear any existing hotkeys by getting all and unregistering them
      const existingHotkeys = keyboardNavigationSystem.getHotkeys();
      existingHotkeys.forEach(hotkey => {
        keyboardNavigationSystem.unregisterHotkey(hotkey.id);
      });
      
      const navAction = {
        id: 'nav-action',
        key: 'tab',
        description: 'Navigation action',
        category: 'navigation' as const,
        global: true,
        handler: vi.fn(),
        preventRepeat: false,
        allowInInput: true,
      };

      const gameplayAction = {
        id: 'game-action',
        key: 'space',
        description: 'Gameplay action',
        category: 'gameplay' as const,
        global: false,
        handler: vi.fn(),
        preventRepeat: true,
        allowInInput: false,
      };

      keyboardNavigationSystem.registerHotkey(navAction);
      keyboardNavigationSystem.registerHotkey(gameplayAction);

      const navHotkeys = keyboardNavigationSystem.getHotkeys('navigation');
      const gameplayHotkeys = keyboardNavigationSystem.getHotkeys('gameplay');

      expect(navHotkeys).toHaveLength(1);
      expect(navHotkeys[0].id).toBe('nav-action');
      expect(gameplayHotkeys).toHaveLength(1);
      expect(gameplayHotkeys[0].id).toBe('game-action');
    });
  });

  describe('Default Hotkeys', () => {
    it('should provide default hotkey configuration', () => {
      const defaultHotkeys = keyboardNavigationSystem.getDefaultHotkeys();
      
      expect(defaultHotkeys).toHaveProperty('OPEN_MENU');
      expect(defaultHotkeys).toHaveProperty('VIEW_PARTNERS');
      expect(defaultHotkeys).toHaveProperty('NAVIGATE_UP');
      expect(defaultHotkeys).toHaveProperty('INCREASE_TEXT_SIZE');
      
      // Verify Soviet-Aztec theme appropriate hotkeys
      expect(defaultHotkeys.GO_TO_HUB.description).toContain('Courier Hub');
      expect(defaultHotkeys.VIEW_MISSIONS.description).toContain('missions');
    });
  });

  describe('Enable/Disable System', () => {
    it('should enable and disable keyboard navigation', () => {
      keyboardNavigationSystem.setEnabled(false);
      expect(mockHotkeys.unbind).toHaveBeenCalled();

      // Clear previous calls
      vi.clearAllMocks();
      
      // Register a hotkey first
      const action = {
        id: 'test-action',
        key: 'ctrl+t',
        description: 'Test action',
        category: 'navigation' as const,
        global: true,
        handler: vi.fn(),
        preventRepeat: true,
        allowInInput: false,
      };
      keyboardNavigationSystem.registerHotkey(action);
      
      // Now enable to test re-registration
      keyboardNavigationSystem.setEnabled(true);
      // Should re-register the hotkey
      expect(mockHotkeys).toHaveBeenCalledWith('ctrl+t', expect.any(Function));
    });
  });
});