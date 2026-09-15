"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CUT_HABIT_TEMPLATES, type CutHabitTemplateId } from "@/lib/habits/templates";

type HabitTemplatesProps = {
  existingNames: string[];
  addAction: (templateId: CutHabitTemplateId) => Promise<{ error?: string; success?: boolean }>;
};

export function HabitTemplates({ existingNames, addAction }: HabitTemplatesProps) {
  const [pending, startTransition] = useTransition();
  const existing = new Set(existingNames.map((name) => name.toLowerCase()));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Templates cut</CardTitle>
        <CardDescription>Ajoute les leviers utiles en un clic.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {CUT_HABIT_TEMPLATES.map((template) => {
          const alreadyAdded = existing.has(template.name.toLowerCase());

          return (
            <Button
              key={template.id}
              type="button"
              size="sm"
              variant={alreadyAdded ? "secondary" : "outline"}
              disabled={pending || alreadyAdded}
              title={template.description}
              onClick={() =>
                startTransition(async () => {
                  const result = await addAction(template.id);
                  if (result.error) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success(`${template.name} ajouté`);
                })
              }
            >
              {alreadyAdded ? `${template.name} ✓` : `+ ${template.name}`}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
