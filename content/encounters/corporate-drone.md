---
id: corporate-drone
type: surveillance
title: Corporate Security Scan
description: A WHIX corporate surveillance drone has spotted you. It's scanning your delivery patterns...
difficulty: normal
mood: mechanical
initialState: drone_scanning
---

# Corporate Drone Encounter

## States

### drone_scanning
**Dialogue**: "WHIX SECURITY DRONE XK-7: Scanning delivery partner... Anomaly detected in route efficiency. Explain deviation."
**Mood**: robotic
**Player Actions**:
- show_proof
- argue
- systematic_thinking
- wait

### showing_credentials
**Dialogue**: "Here's my partner ID and today's delivery manifest. I took a detour due to traffic."
**Mood**: compliant
**Player Actions**:
- wait
- systematic_thinking

### arguing_privacy
**Dialogue**: "I don't have to explain my route to a drone! I'm making my deliveries on time!"
**Mood**: defiant
**Player Actions**:
- de_escalate
- document
- call_support

### analyzing_pattern
**Dialogue**: "According to my calculations, this route is 12% more efficient given current traffic conditions. Here's the data..."
**Mood**: analytical
**Player Actions**:
- show_proof
- wait

### passive_compliance
**Dialogue**: *The drone continues scanning, recording every movement and biometric data*
**Mood**: resigned
**Player Actions**:
- document
- argue
- show_proof

### documenting_surveillance
**Dialogue**: "I'm documenting this surveillance for the Delivery Partner Union. This feels like harassment."
**Mood**: activist
**Player Actions**:
- argue
- call_support
- wait

### contacting_union
**Dialogue**: "Union rep? Yeah, I'm being stalked by a corpo drone again. Fourth time this week."
**Mood**: frustrated
**Player Actions**:
- document
- wait

## State Transitions

### From drone_scanning
- **show_proof** → showing_credentials (100%)
- **argue** → arguing_privacy (100%)
- **systematic_thinking** → analyzing_pattern (100%)
- **wait** → passive_compliance (100%)

### From showing_credentials
- **wait** → win (70%) | passive_compliance (30%)
- **systematic_thinking** → analyzing_pattern (100%)

### From arguing_privacy
- **de_escalate** → showing_credentials (100%)
- **document** → documenting_surveillance (100%)
- **call_support** → contacting_union (100%)

### From analyzing_pattern
- **show_proof** → win (85%) | showing_credentials (15%)
- **wait** → win (80%) | lose (20%)

### From passive_compliance
- **document** → documenting_surveillance (100%)
- **argue** → arguing_privacy (100%)
- **show_proof** → showing_credentials (100%)

### From documenting_surveillance
- **argue** → lose (60%) | arguing_privacy (40%)
- **call_support** → contacting_union (100%)
- **wait** → win (55%) | lose (45%)

### From contacting_union
- **document** → win (75%) | lose (25%)
- **wait** → win (70%) | lose (30%)

## Outcomes

### Victory
**Message**: "The drone accepts your explanation and flies away. Your union rep says they'll file a complaint."
**Rewards**:
- tips: 60
- experience: 45
- resistance_points: +5

### Defeat
**Message**: "The drone flags you for 'inefficient routing.' Your next week's deliveries will be monitored closely."
**Penalties**:
- tips: -40
- surveillance_level: +1
- stress: +15