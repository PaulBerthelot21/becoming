import { requireWhitelistedSession } from "@/lib/session";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { ThemePreference } from "@/components/profile/theme-preference";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await requireWhitelistedSession();
  const { name, email, image, createdAt } = session.user;

  const memberSince = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(createdAt));

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">Compte, apparence et déconnexion.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        <Card>
          <CardHeader>
            <CardTitle>Compte</CardTitle>
            <CardDescription>Infos liées à ta connexion GitHub.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <ProfileAvatar name={name} image={image} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-medium leading-tight">{name}</p>
                <p className="mt-1 truncate text-sm text-muted-foreground">{email}</p>
              </div>
            </div>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Nom</dt>
                <dd className="mt-0.5 font-medium">{name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="mt-0.5 font-medium break-all">{email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Membre depuis</dt>
                <dd className="mt-0.5 font-medium">{memberSince}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <ThemePreference />

          <Card>
            <CardHeader>
              <CardTitle>Session</CardTitle>
              <CardDescription>Quitter l’application sur cet appareil.</CardDescription>
            </CardHeader>
            <CardContent>
              <SignOutButton />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
