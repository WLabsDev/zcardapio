import {
  Bell,
  Bike,
  CircleDollarSign,
  CircleUserRound,
  Clock,
  Printer,
  QrCode,
  Search,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./landing.module.css";

/* Ilustrações da landing. Todas são estáticas e renderizam no servidor —
   nenhuma delas precisa de JavaScript no cliente. */

/* Espelha o cardápio de demonstração (/r/burguer-do-zeca): mesmos produtos,
   descrições, preços e fotos, na mesma ordem de leitura — texto à esquerda e
   foto à direita, como no MenuView. */
const menuItems = [
  {
    name: "Zé Veggie",
    description: "Burger de grão-de-bico, queijo prato, rúcula e tomate seco.",
    price: "R$ 27,90",
    popular: false,
    thumb: styles.thumbVeggie,
  },
  {
    name: "Zé Bacon Duplo",
    description: "Dois blends de 160g, dobro de cheddar, bacon crocante e maionese defumada.",
    price: "R$ 39,90",
    popular: true,
    thumb: styles.thumbBacon,
  },
  {
    name: "Zé Clássico",
    description: "Pão brioche, blend 160g, queijo cheddar, alface, tomate e molho da casa.",
    price: "R$ 29,90",
    popular: true,
    thumb: styles.thumbClassico,
  },
];

const infoChips = [
  { icon: Clock, label: "35–50 min" },
  { icon: Bike, label: "R$ 5,00" },
  { icon: CircleDollarSign, label: "mín. R$ 10,00" },
];

/** Composição do hero: celular com o cardápio + cartões flutuantes do painel. */
export function HeroShowcase() {
  return (
    <div className="relative mx-auto w-full max-w-[26rem] lg:max-w-none">
      <div
        aria-hidden
        className={cn(
          styles.heroGlow,
          "pointer-events-none absolute -inset-x-10 -inset-y-16 blur-2xl"
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 hidden size-[27rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--lp-line)] sm:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 hidden size-[21rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--lp-line)] sm:block"
      />

      {/* Celular */}
      <div className="relative mx-auto w-[17rem] sm:w-[18.5rem]">
        <div className="rounded-[2.6rem] bg-[var(--lp-navy)] p-2 shadow-[var(--lp-shadow-lg)]">
          <div className="relative overflow-hidden rounded-[2.05rem] bg-white">
            <span
              aria-hidden
              className="absolute left-1/2 top-2.5 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-[var(--lp-navy)]"
            />

            {/* Capa + botão de conta, como no cardápio real */}
            <div aria-hidden className={cn(styles.cover, "relative h-24 w-full")}>
              <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[0.6rem] font-semibold text-[var(--lp-ink)] shadow-[var(--lp-shadow-sm)]">
                <CircleUserRound className="size-2.5" />
                Entrar
              </span>
            </div>

            {/* Cartão do restaurante flutuando sobre a capa */}
            <div className="relative -mt-8 px-3">
              <div className="rounded-2xl border border-[var(--lp-line)] bg-white p-3 shadow-[var(--lp-shadow-sm)]">
                <div className="flex items-start gap-2.5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--lp-accent)] text-[0.8rem] font-semibold text-white">
                    BZ
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.85rem] font-semibold leading-tight text-[var(--lp-ink)]">
                      Burguer do Zé
                    </p>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--lp-mint-tint)] px-1.5 py-0.5 text-[0.55rem] font-semibold text-[var(--lp-mint)]">
                      <span className="size-1 rounded-full bg-[var(--lp-mint)]" />
                      Aberto agora
                    </span>
                    <p className="mt-1 truncate text-[0.6rem] text-[var(--lp-muted)]">
                      Hambúrgueres artesanais feitos na brasa.
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {infoChips.map((chip) => (
                    <span
                      key={chip.label}
                      className="inline-flex items-center gap-0.5 whitespace-nowrap rounded-full border border-[var(--lp-line)] px-1.5 py-0.5 text-[0.52rem] font-semibold text-[var(--lp-body)]"
                    >
                      <chip.icon className="size-2 text-[var(--lp-accent)]" />
                      {chip.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Busca + categorias */}
            <div className="mt-3 space-y-2 px-3">
              <div className="flex items-center gap-1.5 rounded-lg border border-[var(--lp-line)] px-2 py-1.5 text-[0.62rem] text-[var(--lp-muted)]">
                <Search className="size-2.5" />
                Buscar no cardápio...
              </div>
              <div className="flex gap-1.5 overflow-hidden">
                {["Burgers", "Acompanhamentos", "Bebidas"].map((c, i) => (
                  <span
                    key={c}
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[0.6rem] font-semibold",
                      i === 0
                        ? "bg-[var(--lp-accent)] text-white"
                        : "border border-[var(--lp-line)] text-[var(--lp-body)]"
                    )}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Produtos da categoria */}
            <div className="px-3 pb-3 pt-3">
              <p className="text-[0.72rem] font-semibold text-[var(--lp-ink)]">Burgers</p>
              <div className="mt-1.5 space-y-1.5">
                {menuItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex gap-2 rounded-xl border border-[var(--lp-line-soft)] p-1.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <p className="truncate text-[0.68rem] font-semibold text-[var(--lp-ink)]">
                          {item.name}
                        </p>
                        {item.popular && (
                          <span className="shrink-0 rounded bg-[#fbf0dc] px-1 py-px text-[0.48rem] font-semibold text-[#a9741d]">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[0.55rem] leading-snug text-[var(--lp-muted)]">
                        {item.description}
                      </p>
                      <p className="mt-1 text-[0.68rem] font-semibold text-[var(--lp-accent)]">
                        {item.price}
                      </p>
                    </div>
                    <span
                      aria-hidden
                      className={cn(item.thumb, "size-14 shrink-0 self-center rounded-lg")}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Barra do carrinho. O texto fica à esquerda de propósito: o cartão de
                faturamento flutua nessa altura e só encobre a parte vazia. */}
            <div className="px-3 pb-3">
              <div className="flex items-center gap-1.5 rounded-full bg-[var(--lp-accent)] px-3 py-2 text-white">
                <ShoppingBag className="size-3" />
                <span className="text-[0.7rem] font-semibold">Ver carrinho (2)</span>
                <span className="ml-auto text-[0.7rem] font-semibold">R$ 69,80</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cartões flutuantes. Só entram a partir do `sm`: no celular o mockup ocupa
          quase toda a largura e eles cobririam o cardápio em vez de enfeitá-lo. */}
      <div
        className={cn(
          styles.float,
          "absolute top-24 z-20 hidden w-[10.5rem] rounded-2xl border border-[var(--lp-line)] bg-white/90 p-3 shadow-[var(--lp-shadow)] backdrop-blur sm:block sm:-left-16 lg:-left-4 xl:-left-10"
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn(styles.ping, "size-2 rounded-full bg-[var(--lp-mint)]")} />
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--lp-mint)]">
            Novo pedido
          </span>
        </div>
        <p className="mt-1.5 text-[0.8rem] font-semibold text-[var(--lp-ink)]">Mesa 07 · #0142</p>
        <p className="text-[0.7rem] text-[var(--lp-muted)]">2 itens · há 12 segundos</p>
        <div className="mt-2.5 flex items-center gap-1.5 border-t border-[var(--lp-line-soft)] pt-2.5 text-[var(--lp-muted)]">
          <Bell className="size-3" />
          <Printer className="size-3" />
          <span className="ml-auto text-[0.8rem] font-semibold text-[var(--lp-ink)]">R$ 69,80</span>
        </div>
      </div>

      {/* Cartão: faturamento do dia */}
      <div
        className={cn(
          styles.floatSlow,
          "absolute bottom-16 z-20 hidden w-[11.5rem] rounded-2xl border border-[var(--lp-line)] bg-white/90 p-3 shadow-[var(--lp-shadow)] backdrop-blur sm:block sm:-right-16 lg:-right-4 xl:-right-8"
        )}
      >
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--lp-muted)]">
          Vendas hoje
        </p>
        <p className="mt-1 text-[1.35rem] font-semibold tracking-tight text-[var(--lp-ink)]">
          R$ 1.284,90
        </p>
        <p className="flex items-center gap-1 text-[0.7rem] font-semibold text-[var(--lp-mint)]">
          <TrendingUp className="size-3" />
          +18% vs. ontem
        </p>
        <Sparkline className="mt-2 h-8 w-full" />
      </div>

      {/* Selo do QR code */}
      <div className="absolute -bottom-2 left-6 z-20 hidden items-center gap-2 rounded-full border border-[var(--lp-line)] bg-white px-3 py-2 shadow-[var(--lp-shadow-sm)] sm:flex lg:left-0">
        <QrCode className="size-4 text-[var(--lp-accent)]" />
        <span className="text-[0.7rem] font-semibold text-[var(--lp-ink)]">
          QR na mesa, pedido na cozinha
        </span>
      </div>
    </div>
  );
}

