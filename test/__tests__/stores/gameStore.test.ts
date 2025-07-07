import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useGameStore } from '@/lib/stores/gameStore';

describe('Game Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    useGameStore.setState({
      currentTips: 1000,
      totalTipsEarned: 0,
      companyStars: 0,
      tipCutPercentage: 75,
      starFragments: 0,
      level: 1,
      experience: 0,
      activeBoosts: [],
    });
  });

  describe('Tip Management', () => {
    it('calculates Whix cut correctly', () => {
      const { result } = renderHook(() => useGameStore());
      
      const { playerShare, whixCut } = result.current.calculateWhixCut(100);
      expect(whixCut).toBe(75); // 75% cut
      expect(playerShare).toBe(25); // Player keeps 25%
    });

    it('reduces tip cut with company stars', () => {
      const { result } = renderHook(() => useGameStore());
      
      // Give player 2 stars (should reduce cut by 30%)
      act(() => {
        useGameStore.setState({ 
          companyStars: 2,
          tipCutPercentage: 45 // 75 - (2 * 15)
        });
      });
      
      const { playerShare, whixCut } = result.current.calculateWhixCut(100);
      expect(whixCut).toBe(45);
      expect(playerShare).toBe(55);
    });

    it('earns tips with boost multiplier', () => {
      const { result } = renderHook(() => useGameStore());
      
      // Add a 50% tip boost
      act(() => {
        result.current.addBoost({
          type: 'tips',
          value: 0.5,
          expiresAt: Date.now() + 60000,
        });
      });
      
      act(() => {
        result.current.earnTips(100);
      });
      
      // With 50% boost: 150 tips, player keeps 25% = 37.5 (rounds to 38)
      expect(result.current.currentTips).toBe(1038); // 1000 + 38 (Math.floor of 37.5 after calculations)
      expect(result.current.totalTipsEarned).toBe(150);
    });

    it('spends tips correctly', () => {
      const { result } = renderHook(() => useGameStore());
      
      // Successful spend
      act(() => {
        const success = result.current.spendTips(500);
        expect(success).toBe(true);
      });
      
      expect(result.current.currentTips).toBe(500);
      
      // Failed spend (not enough tips)
      act(() => {
        const failure = result.current.spendTips(600);
        expect(failure).toBe(false);
      });
      
      expect(result.current.currentTips).toBe(500);
    });
  });

  describe('Star System', () => {
    it('upgrades company star with enough fragments', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        // Need 10 fragments for first star
        result.current.earnStarFragment(10);
      });
      
      let upgraded;
      act(() => {
        upgraded = result.current.upgradeCompanyStar();
      });
      
      expect(upgraded).toBe(true);
      expect(result.current.companyStars).toBe(1);
      expect(result.current.starFragments).toBe(0);
      expect(result.current.tipCutPercentage).toBe(60); // 75 - 15
    });

    it('requires more fragments for each star level', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        useGameStore.setState({ companyStars: 2, starFragments: 20 });
      });
      
      // Should need 30 fragments for 3rd star
      let upgraded;
      act(() => {
        upgraded = result.current.upgradeCompanyStar();
      });
      expect(upgraded).toBe(false); // Not enough fragments
      
      act(() => {
        result.current.earnStarFragment(10); // Now have 30
      });
      
      let upgraded2;
      act(() => {
        upgraded2 = result.current.upgradeCompanyStar();
      });
      expect(upgraded2).toBe(true);
      expect(result.current.companyStars).toBe(3);
    });

    it('caps at 5 stars maximum', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        useGameStore.setState({ 
          companyStars: 5, 
          starFragments: 100,
          tipCutPercentage: 0 
        });
      });
      
      const upgraded = result.current.upgradeCompanyStar();
      expect(upgraded).toBe(false);
      expect(result.current.companyStars).toBe(5);
    });
  });

  describe('Experience and Leveling', () => {
    it('gains experience and levels up', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.gainExperience(150); // Level 1 needs 100 XP
      });
      
      expect(result.current.level).toBe(2);
      expect(result.current.experience).toBe(50); // 150 - 100
    });

    it('applies experience boost', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.addBoost({
          type: 'experience',
          value: 1, // 100% boost (doubles XP)
          expiresAt: Date.now() + 60000,
        });
      });
      
      act(() => {
        result.current.gainExperience(50);
      });
      
      // With 100% boost: 50 * 2 = 100 XP
      // Level 1 needs 100 XP to level up, so we'll level up to 2 with 0 XP remaining
      expect(result.current.level).toBe(2);
      expect(result.current.experience).toBe(0);
    });
  });

  describe('Boost System', () => {
    it('removes expired boosts', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.addBoost({
          type: 'tips',
          value: 0.5,
          expiresAt: Date.now() - 1000, // Already expired
        });
      });
      
      expect(result.current.activeBoosts).toHaveLength(1);
      
      act(() => {
        result.current.removeExpiredBoosts();
      });
      
      expect(result.current.activeBoosts).toHaveLength(0);
    });

    it('stacks multiple boosts of same type', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.addBoost({
          type: 'tips',
          value: 0.5,
          expiresAt: Date.now() + 60000,
        });
        result.current.addBoost({
          type: 'tips',
          value: 0.3,
          expiresAt: Date.now() + 60000,
        });
      });
      
      const multiplier = result.current.getActiveBoostMultiplier('tips');
      expect(multiplier).toBe(1.8); // 1 + 0.5 + 0.3
    });

    it('handles "all" type boosts', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.addBoost({
          type: 'all',
          value: 0.2,
          expiresAt: Date.now() + 60000,
        });
      });
      
      expect(result.current.getActiveBoostMultiplier('tips')).toBe(1.2);
      expect(result.current.getActiveBoostMultiplier('experience')).toBe(1.2);
      expect(result.current.getActiveBoostMultiplier('trait')).toBe(1.2);
    });
  });
});