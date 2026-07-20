"use client";

import { useEffect, useState } from "react";
import { Store, Users, DollarSign, ReceiptText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [restaurants, setRestaurants] = useState<RecentRestaurant[]>([]);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((res) => res.json())
      .then((data) => setMetrics(data?.metrics ?? null))
      .catch(() => {});
    fetch("/api/admin/restaurants")
      .then((res) => res.json())
      .then((data) => setRestaurants((data?.restaurants ?? []).slice(0, 5)))
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Visão geral da plataforma</h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe o crescimento do zCardapio.
        </p>
      </div>

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
