"use client";

import { useState } from "react";
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
import { products as allProducts, restaurants } from "@/lib/mock/data";
import { formatBRL, type Product } from "@/lib/mock/types";

const restaurant = restaurants[0];

export default function CardapioPage() {
  const [items, setItems] = useState<Product[]>(
    allProducts.filter((p) => p.restaurantId === restaurant.id)
  );
  const [editing, setEditing] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const toggleAvailable = (id: string) =>
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, available: !p.available } : p))
    );

  const removeProduct = (id: string) => {
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
            <Button>
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
                  defaultValue={editing?.name}
                  placeholder="Ex.: Zé Clássico"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pdesc">Descrição</Label>
                <Textarea
                  id="pdesc"
                  defaultValue={editing?.description}
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
                    defaultValue={editing?.price}
                    placeholder="29,90"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Categoria</Label>
                  <Select defaultValue={editing?.categoryId ?? "c1"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurant.categories.map((c) => (
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
                  defaultValue={editing?.image}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  setEditing(null);
                  toast.success(
                    editing ? "Produto atualizado!" : "Produto criado!"
                  );
                }}
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Seu cardápio está vazio"
          description="Adicione seu primeiro produto para começar a receber pedidos pelo QR code e pelo link."
          action={
            <Button
              className="rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="size-4" />
              Adicionar produto
            </Button>
          }
        />
      ) : (
        restaurant.categories.map((cat) => {
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
                        onCheckedChange={() => toggleAvailable(p.id)}
                      />
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {p.available ? "Disponível" : "Pausado"}
                      </span>
                    </div>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => {
                        setEditing(p);
                        setDialogOpen(true);
                      }}
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
