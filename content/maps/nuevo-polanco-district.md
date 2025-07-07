---
name: "Nuevo Polanco District"
description: "Gated corporate enclave where 'cognitive purity' ideology flourishes behind smart walls"
unlockCondition:
  type: "story_progression"
  value: "white_nationalist_conspiracy_revealed"
atmosphere: |
  Nuevo Polanco gleams with the sterile perfection of algorithmic design. Every street follows optimal traffic patterns. Every building maximizes productivity per square meter. Every resident has been selected for "cognitive compatibility" - a euphemism that barely hides its eugenic intent.
  
  High walls adorned with neural scanners keep out the "cognitively incompatible." Holographic signs proclaim "Efficiency is Evolution" and "Optimize Your Bloodline." The residents, predominantly white executives and their families, move with practiced superiority, their neural interfaces glowing with premium WHIX subscriptions.
  
  Beneath the surface perfection, paranoia breeds. Genetic testing companies advertise "cognitive purity scores." Children are enrolled in "Neural Excellence Academies." And everyone pretends not to notice when neighbors disappear after their children show signs of neurodivergence.
locations:
  - id: "purity-plaza"
    name: "Cognitive Excellence Square"
    description: "Central plaza with monuments to 'evolutionary advancement'"
    features:
      - "Holographic Hall of Achievement - Celebrates 'pure' cognitive performers"
      - "Neural Scanning Arch - Mandatory passage displaying cognitive metrics"
      - "Genetic Heritage Center - Traces 'optimal' bloodlines"
    npcs:
      - "Corporate wives discussing their children's 'optimization scores'"
      - "Business executives comparing cognitive enhancement packages"
      - "Security guards who nervously hide their own test results"
  
  - id: "excellence-academy"
    name: "The Neural Excellence Academy"
    description: "Elite school where children are groomed for cognitive supremacy"
    dark_secrets:
      - "Basement labs where 'defective' children undergo correction"
      - "Teachers who've been neural-harvested for showing empathy"
      - "Student suicides covered up as 'optimization failures'"
    encounters:
      - "Terrified parents hiding their child's ADHD"
      - "Students secretly helping neurodivergent classmates escape"
      - "Academy enforcer squads"
  
  - id: "heritage-homes"
    name: "Pure Line Residences"
    description: "Luxury housing for those with 'verified cognitive heritage'"
    dystopian_elements:
      - "Genetic scanners at every door"
      - "Neighborhood watch reporting 'cognitive anomalies'"
      - "Secret basement networks helping families escape"
    notable_residents:
      - "The Whitmore Family - Public champions of purity, secretly hiding autistic son"
      - "Dr. Helena Krueger - Geneticist who falsifies purity certificates for a price"
      - "James Patterson - Executive who discovered his own neurodivergence"
  
  - id: "productivity-cathedral"
    name: "Church of Optimized Evolution"
    description: "Where prosperity gospel meets genetic superiority"
    leadership: "Bishop Theodore Ashford - Preaches that neurodivergence is sin"
    services:
      - "Genetic Blessing Ceremonies"
      - "Cognitive Purity Baptisms"
      - "Efficiency Eucharist"
    resistance_element: "Underground railroad in the crypts"
  
  - id: "the-white-tower"
    name: "WHIX Executive Headquarters"
    description: "Where the final solution for neurodivergence is planned"
    security: "EXTREME - Neural scanners, genetic locks, cognitive tests"
    key_locations:
      - "Project PURE boardroom"
      - "Cognitive Asset Trading Floor"
      - "Neural Harvest Planning Center"

enemy_types:
  - id: "purity-patrol"
    name: "Cognitive Purity Enforcers"
    description: "Elite security convinced of their genetic superiority"
    traits:
      - "High stats but predictable patterns"
      - "Vulnerable to chaotic thinking"
      - "Equipment fails against 'impure' tactics"
    dialogue: "Your inferior patterns contaminate our district!"
  
  - id: "corporate-supremacist"
    name: "Executive Ideologue"
    description: "Mid-level manager who truly believes in cognitive hierarchy"
    abilities:
      - "Efficiency Aura - Boosts 'pure' allies"
      - "Superiority Complex - Immune to demoralization"
      - "Genetic Rhetoric - Confusion attacks"
    weakness: "Takes extra damage from diverse team compositions"
  
  - id: "heritage-defender"
    name: "Bloodline Protector"
    description: "Wealthy resident defending their 'pure' neighborhood"
    equipment: "Premium WHIX augmentations, private security drones"
    irony: "Often hiding their own family's neurodivergent members"

