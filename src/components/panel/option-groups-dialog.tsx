"use client";

import { useState } from "react";
import { Check, ChevronLeft, ListPlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/panel/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { useBackToClose } from "@/hooks/use-back-to-close";
import { formatBRL, type OptionGroup, type Product } from "@/lib/mock/types";

type OptionFormState = {
  groupId: string;
  /** presente ao editar uma opção existente */
  optionId?: string;
  name: string;
  price: string;
};

const emptyGroupForm = { name: "", required: false, max: "1" };

export function OptionGroupsDialog({
  product,
  onOpenChange,
  onChanged,
}: {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
  /** recarrega a lista de produtos após qualquer mutação */
  onChanged: () => void;
}) {
  const open = product !== null;

  const [mode, setMode] = useState<"list" | "group">("list");
  const [editingGroup, setEditingGroup] = useState<OptionGroup | null>(null);
  const [groupForm, setGroupForm] = useState(emptyGroupForm);
  const [savingGroup, setSavingGroup] = useState(false);
  const [optionForm, setOptionForm] = useState<OptionFormState | null>(null);
  const [savingOption, setSavingOption] = useState(false);

  // Reseta o estado interno ao fechar, para reabrir sempre limpo.
  const handleOpenChange = (o: boolean) => {
    if (!o) {
      setMode("list");
      setEditingGroup(null);
      setGroupForm(emptyGroupForm);
      setOptionForm(null);
    }
    onOpenChange(o);
  };

  // No mobile, o botão "voltar" fecha o modal em vez de sair da página.
  useBackToClose(open, () => handleOpenChange(false));

  const openGroupForm = (group: OptionGroup | null) => {
    setEditingGroup(group);
    setGroupForm(
      group
        ? { name: group.name, required: !!group.required, max: String(group.max) }
        : emptyGroupForm
    );
    setOptionForm(null);
    setMode("group");
  };

  const saveGroup = async () => {
    if (!product) return;
    setSavingGroup(true);
    const res = await fetch(
      editingGroup
        ? `/api/vendedor/option-groups/${editingGroup.id}`
        : `/api/vendedor/products/${product.id}/option-groups`,
      {
        method: editingGroup ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupForm.name.trim(),
          required: groupForm.required,
          max: Number(groupForm.max),
        }),
      }
    ).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSavingGroup(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível salvar o grupo.");
      return;
    }
    setMode("list");
    setEditingGroup(null);
    toast.success(
      editingGroup ? "Grupo atualizado!" : "Grupo criado! Agora adicione as opções."
    );
    onChanged();
  };

  const removeGroup = async (group: OptionGroup) => {
    const res = await fetch(`/api/vendedor/option-groups/${group.id}`, {
      method: "DELETE",
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível remover o grupo.");
      return;
    }
    toast.success("Grupo removido.");
    onChanged();
  };

  const saveOption = async () => {
    if (!optionForm) return;
    setSavingOption(true);
    const price = Number(optionForm.price.replace(",", ".")) || 0;
    const res = await fetch(
      optionForm.optionId
        ? `/api/vendedor/group-options/${optionForm.optionId}`
        : `/api/vendedor/option-groups/${optionForm.groupId}/options`,
      {
        method: optionForm.optionId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: optionForm.name.trim(), price }),
      }
    ).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSavingOption(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível salvar a opção.");
      return;
    }
    setOptionForm(null);
    toast.success("Opção salva!");
    onChanged();
  };

  const removeOption = async (optionId: string) => {
    const res = await fetch(`/api/vendedor/group-options/${optionId}`, {
      method: "DELETE",
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível remover a opção.");
      return;
    }
    toast.success("Opção removida.");
    onChanged();
  };

  const groups = product?.optionGroups ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "group"
              ? editingGroup
                ? "Editar grupo"
                : "Novo grupo de complementos"
              : "Complementos"}
          </DialogTitle>
          <DialogDescription>
            {mode === "group" ? (
              "Configure como o cliente escolhe os adicionais deste produto."
            ) : (
              <>
                Adicionais de{" "}
                <span className="font-medium text-foreground">
                  {product?.name}
                </span>{" "}
                — molhos, ponto da carne, extras e afins.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {mode === "group" ? (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 text-muted-foreground"
              onClick={() => setMode("list")}
            >
              <ChevronLeft className="size-4" />
              Voltar aos grupos
            </Button>
            <div className="grid gap-2">
              <Label htmlFor="gnome">Nome do grupo</Label>
              <Input
                id="gnome"
                value={groupForm.name}
                onChange={(e) =>
                  setGroupForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder='Ex.: "Molhos", "Ponto da carne"'
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Escolha obrigatória</p>
                <p className="text-xs text-muted-foreground">
                  O cliente precisa selecionar ao menos uma opção.
                </p>
              </div>
              <Switch
                checked={groupForm.required}
                onCheckedChange={(v: boolean) =>
                  setGroupForm((f) => ({ ...f, required: v }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Máximo de escolhas</Label>
              <Select
                value={groupForm.max}
                onValueChange={(v: string) =>
                  setGroupForm((f) => ({ ...f, max: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => String(i + 1)).map(
                    (n) => (
                      <SelectItem key={n} value={n}>
                        {n === "1" ? "1 (escolha única)" : `Até ${n}`}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={saveGroup} disabled={savingGroup} className="w-full">
              {savingGroup ? "Salvando..." : "Salvar grupo"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.length === 0 ? (
              <EmptyState
                compact
                icon={ListPlus}
                title="Nenhum complemento ainda"
                description='Crie grupos como "Molhos" ou "Bebidas" para aumentar o ticket médio dos pedidos.'
              />
            ) : (
              groups.map((g) => (
                <div
                  key={g.id}
                  className="space-y-2 rounded-xl border-2 border-foreground/10 bg-accent/40 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-semibold">{g.name}</p>
                        {g.required ? (
                          <Badge className="text-[10px]">Obrigatório</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Opcional
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px]">
                          {g.max === 1 ? "Escolha 1" : `Até ${g.max}`}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {g.options.length} opção
                        {g.options.length === 1 ? "" : "ões"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => openGroupForm(g)}
                        aria-label="Editar grupo"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => removeGroup(g)}
                        aria-label="Remover grupo"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {g.options.map((o) =>
                      optionForm?.optionId === o.id ? (
                        <div
                          key={o.id}
                          className="flex items-center gap-2 rounded-lg border-2 border-foreground/20 bg-background p-2"
                        >
                          <Input
                            className="h-8 text-sm"
                            value={optionForm.name}
                            onChange={(e) =>
                              setOptionForm((f) =>
                                f ? { ...f, name: e.target.value } : f
                              )
                            }
                            placeholder="Nome da opção"
                            autoFocus
                          />
                          <Input
                            className="h-8 w-24 text-sm"
                            type="number"
                            step="0.01"
                            min="0"
                            value={optionForm.price}
                            onChange={(e) =>
                              setOptionForm((f) =>
                                f ? { ...f, price: e.target.value } : f
                              )
                            }
                            placeholder="0,00"
                          />
                          <Button
                            size="icon-sm"
                            onClick={saveOption}
                            disabled={savingOption}
                            aria-label="Salvar opção"
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => setOptionForm(null)}
                            aria-label="Cancelar"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          key={o.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-foreground/10 bg-background px-2.5 py-1.5"
                        >
                          <span className="min-w-0 truncate text-sm">
                            {o.name}
                          </span>
                          <div className="flex shrink-0 items-center gap-1">
                            {o.price > 0 && (
                              <span className="text-xs font-medium text-muted-foreground">
                                +{formatBRL(o.price)}
                              </span>
                            )}
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={() =>
                                setOptionForm({
                                  groupId: g.id,
                                  optionId: o.id,
                                  name: o.name,
                                  price: o.price > 0 ? String(o.price) : "",
                                })
                              }
                              aria-label="Editar opção"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => removeOption(o.id)}
                              aria-label="Remover opção"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      )
                    )}

                    {optionForm && !optionForm.optionId && optionForm.groupId === g.id ? (
                      <div className="flex items-center gap-2 rounded-lg border-2 border-foreground/20 bg-background p-2">
                        <Input
                          className="h-8 text-sm"
                          value={optionForm.name}
                          onChange={(e) =>
                            setOptionForm((f) =>
                              f ? { ...f, name: e.target.value } : f
                            )
                          }
                          placeholder="Ex.: Barbecue"
                          autoFocus
                        />
                        <Input
                          className="h-8 w-24 text-sm"
                          type="number"
                          step="0.01"
                          min="0"
                          value={optionForm.price}
                          onChange={(e) =>
                            setOptionForm((f) =>
                              f ? { ...f, price: e.target.value } : f
                            )
                          }
                          placeholder="0,00"
                        />
                        <Button
                          size="icon-sm"
                          onClick={saveOption}
                          disabled={savingOption}
                          aria-label="Adicionar opção"
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => setOptionForm(null)}
                          aria-label="Cancelar"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      (!optionForm || optionForm.groupId !== g.id) && (
                        <button
                          onClick={() =>
                            setOptionForm({ groupId: g.id, name: "", price: "" })
                          }
                          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-foreground/25 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/50 hover:text-foreground"
                        >
                          <Plus className="size-3.5" />
                          Adicionar opção
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => openGroupForm(null)}
            >
              <Plus className="size-4" />
              Novo grupo de complementos
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
