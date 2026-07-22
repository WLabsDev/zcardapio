import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  imgClassName,
  href = "/",
}: {
  className?: string;
  imgClassName?: string;
  href?: string;
}) {
  return (
    <Link href={href} className={cn("group inline-flex items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-zcardapio.webp"
        alt="zCardápio"
        className={cn(
          "h-9 w-auto select-none transition-transform duration-200 group-hover:scale-[1.04]",
          imgClassName
        )}
      />
    </Link>
  );
}
