"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Check,
  CheckCircle2,
  Copy,
  MapPin,
  MessageCircle,
  Plus,
  ShoppingBag,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { itemUnitPrice, useCart } from "@/components/cart/cart-context";
import { formatBRL, type DeliveryZone, type PaymentMethod, type Restaurant } from "@/lib/mock/types";
import { isDarkTheme, restaurantThemeVars } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { copyText } from "@/lib/clipboard";
import { findZoneForAddress } from "@/lib/delivery-zones";
import { formatPhone, normalizePhone, whatsappLink } from "@/lib/phone";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: "Pix",
  cartao: "Cartão na entrega",
  dinheiro: "Dinheiro",
};

/** Ordem de exibição no checkout — Pix primeiro, independente da ordem salva. */
const PAYMENT_ORDER: PaymentMethod[] = ["pix", "cartao", "dinheiro"];

type SavedAddress = {
  id: string;
  label: string;
  address: string;
  isMain: boolean;
};

/**
 * O checkout é um passo a passo: uma pergunta de cada vez, com o resumo sempre
 * à vista. "endereco" some quando é retirada; "entrega" some quando o pedido
 * veio do QR da mesa (o tipo já está decidido).
 */
type StepId = "contato" | "entrega" | "endereco" | "pagamento" | "revisao";

/**
 * O que fica guardado no navegador enquanto o pedido não é enviado. Voltar ao
 * cardápio para incluir mais um item é comum no meio do checkout — sem isso o
 * cliente reencontraria o formulário em branco.
 */
type CheckoutDraft = {
  step: StepId;
  name: string;
  phone: string;
  deliveryType: "entrega" | "retirada" | "mesa";
  street: string;
  district: string;
  city: string;
  complement: string;
  selectedAddressId: string | null;
  useNewAddress: boolean;
  saveAddress: boolean;
  addressLabel: string;
  payment: PaymentMethod;
  couponInput: string;
  coupon: { code: string; type: "percent" | "fixed"; value: number } | null;
  scheduledFor: string;
};

function readDraft(storageKey: string): Partial<CheckoutDraft> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Partial<CheckoutDraft>) : null;
  } catch {
    return null;
  }
}

const STEP_TITLES: Record<StepId, string> = {
  contato: "Seus dados",
  entrega: "Como quer receber?",
  endereco: "Onde entregamos?",
  pagamento: "Pagamento",
  revisao: "Confira e envie",
};

/** Rótulo curto do indicador — o título da etapa é longo demais para caber. */
const STEP_LABELS: Record<StepId, string> = {
  contato: "Dados",
  entrega: "Entrega",
  endereco: "Endereço",
  pagamento: "Pagamento",
  revisao: "Revisão",
};

