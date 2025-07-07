# WHIX Game Pixel Art Style Guide

## Theme & Aesthetic
The WHIX game uses a **Cyberpunk Pixel Art** aesthetic that combines:
- Dystopian near-future setting (2045)
- Neon-lit cityscapes
- Gritty urban environments
- Corporate oppression themes
- Neurodivergent empowerment

## Visual Style Guidelines

### Resolution & Scale
- **Base Sprite Size**: 32x32 pixels for characters
- **Tile Size**: 16x16 pixels for environment
- **UI Elements**: 16x16 or 32x32 pixels
- **Display Scale**: 2x-4x depending on screen size
- **Pixel-Perfect Rendering**: Always use integer scaling

### Color Palette
```
PRIMARY COLORS:
- Cyan:         #00FFFF (Whix corporate color)
- Purple:       #9D4EDD (Neurodivergent abilities)
- Pink:         #FF006E (Rebellion/resistance)
- Yellow:       #FFBE0B (Currency/rewards)

ENVIRONMENT:
- Asphalt:      #2C2C2C
- Concrete:     #4A4A4A  
- Dark Glass:   #1A3A4A
- Neon Glow:    #FF00FF

ACCENT COLORS:
- Neon Green:   #39FF14 (Success/positive)
- Electric Blue: #0077FF (Technology)
- Hot Pink:     #FF1493 (Special abilities)
- Warning Red:  #FF4444 (Danger/low humanity)

NEUTRALS:
- Black:        #0A0A0A
- Dark Gray:    #1A1A1A
- Medium Gray:  #404040
- Light Gray:   #808080
- Off-White:    #F0F0F0
```

### Character Design

#### Partner Classes Visual Traits
1. **Courier** (Speed/Agility)
   - Streamlined design
   - Running pose emphasis
   - Light armor/clothing
   - Speed lines effects

2. **Analyst** (Pattern Recognition)
   - Glasses or visor
   - Data pad/tablet
   - Analytical pose
   - Holographic UI elements

3. **Negotiator** (Social)
   - Professional attire
   - Confident stance
   - Communication device
   - Charisma aura effect

4. **Specialist** (Focus)
   - Tool belt/equipment
   - Concentrated expression
   - Precision tools
   - Focus beam effect

5. **Investigator** (Perception)
   - Detective coat
   - Magnifying device
   - Observant pose
   - Scanning effect

#### Neurodivergent Trait Visual Indicators
- **Hyperfocus**: Tunnel vision effect, concentrated aura
- **Pattern Recognition**: Grid overlay, connection lines
- **Enhanced Senses**: Sensory waves, expanded perception radius
- **Systematic Thinking**: Flowchart projections, organized UI
- **Attention to Detail**: Highlight markers, zoom indicators
- **Routine Mastery**: Path indicators, efficiency meters
- **Sensory Processing**: Filter effects, sensory shields

### Environment Art

#### Dystopian City Elements
- Tall corporate buildings with Whix logos
- Neon signs and advertisements
- Rain-slicked streets
- Delivery drones in background
- Surveillance cameras
- Holographic barriers
- Corporate checkpoints

#### Lighting & Atmosphere
- Heavy use of neon lighting
- Dark base with bright accents
- Rain and fog effects
- Reflective puddles
- Flickering lights
- Corporate holograms

### Animation Guidelines

#### Frame Counts
- **Idle**: 4 frames
- **Walk**: 4-6 frames
- **Run**: 4-6 frames
- **Attack**: 3-5 frames
- **Special Ability**: 6-8 frames
- **Hurt**: 2-3 frames
- **Victory**: 4-6 frames

#### Animation Principles
- Keep movements snappy
- Exaggerate key poses
- Use smear frames for fast actions
- Add secondary animations (hair, clothes)
- Include particle effects for abilities

### UI/UX Pixel Art

#### HUD Elements
- Humanity Index meter (gradient from green to red)
- Tip counter with coin animation
- Company Stars display
- Partner health/energy bars
- Ability cooldown indicators

#### Menu Design
- Cyberpunk terminal aesthetic
- Glitch effects on hover
- Neon borders and accents
- Monospace fonts for data
- Holographic projections

### Asset Organization

```
/public/assets/
├── sprites/
│   ├── partners/
│   │   ├── courier/
│   │   ├── analyst/
│   │   ├── negotiator/
│   │   ├── specialist/
│   │   └── investigator/
│   ├── enemies/
│   │   ├── corporate_security/
│   │   ├── rogue_ai/
│   │   └── rival_couriers/
│   ├── npcs/
│   │   ├── clients/
│   │   ├── civilians/
│   │   └── resistance/
│   └── effects/
│       ├── abilities/
│       ├── combat/
│       └── environmental/
├── tiles/
│   ├── city/
│   ├── indoor/
│   └── special/
├── ui/
│   ├── hud/
│   ├── menus/
│   └── icons/
└── backgrounds/
    ├── city_layers/
    └── indoor_scenes/
```

### Technical Requirements

#### Sprite Sheets
- Use power-of-2 dimensions (256x256, 512x512, etc.)
- Pack sprites efficiently
- Include JSON metadata for animations
- Maintain consistent spacing/padding

#### File Formats
- **Sprites**: PNG with transparency
- **Backgrounds**: PNG or JPEG for large images
- **Animations**: Sprite sheet + JSON definition
- **Icons**: SVG for scalability, PNG for pixel art

### Narrative Integration

The pixel art should reinforce the game's themes:
- **Corporate Oppression**: Whix logos everywhere, surveillance, sterile corporate areas
- **Neurodiversity**: Unique visual effects for each trait, celebration of differences
- **Humanity vs Machine**: Organic elements contrasting with tech, humanity meter visual importance
- **Resistance**: Hidden symbols, underground aesthetic, rebellion graffiti

### Quality Checklist

Before finalizing any pixel art asset:
- [ ] Matches color palette
- [ ] Consistent pixel density
- [ ] Clean edges (no unintended anti-aliasing)
- [ ] Readable at intended scale
- [ ] Animations loop smoothly
- [ ] Fits cyberpunk aesthetic
- [ ] Reinforces narrative themes
- [ ] Optimized file size

### Inspiration & References
- Blade Runner's neon-noir aesthetic
- Cyberpunk 2077's urban dystopia
- VA-11 Hall-A's pixel art style
- Hyper Light Drifter's color usage
- Papers Please's oppressive atmosphere