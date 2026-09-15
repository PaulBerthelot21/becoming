"use server";

import { createHabitSchema } from "@/lib/habits/schema";
import { CUT_HABIT_TEMPLATES, type CutHabitTemplateId } from "@/lib/habits/templates";
import { startOfUtcDay } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { revalidateApp } from "@/lib/revalidate";
import { requireWhitelistedSession } from "@/lib/session";

export async function createHabit(formData: FormData) {
  const session = await requireWhitelistedSession();
  const parsed = createHabitSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  await prisma.habit.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
    },
  });

  revalidateApp();
  return { success: true };
}

export async function addHabitFromTemplate(templateId: CutHabitTemplateId) {
  const session = await requireWhitelistedSession();
  const template = CUT_HABIT_TEMPLATES.find((item) => item.id === templateId);

  if (!template) {
    return { error: "Template introuvable" };
  }

  const existing = await prisma.habit.findFirst({
    where: {
      userId: session.user.id,
      name: template.name,
    },
  });

  if (existing) {
    return { error: `"${template.name}" est déjà dans tes leviers.` };
  }

  await prisma.habit.create({
    data: {
      userId: session.user.id,
      name: template.name,
      description: template.description,
    },
  });

  revalidateApp();
  return { success: true };
}

export async function deleteHabit(habitId: string) {
  const session = await requireWhitelistedSession();

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: session.user.id },
  });

  if (!habit) {
    return { error: "Habitude introuvable" };
  }

  await prisma.habit.delete({ where: { id: habitId } });
  revalidateApp();
  return { success: true };
}

export async function toggleHabitCompletion(habitId: string, dateKey?: string) {
  const session = await requireWhitelistedSession();
  const day =
    dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)
      ? startOfUtcDay(new Date(`${dateKey}T00:00:00.000Z`))
      : startOfUtcDay();

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: session.user.id },
  });

  if (!habit) {
    return { error: "Habitude introuvable" };
  }

  const existing = await prisma.habitCompletion.findUnique({
    where: {
      habitId_date: {
        habitId,
        date: day,
      },
    },
  });

  if (existing) {
    await prisma.habitCompletion.delete({ where: { id: existing.id } });
  } else {
    await prisma.habitCompletion.create({
      data: {
        habitId,
        date: day,
      },
    });
  }

  revalidateApp();
  return { success: true };
}

export async function getHabitsWeekRate(userId: string) {
  const habits = await getHabitsForUser(userId);
  if (habits.length === 0) {
    return { ratePct: null as number | null, done: 0, total: 0 };
  }

  const done = habits.reduce((sum, habit) => sum + habit.weekCompletions.length, 0);
  const total = habits.length * 7;
  return {
    ratePct: Math.round((done / total) * 100),
    done,
    total,
  };
}

export async function getHabitsForUser(userId: string) {
  const today = startOfUtcDay();
  const weekAgo = new Date(today);
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 6);

  const habits = await prisma.habit.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      completions: {
        where: {
          date: {
            gte: weekAgo,
            lte: today,
          },
        },
        orderBy: { date: "asc" },
      },
    },
  });

  return habits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    description: habit.description,
    completedToday: habit.completions.some(
      (completion) => completion.date.getTime() === today.getTime(),
    ),
    weekCompletions: habit.completions.map((completion) =>
      completion.date.toISOString().slice(0, 10),
    ),
  }));
}

export async function getHabitStreak(habitId: string, userId: string) {
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
    include: {
      completions: {
        orderBy: { date: "desc" },
        take: 365,
      },
    },
  });

  if (!habit) {
    return 0;
  }

  let streak = 0;
  const cursor = startOfUtcDay();

  const completedDates = new Set(
    habit.completions.map((completion) => completion.date.toISOString().slice(0, 10)),
  );

  // If today is not completed, start counting from yesterday
  if (!completedDates.has(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  while (completedDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}
