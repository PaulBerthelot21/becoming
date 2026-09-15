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

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full justify-start rounded-2xl border-border/80 bg-card/80 md:h-11"
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

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {favorites.map((favorite, index) => (
              <motion.div
                key={favorite.id}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.14 + index * 0.03 }}
                className="relative flex min-h-14 items-stretch rounded-2xl border border-border/70 bg-secondary/50"
              >
                <button
                  type="button"
                  disabled={pending}
                  className="flex min-w-0 flex-1 flex-col items-start justify-center px-4 py-3 text-left"
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
                  <span className="truncate font-medium">{favorite.name}</span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {favorite.mealType ? mealTypeLabels[favorite.mealType] : "1 tap"}
                    {favorite.calories != null ? ` · ${favorite.calories} kcal` : ""}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={pending}
                  aria-label={`Retirer ${favorite.name}`}
                  className="flex w-11 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
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
        ) : null}
      </div>

      {favorites.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Étoile un repas dans la liste pour le retrouver ici.
        </p>
      ) : null}
    </motion.section>
  );
}
