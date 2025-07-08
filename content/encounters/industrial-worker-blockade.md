---
id: "industrial-worker-blockade"
type: "social_encounter"
title: "Worker Strike Blockade"
description: "Striking workers block the delivery route in the Industrial District during labor unrest"
setting: "industrial_district_picket_line"
opponent: "striking_workers"
difficulty: 3

initialState: "picket_line"
initialValues:
  reputation: 50
  stress: 5
  maxStress: 100

states:
  picket_line:
    id: "picket_line"
    name: "Strike Blockade"
    dialogue: "Hey delivery worker! You can't cross the picket line! We're fighting for fair wages - are you with the workers or the bosses?"
    mood: "determined"
    playerActions: ["empathize", "negotiate", "show_proof", "firm_boundary"]
    
  worker_solidarity:
    id: "worker_solidarity"
    name: "Common Ground"
    dialogue: "You get it! WHIX treats you delivery folks just as badly as they treat us factory workers. How can we help each other?"
    mood: "friendly"
    playerActions: ["negotiate", "empathize", "humor", "wait"]
    
  explaining_urgency:
    id: "explaining_urgency"
    name: "Time Pressure"
    dialogue: "Look, we understand you're just trying to work, but this medicine delivery could be life or death. Can we find a compromise?"
    mood: "conflicted"
    playerActions: ["empathize", "negotiate", "show_proof", "wait"]
    
  hostile_confrontation:
    id: "hostile_confrontation"
    name: "Class Traitor"
    dialogue: "So you're a scab! Crossing picket lines to serve the corporate machine! You're part of the problem!"
    mood: "angry"
    playerActions: ["apologize", "de_escalate", "document", "call_support"]
    
  finding_solution:
    id: "finding_solution"
    name: "Creative Compromise"
    dialogue: "Alright, we can escort you through the back route, but you have to promise to support worker rights when you can."
    mood: "negotiating"
    playerActions: ["empathize", "negotiate", "humor", "apologize"]
    
  safe_passage:
    id: "safe_passage"
    name: "Worker Escort"
    dialogue: "Come on, we'll get you through. Solidarity between workers! Maybe you can put in a good word about our cause."
    mood: "satisfied"
    playerActions: ["wait"]
    
  forced_retreat:
    id: "forced_retreat"
    name: "Blocked Route"
    dialogue: "No passage for corporate bootlickers! Find another route or find another job!"
    mood: "hostile"
    playerActions: ["wait"]

transitions:
  # From picket line
  - from: "picket_line"
    to: "worker_solidarity"
    action: "empathize"
    effects:
      reputationChange: 15
      stressChange: -10
      
  - from: "picket_line"
    to: "explaining_urgency"
    action: "show_proof"
    
  - from: "picket_line"
    to: "hostile_confrontation"
    action: "firm_boundary"
    effects:
      stressChange: 20
      reputationChange: -20
      
  - from: "picket_line"
    to: "finding_solution"
    action: "negotiate"
    condition:
      reputation: 55
      
  # From worker solidarity
  - from: "worker_solidarity"
    to: "safe_passage"
    action: "empathize"
    effects:
      reputationChange: 10
      
  - from: "worker_solidarity"
    to: "safe_passage"
    action: "negotiate"
    
  - from: "worker_solidarity"
    to: "finding_solution"
    action: "humor"
    effects:
      reputationChange: 5
      stressChange: -5
      
  # From explaining urgency
  - from: "explaining_urgency"
    to: "finding_solution"
    action: "empathize"
    effects:
      reputationChange: 10
      
  - from: "explaining_urgency"
    to: "safe_passage"
    action: "negotiate"
    condition:
      reputation: 65
      
  - from: "explaining_urgency"
    to: "hostile_confrontation"
    action: "show_proof"
    condition:
      reputation: 30
      comparison: "lte"
      
  # From hostile confrontation
  - from: "hostile_confrontation"
    to: "finding_solution"
    action: "apologize"
    effects:
      reputationChange: -5
      stressChange: -15
      
  - from: "hostile_confrontation"
    to: "forced_retreat"
    action: "de_escalate"
    condition:
      reputation: 20
      comparison: "lte"
      
  - from: "hostile_confrontation"
    to: "finding_solution"
    action: "de_escalate"
    condition:
      reputation: 40
    effects:
      stressChange: -10
      
  # From finding solution
  - from: "finding_solution"
    to: "safe_passage"
    action: "empathize"
    effects:
      reputationChange: 15
      
  - from: "finding_solution"
    to: "safe_passage"
    action: "negotiate"
    
  # Auto transitions
  - from: "safe_passage"
    to: "victory"
    
  - from: "forced_retreat"
    to: "defeat"

winConditions:
  - type: "state"
    state: "safe_passage"
    
loseConditions:
  - type: "state"
    state: "forced_retreat"
  - type: "stress"
    value: 80
    comparison: "gte"

winOutcome:
  dialogue: "The workers form a protective escort, chanting solidarity songs as they help you reach your delivery destination."
  rewards:
    tips: 15
    experience: 60
    reputation: 10

loseOutcome:
  dialogue: "The crowd closes ranks, blocking all routes. You'll need to find an alternative path or wait for the strike to end."
  consequences:
    tips: 0
    reputation: -5
---

# Industrial District Worker Blockade

Navigate the complex dynamics of labor unrest in the Industrial District. Striking workers can be allies or obstacles depending on how you approach the situation.

## District Context

The Industrial District is a hotbed of worker organizing and corporate-labor conflict. Delivery workers often find themselves caught between management pressure to maintain service and worker solidarity. Your choices here affect your standing with both groups.

## Strategy Notes

- **Empathy is key** - Workers respond to genuine solidarity
- **Show medical urgency** - Some deliveries transcend politics
- **Avoid corporate talking points** - You're seen as a fellow worker
- **Negotiate creatively** - There's usually a compromise

## Worker Solidarity System

Success in worker encounters builds reputation with labor movements across all districts. This can unlock alternative routes, protection from corporate retaliation, and access to resistance networks.

## Unique Mechanics

- **Class Consciousness**: Empathy actions are more effective
- **Urgency Override**: Medical deliveries can bypass normal restrictions
- **Solidarity Network**: Success builds connections for future encounters