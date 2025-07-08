import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useGameStateTransition } from '@/lib/hooks/useGameStateTransition';
import { useUIStore, GameState } from '@/lib/stores/uiStore';
import { useGameStore } from '@/lib/stores/gameStore';

// Mock requestAnimationFrame
let rafCallbacks: FrameRequestCallback[] = [];
let rafId = 0;

const mockRequestAnimationFrame = (callback: FrameRequestCallback) => {
  rafCallbacks.push(callback);
  return ++rafId;
};

const mockCancelAnimationFrame = (id: number) => {
  // Remove callback if exists
};

const flushAnimationFrames = (timestamp = 0) => {
  const callbacks = [...rafCallbacks];
  rafCallbacks = [];
  callbacks.forEach(cb => cb(timestamp));
};

// Mock Date.now for consistent timing
let mockNow = 0;
const originalDateNow = Date.now;

beforeEach(() => {
  global.requestAnimationFrame = vi.fn(mockRequestAnimationFrame) as any;
  global.cancelAnimationFrame = vi.fn(mockCancelAnimationFrame) as any;
  rafCallbacks = [];
  rafId = 0;
  mockNow = 1000;
  Date.now = vi.fn(() => mockNow);
});

afterEach(() => {
  Date.now = originalDateNow;
});

describe('useGameStateTransition Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset stores - Note: Initial state in uiStore is COURIER_HUB, not MAIN_MENU
    const { reset } = useUIStore.getState();
    reset();
    
    useGameStore.setState({
      currentLocation: 'polanco-central',
    });
  });

  it('should provide current transition state', () => {
    const { result } = renderHook(() => useGameStateTransition());
    
    expect(result.current.isTransitioning).toBe(false);
    expect(result.current.fromState).toBeNull();
    expect(result.current.toState).toBeNull();
    expect(result.current.transitionProgress).toBe(0);
    expect(result.current.transitionStyles).toBeDefined();
  });

  it('should detect state changes and start transition', async () => {
    // Test that transitions occur when store changes
    // The hook responds to store changes, but we need to test from a stable initial state
    
    // Start with MAIN_MENU state
    act(() => {
      useUIStore.setState({
        currentState: GameState.MAIN_MENU,
        previousState: GameState.COURIER_HUB,
        isLoading: false,
      });
    });
    
    const { result } = renderHook(() => useGameStateTransition());
    
    // Should start transitioning immediately since previousState !== currentState
    expect(result.current.isTransitioning).toBe(true);
    expect(result.current.fromState).toBe(GameState.COURIER_HUB);
    expect(result.current.toState).toBe(GameState.MAIN_MENU);
    
    // Verify animation frame was requested
    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });

  it('should provide transition styles based on state change', async () => {
    // Trigger a state change that causes a transition
    act(() => {
      useUIStore.setState({
        currentState: GameState.MAIN_MENU,
        previousState: GameState.COURIER_HUB,
        isLoading: false,
      });
    });
    
    const { result } = renderHook(() => useGameStateTransition());
    
    // Should have transition styles (default is fade)
    const styles = result.current.transitionStyles;
    expect(styles).toBeDefined();
    expect(typeof styles).toBe('object');
    
    // For fade transition, should have opacity
    expect(styles).toHaveProperty('opacity');
    expect(styles.opacity).toBe(0); // Initial progress is 0
  });

  it('should handle different transition types', async () => {
    const { result, rerender } = renderHook(() => useGameStateTransition());
    const { setState } = useUIStore.getState();
    
    // Setup initial state
    act(() => {
      setState(GameState.COURIER_HUB);
    });
    
    // Test slide transition
    act(() => {
      setState(GameState.MISSION_BRIEFING);
    });
    
    await act(async () => {
      rerender();
    });
    
    expect(result.current.isTransitioning).toBe(true);
    let styles = result.current.transitionStyles;
    expect(styles).toHaveProperty('transform');
    expect(styles).toHaveProperty('opacity');
    
    // Complete transition
    act(() => {
      mockNow += 500;
      flushAnimationFrames();
    });
    
    await act(async () => {
      rerender();
    });
    
    // Setup for glitch transition
    act(() => {
      setState(GameState.ADVENTURE_MAP);
    });
    
    await act(async () => {
      rerender();
    });
    
    // Test glitch transition
    act(() => {
      setState(GameState.TACTICAL_COMBAT);
    });
    
    await act(async () => {
      rerender();
    });
    
    expect(result.current.isTransitioning).toBe(true);
    styles = result.current.transitionStyles;
    expect(styles).toBeDefined();
    
    // Complete transition
    act(() => {
      mockNow += 500;
      flushAnimationFrames();
    });
    
    await act(async () => {
      rerender();
    });
    
    // Setup for soviet transition
    act(() => {
      setState(GameState.MISSION_BRIEFING);
    });
    
    await act(async () => {
      rerender();
    });
    
    // Test soviet transition
    act(() => {
      setState(GameState.ADVENTURE_MAP);
    });
    
    await act(async () => {
      rerender();
    });
    
    expect(result.current.isTransitioning).toBe(true);
    styles = result.current.transitionStyles;
    expect(styles).toBeDefined();
  });

  it('should track transition progress', async () => {
    const { result, rerender } = renderHook(() => useGameStateTransition());
    const { setState } = useUIStore.getState();
    
    // Setup initial state
    act(() => {
      setState(GameState.COURIER_HUB);
    });
    
    // Trigger transition
    act(() => {
      setState(GameState.PARTNER_SELECTION);
    });
    
    await act(async () => {
      rerender();
    });
    
    // Initial progress should be 0
    expect(result.current.transitionProgress).toBe(0);
    expect(result.current.isTransitioning).toBe(true);
    
    // Advance time and trigger animation frame
    act(() => {
      mockNow += 150; // Half of default 300ms duration
      flushAnimationFrames();
    });
    
    await act(async () => {
      rerender();
    });
    
    // Progress should be around 0.5
    expect(result.current.transitionProgress).toBeCloseTo(0.5, 1);
    
    // Complete transition
    act(() => {
      mockNow += 150;
      flushAnimationFrames();
    });
    
    await act(async () => {
      rerender();
    });
    
    // Should complete transition
    expect(result.current.isTransitioning).toBe(false);
    expect(result.current.transitionProgress).toBe(0);
  });

  it('should apply Soviet-Aztec themed transitions', async () => {
    const { result, rerender } = renderHook(() => useGameStateTransition());
    const { setState } = useUIStore.getState();
    
    // Setup initial state
    act(() => {
      setState(GameState.MISSION_BRIEFING);
    });
    
    // Trigger soviet transition
    act(() => {
      setState(GameState.ADVENTURE_MAP);
    });
    
    await act(async () => {
      rerender();
    });
    
    const styles = result.current.transitionStyles;
    expect(styles).toBeDefined();
    
    // Should have Soviet-Aztec styling
    expect(styles).toHaveProperty('opacity');
    expect(styles).toHaveProperty('transform');
    
    // During first half of transition, should have background pattern
    if (result.current.transitionProgress < 0.5) {
      expect(styles).toHaveProperty('backgroundImage');
      expect(styles.backgroundImage).toContain('repeating-linear-gradient');
    }
  });
  
  it('should clean up animation on unmount', async () => {
    const { result, unmount } = renderHook(() => useGameStateTransition());
    const { setState } = useUIStore.getState();
    
    // Start a transition
    act(() => {
      setState(GameState.COURIER_HUB);
    });
    
    // Unmount during transition
    unmount();
    
    // Animation frames should not cause errors
    expect(() => {
      mockNow += 500;
      flushAnimationFrames();
    }).not.toThrow();
  });
});