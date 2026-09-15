"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type HabitItem = {
  id: string;
  name: string;
  description: string | null;
  completedToday: boolean;
  weekCompletions: string[];
  streak: number;
};

type HabitListProps = {
  habits: HabitItem[];
  toggleAction: (habitId: string) => Promise<{ error?: string; success?: boolean }>;
  deleteAction?: (habitId: string) => Promise<{ error?: string; success?: boolean }>;
  mode?: "checkin" | "manage";
};

function lastSevenDays() {
  const days: string[] = [];
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(cursor);
    day.setUTCDate(cursor.getUTCDate() - i);
    days.push(day.toISOString().slice(0, 10));
  }

  return days;
}

export function HabitList({ habits, toggleAction, deleteAction, mode = "manage" }: HabitListProps) {
  const [pending, startTransition] = useTransition();
  const week = lastSevenDays();

  if (habits.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun levier pour l&apos;instant.{" "}
        {mode === "checkin" ? (
          <Link href="/habits" className="underline underline-offset-2">
            Ajoute-en sur Leviers
          </Link>
        ) : (
          "Ajoute le premier ci-dessus."
        )}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {habits.map((habit) => (
        <li
          key={habit.id}
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{habit.name}</p>
              {habit.description ? (
                <p className="mt-0.5 text-sm text-muted-foreground">{habit.description}</p>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">
                Série : {habit.streak} jour{habit.streak === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {mode === "checkin" ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={pending}
                  variant={habit.completedToday ? "default" : "outline"}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await toggleAction(habit.id);
                      if (result.error) {
                        toast.error(result.error);
                        return;
                      }
                      toast.success(
                        habit.completedToday ? `${habit.name} décoché` : `${habit.name} fait`,
                      );
                    })
                  }
                >
                  {habit.completedToday ? "Fait" : "Cocher"}
                </Button>
              ) : (
                <>
                  <Badge variant={habit.completedToday ? "default" : "secondary"}>
                    {habit.completedToday ? "Fait aujourd'hui" : "Pas encore"}
                  </Badge>
                  {deleteAction ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      className="text-destructive hover:text-destructive"
                      onClick={() =>
                        startTransition(async () => {
                          const result = await deleteAction(habit.id);
                          if (result.error) {
                            toast.error(result.error);
                            return;
                          }
                          toast.success("Levier supprimé");
                        })
                      }
                    >
                      Supprimer
                    </Button>
                  ) : null}
                </>
              )}
            </div>
          </div>
          <div className="flex gap-1.5" aria-label="Progression sur 7 jours">
            {week.map((day) => {
              const done = habit.weekCompletions.includes(day);
              return (
                <span
                  key={day}
                  title={day}
                  className={`h-2.5 flex-1 rounded-full ${done ? "bg-primary" : "bg-muted"}`}
                />
              );
            })}
          </div>
        </li>
      ))}
    </ul>
  );
}
