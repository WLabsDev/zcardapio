import Image from "next/image";
import { Bell, Printer, QrCode, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Mockup do cardápio no celular usado no hero da landing.
 *
 * A tela é uma captura real de `/r/burguer-do-zeca` (`public/mockup-restaurante.png`).
 * Para atualizar, basta trocar o arquivo — só mantenha a proporção parecida
 * (a atual é 1206x2622) para os cartões flutuantes continuarem caindo nos
 * mesmos pontos da tela.
 */

const MOCKUP_WIDTH = 1206;
const MOCKUP_HEIGHT = 2622;

export function MenuMockup({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[290px] md:max-w-none", className)}>
      <div className="relative mx-auto w-[264px]">
        <div className="rounded-[2.2rem] border-2 border-foreground bg-background p-2 shadow-offset transition-transform duration-300 hover:-translate-y-1">
          <div className="overflow-hidden rounded-[1.7rem] border border-foreground/10 bg-card">
            <Image
              src="/mockup-restaurante.png"
              alt="Cardápio digital da Burguer do Zeca aberto no celular, com o cabeçalho do restaurante, a busca e os produtos"
              width={MOCKUP_WIDTH}
              height={MOCKUP_HEIGHT}
              // Renderiza sempre a ~243px (264 do celular menos borda e padding),
              // então não faz sentido baixar o PNG de 1206px de largura.
              sizes="250px"
              priority
              className="h-auto w-full"
            />
          </div>
        </div>

        {/* Cartões do painel do dono. Ficam ancorados no celular (e não na coluna
            do hero, que muda de largura): assim a sobreposição é sempre a mesma e
            eles nunca avançam sobre o texto à esquerda. */}
        <div className="absolute top-24 z-20 hidden w-[9.5rem] -rotate-2 rounded-xl border-2 border-foreground bg-background p-2.5 shadow-offset-sm lg:block lg:-left-16">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="text-[0.55rem] font-bold uppercase tracking-widest text-primary">
              Novo pedido
            </span>
          </div>
          <p className="mt-1 font-display text-[0.7rem] font-bold">Mesa 07 · #0142</p>
          <p className="text-[0.58rem] text-muted-foreground">2 itens · há 12 segundos</p>
          <div className="mt-1.5 flex items-center gap-1.5 border-t border-foreground/10 pt-1.5 text-muted-foreground">
            <Bell className="size-2.5" />
            <Printer className="size-2.5" />
            <span className="ml-auto font-display text-[0.7rem] font-bold text-foreground">
              R$ 69,80
            </span>
          </div>
        </div>

        {/* Só a partir do `xl`: até 1279px, encostar este cartão na direita sem
            estourar a página exigiria cobrir as fotos dos produtos. */}
        <div className="absolute bottom-16 z-20 hidden w-[10rem] rotate-2 rounded-xl border-2 border-foreground bg-background p-2.5 shadow-offset-sm xl:block xl:-right-[9rem]">
          <p className="text-[0.55rem] font-bold uppercase tracking-widest text-muted-foreground">
            Vendas hoje
          </p>
          <p className="font-display text-lg font-bold leading-tight">R$ 1.284,90</p>
          <p className="flex items-center gap-1 text-[0.58rem] font-semibold text-primary">
            <TrendingUp className="size-2.5" />
            +18% vs. ontem
          </p>
          <Sparkline className="mt-1 h-7 w-full text-primary" />
        </div>

        <span className="absolute -bottom-3 -left-3 z-20 hidden items-center gap-1.5 rounded-full border-2 border-foreground bg-background px-2.5 py-1 shadow-offset-sm lg:flex">
          <QrCode className="size-3 text-primary" />
          <span className="text-[0.6rem] font-semibold">QR na mesa, pedido na cozinha</span>
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
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
