"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mealTypeLabels, mealTypes } from "@/lib/food/schema";

type FoodItem = {
  id: string;
  name: string;
  notes: string | null;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
};

type FoodDayListProps = {
  byMeal: Record<(typeof mealTypes)[number], FoodItem[]>;
  totals: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    count: number;
    hasAnyMacros: boolean;
  };
  deleteAction: (entryId: string) => Promise<{ error?: string; success?: boolean }>;
};

function macroLine(item: FoodItem) {
  const parts: string[] = [];
  if (item.calories != null) parts.push(`${item.calories} kcal`);
  if (item.proteinG != null) parts.push(`P ${item.proteinG}g`);
  if (item.carbsG != null) parts.push(`G ${item.carbsG}g`);
  if (item.fatG != null) parts.push(`L ${item.fatG}g`);
  return parts.join(" · ");
}

export function FoodDayList({ byMeal, totals, deleteAction }: FoodDayListProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Totaux du jour</CardTitle>
          <CardDescription>
            {totals.count === 0
              ? "Rien de noté pour l'instant."
              : `${totals.count} entrée${totals.count > 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        {totals.count > 0 ? (
          <CardContent className="flex flex-wrap gap-2">
            {totals.hasAnyMacros ? (
              <>
                <Badge variant="secondary">{totals.calories} kcal</Badge>
                <Badge variant="outline">P {totals.proteinG}g</Badge>
                <Badge variant="outline">G {totals.carbsG}g</Badge>
                <Badge variant="outline">L {totals.fatG}g</Badge>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Pas de macros renseignées — le suivi textuel compte déjà.
              </p>
            )}
          </CardContent>
        ) : null}
      </Card>

      {mealTypes.map((mealType) => {
        const items = byMeal[mealType];
        if (items.length === 0) return null;

        return (
          <Card key={mealType}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{mealTypeLabels[mealType]}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.notes ? (
                        <p className="text-sm text-muted-foreground">{item.notes}</p>
                      ) : null}
                      {macroLine(item) ? (
                        <p className="mt-1 text-xs text-muted-foreground">{macroLine(item)}</p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      className="text-destructive hover:text-destructive"
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
                      Suppr.
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
