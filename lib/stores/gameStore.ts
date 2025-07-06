import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';

interface GameState {
  // Currency and Progression
  currentTips: number;
  totalTipsEarned: number;
  companyStars: number;
  tipCutPercentage: number;
  starFragments: number;
  
  // Player Stats
  level: number;
  experience: number;
  playerName: string;
  
  // Mission Statistics
  missionsCompleted: number;
  missionsAbandoned: number;
  perfectMissions: number;
  
  // Temporary Boosts
  activeBoosts: {
    id: string;
    type: 'tips' | 'experience' | 'trait' | 'all';
    value: number;
    expiresAt: number;
  }[];
  
  // Story Progress
  currentChapter: number;
  unlockedChapters: number[];
  storyChoices: Record<string, any>;
  
  // Actions
  earnTips: (amount: number) => void;
  spendTips: (amount: number) => boolean;
  calculateWhixCut: (tips: number) => { playerShare: number; whixCut: number };
  earnStarFragment: (amount: number) => void;
  upgradeCompanyStar: () => boolean;
  
  // Boost Actions
  addBoost: (boost: Omit<GameState['activeBoosts'][0], 'id'>) => void;
  removeExpiredBoosts: () => void;
  getActiveBoostMultiplier: (type: string) => number;
  
  // Story Actions
  unlockChapter: (chapter: number) => void;
  saveStoryChoice: (choiceId: string, choice: any) => void;
  
  // Stats Actions
  completeMission: (perfect: boolean) => void;
  abandonMission: () => void;
  gainExperience: (amount: number) => void;
}

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial State
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
        
        // Currency Actions
        earnTips: (amount) => set((state) => {
          const boostMultiplier = get().getActiveBoostMultiplier('tips');
          const boostedAmount = Math.floor(amount * boostMultiplier);
          const { playerShare, whixCut } = get().calculateWhixCut(boostedAmount);
          
          state.currentTips += playerShare;
          state.totalTipsEarned += boostedAmount;
        }),
        
        spendTips: (amount) => {
          const currentTips = get().currentTips;
          if (currentTips >= amount) {
            set((state) => {
              state.currentTips -= amount;
            });
            return true;
          }
          return false;
        },
        
        calculateWhixCut: (tips) => {
          const cutPercentage = get().tipCutPercentage;
          const whixCut = Math.floor(tips * (cutPercentage / 100));
          const playerShare = tips - whixCut;
          return { playerShare, whixCut };
        },
        
        earnStarFragment: (amount) => set((state) => {
          state.starFragments += amount;
        }),
        
        upgradeCompanyStar: () => {
          const fragments = get().starFragments;
          const currentStars = get().companyStars;
          const requiredFragments = (currentStars + 1) * 10;
          
          if (fragments >= requiredFragments && currentStars < 5) {
            set((state) => {
              state.starFragments -= requiredFragments;
              state.companyStars += 1;
              state.tipCutPercentage = Math.max(0, 75 - (state.companyStars * 15));
            });
            return true;
          }
          return false;
        },
        
        // Boost Actions
        addBoost: (boost) => set((state) => {
          state.activeBoosts.push({
            ...boost,
            id: Math.random().toString(36).substr(2, 9),
          });
        }),
        
        removeExpiredBoosts: () => set((state) => {
          const now = Date.now();
          state.activeBoosts = state.activeBoosts.filter(boost => boost.expiresAt > now);
        }),
        
        getActiveBoostMultiplier: (type) => {
          const boosts = get().activeBoosts.filter(
            boost => boost.expiresAt > Date.now() && (boost.type === type || boost.type === 'all')
          );
          
          return boosts.reduce((multiplier, boost) => multiplier + boost.value, 1);
        },
        
        // Story Actions
        unlockChapter: (chapter) => set((state) => {
          if (!state.unlockedChapters.includes(chapter)) {
            state.unlockedChapters.push(chapter);
            state.unlockedChapters.sort((a, b) => a - b);
          }
        }),
        
        saveStoryChoice: (choiceId, choice) => set((state) => {
          state.storyChoices[choiceId] = choice;
        }),
        
        // Stats Actions
        completeMission: (perfect) => set((state) => {
          state.missionsCompleted += 1;
          if (perfect) {
            state.perfectMissions += 1;
          }
        }),
        
        abandonMission: () => set((state) => {
          state.missionsAbandoned += 1;
        }),
        
        gainExperience: (amount) => set((state) => {
          const boostMultiplier = get().getActiveBoostMultiplier('experience');
          const boostedAmount = Math.floor(amount * boostMultiplier);
          
          state.experience += boostedAmount;
          
          // Level up logic
          const expForNextLevel = state.level * 100;
          while (state.experience >= expForNextLevel) {
            state.experience -= expForNextLevel;
            state.level += 1;
          }
        }),
      })),
      {
        name: 'whix-game-state',
        partialize: (state) => ({
          currentTips: state.currentTips,
          totalTipsEarned: state.totalTipsEarned,
          companyStars: state.companyStars,
          tipCutPercentage: state.tipCutPercentage,
          starFragments: state.starFragments,
          level: state.level,
          experience: state.experience,
          playerName: state.playerName,
          missionsCompleted: state.missionsCompleted,
          missionsAbandoned: state.missionsAbandoned,
          perfectMissions: state.perfectMissions,
          currentChapter: state.currentChapter,
          unlockedChapters: state.unlockedChapters,
          storyChoices: state.storyChoices,
        }),
      }
    )
  )
);