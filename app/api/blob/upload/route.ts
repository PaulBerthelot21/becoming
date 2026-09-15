import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isEmailAllowed } from "@/lib/allowed-emails";
import { headers } from "next/headers";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);

function safeExt(filename: string, contentType: string): string {
  const fromName = filename.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/heic") return "heic";
  return "bin";
}

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN manquant. Configure Vercel Blob." },
      { status: 503 },
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !isEmailAllowed(session.user.email)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Format non supporté (jpeg, png, webp, heic)" },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Photo trop lourde (max 4 Mo)" }, { status: 400 });
  }

  const pathname = `meals/${session.user.id}/${Date.now()}.${safeExt(file.name, file.type)}`;

  try {
    const blob = await put(pathname, file, {
      access: "private",
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload échoué";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
