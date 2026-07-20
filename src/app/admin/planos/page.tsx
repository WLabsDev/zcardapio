"use client";

import { useCallback, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatBRL } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type AdminPlan = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted: boolean;
  subscribers: number;
};

export default function AdminPlanosPage() {
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [editing, setEditing] = useState<AdminPlan | null>(null);
  const [form, setForm] = useState({ price: "", description: "", features: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/plans").catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data) setPlans(data.plans);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (plan: AdminPlan) => {
    setEditing(plan);
    setForm({
      price: String(plan.price),
      description: plan.description,
      features: plan.features.join("\n"),
    });
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const res = await fetch(`/api/admin/plans/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: Number(form.price.replace(",", ".")) || 0,
        description: form.description.trim(),
        features: form.features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
      }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível salvar o plano.");
      return;
    }
    setEditing(null);
    toast.success("Plano atualizado!");
    load();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Planos</h2>
        <p className="text-sm text-muted-foreground">
          Planos disponíveis e distribuição de assinantes.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "border-2 transition-all hover:-translate-y-0.5",
              plan.highlighted
                ? "border-foreground shadow-offset-sm"
                : "border-foreground/15 hover:border-foreground hover:shadow-offset-sm"
            )}
          >
            <CardContent className="flex h-full flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">{plan.name}</h3>
                <Badge variant="secondary">
                  {plan.subscribers} assinante{plan.subscribers === 1 ? "" : "s"}
                </Badge>
              </div>
              <div>
                <p className="text-3xl font-extrabold">
                  {plan.price === 0 ? "R$ 0" : formatBRL(plan.price)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /mês
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  ≈ {formatBRL(plan.subscribers * plan.price)} de receita mensal
                </p>
              </div>
              <ul className="flex-1 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" onClick={() => openEdit(plan)}>
                Editar plano
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o: boolean) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar plano {editing?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pprice">Preço mensal (R$)</Label>
              <Input
                id="pprice"
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pdesc">Descrição</Label>
              <Input
                id="pdesc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pfeat">Recursos (um por linha)</Label>
              <Textarea
                id="pfeat"
                rows={5}
                value={form.features}
                onChange={(e) =>
                  setForm((f) => ({ ...f, features: e.target.value }))
                }
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
  );
}
