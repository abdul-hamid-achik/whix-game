import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '@/lib/stores/gameStore';
import { Character, Partner, Mission, InventoryItem, Chapter } from '@/lib/types/game';

// Mock Zustand
vi.mock('zustand', async () => {
  const actualZustand = await vi.importActual('zustand');
  return {
    ...actualZustand,
    create: vi.fn((stateCreator: any) => {
      const { create } = actualZustand as any;
      return create(stateCreator);
    })
  };
});

describe('GameStore - Polanco Theme', () => {
  beforeEach(() => {
    // Reset store to initial state
    useGameStore.setState({
      player: null,
      partners: [],
      inventory: [],
      missions: [],
      currentChapter: null,
      currentMission: null,
      currentLocation: 'polanco-central',
      humanityIndex: 50,
      tips: 0,
      stats: {
        missionsCompleted: 0,
        totalTipsEarned: 0,
        choicesMade: 0,
        partnersRecruited: 0,
      },
      relationships: {},
      flags: {},
      unlockedChapters: ['chapter-1-first-day'],
      unlockedLocations: ['polanco-central'],
    });
  });

  describe('Player Management', () => {
    it('should initialize player as WHIX courier', () => {
      const mockPlayer: Character = {
        id: 'player-001',
        name: 'Test Courier',
        role: 'protagonist',
        class: 'courier',
        traits: ['hyperfocus', 'pattern_recognition'],
        stats: {
          focus: 75,
          perception: 70,
          social: 60,
          logic: 65,
          stamina: 70
        },
        description: 'New WHIX courier in Polanco',
        backstory: 'Forced into gig economy after corporate downsizing',
        relationships: {},
        avatarUrl: '/avatars/courier.png'
      };

      useGameStore.getState().initializePlayer(mockPlayer);
      
      const state = useGameStore.getState();
      expect(state.player).toEqual(mockPlayer);
      expect(state.player?.class).toBe('courier');
      expect(state.currentLocation).toBe('polanco-central');
    });

    it('should track humanity changes from corporate exploitation', () => {
      const store = useGameStore.getState();
      
      // Accept exploitative WHIX terms
      store.updateHumanity(-10);
      expect(store.humanityIndex).toBe(40);
      
      // Help fellow couriers
      store.updateHumanity(15);
      expect(store.humanityIndex).toBe(55);
      
      // Humanity should be capped at 0-100
      store.updateHumanity(-100);
      expect(store.humanityIndex).toBe(0);
      
      store.updateHumanity(200);
      expect(store.humanityIndex).toBe(100);
    });
  });

  describe('Partner System', () => {
    it('should add neurodivergent partners with proper traits', () => {
      const mockPartner: Partner = {
        id: 'partner-kai',
        name: 'Kai Chen',
        class: 'analyst',
        primaryTrait: 'pattern_recognition',
        secondaryTrait: 'systematic_thinking',
        level: 3,
        experience: 250,
        rarity: 'rare',
        stats: {
          focus: 85,
          perception: 90,
          social: 50,
          logic: 95,
          stamina: 55
        },
        currentEnergy: 80,
        maxEnergy: 100,
        bondLevel: 2,
        backstory: 'Data analyst who sees patterns in WHIX algorithm',
        joinedAt: 'chapter-1'
      };

      useGameStore.getState().addPartner(mockPartner);
      
      const partners = useGameStore.getState().partners;
      expect(partners).toHaveLength(1);
      expect(partners[0].primaryTrait).toBe('pattern_recognition');
      expect(partners[0].class).toBe('analyst');
      
      // Verify traits are neurodivergent-themed, not fantasy
      expect(['hyperfocus', 'pattern_recognition', 'enhanced_senses', 'systematic_thinking'])
        .toContain(partners[0].primaryTrait);
    });

    it('should update partner bond through shared experiences', () => {
      const partner: Partner = {
        id: 'partner-001',
        name: 'Test Partner',
        class: 'courier',
        primaryTrait: 'hyperfocus',
        secondaryTrait: 'enhanced_senses',
        level: 1,
        experience: 0,
        rarity: 'common',
        stats: { focus: 70, perception: 65, social: 55, logic: 60, stamina: 75 },
        currentEnergy: 100,
        maxEnergy: 100,
        bondLevel: 1,
        backstory: 'Fellow courier surviving the gig economy',
        joinedAt: 'chapter-1'
      };

      useGameStore.getState().addPartner(partner);
      
      // Complete delivery mission together
      useGameStore.getState().updatePartnerBond('partner-001', 1);
      
      const updatedPartner = useGameStore.getState().partners[0];
      expect(updatedPartner.bondLevel).toBe(2);
    });
  });

  describe('Mission System', () => {
    it('should handle WHIX delivery missions', () => {
      const mockMission: Mission = {
        id: 'delivery-001',
        title: 'Rush Delivery to Corporate District',
        description: 'Deliver package through heavy surveillance zone',
        type: 'delivery',
        objectives: [
          {
            id: 'obj-1',
            description: 'Pick up package from underground market',
            completed: false,
            optional: false
          },
          {
            id: 'obj-2',
            description: 'Avoid corporate surveillance',
            completed: false,
            optional: true
          }
        ],
        rewards: {
          tips: 200, // Before WHIX 75% cut
          items: ['enhanced-scanner'],
          experience: 100
        },
        requirements: {
          level: 2,
          traits: ['enhanced_senses']
        },
        timeLimit: '30 minutes',
        location: 'polanco-corporate',
        difficultyRating: 3,
        storyImpact: 'Increases corporate suspicion'
      };

      useGameStore.getState().addMission(mockMission);
      useGameStore.getState().startMission('delivery-001');
      
      const state = useGameStore.getState();
      expect(state.currentMission?.id).toBe('delivery-001');
      expect(state.missions[0].type).toBe('delivery');
      
      // Complete mission and check tip calculation (25% after WHIX cut)
      useGameStore.getState().completeMission('delivery-001');
      expect(state.tips).toBe(50); // 200 * 0.25 = 50
      expect(state.stats.missionsCompleted).toBe(1);
    });

    it('should track different mission types in Polanco', () => {
      const missionTypes = ['delivery', 'investigation', 'sabotage', 'rescue', 'intel'];
      
      missionTypes.forEach((type, index) => {
        const mission: Mission = {
          id: `mission-${index}`,
          title: `${type} mission`,
          description: `A ${type} mission in Polanco`,
          type: type as any,
          objectives: [],
          rewards: { tips: 100, items: [], experience: 50 },
          requirements: {},
          location: 'polanco-central',
          difficultyRating: 2
        };
        
        useGameStore.getState().addMission(mission);
      });
      
      const missions = useGameStore.getState().missions;
      expect(missions).toHaveLength(5);
      
      // Verify no fantasy mission types
      missions.forEach(m => {
        expect(m.type).not.toBe('dragon_slaying');
        expect(m.type).not.toBe('dungeon_crawl');
        expect(m.location).toContain('polanco');
      });
    });
  });

  describe('Inventory Management', () => {
    it('should manage dystopian delivery equipment', () => {
      const deliveryItems: InventoryItem[] = [
        {
          id: 'scanner-001',
          itemId: 'basic-scanner',
          name: 'WHIX Standard Scanner',
          quantity: 1,
          category: 'equipment',
          equipped: true
        },
        {
          id: 'stim-001',
          itemId: 'energy-stim',
          name: 'Corporate-Grade Stimulant',
          quantity: 5,
          category: 'consumable',
          equipped: false
        }
      ];

      deliveryItems.forEach(item => {
        useGameStore.getState().addItemToInventory(item);
      });
      
      const inventory = useGameStore.getState().inventory;
      expect(inventory).toHaveLength(2);
      
      // Verify items are dystopian-themed
      inventory.forEach(item => {
        expect(item.name).not.toContain('sword');
        expect(item.name).not.toContain('potion');
        expect(item.name).not.toContain('armor');
        expect(['equipment', 'consumable', 'key_item', 'data']).toContain(item.category);
      });
    });

    it('should handle item usage in gig economy context', () => {
      const energyStim: InventoryItem = {
        id: 'stim-001',
        itemId: 'energy-stim',
        name: 'Budget Energy Drink',
        quantity: 3,
        category: 'consumable',
        equipped: false
      };

      useGameStore.getState().addItemToInventory(energyStim);
      
      // Use item
      useGameStore.getState().updateItemQuantity('stim-001', -1);
      
      const item = useGameStore.getState().inventory[0];
      expect(item.quantity).toBe(2);
      
      // Remove when depleted
      useGameStore.getState().updateItemQuantity('stim-001', -2);
      expect(useGameStore.getState().inventory).toHaveLength(0);
    });
  });

  describe('Story Progression', () => {
    it('should track Polanco story chapters', () => {
      const mockChapter: Chapter = {
        id: 'chapter-2-corporate-pressure',
        title: 'Chapter 2: Corporate Pressure',
        chapterNumber: 2,
        description: 'WHIX tightens control as resistance grows',
        setting: 'WHIX Corporate Tower',
        act: 1,
        published: true
      };

      useGameStore.getState().setCurrentChapter(mockChapter);
      useGameStore.getState().unlockChapter('chapter-2-corporate-pressure');
      
      const state = useGameStore.getState();
      expect(state.currentChapter?.id).toBe('chapter-2-corporate-pressure');
      expect(state.unlockedChapters).toContain('chapter-2-corporate-pressure');
      expect(state.currentChapter?.setting).toContain('WHIX');
    });

    it('should track relationship changes with Polanco factions', () => {
      const store = useGameStore.getState();
      
      // Help fellow couriers
      store.updateRelationship('courier-collective', 20);
      expect(store.relationships['courier-collective']).toBe(20);
      
      // Anger corporate overlords
      store.updateRelationship('whix-management', -30);
      expect(store.relationships['whix-management']).toBe(-30);
      
      // Build trust with underground resistance
      store.updateRelationship('polanco-resistance', 15);
      expect(store.relationships['polanco-resistance']).toBe(15);
      
      // Verify no fantasy factions
      expect(store.relationships['elven-council']).toBeUndefined();
      expect(store.relationships['mage-guild']).toBeUndefined();
    });
  });

  describe('Location System', () => {
    it('should manage Polanco districts', () => {
      const polancoLocations = [
        'polanco-central',
        'corporate-district',
        'underground-market',
        'residential-blocks',
        'abandoned-warehouse'
      ];

      polancoLocations.forEach(location => {
        useGameStore.getState().unlockLocation(location);
      });
      
      const unlockedLocations = useGameStore.getState().unlockedLocations;
      expect(unlockedLocations.length).toBeGreaterThanOrEqual(5);
      
      // Travel to new location
      useGameStore.getState().setCurrentLocation('underground-market');
      expect(useGameStore.getState().currentLocation).toBe('underground-market');
      
      // Verify no fantasy locations
      unlockedLocations.forEach(loc => {
        expect(loc).not.toContain('castle');
        expect(loc).not.toContain('dungeon');
        expect(loc).not.toContain('tavern');
      });
    });
  });

  describe('Game Flags and Choices', () => {
    it('should track dystopian story choices', () => {
      const store = useGameStore.getState();
      
      // Track important story decisions
      store.setFlag('accepted_whix_terms', true);
      store.setFlag('helped_injured_courier', true);
      store.setFlag('reported_to_corporate', false);
      store.setFlag('joined_resistance', true);
      
      expect(store.flags['accepted_whix_terms']).toBe(true);
      expect(store.flags['joined_resistance']).toBe(true);
      
      // Track choice statistics
      store.incrementChoicesMade();
      store.incrementChoicesMade();
      expect(store.stats.choicesMade).toBe(2);
    });
  });

  describe('Save/Load System', () => {
    it('should serialize game state with Polanco theme intact', () => {
      // Set up game state
      const store = useGameStore.getState();
      store.initializePlayer({
        id: 'player-001',
        name: 'Test Courier',
        role: 'protagonist',
        class: 'courier',
        traits: ['hyperfocus'],
        stats: { focus: 75, perception: 70, social: 60, logic: 65, stamina: 70 },
        description: 'Surviving in Polanco',
        backstory: 'Gig economy survivor',
        relationships: {},
      });
      
      store.updateTips(100);
      store.updateHumanity(10);
      store.setCurrentLocation('underground-market');
      
      // Get save data
      const saveData = store.getSaveData();
      
      expect(saveData.player?.class).toBe('courier');
      expect(saveData.tips).toBe(100);
      expect(saveData.humanityIndex).toBe(60);
      expect(saveData.currentLocation).toBe('underground-market');
      
      // Reset and load
      store.reset();
      expect(store.player).toBeNull();
      
      store.loadSaveData(saveData);
      expect(store.player?.class).toBe('courier');
      expect(store.currentLocation).toBe('underground-market');
    });
  });
});