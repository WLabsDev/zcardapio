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
  X,
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
      "Cadastre os produtos e ganhe um link com a cara do seu restaurante: seurestaurante.zcardapio.com.br. Sem app para o cliente baixar, sem ter que dar zoom em foto no celular.",
  },
  {
    n: "02",
    icon: QrCode,
    title: "QR code na mesa, pedido no painel",
    description:
      "Imprima o QR code, cole na mesa e pronto: o cliente abre, escolhe e pede. O estoque some do cardápio quando acaba e volta sozinho se o pedido for cancelado.",
  },
  {
    n: "03",
    icon: ShoppingBag,
    title: "Carrinho de verdade, sem erros",
    description:
      "Esqueça textos longos e confusos no WhatsApp. O cliente clica, marca as opções (ex.: “sem cebola”, “ponto da carne”) e o sistema organiza tudo. Você paga apenas uma mensalidade fixa e tem controle total.",
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
      "A fila atualiza sozinha, com aviso sonoro e cupom térmico (58 ou 80 mm) pronto para a impressora da cozinha. O pedido novo também pode chegar direto no seu WhatsApp, organizado e fácil de ler.",
  },
  {
    n: "07",
    icon: Wallet,
    title: "Pagamento direto na sua conta",
    description:
      "Sem taxas ocultas ou intermediários prendendo seu dinheiro. O Pix já sai com QR code e copia-e-cola na tela final do cliente. Ele paga no banco dele, te envia o comprovante (no balcão ou via WhatsApp), você valida e libera o pedido.",
  },
  {
    n: "08",
    icon: Gift,
    title: "Cupons e fidelidade",
    description:
      "Crie cupons de desconto e um programa de fidelidade com pontos ou carimbos para o cliente voltar sempre, sem precisar imprimir cartõezinhos de papel.",
  },
  {
    n: "09",
    icon: MapPin,
    title: "Zonas e taxas de entrega automáticas",
    description:
      "Defina bairros, valores de entrega e tempo estimado. O cálculo aparece pronto no checkout do cliente, eliminando a necessidade de ficar combinando frete pelo chat.",
  },
];

/** Os dois lados da seção "A conta": o processo de hoje contra o do zCardápio. */
const oldFlow = [
  "O cliente pede o cardápio.",
  "Você envia um PDF pesado ou uma foto ruim de ler.",
  "Ele digita o pedido (às vezes faltando informações).",
  "Você calcula o valor total na calculadora.",
  "Você pergunta o endereço para calcular a taxa de entrega.",
  "Manda a chave Pix e fica esperando o comprovante.",
];

const newFlow = [
  "O cliente clica no seu link ou lê o QR code.",
  "Ele mesmo navega, escolhe os adicionais e monta o carrinho.",
  "O sistema calcula o total e a taxa de entrega automaticamente.",
  "A chave Pix (copia e cola) já aparece na tela dele.",
  "O pedido chega 100% detalhado no seu painel e WhatsApp. Você só confere o comprovante e manda pra cozinha.",
];

const steps = [
  {
    n: "01",
    title: "Monte o cardápio",
    description:
      "Categorias, produtos, fotos, adicionais e preços. Tudo por um painel simples e intuitivo, sem depender de agência ou designer.",
  },
  {
    n: "02",
    title: "Espalhe o link e o QR",
    description:
      "Cole o QR code na mesa, coloque o link na bio do Instagram e na resposta automática do WhatsApp. Pronto: você tem uma vitrine aberta 24 horas, muito mais leve que um PDF.",
  },
  {
    n: "03",
    title: "Receba e despache",
    description:
      "Os pedidos caem organizados no painel e no seu WhatsApp, já com o valor total e a taxa de entrega calculados. O cliente faz o Pix, você confere o comprovante e manda a via para a cozinha. O status de preparo ele acompanha pelo próprio celular.",
  },
];

