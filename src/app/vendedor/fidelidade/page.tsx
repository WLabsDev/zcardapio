"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoyaltyCoupons } from "@/components/panel/loyalty-coupons";
import { LoyaltyManager, type LoyaltyProgram } from "@/components/panel/loyalty-manager";
import { ProGate } from "@/components/panel/pro-gate";
import { Separator } from "@/components/ui/separator";

export default function FidelidadePage() {
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [isFree, setIsFree] = useState<boolean | null>(null);

  const load = () => {
    fetch("/api/vendedor/loyalty")
      .then((res) => res.json())
      .then((data) => {
        setProgram(data.program);
        setIsFree(data.isFree);
      })
      .catch(() => toast.error("Não foi possível carregar a fidelidade."));
  };

  useEffect(load, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Fidelidade
        </h2>
        <p className="text-sm text-muted-foreground">
          Escolha uma mecânica para recompensar clientes que voltam a pedir.
        </p>
      </div>

      {!program || isFree === null ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <>
          <ProGate
            active={isFree}
            message="Fidelização de clientes é um benefício dos planos pagos."
          >
            <LoyaltyManager program={program} onSaved={load} />
          </ProGate>

          {/* Fora do ProGate de propósito: quem já teve fidelidade e caiu para
              o plano grátis ainda precisa enxergar os cupons em circulação. */}
          <Separator />
          <LoyaltyCoupons />
        </>
      )}
    </div>
  );
}
