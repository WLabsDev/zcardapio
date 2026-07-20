"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Settings = {
  name: string;
  phone: string;
  address: string;
  slug: string;
  isOpen: boolean;
  openingHours: string;
  deliveryFee: string;
  minOrder: string;
  deliveryTime: string;
};

export default function ConfiguracoesPage() {
  const [form, setForm] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/vendedor/restaurant")
      .then((res) => res.json())
      .then((data) => {
        const r = data.restaurant;
        setForm({
          name: r.name,
          phone: r.phone,
          address: r.address,
          slug: r.slug,
          isOpen: r.isOpen,
          openingHours: r.openingHours,
          deliveryFee: String(r.deliveryFee),
          minOrder: String(r.minOrder),
          deliveryTime: r.deliveryTime,
        });
      })
      .catch(() => toast.error("Não foi possível carregar as configurações."));
  }, []);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const res = await fetch("/api/vendedor/restaurant", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        isOpen: form.isOpen,
        openingHours: form.openingHours.trim(),
        deliveryFee: Number(form.deliveryFee.replace(",", ".")) || 0,
        minOrder: Number(form.minOrder.replace(",", ".")) || 0,
        deliveryTime: form.deliveryTime.trim(),
      }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível salvar.");
      return;
    }
    toast.success("Configurações salvas!");
  };

  if (!form) {
    return (
      <p className="text-sm text-muted-foreground">Carregando configurações...</p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Configurações</h2>
        <p className="text-sm text-muted-foreground">
          Dados do restaurante, funcionamento e entrega.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do restaurante</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slug">Endereço do cardápio</Label>
            <div className="flex items-center gap-2">
              <Input id="slug" value={form.slug} disabled className="max-w-56" />
              <span className="text-sm text-muted-foreground">.zcardapio.com.br</span>
            </div>
            <p className="text-xs text-muted-foreground">
              O endereço não pode ser alterado para não quebrar QR codes já
              impressos.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Funcionamento</CardTitle>
          <CardDescription>
            Controle quando o cardápio aceita pedidos.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Restaurante aberto</p>
              <p className="text-xs text-muted-foreground">
                Quando fechado, clientes veem o cardápio mas não podem pedir.
              </p>
            </div>
            <Switch
              checked={form.isOpen}
              onCheckedChange={(v: boolean) => set("isOpen", v)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="horarios">Horários</Label>
            <Input
              id="horarios"
              value={form.openingHours}
              onChange={(e) => set("openingHours", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Entrega</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="taxa">Taxa de entrega (R$)</Label>
            <Input
              id="taxa"
              type="number"
              step="0.1"
              value={form.deliveryFee}
              onChange={(e) => set("deliveryFee", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="minimo">Pedido mínimo (R$)</Label>
            <Input
              id="minimo"
              type="number"
              value={form.minOrder}
              onChange={(e) => set("minOrder", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tempo">Tempo estimado</Label>
            <Input
              id="tempo"
              value={form.deliveryTime}
              onChange={(e) => set("deliveryTime", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving}>
        {saving ? "Salvando..." : "Salvar alterações"}
      </Button>
    </div>
  );
}
