import { z } from 'zod';
import { StoredPartner } from '../schemas/game-schemas';

// Enhanced grid system for delivery routes
export const DELIVERY_GRID_SIZE = 12; // Larger grid for more strategic route planning

export const DeliveryPositionSchema = z.object({
  x: z.number().min(0).max(DELIVERY_GRID_SIZE - 1),
  y: z.number().min(0).max(DELIVERY_GRID_SIZE - 1),
});

export type DeliveryPosition = z.infer<typeof DeliveryPositionSchema>;

// Grid cell types for delivery routes
export const GridCellTypeSchema = z.enum([
  'street',          // Normal road
  'building',        // Customer location
  'traffic',         // Slows movement
  'construction',    // Blocks movement
  'security',        // Requires special handling
  'protest',         // Crowd navigation challenge
  'pickup',          // Restaurant/pickup location
  'shortcut',        // Bonus movement
  'surveillance',    // Stealth challenge
  'underground',     // Resistance route
]);

export type GridCellType = z.infer<typeof GridCellTypeSchema>;

export const GridCellSchema = z.object({
  position: DeliveryPositionSchema,
  type: GridCellTypeSchema,
  description: z.string().optional(),
  encounterChance: z.number().min(0).max(1).default(0), // 0-1 probability
  encounterId: z.string().optional(), // Specific encounter for this cell
  movementCost: z.number().default(1), // Action points to traverse
  blocksMovement: z.boolean().default(false),
  district: z.string().optional(),
});

export type GridCell = z.infer<typeof GridCellSchema>;

// Delivery unit on the grid (driver with package)
export const DeliveryUnitSchema = z.object({
  id: z.string(),
  partnerId: z.string(),
  position: DeliveryPositionSchema,
  package: z.object({
    id: z.string(),
    destination: DeliveryPositionSchema,
    type: z.enum(['food', 'package', 'urgent', 'fragile']),
    timeRemaining: z.number(), // minutes
  }),
  actionPoints: z.number().default(3),
  hasActed: z.boolean().default(false),
});

export type DeliveryUnit = z.infer<typeof DeliveryUnitSchema>;

// District-specific grid templates
export const DistrictGridTemplate = z.object({
  id: z.string(),
  name: z.string(),
  size: z.object({
    width: z.number(),
    height: z.number(),
  }),
  defaultCells: z.array(GridCellSchema),
  specialFeatures: z.array(z.object({
    position: DeliveryPositionSchema,
    name: z.string(),
    description: z.string(),
    effect: z.string(),
  })),
  difficultyModifiers: z.object({
    baseEncounterChance: z.number(),
    surveillanceLevel: z.enum(['low', 'medium', 'high', 'extreme']),
    trafficLevel: z.enum(['light', 'moderate', 'heavy', 'gridlock']),
  }),
});

export type DistrictGrid = z.infer<typeof DistrictGridTemplate>;

// Grid utilities
export class DeliveryGridEngine {
  private grid: Map<string, GridCell> = new Map();
  private units: Map<string, DeliveryUnit> = new Map();
  private partnerTraitBonuses: Map<string, StoredPartner> = new Map();
  
  constructor(districtTemplate: DistrictGrid) {
    this.loadTemplate(districtTemplate);
  }
  
  private loadTemplate(template: DistrictGrid) {
    // Load all cells from template
    template.defaultCells.forEach(cell => {
      const key = `${cell.position.x},${cell.position.y}`;
      this.grid.set(key, cell);
    });
    
    // Fill empty spaces with default street cells
    for (let x = 0; x < template.size.width; x++) {
      for (let y = 0; y < template.size.height; y++) {
        const key = `${x},${y}`;
        if (!this.grid.has(key)) {
          this.grid.set(key, {
            position: { x, y },
            type: 'street',
            encounterChance: template.difficultyModifiers.baseEncounterChance,
            movementCost: 1,
            blocksMovement: false,
            district: template.id,
          });
        }
      }
    }
  }
  
