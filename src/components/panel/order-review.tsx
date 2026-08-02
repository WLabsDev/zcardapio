"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function OrderReview({
  orderId,
  initiallyReviewed,
}: {
  orderId: string;
  initiallyReviewed: boolean;
}) {
  const [reviewed, setReviewed] = useState(initiallyReviewed);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  if (reviewed) {
    return (
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <Star className="size-3.5 fill-amber-400 text-amber-400" />
        Você já avaliou este pedido.
      </p>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        <Star className="size-3.5" />
        Avaliar pedido
      </Button>
    );
  }

  const submit = async () => {
    if (rating === 0) {
      toast.error("Escolha de 1 a 5 estrelas.");
      return;
    }
    setSending(true);
    const res = await fetch(`/api/orders/${orderId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSending(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível enviar a avaliação.");
      return;
    }
    setReviewed(true);
    toast.success("Obrigado pela avaliação!");
  };

  return (
    <div className="space-y-2 rounded-xl border bg-muted/30 p-3">
      <p className="text-sm font-medium">Como foi seu pedido?</p>
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHoverRating(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}`}
            className="p-0.5"
          >
            <Star
              className={cn(
                "size-6 transition-colors",
                (hoverRating || rating) >= n
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40"
              )}
            />
          </button>
        ))}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Conte como foi (opcional)"
        className="min-h-16 text-sm"
        maxLength={500}
      />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
          disabled={sending}
        >
          Cancelar
        </Button>
        <Button type="button" size="sm" onClick={submit} disabled={sending}>
          {sending ? "Enviando..." : "Enviar avaliação"}
        </Button>
      </div>
    </div>
  );
}
