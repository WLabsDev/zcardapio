"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBRL, type DeliveryZone } from "@/lib/mock/types";

export function DeliveryZonesManager() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [fee, setFee] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/vendedor/delivery-zones").catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data) setZones(data.zones);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    const feeNum = Number(fee.replace(",", "."));
    if (name.trim().length < 2 || Number.isNaN(feeNum) || feeNum < 0) {
      toast.error("Informe o nome e uma taxa válida.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/vendedor/delivery-zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), fee: feeNum }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível adicionar a região.");
      return;
    }
    setName("");
    setFee("");
    toast.success("Região adicionada!");
    load();
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/vendedor/delivery-zones/${id}`, {
      method: "DELETE",
    }).catch(() => null);
    if (!res?.ok) {
      toast.error("Não foi possível remover a região.");
      return;
    }
    toast.success("Região removida.");
    load();
  };

  return (
    <div className="space-y-3">
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando regiões...</p>
      ) : zones.length === 0 ? (
        <p className="rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground">
          <MapPin className="mx-auto mb-1 size-4" />
          Nenhuma região cadastrada — será usada a taxa padrão de entrega.
        </p>
      ) : (
        <div className="space-y-1.5">
          {zones.map((z) => (
            <div
              key={z.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              <span className="text-sm font-medium">{z.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {z.fee === 0 ? "Grátis" : formatBRL(z.fee)}
                </span>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => remove(z.id)}
                  aria-label="Remover região"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="grid flex-1 gap-1">
          <Label htmlFor="zname">Região</Label>
          <Input
            id="zname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Centro"
          />
        </div>
        <div className="grid w-28 gap-1">
          <Label htmlFor="zfee">Taxa (R$)</Label>
          <Input
            id="zfee"
            type="number"
            step="0.1"
            min="0"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            placeholder="0"
          />
        </div>
        <Button type="button" onClick={add} disabled={saving} className="mb-0.5">
          <Plus className="size-4" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}