function Sparkline({ className }: { className?: string }) {
  const line = "M0 27 L20 23 L40 25 L60 15 L80 18 L100 8 L120 3";
  return (
    <svg
      viewBox="0 0 120 32"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="lp-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--lp-mint)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--lp-mint)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L120 32 L0 32 Z`} fill="url(#lp-spark)" />
      <path
        d={line}
        fill="none"
        stroke="var(--lp-mint)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Cartão grande: personalização da marca. */
export function BrandVisual() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--lp-line-soft)] bg-[var(--lp-bg)] p-4">
      <div className="flex items-center gap-2">
        {["#e9552a", "#0f2136", "#1f9d74", "#e5a13a", "#8b5cf6"].map((c, i) => (
          <span
            key={c}
            className={cn(
              "size-7 rounded-full ring-2 ring-white",
              i === 0 && "outline-2 outline-offset-2 outline-[var(--lp-accent)]"
            )}
            style={{ backgroundColor: c }}
          />
        ))}
        <span className="ml-auto text-[0.65rem] font-medium text-[var(--lp-muted)]">
          cor da marca
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[var(--lp-line)] bg-white shadow-[var(--lp-shadow-sm)]">
        <div aria-hidden className={cn(styles.cover, "h-12 w-full")} />
        <div className="flex items-center gap-2.5 p-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--lp-accent)] text-[0.7rem] font-semibold text-white">
            BZ
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.7rem] font-semibold text-[var(--lp-ink)]">
              Burguer do Zé
            </p>
            <p className="truncate text-[0.58rem] text-[var(--lp-muted)]">35–50 min · R$ 5,00</p>
          </div>
          <span className="rounded-md bg-[var(--lp-accent-tint)] px-2 py-1 text-[0.6rem] font-semibold text-[var(--lp-accent)]">
            seu.link
          </span>
        </div>
      </div>
    </div>
  );
}

