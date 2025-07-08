---
id: "karen-manager-demand"
type: "social_encounter"
title: "Manager Demand Karen"
description: "A Karen-type customer immediately demands to speak to your manager"
setting: "upscale_restaurant_entrance"
opponent: "karen_customer"
difficulty: 5

initialState: "manager_demand"
initialValues:
  reputation: 50
  stress: 10
  maxStress: 100

states:
  manager_demand:
    id: "manager_demand"
    name: "Initial Manager Demand"
    dialogue: "I want to speak to your manager RIGHT NOW! This is completely unacceptable!"
    mood: "angry"
    playerActions: ["call_support", "apologize", "show_proof", "firm_boundary"]
    
  support_called:
    id: "support_called"
    name: "Support Response"
    dialogue: "What do you mean they're 'not available'? This is ridiculous! I've been a customer for YEARS!"
    mood: "furious"
    playerActions: ["apologize", "empathize", "document", "negotiate"]
    
  boundary_set:
    id: "boundary_set"
    name: "Professional Boundary"
    dialogue: "Are you being RUDE to me? Do you know who I am? I'll have your job!"
    mood: "furious"
    playerActions: ["apologize", "document", "de_escalate", "wait"]
    
  showing_proof:
    id: "showing_proof"
    name: "Evidence Presented"
    dialogue: "I don't care about your 'delivery confirmation'! The order was WRONG!"
    mood: "angry"
    playerActions: ["empathize", "call_support", "negotiate", "document"]
    
  empathy_shown:
    id: "empathy_shown"
    name: "Customer Acknowledged"
    dialogue: "Well... yes, it has been a difficult day. But that's no excuse for this terrible service!"
    mood: "annoyed"
    playerActions: ["apologize", "negotiate", "humor", "show_proof"]
    
  negotiating:
    id: "negotiating"
    name: "Finding Solution"
    dialogue: "So what exactly are you going to do to fix this situation?"
    mood: "neutral"
    playerActions: ["empathize", "apologize", "firm_boundary", "humor"]
    
  partially_satisfied:
    id: "partially_satisfied"
    name: "Grudging Acceptance"
    dialogue: "I suppose... that's somewhat acceptable. But I'm still filing a complaint!"
    mood: "calming"
    playerActions: ["empathize", "wait", "humor", "apologize"]
    
  defeated:
    id: "defeated"
    name: "Karen Wins"
    dialogue: "That's it! I'm calling corporate! You'll be hearing from my lawyer!"
    mood: "furious"
    playerActions: ["wait"]

transitions:
  # From manager demand
  - from: "manager_demand"
    to: "support_called"
    action: "call_support"
    effects:
      stressChange: 5
      
  - from: "manager_demand"
    to: "empathy_shown"
    action: "apologize"
    effects:
      stressChange: -5
      reputationChange: -5
      
  - from: "manager_demand"
    to: "showing_proof"
    action: "show_proof"
    
  - from: "manager_demand"
    to: "boundary_set"
    action: "firm_boundary"
    effects:
      stressChange: 10
      
  # From support called
  - from: "support_called"
    to: "empathy_shown"
    action: "empathize"
    effects:
      reputationChange: 5
      stressChange: -10
      
  - from: "support_called"
    to: "defeated"
    action: "apologize"
    condition:
      reputation: 30
      comparison: "lte"
      
  # From boundary set
  - from: "boundary_set"
    to: "empathy_shown"
    action: "apologize"
    effects:
      stressChange: -10
      reputationChange: -10
      
  - from: "boundary_set"
    to: "negotiating"
    action: "de_escalate"
    effects:
      stressChange: -5
      
  # From showing proof
  - from: "showing_proof"
    to: "empathy_shown"
    action: "empathize"
    effects:
      reputationChange: 10
      
  - from: "showing_proof"
    to: "negotiating"
    action: "negotiate"
    
  # From empathy shown
  - from: "empathy_shown"
    to: "negotiating"
    action: "negotiate"
    effects:
      reputationChange: 5
      
  - from: "empathy_shown"
    to: "partially_satisfied"
    action: "humor"
    condition:
      reputation: 60
    effects:
      reputationChange: 15
      stressChange: -20
      
  # From negotiating
  - from: "negotiating"
    to: "partially_satisfied"
    action: "empathize"
    effects:
      reputationChange: 10
      
  - from: "negotiating"
    to: "defeated"
    action: "firm_boundary"
    effects:
      stressChange: 20
      reputationChange: -20
      
  # From partially satisfied
  - from: "partially_satisfied"
    to: "victory"
    action: "wait"
    
  - from: "partially_satisfied"
    to: "victory"
    action: "humor"
    effects:
      reputationChange: 5
      
  # Auto defeat
  - from: "defeated"
    to: "defeat"

winConditions:
  - type: "state"
    state: "partially_satisfied"
    
loseConditions:
  - type: "state"
    state: "defeated"
  - type: "stress"
    value: 90
    comparison: "gte"
  - type: "reputation"
    value: 15
    comparison: "lte"

winOutcome:
  dialogue: "Fine. I'll accept the delivery this time. But I'm STILL calling your manager! *grudgingly hands over a small tip*"
  rewards:
    tips: 15
    experience: 75
    reputation: 0

loseOutcome:
  dialogue: "This is the WORST service I've ever experienced! Zero stars! ZERO! *slams door*"
  consequences:
    tips: 0
    reputation: -20
---

# Manager Demand Karen

The dreaded "I want to speak to your manager" encounter. This customer is looking for any excuse to escalate and make your life difficult.

## Strategy Guide

- **Never** set firm boundaries early - it will only make things worse
- **Empathize** at key moments to defuse tension
- **Humor** only works after you've built some rapport
- Document everything - you might need it for the inevitable complaint

## Difficulty Notes

This is a challenging encounter that requires careful navigation. The Karen is quick to anger and slow to calm down. Your best bet is strategic empathy combined with professional de-escalation.