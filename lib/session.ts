import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isEmailAllowed } from "@/lib/allowed-emails";
import { auth } from "@/lib/auth";

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireWhitelistedSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!isEmailAllowed(session.user.email)) {
    redirect("/login?error=not_allowed");
  }

  return session;
}
