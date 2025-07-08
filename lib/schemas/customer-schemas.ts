import { z } from 'zod';

// Customer preferences and dietary restrictions
export const DietaryRestrictionSchema = z.enum([
  'vegetarian',
  'vegan',
  'gluten_free',
  'dairy_free',
  'nut_allergy',
  'kosher',
  'halal',
  'low_sodium',
  'diabetic',
  'none'
]);

export type DietaryRestriction = z.infer<typeof DietaryRestrictionSchema>;

// Customer mood types
export const CustomerMoodSchema = z.enum([
  'happy',
  'neutral',
  'impatient',
  'angry',
  'excited',
  'disappointed'
]);

export type CustomerMood = z.infer<typeof CustomerMoodSchema>;

// Customer tier/VIP status
export const CustomerTierSchema = z.enum([
  'regular',
  'frequent',
  'vip',
  'platinum'
]);

export type CustomerTier = z.infer<typeof CustomerTierSchema>;

// Special request types
export const SpecialRequestSchema = z.object({
  type: z.enum([
    'extra_condiments',
    'no_contact',
    'ring_doorbell',
    'leave_at_door',
    'hand_to_customer',
    'temperature_sensitive',
    'fragile_items',
    'call_on_arrival'
  ]),
  details: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});

export type SpecialRequest = z.infer<typeof SpecialRequestSchema>;

// Customer profile schema
export const CustomerProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  address: z.object({
    street: z.string(),
    district: z.string(),
    buildingType: z.enum(['house', 'apartment', 'office', 'business']),
    accessCode: z.string().optional(),
    specialInstructions: z.string().optional()
  }),
  
  // Preferences
  dietaryRestrictions: z.array(DietaryRestrictionSchema).default([]),
  favoriteItems: z.array(z.string()).default([]),
  preferredDeliveryTimes: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6), // 0 = Sunday
    startHour: z.number().min(0).max(23),
    endHour: z.number().min(0).max(23)
  })).optional(),
  
  // Relationship tracking
  tier: CustomerTierSchema.default('regular'),
  totalOrders: z.number().default(0),
  successfulDeliveries: z.number().default(0),
  averageTip: z.number().default(0),
  currentMood: CustomerMoodSchema.default('neutral'),
  moodHistory: z.array(z.object({
    mood: CustomerMoodSchema,
    reason: z.string(),
    timestamp: z.number()
  })).default([]),
  
  // Special requests
  defaultRequests: z.array(SpecialRequestSchema).default([]),
  currentRequests: z.array(SpecialRequestSchema).default([]),
  
  // Interaction history
  lastDelivery: z.number().optional(), // timestamp
  preferredPartners: z.array(z.string()).default([]), // partner IDs
  blacklistedPartners: z.array(z.string()).default([]), // partner IDs
  
  // Personality traits
  personality: z.object({
    patience: z.number().min(0).max(100).default(50), // How long they'll wait
    generosity: z.number().min(0).max(100).default(50), // Tip tendency
    pickiness: z.number().min(0).max(100).default(50), // How strict about order accuracy
    chattiness: z.number().min(0).max(100).default(50), // Likes to talk
    understanding: z.number().min(0).max(100).default(50), // Forgives mistakes
  }),
  
  // Story elements
  backstory: z.string().optional(),
  occupation: z.string().optional(),
  quirks: z.array(z.string()).default([]),
  secretInfo: z.string().optional() // Hidden info that might relate to main story
});

export type CustomerProfile = z.infer<typeof CustomerProfileSchema>;

// Customer interaction result
export const CustomerInteractionSchema = z.object({
  customerId: z.string(),
  deliveryId: z.string(),
  partnerId: z.string(),
  
  // Delivery details
  deliveryTime: z.number(), // actual delivery time in minutes
  packageCondition: z.number().min(0).max(100),
  orderAccuracy: z.boolean(),
  specialRequestsMet: z.boolean(),
  
  // Interaction details
  conversationTopics: z.array(z.string()).optional(),
  partnerBehavior: z.enum(['professional', 'friendly', 'rushed', 'rude']).default('professional'),
  customerResponse: CustomerMoodSchema,
  
  // Outcomes
  tipAmount: z.number(),
  tipPercentage: z.number(),
  ratingGiven: z.number().min(1).max(5).optional(),
  complaint: z.string().optional(),
  compliment: z.string().optional(),
  
  // Effects
  moodChange: z.number(), // -100 to +100
  relationshipChange: z.number(), // -10 to +10
  willOrderAgain: z.boolean()
});

export type CustomerInteraction = z.infer<typeof CustomerInteractionSchema>;

