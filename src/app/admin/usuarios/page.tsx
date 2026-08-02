"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search, SearchX, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/panel/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBackToClose } from "@/hooks/use-back-to-close";
import { toast } from "sonner";

type AdminUser = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: "admin" | "restaurante" | "cliente";
  createdAt: string;
};

const roleLabel = {
  admin: "Admin",
  restaurante: "Restaurante",
  cliente: "Cliente",
} as const;

type UserForm = {
  name: string;
  email: string;
  phone: string;
  role: "admin" | "restaurante" | "cliente";
  senha: string;
};

const emptyForm: UserForm = {
  name: "",
  email: "",
  phone: "",
  role: "cliente",
  senha: "",
};

export default function AdminUsuariosPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkConfirm, setBulkConfirm] = useState(false);

  useBackToClose(dialogOpen, () => setDialogOpen(false));
  useBackToClose(!!deleting, () => setDeleting(null));
  useBackToClose(bulkConfirm, () => setBulkConfirm(false));

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/users").catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data) setUsers(data.users);
    else toast.error("Não foi possível carregar os usuários.");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.phone ?? "").includes(search)
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (u: AdminUser) => {
    setEditing(u);
    setForm({
      name: u.name,
      email: u.email ?? "",
      phone: u.phone ?? "",
      role: u.role,
      senha: "",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch(
      editing ? `/api/admin/users/${editing.id}` : "/api/admin/users",
      {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          role: form.role,
          senha: form.senha,
        }),
      }
    ).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível salvar.");
      return;
    }
    setDialogOpen(false);
    toast.success(editing ? "Usuário atualizado!" : "Usuário criado!");
    load();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const res = await fetch(`/api/admin/users/${deleting.id}`, {
      method: "DELETE",
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível excluir.");
      setDeleting(null);
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== deleting.id));
    setDeleting(null);
    toast.success("Usuário excluído.");
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((u) => selected.has(u.id));

  const toggleSelectAll = () => {
    setSelected((prev) => {
      if (allFilteredSelected) {
        const next = new Set(prev);
        filtered.forEach((u) => next.delete(u.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach((u) => next.add(u.id));
      return next;
    });
  };

  const confirmBulkDelete = async () => {
    setBulkDeleting(true);
    const ids = Array.from(selected);
    const results = await Promise.all(
      ids.map(async (id) => {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: "DELETE",
        }).catch(() => null);
        return { id, ok: !!res?.ok };
      })
    );
    setBulkDeleting(false);
    setBulkConfirm(false);
    const okIds = new Set(results.filter((r) => r.ok).map((r) => r.id));
    const failCount = results.length - okIds.size;
    setUsers((prev) => prev.filter((u) => !okIds.has(u.id)));
    setSelected((prev) => {
      const next = new Set(prev);
      okIds.forEach((id) => next.delete(id));
      return next;
    });
    if (okIds.size > 0) toast.success(`${okIds.size} usuário(s) excluído(s).`);
    if (failCount > 0) {
      toast.error(
        `${failCount} usuário(s) não puderam ser excluídos (provavelmente donos de restaurante).`
      );
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Usuários</h2>
          <p className="text-sm text-muted-foreground">
            Todos os usuários cadastrados na plataforma.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Novo usuário
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {selected.size > 0 && (
          <Button variant="destructive" onClick={() => setBulkConfirm(true)}>
            <Trash2 className="size-4" />
            Excluir selecionados ({selected.size})
          </Button>
        )}
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allFilteredSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Selecionar todos"
                  />
                </TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead className="hidden sm:table-cell">E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead className="hidden sm:table-cell">Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id} data-state={selected.has(u.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(u.id)}
                      onCheckedChange={() => toggleSelect(u.id)}
                      aria-label={`Selecionar ${u.name}`}
                    />
                  </TableCell>
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
                    {u.email ?? u.phone ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        u.role === "admin"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {roleLabel[u.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Gerenciar
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(u)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleting(u)}
                        >
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar usuário" : "Novo usuário"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="uname">Nome</Label>
              <Input
                id="uname"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="uemail">E-mail</Label>
                <Input
                  id="uemail"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="uphone">Telefone</Label>
                <Input
                  id="uphone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Perfil</Label>
              <Select
                value={form.role}
                onValueChange={(v: UserForm["role"]) =>
                  setForm((f) => ({ ...f, role: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="restaurante">Restaurante</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="usenha">
                {editing ? "Nova senha (opcional)" : "Senha (opcional)"}
              </Label>
              <Input
                id="usenha"
                type="password"
                placeholder={editing ? "Deixe em branco para manter" : "••••••••"}
                value={form.senha}
                onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(o: boolean) => !o && setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir usuário?</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir <strong>{deleting?.name}</strong>? Essa
              ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkConfirm} onOpenChange={setBulkConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir {selected.size} usuário(s)?</DialogTitle>
            <DialogDescription>
              Essa ação não pode ser desfeita. Usuários donos de restaurante não
              serão excluídos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkConfirm(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBulkDelete}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
