"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Palette,
  QrCode,
  Settings2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: BookOpen,
    title: "Adicione seus produtos",
    description: "8 produtos cadastrados no seu cardápio.",
    href: "/vendedor/cardapio",
    done: true,
  },
  {
    icon: Palette,
    title: "Deixe com a sua cara",
    description: "Logo, capa e cor principal configurados.",
    href: "/vendedor/aparencia",
    done: true,
  },
  {
    icon: QrCode,
    title: "Imprima o QR code",
    description: "Cole nas mesas e o cliente pede sozinho.",
    href: "/vendedor/qrcode",
    done: false,
  },
  {
    icon: Settings2,
    title: "Ajuste a entrega",
    description: "Taxa, pedido mínimo e horários de funcionamento.",
    href: "/vendedor/configuracoes",
    done: false,
  },
];

const STORAGE_KEY = "zcardapio:onboarding-dismissed";

const subscribeStorage = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};
const getDismissedSnapshot = () =>
  localStorage.getItem(STORAGE_KEY) === "true";
const getDismissedServerSnapshot = () => false;

export function OnboardingChecklist() {
  const storedDismissed = useSyncExternalStore(
    subscribeStorage,
    getDismissedSnapshot,
    getDismissedServerSnapshot
  );
  const [justDismissed, setJustDismissed] = useState(false);

  if (storedDismissed || justDismissed) return null;

  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="rounded-2xl border-2 border-foreground bg-card p-5 shadow-offset">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold">
            Deixando seu restaurante pronto 🚀
          </h3>
          <p className="text-sm text-muted-foreground">
            {doneCount} de {steps.length} passos concluídos — falta pouco para
            começar a vender.
          </p>
        </div>
        <button
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "true");
            setJustDismissed(true);
          }}
          aria-label="Dispensar guia"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full border border-foreground/20 bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {steps.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className={cn(
              "group flex items-start gap-3 rounded-xl border-2 border-foreground/15 p-3 transition-all hover:-translate-y-0.5 hover:border-foreground hover:shadow-offset-sm",
              s.done && "bg-muted/40"
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-foreground",
                s.done ? "bg-primary text-primary-foreground" : "bg-accent"
              )}
            >
              {s.done ? <Check className="size-4" /> : <s.icon className="size-4" />}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "flex items-center gap-1.5 text-sm font-semibold",
                  s.done && "text-muted-foreground line-through decoration-primary/60"
                )}
              >
                {s.title}
                {!s.done && (
                  <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {s.description}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
