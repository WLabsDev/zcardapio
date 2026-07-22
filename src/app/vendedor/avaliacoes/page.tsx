"use client";

import { useEffect, useState } from "react";
import { Crown, Eye, EyeOff, Star } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/panel/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { Review } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type Quota = { unlimited: boolean; limit: number; used: number };
type Settings = { reviewsEnabled: boolean; canToggle: boolean };

export default function AvaliacoesPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const load = () => {
    fetch("/api/vendedor/reviews")
      .then((res) => res.json())
      .then((data) => {
        setReviews(data?.reviews ?? []);
        setQuota(data?.quota ?? null);
        setSettings(data?.settings ?? null);
      })
      .catch(() => toast.error("Não foi possível carregar as avaliações."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleReviewsEnabled = async (checked: boolean) => {
    if (!settings) return;
    setSavingSettings(true);
    const res = await fetch("/api/vendedor/restaurant", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewsEnabled: checked }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSavingSettings(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível atualizar.");
      return;
    }
    setSettings((s) => (s ? { ...s, reviewsEnabled: checked } : s));
    toast.success(
      checked ? "Clientes podem avaliar pedidos." : "Avaliações desativadas."
    );
  };

  const toggleHidden = async (review: Review) => {
    setUpdatingId(review.id);
    const res = await fetch(`/api/vendedor/reviews/${review.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden: !review.hidden }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setUpdatingId(null);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível atualizar a avaliação.");
      return;
    }
    toast.success(review.hidden ? "Avaliação reexibida." : "Avaliação ocultada.");
    load();
  };

  // A nota exibida no cardápio público considera só avaliações visíveis.
  const visibleReviews = reviews.filter((r) => !r.hidden);
  const avg =
    visibleReviews.length > 0
      ? visibleReviews.reduce((a, r) => a + r.rating, 0) / visibleReviews.length
      : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Avaliações</h2>
        <p className="text-sm text-muted-foreground">
          O que os clientes acharam dos pedidos.
        </p>
      </div>

      {settings && (
        <Card>
          <CardContent className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                Permitir que clientes avaliem pedidos
                {!settings.canToggle && (
                  <Badge variant="outline" className="gap-1 text-[10px]">
                    <Crown className="size-3" />
                    Pro+
                  </Badge>
                )}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {settings.canToggle
                  ? "Desative para parar de receber novas avaliações no cardápio."
                  : "Desativar avaliações é um recurso dos planos Pro e Premium."}
              </p>
            </div>
            <Switch
              className="mt-0.5 shrink-0"
              checked={settings.reviewsEnabled}
              disabled={!settings.canToggle || savingSettings}
              onCheckedChange={toggleReviewsEnabled}
            />
          </CardContent>
        </Card>
      )}

      {!loading && reviews.length > 0 && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-display text-2xl font-bold">
                <Star className="size-5 fill-amber-400 text-amber-400" />
                {avg.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                · {reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"}
              </span>
            </div>
            {quota && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {quota.unlimited ? (
                  <>
                    <Crown className="size-3.5 text-primary" />
                    Seu plano permite ocultar avaliações sem limite.
                  </>
                ) : (
                  <>
                    <EyeOff className="size-3.5" />
                    Você já ocultou {quota.used} de {quota.limit} avaliações
                    permitidas este mês.
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando avaliações...</p>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Nenhuma avaliação ainda"
          description="Quando clientes avaliarem pedidos entregues, elas aparecem aqui."
        />
      ) : (
        <div className="space-y-2">
          {reviews.map((r) => (
            <Card
              key={r.id}
              className={cn("py-3", r.hidden && "border-dashed opacity-70")}
            >
              <CardContent className="space-y-1 px-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex min-w-0 items-baseline gap-1.5 truncate text-sm font-semibold">
                    <span className="truncate">{r.customerName}</span>
                    <span className="shrink-0 text-xs font-normal text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                    {r.hidden && (
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        Oculta
                      </Badge>
                    )}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {r.rating}
                    </span>
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      disabled={updatingId === r.id}
                      onClick={() => toggleHidden(r)}
                    >
                      {r.hidden ? (
                        <Eye className="size-3" />
                      ) : (
                        <EyeOff className="size-3" />
                      )}
                      {updatingId === r.id
                        ? "Salvando..."
                        : r.hidden
                          ? "Reexibir"
                          : "Ocultar"}
                    </Button>
                  </div>
                </div>
                {r.comment && (
                  <p className="text-sm text-muted-foreground">{r.comment}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
