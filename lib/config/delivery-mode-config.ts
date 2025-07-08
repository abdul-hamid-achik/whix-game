/**
 * Delivery Mode Configuration
 * Maps game terminology to delivery app terminology while preserving Soviet-Aztec theme
 */

export type AppMode = 'game' | 'delivery';

export interface TerminologyMapping {
  game: string;
  delivery: string;
}

export interface IconMapping {
  game: string;
  delivery: string;
}

// Main terminology mappings
export const TERMINOLOGY_MAP: Record<string, TerminologyMapping> = {
  // Core UI Elements
  COURIER_HUB: { game: 'COURIER HUB', delivery: 'DELIVERY OPERATIONS' },
  ACTIVE_ROSTER: { game: 'Active Roster', delivery: 'Driver Fleet' },
  PARTNERS: { game: 'Partners', delivery: 'Drivers' },
  MISSIONS: { game: 'Missions', delivery: 'Deliveries' },
  CAMPAIGNS: { game: 'Campaigns', delivery: 'Delivery Routes' },
  DAILY_CONTRACTS: { game: 'Daily Contracts', delivery: 'Available Orders' },
  
  // Mission/Order Types
  EXPRESS_DELIVERY: { game: 'Express Delivery', delivery: 'Rush Order' },
  DATA_COURIER: { game: 'Data Courier', delivery: 'Secure Delivery' },
  MULTI_DROP: { game: 'Multi-Drop Mission', delivery: 'Multiple Stops' },
  TIMED_RUSH: { game: 'Timed Rush', delivery: 'Time-Critical' },
  
  // Character/Driver Names (from content analysis)
  MIGUEL_LOPEZ: { game: 'Miguel Lopez (Analytical)', delivery: 'Miguel - Route Optimizer' },
  RICARDO_MORALES: { game: 'Ricardo "Tech" Morales', delivery: 'Ricardo - Technical Support' },
  ELENA_VASQUEZ: { game: 'Elena Vasquez (Negotiator)', delivery: 'Elena - Premium Specialist' },
  MARINA_SANTOS: { game: 'Marina Santos (Adapter)', delivery: 'Marina - Efficiency Expert' },
  TANIA_VOLKOV: { game: 'Tania Volkov (Pattern)', delivery: 'Tania - Pattern Recognition' },
  
  // Equipment/Gear
  BASIC_BICYCLE: { game: 'Basic Delivery Bicycle', delivery: 'Standard Bicycle' },
  INSULATED_BAG: { game: 'Insulated Delivery Bag', delivery: 'Thermal Bag' },
  GPS_TRACKER: { game: 'Precision GPS Tracker', delivery: 'Navigation System' },
  WEATHER_VEST: { game: 'Weatherproof Delivery Vest', delivery: 'Professional Vest' },
  ENCRYPTED_PHONE: { game: 'Encrypted Delivery Phone', delivery: 'Secure Device' },
  
  // Districts/Areas
  NEON_HEIGHTS: { game: 'Neon Heights Corporate', delivery: 'Business District' },
  CENTRAL_SQUARE: { game: 'Central Square Chaos', delivery: 'Downtown Area' },
  UNDERGROUND_HUB: { game: 'Underground Delivery Hub', delivery: 'Distribution Center' },
  CATHEDRAL_DISTRICT: { game: 'Cathedral District', delivery: 'Community Zone' },
  INDUSTRIAL_DISTRICT: { game: 'Industrial District', delivery: 'Warehouse Area' },
  
  // Game States
  MISSION_BRIEFING: { game: 'Mission Briefing', delivery: 'Order Details' },
  PARTNER_SELECTION: { game: 'Partner Selection', delivery: 'Driver Assignment' },
  ADVENTURE_MAP: { game: 'Adventure Map', delivery: 'Delivery Route' },
  TACTICAL_COMBAT: { game: 'Tactical Combat', delivery: 'Delivery Challenge' },
  EVENT_RESOLUTION: { game: 'Event Resolution', delivery: 'Customer Interaction' },
  AFTER_ACTION: { game: 'After Action Report', delivery: 'Delivery Summary' },
  
  // Combat/Challenge Elements
  COMBAT: { game: 'Combat', delivery: 'Delivery Challenge' },
  ENEMIES: { game: 'Enemies', delivery: 'Obstacles' },
  HEALTH: { game: 'Health', delivery: 'Driver Stamina' },
  ENERGY: { game: 'Energy', delivery: 'Focus' },
  ABILITIES: { game: 'Abilities', delivery: 'Skills' },
  VICTORY: { game: 'Victory', delivery: 'Successful Delivery' },
  DEFEAT: { game: 'Defeat', delivery: 'Failed Delivery' },
  
  // Economy
  TIPS: { game: 'Tips', delivery: 'Earnings' },
  EXPERIENCE: { game: 'Experience', delivery: 'Performance Points' },
  LEVEL: { game: 'Level', delivery: 'Driver Rating' },
  REWARDS: { game: 'Rewards', delivery: 'Bonuses' },
  
  // Actions
  RECRUIT: { game: 'Recruit', delivery: 'Hire' },
  UPGRADE: { game: 'Upgrade', delivery: 'Train' },
  EQUIP: { game: 'Equip', delivery: 'Assign Gear' },
  DEPLOY: { game: 'Deploy', delivery: 'Send Out' },
  
  // Status Messages
  IN_PROGRESS: { game: 'Mission in Progress', delivery: 'Delivery in Progress' },
  COMPLETED: { game: 'Mission Completed', delivery: 'Delivery Completed' },
  FAILED: { game: 'Mission Failed', delivery: 'Delivery Failed' },
  AVAILABLE: { game: 'Available for Mission', delivery: 'Available for Delivery' },
};

