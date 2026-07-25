"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { roleHome, safeRedirectPath } from "@/lib/routes";
import type { SessionRole } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().min(1, "Informe seu e-mail."),
  senha: z.string().min(1, "Informe sua senha."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [loggingIn, setLoggingIn] = useState(false);
  const [showSenha, setShowSenha] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
  });

  function redirectAfter(role: SessionRole, fallback = "/") {
    const next = safeRedirectPath(
      new URLSearchParams(window.location.search).get("next")
    );
    router.push(next ?? roleHome[role] ?? fallback);
  }

  async function onSubmit(values: LoginValues) {
    setLoggingIn(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: values.email,
        senha: values.senha,
        profile: "restaurante",
      }),
    });
    const data = await res.json().catch(() => null);
    setLoggingIn(false);

    if (!res.ok || !data?.user) {
      toast.error(data?.message ?? "Não foi possível entrar.");
      return;
    }

    toast.success(`Bem-vindo(a), ${data.user.name.split(" ")[0]}!`);
    redirectAfter(data.user.role as SessionRole);
  }

  return (
    <div className="w-full max-w-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Que bom ter você aqui!
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Entre com seu e-mail para acessar o painel.
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-6 grid gap-4"
          noValidate
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="voce@email.com"
                    autoComplete="email"
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
                  <FormLabel>Senha *</FormLabel>
                  <Link
                    href="/recuperar-senha"
                    className="text-xs text-primary hover:underline"
                  >
                    Esqueci a senha
                  </Link>
                </div>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showSenha ? "text" : "password"}
                      placeholder="Sua senha"
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
            className="mt-2 rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
          >
            {loggingIn ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Form>

      <div className="mt-6 border-t border-foreground/10 pt-5 text-center">
        <p className="text-sm text-muted-foreground">Não tem conta ainda?</p>
        <Button
          variant="outline"
          className="mt-3 w-full rounded-full border-2 border-foreground font-semibold"
          asChild
        >
          <Link href="/cadastro-restaurante">Criar conta</Link>
        </Button>
      </div>
    </div>
  );
}
