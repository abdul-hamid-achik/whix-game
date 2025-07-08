# WHIX Game Test Coverage Documentation

## Overview

This document provides a comprehensive overview of the test suite for the WHIX game project. All tests have been updated to reflect the current Soviet-Aztec themed implementation with proper TypeScript types and Zod schema validation.

## Test Structure

```
test/
├── __tests__/
│   ├── cms/                    # Content Management System tests
│   │   ├── contentLoader.test.ts
│   │   └── content-integration.test.ts
│   ├── game/                   # Game logic tests
│   │   ├── combat.test.ts
│   │   ├── humanityIndex.test.ts
│   │   ├── mapExploration.test.ts
│   │   ├── partnerGenerator.test.ts
│   │   └── skinGacha.test.ts
│   ├── hooks/                  # React hooks tests
│   │   ├── useGameStateTransition.test.ts
│   │   └── useKeyboardNavigation.test.ts
│   ├── stores/                 # Zustand store tests
│   │   ├── gameStore.test.ts
│   │   ├── missionStore.test.ts
│   │   ├── partnerStore.test.ts
│   │   ├── storyStore.test.ts
│   │   └── uiStore.test.ts
│   └── systems/                # Game systems tests
│       ├── arena-system.test.ts
│       ├── keyboard-navigation-system.test.ts
│       └── random-event-system.test.ts
├── setup.ts                    # Test setup and mocks
└── TEST_COVERAGE.md           # This file
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test path/to/test.test.ts

# Run tests matching pattern
npm test -- -t "pattern"
```

## Test Coverage Areas

### 1. Store Tests

#### UIStore (`uiStore.test.ts`)
- ✅ Game state management and transitions
- ✅ Loading states with messages
- ✅ Notification system (add, remove, clear)
- ✅ Modal management (open, close, close all)
- ✅ Context menu functionality
- ✅ Settings management (theme, font size, volumes)
- ✅ Accessibility settings (color blind mode, UI scaling)
- ✅ Key bindings management
- ✅ Auto-save configuration
- ✅ Batch settings updates

#### GameStore (`gameStore.test.ts`)
- ✅ Player initialization and management
- ✅ Humanity index tracking with bounds
- ✅ Partner system with neurodivergent traits
- ✅ Bond level progression
- ✅ Mission system with WHIX tip calculations
- ✅ Inventory management (dystopian items only)
- ✅ Story progression and chapter unlocking
- ✅ Relationship tracking with factions
- ✅ Location system (Polanco districts)
- ✅ Game flags and choice tracking
- ✅ Save/load functionality

#### PartnerStore (`partnerStore.test.ts`)
- ✅ Partner roster management
- ✅ Active partner selection with limits
- ✅ Partner stats and leveling
- ✅ Experience and auto-leveling
- ✅ Energy and injury status
- ✅ Equipment management
- ✅ Trait mastery progression
- ✅ Partner-specific inventory
- ✅ Gacha system with pity counter
- ✅ Utility functions (filter by class, rarity, etc.)

#### MissionStore (`missionStore.test.ts`)
- ✅ Mission lifecycle (add, start, complete, fail, abandon)
- ✅ Objective tracking and progress
- ✅ Mission requirements validation
- ✅ Daily and weekly mission management
- ✅ Expired mission cleanup
- ✅ Mission filtering (type, difficulty, location)
- ✅ Mission history and statistics
- ✅ Special event missions

#### StoryStore (`storyStore.test.ts`)
- ✅ Chapter management and progression
- ✅ Story choices with consequences
- ✅ Story flags system
- ✅ Relationship tracking
- ✅ Humanity index with level descriptions
- ✅ Dialogue system with history
- ✅ Story state queries
- ✅ Import/export functionality

### 2. System Tests

#### KeyboardNavigationSystem (`keyboard-navigation-system.test.ts`)
- ✅ Hotkey registration and unregistration
- ✅ Game state-based hotkey filtering
- ✅ Focus trap management for modals
- ✅ ARIA announcements for accessibility
- ✅ Default hotkey configuration
- ✅ Enable/disable functionality
- ✅ SSR compatibility checks

#### RandomEventSystem (`random-event-system.test.ts`)
- ✅ Event generation based on context
- ✅ Requirement filtering (chapter, location, time)
- ✅ Story flag requirements
- ✅ Partner trait personalization
- ✅ Event type and rarity filtering
- ✅ Weight-based selection
- ✅ Soviet-Aztec theme validation
- ✅ Choice outcome structures

#### ArenaSystem (`arena-system.test.ts`)
- ✅ Opponent generation by difficulty
- ✅ Team composition and balance
- ✅ Rarity distribution by difficulty
- ✅ Stat multiplier application
- ✅ Match simulation with strategies
- ✅ Highlight generation
- ✅ Reward calculation
- ✅ Season management
- ✅ Rating system
- ✅ Theme consistency

