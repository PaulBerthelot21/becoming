"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mealImageSrc } from "@/lib/blob";
import { mealTypeLabels, mealTypes } from "@/lib/food/schema";

export type FoodFormDefaults = {
  id?: string;
  name?: string;
  mealType?: (typeof mealTypes)[number];
  date?: string;
  notes?: string | null;
  imageUrl?: string | null;
  calories?: number | null;
  proteinG?: number | null;
  carbsG?: number | null;
  fatG?: number | null;
};

type LogFoodFormProps = {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  today: string;
  defaultMealType?: (typeof mealTypes)[number];
  photosEnabled?: boolean;
  mode?: "create" | "edit";
  defaults?: FoodFormDefaults;
  onSuccess?: () => void;
  estimateMacrosAction?: (imageUrl: string) => Promise<
    | { error: string }
    | {
        calories: number | null;
        proteinG: number | null;
        carbsG: number | null;
        fatG: number | null;
        name?: string | null;
      }
  >;
  embedded?: boolean;
  /** Denser sheet layout: hidden date, collapsible macros */
  compact?: boolean;
};

function LogFoodFormInner({
  action,
  today,
  defaultMealType = "lunch",
  photosEnabled = false,
  mode = "create",
  defaults,
  onSuccess,
  estimateMacrosAction,
  embedded = false,
  compact = false,
}: LogFoodFormProps) {
  const [pending, startTransition] = useTransition();
  const [estimating, setEstimating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showMacros, setShowMacros] = useState(
    Boolean(
      defaults?.calories != null ||
      defaults?.proteinG != null ||
      defaults?.carbsG != null ||
      defaults?.fatG != null ||
      !compact,
    ),
  );
  const [imageUrl, setImageUrl] = useState<string | null>(defaults?.imageUrl ?? null);
  const [preview, setPreview] = useState<string | null>(null);
  const [clearImage, setClearImage] = useState(false);
  const [macroDefaults, setMacroDefaults] = useState({
    calories: defaults?.calories?.toString() ?? "",
    proteinG: defaults?.proteinG?.toString() ?? "",
    carbsG: defaults?.carbsG?.toString() ?? "",
    fatG: defaults?.fatG?.toString() ?? "",
    name: defaults?.name ?? "",
  });
  const formRef = useRef<HTMLFormElement>(null);

  const form = (
    <form
      ref={formRef}
      className={compact ? "space-y-3" : "space-y-4"}
      action={(formData) => {
        startTransition(async () => {
          if (mode === "edit" && defaults?.id) formData.set("id", defaults.id);
          if (imageUrl) formData.set("imageUrl", imageUrl);
          if (clearImage) formData.set("clearImage", "1");
          const result = await action(formData);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          toast.success(mode === "edit" ? "Repas mis à jour" : "Repas ajouté");
          if (mode === "create") {
            formRef.current?.reset();
            setImageUrl(null);
            setPreview(null);
            setClearImage(false);
            setMacroDefaults({ calories: "", proteinG: "", carbsG: "", fatG: "", name: "" });
          }
          onSuccess?.();
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor={`name-${mode}`}>Quoi ?</Label>
        <Input
          id={`name-${mode}`}
          name="name"
          required
          maxLength={120}
          placeholder="Ex. Poulet, riz, brocolis"
          value={macroDefaults.name}
          onChange={(event) => setMacroDefaults((prev) => ({ ...prev, name: event.target.value }))}
          className="h-11 md:h-9"
        />
      </div>

      <div className={compact ? "grid gap-3" : "grid gap-3 sm:grid-cols-2"}>
        <div className="space-y-1.5">
          <Label htmlFor={`mealType-${mode}`}>Repas</Label>
          <select
            id={`mealType-${mode}`}
            name="mealType"
            defaultValue={defaults?.mealType ?? defaultMealType}
            className="border-input bg-background h-11 w-full rounded-md border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:h-9"
          >
            {mealTypes.map((mealType) => (
              <option key={mealType} value={mealType}>
                {mealTypeLabels[mealType]}
              </option>
            ))}
          </select>
        </div>
        {compact ? (
          <input type="hidden" name="date" value={defaults?.date ?? today} />
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor={`date-${mode}`}>Date</Label>
            <Input
              id={`date-${mode}`}
              name="date"
              type="date"
              defaultValue={defaults?.date ?? today}
              className="h-11 md:h-9"
            />
          </div>
        )}
      </div>

      {photosEnabled ? (
        <div className="space-y-1.5">
          <Label htmlFor={`photo-${mode}`}>Photo (optionnel)</Label>
          <Input
            id={`photo-${mode}`}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            disabled={uploading || pending}
            className="h-11 md:h-9"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;

              setUploading(true);
              try {
                const body = new FormData();
                body.set("file", file);
                const res = await fetch("/api/blob/upload", { method: "POST", body });
                const data = (await res.json()) as { url?: string; error?: string };
                if (!res.ok || !data.url) {
                  throw new Error(data.error || "Upload photo impossible");
                }
                setImageUrl(data.url);
                setClearImage(false);
                setPreview(URL.createObjectURL(file));
                toast.success("Photo prête");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Upload photo impossible");
              } finally {
                setUploading(false);
              }
            }}
          />
          {preview || (imageUrl && !clearImage) ? (
            <div className="flex items-end gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview ?? (imageUrl ? mealImageSrc(imageUrl) : "")}
                alt="Aperçu repas"
                className={
                  compact
                    ? "mt-1 size-16 rounded-xl object-cover"
                    : "mt-2 h-28 w-28 rounded-md object-cover"
                }
              />
              <div className="flex flex-col gap-2">
                {estimateMacrosAction && imageUrl && !clearImage ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={estimating || pending}
                    onClick={() => {
                      startTransition(async () => {
                        setEstimating(true);
                        try {
                          const result = await estimateMacrosAction(imageUrl);
                          if ("error" in result) {
                            toast.error(result.error);
                            return;
                          }
                          setMacroDefaults((prev) => ({
                            name: result.name?.trim() ? result.name : prev.name,
                            calories: result.calories?.toString() ?? "",
                            proteinG: result.proteinG?.toString() ?? "",
                            carbsG: result.carbsG?.toString() ?? "",
                            fatG: result.fatG?.toString() ?? "",
                          }));
                          setShowMacros(true);
                          toast.success("Macros estimées");
                        } finally {
                          setEstimating(false);
                        }
                      });
                    }}
                  >
                    {estimating ? "Estimation…" : "Estimer macros"}
                  </Button>
                ) : null}
                {mode === "edit" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setImageUrl(null);
                      setPreview(null);
                      setClearImage(true);
                    }}
                  >
                    Retirer photo
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : !compact ? (
        <p className="text-xs text-muted-foreground">
          Photos désactivées : ajoute <code>BLOB_READ_WRITE_TOKEN</code> (Vercel Blob) pour activer.
        </p>
      ) : null}

      {compact && !showMacros ? (
        <button
          type="button"
          className="text-left text-sm font-medium text-primary underline-offset-2 hover:underline"
          onClick={() => setShowMacros(true)}
        >
          Ajouter macros / note
        </button>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor={`calories-${mode}`}>kcal</Label>
              <Input
                id={`calories-${mode}`}
                name="calories"
                type="number"
                min={0}
                max={5000}
                placeholder="—"
                value={macroDefaults.calories}
                onChange={(event) =>
                  setMacroDefaults((prev) => ({ ...prev, calories: event.target.value }))
                }
                className="h-11 md:h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`proteinG-${mode}`}>Prot. (g)</Label>
              <Input
                id={`proteinG-${mode}`}
                name="proteinG"
                type="number"
                min={0}
                max={500}
                step="0.1"
                placeholder="—"
                value={macroDefaults.proteinG}
                onChange={(event) =>
                  setMacroDefaults((prev) => ({ ...prev, proteinG: event.target.value }))
                }
                className="h-11 md:h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`carbsG-${mode}`}>Gluc. (g)</Label>
              <Input
                id={`carbsG-${mode}`}
                name="carbsG"
                type="number"
                min={0}
                max={500}
                step="0.1"
                placeholder="—"
                value={macroDefaults.carbsG}
                onChange={(event) =>
                  setMacroDefaults((prev) => ({ ...prev, carbsG: event.target.value }))
                }
                className="h-11 md:h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`fatG-${mode}`}>Lip. (g)</Label>
              <Input
                id={`fatG-${mode}`}
                name="fatG"
                type="number"
                min={0}
                max={500}
                step="0.1"
                placeholder="—"
                value={macroDefaults.fatG}
                onChange={(event) =>
                  setMacroDefaults((prev) => ({ ...prev, fatG: event.target.value }))
                }
                className="h-11 md:h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`notes-${mode}`}>Note (optionnel)</Label>
            <Input
              id={`notes-${mode}`}
              name="notes"
              maxLength={280}
              placeholder="Ex. resto, maison, faim…"
              defaultValue={defaults?.notes ?? ""}
              className="h-11 md:h-9"
            />
          </div>
        </>
      )}

      <Button
        type="submit"
        disabled={pending || uploading}
        className="h-11 w-full rounded-xl md:h-10 md:w-auto md:min-w-32"
      >
        {uploading
          ? "Upload…"
          : pending
            ? mode === "edit"
              ? "Enregistrement…"
              : "Ajout…"
            : mode === "edit"
              ? "Enregistrer"
              : "Ajouter"}
      </Button>
    </form>
  );

  if (embedded) return form;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-xs">
      <div className="border-b border-border/60 bg-gradient-to-r from-primary/8 via-transparent to-accent/30 px-4 py-4 md:px-5">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Composer
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">
          {mode === "edit" ? "Modifier le repas" : "Noter un repas"}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Texte + macros optionnelles
          {photosEnabled ? " + photo" : ""}.
        </p>
      </div>
      <div className="p-4 md:p-5">{form}</div>
    </div>
  );
}

export function LogFoodForm(props: LogFoodFormProps) {
  return (
    <LogFoodFormInner
      key={`${props.mode}-${props.defaults?.id ?? "new"}-${props.compact ? "c" : "f"}`}
      {...props}
    />
  );
}
