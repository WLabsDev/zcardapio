"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBRL, type Product } from "@/lib/mock/types";
import { contrastTextColor, FONT_DISPLAY } from "@/lib/theme";
import { cn } from "@/lib/utils";

const colors = [
  { id: "laranja", value: "#ea580c" },
  { id: "vermelho", value: "#dc2626" },
  { id: "verde", value: "#16a34a" },
  { id: "azul", value: "#2563eb" },
  { id: "roxo", value: "#7c3aed" },
  { id: "rosa", value: "#db2777" },
];

type Palette = {
  primary: string;
  heading: string;
  productTitle: string;
  body: string;
  muted: string;
  bg: string;
  card: string;
  badge: string;
  badgeText: string;
};

const palettes: { id: string; name: string; dark?: boolean; colors: Palette }[] = [
  {
    id: "oceano",
    name: "Oceano",
    colors: { primary: "#2563eb", heading: "#1e293b", productTitle: "#0f172a", body: "#334155", muted: "#64748b", bg: "#f1f5f9", card: "#ffffff", badge: "#f59e0b", badgeText: "#1c1917" },
  },
  {
    id: "floresta",
    name: "Floresta",
    colors: { primary: "#16a34a", heading: "#14532d", productTitle: "#052e16", body: "#374151", muted: "#6b7280", bg: "#f0fdf4", card: "#ffffff", badge: "#f59e0b", badgeText: "#1c1917" },
  },
  {
    id: "vinho",
    name: "Vinho",
    colors: { primary: "#be123c", heading: "#4c0519", productTitle: "#1c1917", body: "#44403c", muted: "#78716c", bg: "#fafaf9", card: "#ffffff", badge: "#d97706", badgeText: "#1c1917" },
  },
  {
    id: "noite",
    name: "Noite",
    dark: true,
    colors: { primary: "#f59e0b", heading: "#f8fafc", productTitle: "#ffffff", body: "#e2e8f0", muted: "#94a3b8", bg: "#0f172a", card: "#1e293b", badge: "#fbbf24", badgeText: "#1c1917" },
  },
  {
    id: "grafite",
    name: "Grafite",
    dark: true,
    colors: { primary: "#22d3ee", heading: "#e4e4e7", productTitle: "#fafafa", body: "#d4d4d8", muted: "#71717a", bg: "#18181b", card: "#27272a", badge: "#facc15", badgeText: "#1c1917" },
  },
];

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <input
        type="color"
        value={value || "#888888"}
        onChange={(e) => onChange(e.target.value)}
        className="size-9 shrink-0 cursor-pointer rounded-lg border bg-transparent"
        aria-label={label}
      />
      <div className="grid flex-1 gap-0.5">
        <span className="text-xs font-medium">{label}</span>
        <div className="flex items-center gap-1.5">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="padrão"
            className="h-8 font-mono text-xs uppercase"
            maxLength={7}
          />
          {value && (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={() => onChange("")}
              aria-label={`Limpar ${label}`}
            >
              ✕
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

type Appearance = {
  name: string;
  description: string;
  logo: string;
  cover: string;
  primaryColor: string;
  theme: "claro" | "escuro";
  font: "bricolage" | "jakarta" | "mono";
  buttonStyle: "arredondado" | "reto";
  headingColor: string;
  productTitleColor: string;
  bodyColor: string;
  mutedColor: string;
  bgColor: string;
  cardColor: string;
  badgeColor: string;
  badgeTextColor: string;
};

type RestaurantMeta = {
  address: string;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  openingHours: string;
};

export default function AparenciaPage() {
  const [form, setForm] = useState<Appearance | null>(null);
  const [meta, setMeta] = useState<RestaurantMeta | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "cover" | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (field: "logo" | "cover", file: File | undefined) => {
    if (!file) return;
    setUploading(field);
    try {
      const url = await uploadImage(file);
      setForm((f) => (f ? { ...f, [field]: url } : f));
      toast.success("Imagem enviada! Salve para aplicar.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setUploading(null);
    }
  };

  useEffect(() => {
    fetch("/api/vendedor/restaurant")
      .then((res) => res.json())
      .then((data) => {
        const r = data.restaurant;
        setForm({
          name: r.name,
          description: r.description,
          logo: r.logo,
          cover: r.cover,
          primaryColor: r.primaryColor ?? colors[0].value,
          theme: r.theme ?? "claro",
          font: r.font ?? "bricolage",
          buttonStyle: r.buttonStyle ?? "arredondado",
          headingColor: r.headingColor ?? "",
          productTitleColor: r.productTitleColor ?? "",
          bodyColor: r.bodyColor ?? "",
          mutedColor: r.mutedColor ?? "",
          bgColor: r.bgColor ?? "",
          cardColor: r.cardColor ?? "",
          badgeColor: r.badgeColor ?? "",
          badgeTextColor: r.badgeTextColor ?? "",
        });
        setMeta({
          address: r.address ?? "",
          deliveryTime: r.deliveryTime ?? "",
          deliveryFee: r.deliveryFee ?? 0,
          minOrder: r.minOrder ?? 0,
          openingHours: r.openingHours ?? "",
        });
      })
      .catch(() => toast.error("Não foi possível carregar a aparência."));

    fetch("/api/vendedor/products")
      .then((res) => res.json())
      .then((data) => {
        const products: Product[] = data?.products ?? [];
        const pick =
          products.find((p) => p.popular && p.available) ??
          products.find((p) => p.available) ??
          products[0];
        if (pick) setPreviewProduct(pick);
      })
      .catch(() => {});
  }, []);

  const set = <K extends keyof Appearance>(key: K, value: Appearance[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const res = await fetch("/api/vendedor/restaurant", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        description: form.description.trim(),
        logo: form.logo.trim(),
        cover: form.cover.trim(),
        primaryColor: form.primaryColor,
        theme: form.theme,
        font: form.font,
        buttonStyle: form.buttonStyle,
        headingColor: form.headingColor,
        productTitleColor: form.productTitleColor,
        bodyColor: form.bodyColor,
        mutedColor: form.mutedColor,
        bgColor: form.bgColor,
        cardColor: form.cardColor,
        badgeColor: form.badgeColor,
        badgeTextColor: form.badgeTextColor,
      }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível salvar.");
      return;
    }
    toast.success("Aparência salva!");
  };

  if (!form) {
    return <p className="text-sm text-muted-foreground">Carregando aparência...</p>;
  }

  const color = form.primaryColor;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Aparência</h2>
        <p className="text-sm text-muted-foreground">
          Personalize como o seu cardápio aparece para os clientes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identidade visual</CardTitle>
              <CardDescription>
                Logo e imagem de capa exibidos no topo do cardápio.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.logo}
                    alt="Logo"
                    className="size-16 rounded-xl border object-cover"
                  />
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleUpload("logo", e.target.files?.[0])}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading === "logo"}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {uploading === "logo" ? "Enviando..." : "Trocar logo"}
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Imagem de capa</Label>
                <div
                  className="h-28 rounded-xl border bg-cover bg-center"
                  style={{ backgroundImage: `url(${form.cover})` }}
                />
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleUpload("cover", e.target.files?.[0])}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  disabled={uploading === "cover"}
                  onClick={() => coverInputRef.current?.click()}
                >
                  {uploading === "cover" ? "Enviando..." : "Trocar capa"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cor principal</CardTitle>
              <CardDescription>
                Usada nos botões e destaques do cardápio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {colors.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => set("primaryColor", c.value)}
                    className={cn(
                      "size-10 rounded-full border-2 transition-transform",
                      color === c.value
                        ? "scale-110 border-foreground"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: c.value }}
                    aria-label={c.id}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => set("primaryColor", e.target.value)}
                  className="size-10 cursor-pointer rounded-lg border bg-transparent"
                  aria-label="Cor personalizada"
                />
                <div className="grid gap-0.5">
                  <Label htmlFor="hex">Cor personalizada</Label>
                  <Input
                    id="hex"
                    value={color}
                    onChange={(e) => set("primaryColor", e.target.value)}
                    className="h-8 w-32 font-mono text-xs uppercase"
                    maxLength={7}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Paleta de cores</CardTitle>
              <CardDescription>
                Escolha um estilo pronto ou ajuste cada cor individualmente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {palettes.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => {
                      set("primaryColor", p.colors.primary);
                      set("headingColor", p.colors.heading);
                      set("productTitleColor", p.colors.productTitle);
                      set("bodyColor", p.colors.body);
                      set("mutedColor", p.colors.muted);
                      set("bgColor", p.colors.bg);
                      set("cardColor", p.colors.card);
                      set("badgeColor", p.colors.badge);
                      set("badgeTextColor", p.colors.badgeText);
                      set("theme", p.dark ? "escuro" : "claro");
                    }}
                    className="group flex items-center gap-2 rounded-lg border-2 border-foreground/15 px-2.5 py-1.5 transition-all hover:border-foreground"
                  >
                    <span className="flex overflow-hidden rounded-md border border-foreground/10">
                      <span className="h-6 w-3" style={{ backgroundColor: p.colors.bg }} />
                      <span className="h-6 w-3" style={{ backgroundColor: p.colors.card }} />
                      <span className="h-6 w-3" style={{ backgroundColor: p.colors.heading }} />
                      <span className="h-6 w-3" style={{ backgroundColor: p.colors.primary }} />
                    </span>
                    <span className="text-sm font-medium">{p.name}</span>
                  </button>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ColorField label="Títulos" value={form.headingColor} onChange={(v) => set("headingColor", v)} />
                <ColorField label="Título do produto" value={form.productTitleColor} onChange={(v) => set("productTitleColor", v)} />
                <ColorField label="Detalhes" value={form.bodyColor} onChange={(v) => set("bodyColor", v)} />
                <ColorField label="Textos secundários" value={form.mutedColor} onChange={(v) => set("mutedColor", v)} />
                <ColorField label="Fundo" value={form.bgColor} onChange={(v) => set("bgColor", v)} />
                <ColorField label="Cards" value={form.cardColor} onChange={(v) => set("cardColor", v)} />
                <ColorField label="Badge “Popular”" value={form.badgeColor} onChange={(v) => set("badgeColor", v)} />
                <ColorField label="Texto do badge" value={form.badgeTextColor} onChange={(v) => set("badgeTextColor", v)} />
              </div>

              {(form.headingColor || form.productTitleColor || form.bodyColor || form.mutedColor || form.bgColor || form.cardColor || form.badgeColor || form.badgeTextColor) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    set("headingColor", "");
                    set("productTitleColor", "");
                    set("bodyColor", "");
                    set("mutedColor", "");
                    set("bgColor", "");
                    set("cardColor", "");
                    set("badgeColor", "");
                    set("badgeTextColor", "");
                  }}
                >
                  Limpar cores personalizadas
                </Button>
              )}
            </CardContent>
          </Card>

          <Button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>

        {/* Live preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Pré-visualização
          </p>
          {(() => {
            const dark = form.theme === "escuro";
            const pBg = form.bgColor || (dark ? "#131316" : "#f7f5f0");
            const pCard = form.cardColor || (dark ? "#1e1e23" : "#ffffff");
            const pHeading = form.headingColor || (dark ? "#f5f5f4" : "#292524");
            const pProductTitle = form.productTitleColor || (dark ? "#fafafa" : "#1c1917");
            const pBody = form.bodyColor || (dark ? "#e7e5e4" : "#44403c");
            const pMuted = form.mutedColor || "#a8a29e";
            const pBadge = form.badgeColor || "#f59e0b";
            const pBadgeText = form.badgeTextColor || "#1c1917";
            const pRadius = form.buttonStyle === "reto" ? "0.25rem" : "9999px";
            const fontFamily = FONT_DISPLAY[form.font];
            const onColor = contrastTextColor(color);
            const product = previewProduct ?? {
              name: "Zé Clássico",
              description: "Pão brioche, blend 160g e queijo cheddar.",
              price: 29.9,
              image: "",
              popular: true,
            };

            return (
              <div
                className="overflow-hidden rounded-2xl border shadow-sm"
                style={{ backgroundColor: pBg }}
              >
                <div
                  className="h-20 bg-cover bg-center"
                  style={{ backgroundImage: `url(${form.cover})` }}
                />
                <div className="-mt-6 px-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.logo}
                    alt="Logo"
                    className="size-12 rounded-xl border-2 object-cover shadow"
                    style={{ borderColor: pCard }}
                  />
                </div>
                <div className="space-y-3 p-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p
                        className="text-lg font-bold"
                        style={{ color: pHeading, fontFamily }}
                      >
                        {form.name || "Nome do restaurante"}
                      </p>
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                        style={{ backgroundColor: color, color: onColor }}
                      >
                        Aberto
                      </span>
                    </div>
                    {form.description && (
                      <p className="text-xs" style={{ color: pMuted }}>
                        {form.description}
                      </p>
                    )}
                    {meta && (meta.deliveryTime || meta.address) && (
                      <div
                        className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]"
                        style={{ color: pMuted }}
                      >
                        {meta.deliveryTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {meta.deliveryTime}
                          </span>
                        )}
                        {meta.address && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="size-3 shrink-0" />
                            <span className="truncate">{meta.address}</span>
                          </span>
                        )}
                      </div>
                    )}
                    {meta && (
                      <p className="text-[11px]" style={{ color: pMuted }}>
                        Entrega {formatBRL(meta.deliveryFee)} · Pedido mínimo{" "}
                        {formatBRL(meta.minOrder)}
                        {meta.openingHours && ` · ${meta.openingHours}`}
                      </p>
                    )}
                  </div>

                  <div
                    className="flex gap-2.5 rounded-lg border p-2.5"
                    style={{ backgroundColor: pCard, borderColor: `${pBody}26` }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p
                          className="truncate text-sm font-semibold"
                          style={{ color: pProductTitle, fontFamily }}
                        >
                          {product.name}
                        </p>
                        {product.popular && (
                          <span
                            className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                            style={{ backgroundColor: pBadge, color: pBadgeText }}
                          >
                            Popular
                          </span>
                        )}
                      </div>
                      <p
                        className="mt-0.5 line-clamp-2 text-xs"
                        style={{ color: pMuted }}
                      >
                        {product.description}
                      </p>
                      <p
                        className="mt-1 text-sm font-bold"
                        style={{ color, fontFamily }}
                      >
                        {formatBRL(product.price)}
                      </p>
                    </div>
                    {product.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt={product.name}
                        className="size-16 shrink-0 rounded-md border object-cover"
                        style={{ borderColor: `${pBody}26` }}
                      />
                    )}
                  </div>

                  <div
                    className="p-2 text-center text-sm font-semibold"
                    style={{
                      borderRadius: pRadius,
                      backgroundColor: color,
                      color: onColor,
                      fontFamily,
                    }}
                  >
                    Ver carrinho
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
