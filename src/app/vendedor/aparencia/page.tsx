"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/upload";
import { MENU_THEMES, isMenuTheme, type MenuThemeId } from "@/lib/menu-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  menuTheme: MenuThemeId;
  headingColor: string;
  productTitleColor: string;
  bodyColor: string;
  mutedColor: string;
  bgColor: string;
  cardColor: string;
  badgeColor: string;
  badgeTextColor: string;
};

export default function AparenciaPage() {
  const [form, setForm] = useState<Appearance | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
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
        setSlug(r.slug ?? null);
        setForm({
          name: r.name,
          description: r.description,
          logo: r.logo,
          cover: r.cover,
          primaryColor: r.primaryColor ?? colors[0].value,
          theme: r.theme ?? "claro",
          font: r.font ?? "bricolage",
          buttonStyle: r.buttonStyle ?? "arredondado",
          menuTheme: isMenuTheme(r.menuTheme) ? r.menuTheme : "classico",
          headingColor: r.headingColor ?? "",
          productTitleColor: r.productTitleColor ?? "",
          bodyColor: r.bodyColor ?? "",
          mutedColor: r.mutedColor ?? "",
          bgColor: r.bgColor ?? "",
          cardColor: r.cardColor ?? "",
          badgeColor: r.badgeColor ?? "",
          badgeTextColor: r.badgeTextColor ?? "",
        });
      })
      .catch(() => toast.error("Não foi possível carregar a aparência."));
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
        menuTheme: form.menuTheme,
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
    setPreviewKey((k) => k + 1);
  };

  if (!form) {
    return <p className="text-sm text-muted-foreground">Carregando aparência...</p>;
  }

  const color = form.primaryColor;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">Aparência</h2>
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
              <CardTitle className="text-base">Tema do cardápio</CardTitle>
              <CardDescription>
                O estilo visual da página que o cliente vê. As cores abaixo são
                aplicadas por cima do tema escolhido.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {MENU_THEMES.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => set("menuTheme", t.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/60",
                      form.menuTheme === t.id &&
                        "border-primary bg-primary/5 ring-1 ring-primary"
                    )}
                    aria-pressed={form.menuTheme === t.id}
                  >
                    <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                      {t.id === "classico" ? (
                        <span className="h-6 w-9 rounded-lg border-2 border-foreground bg-card shadow-offset-sm" />
                      ) : (
                        <span className="h-6 w-9 rounded-lg border bg-card shadow-xs" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {t.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {t.description}
                      </span>
                    </span>
                  </button>
                ))}
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
                      "size-10 rounded-full transition-all",
                      color === c.value &&
                        "ring-2 ring-primary ring-offset-2 ring-offset-background"
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
                    className="group flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-colors hover:bg-muted/60"
                  >
                    <span className="flex overflow-hidden rounded-md border">
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
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Pré-visualização
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setPreviewKey((k) => k + 1)}
                disabled={!slug}
                aria-label="Recarregar pré-visualização"
              >
                <RefreshCw className="size-3.5" />
              </Button>
              {slug && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => window.open(`/r/${slug}`, "_blank")}
                  aria-label="Abrir cardápio em nova aba"
                >
                  <ExternalLink className="size-3.5" />
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
            <div className="flex items-center justify-center border-b bg-muted py-2">
              <div className="h-1.5 w-16 rounded-full bg-muted-foreground/25" />
            </div>
            {slug ? (
              <iframe
                key={previewKey}
                src={`/r/${slug}`}
                title="Pré-visualização do cardápio"
                className="h-[560px] w-full border-0 bg-background"
              />
            ) : (
              <div className="flex h-[560px] items-center justify-center text-sm text-muted-foreground">
                Carregando cardápio...
              </div>
            )}
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            As alterações aparecem no cardápio após salvar.
          </p>
        </div>
      </div>
    </div>
  );
}
