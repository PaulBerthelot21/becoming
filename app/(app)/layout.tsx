import type { ReactNode } from "react";
import { AppNav } from "@/components/app-nav";
import { Toaster } from "@/components/ui/sonner";
import { requireWhitelistedSession } from "@/lib/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireWhitelistedSession();

  return (
    <>
      <AppNav />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-8 pb-28 md:pb-8">
        {children}
      </div>
      <Toaster richColors closeButton position="top-center" />
    </>
  );
}
