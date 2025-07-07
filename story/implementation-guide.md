# WHIX Narrative Implementation Guide

## Overview
This guide explains how to integrate the rich narrative content into the game's systems.

## File Structure

### Markdown Files (story/)
- **encounters/** - Detailed encounter designs
- **characters/** - Character backstories and arcs
- **items/** - Item descriptions and lore
- **lore/** - World-building documents
- **puzzles/** - Puzzle mechanics explanations

### TypeScript Files (lib/game/story/)
- **encounters.ts** - Encounter system and state management
- **items.ts** - Item definitions and interactions
- **extendedDialogue.ts** - Complex dialogue trees
- **narrativeIntegration.ts** - Central narrative manager

## Integration Points

### 1. Random Encounters
```typescript
// In game loop or mission page
import { narrativeManager } from '@/lib/game/story/narrativeIntegration';

const checkForEncounter = () => {
  const encounter = narrativeManager.checkEncounterTriggers(
    playerState,
    currentLocation,
    timeElapsed
  );
  
  if (encounter) {
    // Trigger encounter UI
    showEncounterModal(encounter);
  }
};
```

### 2. Humanity Index Display
```typescript
// Add to dashboard or HUD
const HumanityIndexDisplay = () => {
  const humanityIndex = narrativeManager.humanityIndex.current;
  const stage = getHumanityStage(humanityIndex);
  
  return (
    <div className={`humanity-indicator ${stage}`}>
      <span>Humanity: {humanityIndex}</span>
      <span className="stage">{stage}</span>
    </div>
  );
};
```

### 3. Item Integration
```typescript
// In inventory system
import { SURVIVAL_ITEMS, SPECIAL_ITEMS } from '@/lib/game/story/items';

const processItemUse = (itemId: string, target?: string) => {
  const item = getAllItems()[itemId];
  
  // Check special interactions
  if (item.specialInteractions && target) {
    const interaction = findInteraction(itemId, target);
    if (interaction) {
      processSpecialInteraction(interaction);
    }
  }
  
  // Apply effects
  item.effects.forEach(effect => {
    applyItemEffect(effect);
  });
};
```

### 4. Temporal Puzzle Integration
```typescript
// In dialogue or puzzle scenes
const TemporalDialogue = ({ npc, playerTime }) => {
  const npcTime = npc.temporalOffset; // -13, 0, or +13 minutes
  const [synchronized, setSynchronized] = useState(false);
  
  const checkSynchronization = () => {
    if (Math.abs(playerTime - npcTime) < 60) { // Within 1 minute
      setSynchronized(true);
      unlockTrueDialogue();
    }
  };
  
  return (
    <div className={`dialogue-box ${synchronized ? 'golden-glow' : ''}`}>
      {/* Render time-shifted dialogue */}
    </div>
  );
};
```

## Key Narrative Mechanics

### 1. The Old Timer's Appearances
- Trigger every 13 minutes of real gameplay time
- Each encounter advances his story
- Pattern Recognition trait reveals his spawn pattern
- Collecting all temporal fragments unlocks true dialogue

### 2. Mateo's Birthday Loop
- Occurs in the same location every run
- Three paths: Force, Negotiate, Kindness
- Cake quest requires 47 tips investment
- Rewards scale with humanity index

### 3. Tania's Transformation
- Story progresses through 5 stages
- Combat encounter changes based on previous choices
- Items with sentimental value cause glitches
- 13-second windows of humanity

### 4. The Algorithm's Evolution
- Learns from player behavior
- Difficulty adapts to optimization level
- Irrational kindness creates exploits
- Collective action breaks predictions

## Humanity Index Guidelines

### Gaining Humanity
- Help without expectation (+5 to +15)
- Refuse profitable cruelty (+10)
- Share resources (+5 to +20)
- Bring Mateo his cake (+10)
- Listen to others' stories (+5)

### Losing Humanity
- Optimize over people (-5 to -10)
- Use exploits that harm others (-10 to -20)
- Accept corporate upgrades (-25)
- Betray partner trust (-15)
- Ignore suffering (-5)

### Threshold Effects
- **< -50**: Soulless - Unlock corporate paths, lose emotional dialogue
- **-50 to 0**: Struggling - Normal gameplay, some options locked
- **0 to 50**: Human - Balanced choices available
- **50 to 80**: Compassionate - Community support, mutual aid unlocked
- **> 80**: Saint - Hidden paths revealed, true ending possible

## Implementation Priorities

### Phase 1: Core Systems
1. Humanity Index tracking
2. Basic encounter triggers
3. Item system with effects
4. Simple dialogue choices

### Phase 2: Complex Narratives
1. Temporal puzzles
2. Multi-stage encounters
3. Relationship tracking
4. Story progression flags

### Phase 3: Advanced Features
1. Algorithm adaptation
2. Collective action mechanics
3. Multiple ending paths
4. New Game+ with retained knowledge

## Testing Considerations

### Narrative Coherence
- Ensure encounters don't contradict
- Track all possible state combinations
- Test all trait-specific paths

### Balance
- Humanity gains vs losses
- Reward scaling with difficulty
- Time investment vs payoff

### Emotional Impact
- Pacing of revelations
- Character arc completion
- Player agency in outcomes

## Notes for Writers

### Adding New Encounters
1. Create markdown file in story/encounters/
2. Define encounter in encounters.ts
3. Add trigger conditions to narrativeIntegration.ts
4. Create dialogue nodes if needed
5. Test all choice branches

### Writing Guidelines
- Show systemic oppression through personal stories
- Celebrate neurodivergent traits authentically
- Balance hope with harsh reality
- Every choice should matter
- No "correct" path, only consequences

---

*"The story isn't in the files—it's in how players discover them."*