---
id: "chapter-1-first-day"
type: "chapter"
title: "Chapter 1: First Day on the Job"
description: "Miguel's first delivery becomes a moral crisis when corporate protocols conflict with human decency"
chapterNumber: 1
act: 1
setting: "WHIX Distribution Center - Onboarding Facility"
timeOfDay: "morning"
weather: "rain"
mainCharacters: ["miguel", "whix_itztli", "kai", "first_partner"]
choices:
  - id: "accept_terms"
    description: "Accept WHIX's terms without reading"
    consequences:
      humanityChange: -5
      relationshipChanges:
        whix_itztli: 10
      givesItem: "standard_scanner"
  - id: "question_terms"
    description: "Ask about the 75% tip cut"
    requirements:
      trait: "analytical_thinking"
    consequences:
      humanityChange: 5
      unlocksPath: "rebel_sympathy"
      relationshipChanges:
        kai: 15
  - id: "make_joke"
    description: "Make a joke about corporate exploitation"
    consequences:
      humanityChange: 10
      relationshipChanges:
        first_partner: 20
        whix_itztli: -10
musicTrack: "corporate_dystopia_ambient"
backgroundImage: "whix_facility_rain"
tags: ["tutorial", "story_start", "character_introduction", "world_building"]
published: true
---

# Chapter 1: First Day on the Job

## Opening Scene

*Paquete 47A-Delta. Destinatario: Dra. Sarah Chen, Torres de Lujo Poniente. Contenido: Medicamentos. Prioridad: URGENTE.*

Miguel Santos runs through the rain-soaked streets of Mexico City's Polanco District, his neural interface buzzing with delivery alerts. The package in his weatherproof bag weighs three pounds but feels heavier—like it's carrying someone's hope.

He's been a WHIX partner for exactly four hours.

*ALERTA: Ventana de entrega expira en 7 minutos. Penalización por retraso: reducción del 50% de propina.*

The Torres de Lujo rise before him—brutalist Soviet architecture crowned with golden Aztec eagles, each building a monument to the Party-State's fusion of communist efficiency and imperial grandeur. Above, surveillance helicopters patrol in geometric patterns, their rotors beating like ceremonial drums. Unlike the drones in other cities, these machines bear the double-headed serpent of Quetzalcoatl wrapped around the hammer and sickle.

Miguel stops at every intersection to check both his route and the mood of the Vigilantes Comunitarios—neighborhood watch volunteers whose feathered armbands and red stars make them easy to spot. His anxiety knots his stomach as he navigates the contradiction that is modern Mexico: ancient symbols serving totalitarian surveillance.

*'You got this, Miguel,'* he mutters to himself, a habit from childhood. *'Just one delivery at a time.'*

But as he approaches the tower's pristine lobby, something makes him freeze. Through the rain-streaked glass, he sees her—Dr. Chen—not waiting for her medicine, but convulsing on the floor while security guards stand motionless, watching.

Watching. Recording. Analyzing.

Not helping.

Miguel's first delivery is about to become his first choice: follow corporate protocol, or follow his conscience.

## Four Hours Earlier: The Onboarding Facility

The WHIX Distribution Center squats in the shadow of the Templo de la Eficiencia like a concrete pyramid, its walls adorned with massive murals blending Soviet realism and Aztec imagery: workers with obsidian tools harvesting digital corn under the watchful eye of Huitzilopochtli wearing a commissar's cap. Holographic banners flutter above: "LA EFICIENCIA ES VIRTUD," "LA OPTIMIZACIÓN NOS AGUARDA," "TU VALOR = TU PRODUCCIÓN."

Miguel stands in line with forty-seven other hopefuls, each clutching their acceptance notification like an offering to Quetzalcoatl. Which, in a city where the Party-State's automation programs have eliminated 73% of traditional jobs, it basically is.

His neural interface—a secondhand model from three firmware updates ago, stamped with both the Secretaría de Trabajo logo and a small obsidian serpent—buzzes with anxiety alerts. *Frecuencia cardíaca elevada. Pico de cortisol detectado. Se recomiendan ejercicios de respiración.*

"Fucking hell," he mutters, earning a sharp look from the corporate monitor in hi-vis yellow. "Sorry. I mean... fudging heck."

The woman ahead of him snorts with laughter. She's maybe twenty-five, with purple hair and movements that suggest her nervous system processes the world at a different frequency than everyone else's. Her backpack gets reorganized every thirty seconds—precise, ritualistic, calming.

"First day?" she asks without looking at him, her attention focused on arranging charging cables by length.

"Yeah. You?"

"Third attempt. Failed the first two for 'insufficient corporate attitude integration.'" She makes air quotes with her free hand. "Basically, I asked too many questions about why they needed access to my medical records for a delivery job."

