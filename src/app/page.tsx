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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { PhoneMockup } from "@/components/phone-mockup";
import { listPlans } from "@/lib/db/queries";
import { formatBRL } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

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
      "Imprima o QR code, cole na mesa e pronto: o cliente abre, escolhe e pede. Você só vê o pedido chegar organizado no painel.",
  },
  {
    n: "03",
    icon: ShoppingBag,
    title: "Carrinho de verdade, sem taxa por pedido",
    description:
      "Diferente dos marketplaces, aqui o cliente é seu. Nada de comissão de 25% — você paga uma mensalidade fixa e o resto é lucro.",
  },
  {
    n: "04",
    icon: Palette,
    title: "Com a sua identidade, não a nossa",
    description:
      "Logo, cores, capa e fotos: o cardápio fica com a cara do seu negócio. Ninguém precisa saber que existe um sistema por trás.",
  },
  {
    n: "05",
    icon: BarChart3,
    title: "Números que ajudam a decidir",
    description:
      "Produto que mais sai, horário de pico, ticket médio. Relatórios simples para você ajustar o cardápio com base em dados, não em achismo.",
  },
];

export default async function LandingPage() {
  const plans = await listPlans();
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-foreground/10 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <a href="#recursos" className="hover:text-primary">Recursos</a>
            <a href="#planos" className="hover:text-primary">Planos</a>
            <a href="#demo" className="hover:text-primary">Demo</a>
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
              .<br />
              O seu agora é{" "}
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
              <strong className="text-foreground">Sem comissão por venda.</strong>
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
                <a href="/r/burguer-do-zeca" target="_blank" rel="noopener noreferrer">
                  Ver cardápio de exemplo
                </a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Grátis para sempre no plano inicial · Sem cartão de crédito
            </p>
          </div>

          <PhoneMockup compact />
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

      {/* Features — editorial numbered rows */}
      <section id="recursos" className="mx-auto w-full max-w-6xl px-4 py-20 md:py-28">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-primary">
            Recursos
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Feito para quem cozinha,
            <br />
            não para quem programa.
          </h2>
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
      <section id="planos" className="border-y-2 border-foreground/10 bg-secondary/50">
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
                    : "border-foreground/15"
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3.5 left-6 -rotate-2 rounded-md border-2 border-foreground bg-primary px-3 py-0.5 font-display text-xs font-bold uppercase tracking-wider text-primary-foreground">
                    O queridinho
                  </span>
                )}
                <div>
                  <h3 className="font-display text-xl font-bold">{plan.name}</h3>
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
                      "border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background"
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
      <section id="demo" className="mx-auto w-full max-w-6xl px-4 py-20 md:py-28">
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
              <a href="/r/burguer-do-zeca" target="_blank" rel="noopener noreferrer">
                Abrir cardápio de exemplo
                <ArrowRight className="size-4" />
              </a>
            </Button>
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
          <p>© 2026 zCardapio · zcardapio.com.br</p>
          <div className="flex gap-5">
            <Link href="/login" className="hover:text-background">Entrar</Link>
            <Link href="/cadastro-restaurante" className="hover:text-background">Criar conta</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
