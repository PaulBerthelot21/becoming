import Link from "next/link";
import { getHabitStreak, getHabitsForUser, toggleHabitCompletion } from "@/lib/habits/actions";
import { createFoodFromFavorite, getFoodDay, listFoodFavorites } from "@/lib/food/actions";
import { getWeeklyInsights } from "@/lib/insights";
import { getCoachNote } from "@/lib/ai/coach";
import { formatDateFr, startOfUtcDay, toDateKey } from "@/lib/date";
import { requireWhitelistedSession } from "@/lib/session";
import { getWeightDashboard, logWeight } from "@/lib/weight/actions";
import { HabitList } from "@/components/habits/habit-list";
import { LogWeightForm } from "@/components/weight/log-weight-form";
import { WeightSummary } from "@/components/weight/weight-summary";
import { TodayRitual } from "@/components/today-ritual";
import { WeeklyInsightsCard } from "@/components/weekly-insights-card";
import { ScreenHero } from "@/components/screen-hero";
import { TodayFoodPanel } from "@/components/food/today-food-panel";
import { Button } from "@/components/ui/button";

export default async function TodayPage() {
  const session = await requireWhitelistedSession();
  const [weight, habits, food, insights, coachNote, favorites] = await Promise.all([
    getWeightDashboard(session.user.id),
    getHabitsForUser(session.user.id),
    getFoodDay(session.user.id),
    getWeeklyInsights(session.user.id),
    getCoachNote(session.user.id),
    listFoodFavorites(session.user.id),
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
  const titleDate = formatDateFr(today, { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-6 md:space-y-8">
      <ScreenHero
        eyebrow="Check-in"
        title="Aujourd'hui"
        subtitle={<span className="capitalize">{titleDate}</span>}
      />

      {!weight.goal ? (
        <section className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 to-accent/30 px-4 py-5 md:px-5">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Première étape
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">Définis ton objectif cut</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Départ, cible et rythme (−kg/semaine). Sans ça, courbe et coach restent flous.
          </p>
          <Button asChild className="mt-4 h-11 rounded-xl md:h-10">
            <Link href="/goal">Configurer l&apos;objectif</Link>
          </Button>
        </section>
      ) : null}

      <TodayRitual
        items={[
          {
            id: "weight",
            label: "Pesée",
            done: weight.weighedToday,
            href: "#pesee",
            detail: weight.weighedToday ? `${todayWeight?.toFixed(1)} kg` : "Pas encore",
          },
          {
            id: "food",
            label: "Alim",
            done: food.totals.count > 0,
            href: "#alim",
            detail:
              food.totals.count === 0
                ? "Aucun repas"
                : `${food.totals.count} · ${food.totals.calories || "—"} kcal`,
          },
          {
            id: "habits",
            label: "Leviers",
            done: leversDone,
            href: "#leviers",
            detail:
              habitsWithStreak.length === 0
                ? "À configurer"
                : `${doneCount}/${habitsWithStreak.length}`,
          },
        ]}
      />

      {coachNote ? (
        <p className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 text-sm leading-relaxed">
          {coachNote}
        </p>
      ) : null}

      <WeeklyInsightsCard lines={insights.lines} from={insights.from} to={insights.to} />

      <div className="grid gap-8 md:grid-cols-2 md:items-start md:gap-10">
        <div id="pesee" className="space-y-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Poids
          </p>
          {weight.goal ? (
            <WeightSummary
              insight={weight.insight}
              goal={weight.goal}
              latestDate={weight.latest?.date}
              compact
            />
          ) : null}
          <LogWeightForm
            action={logWeight}
            defaultWeight={todayWeight ?? weight.latest?.weightKg}
            today={today}
            weighedToday={weight.weighedToday}
            todayWeight={todayWeight}
          />
        </div>

        <TodayFoodPanel
          today={today}
          favorites={favorites}
          createFromFavoriteAction={createFoodFromFavorite}
          totals={food.totals}
          goal={food.goal}
          progress={food.progress}
          recentNames={food.entries.slice(0, 3)}
        />
      </div>

      <section id="leviers" className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Leviers
            </p>
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
        {habitsWithStreak.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center">
            <p className="text-sm font-medium">Aucun levier</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ajoute des templates cut sur{" "}
              <Link href="/habits" className="underline underline-offset-2">
                Leviers
              </Link>
              .
            </p>
          </div>
        ) : (
          <HabitList
            habits={habitsWithStreak}
            toggleAction={toggleHabitCompletion}
            mode="checkin"
          />
        )}
      </section>
    </div>
  );
}
