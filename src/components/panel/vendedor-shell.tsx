"use client";

import {
  LayoutDashboard,
  BookOpen,
  ReceiptText,
  BarChart3,
  QrCode,
  Palette,
  Settings,
} from "lucide-react";
import { OrdersProvider, useOrders } from "@/components/panel/orders-provider";
import { PanelShell, type NavItem } from "@/components/panel/panel-shell";

function Shell({
  userName,
  restaurantName,
  planName,
  impersonating,
  children,
}: {
  userName: string;
  restaurantName: string;
  planName: string | null;
  impersonating?: boolean;
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
  children,
}: {
  userName: string;
  restaurantName: string;
  planName: string | null;
  impersonating?: boolean;
  children: React.ReactNode;
}) {
  return (
    <OrdersProvider>
      <Shell
        userName={userName}
        restaurantName={restaurantName}
        planName={planName}
        impersonating={impersonating}
      >
        {children}
      </Shell>
    </OrdersProvider>
  );
}
