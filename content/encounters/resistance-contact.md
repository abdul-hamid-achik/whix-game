---
id: resistance-contact
type: underground
title: Underground Network
description: Someone from the delivery driver resistance movement wants to make contact...
difficulty: hard
mood: secretive
initialState: mysterious_approach
---

# Resistance Contact Encounter

## States

### mysterious_approach
**Dialogue**: "Psst... You're the one who's been asking questions about Tanya, right? We need to talk. But not here."
**Mood**: conspiratorial
**Player Actions**:
- systematic_thinking
- argue
- empathize
- wait

### analyzing_situation
**Dialogue**: "How do you know about that? Who are you? This better not be corporate surveillance..."
**Mood**: cautious
**Player Actions**:
- show_proof
- wait
- document

### defensive_stance
**Dialogue**: "I don't know what you're talking about. I'm just delivering food."
**Mood**: defensive
**Player Actions**:
- wait
- de_escalate
- firm_boundary

### showing_interest
**Dialogue**: "Tanya... yes. She was my friend. Do you know where she is? Is she okay?"
**Mood**: concerned
**Player Actions**:
- wait
- negotiate

### cautious_waiting
**Dialogue**: *The figure looks around nervously, checking for drones or surveillance*
**Mood**: tense
**Player Actions**:
- empathize
- systematic_thinking
- argue

### requesting_proof
**Dialogue**: "If you really know Tanya, prove it. Tell me something only her friends would know."
**Mood**: skeptical
**Player Actions**:
- wait
- empathize

### building_trust
**Dialogue**: "Look, we're both taking risks here. I'm part of the network helping disappeared drivers. Tanya sent me."
**Mood**: earnest
**Player Actions**:
- negotiate
- show_proof
- wait

### negotiating_terms
**Dialogue**: "What do you want from me? I can't abandon my route..."
**Mood**: practical
**Player Actions**:
- empathize
- wait

### accepting_message
**Dialogue**: "Tanya says to check the old drop point. Domingo's Taco Stand, locker 47. The combination is her employee ID backwards."
**Mood**: urgent
**Player Actions**:
- document
- wait

## State Transitions

### From mysterious_approach
- **systematic_thinking** → analyzing_situation (100%)
- **argue** → defensive_stance (100%)
- **empathize** → showing_interest (100%)
- **wait** → cautious_waiting (100%)

### From analyzing_situation
- **show_proof** → requesting_proof (100%)
- **wait** → cautious_waiting (100%)
- **document** → lose (90%) | defensive_stance (10%)

### From defensive_stance
- **wait** → lose (70%) | cautious_waiting (30%)
- **de_escalate** → cautious_waiting (100%)
- **firm_boundary** → lose (85%) | win (15%)

### From showing_interest
- **wait** → building_trust (100%)
- **negotiate** → negotiating_terms (100%)

### From cautious_waiting
- **empathize** → showing_interest (100%)
- **systematic_thinking** → analyzing_situation (100%)
- **argue** → defensive_stance (100%)

### From requesting_proof
- **wait** → building_trust (100%)
- **empathize** → win (80%) | building_trust (20%)

### From building_trust
- **negotiate** → negotiating_terms (100%)
- **show_proof** → accepting_message (100%)
- **wait** → win (75%) | lose (25%)

### From negotiating_terms
- **empathize** → accepting_message (100%)
- **wait** → win (70%) | lose (30%)

### From accepting_message
- **document** → win (90%) | lose (10%)
- **wait** → win (95%) | lose (5%)

## Outcomes

### Victory
**Message**: "You memorize the message. The contact disappears into the shadows. You have a new lead on Tanya!"
**Rewards**:
- experience: 100
- story_progress: +1
- unlock: "Domingo's Drop Point"
- humanity: +15

### Defeat
**Message**: "The contact gets spooked and runs. You've lost a chance to find out about Tanya."
**Penalties**:
- stress: +25
- opportunity: -1