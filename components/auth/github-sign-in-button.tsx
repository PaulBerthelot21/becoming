"use client";

import { authClient } from "@/lib/auth-client";

export function GitHubSignInButton() {
  return (
    <button
      type="button"
      onClick={() =>
        authClient.signIn.social({
          provider: "github",
          callbackURL: "/",
          errorCallbackURL: "/login?error=auth",
        })
      }
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
    >
      Continuer avec GitHub
    </button>
  );
}
