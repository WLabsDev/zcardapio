"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/panel/upgrade-modal";

export function ProGate({
  active = true,
  message = "Esses relatórios são um benefício dos planos pagos.",
  children,
}: {
  /** Quando false, renderiza os filhos normalmente (sem blur). */
  active?: boolean;
  message?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (!active) return <>{children}</>;

  return (
    <div className="relative">
      <div
        aria-hidden
        className="space-y-6 pointer-events-none select-none blur-sm"
      >
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/70 p-6 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="size-5" />
        </span>
        <p className="max-w-xs text-sm font-semibold">{message}</p>
        <Button type="button" size="sm" onClick={() => setOpen(true)}>
          Fazer upgrade
        </Button>
      </div>
      <UpgradeModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