  getCellAt(position: DeliveryPosition): GridCell | null {
    const key = `${position.x},${position.y}`;
    return this.grid.get(key) || null;
  }
  
  getValidMoves(unit: DeliveryUnit): DeliveryPosition[] {
    const validMoves: DeliveryPosition[] = [];
    const maxRange = unit.actionPoints;
    
    // Check all positions within movement range
    for (let dx = -maxRange; dx <= maxRange; dx++) {
      for (let dy = -maxRange; dy <= maxRange; dy++) {
        const newX = unit.position.x + dx;
        const newY = unit.position.y + dy;
        
        // Skip if out of bounds
        if (newX < 0 || newX >= DELIVERY_GRID_SIZE || 
            newY < 0 || newY >= DELIVERY_GRID_SIZE) {
          continue;
        }
        
        // Skip current position
        if (dx === 0 && dy === 0) continue;
        
        // Check if path is valid (simplified - uses Manhattan distance)
        const distance = Math.abs(dx) + Math.abs(dy);
        if (distance > maxRange) continue;
        
        const targetCell = this.getCellAt({ x: newX, y: newY });
        if (targetCell && !targetCell.blocksMovement) {
          validMoves.push({ x: newX, y: newY });
        }
      }
    }
    
    return validMoves;
  }
  
  moveUnit(unitId: string, newPosition: DeliveryPosition): {
    success: boolean;
    encounter?: string;
    message?: string;
  } {
    const unit = this.units.get(unitId);
    if (!unit) {
      return { success: false, message: 'Unit not found' };
    }
    
    const targetCell = this.getCellAt(newPosition);
    if (!targetCell) {
      return { success: false, message: 'Invalid position' };
    }
    
    if (targetCell.blocksMovement) {
      return { success: false, message: 'Position blocked' };
    }
    
    // Calculate movement cost
    const distance = Math.abs(unit.position.x - newPosition.x) + 
                    Math.abs(unit.position.y - newPosition.y);
    const totalCost = distance * targetCell.movementCost;
    
    if (unit.actionPoints < totalCost) {
      return { success: false, message: 'Not enough action points' };
    }
    
    // Move unit
    unit.position = newPosition;
    unit.actionPoints -= totalCost;
    unit.hasActed = true;
    
    // Check for encounters (with trait bonuses)
    const encounterChance = targetCell.encounterChance * (1 / this.getTraitBonus(unitId, 'movement'));
    if (Math.random() < encounterChance) {
      return {
        success: true,
        encounter: targetCell.encounterId || this.getRandomEncounterForCell(targetCell),
      };
    }
    
    return { success: true };
  }
  
  private getRandomEncounterForCell(cell: GridCell): string {
    // Map cell types to encounter categories
    const encounterMap: Record<GridCellType, string[]> = {
      'street': ['traffic-jam', 'bike-breakdown', 'wrong-turn'],
      'building': ['angry-customer-cold-food', 'karen-manager-demand', 'locked-building'],
      'traffic': ['traffic-argument', 'road-rage-driver', 'construction-delay'],
      'construction': ['worker-blockade', 'detour-challenge', 'equipment-hazard'],
      'security': ['security-checkpoint', 'id-verification', 'restricted-access'],
      'protest': ['crowd-navigation', 'protest-sympathy', 'police-checkpoint'],
      'pickup': ['restaurant-delay', 'wrong-order', 'payment-dispute'],
      'shortcut': ['lucky-break', 'helpful-local', 'traffic-tip'],
      'surveillance': ['corporate-drone', 'facial-recognition', 'tracking-alert'],
      'underground': ['resistance-contact', 'safe-passage', 'underground-route'],
    };
    
    const possibleEncounters = encounterMap[cell.type] || ['generic-delay'];
    return possibleEncounters[Math.floor(Math.random() * possibleEncounters.length)];
  }
  
  addUnit(unit: DeliveryUnit) {
    this.units.set(unit.id, unit);
  }
  
