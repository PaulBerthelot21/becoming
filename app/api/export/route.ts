import { NextResponse } from "next/server";
import { buildUserBackup } from "@/lib/backup";
import { requireWhitelistedSession } from "@/lib/session";

export async function GET() {
  const session = await requireWhitelistedSession();
  const backup = await buildUserBackup(session.user.id);

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="becoming-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