const faq = [
  {
    q: "Meu cliente precisa instalar algum aplicativo?",
    a: "Não. O cardápio abre direto no navegador do celular do cliente, seja lendo o QR code na mesa ou clicando no seu link do WhatsApp/Instagram. É leve e rápido.",
  },
  {
    q: "O cliente precisa criar conta para pedir?",
    a: "De forma alguma. Ele só preenche o nome e os dados de entrega no final do pedido, de forma super rápida, sem criar senhas.",
  },
  {
    q: "Como o cliente paga?",
    a: "O sistema automatiza a apresentação do valor. No checkout, ele exibe o total (já com taxa de entrega) e a sua chave Pix (QR code ou copia e cola). O cliente paga no aplicativo do banco dele e você só confere o comprovante antes de iniciar o preparo. Sem taxas de transação ou maquininhas virtuais cobrando porcentagens.",
  },
  {
    q: "Funciona para mesa, balcão e delivery?",
    a: "Sim! Você pode configurar opções para o cliente escolher se está na mesa (e pedir o número dela), se vai retirar no balcão ou se é para entrega no endereço dele.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Com certeza. Não temos fidelidade ou multas rescisórias.",
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
            <Link href="/blog" className="hover:text-primary">
              Blog
            </Link>
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
            <span className="inline-flex items-start gap-2 rounded-full border-2 border-foreground bg-accent px-4 py-1.5 text-sm font-semibold shadow-offset-sm">
              <Flame className="mt-0.5 size-4 shrink-0 text-primary" />
              Chega de enviar PDF no WhatsApp. O cliente é seu, o controle
              também.
            </span>
            {/* Os destaques são inline (não inline-block) porque a frase é longa
                e precisa quebrar em qualquer ponto: com inline-block o trecho
                inteiro pulava de linha e o ponto final ficava órfão. */}
            <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight md:text-[3.1rem]">
              O cardápio de papel e a foto na galeria{" "}
              <span className="text-muted-foreground/60 line-through decoration-primary decoration-4">
                ficaram no passado
              </span>
              . O seu agora é{" "}
              <span className="box-decoration-clone rounded-sm bg-primary/25 px-1">
                profissional e interativo
              </span>
              .
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
              Monte seu cardápio digital em uma noite, coloque o link na bio ou
              o QR code na mesa, e receba pedidos já calculados direto no seu
              painel.{" "}
              <strong className="text-foreground">
                Sem confusão no chat, sem calcular troco na mão.
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
      <p className="border-t-2 border-foreground/10 bg-secondary/50 px-4 py-4 text-center font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
        QR na mesa, pedido mastigado no WhatsApp e na cozinha
      </p>
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

      {/* A conta — o processo de hoje contra o do zCardápio */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 md:py-28">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-primary">
            A conta
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Atender por PDF e WhatsApp tira o seu tempo e a paciência do
            cliente.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            O tempo que você gasta calculando frete e anotando pedido na mão é o
            tempo que seu pedido demora a sair. Veja a diferença na prática:
          </p>
        </div>

        <div className="grid items-start gap-6 md:grid-cols-2">
          <FlowPanel
            label="O jeito antigo (WhatsApp + imagem/PDF)"
            steps={oldFlow}
            footer="Tempo perdido: 5 a 15 minutos por cliente. Chance de erro humano alta."
            tone="negative"
          />
          <FlowPanel
            label="O jeito zCardápio"
            steps={newFlow}
            footer="Tempo perdido: zero. Tudo automático."
            tone="positive"
          />
        </div>
      </section>

      {/* Como funciona */}
      <section className="border-y-2 border-foreground/10 bg-secondary/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 md:py-28">
          <div className="mb-14 max-w-2xl">
            <p className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-primary">
              Como funciona
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Três passos. Seu restaurante moderno em minutos.
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
              Feito para quem quer agilidade na cozinha e no atendimento.
            </h2>
          </div>
          <p className="max-w-xs text-muted-foreground">
            Sem plugin complicado, sem mensalidades abusivas, sem &ldquo;fale
            com o comercial&rdquo;.
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
              Mensalidade fixa. Cancele quando quiser.
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
              Abra um cardápio de exemplo e simule um pedido — exatamente como o
              seu cliente vai fazer. Sem cadastro, sem compromisso. Descubra
              como é mais fácil do que ler um PDF.
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
                Perguntas que todo dono de restaurante faz.
              </h2>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                Ficou faltando alguma? Crie a conta gratuita e teste — não
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
            Enquanto você lê isso, tem cliente tentando dar zoom no seu cardápio
            em PDF.
          </h2>
          <p className="max-w-md text-lg text-background/70">
            Leva menos de 10 minutos para colocar seu restaurante no ar de forma
            profissional.
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
            <Link href="/blog" className="hover:text-background">
              Blog
            </Link>
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

/** Um lado da comparação: o passo a passo do atendimento e o custo em tempo. */
function FlowPanel({
  label,
  steps: flow,
  footer,
  tone,
}: {
  label: string;
  steps: string[];
  footer: string;
  tone: "negative" | "positive";
}) {
  const negative = tone === "negative";
  return (
    // O lado bom ganha a borda cheia e a sombra; o antigo fica apagado de
    // propósito — o contraste é o recado da seção.
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border-2 bg-card",
        negative ? "border-foreground/15" : "border-foreground shadow-offset",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 border-b-2 border-foreground/10 px-6 py-4",
          !negative && "bg-accent",
        )}
      >
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full",
            negative
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/15 text-primary",
          )}
        >
          {negative ? <X className="size-3.5" /> : <Check className="size-3.5" />}
        </span>
        <p className="font-display font-bold">{label}</p>
      </div>

      <ol className="flex-1 space-y-3.5 px-6 py-6">
        {flow.map((item, i) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed">
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border text-[0.65rem] font-bold",
                negative
                  ? "border-foreground/15 text-muted-foreground"
                  : "border-foreground bg-background text-primary",
              )}
            >
              {i + 1}
            </span>
            <span className={negative ? "text-muted-foreground" : undefined}>
              {item}
            </span>
          </li>
        ))}
      </ol>

      <p
        className={cn(
          "border-t-2 border-foreground/10 px-6 py-4 text-sm font-semibold",
          negative ? "text-destructive" : "bg-foreground text-background",
        )}
      >
        {footer}
      </p>
    </div>
  );
}
