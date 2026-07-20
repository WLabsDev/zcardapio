"use client";

import { LayoutDashboard, Store, Users, CreditCard } from "lucide-react";
import { PanelShell } from "@/components/panel/panel-shell";

const nav = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/restaurantes", label: "Restaurantes", icon: Store },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/planos", label: "Planos", icon: CreditCard },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PanelShell
      title="Administração"
      nav={nav}
      userName="Willian Lucas"
      userRole="Administrador"
    >
      {children}
    </PanelShell>
  );
}
