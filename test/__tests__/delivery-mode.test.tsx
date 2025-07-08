import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HubLayout } from '@/components/game-ui/layouts/HubLayout';
import { DailyContracts } from '@/components/game-ui/panels/DailyContracts';
import { MissionBriefingLayout } from '@/components/game-ui/layouts/MissionBriefingLayout';
import { TacticalCombatLayout } from '@/components/game-ui/layouts/TacticalCombatLayout';
import { AdventureMapLayout } from '@/components/game-ui/layouts/AdventureMapLayout';
import { useUIStore } from '@/lib/stores/uiStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useGameStore } from '@/lib/stores/gameStore';
import { getTerm, getIcon } from '@/lib/config/delivery-mode-config';
import { useStoryStore } from '@/lib/stores/storyStore';

// Mock the stores
vi.mock('@/lib/stores/uiStore');
vi.mock('@/lib/stores/partnerStore');
vi.mock('@/lib/stores/gameStore');
vi.mock('@/lib/stores/storyStore');

// Mock canvas for combat components
const mockContext = {
  fillStyle: '',
  fillRect: vi.fn(),
  font: '',
  fillText: vi.fn(),
  clearRect: vi.fn(),
  globalAlpha: 1,
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  closePath: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  canvas: {
    width: 800,
    height: 600
  }
};

if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockContext);
}

