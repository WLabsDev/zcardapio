import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces } from "next/font/google";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Gift,
  MapPin,
  Plus,
  QrCode,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { listPlans } from "@/lib/db/queries";
import { formatBRL } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import {
  BrandVisual,
  ChartVisual,
  HeroShowcase,
  OrdersVisual,
  QrVisual,
} from "./showcase";
import styles from "./landing.module.css";

// Serifada só desta página — o resto do app continua com as fontes do layout raiz.
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
  style: ["normal", "italic"],
  variable: "--font-lp-display",
  display: "swap",
});

// Os planos vêm do banco, então a página é renderizada sob demanda (não no build,
// onde o Docker ainda não tem acesso ao banco).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "zCardapio — Um cardápio digital à altura da sua cozinha" },
  description:
    "Monte o cardápio, cole o QR code na mesa e receba os pedidos no painel. Mensalidade fixa, zero comissão por pedido.",
  // Enquanto é só um estudo de design, fica fora da indexação para não competir
  // com a landing oficial nos buscadores.
  robots: { index: false, follow: false },
};

const SALES_EXAMPLE = 20000;
const MARKETPLACE_RATE = 0.27;

const segments = [
  "Hamburguerias",
  "Pizzarias",
  "Sushi bars",
  "Cafeterias",
  "Docerias",
  "Churrascarias",
  "Padarias",
  "Açaiterias",
  "Restaurantes veganos",
  "Pastelarias",
];

