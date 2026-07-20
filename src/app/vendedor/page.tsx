"use client";

import Link from "next/link";
import {
  DollarSign,
  ReceiptText,
  ShoppingBag,
  TrendingUp,
  ExternalLink,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard, usePanelUser } from "@/components/panel/panel-shell";
import { OrderStatusBadge } from "@/components/panel/order-status-badge";
import { OnboardingChecklist } from "@/components/panel/onboarding-checklist";
import { useOrders } from "@/components/panel/orders-provider";
import { products } from "@/lib/mock/data";
import { formatBRL } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

export default function VendedorDashboard() {
  const { orders, pendingCount } = useOrders();
  const { name } = usePanelUser();

  const topProducts = products
    .filter((p) => p.restaurantId === "r1" && p.popular)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">
            Olá, {name.split(" ")[0]} 👋
          </h2>
          <p className="text-sm text-muted-foreground">
            Aqui está o resumo do seu restaurante hoje.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/vendedor/qrcode">
              <QrCode className="size-4" />
              QR code
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/r/burguer-do-ze" target="_blank">
              <ExternalLink className="size-4" />
              Ver cardápio
            </Link>
          </Button>
        </div>
      </div>

      <OnboardingChecklist />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Faturamento hoje"
          value={formatBRL(236.2)}
          hint="+18% vs ontem"
          icon={DollarSign}
        />
        <StatCard
          label="Pedidos hoje"
          value={String(orders.length)}
          hint={
            pendingCount > 0
              ? `${pendingCount} aguardando confirmação`
              : "Todos confirmados"
          }
          icon={ReceiptText}
        />
        <StatCard
          label="Ticket médio"
          value={formatBRL(47.24)}
          hint="Últimos 7 dias"
          icon={ShoppingBag}
        />
        <StatCard
          label="Visitas ao cardápio"
          value="184"
          hint="+32% esta semana"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Pedidos recentes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/vendedor/pedidos">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 4).map((o) => (
                  <TableRow
                    key={o.id}
                    className={cn(
                      o.status === "pendente" &&
                        "bg-amber-50/70 dark:bg-amber-950/20"
                    )}
                  >
                    <TableCell className="font-medium">{o.code}</TableCell>
                    <TableCell>{o.customerName}</TableCell>
                    <TableCell>{formatBRL(o.total)}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={o.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mais vendidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-muted-foreground">
                  {i + 1}º
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.name}
                  className="size-10 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBRL(p.price)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
