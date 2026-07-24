"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Clock,
  ReceiptText,
  Trophy,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarsChart, RankList } from "@/components/panel/charts";
import { StatCard } from "@/components/panel/panel-shell";
import { ProGate } from "@/components/panel/pro-gate";
import { getPlanStatus, isProUnlocked } from "@/lib/plan-limits";
import { formatBRL, type ChartPoint, type ReportPeriod } from "@/lib/mock/types";

type Report = {
  revenue: number;
  orders: number;
  cancelled: number;
  avgTicket: number;
  revenueByDay: ChartPoint[];
  ordersByHour: ChartPoint[];
  topProducts: { name: string; image: string; value: number }[];
};

export default function RelatoriosPage() {
  const [period, setPeriod] = useState<ReportPeriod>("7d");
  const [snap, setSnap] = useState<Report | null>(null);
  const [isFree, setIsFree] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/vendedor/reports?period=${period}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.report) setSnap(data.report);
      })
      .catch(() => toast.error("Não foi possível carregar os relatórios."));
    return () => {
      cancelled = true;
    };
  }, [period]);

  useEffect(() => {
    fetch("/api/vendedor/restaurant")
      .then((res) => res.json())
      .then((data) =>
        setIsFree(
          !isProUnlocked(
            getPlanStatus(data?.restaurant?.plan, data?.restaurant?.planValidUntil)
          )
        )
      )
      .catch(() => setIsFree(false));
  }, []);

  const peakHour =
    snap && snap.ordersByHour.some((h) => h.value > 0)
      ? snap.ordersByHour.reduce((a, b) => (b.value > a.value ? b : a))
      : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Relatórios</h2>
          <p className="text-sm text-muted-foreground">
            Números para ajustar o cardápio com base em dados, não em achismo.
          </p>
        </div>
        <Tabs
          value={period}
          onValueChange={(v: string) => setPeriod(v as ReportPeriod)}
        >
          <TabsList>
            <TabsTrigger value="7d">Últimos 7 dias</TabsTrigger>
            <TabsTrigger value="30d">Últimos 30 dias</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {!snap || isFree === null ? (
        <p className="text-sm text-muted-foreground">Carregando relatórios...</p>
      ) : (
        <ProGate active={isFree}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Faturamento no período"
              value={formatBRL(snap.revenue)}
              hint={period === "7d" ? "Últimos 7 dias" : "Últimos 30 dias"}
              icon={Wallet}
            />
            <StatCard
              label="Pedidos"
              value={String(snap.orders)}
              hint={`Média de ${(snap.orders / (period === "7d" ? 7 : 30)).toFixed(1)} por dia`}
              icon={ReceiptText}
            />
            <StatCard
              label="Ticket médio"
              value={formatBRL(snap.avgTicket)}
              hint="Valor médio por pedido"
              icon={BarChart3}
            />
            <StatCard
              label="Cancelados"
              value={String(snap.cancelled)}
              hint="Pedidos cancelados no período"
              icon={XCircle}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Faturamento por dia</CardTitle>
                <CardDescription>
                  Valores em R$ ·{" "}
                  {period === "7d" ? "última semana" : "últimos 30 dias"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarsChart
                  data={snap.revenueByDay}
                  formatValue={(v) => String(Math.round(v))}
                  labelEvery={period === "7d" ? 1 : 5}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  Horários de pico
                  {peakHour && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                      <Clock className="mr-1 inline size-3" />
                      pico às {peakHour.label}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>Pedidos recebidos por hora</CardDescription>
              </CardHeader>
              <CardContent>
                <BarsChart data={snap.ordersByHour} barClassName="bg-chart-2" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="size-4 text-primary" />
                Produtos que mais saem
              </CardTitle>
              <CardDescription>
                {period === "7d" ? "Últimos 7 dias" : "Últimos 30 dias"} · use
                para destacar no cardápio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {snap.topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Ainda não há pedidos no período.
                </p>
              ) : (
                <RankList items={snap.topProducts} />
              )}
            </CardContent>
          </Card>
        </ProGate>
      )}
    </div>
  );
}
