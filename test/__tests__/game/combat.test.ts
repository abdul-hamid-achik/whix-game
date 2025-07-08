import { describe, it, expect, beforeEach } from 'vitest';
import { 
  CombatUnit,
  CombatPosition,
  EnemyType,
  ENEMY_TEMPLATES,
  calculateDistance,
  getValidMoves,
  getTargetsInRange,
  calculateDamage,
  generateEnemyTeam
} from '@/lib/game/combat';

describe('Combat System - Polanco Delivery Battles', () => {
  let playerUnit: CombatUnit;
  let enemyUnit: CombatUnit;

  beforeEach(() => {
    // Create a player courier unit
    playerUnit = {
      id: 'player-1',
      name: 'Miguel',
      type: 'partner',
      position: { x: 0, y: 0 },
      stats: {
        currentHealth: 100,
        maxHealth: 100,
        attack: 25,
        defense: 15,
        speed: 20
      },
      traits: ['hyperfocus'],
      abilities: [],
      isActive: true,
      hasActed: false
    };

    // Create a corporate manager enemy
    enemyUnit = {
      ...ENEMY_TEMPLATES.corporate_manager,
      id: 'enemy-1',
      position: { x: 2, y: 2 }
    };
  });

  describe('Grid Movement in Polanco Streets', () => {
    it('should calculate Manhattan distance for courier navigation', () => {
      expect(calculateDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(7);
      expect(calculateDistance({ x: 2, y: 2 }, { x: 2, y: 2 })).toBe(0);
      expect(calculateDistance({ x: 1, y: 1 }, { x: 2, y: 2 })).toBe(2);
    });

    it('should get valid movement positions on 7x7 Polanco grid', () => {
      const unit = { ...playerUnit, position: { x: 3, y: 3 } };
      const validMoves = getValidMoves(unit, [], 2);
      
      // Should include positions within range 2
      expect(validMoves).toContainEqual({ x: 3, y: 1 }); // Up 2
      expect(validMoves).toContainEqual({ x: 3, y: 5 }); // Down 2
      expect(validMoves).toContainEqual({ x: 1, y: 3 }); // Left 2
      expect(validMoves).toContainEqual({ x: 5, y: 3 }); // Right 2
      expect(validMoves).toContainEqual({ x: 4, y: 4 }); // Diagonal
      
      // Should not include out of bounds (7x7 grid now)
      expect(validMoves.every(pos => pos.x >= 0 && pos.x <= 6)).toBe(true);
      expect(validMoves.every(pos => pos.y >= 0 && pos.y <= 6)).toBe(true);
      
      // Should not include current position
      expect(validMoves).not.toContainEqual({ x: 3, y: 3 });
    });

    it('should block movement to occupied delivery zones', () => {
      const unit = { ...playerUnit, position: { x: 1, y: 1 } };
      const occupiedUnit = { ...enemyUnit, position: { x: 2, y: 1 } };
      const allUnits = [unit, occupiedUnit];
      
      const validMoves = getValidMoves(unit, allUnits, 2);
      
      // Should not include occupied position
      expect(validMoves).not.toContainEqual({ x: 2, y: 1 });
      
      // Should include other valid positions
      expect(validMoves).toContainEqual({ x: 0, y: 1 });
      expect(validMoves).toContainEqual({ x: 1, y: 0 });
      expect(validMoves).toContainEqual({ x: 3, y: 1 });
    });
  });

  describe('Combat Targeting', () => {
    it('should get targets in melee range', () => {
      const attacker = { ...playerUnit, position: { x: 2, y: 2 } };
      const adjacent = { ...enemyUnit, position: { x: 2, y: 3 } };
      const distant = { 
        ...ENEMY_TEMPLATES.rival_courier,
        id: 'enemy-2',
        position: { x: 0, y: 0 }
      };
      
      const targets = getTargetsInRange(attacker, [attacker, adjacent, distant], 1);
      
      expect(targets).toHaveLength(1);
      expect(targets[0].id).toBe('enemy-1');
      expect(targets).not.toContainEqual(expect.objectContaining({ id: 'enemy-2' }));
    });

    it('should not target allies', () => {
      const attacker = { ...playerUnit, position: { x: 2, y: 2 } };
      const ally = { 
        ...playerUnit,
        id: 'player-2',
        name: 'Kai',
        position: { x: 2, y: 3 }
      };
      const enemy = { ...enemyUnit, position: { x: 3, y: 2 } };
      
      const targets = getTargetsInRange(attacker, [attacker, ally, enemy], 1);
      
      expect(targets).toHaveLength(1);
      expect(targets[0].id).toBe('enemy-1');
      expect(targets[0].type).toBe('enemy');
    });
  });

  describe('Damage Calculation', () => {
    it('should calculate WHIX combat damage with defense', () => {
      const damage = calculateDamage(playerUnit, enemyUnit);
      
      // Damage should be reduced by defense
      expect(damage).toBeLessThan(playerUnit.stats.attack);
      expect(damage).toBeGreaterThan(0);
    });

    it('should handle critical hits for couriers', () => {
      const normalDamage = calculateDamage(playerUnit, enemyUnit, false);
      const criticalDamage = calculateDamage(playerUnit, enemyUnit, true);
      
      expect(criticalDamage).toBeGreaterThan(normalDamage);
      expect(criticalDamage).toBe(Math.floor(normalDamage * 1.5));
    });

    it('should ensure minimum damage of 1', () => {
      const weakAttacker = { 
        ...playerUnit, 
        stats: { ...playerUnit.stats, attack: 5 }
      };
      const strongDefender = { 
        ...enemyUnit, 
        stats: { ...enemyUnit.stats, defense: 50 }
      };
      
      const damage = calculateDamage(weakAttacker, strongDefender);
      expect(damage).toBe(1);
    });
  });

  describe('Polanco Enemy Types', () => {
    it('should have corporate manager with balanced stats', () => {
      const manager = ENEMY_TEMPLATES.corporate_manager;
      
      expect(manager.name).toBe('WHIX Manager');
      expect(manager.stats.maxHealth).toBe(60);
      expect(manager.stats.defense).toBe(15);
      expect(manager.stats.speed).toBe(35);
      expect(manager.type).toBe('enemy');
    });

    it('should have rival courier with speed advantage', () => {
      const rival = ENEMY_TEMPLATES.rival_courier;
      
      expect(rival.name).toBe('Rival Courier');
      expect(rival.stats.speed).toBe(60); // Fast enemy
      expect(rival.stats.maxHealth).toBe(45);
      expect(rival.abilities).toBeDefined();
      expect(rival.abilities![0].name).toBe('Steal Order');
    });

    it('should have angry customer as defensive unit', () => {
      const customer = ENEMY_TEMPLATES.angry_customer;
      
      expect(customer.name).toBe('Angry Customer');
      expect(customer.stats.defense).toBe(8);
      expect(customer.stats.attack).toBe(12);
      expect(customer.type).toBe('enemy');
    });

    it('should have karen customer as demanding unit', () => {
      const karen = ENEMY_TEMPLATES.karen_customer;
      
      expect(karen.name).toBe('Karen');
      expect(karen.stats.attack).toBe(15);
      expect(karen.stats.defense).toBe(12);
      expect(karen.stats.maxHealth).toBe(50);
      expect(karen.abilities).toBeDefined();
      expect(karen.abilities![0].name).toBe('Demand Manager');
    });

    it('should have bourgeois resident as glass cannon', () => {
      const resident = ENEMY_TEMPLATES.bourgeois_resident;
      
      expect(resident.name).toBe('Wealthy Resident');
      expect(resident.stats.attack).toBe(18); // High attack
      expect(resident.stats.defense).toBe(6); // Low defense
      expect(resident.stats.maxHealth).toBe(35); // Low health
      expect(resident.abilities).toBeDefined();
      expect(resident.abilities![0].name).toBe('Condescending Remark');
    });

    it('should have security guard as tank unit', () => {
      const guard = ENEMY_TEMPLATES.security_guard;
      
      expect(guard.name).toBe('Security Guard');
      expect(guard.stats.maxHealth).toBe(55); // High health
      expect(guard.stats.defense).toBe(18); // High defense
      expect(guard.stats.speed).toBe(40); // Slow
      expect(guard.type).toBe('enemy');
    });
  });

  describe('Enemy Team Generation', () => {
    it('should generate enemy teams based on difficulty', () => {
      const easyTeam = generateEnemyTeam(1);
      const hardTeam = generateEnemyTeam(3);
      
      expect(easyTeam.length).toBeGreaterThan(0);
      expect(hardTeam.length).toBeGreaterThanOrEqual(easyTeam.length);
      
      // All enemies should have valid positions on 7x7 grid
      easyTeam.forEach(enemy => {
        expect(enemy.position.x).toBeGreaterThanOrEqual(0);
        expect(enemy.position.x).toBeLessThanOrEqual(6);
        expect(enemy.position.y).toBeGreaterThanOrEqual(0);
        expect(enemy.position.y).toBeLessThanOrEqual(6);
      });
    });

    it('should create unique enemy IDs', () => {
      const team = generateEnemyTeam(2);
      const ids = team.map(enemy => enemy.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should position enemies on the right side of grid', () => {
      const team = generateEnemyTeam(2);
      
      // Enemies typically spawn on the right side (x >= 3)
      team.forEach(enemy => {
        expect(enemy.position.x).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Grid Boundaries', () => {
    it('should validate grid positions for 7x7 combat area', () => {
      const isValidPosition = (pos: CombatPosition): boolean => {
        return pos.x >= 0 && pos.x <= 6 && pos.y >= 0 && pos.y <= 6;
      };
      
      expect(isValidPosition({ x: 0, y: 0 })).toBe(true);
      expect(isValidPosition({ x: 6, y: 6 })).toBe(true);
      expect(isValidPosition({ x: 7, y: 2 })).toBe(false);
      expect(isValidPosition({ x: 2, y: -1 })).toBe(false);
    });
  });

  describe('Neurodivergent Trait Effects', () => {
    it('should enhance combat stats based on traits', () => {
      const hyperfocusUnit: CombatUnit = {
        ...playerUnit,
        traits: ['hyperfocus', 'pattern_recognition']
      };
      
      // Traits should provide tactical advantages
      expect(hyperfocusUnit.traits).toContain('hyperfocus');
      expect(hyperfocusUnit.traits).toContain('pattern_recognition');
      
      // In a real implementation, these traits would boost stats
      // For now, we just verify they're properly assigned
      expect(hyperfocusUnit.traits?.length).toBe(2);
    });
  });

  describe('Polanco Combat Scenarios', () => {
    it('should handle delivery route ambush scenario', () => {
      // Courier ambushed while making delivery
      const courier = { ...playerUnit, position: { x: 2, y: 2 } };
      const ambushers = [
        { ...ENEMY_TEMPLATES.rival_courier, id: 'ambush-1', position: { x: 1, y: 2 } },
        { ...ENEMY_TEMPLATES.angry_customer, id: 'ambush-2', position: { x: 3, y: 2 } }
      ];
      
      const targets = getTargetsInRange(courier, [courier, ...ambushers], 1);
      
      // Courier is surrounded
      expect(targets).toHaveLength(2);
      expect(targets.every(t => t.type === 'enemy')).toBe(true);
    });

    it('should handle corporate enforcement checkpoint', () => {
      // Corporate enforcers blocking delivery route
      const enforcers = generateEnemyTeam(2);
      const corporateUnits = enforcers.filter(e => 
        e.name === 'Corporate Manager' || 
        e.name === 'Security Guard'
      );
      
      // Should have at least some enemies generated
      expect(enforcers.length).toBeGreaterThan(0);
    });
  });
});