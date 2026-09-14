"use client";

import { useTransition } from "react";
import Link from "next/link";

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
  /** checkin = today view; manage = habits admin */
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
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
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
          className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{habit.name}</p>
              {habit.description ? (
                <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                  {habit.description}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-zinc-500">
                Série : {habit.streak} jour{habit.streak === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {mode === "checkin" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await toggleAction(habit.id);
                    })
                  }
                  className={`h-9 cursor-pointer rounded-md px-3 text-sm font-medium transition ${
                    habit.completedToday
                      ? "bg-emerald-600 text-white hover:bg-emerald-500"
                      : "border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  }`}
                >
                  {habit.completedToday ? "Fait" : "Cocher"}
                </button>
              ) : (
                <>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      habit.completedToday
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                    }`}
                  >
                    {habit.completedToday ? "Fait aujourd'hui" : "Pas encore"}
                  </span>
                  {deleteAction ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await deleteAction(habit.id);
                        })
                      }
                      className="h-9 cursor-pointer rounded-md px-3 text-sm text-zinc-500 transition hover:bg-zinc-50 hover:text-red-600 dark:hover:bg-zinc-900"
                    >
                      Supprimer
                    </button>
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
                  className={`h-2.5 flex-1 rounded-full ${
                    done ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-800"
                  }`}
                />
              );
            })}
          </div>
        </li>
      ))}
    </ul>
  );
}
