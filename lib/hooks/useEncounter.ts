import { useState, useEffect, useCallback } from 'react';
import { EncounterEngine } from '@/lib/game/encounter-engine';
import { 
  Encounter, 
  SocialAction, 
  EncounterState,
  EncounterContext,
} from '@/lib/schemas/encounter-schemas';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useGameStore } from '@/lib/stores/gameStore';

interface UseEncounterOptions {
  onComplete?: (outcome: 'victory' | 'defeat', rewards?: { tips?: number; experience?: number; reputation?: number }) => void;
  autoStart?: boolean;
}

interface UseEncounterReturn {
  // State
  currentState: EncounterState & { id: string } | null;
  context: EncounterContext | null;
  isComplete: boolean;
  outcome: 'victory' | 'defeat' | null;
  
  // Actions
  performAction: (action: SocialAction) => void;
  start: () => void;
  
  // UI helpers
  availableActions: SocialAction[];
  actionInProgress: boolean;
  lastActionResult: {
    action: SocialAction;
    success: boolean;
    message?: string;
  } | null;
}

export function useEncounter(
  encounter: Encounter | null,
  options: UseEncounterOptions = {}
): UseEncounterReturn {
  const { onComplete, autoStart = true } = options;
  
  // Get player data
  const { getActivePartners } = usePartnerStore();
  const { earnTips, gainExperience } = useGameStore();
  
  // State
  const [engine, setEngine] = useState<EncounterEngine | null>(null);
  const [currentState, setCurrentState] = useState<EncounterState & { id: string } | null>(null);
  const [context, setContext] = useState<EncounterContext | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [outcome, setOutcome] = useState<'victory' | 'defeat' | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [lastActionResult, setLastActionResult] = useState<any>(null);
  
  // Initialize engine when encounter changes
  useEffect(() => {
    if (!encounter) return;
    
    const activePartners = getActivePartners();
    if (activePartners.length === 0) {
      console.error('No active partners for encounter');
      return;
    }
    
    // Use the first active partner's stats and traits
    const partner = activePartners[0];
    const playerTraits = [partner.primaryTrait, partner.secondaryTrait].filter(Boolean) as string[];
    const playerStats = {
      social: partner.stats.social,
      logic: partner.stats.logic,
      focus: partner.stats.focus,
      perception: partner.stats.perception,
    };
    
    const newEngine = new EncounterEngine(encounter, playerTraits, playerStats);
    setEngine(newEngine);
    
    if (autoStart) {
      newEngine.start();
      setCurrentState(newEngine.getCurrentState());
      setContext(newEngine.getContext());
    }
  }, [encounter, getActivePartners, autoStart]);
  
  // Start encounter manually
  const start = useCallback(() => {
    if (!engine) return;
    
    engine.start();
    setCurrentState(engine.getCurrentState());
    setContext(engine.getContext());
  }, [engine]);
  
  // Perform an action
  const performAction = useCallback(async (action: SocialAction) => {
    if (!engine || actionInProgress || isComplete) return;
    
    setActionInProgress(true);
    
    // Simulate action delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = engine.performAction(action);
    setLastActionResult({ action, ...result });
    
    // Update state
    setCurrentState(engine.getCurrentState());
    setContext(engine.getContext());
    
    // Check if complete
    if (engine.isComplete()) {
      const finalOutcome = engine.getOutcome();
      setIsComplete(true);
      setOutcome(finalOutcome);
      
      // Handle rewards
      if (finalOutcome === 'victory') {
        const rewards = engine.getRewards();
        if (rewards) {
          if (rewards.tips) earnTips(rewards.tips);
          if (rewards.experience) gainExperience(rewards.experience);
          // Note: star fragments, items, etc. can be added here
        }
      }
      
      // Callback
      if (onComplete) {
        onComplete(finalOutcome!, engine.getRewards());
      }
    }
    
    setActionInProgress(false);
  }, [engine, actionInProgress, isComplete, earnTips, gainExperience, onComplete]);
  
  // Get available actions
  const availableActions = currentState?.playerActions || [];
  
  return {
    currentState,
    context,
    isComplete,
    outcome,
    performAction,
    start,
    availableActions,
    actionInProgress,
    lastActionResult,
  };
}

// Helper hook for loading encounters from markdown
export function useEncounterFromMarkdown(encounterId: string): {
  encounter: Encounter | null;
  loading: boolean;
  error: string | null;
} {
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadEncounter() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/content/encounters?id=${encounterId}`);
        if (!response.ok) {
          throw new Error('Failed to load encounter');
        }
        
        const data = await response.json();
        setEncounter(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setEncounter(null);
      } finally {
        setLoading(false);
      }
    }
    
    if (encounterId) {
      loadEncounter();
    }
  }, [encounterId]);
  
  return { encounter, loading, error };
}