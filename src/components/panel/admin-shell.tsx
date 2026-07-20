"use client";

import { LayoutDashboard, Store, Users, CreditCard } from "lucide-react";
import { PanelShell, type NavItem } from "@/components/panel/panel-shell";

const nav: NavItem[] = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/restaurantes", label: "Restaurantes", icon: Store },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/planos", label: "Planos", icon: CreditCard },
];

export function AdminShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  return (
    <PanelShell
      title="Administração"
      nav={nav}
      userName={userName}
      userRole="Administrador"
    >
      {children}
    </PanelShell>
  );
}
