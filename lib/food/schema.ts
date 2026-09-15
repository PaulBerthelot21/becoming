import { z } from "zod";

export const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const;

export const mealTypeLabels: Record<(typeof mealTypes)[number], string> = {
  breakfast: "Petit-déj",
  lunch: "Déjeuner",
  dinner: "Dîner",
  snack: "Collation",
};

export const createFoodEntrySchema = z.object({
  name: z.string().trim().min(1, "Décris ce que tu as mangé").max(120),
  mealType: z.enum(mealTypes).default("snack"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  notes: z.string().trim().max(280).optional(),
});

export const upsertNutritionGoalSchema = z.object({
  calorieTarget: z.coerce.number().int().min(800).max(6000),
  proteinTargetG: z.coerce.number().min(20).max(400),
});

function optionalFinite(value: FormDataEntryValue | null, max: number) {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > max) return undefined;
  return n;
}

export function parseFoodMacros(formData: FormData) {
  const calories = optionalFinite(formData.get("calories"), 5000);
  const proteinG = optionalFinite(formData.get("proteinG"), 500);
  const carbsG = optionalFinite(formData.get("carbsG"), 500);
  const fatG = optionalFinite(formData.get("fatG"), 500);

  if (
    calories === undefined ||
    proteinG === undefined ||
    carbsG === undefined ||
    fatG === undefined
  ) {
    return { error: "Macros invalides" as const };
  }

  return {
    calories: calories == null ? null : Math.round(calories),
    proteinG,
    carbsG,
    fatG,
  };
}
