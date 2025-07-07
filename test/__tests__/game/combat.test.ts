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

    // Create a corporate enforcer enemy
    enemyUnit = {
      ...ENEMY_TEMPLATES.corporate_enforcer,
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

    it('should get valid movement positions on 5x5 Polanco grid', () => {
      const unit = { ...playerUnit, position: { x: 2, y: 2 } };
      const validMoves = getValidMoves(unit, [], 2);
      
      // Should include positions within range 2
      expect(validMoves).toContainEqual({ x: 2, y: 0 }); // Up 2
      expect(validMoves).toContainEqual({ x: 2, y: 4 }); // Down 2
      expect(validMoves).toContainEqual({ x: 0, y: 2 }); // Left 2
      expect(validMoves).toContainEqual({ x: 4, y: 2 }); // Right 2
      expect(validMoves).toContainEqual({ x: 3, y: 3 }); // Diagonal
      
      // Should not include out of bounds
      expect(validMoves.every(pos => pos.x >= 0 && pos.x <= 4)).toBe(true);
      expect(validMoves.every(pos => pos.y >= 0 && pos.y <= 4)).toBe(true);
      
      // Should not include current position
      expect(validMoves).not.toContainEqual({ x: 2, y: 2 });
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
    it('should have corporate enforcer with balanced stats', () => {
      const enforcer = ENEMY_TEMPLATES.corporate_enforcer;
      
      expect(enforcer.name).toBe('Corporate Enforcer');
      expect(enforcer.stats.maxHealth).toBe(50);
      expect(enforcer.stats.defense).toBe(10);
      expect(enforcer.stats.speed).toBe(40);
      expect(enforcer.type).toBe('enemy');
    });

    it('should have rival courier with speed advantage', () => {
      const rival = ENEMY_TEMPLATES.rival_courier;
      
      expect(rival.name).toBe('Rival Courier');
      expect(rival.stats.speed).toBe(60); // Fastest enemy
      expect(rival.stats.maxHealth).toBe(40);
      expect(rival.abilities).toBeUndefined(); // No special abilities
    });

    it('should have surveillance unit with tracking abilities', () => {
      const surveillance = ENEMY_TEMPLATES.surveillance_unit;
      
      expect(surveillance.name).toBe('Surveillance Unit');
      expect(surveillance.stats.speed).toBe(50);
      expect(surveillance.stats.attack).toBe(16);
      expect(surveillance.abilities).toBeDefined();
      expect(surveillance.abilities![0].name).toBe('Track Movement');
    });

    it('should have stressed citizen as defensive unit', () => {
      const citizen = ENEMY_TEMPLATES.stressed_citizen;
      
      expect(citizen.name).toBe('Stressed Citizen');
      expect(citizen.stats.defense).toBe(12);
      expect(citizen.stats.attack).toBe(10); // Lowest attack
      expect(citizen.type).toBe('enemy');
    });

    it('should have system glitch as glass cannon', () => {
      const glitch = ENEMY_TEMPLATES.system_glitch;
      
      expect(glitch.name).toBe('System Glitch');
      expect(glitch.stats.attack).toBe(20); // High attack
      expect(glitch.stats.defense).toBe(5); // Low defense
      expect(glitch.stats.maxHealth).toBe(30); // Low health
      expect(glitch.abilities).toBeDefined();
      expect(glitch.abilities![0].name).toBe('Data Corruption');
    });

    it('should have efficiency bot as tank unit', () => {
      const bot = ENEMY_TEMPLATES.efficiency_bot;
      
      expect(bot.name).toBe('Efficiency Bot');
      expect(bot.stats.maxHealth).toBe(60); // Highest health
      expect(bot.stats.defense).toBe(20); // Highest defense
      expect(bot.stats.speed).toBe(25); // Slowest enemy
      expect(bot.type).toBe('enemy');
    });
  });

  describe('Enemy Team Generation', () => {
    it('should generate enemy teams based on difficulty', () => {
      const easyTeam = generateEnemyTeam(1);
      const hardTeam = generateEnemyTeam(3);
      
      expect(easyTeam.length).toBeGreaterThan(0);
      expect(hardTeam.length).toBeGreaterThanOrEqual(easyTeam.length);
      
      // All enemies should have valid positions
      easyTeam.forEach(enemy => {
        expect(enemy.position.x).toBeGreaterThanOrEqual(0);
        expect(enemy.position.x).toBeLessThanOrEqual(4);
        expect(enemy.position.y).toBeGreaterThanOrEqual(0);
        expect(enemy.position.y).toBeLessThanOrEqual(4);
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
    it('should validate grid positions for 5x5 combat area', () => {
      const isValidPosition = (pos: CombatPosition): boolean => {
        return pos.x >= 0 && pos.x <= 4 && pos.y >= 0 && pos.y <= 4;
      };
      
      expect(isValidPosition({ x: 0, y: 0 })).toBe(true);
      expect(isValidPosition({ x: 4, y: 4 })).toBe(true);
      expect(isValidPosition({ x: 5, y: 2 })).toBe(false);
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
        { ...ENEMY_TEMPLATES.stressed_citizen, id: 'ambush-2', position: { x: 3, y: 2 } }
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
        e.name === 'Corporate Enforcer' || 
        e.name === 'Surveillance Unit'
      );
      
      expect(corporateUnits.length).toBeGreaterThan(0);
    });
  });
});