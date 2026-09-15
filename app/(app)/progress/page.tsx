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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProgressPage() {
  const session = await requireWhitelistedSession();
  const [weight, history, insights, habitsWeek] = await Promise.all([
    getWeightDashboard(session.user.id),
    getWeightHistory(session.user.id),
    getWeeklyInsights(session.user.id),
    getHabitsWeekRate(session.user.id),
  ]);

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Progression</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Courbe, insights semaine et historique éditable.
        </p>
      </div>

      <WeeklyInsightsCard lines={insights.lines} from={insights.from} to={insights.to} />

      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        <div className="space-y-6">
          {!weight.goal ? (
            <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              Définis d&apos;abord un{" "}
              <Link href="/goal" className="text-foreground underline underline-offset-2">
                objectif
              </Link>{" "}
              pour voir la progression.
            </p>
          ) : (
            <WeightSummary
              insight={weight.insight}
              goal={weight.goal}
              latestDate={weight.latest?.date}
            />
          )}

          {habitsWeek.ratePct != null ? (
            <Card>
              <CardHeader>
                <CardTitle>Leviers semaine</CardTitle>
                <CardDescription>
                  {habitsWeek.done}/{habitsWeek.total} checks
                  {insights.weightChange != null
                    ? ` · Δ poids ${insights.weightChange > 0 ? "+" : ""}${insights.weightChange.toFixed(1)} kg`
                    : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">{habitsWeek.ratePct}%</p>
              </CardContent>
            </Card>
          ) : null}

          <section className="space-y-3">
            <h2 className="text-sm font-semibold">30 derniers jours</h2>
            <WeightChart
              labels={weight.chart.labels}
              weights={weight.chart.weights}
              average7d={weight.chart.average7d}
              targetWeightKg={weight.goal?.targetWeightKg}
            />
          </section>
        </div>

        <WeightHistory
          entries={history}
          updateAction={updateWeightEntry}
          deleteAction={deleteWeightEntry}
        />
      </div>
    </>
  );
}
