"use client";

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
import { restaurants } from "@/lib/mock/data";
import { formatBRL } from "@/lib/mock/types";

const statusVariant = {
  ativo: "default",
  pendente: "secondary",
  bloqueado: "destructive",
} as const;

export default function AdminDashboard() {
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
          value="1.204"
          hint="+38 este mês"
          icon={Store}
        />
        <StatCard
          label="Usuários"
          value="18.532"
          hint="+1.240 este mês"
          icon={Users}
        />
        <StatCard
          label="MRR"
          value={formatBRL(58230)}
          hint="+12% vs mês anterior"
          icon={DollarSign}
        />
        <StatCard
          label="Pedidos no mês"
          value="96.410"
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