/* Padrão decorativo do QR — os cantos ficam vazios para os marcadores. */
const qrPattern = [
  "....#.#.#....",
  "....##..#....",
  "....#.##.....",
  "....##.#.....",
  "#.##.#.#.##.#",
  ".#..##.##..#.",
  "##.#..#.#.##.",
  ".#.##.##..#.#",
  "#..#.#..##..#",
  "....#.##.#.#.",
  "....##..#..##",
  "....#.#.##.#.",
  "....##.#.#..#",
];

/** Cartão: QR code por mesa. */
export function QrVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[11rem] rounded-2xl border border-[var(--lp-line-soft)] bg-white p-4 text-[var(--lp-navy)] shadow-[var(--lp-shadow-sm)]">
      <div className="relative size-full">
        <div className="grid size-full grid-cols-[repeat(13,minmax(0,1fr))] gap-[3px]">
          {qrPattern.flatMap((row, y) =>
            row.split("").map((cell, x) => (
              <span
                key={`${y}-${x}`}
                className={cn("rounded-[1px]", cell === "#" && "bg-current")}
              />
            ))
          )}
        </div>
        {[
          "left-0 top-0",
          "right-0 top-0",
          "bottom-0 left-0",
        ].map((pos) => (
          <span
            key={pos}
            className={cn(
              "absolute flex size-[31%] items-center justify-center rounded-md border-[3px] border-current",
              pos
            )}
          >
            <span className="size-[42%] rounded-[2px] bg-current" />
          </span>
        ))}
      </div>
      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--lp-navy)] px-3 py-1 text-[0.65rem] font-semibold text-white">
        Mesa 07
      </span>
    </div>
  );
}

