import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ChapterMap, 
  generateChapterMap, 
  updateNodeStatus, 
  moveToNode,
  NodeStatus,
  canReachEnd
} from '@/lib/game/chapterMap';

interface ChapterMapState {
  currentChapter: number;
  chapterMaps: Map<number, ChapterMap>;
  currentMap: ChapterMap | null;
  unlockedChapters: number[];
  
  // Actions
  initializeChapter: (chapterNumber: number) => void;
  loadChapter: (chapterNumber: number) => void;
  moveToNode: (nodeId: string) => void;
  completeNode: (nodeId: string) => void;
  unlockNextChapter: () => void;
  getProgress: () => number;
  reset: () => void;
}

export const useChapterMapStore = create<ChapterMapState>()(
  persist(
    (set, get) => ({
      currentChapter: 1,
      chapterMaps: new Map(),
      currentMap: null,
      unlockedChapters: [1],
      
      initializeChapter: (chapterNumber: number) => {
        const state = get();
        if (!state.chapterMaps.has(chapterNumber)) {
          const newMap = generateChapterMap(
            chapterNumber,
            15, // width
            20, // height
            chapterNumber // difficulty scales with chapter
          );
          
          const updatedMaps = new Map(state.chapterMaps);
          updatedMaps.set(chapterNumber, newMap);
          
          set({
            chapterMaps: updatedMaps,
            currentMap: newMap,
            currentChapter: chapterNumber
          });
        }
      },
      
      loadChapter: (chapterNumber: number) => {
        const state = get();
        if (state.unlockedChapters.includes(chapterNumber)) {
          let map = state.chapterMaps.get(chapterNumber);
          
          if (!map) {
            // Generate new map if it doesn't exist
            map = generateChapterMap(
              chapterNumber,
              15 + Math.floor(chapterNumber / 2), // width increases with chapters
              20 + chapterNumber, // height increases with chapters
              chapterNumber
            );
            
            const updatedMaps = new Map(state.chapterMaps);
            updatedMaps.set(chapterNumber, map);
            
            set({
              chapterMaps: updatedMaps,
              currentMap: map,
              currentChapter: chapterNumber
            });
          } else {
            set({
              currentMap: map,
              currentChapter: chapterNumber
            });
          }
        }
      },
      
      moveToNode: (nodeId: string) => {
        const state = get();
        if (!state.currentMap) return;
        
        const updatedMap = moveToNode(state.currentMap, nodeId);
        const updatedMaps = new Map(state.chapterMaps);
        updatedMaps.set(state.currentChapter, updatedMap);
        
        set({
          currentMap: updatedMap,
          chapterMaps: updatedMaps
        });
      },
      
      completeNode: (nodeId: string) => {
        const state = get();
        if (!state.currentMap) return;
        
        const updatedMap = updateNodeStatus(state.currentMap, nodeId, NodeStatus.COMPLETED);
        const updatedMaps = new Map(state.chapterMaps);
        updatedMaps.set(state.currentChapter, updatedMap);
        
        set({
          currentMap: updatedMap,
          chapterMaps: updatedMaps
        });
        
        // Check if chapter is complete
        if (canReachEnd(updatedMap)) {
          // Unlock next chapter if not already unlocked
          const nextChapter = state.currentChapter + 1;
          if (!state.unlockedChapters.includes(nextChapter) && nextChapter <= 8) {
            set({
              unlockedChapters: [...state.unlockedChapters, nextChapter]
            });
          }
        }
      },
      
      unlockNextChapter: () => {
        const state = get();
        const nextChapter = Math.max(...state.unlockedChapters) + 1;
        
        if (nextChapter <= 8) { // Max 8 chapters
          set({
            unlockedChapters: [...state.unlockedChapters, nextChapter]
          });
        }
      },
      
      getProgress: () => {
        const state = get();
        const totalChapters = 8;
        const completedChapters = state.unlockedChapters.length - 1; // -1 because chapter 1 is always unlocked
        
        return Math.round((completedChapters / totalChapters) * 100);
      },
      
      reset: () => {
        set({
          currentChapter: 1,
          chapterMaps: new Map(),
          currentMap: null,
          unlockedChapters: [1]
        });
      }
    }),
    {
      name: 'chapter-map-storage',
      // Custom serialization for Map
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (str) {
            const state = JSON.parse(str);
            // Convert arrays back to Maps
            if (state.state && state.state.chapterMaps) {
              // Handle both array format (serialized) and object format
              const chapterMapsData = Array.isArray(state.state.chapterMaps) 
                ? state.state.chapterMaps 
                : Object.entries(state.state.chapterMaps);
                
              state.state.chapterMaps = new Map(
                chapterMapsData.map((item: any) => [
                  parseInt(item[0]), // Ensure key is number
                  {
                    ...item[1],
                    nodes: new Map(
                      Array.isArray(item[1].nodes) 
                        ? item[1].nodes 
                        : Object.entries(item[1].nodes || {})
                    )
                  }
                ])
              );
            }
            return state;
          }
          return null;
        },
        setItem: (name, value) => {
          // Convert Maps to arrays for serialization
          const state = {
            ...value,
            state: {
              ...value.state,
              chapterMaps: Array.from(value.state.chapterMaps.entries()).map(([key, map]) => [
                key,
                {
                  ...map,
                  nodes: Array.from(map.nodes.entries())
                }
              ])
            }
          };
          localStorage.setItem(name, JSON.stringify(state));
        },
        removeItem: (name) => localStorage.removeItem(name)
      }
    }
  )
);