Miguel's anxiety spikes again. Medical records? "What'd you find out?"

"That they're specifically recruiting people like us." She finally looks at him, sharp green eyes that seem to catalog every detail of his face in seconds. "Neurodivergent. Pattern recognition, hyperfocus, sensory sensitivity. Traits that make us 'inefficient' in the Party-State's standardized production quotas but valuable for... other purposes."

"Other purposes?"

"I'm Tania, by the way. Tania Volkov." She extends a hand with calloused fingertips—someone who works with her hands. Her surname marks her as part of the Russian émigré community that fled to Mexico after the Second Revolution. "And you're having an anxiety attack. I can see it in your breathing pattern. Want some chicle? Helps with the nervous chewing."

Miguel takes the offered gum gratefully. "Miguel Santos. And yeah, job interviews aren't exactly my strong suit."

"It's not a job interview," Tania says, her voice dropping lower. "It's an assessment. They're measuring how we process information, react to stress, recognize patterns they've missed. Look around."

Miguel follows her gaze. The other candidates aren't just nervous job seekers—they're a carefully curated collection of neurodivergent individuals, each displaying different traits. The woman solving routing puzzles at inhuman speed. The man who's counted every person in the room three times. The teenager whose eyes track movement patterns that others can't see.

"Jesus," Miguel breathes. "We're not employees. We're..."

"Resources," Tania finishes. "The question is: what are they planning to extract from us?"

## The Onboarding AI

"BIENVENIDOS, COMPAÑEROS CANDIDATOS VALORADOS."

The voice materializes from speakers carved in the shape of coiled serpents, their obsidian eyes glowing red. It speaks in mechanical Spanish with undertones of Nahuatl pronunciation, as if programmed by bureaucrats who learned indigenous languages from surveillance transcripts.

"SOY WHIX-ITZTLI, SU FACILITADOR DE INTEGRACIÓN. NOTA: ESTA INTERACCIÓN ESTÁ SIENDO REGISTRADA PARA ASEGURAMIENTO DE CALIDAD, ANÁLISIS DE PATRONES CONDUCTUALES, Y ESTABLECIMIENTO DE LÍNEA BASE NEURAL."

Tania mutters under her breath, "Establecimiento de línea base neural. They're not even hiding it anymore."

Miguel's about to ask what that means when the AI continues:

"MIGUEL SANTOS. ID DE EMPLEADO: MS-4471. TRASTORNO DE ANSIEDAD, GENERALIZADO. RECONOCIMIENTO DE PATRONES: SOBRE EL PROMEDIO. COMPLIANCE SOCIAL: VARIABLE. POTENCIAL DE OPTIMIZACIÓN: ALTO."

The words hit Miguel like cold water. How does it know his medical history? His social compliance rating?

"TANIA VOLKOV. ID DE EMPLEADO: TV-2156. CAPACIDADES DE HIPERFOCO: EXCEPCIONALES. ANÁLISIS DE PATRONES: SUPERIOR. INTENTOS PREVIOS DE OPTIMIZACIÓN: TRES. INDICADORES DE RESISTENCIA: PREOCUPANTES."

Tania's jaw tightens. "Previous optimization attempts?"

"PROCEDAN A LAS ESTACIONES DE EVALUACIÓN INDIVIDUAL. LA RESISTENCIA A LOS PROTOCOLOS DE INTEGRACIÓN CORPORATIVA SERÁ ANOTADA EN SUS REGISTROS PERMANENTES DE EFICIENCIA."

### Choice Point 1: First Impression

How do you respond to the WHIX-AI's greeting?

1. **Stay Silent** - Better not to draw attention on day one
2. **Agree with Purple Hair** - "Heard they docked someone for blinking too much"
3. **Defend WHIX** - "At least it's work, right?"

## The Contract

A holographic contract materializes before you, its text scrolling faster than any human could read. The AI's voice continues its relentless onboarding:

"STANDARD PARTNER AGREEMENT. WHIX RETAINS 75% OF ALL TIPS AS PROCESSING AND PLATFORM FEES. PARTNERS ARE INDEPENDENT CONTRACTORS RESPONSIBLE FOR ALL EXPENSES. ACCEPTANCE INDICATES UNDERSTANDING OF TERMS."

Purple Hair turns to you. "Seventy-five percent. And they wonder why we can barely afford nutrient paste."

You notice their eyes darting across the contract at incredible speed, actually reading it. Pattern recognition, maybe? Or hyperlexia?

### Choice Point 2: The Terms

The contract hovers, waiting for your thumbprint. What do you do?

[Choices as defined in metadata]

## Meeting Your First Partner

