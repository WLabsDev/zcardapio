"use client";

import { useState } from "react";
import { ReceiptText } from "lucide-react";
import { toast } from "sonner";
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
import { OrderStatusBadge } from "@/components/panel/order-status-badge";
import { OrderStatusTimeline } from "@/components/panel/order-status-timeline";
import { useOrders } from "@/components/panel/orders-provider";
import {
  formatBRL,
  ORDER_STATUS_LABEL,
  type Order,
  type OrderStatus,
} from "@/lib/mock/types";
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
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Pedido {selected.code} · {selected.customerName}
                </DialogTitle>
                <DialogDescription>
                  {selected.deliveryType === "entrega" ? "Entrega" : "Retirada"} ·{" "}
                  {selected.paymentMethod}
                </DialogDescription>
              </DialogHeader>
              <OrderStatusTimeline status={selected.status} />
              <div className="space-y-2 text-sm">
                {selected.items.map((i) => (
                  <div key={i.productId} className="flex justify-between">
                    <span>
                      {i.quantity}x {i.name}
                    </span>
                    <span className="font-medium">
                      {formatBRL(i.unitPrice * i.quantity)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatBRL(selected.total)}</span>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:justify-between">
                <Select
                  value={selected.status}
                  onValueChange={(v: string) =>
                    handleChangeStatus(selected, v as OrderStatus)
                  }
                >
                  <SelectTrigger className="w-full sm:w-52">
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
                <Button variant="outline" onClick={() => setSelectedId(null)}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
