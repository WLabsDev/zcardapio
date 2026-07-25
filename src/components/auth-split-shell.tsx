import { Logo } from "@/components/logo";

/**
 * Layout de duas colunas pras páginas de login/cadastro:
 * esquerda = formulário limpo em fundo branco;
 * direita  = painel promocional com mockup do produto.
 */
export function AuthSplitShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left — form */}
      <div className="flex w-full flex-col px-6 py-8 sm:px-10 md:w-[42%] md:shrink-0 md:border-r md:border-foreground/10 md:px-12 md:py-10 lg:w-[38%]">
        <Logo className="mb-8" />
        <div className="flex flex-1 flex-col justify-center">
          {children}
        </div>
      </div>

      {/* Right — promo (hidden on mobile) */}
      <div className="relative hidden flex-1 flex-col items-center justify-center overflow-hidden bg-accent/60 px-12 py-16 md:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full bg-primary/8 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-primary/5 blur-3xl"
        />

        <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
          <Logo className="mb-6" imgClassName="h-10" />

          <h2 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
            Gestão completa para seu restaurante
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground lg:text-base">
            Cardápio digital, pedidos em tempo real, programa de fidelidade e
            muito mais. Tudo isso em um só lugar, sem comissão por venda.
          </p>
        </div>
      </div>
    </div>
  );
}
