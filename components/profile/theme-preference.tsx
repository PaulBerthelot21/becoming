"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Système", icon: Monitor },
] as const;

function subscribe() {
  return () => {};
}

export function ThemePreference() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const current = mounted ? (theme ?? "system") : "system";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apparence</CardTitle>
        <CardDescription>Thème de l’interface.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {options.map(({ value, label, icon: Icon }) => {
            const active = current === value;

            return (
              <Button
                key={value}
                type="button"
                variant={active ? "default" : "outline"}
                className={cn(
                  "h-auto flex-col gap-1.5 py-3",
                  !mounted && "pointer-events-none opacity-70",
                )}
                aria-pressed={active}
                onClick={() => setTheme(value)}
              >
                <Icon className="size-4" />
                <span className="text-xs font-medium">{label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
