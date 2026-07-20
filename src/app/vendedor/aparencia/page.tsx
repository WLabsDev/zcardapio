"use client";

import { useEffect, useRef, useState } from "react";
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
import { cn } from "@/lib/utils";

const colors = [
  { id: "laranja", value: "#ea580c" },
  { id: "vermelho", value: "#dc2626" },
  { id: "verde", value: "#16a34a" },
  { id: "azul", value: "#2563eb" },
  { id: "roxo", value: "#7c3aed" },
  { id: "rosa", value: "#db2777" },
];

type Appearance = {
  name: string;
  description: string;
  logo: string;
  cover: string;
  primaryColor: string;
};

export default function AparenciaPage() {
  const [form, setForm] = useState<Appearance | null>(null);
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
        <div className="space-y-6">
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
            <CardContent className="flex flex-wrap gap-3">
              {colors.map((c) => (
                <button
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Textos</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome exibido</Label>
                <Input
                  id="nome"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">Descrição curta</Label>
                <Input
                  id="desc"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={save} disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Pré-visualização
          </p>
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div
              className="h-20 bg-cover bg-center"
              style={{ backgroundImage: `url(${form.cover})` }}
            />
            <div className="-mt-5 px-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.logo}
                alt="Logo"
                className="size-10 rounded-lg border shadow"
              />
            </div>
            <div className="space-y-2.5 p-4">
              <p className="font-bold">{form.name}</p>
              <div className="flex items-center justify-between rounded-lg border p-2">
                <div>
                  <p className="text-sm font-medium">Zé Clássico</p>
                  <p className="text-xs font-semibold" style={{ color }}>
                    R$ 29,90
                  </p>
                </div>
                <span
                  className="flex size-6 items-center justify-center rounded-md text-sm text-white"
                  style={{ backgroundColor: color }}
                >
                  +
                </span>
              </div>
              <div
                className="rounded-lg p-2 text-center text-sm font-semibold text-white"
                style={{ backgroundColor: color }}
              >
                Ver carrinho
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
