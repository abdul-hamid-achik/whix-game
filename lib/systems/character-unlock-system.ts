import { z } from 'zod';
import { StoryRequirementSchema } from '@/lib/schemas/game-schemas';

// Character unlock condition schema
export const CharacterUnlockConditionSchema = z.object({
  id: z.string(),
  characterId: z.string(),
  type: z.enum(['story', 'level', 'tips', 'mission_count', 'composite']),
  requirement: z.union([
    z.object({
      type: z.literal('story'),
      chapter: z.string(),
    }),
    z.object({
      type: z.literal('level'),
      minLevel: z.number(),
    }),
    z.object({
      type: z.literal('tips'),
      totalEarned: z.number(),
    }),
    z.object({
      type: z.literal('mission_count'),
      completed: z.number(),
      missionType: z.enum(['story', 'daily', 'any']).optional(),
    }),
    z.object({
      type: z.literal('composite'),
      conditions: z.array(StoryRequirementSchema),
      requireAll: z.boolean(),
    }),
  ]),
  unlockMessage: z.string(),
  priority: z.number(), // Lower numbers unlock first
});

export type CharacterUnlockCondition = z.infer<typeof CharacterUnlockConditionSchema>;

// Progressive unlock definitions based on LKR-style progression
export const CHARACTER_UNLOCK_CONDITIONS: CharacterUnlockCondition[] = [
  // Starter characters (unlocked by default)
  {
    id: 'starter-1',
    characterId: 'kira-chen',
    type: 'story',
    requirement: {
      type: 'story',
      chapter: 'prologue',
    },
    unlockMessage: 'Kira Chen has joined your courier network!',
    priority: 1,
  },
  {
    id: 'starter-2', 
    characterId: 'alex-rivera',
    type: 'story',
    requirement: {
      type: 'story',
      chapter: 'prologue',
    },
    unlockMessage: 'Alex Rivera is ready for deliveries!',
    priority: 2,
  },
  {
    id: 'starter-3',
    characterId: 'sam-torres',
    type: 'story',
    requirement: {
      type: 'story',
      chapter: 'prologue',
    },
    unlockMessage: 'Sam Torres has completed onboarding!',
    priority: 3,
  },
  
  // Chapter 1 unlocks
  {
    id: 'chapter1-unlock-1',
    characterId: 'maya-singh',
    type: 'story',
    requirement: {
      type: 'story',
      chapter: 'chapter-1',
    },
    unlockMessage: 'Maya Singh emerged from the shadows to join your cause!',
    priority: 10,
  },
  {
    id: 'chapter1-unlock-2',
    characterId: 'leo-nakamura', 
    type: 'composite',
    requirement: {
      type: 'composite',
      conditions: [
        { chapter: 'chapter-1' },
        { level: 3 },
      ],
      requireAll: true,
    },
    unlockMessage: 'Leo Nakamura trusts your growing reputation!',
    priority: 11,
  },
  
  // Level-based unlocks
  {
    id: 'level-unlock-1',
    characterId: 'zara-okafor',
    type: 'level',
    requirement: {
      type: 'level',
      minLevel: 5,
    },
    unlockMessage: 'Zara Okafor notices your professional growth!',
    priority: 20,
  },
  {
    id: 'level-unlock-2',
    characterId: 'marcus-webb',
    type: 'tips',
    requirement: {
      type: 'tips',
      totalEarned: 5000,
    },
    unlockMessage: 'Marcus Webb respects your earning potential!',
    priority: 21,
  },
  
  // Mission-based unlocks
  {
    id: 'mission-unlock-1',
    characterId: 'elena-vasquez',
    type: 'mission_count',
    requirement: {
      type: 'mission_count',
      completed: 10,
      missionType: 'any',
    },
    unlockMessage: 'Elena Vasquez acknowledges your dedication!',
    priority: 30,
  },
  
  // Advanced unlocks (Chapter 2+)
  {
    id: 'chapter2-unlock-1',
    characterId: 'james-foster',
    type: 'composite',
    requirement: {
      type: 'composite',
      conditions: [
        { chapter: 'chapter-2' },
        { level: 8 },
      ],
      requireAll: true,
    },
    unlockMessage: 'James Foster joins the resistance against corporate control!',
    priority: 40,
  },
  {
    id: 'chapter2-unlock-2',
    characterId: 'nova-kim',
    type: 'composite',
    requirement: {
      type: 'composite',
      conditions: [
        { chapter: 'chapter-2' },
        { level: 10 },
      ],
      requireAll: true,
    },
    unlockMessage: 'Nova Kim breaks free from corporate programming!',
    priority: 41,
  },
  
  // Late game unlocks
  {
    id: 'endgame-unlock-1',
    characterId: 'kai-patel',
    type: 'composite',
    requirement: {
      type: 'composite',
      conditions: [
        { chapter: 'chapter-5' },
        { level: 15 },
      ],
      requireAll: true,
    },
    unlockMessage: 'Kai Patel emerges from the corporate underground!',
    priority: 50,
  },
];

