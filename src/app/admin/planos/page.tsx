"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useBackToClose } from "@/hooks/use-back-to-close";
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

type PlanForm = {
  name: string;
  price: string;
  description: string;
  features: string;
  highlighted: boolean;
};

const emptyForm: PlanForm = {
  name: "",
  price: "",
  description: "",
  features: "",
  highlighted: false,
};

export default function AdminPlanosPage() {
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPlan | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  // No mobile, o botão "voltar" fecha o modal em vez de sair da página.
  useBackToClose(dialogOpen, () => setDialogOpen(false));

  const load = useCallback(() => {
    fetch("/api/admin/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data?.plans) setPlans(data.plans);
      })
      .catch(() => {});
  }, []);

  useEffect(load, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (plan: AdminPlan) => {
    setEditing(plan);
    setForm({
      name: plan.name,
      price: String(plan.price),
      description: plan.description,
      features: plan.features.join("\n"),
      highlighted: plan.highlighted,
    });
    setDialogOpen(true);
  };

  const featuresList = form.features
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  const save = async () => {
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      price: Number(form.price.replace(",", ".")) || 0,
      description: form.description.trim(),
      features: featuresList,
      highlighted: form.highlighted,
    };
    const res = await fetch(
      editing ? `/api/admin/plans/${editing.id}` : "/api/admin/plans",
      {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    ).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível salvar o plano.");
      return;
    }
    setDialogOpen(false);
    toast.success(editing ? "Plano atualizado!" : "Plano criado!");
    load();
  };

  const remove = async (plan: AdminPlan) => {
    if (plan.subscribers > 0) {
      toast.error("Este plano tem assinantes e não pode ser excluído.");
      return;
    }
    if (!window.confirm(`Excluir o plano "${plan.name}"?`)) return;
    const res = await fetch(`/api/admin/plans/${plan.id}`, {
      method: "DELETE",
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível excluir o plano.");
      return;
    }
    toast.success("Plano excluído.");
    load();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Planos</h2>
          <p className="text-sm text-muted-foreground">
            Planos disponíveis e distribuição de assinantes.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          Novo plano
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={cn("transition-colors", plan.highlighted && "bg-primary/5")}
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => openEdit(plan)}
                >
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  disabled={plan.subscribers > 0}
                  title={
                    plan.subscribers > 0
                      ? "Não é possível excluir um plano com assinantes"
                      : "Excluir plano"
                  }
                  onClick={() => remove(plan)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o: boolean) => !o && setDialogOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar plano" : "Novo plano"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pname">Nome</Label>
              <Input
                id="pname"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex.: Pro"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pprice">Preço mensal (R$)</Label>
              <Input
                id="pprice"
                type="number"
                step="0.01"
                min="0"
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
            <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Plano em destaque</p>
                <p className="text-xs text-muted-foreground">
                  Ganha destaque visual na lista de planos.
                </p>
              </div>
              <Switch
                checked={form.highlighted}
                onCheckedChange={(v: boolean) =>
                  setForm((f) => ({ ...f, highlighted: v }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving}>
              {saving ? "Salvando..." : editing ? "Salvar" : "Criar plano"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
