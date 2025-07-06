import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { Mission, MissionType, MissionDifficulty, generateMission } from '../game/missions';

interface MissionProgress {
  missionId: string;
  startedAt: number;
  objectiveProgress: Record<string, number>;
  partnersUsed: string[];
  isActive: boolean;
}

interface MissionState {
  // Available Missions
  availableMissions: Mission[];
  dailyMissions: Mission[];
  weeklyMission: Mission | null;
  specialEvent: Mission | null;
  
  // Active Missions
  activeMissions: MissionProgress[];
  currentMissionId: string | null;
  
  // Mission Generation
  lastDailyRefresh: number;
  lastWeeklyRefresh: number;
  missionSeed: number;
  
  // Statistics
  missionStats: {
    [key in MissionType]?: {
      completed: number;
      failed: number;
      abandoned: number;
      perfectRuns: number;
    };
  };
  
  // Actions
  generateDailyMissions: (playerLevel: number) => void;
  generateWeeklyMission: (playerLevel: number) => void;
  refreshAvailableMissions: (playerLevel: number) => void;
  
  // Mission Management
  startMission: (missionId: string, partnerIds: string[]) => boolean;
  updateMissionProgress: (missionId: string, objectiveId: string, progress: number) => void;
  completeMission: (missionId: string, perfect: boolean) => void;
  abandonMission: (missionId: string) => void;
  
  // Special Events
  triggerSpecialEvent: (event: Mission) => void;
  clearSpecialEvent: () => void;
  
  // Utility
  getMissionById: (missionId: string) => Mission | undefined;
  getActiveMissionProgress: (missionId: string) => MissionProgress | undefined;
  canStartMission: (mission: Mission, partnerStats: any) => boolean;
}

export const useMissionStore = create<MissionState>()(
  devtools(
    immer((set, get) => ({
      // Initial State
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
      
      // Mission Generation
      generateDailyMissions: (playerLevel) => set((state) => {
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        if (now - state.lastDailyRefresh >= oneDayMs) {
          state.dailyMissions = [
            generateMission('standard_delivery', 'normal', playerLevel),
            generateMission('customer_negotiation', 'normal', playerLevel),
            generateMission('quality_control', 'normal', playerLevel),
          ];
          state.lastDailyRefresh = now;
        }
      }),
      
      generateWeeklyMission: (playerLevel) => set((state) => {
        const now = Date.now();
        const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
        
        if (now - state.lastWeeklyRefresh >= oneWeekMs) {
          const difficulties: MissionDifficulty[] = ['hard', 'expert'];
          const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
          state.weeklyMission = generateMission('weekly', difficulty, playerLevel);
          state.lastWeeklyRefresh = now;
        }
      }),
      
      refreshAvailableMissions: (playerLevel) => set((state) => {
        const missionTypes: MissionType[] = [
          'standard_delivery',
          'customer_negotiation',
          'quality_control',
          'data_analysis',
          'investigation',
        ];
        
        const difficulties: MissionDifficulty[] = ['easy', 'normal', 'hard'];
        
        state.availableMissions = Array(6).fill(null).map(() => {
          const type = missionTypes[Math.floor(Math.random() * missionTypes.length)];
          const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
          return generateMission(type, difficulty, playerLevel);
        });
      }),
      
      // Mission Management
      startMission: (missionId, partnerIds) => {
        const mission = get().getMissionById(missionId);
        if (!mission || get().activeMissions.some(m => m.missionId === missionId)) {
          return false;
        }
        
        set((state) => {
          const progress: MissionProgress = {
            missionId,
            startedAt: Date.now(),
            objectiveProgress: {},
            partnersUsed: partnerIds,
            isActive: true,
          };
          
          mission.objectives.forEach(obj => {
            progress.objectiveProgress[obj.id] = 0;
          });
          
          state.activeMissions.push(progress);
          state.currentMissionId = missionId;
        });
        
        return true;
      },
      
      updateMissionProgress: (missionId, objectiveId, progress) => set((state) => {
        const missionProgress = state.activeMissions.find(m => m.missionId === missionId);
        if (missionProgress) {
          missionProgress.objectiveProgress[objectiveId] = progress;
        }
      }),
      
      completeMission: (missionId, perfect) => set((state) => {
        const mission = get().getMissionById(missionId);
        const progress = state.activeMissions.find(m => m.missionId === missionId);
        
        if (mission && progress) {
          // Update stats
          const typeStats = state.missionStats[mission.type] || {
            completed: 0,
            failed: 0,
            abandoned: 0,
            perfectRuns: 0,
          };
          
          typeStats.completed += 1;
          if (perfect) {
            typeStats.perfectRuns += 1;
          }
          
          state.missionStats[mission.type] = typeStats;
          
          // Remove from active missions
          state.activeMissions = state.activeMissions.filter(m => m.missionId !== missionId);
          
          if (state.currentMissionId === missionId) {
            state.currentMissionId = null;
          }
          
          // Remove from available missions
          state.availableMissions = state.availableMissions.filter(m => m.id !== missionId);
          state.dailyMissions = state.dailyMissions.filter(m => m.id !== missionId);
          
          if (state.weeklyMission?.id === missionId) {
            state.weeklyMission = null;
          }
          
          if (state.specialEvent?.id === missionId) {
            state.specialEvent = null;
          }
        }
      }),
      
      abandonMission: (missionId) => set((state) => {
        const mission = get().getMissionById(missionId);
        const progress = state.activeMissions.find(m => m.missionId === missionId);
        
        if (mission && progress) {
          // Update stats
          const typeStats = state.missionStats[mission.type] || {
            completed: 0,
            failed: 0,
            abandoned: 0,
            perfectRuns: 0,
          };
          
          typeStats.abandoned += 1;
          state.missionStats[mission.type] = typeStats;
          
          // Remove from active missions
          state.activeMissions = state.activeMissions.filter(m => m.missionId !== missionId);
          
          if (state.currentMissionId === missionId) {
            state.currentMissionId = null;
          }
        }
      }),
      
      // Special Events
      triggerSpecialEvent: (event) => set((state) => {
        state.specialEvent = event;
      }),
      
      clearSpecialEvent: () => set((state) => {
        state.specialEvent = null;
      }),
      
      // Utility
      getMissionById: (missionId) => {
        const state = get();
        return [
          ...state.availableMissions,
          ...state.dailyMissions,
          state.weeklyMission,
          state.specialEvent,
        ].find(m => m?.id === missionId);
      },
      
      getActiveMissionProgress: (missionId) => {
        return get().activeMissions.find(m => m.missionId === missionId);
      },
      
      canStartMission: (mission, partnerStats) => {
        if (!mission.requirements) return true;
        
        const reqs = mission.requirements;
        
        // Check stat requirements
        if (reqs.stats) {
          for (const [stat, value] of Object.entries(reqs.stats)) {
            if (partnerStats[stat] < value) return false;
          }
        }
        
        // TODO: Check other requirements (class, traits, level)
        
        return true;
      },
    }))
  )
);