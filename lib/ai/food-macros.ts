"use server";

import { generateText, Output } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { z } from "zod";
import { get } from "@vercel/blob";
import { isVercelBlobUrl, mealBlobBelongsToUser } from "@/lib/blob";
import { requireWhitelistedSession } from "@/lib/session";

const macrosSchema = z.object({
  name: z.string().max(120).nullable(),
  calories: z.number().min(0).max(5000).nullable(),
  proteinG: z.number().min(0).max(500).nullable(),
  carbsG: z.number().min(0).max(500).nullable(),
  fatG: z.number().min(0).max(500).nullable(),
});

export async function estimateFoodMacrosFromImage(imageUrl: string) {
  if (!process.env.AI_GATEWAY_API_KEY) {
    return { error: "IA non configurée (AI_GATEWAY_API_KEY)" };
  }

  const session = await requireWhitelistedSession();
  if (!isVercelBlobUrl(imageUrl) || !mealBlobBelongsToUser(imageUrl, session.user.id)) {
    return { error: "URL photo invalide" };
  }

  try {
    const blob = await get(imageUrl, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return { error: "Photo introuvable" };
    }

    const bytes = await new Response(blob.stream).arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = blob.blob.contentType || "image/jpeg";

    const { output } = await generateText({
      model: gateway("openai/gpt-4o-mini"),
      output: Output.object({ schema: macrosSchema }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Estime le repas sur la photo. Donne un nom court en français et des macros réalistes (kcal, protéines, glucides, lipides en g). Si incertain, approxime.",
            },
            {
              type: "image",
              image: `data:${mediaType};base64,${base64}`,
            },
          ],
        },
      ],
    });

    if (!output) {
      return { error: "Estimation vide" };
    }

    return {
      name: output.name,
      calories: output.calories == null ? null : Math.round(output.calories),
      proteinG: output.proteinG == null ? null : Number(output.proteinG.toFixed(1)),
      carbsG: output.carbsG == null ? null : Number(output.carbsG.toFixed(1)),
      fatG: output.fatG == null ? null : Number(output.fatG.toFixed(1)),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Estimation impossible",
    };
  }
}
