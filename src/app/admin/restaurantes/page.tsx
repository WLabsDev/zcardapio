"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Search, SearchX } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/panel/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { restaurants as mockRestaurants } from "@/lib/mock/data";
import type { Restaurant } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const statusVariant = {
  ativo: "default",
  pendente: "secondary",
  bloqueado: "destructive",
} as const;

export default function AdminRestaurantesPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [search, setSearch] = useState("");

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const setStatus = (id: string, status: Restaurant["status"]) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    toast.success("Status atualizado.");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Restaurantes</h2>
        <p className="text-sm text-muted-foreground">
          Aprove, bloqueie e gerencie os restaurantes da plataforma.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar restaurante..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurante</TableHead>
                <TableHead className="hidden md:table-cell">Cardápio</TableHead>
                <TableHead className="hidden sm:table-cell">Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow
                  key={r.id}
                  className={cn(r.status === "bloqueado" && "opacity-60")}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={r.logo}
                        alt={r.name}
                        className="size-9 rounded-lg"
                      />
                      <div>
                        <p className="font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.segment}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Link
                      href={`/r/${r.slug}`}
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      {r.slug}.zcardapio.com.br
                      <ExternalLink className="size-3" />
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{r.plan}</TableCell>
                  <TableCell>
                    <Badge
                      variant={statusVariant[r.status]}
                      className="capitalize"
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Gerenciar
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setStatus(r.id, "ativo")}>
                          Aprovar / Ativar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setStatus(r.id, "bloqueado")}
                        >
                          Bloquear
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState
                      compact
                      icon={SearchX}
                      title="Nenhum restaurante encontrado"
                      description={`Nenhum resultado para “${search}”. Tente buscar por outro nome.`}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
