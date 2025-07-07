---
id: "miguel-introduction"
type: "dialog"
title: "Meeting Miguel - First Day Nerves"
character: "miguel"
scene: "whix_onboarding_facility"
dialogType: "character_introduction"
mood: "nervous_optimistic"
triggers:
  - event: "chapter_1_start"
  - condition: "first_time_meeting"
choices:
  - id: "reassure_miguel"
    text: "Don't worry, we'll figure it out together"
    requirements: []
    consequences:
      relationshipChanges:
        miguel: 10
      humanityChange: 5
  - id: "share_nervousness" 
    text: "I'm nervous too, honestly"
    requirements:
      trait: "social_awareness"
    consequences:
      relationshipChanges:
        miguel: 15
      unlocksDialog: "miguel_bonding_moment"
  - id: "stay_professional"
    text: "Let's just focus on the orientation"
    consequences:
      relationshipChanges:
        miguel: -5
      humanityChange: -2
nextDialog: "whix_ai_terms_explanation"
---

# Dialog: Miguel Introduction

## Setting
The WHIX onboarding facility buzzes with corporate efficiency. New partners shuffle through stations, each clutching their acceptance notifications. The rain patters against the glass walls of Polanco's newest "opportunity center."

## Character Entrance
Miguel Santos adjusts his worn courier bag nervously, eyes darting between the corporate displays and the line of other hopefuls. His hyperfocus trait is evident in how he's memorized every word of the recruitment pamphlet, but his anxiety shows in the way he keeps reorganizing his bag contents.

---

**Miguel:** *fidgeting with his bag straps* 

"Seventy-three other people in this line. I've counted three times. They say WHIX only accepts one in twelve applicants, but looking around..." 

*He glances at you, then quickly away*

"Sorry, I do that when I'm nervous. Count things. Analyze patterns. My madre says it's because my brain works too fast for my mouth."

*He extends a slightly shaky hand*

"Miguel Santos. Delivery specialist, hopefully. Well, pending this whole orientation thing. You look less terrified than most of us - first rodeo?"

## Dialog Branches

### Choice: Reassure Miguel
**Player:** "Don't worry, we'll figure it out together."

**Miguel:** *visible relief crosses his face*

"Gracias. That's... actually really good to hear. I've been preparing for this for weeks - memorized the entire partner handbook, studied optimal route algorithms, even practiced small talk."

*He gives a self-deprecating laugh*

"Though apparently I'm still terrible at that last part. But hey, if we're both starting today, maybe we can watch each other's backs? This whole corporate machine feels pretty intimidating."

*He straightens up with more confidence*

"Plus, two heads are better than one when dealing with The Algorithm, right?"

### Choice: Share Nervousness
**Player:** "I'm nervous too, honestly."

**Miguel:** *his shoulders relax noticeably*

"Really? You hide it well. I was starting to think I was the only one whose stomach feels like it's doing parkour right now."

*He leans in conspiratorially*

"Between you and me, I've been researching WHIX for months. Not just the public stuff - I mean deep diving into former partner testimonials, efficiency metrics, the whole pattern of how they operate. And some of what I found..."

*He glances around cautiously*

"Well, let's just say they're very good at making the numbers look prettier than reality. But maybe that's exactly why they need people like us, you know? People who notice things others miss?"

*A moment of genuine connection*

"Feels good to know I'm not facing this alone."

### Choice: Stay Professional
**Player:** "Let's just focus on the orientation."

**Miguel:** *his expression becomes more guarded*

"Right. Of course. Professional focus. That's... that's probably the smart approach here."

*He adjusts his bag again, this time more stiffly*

"I suppose we'll all get to know each other soon enough through the work. WHIX does love their team-building metrics."

*He steps back slightly, creating more distance*

"Well, good luck with the orientation. May The Algorithm smile upon both our efficiency ratings."

## Scene Context
This dialog introduces Miguel as a character who combines analytical thinking with social anxiety, demonstrating how neurodivergent traits manifest in the pressure-cooker environment of Polanco's gig economy. The player's response sets the tone for their relationship - empathy builds trust, while distance reinforces the isolating nature of corporate culture.

The background details about WHIX's selection process and Miguel's research habits establish both his character traits and the world's surveillance capitalism themes.

## Mechanical Effects
- Relationship points with Miguel affect future dialog options
- Humanity changes reflect the player's empathy vs. corporate mindset
- Unlock conditions create branching narrative paths
- Character traits like "social_awareness" gate certain dialog options