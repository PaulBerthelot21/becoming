"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type WeightHistoryItem = {
  id: string;
  date: string;
  weightKg: number;
  note: string | null;
};

type WeightHistoryProps = {
  entries: WeightHistoryItem[];
  updateAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  deleteAction: (entryId: string) => Promise<{ error?: string; success?: boolean }>;
};

export function WeightHistory({ entries, updateAction, deleteAction }: WeightHistoryProps) {
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
          <CardDescription>Aucune pesée pour l&apos;instant.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique</CardTitle>
        <CardDescription>Corrige ou supprime une mauvaise mesure.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2">
          {entries.map((entry) => {
            const isEditing = editingId === entry.id;

            return (
              <li key={entry.id} className="rounded-lg border border-border px-3 py-3">
                {isEditing ? (
                  <form
                    className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]"
                    action={(formData) => {
                      startTransition(async () => {
                        const result = await updateAction(formData);
                        if (result.error) {
                          toast.error(result.error);
                          return;
                        }
                        toast.success("Pesée mise à jour");
                        setEditingId(null);
                      });
                    }}
                  >
                    <input type="hidden" name="id" value={entry.id} />
                    <Input
                      name="weightKg"
                      type="number"
                      step="0.1"
                      min={30}
                      max={400}
                      required
                      defaultValue={entry.weightKg}
                    />
                    <Input
                      name="note"
                      maxLength={280}
                      defaultValue={entry.note ?? ""}
                      placeholder="Note"
                    />
                    <Button type="submit" size="sm" disabled={pending}>
                      Sauver
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      Annuler
                    </Button>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {entry.weightKg.toFixed(1)} kg
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          {entry.date}
                        </span>
                      </p>
                      {entry.note ? (
                        <p className="text-sm text-muted-foreground">{entry.note}</p>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(entry.id)}
                      >
                        Éditer
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={pending}
                        className="text-destructive hover:text-destructive"
                        onClick={() =>
                          startTransition(async () => {
                            const result = await deleteAction(entry.id);
                            if (result.error) {
                              toast.error(result.error);
                              return;
                            }
                            toast.success("Pesée supprimée");
                          })
                        }
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
