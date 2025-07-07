---
id: "industrial-district-hub"
type: "map"
title: "Industrial District Hub"
description: "The heart of Neo Prosperity's manufacturing zone, now a battlefield between workers and corporate enforcers"
zone: "industrial"
size:
  width: 20
  height: 20
gridType: "square"
obstacles:
  - x: 5
    y: 5
    type: "wall"
    destructible: false
  - x: 6
    y: 5
    type: "wall"
    destructible: false
  - x: 7
    y: 5
    type: "wall"
    destructible: false
  - x: 10
    y: 10
    type: "cover"
    destructible: true
  - x: 15
    y: 15
    type: "hazard"
    destructible: false
spawnPoints:
  - x: 2
    y: 2
    type: "player"
  - x: 18
    y: 18
    type: "enemy"
    id: "enforcer_spawn_1"
  - x: 10
    y: 18
    type: "enemy"
    id: "enforcer_spawn_2"
  - x: 10
    y: 2
    type: "ally"
    id: "striker_spawn"
  - x: 10
    y: 10
    type: "objective"
    id: "supply_drop"
environmentalEffects:
  - type: "toxic"
    intensity: 0.3
    area: "zone"
    zones:
      - x: 15
        y: 15
        radius: 3
  - type: "rain"
    intensity: 0.7
    area: "global"
interactables:
  - x: 5
    y: 10
    type: "terminal"
    id: "security_override"
    requiresTrait: "systematic_thinking"
  - x: 15
    y: 5
    type: "door"
    id: "emergency_exit"
    requiresItem: "keycard_red"
  - x: 8
    y: 8
    type: "npc"
    id: "injured_worker"
  - x: 12
    y: 12
    type: "item"
    id: "medical_supplies"
  - x: 3
    y: 17
    type: "trigger"
    id: "alarm_system"
tags: ["combat_map", "story_location", "environmental_hazards", "multi_path"]
published: true
---

# Industrial District Hub

## Map Overview

The Industrial District Hub represents the decaying heart of Neo Prosperity's manufacturing sector. Once a symbol of prosperity, it's now a maze of abandoned machinery, toxic runoff, and desperate workers fighting for survival.

This map serves as both a combat arena and a story location, with multiple missions taking place in its corroded corridors.

## Environmental Storytelling

### The Factory Floor
The main area is littered with abandoned manufacturing equipment. Conveyor belts that once produced consumer goods now serve as elevated pathways for tactical advantage. Partners with enhanced perception can spot:
- Weak floor panels that collapse under enemies
- Steam vents that provide concealment
- Electrical panels that can be overloaded for area damage

### The Toxic Zone
The southeast quadrant glows with sickly green chemical runoff from WHIX's "cost-efficient" waste disposal. This area deals damage over time but contains valuable salvage for those brave enough to enter. Partners with sensory processing differences might actually navigate it better, as they're less overwhelmed by the visual distortion.

### Worker Camps
Makeshift shelters in the northwest show where striking workers have set up camp. These provide:
- Cover during firefights
- Healing stations (if you've earned worker trust)
- Intel on enforcer patrol patterns

## Tactical Considerations

### Multiple Approach Paths
- **Direct Route**: Straight through the center, high risk/high reward
- **Stealth Path**: Along the western wall, requires avoiding alarm triggers
- **Technical Route**: Through the maintenance tunnels (terminal access required)
- **Social Route**: Blend with workers if wearing appropriate disguise

### Height Advantages
- Catwalks at height level 2 provide sniping positions
- Ground level has more cover but limited sight lines
- Underground maintenance tunnels offer secret movement

### Environmental Hazards as Weapons
Creative partners can:
- Lure enemies into toxic zones
- Trigger industrial accidents
- Use rain for electrical attacks
- Collapse unstable structures

## Mission Variations

### "Supply Run" Configuration
- Objective spawns at center
- Enemy reinforcements from south
- 5-turn extraction timer
- Weather: Heavy rain (reduces visibility)

### "Sabotage" Configuration
- Multiple terminal objectives
- Patrol patterns active
- Stealth bonuses applied
- Weather: Fog (enhances stealth)

### "Last Stand" Configuration
- Defend worker camp (northwest)
- Waves of enemies from all spawn points
- Environmental hazards increase over time
- Weather: Toxic storm (everyone takes periodic damage)

## Partner Ability Synergies

### Hyperfocus + Industrial Setting
Partners with hyperfocus can identify optimal routes through the machinery maze, finding paths others miss.

### Enhanced Senses + Environmental Hazards
The toxic zone's sensory overload affects neurotypical characters more severely. Neurodivergent partners with different sensory processing can navigate it more effectively.

### Pattern Recognition + Enemy Spawns
Enforcement squads follow Algorithm-determined patterns. Partners who recognize these patterns can predict spawn locations and patrol routes.

### Systematic Thinking + Terminal Puzzles
Security terminals require specific thought patterns to hack. What seems like random code to others forms clear patterns for systematic thinkers.

## Hidden Elements

### The Foreman's Office
Behind a locked door (keycard required) lies evidence of WHIX's illegal waste dumping. Finding this unlocks the "Whistleblower" storyline.

### Underground Railroad Cache
A hidden weapons cache maintained by the resistance. Requires completing the "Trust Building" mission with workers.

### The Memorial
A makeshift memorial to workers who died in industrial "accidents." Interacting with it provides:
- +10 Humanity
- Backstory for the worker's rights subplot
- Possible recruitment of survivor NPC

## Dynamic Events

Based on player choices and game state:

### If Humanity > 70
- Workers provide covering fire
- Additional healing stations activate
- Secret paths revealed

### If Corporate Reputation High
- Fewer enforcers spawn
- Access to corporate supply drops
- Alarm systems pre-disabled

### If Chaos Level Critical
- Environmental hazards intensify
- Civilian NPCs flee (moral choices removed)
- Elite enforcer units deploy

## Developer Commentary

This map embodies WHIX's core themes:
1. **Environmental Destruction**: The toxic waste represents corporate disregard for human life
2. **Worker Exploitation**: The camp shows those fighting back
3. **Neurodivergent Advantages**: Map design rewards different thinking patterns
4. **Moral Complexity**: Players choose between easy corporate paths and difficult moral ones

The industrial setting also provides natural tutorialization for environmental interaction mechanics while maintaining narrative coherence.

## Audio Design Notes

- Ambient: Industrial hum, distant machinery, dripping chemicals
- Combat: Echoing gunfire, steam hisses, metal clangs
- Environmental: Worker chants, enforcer radio chatter, alarm klaxons
- Weather: Rain on metal, toxic bubbling, electrical sparks