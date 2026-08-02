"use client";

import { useState } from "react";
import { CalendarClock, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/panel/upgrade-modal";
import type { PlanStatus } from "@/lib/plan-limits";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Aviso de plano vencido (carência) ou expirado, com atalho para renovar. */
export function RenewalBanner({
  status,
  planValidUntil,
}: {
  status: PlanStatus;
  planValidUntil: string | null;
}) {
  const [open, setOpen] = useState(false);

  if (status !== "grace" && status !== "expired") return null;

  const expired = status === "expired";

  return (
    <>
      <div
        className={
          expired
            ? "mb-4 flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
            : "mb-4 flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between"
        }
      >
        <div className="flex items-start gap-3">
          {expired ? (
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
          ) : (
            <CalendarClock className="mt-0.5 size-5 shrink-0 text-amber-600" />
          )}
          <div>
            <p
              className={
                expired
                  ? "text-sm font-bold text-destructive"
                  : "text-sm font-bold text-amber-700"
              }
            >
              {expired ? "Plano expirado" : "Seu plano venceu"}
            </p>
            <p
              className={
                expired
                  ? "text-sm text-destructive/90"
                  : "text-sm text-amber-700/90"
              }
            >
              {expired
                ? "Seu plano pago expirou e os recursos exclusivos foram bloqueados. Renove para desbloquear."
                : `Vencido em ${planValidUntil ? formatDate(planValidUntil) : ""}. Renove nos próximos dias para manter os recursos exclusivos.`}
            </p>
          </div>
        </div>
        <Button type="button" className="shrink-0" onClick={() => setOpen(true)}>
          Renovar plano
        </Button>
      </div>

      <UpgradeModal open={open} onOpenChange={setOpen} />
    </>
  );
}
