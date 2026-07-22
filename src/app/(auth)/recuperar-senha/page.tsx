"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, MailCheck } from "lucide-react";
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

const recuperarSchema = z.object({
  email: z.email("Informe um e-mail válido."),
});

type RecuperarValues = z.infer<typeof recuperarSchema>;

export default function RecuperarSenhaPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const form = useForm<RecuperarValues>({
    resolver: zodResolver(recuperarSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: RecuperarValues) {
    setSending(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).catch(() => null);
    setSending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <Card className="w-full max-w-md border-2 border-foreground shadow-offset">
        <CardContent className="flex flex-col items-center gap-4 pt-10 text-center">
          <span className="flex size-16 -rotate-6 items-center justify-center rounded-2xl border-2 border-foreground bg-accent shadow-offset-sm">
            <MailCheck className="size-7 text-primary" />
          </span>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold">
              Confira seu e-mail 📬
            </h1>
            <p className="text-sm text-muted-foreground">
              Se existir uma conta com{" "}
              <strong className="text-foreground">
                {form.getValues("email")}
              </strong>
              , você receberá um link para redefinir sua senha em alguns
              minutos. Não esqueça de olhar a caixa de spam.
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-2 border-foreground font-semibold"
            asChild
          >
            <Link href="/login">
              <ArrowLeft className="size-4" />
              Voltar para o login
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-2 border-foreground shadow-offset">
      <CardHeader>
        <CardTitle className="text-2xl">Esqueceu a senha? 🔑</CardTitle>
        <CardDescription>
          Informe o e-mail da sua conta e enviaremos um link para você criar
          uma nova.
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
            <Button
              type="submit"
              size="lg"
              disabled={sending}
              className="rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
            >
              {sending ? "Enviando..." : "Enviar link de recuperação"}
            </Button>
          </form>
        </Form>
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
