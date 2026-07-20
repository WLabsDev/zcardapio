import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 font-display font-bold text-xl",
        className
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <UtensilsCrossed className="size-4.5" />
      </span>
      <span>
        z<span className="text-primary">Cardapio</span>
      </span>
    </Link>
  );
}
