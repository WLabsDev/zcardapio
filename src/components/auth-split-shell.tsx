import { Check } from "lucide-react";
import { Logo } from "@/components/logo";

const highlights = [
  "Cardápio digital com QR code",
  "Pedidos em tempo real no painel",
  "Programa de fidelidade integrado",
  "Sem comissão por venda",
];

/**
 * Layout de duas colunas pra páginas de login/cadastro, no mesmo visual
 * limpo dos painéis (tema panel-theme): esquerda neutra com o formulário
 * centralizado; direita com capa em degradê da cor da marca
 * (referência: bloco auth "cover" do codervent-ui-blocks).
 */
export function AuthSplitShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — form */}
      <div className="flex flex-col bg-muted px-6 py-8 md:px-10 md:py-10">
        <Logo className="mx-auto md:mx-0" />
        <div className="flex flex-1 items-center justify-center py-10">
          {children}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} zCardápio. Todos os direitos reservados.
        </p>
      </div>

      {/* Right — cover (hidden on mobile) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-primary/80 p-10 text-primary-foreground lg:flex">
        <div aria-hidden className="absolute inset-0 bg-black/10" />

        <div className="relative z-10 mt-16">
          <h1 className="font-display text-3xl font-bold leading-tight">
            Gestão completa para seu restaurante
          </h1>
          <p className="mt-3 max-w-md leading-relaxed text-primary-foreground/90">
            Cardápio digital, pedidos em tempo real, programa de fidelidade e
            muito mais. Tudo isso em um só lugar, sem comissão por venda.
          </p>
          <ul className="mt-8 space-y-3 text-sm font-medium">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary-foreground/20">
                  <Check className="size-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-primary-foreground/80">
          Feito para donos de restaurante que querem vender mais.
        </p>
      </div>
    </div>
  );
}
