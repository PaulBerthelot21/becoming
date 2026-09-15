"use server";

import { z } from "zod";
import { mealTypes } from "@/lib/food/schema";
import { prisma } from "@/lib/prisma";
import { revalidateApp } from "@/lib/revalidate";
import { requireWhitelistedSession } from "@/lib/session";
import { startOfUtcDay } from "@/lib/date";

const backupSchema = z.object({
  version: z.literal(1),
  weightGoal: z
    .object({
      startWeightKg: z.number(),
      targetWeightKg: z.number(),
      weeklyRateKg: z.number(),
    })
    .nullable()
    .optional(),
  nutritionGoal: z
    .object({
      calorieTarget: z.number().int(),
      proteinTargetG: z.number(),
    })
    .nullable()
    .optional(),
  weightEntries: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        weightKg: z.number(),
        note: z.string().nullable().optional(),
      }),
    )
    .optional(),
  foodEntries: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        mealType: z.enum(mealTypes),
        name: z.string(),
        notes: z.string().nullable().optional(),
        imageUrl: z.string().nullable().optional(),
        calories: z.number().nullable().optional(),
        proteinG: z.number().nullable().optional(),
        carbsG: z.number().nullable().optional(),
        fatG: z.number().nullable().optional(),
      }),
    )
    .optional(),
  foodFavorites: z
    .array(
      z.object({
        name: z.string(),
        mealType: z.enum(mealTypes).nullable().optional(),
        notes: z.string().nullable().optional(),
        calories: z.number().nullable().optional(),
        proteinG: z.number().nullable().optional(),
        carbsG: z.number().nullable().optional(),
        fatG: z.number().nullable().optional(),
      }),
    )
    .optional(),
  habits: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().nullable().optional(),
        completions: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
      }),
    )
    .optional(),
});

export async function buildUserBackup(userId: string) {
  const [weightGoal, nutritionGoal, weightEntries, foodEntries, foodFavorites, habits] =
    await Promise.all([
      prisma.weightGoal.findUnique({ where: { userId } }),
      prisma.nutritionGoal.findUnique({ where: { userId } }),
      prisma.weightEntry.findMany({ where: { userId }, orderBy: { date: "asc" } }),
      prisma.foodEntry.findMany({
        where: { userId },
        orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      }),
      prisma.foodFavorite.findMany({ where: { userId }, orderBy: { name: "asc" } }),
      prisma.habit.findMany({
        where: { userId },
        include: { completions: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

  return {
    version: 1 as const,
    exportedAt: new Date().toISOString(),
    weightGoal: weightGoal
      ? {
          startWeightKg: weightGoal.startWeightKg,
          targetWeightKg: weightGoal.targetWeightKg,
          weeklyRateKg: weightGoal.weeklyRateKg,
        }
      : null,
    nutritionGoal: nutritionGoal
      ? {
          calorieTarget: nutritionGoal.calorieTarget,
          proteinTargetG: nutritionGoal.proteinTargetG,
        }
      : null,
    weightEntries: weightEntries.map((entry) => ({
      date: entry.date.toISOString().slice(0, 10),
      weightKg: entry.weightKg,
      note: entry.note,
    })),
    foodEntries: foodEntries.map((entry) => ({
      date: entry.date.toISOString().slice(0, 10),
      mealType: entry.mealType,
      name: entry.name,
      notes: entry.notes,
      imageUrl: entry.imageUrl,
      calories: entry.calories,
      proteinG: entry.proteinG,
      carbsG: entry.carbsG,
      fatG: entry.fatG,
    })),
    foodFavorites: foodFavorites.map((favorite) => ({
      name: favorite.name,
      mealType: favorite.mealType,
      notes: favorite.notes,
      calories: favorite.calories,
      proteinG: favorite.proteinG,
      carbsG: favorite.carbsG,
      fatG: favorite.fatG,
    })),
    habits: habits.map((habit) => ({
      name: habit.name,
      description: habit.description,
      completions: habit.completions.map((c) => c.date.toISOString().slice(0, 10)),
    })),
  };
}

export async function importUserBackup(formData: FormData) {
  const session = await requireWhitelistedSession();
  const raw = String(formData.get("backup") || "");

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { error: "JSON invalide" };
  }

  const parsed = backupSchema.safeParse(json);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Backup invalide" };
  }

  const data = parsed.data;
  const userId = session.user.id;

  if (data.weightGoal) {
    await prisma.weightGoal.upsert({
      where: { userId },
      create: { userId, ...data.weightGoal },
      update: data.weightGoal,
    });
  }

  if (data.nutritionGoal) {
    await prisma.nutritionGoal.upsert({
      where: { userId },
      create: { userId, ...data.nutritionGoal },
      update: data.nutritionGoal,
    });
  }

  for (const entry of data.weightEntries ?? []) {
    const date = startOfUtcDay(new Date(`${entry.date}T00:00:00.000Z`));
    await prisma.weightEntry.upsert({
      where: { userId_date: { userId, date } },
      create: {
        userId,
        date,
        weightKg: entry.weightKg,
        note: entry.note ?? null,
      },
      update: {
        weightKg: entry.weightKg,
        note: entry.note ?? null,
      },
    });
  }

  for (const entry of data.foodEntries ?? []) {
    await prisma.foodEntry.create({
      data: {
        userId,
        date: startOfUtcDay(new Date(`${entry.date}T00:00:00.000Z`)),
        mealType: entry.mealType,
        name: entry.name,
        notes: entry.notes ?? null,
        imageUrl: entry.imageUrl ?? null,
        calories: entry.calories ?? null,
        proteinG: entry.proteinG ?? null,
        carbsG: entry.carbsG ?? null,
        fatG: entry.fatG ?? null,
      },
    });
  }

  for (const favorite of data.foodFavorites ?? []) {
    await prisma.foodFavorite.upsert({
      where: { userId_name: { userId, name: favorite.name } },
      create: {
        userId,
        name: favorite.name,
        mealType: favorite.mealType ?? null,
        notes: favorite.notes ?? null,
        calories: favorite.calories ?? null,
        proteinG: favorite.proteinG ?? null,
        carbsG: favorite.carbsG ?? null,
        fatG: favorite.fatG ?? null,
      },
      update: {
        mealType: favorite.mealType ?? null,
        notes: favorite.notes ?? null,
        calories: favorite.calories ?? null,
        proteinG: favorite.proteinG ?? null,
        carbsG: favorite.carbsG ?? null,
        fatG: favorite.fatG ?? null,
      },
    });
  }

  for (const habit of data.habits ?? []) {
    let existing = await prisma.habit.findFirst({
      where: { userId, name: habit.name },
    });
    if (!existing) {
      existing = await prisma.habit.create({
        data: {
          userId,
          name: habit.name,
          description: habit.description ?? null,
        },
      });
    }
    for (const day of habit.completions ?? []) {
      const date = startOfUtcDay(new Date(`${day}T00:00:00.000Z`));
      await prisma.habitCompletion.upsert({
        where: { habitId_date: { habitId: existing.id, date } },
        create: { habitId: existing.id, date },
        update: {},
      });
    }
  }

  revalidateApp();
  return { success: true };
}
