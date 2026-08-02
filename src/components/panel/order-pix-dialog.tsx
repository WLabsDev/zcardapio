"use client";

import { useState } from "react";
import { Copy, MessageCircle, QrCode } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { copyText } from "@/lib/clipboard";
import { formatBRL } from "@/lib/mock/types";
import { whatsappLink } from "@/lib/phone";

type Pix = { brCode: string; qrImage: string };

/**
 * Retoma o pagamento Pix de um pedido pendente. O QR não é guardado no banco:
 * é regerado sob demanda pela API a partir do pedido — o BR Code estático é
 * sempre o mesmo para a mesma chave, valor e código de pedido.
 *
 * Só faz sentido para pedido `pendente` pago no Pix; quem decide isso é o card
 * que renderiza este botão.
 */
export function OrderPixDialog({
  orderId,
  orderCode,
  total,
  restaurantPhone,
}: {
  orderId: string;
  orderCode: string;
  total: number;
  /** sem telefone cadastrado, o botão de comprovante não aparece */
  restaurantPhone?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pix, setPix] = useState<Pix | null>(null);
  const [loading, setLoading] = useState(false);

  async function openDialog() {
    setOpen(true);
    if (pix || loading) return;
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}/pix`).catch(() => null);
    const data = await res?.json().catch(() => null);
    setLoading(false);
    if (!res?.ok || !data?.pix) {
      setOpen(false);
      toast.error(data?.message ?? "Não foi possível gerar o Pix agora.");
      return;
    }
    setPix(data.pix);
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        className="rounded-full font-semibold"
        onClick={openDialog}
      >
        <QrCode className="size-3.5" />
        Pagar com Pix
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Pagar {formatBRL(total)} com Pix</DialogTitle>
            <DialogDescription>
              Pedido {orderCode}. O valor cai direto na conta do restaurante.
            </DialogDescription>
          </DialogHeader>

          {loading || !pix ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Gerando o código...
            </p>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pix.qrImage}
                alt={`QR Code Pix do pedido ${orderCode}`}
                className="size-48 rounded-lg border"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={async () => {
                  const ok = await copyText(pix.brCode);
                  toast[ok ? "success" : "error"](
                    ok ? "Código Pix copiado!" : "Não foi possível copiar.",
                  );
                }}
              >
                <Copy className="size-4" />
                Pix copia e cola
              </Button>
              {restaurantPhone?.trim() && (
                <Button
                  className="w-full rounded-full font-semibold"
                  asChild
                >
                  <a
                    href={whatsappLink(
                      restaurantPhone,
                      `Olá! Segue o comprovante do pedido ${orderCode} no valor de ${formatBRL(total)}.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="size-4" />
                    Enviar comprovante no WhatsApp
                  </a>
                </Button>
              )}
              <p className="text-center text-xs text-muted-foreground">
                Já pagou? Envie o comprovante no WhatsApp e o restaurante
                confirma o pedido assim que identificar o pagamento.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
