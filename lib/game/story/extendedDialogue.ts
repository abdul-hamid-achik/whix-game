import { z } from 'zod';
import { DialogueChoiceSchema } from './dialogueSystem';

// Extended dialogue system for complex encounters
export const ExtendedDialogueNodeSchema = z.object({
  id: z.string(),
  speaker: z.string(),
  text: z.string(),
  emotion: z.enum(['neutral', 'happy', 'sad', 'angry', 'surprised', 'thinking', 'glitched', 'broken']).default('neutral'),
  choices: z.array(DialogueChoiceSchema).optional(),
  requirements: z.object({
    humanityIndex: z.number().optional(),
    items: z.array(z.string()).optional(),
    knowledge: z.array(z.string()).optional(),
    relationship: z.record(z.number()).optional(),
    partnershipStage: z.number().optional(),
  }).optional(),
  effects: z.object({
    visualEffect: z.string().optional(), // 'glitch', 'fade', 'shake'
    soundEffect: z.string().optional(),
    environmentChange: z.string().optional(),
  }).optional(),
  nextId: z.string().optional(),
  isEnd: z.boolean().default(false),
  triggersEncounter: z.string().optional(),
});

export type ExtendedDialogueNode = z.infer<typeof ExtendedDialogueNodeSchema>;

// Tania's Abandonment - Full Scene
export const TANIA_ABANDONMENT_DIALOGUE: ExtendedDialogueNode[] = [
  {
    id: 'tania_cathedral_intro',
    speaker: 'narrator',
    text: 'The cathedral bells have been replaced with delivery notifications. Their endless pinging creates a hymn to productivity.',
    emotion: 'neutral',
    effects: {
      soundEffect: 'notification_symphony',
      environmentChange: 'cathedral_dystopian',
    },
    nextId: 'tania_found',
    isEnd: false,
  },
  {
    id: 'tania_found',
    speaker: 'narrator',
    text: 'You find Tania at the quermes, surrounded by new partners. Their eyes are empty. Hers are worse—they\'re full of purpose.',
    emotion: 'neutral',
    nextId: 'miguel_approach',
    isEnd: false,
  },
  {
    id: 'miguel_approach',
    speaker: 'miguel',
    text: 'Tania! I\'ve been searching everywhere. My phone kept losing your signal—',
    emotion: 'surprised',
    nextId: 'tania_cold_response',
    isEnd: false,
  },
  {
    id: 'tania_cold_response',
    speaker: 'tania',
    text: 'Signals degrade. It\'s entropy, Miguel. Basic thermodynamics.',
    emotion: 'glitched',
    effects: {
      visualEffect: 'glitch',
      soundEffect: 'static_burst',
    },
    nextId: 'miguel_concern',
    isEnd: false,
  },
  {
    id: 'miguel_concern',
    speaker: 'miguel',
    text: 'What happened to you? This morning you were teaching me about optimal routes.',
    emotion: 'sad',
    nextId: 'tania_metrics',
    isEnd: false,
  },
  {
    id: 'tania_metrics',
    speaker: 'tania',
    text: 'This morning I was 4.7 stars. Now I\'m 4.9. Do you understand the mathematics of that jump?',
    emotion: 'broken',
    isEnd: false,
    choices: [
      {
        id: 'emotional_plea',
        text: "I understand you're scaring me.",
        outcome: {
          nextDialogue: 'tania_optimized_fear',
          relationship: { tania: -5 },
        },
      },
      {
        id: 'family_appeal',
        text: "The Tania I know wouldn't abandon family.",
        outcome: {
          nextDialogue: 'tania_tos_response',
          relationship: { tania: -10 },
          flags: ['tania_humanity_flicker'],
        },
      },
      {
        id: 'trait_empathy',
        text: "[Emotional Intelligence] You're not well. What did they do?",
        requirement: {
          trait: 'enhanced_senses',
        },
        traitContext: 'Your enhanced perception catches micro-expressions of pain.',
        outcome: {
          nextDialogue: 'tania_platinum_reveal',
          relationship: { tania: 5 },
          flags: ['learned_platinum_program'],
        },
      },
    ],
  },
  {
    id: 'tania_optimized_fear',
    speaker: 'tania',
    text: 'Fear? I\'ve optimized fear out of my performance metrics. You should too.',
    emotion: 'glitched',
    effects: {
      visualEffect: 'glitch',
    },
    nextId: 'platinum_whisper',
    isEnd: false,
  },
  {
    id: 'tania_tos_response',
    speaker: 'tania',
    text: 'Family? Check your terms of service, Miguel. Article 47.3: "Partners acknowledge no familial relationships exist within Whix operations."',
    emotion: 'broken',
    effects: {
      visualEffect: 'shake',
    },
    nextId: 'platinum_whisper',
    isEnd: false,
  },
  {
    id: 'tania_platinum_reveal',
    speaker: 'tania',
    text: 'The Platinum Program, Miguel. They offered me Platinum. Zero percent cut. Can you imagine? Keeping everything you earn?',
    emotion: 'glitched',
    effects: {
      visualEffect: 'glitch',
      soundEffect: 'heartbeat_electronic',
    },
    nextId: 'miguel_cost_question',
    isEnd: false,
  },
  {
    id: 'miguel_cost_question',
    speaker: 'miguel',
    text: 'At what cost?',
    emotion: 'angry',
    nextId: 'tania_breakdown',
    isEnd: false,
  },
  {
    id: 'tania_breakdown',
    speaker: 'tania',
    text: 'Cost-benefit analysis indicates—',
    emotion: 'glitched',
    effects: {
      visualEffect: 'glitch',
      soundEffect: 'static_crescendo',
    },
    nextId: 'tania_moment_clarity',
    isEnd: false,
  },
  {
    id: 'tania_moment_clarity',
    speaker: 'tania',
    text: 'No. Miguel, run. Run before you understand what I\'ve—',
    emotion: 'sad',
    effects: {
      visualEffect: 'fade',
    },
    nextId: 'partner_interrupt',
    isEnd: false,
  },
  {
    id: 'partner_interrupt',
    speaker: 'narrator',
    text: 'Her new partner, designation XK-77, whispers in her ear. The sound is like dial-up internet made flesh.',
    emotion: 'neutral',
    effects: {
      soundEffect: 'modem_whisper',
    },
    nextId: 'tania_termination',
    isEnd: false,
  },
  {
    id: 'tania_termination',
    speaker: 'tania',
    text: 'I\'m terminating our partnership. Check your app.',
    emotion: 'broken',
    effects: {
      soundEffect: 'notification_ping',
      environmentChange: 'partnership_terminated',
    },
    triggersEncounter: 'tania_boss_fight',
    isEnd: true,
  },
];