  getUnit(unitId: string): DeliveryUnit | null {
    return this.units.get(unitId) || null;
  }
  
  getAllUnits(): DeliveryUnit[] {
    return Array.from(this.units.values());
  }
  
  checkDeliveryComplete(unitId: string): boolean {
    const unit = this.units.get(unitId);
    if (!unit) return false;
    
    return unit.position.x === unit.package.destination.x &&
           unit.position.y === unit.package.destination.y;
  }
  
  // Partner trait system
  setPartnerForUnit(unitId: string, partner: StoredPartner) {
    this.partnerTraitBonuses.set(unitId, partner);
    
    // Apply trait bonuses to unit
    const unit = this.units.get(unitId);
    if (unit) {
      unit.actionPoints = this.calculateActionPoints(partner);
    }
  }
  
  private calculateActionPoints(partner: StoredPartner): number {
    let baseActionPoints = 3;
    
    // Hyperfocus trait: +1 action point
    if (partner.primaryTrait === 'hyperfocus' || 
        partner.secondaryTrait === 'hyperfocus' || 
        partner.tertiaryTrait === 'hyperfocus') {
      const mastery = partner.traitMastery['hyperfocus'];
      if (mastery?.level >= 1) {
        baseActionPoints += 1;
        if (mastery.level >= 2) baseActionPoints += 1; // Silver mastery bonus
      }
    }
    
    // Routine mastery trait: +1 action point for familiar routes
    if (partner.primaryTrait === 'routine_mastery' || 
        partner.secondaryTrait === 'routine_mastery' || 
        partner.tertiaryTrait === 'routine_mastery') {
      const mastery = partner.traitMastery['routine_mastery'];
      if (mastery?.level >= 1) {
        baseActionPoints += 1;
      }
    }
    
    return baseActionPoints;
  }
  
  private getTraitBonus(unitId: string, situationType: 'encounter' | 'movement' | 'observation'): number {
    const partner = this.partnerTraitBonuses.get(unitId);
    if (!partner) return 1.0;
    
    let bonus = 1.0;
    
    // Enhanced senses: bonus to observation and encounter outcomes
    if (situationType === 'observation' || situationType === 'encounter') {
      if (partner.primaryTrait === 'enhanced_senses' || 
          partner.secondaryTrait === 'enhanced_senses' || 
          partner.tertiaryTrait === 'enhanced_senses') {
        const mastery = partner.traitMastery['enhanced_senses'];
        if (mastery?.level >= 1) {
          bonus += 0.3; // 30% bonus
          if (mastery.level >= 2) bonus += 0.2; // Additional 20% at silver
        }
      }
    }
    
    // Pattern recognition: bonus to avoiding encounters and finding shortcuts
    if (situationType === 'movement') {
      if (partner.primaryTrait === 'pattern_recognition' || 
          partner.secondaryTrait === 'pattern_recognition' || 
          partner.tertiaryTrait === 'pattern_recognition') {
        const mastery = partner.traitMastery['pattern_recognition'];
        if (mastery?.level >= 1) {
          bonus += 0.25; // 25% bonus to movement efficiency
        }
      }
    }
    
    // Attention to detail: bonus to all precision-based tasks
    if (partner.primaryTrait === 'attention_to_detail' || 
        partner.secondaryTrait === 'attention_to_detail' || 
        partner.tertiaryTrait === 'attention_to_detail') {
      const mastery = partner.traitMastery['attention_to_detail'];
      if (mastery?.level >= 1) {
        bonus += 0.15; // 15% general bonus
      }
    }
    
    return bonus;
  }
  
  resetTurn() {
    // Reset action points and hasActed for all units
    this.units.forEach(unit => {
      // Recalculate action points based on partner traits
      const partner = this.partnerTraitBonuses.get(unit.id);
      unit.actionPoints = partner ? this.calculateActionPoints(partner) : 3;
      unit.hasActed = false;
      
      // Reduce package time remaining
      unit.package.timeRemaining -= 1;
    });
  }
}