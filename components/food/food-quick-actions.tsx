"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const yesterday = shiftDateKey(selectedDate, -1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raccourcis</CardTitle>
        <CardDescription>Copier un jour ou réutiliser un favori.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full md:h-9 md:w-auto"
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
          Copier hier ({yesterday})
        </Button>

        {favorites.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun favori — étoile une entrée dans la liste.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {favorites.map((favorite) => (
              <li key={favorite.id} className="flex items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-11 md:h-8"
                  disabled={pending}
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
                  {favorite.mealType ? ` · ${mealTypeLabels[favorite.mealType]}` : ""}
                  {favorite.calories != null ? ` · ${favorite.calories} kcal` : ""}
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="h-11 w-11 text-muted-foreground md:h-8 md:w-8"
                  disabled={pending}
                  aria-label={`Retirer ${favorite.name}`}
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
                  ×
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
