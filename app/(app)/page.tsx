import Link from "next/link";
import { getHabitStreak, getHabitsForUser, toggleHabitCompletion } from "@/lib/habits/actions";
import { getFoodDay } from "@/lib/food/actions";
import { getWeeklyInsights } from "@/lib/insights";
import { startOfUtcDay, toDateKey } from "@/lib/date";
import { requireWhitelistedSession } from "@/lib/session";
import { getWeightDashboard, logWeight } from "@/lib/weight/actions";
import { HabitList } from "@/components/habits/habit-list";
import { LogWeightForm } from "@/components/weight/log-weight-form";
import { WeightSummary } from "@/components/weight/weight-summary";
import { TodayRitual } from "@/components/today-ritual";
import { WeeklyInsightsCard } from "@/components/weekly-insights-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TodayPage() {
  const session = await requireWhitelistedSession();
  const [weight, habits, food, insights] = await Promise.all([
    getWeightDashboard(session.user.id),
    getHabitsForUser(session.user.id),
    getFoodDay(session.user.id),
    getWeeklyInsights(session.user.id),
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
  const leversDone =
    habitsWithStreak.length === 0 ? false : habitsWithStreak.every((habit) => habit.completedToday);

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Aujourd&apos;hui</h1>
        <p className="mt-1 text-sm text-muted-foreground">Check-in coach : pesée, alim, leviers.</p>
      </div>

      <TodayRitual
        items={[
          {
            id: "weight",
            label: "Pesée du jour",
            done: weight.weighedToday,
            href: "#pesee",
            detail: weight.weighedToday ? `${todayWeight?.toFixed(1)} kg` : "Pas encore loggé",
          },
          {
            id: "food",
            label: "Repas notés",
            done: food.totals.count > 0,
            href: "/food",
            detail:
              food.totals.count === 0
                ? "Aucun repas"
                : `${food.totals.count} entrée${food.totals.count > 1 ? "s" : ""}${
                    food.goal ? ` · ${food.totals.calories}/${food.goal.calorieTarget} kcal` : ""
                  }`,
          },
          {
            id: "habits",
            label: "Leviers",
            done: leversDone,
            href: "#leviers",
            detail:
              habitsWithStreak.length === 0
                ? "Aucun levier configuré"
                : `${doneCount}/${habitsWithStreak.length} faits`,
          },
        ]}
      />

      <WeeklyInsightsCard lines={insights.lines} from={insights.from} to={insights.to} />

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

      <div id="pesee">
        <LogWeightForm
          action={logWeight}
          defaultWeight={todayWeight ?? weight.latest?.weightKg}
          today={today}
          weighedToday={weight.weighedToday}
          todayWeight={todayWeight}
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Alimentation</CardTitle>
            <CardDescription>
              {food.totals.count === 0
                ? "Rien de noté aujourd'hui."
                : `${food.totals.count} entrée${food.totals.count > 1 ? "s" : ""}`}
            </CardDescription>
          </div>
          <Link
            href="/food"
            className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Noter
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {food.goal && food.progress ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  kcal {food.totals.calories}/{food.goal.calorieTarget}
                </span>
                <span>
                  P {food.totals.proteinG}/{food.goal.proteinTargetG}g
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${food.progress.caloriesPct}%` }}
                  />
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${food.progress.proteinPct}%` }}
                  />
                </div>
              </div>
            </div>
          ) : food.totals.hasAnyMacros ? (
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{food.totals.calories} kcal</Badge>
              <Badge variant="outline">P {food.totals.proteinG}g</Badge>
            </div>
          ) : null}
          {food.entries.length > 0 ? (
            <ul className="space-y-1.5 text-sm">
              {food.entries.slice(0, 3).map((entry) => (
                <li key={entry.id} className="text-muted-foreground">
                  <span className="text-foreground">{entry.name}</span>
                  {entry.calories != null ? ` · ${entry.calories} kcal` : null}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      <section id="leviers" className="space-y-4">
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
