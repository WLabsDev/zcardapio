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
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Que bom ter você aqui!</CardTitle>
          <CardDescription>
            Entre com seu e-mail para acessar o painel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4"
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
                    <FormLabel>Senha *</FormLabel>
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
                    <Link
                      href="/recuperar-senha"
                      className="text-xs text-primary underline-offset-4 hover:underline"
                    >
                      Esqueci minha senha
                    </Link>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loggingIn} className="mt-2 w-full">
                {loggingIn ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Não tem conta ainda?{" "}
        <Link
          href="/cadastro-restaurante"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}
