---
id: protest-sympathy
type: protest
title: Workers' Rights Protest
description: A protest for gig worker rights is blocking the street. They're asking delivery drivers to join them...
difficulty: normal
mood: passionate
initialState: approaching_protest
---

# Workers' Rights Protest Encounter

## States

### approaching_protest
**Dialogue**: "Hey, delivery partner! We're fighting for YOUR rights! Better pay, health insurance, sick leave! Join us!"
**Mood**: hopeful
**Player Actions**:
- empathize
- argue
- navigate
- wait

### showing_solidarity
**Dialogue**: "You're right, we deserve better. But I've got mouths to feed. I can't afford to stop working."
**Mood**: sympathetic
**Player Actions**:
- negotiate
- wait
- document

### arguing_against
**Dialogue**: "Look, I appreciate what you're doing, but I need to get through. This is my livelihood!"
**Mood**: frustrated
**Player Actions**:
- de_escalate
- navigate
- wait

### finding_alternate_route
**Dialogue**: "Is there any way I can get through? Maybe a side path? I support the cause but this delivery..."
**Mood**: practical
**Player Actions**:
- empathize
- wait
- negotiate

### waiting_respectfully
**Dialogue**: *You park and wait, watching the protesters. Some are former delivery partners you recognize*
**Mood**: contemplative
**Player Actions**:
- empathize
- document
- navigate

### negotiating_passage
**Dialogue**: "What if I wear one of your pins while I deliver? Spread the message? Can you let me through?"
**Mood**: diplomatic
**Player Actions**:
- empathize
- show_proof
- wait

### documenting_protest
**Dialogue**: "Mind if I record this? People need to see what we're fighting for."
**Mood**: activist
**Player Actions**:
- empathize
- wait

### showing_union_card
**Dialogue**: "I'm already with the Delivery Partners Union. We're all in this together, but I need to work."
**Mood**: allied
**Player Actions**:
- wait
- navigate

## State Transitions

### From approaching_protest
- **empathize** → showing_solidarity (100%)
- **argue** → arguing_against (100%)
- **navigate** → finding_alternate_route (100%)
- **wait** → waiting_respectfully (100%)

### From showing_solidarity
- **negotiate** → negotiating_passage (100%)
- **wait** → win (70%) | waiting_respectfully (30%)
- **document** → documenting_protest (100%)

### From arguing_against
- **de_escalate** → showing_solidarity (100%)
- **navigate** → lose (60%) | finding_alternate_route (40%)
- **wait** → waiting_respectfully (100%)

### From finding_alternate_route
- **empathize** → showing_solidarity (100%)
- **wait** → waiting_respectfully (100%)
- **negotiate** → negotiating_passage (100%)

### From waiting_respectfully
- **empathize** → showing_solidarity (100%)
- **document** → documenting_protest (100%)
- **navigate** → finding_alternate_route (100%)

### From negotiating_passage
- **empathize** → win (80%) | showing_solidarity (20%)
- **show_proof** → showing_union_card (100%)
- **wait** → win (65%) | lose (35%)

### From documenting_protest
- **empathize** → win (85%) | showing_solidarity (15%)
- **wait** → win (75%) | lose (25%)

### From showing_union_card
- **wait** → win (90%) | lose (10%)
- **navigate** → win (85%) | lose (15%)

## Outcomes

### Victory
**Message**: "The protesters create a path for you, chanting 'Solidarity forever!' as you pass. You deliver on time."
**Rewards**:
- tips: 80
- experience: 50
- humanity: +10
- union_reputation: +15

### Defeat
**Message**: "The protest intensifies and police arrive. You're stuck for an hour and miss your delivery window."
**Penalties**:
- tips: -60
- rating: -0.2
- stress: +10