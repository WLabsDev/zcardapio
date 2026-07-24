"use client";

import {
  LayoutDashboard,
  BookOpen,
  ReceiptText,
  BarChart3,
  Gift,
  QrCode,
  Palette,
  Settings,
  Star,
} from "lucide-react";
import { OrdersProvider, useOrders } from "@/components/panel/orders-provider";
import { PanelShell, type NavItem } from "@/components/panel/panel-shell";
import { PlanLimitBanner } from "@/components/panel/plan-limit-banner";
import { RenewalBanner } from "@/components/panel/renewal-banner";
import type { PlanStatus } from "@/lib/plan-limits";

type OrderLimitBanner = {
  monthlyOrderCount: number;
  limit: number;
};

function Shell({
  userName,
  restaurantName,
  planName,
  impersonating,
  orderLimitBanner,
  planStatus,
  planValidUntil,
  children,
}: {
  userName: string;
  restaurantName: string;
  planName: string | null;
  impersonating?: boolean;
  orderLimitBanner?: OrderLimitBanner | null;
  planStatus: PlanStatus;
  planValidUntil: string | null;
  children: React.ReactNode;
}) {
  const { pendingCount } = useOrders();

  const nav: NavItem[] = [
    { href: "/vendedor", label: "Visão geral", icon: LayoutDashboard },
    { href: "/vendedor/cardapio", label: "Cardápio", icon: BookOpen },
    {
      href: "/vendedor/pedidos",
      label: "Pedidos",
      icon: ReceiptText,
      badge:
        pendingCount > 0 ? (
          <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {pendingCount}
          </span>
        ) : undefined,
    },
    { href: "/vendedor/relatorios", label: "Relatórios", icon: BarChart3 },
    { href: "/vendedor/avaliacoes", label: "Avaliações", icon: Star },
    { href: "/vendedor/fidelidade", label: "Fidelidade", icon: Gift },
    { href: "/vendedor/qrcode", label: "QR code", icon: QrCode },
    { href: "/vendedor/aparencia", label: "Aparência", icon: Palette },
    { href: "/vendedor/configuracoes", label: "Configurações", icon: Settings },
  ];

  return (
    <PanelShell
      title={restaurantName}
      nav={nav}
      userName={userName}
      userRole={planName ? `Restaurante · Plano ${planName}` : "Restaurante"}
      impersonating={impersonating}
      banner={
        <>
          {orderLimitBanner && (
            <PlanLimitBanner
              monthlyOrderCount={orderLimitBanner.monthlyOrderCount}
              limit={orderLimitBanner.limit}
            />
          )}
          <RenewalBanner status={planStatus} planValidUntil={planValidUntil} />
        </>
      }
    >
      {children}
    </PanelShell>
  );
}

export function VendedorShell({
  userName,
  restaurantName,
  planName,
  impersonating,
  orderLimitBanner,
  planStatus,
  planValidUntil,
  children,
}: {
  userName: string;
  restaurantName: string;
  planName: string | null;
  impersonating?: boolean;
  orderLimitBanner?: OrderLimitBanner | null;
  planStatus: PlanStatus;
  planValidUntil: string | null;
  children: React.ReactNode;
}) {
  return (
    <OrdersProvider>
      <Shell
        userName={userName}
        restaurantName={restaurantName}
        planName={planName}
        impersonating={impersonating}
        orderLimitBanner={orderLimitBanner}
        planStatus={planStatus}
        planValidUntil={planValidUntil}
      >
        {children}
      </Shell>
    </OrdersProvider>
  );
}
