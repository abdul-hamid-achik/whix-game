import { z } from 'zod';

// Generic JSON-like data schemas
export const JsonValueSchema: z.ZodSchema = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.record(JsonValueSchema),
    z.array(JsonValueSchema),
  ])
);

export const JsonObjectSchema = z.record(JsonValueSchema);
export const JsonArraySchema = z.array(JsonValueSchema);

// Event and handler schemas
export const EventDataSchema = z.object({
  type: z.string(),
  payload: JsonObjectSchema.optional(),
  timestamp: z.number().optional(),
});

export const HandlerFunctionSchema = z.function()
  .args(EventDataSchema)
  .returns(z.union([z.void(), z.promise(z.void())]));

// DOM and React event schemas
export const MouseEventDataSchema = z.object({
  clientX: z.number(),
  clientY: z.number(),
  pageX: z.number(),
  pageY: z.number(),
  screenX: z.number(),
  screenY: z.number(),
  button: z.number(),
  buttons: z.number(),
  ctrlKey: z.boolean(),
  shiftKey: z.boolean(),
  altKey: z.boolean(),
  metaKey: z.boolean(),
});

export const KeyboardEventDataSchema = z.object({
  key: z.string(),
  code: z.string(),
  keyCode: z.number(),
  ctrlKey: z.boolean(),
  shiftKey: z.boolean(),
  altKey: z.boolean(),
  metaKey: z.boolean(),
  repeat: z.boolean(),
});

export const ChangeEventDataSchema = z.object({
  target: z.object({
    value: z.string(),
    name: z.string().optional(),
    type: z.string().optional(),
    checked: z.boolean().optional(),
  }),
});

// API response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: JsonValueSchema.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const PaginatedResponseSchema = z.object({
  items: z.array(JsonObjectSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  hasMore: z.boolean(),
});

// Form and validation schemas
export const FormFieldSchema = z.object({
  name: z.string(),
  value: JsonValueSchema,
  error: z.string().optional(),
  touched: z.boolean().optional(),
});

export const FormDataSchema = z.record(z.string(), JsonValueSchema);

// Function parameter schemas
export const CallbackFunctionSchema = z.function()
  .args(z.unknown())
  .returns(z.unknown());

export const AsyncCallbackFunctionSchema = z.function()
  .args(z.unknown())
  .returns(z.promise(z.unknown()));

// Style and CSS schemas
export const CSSPropertiesSchema = z.record(z.string(), z.union([z.string(), z.number()]));

export const StyleObjectSchema = z.object({
  className: z.string().optional(),
  style: CSSPropertiesSchema.optional(),
});

// Error schemas
export const ErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  stack: z.string().optional(),
  cause: z.unknown().optional(),
});

// Utility schemas
export const RequirementSchema = z.object({
  type: z.string(),
  value: JsonValueSchema,
  operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin']).optional(),
});

export const RewardSchema = z.object({
  type: z.string(),
  amount: z.number(),
  itemId: z.string().optional(),
  data: JsonObjectSchema.optional(),
});

// Map and location schemas
export const CoordinateSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number().optional(),
});

export const MapDataSchema = z.object({
  width: z.number(),
  height: z.number(),
  tiles: z.array(z.array(z.number())),
  objects: z.array(z.object({
    id: z.string(),
    type: z.string(),
    position: CoordinateSchema,
    data: JsonObjectSchema.optional(),
  })).optional(),
});

// Combat and game mechanics schemas
export const CombatActionSchema = z.object({
  type: z.enum(['move', 'attack', 'ability', 'item', 'wait', 'defend']),
  targetId: z.string().optional(),
  targetPosition: CoordinateSchema.optional(),
  abilityId: z.string().optional(),
  itemId: z.string().optional(),
});

export const CombatResultSchema = z.object({
  success: z.boolean(),
  damage: z.number().optional(),
  effects: z.array(z.string()).optional(),
  message: z.string().optional(),
});

// Puzzle schemas
export const PuzzleDataSchema = z.object({
  type: z.string(),
  difficulty: z.number(),
  config: JsonObjectSchema,
  solution: JsonValueSchema,
  hints: z.array(z.string()).optional(),
});

export const PuzzleAttemptSchema = z.object({
  puzzleId: z.string(),
  attempt: JsonValueSchema,
  timestamp: z.number(),
  correct: z.boolean(),
});

// Type exports
export type JsonValue = z.infer<typeof JsonValueSchema>;
export type JsonObject = z.infer<typeof JsonObjectSchema>;
export type JsonArray = z.infer<typeof JsonArraySchema>;
export type EventData = z.infer<typeof EventDataSchema>;
export type HandlerFunction = z.infer<typeof HandlerFunctionSchema>;
export type MouseEventData = z.infer<typeof MouseEventDataSchema>;
export type KeyboardEventData = z.infer<typeof KeyboardEventDataSchema>;
export type ChangeEventData = z.infer<typeof ChangeEventDataSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type PaginatedResponse = z.infer<typeof PaginatedResponseSchema>;
export type FormField = z.infer<typeof FormFieldSchema>;
export type FormData = z.infer<typeof FormDataSchema>;
export type CSSProperties = z.infer<typeof CSSPropertiesSchema>;
export type StyleObject = z.infer<typeof StyleObjectSchema>;
export type ErrorObject = z.infer<typeof ErrorSchema>;
export type Requirement = z.infer<typeof RequirementSchema>;
export type Reward = z.infer<typeof RewardSchema>;
export type Coordinate = z.infer<typeof CoordinateSchema>;
export type MapData = z.infer<typeof MapDataSchema>;
export type CombatAction = z.infer<typeof CombatActionSchema>;
export type CombatResult = z.infer<typeof CombatResultSchema>;
export type PuzzleData = z.infer<typeof PuzzleDataSchema>;
export type PuzzleAttempt = z.infer<typeof PuzzleAttemptSchema>;