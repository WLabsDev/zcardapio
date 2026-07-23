"use client";

import { useEffect, useState } from "react";
import {
  Bike,
  CalendarClock,
  ChevronDown,
  Clock,
  CreditCard,
  type LucideIcon,
  MapPin,
  MessageCircle,
  Store,
  Ticket,
} from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { DayHours, PaymentMethod } from "@/lib/mock/types";

function SettingsSection({
  icon: Icon,
  title,
  description,
  badge,
  defaultOpen = false,
  contentClassName,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  badge?: { label: string; tone?: "positive" | "neutral" | "muted" };
  defaultOpen?: boolean;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="py-0 gap-0 overflow-hidden">
      <Collapsible defaultOpen={defaultOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="group flex w-full items-center gap-3 px-4 py-4 text-left sm:px-6 sm:py-5"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border-2 border-foreground/15 bg-accent">
              <Icon className="size-4" />
            </span>
            <CardHeader className="min-w-0 flex-1 gap-1 p-0">
              <CardTitle className="text-base leading-snug">{title}</CardTitle>
              {description && (
                <CardDescription className="hidden leading-snug sm:block">
                  {description}
                </CardDescription>
              )}
            </CardHeader>
            {badge && (
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium",
                  badge.tone === "positive" &&
                    "border-primary/30 bg-primary/10 text-primary",
                  badge.tone === "muted" &&
                    "border-foreground/15 bg-muted text-muted-foreground",
                  (!badge.tone || badge.tone === "neutral") &&
                    "border-foreground/15 bg-muted text-foreground"
                )}
              >
                {badge.label}
              </span>
            )}
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {description && (
            <p className="px-4 pt-0 pb-2.5 text-sm leading-snug text-muted-foreground sm:hidden">
              {description}
            </p>
          )}
          <CardContent
            className={cn(
              "grid gap-4 border-t border-foreground/10 px-4 pt-4 pb-5 sm:px-6 sm:pb-6",
              contentClassName
            )}
          >
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

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
  description: string;
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
  pixKey: string;
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
          description: r.description ?? "",
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
          pixKey: r.pixKey ?? "",
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
        description: form.description.trim(),
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
        pixKey: form.pixKey.trim(),
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="space-y-2.5"
      >

      <SettingsSection icon={Store} title="Dados do restaurante">
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
            <Label htmlFor="desc">Descrição curta</Label>
            <Input
              id="desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Ex.: Hambúrgueres artesanais feitos na brasa"
            />
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
            <Label htmlFor="slug">URL do restaurante</Label>
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
              Atenção: mudar a URL quebra QR codes já impressos — gere e
              imprima novos depois de salvar.
            </p>
          </div>
      </SettingsSection>

      <SettingsSection
        icon={Clock}
        title="Funcionamento"
        description="O cardápio abre e fecha sozinho conforme a agenda abaixo."
        badge={{
          label: form.isOpen ? "Aberto" : "Fechado",
          tone: form.isOpen ? "positive" : "muted",
        }}
      >
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
      </SettingsSection>

      <SettingsSection
        icon={Bike}
        title="Entrega"
        contentClassName="sm:grid-cols-3"
      >
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
      </SettingsSection>

      <SettingsSection
        icon={CreditCard}
        title="Pagamentos aceitos"
        description="Aparecem como opção no checkout do cliente."
        badge={{ label: `${form.paymentMethods.length} de ${ALL_PAYMENTS.length}` }}
        contentClassName="gap-2"
      >
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
          {form.paymentMethods.includes("pix") && (
            <div className="grid gap-2 rounded-lg border p-3">
              <Label htmlFor="pixKey">Chave Pix</Label>
              <Input
                id="pixKey"
                value={form.pixKey}
                onChange={(e) => set("pixKey", e.target.value)}
                placeholder="CPF/CNPJ, e-mail, telefone ou chave aleatória"
              />
              <p className="text-xs text-muted-foreground">
                Gera um QR Code Pix real no checkout. O dinheiro cai direto na
                sua conta — o zCardápio nunca recebe nem repassa o pagamento.
              </p>
            </div>
          )}
      </SettingsSection>

      <SettingsSection
        icon={MessageCircle}
        title="Comunicação"
        description="Avisos e mensagens para os clientes."
      >
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
      </SettingsSection>

      <SettingsSection
        icon={MapPin}
        title="Entrega por região"
        description="Defina taxas diferentes por região. Sem regiões, vale a taxa padrão de entrega."
      >
        <DeliveryZonesManager />
      </SettingsSection>

      <SettingsSection
        icon={Ticket}
        title="Cupons de desconto"
        description="Crie códigos que o cliente aplica no checkout."
      >
        <CouponsManager />
      </SettingsSection>

      <SettingsSection
        icon={CalendarClock}
        title="Pedidos agendados"
        description="Permita que o cliente escolha data e hora para o pedido."
        badge={{
          label: form.acceptsScheduled ? "Ativado" : "Desativado",
          tone: form.acceptsScheduled ? "positive" : "muted",
        }}
      >
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
      </SettingsSection>

      <div className="sticky bottom-0 -mx-4 flex justify-end border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:mx-0 sm:rounded-xl sm:border sm:border-foreground/15 sm:px-4">
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
      </form>
    </div>
  );
}
