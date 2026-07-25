import Link from "next/link";
import {
  QrCode,
  ShoppingBag,
  Palette,
  BarChart3,
  Smartphone,
  Check,
  ArrowRight,
  Flame,
  Bell,
  Wallet,
  Gift,
  MapPin,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { MenuMockup } from "@/components/menu-mockup";
import { listPlans } from "@/lib/db/queries";
import { formatBRL } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import styles from "./landing.module.css";

// Os planos vêm do banco, então a página é renderizada sob demanda (não no build,
// onde o Docker ainda não tem acesso ao banco).
export const dynamic = "force-dynamic";

const marqueeItems = [
  "Hamburguerias",
  "Pizzarias",
  "Sushi bars",
  "Docerias",
  "Cafeterias",
  "Churrascarias",
  "Padarias",
  "Restaurantes veganos",
  "Pastelarias",
  "Açaíterias",
];

const features = [
  {
    n: "01",
    icon: Smartphone,
    title: "Seu cardápio, seu endereço",
    description:
      "Cadastre os produtos e ganhe um link com a cara do seu restaurante: seurestaurante.zcardapio.com.br. Sem app para o cliente baixar, sem enrolação.",
  },
  {
    n: "02",
    icon: QrCode,
    title: "QR code na mesa, pedido na cozinha",
    description:
      "Imprima o QR code, cole na mesa e pronto: o cliente abre, escolhe e pede. O estoque some do cardápio quando acaba e volta sozinho se o pedido for cancelado.",
  },
  {
    n: "03",
    icon: ShoppingBag,
    title: "Carrinho de verdade, sem taxa por pedido",
    description:
      "Diferente dos marketplaces, aqui o cliente é seu. Nada de comissão de 25% — você paga uma mensalidade fixa e o resto é lucro. O cliente pode agendar o pedido para a hora que quiser.",
  },
  {
    n: "04",
    icon: Palette,
    title: "Com a sua identidade, não a nossa",
    description:
      "Logo, cores, capa, fotos e modo escuro: o cardápio fica com a cara do seu negócio. Funciona até para quem abre de noite e fecha de madrugada.",
  },
  {
    n: "05",
    icon: BarChart3,
    title: "Números que ajudam a decidir",
    description:
      "Produto que mais sai, horário de pico, ticket médio. Relatórios simples para você ajustar o cardápio com base em dados, não em achismo.",
  },
  {
    n: "06",
    icon: Bell,
    title: "Pedidos em tempo real",
    description:
      "A fila atualiza sozinha, com aviso sonoro e cupom térmico (58 ou 80 mm) para a cozinha. O pedido novo também chega no seu WhatsApp. O cliente acompanha o status pelo celular.",
  },
  {
    n: "07",
    icon: Wallet,
    title: "Pix, cartão e dinheiro",
    description:
      "O Pix já sai com QR code e copia-e-cola na tela do cliente. Você escolhe quais formas o seu restaurante aceita.",
  },
  {
    n: "08",
    icon: Gift,
    title: "Cupons e fidelidade",
    description:
      "Crie cupons de desconto e um programa de fidelidade com pontos, carimbos ou cashback para o cliente voltar sem depender de anúncio.",
  },
  {
    n: "09",
    icon: MapPin,
    title: "Zonas e taxas de entrega",
    description:
      "Defina bairros, valores e tempo estimado. O cálculo aparece pronto no checkout, sem combinar frete no WhatsApp.",
  },
];

// Cenário da comparação de comissão. Os 27% são uma média de mercado — a nota de
// rodapé na seção deixa isso explícito.
const SALES_EXAMPLE = 20000;
const MARKETPLACE_RATE = 0.27;

const steps = [
  {
    n: "01",
    title: "Monte o cardápio",
    description:
      "Categorias, produtos, fotos, adicionais e preços. Tudo por um painel simples, sem depender de agência.",
  },
  {
    n: "02",
    title: "Espalhe o link e o QR",
    description:
      "Cole o QR code na mesa, coloque o link na bio do Instagram e no WhatsApp. Pronto: você tem uma loja aberta 24 horas.",
  },
  {
    n: "03",
    title: "Receba e despache",
    description:
      "Os pedidos caem em tempo real no painel, com cupom para a cozinha e status que o cliente acompanha pelo celular.",
  },
];

const faq = [
  {
    q: "Meu cliente precisa instalar algum aplicativo?",
    a: "Não. O cardápio abre direto no navegador do celular, pelo link ou pelo QR code. Nada para baixar, nada para atualizar.",
  },
  {
    q: "Vocês cobram comissão por pedido?",
    a: "Não. Você paga uma mensalidade fixa e fica com 100% do valor de cada pedido, independentemente de quanto vender no mês.",
  },
  {
    q: "O cliente precisa criar conta para pedir?",
    a: "Não. Ele pode fechar o pedido como visitante. Criar conta é opcional e serve para salvar endereços, acompanhar pedidos e juntar pontos de fidelidade.",
  },
  {
    q: "Funciona para mesa, retirada e entrega?",
    a: "Os três. Você escolhe quais modalidades aceita e o cardápio se adapta — pedido de mesa já vem com o número da mesa preenchido pelo QR code.",
  },
  {
    q: "Como o cliente paga?",
    a: "Pix com QR code gerado na hora, cartão na entrega ou dinheiro. Você define no painel o que o seu restaurante aceita.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Sem fidelidade e sem multa. O plano inicial é gratuito, então dá para testar antes de assinar qualquer coisa.",
  },
];

export default async function LandingPage() {
  const plans = await listPlans();

  // A comparação de comissão usa o preço real do plano em destaque, para não
  // inventar número nenhum na conta.
  const refPlan =
    plans.find((p) => p.highlighted && p.price > 0) ??
    plans.find((p) => p.price > 0);
  const commission = SALES_EXAMPLE * MARKETPLACE_RATE;
  const savings = refPlan ? commission - refPlan.price : null;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-foreground/10 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <a href="#recursos" className="hover:text-primary">
              Recursos
            </a>
            <a href="#planos" className="hover:text-primary">
              Planos
            </a>
            <a href="#demo" className="hover:text-primary">
              Demo
            </a>
            <a href="#duvidas" className="hover:text-primary">
              Dúvidas
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button className="rounded-full font-semibold" asChild>
              <Link href="/cadastro-restaurante">Começar grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 md:grid-cols-[1.1fr_0.9fr] md:pt-20">
          <div className="flex flex-col items-start gap-7">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-accent px-4 py-1.5 text-sm font-semibold shadow-offset-sm">
              <Flame className="size-4 text-primary" />
              Sem comissão por pedido — o cliente é seu
            </span>
            <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-[4.2rem]">
              Cardápio de papel{" "}
              <span className="relative inline-block text-muted-foreground/60 line-through decoration-primary decoration-4">
                morreu
              </span>
              .<br />O seu agora é{" "}
              <span className="relative inline-block">
                <span className="relative z-10">online</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 z-0 h-4 -rotate-1 rounded-sm bg-primary/25"
                />
              </span>
              .
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
              Monte seu cardápio digital em uma noite, cole o QR code na mesa e
              receba pedidos direto no seu painel.{" "}
              <strong className="text-foreground">
                Sem comissão por venda.
              </strong>
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="h-12 rounded-full px-7 text-base font-semibold shadow-offset transition-transform hover:-translate-y-0.5"
                asChild
              >
                <Link href="/cadastro-restaurante">
                  Criar meu cardápio
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-2 border-foreground px-7 text-base font-semibold"
                asChild
              >
                <a
                  href="/r/burguer-do-zeca"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver cardápio de exemplo
                </a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Grátis para sempre no plano inicial · Sem cartão de crédito · No
              ar hoje mesmo
            </p>
          </div>

          <MenuMockup />
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y-2 border-foreground bg-foreground py-3 text-background">
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap font-display text-sm font-semibold uppercase tracking-widest">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="flex items-center gap-8">
              {item}
              <span className="text-primary">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* A conta da comissão */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 md:py-28">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-primary">
            A conta
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            A comissão do marketplace é o prato mais caro do seu cardápio.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Ela não aparece no menu, mas sai de todo pedido. Veja o mesmo mês
            nas duas contas.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border-2 border-foreground bg-card shadow-offset">
          <div className="flex items-center gap-2.5 border-b-2 border-foreground/10 bg-accent px-6 py-4 md:px-8">
            <Flame className="size-4 shrink-0 text-primary" />
            <p className="text-sm">
              Cenário:{" "}
              <strong className="font-semibold">
                {formatBRL(SALES_EXAMPLE)}
              </strong>{" "}
              em vendas no mês
            </p>
          </div>

          <div className="grid divide-y-2 divide-foreground/10 md:grid-cols-2 md:divide-x-2 md:divide-y-0">
            <CostPanel
              label="Marketplace de delivery"
              amount={`− ${formatBRL(commission)}`}
              caption="27% de comissão sobre cada pedido"
              barWidth={100}
              tone="negative"
            />
            <CostPanel
              label="zCardápio"
              amount={
                refPlan ? `− ${formatBRL(refPlan.price)}` : "0% de comissão"
              }
              caption={
                refPlan
                  ? `Mensalidade fixa do plano ${refPlan.name}. Zero por pedido.`
                  : "Mensalidade fixa. Zero por pedido."
              }
              barWidth={
                refPlan
                  ? Math.max(1.2, (refPlan.price / commission) * 100)
                  : 1.2
              }
              tone="positive"
            />
          </div>

          {savings !== null && (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t-2 border-foreground bg-foreground px-6 py-6 text-background md:px-8">
              <span className="text-sm text-background/70">
                Diferença no seu caixa:
              </span>
              <span className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                {formatBRL(savings)}
              </span>
              <span className="text-sm text-background/70">por mês</span>
            </div>
          )}
        </div>

        <p className="mt-4 max-w-2xl text-xs leading-relaxed text-muted-foreground">
          Valores ilustrativos. As comissões dos marketplaces variam conforme o
          plano contratado e a modalidade de entrega — os 27% usados aqui são
          uma média de mercado, não um número oficial de nenhuma plataforma.
        </p>
      </section>

      {/* Como funciona */}
      <section className="border-y-2 border-foreground/10 bg-secondary/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 md:py-28">
          <div className="mb-14 max-w-2xl">
            <p className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-primary">
              Como funciona
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Três passos. Sua loja no ar em minutos.
            </h2>
          </div>

          <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
            {steps.map((step, i) => (
              <li key={step.n} className="relative">
                {i < steps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-16 right-0 top-6 hidden border-t-2 border-dashed border-foreground/20 md:block"
                  />
                )}
                <span className="relative z-10 flex size-12 items-center justify-center rounded-full border-2 border-foreground bg-background font-display font-bold text-primary shadow-offset-sm">
                  {step.n}
                </span>
                <h3 className="mt-6 font-display text-xl font-bold">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features — editorial numbered rows */}
      <section
        id="recursos"
        className="mx-auto w-full max-w-6xl px-4 py-20 md:py-28"
      >
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-primary">
              Recursos
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Feito para quem cozinha,
              <br />
              não para quem programa.
            </h2>
          </div>
          <p className="max-w-xs text-muted-foreground">
            Sem plugin, sem integração paga, sem &ldquo;fale com o
            comercial&rdquo;.
          </p>
        </div>
        <div className="divide-y-2 divide-foreground/10 border-y-2 border-foreground/10">
          {features.map((f) => (
            <div
              key={f.n}
              className="group grid gap-4 py-8 transition-colors md:grid-cols-[80px_56px_1fr] md:items-start md:gap-8"
            >
              <span className="font-display text-2xl font-bold text-muted-foreground/40 transition-colors group-hover:text-primary">
                {f.n}
              </span>
              <span className="flex size-12 items-center justify-center rounded-xl border-2 border-foreground bg-accent transition-transform group-hover:-rotate-6">
                <f.icon className="size-5" />
              </span>
              <div className="max-w-2xl">
                <h3 className="font-display text-xl font-bold">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section
        id="planos"
        className="border-y-2 border-foreground/10 bg-secondary/50"
      >
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-primary">
                Planos
              </p>
              <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                Preço de pastel,
                <br />
                resultado de rodízio.
              </h2>
            </div>
            <p className="max-w-xs text-muted-foreground">
              Mensalidade fixa, zero comissão por pedido. Cancele quando quiser.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col gap-5 rounded-2xl border-2 bg-card p-7",
                  plan.highlighted
                    ? "border-foreground shadow-offset md:-translate-y-3"
                    : "border-foreground/15",
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3.5 left-6 -rotate-2 rounded-md border-2 border-foreground bg-primary px-3 py-0.5 font-display text-xs font-bold uppercase tracking-wider text-primary-foreground">
                    O queridinho
                  </span>
                )}
                <div>
                  <h3 className="font-display text-xl font-bold">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                <p className="font-display text-4xl font-bold">
                  {plan.price === 0 ? "R$ 0" : formatBRL(plan.price)}
                  <span className="text-base font-normal text-muted-foreground">
                    /mês
                  </span>
                </p>
                <ul className="flex-1 space-y-2.5 text-sm">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                        <Check className="size-3 text-primary" />
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  className={cn(
                    "rounded-full font-semibold",
                    !plan.highlighted &&
                      "border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
                  )}
                  asChild
                >
                  <Link href="/cadastro-restaurante">Começar agora</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo */}
      <section
        id="demo"
        className="mx-auto w-full max-w-6xl px-4 py-20 md:py-28"
      >
        <div className="relative overflow-hidden rounded-3xl border-2 border-foreground bg-accent p-10 shadow-offset md:p-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/15 blur-3xl"
          />
          <div className="relative flex flex-col items-start gap-6">
            <p className="font-display text-sm font-bold uppercase tracking-widest text-primary">
              Demo
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Ver vale mais que mil palavras.
            </h2>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Abra um cardápio de exemplo e faça um pedido de teste — exatamente
              como o seu cliente vai fazer. Sem cadastro, sem compromisso.
            </p>
            <Button
              size="lg"
              className="h-12 rounded-full px-7 text-base font-semibold shadow-offset transition-transform hover:-translate-y-0.5"
              asChild
            >
              <a
                href="/r/burguer-do-zeca"
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir cardápio de exemplo
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Dúvidas */}
      <section
        id="duvidas"
        className="border-y-2 border-foreground/10 bg-secondary/50"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <p className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-primary">
                Dúvidas
              </p>
              <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                Perguntas que todo dono faz.
              </h2>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                Ficou faltando alguma? Cria a conta gratuita e testa — não
                pedimos cartão para isso.
              </p>
            </div>

            <div
              className={cn(
                styles.faq,
                "divide-y-2 divide-foreground/10 border-y-2 border-foreground/10",
              )}
            >
              {faq.map((item) => (
                <details key={item.q}>
                  <summary className="flex cursor-pointer list-none items-center gap-4 py-5 [&::-webkit-details-marker]:hidden">
                    <span className="flex-1 font-display font-bold">
                      {item.q}
                    </span>
                    <span
                      className={cn(
                        styles.chevron,
                        "flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-background text-primary transition-transform duration-200",
                      )}
                    >
                      <Plus className="size-4" />
                    </span>
                  </summary>
                  <p className="max-w-xl pb-6 leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t-2 border-foreground bg-foreground text-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-7 px-4 py-20 text-center md:py-28">
          <h2 className="max-w-3xl font-display text-4xl font-bold tracking-tight text-background md:text-6xl">
            Enquanto você lê isso, tem cliente com fome procurando seu cardápio.
          </h2>
          <p className="max-w-md text-lg text-background/70">
            Leva menos de 10 minutos para colocar seu restaurante no ar.
          </p>
          <Button
            size="lg"
            className="h-13 rounded-full px-8 text-base font-semibold shadow-[6px_6px_0_0_var(--primary)] transition-transform hover:-translate-y-0.5"
            asChild
          >
            <Link href="/cadastro-restaurante">
              Criar meu cardápio grátis
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-background/10 px-4 py-8 text-sm md:flex-row">
          <Logo
            className="rounded-xl bg-background/95 px-2.5 py-1.5 shadow-offset-sm"
            imgClassName="h-7 group-hover:scale-100"
          />
          <p>© 2026 zCardápio · zcardapio.com.br</p>
          <div className="flex gap-5">
            <Link href="/login" className="hover:text-background">
              Entrar
            </Link>
            <Link
              href="/cadastro-restaurante"
              className="hover:text-background"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Um lado da comparação de comissão: valor, legenda e barra proporcional. */
function CostPanel({
  label,
  amount,
  caption,
  barWidth,
  tone,
}: {
  label: string;
  amount: string;
  caption: string;
  barWidth: number;
  tone: "negative" | "positive";
}) {
  return (
    <div className="p-6 md:p-8">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      {/* O lado bom fica em `foreground`, não em `primary`: nesta paleta o
          primary (laranja) e o destructive (vermelho) quase não se distinguem, e
          o contraste é justamente o recado da seção. */}
      <p
        className={cn(
          "mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl",
          tone === "negative" ? "text-destructive" : "text-foreground",
        )}
      >
        {amount}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {caption}
      </p>
      <div className="mt-6 h-3 w-full overflow-hidden rounded-full border-2 border-foreground/15 bg-background">
        <div
          className={cn(
            "h-full rounded-full",
            tone === "negative" ? "bg-destructive" : "bg-primary",
          )}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Quanto sai do seu caixa por mês
      </p>
    </div>
  );
}
