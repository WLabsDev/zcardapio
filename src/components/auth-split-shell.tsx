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
      <div className="relative hidden w-[46%] shrink-0 flex-col overflow-hidden border-r-2 border-foreground bg-accent px-12 py-10 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(0,0,0,0.35) 1.5px, transparent 1.5px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-28 -top-28 size-96 rounded-full bg-primary/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 bottom-0 size-80 rounded-full bg-background/60 blur-3xl"
        />

        <Logo className="relative z-10" />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-10">
          <div className="max-w-sm text-center">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-background px-3 py-1 text-xs font-bold shadow-offset-sm">
              🔥 Mais de mil restaurantes vendendo
            </span>
            <p className="font-display text-3xl font-bold leading-[1.15] tracking-tight">
              Seu cardápio online, sem comissão por pedido.
            </p>
            <p className="mt-3 text-sm text-foreground/70">
              Monte seu cardápio, cole o QR code na mesa e receba pedidos
              direto no seu painel.
            </p>
          </div>
          <PhoneMockup />
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
