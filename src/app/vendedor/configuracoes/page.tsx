"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CouponsManager } from "@/components/panel/coupons-manager";
import { DeliveryZonesManager } from "@/components/panel/delivery-zones-manager";
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
import { Textarea } from "@/components/ui/textarea";
import type { DayHours, PaymentMethod } from "@/lib/mock/types";

const DAY_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: "Pix",
  cartao: "Cartão na entrega",
  dinheiro: "Dinheiro",
};

const ALL_PAYMENTS: PaymentMethod[] = ["pix", "cartao", "dinheiro"];

/** Garante uma agenda completa de 7 dias a partir do que vier do banco. */
function normalizeHours(incoming: DayHours[] | undefined): DayHours[] {
  return Array.from({ length: 7 }, (_, day) => {
    const found = incoming?.find((h) => h.day === day);
    return found ?? { day, open: "18:00", close: "23:30", closed: false };
  });
}

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
  hours: DayHours[];
  pauseMessage: string;
  bannerText: string;
  whatsapp: string;
  confirmMessage: string;
  paymentMethods: PaymentMethod[];
  acceptsScheduled: boolean;
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
          hours: normalizeHours(r.hours),
          pauseMessage: r.pauseMessage ?? "",
          bannerText: r.bannerText ?? "",
          whatsapp: r.whatsapp ?? "",
          confirmMessage: r.confirmMessage ?? "",
          paymentMethods:
            r.paymentMethods?.length ? r.paymentMethods : [...ALL_PAYMENTS],
          acceptsScheduled: r.acceptsScheduled ?? false,
        });
      })
      .catch(() => toast.error("Não foi possível carregar as configurações."));
  }, []);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const setHour = (day: number, patch: Partial<DayHours>) =>
    setForm((f) =>
      f
        ? {
            ...f,
            hours: f.hours.map((h) => (h.day === day ? { ...h, ...patch } : h)),
          }
        : f
    );

  const togglePayment = (m: PaymentMethod) => {
    if (!form) return;
    const has = form.paymentMethods.includes(m);
    if (has && form.paymentMethods.length === 1) {
      toast.error("Mantenha ao menos um método de pagamento.");
      return;
    }
    set(
      "paymentMethods",
      has
        ? form.paymentMethods.filter((x) => x !== m)
        : [...form.paymentMethods, m]
    );
  };

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const res = await fetch("/api/vendedor/restaurant", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: form.slug.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        isOpen: form.isOpen,
        openingHours: form.openingHours.trim(),
        deliveryFee: Number(form.deliveryFee.replace(",", ".")) || 0,
        minOrder: Number(form.minOrder.replace(",", ".")) || 0,
        deliveryTime: form.deliveryTime.trim(),
        hours: form.hours,
        pauseMessage: form.pauseMessage.trim(),
        bannerText: form.bannerText.trim(),
        whatsapp: form.whatsapp.trim(),
        confirmMessage: form.confirmMessage.trim(),
        paymentMethods: form.paymentMethods,
        acceptsScheduled: form.acceptsScheduled,
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
          Dados do restaurante, funcionamento, entrega e comunicação.
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
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) =>
                  set(
                    "slug",
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                  )
                }
                className="max-w-56"
              />
              <span className="text-sm text-muted-foreground">.zcardapio.com.br</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Atenção: mudar o endereço quebra QR codes já impressos — gere e
              imprima novos depois de salvar.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Funcionamento</CardTitle>
          <CardDescription>
            O cardápio abre e fecha sozinho conforme a agenda abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Aceitando pedidos</p>
              <p className="text-xs text-muted-foreground">
                Interruptor geral — desligue para fechar sem mexer na agenda.
              </p>
            </div>
            <Switch
              checked={form.isOpen}
              onCheckedChange={(v: boolean) => set("isOpen", v)}
            />
          </div>

          <div className="grid gap-1.5">
            <p className="text-sm font-medium">Agenda semanal</p>
            {form.hours.map((h) => (
              <div
                key={h.day}
                className="flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2"
              >
                <span className="w-16 text-sm font-medium">
                  {DAY_NAMES[h.day]}
                </span>
                <div className="flex items-center gap-1.5">
                  <Switch
                    checked={!h.closed}
                    onCheckedChange={(v: boolean) =>
                      setHour(h.day, { closed: !v })
                    }
                  />
                  <span className="text-xs text-muted-foreground">
                    {h.closed ? "Fechado" : "Aberto"}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Input
                    type="time"
                    value={h.open}
                    disabled={h.closed}
                    onChange={(e) => setHour(h.day, { open: e.target.value })}
                    className="h-8 w-28"
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    type="time"
                    value={h.close}
                    disabled={h.closed}
                    onChange={(e) => setHour(h.day, { close: e.target.value })}
                    className="h-8 w-28"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pausa">Pausa temporária (opcional)</Label>
            <Input
              id="pausa"
              value={form.pauseMessage}
              onChange={(e) => set("pauseMessage", e.target.value)}
              placeholder="Ex.: Fechado para manutenção — voltamos às 19h"
            />
            <p className="text-xs text-muted-foreground">
              Se preenchido, o cardápio fecha e exibe esta mensagem ao cliente.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="horarios">Texto de horário (exibido no cardápio)</Label>
            <Input
              id="horarios"
              value={form.openingHours}
              onChange={(e) => set("openingHours", e.target.value)}
              placeholder="Ex.: Ter a Dom · 18h às 23h30"
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pagamentos aceitos</CardTitle>
          <CardDescription>
            Aparecem como opção no checkout do cliente.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {ALL_PAYMENTS.map((m) => (
            <div
              key={m}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <p className="text-sm font-medium">{PAYMENT_LABELS[m]}</p>
              <Switch
                checked={form.paymentMethods.includes(m)}
                onCheckedChange={() => togglePayment(m)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comunicação</CardTitle>
          <CardDescription>
            Avisos e mensagens para os clientes.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="banner">Aviso no topo do cardápio (opcional)</Label>
            <Input
              id="banner"
              value={form.bannerText}
              onChange={(e) => set("bannerText", e.target.value)}
              placeholder="Ex.: 🎉 Hoje: frete grátis acima de R$ 50!"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
            <Input
              id="whatsapp"
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              placeholder="Somente números, com DDD. Ex.: 11999991234"
            />
            <p className="text-xs text-muted-foreground">
              Usado no botão de contato e na confirmação do pedido.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm">Mensagem pós-pedido (opcional)</Label>
            <Textarea
              id="confirm"
              value={form.confirmMessage}
              onChange={(e) => set("confirmMessage", e.target.value)}
              placeholder="Ex.: Obrigado! Já estamos preparando seu pedido. Qualquer dúvida, chame no WhatsApp."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Entrega por região</CardTitle>
          <CardDescription>
            Defina taxas diferentes por região. Sem regiões, vale a taxa padrão
            de entrega.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeliveryZonesManager />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cupons de desconto</CardTitle>
          <CardDescription>
            Crie códigos que o cliente aplica no checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CouponsManager />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pedidos agendados</CardTitle>
          <CardDescription>
            Permita que o cliente escolha data e hora para o pedido.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Aceitar agendamento</p>
              <p className="text-xs text-muted-foreground">
                Exibe um campo de data/hora no checkout.
              </p>
            </div>
            <Switch
              checked={form.acceptsScheduled}
              onCheckedChange={(v: boolean) => set("acceptsScheduled", v)}
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
