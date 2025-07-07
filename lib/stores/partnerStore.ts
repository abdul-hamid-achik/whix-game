import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';
import { GeneratedPartner } from '../game/partnerGenerator';
import { ContentPartner } from '../cms/content-partner-adapter';
import { CharacterUnlockSystem, CharacterUnlockCondition } from '../systems/character-unlock-system';
import { StoredPartner } from '../schemas/game-schemas';

interface PartnerState {
  // Partner Management
  partners: StoredPartner[];
  activeTeam: string[]; // Partner IDs
  selectedPartnerId: string | null;
  
  // Character Unlocking
  unlockedCharacters: string[]; // Character IDs from content
  pendingUnlocks: CharacterUnlockCondition[]; // Characters ready to unlock
  
  // Pity System
  pullsSinceEpic: number;
  pullsSinceLegendary: number;
  totalPulls: number;
  gachaPulls: number;
  
  // Actions
  addPartner: (partner: GeneratedPartner | ContentPartner) => StoredPartner;
  addContentPartner: (partner: ContentPartner) => StoredPartner;
  removePartner: (partnerId: string) => void;
  setActiveTeam: (partnerIds: string[]) => void;
  addToActiveTeam: (partnerId: string) => void;
  removeFromActiveTeam: (partnerId: string) => void;
  selectPartner: (partnerId: string | null) => void;
  
  // Partner Management
  updatePartnerEnergy: (partnerId: string, energy: number) => void;
  injurePartner: (partnerId: string, recoveryTime: number) => void;
  healPartner: (partnerId: string) => void;
  checkInjuryRecovery: () => void;
  
  // Experience and Progression
  addPartnerExperience: (partnerId: string, experience: number) => void;
  increaseBondLevel: (partnerId: string) => void;
  upgradeTraitMastery: (partnerId: string, trait: string) => void;
  
  // Pity System
  recordPull: (rarities: string[]) => void;
  resetPity: (type: 'epic' | 'legendary') => void;
  getPityRate: () => { epic: number; legendary: number };
  updateGachaPulls: (pulls: number) => void;
  
  // Character Unlocking
  checkForUnlocks: (gameState: { level: number; completedChapters: string[]; totalTipsEarned: number; missionsCompleted: number; storyFlags: string[] }) => void;
  unlockCharacter: (characterId: string) => void;
  getNextUnlocks: (gameState: { level: number; completedChapters: string[]; totalTipsEarned: number; missionsCompleted: number; storyFlags: string[] }) => Array<CharacterUnlockCondition & { progress: number }>;
  
  // Utility
  getPartnerById: (partnerId: string) => StoredPartner | undefined;
  getActivePartners: () => StoredPartner[];
  canPull: (cost: number, currentTips: number) => boolean;
}

