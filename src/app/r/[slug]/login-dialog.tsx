"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Restaurant } from "@/lib/mock/types";
import { normalizePhone, formatPhone } from "@/lib/phone";
import { isDarkTheme, restaurantThemeVars } from "@/lib/theme";
import { cn } from "@/lib/utils";

const whatsappField = z
  .string()
  .refine((v) => normalizePhone(v).length >= 10, "Informe um WhatsApp válido com DDD.");

const loginSchema = z.object({
  whatsapp: whatsappField,
  senha: z.string().min(1, "Informe sua senha."),
});

const registerSchema = z.object({
  nome: z.string().min(3, "Informe seu nome completo."),
  whatsapp: whatsappField,
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function LoginDialog({
  restaurant,
  open,
  onOpenChange,
}: {
  restaurant: Restaurant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"login" | "register" | "set-password">(
    "login"
  );
  const [loggingIn, setLoggingIn] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [setupPhone, setSetupPhone] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [settingPass, setSettingPass] = useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { whatsapp: "", senha: "" },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nome: "", whatsapp: "", senha: "" },
  });

  function reset() {
    setStep("login");
    setSetupPhone("");
    setNewPass("");
    setConfirmPass("");
    loginForm.reset({ whatsapp: "", senha: "" });
    registerForm.reset({ nome: "", whatsapp: "", senha: "" });
  }

  async function onLogin(values: LoginValues) {
    setLoggingIn(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: values.whatsapp,
        senha: values.senha,
        profile: "cliente",
      }),
    });
    const data = await res.json().catch(() => null);
    setLoggingIn(false);

    if (!res.ok || (!data?.user && !data?.needsPassword)) {
      toast.error(data?.message ?? "Não foi possível entrar.");
      return;
    }

    if (data.needsPassword) {
      setSetupPhone(data.phone);
      setNewPass("");
      setConfirmPass("");
      setStep("set-password");
      return;
    }

    toast.success(`Bem-vindo(a), ${data.user.name.split(" ")[0]}!`);
    onOpenChange(false);
    reset();
    router.refresh();
  }

  async function onRegister(values: RegisterValues) {
    setRegistering(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: values.nome,
        telefone: values.whatsapp,
        senha: values.senha,
      }),
    });
    const data = await res.json().catch(() => null);
    setRegistering(false);

    if (!res.ok || !data?.user) {
      toast.error(data?.message ?? "Não foi possível criar a conta.");
      return;
    }

    toast.success(`Conta criada! Bem-vindo(a), ${data.user.name.split(" ")[0]}!`);
    onOpenChange(false);
    reset();
    router.refresh();
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
    onOpenChange(false);
    reset();
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o: boolean) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent
        // key={step} força uma montagem limpa do conteúdo a cada troca de passo.
        // Sem isso, o formulário montado com o dialog já aberto (login→cadastro)
        // não registra os campos corretamente no react-hook-form (React 19 + Radix).
        key={step}
        className={cn("max-w-sm", isDarkTheme(restaurant) && "dark")}
        style={restaurantThemeVars(restaurant)}
      >
        {step === "set-password" ? (
          <>
            <DialogHeader>
              <DialogTitle>Crie sua senha 🔑</DialogTitle>
              <DialogDescription>
                Encontramos seus pedidos pelo número{" "}
                <strong className="text-foreground">{setupPhone}</strong>. Defina
                uma senha para acompanhar seus pedidos.
              </DialogDescription>
            </DialogHeader>
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
                disabled={settingPass}
                className="rounded-full font-semibold shadow-offset-sm"
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
                Voltar
              </Button>
            </form>
          </>
        ) : step === "register" ? (
          <>
            <DialogHeader>
              <DialogTitle>Crie sua conta 🍔</DialogTitle>
              <DialogDescription>
                Peça nos seus restaurantes favoritos e acompanhe seus pedidos.
              </DialogDescription>
            </DialogHeader>
            <Form {...registerForm}>
              <form
                onSubmit={registerForm.handleSubmit(onRegister)}
                className="grid gap-4"
                noValidate
              >
                <FormField
                  control={registerForm.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Seu nome"
                          autoComplete="name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="(11) 99999-1234"
                          autoComplete="tel"
                          {...field}
                          onChange={(e) =>
                            field.onChange(formatPhone(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Mínimo 8 caracteres"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={registering}
                  className="rounded-full font-semibold shadow-offset-sm"
                >
                  {registering ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>
            </Form>
            <p className="text-center text-sm text-muted-foreground">
              Já tem conta?{" "}
              <button
                type="button"
                onClick={() => setStep("login")}
                className="text-primary hover:underline"
              >
                Entrar
              </button>
            </p>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Bem-vindo de volta 👋</DialogTitle>
              <DialogDescription>
                Entre com seu WhatsApp para acompanhar seus pedidos.
              </DialogDescription>
            </DialogHeader>
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onLogin)}
                className="grid gap-4"
                noValidate
              >
                <FormField
                  control={loginForm.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="(11) 99999-1234"
                          autoComplete="tel"
                          {...field}
                          onChange={(e) =>
                            field.onChange(formatPhone(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Senha</FormLabel>
                        <Link
                          href="/recuperar-senha-cliente"
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
                  disabled={loggingIn}
                  className="rounded-full font-semibold shadow-offset-sm"
                >
                  {loggingIn ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>
            <p className="text-center text-sm text-muted-foreground">
              Não tem conta?{" "}
              <button
                type="button"
                onClick={() => setStep("register")}
                className="text-primary hover:underline"
              >
                Criar conta
              </button>
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
