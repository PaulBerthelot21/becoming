import Link from "next/link";
import { redirect } from "next/navigation";
import { GitHubSignInButton } from "@/components/auth/github-sign-in-button";
import { isEmailAllowed } from "@/lib/allowed-emails";
import { getSession } from "@/lib/session";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();
  const params = await searchParams;

  if (session && isEmailAllowed(session.user.email)) {
    redirect("/");
  }

  const errorMessage =
    params.error === "not_allowed"
      ? "Accès refusé : cet email n'est pas autorisé sur Becoming."
      : params.error
        ? "La connexion a échoué. Réessaie ou vérifie que ton email GitHub est whitelisté."
        : null;

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-12">
      <div className="space-y-2">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Becoming</p>
        <h1 className="text-3xl font-semibold tracking-tight">Connexion</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Accès réservé. Connecte-toi avec GitHub pour continuer.
        </p>
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {errorMessage}
        </p>
      ) : null}

      <GitHubSignInButton />

      <p className="text-xs text-zinc-500 dark:text-zinc-500">
        Seuls les emails listés dans{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">ALLOWED_EMAILS</code> peuvent
        créer un compte.{" "}
        <Link href="/" className="underline underline-offset-2">
          Retour
        </Link>
      </p>
    </main>
  );
}
