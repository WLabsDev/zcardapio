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

type Coupon = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
};

export function CouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
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
      body: JSON.stringify({ code: code.trim(), type, value: valueNum }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível criar o cupom.");
      return;
    }
    setCode("");
    setValue("");
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
          {coupons.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold">{c.code}</span>
                <Badge variant="outline" className="text-[10px]">
                  {c.type === "percent" ? `${c.value}%` : formatBRL(c.value)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={c.active}
                  onCheckedChange={() => toggleActive(c)}
                />
                <Button
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
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <div className="grid flex-1 gap-1">
          <Label htmlFor="ccode">Código</Label>
          <Input
            id="ccode"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="BEMVINDO10"
            className="uppercase"
          />
        </div>
        <div className="grid w-32 gap-1">
          <Label>Tipo</Label>
          <Select value={type} onValueChange={(v: string) => setType(v as "percent" | "fixed")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percent">Percentual</SelectItem>
              <SelectItem value="fixed">Valor fixo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid w-24 gap-1">
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
        <Button onClick={add} disabled={saving} className="mb-0.5">
          <Plus className="size-4" />
          Criar
        </Button>
      </div>
    </div>
  );
}
