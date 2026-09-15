"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type WeightGoalFormProps = {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  defaults?: {
    startWeightKg: number;
    targetWeightKg: number;
    weeklyRateKg: number;
  } | null;
};

export function WeightGoalForm({ action, defaults }: WeightGoalFormProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Objectif cut</CardTitle>
        <CardDescription>Définis ton départ, ta cible et ton rythme hebdo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          action={(formData) => {
            startTransition(async () => {
              const result = await action(formData);
              if (result.error) {
                toast.error(result.error);
                return;
              }
              toast.success("Objectif enregistré");
            });
          }}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="startWeightKg">Départ (kg)</Label>
              <Input
                id="startWeightKg"
                name="startWeightKg"
                type="number"
                step="0.1"
                min={30}
                max={400}
                required
                defaultValue={defaults?.startWeightKg ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetWeightKg">Cible (kg)</Label>
              <Input
                id="targetWeightKg"
                name="targetWeightKg"
                type="number"
                step="0.1"
                min={30}
                max={400}
                required
                defaultValue={defaults?.targetWeightKg ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weeklyRateKg">Rythme (−kg/sem)</Label>
              <Input
                id="weeklyRateKg"
                name="weeklyRateKg"
                type="number"
                step="0.1"
                min={0.1}
                max={2}
                defaultValue={defaults?.weeklyRateKg ?? 0.5}
              />
            </div>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Enregistrement…" : defaults ? "Mettre à jour" : "Définir l'objectif"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
