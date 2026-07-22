"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Check, Copy, Gift, Ticket, UtensilsCrossed, Wallet } from "lucide-react";
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

type RedeemedCoupon = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
  usedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  restaurantName: string;
  restaurantSlug: string;
};

const MECHANIC_ICON = { points: Award, cashback: Wallet, stamps: Gift } as const;

function couponStatus(c: RedeemedCoupon): { label: string; tone: "positive" | "muted" | "negative" } {
  if (c.usedAt) return { label: "Usado", tone: "muted" };
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) {
    return { label: "Expirado", tone: "negative" };
  }
  if (!c.active) return { label: "Inativo", tone: "muted" };
  return { label: "Disponível", tone: "positive" };
}

export default function FidelidadePage() {
  const [items, setItems] = useState<LoyaltyItem[] | null>(null);
  const [coupons, setCoupons] = useState<RedeemedCoupon[]>([]);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);

  const load = () => {
    fetch("/api/cliente/loyalty")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items ?? []);
        setCoupons(data.coupons ?? []);
      })
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
                    <div className="flex min-w-0 items-center gap-2">
                      {item.restaurantLogo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.restaurantLogo}
                          alt={item.restaurantName}
                          className="size-9 shrink-0 rounded-lg border object-cover"
                        />
                      ) : (
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent">
                          <Icon className="size-4" />
                        </span>
                      )}
                      <p className="truncate font-semibold">{item.restaurantName}</p>
                    </div>
                    {item.eligible && (
                      <Badge className="shrink-0">
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

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      disabled={!item.eligible || redeeming === item.restaurantId}
                      onClick={() => redeem(item.restaurantId)}
                    >
                      {redeeming === item.restaurantId ? "Resgatando..." : "Resgatar"}
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link
                        href={`/r/${item.restaurantSlug}`}
                        aria-label={`Ver cardápio de ${item.restaurantName}`}
                      >
                        <UtensilsCrossed className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h3 className="font-display text-lg font-bold">Meus cupons</h3>
          <p className="text-sm text-muted-foreground">
            Cupons já resgatados e a validade de cada um.
          </p>
        </div>

        {coupons.length === 0 ? (
          <EmptyState
            compact
            icon={Ticket}
            title="Nenhum cupom resgatado ainda"
            description="Resgate uma recompensa acima para gerar seu primeiro cupom."
          />
        ) : (
          <div className="space-y-2">
            {coupons.map((c) => {
              const status = couponStatus(c);
              return (
                <Card key={c.code}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold">{c.code}</p>
                        <Badge
                          variant={
                            status.tone === "positive"
                              ? "default"
                              : status.tone === "negative"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {status.label}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.restaurantName} ·{" "}
                        {c.type === "percent"
                          ? `${c.value}% de desconto`
                          : `${formatBRL(c.value / 100)} de desconto`}
                        {c.expiresAt &&
                          ` · válido até ${new Date(c.expiresAt).toLocaleDateString("pt-BR")}`}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyCode(c.code)}
                      aria-label="Copiar código"
                    >
                      <Copy className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
