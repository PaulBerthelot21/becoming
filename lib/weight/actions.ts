"use server";

import { movingAverage, startOfUtcDay, toDateKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { revalidateApp } from "@/lib/revalidate";
import { requireWhitelistedSession } from "@/lib/session";
import {
  logWeightSchema,
  updateWeightEntrySchema,
  upsertWeightGoalSchema,
} from "@/lib/weight/schema";

export async function upsertWeightGoal(formData: FormData) {
  const session = await requireWhitelistedSession();
  const parsed = upsertWeightGoalSchema.safeParse({
    startWeightKg: formData.get("startWeightKg"),
    targetWeightKg: formData.get("targetWeightKg"),
    weeklyRateKg: formData.get("weeklyRateKg") || 0.5,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { startWeightKg, targetWeightKg, weeklyRateKg } = parsed.data;

  if (targetWeightKg >= startWeightKg) {
    return { error: "Le poids cible doit être inférieur au poids de départ." };
  }

  await prisma.weightGoal.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      startWeightKg,
      targetWeightKg,
      weeklyRateKg,
    },
    update: {
      startWeightKg,
      targetWeightKg,
      weeklyRateKg,
    },
  });

  revalidateApp();
  return { success: true };
}

export async function logWeight(formData: FormData) {
  const session = await requireWhitelistedSession();
  const parsed = logWeightSchema.safeParse({
    weightKg: formData.get("weightKg"),
    date: formData.get("date") || undefined,
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const date = parsed.data.date
    ? startOfUtcDay(new Date(`${parsed.data.date}T00:00:00.000Z`))
    : startOfUtcDay();

  const existing = await prisma.weightEntry.findUnique({
    where: {
      userId_date: {
        userId: session.user.id,
        date,
      },
    },
    select: { id: true },
  });

  await prisma.weightEntry.upsert({
    where: {
      userId_date: {
        userId: session.user.id,
        date,
      },
    },
    create: {
      userId: session.user.id,
      date,
      weightKg: parsed.data.weightKg,
      note: parsed.data.note || null,
    },
    update: {
      weightKg: parsed.data.weightKg,
      note: parsed.data.note || null,
    },
  });

  revalidateApp();
  return {
    success: true as const,
    updated: Boolean(existing),
    weightKg: parsed.data.weightKg,
    date: toDateKey(date),
  };
}

export async function updateWeightEntry(formData: FormData) {
  const session = await requireWhitelistedSession();
  const parsed = updateWeightEntrySchema.safeParse({
    id: formData.get("id"),
    weightKg: formData.get("weightKg"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const existing = await prisma.weightEntry.findFirst({
    where: { id: parsed.data.id, userId: session.user.id },
  });

  if (!existing) {
    return { error: "Pesée introuvable" };
  }

  await prisma.weightEntry.update({
    where: { id: existing.id },
    data: {
      weightKg: parsed.data.weightKg,
      note: parsed.data.note || null,
    },
  });

  revalidateApp();
  return { success: true };
}

export async function deleteWeightEntry(entryId: string) {
  const session = await requireWhitelistedSession();

  const existing = await prisma.weightEntry.findFirst({
    where: { id: entryId, userId: session.user.id },
  });

  if (!existing) {
    return { error: "Pesée introuvable" };
  }

  await prisma.weightEntry.delete({ where: { id: existing.id } });
  revalidateApp();
  return { success: true };
}

export async function getWeightHistory(userId: string, limit = 60) {
  const entries = await prisma.weightEntry.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: limit,
  });

  return entries.map((entry) => ({
    id: entry.id,
    date: toDateKey(entry.date),
    weightKg: entry.weightKg,
    note: entry.note,
  }));
}

export async function getWeightDashboard(userId: string) {
  const today = startOfUtcDay();
  const from = new Date(today);
  from.setUTCDate(from.getUTCDate() - 29);

  const [goal, entries] = await Promise.all([
    prisma.weightGoal.findUnique({ where: { userId } }),
    prisma.weightEntry.findMany({
      where: {
        userId,
        date: { gte: from, lte: today },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  const latest = await prisma.weightEntry.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });

  const todayEntry = await prisma.weightEntry.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });

  const byDate = new Map(entries.map((entry) => [toDateKey(entry.date), entry.weightKg]));

  const labels: string[] = [];
  const weights: Array<number | null> = [];

  for (let i = 29; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setUTCDate(today.getUTCDate() - i);
    const key = toDateKey(day);
    labels.push(key);
    weights.push(byDate.get(key) ?? null);
  }

  const average7d = movingAverage(weights, 7);
  const currentWeight = latest?.weightKg ?? goal?.startWeightKg ?? null;

  let weekChange: number | null = null;
  const filled = weights
    .map((value, index) => ({ value, index }))
    .filter((item): item is { value: number; index: number } => item.value != null);

  if (filled.length >= 2) {
    const last = filled[filled.length - 1];
    const weekAgoIndex = last.index - 7;
    const previous = filled.filter((item) => item.index <= weekAgoIndex).at(-1) ?? filled[0];
    if (previous.index !== last.index) {
      weekChange = Number((last.value - previous.value).toFixed(2));
    }
  }

  const remainingKg =
    currentWeight != null && goal ? Number((currentWeight - goal.targetWeightKg).toFixed(2)) : null;

  const progressPct =
    currentWeight != null && goal
      ? Math.min(
          100,
          Math.max(
            0,
            ((goal.startWeightKg - currentWeight) / (goal.startWeightKg - goal.targetWeightKg)) *
              100,
          ),
        )
      : null;

  const estimatedWeeksLeft =
    remainingKg != null && goal && goal.weeklyRateKg > 0 && remainingKg > 0
      ? Math.ceil(remainingKg / goal.weeklyRateKg)
      : remainingKg != null && remainingKg <= 0
        ? 0
        : null;

  return {
    goal: goal
      ? {
          startWeightKg: goal.startWeightKg,
          targetWeightKg: goal.targetWeightKg,
          weeklyRateKg: goal.weeklyRateKg,
        }
      : null,
    latest: latest
      ? {
          weightKg: latest.weightKg,
          date: toDateKey(latest.date),
          note: latest.note,
        }
      : null,
    weighedToday: Boolean(todayEntry),
    todayEntry: todayEntry
      ? {
          weightKg: todayEntry.weightKg,
          date: toDateKey(todayEntry.date),
          note: todayEntry.note,
        }
      : null,
    chart: {
      labels,
      weights,
      average7d,
    },
    insight: {
      currentWeight,
      weekChange,
      remainingKg,
      progressPct: progressPct != null ? Number(progressPct.toFixed(1)) : null,
      estimatedWeeksLeft,
      onTrack: weekChange == null || goal == null ? null : weekChange <= -goal.weeklyRateKg * 0.5,
    },
  };
}
