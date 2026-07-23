"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
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

const setPasswordSchema = z
  .object({
    novaSenha: z.string().min(8, "A senha precisa de pelo menos 8 caracteres."),
    confirmarSenha: z.string().min(8, "Confirme sua senha."),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: "As senhas não conferem.",
    path: ["confirmarSenha"],
  });

type SetPasswordValues = z.infer<typeof setPasswordSchema>;

/**
 * Formulário de "definir senha" do primeiro acesso (conta criada no pedido).
 * Compartilhado entre a página /login e o modal de login do restaurante.
 * `onSuccess` fica a cargo de quem chama (redirecionar ou fechar o modal).
 */
export function SetPasswordForm({
  phone,
  onBack,
  onSuccess,
}: {
  phone: string;
  onBack: () => void;
  onSuccess: (user: { name: string; role: string }) => void;
}) {
  const [settingPass, setSettingPass] = useState(false);

  const form = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { novaSenha: "", confirmarSenha: "" },
  });

  async function onSubmit(values: SetPasswordValues) {
    setSettingPass(true);
    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, senha: values.novaSenha }),
    });
    const data = await res.json().catch(() => null);
    setSettingPass(false);
    if (!res.ok || !data?.user) {
      toast.error(data?.message ?? "Não foi possível definir a senha.");
      return;
    }
    toast.success(`Senha definida! Bem-vindo(a), ${data.user.name.split(" ")[0]}!`);
    onSuccess(data.user);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="novaSenha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nova senha</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmarSenha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar senha</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
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
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
      </form>
    </Form>
  );
}
