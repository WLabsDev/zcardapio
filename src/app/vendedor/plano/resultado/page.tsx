"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type State = "loading" | "activated" | "pending" | "failed";

function ResultContent() {
  const params = useSearchParams();
  const outcome = params.get("outcome");
  const paymentId = params.get("collection_id") ?? params.get("payment_id");

  // Sem paymentId já sabemos o resultado (não há o que buscar).
  const [state, setState] = useState<State>(() =>
    paymentId ? "loading" : outcome === "failure" ? "failed" : "pending"
  );
  const [message, setMessage] = useState(() =>
    paymentId
      ? ""
      : outcome === "failure"
        ? "O pagamento não foi concluído."
        : "Nenhum pagamento identificado."
  );

  const verify = useCallback(() => {
    if (!paymentId) return;
    fetch("/api/vendedor/plan/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    })
      .then((res) => res.json().catch(() => null))
      .then((data) => {
        if (data?.activated) {
          setState("activated");
          return;
        }
        const msg = data?.message ?? "";
        if (msg.includes("não aprovado") || outcome === "pending") {
          setState("pending");
          setMessage(msg || "Pagamento aguardando confirmação.");
        } else {
          setState("failed");
          setMessage(msg || "Não foi possível confirmar o pagamento.");
        }
      })
      .catch(() => {
        setState("failed");
        setMessage("Não foi possível confirmar o pagamento.");
      });
  }, [paymentId, outcome]);

  useEffect(verify, [verify]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-10">
      <Card className="w-full border-2">
        <CardContent className="flex flex-col items-center gap-4 text-center">
          {state === "loading" && (
            <>
              <Loader2 className="size-10 animate-spin text-primary" />
              <h2 className="font-display text-xl font-bold">
                Confirmando pagamento...
              </h2>
              <p className="text-sm text-muted-foreground">
                Estamos verificando o status do seu pagamento.
              </p>
            </>
          )}

          {state === "activated" && (
            <>
              <CheckCircle2 className="size-10 text-emerald-500" />
              <h2 className="font-display text-xl font-bold">Plano ativado! 🎉</h2>
              <p className="text-sm text-muted-foreground">
                Seu pagamento foi confirmado e os recursos do plano já estão
                liberados por 30 dias.
              </p>
            </>
          )}

          {state === "pending" && (
            <>
              <Clock3 className="size-10 text-amber-500" />
              <h2 className="font-display text-xl font-bold">
                Pagamento pendente
              </h2>
              <p className="text-sm text-muted-foreground">
                {message ||
                  "Assim que o pagamento for confirmado, seu plano é ativado automaticamente."}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setState("loading");
                  verify();
                }}
              >
                Verificar pagamento
              </Button>
            </>
          )}

          {state === "failed" && (
            <>
              <XCircle className="size-10 text-destructive" />
              <h2 className="font-display text-xl font-bold">
                Pagamento não concluído
              </h2>
              <p className="text-sm text-muted-foreground">
                {message || "Tente novamente escolhendo outro plano."}
              </p>
            </>
          )}

          <Button asChild type="button">
            <Link href="/vendedor">Voltar ao painel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PlanoResultadoPage() {
  return (
    <Suspense
      fallback={
        <p className="py-10 text-center text-sm text-muted-foreground">
          Carregando...
        </p>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
