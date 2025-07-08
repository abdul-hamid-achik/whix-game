---
id: "cathedral-security-checkpoint"
type: "social_encounter"
title: "Cathedral Security Checkpoint"
description: "Corporate security stops you for 'routine spiritual verification' in the Cathedral District"
setting: "cathedral_district_checkpoint"
opponent: "security_guard"
difficulty: 4

initialState: "security_stop"
initialValues:
  reputation: 50
  stress: 15
  maxStress: 100

states:
  security_stop:
    id: "security_stop"
    name: "Security Checkpoint"
    dialogue: "Stop right there, delivery worker. We need to verify your spiritual compliance score before you can enter the Cathedral District."
    mood: "neutral"
    playerActions: ["show_proof", "negotiate", "argue", "call_support"]
    
  documentation_check:
    id: "documentation_check"
    name: "Checking Papers"
    dialogue: "Hmm, your delivery permit seems in order, but your productivity metrics are... concerning. When was your last confession?"
    mood: "suspicious"
    playerActions: ["apologize", "humor", "firm_boundary", "document"]
    
  spiritual_interrogation:
    id: "spiritual_interrogation"
    name: "Corporate Catechism"
    dialogue: "Recite the Five Pillars of Productivity. Prove you're not one of those resistance sympathizers we've been warned about."
    mood: "aggressive"
    playerActions: ["apologize", "empathize", "de_escalate", "wait"]
    
  growing_suspicious:
    id: "growing_suspicious"
    name: "Heightened Alert"
    dialogue: "Your neural patterns don't match corporate standard. I'm calling this in to Director Chen's office."
    mood: "angry"
    playerActions: ["apologize", "call_support", "document", "de_escalate"]
    
  professional_courtesy:
    id: "professional_courtesy"
    name: "Worker Solidarity"
    dialogue: "Look, we're both just trying to do our jobs here. Cathedral District's been rough lately with all the 'volunteer' harvesting."
    mood: "calming"
    playerActions: ["empathize", "negotiate", "humor", "wait"]
    
  cleared_passage:
    id: "cleared_passage"
    name: "Permission Granted"
    dialogue: "Alright, you check out. Keep your delivery quick and don't linger near the Optimization Altar. For your own safety."
    mood: "satisfied"
    playerActions: ["wait"]
    
  detained:
    id: "detained"
    name: "Corporate Custody"
    dialogue: "I'm sorry, but you'll need to come with me for enhanced spiritual screening. Your package will be... redistributed."
    mood: "cold"
    playerActions: ["wait"]

transitions:
  # From security stop
  - from: "security_stop"
    to: "documentation_check"
    action: "show_proof"
    
  - from: "security_stop"
    to: "professional_courtesy"
    action: "negotiate"
    condition:
      reputation: 60
    effects:
      reputationChange: 5
      
  - from: "security_stop"
    to: "spiritual_interrogation"
    action: "argue"
    effects:
      stressChange: 10
      reputationChange: -10
      
  # From documentation check
  - from: "documentation_check"
    to: "professional_courtesy"
    action: "humor"
    condition:
      reputation: 55
    effects:
      reputationChange: 10
      stressChange: -5
      
  - from: "documentation_check"
    to: "growing_suspicious"
    action: "firm_boundary"
    effects:
      stressChange: 15
      reputationChange: -15
      
  - from: "documentation_check"
    to: "cleared_passage"
    action: "apologize"
    condition:
      reputation: 70
    effects:
      reputationChange: -5
      stressChange: -10
      
  # From spiritual interrogation
  - from: "spiritual_interrogation"
    to: "professional_courtesy"
    action: "empathize"
    effects:
      reputationChange: 15
      stressChange: -10
      
  - from: "spiritual_interrogation"
    to: "detained"
    action: "de_escalate"
    condition:
      reputation: 25
      comparison: "lte"
      
  # From growing suspicious
  - from: "growing_suspicious"
    to: "professional_courtesy"
    action: "de_escalate"
    condition:
      reputation: 40
    effects:
      stressChange: -5
      
  - from: "growing_suspicious"
    to: "detained"
    action: "call_support"
    effects:
      stressChange: 20
      
  # From professional courtesy
  - from: "professional_courtesy"
    to: "cleared_passage"
    action: "empathize"
    effects:
      reputationChange: 10
      
  - from: "professional_courtesy"
    to: "cleared_passage"
    action: "wait"
    
  # Auto transitions
  - from: "cleared_passage"
    to: "victory"
    
  - from: "detained"
    to: "defeat"

winConditions:
  - type: "state"
    state: "cleared_passage"
    
loseConditions:
  - type: "state"
    state: "detained"
  - type: "stress"
    value: 85
    comparison: "gte"
  - type: "reputation"
    value: 10
    comparison: "lte"

winOutcome:
  dialogue: "The guard waves you through with a tired nod. 'Deliver safe, fellow worker. These are dark times in the Cathedral District.'"
  rewards:
    tips: 10
    experience: 40
    reputation: 5

loseOutcome:
  dialogue: "Your package is confiscated 'for spiritual screening.' You're escorted out with a mark on your corporate record."
  consequences:
    tips: -20
    reputation: -15
---

# Cathedral District Security Checkpoint

Navigate the oppressive corporate-spiritual surveillance state. The Cathedral District's security is particularly paranoid about resistance activity, making every delivery a potential interrogation.

## District Context

The Cathedral District blends religious authority with corporate control. Security guards here are trained in both crowd control and "spiritual compliance" verification. They're looking for signs of resistance activity and neurodivergent behavior that doesn't fit corporate norms.

## Strategy Notes

- **Show documentation early** - They expect compliance
- **Use humor carefully** - Some guards respond well to levity
- **Empathy works** - Many guards are also exploited workers
- **Avoid confrontation** - Corporate authority is absolute here

## Unique Mechanics

This encounter represents the constant surveillance in the Cathedral District. Success here improves your standing with security, making future deliveries easier.