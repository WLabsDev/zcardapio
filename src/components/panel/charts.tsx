import type { ChartPoint } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

/**
 * Gráfico de barras verticais no estilo do design system
 * (borda grossa + sombra deslocada no hover).
 */
export function BarsChart({
  data,
  formatValue,
  barClassName,
  labelEvery = 1,
}: {
  data: ChartPoint[];
  formatValue?: (value: number) => string;
  barClassName?: string;
  /** Mostra o rótulo do eixo a cada N barras (útil em séries longas). */
  labelEvery?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const showValues = data.length <= 14;

  return (
    <div className="flex h-52 items-end gap-1.5 sm:gap-2.5">
      {data.map((d, i) => {
        const pct = Math.max((d.value / max) * 100, 3);
        const formatted = formatValue ? formatValue(d.value) : String(d.value);
        return (
          <div
            key={`${d.label}-${i}`}
            className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            title={`${d.label}: ${formatted}`}
          >
            {showValues && (
              <span className="hidden text-[10px] font-bold text-muted-foreground transition-colors group-hover:text-foreground sm:block">
                {formatted}
              </span>
            )}
            <div
              className={cn(
                "w-full max-w-10 rounded-t-md bg-chart-1 transition-colors group-hover:bg-primary",
                barClassName
              )}
              style={{ height: `${pct}%` }}
            />
            <span className="h-3 text-[10px] text-muted-foreground">
              {(i + 1) % labelEvery === 0 || i === 0 ? d.label : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Ranking horizontal (ex.: produtos mais vendidos). */
export function RankList({
  items,
  unit = "pedidos",
}: {
  items: { name: string; image?: string; value: number }[];
  unit?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={item.name}>
          <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="w-6 shrink-0 font-display text-xs font-bold text-muted-foreground">
                {idx + 1}º
              </span>
              {item.image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.image}
                  alt=""
                  className="size-6 shrink-0 rounded-md border object-cover"
                />
              )}
              <span className="truncate font-medium">{item.name}</span>
            </span>
            <span className="shrink-0 text-xs font-bold">
              {item.value} {unit}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-chart-4 transition-all"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
