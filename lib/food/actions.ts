"use server";

import { startOfUtcDay, toDateKey } from "@/lib/date";
import { createFoodEntrySchema, mealTypes, parseFoodMacros } from "@/lib/food/schema";
import { prisma } from "@/lib/prisma";
import { revalidateApp } from "@/lib/revalidate";
import { requireWhitelistedSession } from "@/lib/session";

export async function createFoodEntry(formData: FormData) {
  const session = await requireWhitelistedSession();
  const parsed = createFoodEntrySchema.safeParse({
    name: formData.get("name"),
    mealType: formData.get("mealType") || "snack",
    date: formData.get("date") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
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
      calories: macros.calories,
      proteinG: macros.proteinG,
      carbsG: macros.carbsG,
      fatG: macros.fatG,
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

  await prisma.foodEntry.delete({ where: { id: entryId } });
  revalidateApp();
  return { success: true };
}

export async function getFoodDay(userId: string, dateKey?: string) {
  const day = dateKey ? startOfUtcDay(new Date(`${dateKey}T00:00:00.000Z`)) : startOfUtcDay();

  const entries = await prisma.foodEntry.findMany({
    where: { userId, date: day },
    orderBy: [{ createdAt: "asc" }],
  });

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
        .map((entry) => ({
          id: entry.id,
          name: entry.name,
          notes: entry.notes,
          calories: entry.calories,
          proteinG: entry.proteinG,
          carbsG: entry.carbsG,
          fatG: entry.fatG,
        })),
    ]),
  ) as Record<
    (typeof mealTypes)[number],
    Array<{
      id: string;
      name: string;
      notes: string | null;
      calories: number | null;
      proteinG: number | null;
      carbsG: number | null;
      fatG: number | null;
    }>
  >;

  return {
    date: toDateKey(day),
    entries: entries.map((entry) => ({
      id: entry.id,
      mealType: entry.mealType,
      name: entry.name,
      notes: entry.notes,
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
