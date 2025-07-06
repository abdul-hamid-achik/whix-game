import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';

interface StoryState {
  // Story Progress
  currentChapterId: string | null;
  completedChapters: string[];
  currentDialogueId: string | null;
  
  // Relationships
  relationships: Record<string, number>;
  
  // Choices and Flags
  dialogueChoices: Record<string, string>; // dialogueId -> choiceId
  storyFlags: string[];
  
  // Unlocked Content
  unlockedDialogueOptions: string[];
  unlockedCharacters: string[];
  
  // Actions
  startChapter: (chapterId: string) => void;
  completeChapter: (chapterId: string) => void;
  setCurrentDialogue: (dialogueId: string | null) => void;
  
  // Relationship Actions
  updateRelationship: (characterId: string, change: number) => void;
  getRelationship: (characterId: string) => number;
  
  // Choice Actions
  saveDialogueChoice: (dialogueId: string, choiceId: string) => void;
  hasFlag: (flag: string) => boolean;
  addFlag: (flag: string) => void;
  
  // Unlock Actions
  unlockDialogueOption: (optionId: string) => void;
  unlockCharacter: (characterId: string) => void;
  
  // Utility
  canMakeChoice: (requirement: any) => boolean;
  getStoryProgress: () => number;
}

export const useStoryStore = create<StoryState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial State
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
        
        // Chapter Actions
        startChapter: (chapterId) => set((state) => {
          state.currentChapterId = chapterId;
          state.currentDialogueId = null;
        }),
        
        completeChapter: (chapterId) => set((state) => {
          if (!state.completedChapters.includes(chapterId)) {
            state.completedChapters.push(chapterId);
          }
          state.currentChapterId = null;
          state.currentDialogueId = null;
        }),
        
        setCurrentDialogue: (dialogueId) => set((state) => {
          state.currentDialogueId = dialogueId;
        }),
        
        // Relationship Actions
        updateRelationship: (characterId, change) => set((state) => {
          const current = state.relationships[characterId] || 0;
          state.relationships[characterId] = Math.max(-100, Math.min(100, current + change));
        }),
        
        getRelationship: (characterId) => {
          return get().relationships[characterId] || 0;
        },
        
        // Choice Actions
        saveDialogueChoice: (dialogueId, choiceId) => set((state) => {
          state.dialogueChoices[dialogueId] = choiceId;
        }),
        
        hasFlag: (flag) => {
          return get().storyFlags.includes(flag);
        },
        
        addFlag: (flag) => set((state) => {
          if (!state.storyFlags.includes(flag)) {
            state.storyFlags.push(flag);
          }
        }),
        
        // Unlock Actions
        unlockDialogueOption: (optionId) => set((state) => {
          if (!state.unlockedDialogueOptions.includes(optionId)) {
            state.unlockedDialogueOptions.push(optionId);
          }
        }),
        
        unlockCharacter: (characterId) => set((state) => {
          if (!state.unlockedCharacters.includes(characterId)) {
            state.unlockedCharacters.push(characterId);
          }
        }),
        
        // Utility
        canMakeChoice: (requirement) => {
          if (!requirement) return true;
          
          const state = get();
          
          // Check previous choice requirement
          if (requirement.previousChoice) {
            const [dialogueId, choiceId] = requirement.previousChoice.split(':');
            if (state.dialogueChoices[dialogueId] !== choiceId) {
              return false;
            }
          }
          
          // Check flag requirement
          if (requirement.flag && !state.hasFlag(requirement.flag)) {
            return false;
          }
          
          // Check relationship requirement
          if (requirement.relationship) {
            const [characterId, minValue] = requirement.relationship.split(':');
            if (state.getRelationship(characterId) < parseInt(minValue)) {
              return false;
            }
          }
          
          return true;
        },
        
        getStoryProgress: () => {
          const state = get();
          const totalChapters = 10; // Placeholder for total chapters
          return (state.completedChapters.length / totalChapters) * 100;
        },
      })),
      {
        name: 'whix-story-state',
        partialize: (state) => ({
          completedChapters: state.completedChapters,
          relationships: state.relationships,
          dialogueChoices: state.dialogueChoices,
          storyFlags: state.storyFlags,
          unlockedDialogueOptions: state.unlockedDialogueOptions,
          unlockedCharacters: state.unlockedCharacters,
        }),
      }
    )
  )
);