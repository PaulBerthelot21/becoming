"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateHabitFormProps = {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
};

export function CreateHabitForm({ action }: CreateHabitFormProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouveau levier</CardTitle>
        <CardDescription>Ajoute un levier custom si un template ne suffit pas.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          action={(formData) => {
            startTransition(async () => {
              const result = await action(formData);
              if (result.error) {
                toast.error(result.error);
                return;
              }
              toast.success("Levier ajouté");
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              name="name"
              required
              maxLength={80}
              placeholder="Ex. Lire 20 minutes"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Input
              id="description"
              name="description"
              maxLength={280}
              placeholder="Pourquoi ce levier compte"
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Ajout…" : "Ajouter"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