// Icon mappings for visual elements
export const ICON_MAP: Record<string, IconMapping> = {
  // Node Types
  DELIVERY: { game: '📦', delivery: '📦' },
  COMBAT: { game: '⚔️', delivery: '🚧' }, // Combat becomes traffic/obstacle
  PUZZLE: { game: '🧩', delivery: '🗺️' }, // Puzzle becomes navigation challenge
  SOCIAL: { game: '💬', delivery: '🤝' }, // Social becomes customer interaction
  REST: { game: '🛡️', delivery: '☕' }, // Rest becomes break time
  SHOP: { game: '🛒', delivery: '🏪' }, // Shop becomes pickup location
  STORY: { game: '📖', delivery: '📋' }, // Story becomes special order
  BOSS: { game: '👹', delivery: '⭐' }, // Boss becomes VIP delivery
  
  // District Icons
  CORPORATE: { game: '🏢', delivery: '🏢' },
  RESIDENTIAL: { game: '🏠', delivery: '🏠' },
  COMMERCIAL: { game: '🏪', delivery: '🏪' },
  INDUSTRIAL: { game: '🏭', delivery: '🏭' },
  COMMUNITY: { game: '⛪', delivery: '🏛️' },
};

// Get terminology based on current mode
export function getTerm(key: string, mode: AppMode): string {
  const mapping = TERMINOLOGY_MAP[key];
  if (!mapping) {
    console.warn(`No terminology mapping found for key: ${key}`);
    return key;
  }
  return mode === 'delivery' ? mapping.delivery : mapping.game;
}

// Get icon based on current mode
export function getIcon(key: string, mode: AppMode): string {
  const mapping = ICON_MAP[key];
  if (!mapping) {
    console.warn(`No icon mapping found for key: ${key}`);
    return '❓';
  }
  return mode === 'delivery' ? mapping.delivery : mapping.game;
}

// Batch get multiple terms
export function getTerms(keys: string[], mode: AppMode): Record<string, string> {
  const result: Record<string, string> = {};
  keys.forEach(key => {
    result[key] = getTerm(key, mode);
  });
  return result;
}

// Transform entire text blocks (for descriptions, tooltips, etc.)
export function transformText(text: string, mode: AppMode): string {
  if (mode === 'game') return text;
  
  let transformed = text;
  
  // Apply all terminology mappings
  Object.entries(TERMINOLOGY_MAP).forEach(([_, mapping]) => {
    const regex = new RegExp(mapping.game, 'gi');
    transformed = transformed.replace(regex, mapping.delivery);
  });
  
  return transformed;
}

// Configuration settings
export interface DeliveryModeConfig {
  mode: AppMode;
  enableTransitions: boolean;
  preserveGameMechanics: boolean;
  showModeToggle: boolean;
}

// Default configuration
export const DEFAULT_DELIVERY_CONFIG: DeliveryModeConfig = {
  mode: 'game',
  enableTransitions: true,
  preserveGameMechanics: true,
  showModeToggle: true,
};

// Storage key for persisting mode preference
export const DELIVERY_MODE_STORAGE_KEY = 'whix-app-mode';