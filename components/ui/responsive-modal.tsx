"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ResponsiveModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

/** Bottom sheet on mobile, centered dialog from md. */
export function ResponsiveModal({
  open,
  onClose,
  title,
  children,
  className,
}: ResponsiveModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-2xl border border-border bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg",
          "md:inset-auto md:top-1/2 md:left-1/2 md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl md:p-6 md:pb-6",
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="mx-auto h-1 w-10 rounded-full bg-muted md:hidden" />
          <h2 className="hidden text-lg font-semibold tracking-tight md:block">{title}</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="ml-auto"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight md:hidden">{title}</h2>
        {children}
      </div>
    </div>
  );
}
