import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GeneratedCharacterImage } from '@/lib/services/imageGenerationService';
import { Rarity } from '@/lib/game/classes';

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
  getFromPool: (rarity: Rarity) => GeneratedCharacterImage | null;
  assignImageToCharacter: (characterId: string, image: GeneratedCharacterImage) => void;
  getCharacterImage: (characterId: string) => GeneratedCharacterImage | undefined;
  getPoolStats: () => Record<Rarity, number>;
  clearPool: (rarity?: Rarity) => void;
  
  // Batch operations
  addBatchToPool: (images: GeneratedCharacterImage[]) => void;
  
  // Generation tracking
  isGenerating: boolean;
  setGenerating: (generating: boolean) => void;
  generationQueue: Array<{ characterId: string; name: string; rarity: Rarity }>;
  addToQueue: (item: { characterId: string; name: string; rarity: Rarity }) => void;
  removeFromQueue: (characterId: string) => void;
}

export const useCharacterImageStore = create<CharacterImageStore>()(
  persist(
    (set, get) => ({
      imagePools: {
        common: [],
        rare: [],
        epic: [],
        legendary: []
      },
      
      characterImages: new Map(),
      generationHistory: [],
      isGenerating: false,
      generationQueue: [],
      
      addGeneratedImage: (image) => set((state) => ({
        generationHistory: [...state.generationHistory, image]
      })),
      
      addToPool: (image) => set((state) => {
        const rarity = image.attributes.rarity as Rarity;
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
        const stats: Record<Rarity, number> = {
          common: 0,
          rare: 0,
          epic: 0,
          legendary: 0
        };
        
        Object.entries(state.imagePools).forEach(([rarity, pool]) => {
          stats[rarity as Rarity] = pool.length;
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
          const rarity = image.attributes.rarity as Rarity;
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
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            state: {
              ...parsed.state,
              characterImages: new Map(parsed.state.characterImages || [])
            },
            version: parsed.version
          };
        },
        setItem: (name, value) => {
          const stringified = JSON.stringify({
            state: {
              ...value.state,
              characterImages: Array.from(value.state.characterImages.entries())
            },
            version: value.version
          });
          localStorage.setItem(name, stringified);
        },
        removeItem: (name) => localStorage.removeItem(name)
      }
    }
  )
);