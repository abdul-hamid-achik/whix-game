import { z } from 'zod';

// Grid size increased from 5x5 to 7x7
export const COMBAT_GRID_SIZE = 7;

export const CombatPositionSchema = z.object({
  x: z.number().min(0).max(COMBAT_GRID_SIZE - 1),
  y: z.number().min(0).max(COMBAT_GRID_SIZE - 1),
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
  'angry_customer',
  'karen_customer',
  'bourgeois_resident',
  'corporate_manager',
  'security_guard',
  'rival_courier',
  'restaurant_owner',
  'doorman',
  'debt_collector',
]);

export type EnemyType = z.infer<typeof EnemyTypeSchema>;

export const ENEMY_TEMPLATES: Record<EnemyType, Omit<CombatUnit, 'id' | 'position'>> = {
  angry_customer: {
    name: 'Angry Customer',
    type: 'enemy',
    stats: {
      currentHealth: 40,
      maxHealth: 40,
      attack: 12, // Verbal attacks
      defense: 8,  // Stubborn
      speed: 45,
    },
    abilities: [{
      id: 'complaint',
      name: 'Loud Complaint',
      cooldown: 2,
      currentCooldown: 0,
    }],
    isActive: true,
    hasActed: false,
  },
  karen_customer: {
    name: 'Karen',
    type: 'enemy',
    stats: {
      currentHealth: 50,
      maxHealth: 50,
      attack: 15, // Aggressive demands
      defense: 12, // Won't back down
      speed: 50,
    },
    abilities: [{
      id: 'manager_demand',
      name: 'Demand Manager',
      cooldown: 3,
      currentCooldown: 0,
    }],
    isActive: true,
    hasActed: false,
  },
  bourgeois_resident: {
    name: 'Wealthy Resident',
    type: 'enemy',
    stats: {
      currentHealth: 35,
      maxHealth: 35,
      attack: 18, // Classist insults
      defense: 6,  // Fragile ego
      speed: 30,
    },
    abilities: [{
      id: 'condescend',
      name: 'Condescending Remark',
      cooldown: 2,
      currentCooldown: 0,
    }],
    isActive: true,
    hasActed: false,
  },
  corporate_manager: {
    name: 'WHIX Manager',
    type: 'enemy',
    stats: {
      currentHealth: 60,
      maxHealth: 60,
      attack: 20, // Threatening reviews
      defense: 15, // Corporate protection
      speed: 35,
    },
    abilities: [{
      id: 'efficiency_review',
      name: 'Efficiency Review',
      cooldown: 3,
      currentCooldown: 0,
    }],
    isActive: true,
    hasActed: false,
  },
  security_guard: {
    name: 'Security Guard',
    type: 'enemy',
    stats: {
      currentHealth: 55,
      maxHealth: 55,
      attack: 16, // Physical intimidation
      defense: 18, // Well protected
      speed: 40,
    },
    isActive: true,
    hasActed: false,
  },
  rival_courier: {
    name: 'Rival Courier',
    type: 'enemy',
    stats: {
      currentHealth: 45,
      maxHealth: 45,
      attack: 14, // Desperate competition
      defense: 10,
      speed: 60, // Fast like you
    },
    abilities: [{
      id: 'steal_delivery',
      name: 'Steal Order',
      cooldown: 2,
      currentCooldown: 0,
    }],
    isActive: true,
    hasActed: false,
  },
  restaurant_owner: {
    name: 'Impatient Owner',
    type: 'enemy',
    stats: {
      currentHealth: 40,
      maxHealth: 40,
      attack: 13, // Blame shifting
      defense: 11,
      speed: 42,
    },
    abilities: [{
      id: 'blame_courier',
      name: 'Blame Courier',
      cooldown: 2,
      currentCooldown: 0,
    }],
    isActive: true,
    hasActed: false,
  },
  doorman: {
    name: 'Building Doorman',
    type: 'enemy',
    stats: {
      currentHealth: 50,
      maxHealth: 50,
      attack: 12, // Access denial
      defense: 16, // Unmovable
      speed: 25,  // Slow but steady
    },
    abilities: [{
      id: 'deny_access',
      name: 'Deny Entry',
      cooldown: 1,
      currentCooldown: 0,
    }],
    isActive: true,
    hasActed: false,
  },
  debt_collector: {
    name: 'Debt Collector',
    type: 'enemy',
    stats: {
      currentHealth: 45,
      maxHealth: 45,
      attack: 17, // Financial threats
      defense: 13,
      speed: 48,
    },
    abilities: [{
      id: 'garnish_tips',
      name: 'Garnish Tips',
      cooldown: 3,
      currentCooldown: 0,
    }],
    isActive: true,
    hasActed: false,
  },
};

export const CombatActionSchema = z.enum(['move', 'negotiate', 'argue', 'show_proof', 'de_escalate', 'call_support', 'apologize', 'document', 'ability', 'wait']);
export type CombatAction = z.infer<typeof CombatActionSchema>;

// Action descriptions for UI
export const COMBAT_ACTION_INFO = {
  move: { name: 'Move', description: 'Navigate the conflict zone' },
  negotiate: { name: 'Negotiate', description: 'Try to reason for better tips' },
  argue: { name: 'Argue Back', description: 'Defend your dignity against insults' },
  show_proof: { name: 'Show Proof', description: 'Display delivery confirmation' },
  de_escalate: { name: 'De-escalate', description: 'Calm down the situation' },
  call_support: { name: 'Call Support', description: 'Contact WHIX support (usually unhelpful)' },
  apologize: { name: 'Apologize', description: 'Swallow pride to keep your job' },
  document: { name: 'Document', description: 'Record interaction for protection' },
  ability: { name: 'Special', description: 'Use character special ability' },
  wait: { name: 'Wait', description: 'End your turn' }
};

