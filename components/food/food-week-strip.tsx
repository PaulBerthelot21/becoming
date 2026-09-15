import Link from "next/link";
import { cn } from "@/lib/utils";

type FoodWeekStripProps = {
  days: Array<{
    date: string;
    count: number;
    calories: number;
    proteinG: number;
  }>;
  selectedDate: string;
};

export function FoodWeekStrip({ days, selectedDate }: FoodWeekStripProps) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((day) => {
        const active = day.date === selectedDate;
        const label = day.date.slice(5);

        return (
          <Link
            key={day.date}
            href={`/food?date=${day.date}`}
            className={cn(
              "rounded-lg border px-1 py-2 text-center transition",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-accent",
            )}
          >
            <p className="text-[10px] opacity-80">{label}</p>
            <p className="mt-1 text-xs font-medium">{day.count || "·"}</p>
          </Link>
        );
      })}
    </div>
  );
}