// Customer generation templates
export const CUSTOMER_ARCHETYPES = {
  karen: {
    name: "Karen Manager-Seeker",
    personality: {
      patience: 10,
      generosity: 20,
      pickiness: 90,
      chattiness: 80,
      understanding: 5
    },
    quirks: ["Always asks for manager", "Takes photos of everything", "Threatens bad reviews"],
    defaultRequests: [
      { type: 'temperature_sensitive' as const, priority: 'high' as const },
      { type: 'hand_to_customer' as const, priority: 'high' as const }
    ]
  },
  
  techBro: {
    name: "Chad Blockchain",
    personality: {
      patience: 30,
      generosity: 70,
      pickiness: 40,
      chattiness: 20,
      understanding: 60
    },
    quirks: ["Tips in crypto mentions", "Always on a call", "Offices have confusing layouts"],
    defaultRequests: [
      { type: 'no_contact' as const, priority: 'medium' as const },
      { type: 'leave_at_door' as const, details: "Behind the plant", priority: 'low' as const }
    ]
  },
  
  grandma: {
    name: "Abuela Rosa",
    personality: {
      patience: 80,
      generosity: 85,
      pickiness: 30,
      chattiness: 95,
      understanding: 90
    },
    quirks: ["Offers homemade food", "Tells long stories", "Tips with cookies sometimes"],
    defaultRequests: [
      { type: 'ring_doorbell' as const, priority: 'high' as const },
      { type: 'hand_to_customer' as const, details: "I move slowly", priority: 'medium' as const }
    ]
  },
  
  nightShiftWorker: {
    name: "Alex Night-Owl",
    personality: {
      patience: 60,
      generosity: 75,
      pickiness: 20,
      chattiness: 10,
      understanding: 85
    },
    quirks: ["Orders at 3 AM", "Appreciates quiet delivery", "Big tipper for late night"],
    defaultRequests: [
      { type: 'no_contact' as const, priority: 'high' as const },
      { type: 'leave_at_door' as const, details: "Don't knock - sleeping roommates", priority: 'high' as const }
    ]
  },
  
  strugglingSingle: {
    name: "Maria Working-Mom",
    personality: {
      patience: 40,
      generosity: 35,
      pickiness: 50,
      chattiness: 40,
      understanding: 70
    },
    quirks: ["Orders kids meals", "Counts exact change", "Genuinely grateful"],
    defaultRequests: [
      { type: 'ring_doorbell' as const, details: "Kids might be napping", priority: 'medium' as const }
    ]
  }
};

// Helper functions
export function calculateCustomerSatisfaction(
  profile: CustomerProfile,
  interaction: Omit<CustomerInteraction, 'tipAmount' | 'tipPercentage' | 'moodChange' | 'relationshipChange' | 'willOrderAgain'>
): number {
  let satisfaction = 50; // Base satisfaction
  
  // Time impact based on patience
  const expectedTime = 30; // Base expected delivery time
  const timeDifference = interaction.deliveryTime - expectedTime;
  const patienceImpact = (profile.personality.patience / 100) * 20;
  satisfaction -= Math.max(0, timeDifference) * (1 - patienceImpact / 20);
  
  // Package condition impact based on pickiness
  const conditionImpact = (profile.personality.pickiness / 100) * 30;
  satisfaction += (interaction.packageCondition / 100) * conditionImpact;
  
  // Order accuracy is critical
  if (!interaction.orderAccuracy) {
    satisfaction -= 30 * (profile.personality.pickiness / 100);
  }
  
  // Special requests impact
  if (!interaction.specialRequestsMet && profile.currentRequests.length > 0) {
    satisfaction -= 20 * (profile.personality.pickiness / 100);
  }
  
  // Partner behavior impact
  switch (interaction.partnerBehavior) {
    case 'friendly':
      satisfaction += 10 * (profile.personality.chattiness / 100);
      break;
    case 'rushed':
      satisfaction -= 5;
      break;
    case 'rude':
      satisfaction -= 20 * (1 - profile.personality.understanding / 100);
      break;
  }
  
  // Tier bonuses
  if (profile.tier === 'vip' || profile.tier === 'platinum') {
    satisfaction += 10; // VIPs are generally more satisfied
  }
  
  return Math.max(0, Math.min(100, satisfaction));
}

export function calculateTip(
  profile: CustomerProfile,
  satisfaction: number,
  baseAmount: number
): { tipAmount: number; tipPercentage: number } {
  // Base tip percentage based on generosity
  let tipPercentage = (profile.personality.generosity / 100) * 25; // Max 25% for very generous
  
  // Adjust based on satisfaction
  tipPercentage *= (satisfaction / 100);
  
  // Tier bonuses
  switch (profile.tier) {
    case 'frequent':
      tipPercentage *= 1.1;
      break;
    case 'vip':
      tipPercentage *= 1.25;
      break;
    case 'platinum':
      tipPercentage *= 1.5;
      break;
  }
  
  // Minimum tip for nice customers
  if (profile.personality.generosity > 70 && tipPercentage < 10) {
    tipPercentage = 10;
  }
  
  const tipAmount = Math.round(baseAmount * (tipPercentage / 100));
  
  return { tipAmount, tipPercentage: Math.round(tipPercentage) };
}