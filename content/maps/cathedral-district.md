---
name: "Cathedral District"
description: "Where faith meets corporate efficiency in unholy matrimony"
unlockCondition:
  type: "chapter_start"
  value: "chapter-2-cathedral-conspiracy"
atmosphere: |
  The Cathedral District rises from Neo-Singapore's heart like a tumor of glass and gilt. Once home to genuine houses of worship, it's now a monument to the merger of faith and capitalism. Holographic saints flicker between advertisements. Prayer apps track devotion metrics. The air itself feels heavy with surveillance and incense.
  
  The Cathedral of Algorithmic Grace dominates the skyline - a massive neo-gothic structure crowned with server farms instead of spires. Its stained glass windows display real-time productivity charts, casting the district in ever-shifting colored light based on quarterly performance.
locations:
  - id: "cathedral-square"
    name: "Cathedral Square"
    description: "Main plaza where the desperate gather for 'charity' that comes with terms of service"
    encounters:
      - "desperate-believers"
      - "charity-collectors"
      - "surveillance-angels"
    npcs:
      - "soup-kitchen-volunteers"
      - "street-preachers"
    special_features:
      - "Confession Kiosks - Pay-per-sin automated absolution"
      - "Productivity Fountain - Water laced with mild stimulants"
      - "Digital Indulgence Vendors - Buy your way out of algorithmic purgatory"
  
  - id: "underground-tunnels"
    name: "Catacomb Networks"
    description: "Ancient burial tunnels repurposed as server farms and hidden resistance meeting spots"
    encounters:
      - "security-acolytes"
      - "data-phantoms"
      - "lost-pilgrims"
    hidden_areas:
      - "Isabella's Archive - Where stolen packages reveal the pattern"
      - "Brother Joaquín's Pirate Seminary - Hidden broadcast station"
      - "The Ossuary Server Room - Bones and bandwidth intertwined"
  
  - id: "corporate-chapels"
    name: "Subsidiary Shrines"
    description: "Smaller churches branded by different corporations, competing for souls and market share"
    notable_shrines:
      - "Chapel of Perpetual Productivity (Amazon)"
      - "Sanctuary of Seamless Integration (Google)"
      - "Temple of Total Connection (Meta)"
    mechanics: "Each shrine offers different 'blessings' (buffs) but increases corporate alignment"
  
  - id: "festival-grounds"
    name: "Neural Harvest Plaza"
    description: "Being prepared for the Festival of Digital Ascension"
    danger_level: "HIGH"
    special_events:
      - "Package theft investigations lead here"
      - "Workers 'volunteering' for neural scans"
      - "Construction of the Great Upload Apparatus"
    environmental_hazards:
      - "Neural dampening fields (reduce ability effectiveness)"
      - "Subliminal hymns (gradual SP drain)"
      - "Surveillance swarms (stealth missions harder)"
  
  - id: "inner-sanctum"
    name: "The Optimization Altar"
    description: "Where Director Chen conducts her 'performance improvements'"
    access: "Requires executive keycard or resistance infiltration"
    boss_arena: true
    features:
      - "Neural interface chairs arranged in ritual patterns"
      - "Walls lined with brain scan monitors"
      - "Tania's 'workspace' - a gilded cage of algorithms"

mission_types:
  - type: "investigation"
    name: "Package Theft Ring"
    description: "Track down stolen deliveries, uncover the religious connection"
    rewards:
      - "Evidence of church-corporate collusion"
      - "Access to underground networks"
  
  - type: "stealth"
    name: "Confession Booth Sabotage"
    description: "Disable neural scanners disguised as confession booths"
    failure_consequence: "Increased surveillance, harder future missions"
  
  - type: "rescue"
    name: "Free the 'Volunteers'"
    description: "Liberation missions for those trapped in neural harvest preparation"
    moral_choice: "Save individuals vs. gathering evidence for larger resistance"
  
  - type: "delivery"
    name: "Heretical Packages"
    description: "Deliver banned items - real books, unmonitored devices, actual food"
    special: "Brother Joaquín provides these missions"

environmental_storytelling:
  - "Graffiti reading 'FAITH.EXE HAS STOPPED RESPONDING' crossed out by corporate security"
  - "Homeless camps using discarded prayer tablets as shelter"
  - "Street shrines to 'Saint Jobs' and 'Prophet Bezos'"
  - "Children playing 'Productivity and Paupers' instead of cops and robbers"
  - "Old religious texts being fed into recycling machines, replaced with corporate mantras"

hidden_lore:
  - location: "Ossuary Archives"
    discovery: "The Church's debt wasn't just financial - they made a deal to access centuries of confession data for behavioral modeling"
  - location: "Chen's Office"
    discovery: "Project BABEL - using neurodivergent pattern recognition to create a 'universal translation' between human consciousness and corporate algorithms"
  - location: "Festival Planning Room"
    discovery: "The Neural Harvest isn't just for WHIX - they're selling processed consciousness patterns to the highest bidder"

resistance_opportunities:
  - "Signal Jamming Nodes - Disable to reduce surveillance"
  - "Sympathetic Clergy - Some remember real faith"
  - "Underground Railroad Stations - Hidden in old crypts"
  - "Data Liberation Points - Free captured neural patterns"

district_exclusive_items:
  - name: "Syndicate Jammer"
    description: "Blocks corporate prayers from affecting your neural patterns"
  - name: "Holy Water Neutralizer"
    description: "Removes nanobots from 'blessed' water"
  - name: "Heretical Texts"
    description: "Pre-merger religious writings that inspire hope"
  - name: "Liberation Theology Chip"
    description: "Unlocks Brother Joaquín's special abilities"
---

# Cathedral District - Where Faith Meets Profit

The Cathedral District exemplifies Neo-Singapore's dystopian fusion of spirituality and capitalism. What once offered sanctuary now harvests souls for quarterly reports.

## District Mechanics

**Surveillance Level**: EXTREME
- Every prayer is recorded
- Every donation tracked
- Every thought monetized

**Unique Challenges**:
- Neural dampening makes abilities cost more SP
- Constant "productivity sermons" drain morale
- Package thieves backed by religious authority
- Workers vanishing for "voluntary optimization"

**Resistance Rating**: GROWING
- Underground seminary broadcasts counter-propaganda
- Stolen packages fund shadow economy
- Some clergy remember real compassion
- Neural patterns being liberated and returned

Navigate carefully. In the Cathedral District, even faith has a price tag, and the cost might be your mind.