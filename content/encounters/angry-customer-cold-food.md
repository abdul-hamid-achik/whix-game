---
id: "angry-customer-cold-food"
type: "social_encounter"
title: "Cold Food Complaint"
description: "An angry customer refuses to pay because their food arrived cold"
setting: "luxury_apartment_lobby"
opponent: "angry_customer"
difficulty: 3

initialState: "initial_complaint"
initialValues:
  reputation: 50
  stress: 0
  maxStress: 100

states:
  initial_complaint:
    id: "initial_complaint"
    name: "Initial Complaint"
    dialogue: "This food is COLD! I've been waiting for over an hour! You delivery people can't do anything right!"
    mood: "angry"
    playerActions: ["apologize", "show_proof", "argue", "negotiate"]
    
  proof_shown:
    id: "proof_shown"
    name: "Showing Delivery Time"
    dialogue: "I don't care what your app says! The food is cold, that's all that matters!"
    mood: "annoyed"
    playerActions: ["apologize", "negotiate", "call_support", "firm_boundary"]
    
  apologetic_response:
    id: "apologetic_response"
    name: "Customer Slightly Calmer"
    dialogue: "Well... I suppose it's not entirely your fault. But I'm still not happy about this."
    mood: "calming"
    playerActions: ["empathize", "negotiate", "show_proof", "wait"]
    
  escalated_anger:
    id: "escalated_anger"
    name: "Customer Furious"
    dialogue: "How DARE you talk back to me! I'm going to report you! You'll lose your job!"
    mood: "furious"
    playerActions: ["apologize", "de_escalate", "document", "call_support"]
    
  negotiating:
    id: "negotiating"
    name: "Negotiation Phase"
    dialogue: "Fine. What are you going to do about this cold food then?"
    mood: "neutral"
    playerActions: ["empathize", "humor", "firm_boundary", "apologize"]
    
  calming_down:
    id: "calming_down"
    name: "Customer Reconsidering"
    dialogue: "I... Look, I've had a rough day. Maybe I overreacted a bit."
    mood: "calming"
    playerActions: ["empathize", "humor", "negotiate", "wait"]
    
  satisfied:
    id: "satisfied"
    name: "Resolution"
    dialogue: "Alright, fine. Here's your tip. Just... try to be faster next time."
    mood: "satisfied"
    playerActions: ["wait"]

transitions:
  # From initial complaint
  - from: "initial_complaint"
    to: "apologetic_response"
    action: "apologize"
    effects:
      stressChange: -10
      
  - from: "initial_complaint"
    to: "proof_shown"
    action: "show_proof"
    
  - from: "initial_complaint"
    to: "escalated_anger"
    action: "argue"
    effects:
      stressChange: 15
      reputationChange: -10
      
  - from: "initial_complaint"
    to: "negotiating"
    action: "negotiate"
    
  # From proof shown
  - from: "proof_shown"
    to: "apologetic_response"
    action: "apologize"
    effects:
      stressChange: -5
      
  - from: "proof_shown"
    to: "negotiating"
    action: "negotiate"
    
  - from: "proof_shown"
    to: "escalated_anger"
    action: "firm_boundary"
    effects:
      stressChange: 10
      
  # From apologetic response
  - from: "apologetic_response"
    to: "calming_down"
    action: "empathize"
    effects:
      reputationChange: 10
      stressChange: -10
      
  - from: "apologetic_response"
    to: "satisfied"
    action: "negotiate"
    condition:
      reputation: 60
      
  # From escalated anger
  - from: "escalated_anger"
    to: "apologetic_response"
    action: "apologize"
    effects:
      stressChange: -15
      reputationChange: -5
      
  - from: "escalated_anger"
    to: "negotiating"
    action: "de_escalate"
    effects:
      stressChange: -10
      
  # From negotiating
  - from: "negotiating"
    to: "calming_down"
    action: "empathize"
    effects:
      reputationChange: 5
      
  - from: "negotiating"
    to: "satisfied"
    action: "humor"
    condition:
      reputation: 55
    effects:
      reputationChange: 10
      stressChange: -15
      
  # From calming down
  - from: "calming_down"
    to: "satisfied"
    action: "empathize"
    effects:
      reputationChange: 10
      
  - from: "calming_down"
    to: "satisfied"
    action: "negotiate"
    
  # Automatic transition from satisfied
  - from: "satisfied"
    to: "victory"

winConditions:
  - type: "state"
    state: "satisfied"
    
loseConditions:
  - type: "stress"
    value: 80
    comparison: "gte"
  - type: "reputation"
    value: 20
    comparison: "lte"
  - type: "rounds"
    value: 15
    comparison: "gte"

winOutcome:
  dialogue: "The customer sighs and hands you some cash. 'Here's your tip. The food better be hot next time.'"
  rewards:
    tips: 25
    experience: 50
    reputation: 5

loseOutcome:
  dialogue: "The customer slams the door in your face. No tip, and they're definitely leaving a bad review."
  consequences:
    tips: 0
    reputation: -10
---

# Cold Food Complaint

A common scenario for delivery partners - dealing with an angry customer who received cold food. Navigate the conversation carefully to salvage your tip and maintain your job security.

## Tips for Success

- **Apologizing** reduces stress but might lower your standing
- **Showing proof** can backfire if the customer is already angry
- **Empathizing** at the right moment can turn the situation around
- **Using humor** only works when the customer has calmed down a bit

## Special Mechanics

This encounter tests your ability to de-escalate conflict while maintaining professional boundaries. Your reputation affects how willing the customer is to listen to reason.