import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';
import { DailyContract } from '@/lib/systems/daily-contracts-system';

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
  humanity: number;
  
  // Mission Statistics
  missionsCompleted: number;
  missionsAbandoned: number;
  perfectMissions: number;
  
  // Daily Contracts
  dailyContracts: DailyContract[];
  activeContract: DailyContract | null;
  contractsCompletedToday: number;
  lastContractReset: string;
  
  // Campaigns
  completedCampaigns: string[];
  
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
  storyChoices: Record<string, string>;
  
  // Notifications
  notifications: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }[];
  
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
  saveStoryChoice: (choiceId: string, choice: string) => void;
  
  // Stats Actions
  completeMission: (perfect: boolean) => void;
  abandonMission: () => void;
  gainExperience: (amount: number) => void;
  adjustHumanity: (amount: number) => void;
  
  // Notification Actions
  addNotification: (notification: Omit<GameState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Daily Contract Actions
  setDailyContracts: (contracts: DailyContract[]) => void;
  acceptContract: (contract: DailyContract) => void;
  updateContractProgress: (contractId: string, objectiveId: string, progress: number) => void;
  completeContract: (contractId: string) => void;
  claimContractRewards: (contractId: string) => void;
  resetDailyContracts: () => void;
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
        humanity: 50,
        missionsCompleted: 0,
        missionsAbandoned: 0,
        perfectMissions: 0,
        dailyContracts: [],
        activeContract: null,
        contractsCompletedToday: 0,
        lastContractReset: new Date().toISOString().split('T')[0],
        completedCampaigns: [],
        activeBoosts: [],
        currentChapter: 1,
        unlockedChapters: [1],
        storyChoices: {},
        notifications: [],
        
        // Currency Actions
        earnTips: (amount) => set((state) => {
          const boostMultiplier = get().getActiveBoostMultiplier('tips');
          const boostedAmount = Math.floor(amount * boostMultiplier);
          const { playerShare } = get().calculateWhixCut(boostedAmount);
          
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
        
        adjustHumanity: (amount) => set((state) => {
          state.humanity = Math.max(0, Math.min(100, state.humanity + amount));
        }),
        
        // Notification Actions
        addNotification: (notification) => set((state) => {
          state.notifications.push({
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
          });
        }),
        
        removeNotification: (id) => set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== id);
        }),
        
        clearNotifications: () => set((state) => {
          state.notifications = [];
        }),
        
        // Daily Contract Actions
        setDailyContracts: (contracts) => set((state) => {
          state.dailyContracts = contracts;
        }),
        
        acceptContract: (contract) => set((state) => {
          state.activeContract = contract;
        }),
        
        updateContractProgress: (contractId, objectiveId, progress) => set((state) => {
          const contract = state.dailyContracts.find(c => c.id === contractId);
          if (contract) {
            const objective = contract.objectives.find(o => o.id === objectiveId);
            if (objective) {
              objective.progress = progress;
              if (objective.target && progress >= objective.target) {
                objective.completed = true;
              }
            }
          }
        }),
        
        completeContract: (contractId) => set((state) => {
          const contract = state.dailyContracts.find(c => c.id === contractId);
          if (contract) {
            contract.completed = true;
            state.contractsCompletedToday += 1;
            if (state.activeContract?.id === contractId) {
              state.activeContract = null;
            }
          }
        }),
        
        claimContractRewards: (contractId) => set((state) => {
          const contract = state.dailyContracts.find(c => c.id === contractId);
          if (contract && contract.completed && !contract.claimed) {
            contract.claimed = true;
            // Apply rewards
            get().earnTips(contract.rewards.tips);
            get().gainExperience(contract.rewards.experience);
            
            // Add notification
            get().addNotification({
              type: 'success',
              message: `Contract completed! Earned ${contract.rewards.tips} tips and ${contract.rewards.experience} XP`,
            });
          }
        }),
        
        resetDailyContracts: () => set((state) => {
          const today = new Date().toISOString().split('T')[0];
          if (state.lastContractReset !== today) {
            state.lastContractReset = today;
            state.contractsCompletedToday = 0;
            state.dailyContracts = [];
            state.activeContract = null;
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
          dailyContracts: state.dailyContracts,
          contractsCompletedToday: state.contractsCompletedToday,
          lastContractReset: state.lastContractReset,
        }),
      }
    )
  )
);