export const usePartnerStore = create<PartnerState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial State
        partners: [],
        activeTeam: [],
        selectedPartnerId: null,
        unlockedCharacters: ['kira-chen', 'alex-rivera', 'sam-torres'], // Starter characters
        pendingUnlocks: [],
        pullsSinceEpic: 0,
        pullsSinceLegendary: 0,
        totalPulls: 0,
        gachaPulls: 0,
        
        // Partner Actions
        addPartner: (partner) => {
          const storedPartner: StoredPartner = {
            ...partner,
            experience: 0,
            currentEnergy: 100,
            maxEnergy: 100,
            bondLevel: 0,
            isInjured: false,
            missions: 0,
            traitMastery: {
              [partner.primaryTrait]: { level: 1, experience: 0, unlocked: true },
              ...(partner.secondaryTrait && { [partner.secondaryTrait]: { level: 1, experience: 0, unlocked: true } }),
              ...(partner.tertiaryTrait && { [partner.tertiaryTrait]: { level: 1, experience: 0, unlocked: true } }),
            },
            equipment: {},
          };
          
          set((state) => {
            state.partners.push(storedPartner);
            
            // Auto-add to team if space available
            if (state.activeTeam.length < 3) {
              state.activeTeam.push(storedPartner.id);
            }
          });
          
          return storedPartner;
        },
        
        addContentPartner: (partner) => {
          const storedPartner: StoredPartner = {
            ...partner,
            experience: 0,
            currentEnergy: 100,
            maxEnergy: 100,
            bondLevel: 0,
            isInjured: false,
            missions: 0,
            traitMastery: {
              [partner.primaryTrait]: { level: 1, experience: 0, unlocked: true },
              ...(partner.secondaryTrait && { [partner.secondaryTrait]: { level: 1, experience: 0, unlocked: true } }),
              ...(partner.tertiaryTrait && { [partner.tertiaryTrait]: { level: 1, experience: 0, unlocked: true } }),
            },
            equipment: {},
          };
          
          set((state) => {
            state.partners.push(storedPartner);
            
            // Auto-add to team if space available
            if (state.activeTeam.length < 3) {
              state.activeTeam.push(storedPartner.id);
            }
          });
          
          return storedPartner;
        },
        
        removePartner: (partnerId) => set((state) => {
          state.partners = state.partners.filter(p => p.id !== partnerId);
          state.activeTeam = state.activeTeam.filter(id => id !== partnerId);
          if (state.selectedPartnerId === partnerId) {
            state.selectedPartnerId = null;
          }
        }),
        
        setActiveTeam: (partnerIds) => set((state) => {
          state.activeTeam = partnerIds.slice(0, 3);
        }),
        
        addToActiveTeam: (partnerId) => set((state) => {
          if (!state.activeTeam.includes(partnerId) && state.activeTeam.length < 3) {
            state.activeTeam.push(partnerId);
          }
        }),
        
        removeFromActiveTeam: (partnerId) => set((state) => {
          state.activeTeam = state.activeTeam.filter(id => id !== partnerId);
        }),
        
        selectPartner: (partnerId) => set((state) => {
          state.selectedPartnerId = partnerId;
        }),
        
        // Energy and Injury
        updatePartnerEnergy: (partnerId, energy) => set((state) => {
          const partner = state.partners.find(p => p.id === partnerId);
          if (partner) {
            partner.currentEnergy = Math.max(0, Math.min(energy, partner.maxEnergy));
          }
        }),
        
        injurePartner: (partnerId, recoveryTime) => set((state) => {
          const partner = state.partners.find(p => p.id === partnerId);
          if (partner) {
            partner.isInjured = true;
            partner.injuryRecoveryTime = Date.now() + recoveryTime;
            partner.currentEnergy = 0;
            
            // Remove from active team
            state.activeTeam = state.activeTeam.filter(id => id !== partnerId);
          }
        }),
        
        healPartner: (partnerId) => set((state) => {
          const partner = state.partners.find(p => p.id === partnerId);
          if (partner) {
            partner.isInjured = false;
            partner.injuryRecoveryTime = undefined;
            partner.currentEnergy = partner.maxEnergy;
          }
        }),
        
        checkInjuryRecovery: () => set((state) => {
          const now = Date.now();
          state.partners.forEach(partner => {
            if (partner.isInjured && partner.injuryRecoveryTime && partner.injuryRecoveryTime <= now) {
              partner.isInjured = false;
              partner.injuryRecoveryTime = undefined;
              partner.currentEnergy = Math.floor(partner.maxEnergy * 0.5);
            }
          });
        }),
        
        // Experience and Progression
        addPartnerExperience: (partnerId, experience) => set((state) => {
          const partner = state.partners.find(p => p.id === partnerId);
          if (partner) {
            partner.experience += experience;
            
            // Level up logic
            const expForNextLevel = partner.level * 50;
            while (partner.experience >= expForNextLevel) {
              partner.experience -= expForNextLevel;
              partner.level += 1;
              partner.maxEnergy += 10;
              partner.currentEnergy = partner.maxEnergy;
              
              // Recalculate stats on level up
              // This would need the calculatePartnerStats function
            }
          }
        }),
        
        increaseBondLevel: (partnerId) => set((state) => {
          const partner = state.partners.find(p => p.id === partnerId);
          if (partner && partner.bondLevel < 10) {
            partner.bondLevel += 1;
          }
        }),
        
        upgradeTraitMastery: (partnerId, trait) => set((state) => {
          const partner = state.partners.find(p => p.id === partnerId);
          if (partner && partner.traitMastery[trait]) {
            const currentMastery = partner.traitMastery[trait];
            // Upgrade trait mastery level
            if (currentMastery.level < 3) {
              currentMastery.level += 1;
              currentMastery.experience = 0; // Reset experience on level up
            }
          }
        }),
        
        // Pity System
        recordPull: (rarities) => set((state) => {
          state.totalPulls += rarities.length;
          
          const hasEpic = rarities.includes('epic');
          const hasLegendary = rarities.includes('legendary');
          
          if (hasLegendary) {
            state.pullsSinceLegendary = 0;
            state.pullsSinceEpic = 0;
          } else if (hasEpic) {
            state.pullsSinceLegendary += rarities.length;
            state.pullsSinceEpic = 0;
          } else {
            state.pullsSinceLegendary += rarities.length;
            state.pullsSinceEpic += rarities.length;
          }
        }),
        
        resetPity: (type) => set((state) => {
          if (type === 'epic') {
            state.pullsSinceEpic = 0;
          } else {
            state.pullsSinceLegendary = 0;
          }
        }),
        
        getPityRate: () => {
          const { pullsSinceEpic, pullsSinceLegendary } = get();
          return {
            epic: Math.min(pullsSinceEpic / 50, 1),
            legendary: Math.min(pullsSinceLegendary / 90, 1),
          };
        },
        
        updateGachaPulls: (pulls) => set((state) => {
          state.gachaPulls = pulls;
        }),
        
        // Character Unlocking
        checkForUnlocks: (gameState) => set((state) => {
          const newUnlocks = CharacterUnlockSystem.checkUnlocks(gameState)
            .filter(unlock => !state.unlockedCharacters.includes(unlock.characterId));
          
          state.pendingUnlocks = newUnlocks;
        }),
        
        unlockCharacter: (characterId) => set((state) => {
          if (!state.unlockedCharacters.includes(characterId)) {
            state.unlockedCharacters.push(characterId);
          }
          
          // Remove from pending unlocks
          state.pendingUnlocks = state.pendingUnlocks.filter(
            unlock => unlock.characterId !== characterId
          );
        }),
        
        getNextUnlocks: (gameState) => {
          const { unlockedCharacters } = get();
          return CharacterUnlockSystem.getNextUnlocks(unlockedCharacters, gameState);
        },
        
        // Utility
        getPartnerById: (partnerId) => {
          return get().partners.find(p => p.id === partnerId);
        },
        
        getActivePartners: () => {
          const { partners, activeTeam } = get();
          return activeTeam
            .map(id => partners.find(p => p.id === id))
            .filter((p): p is StoredPartner => p !== undefined);
        },
        
        canPull: (cost, currentTips) => {
          return currentTips >= cost;
        },
      })),
      {
        name: 'whix-partner-state',
        partialize: (state) => ({
          partners: state.partners,
          activeTeam: state.activeTeam,
          pullsSinceEpic: state.pullsSinceEpic,
          pullsSinceLegendary: state.pullsSinceLegendary,
          totalPulls: state.totalPulls,
        }),
      }
    )
  )
);