import { DistrictGrid } from './delivery-grid';

export const CATHEDRAL_DISTRICT: DistrictGrid = {
  id: 'cathedral-district',
  name: 'Cathedral District',
  size: { width: 12, height: 12 },
  difficultyModifiers: {
    baseEncounterChance: 0.3,
    surveillanceLevel: 'extreme',
    trafficLevel: 'moderate',
  },
  specialFeatures: [
    {
      position: { x: 6, y: 6 },
      name: 'Cathedral of Algorithmic Grace',
      description: 'Massive neo-gothic structure with server farms',
      effect: 'High surveillance, neural dampening field',
    },
    {
      position: { x: 3, y: 9 },
      name: 'Underground Tunnel Entrance',
      description: 'Hidden access to catacomb networks',
      effect: 'Stealth route, resistance connections',
    },
    {
      position: { x: 9, y: 3 },
      name: 'Corporate Chapel Complex',
      description: 'Subsidiary shrines for different corporations',
      effect: 'Corporate benefits, alignment tracking',
    },
  ],
  defaultCells: [
    // Cathedral Square (center-left)
    { position: { x: 2, y: 6 }, type: 'building', description: 'Cathedral Square', encounterChance: 0.4, encounterId: 'cathedral-security-checkpoint', movementCost: 1, blocksMovement: false, district: 'cathedral-district' },
    
    // Security checkpoints
    { position: { x: 0, y: 5 }, type: 'security', description: 'North Checkpoint', encounterChance: 0.6, encounterId: 'cathedral-security-checkpoint', movementCost: 2, blocksMovement: false, district: 'cathedral-district' },
    { position: { x: 11, y: 6 }, type: 'security', description: 'East Checkpoint', encounterChance: 0.6, encounterId: 'cathedral-security-checkpoint', movementCost: 2, blocksMovement: false, district: 'cathedral-district' },
    
    // Surveillance zones
    { position: { x: 5, y: 5 }, type: 'surveillance', description: 'Productivity Fountain', encounterChance: 0.3, movementCost: 1, blocksMovement: false, district: 'cathedral-district' },
    { position: { x: 7, y: 7 }, type: 'surveillance', description: 'Digital Indulgence Vendors', encounterChance: 0.3, movementCost: 1, blocksMovement: false, district: 'cathedral-district' },
    
    // Underground access
    { position: { x: 3, y: 9 }, type: 'underground', description: 'Catacomb Entrance', encounterChance: 0.2, encounterId: 'resistance-contact', movementCost: 1, blocksMovement: false, district: 'cathedral-district' },
    { position: { x: 1, y: 10 }, type: 'underground', description: 'Hidden Tunnel', encounterChance: 0.1, movementCost: 1, blocksMovement: false, district: 'cathedral-district' },
    
    // Delivery destinations
    { position: { x: 8, y: 2 }, type: 'building', description: 'Confession Booth Complex', encounterChance: 0.4, encounterId: 'desperate-customer', movementCost: 1, blocksMovement: false, district: 'cathedral-district' },
    { position: { x: 10, y: 8 }, type: 'building', description: 'Subsidiary Shrine', encounterChance: 0.3, encounterId: 'corporate-loyalist', movementCost: 1, blocksMovement: false, district: 'cathedral-district' },
    
    // Restricted areas
    { position: { x: 6, y: 6 }, type: 'construction', description: 'Cathedral Main Structure', encounterChance: 0.8, movementCost: 3, blocksMovement: true, district: 'cathedral-district' },
  ],
};