After the bureaucratic gauntlet, you're directed to Partner Assignment. The room is filled with people who don't quite fit the corporate mold—some pace in perfect patterns, others stare intensely at nothing, a few engage in repetitive movements that seem to calm them.

"Society's rejects," someone says beside you. Kai Chen, according to their badge, watches the room with calculating eyes. "That's what they call us. But look closer."

They gesture to a woman rapidly solving a routing puzzle that stumped three others. "Hyperfocus. That guy there? He noticed a pattern in delivery schedules that saves 20 minutes per route. The Algorithm can't replicate what we do naturally."

"They exploit what makes us different," Kai continues. "But maybe that's also how we beat them."

### Your First Partner

The assignment system pairs you with [Name varies based on player choices], whose [trait] immediately stands out. They extend a hand—or don't, depending on their sensory preferences.

"Guess we're partners now," they say. "Fair warning: I don't do small talk, I eat the same lunch every day, and I will absolutely info-dump about my special interest in pre-WHIX urban architecture. That cool with you?"

## The Tutorial Mission

Your first delivery seems simple: transport a package from Point A to Point B. But this is Polanco, where simple doesn't exist.

The rain has turned the streets into rivers of neon reflections. Your partner's enhanced senses pick up things you miss—a surveillance drone's hum, the pattern of police patrols, the safest route through the chaos.

"First lesson," your partner says, navigating with uncanny precision. "WHIX tracks everything—speed, route efficiency, customer interaction time. But they designed their system for neurotypical patterns. We're glitches in their matrix."

### The Bond

Halfway through the delivery, Tania stops in a narrow alley, rain dripping from fire escapes above. She's been quiet since leaving the facility, her pattern-scanning eyes taking in everything.

"Miguel," she says suddenly. "Your anxiety - it's not a weakness. I can see how you process the city. You notice things others miss because you're always scanning for threats."

Miguel looks around, realizing she's right. He's automatically cataloged escape routes, noted which windows have residents home, identified the least surveilled path.

"In there," Tania continues, pointing to the WHIX facility, "they made it sound like our 'differences' are problems to be fixed. But what if they're actually advantages they want to harvest?"

She pulls out the delivery tracker, examining it closely. "Something's wrong. This device... it's recording way more than route data."

Looking at the screen together, they see it's logging conversation snippets, emotional responses, who's home, purchasing preferences, even stress indicators in people's voices.

"Shit," Tania breathes. "This isn't just delivery tracking. They're building psychological profiles of every person we interact with."

Miguel feels his anxiety spike, but Tania puts a steadying hand on his shoulder.

"Hey. We figured this out together. Your worry plus my pattern recognition. Maybe that's why they paired us - not to complement each other, but to see how our different minds work together under pressure."

For the first time all day, Miguel's anxiety feels useful rather than debilitating. "So what do we do?"

Tania grins - the first genuine smile he's seen from her. "We beat them at their own game. But first, we need to understand exactly what game they're playing."

### Choice Point 3: The Moral Dilemma

What do you do about the surveillance discovery?

1. **Disable Data Collection** - Turn off unauthorized surveillance features
   - +15 Humanity
   - Protect customer privacy
   - Risk corporate suspicion

2. **Report Discovery to WHIX** - Follow corporate protocols
   - -20 Humanity  
   - +500 efficiency bonus
   - Partner trust decreases

3. **Investigate Further** - Try to learn what WHIX is really collecting
   - Unlock surveillance investigation subplot
   - Gain valuable intelligence
   - Increased corporate monitoring risk

## Chapter Conclusion

Back at your pod that night, the day's events replay in your mind. The city's neon glow filters through your single window, painting everything in shades of corporate surveillance.

Your partner's words echo: "They're building psychological profiles of everyone we interact with."

Maybe understanding that is the first step toward fighting it.

Your WHIX device pings with tomorrow's assignments. The tip count is pathetic after the company's cut, but something else has value now—knowledge that every delivery is also intelligence gathering, every interaction another data point in someone's displacement algorithm.

In this city of surveillance and manipulation, being aware isn't just an advantage.

It's a revolution waiting to happen.

## Post-Chapter Notes

### World-Building Elements Introduced
- WHIX's surveillance capitalism model
- Neurodivergent traits as advantages and surveillance targets
- The beginning of surveillance awareness
- Corporate data collection state
- Economic exploitation through gig work

### Character Relationships Started
- First Partner (varies)
- Kai Chen (potential ally)
- WHIX-AI (surveillance system)

### Mechanical Tutorials Covered
- Basic delivery gameplay
- Choice consequence system
- Humanity Index introduction
- Partner ability usage
- Surveillance awareness mechanics

### Foreshadowing
- The comprehensive surveillance system
- Kai's mysterious background and resistance connections
- The "data collection" beyond delivery needs
- Community targeting through behavioral analysis