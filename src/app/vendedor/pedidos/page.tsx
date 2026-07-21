"use client";

import { useState } from "react";
import {
  Bike,
  CalendarClock,
  CreditCard,
  MapPin,
  MessageCircle,
  Printer,
  ReceiptText,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/panel/empty-state";
import { OrderPrintTicket } from "@/components/panel/order-print-ticket";
import { OrderStatusBadge } from "@/components/panel/order-status-badge";
import { OrderStatusTimeline } from "@/components/panel/order-status-timeline";
import { useOrders } from "@/components/panel/orders-provider";
import {
  formatBRL,
  ORDER_STATUS_LABEL,
  type Order,
  type OrderStatus,
} from "@/lib/mock/types";
import { normalizePhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

const tabs: { value: string; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendente", label: "Pendentes" },
  { value: "preparando", label: "Em preparo" },
  { value: "entregue", label: "Concluídos" },
];

export default function PedidosPage() {
  const { orders, updateStatus } = useOrders();
  const [tab, setTab] = useState("todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = orders.find((o) => o.id === selectedId) ?? null;

  const filtered =
    tab === "todos" ? orders : orders.filter((o) => o.status === tab);

  const pendingCount = orders.filter((o) => o.status === "pendente").length;

  function handleChangeStatus(order: Order, status: OrderStatus) {
    updateStatus(order.id, status);
    toast.success(`Pedido atualizado para “${ORDER_STATUS_LABEL[status]}”.`);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Pedidos</h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe e atualize o status dos pedidos recebidos.
          {pendingCount > 0 && (
            <>
              {" "}
              <strong className="text-primary">
                {pendingCount} aguardando confirmação.
              </strong>
            </>
          )}
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden sm:table-cell">Itens</TableHead>
                <TableHead className="hidden sm:table-cell">Pagamento</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow
                  key={o.id}
                  className={cn(
                    "cursor-pointer",
                    o.status === "pendente" &&
                      "bg-amber-50/70 hover:bg-amber-50 dark:bg-amber-950/20 dark:hover:bg-amber-950/30"
                  )}
                  onClick={() => setSelectedId(o.id)}
                >
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      {o.code}
                      {o.status === "pendente" && (
                        <span className="flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                          <span className="size-1.5 animate-pulse rounded-full bg-primary-foreground" />
                          novo
                        </span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>{o.customerName}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {o.items.reduce((a, i) => a + i.quantity, 0)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {o.paymentMethod}
                  </TableCell>
                  <TableCell>{formatBRL(o.total)}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={o.status} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      compact
                      icon={ReceiptText}
                      title="Nenhum pedido aqui"
                      description="Quando chegarem pedidos com esse status, eles aparecem nesta lista."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={!!selected}
        onOpenChange={(o: boolean) => !o && setSelectedId(null)}
      >
        <DialogContent className="sm:max-w-xl overflow-x-hidden">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-3">
                  <DialogTitle className="font-display text-xl">
                    Pedido {selected.code}
                  </DialogTitle>
                  <OrderStatusBadge status={selected.status} />
                </div>
                <DialogDescription asChild>
                  <div className="min-w-0 space-y-1.5">
                    <p className="break-words">
                      {selected.customerName} ·{" "}
                      {new Date(selected.createdAt).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                    {selected.scheduledFor && (
                      <Badge
                        variant="outline"
                        className="gap-1 border-primary/40 text-primary"
                      >
                        <CalendarClock className="size-3" />
                        Agendado para{" "}
                        {new Date(selected.scheduledFor).toLocaleString(
                          "pt-BR",
                          { dateStyle: "short", timeStyle: "short" }
                        )}
                      </Badge>
                    )}
                  </div>
                </DialogDescription>
              </DialogHeader>

              {/* Ações rápidas — status e impressão no topo, sem rolar */}
              <div className="space-y-2 rounded-xl border-2 border-foreground bg-accent p-3 shadow-offset-sm">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-accent-foreground/70">
                    Status
                  </span>
                  <Select
                    value={selected.status}
                    onValueChange={(v: string) =>
                      handleChangeStatus(selected, v as OrderStatus)
                    }
                  >
                    <SelectTrigger className="h-10 flex-1 border-2 border-foreground bg-background font-semibold shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map(
                        (s) => (
                          <SelectItem key={s} value={s}>
                            {ORDER_STATUS_LABEL[s]}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="lg"
                  className="w-full rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
                  onClick={() => window.print()}
                >
                  <Printer className="size-4" />
                  Imprimir p/ cozinha
                </Button>
              </div>

              <OrderStatusTimeline status={selected.status} />

              {/* Cliente e entrega */}
              <div className="min-w-0 space-y-2.5 rounded-xl border-2 border-foreground/15 bg-muted/40 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-accent font-display text-sm font-bold">
                      {selected.customerName.trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {selected.customerName}
                      </p>
                      {selected.customerPhone && (
                        <p className="text-xs text-muted-foreground">
                          {selected.customerPhone}
                        </p>
                      )}
                    </div>
                  </div>
                  {selected.customerPhone && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="shrink-0 rounded-full border-2 border-foreground font-semibold"
                    >
                      <a
                        href={`https://wa.me/55${normalizePhone(selected.customerPhone)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="size-4" />
                        WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
                <Separator />
                <div className="flex items-start gap-2.5 text-sm">
                  {selected.deliveryType === "entrega" ? (
                    <Bike className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <Store className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium">
                      {selected.deliveryType === "entrega"
                        ? "Entrega"
                        : "Retirada no local"}
                      {selected.zoneName && (
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          · {selected.zoneName}
                        </span>
                      )}
                    </p>
                    {selected.deliveryType === "entrega" && selected.address && (
                      <p className="flex items-start gap-1 text-xs text-muted-foreground">
                        <MapPin className="mt-0.5 size-3 shrink-0" />
                        {selected.address}
                      </p>
                    )}
                  </div>
                  <span className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <CreditCard className="size-3.5" />
                    {selected.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Itens */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Itens do pedido
                </p>
                <div className="space-y-2">
                  {selected.items.map((i, idx) => (
                    <div
                      key={`${i.productId}-${idx}`}
                      className="rounded-xl border border-foreground/10 bg-card p-3"
                    >
                      <div className="flex justify-between gap-2 text-sm">
                        <span className="min-w-0 break-words font-semibold">
                          {i.quantity}x {i.name}
                        </span>
                        <span className="shrink-0 font-medium">
                          {formatBRL(i.unitPrice * i.quantity)}
                        </span>
                      </div>
                      {i.options && i.options.length > 0 && (
                        <ul className="mt-1.5 space-y-0.5 border-l-2 border-primary/40 pl-2.5">
                          {i.options.map((op, opIdx) => (
                            <li
                              key={opIdx}
                              className="flex justify-between gap-2 text-xs text-muted-foreground"
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
                        <p className="mt-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs italic text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                          Obs: {i.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Totais */}
              <div className="space-y-1.5 rounded-xl bg-muted/50 p-3.5 text-sm">
                {selected.subtotal !== undefined && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatBRL(selected.subtotal)}</span>
                  </div>
                )}
                {selected.discount !== undefined && selected.discount > 0 && (
                  <div className="flex justify-between font-medium text-primary">
                    <span>
                      Desconto
                      {selected.couponCode && ` (${selected.couponCode})`}
                    </span>
                    <span>−{formatBRL(selected.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>
                    {selected.deliveryType === "entrega" ? "Entrega" : "Retirada"}
                  </span>
                  <span>
                    {selected.deliveryType === "retirada" ||
                    (selected.deliveryFee ?? 0) === 0
                      ? "Grátis"
                      : formatBRL(selected.deliveryFee ?? 0)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatBRL(selected.total)}</span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedId(null)}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {selected && <OrderPrintTicket order={selected} />}
    </div>
  );
}