const liveOrders = [
  { code: "#0142", table: "Mesa 07", total: "R$ 70,70", state: "Novo", tone: "mint" },
  { code: "#0141", table: "Entrega", total: "R$ 118,40", state: "Cozinha", tone: "gold" },
  { code: "#0140", table: "Retirada", total: "R$ 42,00", state: "Pronto", tone: "navy" },
] as const;

const toneClass = {
  mint: "bg-[var(--lp-mint-tint)] text-[var(--lp-mint)]",
  gold: "bg-[#fbf0dc] text-[#a9741d]",
  navy: "bg-[var(--lp-bg-soft)] text-[var(--lp-ink)]",
};

/** Cartão: fila de pedidos em tempo real. */
export function OrdersVisual() {
  return (
    <div className="space-y-2">
      {liveOrders.map((order) => (
        <div
          key={order.code}
          className="flex items-center gap-3 rounded-xl border border-[var(--lp-line-soft)] bg-white p-2.5 shadow-[var(--lp-shadow-sm)]"
        >
          <span className="text-[0.7rem] font-semibold text-[var(--lp-muted)]">{order.code}</span>
          <span className="text-[0.78rem] font-medium text-[var(--lp-ink)]">{order.table}</span>
          <span className="ml-auto text-[0.78rem] font-semibold text-[var(--lp-ink)]">
            {order.total}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[0.62rem] font-semibold",
              toneClass[order.tone]
            )}
          >
            {order.state}
          </span>
        </div>
      ))}
    </div>
  );
}

const weekBars = [
  { day: "S", value: 42 },
  { day: "T", value: 55 },
  { day: "Q", value: 48 },
  { day: "Q", value: 70 },
  { day: "S", value: 86 },
  { day: "S", value: 100, peak: true },
  { day: "D", value: 74 },
];

/** Cartão: relatório semanal. */
export function ChartVisual() {
  return (
    <div className="rounded-2xl border border-[var(--lp-line-soft)] bg-white p-4 shadow-[var(--lp-shadow-sm)]">
      <div className="flex items-baseline justify-between">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--lp-muted)]">
          Últimos 7 dias
        </span>
        <span className="text-[0.7rem] font-semibold text-[var(--lp-mint)]">+24%</span>
      </div>
      {/* As barras precisam ser filhas diretas da linha com altura fixa: dentro de
          um flex column sem altura definida, o `height: %` não resolve e some. */}
      <div className="mt-3 flex h-24 items-end gap-2 border-b border-[var(--lp-line-soft)] pb-px">
        {weekBars.map((bar, i) => (
          <div
            key={i}
            style={{ height: `${bar.value}%` }}
            className={cn(
              "flex-1 rounded-t-md",
              bar.peak ? "bg-[var(--lp-accent)]" : "bg-[var(--lp-chart-idle)]"
            )}
          />
        ))}
      </div>
      <div className="mt-1.5 flex gap-2">
        {weekBars.map((bar, i) => (
          <span
            key={i}
            className={cn(
              "flex-1 text-center text-[0.6rem] font-medium",
              bar.peak ? "text-[var(--lp-accent)]" : "text-[var(--lp-muted)]"
            )}
          >
            {bar.day}
          </span>
        ))}
      </div>
    </div>
  );
}
