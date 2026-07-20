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
  email: z.email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe sua senha."),
});

type LoginValues = z.infer<typeof loginSchema>;

const roleHome: Record<string, string> = {
  admin: "/admin",
  restaurante: "/vendedor",
  cliente: "/cliente",
};

export default function LoginPage() {
  const router = useRouter();
  const [profile, setProfile] = useState("cliente");

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
  });

  async function onSubmit(values: LoginValues) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, profile }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.user) {
      toast.error(data?.message ?? "Não foi possível entrar.");
      return;
    }

    toast.success(`Bem-vindo(a), ${data.user.name.split(" ")[0]}!`);
    router.push(roleHome[data.user.role as string] ?? "/");
  }

  return (
    <Card className="w-full max-w-md border-2 border-foreground shadow-offset">
      <CardHeader>
        <CardTitle className="text-2xl">Bem-vindo de volta 👋</CardTitle>
        <CardDescription>Acesse sua conta do zCardapio.</CardDescription>
      </CardHeader>
      <div className="mx-6 mb-2 rounded-lg border-2 border-dashed border-foreground/20 bg-muted/40 p-3 text-xs text-muted-foreground">
        <p className="mb-1 font-semibold text-foreground">Contas de demonstração</p>
        <p>
          <strong>Cliente:</strong> mari.souza@gmail.com ·{" "}
          <strong>Restaurante:</strong> ze@burguerdoze.com.br ·{" "}
          <strong>Admin:</strong> admin@zcardapio.com.br
        </p>
        <p className="mt-1">
          Senha: <code className="font-bold text-primary">12345678</code>
        </p>
      </div>
      <CardContent>
        <Tabs value={profile} onValueChange={setProfile} className="mb-4">
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
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
                    <FormLabel>Senha</FormLabel>
                    <Link
                      href="/recuperar-senha"
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
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-primary hover:underline">
            Criar conta de cliente
          </Link>{" "}
          ou{" "}
          <Link
            href="/cadastro-restaurante"
            className="text-primary hover:underline"
          >
            cadastrar restaurante
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