export const INDUSTRIAL_DISTRICT: DistrictGrid = {
  id: 'industrial-district',
  name: 'Industrial District Hub',
  size: { width: 12, height: 12 },
  difficultyModifiers: {
    baseEncounterChance: 0.25,
    surveillanceLevel: 'medium',
    trafficLevel: 'heavy',
  },
  specialFeatures: [
    {
      position: { x: 6, y: 2 },
      name: 'Main Factory Complex',
      description: 'Primary manufacturing facilities',
      effect: 'Worker solidarity opportunities, security challenges',
    },
    {
      position: { x: 2, y: 8 },
      name: 'Union Hall',
      description: 'Worker organizing center',
      effect: 'Labor support, strike coordination',
    },
    {
      position: { x: 9, y: 9 },
      name: 'Loading Docks',
      description: 'Cargo transfer hub',
      effect: 'Fast delivery routes, corporate oversight',
    },
  ],
  defaultCells: [
    // Factory areas
    { position: { x: 6, y: 2 }, type: 'building', description: 'Main Factory', encounterChance: 0.3, encounterId: 'factory-manager', movementCost: 1, blocksMovement: false, district: 'industrial-district' },
    { position: { x: 5, y: 1 }, type: 'building', description: 'Manufacturing Wing A', encounterChance: 0.3, encounterId: 'factory-worker', movementCost: 1, blocksMovement: false, district: 'industrial-district' },
    { position: { x: 7, y: 1 }, type: 'building', description: 'Manufacturing Wing B', encounterChance: 0.3, encounterId: 'factory-worker', movementCost: 1, blocksMovement: false, district: 'industrial-district' },
    
    // Worker areas
    { position: { x: 2, y: 8 }, type: 'building', description: 'Union Hall', encounterChance: 0.4, encounterId: 'union-organizer', movementCost: 1, blocksMovement: false, district: 'industrial-district' },
    { position: { x: 1, y: 7 }, type: 'underground', description: 'Worker Meeting Space', encounterChance: 0.2, encounterId: 'resistance-contact', movementCost: 1, blocksMovement: false, district: 'industrial-district' },
    
    // Protest/Strike zones
    { position: { x: 4, y: 6 }, type: 'protest', description: 'Picket Line Alpha', encounterChance: 0.6, encounterId: 'industrial-worker-blockade', movementCost: 2, blocksMovement: false, district: 'industrial-district' },
    { position: { x: 8, y: 5 }, type: 'protest', description: 'Picket Line Beta', encounterChance: 0.6, encounterId: 'industrial-worker-blockade', movementCost: 2, blocksMovement: false, district: 'industrial-district' },
    
    // Traffic/logistics
    { position: { x: 9, y: 9 }, type: 'pickup', description: 'Loading Dock Central', encounterChance: 0.3, encounterId: 'dock-supervisor', movementCost: 1, blocksMovement: false, district: 'industrial-district' },
    { position: { x: 10, y: 8 }, type: 'traffic', description: 'Truck Route', encounterChance: 0.2, movementCost: 2, blocksMovement: false, district: 'industrial-district' },
    { position: { x: 0, y: 6 }, type: 'traffic', description: 'Main Industrial Road', encounterChance: 0.3, movementCost: 2, blocksMovement: false, district: 'industrial-district' },
    
    // Security
    { position: { x: 6, y: 0 }, type: 'security', description: 'Factory Security Gate', encounterChance: 0.4, encounterId: 'factory-security', movementCost: 2, blocksMovement: false, district: 'industrial-district' },
    
    // Shortcuts for workers
    { position: { x: 3, y: 3 }, type: 'shortcut', description: 'Worker Alley', encounterChance: 0.1, movementCost: 1, blocksMovement: false, district: 'industrial-district' },
    { position: { x: 8, y: 7 }, type: 'shortcut', description: 'Delivery Shortcut', encounterChance: 0.1, movementCost: 1, blocksMovement: false, district: 'industrial-district' },
  ],
};

