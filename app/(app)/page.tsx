import Link from "next/link";
import { getHabitStreak, getHabitsForUser, toggleHabitCompletion } from "@/lib/habits/actions";
import { startOfUtcDay, toDateKey } from "@/lib/date";
import { requireWhitelistedSession } from "@/lib/session";
import { getWeightDashboard, logWeight } from "@/lib/weight/actions";
import { HabitList } from "@/components/habits/habit-list";
import { LogWeightForm } from "@/components/weight/log-weight-form";
import { WeightSummary } from "@/components/weight/weight-summary";

export default async function TodayPage() {
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
  const doneCount = habitsWithStreak.filter((habit) => habit.completedToday).length;

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Aujourd&apos;hui</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Pesée + leviers. Le reste est dans les autres onglets.
        </p>
      </div>

      {!weight.goal ? (
        <p className="rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          Pas encore d&apos;objectif.{" "}
          <Link href="/goal" className="underline underline-offset-2">
            Définis-le ici
          </Link>
          .
        </p>
      ) : (
        <WeightSummary
          insight={weight.insight}
          goal={weight.goal}
          latestDate={weight.latest?.date}
          compact
        />
      )}

      <LogWeightForm action={logWeight} defaultWeight={weight.latest?.weightKg} today={today} />

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Leviers</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {habitsWithStreak.length === 0
                ? "Rien à cocher pour l'instant."
                : `${doneCount}/${habitsWithStreak.length} faits aujourd'hui`}
            </p>
          </div>
          <Link href="/habits" className="text-sm text-zinc-500 underline-offset-2 hover:underline">
            Gérer
          </Link>
        </div>
        <HabitList habits={habitsWithStreak} toggleAction={toggleHabitCompletion} mode="checkin" />
      </section>
    </>
  );
}
