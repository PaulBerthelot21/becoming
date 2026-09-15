import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RitualItem = {
  id: string;
  label: string;
  done: boolean;
  href: string;
  detail?: string;
};

type TodayRitualProps = {
  items: RitualItem[];
};

export function TodayRitual({ items }: TodayRitualProps) {
  const doneCount = items.filter((item) => item.done).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rituel du jour</CardTitle>
        <CardDescription>
          {doneCount}/{items.length} — coach check-in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition hover:bg-accent",
                  item.done ? "border-primary/30 bg-primary/5" : "border-border",
                )}
              >
                {item.done ? (
                  <CheckCircle2 className="size-5 shrink-0 text-primary" />
                ) : (
                  <Circle className="size-5 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  {item.detail ? (
                    <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