export class CharacterUnlockSystem {
  /**
   * Check which characters should be unlocked based on current game state
   */
  static checkUnlocks(gameState: {
    level: number;
    completedChapters: string[];
    totalTipsEarned: number;
    missionsCompleted: number;
    storyFlags: string[];
  }): CharacterUnlockCondition[] {
    return CHARACTER_UNLOCK_CONDITIONS.filter(condition => 
      this.meetsUnlockRequirement(condition, gameState)
    ).sort((a, b) => a.priority - b.priority);
  }
  
  /**
   * Check if a specific unlock condition is met
   */
  static meetsUnlockRequirement(
    condition: CharacterUnlockCondition,
    gameState: {
      level: number;
      completedChapters: string[];
      totalTipsEarned: number;
      missionsCompleted: number;
      storyFlags: string[];
    }
  ): boolean {
    const { requirement } = condition;
    
    switch (requirement.type) {
      case 'story':
        return gameState.completedChapters.includes(requirement.chapter);
        
      case 'level':
        return gameState.level >= requirement.minLevel;
        
      case 'tips':
        return gameState.totalTipsEarned >= requirement.totalEarned;
        
      case 'mission_count':
        return gameState.missionsCompleted >= requirement.completed;
        
      case 'composite':
        const results = requirement.conditions.map(cond => {
          if (cond?.chapter) {
            return gameState.completedChapters.includes(cond.chapter);
          }
          if (cond?.level) {
            return gameState.level >= cond.level;
          }
          if (cond?.flag) {
            return gameState.storyFlags.includes(cond.flag);
          }
          return false;
        });
        
        return requirement.requireAll 
          ? results.every(Boolean)
          : results.some(Boolean);
        
      default:
        return false;
    }
  }
  
  /**
   * Get next unlock requirements for UI display
   */
  static getNextUnlocks(
    currentlyUnlocked: string[],
    gameState: {
      level: number;
      completedChapters: string[];
      totalTipsEarned: number;
      missionsCompleted: number;
      storyFlags: string[];
    }
  ): Array<CharacterUnlockCondition & { progress: number }> {
    const availableUnlocks = CHARACTER_UNLOCK_CONDITIONS
      .filter(condition => !currentlyUnlocked.includes(condition.characterId))
      .filter(condition => !this.meetsUnlockRequirement(condition, gameState))
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3); // Show next 3 unlocks
    
    return availableUnlocks.map(condition => ({
      ...condition,
      progress: this.calculateProgress(condition, gameState),
    }));
  }
  
  /**
   * Calculate progress towards unlock (0-1)
   */
  private static calculateProgress(
    condition: CharacterUnlockCondition,
    gameState: {
      level: number;
      completedChapters: string[];
      totalTipsEarned: number;
      missionsCompleted: number;
      storyFlags: string[];
    }
  ): number {
    const { requirement } = condition;
    
    switch (requirement.type) {
      case 'story':
        // Binary for story unlocks
        return gameState.completedChapters.includes(requirement.chapter) ? 1 : 0;
        
      case 'level':
        return Math.min(gameState.level / requirement.minLevel, 1);
        
      case 'tips':
        return Math.min(gameState.totalTipsEarned / requirement.totalEarned, 1);
        
      case 'mission_count':
        return Math.min(gameState.missionsCompleted / requirement.completed, 1);
        
      case 'composite':
        const progresses = requirement.conditions.map(cond => {
          if (cond?.chapter) {
            return gameState.completedChapters.includes(cond.chapter) ? 1 : 0;
          }
          if (cond?.level) {
            return Math.min(gameState.level / cond.level, 1);
          }
          if (cond?.flag) {
            return gameState.storyFlags.includes(cond.flag) ? 1 : 0;
          }
          return 0;
        });
        
        return progresses.reduce((sum, progress) => sum + progress, 0) / progresses.length;
        
      default:
        return 0;
    }
  }
  
  /**
   * Get unlock condition description for UI
   */
  static getUnlockDescription(condition: CharacterUnlockCondition): string {
    const { requirement } = condition;
    
    switch (requirement.type) {
      case 'story':
        return `Complete ${requirement.chapter}`;
        
      case 'level':
        return `Reach level ${requirement.minLevel}`;
        
      case 'tips':
        return `Earn ${requirement.totalEarned.toLocaleString()} total tips`;
        
      case 'mission_count':
        return `Complete ${requirement.completed} missions`;
        
      case 'composite':
        const descriptions = requirement.conditions.map(cond => {
          if (cond?.chapter) return `Complete ${cond.chapter}`;
          if (cond?.level) return `Level ${cond.level}`;
          if (cond?.flag) return `Story flag: ${cond.flag}`;
          return 'Unknown requirement';
        });
        
        const connector = requirement.requireAll ? ' AND ' : ' OR ';
        return descriptions.join(connector);
        
      default:
        return 'Unknown requirement';
    }
  }
}