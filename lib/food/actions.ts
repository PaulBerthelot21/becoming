"use server";

import { del } from "@vercel/blob";
import { isVercelBlobUrl, mealBlobBelongsToUser } from "@/lib/blob";
import { startOfUtcDay, toDateKey } from "@/lib/date";
import {
  copyFoodDaySchema,
  createFoodEntrySchema,
  mealTypes,
  parseFoodMacros,
  updateFoodEntrySchema,
  upsertNutritionGoalSchema,
} from "@/lib/food/schema";
import { prisma } from "@/lib/prisma";
import { revalidateApp } from "@/lib/revalidate";
import { requireWhitelistedSession } from "@/lib/session";

type FoodItem = {
  id: string;
  mealType: (typeof mealTypes)[number];
  name: string;
  notes: string | null;
  imageUrl: string | null;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
};

function summarizeEntries(
  entries: Array<{
    id: string;
    mealType: (typeof mealTypes)[number];
    name: string;
    notes: string | null;
    imageUrl: string | null;
    calories: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
  }>,
) {
  const totals = entries.reduce(
    (acc, entry) => {
      acc.calories += entry.calories ?? 0;
      acc.proteinG += entry.proteinG ?? 0;
      acc.carbsG += entry.carbsG ?? 0;
      acc.fatG += entry.fatG ?? 0;
      acc.count += 1;
      if (
        entry.calories != null ||
        entry.proteinG != null ||
        entry.carbsG != null ||
        entry.fatG != null
      ) {
        acc.hasAnyMacros = true;
      }
      return acc;
    },
    {
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      count: 0,
      hasAnyMacros: false,
    },
  );

  const byMeal = Object.fromEntries(
    mealTypes.map((mealType) => [
      mealType,
      entries
        .filter((entry) => entry.mealType === mealType)
        .map((entry): FoodItem => ({
          id: entry.id,
          mealType: entry.mealType,
          name: entry.name,
          notes: entry.notes,
          imageUrl: entry.imageUrl,
          calories: entry.calories,
          proteinG: entry.proteinG,
          carbsG: entry.carbsG,
          fatG: entry.fatG,
        })),
    ]),
  ) as Record<(typeof mealTypes)[number], FoodItem[]>;

  return {
    entries: entries.map((entry) => ({
      id: entry.id,
      mealType: entry.mealType,
      name: entry.name,
      notes: entry.notes,
      imageUrl: entry.imageUrl,
      calories: entry.calories,
      proteinG: entry.proteinG,
      carbsG: entry.carbsG,
      fatG: entry.fatG,
    })),
    byMeal,
    totals: {
      calories: totals.calories,
      proteinG: Number(totals.proteinG.toFixed(1)),
      carbsG: Number(totals.carbsG.toFixed(1)),
      fatG: Number(totals.fatG.toFixed(1)),
      count: totals.count,
      hasAnyMacros: totals.hasAnyMacros,
    },
  };
}

export async function upsertNutritionGoal(formData: FormData) {
  const session = await requireWhitelistedSession();
  const parsed = upsertNutritionGoalSchema.safeParse({
    calorieTarget: formData.get("calorieTarget"),
    proteinTargetG: formData.get("proteinTargetG"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  await prisma.nutritionGoal.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      calorieTarget: parsed.data.calorieTarget,
      proteinTargetG: parsed.data.proteinTargetG,
    },
    update: {
      calorieTarget: parsed.data.calorieTarget,
      proteinTargetG: parsed.data.proteinTargetG,
    },
  });

  revalidateApp();
  return { success: true };
}

export async function getNutritionGoal(userId: string) {
  const goal = await prisma.nutritionGoal.findUnique({ where: { userId } });
  if (!goal) return null;
  return {
    calorieTarget: goal.calorieTarget,
    proteinTargetG: goal.proteinTargetG,
  };
}

