import { Fragment } from "react";
import {
  BadgeCheck,
  Bike,
  ChefHat,
  Clock,
  PartyPopper,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const STEPS: OrderStatus[] = [
  "pendente",
  "confirmado",
  "preparando",
  "saiu_para_entrega",
  "entregue",
];

const STEP_ICONS: Record<OrderStatus, LucideIcon> = {
  pendente: Clock,
  confirmado: BadgeCheck,
  preparando: ChefHat,
  saiu_para_entrega: Bike,
  entregue: PartyPopper,
  cancelado: XCircle,
};

const SHORT_LABEL: Record<OrderStatus, string> = {
  ...ORDER_STATUS_LABEL,
  saiu_para_entrega: "A caminho",
};

export function OrderStatusTimeline({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  if (status === "cancelado") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400",
          className
        )}
      >
        <XCircle className="size-4 shrink-0" />
        Este pedido foi cancelado.
      </div>
    );
  }

  const current = STEPS.indexOf(status);

  return (
    <div className={cn("flex items-start", className)}>
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = STEP_ICONS[step];
        return (
          <Fragment key={step}>
            {i > 0 && (
              <div
                className={cn(
                  "mt-4 h-0.5 flex-1 rounded-full",
                  i <= current ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <div className="flex flex-col items-center gap-1.5 px-0.5">
              <span
                className={cn(
                  "relative flex size-8 items-center justify-center rounded-full border transition-all",
                  active
                    ? "bg-muted text-foreground"
                    : done
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground/50"
                )}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute -inset-1 animate-ping rounded-full border-2 border-primary/40"
                  />
                )}
                <Icon className="size-3.5" />
              </span>
              <span
                className={cn(
                  "text-[10px] leading-none",
                  active
                    ? "font-semibold text-foreground"
                    : done
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50"
                )}
              >
                {SHORT_LABEL[step]}
              </span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
