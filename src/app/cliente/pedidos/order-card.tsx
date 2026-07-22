"use client";

import { useState } from "react";
import Link from "next/link";
import { Bike, CalendarClock, ChevronDown, MapPin, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderReview } from "@/components/panel/order-review";
import { OrderStatusBadge } from "@/components/panel/order-status-badge";
import { OrderStatusTimeline } from "@/components/panel/order-status-timeline";
import { formatBRL, type Order, type OrderStatus } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const isActive = (status: OrderStatus) =>
  status !== "entregue" && status !== "cancelado";

/**
 * Card de pedido do cliente. Pedidos ativos aparecem com todos os detalhes;
 * os finalizados (entregue/cancelado) ficam compactos, com um resumo e a ação
 * "Pedir de novo" à mão — e abrem em detalhes ao tocar no chevron.
 */
export function OrderCard({ order: o }: { order: Order }) {
  const active = isActive(o.status);
  const [expanded, setExpanded] = useState(false);
  const showFull = active || expanded;
  const itemCount = o.items.reduce((a, i) => a + i.quantity, 0);

  const reorderButton = o.restaurantSlug && (
    <Button size="sm" variant="outline" asChild>
      <Link href={`/r/${o.restaurantSlug}`}>
        {o.deliveryType === "entrega" ? (
          <Bike className="size-3.5" />
        ) : (
          <Store className="size-3.5" />
        )}
        Pedir de novo
      </Link>
    </Button>
  );

  return (
    <Card className={cn(active && "border-primary/40 bg-primary/5")}>
      <CardContent>
        {/* Cabeçalho — sempre visível */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold">
              {o.restaurantName ?? "Restaurante"} · Pedido {o.code}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(o.createdAt).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              })}{" "}
              · {o.deliveryType === "entrega" ? "Entrega" : "Retirada"} ·{" "}
              {o.paymentMethod}
              {!active &&
                ` · ${itemCount} ${itemCount === 1 ? "item" : "itens"}`}
            </p>
            {o.scheduledFor && (
              <Badge
                variant="outline"
                className="mt-1.5 gap-1 border-primary/40 text-primary"
              >
                <CalendarClock className="size-3" />
                Agendado para{" "}
                {new Date(o.scheduledFor).toLocaleString("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </Badge>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {!active && (
              <span className="font-bold">{formatBRL(o.total)}</span>
            )}
            <OrderStatusBadge status={o.status} />
            {!active && !expanded && reorderButton}
            {!active && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-label={
                  expanded ? "Recolher detalhes" : "Ver detalhes do pedido"
                }
                className="flex size-7 items-center justify-center rounded-full border border-foreground/15 text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
              >
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform duration-300",
                    expanded && "rotate-180"
                  )}
                />
              </button>
            )}
          </div>
        </div>

        {/* Detalhes — ativos sempre; finalizados ao expandir (com animação) */}
        <div
          className={cn(
            "grid transition-all duration-300 ease-out",
            showFull ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="space-y-3 pt-3">
              <OrderStatusTimeline status={o.status} className="py-1" />

              {o.deliveryType === "entrega" && o.address && (
                <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    {o.address}
                    {o.zoneName && ` — ${o.zoneName}`}
                  </span>
                </p>
              )}

              <Separator />
              <div className="space-y-2 text-sm">
                {o.items.map((i, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between">
                      <span className="min-w-0 text-muted-foreground">
                        {i.quantity}x {i.name}
                      </span>
                      <span className="shrink-0">
                        {formatBRL(i.unitPrice * i.quantity)}
                      </span>
                    </div>
                    {i.options && i.options.length > 0 && (
                      <ul className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-primary/30 pl-2">
                        {i.options.map((op, opIdx) => (
                          <li
                            key={opIdx}
                            className="flex justify-between text-xs text-muted-foreground"
                          >
                            <span>{op.name}</span>
                            {op.price > 0 && (
                              <span className="shrink-0">
                                +{formatBRL(op.price)}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    {i.notes && (
                      <p className="ml-4 mt-0.5 text-xs italic text-muted-foreground">
                        Obs: {i.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1 text-sm">
                {o.subtotal !== undefined && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatBRL(o.subtotal)}</span>
                  </div>
                )}
                {o.discount !== undefined && o.discount > 0 && (
                  <div className="flex justify-between font-medium text-primary">
                    <span>
                      Desconto
                      {o.couponCode && ` (${o.couponCode})`}
                    </span>
                    <span>−{formatBRL(o.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>
                    {o.deliveryType === "entrega" ? "Entrega" : "Retirada"}
                  </span>
                  <span>
                    {o.deliveryType === "retirada" ||
                    (o.deliveryFee ?? 0) === 0
                      ? "Grátis"
                      : formatBRL(o.deliveryFee ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 font-bold">
                  <span>Total</span>
                  <span>{formatBRL(o.total)}</span>
                </div>
              </div>
              {o.status === "entregue" && (
                <OrderReview
                  orderId={o.id}
                  initiallyReviewed={Boolean(o.reviewed)}
                />
              )}
              {reorderButton && (
                <div className="flex justify-end">{reorderButton}</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
