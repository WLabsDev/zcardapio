"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useBackToClose } from "@/hooks/use-back-to-close";

type Address = { id: string; label: string; address: string; isMain: boolean };

export default function ClientePerfilPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState({ label: "", address: "" });
  const [savingAddress, setSavingAddress] = useState(false);

  // No mobile, o botão "voltar" fecha o modal em vez de sair da página.
  useBackToClose(dialogOpen, () => setDialogOpen(false));

  const loadAddresses = useCallback(async () => {
    const res = await fetch("/api/me/addresses").catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data) setAddresses(data.addresses);
  }, []);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setName(data.user.name);
          setPhone(data.user.phone ?? "");
          setEmail(data.user.email ?? "");
        }
      })
      .catch(() => toast.error("Não foi possível carregar o perfil."));
    fetch("/api/me/addresses")
      .then((res) => res.json())
      .then((data) => {
        if (data?.addresses) setAddresses(data.addresses);
      })
      .catch(() => {});
  }, []);

  const saveProfile = async () => {
    setSavingProfile(true);
    const res = await fetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSavingProfile(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível salvar.");
      return;
    }
    toast.success("Dados atualizados!");
  };

  const savePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("A nova senha precisa de pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("As senhas não conferem.");
      return;
    }
    setSavingPassword(true);
    const res = await fetch("/api/me/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSavingPassword(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível alterar a senha.");
      return;
    }
    toast.success("Senha alterada com sucesso!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const openAddressDialog = (address: Address | null) => {
    setEditing(address);
    setForm(
      address
        ? { label: address.label, address: address.address }
        : { label: "", address: "" }
    );
    setDialogOpen(true);
  };

  const saveAddress = async () => {
    setSavingAddress(true);
    const res = await fetch(
      editing ? `/api/me/addresses/${editing.id}` : "/api/me/addresses",
      {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: form.label.trim(),
          address: form.address.trim(),
          isMain: editing?.isMain ?? addresses.length === 0,
        }),
      }
    ).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSavingAddress(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível salvar o endereço.");
      return;
    }
    setDialogOpen(false);
    toast.success(editing ? "Endereço atualizado!" : "Endereço adicionado!");
    loadAddresses();
  };

  const removeAddress = async (id: string) => {
    const res = await fetch(`/api/me/addresses/${id}`, {
      method: "DELETE",
    }).catch(() => null);
    if (!res?.ok) {
      toast.error("Não foi possível remover o endereço.");
      return;
    }
    toast.success("Endereço removido.");
    loadAddresses();
  };

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
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveProfile();
            }}
            className="grid gap-4"
          >
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
          <Button type="submit" className="w-fit" disabled={savingProfile}>
            {savingProfile ? "Salvando..." : "Salvar"}
          </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              savePassword();
            }}
            className="grid gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="senha-atual">Senha atual</Label>
              <Input
                id="senha-atual"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nova-senha">Nova senha</Label>
                <Input
                  id="nova-senha"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmar-senha">Confirmar nova senha</Label>
                <Input
                  id="confirmar-senha"
                  type="password"
                  autoComplete="new-password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="w-fit" disabled={savingPassword}>
              {savingPassword ? "Salvando..." : "Alterar senha"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Endereços</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openAddressDialog(null)}
          >
            <Plus className="size-4" />
            Novo endereço
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {addresses.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum endereço cadastrado ainda.
            </p>
          )}
          {addresses.map((a) => (
            <div key={a.id} className="flex items-start gap-3 rounded-lg border p-3">
              <MapPin className="mt-0.5 size-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {a.label}
                  {a.isMain && <Badge variant="secondary">Principal</Badge>}
                </p>
                <p className="text-sm text-muted-foreground">{a.address}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openAddressDialog(a)}
              >
                Editar
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => removeAddress(a.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar endereço" : "Novo endereço"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveAddress();
            }}
            className="grid gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="alabel">Nome</Label>
              <Input
                id="alabel"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Casa, Trabalho..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="aaddress">Endereço completo</Label>
              <Input
                id="aaddress"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                placeholder="Rua, número — Bairro, Cidade/UF"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={savingAddress}>
                {savingAddress ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
