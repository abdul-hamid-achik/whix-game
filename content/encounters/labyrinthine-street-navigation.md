---
id: "labyrinthine-street-navigation"
type: "social_encounter"
title: "Lost in the Labyrinth"
description: "Navigate the confusing street layout of the Labyrinthine District with help from locals"
setting: "maze_like_residential_streets"
opponent: "confused_navigator"
difficulty: 4

initialState: "lost_delivery"
initialValues:
  reputation: 50
  stress: 20
  maxStress: 100

states:
  lost_delivery:
    id: "lost_delivery"
    name: "Maze Navigation Crisis"
    dialogue: "Your GPS has completely failed in this district's twisted streets. A local resident notices your confusion and approaches."
    mood: "helpful"
    playerActions: ["show_proof", "empathize", "negotiate", "wait"]
    
  local_assistance:
    id: "local_assistance"
    name: "Community Helper"
    dialogue: "Ah, you're looking for the González family? They moved three weeks ago. But I know where they are now - follow me!"
    mood: "friendly"
    playerActions: ["empathize", "negotiate", "humor", "show_proof"]
    
  address_confusion:
    id: "address_confusion"
    name: "Outdated Information"
    dialogue: "That address doesn't exist anymore. They renumbered all the streets last month for 'efficiency.' Nobody told the delivery companies, of course."
    mood: "frustrated"
    playerActions: ["empathize", "call_support", "negotiate", "document"]
    
  community_network:
    id: "community_network"
    name: "Neighborhood Knowledge"
    dialogue: "Wait here, I'll ask my neighbor. She knows everyone in this area. María! Come help this delivery worker!"
    mood: "collaborative"
    playerActions: ["empathize", "wait", "humor", "negotiate"]
    
  bureaucratic_nightmare:
    id: "bureaucratic_nightmare"
    name: "System Failure"
    dialogue: "Your delivery app shows one address, the building shows another, and the postal system has a third. Welcome to Mexico City bureaucracy!"
    mood: "resigned"
    playerActions: ["humor", "empathize", "call_support", "document"]
    
  creative_solution:
    id: "creative_solution"
    name: "Local Wisdom"
    dialogue: "Forget the official address. Everyone knows this is 'the blue house with the dog that barks at delivery trucks.' Come on!"
    mood: "resourceful"
    playerActions: ["humor", "empathize", "negotiate", "wait"]
    
  successful_delivery:
    id: "successful_delivery"
    name: "Community Success"
    dialogue: "There you go! The González family is expecting you. They'll be so happy - their daughter's medicine finally arrived!"
    mood: "satisfied"
    playerActions: ["wait"]
    
  abandoned_attempt:
    id: "abandoned_attempt"
    name: "Navigation Failure"
    dialogue: "Sorry, even we locals get lost sometimes. This district changes faster than we can keep track of."
    mood: "apologetic"
    playerActions: ["wait"]

transitions:
  # From lost delivery
  - from: "lost_delivery"
    to: "local_assistance"
    action: "empathize"
    effects:
      reputationChange: 10
      stressChange: -10
      
  - from: "lost_delivery"
    to: "address_confusion"
    action: "show_proof"
    
  - from: "lost_delivery"
    to: "community_network"
    action: "negotiate"
    effects:
      reputationChange: 5
      
  # From local assistance
  - from: "local_assistance"
    to: "successful_delivery"
    action: "empathize"
    effects:
      reputationChange: 15
      stressChange: -15
      
  - from: "local_assistance"
    to: "creative_solution"
    action: "humor"
    effects:
      reputationChange: 10
      stressChange: -10
      
  - from: "local_assistance"
    to: "address_confusion"
    action: "show_proof"
    
  # From address confusion
  - from: "address_confusion"
    to: "community_network"
    action: "empathize"
    effects:
      reputationChange: 10
      stressChange: -5
      
  - from: "address_confusion"
    to: "bureaucratic_nightmare"
    action: "call_support"
    effects:
      stressChange: 15
      
  - from: "address_confusion"
    to: "creative_solution"
    action: "negotiate"
    condition:
      reputation: 60
      
  # From community network
  - from: "community_network"
    to: "successful_delivery"
    action: "empathize"
    effects:
      reputationChange: 15
      
  - from: "community_network"
    to: "creative_solution"
    action: "humor"
    effects:
      reputationChange: 10
      stressChange: -10
      
  - from: "community_network"
    to: "successful_delivery"
    action: "wait"
    condition:
      reputation: 65
      
  # From bureaucratic nightmare
  - from: "bureaucratic_nightmare"
    to: "creative_solution"
    action: "humor"
    effects:
      reputationChange: 15
      stressChange: -20
      
  - from: "bureaucratic_nightmare"
    to: "abandoned_attempt"
    action: "call_support"
    condition:
      stress: 70
      comparison: "gte"
      
  - from: "bureaucratic_nightmare"
    to: "community_network"
    action: "empathize"
    effects:
      reputationChange: 5
      
  # From creative solution
  - from: "creative_solution"
    to: "successful_delivery"
    action: "empathize"
    effects:
      reputationChange: 10
      
  - from: "creative_solution"
    to: "successful_delivery"
    action: "wait"
    
  # Auto transitions
  - from: "successful_delivery"
    to: "victory"
    
  - from: "abandoned_attempt"
    to: "defeat"

winConditions:
  - type: "state"
    state: "successful_delivery"
    
loseConditions:
  - type: "state"
    state: "abandoned_attempt"
  - type: "stress"
    value: 90
    comparison: "gte"

winOutcome:
  dialogue: "The local community rallies to help you complete the delivery. You've gained valuable allies in the neighborhood network."
  rewards:
    tips: 20
    experience: 70
    reputation: 15

loseOutcome:
  dialogue: "Despite community help, the address system defeats everyone. You'll need to return with better information."
  consequences:
    tips: 0
    reputation: 0
---

# Labyrinthine District Navigation

Navigate the intentionally confusing street layout of Mexico City's most chaotic residential district. Success depends on community connections rather than technology.

## District Context

The Labyrinthine District embodies CDMX's organic urban growth - streets that evolved naturally over decades without central planning. Address systems change frequently, GPS fails regularly, and local knowledge is the only reliable navigation method.

## Strategy Notes

- **Embrace community help** - Locals are your best resource
- **Use humor** - Shared frustration with bureaucracy bonds people
- **Show patience** - Rushing alienates helpful neighbors
- **Document failures** - Corporate systems need to improve

## Community Network System

Success in navigation encounters builds reputation with neighborhood networks. This unlocks:
- Alternative routes during emergencies
- Local protection from crime
- Access to informal economy
- Community-verified addresses

## Cultural Authenticity

This encounter reflects real CDMX delivery challenges where community knowledge trumps official systems. Your approach affects how neighborhoods receive future delivery workers.

## Unique Mechanics

- **Community Assistance**: Multiple locals can join to help
- **Address Evolution**: Successful deliveries update the local database
- **Neighborhood Memory**: Past interactions affect current help