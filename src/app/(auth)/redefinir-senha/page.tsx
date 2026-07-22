"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, KeyRound } from "lucide-react";
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

function RedefinirSenhaForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (senha.length < 8) {
      toast.error("A senha precisa de pelo menos 8 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      toast.error("As senhas não conferem.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, senha }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível redefinir a senha.");
      return;
    }
    toast.success("Senha redefinida! Faça login com a nova senha.");
    router.push("/login");
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md border-2 border-foreground shadow-offset">
        <CardContent className="flex flex-col items-center gap-4 pt-10 text-center">
          <p className="text-sm text-muted-foreground">
            Link inválido. Solicite um novo pelo formulário de recuperação de
            senha.
          </p>
          <Button variant="outline" className="rounded-full border-2 border-foreground font-semibold" asChild>
            <Link href="/recuperar-senha">
              <ArrowLeft className="size-4" />
              Voltar
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-2 border-foreground shadow-offset">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <KeyRound className="size-5" />
          Criar nova senha
        </CardTitle>
        <CardDescription>Escolha uma nova senha para sua conta.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="nova-senha">Nova senha</Label>
            <Input
              id="nova-senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmar-senha">Confirmar senha</Label>
            <Input
              id="confirmar-senha"
              type="password"
              placeholder="••••••••"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={saving}
            className="rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
          >
            {saving ? "Salvando..." : "Redefinir senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense>
      <RedefinirSenhaForm />
    </Suspense>
  );
}
