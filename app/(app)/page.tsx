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
  const todayWeight = weight.todayEntry?.weightKg ?? null;

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Aujourd&apos;hui</h1>
        <p className="mt-1 text-sm text-muted-foreground">Check-in du jour : pesée puis leviers.</p>
      </div>

      {!weight.goal ? (
        <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          Pas encore d&apos;objectif.{" "}
          <Link href="/goal" className="text-foreground underline underline-offset-2">
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

      <LogWeightForm
        action={logWeight}
        defaultWeight={todayWeight ?? weight.latest?.weightKg}
        today={today}
        weighedToday={weight.weighedToday}
        todayWeight={todayWeight}
      />

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Leviers</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {habitsWithStreak.length === 0
                ? "Rien à cocher pour l'instant."
                : `${doneCount}/${habitsWithStreak.length} faits aujourd'hui`}
            </p>
          </div>
          <Link
            href="/habits"
            className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Gérer
          </Link>
        </div>
        <HabitList habits={habitsWithStreak} toggleAction={toggleHabitCompletion} mode="checkin" />
      </section>
    </>
  );
}
