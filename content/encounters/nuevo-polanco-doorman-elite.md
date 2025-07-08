---
id: "nuevo-polanco-doorman-elite"
type: "social_encounter"
title: "Elite Building Doorman"
description: "Navigate the class barriers of Nuevo Polanco's luxury high-rises"
setting: "luxury_apartment_lobby"
opponent: "elite_doorman"
difficulty: 6

initialState: "service_entrance"
initialValues:
  reputation: 50
  stress: 10
  maxStress: 100

states:
  service_entrance:
    id: "service_entrance"
    name: "Class Barrier"
    dialogue: "Excuse me, delivery person. You need to use the service entrance around back. This lobby is for residents and their guests only."
    mood: "condescending"
    playerActions: ["show_proof", "negotiate", "apologize", "firm_boundary"]
    
  documentation_scrutiny:
    id: "documentation_scrutiny"
    name: "Verification Process"
    dialogue: "Hmm, Mrs. Velázquez in 42A... She didn't mention expecting a delivery. Are you certain this is legitimate?"
    mood: "suspicious"
    playerActions: ["show_proof", "call_support", "empathize", "negotiate"]
    
  class_explanation:
    id: "class_explanation"
    name: "Social Order Lesson"
    dialogue: "Look, it's nothing personal. But we maintain certain standards here. Residents pay premium fees to avoid... mixing with service personnel."
    mood: "patronizing"
    playerActions: ["empathize", "argue", "humor", "de_escalate"]
    
  respectful_negotiation:
    id: "respectful_negotiation"
    name: "Professional Courtesy"
    dialogue: "I appreciate your understanding. Tell you what - I can escort you up personally to maintain protocol."
    mood: "professional"
    playerActions: ["empathize", "negotiate", "apologize", "wait"]
    
  escalating_confrontation:
    id: "escalating_confrontation"
    name: "Security Threat"
    dialogue: "Your attitude is unacceptable! I'm calling building security. You people need to learn your place!"
    mood: "angry"
    playerActions: ["apologize", "de_escalate", "document", "call_support"]
    
  grudging_compliance:
    id: "grudging_compliance"
    name: "Minimum Cooperation"
    dialogue: "Fine. But make it quick, stay quiet, and don't touch anything. I'll be watching."
    mood: "reluctant"
    playerActions: ["apologize", "empathize", "wait", "humor"]
    
  security_escort:
    id: "security_escort"
    name: "VIP Treatment"
    dialogue: "Right this way. Mrs. Velázquez is a valued resident - we'll ensure her delivery arrives safely."
    mood: "satisfied"
    playerActions: ["wait"]
    
  banned_entry:
    id: "banned_entry"
    name: "Ejected"
    dialogue: "Security! Remove this person immediately! I'm reporting this to WHIX management!"
    mood: "furious"
    playerActions: ["wait"]

transitions:
  # From service entrance
  - from: "service_entrance"
    to: "documentation_scrutiny"
    action: "show_proof"
    
  - from: "service_entrance"
    to: "respectful_negotiation"
    action: "apologize"
    effects:
      reputationChange: -5
      stressChange: -5
      
  - from: "service_entrance"
    to: "class_explanation"
    action: "negotiate"
    
  - from: "service_entrance"
    to: "escalating_confrontation"
    action: "firm_boundary"
    effects:
      stressChange: 15
      reputationChange: -15
      
  # From documentation scrutiny
  - from: "documentation_scrutiny"
    to: "respectful_negotiation"
    action: "empathize"
    effects:
      reputationChange: 10
      
  - from: "documentation_scrutiny"
    to: "security_escort"
    action: "show_proof"
    condition:
      reputation: 65
      
  - from: "documentation_scrutiny"
    to: "escalating_confrontation"
    action: "call_support"
    effects:
      stressChange: 10
      
  # From class explanation
  - from: "class_explanation"
    to: "respectful_negotiation"
    action: "empathize"
    effects:
      reputationChange: 15
      stressChange: -5
      
  - from: "class_explanation"
    to: "escalating_confrontation"
    action: "argue"
    effects:
      stressChange: 20
      reputationChange: -20
      
  - from: "class_explanation"
    to: "grudging_compliance"
    action: "humor"
    condition:
      reputation: 60
    effects:
      reputationChange: 10
      stressChange: -10
      
  # From respectful negotiation
  - from: "respectful_negotiation"
    to: "security_escort"
    action: "empathize"
    effects:
      reputationChange: 10
      
  - from: "respectful_negotiation"
    to: "security_escort"
    action: "wait"
    
  # From escalating confrontation
  - from: "escalating_confrontation"
    to: "grudging_compliance"
    action: "apologize"
    effects:
      reputationChange: -10
      stressChange: -15
      
  - from: "escalating_confrontation"
    to: "banned_entry"
    action: "de_escalate"
    condition:
      reputation: 15
      comparison: "lte"
      
  - from: "escalating_confrontation"
    to: "grudging_compliance"
    action: "de_escalate"
    condition:
      reputation: 35
    effects:
      stressChange: -10
      
  # From grudging compliance
  - from: "grudging_compliance"
    to: "security_escort"
    action: "empathize"
    condition:
      reputation: 70
    effects:
      reputationChange: 5
      
  - from: "grudging_compliance"
    to: "security_escort"
    action: "wait"
    
  # Auto transitions
  - from: "security_escort"
    to: "victory"
    
  - from: "banned_entry"
    to: "defeat"

winConditions:
  - type: "state"
    state: "security_escort"
    
loseConditions:
  - type: "state"
    state: "banned_entry"
  - type: "stress"
    value: 85
    comparison: "gte"
  - type: "reputation"
    value: 10
    comparison: "lte"

winOutcome:
  dialogue: "The doorman escorts you to the elevator with professional courtesy. 'Mrs. Velázquez always tips well - deliver safely.'"
  rewards:
    tips: 30
    experience: 50
    reputation: 5

loseOutcome:
  dialogue: "Security escorts you from the building. Your delivery is marked as 'attempted' and you're banned from this address."
  consequences:
    tips: -10
    reputation: -20
---

# Nuevo Polanco Elite Doorman

Navigate the stark class divisions of Mexico City's most exclusive district. Luxury buildings employ doormen trained to maintain social barriers while managing service access.

## District Context

Nuevo Polanco represents Mexico's economic elite - a gleaming district of luxury towers where old money meets new tech wealth. Doormen here are gatekeepers of social order, trained to identify and manage "undesirable" elements while maintaining the appearance of professional service.

## Strategy Notes

- **Respect the hierarchy** - Challenge it indirectly, not head-on
- **Show documentation readily** - Legitimacy is everything here
- **Use empathy strategically** - Some doormen are also working class
- **Avoid confrontation** - Wealth has power here

## Class Dynamics

This encounter reflects real CDMX social tensions. Success requires navigating class prejudice while maintaining dignity. Your approach affects how you're received in other elite encounters.

## Unique Mechanics

- **Status Recognition**: Professional behavior improves future elite encounters
- **Class Solidarity**: Some doormen respond to worker empathy
- **Wealth Privilege**: Customer reputation can override personal standing