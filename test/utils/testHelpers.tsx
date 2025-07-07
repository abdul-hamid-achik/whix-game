import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

// Custom render function that includes providers
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // Add any global providers here (Theme, Auth, etc.)
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Mock data generators
export const mockPartner = (overrides = {}) => ({
  id: 'test-partner-1',
  name: 'Test Partner',
  class: 'courier',
  primaryTrait: 'hyperfocus',
  level: 1,
  rarity: 'common',
  stats: {
    focus: 50,
    perception: 50,
    social: 50,
    logic: 50,
    stamina: 50,
  },
  personality: {
    traits: ['determined', 'curious'],
    likes: ['solving puzzles', 'helping others'],
    dislikes: ['corporate exploitation'],
    backstory: 'A test partner for unit tests.',
  },
  ...overrides,
});

export const mockMission = (overrides = {}) => ({
  id: 'test-mission-1',
  type: 'standard_delivery',
  title: 'Test Delivery',
  description: 'A test mission',
  difficulty: 'normal',
  rewards: {
    tips: 50,
    experience: 20,
  },
  objectives: [{
    id: 'deliver',
    description: 'Deliver package',
    type: 'deliver',
    current: 0,
    required: 1,
    completed: false,
  }],
  ...overrides,
});

// Store reset helpers
export const resetAllStores = async () => {
  const { useGameStore } = await import('@/lib/stores/gameStore');
  const { usePartnerStore } = await import('@/lib/stores/partnerStore');
  const { useMissionStore } = await import('@/lib/stores/missionStore');
  const { useStoryStore } = await import('@/lib/stores/storyStore');
  
  // Reset to initial states
  useGameStore.setState({
    currentTips: 1000,
    totalTipsEarned: 0,
    companyStars: 0,
    tipCutPercentage: 75,
    starFragments: 0,
    level: 1,
    experience: 0,
    playerName: 'Partner',
    missionsCompleted: 0,
    missionsAbandoned: 0,
    perfectMissions: 0,
    activeBoosts: [],
    currentChapter: 1,
    unlockedChapters: [1],
    storyChoices: {},
    notifications: [],
  });
  
  usePartnerStore.setState({
    partners: [],
    activeTeam: [],
    selectedPartnerId: null,
    pullsSinceEpic: 0,
    pullsSinceLegendary: 0,
    totalPulls: 0,
  });
  
  useMissionStore.setState({
    availableMissions: [],
    dailyMissions: [],
    weeklyMission: null,
    specialEvent: null,
    activeMissions: [],
    currentMissionId: null,
    lastDailyRefresh: 0,
    lastWeeklyRefresh: 0,
    missionSeed: Date.now(),
    missionStats: {},
  });
  
  useStoryStore.setState({
    currentChapterId: null,
    completedChapters: [],
    currentDialogueId: null,
    relationships: {
      tania: 0,
      kai: 0,
      whix_manager: 0,
    },
    dialogueChoices: {},
    storyFlags: [],
    unlockedDialogueOptions: [],
    unlockedCharacters: ['miguel', 'kai', 'whix_manager'],
  });
};

// Wait utilities
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock timers helper
export const useFakeTimers = () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });
  
  return {
    advanceTime: (ms: number) => vi.advanceTimersByTime(ms),
    runAllTimers: () => vi.runAllTimers(),
  };
};