const steps = [
  {
    n: "01",
    title: "Monte o cardápio",
    description:
      "Categorias, produtos, fotos, adicionais e preços. Tudo por um painel simples, sem depender de agência nem de programador.",
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

const smallFeatures = [
  {
    icon: Wallet,
    title: "Pix, cartão e dinheiro",
    description:
      "O Pix já sai com QR code e copia-e-cola na tela. Você escolhe quais formas aceita.",
  },
  {
    icon: Gift,
    title: "Cupons e fidelidade",
    description:
      "Crie cupons de desconto e um programa de pontos para o cliente voltar sem depender de anúncio.",
  },
  {
    icon: MapPin,
    title: "Zonas e taxas de entrega",
    description:
      "Defina bairros, valores e tempo estimado. O cálculo aparece pronto no checkout do cliente.",
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

export default async function NewLandingPage() {
  const plans = await listPlans();

  // A comparação de comissão usa o preço real do plano em destaque, para não
  // inventar número nenhum na conta.
  const refPlan =
    plans.find((p) => p.highlighted && p.price > 0) ?? plans.find((p) => p.price > 0);
  const commission = SALES_EXAMPLE * MARKETPLACE_RATE;
  const savings = refPlan ? commission - refPlan.price : null;

  return (
    <div className={cn(styles.page, fraunces.variable, "relative flex min-h-screen flex-col")}>
      {/* Cabeçalho flutuante */}
      <header className="sticky top-0 z-50 pt-3 sm:pt-5">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between gap-4 rounded-full border border-[var(--lp-line)] bg-white/75 pl-5 pr-2 shadow-[var(--lp-shadow-sm)] backdrop-blur-xl">
            <Logo imgClassName="h-7" />
            <nav className="hidden items-center gap-8 text-sm font-medium text-[var(--lp-body)] md:flex">
              <a href="#conta" className="transition-colors hover:text-[var(--lp-ink)]">
                A conta
              </a>
              <a href="#recursos" className="transition-colors hover:text-[var(--lp-ink)]">
                Recursos
              </a>
              <a href="#planos" className="transition-colors hover:text-[var(--lp-ink)]">
                Planos
              </a>
              <a href="#duvidas" className="transition-colors hover:text-[var(--lp-ink)]">
                Dúvidas
              </a>
            </nav>
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2.5 text-sm font-medium text-[var(--lp-body)] transition-colors hover:text-[var(--lp-ink)] sm:block"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro-restaurante"
                className="inline-flex h-11 items-center gap-1.5 rounded-full bg-[var(--lp-navy)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--lp-navy-soft)]"
              >
                Começar grátis
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden className={cn(styles.dots, "pointer-events-none absolute inset-0")} />
          <div aria-hidden className={cn(styles.grain, "pointer-events-none absolute inset-0")} />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-16 px-4 pb-24 pt-16 md:pb-28 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
            <div className="flex flex-col items-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--lp-line)] bg-white/70 py-1.5 pl-2 pr-4 text-xs font-medium text-[var(--lp-body)] shadow-[var(--lp-shadow-sm)]">
                <span className="rounded-full bg-[var(--lp-accent)] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-white">
                  0% comissão
                </span>
                O cliente é seu, o lucro também
              </span>

              <h1
                className={cn(
                  styles.display,
                  "mt-7 text-[clamp(2.7rem,7vw,4.3rem)] font-normal leading-[0.98] tracking-[-0.02em] text-[var(--lp-ink)]"
                )}
              >
                Um cardápio digital{" "}
                <em className="relative not-italic">
                  <span className="relative z-10 italic">à altura</span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-1.5 z-0 h-3 -rotate-[0.6deg] rounded-full bg-[var(--lp-accent)]/25"
                  />
                </em>{" "}
                da sua cozinha.
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--lp-body)]">
                Monte o cardápio, cole o QR code na mesa e receba os pedidos direto no painel.
                Mensalidade fixa, sem comissão por venda e com a sua marca no lugar da nossa.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="/cadastro-restaurante"
                  className="group inline-flex h-13 items-center gap-2 rounded-full bg-[var(--lp-accent)] px-7 text-[0.95rem] font-semibold text-white shadow-[0_10px_28px_-10px_rgba(233,85,42,0.85)] transition-all hover:-translate-y-0.5 hover:bg-[var(--lp-accent-dark)]"
                >
                  Criar meu cardápio grátis
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="/r/burguer-do-zeca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-13 items-center gap-2 rounded-full border border-[var(--lp-line)] bg-white px-6 text-[0.95rem] font-semibold text-[var(--lp-ink)] shadow-[var(--lp-shadow-sm)] transition-colors hover:bg-[var(--lp-bg-soft)]"
                >
                  Ver exemplo ao vivo
                  <ArrowUpRight className="size-4" />
                </a>
              </div>

              <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--lp-muted)]">
                {["Plano inicial gratuito", "Sem cartão de crédito", "No ar hoje mesmo"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <Check className="size-3.5 text-[var(--lp-mint)]" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            <HeroShowcase />
          </div>
        </section>

        {/* Segmentos */}
        <section className="overflow-hidden border-y border-[var(--lp-line)] bg-[var(--lp-bg-soft)] py-5">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-sm font-medium uppercase tracking-[0.16em] text-[var(--lp-muted)]">
            {[...segments, ...segments].map((item, i) => (
              <span key={i} className="flex items-center gap-10">
                {item}
                <span className="text-[var(--lp-accent)]">◆</span>
              </span>
            ))}
          </div>
        </section>

        {/* A conta da comissão */}
        <section id="conta" className="mx-auto w-full max-w-6xl px-4 py-24 md:py-32">
          <div className="max-w-2xl">
            <Eyebrow>A conta</Eyebrow>
            <h2
              className={cn(
                styles.display,
                "mt-4 text-[clamp(2rem,4.6vw,3.25rem)] font-normal leading-[1.04] tracking-[-0.02em] text-[var(--lp-ink)]"
              )}
            >
              A comissão do marketplace é o prato mais caro do seu cardápio.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--lp-body)]">
              Ela não aparece no menu, mas sai de todo pedido. Veja o mesmo mês nas duas
              contas.
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-3xl border border-[var(--lp-line)] bg-white shadow-[var(--lp-shadow)]">
            <div className="flex items-center gap-3 border-b border-[var(--lp-line-soft)] bg-[var(--lp-bg)] px-6 py-4 sm:px-8">
              <Sparkles className="size-4 text-[var(--lp-accent)]" />
              <p className="text-sm font-medium text-[var(--lp-body)]">
                Cenário:{" "}
                <strong className="font-semibold text-[var(--lp-ink)]">
                  {formatBRL(SALES_EXAMPLE)}
                </strong>{" "}
                em vendas no mês
              </p>
            </div>

            <div className="grid divide-y divide-[var(--lp-line-soft)] md:grid-cols-2 md:divide-x md:divide-y-0">
              <CostPanel
                label="Marketplace de delivery"
                amount={`− ${formatBRL(commission)}`}
                caption="27% de comissão sobre cada pedido"
                barWidth={100}
                tone="negative"
              />
              <CostPanel
                label="zCardapio"
                amount={refPlan ? `− ${formatBRL(refPlan.price)}` : "0% de comissão"}
                caption={
                  refPlan
                    ? `Mensalidade fixa do plano ${refPlan.name}. Zero por pedido.`
                    : "Mensalidade fixa. Zero por pedido."
                }
                barWidth={refPlan ? Math.max(1.2, (refPlan.price / commission) * 100) : 1.2}
                tone="positive"
              />
            </div>

            {savings !== null && (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-[var(--lp-line-soft)] bg-[var(--lp-navy)] px-6 py-6 text-white sm:px-8">
                <span className="text-sm text-white/70">Diferença no seu caixa:</span>
                <span
                  className={cn(
                    styles.display,
                    "text-3xl font-normal tracking-tight text-white sm:text-4xl"
                  )}
                >
                  {formatBRL(savings)}
                </span>
                <span className="text-sm text-white/70">por mês</span>
              </div>
            )}
          </div>

          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-[var(--lp-muted)]">
            Valores ilustrativos. As comissões dos marketplaces variam conforme o plano
            contratado e a modalidade de entrega — os 27% usados aqui são uma média de mercado,
            não um número oficial de nenhuma plataforma.
          </p>
        </section>

        {/* Como funciona */}
        <section className="border-y border-[var(--lp-line)] bg-[var(--lp-bg-soft)]">
          <div className="mx-auto w-full max-w-6xl px-4 py-24 md:py-32">
            <div className="max-w-2xl">
              <Eyebrow>Como funciona</Eyebrow>
              <h2
                className={cn(
                  styles.display,
                  "mt-4 text-[clamp(2rem,4.6vw,3.25rem)] font-normal leading-[1.04] tracking-[-0.02em] text-[var(--lp-ink)]"
                )}
              >
                Três passos. Nenhum deles envolve programar.
              </h2>
            </div>

            <ol className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
              {steps.map((step, i) => (
                <li key={step.n} className="relative">
                  {i < steps.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-16 right-0 top-6 hidden border-t border-dashed border-[var(--lp-line)] md:block"
                    />
                  )}
                  <span
                    className={cn(
                      styles.displaySm,
                      "relative z-10 flex size-12 items-center justify-center rounded-full border border-[var(--lp-line)] bg-white text-base text-[var(--lp-accent)] shadow-[var(--lp-shadow-sm)]"
                    )}
                  >
                    {step.n}
                  </span>
                  <h3 className="mt-6 text-lg font-semibold text-[var(--lp-ink)]">{step.title}</h3>
                  <p className="mt-2.5 max-w-sm leading-relaxed text-[var(--lp-body)]">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Recursos */}
        <section id="recursos" className="mx-auto w-full max-w-6xl px-4 py-24 md:py-32">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow>Recursos</Eyebrow>
              <h2
                className={cn(
                  styles.display,
                  "mt-4 text-[clamp(2rem,4.6vw,3.25rem)] font-normal leading-[1.04] tracking-[-0.02em] text-[var(--lp-ink)]"
                )}
              >
                Tudo que o salão e a cozinha precisam.
              </h2>
            </div>
            <p className="max-w-xs text-[var(--lp-body)]">
              Sem plugin, sem integração paga, sem &ldquo;fale com o comercial&rdquo;.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-6">
            <FeatureCard className="md:col-span-4">
              <div className="flex-1">
                <FeatureTitle>Com a sua cara, não com a nossa</FeatureTitle>
                <FeatureText>
                  Logo, cores, capa e fotos. O cardápio ganha um endereço próprio e a aparência
                  do seu restaurante — ninguém precisa saber que existe um sistema por trás.
                </FeatureText>
              </div>
              <BrandVisual />
            </FeatureCard>

            <FeatureCard className="md:col-span-2">
              <div className="flex-1">
                <FeatureTitle>Um QR code por mesa</FeatureTitle>
                <FeatureText>
                  Imprima a folha de QR codes direto do painel. O pedido já chega com o número
                  da mesa.
                </FeatureText>
              </div>
              <div className="pb-4 pt-2">
                <QrVisual />
              </div>
            </FeatureCard>

            <FeatureCard className="md:col-span-3">
              <div className="flex-1">
                <FeatureTitle>Pedidos em tempo real</FeatureTitle>
                <FeatureText>
                  A fila atualiza sozinha, com aviso sonoro e cupom para a cozinha. O cliente
                  acompanha o status pelo celular.
                </FeatureText>
              </div>
              <OrdersVisual />
            </FeatureCard>

            <FeatureCard className="md:col-span-3">
              <div className="flex-1">
                <FeatureTitle>Relatórios que cabem no bolso</FeatureTitle>
                <FeatureText>
                  Produto que mais sai, horário de pico e ticket médio. Dados para ajustar o
                  cardápio sem achismo.
                </FeatureText>
              </div>
              <ChartVisual />
            </FeatureCard>

            {smallFeatures.map((feature) => (
              <FeatureCard key={feature.title} className="md:col-span-2">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--lp-accent-tint)] text-[var(--lp-accent)]">
                  <feature.icon className="size-5" />
                </span>
                <div>
                  <FeatureTitle>{feature.title}</FeatureTitle>
                  <FeatureText>{feature.description}</FeatureText>
                </div>
              </FeatureCard>
            ))}
          </div>
        </section>

        {/* Planos */}
        <section
          id="planos"
          className="border-y border-[var(--lp-line)] bg-[var(--lp-bg-soft)]"
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-24 md:py-32">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <Eyebrow>Planos</Eyebrow>
                <h2
                  className={cn(
                    styles.display,
                    "mt-4 text-[clamp(2rem,4.6vw,3.25rem)] font-normal leading-[1.04] tracking-[-0.02em] text-[var(--lp-ink)]"
                  )}
                >
                  Mensalidade fixa. Sem surpresa no fim do mês.
                </h2>
              </div>
              <p className="max-w-xs text-[var(--lp-body)]">
                Comece no plano gratuito e mude quando o movimento pedir. Cancele quando quiser.
              </p>
            </div>

            <div className="mt-14 grid items-start gap-5 md:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col gap-6 rounded-3xl border p-7",
                    plan.highlighted
                      ? "border-transparent bg-[var(--lp-navy)] text-white shadow-[var(--lp-shadow-lg)] md:-translate-y-4 md:pb-9 md:pt-9"
                      : "border-[var(--lp-line)] bg-white shadow-[var(--lp-shadow-sm)]"
                  )}
                >
                  {plan.highlighted && (
                    <span className="absolute right-6 top-7 rounded-full bg-[var(--lp-accent)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-white">
                      Mais escolhido
                    </span>
                  )}

                  <div>
                    <h3
                      className={cn(
                        "text-lg font-semibold",
                        plan.highlighted ? "text-white" : "text-[var(--lp-ink)]"
                      )}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={cn(
                        "mt-1.5 text-sm leading-relaxed",
                        plan.highlighted ? "text-white/65" : "text-[var(--lp-muted)]"
                      )}
                    >
                      {plan.description}
                    </p>
                  </div>

                  <p className="flex items-baseline gap-1.5">
                    <span
                      className={cn(
                        styles.display,
                        "text-[2.6rem] font-normal leading-none tracking-tight",
                        plan.highlighted ? "text-white" : "text-[var(--lp-ink)]"
                      )}
                    >
                      {plan.price === 0 ? "Grátis" : formatBRL(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span
                        className={cn(
                          "text-sm",
                          plan.highlighted ? "text-white/60" : "text-[var(--lp-muted)]"
                        )}
                      >
                        /mês
                      </span>
                    )}
                  </p>

                  <ul className="flex-1 space-y-3 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <span
                          className={cn(
                            "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full",
                            plan.highlighted
                              ? "bg-white/15 text-white"
                              : "bg-[var(--lp-mint-tint)] text-[var(--lp-mint)]"
                          )}
                        >
                          <Check className="size-3" />
                        </span>
                        <span className={plan.highlighted ? "text-white/85" : undefined}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/cadastro-restaurante"
                    className={cn(
                      "inline-flex h-12 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                      plan.highlighted
                        ? "bg-[var(--lp-accent)] text-white hover:bg-[var(--lp-accent-dark)]"
                        : "border border-[var(--lp-line)] bg-white text-[var(--lp-ink)] hover:bg-[var(--lp-bg-soft)]"
                    )}
                  >
                    {plan.price === 0 ? "Começar de graça" : "Assinar o plano"}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dúvidas */}
        <section id="duvidas" className="mx-auto w-full max-w-6xl px-4 py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <Eyebrow>Dúvidas</Eyebrow>
              <h2
                className={cn(
                  styles.display,
                  "mt-4 text-[clamp(2rem,4.6vw,3.25rem)] font-normal leading-[1.04] tracking-[-0.02em] text-[var(--lp-ink)]"
                )}
              >
                Perguntas que todo dono faz.
              </h2>
              <p className="mt-5 leading-relaxed text-[var(--lp-body)]">
                Ficou faltando alguma? Cria a conta gratuita e testa — não pedimos cartão para
                isso.
              </p>
            </div>

            <div className={cn(styles.faq, "divide-y divide-[var(--lp-line)] border-y border-[var(--lp-line)]")}>
              {faq.map((item) => (
                <details key={item.q} className="group">
                  <summary className="flex cursor-pointer items-center gap-4 py-5 text-left">
                    <span className="flex-1 font-medium text-[var(--lp-ink)]">{item.q}</span>
                    <span
                      className={cn(
                        styles.chevron,
                        "flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--lp-line)] text-[var(--lp-accent)] transition-transform duration-200"
                      )}
                    >
                      <Plus className="size-4" />
                    </span>
                  </summary>
                  <p className="max-w-xl pb-6 leading-relaxed text-[var(--lp-body)]">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Chamada final */}
        <section className="px-4 pb-24 md:pb-32">
          <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] bg-[var(--lp-navy)] px-6 py-20 text-center sm:px-12 md:py-28">
            <div aria-hidden className={cn(styles.ctaGlow, "pointer-events-none absolute inset-0")} />
            <div aria-hidden className={cn(styles.grain, "pointer-events-none absolute inset-0")} />
            <div className="relative mx-auto flex max-w-2xl flex-col items-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/75">
                <QrCode className="size-3.5" />
                Leva menos de uma tarde para publicar
              </span>
              <h2
                className={cn(
                  styles.display,
                  "mt-7 text-[clamp(2.2rem,5.2vw,3.6rem)] font-normal leading-[1.03] tracking-[-0.02em] text-white"
                )}
              >
                Seu próximo cliente já está com o celular na mão.
              </h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-white/70">
                Crie o cardápio hoje, cole o QR na mesa amanhã e pare de dividir o seu prato com
                o intermediário.
              </p>
              <Link
                href="/cadastro-restaurante"
                className="group mt-9 inline-flex h-13 items-center gap-2 rounded-full bg-[var(--lp-accent)] px-8 text-[0.95rem] font-semibold text-white shadow-[0_14px_34px_-12px_rgba(233,85,42,0.9)] transition-all hover:-translate-y-0.5 hover:bg-[var(--lp-accent-dark)]"
              >
                Criar meu cardápio grátis
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <p className="mt-4 text-sm text-white/50">
                Plano inicial gratuito · Sem cartão de crédito
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="border-t border-[var(--lp-line)] bg-[var(--lp-bg-soft)]">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xs">
              <Logo imgClassName="h-8" />
              <p className="mt-4 text-sm leading-relaxed text-[var(--lp-muted)]">
                Cardápio digital, QR code na mesa e pedidos online para restaurantes que
                preferem manter os próprios clientes.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-10 text-sm sm:gap-16">
              <FooterColumn title="Produto">
                <FooterLink href="#recursos">Recursos</FooterLink>
                <FooterLink href="#planos">Planos</FooterLink>
                <FooterLink href="#duvidas">Dúvidas</FooterLink>
              </FooterColumn>
              <FooterColumn title="Conta">
                <FooterLink href="/login">Entrar</FooterLink>
                <FooterLink href="/cadastro-restaurante">Criar conta</FooterLink>
                <FooterLink href="/r/burguer-do-zeca">Cardápio de exemplo</FooterLink>
              </FooterColumn>
            </div>
          </div>
          <div className="mt-12 border-t border-[var(--lp-line)] pt-6 text-xs text-[var(--lp-muted)]">
            © 2026 zCardapio · zcardapio.com.br
          </div>
        </div>
      </footer>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lp-accent)]">
      <span className="h-px w-6 bg-[var(--lp-accent)]" />
      {children}
    </p>
  );
}

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
  const accent = tone === "negative" ? "var(--lp-accent)" : "var(--lp-mint)";
  return (
    <div className="p-6 sm:p-8">
      <p className="text-sm font-medium text-[var(--lp-muted)]">{label}</p>
      <p
        className={cn(
          styles.display,
          "mt-3 text-[clamp(2.1rem,5vw,3rem)] font-normal leading-none tracking-tight"
        )}
        style={{ color: accent }}
      >
        {amount}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-[var(--lp-body)]">{caption}</p>
      <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-[var(--lp-bg-soft)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${barWidth}%`, backgroundColor: accent }}
        />
      </div>
      <p className="mt-2 text-xs text-[var(--lp-muted)]">Quanto sai do seu caixa por mês</p>
    </div>
  );
}

function FeatureCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-3xl border border-[var(--lp-line)] bg-white p-7 shadow-[var(--lp-shadow-sm)] transition-shadow hover:shadow-[var(--lp-shadow)]",
        className
      )}
    >
      {children}
    </div>
  );
}

function FeatureTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-[var(--lp-ink)]">{children}</h3>;
}

function FeatureText({ children }: { children: React.ReactNode }) {
  return <p className="mt-2.5 leading-relaxed text-[var(--lp-body)]">{children}</p>;
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-[var(--lp-ink)]">{title}</p>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-[var(--lp-muted)] transition-colors hover:text-[var(--lp-ink)]"
      >
        {children}
      </Link>
    </li>
  );
}
