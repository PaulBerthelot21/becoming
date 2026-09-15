import Link from "next/link";

type WeightSummaryProps = {
  insight: {
    currentWeight: number | null;
    weekChange: number | null;
    remainingKg: number | null;
    progressPct: number | null;
    estimatedWeeksLeft: number | null;
    onTrack: boolean | null;
  };
  goal: {
    startWeightKg: number;
    targetWeightKg: number;
    weeklyRateKg: number;
  } | null;
  latestDate?: string | null;
  /** Hides detailed stats grid for the today check-in view */
  compact?: boolean;
};

export function WeightSummary({ insight, goal, latestDate, compact = false }: WeightSummaryProps) {
  if (!goal) {
    return (
      <p className="glass rounded-2xl px-4 py-3 text-sm text-muted-foreground">
        Commence par définir ton{" "}
        <Link href="/goal" className="underline underline-offset-2">
          objectif cut
        </Link>
        .
      </p>
    );
  }

  const weekLabel =
    insight.weekChange == null
      ? "Pas assez de données"
      : `${insight.weekChange > 0 ? "+" : ""}${insight.weekChange.toFixed(2)} kg / ~7j`;

  const trackLabel =
    insight.onTrack == null
      ? "En attente de tendance"
      : insight.onTrack
        ? "Dans le rythme"
        : "Sous le rythme cible";

  return (
    <section className="glass space-y-4 rounded-2xl p-4 md:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Poids actuel</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">
            {insight.currentWeight != null ? `${insight.currentWeight.toFixed(1)} kg` : "—"}
          </p>
          {latestDate ? (
            <p className="mt-1 text-xs text-muted-foreground">Dernière pesée · {latestDate}</p>
          ) : null}
        </div>
        <div className="text-right text-sm">
          <p className="text-muted-foreground">Cible {goal.targetWeightKg.toFixed(1)} kg</p>
          <p className="mt-1 font-medium">
            {insight.remainingKg != null && insight.remainingKg > 0
              ? `${insight.remainingKg.toFixed(1)} kg restants`
              : insight.remainingKg != null
                ? "Objectif atteint"
                : "—"}
          </p>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${insight.progressPct ?? 0}%` }}
        />
      </div>

      {!compact ? (
        <>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Tendance</dt>
              <dd className="mt-0.5 font-medium">{weekLabel}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Rythme cible</dt>
              <dd className="mt-0.5 font-medium">−{goal.weeklyRateKg.toFixed(1)} kg/sem</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Projection</dt>
              <dd className="mt-0.5 font-medium">
                {insight.estimatedWeeksLeft == null
                  ? "—"
                  : insight.estimatedWeeksLeft === 0
                    ? "Cible atteinte"
                    : `~${insight.estimatedWeeksLeft} sem.`}
              </dd>
            </div>
          </dl>

          <p
            className={`text-sm ${
              insight.onTrack === false ? "text-amber-300" : "text-muted-foreground"
            }`}
          >
            {trackLabel}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          {weekLabel}
          {insight.onTrack === false ? " · sous le rythme" : null}
        </p>
      )}
    </section>
  );
}
