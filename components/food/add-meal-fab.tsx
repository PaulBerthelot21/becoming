"use client";

import { useState, useTransition } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { LogFoodForm } from "@/components/food/log-food-form";
import { mealTypeLabels, mealTypes } from "@/lib/food/schema";
import { cn } from "@/lib/utils";

type Favorite = {
  id: string;
  name: string;
  mealType: (typeof mealTypes)[number] | null;
  calories: number | null;
};

type AddMealFabProps = {
  today: string;
  photosEnabled?: boolean;
  favorites: Favorite[];
  createAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  createFromFavoriteAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  estimateMacrosAction?: (imageUrl: string) => Promise<
    | { error: string }
    | {
        calories: number | null;
        proteinG: number | null;
        carbsG: number | null;
        fatG: number | null;
        name?: string | null;
      }
  >;
  defaultMealType?: (typeof mealTypes)[number];
  /** Hide FAB on md+ when the full composer is already on the page */
  mobileOnly?: boolean;
};

export function AddMealFab({
  today,
  photosEnabled = false,
  favorites,
  createAction,
  createFromFavoriteAction,
  estimateMacrosAction,
  defaultMealType = "lunch",
  mobileOnly = false,
}: AddMealFabProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();

  return (
    <>
      <motion.button
        type="button"
        aria-label="Ajouter un repas"
        initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={reduceMotion ? undefined : { scale: 0.94 }}
        onClick={() => setOpen(true)}
        className={cn(
          "fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg",
          "bottom-[calc(5.25rem+env(safe-area-inset-bottom))] md:right-8 md:bottom-8",
          mobileOnly && "md:hidden",
        )}
      >
        <Plus className="size-6" strokeWidth={2.25} />
      </motion.button>

      <ResponsiveModal open={open} onClose={() => setOpen(false)} title="Noter un repas">
        {favorites.length > 0 ? (
          <div className="mb-5 space-y-2">
            <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Favoris
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {favorites.map((favorite) => (
                <button
                  key={favorite.id}
                  type="button"
                  disabled={pending}
                  className="flex min-h-14 flex-col items-start justify-center rounded-2xl border border-border/70 bg-secondary/50 px-4 py-3 text-left transition hover:border-primary/30 hover:bg-secondary"
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
                      setOpen(false);
                    })
                  }
                >
                  <span className="font-medium">{favorite.name}</span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {favorite.mealType ? mealTypeLabels[favorite.mealType] : "Repas"}
                    {favorite.calories != null ? ` · ${favorite.calories} kcal` : ""}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <LogFoodForm
          embedded
          action={createAction}
          today={today}
          defaultMealType={defaultMealType}
          photosEnabled={photosEnabled}
          estimateMacrosAction={estimateMacrosAction}
          onSuccess={() => setOpen(false)}
        />
      </ResponsiveModal>
    </>
  );
}
