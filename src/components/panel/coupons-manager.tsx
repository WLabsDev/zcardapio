"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Ticket, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { formatBRL } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type Coupon = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
  expiresAt: string | null;
  maxUses: number | null;
  maxUsesPerCustomer: number | null;
  minOrder: number;
  used: number;
};

/** Cupom novo já nasce com 1 uso por cliente — é o que o vendedor espera. */
const DEFAULT_PER_CUSTOMER = "1";

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

/** As condições do cupom em uma linha, do jeito que o vendedor lê. */
function couponLimits(c: Coupon): string[] {
  const parts: string[] = [];
  parts.push(
    c.maxUses === null ? `${c.used} usos` : `${c.used} de ${c.maxUses} usos`
  );
  if (c.maxUsesPerCustomer !== null) {
    parts.push(
      c.maxUsesPerCustomer === 1
        ? "1 por cliente"
        : `${c.maxUsesPerCustomer} por cliente`
    );
  }
  if (c.minOrder > 0) parts.push(`mín. ${formatBRL(c.minOrder)}`);
  if (c.expiresAt) parts.push(`até ${shortDate(c.expiresAt)}`);
  return parts;
}

const isExpired = (c: Coupon) =>
  c.expiresAt !== null && new Date(c.expiresAt) < new Date();
const isExhausted = (c: Coupon) => c.maxUses !== null && c.used >= c.maxUses;

export function CouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [perCustomer, setPerCustomer] = useState(DEFAULT_PER_CUSTOMER);
  const [maxUses, setMaxUses] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/vendedor/coupons").catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data) setCoupons(data.coupons);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Campo vazio = sem limite; o backend guarda null. */
  const optionalInt = (raw: string) => {
    const n = Number(raw);
    return raw.trim() && Number.isFinite(n) && n >= 1 ? Math.floor(n) : null;
  };

  const add = async () => {
    const valueNum = Number(value.replace(",", "."));
    if (code.trim().length < 2 || Number.isNaN(valueNum) || valueNum <= 0) {
      toast.error("Informe o código e um valor válido.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/vendedor/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code.trim(),
        type,
        value: valueNum,
        maxUsesPerCustomer: optionalInt(perCustomer),
        maxUses: optionalInt(maxUses),
        minOrder: Number(minOrder.replace(",", ".")) || 0,
        expiresAt: expiresAt || undefined,
      }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível criar o cupom.");
      return;
    }
    setCode("");
    setValue("");
    setMaxUses("");
    setMinOrder("");
    setExpiresAt("");
    setPerCustomer(DEFAULT_PER_CUSTOMER);
    toast.success("Cupom criado!");
    load();
  };

  const toggleActive = async (c: Coupon) => {
    const res = await fetch(`/api/vendedor/coupons/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    }).catch(() => null);
    if (!res?.ok) {
      toast.error("Não foi possível atualizar o cupom.");
      return;
    }
    load();
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/vendedor/coupons/${id}`, {
      method: "DELETE",
    }).catch(() => null);
    if (!res?.ok) {
      toast.error("Não foi possível remover o cupom.");
      return;
    }
    toast.success("Cupom removido.");
    load();
  };

  return (
    <div className="space-y-3">
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando cupons...</p>
      ) : coupons.length === 0 ? (
        <p className="rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground">
          <Ticket className="mx-auto mb-1 size-4" />
          Nenhum cupom criado ainda.
        </p>
      ) : (
        <div className="space-y-1.5">
          {coupons.map((c) => {
            const esgotado = isExhausted(c);
            const expirado = isExpired(c);
            return (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold">
                      {c.code}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {c.type === "percent"
                        ? `${c.value}%`
                        : formatBRL(c.value)}
                    </Badge>
                    {(esgotado || expirado) && (
                      <Badge variant="secondary" className="text-[10px]">
                        {esgotado ? "Esgotado" : "Expirado"}
                      </Badge>
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-xs",
                      esgotado || expirado
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {couponLimits(c).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={c.active}
                    onCheckedChange={() => toggleActive(c)}
                  />
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => remove(c.id)}
                    aria-label="Remover cupom"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid gap-3 rounded-lg border border-dashed p-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_8rem_6rem]">
          <div className="grid gap-1.5">
            <Label htmlFor="ccode">Código</Label>
            <Input
              id="ccode"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="BEMVINDO10"
              className="uppercase"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Tipo</Label>
            <Select
              value={type}
              onValueChange={(v: string) => setType(v as "percent" | "fixed")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percentual</SelectItem>
                <SelectItem value="fixed">Valor fixo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cvalue">{type === "percent" ? "%" : "R$"}</Label>
            <Input
              id="cvalue"
              type="number"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="10"
            />
          </div>
        </div>

        {/* Limites: em branco = sem limite. Só "por cliente" já vem preenchido,
            porque cupom sem esse limite é o que deixa o mesmo cliente usar
            quantas vezes quiser. */}
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="grid gap-1.5">
            <Label htmlFor="cper">Usos por cliente</Label>
            <Input
              id="cper"
              type="number"
              min="1"
              value={perCustomer}
              onChange={(e) => setPerCustomer(e.target.value)}
              placeholder="Sem limite"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cmax">Usos no total</Label>
            <Input
              id="cmax"
              type="number"
              min="1"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="Sem limite"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cmin">Pedido mínimo (R$)</Label>
            <Input
              id="cmin"
              type="number"
              step="0.01"
              min="0"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cexp">Válido até</Label>
            <Input
              id="cexp"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Campos de limite em branco significam sem limite. O uso por cliente é
          contado pelo telefone do pedido, mesmo sem conta criada.
        </p>

        <Button type="button" onClick={add} disabled={saving} className="w-full sm:w-auto sm:justify-self-end">
          <Plus className="size-4" />
          Criar cupom
        </Button>
      </div>
    </div>
  );
}
