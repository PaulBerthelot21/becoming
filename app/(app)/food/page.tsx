import Link from "next/link";
import { createFoodEntry, deleteFoodEntry, getFoodDay, getFoodWeek } from "@/lib/food/actions";
import { shiftDateKey, startOfUtcDay, toDateKey } from "@/lib/date";
import { requireWhitelistedSession } from "@/lib/session";
import { FoodDayList } from "@/components/food/food-day-list";
import { FoodWeekStrip } from "@/components/food/food-week-strip";
import { LogFoodForm } from "@/components/food/log-food-form";
import { Button } from "@/components/ui/button";

function defaultMealTypeForNow(): "breakfast" | "lunch" | "dinner" | "snack" {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}

type FoodPageProps = {
  searchParams: Promise<{ date?: string }>;
};

export default async function FoodPage({ searchParams }: FoodPageProps) {
  const session = await requireWhitelistedSession();
  const params = await searchParams;
  const today = toDateKey(startOfUtcDay());
  const selectedDate = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : today;

  const [food, week] = await Promise.all([
    getFoodDay(session.user.id, selectedDate),
    getFoodWeek(session.user.id, selectedDate),
  ]);

  const photosEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const prev = shiftDateKey(selectedDate, -1);
  const next = shiftDateKey(selectedDate, 1);
  const isToday = selectedDate === today;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alimentation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Jour sélectionné : {selectedDate}
            {isToday ? " (aujourd'hui)" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/food?date=${prev}`}>Hier</Link>
          </Button>
          {!isToday ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/food">Aujourd&apos;hui</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" size="sm">
            <Link href={`/food?date=${next}`}>Lendemain</Link>
          </Button>
        </div>
      </div>

      <FoodWeekStrip days={week.days} selectedDate={selectedDate} />

      <LogFoodForm
        action={createFoodEntry}
        today={selectedDate}
        defaultMealType={defaultMealTypeForNow()}
        photosEnabled={photosEnabled}
      />

      <FoodDayList
        byMeal={food.byMeal}
        totals={food.totals}
        goal={food.goal}
        progress={food.progress}
        deleteAction={deleteFoodEntry}
      />
    </>
  );
}
