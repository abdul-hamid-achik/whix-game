---
id: lucky-break
type: shortcut
title: Helpful Local
description: A local resident flags you down, offering to show you a shortcut through the neighborhood.
difficulty: easy
mood: friendly
initialState: local_approaching
---

# Lucky Break Encounter

## States

### local_approaching
**Dialogue**: "¡Oye, delivery! You trying to get to Colonia Roma? Traffic's murder on Insurgentes. I know a shortcut!"
**Mood**: helpful
**Player Actions**:
- empathize
- systematic_thinking
- wait
- argue

### accepting_help
**Dialogue**: "That's really kind of you! I'm still learning the neighborhoods. Which way?"
**Mood**: grateful
**Player Actions**:
- wait
- humor

### analyzing_route
**Dialogue**: "Let me check my map... Hmm, that route isn't showing up. Are you sure it's faster?"
**Mood**: analytical
**Player Actions**:
- empathize
- wait
- argue

### politely_declining
**Dialogue**: "Thanks, but I should stick to the GPS route. Company policy and all that."
**Mood**: cautious
**Player Actions**:
- empathize
- wait

### questioning_motives
**Dialogue**: "Why are you so eager to help? This feels suspicious..."
**Mood**: suspicious
**Player Actions**:
- de_escalate
- wait
- document

### making_friend
**Dialogue**: "You know what? You seem genuine. Lead the way, friend!"
**Mood**: trusting
**Player Actions**:
- humor
- wait

### joking_together
**Dialogue**: "Ha! You must really hate traffic to help random delivery drivers. You're good people!"
**Mood**: jovial
**Player Actions**:
- wait
- empathize

## State Transitions

### From local_approaching
- **empathize** → accepting_help (100%)
- **systematic_thinking** → analyzing_route (100%)
- **wait** → politely_declining (100%)
- **argue** → questioning_motives (100%)

### From accepting_help
- **wait** → win (85%) | lose (15%)
- **humor** → making_friend (100%)

### From analyzing_route
- **empathize** → accepting_help (100%)
- **wait** → politely_declining (100%)
- **argue** → questioning_motives (100%)

### From politely_declining
- **empathize** → win (60%) | lose (40%)
- **wait** → win (50%) | lose (50%)

### From questioning_motives
- **de_escalate** → politely_declining (100%)
- **wait** → lose (70%) | win (30%)
- **document** → lose (80%) | win (20%)

### From making_friend
- **humor** → joking_together (100%)
- **wait** → win (90%) | lose (10%)

### From joking_together
- **wait** → win (95%) | lose (5%)
- **empathize** → win (98%) | lose (2%)

## Outcomes

### Victory
**Message**: "The shortcut saves you 10 minutes! The local gives you their number: 'Call if you need more tips!'"
**Rewards**:
- tips: 100
- experience: 30
- time_saved: 10 minutes
- contact: "Local Guide"

### Defeat
**Message**: "The 'shortcut' gets you lost in winding streets. You barely make the delivery on time."
**Penalties**:
- tips: -20
- stress: +5