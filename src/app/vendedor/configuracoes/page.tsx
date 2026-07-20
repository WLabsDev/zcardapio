"use client";

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
import { Switch } from "@/components/ui/switch";
import { restaurants } from "@/lib/mock/data";

const restaurant = restaurants[0];

export default function ConfiguracoesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Configurações</h2>
        <p className="text-sm text-muted-foreground">
          Dados do restaurante, funcionamento e entrega.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do restaurante</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" defaultValue={restaurant.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" defaultValue={restaurant.phone} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input id="endereco" defaultValue={restaurant.address} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slug">Endereço do cardápio</Label>
            <div className="flex items-center gap-2">
              <Input id="slug" defaultValue={restaurant.slug} className="max-w-56" />
              <span className="text-sm text-muted-foreground">.zcardapio.com.br</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Funcionamento</CardTitle>
          <CardDescription>
            Controle quando o cardápio aceita pedidos.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Restaurante aberto</p>
              <p className="text-xs text-muted-foreground">
                Quando fechado, clientes veem o cardápio mas não podem pedir.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="horarios">Horários</Label>
            <Input id="horarios" defaultValue={restaurant.openingHours} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Entrega</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="taxa">Taxa de entrega (R$)</Label>
            <Input id="taxa" type="number" step="0.1" defaultValue={restaurant.deliveryFee} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="minimo">Pedido mínimo (R$)</Label>
            <Input id="minimo" type="number" defaultValue={restaurant.minOrder} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tempo">Tempo estimado</Label>
            <Input id="tempo" defaultValue={restaurant.deliveryTime} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => toast.success("Configurações salvas!")}>
        Salvar alterações
      </Button>
    </div>
  );
}
