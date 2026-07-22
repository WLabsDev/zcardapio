"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Printer,
  QrCode as QrCodeIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const steps = [
  {
    title: "Baixe e imprima",
    description: "Imprima em tamanho legível (mínimo 5x5 cm) — pode ser preto e branco.",
  },
  {
    title: "Cole nas mesas e no balcão",
    description: "Um QR code por mesa. Plastifique se quiser que dure mais.",
  },
  {
    title: "Cliente aponta e pede",
    description: "O cardápio abre direto no celular, sem baixar nada. O pedido chega no seu painel.",
  },
];

const origin = () => window.location.origin;
const subscribeNoop = () => () => {};
const fallbackOrigin = "https://zcardapio.com.br";
const QR_DOWNLOADED_KEY = "zcardapio:qrcode-downloaded";

export default function QrcodePage() {
  const qrWrapRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [restaurant, setRestaurant] = useState<{ name: string; slug: string }>({
    name: "",
    slug: "",
  });
  const liveOrigin = useSyncExternalStore(subscribeNoop, origin, () => fallbackOrigin);
  const menuUrl = `${liveOrigin}/r/${restaurant.slug}`;

  useEffect(() => {
    fetch("/api/vendedor/restaurant")
      .then((res) => res.json())
      .then((data) => {
        if (data?.restaurant) {
          setRestaurant({
            name: data.restaurant.name,
            slug: data.restaurant.slug,
          });
        }
      })
      .catch(() => {});
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  function downloadPng() {
    const svg = qrWrapRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.drawImage(img, 0, 0, 1024, 1024);
      const link = document.createElement("a");
      link.download = `qr-code-${restaurant.slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      localStorage.setItem(QR_DOWNLOADED_KEY, "true");
      window.dispatchEvent(new Event("storage"));
      toast.success("QR code baixado!");
    };
    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">QR code</h2>
        <p className="text-sm text-muted-foreground">
          Imprima e cole nas mesas: o cliente aponta o celular e o cardápio
          abre na hora.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* QR card */}
        <Card className="h-fit border-2 border-foreground shadow-offset">
          <CardHeader>
            <CardTitle className="text-base">{restaurant.name}</CardTitle>
            <CardDescription className="break-all">
              {menuUrl}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              ref={qrWrapRef}
              className="flex justify-center rounded-xl border-2 border-foreground/10 bg-white p-6"
            >
              <QRCode
                value={menuUrl}
                size={208}
                fgColor="#33261c"
                bgColor="#ffffff"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={copyLink}>
                {copied ? (
                  <Check className="size-4 text-primary" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied ? "Copiado" : "Copiar link"}
              </Button>
              <Button variant="outline" onClick={downloadPng}>
                <Download className="size-4" />
                Baixar PNG
              </Button>
            </div>
            <Button className="w-full" asChild>
              <Link href={`/r/${restaurant.slug}`} target="_blank">
                <ExternalLink className="size-4" />
                Testar link do cardápio
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* How to use */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Como usar</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {steps.map((s, i) => (
                <div key={s.title} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="flex size-9 shrink-0 -rotate-3 items-center justify-center rounded-lg border-2 border-foreground bg-accent font-display text-sm font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {s.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="flex items-start gap-3">
              <Printer className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Dica:</strong> depois de
                baixar o PNG, imprima quantas cópias quiser — o QR code nunca
                expira e continua o mesmo mesmo se você trocar o cardápio.
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-foreground/20 bg-card/60 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-foreground/15 bg-accent">
              <QrCodeIcon className="size-4.5" />
            </span>
            <p className="text-sm text-muted-foreground">
              O QR code aponta para{" "}
              <span className="font-medium text-primary">
                {restaurant.slug}.zcardapio.com.br
              </span>{" "}
              — o mesmo link do seu cardápio online.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