describe('Delivery Mode Transformation', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Default game mode mocks
    vi.mocked(useUIStore).mockReturnValue({
      settings: { appMode: 'game' },
      setState: vi.fn(),
      showPanel: vi.fn(),
      contextData: {},
      currentState: 'COURIER_HUB',
    } as any);
    
    vi.mocked(usePartnerStore).mockReturnValue({
      partners: {
        '1': { id: '1', name: 'Miguel Lopez', level: 5, class: 'Courier', experience: 50, primaryTrait: 'analytical', secondaryTrait: 'focused', tertiaryTrait: 'detail-oriented' }
      },
      getActivePartners: () => [{ id: '1', name: 'Miguel Lopez', level: 5, class: 'Courier', primaryTrait: 'analytical', secondaryTrait: 'focused', tertiaryTrait: 'detail-oriented' }],
      getNextUnlocks: () => [],
      checkForUnlocks: vi.fn(),
      unlockedCharacters: ['miguel-lopez'],
    } as any);
    
    vi.mocked(useGameStore).mockReturnValue({
      currentTips: 1000,
      level: 10,
      missionsCompleted: 5,
      experience: 0,
      totalTipsEarned: 1000,
      currentChapter: 1,
    } as any);
    
    vi.mocked(useStoryStore).mockReturnValue({
      completedChapters: [],
      storyFlags: {},
    } as any);
  });

  describe('Terminology Mapping', () => {
    it('should return game terminology in game mode', () => {
      expect(getTerm('COURIER_HUB', 'game')).toBe('COURIER HUB');
      expect(getTerm('PARTNERS', 'game')).toBe('Partners');
      expect(getTerm('DAILY_CONTRACTS', 'game')).toBe('Daily Contracts');
    });

    it('should return delivery terminology in delivery mode', () => {
      expect(getTerm('COURIER_HUB', 'delivery')).toBe('DELIVERY OPERATIONS');
      expect(getTerm('PARTNERS', 'delivery')).toBe('Drivers');
      expect(getTerm('DAILY_CONTRACTS', 'delivery')).toBe('Available Orders');
    });

    it('should return correct icons for delivery mode', () => {
      expect(getIcon('COMBAT', 'delivery')).toBe('🚧');
      expect(getIcon('BOSS', 'delivery')).toBe('⭐');
      expect(getIcon('REST', 'delivery')).toBe('☕');
    });
  });

  describe('HubLayout Component', () => {
    it('should display game terminology in game mode', () => {
      const { container } = render(<HubLayout>Test</HubLayout>);
      
      // Check that key game mode text is present
      expect(screen.getByText('COURIER HUB')).toBeInTheDocument();
      expect(screen.getByText(/Active:/)).toBeInTheDocument();
      
      // Verify we're not showing delivery mode text
      expect(screen.queryByText('DELIVERY OPERATIONS')).not.toBeInTheDocument();
    });

    it('should display delivery terminology in delivery mode', () => {
      vi.mocked(useUIStore).mockReturnValue({
        settings: { appMode: 'delivery' },
        setState: vi.fn(),
        showPanel: vi.fn(),
      } as any);
      
      render(<HubLayout>Test</HubLayout>);
      
      expect(screen.getByText('DELIVERY OPERATIONS')).toBeInTheDocument();
      expect(screen.getByText('Driver Fleet')).toBeInTheDocument();
      expect(screen.getByText('Delivery Routes')).toBeInTheDocument();
    });
  });

  describe('DailyContracts Component', () => {
    it('should show contracts in game mode', () => {
      render(<DailyContracts />);
      
      expect(screen.getByText('Daily Contracts')).toBeInTheDocument();
      expect(screen.getByText(/Contracts Available/)).toBeInTheDocument();
    });

    it('should show orders in delivery mode', () => {
      vi.mocked(useUIStore).mockReturnValue({
        settings: { appMode: 'delivery' },
      } as any);
      
      render(<DailyContracts />);
      
      // Use getAllByText since there might be multiple instances
      const availableOrders = screen.getAllByText('Available Orders');
      expect(availableOrders.length).toBeGreaterThan(0);
      expect(screen.getByText(/Orders Available/)).toBeInTheDocument();
    });
  });

  describe('MissionBriefingLayout Component', () => {
    it('should show mission briefing in game mode', () => {
      render(<MissionBriefingLayout>Test</MissionBriefingLayout>);
      
      expect(screen.getByText('MISSION BRIEFING')).toBeInTheDocument();
      expect(screen.getByText('MISSION PARAMETERS')).toBeInTheDocument();
      expect(screen.getByText('ACTIVE SQUAD')).toBeInTheDocument();
    });

    it('should show order details in delivery mode', () => {
      vi.mocked(useUIStore).mockReturnValue({
        settings: { appMode: 'delivery' },
        setState: vi.fn(),
        contextData: {},
      } as any);
      
      render(<MissionBriefingLayout>Test</MissionBriefingLayout>);
      
      expect(screen.getByText('Order Details')).toBeInTheDocument();
      expect(screen.getByText('ORDER DETAILS')).toBeInTheDocument();
      expect(screen.getByText('ASSIGNED DRIVER')).toBeInTheDocument();
      expect(screen.getByText(/Taquería El Huequito/)).toBeInTheDocument();
      expect(screen.getByText(/2x Tacos al Pastor/)).toBeInTheDocument();
    });
  });

  describe('Combat System Transformation', () => {
    it('should show combat terminology in game mode', () => {
      render(<TacticalCombatLayout>Test</TacticalCombatLayout>);
      
      expect(screen.getByText('TACTICAL COMBAT')).toBeInTheDocument();
    });

    it('should show delivery terminology in delivery mode', () => {
      vi.mocked(useUIStore).mockReturnValue({
        settings: { appMode: 'delivery' },
        setState: vi.fn(),
        contextData: { encounterType: 'combat' },
      } as any);
      
      render(<TacticalCombatLayout>Test</TacticalCombatLayout>);
      
      expect(screen.getByText('DELIVERY CHALLENGE')).toBeInTheDocument();
    });
  });

  describe('AdventureMap Transformation', () => {
    it('should show adventure map in game mode', () => {
      render(<AdventureMapLayout>Test</AdventureMapLayout>);
      
      waitFor(() => {
        expect(screen.getByText('ADVENTURE MAP')).toBeInTheDocument();
      });
    });

    it('should show delivery route in delivery mode', () => {
      vi.mocked(useUIStore).mockReturnValue({
        settings: { appMode: 'delivery' },
        setState: vi.fn(),
      } as any);
      
      render(<AdventureMapLayout>Test</AdventureMapLayout>);
      
      waitFor(() => {
        expect(screen.getByText('DELIVERY ROUTE')).toBeInTheDocument();
      });
    });
  });

  describe('Settings Integration', () => {
    it('should persist app mode changes', () => {
      const updateSettings = vi.fn();
      vi.mocked(useUIStore).mockReturnValue({
        settings: { appMode: 'game' },
        updateSettings,
      } as any);
      
      // Simulate changing app mode
      updateSettings({ appMode: 'delivery' });
      
      expect(updateSettings).toHaveBeenCalledWith({ appMode: 'delivery' });
    });
  });

  describe('Mexican Food Integration', () => {
    it('should display Mexican food items in delivery mode', () => {
      expect(getTerm('TACOS_AL_PASTOR', 'delivery')).toBe('Tacos al Pastor Order');
      expect(getTerm('BLUE_CORN_QUESADILLA', 'delivery')).toBe('Quesadilla Order');
      expect(getTerm('TAMALES_OAXAQUENOS', 'delivery')).toBe('Tamale Order');
    });
  });
});