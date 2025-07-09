import { z } from 'zod';

// Puzzle type enum
export const PuzzleTypeSchema = z.enum(['route_optimization', 'package_sorting', 'schedule_analysis', 'pattern_decode']);
export type PuzzleType = z.infer<typeof PuzzleTypeSchema>;

// Route optimization data schema
export const RouteOptimizationDataSchema = z.object({
  gridSize: z.number(),
  startPosition: z.object({ x: z.number(), y: z.number() }),
  deliveryPoints: z.array(z.object({ 
    x: z.number(), 
    y: z.number(), 
    priority: z.string().optional() 
  })),
  obstacles: z.array(z.object({ x: z.number(), y: z.number() })),
});

// Package sorting data schema
export const PackageSortingDataSchema = z.object({
  packages: z.array(z.object({
    id: z.string(),
    district: z.string(),
    priority: z.string(),
    weight: z.number(),
    fragile: z.boolean().optional(),
  })),
  sortingCriteria: z.array(z.string()).optional(),
  bins: z.array(z.object({
    id: z.string(),
    label: z.string(),
    capacity: z.number(),
    rules: z.array(z.string()),
  })).optional(),
});

// Schedule analysis data schema
export const ScheduleAnalysisDataSchema = z.object({
  timeSlots: z.array(z.object({
    time: z.string(),
    available: z.boolean(),
  })),
  deliveries: z.array(z.object({
    id: z.string(),
    duration: z.number(),
    priority: z.enum(['low', 'medium', 'high']),
    constraints: z.array(z.string()).optional(),
  })),
});

// Pattern decode data schema
export const PatternDecodeDataSchema = z.object({
  sequence: z.array(z.union([z.string(), z.number()])),
  patternType: z.enum(['numeric', 'alphanumeric', 'symbolic']),
  hints: z.array(z.string()),
});

// Solution schemas
export const RouteOptimizationSolutionSchema = z.array(z.enum(['up', 'down', 'left', 'right']));
export const PackageSortingSolutionSchema = z.record(z.string(), z.string()); // packageId -> binId
export const ScheduleAnalysisSolutionSchema = z.array(z.object({
  deliveryId: z.string(),
  timeSlot: z.string(),
}));
export const PatternDecodeSolutionSchema = z.union([z.string(), z.number()]);

// Union schemas for puzzle data
export const PuzzleDataSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('route_optimization'), data: RouteOptimizationDataSchema }),
  z.object({ type: z.literal('package_sorting'), data: PackageSortingDataSchema }),
  z.object({ type: z.literal('schedule_analysis'), data: ScheduleAnalysisDataSchema }),
  z.object({ type: z.literal('pattern_decode'), data: PatternDecodeDataSchema }),
]);

// Main puzzle schema
export const PuzzleSchema = z.object({
  id: z.string(),
  type: PuzzleTypeSchema,
  difficulty: z.number(),
  timeLimit: z.number(),
  description: z.string(),
  data: z.union([
    RouteOptimizationDataSchema,
    PackageSortingDataSchema,
    ScheduleAnalysisDataSchema,
    PatternDecodeDataSchema,
  ]),
  solution: z.union([
    RouteOptimizationSolutionSchema,
    PackageSortingSolutionSchema,
    ScheduleAnalysisSolutionSchema,
    PatternDecodeSolutionSchema,
  ]).nullable().optional(),
});

// Type exports
export type Puzzle = z.infer<typeof PuzzleSchema>;
export type RouteOptimizationData = z.infer<typeof RouteOptimizationDataSchema>;
export type PackageSortingData = z.infer<typeof PackageSortingDataSchema>;
export type ScheduleAnalysisData = z.infer<typeof ScheduleAnalysisDataSchema>;
export type PatternDecodeData = z.infer<typeof PatternDecodeDataSchema>;