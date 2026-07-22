"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBRL } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

export type OrderLimitPlan = {
  id: number;
  name: string;
  priceCents: number;
  description: string;
  features: string[];
  highlighted: boolean;
};

export function PlanLimitBanner({
  monthlyOrderCount,
  limit,
  plans,
}: {
  monthlyOrderCount: number;
  limit: number;
  plans: OrderLimitPlan[];
}) {
  const [open, setOpen] = useState(false);
  const [upgrading, setUpgrading] = useState<number | null>(null);
  const router = useRouter();

  const upgrade = async (planId: number) => {
    setUpgrading(planId);
    const res = await fetch("/api/vendedor/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    }).catch(() => null);
    setUpgrading(null);
    if (!res?.ok) {
      toast.error("Não foi possível atualizar o plano.");
      return;
    }
    toast.success("Plano atualizado! Seu restaurante já está recebendo pedidos.");
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border-2 border-destructive/40 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-bold text-destructive">
              Restaurante fechado automaticamente
            </p>
            <p className="text-sm text-destructive/90">
              Você atingiu o limite de {limit} pedidos do plano grátis este mês
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Escolha um plano</DialogTitle>
            <DialogDescription>
              Faça upgrade para continuar recebendo pedidos sem limites
              mensais.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "border-2",
                  plan.highlighted
                    ? "border-foreground shadow-offset-sm"
                    : "border-foreground/15"
                )}
              >
                <CardContent className="flex h-full flex-col gap-3">
                  <h3 className="font-display text-lg font-bold">
                    {plan.name}
                  </h3>
                  <p className="text-2xl font-extrabold">
                    {plan.priceCents === 0
                      ? "R$ 0"
                      : formatBRL(plan.priceCents / 100)}
                    <span className="text-xs font-normal text-muted-foreground">
                      /mês
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {plan.description}
                  </p>
                  <ul className="flex-1 space-y-1.5 text-xs">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    variant={plan.name === "Grátis" ? "outline" : "default"}
                    disabled={plan.name === "Grátis" || upgrading === plan.id}
                    onClick={() => upgrade(plan.id)}
                  >
                    {plan.name === "Grátis"
                      ? "Plano atual"
                      : upgrading === plan.id
                        ? "Atualizando..."
                        : "Fazer upgrade"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
