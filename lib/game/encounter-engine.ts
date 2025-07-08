import { createMachine, state, transition, interpret } from 'robot3';
import { 
  Encounter, 
  EncounterContext, 
  SocialAction,
  Condition,
  EncounterState,
} from '@/lib/schemas/encounter-schemas';

export class EncounterEngine {
  private encounter: Encounter;
  private context: EncounterContext;
  private machine: any;
  private service: any;
  
  constructor(encounter: Encounter, playerTraits: string[], playerStats: any) {
    this.encounter = encounter;
    this.context = {
      currentState: encounter.initialState,
      reputation: encounter.initialValues.reputation,
      stress: encounter.initialValues.stress,
      maxStress: encounter.initialValues.maxStress,
      roundsPassed: 0,
      history: [],
      playerTraits,
      playerStats,
    };
    
    this.machine = this.buildStateMachine();
    this.service = interpret(this.machine, this.onTransition.bind(this));
  }
  
  private buildStateMachine() {
    const states: any = {};
    
    // Build states from encounter definition
    Object.entries(this.encounter.states).forEach(([stateId, stateData]) => {
      const transitions: any = {};
      
      // Add transitions for each available action
      stateData.playerActions.forEach(action => {
        const transitionKey = `${action}`;
        transitions[transitionKey] = () => {
          // Find matching transition
          const matchingTransition = this.encounter.transitions.find(
            t => t.from === stateId && t.action === action
          );
          
          if (matchingTransition) {
            return matchingTransition.to;
          }
          
          // Default transition logic if no specific transition defined
          return this.getDefaultTransition(stateId, action);
        };
      });
      
      // Add automatic transitions (time-based, condition-based)
      const autoTransitions = this.encounter.transitions.filter(
        t => t.from === stateId && !t.action
      );
      
      autoTransitions.forEach((trans, index) => {
        transitions[`auto_${index}`] = () => {
          if (this.checkCondition(trans.condition)) {
            return trans.to;
          }
          return stateId; // Stay in current state
        };
      });
      
      states[stateId] = state(...Object.entries(transitions).map(
        ([event, target]) => transition(event, target as any)
      ));
    });
    
    // Add terminal states
    states['victory'] = state();
    states['defeat'] = state();
    
    return createMachine(this.encounter.initialState, states);
  }
  
  private onTransition(service: any) {
    const newState = service.machine.current;
    
    // Update context
    this.context.currentState = newState;
    this.context.roundsPassed++;
    
    // Check win/lose conditions
    if (this.checkWinConditions()) {
      this.service.send('victory');
    } else if (this.checkLoseConditions()) {
      this.service.send('defeat');
    }
  }
  
  private checkCondition(condition?: any): boolean {
    if (!condition) return true;
    
    const { reputation, stress, roundsPassed } = condition;
    
    if (reputation !== undefined) {
      return this.context.reputation >= reputation;
    }
    
    if (stress !== undefined) {
      return this.context.stress <= stress;
    }
    
    if (roundsPassed !== undefined) {
      return this.context.roundsPassed >= roundsPassed;
    }
    
    return true;
  }
  
  private checkWinConditions(): boolean {
    return this.encounter.winConditions.some(condition => 
      this.evaluateCondition(condition)
    );
  }
  
  private checkLoseConditions(): boolean {
    return this.encounter.loseConditions.some(condition => 
      this.evaluateCondition(condition)
    );
  }
  
  private evaluateCondition(condition: Condition): boolean {
    const { type, value, state: targetState, comparison } = condition;
    
    switch (type) {
      case 'reputation':
        return this.compare(this.context.reputation, value!, comparison);
      
      case 'stress':
        return this.compare(this.context.stress, value!, comparison);
      
      case 'rounds':
        return this.compare(this.context.roundsPassed, value!, comparison);
      
      case 'state':
        return this.context.currentState === targetState;
      
      default:
        return false;
    }
  }
  
  private compare(a: number, b: number, op: string): boolean {
    switch (op) {
      case 'gt': return a > b;
      case 'gte': return a >= b;
      case 'lt': return a < b;
      case 'lte': return a <= b;
      case 'eq': return a === b;
      default: return false;
    }
  }
  
