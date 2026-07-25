"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Users, DollarSign, ReceiptText, Eye, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/panel/panel-shell";
import { formatBRL } from "@/lib/mock/types";

type Metrics = {
  activeRestaurants: number;
  users: number;
  monthOrders: number;
  mrr: number;
};

type RecentRestaurant = {
  id: string;
  name: string;
  segment: string;
  plan: string;
  status: "ativo" | "pendente" | "bloqueado";
  createdAt: string;
};

const statusVariant = {
  ativo: "default",
  pendente: "secondary",
  bloqueado: "destructive",
} as const;

export default function AdminDashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [restaurants, setRestaurants] = useState<RecentRestaurant[]>([]);
  const [viewingAsClient, setViewingAsClient] = useState(false);
  // true por padrão para não piscar o aviso antes da resposta da API.
  const [whatsappConfigured, setWhatsappConfigured] = useState(true);

  const viewAsClient = async () => {
    setViewingAsClient(true);
    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target: "cliente" }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setViewingAsClient(false);
    if (!res?.ok || !data?.redirect) {
      toast.error("Não foi possível entrar como cliente.");
      return;
    }
    router.push(data.redirect);
    router.refresh();
  };

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data?.metrics ?? null);
        setWhatsappConfigured(data?.whatsappConfigured ?? true);
      })
      .catch(() => {});
    fetch("/api/admin/restaurants")
      .then((res) => res.json())
      .then((data) => setRestaurants((data?.restaurants ?? []).slice(0, 5)))
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Visão geral da plataforma</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe o crescimento do zCardápio.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={viewingAsClient}
          onClick={viewAsClient}
        >
          <Eye className="size-4" />
          {viewingAsClient ? "Entrando..." : "Ver como cliente"}
        </Button>
      </div>

      {!whatsappConfigured && (
        <div className="flex items-start gap-3 rounded-xl border-2 border-amber-500/60 bg-amber-500/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-0.5">
            <p className="font-semibold">WhatsApp não configurado</p>
            <p className="text-muted-foreground">
              Códigos de recuperação de senha e avisos de novo pedido não estão
              sendo enviados — as mensagens aparecem apenas no log do servidor.
              Configure{" "}
              <code className="rounded bg-foreground/10 px-1 font-mono text-xs">
                EVOLUTION_API_URL
              </code>
              ,{" "}
              <code className="rounded bg-foreground/10 px-1 font-mono text-xs">
                EVOLUTION_API_KEY
              </code>{" "}
              e{" "}
              <code className="rounded bg-foreground/10 px-1 font-mono text-xs">
                EVOLUTION_INSTANCE
              </code>{" "}
              no servidor.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Restaurantes ativos"
          value={metrics ? String(metrics.activeRestaurants) : "—"}
          hint="Com cardápio no ar"
          icon={Store}
        />
        <StatCard
          label="Usuários"
          value={metrics ? String(metrics.users) : "—"}
          hint="Todos os perfis"
          icon={Users}
        />
        <StatCard
          label="MRR"
          value={metrics ? formatBRL(metrics.mrr) : "—"}
          hint="Assinaturas de restaurantes ativos"
          icon={DollarSign}
        />
        <StatCard
          label="Pedidos no mês"
          value={metrics ? String(metrics.monthOrders) : "—"}
          hint="Todas as lojas"
          icon={ReceiptText}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cadastros recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurante</TableHead>
                <TableHead className="hidden sm:table-cell">Segmento</TableHead>
                <TableHead className="hidden sm:table-cell">Plano</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurants.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {r.segment}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{r.plan}</TableCell>
                  <TableCell>
                    {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[r.status]} className="capitalize">
                      {r.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
