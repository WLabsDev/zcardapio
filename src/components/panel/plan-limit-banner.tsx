"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/panel/upgrade-modal";

export function PlanLimitBanner({
  monthlyOrderCount,
  limit,
}: {
  monthlyOrderCount: number;
  limit: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-bold text-destructive">
              Restaurante fechado automaticamente
            </p>
            <p className="text-sm text-destructive/90">
              Você atingiu o limite de {limit} pedidos do seu plano este mês
              ({monthlyOrderCount}/{limit}). Novos pedidos ficam bloqueados até
              o início do próximo mês ou até você fazer upgrade de plano.
            </p>
          </div>
        </div>
        <Button
          type="button"
          className="shrink-0"
          onClick={() => setOpen(true)}
        >
          Fazer upgrade
        </Button>
      </div>

      <UpgradeModal open={open} onOpenChange={setOpen} />
    </>
  );
}
