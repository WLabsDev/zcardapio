"use client";

import {
  useRef,
  useState,
  type TouchEvent as ReactTouchEvent,
} from "react";
import {
  Bike,
  CalendarClock,
  CreditCard,
  MapPin,
  MessageCircle,
  Printer,
  ReceiptText,
  Store,
  UtensilsCrossed,
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
import { useBackToClose } from "@/hooks/use-back-to-close";
import {
  formatBRL,
  ORDER_STATUS_LABEL,
  type Order,
  type OrderStatus,
} from "@/lib/mock/types";
import { normalizePhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

const tabs: { value: string; label: string }[] = [
  { value: "pendente", label: "Pendentes" },
  { value: "confirmado", label: "Confirmados" },
  { value: "preparando", label: "Em preparo" },
  { value: "saiu_para_entrega", label: "Saiu p/ entrega" },
  { value: "entregue", label: "Concluídos" },
  { value: "cancelado", label: "Cancelados" },
  { value: "todos", label: "Todos" },
];

/** Barra lateral de cor por status, para bater o olho e saber a situação. */
const statusAccent: Record<OrderStatus, string> = {
  pendente: "border-l-amber-400 dark:border-l-amber-500",
  confirmado: "border-l-blue-400 dark:border-l-blue-500",
  preparando: "border-l-violet-400 dark:border-l-violet-500",
  saiu_para_entrega: "border-l-cyan-400 dark:border-l-cyan-500",
  entregue: "border-l-green-400 dark:border-l-green-500",
  cancelado: "border-l-red-400 dark:border-l-red-500",
};

function timeAgo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "ontem" : `há ${d} dias`;
}

export default function PedidosPage() {
  const { orders, updateStatus } = useOrders();
  const [tab, setTab] = useState("pendente");
  const [slideDir, setSlideDir] = useState<1 | -1>(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Troca de aba com direção, para o conteúdo deslizar no sentido do gesto.
  function changeTab(next: string) {
    const order = tabs.map((x) => x.value);
    setSlideDir(order.indexOf(next) >= order.indexOf(tab) ? 1 : -1);
    setTab(next);
  }

  const selected = orders.find((o) => o.id === selectedId) ?? null;

  // No mobile, o botão "voltar" fecha o modal em vez de sair da página.
  useBackToClose(!!selected, () => setSelectedId(null));

  const filtered =
    tab === "todos" ? orders : orders.filter((o) => o.status === tab);

  const pendingCount = orders.filter((o) => o.status === "pendente").length;

  function handleChangeStatus(order: Order, status: OrderStatus) {
    updateStatus(order.id, status);
    toast.success(`Pedido atualizado para “${ORDER_STATUS_LABEL[status]}”.`);
  }

  // Arrastar para o lado troca de aba: ← vai para a próxima, → para a anterior.
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: ReactTouchEvent) => {
    const t = e.touches[0];
    // Borda esquerda é reservada ao gesto de abrir o menu (panel-shell).
    if (t.clientX <= 24) {
      swipeRef.current = null;
      return;
    }
    swipeRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchMove = (e: ReactTouchEvent) => {
    if (!swipeRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - swipeRef.current.x;
    const dy = t.clientY - swipeRef.current.y;
    // Movimento vertical dominante → é rolagem da lista, aborta o gesto.
    if (Math.abs(dy) > 24 && Math.abs(dy) > Math.abs(dx)) {
      swipeRef.current = null;
      return;
    }
    // Arrasto horizontal claro → troca de aba.
    if (Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 2) {
      swipeRef.current = null;
      const order = tabs.map((x) => x.value);
      const idx = order.indexOf(tab);
      const next = dx < 0 ? idx + 1 : idx - 1;
      if (next >= 0 && next < order.length) changeTab(order[next]);
    }
  };
  const onTouchEnd = () => {
    swipeRef.current = null;
  };

  return (
    <div
      className="mx-auto max-w-5xl space-y-6"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
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

      <Tabs value={tab} onValueChange={changeTab}>
        <div className="scrollbar-hide -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList className="w-max">
            {tabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="flex-none">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      <div
        key={tab}
        className={slideDir === 1 ? "animate-tab-next" : "animate-tab-prev"}
      >
      {filtered.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              compact
              icon={ReceiptText}
              title="Nenhum pedido aqui"
              description="Quando chegarem pedidos com esse status, eles aparecem nesta lista."
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile: cards-ticket com alvo de toque generoso e status em cor */}
          <div className="space-y-3 md:hidden">
            {filtered.map((o) => {
              const itemCount = o.items.reduce((a, i) => a + i.quantity, 0);
              return (
                <button
                  key={o.id}
                  onClick={() => setSelectedId(o.id)}
                  className={cn(
                    "w-full rounded-xl border-2 border-l-[6px] border-foreground/10 bg-card p-3.5 text-left shadow-offset-sm transition-all hover:-translate-y-0.5 hover:border-foreground/30 active:translate-y-0 active:scale-[0.99]",
                    statusAccent[o.status],
                    o.status === "pendente" &&
                      "bg-amber-50/70 dark:bg-amber-950/20"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="font-display text-base font-bold">
                        {o.code}
                      </span>
                      {o.status === "pendente" && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                          <span className="size-1.5 animate-pulse rounded-full bg-primary-foreground" />
                          novo
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                      {timeAgo(o.createdAt)}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-baseline justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-semibold">
                      {o.customerName}
                    </p>
                    <p className="shrink-0 font-display text-base font-bold">
                      {formatBRL(o.total)}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                      {o.deliveryType === "entrega" ? (
                        <Bike className="size-3.5 shrink-0" />
                      ) : o.deliveryType === "mesa" ? (
                        <UtensilsCrossed className="size-3.5 shrink-0" />
                      ) : (
                        <Store className="size-3.5 shrink-0" />
                      )}
                      <span className="truncate">
                        {o.deliveryType === "entrega"
                          ? "Entrega"
                          : o.deliveryType === "mesa"
                            ? `Mesa ${o.tableNumber ?? ""}`
                            : "Retirada"}{" "}
                        · {o.paymentMethod} · {itemCount}{" "}
                        {itemCount === 1 ? "item" : "itens"}
                      </span>
                    </p>
                    <OrderStatusBadge status={o.status} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Desktop: tabela para escanear muitos pedidos de uma vez */}
          <Card className="hidden md:block">
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Pagamento</TableHead>
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
                      <TableCell>
                        <span className="flex items-center gap-1.5">
                          {o.customerName}
                          {o.deliveryType === "mesa" && o.tableNumber && (
                            <span className="shrink-0 rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">
                              Mesa {o.tableNumber}
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        {o.items.reduce((a, i) => a + i.quantity, 0)}
                      </TableCell>
                      <TableCell>{o.paymentMethod}</TableCell>
                      <TableCell>{formatBRL(o.total)}</TableCell>
                      <TableCell>
                        <OrderStatusBadge status={o.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
      </div>

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
                  <Button
                    size="icon-lg"
                    variant="outline"
                    className="shrink-0 border-2 border-foreground bg-background shadow-offset-sm transition-transform hover:-translate-y-0.5"
                    onClick={() => window.print()}
                    aria-label="Imprimir para cozinha"
                    title="Imprimir para cozinha"
                  >
                    <Printer className="size-4" />
                  </Button>
                </div>
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
                  ) : selected.deliveryType === "mesa" ? (
                    <UtensilsCrossed className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <Store className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium">
                      {selected.deliveryType === "entrega"
                        ? "Entrega"
                        : selected.deliveryType === "mesa"
                          ? `Mesa ${selected.tableNumber ?? ""}`
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
                    {selected.deliveryType === "entrega"
                      ? "Entrega"
                      : selected.deliveryType === "mesa"
                        ? `Mesa ${selected.tableNumber ?? ""}`
                        : "Retirada"}
                  </span>
                  <span>
                    {selected.deliveryType !== "entrega" ||
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
