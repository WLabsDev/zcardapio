"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/panel/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatBRL, type Category, type Product } from "@/lib/mock/types";

type FormState = {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  image: string;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  image: "",
};

export default function CardapioPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/vendedor/products").catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data) {
      setItems(data.products);
      setCategories(data.categories);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openDialog = (product: Product | null) => {
    setEditing(product);
    setForm(
      product
        ? {
            name: product.name,
            description: product.description,
            price: String(product.price),
            categoryId: product.categoryId,
            image: product.image,
          }
        : { ...emptyForm, categoryId: categories[0]?.id ?? "" }
    );
    setDialogOpen(true);
  };

  const save = async () => {
    const price = Number(form.price.replace(",", "."));
    setSaving(true);
    const res = await fetch(
      editing ? `/api/vendedor/products/${editing.id}` : "/api/vendedor/products",
      {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          price,
          categoryId: form.categoryId,
          image: form.image.trim(),
        }),
      }
    ).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSaving(false);

    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível salvar o produto.");
      return;
    }
    setDialogOpen(false);
    setEditing(null);
    toast.success(editing ? "Produto atualizado!" : "Produto criado!");
    load();
  };

  const toggleAvailable = async (product: Product) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, available: !p.available } : p
      )
    );
    const res = await fetch(`/api/vendedor/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !product.available }),
    }).catch(() => null);
    if (!res?.ok) {
      toast.error("Não foi possível atualizar a disponibilidade.");
      load();
    }
  };

  const removeProduct = async (id: string) => {
    const res = await fetch(`/api/vendedor/products/${id}`, {
      method: "DELETE",
    }).catch(() => null);
    if (!res?.ok) {
      toast.error("Não foi possível remover o produto.");
      return;
    }
    setItems((prev) => prev.filter((p) => p.id !== id));
    toast.success("Produto removido.");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Cardápio</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie categorias e produtos do seu cardápio.
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(o: boolean) => {
            setDialogOpen(o);
            if (!o) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => openDialog(null)}>
              <Plus className="size-4" />
              Novo produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar produto" : "Novo produto"}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações que aparecerão no cardápio.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pnome">Nome</Label>
                <Input
                  id="pnome"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex.: Zé Clássico"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pdesc">Descrição</Label>
                <Textarea
                  id="pdesc"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Ingredientes e detalhes do produto"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ppreco">Preço (R$)</Label>
                  <Input
                    id="ppreco"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    placeholder="29,90"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Categoria</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(v: string) =>
                      setForm((f) => ({ ...f, categoryId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pimg">URL da imagem</Label>
                <Input
                  id="pimg"
                  value={form.image}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, image: e.target.value }))
                  }
                  placeholder="https://..."
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
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando cardápio...</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Seu cardápio está vazio"
          description="Adicione seu primeiro produto para começar a receber pedidos pelo QR code e pelo link."
          action={
            <Button
              className="rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
              onClick={() => openDialog(null)}
            >
              <Plus className="size-4" />
              Adicionar produto
            </Button>
          }
        />
      ) : (
        categories.map((cat) => {
        const catItems = items.filter((p) => p.categoryId === cat.id);
        return (
          <Card key={cat.id}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">
                {cat.name}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  · {catItems.length} produto{catItems.length === 1 ? "" : "s"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {catItems.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum produto nesta categoria.
                </p>
              )}
              {catItems.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.name}
                    className="size-12 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{p.name}</p>
                      {p.popular && (
                        <Badge variant="secondary" className="text-[10px]">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatBRL(p.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={p.available}
                        onCheckedChange={() => toggleAvailable(p)}
                      />
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {p.available ? "Disponível" : "Pausado"}
                      </span>
                    </div>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => openDialog(p)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => removeProduct(p.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
        })
      )}
    </div>
  );
}
