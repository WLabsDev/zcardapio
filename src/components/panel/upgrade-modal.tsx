"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
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

type PlanOption = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted: boolean;
};

export function UpgradeModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [plans, setPlans] = useState<PlanOption[] | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (!open || plans) return;
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data) => setPlans(data.plans ?? []))
      .catch(() => toast.error("Não foi possível carregar os planos."));
  }, [open, plans]);

  const upgrade = async (planId: string) => {
    setUpgrading(planId);
    const res = await fetch("/api/vendedor/plan/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: Number(planId) }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok || !data?.initPoint) {
      setUpgrading(null);
      toast.error(data?.message ?? "Não foi possível iniciar o pagamento.");
      return;
    }
    // Redireciona para o checkout do MercadoPago (PIX/cartão).
    window.location.assign(data.initPoint);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Escolha um plano</DialogTitle>
          <DialogDescription>
            Faça upgrade para desbloquear recursos exclusivos.
          </DialogDescription>
        </DialogHeader>
        {!plans ? (
          <p className="text-sm text-muted-foreground">Carregando planos...</p>
        ) : (
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
                    {plan.price === 0 ? "R$ 0" : formatBRL(plan.price)}
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
                        ? "Redirecionando..."
                        : "Assinar plano"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
