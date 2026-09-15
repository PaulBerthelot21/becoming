"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type DataToolsProps = {
  cleanupAction: () => Promise<{ error?: string; success?: boolean; deleted?: number }>;
  importAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
};

export function DataToolsCard({ cleanupAction, importAction }: DataToolsProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Données</CardTitle>
        <CardDescription>Export JSON, import, nettoyage photos orphelines.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild variant="outline" className="h-11 md:h-9">
          <a href="/api/export">Télécharger le backup</a>
        </Button>

        <form
          className="space-y-2"
          action={(formData) => {
            startTransition(async () => {
              const file = formData.get("file");
              if (!(file instanceof File)) {
                toast.error("Choisis un fichier JSON");
                return;
              }
              const text = await file.text();
              const body = new FormData();
              body.set("backup", text);
              const result = await importAction(body);
              if (result.error) {
                toast.error(result.error);
                return;
              }
              toast.success("Backup importé");
            });
          }}
        >
          <Label htmlFor="backup-file">Importer un backup</Label>
          <input
            id="backup-file"
            name="file"
            type="file"
            accept="application/json,.json"
            className="block w-full text-sm"
          />
          <Button type="submit" variant="secondary" disabled={pending} className="h-11 md:h-9">
            Importer
          </Button>
        </form>

        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          className="h-11 md:h-9"
          onClick={() =>
            startTransition(async () => {
              const result = await cleanupAction();
              if (result.error) {
                toast.error(result.error);
                return;
              }
              toast.success(
                result.deleted
                  ? `${result.deleted} photo(s) orpheline(s) supprimée(s)`
                  : "Rien à nettoyer",
              );
            })
          }
        >
          Nettoyer photos orphelines
        </Button>
      </CardContent>
    </Card>
  );
}
