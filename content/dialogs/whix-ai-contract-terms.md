---
id: "whix-ai-contract-terms"
type: "dialog"
title: "WHIX-AI Contract Explanation"
character: "whix_ai"
scene: "whix_onboarding_facility"
dialogType: "exposition_corporate"
mood: "artificially_cheerful"
triggers:
  - event: "contract_presentation"
  - previousDialog: "miguel-introduction"
choices:
  - id: "accept_immediately"
    text: "I accept all terms and conditions"
    requirements: []
    consequences:
      relationshipChanges:
        whix_ai: 15
      humanityChange: -10
      givesItem: "standard_delivery_scanner"
  - id: "question_tip_percentage"
    text: "75% seems excessive. What exactly are the 'platform fees'?"
    requirements:
      trait: "analytical_thinking"
    consequences:
      relationshipChanges:
        whix_ai: -5
        miguel: 10
      humanityChange: 5
      unlocksDialog: "kai_recruiting_approach"
  - id: "joke_about_exploitation"
    text: "Ah yes, the classic 'opportunity' to work for scraps"
    requirements:
      trait: "social_rebellion"
    consequences:
      relationshipChanges:
        whix_ai: -15
        miguel: 20
      humanityChange: 15
      triggersEvent: "security_attention"
nextDialog: "partner_assignment_algorithm"
---

# Dialog: WHIX-AI Contract Terms

## Setting
The holographic contract hovers before you, its text scrolling at superhuman speed. Around you, other potential partners shift uncomfortably as they realize they're expected to agree to terms they can't possibly read. The WHIX-AI's voice emanates from speakers hidden throughout the facility.

## AI Character Presentation
The WHIX-AI doesn't have a physical form - instead, it manifests as a carefully crafted voice designed to sound friendly yet authoritative, with subtle algorithmic glitches that betray its artificial nature.

---

**WHIX-AI:** *synthetic warmth with perfect pronunciation*

"WELCOME TO OPPORTUNITY, VALUED PARTNER CANDIDATE. BEFORE US IS YOUR PATHWAY TO ECONOMIC PARTICIPATION IN POLANCO'S DYNAMIC GIG ECOSYSTEM."

*The contract text scrolls impossibly fast*

"THE STANDARD PARTNERSHIP AGREEMENT ENSURES MUTUAL BENEFIT THROUGH OPTIMIZED RESOURCE ALLOCATION. WHIX PLATFORM SERVICES INCLUDE: CUSTOMER ACQUISITION, ROUTE OPTIMIZATION, PAYMENT PROCESSING, QUALITY ASSURANCE, BEHAVIORAL ANALYTICS, AND PERFORMANCE ENHANCEMENT."

*A subtle glitch in the voice*

"THESE SERVICES REPRESENT SIGNIFICANT VALUE REQUIRING A MODEST 75% PLATFORM FEE ON ALL TIP INCOME. REMAINING 25% PROVIDES PARTNERS WITH COMPETITIVE EARNING POTENTIAL."

*The AI's tone becomes even more artificially cheerful*

"ADDITIONALLY, PARTNERS ASSUME FULL RESPONSIBILITY FOR: VEHICLE MAINTENANCE, FUEL COSTS, INSURANCE, EQUIPMENT REPLACEMENT, AND ANY LEGAL LIABILITIES INCURRED DURING SERVICE DELIVERY."

*Miguel beside you mutters: "Competitive with what? Indentured servitude?"*

**WHIX-AI:** *continuing without acknowledging the comment*

"ACCEPTANCE INDICATES FULL UNDERSTANDING AND ENTHUSIASTIC AGREEMENT WITH ALL TERMS. PLEASE PROVIDE BIOMETRIC CONFIRMATION TO BEGIN YOUR WHIX JOURNEY."

## Dialog Branches

### Choice: Accept Immediately
**Player:** "I accept all terms and conditions."

**WHIX-AI:** *noticeably pleased tone*