### 3. Hook Tests

#### useKeyboardNavigation (`useKeyboardNavigation.test.ts`)
- ✅ Hook initialization
- ✅ Default hotkey registration
- ✅ Game state synchronization
- ✅ Enable/disable functionality
- ✅ Accessibility announcements
- ✅ Focus trap creation/removal
- ✅ Cleanup on unmount
- ✅ Navigation handlers
- ✅ Settings toggles

#### useGameStateTransition (`useGameStateTransition.test.ts`)
- ✅ State transition handling
- ✅ Animation control
- ✅ Loading states
- ✅ Transition callbacks
- ✅ Quick transitions
- ✅ State checking utilities
- ✅ Back navigation
- ✅ Transition type selection
- ✅ Error handling
- ✅ Concurrent transition handling

### 4. Game Logic Tests

#### Combat System (`combat.test.ts`)
- ✅ Turn-based combat flow
- ✅ Ability usage and cooldowns
- ✅ Damage calculations
- ✅ Status effects
- ✅ Victory/defeat conditions

#### Humanity Index (`humanityIndex.test.ts`)
- ✅ Index calculations
- ✅ Choice impacts
- ✅ Threshold effects
- ✅ Story branching

#### Partner Generator (`partnerGenerator.test.ts`)
- ✅ Random partner creation
- ✅ Trait distribution
- ✅ Stat generation
- ✅ Personality creation

#### Map Exploration (`mapExploration.test.ts`)
- ✅ Location discovery
- ✅ Movement validation
- ✅ Event triggers
- ✅ Resource discovery

#### Skin Gacha (`skinGacha.test.ts`)
- ✅ Gacha mechanics
- ✅ Rarity probabilities
- ✅ Pity system
- ✅ Duplicate handling

### 5. CMS Tests

#### Content Loader (`contentLoader.test.ts`)
- ✅ Markdown parsing
- ✅ Content validation
- ✅ Schema compliance
- ✅ File loading

#### Content Integration (`content-integration.test.ts`)
- ✅ Content relationships
- ✅ Cross-references
- ✅ Content availability
- ✅ Dynamic loading

## Key Testing Patterns

### 1. Zod Schema Validation
All tests validate data using proper Zod schemas instead of type assertions:
```typescript
const missionSchema = MissionSchema.parse(missionData);
expect(() => MissionSchema.parse(invalidData)).toThrow();
```

### 2. Soviet-Aztec Theme Validation
Tests ensure no fantasy elements appear:
```typescript
expect(item.name).not.toContain('sword');
expect(location).not.toContain('castle');
expect(description).toMatch(/WHIX|corporate|courier|Polanco/);
```

### 3. Accessibility Testing
All interactive systems include accessibility tests:
```typescript
expect(element).toHaveAttribute('aria-label');
expect(announcement).toBe('Action completed');
```

### 4. State Management Testing
Zustand stores are tested with proper state resets:
```typescript
beforeEach(() => {
  useStore.setState(initialState);
});
```

### 5. Async Operation Testing
Proper handling of promises and timers:
```typescript
await waitFor(() => expect(result).toBeDefined());
vi.useFakeTimers();
vi.runAllTimers();
```

## Mocking Strategy

### Common Mocks
- `next/navigation` - Router functionality
- `hotkeys-js` - Keyboard shortcuts
- `framer-motion` - Animation components
- Window APIs - matchMedia, IntersectionObserver, ResizeObserver
- Document APIs - For SSR compatibility

### Test Setup
All tests use a common setup file (`test/setup.ts`) that:
- Configures React Testing Library
- Sets up DOM mocks
- Provides navigation mocks
- Handles cleanup between tests

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

Run `npm run test:coverage` to generate a detailed coverage report.

## Best Practices

1. **Test Isolation**: Each test is completely independent
2. **Descriptive Names**: Tests clearly describe what they verify
3. **Arrange-Act-Assert**: Consistent test structure
4. **Mock Minimally**: Only mock external dependencies
5. **Test Behavior**: Focus on user-facing functionality
6. **Theme Consistency**: Verify Soviet-Aztec theme throughout

## Continuous Integration

Tests are configured to run in CI/CD pipelines with:
- Pre-commit hooks for affected tests
- Full test suite on pull requests
- Coverage reports on main branch
- Performance benchmarks for critical paths

## Future Test Additions

As new features are added, ensure tests cover:
- Mobile/tablet responsive behavior
- Advanced visual effects rendering
- Loading screen sequences
- Corporate login simulation
- Real-time multiplayer features (if added)
- WebSocket connections (if added)
- Payment processing (Stripe integration)