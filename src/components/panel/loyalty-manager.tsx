"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type LoyaltyProgram = {
  mechanic: "none" | "points" | "cashback" | "stamps";
  pointsPerReal: number;
  pointsRequired: number;
  pointsRewardType: "percent" | "fixed";
  pointsRewardValue: number;
  cashbackPercent: number;
  stampsRequired: number;
  stampsRewardType: "percent" | "fixed";
  stampsRewardValue: number;
};

const MECHANICS: { value: LoyaltyProgram["mechanic"]; label: string; description: string }[] = [
  { value: "none", label: "Nenhuma", description: "Fidelidade desativada." },
  {
    value: "points",
    label: "Pontos por real",
    description: "Cliente acumula pontos e troca por um cupom ao atingir a meta.",
  },
  {
    value: "cashback",
    label: "Cashback",
    description: "Um % de cada pedido vira crédito em R$ para o próximo pedido.",
  },
  {
    value: "stamps",
    label: "Carimbos",
    description: 'Estilo "a cada N pedidos, ganhe uma recompensa".',
  },
];

export function LoyaltyManager({
  program,
  onSaved,
}: {
  program: LoyaltyProgram;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<LoyaltyProgram>(program);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/vendedor/loyalty", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível salvar.");
      return;
    }
    toast.success("Fidelidade atualizada!");
    onSaved();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {MECHANICS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setForm((f) => ({ ...f, mechanic: m.value }))}
            className={cn(
              "flex flex-col gap-1.5 rounded-xl border-2 p-4 text-left transition-all",
              form.mechanic === m.value
                ? "border-foreground bg-accent shadow-offset-sm"
                : "border-foreground/15 hover:border-foreground/40"
            )}
          >
            <span className="font-semibold">{m.label}</span>
            <span className="text-xs text-muted-foreground">{m.description}</span>
          </button>
        ))}
      </div>

      {form.mechanic === "points" && (
        <Card>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Pontos por real gasto</Label>
              <Input
                type="number"
                min="1"
                value={form.pointsPerReal}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pointsPerReal: Number(e.target.value) || 1 }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Pontos necessários para resgatar</Label>
              <Input
                type="number"
                min="1"
                value={form.pointsRequired}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pointsRequired: Number(e.target.value) || 1 }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Tipo de recompensa</Label>
              <Select
                value={form.pointsRewardType}
                onValueChange={(v: "percent" | "fixed") =>
                  setForm((f) => ({ ...f, pointsRewardType: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Desconto percentual</SelectItem>
                  <SelectItem value="fixed">Desconto em R$</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>
                Valor da recompensa {form.pointsRewardType === "percent" ? "(%)" : "(R$)"}
              </Label>
              <Input
                type="number"
                min="0"
                value={form.pointsRewardValue}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pointsRewardValue: Number(e.target.value) || 0 }))
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {form.mechanic === "cashback" && (
        <Card>
          <CardContent className="grid gap-2">
            <Label>Percentual de cashback (%)</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={form.cashbackPercent}
              onChange={(e) =>
                setForm((f) => ({ ...f, cashbackPercent: Number(e.target.value) || 1 }))
              }
            />
            <p className="text-xs text-muted-foreground">
              O cliente acumula esse % de cada pedido como crédito, resgatável a
              qualquer momento como cupom de desconto.
            </p>
          </CardContent>
        </Card>
      )}

      {form.mechanic === "stamps" && (
        <Card>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Pedidos necessários</Label>
              <Input
                type="number"
                min="1"
                value={form.stampsRequired}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stampsRequired: Number(e.target.value) || 1 }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Tipo de recompensa</Label>
              <Select
                value={form.stampsRewardType}
                onValueChange={(v: "percent" | "fixed") =>
                  setForm((f) => ({ ...f, stampsRewardType: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Desconto percentual</SelectItem>
                  <SelectItem value="fixed">Desconto em R$</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label>
                Valor da recompensa {form.stampsRewardType === "percent" ? "(%)" : "(R$)"}
              </Label>
              <Input
                type="number"
                min="0"
                value={form.stampsRewardValue}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stampsRewardValue: Number(e.target.value) || 0 }))
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
        {saving ? "Salvando..." : "Salvar"}
      </Button>
    </div>
  );
}
