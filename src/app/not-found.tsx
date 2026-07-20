import Link from "next/link";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <Logo />
      <div className="space-y-4">
        <p className="relative inline-block font-display text-8xl font-bold tracking-tight">
          404
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-2 -z-10 h-5 -rotate-1 rounded-sm bg-primary/25"
          />
        </p>
        <h1 className="font-display text-2xl font-bold">
          Essa página saiu do cardápio.
        </h1>
        <p className="mx-auto max-w-sm text-muted-foreground">
          O endereço que você tentou acessar não existe ou foi removido. Que
          tal voltar para um lugar com coisas boas?
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          size="lg"
          className="rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
          asChild
        >
          <Link href="/">
            <ArrowLeft className="size-4" />
            Voltar ao início
          </Link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full border-2 border-foreground font-semibold"
          asChild
        >
          <Link href="/r/burguer-do-ze">
            <UtensilsCrossed className="size-4" />
            Ver um cardápio real
          </Link>
        </Button>
      </div>
    </div>
  );
}
