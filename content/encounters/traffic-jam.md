---
id: traffic-jam
type: environmental
title: Gridlocked Traffic
description: You're stuck in a massive traffic jam. The delivery timer is ticking...
difficulty: easy
mood: frustrated
initialState: stuck_in_traffic
---

# Traffic Jam Encounter

## States

### stuck_in_traffic
**Dialogue**: "Great, just great. Traffic's completely stopped. I can see angry drivers honking everywhere. The food's getting cold..."
**Mood**: frustrated
**Player Actions**:
- wait
- navigate
- call_support
- humor

### waiting_it_out
**Dialogue**: "Still not moving. The customer's going to be furious. Maybe I should have taken a different route..."
**Mood**: anxious
**Player Actions**:
- wait
- navigate
- call_support

### finding_alternate
**Dialogue**: "Let me check the map... There might be a side street I can squeeze through."
**Mood**: determined
**Player Actions**:
- navigate
- wait

### calling_dispatch
**Dialogue**: "Dispatch, I'm stuck in traffic on Insurgentes. The delivery's going to be late."
**Mood**: professional
**Player Actions**:
- wait
- navigate

### making_joke
**Dialogue**: "Well, at least I'm not the only one stuck here. That guy in the BMW looks like he's about to explode!"
**Mood**: amused
**Player Actions**:
- wait
- navigate

## State Transitions

### From stuck_in_traffic
- **wait** → waiting_it_out (100%)
- **navigate** → finding_alternate (100%)
- **call_support** → calling_dispatch (100%)
- **humor** → making_joke (100%)

### From waiting_it_out
- **wait** → lose (60%) | win (40%)
- **navigate** → finding_alternate (100%)
- **call_support** → calling_dispatch (100%)

### From finding_alternate
- **navigate** → win (80%) | lose (20%)
- **wait** → waiting_it_out (100%)

### From calling_dispatch
- **wait** → win (70%) | lose (30%)
- **navigate** → finding_alternate (100%)

### From making_joke
- **wait** → win (50%) | lose (50%)
- **navigate** → finding_alternate (100%)

## Outcomes

### Victory
**Message**: "Traffic finally starts moving! You manage to deliver the food just in time."
**Rewards**:
- tips: 50
- experience: 25

### Defeat
**Message**: "The traffic doesn't budge. The food arrives cold and late."
**Penalties**:
- tips: -25
- rating: -0.1