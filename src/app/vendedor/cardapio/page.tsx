"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, FolderPlus, ListPlus, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/panel/empty-state";
import { OptionGroupsDialog } from "@/components/panel/option-groups-dialog";
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
import { useBackToClose } from "@/hooks/use-back-to-close";
import { formatBRL, type Category, type Product } from "@/lib/mock/types";
import { uploadImage } from "@/lib/upload";
import { cn } from "@/lib/utils";

type FormState = {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  image: string;
  trackStock: boolean;
  stock: string;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  image: "",
  trackStock: false,
  stock: "",
};

export default function CardapioPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  const [optionGroupsProductId, setOptionGroupsProductId] = useState<string | null>(null);
  const optionGroupsProduct =
    items.find((p) => p.id === optionGroupsProductId) ?? null;

  // No mobile, o botão "voltar" fecha o modal aberto em vez de sair da página.
  // (O modal de complementos cuida do próprio "voltar" dentro do componente.)
  useBackToClose(dialogOpen, () => setDialogOpen(false));
  useBackToClose(categoryDialogOpen, () => setCategoryDialogOpen(false));

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
            trackStock: !!product.trackStock,
            stock: product.stock != null ? String(product.stock) : "",
          }
        : { ...emptyForm, categoryId: categories[0]?.id ?? "" }
    );
    setDialogOpen(true);
  };

  const save = async () => {
    const price = Number(form.price.replace(",", "."));
    const stock = Number(form.stock) || 0;
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
          trackStock: form.trackStock,
          stock: form.trackStock ? stock : null,
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

  const handleImageUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, image: url }));
      toast.success("Imagem enviada!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setUploading(false);
    }
  };

  const openCategoryDialog = (category: Category | null) => {
    setEditingCategory(category);
    setCategoryName(category?.name ?? "");
    setCategoryDialogOpen(true);
  };

  const saveCategory = async () => {
    setSavingCategory(true);
    const res = await fetch(
      editingCategory
        ? `/api/vendedor/categories/${editingCategory.id}`
        : "/api/vendedor/categories",
      {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName.trim() }),
      }
    ).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSavingCategory(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível salvar a categoria.");
      return;
    }
    setCategoryDialogOpen(false);
    toast.success(editingCategory ? "Categoria renomeada!" : "Categoria criada!");
    load();
  };

  const removeCategory = async (id: string) => {
    const res = await fetch(`/api/vendedor/categories/${id}`, {
      method: "DELETE",
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível remover a categoria.");
      return;
    }
    toast.success("Categoria removida.");
    load();
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
        <div className="flex w-full gap-2 sm:w-auto">
        <Button
          variant="outline"
          className="flex-1 sm:flex-none"
          onClick={() => openCategoryDialog(null)}
        >
          <FolderPlus className="size-4" />
          Nova categoria
        </Button>
        <Dialog
          open={dialogOpen}
          onOpenChange={(o: boolean) => {
            setDialogOpen(o);
            if (!o) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button className="flex-1 sm:flex-none" onClick={() => openDialog(null)}>
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
                <Label htmlFor="pimg">Imagem</Label>
                <div className="flex items-center gap-2">
                  {form.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.image}
                      alt="Imagem do produto"
                      className="size-10 rounded-lg border object-cover"
                    />
                  )}
                  <Input
                    id="pimg"
                    value={form.image}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, image: e.target.value }))
                    }
                    placeholder="https://... ou envie um arquivo"
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files?.[0])}
                  />
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={uploading}
                    onClick={() => imageInputRef.current?.click()}
                    aria-label="Enviar imagem"
                  >
                    <Upload className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Controlar estoque</p>
                  <p className="text-xs text-muted-foreground">
                    Cada pedido desconta a quantidade; ao zerar, o produto some
                    do cardápio automaticamente.
                  </p>
                </div>
                <Switch
                  checked={form.trackStock}
                  onCheckedChange={(v: boolean) =>
                    setForm((f) => ({ ...f, trackStock: v }))
                  }
                />
              </div>
              {form.trackStock && (
                <div className="grid gap-2">
                  <Label htmlFor="pestoque">Quantidade em estoque</Label>
                  <Input
                    id="pestoque"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, stock: e.target.value }))
                    }
                    placeholder="Ex.: 20"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={save} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>

        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Renomear categoria" : "Nova categoria"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="cnome">Nome</Label>
              <Input
                id="cnome"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ex.: Bebidas"
              />
            </div>
            <DialogFooter>
              <Button onClick={saveCategory} disabled={savingCategory}>
                {savingCategory ? "Salvando..." : "Salvar"}
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
            <CardHeader>
              <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {cat.name}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  · {catItems.length} produto{catItems.length === 1 ? "" : "s"}
                </span>
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => openCategoryDialog(cat)}
                  aria-label="Renomear categoria"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => removeCategory(cat.id)}
                  aria-label="Remover categoria"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              </div>
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
                  className={cn(
                    "rounded-xl border-2 p-3.5 transition-colors md:flex md:items-center md:gap-3",
                    p.available
                      ? "border-foreground/10 bg-card"
                      : "border-foreground/10 bg-muted/40"
                  )}
                >
                  {/* Produto: imagem + infos + disponibilidade */}
                  <div className="flex items-center gap-3 md:min-w-0 md:flex-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.name}
                      className={cn(
                        "size-14 shrink-0 rounded-lg border-2 border-foreground/10 object-cover",
                        !p.available && "opacity-50 grayscale"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold">{p.name}</p>
                        {p.popular && (
                          <Badge variant="secondary" className="text-[10px]">
                            Popular
                          </Badge>
                        )}
                        {p.trackStock && (
                          <Badge
                            variant={(p.stock ?? 0) <= 0 ? "destructive" : "outline"}
                            className="text-[10px]"
                          >
                            {(p.stock ?? 0) <= 0
                              ? "Esgotado"
                              : `Estoque: ${p.stock}`}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm font-bold text-primary">
                        {formatBRL(p.price)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-center gap-1">
                      <Switch
                        checked={p.available}
                        onCheckedChange={() => toggleAvailable(p)}
                      />
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wide",
                          p.available ? "text-muted-foreground" : "text-destructive"
                        )}
                      >
                        {p.available ? "Ativo" : "Pausado"}
                      </span>
                    </div>
                  </div>

                  {/* Ações: no mobile, Complementos em linha cheia + Editar/Excluir
                      abaixo; no desktop, os três ícones inline. */}
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t-2 border-dashed border-foreground/10 pt-3 md:mt-0 md:flex md:items-center md:gap-1.5 md:border-0 md:pt-0">
                    <Button
                      variant="outline"
                      className="relative col-span-2 h-10 justify-start gap-2 md:col-span-1 md:h-9 md:w-9 md:justify-center md:p-0"
                      onClick={() => setOptionGroupsProductId(p.id)}
                      aria-label="Complementos do produto"
                    >
                      <ListPlus className="size-4" />
                      <span className="truncate md:hidden">
                        Complementos
                        {(p.optionGroups?.length ?? 0) > 0 &&
                          ` · ${p.optionGroups!.length}`}
                      </span>
                      {(p.optionGroups?.length ?? 0) > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 hidden size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground md:flex">
                          {p.optionGroups!.length}
                        </span>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 justify-start gap-2 md:h-9 md:w-9 md:justify-center md:p-0"
                      onClick={() => openDialog(p)}
                      aria-label="Editar produto"
                    >
                      <Pencil className="size-4" />
                      <span className="md:hidden">Editar</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive md:h-9 md:w-9 md:justify-center md:p-0"
                      onClick={() => removeProduct(p.id)}
                      aria-label="Excluir produto"
                    >
                      <Trash2 className="size-4" />
                      <span className="md:hidden">Excluir</span>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
        })
      )}

      <OptionGroupsDialog
        product={optionGroupsProduct}
        onOpenChange={(o) => {
          if (!o) setOptionGroupsProductId(null);
        }}
        onChanged={load}
      />
    </div>
  );
}
