"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type NutritionGoalFormProps = {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  defaults?: {
    calorieTarget: number;
    proteinTargetG: number;
  } | null;
};

export function NutritionGoalForm({ action, defaults }: NutritionGoalFormProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cibles alimentaires</CardTitle>
        <CardDescription>kcal et protéines par jour — pour des barres utiles.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
          action={(formData) => {
            startTransition(async () => {
              const result = await action(formData);
              if (result.error) {
                toast.error(result.error);
                return;
              }
              toast.success("Cibles alim enregistrées");
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="calorieTarget">Calories</Label>
            <Input
              id="calorieTarget"
              name="calorieTarget"
              type="number"
              min={800}
              max={6000}
              required
              defaultValue={defaults?.calorieTarget ?? 2200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="proteinTargetG">Protéines (g)</Label>
            <Input
              id="proteinTargetG"
              name="proteinTargetG"
              type="number"
              min={20}
              max={400}
              step="1"
              required
              defaultValue={defaults?.proteinTargetG ?? 160}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "…" : defaults ? "Maj" : "Définir"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
