"use client";

import Link from "next/link";
import { useTransition } from "react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { mealTypeLabels, mealTypes } from "@/lib/food/schema";
import { FoodDaySummary } from "@/components/food/food-day-summary";

type Favorite = {
  id: string;
  name: string;
  mealType: (typeof mealTypes)[number] | null;
  calories: number | null;
};

type TodayFoodPanelProps = {
  today: string;
  favorites: Favorite[];
  createFromFavoriteAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
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
  recentNames: Array<{ id: string; name: string; calories: number | null }>;
};

export function TodayFoodPanel({
  today,
  favorites,
  createFromFavoriteAction,
  totals,
  goal,
  progress,
  recentNames,
}: TodayFoodPanelProps) {
  const [pending, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      id="alim"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Alimentation
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Tap un favori ou le bouton +</p>
        </div>
        <Link
          href="/food"
          className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Voir le jour
        </Link>
      </div>

      <FoodDaySummary totals={totals} goal={goal} progress={progress} />

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {favorites.slice(0, 6).map((favorite) => (
            <button
              key={favorite.id}
              type="button"
              disabled={pending}
              className="flex min-h-14 flex-col items-start justify-center rounded-2xl border border-border/70 bg-card/90 px-4 py-3 text-left transition hover:border-primary/30 active:scale-[0.99]"
              onClick={() =>
                startTransition(async () => {
                  const formData = new FormData();
                  formData.set("favoriteId", favorite.id);
                  formData.set("date", today);
                  const result = await createFromFavoriteAction(formData);
                  if (result.error) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success(`${favorite.name} ajouté`);
                })
              }
            >
              <span className="font-medium">{favorite.name}</span>
              <span className="mt-0.5 text-xs text-muted-foreground">
                {favorite.mealType ? mealTypeLabels[favorite.mealType] : "1 tap"}
                {favorite.calories != null ? ` · ${favorite.calories} kcal` : ""}
              </span>
            </button>
          ))}
        </div>
      ) : recentNames.length > 0 ? (
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {recentNames.map((entry) => (
            <li key={entry.id}>
              <span className="text-foreground">{entry.name}</span>
              {entry.calories != null ? ` · ${entry.calories} kcal` : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center">
          <p className="text-sm font-medium">Aucun repas aujourd&apos;hui</p>
          <p className="mt-1 text-xs text-muted-foreground">Utilise + pour noter rapidement.</p>
        </div>
      )}
    </motion.section>
  );
}