function StepIndicator({
  steps,
  current,
  onSelect,
}: {
  steps: StepId[];
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    // O CardHeader é um grid e o item nasce com min-width:auto — sem o min-w-0
    // aqui (e no <li>) a régua não encolhe e vaza a borda direita do card.
    <div className="min-w-0">
      <ol className="flex items-center gap-1.5">
        {steps.map((id, index) => {
          const done = index < current;
          const active = index === current;
          return (
            // min-w-0 é obrigatório: sem ele o item não encolhe abaixo do
            // tamanho do rótulo e a régua vaza a borda direita do card.
            <li key={id} className="flex min-w-0 flex-1 items-center gap-1.5">
              <button
                type="button"
                // Só dá para voltar: pular etapa à frente burlaria a validação.
                disabled={index >= current}
                onClick={() => onSelect(index)}
                aria-current={active ? "step" : undefined}
                className="flex min-w-0 flex-1 flex-col gap-1.5 text-left disabled:cursor-default"
              >
                <span
                  className={cn(
                    "h-1.5 w-full rounded-full transition-colors",
                    done || active ? "bg-primary" : "bg-foreground/15"
                  )}
                />
                {/* Cada item ocupa 1/5 da largura e o rótulo precisa caber
                    nesse espaço — por isso sem ícone de check aqui: quem diz
                    "concluído" é a barra preenchida acima. */}
                <span
                  className={cn(
                    "hidden truncate text-[11px] font-medium tracking-tight sm:block",
                    active
                      ? "text-heading"
                      : done
                        ? "text-muted-foreground"
                        : "text-muted-foreground/60"
                  )}
                >
                  {STEP_LABELS[id]}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-1.5 text-xs text-muted-foreground sm:hidden">
        Etapa {current + 1} de {steps.length} · {STEP_LABELS[steps[current]]}
      </p>
    </div>
  );
}

/** Linha "campo · valor · alterar" da etapa de revisão. */
function ReviewRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium text-heading">{value}</div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 text-xs font-semibold text-primary hover:underline"
      >
        Alterar
      </button>
    </div>
  );
}

export function CheckoutView({
  restaurant,
  initiallyOpen,
  zones,
  tableNumber = null,
}: {
  restaurant: Restaurant;
  initiallyOpen: boolean;
  zones: DeliveryZone[];
  tableNumber?: number | null;
}) {
  const closed = !initiallyOpen;
  const acceptedPayments: PaymentMethod[] = PAYMENT_ORDER.filter((m) =>
    restaurant.paymentMethods?.length
      ? restaurant.paymentMethods.includes(m)
      : true
  );
  const cart = useCart();
  const [deliveryType, setDeliveryType] = useState<
    "entrega" | "retirada" | "mesa"
  >(tableNumber ? "mesa" : "entrega");
  const [done, setDone] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    code: string;
    total: number;
    pix: { brCode: string; qrImage: string } | null;
  } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [complement, setComplement] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>(acceptedPayments[0]);
  const [sending, setSending] = useState(false);
  // Passo a passo
  const [step, setStep] = useState<StepId>("contato");
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Cupom
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; type: "percent" | "fixed"; value: number } | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  // Agendamento
  const [scheduledFor, setScheduledFor] = useState("");
  // Dados do cliente logado (auto-preenchimento) e endereços salvos
  const [loggedIn, setLoggedIn] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);

  const draftKey = `zcardapio:checkout:${restaurant.slug}`;

  // Restaura o rascunho. Só depois de montar, para o primeiro render bater com
  // o HTML do servidor (mesmo motivo do carrinho em cart-context).
  useEffect(() => {
    // O rascunho só pode ser lido depois da montagem (localStorage não existe
    // no servidor), então preencher o formulário aqui é inevitável. Os setState
    // abaixo rodam no mesmo passe e o React os agrupa num único re-render — a
    // cascata que a regra evita não acontece.
    /* eslint-disable react-hooks/set-state-in-effect -- ver comentário acima */
    const draft = readDraft(draftKey);
    if (draft) {
      if (draft.name) setName(draft.name);
      if (draft.phone) setPhone(formatPhone(draft.phone));
      // Pedido de mesa tem o tipo decidido pelo QR — o rascunho não manda nisso.
      if (draft.deliveryType && !tableNumber) setDeliveryType(draft.deliveryType);
      if (draft.street) setStreet(draft.street);
      if (draft.district) setDistrict(draft.district);
      if (draft.city) setCity(draft.city);
      if (draft.complement) setComplement(draft.complement);
      if (draft.selectedAddressId) setSelectedAddressId(draft.selectedAddressId);
      if (draft.useNewAddress) setUseNewAddress(true);
      if (draft.saveAddress) setSaveAddress(true);
      if (draft.addressLabel) setAddressLabel(draft.addressLabel);
      if (draft.payment && acceptedPayments.includes(draft.payment)) {
        setPayment(draft.payment);
      }
      if (draft.couponInput) setCouponInput(draft.couponInput);
      if (draft.coupon) setCoupon(draft.coupon);
      if (draft.scheduledFor) setScheduledFor(draft.scheduledFor);
      if (draft.step) setStep(draft.step);
    }
    setDraftLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  // Se o cliente está logado, pré-preenche nome/telefone e carrega endereços.
  useEffect(() => {
    let active = true;
    (async () => {
      const meRes = await fetch("/api/me").catch(() => null);
      const me = meRes?.ok ? await meRes.json().catch(() => null) : null;
      if (!active) return;
      if (me?.user) {
        setLoggedIn(true);
        setName((prev) => prev || me.user.name || "");
        setPhone((prev) => prev || formatPhone(me.user.phone ?? ""));
      }
      const addrRes = await fetch("/api/me/addresses").catch(() => null);
      const addr = addrRes?.ok ? await addrRes.json().catch(() => null) : null;
      if (!active) return;
      if (addr?.addresses?.length) {
        setSavedAddresses(addr.addresses);
        const main =
          addr.addresses.find((a: SavedAddress) => a.isMain) ??
          addr.addresses[0];
        // Não sobrescreve a escolha que veio do rascunho.
        setSelectedAddressId((prev) => prev ?? main.id);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Salva o rascunho a cada mudança — é o que permite voltar ao cardápio,
  // incluir mais um item e retomar o checkout onde parou.
  useEffect(() => {
    if (!draftLoaded) return;
    const draft: CheckoutDraft = {
      step,
      name,
      phone,
      deliveryType,
      street,
      district,
      city,
      complement,
      selectedAddressId,
      useNewAddress,
      saveAddress,
      addressLabel,
      payment,
      couponInput,
      coupon,
      scheduledFor,
    };
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {
      // localStorage indisponível (aba anônima etc.) — segue só em memória
    }
  }, [
    draftLoaded,
    draftKey,
    step,
    name,
    phone,
    deliveryType,
    street,
    district,
    city,
    complement,
    selectedAddressId,
    useNewAddress,
    saveAddress,
    addressLabel,
    payment,
    couponInput,
    coupon,
    scheduledFor,
  ]);

  const selectedSavedAddress = savedAddresses.find(
    (a) => a.id === selectedAddressId
  );
  const usingSavedAddress =
    loggedIn && savedAddresses.length > 0 && !useNewAddress && !!selectedSavedAddress;

  const address = usingSavedAddress
    ? selectedSavedAddress?.address ?? ""
    : [street, district, city, complement].filter(Boolean).join(" — ");

  const steps: StepId[] = [
    "contato",
    ...(tableNumber ? [] : (["entrega"] as StepId[])),
    ...(deliveryType === "entrega" ? (["endereco"] as StepId[]) : []),
    "pagamento",
    "revisao",
  ];
  const stepIndex = Math.max(0, steps.indexOf(step));
  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  function goToStep(index: number) {
    const target = steps[Math.min(Math.max(index, 0), steps.length - 1)];
    setStep(target);
    setErrors({});
    // Sem isso o cliente cai no meio da etapa nova, já rolado pelo tamanho da
    // anterior.
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** Valida a etapa atual e devolve os erros por campo (vazio = pode avançar). */
  function validateStep(id: StepId): Record<string, string> {
    const found: Record<string, string> = {};
    if (id === "contato") {
      if (name.trim().length < 2) found.name = "Informe seu nome.";
      if (normalizePhone(phone).length < 10) {
        found.phone = "Informe um telefone com DDD.";
      }
    }
    if (id === "endereco" && !usingSavedAddress) {
      if (!street.trim()) found.street = "Informe a rua e o número.";
      if (!district.trim()) found.district = "Informe o bairro.";
    }
    return found;
  }

  function advance() {
    const found = validateStep(currentStep);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    goToStep(stepIndex + 1);
  }

  // A região sai do próprio endereço — o cliente não escolhe. Se nada casar,
  // vale a taxa padrão. O servidor refaz esta conta ao criar o pedido.
  const matchedZone =
    deliveryType === "entrega" ? findZoneForAddress(address, zones) : undefined;
  const deliveryFee =
    deliveryType === "entrega"
      ? matchedZone?.fee ?? restaurant.deliveryFee
      : 0;
  const discount = coupon
    ? coupon.type === "percent"
      ? (cart.total * coupon.value) / 100
      : Math.min(coupon.value, cart.total)
    : 0;
  const total = cart.total - discount + deliveryFee;
  const themeStyle = restaurantThemeVars(restaurant);
  const dark = isDarkTheme(restaurant);

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setCheckingCoupon(true);
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Subtotal e telefone vão junto: o cupom pode ter pedido mínimo e limite
      // de usos por cliente, e é melhor recusar aqui do que só no envio.
      body: JSON.stringify({
        restaurantId: restaurant.id,
        code,
        subtotal: cart.total,
        phone: phone.trim(),
      }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setCheckingCoupon(false);
    if (!res?.ok || !data?.valid) {
      setCoupon(null);
      // A API explica o motivo (expirado, mínimo, já usado…) — mostrar isso é
      // o que evita o cliente tentar o mesmo código de novo.
      toast.error(data?.message ?? "Cupom inválido ou inativo.");
      return;
    }
    setCoupon({ code: code.toUpperCase(), type: data.type, value: data.value });
    toast.success("Cupom aplicado!");
  }

  async function submitOrder() {
    setSending(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId: restaurant.id,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        deliveryType,
        address,
        tableNumber: deliveryType === "mesa" ? tableNumber ?? undefined : undefined,
        paymentMethod: payment,
        couponCode: coupon?.code,
        scheduledFor: scheduledFor || undefined,
        items: cart.items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          notes: i.notes,
          options: i.options.map((o) => ({
            groupName: o.groupName,
            name: o.name,
          })),
        })),
      }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSending(false);

    if (!res?.ok || !data?.order) {
      toast.error(data?.message ?? "Não foi possível enviar o pedido.");
      return;
    }

    // Salva o endereço novo no perfil, se o cliente pediu (sem sair do checkout).
    if (saveAddress && loggedIn && !usingSavedAddress && address.trim()) {
      await fetch("/api/me/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: addressLabel.trim() || "Endereço",
          address,
          isMain: savedAddresses.length === 0,
        }),
      }).catch(() => null);
    }

    cart.clear();
    // Pedido enviado: o rascunho cumpriu o papel e não pode voltar no próximo.
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // sem localStorage não há rascunho para limpar
    }
    setOrderResult({
      code: data.order.code,
      total: data.order.total,
      pix: data.pix ?? null,
    });
    setDone(true);
    toast.success(`Pedido ${data.order.code} enviado ao restaurante!`);
  }

  if (done) {
    return (
      <div className={cn(dark && "dark")} style={themeStyle}>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 px-4 text-center">
          <span className="flex size-20 -rotate-6 items-center justify-center rounded-2xl border-2 border-foreground bg-accent shadow-offset-sm">
            <CheckCircle2 className="size-10 text-primary" />
          </span>
          <h1 className="font-display text-3xl font-bold">Pedido enviado! 🎉</h1>
          <p className="max-w-sm text-muted-foreground">
            {restaurant.confirmMessage?.trim() ||
              `O ${restaurant.name} recebeu seu pedido e vai confirmar em instantes. Você pode acompanhar o status no seu painel.`}
          </p>

          {orderResult?.pix && (
            <Card className="w-full max-w-sm text-left">
              <CardContent className="flex flex-col items-center gap-3">
                <p className="text-sm font-semibold">
                  Pague {formatBRL(orderResult.total)} com Pix
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={orderResult.pix.qrImage}
                  alt="QR Code Pix"
                  className="size-48 rounded-lg border-2 border-foreground/10"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    const ok = await copyText(orderResult.pix!.brCode);
                    if (ok) toast.success("Código Pix copiado!");
                  }}
                >
                  <Copy className="size-4" />
                  Pix copia e cola
                </Button>
                {restaurant.phone?.trim() && (
                  <Button className="w-full rounded-full font-semibold shadow-offset-sm" asChild>
                    <a
                      href={whatsappLink(
                        restaurant.phone,
                        `Olá! Segue o comprovante do pedido ${orderResult.code} no valor de ${formatBRL(orderResult.total)}.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="size-4" />
                      Enviar comprovante no WhatsApp
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            {!orderResult?.pix && restaurant.phone?.trim() && (
              <Button className="rounded-full font-semibold shadow-offset-sm" asChild>
                <a
                  href={whatsappLink(restaurant.phone)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="size-4" />
                  Falar no WhatsApp
                </a>
              </Button>
            )}
            <Button variant="outline" className="rounded-full border-2 border-foreground font-semibold" asChild>
              <Link href={`/r/${restaurant.slug}`}>Voltar ao cardápio</Link>
            </Button>
            <Button variant="outline" className="rounded-full border-2 border-foreground font-semibold" asChild>
              <Link href="/cliente/pedidos">Acompanhar pedido</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(dark && "dark")} style={themeStyle}>
      <div className="min-h-screen bg-muted/30">
        {closed && (
          <div className="bg-destructive/10 px-4 py-2 text-center text-sm font-medium text-destructive">
            O restaurante está fechado no momento e não pode receber pedidos.
          </div>
        )}
        <header className="border-b bg-background">
          <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
            <Button size="icon-sm" variant="ghost" asChild>
              <Link href={`/r/${restaurant.slug}`}>
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <h1 className="font-display font-bold">
              Finalizar pedido · {restaurant.name}
          </h1>
        </div>
      </header>

      {/* Carrinho vazio: não faz sentido percorrer as etapas sem itens. */}
      {cart.items.length === 0 ? (
        <div className="mx-auto max-w-3xl px-4 py-16">
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-foreground/20 bg-card/60 px-6 py-14 text-center">
            <span className="flex size-14 -rotate-3 items-center justify-center rounded-2xl border-2 border-foreground/15 bg-accent">
              <ShoppingBag className="size-6" />
            </span>
            <p className="font-display text-lg font-bold text-heading">
              Seu carrinho está vazio
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Escolha o que você quer comer e volte aqui para finalizar.
            </p>
            <Button asChild className="mt-1 rounded-full font-semibold shadow-offset-sm">
              <Link href={`/r/${restaurant.slug}`}>Ver o cardápio</Link>
            </Button>
          </div>
        </div>
      ) : (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // Enter no formulário avança a etapa; só a última envia o pedido.
          if (isLastStep) submitOrder();
          else advance();
        }}
      >
      <div className="mx-auto grid max-w-3xl gap-6 px-4 py-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="gap-4">
              <StepIndicator
                steps={steps}
                current={stepIndex}
                onSelect={goToStep}
              />
              <CardTitle className="text-base text-heading">
                {STEP_TITLES[currentStep]}
              </CardTitle>
            </CardHeader>

          {currentStep === "entrega" && (
            <CardContent className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType("entrega")}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-semibold transition-all ${
                  deliveryType === "entrega"
                    ? "border-foreground bg-primary text-primary-foreground shadow-offset-sm"
                    : "border-foreground/15 text-heading hover:border-foreground"
                }`}
              >
                <Bike className="size-5" />
                Entrega
                <span
                  className={`text-xs font-normal ${
                    deliveryType === "entrega"
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  }`}
                >
                  {formatBRL(restaurant.deliveryFee)} · {restaurant.deliveryTime}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType("retirada")}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-semibold transition-all ${
                  deliveryType === "retirada"
                    ? "border-foreground bg-primary text-primary-foreground shadow-offset-sm"
                    : "border-foreground/15 text-heading hover:border-foreground"
                }`}
              >
                <Store className="size-5" />
                Retirada
                <span
                  className={`text-xs font-normal ${
                    deliveryType === "retirada"
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  }`}
                >
                  Grátis · 20–30 min
                </span>
              </button>
            </CardContent>
          )}

          {currentStep === "contato" && (
            <CardContent className="grid gap-4">
              {tableNumber && (
                <div className="flex items-center gap-3 rounded-xl border-2 border-foreground/15 bg-accent/50 p-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border-2 border-foreground bg-primary text-primary-foreground">
                    <UtensilsCrossed className="size-4" />
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Pedido para a{" "}
                    <strong className="text-heading">Mesa {tableNumber}</strong> —
                    sem taxa de entrega.
                  </p>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                <Input
                  id="telefone"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="(11) 99999-1234"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone ? (
                  <p className="text-xs font-medium text-destructive">
                    {errors.phone}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    O restaurante usa este número para falar sobre o pedido.
                  </p>
                )}
              </div>
            </CardContent>
          )}

          {currentStep === "endereco" && (
            <CardContent className="grid gap-4">
                  <div className="grid gap-2">

                    {/* Endereços salvos no perfil */}
                    {loggedIn && savedAddresses.length > 0 && (
                      <div className="grid gap-2">
                        {savedAddresses.map((a) => {
                          const active =
                            selectedAddressId === a.id && !useNewAddress;
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => {
                                setSelectedAddressId(a.id);
                                setUseNewAddress(false);
                              }}
                              className={cn(
                                "flex items-start gap-2.5 rounded-xl border-2 p-3 text-left text-sm transition-all",
                                active
                                  ? "border-primary bg-primary/10 shadow-offset-sm"
                                  : "border-foreground/15 hover:border-foreground"
                              )}
                            >
                              <MapPin
                                className={cn(
                                  "mt-0.5 size-4 shrink-0",
                                  active ? "text-primary" : "text-muted-foreground"
                                )}
                              />
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-1.5 font-semibold text-heading">
                                  {a.label}
                                  {a.isMain && (
                                    <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
                                      Principal
                                    </span>
                                  )}
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                  {a.address}
                                </span>
                              </span>
                              {active && (
                                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                              )}
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => setUseNewAddress(true)}
                          className={cn(
                            "flex items-center gap-2 rounded-xl border-2 border-dashed p-3 text-left text-sm font-medium transition-all",
                            useNewAddress
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-foreground/15 text-heading hover:border-foreground"
                          )}
                        >
                          <Plus className="size-4" />
                          Usar outro endereço
                        </button>
                      </div>
                    )}

                    {loggedIn && savedAddresses.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Você ainda não tem endereços salvos. Preencha abaixo e
                        salve para agilizar os próximos pedidos.
                      </p>
                    )}

                    {/* Endereço novo (manual) */}
                    {(!loggedIn || savedAddresses.length === 0 || useNewAddress) && (
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="endereco">Rua e número</Label>
                          <Input
                            id="endereco"
                            placeholder="Rua, número"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            aria-invalid={!!errors.street}
                          />
                          {errors.street && (
                            <p className="text-xs font-medium text-destructive">
                              {errors.street}
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="bairro">Bairro</Label>
                            <Input
                              id="bairro"
                              placeholder="Bairro"
                              value={district}
                              onChange={(e) => setDistrict(e.target.value)}
                              aria-invalid={!!errors.district}
                            />
                            {errors.district && (
                              <p className="text-xs font-medium text-destructive">
                                {errors.district}
                              </p>
                            )}
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="cidade">Cidade</Label>
                            <Input
                              id="cidade"
                              placeholder="Cidade"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="complemento">Complemento</Label>
                          <Input
                            id="complemento"
                            placeholder="Apto, bloco..."
                            value={complement}
                            onChange={(e) => setComplement(e.target.value)}
                          />
                        </div>

                        {/* Salvar no perfil (cadastro rápido, sem sair do checkout) */}
                        {loggedIn && (
                          <div className="grid gap-2 rounded-xl border-2 border-foreground/10 bg-muted/40 p-3">
                            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
                              <input
                                type="checkbox"
                                checked={saveAddress}
                                onChange={(e) => setSaveAddress(e.target.checked)}
                                className="size-4 shrink-0 accent-[var(--primary)]"
                              />
                              Salvar este endereço no meu perfil
                            </label>
                            {saveAddress && (
                              <Input
                                placeholder="Nome do endereço (ex.: Casa)"
                                value={addressLabel}
                                onChange={(e) => setAddressLabel(e.target.value)}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* A taxa vem da região que o endereço menciona; sem região
                      cadastrada não há o que avisar. */}
                  {zones.length > 0 && address.trim() && (
                    <p className="text-xs text-muted-foreground">
                      {matchedZone ? (
                        <>
                          Entrega em <strong>{matchedZone.name}</strong> —{" "}
                          {matchedZone.fee === 0
                            ? "frete grátis"
                            : `frete ${formatBRL(matchedZone.fee)}`}
                          .
                        </>
                      ) : (
                        <>
                          Fora das regiões cadastradas — vale a taxa padrão de{" "}
                          {restaurant.deliveryFee === 0
                            ? "frete grátis"
                            : formatBRL(restaurant.deliveryFee)}
                          .
                        </>
                      )}
                    </p>
                  )}
            </CardContent>
          )}

          {currentStep === "pagamento" && (
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Forma de pagamento</Label>
                <Select
                  value={payment}
                  onValueChange={(v: string) => setPayment(v as PaymentMethod)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {acceptedPayments.map((m) => (
                      <SelectItem key={m} value={m}>
                        {PAYMENT_LABELS[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cupom">Cupom de desconto (opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="cupom"
                    placeholder="Ex.: BEMVINDO10"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="uppercase"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={checkingCoupon || !couponInput.trim()}
                    onClick={applyCoupon}
                  >
                    {checkingCoupon ? "..." : "Aplicar"}
                  </Button>
                </div>
                {coupon && (
                  <p className="text-xs font-medium text-primary">
                    Cupom {coupon.code} aplicado — desconto de{" "}
                    {coupon.type === "percent"
                      ? `${coupon.value}%`
                      : formatBRL(coupon.value)}
                    .
                  </p>
                )}
              </div>
              {restaurant.acceptsScheduled && (
                <div className="grid gap-2">
                  <Label htmlFor="agendamento">Agendar para (opcional)</Label>
                  <Input
                    id="agendamento"
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para pedir agora.
                  </p>
                </div>
              )}
            </CardContent>
          )}

          {currentStep === "revisao" && (
            <CardContent className="divide-y divide-foreground/10 py-0">
              <ReviewRow
                label="Contato"
                value={
                  <>
                    {name}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {phone}
                    </span>
                  </>
                }
                onEdit={() => goToStep(steps.indexOf("contato"))}
              />
              <ReviewRow
                label={tableNumber ? "Mesa" : "Como recebe"}
                value={
                  tableNumber
                    ? `Mesa ${tableNumber}`
                    : deliveryType === "entrega"
                      ? "Entrega"
                      : "Retirada no local"
                }
                onEdit={() =>
                  goToStep(steps.indexOf(tableNumber ? "contato" : "entrega"))
                }
              />
              {deliveryType === "entrega" && (
                <ReviewRow
                  label="Endereço"
                  value={
                    <>
                      {address || "—"}
                      <span className="block text-xs font-normal text-muted-foreground">
                        {matchedZone
                          ? `${matchedZone.name} · ${deliveryFee === 0 ? "frete grátis" : formatBRL(deliveryFee)}`
                          : `Taxa padrão · ${deliveryFee === 0 ? "frete grátis" : formatBRL(deliveryFee)}`}
                      </span>
                    </>
                  }
                  onEdit={() => goToStep(steps.indexOf("endereco"))}
                />
              )}
              <ReviewRow
                label="Pagamento"
                value={
                  <>
                    {PAYMENT_LABELS[payment]}
                    {coupon && (
                      <span className="block text-xs font-normal text-primary">
                        Cupom {coupon.code} aplicado
                      </span>
                    )}
                    {scheduledFor && (
                      <span className="block text-xs font-normal text-muted-foreground">
                        Agendado para{" "}
                        {new Date(scheduledFor).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </>
                }
                onEdit={() => goToStep(steps.indexOf("pagamento"))}
              />
            </CardContent>
          )}

          {/* Empilhado no celular: lado a lado, os dois botões (que não quebram
              linha) somam mais que a área útil do card e comem o padding
              direito, encostando na borda. */}
          <CardFooter className="flex-col gap-3 border-t border-foreground/10 pt-4 sm:flex-row">
            {stepIndex > 0 && (
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full border-2 border-foreground font-semibold sm:w-auto"
                onClick={() => goToStep(stepIndex - 1)}
              >
                <ArrowLeft className="size-4" />
                Voltar
              </Button>
            )}
            {/* Os dois botões são type="button" e têm `key` diferente de
                propósito: com type="submit" no último passo, o React
                reaproveitava o mesmo nó do DOM ao avançar e o clique que
                mudou de etapa terminava enviando o pedido sem passar pela
                revisão. O Enter continua funcionando pelo onSubmit do form. */}
            {isLastStep ? (
              <Button
                key="enviar"
                type="button"
                size="lg"
                className="w-full rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5 sm:flex-1"
                disabled={sending || closed}
                onClick={submitOrder}
              >
                {sending
                  ? "Enviando..."
                  : closed
                    ? "Restaurante fechado"
                    : `Enviar pedido · ${formatBRL(total)}`}
              </Button>
            ) : (
              <Button
                key="continuar"
                type="button"
                size="lg"
                className="w-full rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5 sm:flex-1"
                onClick={advance}
              >
                Continuar
                <ArrowRight className="size-4" />
              </Button>
            )}
          </CardFooter>
          </Card>
        </div>

        {/* Summary */}
        <Card className="h-fit border-2 border-foreground shadow-offset">
          <CardHeader>
            <CardTitle className="text-base text-heading">Resumo do pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {cart.items.map((item) => (
              <div key={item.key} className="space-y-0.5">
                <div className="flex justify-between">
                  <span>
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="font-medium">
                    {formatBRL(itemUnitPrice(item) * item.quantity)}
                  </span>
                </div>
                {item.options.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {item.options.map((o) => o.name).join(", ")}
                  </p>
                )}
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatBRL(cart.total)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between font-medium text-primary">
                <span>Desconto{coupon ? ` (${coupon.code})` : ""}</span>
                <span>−{formatBRL(discount)}</span>
              </div>
            )}
            {tableNumber ? (
              <div className="flex justify-between text-muted-foreground">
                <span>Mesa</span>
                <span>{tableNumber}</span>
              </div>
            ) : (
              <div className="flex justify-between gap-2 text-muted-foreground">
                <span className="truncate">
                  Entrega{matchedZone && ` · ${matchedZone.name}`}
                </span>
                <span className="shrink-0">
                  {deliveryFee === 0 ? "Grátis" : formatBRL(deliveryFee)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatBRL(total)}</span>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
            >
              <Link href={`/r/${restaurant.slug}`}>
                <Plus className="size-4" />
                Adicionar mais itens
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      </form>
      )}
      </div>
    </div>
  );
}
