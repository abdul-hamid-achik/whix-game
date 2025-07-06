import { z } from 'zod';

export const CombatPositionSchema = z.object({
  x: z.number().min(0).max(4),
  y: z.number().min(0).max(4),
});

export type CombatPosition = z.infer<typeof CombatPositionSchema>;

export const CombatUnitSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['partner', 'enemy']),
  position: CombatPositionSchema,
  stats: z.object({
    currentHealth: z.number(),
    maxHealth: z.number(),
    attack: z.number(),
    defense: z.number(),
    speed: z.number(),
  }),
  traits: z.array(z.string()).optional(),
  abilities: z.array(z.object({
    id: z.string(),
    name: z.string(),
    cooldown: z.number(),
    currentCooldown: z.number(),
  })).optional(),
  isActive: z.boolean(),
  hasActed: z.boolean(),
});

export type CombatUnit = z.infer<typeof CombatUnitSchema>;

export const EnemyTypeSchema = z.enum([
  'corporate_enforcer',
  'rival_courier', 
  'system_glitch',
  'stressed_citizen',
  'audit_drone',
  'efficiency_bot',
  'surveillance_unit',
]);

export type EnemyType = z.infer<typeof EnemyTypeSchema>;

export const ENEMY_TEMPLATES: Record<EnemyType, Omit<CombatUnit, 'id' | 'position'>> = {
  corporate_enforcer: {
    name: 'Corporate Enforcer',
    type: 'enemy',
    stats: {
      currentHealth: 50,
      maxHealth: 50,
      attack: 15,
      defense: 10,
      speed: 40,
    },
    isActive: true,
    hasActed: false,
  },
  rival_courier: {
    name: 'Rival Courier',
    type: 'enemy',
    stats: {
      currentHealth: 40,
      maxHealth: 40,
      attack: 12,
      defense: 8,
      speed: 60,
    },
    isActive: true,
    hasActed: false,
  },
  system_glitch: {
    name: 'System Glitch',
    type: 'enemy',
    stats: {
      currentHealth: 30,
      maxHealth: 30,
      attack: 20,
      defense: 5,
      speed: 30,
    },
    abilities: [{
      id: 'data_corruption',
      name: 'Data Corruption',
      cooldown: 3,
      currentCooldown: 0,
    }],
    isActive: true,
    hasActed: false,
  },
  stressed_citizen: {
    name: 'Stressed Citizen',
    type: 'enemy',
    stats: {
      currentHealth: 35,
      maxHealth: 35,
      attack: 10,
      defense: 12,
      speed: 45,
    },
    isActive: true,
    hasActed: false,
  },
  audit_drone: {
    name: 'Audit Drone',
    type: 'enemy',
    stats: {
      currentHealth: 45,
      maxHealth: 45,
      attack: 14,
      defense: 15,
      speed: 35,
    },
    abilities: [{
      id: 'scan',
      name: 'Efficiency Scan',
      cooldown: 2,
      currentCooldown: 0,
    }],
    isActive: true,
    hasActed: false,
  },
  efficiency_bot: {
    name: 'Efficiency Bot',
    type: 'enemy',
    stats: {
      currentHealth: 60,
      maxHealth: 60,
      attack: 18,
      defense: 20,
      speed: 25,
    },
    isActive: true,
    hasActed: false,
  },
  surveillance_unit: {
    name: 'Surveillance Unit',
    type: 'enemy',
    stats: {
      currentHealth: 40,
      maxHealth: 40,
      attack: 16,
      defense: 12,
      speed: 50,
    },
    abilities: [{
      id: 'track',
      name: 'Track Movement',
      cooldown: 1,
      currentCooldown: 0,
    }],
    isActive: true,
    hasActed: false,
  },
};

export const CombatActionSchema = z.enum(['move', 'attack', 'ability', 'wait']);
export type CombatAction = z.infer<typeof CombatActionSchema>;

export const calculateDistance = (pos1: CombatPosition, pos2: CombatPosition): number => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
};

export const getValidMoves = (unit: CombatUnit, allUnits: CombatUnit[], moveRange: number = 2): CombatPosition[] => {
  const validMoves: CombatPosition[] = [];
  const occupiedPositions = allUnits.map(u => `${u.position.x},${u.position.y}`);
  
  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 5; y++) {
      const distance = calculateDistance(unit.position, { x, y });
      const posKey = `${x},${y}`;
      
      if (distance <= moveRange && distance > 0 && !occupiedPositions.includes(posKey)) {
        validMoves.push({ x, y });
      }
    }
  }
  
  return validMoves;
};

export const getTargetsInRange = (unit: CombatUnit, allUnits: CombatUnit[], range: number = 1): CombatUnit[] => {
  return allUnits.filter(target => {
    if (target.id === unit.id || target.type === unit.type || !target.isActive) return false;
    return calculateDistance(unit.position, target.position) <= range;
  });
};

export const calculateDamage = (attacker: CombatUnit, defender: CombatUnit, isCritical: boolean = false): number => {
  const baseDamage = attacker.stats.attack;
  const defense = defender.stats.defense;
  const damage = Math.max(1, baseDamage - Math.floor(defense * 0.5));
  
  return isCritical ? Math.floor(damage * 1.5) : damage;
};

export const generateEnemyTeam = (difficulty: number): CombatUnit[] => {
  const enemyTypes = Object.keys(ENEMY_TEMPLATES) as EnemyType[];
  const teamSize = Math.min(3 + Math.floor(difficulty / 3), 5);
  const enemies: CombatUnit[] = [];
  
  // Enemy spawn positions (right side of grid)
  const spawnPositions: CombatPosition[] = [
    { x: 3, y: 1 },
    { x: 4, y: 2 },
    { x: 3, y: 3 },
    { x: 4, y: 0 },
    { x: 4, y: 4 },
  ];
  
  for (let i = 0; i < teamSize; i++) {
    const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const template = ENEMY_TEMPLATES[enemyType];
    
    enemies.push({
      ...template,
      id: `enemy_${i}_${Date.now()}`,
      position: spawnPositions[i],
      stats: {
        ...template.stats,
        currentHealth: Math.floor(template.stats.maxHealth * (1 + difficulty * 0.1)),
        maxHealth: Math.floor(template.stats.maxHealth * (1 + difficulty * 0.1)),
        attack: Math.floor(template.stats.attack * (1 + difficulty * 0.05)),
      },
    });
  }
  
  return enemies;
};