export const NUEVO_POLANCO_DISTRICT: DistrictGrid = {
  id: 'nuevo-polanco-district',
  name: 'Nuevo Polanco Elite Zone',
  size: { width: 12, height: 12 },
  difficultyModifiers: {
    baseEncounterChance: 0.35,
    surveillanceLevel: 'high',
    trafficLevel: 'light', // Elite areas have better traffic management
  },
  specialFeatures: [
    {
      position: { x: 6, y: 6 },
      name: 'Central Luxury Plaza',
      description: 'High-end shopping and dining complex',
      effect: 'Wealthy customer encounters, class dynamics',
    },
    {
      position: { x: 3, y: 3 },
      name: 'Elite Residential Tower',
      description: 'Luxury apartment complex',
      effect: 'Doorman encounters, service entrance protocols',
    },
    {
      position: { x: 9, y: 2 },
      name: 'Corporate Headquarters',
      description: 'Glass tower offices',
      effect: 'Executive deliveries, corporate politics',
    },
  ],
  defaultCells: [
    // Luxury buildings
    { position: { x: 3, y: 3 }, type: 'building', description: 'Torre Elite Residencial', encounterChance: 0.5, encounterId: 'nuevo-polanco-doorman-elite', movementCost: 1, blocksMovement: false, district: 'nuevo-polanco-district' },
    { position: { x: 8, y: 4 }, type: 'building', description: 'Penthouse Complex', encounterChance: 0.5, encounterId: 'nuevo-polanco-doorman-elite', movementCost: 1, blocksMovement: false, district: 'nuevo-polanco-district' },
    { position: { x: 4, y: 8 }, type: 'building', description: 'Executive Condos', encounterChance: 0.5, encounterId: 'wealthy-resident-complaint', movementCost: 1, blocksMovement: false, district: 'nuevo-polanco-district' },
    
    // Corporate areas
    { position: { x: 9, y: 2 }, type: 'building', description: 'Corporate HQ', encounterChance: 0.4, encounterId: 'corporate-executive', movementCost: 1, blocksMovement: false, district: 'nuevo-polanco-district' },
    { position: { x: 10, y: 3 }, type: 'security', description: 'Corporate Security', encounterChance: 0.6, encounterId: 'corporate-security', movementCost: 2, blocksMovement: false, district: 'nuevo-polanco-district' },
    
    // Shopping/dining
    { position: { x: 6, y: 6 }, type: 'pickup', description: 'Luxury Plaza', encounterChance: 0.3, encounterId: 'upscale-restaurant', movementCost: 1, blocksMovement: false, district: 'nuevo-polanco-district' },
    { position: { x: 5, y: 7 }, type: 'pickup', description: 'Gourmet Market', encounterChance: 0.3, encounterId: 'premium-vendor', movementCost: 1, blocksMovement: false, district: 'nuevo-polanco-district' },
    
    // Elite security checkpoints
    { position: { x: 0, y: 5 }, type: 'security', description: 'District Entry Point', encounterChance: 0.5, encounterId: 'elite-security-gate', movementCost: 2, blocksMovement: false, district: 'nuevo-polanco-district' },
    { position: { x: 11, y: 6 }, type: 'security', description: 'VIP Access Control', encounterChance: 0.5, encounterId: 'elite-security-gate', movementCost: 2, blocksMovement: false, district: 'nuevo-polanco-district' },
    
    // Service areas (less visible)
    { position: { x: 1, y: 1 }, type: 'shortcut', description: 'Service Route', encounterChance: 0.1, movementCost: 1, blocksMovement: false, district: 'nuevo-polanco-district' },
    { position: { x: 11, y: 11 }, type: 'shortcut', description: 'Back Entrance', encounterChance: 0.1, movementCost: 1, blocksMovement: false, district: 'nuevo-polanco-district' },
    
    // Surveillance zones
    { position: { x: 5, y: 5 }, type: 'surveillance', description: 'Monitored Plaza', encounterChance: 0.2, movementCost: 1, blocksMovement: false, district: 'nuevo-polanco-district' },
    { position: { x: 7, y: 7 }, type: 'surveillance', description: 'Security Camera Hub', encounterChance: 0.2, movementCost: 1, blocksMovement: false, district: 'nuevo-polanco-district' },
  ],
};

