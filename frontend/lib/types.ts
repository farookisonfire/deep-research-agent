import { z } from "zod";

export const PlanningEventSchema = z.object({
  type: z.literal("planning"),
  message: z.string().optional(),
  sub_questions: z.array(z.string()).optional(),
});

export const ResearchingEventSchema = z.object({
  type: z.literal("researching"),
  message: z.string().optional(),
  tool: z.string().optional(),
  query: z.string().optional(),
  snippet: z.string().optional(),
});

export const SynthesizingEventSchema = z.object({
  type: z.literal("synthesizing"),
  message: z.string().optional(),
});

export const CompleteEventSchema = z.object({
  type: z.literal("complete"),
  report: z.string(),
});

export const EvaluatedEventSchema = z.object({
  type: z.literal("evaluated"),
  relevance: z.number().int().min(0).max(10),
  completeness: z.number().int().min(0).max(10),
  confidence: z.number().int().min(0).max(10),
  notes: z.string(),
});

export const ErrorEventSchema = z.object({
  type: z.literal("error"),
  message: z.string(),
});

export const SSEEventSchema = z.discriminatedUnion("type", [
  PlanningEventSchema,
  ResearchingEventSchema,
  SynthesizingEventSchema,
  CompleteEventSchema,
  EvaluatedEventSchema,
  ErrorEventSchema,
]);

export type SSEEvent = z.infer<typeof SSEEventSchema>;
export type EvaluatedEvent = z.infer<typeof EvaluatedEventSchema>;
