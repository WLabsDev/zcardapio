"use client";

import {
  LayoutDashboard,
  Store,
  Users,
  CreditCard,
  Newspaper,
} from "lucide-react";
import { PanelShell, type NavItem } from "@/components/panel/panel-shell";
import { PanelThemeProvider } from "@/components/panel-theme-provider";

const nav: NavItem[] = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/restaurantes", label: "Restaurantes", icon: Store },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/planos", label: "Planos", icon: CreditCard },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
];

export function AdminShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PanelThemeProvider />
      <PanelShell
        title="Administração"
        nav={nav}
        userName={userName}
        userRole="Administrador"
        variant="clean"
      >
        {children}
      </PanelShell>
    </>
  );
}
