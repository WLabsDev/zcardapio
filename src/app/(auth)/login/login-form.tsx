"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
  identifier: z.string().min(1, "Informe este campo."),
  senha: z.string().min(1, "Informe sua senha."),
});

type LoginValues = z.infer<typeof loginSchema>;

const roleHome: Record<string, string> = {
  admin: "/admin",
  restaurante: "/vendedor",
  cliente: "/cliente",
};

export function LoginForm() {
  const router = useRouter();
  const [profile, setProfile] = useState("cliente");
  const [step, setStep] = useState<"login" | "set-password">("login");
  const [setupPhone, setSetupPhone] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [settingPass, setSettingPass] = useState(false);

  const isCliente = profile === "cliente";

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", senha: "" },
  });

  function changeProfile(next: string) {
    setProfile(next);
    form.reset({ identifier: "", senha: "" });
  }

  async function onSubmit(values: LoginValues) {
    const payload = isCliente
      ? { phone: values.identifier, senha: values.senha, profile }
      : { email: values.identifier, senha: values.senha, profile };

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok || (!data?.user && !data?.needsPassword)) {
      toast.error(data?.message ?? "Não foi possível entrar.");
      return;
    }

    // Conta criada no pedido ainda sem senha → definir senha no 1º acesso.
    if (data.needsPassword) {
      setSetupPhone(data.phone);
      setNewPass("");
      setConfirmPass("");
      setStep("set-password");
      return;
    }

    toast.success(`Bem-vindo(a), ${data.user.name.split(" ")[0]}!`);
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(
      next?.startsWith("/") ? next : roleHome[data.user.role as string] ?? "/"
    );
  }

  async function submitPassword() {
    if (newPass.length < 8) {
      toast.error("A senha precisa de pelo menos 8 caracteres.");
      return;
    }
    if (newPass !== confirmPass) {
      toast.error("As senhas não conferem.");
      return;
    }
    setSettingPass(true);
    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: setupPhone, senha: newPass }),
    });
    const data = await res.json().catch(() => null);
    setSettingPass(false);
    if (!res.ok || !data?.user) {
      toast.error(data?.message ?? "Não foi possível definir a senha.");
      return;
    }
    toast.success(`Senha definida! Bem-vindo(a), ${data.user.name.split(" ")[0]}!`);
    router.push(roleHome[data.user.role as string] ?? "/cliente");
  }

  // ---- Primeiro acesso: definir senha ----
  if (step === "set-password") {
    return (
      <Card className="w-full max-w-md border-2 border-foreground shadow-offset">
        <CardHeader>
          <CardTitle className="text-2xl">Crie sua senha 🔑</CardTitle>
          <CardDescription>
            Encontramos seus pedidos pelo número{" "}
            <strong className="text-foreground">{setupPhone}</strong>. Defina uma
            senha para acompanhar seus pedidos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitPassword();
            }}
            className="grid gap-4"
          >
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="nova-senha">
              Nova senha
            </label>
            <Input
              id="nova-senha"
              type="password"
              placeholder="••••••••"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="confirmar-senha">
              Confirmar senha
            </label>
            <Input
              id="confirmar-senha"
              type="password"
              placeholder="••••••••"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={settingPass}
            className="rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
          >
            {settingPass ? "Salvando..." : "Definir senha e entrar"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mx-auto text-muted-foreground"
            onClick={() => setStep("login")}
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // ---- Login ----
  return (
    <Card className="w-full max-w-md border-2 border-foreground shadow-offset">
      <CardHeader>
        <CardTitle className="text-2xl">Bem-vindo de volta 👋</CardTitle>
        <CardDescription>Acesse sua conta do zCardapio.</CardDescription>
      </CardHeader>
      <div className="mx-6 mb-2 rounded-lg border-2 border-dashed border-foreground/20 bg-muted/40 p-3 text-xs text-muted-foreground">
        <p className="mb-1 font-semibold text-foreground">Contas de demonstração</p>
        <p>
          <strong>Cliente (WhatsApp):</strong> 11999991234 ·{" "}
          <strong>Restaurante:</strong> ze@burguerdoze.com.br ·{" "}
          <strong>Admin:</strong> admin@zcardapio.com.br
        </p>
        <p className="mt-1">
          Senha: <code className="font-bold text-primary">12345678</code>
        </p>
      </div>
      <CardContent>
        <Tabs value={profile} onValueChange={changeProfile} className="mb-4">
          <TabsList className="w-full">
            <TabsTrigger value="cliente" className="flex-1">Cliente</TabsTrigger>
            <TabsTrigger value="restaurante" className="flex-1">Restaurante</TabsTrigger>
            <TabsTrigger value="admin" className="flex-1">Admin</TabsTrigger>
          </TabsList>
        </Tabs>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isCliente ? "WhatsApp" : "E-mail"}</FormLabel>
                  <FormControl>
                    <Input
                      type={isCliente ? "tel" : "email"}
                      placeholder={isCliente ? "(11) 99999-1234" : "voce@email.com"}
                      autoComplete={isCliente ? "tel" : "email"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Senha</FormLabel>
                    <Link
                      href={isCliente ? "/recuperar-senha-cliente" : "/recuperar-senha"}
                      className="text-xs text-primary hover:underline"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="lg"
              className="rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
            >
              Entrar
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {isCliente ? (
            <>
              Sua conta é criada automaticamente no primeiro pedido.{" "}
              <Link href="/cadastro" className="text-primary hover:underline">
                Prefiro criar agora
              </Link>
            </>
          ) : (
            <>
              Não tem conta?{" "}
              <Link
                href="/cadastro-restaurante"
                className="text-primary hover:underline"
              >
                Cadastrar restaurante
              </Link>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
