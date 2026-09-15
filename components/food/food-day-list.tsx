"use client";

import { useState, useTransition } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { LogFoodForm, type FoodFormDefaults } from "@/components/food/log-food-form";
import { mealImageSrc } from "@/lib/blob";
import { mealTypeLabels, mealTypes } from "@/lib/food/schema";

type FoodItem = FoodFormDefaults & {
  id: string;
  name: string;
  mealType: (typeof mealTypes)[number];
};

type FoodDayListProps = {
  byMeal: Record<(typeof mealTypes)[number], FoodItem[]>;
  selectedDate: string;
  photosEnabled?: boolean;
  deleteAction: (entryId: string) => Promise<{ error?: string; success?: boolean }>;
  updateAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  favoriteAction: (entryId: string) => Promise<{ error?: string; success?: boolean }>;
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
};

function macroLine(item: FoodItem) {
  const parts: string[] = [];
  if (item.calories != null) parts.push(`${item.calories} kcal`);
  if (item.proteinG != null) parts.push(`P ${item.proteinG}g`);
  if (item.carbsG != null) parts.push(`G ${item.carbsG}g`);
  if (item.fatG != null) parts.push(`L ${item.fatG}g`);
  return parts.join(" · ");
}

export function FoodDayList({
  byMeal,
  selectedDate,
  photosEnabled = false,
  deleteAction,
  updateAction,
  favoriteAction,
  estimateMacrosAction,
}: FoodDayListProps) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<FoodItem | null>(null);
  const reduceMotion = useReducedMotion();

  const sections = mealTypes
    .map((mealType) => ({ mealType, items: byMeal[mealType] }))
    .filter((section) => section.items.length > 0);

  if (sections.length === 0) {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-10 text-center"
      >
        <p className="text-base font-medium">Aucun repas noté</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Ajoute un plat à gauche, copie hier, ou tape un favori pour démarrer la journée.
        </p>
      </motion.div>
    );
  }

  const flatItems = sections.flatMap((section) =>
    section.items.map((item) => ({ mealType: section.mealType, item })),
  );

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.mealType} className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              {mealTypeLabels[section.mealType]}
            </h2>
            <div className="h-px flex-1 bg-border/80" />
            <span className="text-xs text-muted-foreground tabular-nums">
              {section.items.length}
            </span>
          </div>

          <ul className="space-y-2.5">
            {section.items.map((item) => {
              const delay = flatItems.findIndex((entry) => entry.item.id === item.id) * 0.045;

              return (
                <motion.li
                  key={item.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex gap-3 rounded-2xl border border-border/70 bg-card/90 p-3 shadow-xs transition hover:border-primary/25 hover:bg-card"
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mealImageSrc(item.imageUrl)}
                      alt=""
                      className="size-16 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent text-xs font-semibold text-primary"
                    >
                      {item.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium leading-snug">{item.name}</p>
                    {item.notes ? (
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">{item.notes}</p>
                    ) : null}
                    {macroLine(item) ? (
                      <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
                        {macroLine(item)}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col gap-1 opacity-100 md:opacity-0 md:transition md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      className="h-10 w-10 md:h-8 md:w-8"
                      disabled={pending}
                      aria-label="Ajouter aux favoris"
                      onClick={() =>
                        startTransition(async () => {
                          const result = await favoriteAction(item.id);
                          if (result.error) {
                            toast.error(result.error);
                            return;
                          }
                          toast.success("Ajouté aux favoris");
                        })
                      }
                    >
                      <Star className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      className="h-10 w-10 md:h-8 md:w-8"
                      disabled={pending}
                      aria-label="Modifier"
                      onClick={() => setEditing(item)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      disabled={pending}
                      className="h-10 w-10 text-destructive hover:text-destructive md:h-8 md:w-8"
                      aria-label="Supprimer"
                      onClick={() =>
                        startTransition(async () => {
                          const result = await deleteAction(item.id);
                          if (result.error) {
                            toast.error(result.error);
                            return;
                          }
                          toast.success("Entrée supprimée");
                        })
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </section>
      ))}

      <ResponsiveModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Modifier le repas"
      >
        {editing ? (
          <LogFoodForm
            mode="edit"
            embedded
            action={updateAction}
            today={selectedDate}
            photosEnabled={photosEnabled}
            estimateMacrosAction={estimateMacrosAction}
            defaults={{
              ...editing,
              date: selectedDate,
            }}
            onSuccess={() => setEditing(null)}
          />
        ) : null}
      </ResponsiveModal>
    </div>
  );
}
