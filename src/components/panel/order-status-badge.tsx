import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const styles: Record<OrderStatus, string> = {
  pendente: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  confirmado: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  preparando: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  saiu_para_entrega: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
  entregue: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  cancelado: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="secondary" className={cn("border-transparent", styles[status])}>
      {ORDER_STATUS_LABEL[status]}
    </Badge>
  );
}
