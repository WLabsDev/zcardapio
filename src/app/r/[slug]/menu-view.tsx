"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CircleUserRound,
  Clock,
  LogOut,
  MapPin,
  Minus,
  Plus,
  ReceiptText,
  Search,
  SearchX,
  ShoppingBag,
  Star,
  Trash2,
  UserRound,
} from "lucide-react";
import { EmptyState } from "@/components/panel/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  itemUnitPrice,
  useCart,
  type SelectedOption,
} from "@/components/cart/cart-context";
import { formatBRL, type Product, type Restaurant } from "@/lib/mock/types";
import type { SessionRole } from "@/lib/session";
import { cn } from "@/lib/utils";

type MenuUser = { name: string; role: SessionRole } | null;

const roleHome: Record<SessionRole, string> = {
  admin: "/admin",
  restaurante: "/vendedor",
  cliente: "/cliente",
};

function AccountButton({ user, slug }: { user: MenuUser; slug: string }) {
  const router = useRouter();

  if (!user) {
    return (
      <Button
        size="sm"
        variant="secondary"
        className="rounded-full border-2 border-foreground font-semibold shadow-offset-sm"
        asChild
      >
        <Link href={`/login?next=/r/${slug}`}>
          <CircleUserRound className="size-4" />
          Entrar
        </Link>
      </Button>
    );
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className="rounded-full border-2 border-foreground font-semibold shadow-offset-sm"
        >
          <CircleUserRound className="size-4" />
          {user.name.split(" ")[0]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={roleHome[user.role]}>
            <UserRound className="size-4" />
            Minha conta
          </Link>
        </DropdownMenuItem>
        {user.role === "cliente" && (
          <DropdownMenuItem asChild>
            <Link href="/cliente/pedidos">
              <ReceiptText className="size-4" />
              Meus pedidos
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={logout}>
          <LogOut className="size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MenuView({
  restaurant,
  products,
  user,
}: {
  restaurant: Restaurant;
  products: Product[];
  user: MenuUser;
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(
    restaurant.categories[0]?.id ?? ""
  );
  const [selected, setSelected] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [choices, setChoices] = useState<Record<string, string[]>>({});
  const cart = useCart();

  const toggleChoice = (groupId: string, optionId: string, max: number) => {
    setChoices((prev) => {
      const current = prev[groupId] ?? [];
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      }
      if (max === 1) return { ...prev, [groupId]: [optionId] };
      if (current.length >= max) return prev;
      return { ...prev, [groupId]: [...current, optionId] };
    });
  };

  const selectedOptions: SelectedOption[] = (selected?.optionGroups ?? []).flatMap(
    (g) =>
      g.options
        .filter((o) => (choices[g.id] ?? []).includes(o.id))
        .map((o) => ({ groupName: g.name, name: o.name, price: o.price }))
  );
  const extraPrice = selectedOptions.reduce((a, o) => a + o.price, 0);
  const requiredOk = (selected?.optionGroups ?? []).every(
    (g) => !g.required || (choices[g.id] ?? []).length > 0
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [products, search]);

  const byCategory = (categoryId: string) =>
    filtered.filter((p) => p.categoryId === categoryId);

  const openProduct = (p: Product) => {
    setSelected(p);
    setQuantity(1);
    setNotes("");
    setChoices({});
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      {/* Cover */}
      <div
        className="relative h-40 bg-cover bg-center md:h-56"
        style={{ backgroundImage: `url(${restaurant.cover})` }}
      >
        <div className="absolute right-4 top-4">
          <AccountButton user={user} slug={restaurant.slug} />
        </div>
      </div>

      {/* Restaurant header */}
      <div className="relative mx-auto -mt-10 max-w-3xl px-4">
        <div className="rounded-2xl border-2 border-foreground bg-card p-4 shadow-offset">
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              className="size-16 rounded-xl border-2 border-foreground"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-xl font-bold">
                  {restaurant.name}
                </h1>
                <Badge variant={restaurant.isOpen ? "default" : "secondary"}>
                  {restaurant.isOpen ? "Aberto" : "Fechado"}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {restaurant.description}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {restaurant.rating.toFixed(1)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {restaurant.deliveryTime}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {restaurant.address}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Entrega {formatBRL(restaurant.deliveryFee)} · Pedido mínimo{" "}
                {formatBRL(restaurant.minOrder)} · {restaurant.openingHours}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + categories */}
      <div className="sticky top-0 z-30 mt-4 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl space-y-3 px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar no cardápio..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="scrollbar-hide flex gap-2 overflow-x-auto py-1">
            {restaurant.categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setActiveCategory(c.id);
                  document
                    .getElementById(`cat-${c.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`whitespace-nowrap rounded-full border-2 px-4 py-1.5 font-display text-sm font-semibold transition-all ${
                  activeCategory === c.id
                    ? "border-foreground bg-primary text-primary-foreground shadow-offset-sm"
                    : "border-foreground/20 bg-background hover:border-foreground"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-6">
        {restaurant.categories.map((c) => {
          const items = byCategory(c.id);
          if (items.length === 0) return null;
          return (
            <section key={c.id} id={`cat-${c.id}`} className="scroll-mt-32">
              <h2 className="mb-3 font-display text-lg font-bold">{c.name}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => p.available && openProduct(p)}
                    className={`flex gap-3 rounded-xl border-2 border-foreground/15 bg-card p-3 text-left transition-all ${
                      p.available
                        ? "hover:-translate-y-0.5 hover:border-foreground hover:shadow-offset-sm"
                        : "cursor-not-allowed opacity-50"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{p.name}</p>
                        {p.popular && (
                          <Badge variant="secondary" className="text-[10px]">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {p.description}
                      </p>
                      <p className="mt-2 font-display font-bold text-primary">
                        {formatBRL(p.price)}
                      </p>
                      {!p.available && (
                        <p className="text-xs text-destructive">Indisponível</p>
                      )}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.name}
                      className="size-24 shrink-0 rounded-lg object-cover"
                    />
                  </button>
                ))}
              </div>
            </section>
          );
        })}
        {filtered.length === 0 && (
          <EmptyState
            compact
            icon={SearchX}
            title="Nenhum produto encontrado"
            description={`Não encontramos nada para “${search}”. Tente buscar por outro nome.`}
          />
        )}
      </div>

      {/* Product detail dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(o: boolean) => !o && setSelected(null)}
      >
        <DialogContent
          className="max-w-md"
          onOpenAutoFocus={(e: Event) => e.preventDefault()}
        >
          {selected && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.image}
                alt={selected.name}
                className="h-44 w-full rounded-lg object-cover"
              />
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>{selected.description}</DialogDescription>
              </DialogHeader>
              {selected.optionGroups?.map((g) => (
                <div key={g.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      {g.name}
                      {g.required && (
                        <span className="ml-1 text-destructive">*</span>
                      )}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {g.max === 1 ? "Escolha 1" : `Até ${g.max}`}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {g.options.map((o) => {
                      const checked = (choices[g.id] ?? []).includes(o.id);
                      return (
                        <button
                          key={o.id}
                          onClick={() => toggleChoice(g.id, o.id, g.max)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg border-2 px-3 py-2 text-sm transition-all",
                            checked
                              ? "border-foreground bg-accent"
                              : "border-foreground/15 hover:border-foreground/40"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
                                g.max === 1 ? "rounded-full" : "rounded",
                                checked
                                  ? "border-foreground bg-foreground text-background"
                                  : "border-muted-foreground/40"
                              )}
                            >
                              {checked && (
                                <span className="size-1.5 rounded-full bg-background" />
                              )}
                            </span>
                            {o.name}
                          </span>
                          {o.price > 0 && (
                            <span className="text-xs text-muted-foreground">
                              +{formatBRL(o.price)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <Textarea
                placeholder="Alguma observação? Ex.: sem cebola, ponto da carne..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 rounded-lg border p-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-6 text-center font-semibold">
                    {quantity}
                  </span>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <Button
                  className="flex-1 rounded-full font-semibold"
                  disabled={!requiredOk}
                  onClick={() => {
                    cart.addItem(selected, quantity, notes || undefined, selectedOptions);
                    setSelected(null);
                  }}
                >
                  Adicionar · {formatBRL((selected.price + extraPrice) * quantity)}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart bar + sheet */}
      {cart.count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-foreground/10 bg-background/95 p-3 backdrop-blur">
          <div className="mx-auto max-w-3xl">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  className="w-full justify-between rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
                  size="lg"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="size-4" />
                    Ver carrinho ({cart.count})
                  </span>
                  {formatBRL(cart.total)}
                </Button>
              </SheetTrigger>
              <SheetContent className="flex w-full flex-col sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Seu pedido</SheetTitle>
                </SheetHeader>
                <div className="flex-1 space-y-4 overflow-y-auto px-4">
                  {cart.items.map((item) => (
                    <div key={item.key} className="flex gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="size-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {item.product.name}
                        </p>
                        {item.options.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {item.options.map((o) => o.name).join(", ")}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-xs text-muted-foreground">
                            Obs: {item.notes}
                          </p>
                        )}
                        <p className="text-sm font-bold text-primary">
                          {formatBRL(itemUnitPrice(item) * item.quantity)}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <Button
                            size="icon-sm"
                            variant="outline"
                            onClick={() =>
                              cart.updateQuantity(
                                item.key,
                                item.quantity - 1
                              )
                            }
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="w-5 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            size="icon-sm"
                            variant="outline"
                            onClick={() =>
                              cart.updateQuantity(
                                item.key,
                                item.quantity + 1
                              )
                            }
                          >
                            <Plus className="size-3" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="ml-auto text-destructive"
                            onClick={() => cart.removeItem(item.key)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <SheetFooter>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">
                      {formatBRL(cart.total)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entrega</span>
                    <span className="font-semibold">
                      {formatBRL(restaurant.deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>
                      {formatBRL(cart.total + restaurant.deliveryFee)}
                    </span>
                  </div>
                  <Button
                    size="lg"
                    className="rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
                    asChild
                  >
                    <Link href={`/r/${restaurant.slug}/checkout`}>
                      Finalizar pedido
                    </Link>
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      )}
    </div>
  );
}
