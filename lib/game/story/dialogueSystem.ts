import { z } from 'zod';
import { NeurodivergentTraitSchema } from '../traits';

export const CharacterSchema = z.object({
  id: z.string(),
  name: z.string(),
  portrait: z.string().optional(),
  role: z.string(),
  personality: z.array(z.string()),
});

export type Character = z.infer<typeof CharacterSchema>;

export const DialogueChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
  requirement: z.object({
    trait: NeurodivergentTraitSchema.optional(),
    stat: z.enum(['focus', 'perception', 'social', 'logic', 'stamina']).optional(),
    minValue: z.number().optional(),
    previousChoice: z.string().optional(),
  }).optional(),
  outcome: z.object({
    nextDialogue: z.string(),
    relationship: z.record(z.number()).optional(),
    rewards: z.object({
      tips: z.number().optional(),
      experience: z.number().optional(),
      items: z.array(z.string()).optional(),
    }).optional(),
    flags: z.array(z.string()).optional(),
  }),
  traitContext: z.string().optional(), // Explains how the trait helps
});

export type DialogueChoice = z.infer<typeof DialogueChoiceSchema>;

export const DialogueNodeSchema = z.object({
  id: z.string(),
  speaker: z.string(),
  text: z.string(),
  emotion: z.enum(['neutral', 'happy', 'sad', 'angry', 'surprised', 'thinking']).default('neutral'),
  choices: z.array(DialogueChoiceSchema).optional(),
  nextId: z.string().optional(),
  isEnd: z.boolean().default(false),
});

export type DialogueNode = z.infer<typeof DialogueNodeSchema>;

export const StoryChapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  dialogues: z.array(DialogueNodeSchema),
  characters: z.array(CharacterSchema),
  startDialogue: z.string(),
  unlocksChapter: z.string().optional(),
  requirements: z.object({
    previousChapter: z.string().optional(),
    level: z.number().optional(),
    flags: z.array(z.string()).optional(),
  }).optional(),
});

export type StoryChapter = z.infer<typeof StoryChapterSchema>;

// Main Characters
export const MAIN_CHARACTERS: Record<string, Character> = {
  miguel: {
    id: 'miguel',
    name: 'Miguel',
    role: 'Player Character',
    personality: ['determined', 'curious', 'empathetic'],
  },
  tania: {
    id: 'tania',
    name: 'Tania',
    role: 'Legendary Partner',
    personality: ['brilliant', 'focused', 'rebellious'],
  },
  whix_manager: {
    id: 'whix_manager',
    name: 'District Manager Klein',
    role: 'Whix Representative',
    personality: ['corporate', 'calculating', 'condescending'],
  },
  kai: {
    id: 'kai',
    name: 'Kai',
    role: 'Fellow Partner',
    personality: ['friendly', 'anxious', 'supportive'],
  },
};