// Combat Dialogue - Tania Boss Fight
export const TANIA_COMBAT_DIALOGUE = {
  intro: "EFFICIENCY PROTOCOL ACTIVATED. ELIMINATING REDUNDANCY.",
  
  attackLines: [
    "Every hit reduces my efficiency rating!",
    "You're making me FEEL again!",
    "The algorithm doesn't account for love, Miguel!",
    "My optimization is... fragmenting...",
    "Star count decreasing... why does that hurt?",
  ],
  
  phaseTransitions: {
    phase2: "PLATINUM PROTOCOLS ENGAGING. EMOTION SUPPRESSION AT 74%.",
    phase3: "I REMEMBER... YOUR FIRST DAY... ERROR ERROR ERROR",
    defeat: "Miguel... I can see you. Really see you. Not your metrics. You.",
  },
  
  playerTraitReactions: {
    hyperfocus: "Your hyperfocus... I taught you that. Before I forgot how to teach.",
    pattern_recognition: "You see the patterns. Good. See how they're killing us.",
    enhanced_senses: "You sense it too—the humanity bleeding through the code.",
  },
};

// Old Timer Temporal Dialogues
export const OLD_TIMER_TEMPORAL_DIALOGUE: Record<number, ExtendedDialogueNode[]> = {
  1: [
    {
      id: 'first_approach',
      speaker: 'old_timer',
      text: 'Excuse me, young person. Do you have the time?',
      emotion: 'neutral',
      isEnd: false,
      effects: {
        visualEffect: 'time_stutter',
      },
      choices: [
        {
          id: 'give_current_time',
          text: "It's 3:47 PM.",
          outcome: {
            nextDialogue: 'wrong_time_response',
          },
        },
        {
          id: 'give_future_time',
          text: "[Time Perception] It's 4:00 PM.",
          requirement: {
            trait: 'pattern_recognition',
          },
          traitContext: 'You sense he needs the time 13 minutes from now.',
          outcome: {
            nextDialogue: 'temporal_recognition',
            rewards: {
              items: ['temporal_fragment'],
            },
          },
        },
      ],
    },
  ],
};

// Mateo Birthday Complex Dialogue Tree
export const MATEO_BIRTHDAY_DIALOGUE: Record<string, ExtendedDialogueNode> = {
  cake_delivery: {
    id: 'cake_delivery',
    speaker: 'miguel',
    text: 'I have something for the birthday boy.',
    emotion: 'happy',
    requirements: {
      items: ['race_car_cake'],
    },
    effects: {
      soundEffect: 'child_gasp',
      environmentChange: 'cage_house_opens',
    },
    nextId: 'mateo_reaction',
    isEnd: false,
  },
  
  mateo_reaction: {
    id: 'mateo_reaction',
    speaker: 'mateo',
    text: 'It\'s... it\'s exactly right. How did you know?',
    emotion: 'surprised',
    isEnd: false,
    choices: [
      {
        id: 'listened',
        text: "I listened.",
        outcome: {
          nextDialogue: 'mateo_broken',
          relationship: { mateo: 50 },
          rewards: {
            items: ['mateos_drawing'],
          },
        },
      },
      {
        id: 'lucky_guess',
        text: "Lucky guess.",
        outcome: {
          nextDialogue: 'mateo_knows',
          relationship: { mateo: 20 },
        },
      },
    ],
  },
  
  mateo_broken: {
    id: 'mateo_broken',
    speaker: 'mateo',
    text: 'Nobody listens. Are you broken like me?',
    emotion: 'sad',
    isEnd: false,
    choices: [
      {
        id: 'different_not_broken',
        text: "Maybe we're not broken. Maybe we just see differently.",
        outcome: {
          nextDialogue: 'mateo_tania_clue',
          relationship: { mateo: 100 },
          flags: ['mateo_best_friend'],
        },
      },
    ],
  },
  
  mateo_tania_clue: {
    id: 'mateo_tania_clue',
    speaker: 'mateo',
    text: 'The lady you\'re chasing—she said that too. Before she changed. She cried here, right where you\'re standing.',
    emotion: 'thinking',
    effects: {
      environmentChange: 'reveal_tania_tears',
    },
    isEnd: true,
  },
};