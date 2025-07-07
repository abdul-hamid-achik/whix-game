import { nanoid } from 'nanoid';
import { 
  PartnerClass, 
  PARTNER_CLASSES, 
  NeurodivergentTrait, 
  NEURODIVERGENT_TRAITS,
  Rarity,
  calculatePartnerStats
} from './classes';

const FIRST_NAMES = [
  // Diverse representation
  'Sarah', 'Miguel', 'Aisha', 'Chen', 'Zara', 'Kai', 'Luna', 'Omar',
  'Maya', 'Ethan', 'Priya', 'Carlos', 'Yuki', 'Amara', 'Leo', 'Nadia',
  'Raj', 'Sofia', 'Marcus', 'Fatima', 'Jin', 'Elena', 'Kwame', 'Isla',
  'Diego', 'Aaliyah', 'Hiroshi', 'Camila', 'Arjun', 'Zoe', 'Ibrahim', 'Nova',
  'Tasha', 'Xavier', 'Mei', 'Santiago', 'Kira', 'Mateo', 'Nia', 'Dante',
  'River', 'Sky', 'Phoenix', 'Sage', 'Quinn', 'Ash', 'Rowan', 'Blake'
];

const LAST_NAMES = [
  'Chen', 'Patel', 'Santos', 'Kim', 'Johnson', 'Rodriguez', 'Ali',
  'Nakamura', 'Singh', 'Martinez', 'Anderson', 'Williams', 'Garcia',
  'Lee', 'Taylor', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore',
  'Jackson', 'Martin', 'Thompson', 'White', 'Lopez', 'Gonzalez',
  'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Hall', 'Young'
];

const PERSONALITY_TRAITS = [
  'determined', 'creative', 'analytical', 'empathetic', 'resourceful',
  'optimistic', 'cautious', 'bold', 'meticulous', 'intuitive',
  'rebellious', 'compassionate', 'strategic', 'spontaneous', 'loyal'
];

const LIKES = [
  'solving puzzles', 'helping others', 'organizing systems', 'finding patterns',
  'quiet moments', 'deep conversations', 'exploring new places', 'routine tasks',
  'creative expression', 'logical challenges', 'social justice', 'efficiency',
  'authentic connections', 'learning new things', 'standing up to authority'
];

const DISLIKES = [
  'corporate exploitation', 'unfair treatment', 'sudden changes', 'loud noises',
  'bright lights', 'small talk', 'inefficiency', 'dishonesty', 'being rushed',
  'unclear instructions', 'sensory overload', 'interruptions', 'injustice'
];

export interface GeneratedPartner {
  id: string;
  name: string;
  class: PartnerClass;
  primaryTrait: NeurodivergentTrait;
  secondaryTrait?: NeurodivergentTrait;
  tertiaryTrait?: NeurodivergentTrait;
  level: number;
  rarity: Rarity;
  stats: {
    focus: number;
    perception: number;
    social: number;
    logic: number;
    stamina: number;
  };
  personality: {
    traits: string[];
    likes: string[];
    dislikes: string[];
    backstory: string;
  };
}

export const generatePartner = (guaranteedRarity?: Rarity): GeneratedPartner => {
  const rarity = guaranteedRarity || rollRarity();
  const partnerClass = rollPartnerClass();
  const traits = rollTraits(rarity);
  const name = generateName();
  const level = 1;
  
  const stats = calculatePartnerStats(partnerClass, level, rarity, traits);
  const personality = generatePersonality(name, partnerClass, traits, rarity);
  
  return {
    id: nanoid(),
    name,
    class: partnerClass,
    primaryTrait: traits[0],
    secondaryTrait: traits[1],
    tertiaryTrait: traits[2],
    level,
    rarity,
    stats,
    personality,
  };
};

const rollRarity = (): Rarity => {
  const roll = Math.random() * 100;
  if (roll < 60) return 'common';
  if (roll < 85) return 'rare';
  if (roll < 95) return 'epic';
  return 'legendary';
};

const rollPartnerClass = (): PartnerClass => {
  const classes: PartnerClass[] = ['courier', 'analyst', 'negotiator', 'specialist', 'investigator'];
  return classes[Math.floor(Math.random() * classes.length)];
};

