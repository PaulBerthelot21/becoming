import Link from "next/link";
import { requireWhitelistedSession } from "@/lib/session";
import { getWeightDashboard } from "@/lib/weight/actions";
import { WeightChart } from "@/components/weight/weight-chart";
import { WeightSummary } from "@/components/weight/weight-summary";

export default async function ProgressPage() {
  const session = await requireWhitelistedSession();
  const weight = await getWeightDashboard(session.user.id);

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Progression</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Courbe, tendance et projection vers la cible.
        </p>
      </div>

      {!weight.goal ? (
        <p className="rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          Définis d&apos;abord un{" "}
          <Link href="/goal" className="underline underline-offset-2">
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
    </>
  );
}
