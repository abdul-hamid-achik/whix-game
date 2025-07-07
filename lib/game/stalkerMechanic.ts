import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface StalkerPosition {
  x: number;
  y: number;
  lastSeen: number;
  predictedPath: { x: number; y: number }[];
}

export interface StalkerState {
  isActive: boolean;
  stalkerPosition: StalkerPosition | null;
  playerPath: { x: number; y: number; timestamp: number }[];
  detectionLevel: number; // 0-100, higher = closer to being caught
  predictability: number; // 0-100, how predictable player's movement is
  safeZones: { x: number; y: number; radius: number }[];
  lastPatternBreak: number;
  
  // Actions
  initializeStalker: (startPos: { x: number; y: number }) => void;
  updatePlayerPosition: (pos: { x: number; y: number }) => void;
  updateStalkerPosition: () => void;
  checkDetection: () => boolean;
  breakPattern: () => void;
  enterSafeZone: (pos: { x: number; y: number }) => boolean;
  getStalkerVisibility: () => 'hidden' | 'distant' | 'close' | 'detected';
  resetStalker: () => void;
}

export const useStalkerStore = create<StalkerState>()(
  immer((set, get) => ({
    isActive: false,
    stalkerPosition: null,
    playerPath: [],
    detectionLevel: 0,
    predictability: 0,
    safeZones: [
      // Crowded markets (signal noise)
      { x: 15, y: 8, radius: 3 },
      { x: 5, y: 12, radius: 2 },
      // Underground tunnels (signal interference)
      { x: 18, y: 15, radius: 4 },
      { x: 2, y: 18, radius: 3 },
      // Resistance safe houses
      { x: 10, y: 5, radius: 2 },
      { x: 7, y: 17, radius: 2 },
    ],
    lastPatternBreak: 0,
    
    initializeStalker: (startPos) => set((state) => {
      state.isActive = true;
      state.stalkerPosition = {
        x: startPos.x,
        y: startPos.y,
        lastSeen: Date.now(),
        predictedPath: []
      };
      state.playerPath = [];
      state.detectionLevel = 0;
      state.predictability = 0;
      state.lastPatternBreak = Date.now();
    }),
    
    updatePlayerPosition: (pos) => set((state) => {
      if (!state.isActive) return;
      
      const now = Date.now();
      state.playerPath.push({ ...pos, timestamp: now });
      
      // Keep only last 10 positions for pattern analysis
      if (state.playerPath.length > 10) {
        state.playerPath = state.playerPath.slice(-10);
      }
      
      // Calculate predictability based on movement patterns
      if (state.playerPath.length >= 3) {
        const recentMoves = state.playerPath.slice(-3);
        const vectors = [];
        
        for (let i = 1; i < recentMoves.length; i++) {
          vectors.push({
            dx: recentMoves[i].x - recentMoves[i-1].x,
            dy: recentMoves[i].y - recentMoves[i-1].y
          });
        }
        
        // Check for patterns (similar vectors)
        let patternScore = 0;
        for (let i = 1; i < vectors.length; i++) {
          const similarity = Math.abs(vectors[i].dx - vectors[i-1].dx) + 
                           Math.abs(vectors[i].dy - vectors[i-1].dy);
          if (similarity <= 1) patternScore += 30;
        }
        
        state.predictability = Math.min(100, state.predictability + patternScore - 5);
      }
      
      // Increase detection if player is predictable
      if (state.predictability > 50) {
        state.detectionLevel = Math.min(100, state.detectionLevel + 3);
      }
    }),
    
    updateStalkerPosition: () => set((state) => {
      if (!state.isActive || !state.stalkerPosition || state.playerPath.length === 0) return;
      
      const lastPlayerPos = state.playerPath[state.playerPath.length - 1];
      const stalker = state.stalkerPosition;
      
      // Prediction algorithm - where will player go next?
      let predictedNext = { ...lastPlayerPos };
      
      if (state.playerPath.length >= 2 && state.predictability > 30) {
        const lastMove = {
          dx: lastPlayerPos.x - state.playerPath[state.playerPath.length - 2].x,
          dy: lastPlayerPos.y - state.playerPath[state.playerPath.length - 2].y
        };
        
        // Predict next position based on pattern
        predictedNext = {
          x: lastPlayerPos.x + lastMove.dx,
          y: lastPlayerPos.y + lastMove.dy,
          timestamp: Date.now()
        };
      }
      
      // Stalker tries to position himself optimally (not too close, not too far)
      const optimalDistance = 4; // 4 blocks away
      const currentDistance = Math.abs(stalker.x - lastPlayerPos.x) + 
                            Math.abs(stalker.y - lastPlayerPos.y);
      
      if (currentDistance > optimalDistance + 2) {
        // Move closer to player
        if (stalker.x < lastPlayerPos.x) stalker.x++;
        else if (stalker.x > lastPlayerPos.x) stalker.x--;
        
        if (stalker.y < lastPlayerPos.y) stalker.y++;
        else if (stalker.y > lastPlayerPos.y) stalker.y--;
      } else if (currentDistance < optimalDistance - 1) {
        // Move away to maintain optimal distance
        if (stalker.x < lastPlayerPos.x) stalker.x--;
        else if (stalker.x > lastPlayerPos.x) stalker.x++;
        
        if (stalker.y < lastPlayerPos.y) stalker.y--;
        else if (stalker.y > lastPlayerPos.y) stalker.y++;
      }
      
      // Update prediction path
      stalker.predictedPath = [predictedNext];
      stalker.lastSeen = Date.now();
    }),
    
    checkDetection: () => {
      const state = get();
      if (!state.isActive) return false;
      
      // Check if detection level is too high
      if (state.detectionLevel >= 100) {
        return true;
      }
      
      // Check if player is in line of sight for too long
      if (state.stalkerPosition && state.playerPath.length > 0) {
        const lastPlayerPos = state.playerPath[state.playerPath.length - 1];
        const distance = Math.abs(state.stalkerPosition.x - lastPlayerPos.x) + 
                        Math.abs(state.stalkerPosition.y - lastPlayerPos.y);
        
        // Too close for too long
        if (distance <= 2) {
          set((state) => {
            state.detectionLevel = Math.min(100, state.detectionLevel + 10);
          });
          return state.detectionLevel >= 100;
        }
      }
      
      return false;
    },
    
    breakPattern: () => set((state) => {
      state.predictability = Math.max(0, state.predictability - 40);
      state.detectionLevel = Math.max(0, state.detectionLevel - 20);
      state.lastPatternBreak = Date.now();
    }),
    
    enterSafeZone: (pos) => {
      const state = get();
      const inSafeZone = state.safeZones.some(zone => {
        const distance = Math.sqrt((pos.x - zone.x) ** 2 + (pos.y - zone.y) ** 2);
        return distance <= zone.radius;
      });
      
      if (inSafeZone) {
        set((state) => {
          state.detectionLevel = Math.max(0, state.detectionLevel - 30);
          state.predictability = Math.max(0, state.predictability - 20);
        });
      }
      
      return inSafeZone;
    },
    
    getStalkerVisibility: () => {
      const state = get();
      if (!state.isActive || !state.stalkerPosition || state.playerPath.length === 0) {
        return 'hidden';
      }
      
      const lastPlayerPos = state.playerPath[state.playerPath.length - 1];
      const distance = Math.abs(state.stalkerPosition.x - lastPlayerPos.x) + 
                      Math.abs(state.stalkerPosition.y - lastPlayerPos.y);
      
      if (state.detectionLevel >= 80) return 'detected';
      if (distance <= 3) return 'close';
      if (distance <= 6) return 'distant';
      return 'hidden';
    },
    
    resetStalker: () => set((state) => {
      state.isActive = false;
      state.stalkerPosition = null;
      state.playerPath = [];
      state.detectionLevel = 0;
      state.predictability = 0;
      state.lastPatternBreak = Date.now();
    })
  }))
);

// Stalker UI component helpers
export const getStalkerIcon = (visibility: ReturnType<StalkerState['getStalkerVisibility']>) => {
  switch (visibility) {
    case 'detected': return '🔴'; // Red dot - immediate danger
    case 'close': return '🟠'; // Orange dot - getting close
    case 'distant': return '🟡'; // Yellow dot - distant tracking
    case 'hidden': return null; // No indicator
  }
};

export const getStalkerTooltip = (visibility: ReturnType<StalkerState['getStalkerVisibility']>) => {
  switch (visibility) {
    case 'detected': return 'The Watcher has found you! Escape immediately!';
    case 'close': return 'You sense you\'re being watched...';
    case 'distant': return 'Something feels off about your surroundings';
    case 'hidden': return null;
  }
};

// Game over condition for stalker mechanic
export const checkStalkerGameOver = (): boolean => {
  const { checkDetection } = useStalkerStore.getState();
  return checkDetection();
};