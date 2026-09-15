export const CUT_HABIT_TEMPLATES = [
  {
    id: "protein",
    name: "Protéines",
    description: "Atteindre l'objectif protéines du jour",
  },
  {
    id: "walk",
    name: "Marche",
    description: "Au moins 8–10k pas ou 30 min de marche",
  },
  {
    id: "training",
    name: "Entraînement",
    description: "Séance force ou cardio prévue",
  },
  {
    id: "water",
    name: "Eau",
    description: "Boire assez d'eau dans la journée",
  },
  {
    id: "sleep",
    name: "Coucher",
    description: "Être au lit avant l'heure cible",
  },
] as const;

export type CutHabitTemplateId = (typeof CUT_HABIT_TEMPLATES)[number]["id"];
