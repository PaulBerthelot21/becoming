import Link from "next/link";
import { requireWhitelistedSession } from "@/lib/session";
import {
  deleteWeightEntry,
  getWeightDashboard,
  getWeightHistory,
  updateWeightEntry,
} from "@/lib/weight/actions";
import { WeightChart } from "@/components/weight/weight-chart";
import { WeightHistory } from "@/components/weight/weight-history";
import { WeightSummary } from "@/components/weight/weight-summary";

export default async function ProgressPage() {
  const session = await requireWhitelistedSession();
  const [weight, history] = await Promise.all([
    getWeightDashboard(session.user.id),
    getWeightHistory(session.user.id),
  ]);

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Progression</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Courbe, tendance et historique éditable.
        </p>
      </div>

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

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">30 derniers jours</h2>
        <WeightChart
          labels={weight.chart.labels}
          weights={weight.chart.weights}
          average7d={weight.chart.average7d}
          targetWeightKg={weight.goal?.targetWeightKg}
        />
      </section>

      <WeightHistory
        entries={history}
        updateAction={updateWeightEntry}
        deleteAction={deleteWeightEntry}
      />
    </>
  );
}
