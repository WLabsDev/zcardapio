"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Eye, Search, SearchX } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/panel/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useBackToClose } from "@/hooks/use-back-to-close";
import { cn } from "@/lib/utils";

type AdminRestaurant = {
  id: string;
  slug: string;
  name: string;
  segment: string;
  address: string;
  phone: string;
  logo: string;
  plan: string;
  planId: number | null;
  status: "ativo" | "pendente" | "bloqueado";
  createdAt: string;
};

type AdminPlan = { id: string; name: string };

const statusVariant = {
  ativo: "default",
  pendente: "secondary",
  bloqueado: "destructive",
} as const;

type RestaurantForm = {
  name: string;
  slug: string;
  segment: string;
  address: string;
  phone: string;
  status: AdminRestaurant["status"];
  planId: string;
};

export default function AdminRestaurantesPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [search, setSearch] = useState("");
  const [viewingAsId, setViewingAsId] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminRestaurant | null>(null);
  const [form, setForm] = useState<RestaurantForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<AdminRestaurant | null>(null);

  useBackToClose(!!editing, () => setEditing(null));
  useBackToClose(!!deleting, () => setDeleting(null));

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/restaurants").catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data) setRestaurants(data.restaurants);
    else toast.error("Não foi possível carregar os restaurantes.");
  }, []);

  useEffect(() => {
    load();
    fetch("/api/admin/plans")
      .then((res) => res.json())
      .then((data) => setPlans(data?.plans ?? []))
      .catch(() => {});
  }, [load]);

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const setStatus = async (id: string, status: AdminRestaurant["status"]) => {
    const res = await fetch(`/api/admin/restaurants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => null);
    if (!res?.ok) {
      toast.error("Não foi possível atualizar o status.");
      return;
    }
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    toast.success("Status atualizado.");
  };

  const viewAsRestaurant = async (id: string) => {
    setViewingAsId(id);
    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target: "restaurante", restaurantId: Number(id) }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setViewingAsId(null);
    if (!res?.ok || !data?.redirect) {
      toast.error(data?.message ?? "Não foi possível entrar como este restaurante.");
      return;
    }
    router.push(data.redirect);
    router.refresh();
  };

  const openEdit = (r: AdminRestaurant) => {
    setEditing(r);
    setForm({
      name: r.name,
      slug: r.slug,
      segment: r.segment,
      address: r.address,
      phone: r.phone,
      status: r.status,
      planId: r.planId ? String(r.planId) : "",
    });
  };

  const save = async () => {
    if (!editing || !form) return;
    setSaving(true);
    const res = await fetch(`/api/admin/restaurants/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        slug: form.slug.trim(),
        segment: form.segment.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        status: form.status,
        planId: form.planId ? Number(form.planId) : null,
      }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível salvar.");
      return;
    }
    setEditing(null);
    toast.success("Restaurante atualizado!");
    load();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const res = await fetch(`/api/admin/restaurants/${deleting.id}`, {
      method: "DELETE",
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível excluir.");
      setDeleting(null);
      return;
    }
    setRestaurants((prev) => prev.filter((r) => r.id !== deleting.id));
    setDeleting(null);
    toast.success("Restaurante excluído.");
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
                      {r.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.logo}
                          alt={r.name}
                          className="size-9 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted text-xs font-semibold text-muted-foreground">
                          {r.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
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
                        <DropdownMenuItem
                          disabled={viewingAsId === r.id}
                          onClick={() => viewAsRestaurant(r.id)}
                        >
                          <Eye className="size-4" />
                          {viewingAsId === r.id
                            ? "Entrando..."
                            : "Ver como restaurante"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(r)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatus(r.id, "ativo")}>
                          Aprovar / Ativar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setStatus(r.id, "bloqueado")}
                        >
                          Bloquear
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleting(r)}
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

      <Dialog open={!!editing} onOpenChange={(o: boolean) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar restaurante</DialogTitle>
          </DialogHeader>
          {form && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rname">Nome</Label>
                <Input
                  id="rname"
                  value={form.name}
                  onChange={(e) => setForm((f) => f && { ...f, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rslug">Endereço do cardápio</Label>
                <Input
                  id="rslug"
                  value={form.slug}
                  onChange={(e) => setForm((f) => f && { ...f, slug: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="rsegment">Segmento</Label>
                  <Input
                    id="rsegment"
                    value={form.segment}
                    onChange={(e) =>
                      setForm((f) => f && { ...f, segment: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rphone">Telefone</Label>
                  <Input
                    id="rphone"
                    value={form.phone}
                    onChange={(e) => setForm((f) => f && { ...f, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="raddress">Endereço</Label>
                <Input
                  id="raddress"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => f && { ...f, address: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Plano</Label>
                  <Select
                    value={form.planId}
                    onValueChange={(v: string) =>
                      setForm((f) => f && { ...f, planId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v: AdminRestaurant["status"]) =>
                      setForm((f) => f && { ...f, status: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="bloqueado">Bloqueado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
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
            <DialogTitle>Excluir restaurante?</DialogTitle>
            <DialogDescription>
              Isso apaga <strong>{deleting?.name}</strong> e todos os pedidos,
              produtos e dados relacionados, permanentemente.
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
    </div>
  );
}
