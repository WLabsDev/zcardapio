"use client";

import { useState } from "react";
import { Search, SearchX } from "lucide-react";
import { EmptyState } from "@/components/panel/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { users } from "@/lib/mock/data";

const roleLabel = {
  admin: "Admin",
  restaurante: "Restaurante",
  cliente: "Cliente",
} as const;

export default function AdminUsuariosPage() {
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Usuários</h2>
        <p className="text-sm text-muted-foreground">
          Todos os usuários cadastrados na plataforma.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou e-mail..."
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
                <TableHead>Usuário</TableHead>
                <TableHead className="hidden sm:table-cell">E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead className="hidden sm:table-cell">Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {u.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                      {roleLabel[u.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <EmptyState
                      compact
                      icon={SearchX}
                      title="Nenhum usuário encontrado"
                      description={`Nenhum resultado para “${search}”. Tente buscar por outro nome ou e-mail.`}
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
