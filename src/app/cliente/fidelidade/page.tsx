"use client";

import { useEffect, useState } from "react";
import { Award, Check, Copy, Gift, Wallet } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/panel/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatBRL } from "@/lib/mock/types";

type LoyaltyItem = {
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  restaurantLogo: string;
  mechanic: "points" | "cashback" | "stamps";
  points: number;
  cashbackCents: number;
  stampCount: number;
  pointsRequired: number;
  stampsRequired: number;
  eligible: boolean;
};

const MECHANIC_ICON = { points: Award, cashback: Wallet, stamps: Gift } as const;

export default function FidelidadePage() {
  const [items, setItems] = useState<LoyaltyItem[] | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);

  const load = () => {
    fetch("/api/cliente/loyalty")
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => toast.error("Não foi possível carregar a fidelidade."));
  };

  useEffect(load, []);

  const redeem = async (restaurantId: string) => {
    setRedeeming(restaurantId);
    const res = await fetch("/api/cliente/loyalty/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setRedeeming(null);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível resgatar.");
      return;
    }
    setRedeemedCode(data.code);
    toast.success("Cupom gerado! Aplique no checkout.");
    load();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    toast.success("Código copiado!");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Fidelidade</h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe seu progresso e resgate recompensas nos restaurantes que
          você pediu.
        </p>
      </div>

      {redeemedCode && (
        <Card className="border-2 border-primary">
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Cupom gerado!</p>
              <p className="font-mono text-lg font-bold">{redeemedCode}</p>
            </div>
            <Button variant="outline" onClick={() => copyCode(redeemedCode)}>
              <Copy className="size-4" />
              Copiar código
            </Button>
          </CardContent>
        </Card>
      )}

      {items === null ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="Nenhuma fidelidade por aqui ainda"
          description="Peça em restaurantes com programa de fidelidade ativo para começar a acumular recompensas."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const Icon = MECHANIC_ICON[item.mechanic];
            const progress =
              item.mechanic === "points"
                ? item.points
                : item.mechanic === "stamps"
                  ? item.stampCount
                  : item.cashbackCents;
            const goal =
              item.mechanic === "points"
                ? item.pointsRequired
                : item.mechanic === "stamps"
                  ? item.stampsRequired
                  : null;

            return (
              <Card key={item.restaurantId}>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-accent">
                        <Icon className="size-4" />
                      </span>
                      <p className="font-semibold">{item.restaurantName}</p>
                    </div>
                    {item.eligible && (
                      <Badge>
                        <Check className="size-3" />
                        Resgatável
                      </Badge>
                    )}
                  </div>

                  {item.mechanic === "cashback" ? (
                    <p className="text-2xl font-extrabold text-primary">
                      {formatBRL(item.cashbackCents / 100)}
                    </p>
                  ) : (
                    <>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${goal ? Math.min((progress / goal) * 100, 100) : 0}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {progress} / {goal} {item.mechanic === "points" ? "pontos" : "carimbos"}
                      </p>
                    </>
                  )}

                  <Button
                    className="w-full"
                    disabled={!item.eligible || redeeming === item.restaurantId}
                    onClick={() => redeem(item.restaurantId)}
                  >
                    {redeeming === item.restaurantId ? "Resgatando..." : "Resgatar"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
