"use client";

import { MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const addresses = [
  {
    id: "a1",
    label: "Casa",
    address: "Rua das Acácias, 45 — Vila Mariana, São Paulo/SP",
    main: true,
  },
  {
    id: "a2",
    label: "Trabalho",
    address: "Av. Paulista, 1000 — Bela Vista, São Paulo/SP",
    main: false,
  },
];

export default function ClientePerfilPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Perfil</h2>
        <p className="text-sm text-muted-foreground">
          Seus dados pessoais e endereços de entrega.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados pessoais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" defaultValue="Mariana Souza" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" defaultValue="(11) 99123-4567" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" defaultValue="mari.souza@gmail.com" />
          </div>
          <Button
            className="w-fit"
            onClick={() => toast.success("Dados atualizados!")}
          >
            Salvar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Endereços</CardTitle>
          <Button size="sm" variant="outline">
            <Plus className="size-4" />
            Novo endereço
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {addresses.map((a) => (
            <div key={a.id} className="flex items-start gap-3 rounded-lg border p-3">
              <MapPin className="mt-0.5 size-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {a.label}
                  {a.main && <Badge variant="secondary">Principal</Badge>}
                </p>
                <p className="text-sm text-muted-foreground">{a.address}</p>
              </div>
              <Button size="sm" variant="ghost">
                Editar
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