export const LABYRINTHINE_DISTRICT: DistrictGrid = {
  id: 'labyrinthine-district',
  name: 'Labyrinthine Residential Maze',
  size: { width: 12, height: 12 },
  difficultyModifiers: {
    baseEncounterChance: 0.4, // High encounter rate due to navigation confusion
    surveillanceLevel: 'low',
    trafficLevel: 'gridlock', // Narrow, congested streets
  },
  specialFeatures: [
    {
      position: { x: 6, y: 6 },
      name: 'Central Community Hub',
      description: 'Informal neighborhood center',
      effect: 'Community assistance, local knowledge network',
    },
    {
      position: { x: 2, y: 9 },
      name: 'Address Confusion Zone',
      description: 'Area with conflicting numbering systems',
      effect: 'Navigation challenges, community solutions required',
    },
    {
      position: { x: 10, y: 3 },
      name: 'GPS Dead Zone',
      description: 'Technology failures common',
      effect: 'Forced reliance on local knowledge',
    },
  ],
  defaultCells: [
    // Community areas
    { position: { x: 6, y: 6 }, type: 'building', description: 'Community Center', encounterChance: 0.3, encounterId: 'helpful-neighbor', movementCost: 1, blocksMovement: false, district: 'labyrinthine-district' },
    { position: { x: 5, y: 5 }, type: 'building', description: 'Neighborhood Store', encounterChance: 0.2, encounterId: 'local-merchant', movementCost: 1, blocksMovement: false, district: 'labyrinthine-district' },
    
    // Navigation challenges
    { position: { x: 2, y: 9 }, type: 'street', description: 'Renumbered Street', encounterChance: 0.6, encounterId: 'labyrinthine-street-navigation', movementCost: 2, blocksMovement: false, district: 'labyrinthine-district' },
    { position: { x: 10, y: 3 }, type: 'street', description: 'GPS Dead Zone', encounterChance: 0.7, encounterId: 'labyrinthine-street-navigation', movementCost: 3, blocksMovement: false, district: 'labyrinthine-district' },
    { position: { x: 8, y: 8 }, type: 'street', description: 'Maze Intersection', encounterChance: 0.5, encounterId: 'labyrinthine-street-navigation', movementCost: 2, blocksMovement: false, district: 'labyrinthine-district' },
    
    // Residential areas
    { position: { x: 1, y: 3 }, type: 'building', description: 'Dense Housing Block A', encounterChance: 0.4, encounterId: 'confused-address', movementCost: 1, blocksMovement: false, district: 'labyrinthine-district' },
    { position: { x: 9, y: 7 }, type: 'building', description: 'Dense Housing Block B', encounterChance: 0.4, encounterId: 'confused-address', movementCost: 1, blocksMovement: false, district: 'labyrinthine-district' },
    { position: { x: 3, y: 2 }, type: 'building', description: 'Family Compound', encounterChance: 0.3, encounterId: 'extended-family-delivery', movementCost: 1, blocksMovement: false, district: 'labyrinthine-district' },
    
    // Traffic congestion
    { position: { x: 4, y: 7 }, type: 'traffic', description: 'Narrow Street Jam', encounterChance: 0.3, movementCost: 3, blocksMovement: false, district: 'labyrinthine-district' },
    { position: { x: 7, y: 4 }, type: 'traffic', description: 'Market Day Congestion', encounterChance: 0.4, movementCost: 3, blocksMovement: false, district: 'labyrinthine-district' },
    
    // Hidden shortcuts (local knowledge required)
    { position: { x: 1, y: 11 }, type: 'shortcut', description: 'Local Secret Path', encounterChance: 0.1, movementCost: 1, blocksMovement: false, district: 'labyrinthine-district' },
    { position: { x: 11, y: 1 }, type: 'shortcut', description: 'Resident Alley', encounterChance: 0.1, movementCost: 1, blocksMovement: false, district: 'labyrinthine-district' },
    
    // Construction/blocked areas
    { position: { x: 6, y: 2 }, type: 'construction', description: 'Street Renovation', encounterChance: 0.2, movementCost: 4, blocksMovement: false, district: 'labyrinthine-district' },
  ],
};

export const DISTRICT_TEMPLATES = {
  'cathedral-district': CATHEDRAL_DISTRICT,
  'industrial-district': INDUSTRIAL_DISTRICT,
  'nuevo-polanco-district': NUEVO_POLANCO_DISTRICT,
  'labyrinthine-district': LABYRINTHINE_DISTRICT,
} as const;

export type DistrictId = keyof typeof DISTRICT_TEMPLATES;