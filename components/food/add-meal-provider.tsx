"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { LogFoodForm } from "@/components/food/log-food-form";
import { mealTypeLabels, mealTypes } from "@/lib/food/schema";

type Favorite = {
  id: string;
  name: string;
  mealType: (typeof mealTypes)[number] | null;
  calories: number | null;
};

type EstimateMacros = (imageUrl: string) => Promise<
  | { error: string }
  | {
      calories: number | null;
      proteinG: number | null;
      carbsG: number | null;
      fatG: number | null;
      name?: string | null;
    }
>;

export type AddMealConfig = {
  today: string;
  photosEnabled?: boolean;
  favorites: Favorite[];
  createAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  createFromFavoriteAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  estimateMacrosAction?: EstimateMacros;
  defaultMealType?: (typeof mealTypes)[number];
};

type AddMealContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  config: AddMealConfig | null;
  register: (config: AddMealConfig | null) => void;
  available: boolean;
};

const AddMealContext = createContext<AddMealContextValue | null>(null);

export function AddMealProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<AddMealConfig | null>(null);
  const [pending, startTransition] = useTransition();

  const register = useCallback((next: AddMealConfig | null) => {
    setConfig(next);
    if (!next) setOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      config,
      register,
      available: Boolean(config),
    }),
    [open, config, register],
  );

  return (
    <AddMealContext.Provider value={value}>
      {children}
      {config ? (
        <ResponsiveModal open={open} onClose={() => setOpen(false)} title="Noter un repas">
          <div className="space-y-4">
            {config.favorites.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Favoris · 1 tap
                </p>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {config.favorites.map((favorite) => (
                    <button
                      key={favorite.id}
                      type="button"
                      disabled={pending}
                      className="flex min-h-12 min-w-[9.5rem] shrink-0 flex-col items-start justify-center rounded-2xl border border-border/70 bg-secondary/60 px-3.5 py-2.5 text-left active:scale-[0.98]"
                      onClick={() =>
                        startTransition(async () => {
                          const formData = new FormData();
                          formData.set("favoriteId", favorite.id);
                          formData.set("date", config.today);
                          const result = await config.createFromFavoriteAction(formData);
                          if (result.error) {
                            toast.error(result.error);
                            return;
                          }
                          toast.success(`${favorite.name} ajouté`);
                          setOpen(false);
                        })
                      }
                    >
                      <span className="max-w-[10rem] truncate text-sm font-medium">
                        {favorite.name}
                      </span>
                      <span className="mt-0.5 text-[11px] text-muted-foreground">
                        {favorite.mealType ? mealTypeLabels[favorite.mealType] : "Repas"}
                        {favorite.calories != null ? ` · ${favorite.calories}` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <LogFoodForm
              embedded
              compact
              action={config.createAction}
              today={config.today}
              defaultMealType={config.defaultMealType ?? "lunch"}
              photosEnabled={config.photosEnabled}
              estimateMacrosAction={config.estimateMacrosAction}
              onSuccess={() => setOpen(false)}
            />
          </div>
        </ResponsiveModal>
      ) : null}
    </AddMealContext.Provider>
  );
}

export function useAddMeal() {
  const ctx = useContext(AddMealContext);
  if (!ctx) {
    throw new Error("useAddMeal must be used within AddMealProvider");
  }
  return ctx;
}

export function RegisterAddMeal(config: AddMealConfig) {
  const { register } = useAddMeal();
  const favoriteKey = config.favorites.map((f) => f.id).join(",");

  useEffect(() => {
    register(config);
    return () => register(null);
    // Page config is stable enough per navigation; favorite ids catch list changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional page registration
  }, [
    register,
    config.today,
    config.photosEnabled,
    config.defaultMealType,
    favoriteKey,
    config.createAction,
    config.createFromFavoriteAction,
    config.estimateMacrosAction,
  ]);

  return null;
}