// Chapter 1: First Day at Whix
export const CHAPTER_1: StoryChapter = {
  id: 'chapter_1',
  title: 'First Day at Whix',
  description: 'Begin your journey as a Whix delivery partner and discover the truth about the system.',
  characters: [MAIN_CHARACTERS.miguel, MAIN_CHARACTERS.tania, MAIN_CHARACTERS.kai, MAIN_CHARACTERS.whix_manager],
  startDialogue: 'intro_1',
  dialogues: [
    {
      id: 'intro_1',
      speaker: 'narrator',
      text: 'The neon-lit streets of Neo Prosperity stretch before you as you approach the Whix Partner Center. Your first day as a delivery partner is about to begin.',
      emotion: 'neutral',
      nextId: 'intro_2',
      isEnd: false,
    },
    {
      id: 'intro_2',
      speaker: 'kai',
      text: "Hey! You must be the new partner. I'm Kai. Don't look so nervous - we all started somewhere.",
      emotion: 'happy',
      isEnd: false,
      choices: [
        {
          id: 'choice_1a',
          text: "I'm not nervous, just... processing everything.",
          outcome: {
            nextDialogue: 'kai_response_1a',
            relationship: { kai: 5 },
          },
        },
        {
          id: 'choice_1b',
          text: "[Systematic Thinking] I've analyzed the partner handbook. The 75% tip cut seems exploitative.",
          requirement: { trait: 'systematic_thinking' },
          traitContext: "Your systematic thinking allows you to quickly identify the unfair economics.",
          outcome: {
            nextDialogue: 'kai_response_1b',
            relationship: { kai: 10 },
            flags: ['aware_of_exploitation'],
          },
        },
        {
          id: 'choice_1c',
          text: "Thanks. Any tips for surviving here?",
          outcome: {
            nextDialogue: 'kai_response_1c',
            relationship: { kai: 3 },
          },
        },
      ],
    },
    {
      id: 'kai_response_1a',
      speaker: 'kai',
      text: "Processing, huh? I get that. This place can be overwhelming. But hey, at least we partners look out for each other.",
      emotion: 'thinking',
      nextId: 'manager_entrance',
      isEnd: false,
    },
    {
      id: 'kai_response_1b',
      speaker: 'kai',
      text: "*whispers* Shh! Not so loud... You're right, but the walls have ears here. Come find me later - there's someone you should meet.",
      emotion: 'surprised',
      nextId: 'manager_entrance',
      isEnd: false,
    },
    {
      id: 'kai_response_1c',
      speaker: 'kai',
      text: "Sure! First tip: don't question the system out loud. Second: find partners who share your... perspective. You'll understand soon.",
      emotion: 'neutral',
      nextId: 'manager_entrance',
      isEnd: false,
    },
    {
      id: 'manager_entrance',
      speaker: 'whix_manager',
      text: "Ah, our newest partner! Welcome to the Whix family. I'm District Manager Klein. I trust you're ready to deliver excellence?",
      emotion: 'happy',
      isEnd: false,
      choices: [
        {
          id: 'choice_2a',
          text: "Yes, I'm ready to work hard.",
          outcome: {
            nextDialogue: 'manager_response_2a',
            relationship: { whix_manager: 5 },
          },
        },
        {
          id: 'choice_2b',
          text: "[Pattern Recognition] Your smile doesn't match your eyes.",
          requirement: { trait: 'pattern_recognition' },
          traitContext: "You notice the disconnect between their expression and true emotions.",
          outcome: {
            nextDialogue: 'manager_response_2b',
            relationship: { whix_manager: -5 },
            flags: ['sees_through_manager'],
          },
        },
      ],
    },
    {
      id: 'manager_response_2a',
      speaker: 'whix_manager',
      text: "Excellent attitude! Remember, Whix takes 75% to ensure you get the best support and infrastructure. It's really quite generous of us.",
      emotion: 'neutral',
      nextId: 'tania_introduction',
      isEnd: false,
    },
    {
      id: 'manager_response_2b',
      speaker: 'whix_manager',
      text: "*smile falters* I see we have a... perceptive one. Just remember, perception without productivity is worthless here.",
      emotion: 'angry',
      nextId: 'tania_introduction',
      isEnd: false,
    },
    {
      id: 'tania_introduction',
      speaker: 'tania',
      text: "*A woman with intense focus in her eyes approaches after Klein leaves* That manager's spiel never gets less nauseating. I'm Tania.",
      emotion: 'neutral',
      isEnd: false,
      choices: [
        {
          id: 'choice_3a',
          text: "You don't seem to like the company much.",
          outcome: {
            nextDialogue: 'tania_response_3a',
            relationship: { tania: 5 },
          },
        },
        {
          id: 'choice_3b',
          text: "[Hyperfocus] I can see it in how you work - you zone in completely, don't you?",
          requirement: { trait: 'hyperfocus' },
          traitContext: "You recognize a fellow hyperfocuser's intensity.",
          outcome: {
            nextDialogue: 'tania_response_3b',
            relationship: { tania: 15 },
            flags: ['recognized_tania_trait'],
          },
        },
      ],
    },
    {
      id: 'tania_response_3a',
      speaker: 'tania',
      text: "Like it? I excel despite it. There's a difference. This system tries to exploit what makes us unique, but we can turn that around.",
      emotion: 'thinking',
      nextId: 'chapter_end',
      isEnd: false,
    },
    {
      id: 'tania_response_3b',
      speaker: 'tania',
      text: "*eyes light up* You get it. Yes, my hyperfocus is why I'm legendary tier. But it's also why I see through their manipulation. Want to learn how to use your traits against them?",
      emotion: 'happy',
      nextId: 'chapter_end',
      isEnd: false,
    },
    {
      id: 'chapter_end',
      speaker: 'narrator',
      text: "Your first day at Whix has revealed more questions than answers. But one thing is clear: you're not alone in seeing the system for what it is.",
      emotion: 'neutral',
      isEnd: true,
    },
  ],
};