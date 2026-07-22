"use client";

import {
  LayoutDashboard,
  BookOpen,
  ReceiptText,
  BarChart3,
  QrCode,
  Palette,
  Settings,
  Star,
} from "lucide-react";
import { OrdersProvider, useOrders } from "@/components/panel/orders-provider";
import { PanelShell, type NavItem } from "@/components/panel/panel-shell";
import { PlanLimitBanner } from "@/components/panel/plan-limit-banner";

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
  children,
}: {
  userName: string;
  restaurantName: string;
  planName: string | null;
  impersonating?: boolean;
  orderLimitBanner?: OrderLimitBanner | null;
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
        orderLimitBanner && (
          <PlanLimitBanner
            monthlyOrderCount={orderLimitBanner.monthlyOrderCount}
            limit={orderLimitBanner.limit}
          />
        )
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
  children,
}: {
  userName: string;
  restaurantName: string;
  planName: string | null;
  impersonating?: boolean;
  orderLimitBanner?: OrderLimitBanner | null;
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
      >
        {children}
      </Shell>
    </OrdersProvider>
  );
}