const rollTraits = (rarity: Rarity): NeurodivergentTrait[] => {
  const traitCount = {
    common: 1,
    rare: 2,
    epic: 2,
    legendary: 3,
  }[rarity];
  
  const allTraits: NeurodivergentTrait[] = [
    'hyperfocus', 'pattern_recognition', 'enhanced_senses',
    'systematic_thinking', 'attention_to_detail', 'routine_mastery',
    'sensory_processing'
  ];
  
  const shuffled = [...allTraits].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, traitCount);
};

const generateName = (): string => {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
};

const generatePersonality = (
  name: string,
  partnerClass: PartnerClass,
  traits: NeurodivergentTrait[],
  rarity: Rarity
): GeneratedPartner['personality'] => {
  const personalityTraits = selectRandom(PERSONALITY_TRAITS, 3);
  const likes = selectRandom(LIKES, 3);
  const dislikes = ['Whix\'s exploitation', ...selectRandom(DISLIKES, 2)];
  
  const backstory = generateBackstory(name, partnerClass, traits, rarity);
  
  return {
    traits: personalityTraits,
    likes,
    dislikes,
    backstory,
  };
};

const selectRandom = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const generateBackstory = (
  name: string,
  partnerClass: PartnerClass,
  traits: NeurodivergentTrait[],
  rarity: Rarity
): string => {
  const firstName = name.split(' ')[0];
  const classInfo = PARTNER_CLASSES[partnerClass];
  
  if (!traits[0]) {
    return `${firstName} is a dedicated ${classInfo.name} working to make ends meet in the gig economy.`;
  }
  
  const primaryTraitInfo = NEURODIVERGENT_TRAITS[traits[0]];
  
  if (!primaryTraitInfo) {
    return `${firstName} is a dedicated ${classInfo.name} with unique abilities that help them excel in their work.`;
  }
  
  const templates = [
    `${firstName} discovered their ${primaryTraitInfo.name?.toLowerCase() || 'unique abilities'} as a child, initially seeing it as a challenge. But in Neo Prosperity's gig economy, what others called "${traits[0]}" became their greatest strength. As a ${classInfo.name}, they've learned to leverage their unique perspective to excel at their work, even while fighting against Whix's exploitative system.`,
    
    `Growing up, ${firstName}'s ${primaryTraitInfo.name?.toLowerCase() || 'unique abilities'} made them feel different from their peers. But when they joined Whix as a ${classInfo.name}, they found that their ability to think differently gave them an edge. Now they use their talents not just to survive, but to help other partners resist the company's unfair practices.`,
    
    `${firstName} never fit the neurotypical mold, and they're proud of it. Their ${primaryTraitInfo.name?.toLowerCase() || 'unique abilities'} allows them to excel in unexpected ways, making them an exceptional ${classInfo.name}. While Whix tries to exploit their abilities, ${firstName} dreams of a world where neurodivergent people are valued, not used.`,
  ];
  
  let backstory = templates[Math.floor(Math.random() * templates.length)];
  
  if (traits.length > 1 && traits[1]) {
    const secondaryTraitInfo = NEURODIVERGENT_TRAITS[traits[1]];
    if (secondaryTraitInfo && secondaryTraitInfo.name) {
      backstory += ` Their ${secondaryTraitInfo.name.toLowerCase()} complements this perfectly, creating a unique combination that makes them invaluable to their fellow partners.`;
    }
  }
  
  if (rarity === 'legendary') {
    backstory += ` ${firstName} has become a legend among Whix partners, inspiring others to embrace their neurodivergent traits and fight for better conditions.`;
  }
  
  return backstory;
};

export const generateMultiplePulls = (count: number, guaranteedRare: boolean = false): GeneratedPartner[] => {
  const partners: GeneratedPartner[] = [];
  
  for (let i = 0; i < count; i++) {
    if (guaranteedRare && i === count - 1 && !partners.some(p => p.rarity !== 'common')) {
      // Guarantee at least one rare or better
      const guaranteedRarity = Math.random() < 0.7 ? 'rare' : Math.random() < 0.8 ? 'epic' : 'legendary';
      partners.push(generatePartner(guaranteedRarity));
    } else {
      partners.push(generatePartner());
    }
  }
  
  return partners;
};

export const applyPitySystem = (
  pullsSinceEpic: number,
  pullsSinceLegendary: number
): Rarity | undefined => {
  if (pullsSinceLegendary >= 90) return 'legendary';
  if (pullsSinceEpic >= 50) return 'epic';
  return undefined;
};