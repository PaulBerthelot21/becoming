"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LogWeightResult = {
  error?: string;
  success?: boolean;
  updated?: boolean;
  weightKg?: number;
  date?: string;
};

type LogWeightFormProps = {
  action: (formData: FormData) => Promise<LogWeightResult>;
  defaultWeight?: number | null;
  today: string;
  weighedToday?: boolean;
  todayWeight?: number | null;
};

export function LogWeightForm({
  action,
  defaultWeight,
  today,
  weighedToday = false,
  todayWeight,
}: LogWeightFormProps) {
  const [pending, startTransition] = useTransition();
  const [doneToday, setDoneToday] = useState(weighedToday);
  const [lastLogged, setLastLogged] = useState<number | null>(todayWeight ?? null);

  return (
    <Card>
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Pesée</CardTitle>
          {doneToday ? (
            <Badge variant="secondary">Déjà pesé aujourd&apos;hui</Badge>
          ) : (
            <Badge variant="outline">Pas encore pesé</Badge>
          )}
        </div>
        <CardDescription>
          {doneToday
            ? `Tu as loggé ${lastLogged?.toFixed(1) ?? "—"} kg. Tu peux mettre à jour si besoin.`
            : "Une mesure par jour suffit. La moyenne 7j lisse les variations d'eau."}
        </CardDescription>
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

              setDoneToday(true);
              setLastLogged(result.weightKg ?? null);
              toast.success(
                result.updated
                  ? `Pesée mise à jour · ${result.weightKg?.toFixed(1)} kg`
                  : `Pesée enregistrée · ${result.weightKg?.toFixed(1)} kg`,
              );
            });
          }}
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="weightKg">Poids (kg)</Label>
              <Input
                id="weightKg"
                name="weightKg"
                type="number"
                step="0.1"
                min={30}
                max={400}
                required
                defaultValue={defaultWeight ?? ""}
                placeholder="78.4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" defaultValue={today} />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={pending} className="w-full sm:w-auto">
                {pending ? "…" : doneToday ? "Mettre à jour" : "Logger"}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note (optionnel)</Label>
            <Input id="note" name="note" maxLength={280} placeholder="Ex. matin à jeun" />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
