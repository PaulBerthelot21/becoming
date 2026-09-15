import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isEmailAllowed } from "@/lib/allowed-emails";
import { isVercelBlobUrl, mealBlobBelongsToUser } from "@/lib/blob";
import { headers } from "next/headers";

export async function GET(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Blob non configuré" }, { status: 503 });
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !isEmailAllowed(session.user.email)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const url = new URL(request.url).searchParams.get("url");
  if (!url || !isVercelBlobUrl(url) || !mealBlobBelongsToUser(url, session.user.id)) {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }

  try {
    const result = await get(url, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return new NextResponse("Introuvable", { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Introuvable", { status: 404 });
  }
}
