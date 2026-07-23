import { Logo } from "@/components/logo";
import { PhoneMockup } from "@/components/phone-mockup";

/**
 * Layout de duas colunas pras páginas de login/cadastro no desktop — imagem
 * de marca de um lado, formulário do outro. No mobile some o painel da
 * esquerda e mostra só a logo em cima do formulário.
 */
export function AuthSplitShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[44%] shrink-0 flex-col justify-between overflow-hidden border-r-2 border-foreground bg-accent p-10 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 bottom-10 size-64 rounded-full bg-background/50 blur-3xl"
        />
        <Logo className="relative z-10" />
        <div className="relative z-10 flex flex-1 items-center justify-center py-10">
          <PhoneMockup />
        </div>
        <div className="relative z-10 max-w-sm">
          <p className="font-display text-2xl font-bold leading-tight">
            Seu cardápio online, sem comissão por pedido.
          </p>
          <p className="mt-2 text-sm text-foreground/70">
            Monte seu cardápio, cole o QR code na mesa e receba pedidos direto
            no seu painel.
          </p>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-1/4 size-80 rounded-full bg-primary/10 blur-3xl lg:hidden"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 bottom-1/4 size-80 rounded-full bg-accent blur-3xl lg:hidden"
        />
        <Logo className="relative z-10 mb-8 lg:hidden" />
        <div className="relative z-10 flex w-full flex-col items-center">
          {children}
        </div>
      </div>
    </div>
  );
}
