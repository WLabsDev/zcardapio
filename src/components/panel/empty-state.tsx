import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Versão sem moldura, para usar dentro de tabelas e listas. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        compact
          ? "py-10"
          : "rounded-2xl border-2 border-dashed border-foreground/20 bg-card/60 px-6 py-14",
        className
      )}
    >
      <span
        className={cn(
          "flex -rotate-3 items-center justify-center rounded-2xl border-2 border-foreground/15 bg-accent",
          compact ? "size-10" : "size-14"
        )}
      >
        <Icon className={compact ? "size-4.5" : "size-6"} />
      </span>
      <div className="space-y-1">
        <p
          className={cn(
            "font-display font-bold",
            compact ? "text-sm" : "text-lg"
          )}
        >
          {title}
        </p>
        {description && (
          <p
            className={cn(
              "mx-auto max-w-sm text-muted-foreground",
              compact ? "text-xs" : "text-sm"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
