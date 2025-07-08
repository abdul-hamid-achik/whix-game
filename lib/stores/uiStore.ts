import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { 
  GameState, 
  UIContextData, 
  UIContextDataSchema, 
  PanelConfig
} from '@/lib/schemas/game-schemas';

// Use GameState from schemas instead of local enum
export { GameState } from '@/lib/schemas/game-schemas';

// Panel configuration for different UI states - use schema type
export type Panel = PanelConfig & {
  zIndex?: number;
};

export interface UIState {
  // Current game state
  currentState: GameState;
  previousState: GameState | null;
  
  // Context data for current state
  contextData: UIContextData;
  
  // Panel management
  panels: {
    [key: string]: Panel;
  };
  
  // UI settings
  settings: {
    theme: 'neura' | 'classic';
    animations: boolean;
    soundEffects: boolean;
    uiScale: number;
    showTutorials: boolean;
    reducedMotion: boolean;
    effectsIntensity: 'low' | 'medium' | 'high';
    appMode: 'game' | 'delivery';
  };
  
  // Navigation history for back button functionality
  navigationHistory: GameState[];
  
  // Loading states
  isLoading: boolean;
  loadingMessage?: string;
}

export interface UIActions {
  // State management
  setState: (state: GameState, contextData?: UIContextData) => void;
  goBack: () => void;
  
  // Panel management
  showPanel: (panelId: string, config: Partial<Panel>) => void;
  hidePanel: (panelId: string) => void;
  togglePanel: (panelId: string) => void;
  
  // Settings
  updateSettings: (settings: Partial<UIState['settings']>) => void;
  
  // Loading
  setLoading: (loading: boolean, message?: string) => void;
  
  // Context data
  updateContextData: (data: UIContextData) => void;
  
  // Reset to initial state
  reset: () => void;
}

const initialState: UIState = {
  currentState: GameState.COURIER_HUB,
  previousState: null,
  contextData: undefined,
  panels: {},
  settings: {
    theme: 'neura',
    animations: true,
    soundEffects: true,
    uiScale: 1,
    showTutorials: true,
    reducedMotion: false,
    effectsIntensity: 'low',
    appMode: 'game',
  },
  navigationHistory: [],
  isLoading: false,
};

export const useUIStore = create<UIState & UIActions>()(
  immer((set, _get) => ({
    ...initialState,

    setState: (state: GameState, contextData?: UIContextData) => {
      set((draft) => {
        draft.previousState = draft.currentState;
        draft.currentState = state;
        draft.navigationHistory.push(draft.previousState);
        
        // Limit history to last 10 states
        if (draft.navigationHistory.length > 10) {
          draft.navigationHistory.shift();
        }
        
        if (contextData) {
          // Validate context data with Zod
          const validatedContext = UIContextDataSchema.parse(contextData);
          draft.contextData = validatedContext;
        }
        
        // Auto-hide panels when changing major states
        if (state !== draft.previousState) {
          Object.keys(draft.panels).forEach(panelId => {
            if (draft.panels[panelId].position === 'overlay') {
              draft.panels[panelId].visible = false;
            }
          });
        }
      });
    },

    goBack: () => {
      set((draft) => {
        if (draft.navigationHistory.length > 0) {
          const previousState = draft.navigationHistory.pop();
          if (previousState) {
            draft.previousState = draft.currentState;
            draft.currentState = previousState;
          }
        }
      });
    },

    showPanel: (panelId: string, config: Partial<Panel>) => {
      set((draft) => {
        draft.panels[panelId] = {
          visible: true,
          position: 'overlay',
          size: 'medium',
          ...config,
        };
      });
    },

    hidePanel: (panelId: string) => {
      set((draft) => {
        if (draft.panels[panelId]) {
          draft.panels[panelId].visible = false;
        }
      });
    },

    togglePanel: (panelId: string) => {
      set((draft) => {
        if (draft.panels[panelId]) {
          draft.panels[panelId].visible = !draft.panels[panelId].visible;
        }
      });
    },

    updateSettings: (settings: Partial<UIState['settings']>) => {
      set((draft) => {
        Object.assign(draft.settings, settings);
      });
    },

    setLoading: (loading: boolean, message?: string) => {
      set((draft) => {
        draft.isLoading = loading;
        draft.loadingMessage = message;
      });
    },

    updateContextData: (data: UIContextData) => {
      set((draft) => {
        // Validate context data with Zod
        const validatedContext = UIContextDataSchema.parse(data);
        if (draft.contextData) {
          Object.assign(draft.contextData, validatedContext);
        } else {
          draft.contextData = validatedContext;
        }
      });
    },

    reset: () => {
      set(() => ({ ...initialState }));
    },
  }))
);

// Selector hooks for specific UI states
export const useCurrentGameState = () => useUIStore((state) => state.currentState);
export const useIsLoading = () => useUIStore((state) => state.isLoading);
export const useUISettings = () => useUIStore((state) => state.settings);
export const usePanels = () => useUIStore((state) => state.panels);
export const useContextData = () => useUIStore((state) => state.contextData);