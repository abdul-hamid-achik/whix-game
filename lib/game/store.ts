import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';
import type { Partner, Player, PlayerMission } from '../db/schema';

interface GameState {
  // Player State
  player: Player | null;
  partners: Partner[];
  activePartner: Partner | null;
  inventory: any[];
  
  // Mission State
  currentMission: PlayerMission | null;
  activeMissions: PlayerMission[];
  
  // Combat State
  inCombat: boolean;
  combatState: {
    turn: number;
    playerTeam: Partner[];
    enemyTeam: any[];
    turnOrder: any[];
    currentTurnIndex: number;
  } | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: number;
  }>;
  
  // Actions
  setPlayer: (player: Player) => void;
  setPartners: (partners: Partner[]) => void;
  setActivePartner: (partner: Partner | null) => void;
  addPartner: (partner: Partner) => void;
  updatePartner: (partnerId: string, updates: Partial<Partner>) => void;
  
  // Mission Actions
  setCurrentMission: (mission: PlayerMission | null) => void;
  setActiveMissions: (missions: PlayerMission[]) => void;
  updateMissionProgress: (missionId: string, progress: any) => void;
  
  // Combat Actions
  startCombat: (enemyTeam: any[]) => void;
  endCombat: () => void;
  nextTurn: () => void;
  
  // UI Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addNotification: (notification: Omit<GameState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial State
        player: null,
        partners: [],
        activePartner: null,
        inventory: [],
        currentMission: null,
        activeMissions: [],
        inCombat: false,
        combatState: null,
        isLoading: false,
        error: null,
        notifications: [],
        
        // Player Actions
        setPlayer: (player) => set((state) => {
          state.player = player;
        }),
        
        setPartners: (partners) => set((state) => {
          state.partners = partners;
        }),
        
        setActivePartner: (partner) => set((state) => {
          state.activePartner = partner;
        }),
        
        addPartner: (partner) => set((state) => {
          state.partners.push(partner);
        }),
        
        updatePartner: (partnerId, updates) => set((state) => {
          const index = state.partners.findIndex(p => p.id === partnerId);
          if (index !== -1) {
            state.partners[index] = { ...state.partners[index], ...updates };
            if (state.activePartner?.id === partnerId) {
              state.activePartner = { ...state.activePartner, ...updates };
            }
          }
        }),
        
        // Mission Actions
        setCurrentMission: (mission) => set((state) => {
          state.currentMission = mission;
        }),
        
        setActiveMissions: (missions) => set((state) => {
          state.activeMissions = missions;
        }),
        
        updateMissionProgress: (missionId, progress) => set((state) => {
          const mission = state.activeMissions.find(m => m.id === missionId);
          if (mission) {
            mission.progress = { ...mission.progress, ...progress };
          }
          if (state.currentMission?.id === missionId) {
            state.currentMission.progress = { ...state.currentMission.progress, ...progress };
          }
        }),
        
        // Combat Actions
        startCombat: (enemyTeam) => set((state) => {
          const playerTeam = state.activePartner ? [state.activePartner] : state.partners.slice(0, 3);
          const turnOrder = [...playerTeam, ...enemyTeam].sort((a, b) => 
            (b.stats?.speed || 0) - (a.stats?.speed || 0)
          );
          
          state.inCombat = true;
          state.combatState = {
            turn: 1,
            playerTeam,
            enemyTeam,
            turnOrder,
            currentTurnIndex: 0,
          };
        }),
        
        endCombat: () => set((state) => {
          state.inCombat = false;
          state.combatState = null;
        }),
        
        nextTurn: () => set((state) => {
          if (state.combatState) {
            state.combatState.currentTurnIndex = 
              (state.combatState.currentTurnIndex + 1) % state.combatState.turnOrder.length;
            
            if (state.combatState.currentTurnIndex === 0) {
              state.combatState.turn += 1;
            }
          }
        }),
        
        // UI Actions
        setLoading: (loading) => set((state) => {
          state.isLoading = loading;
        }),
        
        setError: (error) => set((state) => {
          state.error = error;
        }),
        
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
      })),
      {
        name: 'whix-game-state',
        partialize: (state) => ({
          player: state.player,
          partners: state.partners,
          activePartner: state.activePartner,
          inventory: state.inventory,
          activeMissions: state.activeMissions,
        }),
      }
    )
  )
);