export const PARTNER_CLASSES = {
  technopath: {
    name: 'Technopath',
    description: 'Masters of technology and digital interfaces',
    primaryStats: ['intelligence', 'focus'],
    color: '#00ffff',
    icon: 'Cpu',
  },
  empathic_harmonizer: {
    name: 'Empathic Harmonizer',
    description: 'Emotional intelligence and social connection experts',
    primaryStats: ['creativity', 'intelligence'],
    color: '#ff69b4',
    icon: 'Heart',
  },
  pattern_seeker: {
    name: 'Pattern Seeker',
    description: 'Analytical minds that find hidden connections',
    primaryStats: ['intelligence', 'focus'],
    color: '#9370db',
    icon: 'Network',
  },
  temporal_navigator: {
    name: 'Temporal Navigator',
    description: 'Time perception and planning specialists',
    primaryStats: ['speed', 'intelligence'],
    color: '#ffd700',
    icon: 'Clock',
  },
  sensory_alchemist: {
    name: 'Sensory Alchemist',
    description: 'Transform sensory experiences into power',
    primaryStats: ['creativity', 'defense'],
    color: '#ff8c00',
    icon: 'Sparkles',
  },
  dreamwalker: {
    name: 'Dreamwalker',
    description: 'Navigate imagination and subconscious realms',
    primaryStats: ['creativity', 'attack'],
    color: '#8a2be2',
    icon: 'Moon',
  },
  codebreaker: {
    name: 'Codebreaker',
    description: 'Decipher complex systems and languages',
    primaryStats: ['intelligence', 'attack'],
    color: '#00ff00',
    icon: 'Binary',
  },
  void_dancer: {
    name: 'Void Dancer',
    description: 'Embrace chaos and unpredictability',
    primaryStats: ['speed', 'attack'],
    color: '#4b0082',
    icon: 'Tornado',
  },
} as const;

export const NEURODIVERGENT_TRAITS = {
  adhd: {
    name: 'ADHD',
    description: 'Hyperactivity and hyperfocus abilities',
    bonuses: { speed: 15, creativity: 10 },
    penalties: { focus: -5 },
  },
  autism: {
    name: 'Autism',
    description: 'Pattern recognition and deep focus',
    bonuses: { intelligence: 15, focus: 10 },
    penalties: { speed: -5 },
  },
  dyslexia: {
    name: 'Dyslexia',
    description: 'Creative problem solving and spatial thinking',
    bonuses: { creativity: 20, defense: 5 },
    penalties: { intelligence: -5 },
  },
  synesthesia: {
    name: 'Synesthesia',
    description: 'Cross-sensory perception and unique insights',
    bonuses: { creativity: 15, attack: 10 },
    penalties: { defense: -5 },
  },
  hyperfocus: {
    name: 'Hyperfocus',
    description: 'Intense concentration and determination',
    bonuses: { focus: 20, attack: 10 },
    penalties: { speed: -10 },
  },
  pattern_recognition: {
    name: 'Pattern Recognition',
    description: 'See connections others miss',
    bonuses: { intelligence: 20, defense: 5 },
    penalties: { creativity: -5 },
  },
  sensory_processing: {
    name: 'Sensory Processing',
    description: 'Enhanced or unique sensory experiences',
    bonuses: { defense: 15, creativity: 10 },
    penalties: { attack: -5 },
  },
  time_blindness: {
    name: 'Time Blindness',
    description: 'Non-linear time perception',
    bonuses: { speed: 20, creativity: 5 },
    penalties: { focus: -10 },
  },
} as const;

export const RARITY_MULTIPLIERS = {
  common: 1,
  uncommon: 1.2,
  rare: 1.5,
  epic: 2,
  legendary: 3,
} as const;

export const LEVEL_EXPERIENCE_REQUIRED = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1));

export const BOND_LEVEL_BENEFITS = {
  0: { statBonus: 0, abilitySlots: 2 },
  1: { statBonus: 5, abilitySlots: 2 },
  2: { statBonus: 10, abilitySlots: 3 },
  3: { statBonus: 15, abilitySlots: 3 },
  4: { statBonus: 20, abilitySlots: 4 },
  5: { statBonus: 25, abilitySlots: 4 },
  6: { statBonus: 30, abilitySlots: 5 },
  7: { statBonus: 35, abilitySlots: 5 },
  8: { statBonus: 40, abilitySlots: 6 },
  9: { statBonus: 45, abilitySlots: 6 },
  10: { statBonus: 50, abilitySlots: 7 },
} as const;