"use client";

import { Gift, Home, ReceiptText, UserRound } from "lucide-react";
import { PanelShell, type NavItem } from "@/components/panel/panel-shell";

const nav: NavItem[] = [
  { href: "/cliente", label: "Início", icon: Home },
  { href: "/cliente/pedidos", label: "Meus pedidos", icon: ReceiptText },
  { href: "/cliente/fidelidade", label: "Fidelidade", icon: Gift },
  { href: "/cliente/perfil", label: "Perfil", icon: UserRound },
];

export function ClienteShell({
  userName,
  impersonating,
  children,
}: {
  userName: string;
  impersonating?: boolean;
  children: React.ReactNode;
}) {
  return (
    <PanelShell
      title="Minha conta"
      nav={nav}
      userName={userName}
      userRole="Cliente"
      impersonating={impersonating}
    >
      {children}
    </PanelShell>
  );
}
