import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/mock/types";

const styles: Record<OrderStatus, string> = {
  pendente:
    "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  confirmado:
    "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  preparando:
    "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400",
  saiu_para_entrega:
    "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400",
  entregue:
    "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
  cancelado:
    "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="secondary" className={styles[status]}>
      {ORDER_STATUS_LABEL[status]}
    </Badge>
  );
}
