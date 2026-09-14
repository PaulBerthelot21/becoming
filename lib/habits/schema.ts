import { z } from "zod";

export const createHabitSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(80),
  description: z.string().trim().max(280).optional(),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
