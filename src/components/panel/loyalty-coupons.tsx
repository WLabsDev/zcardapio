"use client";

import { useEffect, useState } from "react";
import { Ticket } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/panel/empty-state";
import { formatBRL } from "@/lib/mock/types";
import { formatPhone } from "@/lib/phone";

type LoyaltyCoupon = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  /** percentual (0-100) ou valor em reais */
  value: number;
  active: boolean;
  createdAt: string;
  usedAt: string | null;
  expiresAt: string | null;
  customerName: string;
  customerPhone: string | null;
};

type Summary = {
  total: number;
  used: number;
  available: number;
  expired: number;
};

/** Mesmos rótulos que o cliente vê em /cliente/fidelidade. */
function couponStatus(c: LoyaltyCoupon): {
  label: string;
  variant: "default" | "secondary" | "destructive";
} {
  if (c.usedAt) return { label: "Usado", variant: "secondary" };
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) {
    return { label: "Expirado", variant: "destructive" };
  }
  if (!c.active) return { label: "Inativo", variant: "secondary" };
  return { label: "Disponível", variant: "default" };
}

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

/**
 * Cupons que os clientes geraram trocando pontos/carimbos/cashback. Só leitura:
 * quem resgatou é dono do cupom, o vendedor acompanha mas não edita.
 */
export function LoyaltyCoupons() {
  const [coupons, setCoupons] = useState<LoyaltyCoupon[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetch("/api/vendedor/loyalty/coupons")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setCoupons(data.coupons ?? []);
        setSummary(data.summary ?? null);
      })
      .catch(() => {
        setCoupons([]);
        toast.error("Não foi possível carregar os cupons de fidelidade.");
      });
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-bold">Cupons resgatados</h3>
          <p className="text-sm text-muted-foreground">
            Gerados pelos clientes ao trocar a recompensa. Eles valem no
            checkout e são de uso único.
          </p>
        </div>
        {summary && summary.total > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant="outline"
              className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 text-[10px]"
            >
              {summary.available} disponíveis
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {summary.used} usados
            </Badge>
            {summary.expired > 0 && (
              <Badge
                variant="outline"
                className="border-red-500/20 bg-red-500/10 text-red-600 text-[10px]"
              >
                {summary.expired} expirados
              </Badge>
            )}
          </div>
        )}
      </div>

      {coupons === null ? (
        <p className="text-sm text-muted-foreground">Carregando cupons...</p>
      ) : coupons.length === 0 ? (
        <EmptyState
          compact
          icon={Ticket}
          title="Nenhum cupom resgatado ainda"
          description="Quando um cliente trocar a recompensa, o cupom aparece aqui."
        />
      ) : (
        <div className="space-y-1.5">
          {coupons.map((c) => {
            const status = couponStatus(c);
            return (
              <Card key={c.id} className="py-0">
                <CardContent className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold">
                        {c.code}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {c.type === "percent"
                          ? `${c.value}%`
                          : formatBRL(c.value)}
                      </Badge>
                      <Badge variant={status.variant} className="text-[10px]">
                        {status.label}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.customerName}
                      {c.customerPhone && ` · ${formatPhone(c.customerPhone)}`}
                    </p>
                  </div>
                  <p className="shrink-0 text-right text-xs text-muted-foreground">
                    Resgatado em {shortDate(c.createdAt)}
                    {c.usedAt
                      ? ` · usado em ${shortDate(c.usedAt)}`
                      : c.expiresAt
                        ? ` · vale até ${shortDate(c.expiresAt)}`
                        : ""}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
