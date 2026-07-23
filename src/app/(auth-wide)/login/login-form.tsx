"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
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
import { formatPhone } from "@/lib/phone";
import { roleHome, safeRedirectPath } from "@/lib/routes";
import type { SessionRole } from "@/lib/session";

const loginSchema = z.object({
  identifier: z.string().min(1, "Informe este campo."),
  senha: z.string().min(1, "Informe sua senha."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  // "cliente" = entra por WhatsApp; "restaurante" = entra por e-mail (cobre
  // restaurante e admin — ver src/app/api/auth/login/route.ts). O usuário só
  // escolhe o método de entrada, não precisa saber/declarar qual é o perfil.
  const [method, setMethod] = useState<"cliente" | "restaurante">("cliente");
  const [step, setStep] = useState<"login" | "set-password">("login");
  const [loggingIn, setLoggingIn] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [setupPhone, setSetupPhone] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [settingPass, setSettingPass] = useState(false);

  const isWhatsapp = method === "cliente";

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", senha: "" },
  });

  function changeMethod(next: string) {
    setMethod(next as "cliente" | "restaurante");
    setShowSenha(false);
    form.reset({ identifier: "", senha: "" });
  }

  // Destino pós-login: ?next= (se for caminho interno) ou o painel do perfil.
  function redirectAfter(role: SessionRole, fallback = "/") {
    const next = safeRedirectPath(
      new URLSearchParams(window.location.search).get("next")
    );
    router.push(next ?? roleHome[role] ?? fallback);
  }

  async function onSubmit(values: LoginValues) {
    const payload = isWhatsapp
      ? { phone: values.identifier, senha: values.senha, profile: method }
      : { email: values.identifier, senha: values.senha, profile: method };

    setLoggingIn(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    setLoggingIn(false);

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
    redirectAfter(data.user.role as SessionRole);
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
    redirectAfter(data.user.role as SessionRole, "/cliente");
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
        <CardDescription>Como você quer entrar?</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={method} onValueChange={changeMethod} className="mb-4">
          <TabsList className="w-full">
            <TabsTrigger value="cliente" className="flex-1">WhatsApp</TabsTrigger>
            <TabsTrigger value="restaurante" className="flex-1">E-mail</TabsTrigger>
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
                  <FormLabel>{isWhatsapp ? "WhatsApp" : "E-mail"}</FormLabel>
                  <FormControl>
                    <Input
                      type={isWhatsapp ? "tel" : "email"}
                      placeholder={isWhatsapp ? "(11) 99999-1234" : "voce@email.com"}
                      autoComplete={isWhatsapp ? "tel" : "email"}
                      {...field}
                      onChange={
                        isWhatsapp
                          ? (e) => field.onChange(formatPhone(e.target.value))
                          : field.onChange
                      }
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
                      href={isWhatsapp ? "/recuperar-senha-cliente" : "/recuperar-senha"}
                      className="text-xs text-primary hover:underline"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showSenha ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="pr-10"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowSenha((v) => !v)}
                      aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showSenha ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="lg"
              disabled={loggingIn}
              className="rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
            >
              {loggingIn ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link
            href="/cadastro-restaurante"
            className="text-primary hover:underline"
          >
            Cadastrar restaurante
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
