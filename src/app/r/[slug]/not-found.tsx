import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RestaurantNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30 px-4 text-center">
      <span className="flex size-16 -rotate-3 items-center justify-center rounded-2xl border-2 border-foreground bg-accent shadow-offset-sm">
        <Store className="size-7" />
      </span>
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold">
          Cardápio não encontrado
        </h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          Este restaurante não existe no zCardápio ou o link está errado.
          Confira o endereço com o estabelecimento.
        </p>
      </div>
      <Button
        className="rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
        asChild
      >
        <Link href="/">
          <ArrowLeft className="size-4" />
          Voltar ao início
        </Link>
      </Button>
    </div>
  );
}
