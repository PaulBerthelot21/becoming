"use client";

import { useTransition } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Copy, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { mealTypeLabels, mealTypes } from "@/lib/food/schema";
import { shiftDateKey } from "@/lib/date";

type Favorite = {
  id: string;
  name: string;
  mealType: (typeof mealTypes)[number] | null;
  calories: number | null;
  proteinG: number | null;
};

type FoodQuickActionsProps = {
  selectedDate: string;
  favorites: Favorite[];
  copyAction: (
    formData: FormData,
  ) => Promise<{ error?: string; success?: boolean; count?: number }>;
  createFromFavoriteAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  removeFavoriteAction: (favoriteId: string) => Promise<{ error?: string; success?: boolean }>;
};

export function FoodQuickActions({
  selectedDate,
  favorites,
  copyAction,
  createFromFavoriteAction,
  removeFavoriteAction,
}: FoodQuickActionsProps) {
  const [pending, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();
  const yesterday = shiftDateKey(selectedDate, -1);

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.3 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Rapide
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl border-border/80 bg-card/80 md:h-9"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const formData = new FormData();
              formData.set("sourceDate", yesterday);
              formData.set("targetDate", selectedDate);
              const result = await copyAction(formData);
              if (result.error) {
                toast.error(result.error);
                return;
              }
              toast.success(
                result.count ? `${result.count} repas copiés depuis hier` : "Jour copié",
              );
            })
          }
        >
          <Copy className="size-4" />
          Copier hier
        </Button>

        {favorites.map((favorite, index) => (
          <motion.div
            key={favorite.id}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.14 + index * 0.03 }}
            className="inline-flex items-center rounded-xl border border-border/70 bg-secondary/60"
          >
            <button
              type="button"
              disabled={pending}
              className="h-11 max-w-[14rem] truncate px-3 text-left text-sm font-medium md:h-9"
              onClick={() =>
                startTransition(async () => {
                  const formData = new FormData();
                  formData.set("favoriteId", favorite.id);
                  formData.set("date", selectedDate);
                  const result = await createFromFavoriteAction(formData);
                  if (result.error) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success(`${favorite.name} ajouté`);
                })
              }
            >
              {favorite.name}
              {favorite.calories != null ? (
                <span className="text-muted-foreground"> · {favorite.calories}</span>
              ) : favorite.mealType ? (
                <span className="text-muted-foreground">
                  {" "}
                  · {mealTypeLabels[favorite.mealType]}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              disabled={pending}
              aria-label={`Retirer ${favorite.name}`}
              className="flex h-11 w-9 items-center justify-center text-muted-foreground hover:text-foreground md:h-9"
              onClick={() =>
                startTransition(async () => {
                  const result = await removeFavoriteAction(favorite.id);
                  if (result.error) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success("Favori retiré");
                })
              }
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        ))}
      </div>

      {favorites.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Étoile un repas dans la liste pour le retrouver ici.
        </p>
      ) : null}
    </motion.section>
  );
}
