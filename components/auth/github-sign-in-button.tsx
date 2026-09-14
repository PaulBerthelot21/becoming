"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { authClient } from "@/lib/auth-client";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.8 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4s2.04.13 3 .4c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58C20.56 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z" />
    </svg>
  );
}

export function GitHubSignInButton() {
  const [pending, setPending] = useState(false);

  return (
    <motion.button
      type="button"
      disabled={pending}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97, y: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      onClick={async () => {
        setPending(true);
        try {
          await authClient.signIn.social({
            provider: "github",
            callbackURL: "/",
            errorCallbackURL: "/login?error=auth",
          });
        } catch {
          setPending(false);
        }
      }}
      className="group relative inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-md bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm outline-none ring-zinc-400 transition-shadow hover:shadow-md focus-visible:ring-2 disabled:cursor-wait disabled:opacity-80 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-zinc-500"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full dark:via-zinc-900/15"
      />
      <GitHubIcon className="relative size-4 transition-transform duration-200 group-hover:scale-110 group-active:scale-95" />
      <span className="relative">
        {pending ? "Redirection…" : "Continuer avec GitHub"}
      </span>
    </motion.button>
  );
}
