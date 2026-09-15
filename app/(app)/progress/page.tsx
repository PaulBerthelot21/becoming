import Link from "next/link";
import { requireWhitelistedSession } from "@/lib/session";
import {
  deleteWeightEntry,
  getWeightDashboard,
  getWeightHistory,
  updateWeightEntry,
} from "@/lib/weight/actions";
import { getWeeklyInsights } from "@/lib/insights";
import { getHabitsWeekRate } from "@/lib/habits/actions";
import { WeightChart } from "@/components/weight/weight-chart";
import { WeightHistory } from "@/components/weight/weight-history";
import { WeightSummary } from "@/components/weight/weight-summary";
import { WeeklyInsightsCard } from "@/components/weekly-insights-card";
import { ScreenHero } from "@/components/screen-hero";
import { Button } from "@/components/ui/button";

export default async function ProgressPage() {
  const session = await requireWhitelistedSession();
  const [weight, history, insights, habitsWeek] = await Promise.all([
    getWeightDashboard(session.user.id),
    getWeightHistory(session.user.id),
    getWeeklyInsights(session.user.id),
    getHabitsWeekRate(session.user.id),
  ]);

  const delta =
    insights.weightChange != null
      ? `${insights.weightChange > 0 ? "+" : ""}${insights.weightChange.toFixed(1)} kg`
      : "—";

  return (
    <div className="space-y-6 md:space-y-8">
      <ScreenHero
        eyebrow="Progression"
        title="La tendance"
        subtitle="Courbe 30 jours, leviers et historique."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="rounded-xl bg-background/55 px-3 py-2.5 backdrop-blur">
            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Δ semaine
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">{delta}</p>
          </div>
          <div className="rounded-xl bg-background/55 px-3 py-2.5 backdrop-blur">
            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Leviers
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">
              {habitsWeek.ratePct != null ? `${habitsWeek.ratePct}%` : "—"}
            </p>
          </div>
          <div className="col-span-2 rounded-xl bg-background/55 px-3 py-2.5 backdrop-blur sm:col-span-1">
            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Poids
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">
              {weight.insight.currentWeight != null
                ? `${weight.insight.currentWeight.toFixed(1)} kg`
                : "—"}
            </p>
          </div>
        </div>
      </ScreenHero>

      <WeeklyInsightsCard lines={insights.lines} from={insights.from} to={insights.to} />

      {!weight.goal ? (
        <section className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center">
          <p className="text-sm font-medium">Pas encore d&apos;objectif</p>
          <p className="mt-1 text-xs text-muted-foreground">
            La courbe cible apparaît dès que tu configures le cut.
          </p>
          <Button asChild className="mt-4 h-11 rounded-xl md:h-10">
            <Link href="/goal">Définir l&apos;objectif</Link>
          </Button>
        </section>
      ) : (
        <WeightSummary
          insight={weight.insight}
          goal={weight.goal}
          latestDate={weight.latest?.date}
        />
      )}

      <div className="grid gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:items-start md:gap-10">
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card/80 p-4 md:p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Courbe
              </p>
              <p className="mt-1 text-sm text-muted-foreground">30 derniers jours</p>
            </div>
            {habitsWeek.ratePct != null ? (
              <p className="text-sm text-muted-foreground">
                Leviers {habitsWeek.done}/{habitsWeek.total}
              </p>
            ) : null}
          </div>
          <WeightChart
            labels={weight.chart.labels}
            weights={weight.chart.weights}
            average7d={weight.chart.average7d}
            targetWeightKg={weight.goal?.targetWeightKg}
          />
        </section>

        <section className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Historique
          </p>
          <WeightHistory
            entries={history}
            updateAction={updateWeightEntry}
            deleteAction={deleteWeightEntry}
          />
        </section>
      </div>
    </div>
  );
}
