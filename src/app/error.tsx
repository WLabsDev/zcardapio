"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <span className="flex size-16 rotate-3 items-center justify-center rounded-2xl border-2 border-foreground bg-accent font-display text-2xl font-bold shadow-offset-sm">
        😵
      </span>
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold">
          Algo queimou na cozinha.
        </h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          Ocorreu um erro inesperado nesta página. Tente de novo — se
          persistir, recarregue o navegador.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          className="rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
          onClick={() => unstable_retry()}
        >
          <RotateCcw className="size-4" />
          Tentar de novo
        </Button>
        <Button
          variant="outline"
          className="rounded-full border-2 border-foreground font-semibold"
          asChild
        >
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  );
}
