---
id: road-rage-driver
type: traffic
title: Aggressive Driver
description: An angry driver is following you, shouting and honking. This could escalate quickly...
difficulty: hard
mood: aggressive
initialState: being_followed
---

# Road Rage Driver Encounter

## States

### being_followed
**Dialogue**: "HEY YOU! WATCH WHERE YOU'RE GOING! YOU CUT ME OFF BACK THERE!" *aggressive honking*
**Mood**: threatening
**Player Actions**:
- de_escalate
- argue
- wait
- document

### apologizing_calmly
**Dialogue**: "I'm really sorry if I cut you off. I didn't mean to. Just trying to do my job."
**Mood**: defensive
**Player Actions**:
- wait
- firm_boundary
- call_support

### arguing_back
**Dialogue**: "I DIDN'T CUT ANYONE OFF! YOU'RE THE ONE DRIVING LIKE A MANIAC!"
**Mood**: angry
**Player Actions**:
- de_escalate
- document
- call_support

### ignoring_them
**Dialogue**: *The driver gets more aggressive, now tailgating dangerously close*
**Mood**: tense
**Player Actions**:
- call_support
- document
- de_escalate

### recording_incident
**Dialogue**: "I'm recording this interaction for my safety. Please maintain a safe distance."
**Mood**: cautious
**Player Actions**:
- call_support
- firm_boundary
- wait

### setting_boundaries
**Dialogue**: "Sir, I need you to stop following me. This is harassment and I will call the police."
**Mood**: firm
**Player Actions**:
- call_support
- document
- wait

### calling_police
**Dialogue**: "911? I'm a delivery driver being aggressively followed by someone with road rage..."
**Mood**: urgent
**Player Actions**:
- wait
- document

## State Transitions

### From being_followed
- **de_escalate** → apologizing_calmly (100%)
- **argue** → arguing_back (100%)
- **wait** → ignoring_them (100%)
- **document** → recording_incident (100%)

### From apologizing_calmly
- **wait** → win (60%) | ignoring_them (40%)
- **firm_boundary** → setting_boundaries (100%)
- **call_support** → calling_police (100%)

### From arguing_back
- **de_escalate** → apologizing_calmly (100%)
- **document** → recording_incident (100%)
- **call_support** → calling_police (100%)

### From ignoring_them
- **call_support** → calling_police (100%)
- **document** → recording_incident (100%)
- **de_escalate** → lose (80%) | apologizing_calmly (20%)

### From recording_incident
- **call_support** → calling_police (100%)
- **firm_boundary** → setting_boundaries (100%)
- **wait** → win (70%) | lose (30%)

### From setting_boundaries
- **call_support** → calling_police (100%)
- **document** → win (75%) | lose (25%)
- **wait** → win (65%) | lose (35%)

### From calling_police
- **wait** → win (90%) | lose (10%)
- **document** → win (95%) | lose (5%)

## Outcomes

### Victory
**Message**: "The aggressive driver realizes they're being recorded/reported and speeds away. You continue your delivery safely."
**Rewards**:
- tips: 100
- experience: 60
- trait_bonus: +10 (attention_to_detail)

### Defeat
**Message**: "The situation escalates and you have to pull over for safety. The delivery is ruined."
**Penalties**:
- tips: -75
- rating: -0.3
- stress: +20