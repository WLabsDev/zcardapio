"use client";

import { Home, ReceiptText, UserRound } from "lucide-react";
import { PanelShell } from "@/components/panel/panel-shell";

const nav = [
  { href: "/cliente", label: "Início", icon: Home },
  { href: "/cliente/pedidos", label: "Meus pedidos", icon: ReceiptText },
  { href: "/cliente/perfil", label: "Perfil", icon: UserRound },
];

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PanelShell
      title="Minha conta"
      nav={nav}
      userName="Mariana Souza"
      userRole="Cliente"
    >
      {children}
    </PanelShell>
  );
}
