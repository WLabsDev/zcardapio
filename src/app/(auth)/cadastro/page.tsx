"use client";

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

const cadastroSchema = z.object({
  nome: z.string().min(3, "Informe seu nome completo."),
  email: z.email("Informe um e-mail válido."),
  telefone: z.string().min(10, "Informe um telefone válido com DDD."),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

type CadastroValues = z.infer<typeof cadastroSchema>;

export default function CadastroClientePage() {
  const router = useRouter();

  const form = useForm<CadastroValues>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { nome: "", email: "", telefone: "", senha: "" },
  });

  async function onSubmit(values: CadastroValues) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      toast.error(data?.message ?? "Não foi possível criar a conta.");
      return;
    }

    toast.success("Conta criada com sucesso!");
    router.push("/cliente");
  }

  return (
    <Card className="w-full max-w-md border-2 border-foreground shadow-offset">
      <CardHeader>
        <CardTitle className="text-2xl">Crie sua conta 🍔</CardTitle>
        <CardDescription>
          Peça nos seus restaurantes favoritos e acompanhe seus pedidos.
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
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone / WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(11) 99999-9999"
                      autoComplete="tel"
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
              size="lg"
              className="rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
            >
              Criar conta
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
