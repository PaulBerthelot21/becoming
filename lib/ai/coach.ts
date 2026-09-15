"use server";

import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { getWeeklyInsights } from "@/lib/insights";
import { getHabitsForUser } from "@/lib/habits/actions";

export async function getCoachNote(userId: string): Promise<string | null> {
  if (!process.env.AI_GATEWAY_API_KEY) return null;

  try {
    const [insights, habits] = await Promise.all([
      getWeeklyInsights(userId),
      getHabitsForUser(userId),
    ]);

    const doneToday = habits.filter((h) => h.completedToday).length;
    const prompt = [
      "Tu es un coach cut concis en français (2-3 phrases max, tutoiement).",
      "Pas de markdown. Pas de listes. Donne un conseil actionnable pour aujourd'hui.",
      `Insights: ${insights.lines.join(" | ")}`,
      `Leviers aujourd'hui: ${doneToday}/${habits.length}`,
    ].join("\n");

    const { text } = await generateText({
      model: gateway("openai/gpt-4o-mini"),
      prompt,
      maxOutputTokens: 180,
    });

    const cleaned = text.trim();
    return cleaned || null;
  } catch {
    return null;
  }
}