  private getDefaultTransition(fromState: string, action: SocialAction): string {
    // Default transition logic based on action type
    const currentMood = this.encounter.states[fromState].mood || 'neutral';
    
    // Simplified mood progression
    const moodProgression = {
      'furious': ['angry', 'annoyed', 'neutral'],
      'angry': ['annoyed', 'neutral', 'calming'],
      'annoyed': ['neutral', 'calming', 'satisfied'],
      'neutral': ['calming', 'satisfied'],
      'calming': ['satisfied'],
      'satisfied': ['satisfied'],
    };
    
    // Actions that tend to improve mood
    const deescalatingActions: SocialAction[] = ['apologize', 'de_escalate', 'empathize', 'humor'];
    
    // Actions that tend to worsen mood
    const escalatingActions: SocialAction[] = ['argue', 'firm_boundary'];
    
    if (deescalatingActions.includes(action)) {
      // Try to find a calmer state
      const possibleMoods = moodProgression[currentMood as keyof typeof moodProgression] || [];
      for (const targetMood of possibleMoods) {
        const targetState = Object.entries(this.encounter.states).find(
          ([_, state]) => state.mood === targetMood
        );
        if (targetState) return targetState[0];
      }
    }
    
    if (escalatingActions.includes(action)) {
      // Try to find an angrier state
      const reverseMoodMap = {
        'satisfied': 'calming',
        'calming': 'neutral',
        'neutral': 'annoyed',
        'annoyed': 'angry',
        'angry': 'furious',
      };
      
      const targetMood = reverseMoodMap[currentMood as keyof typeof reverseMoodMap];
      if (targetMood) {
        const targetState = Object.entries(this.encounter.states).find(
          ([_, state]) => state.mood === targetMood
        );
        if (targetState) return targetState[0];
      }
    }
    
    // Default: stay in current state
    return fromState;
  }
  
  // Public API
  
  start() {
    this.service.start();
    this.context.history.push({
      state: this.encounter.initialState,
      timestamp: Date.now(),
    });
  }
  
  performAction(action: SocialAction): {
    success: boolean;
    newState: string;
    effects: any;
    message?: string;
  } {
    const currentStateData = this.encounter.states[this.context.currentState];
    
    // Check if action is available
    if (!currentStateData.playerActions.includes(action)) {
      return {
        success: false,
        newState: this.context.currentState,
        effects: {},
        message: 'Action not available in current state',
      };
    }
    
    // Apply action effects
    const actionMetadata = this.getActionMetadata(action);
    if (actionMetadata?.effects) {
      this.context.reputation += actionMetadata.effects.reputationChange;
      this.context.stress += actionMetadata.effects.stressChange;
      
      // Clamp values
      this.context.reputation = Math.max(0, Math.min(100, this.context.reputation));
      this.context.stress = Math.max(0, Math.min(this.context.maxStress, this.context.stress));
    }
    
    // Send event to state machine
    this.service.send(action);
    
    // Record in history
    this.context.history.push({
      state: this.context.currentState,
      action,
      timestamp: Date.now(),
    });
    
    // Apply any transition effects
    const transition = this.encounter.transitions.find(
      t => t.from === this.context.currentState && t.action === action
    );
    
    if (transition?.effects) {
      this.context.reputation += transition.effects.reputationChange || 0;
      this.context.stress += transition.effects.stressChange || 0;
    }
    
    return {
      success: true,
      newState: this.service.machine.current,
      effects: {
        reputation: this.context.reputation,
        stress: this.context.stress,
      },
    };
  }
  
  getCurrentState(): EncounterState & { id: string } {
    const stateId = this.service.machine.current;
    return {
      id: stateId,
      ...this.encounter.states[stateId],
    };
  }
  
  getContext(): EncounterContext {
    return { ...this.context };
  }
  
  isComplete(): boolean {
    const current = this.service.machine.current;
    return current === 'victory' || current === 'defeat';
  }
  
  getOutcome(): 'victory' | 'defeat' | null {
    const current = this.service.machine.current;
    if (current === 'victory') return 'victory';
    if (current === 'defeat') return 'defeat';
    return null;
  }
  
  getRewards(): any {
    if (this.getOutcome() === 'victory') {
      return this.encounter.winOutcome.rewards;
    }
    return null;
  }
  
  private getActionMetadata(action: SocialAction): any {
    // This would normally come from a centralized action definition
    // For now, returning basic effects based on action type
    const actionEffects: Record<SocialAction, any> = {
      negotiate: { reputationChange: 5, stressChange: 0 },
      argue: { reputationChange: -5, stressChange: 10 },
      show_proof: { reputationChange: 10, stressChange: -5 },
      de_escalate: { reputationChange: 5, stressChange: -10 },
      call_support: { reputationChange: 0, stressChange: 5 },
      apologize: { reputationChange: -5, stressChange: -15 },
      document: { reputationChange: 0, stressChange: -5 },
      empathize: { reputationChange: 10, stressChange: -10 },
      firm_boundary: { reputationChange: 0, stressChange: 5 },
      humor: { reputationChange: 5, stressChange: -10 },
      wait: { reputationChange: 0, stressChange: 5 },
    };
    
    return { effects: actionEffects[action] };
  }
}