// Enemy dialogue arrays
export const ENEMY_DIALOGUE: Record<EnemyType, { intro: string[]; attack: string[]; hurt: string[]; defeat: string[] }> = {
  angry_customer: {
    intro: [
      "This food is cold! You took forever!",
      "Where's my order? It's been an hour!",
      "This isn't what I ordered!"
    ],
    attack: [
      "I'm not paying for this!",
      "You people can't do anything right!",
      "I want a refund NOW!"
    ],
    hurt: [
      "How dare you talk back!",
      "I'll leave a bad review!",
      "You can't treat customers like this!"
    ],
    defeat: [
      "Fine... here's your tip.",
      "Whatever, just leave.",
      "I'll order from someone else next time."
    ]
  },
  karen_customer: {
    intro: [
      "I want to speak to your manager RIGHT NOW!",
      "Do you know who I am?",
      "This is unacceptable service!"
    ],
    attack: [
      "I'll have you fired!",
      "I'm calling corporate!",
      "You'll be hearing from my lawyer!"
    ],
    hurt: [
      "How DARE you!",
      "This is harassment!",
      "I'm recording this!"
    ],
    defeat: [
      "This isn't over!",
      "I'll be filing a complaint!",
      "You haven't heard the last of me!"
    ]
  },
  bourgeois_resident: {
    intro: [
      "Use the service entrance, not the main lobby.",
      "Don't touch anything on your way up.",
      "You people are always so... loud."
    ],
    attack: [
      "This is a respectable building!",
      "I pay too much to deal with this.",
      "Security! Remove this person!"
    ],
    hurt: [
      "How uncouth!",
      "The help is getting uppity.",
      "I'll have you blacklisted!"
    ],
    defeat: [
      "Just... leave it at the door.",
      "Don't come back here.",
      "I'll be using a different service."
    ]
  },
  corporate_manager: {
    intro: [
      "Your efficiency metrics are unacceptable.",
      "You're 3 minutes behind schedule.",
      "This performance review won't be good."
    ],
    attack: [
      "You're bringing down our district average!",
      "Consider this a final warning!",
      "Your tips will be garnished!"
    ],
    hurt: [
      "Insubordination will not be tolerated!",
      "That's going in your permanent record!",
      "HR will hear about this!"
    ],
    defeat: [
      "Get back to work.",
      "I'll be watching your metrics.",
      "Don't let this happen again."
    ]
  },
  security_guard: {
    intro: [
      "You can't park there!",
      "No deliveries after 8 PM!",
      "I need to see your ID and delivery confirmation."
    ],
    attack: [
      "Move along or I call the cops!",
      "You're trespassing!",
      "I said MOVE IT!"
    ],
    hurt: [
      "That's assault!",
      "You just made a big mistake!",
      "Backup needed!"
    ],
    defeat: [
      "Just... make it quick.",
      "Don't let me see you again.",
      "Five minutes, that's it."
    ]
  },
  rival_courier: {
    intro: [
      "That's MY delivery zone!",
      "I saw that order first!",
      "You're stealing my tips!"
    ],
    attack: [
      "I need this job more than you!",
      "Stay out of my territory!",
      "You're costing me money!"
    ],
    hurt: [
      "We're all struggling here!",
      "It's not personal!",
      "I have kids to feed!"
    ],
    defeat: [
      "Fine, take it...",
      "We shouldn't be fighting each other.",
      "Good luck out there..."
    ]
  },
  restaurant_owner: {
    intro: [
      "You're late! The food's getting cold!",
      "My customers are complaining because of you!",
      "Hurry up! I have orders backing up!"
    ],
    attack: [
      "You're costing me business!",
      "I'll report you to WHIX!",
      "Get out of my restaurant!"
    ],
    hurt: [
      "Don't blame me for the wait!",
      "It's not my fault!",
      "You couriers are all the same!"
    ],
    defeat: [
      "Just take it and go.",
      "Try to be faster next time.",
      "Whatever, it's not my problem."
    ]
  },
  doorman: {
    intro: [
      "Deliveries use the service entrance.",
      "You're not on the approved list.",
      "No food deliveries in the main lobby."
    ],
    attack: [
      "Rules are rules!",
      "I don't make exceptions!",
      "Turn around and use the back!"
    ],
    hurt: [
      "I'm just doing my job!",
      "Don't shoot the messenger!",
      "Management makes the rules!"
    ],
    defeat: [
      "Fine, just this once.",
      "Be quick about it.",
      "Don't tell anyone I let you through."
    ]
  },
  debt_collector: {
    intro: [
      "You owe WHIX 500 credits in fees.",
      "Time to pay up, courier.",
      "Your account is past due."
    ],
    attack: [
      "I'll garnish your tips!",
      "Pay now or lose your job!",
      "Interest is accruing daily!"
    ],
    hurt: [
      "You can't escape your debts!",
      "This is just making it worse!",
      "The fees keep adding up!"
    ],
    defeat: [
      "We'll set up a payment plan.",
      "Don't miss the next payment.",
      "WHIX always gets paid eventually."
    ]
  }
};

export const calculateDistance = (pos1: CombatPosition, pos2: CombatPosition): number => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
};

export const getValidMoves = (unit: CombatUnit, allUnits: CombatUnit[], moveRange: number = 2): CombatPosition[] => {
  const validMoves: CombatPosition[] = [];
  const occupiedPositions = allUnits.map(u => `${u.position.x},${u.position.y}`);
  
  for (let x = 0; x < COMBAT_GRID_SIZE; x++) {
    for (let y = 0; y < COMBAT_GRID_SIZE; y++) {
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