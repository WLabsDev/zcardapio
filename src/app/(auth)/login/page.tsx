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

export default function LoginPage() {
  const router = useRouter();
  const [profile, setProfile] = useState("cliente");

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
  });

  const destination =
    profile === "restaurante"
      ? "/vendedor"
      : profile === "admin"
        ? "/admin"
        : "/cliente";

  function onSubmit() {
    toast.success("Login realizado!");
    router.push(destination);
  }

  return (
    <Card className="w-full max-w-md border-2 border-foreground shadow-offset">
      <CardHeader>
        <CardTitle className="text-2xl">Bem-vindo de volta 👋</CardTitle>
        <CardDescription>
          Acesse sua conta do zCardapio. (Demonstração — qualquer dado válido
          entra.)
        </CardDescription>
      </CardHeader>
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