export async function createFoodEntry(formData: FormData) {
  const session = await requireWhitelistedSession();
  const imageUrlRaw = String(formData.get("imageUrl") || "").trim();
  const parsed = createFoodEntrySchema.safeParse({
    name: formData.get("name"),
    mealType: formData.get("mealType") || "snack",
    date: formData.get("date") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  if (
    imageUrlRaw &&
    (!isVercelBlobUrl(imageUrlRaw) || !mealBlobBelongsToUser(imageUrlRaw, session.user.id))
  ) {
    return { error: "URL photo invalide" };
  }

  const macros = parseFoodMacros(formData);
  if ("error" in macros) {
    return { error: macros.error };
  }

  const date = parsed.data.date
    ? startOfUtcDay(new Date(`${parsed.data.date}T00:00:00.000Z`))
    : startOfUtcDay();

  await prisma.foodEntry.create({
    data: {
      userId: session.user.id,
      date,
      mealType: parsed.data.mealType,
      name: parsed.data.name,
      notes: parsed.data.notes || null,
      imageUrl: imageUrlRaw || null,
      calories: macros.calories,
      proteinG: macros.proteinG,
      carbsG: macros.carbsG,
      fatG: macros.fatG,
    },
  });

  revalidateApp();
  return { success: true };
}

export async function updateFoodEntry(formData: FormData) {
  const session = await requireWhitelistedSession();
  const imageUrlRaw = String(formData.get("imageUrl") || "").trim();
  const clearImage = String(formData.get("clearImage") || "") === "1";

  const parsed = updateFoodEntrySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    mealType: formData.get("mealType") || "snack",
    date: formData.get("date") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const existing = await prisma.foodEntry.findFirst({
    where: { id: parsed.data.id, userId: session.user.id },
  });
  if (!existing) {
    return { error: "Entrée introuvable" };
  }

  if (
    imageUrlRaw &&
    (!isVercelBlobUrl(imageUrlRaw) || !mealBlobBelongsToUser(imageUrlRaw, session.user.id))
  ) {
    return { error: "URL photo invalide" };
  }

  const macros = parseFoodMacros(formData);
  if ("error" in macros) {
    return { error: macros.error };
  }

  const date = parsed.data.date
    ? startOfUtcDay(new Date(`${parsed.data.date}T00:00:00.000Z`))
    : existing.date;

  let nextImageUrl: string | null = existing.imageUrl;
  if (clearImage) {
    nextImageUrl = null;
  } else if (imageUrlRaw) {
    nextImageUrl = imageUrlRaw;
  }

  if (
    existing.imageUrl &&
    existing.imageUrl !== nextImageUrl &&
    process.env.BLOB_READ_WRITE_TOKEN
  ) {
    try {
      await del(existing.imageUrl);
    } catch {
      // Ignore blob delete failures.
    }
  }

  await prisma.foodEntry.update({
    where: { id: existing.id },
    data: {
      date,
      mealType: parsed.data.mealType,
      name: parsed.data.name,
      notes: parsed.data.notes || null,
      imageUrl: nextImageUrl,
      calories: macros.calories,
      proteinG: macros.proteinG,
      carbsG: macros.carbsG,
      fatG: macros.fatG,
    },
  });

  revalidateApp();
  return { success: true };
}

export async function copyFoodDay(formData: FormData) {
  const session = await requireWhitelistedSession();
  const parsed = copyFoodDaySchema.safeParse({
    sourceDate: formData.get("sourceDate"),
    targetDate: formData.get("targetDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dates invalides" };
  }

  if (parsed.data.sourceDate === parsed.data.targetDate) {
    return { error: "Source et cible identiques" };
  }

  const source = startOfUtcDay(new Date(`${parsed.data.sourceDate}T00:00:00.000Z`));
  const target = startOfUtcDay(new Date(`${parsed.data.targetDate}T00:00:00.000Z`));

  const entries = await prisma.foodEntry.findMany({
    where: { userId: session.user.id, date: source },
    orderBy: { createdAt: "asc" },
  });

  if (entries.length === 0) {
    return { error: "Rien à copier ce jour-là" };
  }

  await prisma.foodEntry.createMany({
    data: entries.map((entry) => ({
      userId: session.user.id,
      date: target,
      mealType: entry.mealType,
      name: entry.name,
      notes: entry.notes,
      imageUrl: null,
      calories: entry.calories,
      proteinG: entry.proteinG,
      carbsG: entry.carbsG,
      fatG: entry.fatG,
    })),
  });

  revalidateApp();
  return { success: true, count: entries.length };
}

export async function listFoodFavorites(userId: string) {
  return prisma.foodFavorite.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function addFavoriteFromEntry(entryId: string) {
  const session = await requireWhitelistedSession();
  const entry = await prisma.foodEntry.findFirst({
    where: { id: entryId, userId: session.user.id },
  });
  if (!entry) {
    return { error: "Entrée introuvable" };
  }

  await prisma.foodFavorite.upsert({
    where: {
      userId_name: {
        userId: session.user.id,
        name: entry.name,
      },
    },
    create: {
      userId: session.user.id,
      name: entry.name,
      mealType: entry.mealType,
      notes: entry.notes,
      calories: entry.calories,
      proteinG: entry.proteinG,
      carbsG: entry.carbsG,
      fatG: entry.fatG,
    },
    update: {
      mealType: entry.mealType,
      notes: entry.notes,
      calories: entry.calories,
      proteinG: entry.proteinG,
      carbsG: entry.carbsG,
      fatG: entry.fatG,
    },
  });

  revalidateApp();
  return { success: true };
}

export async function removeFavorite(favoriteId: string) {
  const session = await requireWhitelistedSession();
  const favorite = await prisma.foodFavorite.findFirst({
    where: { id: favoriteId, userId: session.user.id },
  });
  if (!favorite) {
    return { error: "Favori introuvable" };
  }
  await prisma.foodFavorite.delete({ where: { id: favorite.id } });
  revalidateApp();
  return { success: true };
}

export async function createFoodFromFavorite(formData: FormData) {
  const session = await requireWhitelistedSession();
  const favoriteId = String(formData.get("favoriteId") || "");
  const dateRaw = String(formData.get("date") || "").trim();

  const favorite = await prisma.foodFavorite.findFirst({
    where: { id: favoriteId, userId: session.user.id },
  });
  if (!favorite) {
    return { error: "Favori introuvable" };
  }

  const date =
    dateRaw && /^\d{4}-\d{2}-\d{2}$/.test(dateRaw)
      ? startOfUtcDay(new Date(`${dateRaw}T00:00:00.000Z`))
      : startOfUtcDay();

  await prisma.foodEntry.create({
    data: {
      userId: session.user.id,
      date,
      mealType: favorite.mealType ?? "snack",
      name: favorite.name,
      notes: favorite.notes,
      imageUrl: null,
      calories: favorite.calories,
      proteinG: favorite.proteinG,
      carbsG: favorite.carbsG,
      fatG: favorite.fatG,
    },
  });

  revalidateApp();
  return { success: true };
}

export async function deleteFoodEntry(entryId: string) {
  const session = await requireWhitelistedSession();

  const existing = await prisma.foodEntry.findFirst({
    where: { id: entryId, userId: session.user.id },
  });

  if (!existing) {
    return { error: "Entrée introuvable" };
  }

  if (existing.imageUrl && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(existing.imageUrl);
    } catch {
      // Keep deleting the DB row even if blob cleanup fails.
    }
  }

  await prisma.foodEntry.delete({ where: { id: entryId } });
  revalidateApp();
  return { success: true };
}

export async function getFoodDay(userId: string, dateKey?: string) {
  const day = dateKey ? startOfUtcDay(new Date(`${dateKey}T00:00:00.000Z`)) : startOfUtcDay();

  const [entries, goal] = await Promise.all([
    prisma.foodEntry.findMany({
      where: { userId, date: day },
      orderBy: [{ createdAt: "asc" }],
    }),
    getNutritionGoal(userId),
  ]);

  const summary = summarizeEntries(entries);

  return {
    date: toDateKey(day),
    ...summary,
    goal,
    progress: goal
      ? {
          caloriesPct: Math.min(
            100,
            Math.round((summary.totals.calories / goal.calorieTarget) * 100),
          ),
          proteinPct: Math.min(
            100,
            Math.round((summary.totals.proteinG / goal.proteinTargetG) * 100),
          ),
        }
      : null,
  };
}

export async function getFoodWeek(userId: string, endDateKey?: string) {
  const end = endDateKey ? startOfUtcDay(new Date(`${endDateKey}T00:00:00.000Z`)) : startOfUtcDay();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 6);

  const [entries, goal] = await Promise.all([
    prisma.foodEntry.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
    getNutritionGoal(userId),
  ]);

  const days: Array<{
    date: string;
    count: number;
    calories: number;
    proteinG: number;
  }> = [];

  for (let i = 0; i < 7; i += 1) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + i);
    const key = toDateKey(day);
    const dayEntries = entries.filter((entry) => toDateKey(entry.date) === key);
    const calories = dayEntries.reduce((sum, entry) => sum + (entry.calories ?? 0), 0);
    const proteinG = dayEntries.reduce((sum, entry) => sum + (entry.proteinG ?? 0), 0);
    days.push({
      date: key,
      count: dayEntries.length,
      calories,
      proteinG: Number(proteinG.toFixed(1)),
    });
  }

  const daysWithProtein = days.filter((day) => day.proteinG > 0);
  const avgProtein =
    daysWithProtein.length > 0
      ? Number(
          (
            daysWithProtein.reduce((sum, day) => sum + day.proteinG, 0) / daysWithProtein.length
          ).toFixed(1),
        )
      : null;

  const daysWithCalories = days.filter((day) => day.calories > 0);
  const avgCalories =
    daysWithCalories.length > 0
      ? Math.round(
          daysWithCalories.reduce((sum, day) => sum + day.calories, 0) / daysWithCalories.length,
        )
      : null;

  return { days, goal, avgProtein, avgCalories };
}
