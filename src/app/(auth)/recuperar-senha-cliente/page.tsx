"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
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

export default function RecuperarSenhaClientePage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);

  const requestCode = async () => {
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Informe um WhatsApp válido com DDD.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password-cliente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setLoading(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível enviar o código.");
      return;
    }
    toast.success("Código enviado no seu WhatsApp!");
    setStep("code");
  };

  const submit = async () => {
    if (code.length !== 6) {
      toast.error("Informe o código de 6 dígitos.");
      return;
    }
    if (senha.length < 8) {
      toast.error("A senha precisa de pelo menos 8 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      toast.error("As senhas não conferem.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password-cliente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code, senha }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setLoading(false);
    if (!res?.ok) {
      toast.error(data?.message ?? "Não foi possível redefinir a senha.");
      return;
    }
    toast.success("Senha redefinida! Faça login com a nova senha.");
    router.push("/login");
  };

  if (step === "code") {
    return (
      <Card className="w-full max-w-md border-2 border-foreground shadow-offset">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <MessageCircle className="size-5" />
            Digite o código
          </CardTitle>
          <CardDescription>
            Enviamos um código de 6 dígitos pro WhatsApp{" "}
            <strong className="text-foreground">{phone}</strong>.
          </CardDescription>
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
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                autoFocus
              />
            </div>
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
              disabled={loading}
              className="rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
            >
              {loading ? "Salvando..." : "Redefinir senha"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mx-auto text-muted-foreground"
              onClick={() => setStep("phone")}
            >
              <ArrowLeft className="size-4" />
              Voltar
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-2 border-foreground shadow-offset">
      <CardHeader>
        <CardTitle className="text-2xl">Esqueceu a senha? 🔑</CardTitle>
        <CardDescription>
          Informe o WhatsApp da sua conta e enviaremos um código para você
          criar uma senha nova.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestCode();
          }}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="(11) 99999-1234"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
          >
            {loading ? "Enviando..." : "Enviar código por WhatsApp"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Lembrou a senha?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
