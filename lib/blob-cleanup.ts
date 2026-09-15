"use server";

import { del, list } from "@vercel/blob";
import { requireWhitelistedSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidateApp } from "@/lib/revalidate";

export async function cleanupOrphanMealBlobs() {
  const session = await requireWhitelistedSession();

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { error: "BLOB_READ_WRITE_TOKEN manquant" };
  }

  const prefix = `meals/${session.user.id}/`;
  const used = new Set(
    (
      await prisma.foodEntry.findMany({
        where: { userId: session.user.id, imageUrl: { not: null } },
        select: { imageUrl: true },
      })
    )
      .map((row) => row.imageUrl)
      .filter((url): url is string => Boolean(url)),
  );

  let cursor: string | undefined;
  let deleted = 0;

  do {
    const page = await list({
      prefix,
      cursor,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    for (const blob of page.blobs) {
      if (!used.has(blob.url)) {
        try {
          await del(blob.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
          deleted += 1;
        } catch {
          // continue
        }
      }
    }

    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  revalidateApp();
  return { success: true, deleted };
}
