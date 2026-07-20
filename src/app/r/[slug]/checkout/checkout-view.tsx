"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bike, CheckCircle2, Store } from "lucide-react";
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
import { formatBRL, type Restaurant } from "@/lib/mock/types";

export function CheckoutView({ restaurant }: { restaurant: Restaurant }) {
  const cart = useCart();
  const [deliveryType, setDeliveryType] = useState<"entrega" | "retirada">(
    "entrega"
  );
  const [done, setDone] = useState(false);

  const deliveryFee = deliveryType === "entrega" ? restaurant.deliveryFee : 0;

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="flex size-20 -rotate-6 items-center justify-center rounded-2xl border-2 border-foreground bg-accent shadow-offset-sm">
          <CheckCircle2 className="size-10 text-primary" />
        </span>
        <h1 className="font-display text-3xl font-bold">Pedido enviado! 🎉</h1>
        <p className="max-w-sm text-muted-foreground">
          O {restaurant.name} recebeu seu pedido e vai confirmar em instantes.
          Você pode acompanhar o status no seu painel.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full border-2 border-foreground font-semibold" asChild>
            <Link href={`/r/${restaurant.slug}`}>Voltar ao cardápio</Link>
          </Button>
          <Button className="rounded-full font-semibold shadow-offset-sm" asChild>
            <Link href="/cliente/pedidos">Acompanhar pedido</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
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

      <div className="mx-auto grid max-w-3xl gap-6 px-4 py-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Delivery type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Como quer receber?</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <button
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
                <Input id="nome" placeholder="Seu nome completo" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                <Input id="telefone" placeholder="(11) 99999-9999" />
              </div>
              {deliveryType === "entrega" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input id="endereco" placeholder="Rua, número" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input id="bairro" placeholder="Bairro" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input id="complemento" placeholder="Apto, bloco..." />
                    </div>
                  </div>
                </>
              )}
              <div className="grid gap-2">
                <Label>Forma de pagamento</Label>
                <Select defaultValue="pix">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">Pix</SelectItem>
                    <SelectItem value="cartao">Cartão na entrega</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            <div className="flex justify-between text-muted-foreground">
              <span>Entrega</span>
              <span>{deliveryFee === 0 ? "Grátis" : formatBRL(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatBRL(cart.total + deliveryFee)}</span>
            </div>
            <Button
              className="w-full rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
              size="lg"
              disabled={cart.items.length === 0}
              onClick={() => {
                cart.clear();
                setDone(true);
                toast.success("Pedido enviado ao restaurante!");
              }}
            >
              Enviar pedido
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
