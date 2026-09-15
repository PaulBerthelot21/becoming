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

/** Bottom sheet on mobile (sticky chrome), centered dialog from md. */
export function ResponsiveModal({
  open,
  onClose,
  title,
  children,
  className,
}: ResponsiveModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
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
          "relative z-10 flex w-full max-h-[88dvh] flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-lg",
          "pb-[env(safe-area-inset-bottom)]",
          "md:max-h-[min(85dvh,40rem)] md:max-w-lg md:rounded-2xl md:pb-0",
          className,
        )}
      >
        <div className="shrink-0 border-b border-border/60 px-4 pt-3 pb-3 md:px-5 md:pt-4">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted md:hidden" />
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-10 w-10 shrink-0 md:h-8 md:w-8"
              onClick={onClose}
            >
              <X />
            </Button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-5 md:py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
