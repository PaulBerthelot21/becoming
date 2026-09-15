"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mealTypeLabels, mealTypes } from "@/lib/food/schema";

type LogFoodFormProps = {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  today: string;
  defaultMealType?: (typeof mealTypes)[number];
};

export function LogFoodForm({ action, today, defaultMealType = "lunch" }: LogFoodFormProps) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Noter un repas</CardTitle>
        <CardDescription>Décris ce que tu manges. Les macros sont optionnelles.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          className="space-y-4"
          action={(formData) => {
            startTransition(async () => {
              const result = await action(formData);
              if (result.error) {
                toast.error(result.error);
                return;
              }
              toast.success("Repas ajouté");
              formRef.current?.reset();
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Quoi ?</Label>
            <Input
              id="name"
              name="name"
              required
              maxLength={120}
              placeholder="Ex. Poulet, riz, brocolis"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mealType">Repas</Label>
              <select
                id="mealType"
                name="mealType"
                defaultValue={defaultMealType}
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {mealTypes.map((mealType) => (
                  <option key={mealType} value={mealType}>
                    {mealTypeLabels[mealType]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" defaultValue={today} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="calories">kcal</Label>
              <Input
                id="calories"
                name="calories"
                type="number"
                min={0}
                max={5000}
                placeholder="—"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proteinG">Prot. (g)</Label>
              <Input
                id="proteinG"
                name="proteinG"
                type="number"
                min={0}
                max={500}
                step="0.1"
                placeholder="—"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbsG">Gluc. (g)</Label>
              <Input
                id="carbsG"
                name="carbsG"
                type="number"
                min={0}
                max={500}
                step="0.1"
                placeholder="—"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fatG">Lip. (g)</Label>
              <Input
                id="fatG"
                name="fatG"
                type="number"
                min={0}
                max={500}
                step="0.1"
                placeholder="—"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note (optionnel)</Label>
            <Input id="notes" name="notes" maxLength={280} placeholder="Ex. resto, maison, faim…" />
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Ajout…" : "Ajouter"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
