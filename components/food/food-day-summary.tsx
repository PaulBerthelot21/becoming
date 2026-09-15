"use client";

import { motion, useReducedMotion } from "motion/react";

type FoodDaySummaryProps = {
  totals: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    count: number;
    hasAnyMacros: boolean;
  };
  goal?: {
    calorieTarget: number;
    proteinTargetG: number;
  } | null;
  progress?: {
    caloriesPct: number;
    proteinPct: number;
  } | null;
};

function AnimatedBar({ pct, label }: { pct: number; label: string }) {
  const reduceMotion = useReducedMotion();
  const width = Math.min(100, Math.max(0, pct));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{Math.round(width)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-background/70">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22, delay: 0.15 }}
        />
      </div>
    </div>
  );
}

export function FoodDaySummary({ totals, goal, progress }: FoodDaySummaryProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.32 }}
      className="rounded-2xl border border-border/70 bg-card/80 px-4 py-4 backdrop-blur md:px-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Bilan du jour
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
            {totals.hasAnyMacros ? (
              <>
                {totals.calories}
                <span className="ml-1 text-base font-normal text-muted-foreground">kcal</span>
              </>
            ) : (
              <span className="text-lg font-medium text-muted-foreground">
                {totals.count === 0
                  ? "Encore vide"
                  : `${totals.count} entrée${totals.count > 1 ? "s" : ""}`}
              </span>
            )}
          </p>
        </div>
        {totals.count > 0 ? (
          <p className="text-sm text-muted-foreground">
            {totals.count} repas
            {totals.proteinG > 0 ? ` · P ${totals.proteinG}g` : ""}
            {totals.carbsG > 0 ? ` · G ${totals.carbsG}g` : ""}
            {totals.fatG > 0 ? ` · L ${totals.fatG}g` : ""}
          </p>
        ) : null}
      </div>

      {goal && progress ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <AnimatedBar
            label={`Calories ${totals.calories}/${goal.calorieTarget}`}
            pct={progress.caloriesPct}
          />
          <AnimatedBar
            label={`Protéines ${totals.proteinG}/${goal.proteinTargetG}g`}
            pct={progress.proteinPct}
          />
        </div>
      ) : null}
    </motion.section>
  );
}
