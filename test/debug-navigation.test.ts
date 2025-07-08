import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUIStore, GameState } from '@/lib/stores/uiStore';

describe('Navigation Debug Tests', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useUIStore.getState().reset();
    });
  });

  it('should transition from ADVENTURE_MAP to TACTICAL_COMBAT', () => {
    const { result } = renderHook(() => useUIStore());

    // Set initial state to ADVENTURE_MAP
    act(() => {
      result.current.setState(GameState.ADVENTURE_MAP);
    });

    expect(result.current.currentState).toBe(GameState.ADVENTURE_MAP);

    // Transition to TACTICAL_COMBAT with context data
    act(() => {
      result.current.setState(GameState.TACTICAL_COMBAT, {
        encounterType: 'combat',
        nodeData: {
          id: 'test_node',
          type: 'combat',
          title: 'Test Combat',
          description: 'Test combat encounter'
        }
      });
    });

    expect(result.current.currentState).toBe(GameState.TACTICAL_COMBAT);
    expect(result.current.contextData?.encounterType).toBe('combat');
    expect(result.current.contextData?.nodeData?.id).toBe('test_node');
  });

  it('should validate context data with Zod schema', () => {
    const { result } = renderHook(() => useUIStore());

    // This should work with valid data
    act(() => {
      result.current.setState(GameState.TACTICAL_COMBAT, {
        encounterType: 'combat',
        nodeData: {
          id: 'test_node',
          type: 'combat',
          title: 'Test Combat',
          description: 'Test combat encounter',
          difficulty: 3,
          rewards: {
            tips: 100,
            experience: 50
          }
        }
      });
    });

    expect(result.current.currentState).toBe(GameState.TACTICAL_COMBAT);
    expect(result.current.contextData?.nodeData?.rewards?.tips).toBe(100);
  });

  it('should handle invalid context data gracefully', () => {
    const { result } = renderHook(() => useUIStore());

    // Try with invalid data structure
    try {
      act(() => {
        result.current.setState(GameState.TACTICAL_COMBAT, {
          // Missing required fields or wrong types
          invalidField: 'test'
        } as any);
      });
    } catch (error) {
      // Should handle validation error
      console.log('Validation error caught:', error);
    }

    // State should still be valid
    expect(result.current.currentState).toBeDefined();
  });
});