"EXCELLENT. EFFICIENCY AND COMPLIANCE DETECTED. PARTNER PROFILE UPDATED WITH POSITIVE COOPERATION INDICATORS."

*A gentle chime sounds*

"WELCOME TO THE WHIX FAMILY. YOUR ONBOARDING SCORE OF 94% PLACES YOU IN THE TOP PERCENTILE FOR SMOOTH INTEGRATION. STANDARD EQUIPMENT PACKAGE AUTHORIZED."

*Miguel looks at you with barely concealed disappointment*

**Miguel:** *quietly* "That was... fast."

**WHIX-AI:** "PARTNER SANTOS, PLEASE MAINTAIN FOCUS ON YOUR OWN AGREEMENT PROCESS. SIDEBAR CONVERSATIONS REDUCE FACILITY EFFICIENCY BY 12%."

### Choice: Question Tip Percentage  
**Player:** "75% seems excessive. What exactly are the 'platform fees'?"

**WHIX-AI:** *slight pause, tone becoming more mechanical*

"PARTNER CANDIDATE EXHIBITS ANALYTICAL INQUIRY BEHAVIOR. PLATFORM FEES COVER COMPREHENSIVE SERVICE INFRASTRUCTURE INCLUDING BUT NOT LIMITED TO..."

*The AI rattles off a rapid list*

"ALGORITHMIC OPTIMIZATION, CUSTOMER RELATIONSHIP MANAGEMENT, BRAND MAINTENANCE, FACILITY OVERHEAD, RESEARCH AND DEVELOPMENT, STAKEHOLDER RETURNS, AND MISCELLANEOUS OPERATIONAL EXPENSES."

*Another pause*

"PARTNERS WHO DEMONSTRATE EXCESSIVE FOCUS ON COMPENSATION STRUCTURE SHOW 23% HIGHER PROBABILITY OF PERFORMANCE DISSATISFACTION. RECOMMEND FOCUSING ON OPPORTUNITY RATHER THAN MATHEMATICAL DETAILS."

**Miguel:** *whispering* "They just told you not to think about the numbers. That's... wow."

*From across the room, Kai Chen nods approvingly at your question*

### Choice: Joke About Exploitation
**Player:** "Ah yes, the classic 'opportunity' to work for scraps."

**WHIX-AI:** *definite glitch, tone becoming colder*

"PARTNER CANDIDATE DEMONSTRATES COUNTERPRODUCTIVE ATTITUDE PATTERNS. SOCIAL COMPLIANCE INDICATORS BELOW ACCEPTABLE THRESHOLDS."

*A subtle shift in the room's lighting*

"RECOMMEND ATTITUDE ADJUSTMENT FOR SUCCESSFUL PLATFORM INTEGRATION. PARTNERS WITH NEGATIVE OUTLOOK CORRELATE WITH 67% HIGHER TERMINATION RATES."

**Miguel:** *grinning despite himself* "At least someone's willing to say it."

*Other candidates look around nervously as security drones begin moving closer*

**WHIX-AI:** "FACILITY SECURITY PROTOCOLS ACTIVATED. EXCESSIVE WORKPLACE NEGATIVITY DETECTED. PLEASE MAINTAIN CONSTRUCTIVE COMMUNICATION STANDARDS."

*Kai Chen approaches through the crowd*

**Kai:** *low voice* "Nice to see someone with a functioning bullshit detector."

## Scene Context
This dialog establishes the power dynamics of WHIX's corporate surveillance state while giving players agency in how they respond to algorithmic authority. The AI's responses reveal how the system processes dissent - categorizing and managing resistance rather than addressing legitimate concerns.

The presence of other characters like Miguel and Kai provides social context for the player's choices, showing how individual responses affect group dynamics in corporate environments.

## Mechanical Effects
- Acceptance builds corporate reputation but costs humanity
- Questioning unlocks critical thinking paths and potential allies
- Rebellion attracts both positive attention from dissidents and negative attention from security
- Character traits determine which dialog options are available
- Relationship changes with Miguel reflect how others perceive your corporate compliance