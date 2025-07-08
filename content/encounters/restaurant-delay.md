---
id: restaurant-delay
type: pickup
title: Restaurant Not Ready
description: The restaurant is running behind on your order. Every minute counts...
difficulty: normal
mood: impatient
initialState: waiting_at_counter
---

# Restaurant Delay Encounter

## States

### waiting_at_counter
**Dialogue**: "Hi, I'm here for order #3847... What do you mean it's not ready? The app said it would be done 10 minutes ago!"
**Mood**: frustrated
**Player Actions**:
- argue
- wait
- negotiate
- call_support

### arguing_with_staff
**Dialogue**: "This is ridiculous! I have other deliveries waiting. You're costing me money!"
**Mood**: angry
**Player Actions**:
- de_escalate
- wait
- call_support

### patient_waiting
**Dialogue**: "Okay, I'll wait. But please hurry, I have a customer expecting this."
**Mood**: resigned
**Player Actions**:
- wait
- negotiate
- humor

### negotiating_priority
**Dialogue**: "Look, can you bump this order up? The customer is a regular and they tip well. It'll be worth it for both of us."
**Mood**: strategic
**Player Actions**:
- empathize
- argue
- wait

### calling_customer_service
**Dialogue**: "Support? Yeah, I'm at Tacos El Patron and they're running 15 minutes behind..."
**Mood**: professional
**Player Actions**:
- wait
- negotiate

### making_small_talk
**Dialogue**: "Busy night, huh? I bet you're all doing your best back there."
**Mood**: friendly
**Player Actions**:
- wait
- empathize

### empathizing_with_staff
**Dialogue**: "I get it, Friday nights are chaos. We're all just trying to make a living here."
**Mood**: understanding
**Player Actions**:
- wait
- humor

## State Transitions

### From waiting_at_counter
- **argue** → arguing_with_staff (100%)
- **wait** → patient_waiting (100%)
- **negotiate** → negotiating_priority (100%)
- **call_support** → calling_customer_service (100%)

### From arguing_with_staff
- **de_escalate** → patient_waiting (100%)
- **wait** → lose (70%) | win (30%)
- **call_support** → calling_customer_service (100%)

### From patient_waiting
- **wait** → win (60%) | lose (40%)
- **negotiate** → negotiating_priority (100%)
- **humor** → making_small_talk (100%)

### From negotiating_priority
- **empathize** → empathizing_with_staff (100%)
- **argue** → arguing_with_staff (100%)
- **wait** → win (75%) | lose (25%)

### From calling_customer_service
- **wait** → win (80%) | lose (20%)
- **negotiate** → negotiating_priority (100%)

### From making_small_talk
- **wait** → win (85%) | lose (15%)
- **empathize** → empathizing_with_staff (100%)

### From empathizing_with_staff
- **wait** → win (90%) | lose (10%)
- **humor** → win (95%) | lose (5%)

## Outcomes

### Victory
**Message**: "The kitchen prioritizes your order! You get the food and rush out to deliver it."
**Rewards**:
- tips: 75
- experience: 40
- relationship: +5 (restaurant staff)

### Defeat
**Message**: "After 20 minutes of waiting, you have to cancel the order. Your rating takes a hit."
**Penalties**:
- tips: -50
- rating: -0.2
- relationship: -5 (restaurant staff)