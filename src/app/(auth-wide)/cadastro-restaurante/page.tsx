"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { AuthSplitShell } from "@/components/auth-split-shell";
import { formatPhone } from "@/lib/phone";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { plans } from "@/lib/mock/data";
import { formatBRL } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const steps = ["Seus dados", "Restaurante", "Plano"];

const UFS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const cadastroRestauranteSchema = z.object({
  nome: z.string().min(3, "Informe seu nome completo."),
  email: z.email("Informe um e-mail válido."),
  telefone: z.string().min(10, "Informe um telefone válido com DDD."),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
  restauranteNome: z.string().min(2, "Informe o nome do restaurante."),
  slug: z
    .string()
    .min(3, "Escolha o endereço do seu cardápio.")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens."),
  segmento: z.string().min(1, "Selecione o segmento."),
  endereco: z.string().min(5, "Informe o endereço."),
  cidade: z.string().min(2, "Informe a cidade."),
  estado: z.string().length(2, "Selecione o estado."),
});

type CadastroRestauranteValues = z.infer<typeof cadastroRestauranteSchema>;

const stepFields: Record<number, (keyof CadastroRestauranteValues)[]> = {
  0: ["nome", "email", "telefone", "senha"],
  1: ["restauranteNome", "slug", "segmento", "endereco", "cidade", "estado"],
  2: [],
};

export default function CadastroRestaurantePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState("pro");

  const form = useForm<CadastroRestauranteValues>({
    resolver: zodResolver(cadastroRestauranteSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      senha: "",
      restauranteNome: "",
      slug: "",
      segmento: "",
      endereco: "",
      cidade: "",
      estado: "",
    },
  });

  async function nextStep() {
    const valid = await form.trigger(stepFields[step]);
    if (valid) setStep((s) => s + 1);
  }

  async function onSubmit(values: CadastroRestauranteValues) {
    const res = await fetch("/api/auth/register-restaurant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, plano: selectedPlan }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      toast.error(data?.message ?? "Não foi possível concluir o cadastro.");
      return;
    }

    toast.success("Restaurante cadastrado! Bem-vindo ao zCardapio 🎉");
    router.push("/vendedor");
  }

  return (
    <AuthSplitShell>
      <div className="w-full max-w-2xl">
        {/* Stepper */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-sm font-semibold",
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "border-2 border-primary text-primary"
                      : "border text-muted-foreground",
                )}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-sm sm:block",
                  i === step ? "font-semibold" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
              {i < steps.length - 1 && (
                <div className="h-px w-8 bg-border sm:w-12" />
              )}
            </div>
          ))}
        </div>

        <Card className="border-2 border-foreground shadow-offset">
          <CardHeader>
            <CardTitle className="text-2xl">
              Cadastre seu restaurante 🍕
            </CardTitle>
            <CardDescription>
              {step === 0 && "Quem é o responsável pela conta?"}
              {step === 1 && "Conte sobre o seu restaurante."}
              {step === 2 && "Escolha o plano ideal — você pode mudar depois."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (step < steps.length - 1) {
                    nextStep();
                  } else {
                    form.handleSubmit(onSubmit)();
                  }
                }}
                className="grid gap-4"
                noValidate
              >
                {step === 0 && (
                  <>
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
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="telefone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Whatsapp</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="(11) 99999-9999"
                                autoComplete="tel"
                                {...field}
                                onChange={(e) => field.onChange(formatPhone(e.target.value))}
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
                                placeholder="••••••••"
                                autoComplete="new-password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <FormField
                      control={form.control}
                      name="restauranteNome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do restaurante</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex.: Burguer do Zé"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL do restaurante</FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                placeholder="burguer-do-ze"
                                className="max-w-56"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[^a-z0-9-]/g, ""),
                                  )
                                }
                              />
                            </FormControl>
                            <span className="text-sm text-muted-foreground">
                              .zcardapio.com.br
                            </span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="segmento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Segmento</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hamburgueria">
                                Hamburgueria
                              </SelectItem>
                              <SelectItem value="pizzaria">Pizzaria</SelectItem>
                              <SelectItem value="japonesa">Japonesa</SelectItem>
                              <SelectItem value="brasileira">
                                Brasileira
                              </SelectItem>
                              <SelectItem value="doceria">Doceria</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endereco"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Rua das Flores, 123 — Centro"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-[1fr_120px] gap-4">
                      <FormField
                        control={form.control}
                        name="cidade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input placeholder="São Paulo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="estado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="UF" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {UFS.map((uf) => (
                                  <SelectItem key={uf} value={uf}>
                                    {uf}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {plans.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlan(plan.id)}
                        className={cn(
                          "flex flex-col gap-2 rounded-xl border p-4 text-left",
                          selectedPlan === plan.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary"
                            : "hover:bg-muted",
                        )}
                      >
                        <span className="font-semibold">{plan.name}</span>
                        <span className="text-xl font-extrabold">
                          {plan.price === 0 ? "R$ 0" : formatBRL(plan.price)}
                          <span className="text-xs font-normal text-muted-foreground">
                            /mês
                          </span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {plan.description}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-2 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={step === 0}
                    onClick={() => setStep((s) => s - 1)}
                  >
                    Voltar
                  </Button>
                  {step < steps.length - 1 ? (
                    <Button
                      type="button"
                      className="rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
                      onClick={nextStep}
                    >
                      Continuar
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
                    >
                      Concluir cadastro
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AuthSplitShell>
  );
}
