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

function VendedorShell({ children }: { children: React.ReactNode }) {
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
      title="Burguer do Zé"
      nav={nav}
      userName="José Ferreira"
      userRole="Restaurante · Plano Pro"
    >
      {children}
    </PanelShell>
  );
}

export default function VendedorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrdersProvider>
      <VendedorShell>{children}</VendedorShell>
    </OrdersProvider>
  );
}
