"use client";

import { Check } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { plans } from "@/lib/mock/data";
import { formatBRL } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const subscribers: Record<string, number> = {
  gratis: 642,
  pro: 447,
  premium: 115,
};

export default function AdminPlanosPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Planos</h2>
        <p className="text-sm text-muted-foreground">
          Planos disponíveis e distribuição de assinantes.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "border-2 transition-all hover:-translate-y-0.5",
              plan.highlighted
                ? "border-foreground shadow-offset-sm"
                : "border-foreground/15 hover:border-foreground hover:shadow-offset-sm"
            )}
          >
            <CardContent className="flex h-full flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">{plan.name}</h3>
                <Badge variant="secondary">
                  {subscribers[plan.id]} assinantes
                </Badge>
              </div>
              <div>
                <p className="text-3xl font-extrabold">
                  {plan.price === 0 ? "R$ 0" : formatBRL(plan.price)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /mês
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  ≈ {formatBRL(subscribers[plan.id] * plan.price)} de receita
                  mensal
                </p>
              </div>
              <ul className="flex-1 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                onClick={() =>
                  toast.info(
                    `Edição do plano ${plan.name} chega junto com o backend.`
                  )
                }
              >
                Editar plano
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
