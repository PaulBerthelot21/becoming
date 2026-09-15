"use server";

import { startOfUtcDay, toDateKey } from "@/lib/date";
import { getFoodWeek } from "@/lib/food/actions";
import { getHabitsWeekRate } from "@/lib/habits/actions";
import { prisma } from "@/lib/prisma";

export async function getWeeklyInsights(userId: string) {
  const today = startOfUtcDay();
  const weekAgo = new Date(today);
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);

  const [weights, foodWeek, goal, habitsWeek] = await Promise.all([
    prisma.weightEntry.findMany({
      where: {
        userId,
        date: { gte: weekAgo, lte: today },
      },
      orderBy: { date: "asc" },
    }),
    getFoodWeek(userId),
    prisma.weightGoal.findUnique({ where: { userId } }),
    getHabitsWeekRate(userId),
  ]);

  let weightChange: number | null = null;
  if (weights.length >= 2) {
    weightChange = Number((weights[weights.length - 1].weightKg - weights[0].weightKg).toFixed(2));
  } else if (weights.length === 1) {
    const older = await prisma.weightEntry.findFirst({
      where: { userId, date: { lt: weights[0].date } },
      orderBy: { date: "desc" },
    });
    if (older) {
      weightChange = Number((weights[0].weightKg - older.weightKg).toFixed(2));
    }
  }

  const lines: string[] = [];

  if (weightChange != null) {
    const sign = weightChange > 0 ? "+" : "";
    lines.push(`Cette semaine ${sign}${weightChange.toFixed(1)} kg`);
  } else {
    lines.push("Pas assez de pesées pour la tendance semaine");
  }

  if (foodWeek.avgProtein != null) {
    lines.push(`Protéines moyennes ${foodWeek.avgProtein}g/jour`);
  }

  if (foodWeek.avgCalories != null) {
    lines.push(`Calories moyennes ${foodWeek.avgCalories} kcal/jour`);
  }

  if (goal && weightChange != null) {
    const onTrack = weightChange <= -goal.weeklyRateKg * 0.5;
    lines.push(onTrack ? "Rythme cut : dans la cible" : "Rythme cut : sous la cible");
  }

  if (foodWeek.goal && foodWeek.avgProtein != null) {
    const proteinOk = foodWeek.avgProtein >= foodWeek.goal.proteinTargetG * 0.85;
    lines.push(
      proteinOk
        ? "Protéines : plutôt solides cette semaine"
        : "Protéines : en dessous de ta cible moyenne",
    );
  }

  if (habitsWeek.ratePct != null) {
    lines.push(`Leviers semaine : ${habitsWeek.ratePct}% (${habitsWeek.done}/${habitsWeek.total})`);
    if (habitsWeek.ratePct < 50 && weightChange != null && weightChange > -0.2) {
      lines.push("Leviers faibles + poids stagnant : priorise 2–3 checks cette semaine");
    } else if (habitsWeek.ratePct >= 70) {
      lines.push("Leviers bien tenus : garde le rythme");
    }
  }

  return {
    weightChange,
    avgProtein: foodWeek.avgProtein,
    avgCalories: foodWeek.avgCalories,
    habitsRatePct: habitsWeek.ratePct,
    lines,
    from: toDateKey(weekAgo),
    to: toDateKey(today),
  };
}
