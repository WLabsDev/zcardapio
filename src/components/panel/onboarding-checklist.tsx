"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
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

type Step = {
  icon: typeof BookOpen;
  title: string;
  description: string;
  href: string;
  done: boolean;
};

/** Estado real do restaurante usado para marcar cada passo como concluído. */
type Status = {
  productCount: number;
  appearanceDone: boolean;
  deliveryDone: boolean;
};

const STORAGE_KEY = "zcardapio:onboarding-dismissed";
const QR_DOWNLOADED_KEY = "zcardapio:qrcode-downloaded";

const subscribeStorage = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};
const getDismissedSnapshot = () =>
  localStorage.getItem(STORAGE_KEY) === "true";
const getDismissedServerSnapshot = () => false;
const getQrDoneSnapshot = () =>
  localStorage.getItem(QR_DOWNLOADED_KEY) === "true";
const getQrDoneServerSnapshot = () => false;

export function OnboardingChecklist() {
  const storedDismissed = useSyncExternalStore(
    subscribeStorage,
    getDismissedSnapshot,
    getDismissedServerSnapshot
  );
  const qrDone = useSyncExternalStore(
    subscribeStorage,
    getQrDoneSnapshot,
    getQrDoneServerSnapshot
  );
  const [justDismissed, setJustDismissed] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);

  // Busca o estado real do restaurante (produtos, aparência, entrega) para o
  // checklist refletir o progresso de verdade, não valores fixos.
  useEffect(() => {
    if (storedDismissed) return;
    let active = true;
    Promise.all([
      fetch("/api/vendedor/products")
        .then((r) => r.json())
        .catch(() => null),
      fetch("/api/vendedor/restaurant")
        .then((r) => r.json())
        .catch(() => null),
      fetch("/api/vendedor/delivery-zones")
        .then((r) => r.json())
        .catch(() => null),
    ]).then(([productsData, restaurantData, zonesData]) => {
      if (!active) return;
      setStatus({
        productCount: productsData?.products?.length ?? 0,
        // primaryColor só é gravado quando o vendedor salva a aparência.
        appearanceDone: !!restaurantData?.restaurant?.primaryColor,
        deliveryDone: (zonesData?.zones?.length ?? 0) > 0,
      });
    });
    return () => {
      active = false;
    };
  }, [storedDismissed]);

  if (storedDismissed || justDismissed) return null;

  if (!status) {
    return (
      <div className="rounded-2xl border-2 border-foreground bg-card p-5 shadow-offset">
        <p className="text-sm text-muted-foreground">
          Carregando seu progresso...
        </p>
      </div>
    );
  }

  const steps: Step[] = [
    {
      icon: BookOpen,
      title: "Adicione seus produtos",
      description:
        status.productCount > 0
          ? `${status.productCount} produto${status.productCount === 1 ? "" : "s"} cadastrado${status.productCount === 1 ? "" : "s"} no seu cardápio.`
          : "Cadastre os produtos do seu cardápio.",
      href: "/vendedor/cardapio",
      done: status.productCount > 0,
    },
    {
      icon: Palette,
      title: "Deixe com a sua cara",
      description: status.appearanceDone
        ? "Logo, capa e cores personalizadas."
        : "Personalize logo, capa e cor principal.",
      href: "/vendedor/aparencia",
      done: status.appearanceDone,
    },
    {
      icon: QrCode,
      title: "Imprima o QR code",
      description: "Cole nas mesas e o cliente pede sozinho.",
      href: "/vendedor/qrcode",
      done: qrDone,
    },
    {
      icon: Settings2,
      title: "Ajuste a entrega",
      description: status.deliveryDone
        ? "Regiões e taxas de entrega configuradas."
        : "Configure regiões, taxa e pedido mínimo.",
      href: "/vendedor/configuracoes",
      done: status.deliveryDone,
    },
  ];

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
