"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bike, CheckCircle2, MessageCircle, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: "Pix",
  cartao: "Cartão na entrega",
  dinheiro: "Dinheiro",
};

export function CheckoutView({
  restaurant,
  initiallyOpen,
  zones,
}: {
  restaurant: Restaurant;
  initiallyOpen: boolean;
  zones: DeliveryZone[];
}) {
  const closed = !initiallyOpen;
  const acceptedPayments: PaymentMethod[] = restaurant.paymentMethods?.length
    ? restaurant.paymentMethods
    : ["pix", "cartao", "dinheiro"];
  const cart = useCart();
  const [deliveryType, setDeliveryType] = useState<"entrega" | "retirada">(
    "entrega"
  );
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [district, setDistrict] = useState("");
  const [complement, setComplement] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>(acceptedPayments[0]);
  const [sending, setSending] = useState(false);
  // Região de entrega
  const [zoneId, setZoneId] = useState<string>(zones[0]?.id ?? "");
  // Cupom
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; type: "percent" | "fixed"; value: number } | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  // Agendamento
  const [scheduledFor, setScheduledFor] = useState("");

  const selectedZone = zones.find((z) => z.id === zoneId);
  const deliveryFee =
    deliveryType === "entrega"
      ? selectedZone
        ? selectedZone.fee
        : restaurant.deliveryFee
      : 0;
  const discount = coupon
    ? coupon.type === "percent"
      ? (cart.total * coupon.value) / 100
      : Math.min(coupon.value, cart.total)
    : 0;
  const themeStyle = restaurantThemeVars(restaurant);
  const dark = isDarkTheme(restaurant);

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setCheckingCoupon(true);
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId: restaurant.id, code }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setCheckingCoupon(false);
    if (!res?.ok || !data?.valid) {
      setCoupon(null);
      toast.error("Cupom inválido ou inativo.");
      return;
    }
    setCoupon({ code: code.toUpperCase(), type: data.type, value: data.value });
    toast.success("Cupom aplicado!");
  }

  async function submitOrder() {
    setSending(true);
    const address = [street, district, complement]
      .filter(Boolean)
      .join(" — ");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId: restaurant.id,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        deliveryType,
        address,
        paymentMethod: payment,
        zoneId: deliveryType === "entrega" && zoneId ? zoneId : undefined,
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
    cart.clear();
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
          <div className="flex flex-wrap justify-center gap-3">
            {restaurant.whatsapp?.trim() && (
              <Button className="rounded-full font-semibold shadow-offset-sm" asChild>
                <a
                  href={`https://wa.me/55${restaurant.whatsapp.replace(/\D/g, "")}`}
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitOrder();
        }}
      >
      <div className="mx-auto grid max-w-3xl gap-6 px-4 py-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Delivery type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Como quer receber?</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType("entrega")}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-semibold transition-all ${
                  deliveryType === "entrega"
                    ? "border-foreground bg-accent shadow-offset-sm"
                    : "border-foreground/15 hover:border-foreground"
                }`}
              >
                <Bike className="size-5" />
                Entrega
                <span className="text-xs font-normal text-muted-foreground">
                  {formatBRL(restaurant.deliveryFee)} · {restaurant.deliveryTime}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType("retirada")}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-semibold transition-all ${
                  deliveryType === "retirada"
                    ? "border-foreground bg-accent shadow-offset-sm"
                    : "border-foreground/15 hover:border-foreground"
                }`}
              >
                <Store className="size-5" />
                Retirada
                <span className="text-xs font-normal text-muted-foreground">
                  Grátis · 20–30 min
                </span>
              </button>
            </CardContent>
          </Card>

          {/* Contact / address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Seus dados</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                <Input
                  id="telefone"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              {deliveryType === "entrega" && (
                <>
                  {zones.length > 0 && (
                    <div className="grid gap-2">
                      <Label>Região de entrega</Label>
                      <Select value={zoneId} onValueChange={setZoneId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a região" />
                        </SelectTrigger>
                        <SelectContent>
                          {zones.map((z) => (
                            <SelectItem key={z.id} value={z.id}>
                              {z.name} · {z.fee === 0 ? "Grátis" : formatBRL(z.fee)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      placeholder="Rua, número"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        placeholder="Bairro"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                      />
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
                  </div>
                </>
              )}
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
          </Card>
        </div>

        {/* Summary */}
        <Card className="h-fit border-2 border-foreground shadow-offset">
          <CardHeader>
            <CardTitle className="text-base">Resumo do pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {cart.items.length === 0 && (
              <p className="text-muted-foreground">
                Seu carrinho está vazio.{" "}
                <Link
                  href={`/r/${restaurant.slug}`}
                  className="text-primary underline"
                >
                  Voltar ao cardápio
                </Link>
              </p>
            )}
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
            <div className="flex justify-between text-muted-foreground">
              <span>Entrega</span>
              <span>{deliveryFee === 0 ? "Grátis" : formatBRL(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatBRL(cart.total - discount + deliveryFee)}</span>
            </div>
            <Button
              type="submit"
              className="w-full rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
              size="lg"
              disabled={cart.items.length === 0 || sending || closed}
            >
              {sending ? "Enviando..." : closed ? "Restaurante fechado" : "Enviar pedido"}
            </Button>
          </CardContent>
        </Card>
      </div>
      </form>
      </div>
    </div>
  );
}
