import {
  createHabit,
  deleteHabit,
  getHabitStreak,
  getHabitsForUser,
  toggleHabitCompletion,
} from "@/lib/habits/actions";
import { toDateKey, startOfUtcDay } from "@/lib/date";
import { requireWhitelistedSession } from "@/lib/session";
import { getWeightDashboard, logWeight, upsertWeightGoal } from "@/lib/weight/actions";
import { CreateHabitForm } from "@/components/habits/create-habit-form";
import { HabitList } from "@/components/habits/habit-list";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { LogWeightForm } from "@/components/weight/log-weight-form";
import { WeightChart } from "@/components/weight/weight-chart";
import { WeightGoalForm } from "@/components/weight/weight-goal-form";
import { WeightSummary } from "@/components/weight/weight-summary";

export default async function Home() {
  const session = await requireWhitelistedSession();
  const [weight, habits] = await Promise.all([
    getWeightDashboard(session.user.id),
    getHabitsForUser(session.user.id),
  ]);

  const habitsWithStreak = await Promise.all(
    habits.map(async (habit) => ({
      ...habit,
      streak: await getHabitStreak(habit.id, session.user.id),
    })),
  );

  const today = toDateKey(startOfUtcDay());

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Becoming</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Cut</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Poids d&apos;abord. Les habitudes soutiennent le rythme.
          </p>
        </div>
        <SignOutButton />
      </header>

      <WeightSummary insight={weight.insight} goal={weight.goal} latestDate={weight.latest?.date} />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Courbe 30 jours</h2>
        <WeightChart
          labels={weight.chart.labels}
          weights={weight.chart.weights}
          average7d={weight.chart.average7d}
          targetWeightKg={weight.goal?.targetWeightKg}
        />
      </section>

      <LogWeightForm action={logWeight} defaultWeight={weight.latest?.weightKg} today={today} />

      <WeightGoalForm action={upsertWeightGoal} defaults={weight.goal} />

      <section className="space-y-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Leviers du jour</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Marche, protéines, entraînement… ce que tu contrôles aujourd&apos;hui.
          </p>
        </div>
        <CreateHabitForm action={createHabit} />
        <HabitList
          habits={habitsWithStreak}
          toggleAction={toggleHabitCompletion}
          deleteAction={deleteHabit}
        />
      </section>
    </main>
  );
}
