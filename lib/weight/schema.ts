import { z } from "zod";

export const upsertWeightGoalSchema = z.object({
  startWeightKg: z.coerce.number().min(30).max(400),
  targetWeightKg: z.coerce.number().min(30).max(400),
  weeklyRateKg: z.coerce.number().min(0.1).max(2).default(0.5),
});

export const logWeightSchema = z.object({
  weightKg: z.coerce.number().min(30).max(400),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  note: z.string().trim().max(280).optional(),
});
