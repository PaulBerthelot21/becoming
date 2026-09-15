import Link from "next/link";
import {
  addFavoriteFromEntry,
  copyFoodDay,
  createFoodEntry,
  createFoodFromFavorite,
  deleteFoodEntry,
  getFoodDay,
  getFoodWeek,
  listFoodFavorites,
  removeFavorite,
  updateFoodEntry,
} from "@/lib/food/actions";
import { estimateFoodMacrosFromImage } from "@/lib/ai/food-macros";
import { shiftDateKey, startOfUtcDay, toDateKey } from "@/lib/date";
import { requireWhitelistedSession } from "@/lib/session";
import { FoodDayList } from "@/components/food/food-day-list";
import { FoodQuickActions } from "@/components/food/food-quick-actions";
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

  const [food, week, favorites] = await Promise.all([
    getFoodDay(session.user.id, selectedDate),
    getFoodWeek(session.user.id, selectedDate),
    listFoodFavorites(session.user.id),
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
          <Button asChild variant="outline" size="sm" className="h-11 md:h-8">
            <Link href={`/food?date=${prev}`}>Hier</Link>
          </Button>
          {!isToday ? (
            <Button asChild variant="outline" size="sm" className="h-11 md:h-8">
              <Link href="/food">Aujourd&apos;hui</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" size="sm" className="h-11 md:h-8">
            <Link href={`/food?date=${next}`}>Lendemain</Link>
          </Button>
        </div>
      </div>

      <FoodWeekStrip days={week.days} selectedDate={selectedDate} />

      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        <div className="space-y-6">
          <FoodQuickActions
            selectedDate={selectedDate}
            favorites={favorites}
            copyAction={copyFoodDay}
            createFromFavoriteAction={createFoodFromFavorite}
            removeFavoriteAction={removeFavorite}
          />
          <LogFoodForm
            action={createFoodEntry}
            today={selectedDate}
            defaultMealType={defaultMealTypeForNow()}
            photosEnabled={photosEnabled}
            estimateMacrosAction={estimateFoodMacrosFromImage}
          />
        </div>
        <FoodDayList
          byMeal={food.byMeal}
          totals={food.totals}
          goal={food.goal}
          progress={food.progress}
          selectedDate={selectedDate}
          photosEnabled={photosEnabled}
          deleteAction={deleteFoodEntry}
          updateAction={updateFoodEntry}
          favoriteAction={addFavoriteFromEntry}
          estimateMacrosAction={estimateFoodMacrosFromImage}
        />
      </div>
    </>
  );
}
