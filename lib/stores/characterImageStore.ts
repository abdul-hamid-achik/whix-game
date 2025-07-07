import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GeneratedCharacterImage } from '@/lib/services/imageGenerationService';
import { CharacterRarity } from '@/lib/game/gacha';

interface CharacterImagePool {
  [rarity: string]: GeneratedCharacterImage[];
}

interface CharacterImageStore {
  // Image pools organized by rarity
  imagePools: CharacterImagePool;
  
  // Generated images mapped by character ID
  characterImages: Map<string, GeneratedCharacterImage>;
  
  // Generation history
  generationHistory: GeneratedCharacterImage[];
  
  // Actions
  addGeneratedImage: (image: GeneratedCharacterImage) => void;
  addToPool: (image: GeneratedCharacterImage) => void;
  getFromPool: (rarity: CharacterRarity) => GeneratedCharacterImage | null;
  assignImageToCharacter: (characterId: string, image: GeneratedCharacterImage) => void;
  getCharacterImage: (characterId: string) => GeneratedCharacterImage | undefined;
  getPoolStats: () => Record<CharacterRarity, number>;
  clearPool: (rarity?: CharacterRarity) => void;
  
  // Batch operations
  addBatchToPool: (images: GeneratedCharacterImage[]) => void;
  
  // Generation tracking
  isGenerating: boolean;
  setGenerating: (generating: boolean) => void;
  generationQueue: Array<{ characterId: string; name: string; rarity: CharacterRarity }>;
  addToQueue: (item: { characterId: string; name: string; rarity: CharacterRarity }) => void;
  removeFromQueue: (characterId: string) => void;
}

export const useCharacterImageStore = create<CharacterImageStore>()(
  persist(
    (set, get) => ({
      imagePools: {
        common: [],
        rare: [],
        epic: [],
        legendary: [],
        mythic: []
      },
      
      characterImages: new Map(),
      generationHistory: [],
      isGenerating: false,
      generationQueue: [],
      
      addGeneratedImage: (image) => set((state) => ({
        generationHistory: [...state.generationHistory, image]
      })),
      
      addToPool: (image) => set((state) => {
        const rarity = image.attributes.rarity as CharacterRarity;
        const pool = state.imagePools[rarity] || [];
        
        // Check for duplicates
        const exists = pool.some(img => img.id === image.id);
        if (exists) return state;
        
        return {
          imagePools: {
            ...state.imagePools,
            [rarity]: [...pool, image]
          }
        };
      }),
      
      getFromPool: (rarity) => {
        const state = get();
        const pool = state.imagePools[rarity] || [];
        
        if (pool.length === 0) return null;
        
        // Get random image from pool
        const randomIndex = Math.floor(Math.random() * pool.length);
        const image = pool[randomIndex];
        
        // Remove from pool
        set((state) => ({
          imagePools: {
            ...state.imagePools,
            [rarity]: pool.filter((_, index) => index !== randomIndex)
          }
        }));
        
        return image;
      },
      
      assignImageToCharacter: (characterId, image) => set((state) => {
        const newCharacterImages = new Map(state.characterImages);
        newCharacterImages.set(characterId, image);
        
        return {
          characterImages: newCharacterImages
        };
      }),
      
      getCharacterImage: (characterId) => {
        const state = get();
        return state.characterImages.get(characterId);
      },
      
      getPoolStats: () => {
        const state = get();
        const stats: Record<CharacterRarity, number> = {
          common: 0,
          rare: 0,
          epic: 0,
          legendary: 0,
          mythic: 0
        };
        
        Object.entries(state.imagePools).forEach(([rarity, pool]) => {
          stats[rarity as CharacterRarity] = pool.length;
        });
        
        return stats;
      },
      
      clearPool: (rarity) => set((state) => {
        if (rarity) {
          return {
            imagePools: {
              ...state.imagePools,
              [rarity]: []
            }
          };
        }
        
        // Clear all pools
        return {
          imagePools: {
            common: [],
            rare: [],
            epic: [],
            legendary: [],
            mythic: []
          }
        };
      }),
      
      addBatchToPool: (images) => set((state) => {
        const newPools = { ...state.imagePools };
        
        images.forEach(image => {
          const rarity = image.attributes.rarity as CharacterRarity;
          if (!newPools[rarity]) {
            newPools[rarity] = [];
          }
          
          // Check for duplicates
          const exists = newPools[rarity].some(img => img.id === image.id);
          if (!exists) {
            newPools[rarity] = [...newPools[rarity], image];
          }
        });
        
        return { imagePools: newPools };
      }),
      
      setGenerating: (generating) => set({ isGenerating: generating }),
      
      addToQueue: (item) => set((state) => ({
        generationQueue: [...state.generationQueue, item]
      })),
      
      removeFromQueue: (characterId) => set((state) => ({
        generationQueue: state.generationQueue.filter(item => item.characterId !== characterId)
      }))
    }),
    {
      name: 'character-image-storage',
      // Custom serialization for Map
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          characterImages: Array.from(state.characterImages.entries())
        });
      },
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        return {
          ...parsed,
          characterImages: new Map(parsed.characterImages)
        };
      }
    }
  )
);