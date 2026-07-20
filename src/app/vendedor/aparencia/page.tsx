"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { restaurants } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

const restaurant = restaurants[0];

const colors = [
  { id: "laranja", value: "#ea580c" },
  { id: "vermelho", value: "#dc2626" },
  { id: "verde", value: "#16a34a" },
  { id: "azul", value: "#2563eb" },
  { id: "roxo", value: "#7c3aed" },
  { id: "rosa", value: "#db2777" },
];

export default function AparenciaPage() {
  const [color, setColor] = useState(colors[0]);

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
                    src={restaurant.logo}
                    alt="Logo"
                    className="size-16 rounded-xl border"
                  />
                  <Button variant="outline" size="sm">
                    Trocar logo
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Imagem de capa</Label>
                <div
                  className="h-28 rounded-xl border bg-cover bg-center"
                  style={{ backgroundImage: `url(${restaurant.cover})` }}
                />
                <Button variant="outline" size="sm" className="w-fit">
                  Trocar capa
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
                  onClick={() => setColor(c)}
                  className={cn(
                    "size-10 rounded-full border-2 transition-transform",
                    color.id === c.id
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
                <Input id="nome" defaultValue={restaurant.name} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">Descrição curta</Label>
                <Input id="desc" defaultValue={restaurant.description} />
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => toast.success("Aparência salva!")}>
            Salvar alterações
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
              style={{ backgroundImage: `url(${restaurant.cover})` }}
            />
            <div className="-mt-5 px-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={restaurant.logo}
                alt="Logo"
                className="size-10 rounded-lg border shadow"
              />
            </div>
            <div className="space-y-2.5 p-4">
              <p className="font-bold">{restaurant.name}</p>
              <div className="flex items-center justify-between rounded-lg border p-2">
                <div>
                  <p className="text-sm font-medium">Zé Clássico</p>
                  <p className="text-xs font-semibold" style={{ color: color.value }}>
                    R$ 29,90
                  </p>
                </div>
                <span
                  className="flex size-6 items-center justify-center rounded-md text-sm text-white"
                  style={{ backgroundColor: color.value }}
                >
                  +
                </span>
              </div>
              <div
                className="rounded-lg p-2 text-center text-sm font-semibold text-white"
                style={{ backgroundColor: color.value }}
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