special_characters:
  - name: "Rebecca Whitmore"
    role: "Reluctant Insider"
    description: |
      Trophy wife whose autistic son opened her eyes to the horror. Publicly maintains appearances while secretly funding escape routes. "They made me choose between my beliefs and my son. It wasn't a choice."
  
  - name: "Dr. Marcus Webb"
    role: "Defector Scientist"
    description: |
      Former lead researcher on Project PURE who discovered neurodivergence in his own brain patterns. Now uses insider knowledge to sabotage the program. "I spent years developing weapons against my own kind."
  
  - name: "Bishop Ashford"
    role: "True Believer"
    description: |
      Genuinely believes neurodivergence is humanity's fall from grace. Sees the neural harvest as rapture for the worthy. "God made man in His image - efficient, optimized, and pure. Deviation is damnation."

hidden_truths:
  - discovery: "Most Nuevo Polanco residents have neurodivergent traits but hide them through expensive treatments"
  - discovery: "The 'pure' bloodlines are fabricated - genetic tests are manipulated for profit"
  - discovery: "WHIX executives plan to harvest Nuevo Polanco last, using residents as breeding stock"
  - discovery: "The white nationalist ideology is a tool - Chen and others mock the believers while exploiting them"

resistance_opportunities:
  - "Expose hidden neurodivergence in prominent families"
  - "Leak evidence of genetic test manipulation"
  - "Help trapped families escape before 'correction'"
  - "Turn believers against WHIX by revealing the exploitation"

moral_complexities:
  - "Some residents are victims of their own ideology, genuinely terrified"
  - "Children raised in supremacist beliefs but showing empathy"
  - "Security guards who enforce rules they don't believe in to feed their families"
  - "Scientists who thought they were curing suffering, not enabling genocide"

district_exclusive_items:
  - name: "Forged Purity Certificate"
    description: "Allows passage through genetic scanners"
  - name: "Executive Override Codes"
    description: "Access to restricted White Tower areas"
  - name: "Cognitive Scrambler"
    description: "Makes neural patterns appear 'pure' temporarily"
  - name: "Project PURE Documents"
    description: "Evidence of the genocide plan"

mission_types:
  - type: "infiltration"
    name: "Sheep Among Wolves"
    description: "Pose as 'pure' to gather intelligence"
    risk: "Constant neural scanning, one slip means exposure"
  
  - type: "rescue"
    name: "Underground Railroad"
    description: "Extract families before 'correction' procedures"
    moral_weight: "Save individuals vs. maintaining cover for larger operation"
  
  - type: "sabotage"
    name: "Corrupting Purity"
    description: "Introduce 'chaos' into their perfect systems"
    method: "Use neurodivergent thinking patterns to break their algorithms"
  
  - type: "exposure"
    name: "The Emperor's New Genes"
    description: "Reveal prominent figures' hidden neurodivergence"
    impact: "Shatter the ideology from within"

environmental_storytelling:
  - "Suicide barriers on Academy buildings painted to look decorative"
  - "Missing person posters quickly removed by maintenance"
  - "Graffiti reading 'MY SON WAS PERFECT' scrubbed but still visible"
  - "Premium therapy centers advertising 'cognitive realignment'"
  - "Children's drawings of families with members scribbled out"
---

# Nuevo Polanco - The Guilded Cage of Supremacy

Nuevo Polanco represents WHIX's ultimate vision: a district where human worth is measured in neural efficiency and genetic "purity." Its gleaming towers hide a concentration camp of the mind.

## The Architecture of Supremacy

Every element reinforces hierarchy:
- Streets named after "cognitive pioneers" (eugenicists rebranded)
- Buildings that require genetic verification for entry
- Public spaces designed to exclude the "unoptimized"
- Monuments to efficiency that are gravestones for diversity

## The Big Lie

The district's darkest secret: **There is no cognitive purity.**

Neural patterns are complex, chaotic, beautiful in their diversity. The tests that determine "purity" are corporate fiction, designed to create a compliant overclass who police themselves and others.

Many residents live in constant fear their own neurodivergence will be discovered. They project hatred outward to hide the "impurity" within.

## The Resistance Within

Not everyone in Nuevo Polanco believes the lie:
- Parents who love their "imperfect" children more than ideology
- Scientists who've seen the beauty in neurodivergent minds
- Service workers who maintain the district while hiding their own gifts
- Children who haven't yet learned to hate difference

These allies are crucial but vulnerable. One wrong word and they join the disappeared.

## The Ultimate Irony

Director Chen and the WHIX board mock Nuevo Polanco's residents behind closed doors. The white nationalist ideology is a tool, creating willing participants in their own exploitation. When the neural harvest comes, the "pure" will be processed just like everyone else - they're just being saved for last, like grain fattened for harvest.

In Nuevo Polanco, players confront the horror of supremacist ideology made corporate policy, where efficiency becomes eugenics and optimization becomes genocide. The challenge isn't just fighting enemies - it's saving people from their own beliefs before those beliefs destroy them.