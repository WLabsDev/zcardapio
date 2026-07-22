/**
 * Envio de mensagens via WhatsApp usando a Evolution API self-hosted.
 * Configure no `.env` antes de subir pro servidor — sem essas variáveis, o
 * envio é pulado e a mensagem aparece só no log do servidor (facilita testar
 * sem uma instância real).
 *
 *   EVOLUTION_API_URL=https://sua-instancia.easypanel.host
 *   EVOLUTION_API_KEY=
 *   EVOLUTION_INSTANCE=
 *
 * Endpoint usado: POST {EVOLUTION_API_URL}/message/sendText/{EVOLUTION_INSTANCE}
 * Payload/nome de campos seguem a Evolution API v2; se a versão da sua
 * instância divergir, ajuste o corpo da requisição abaixo.
 */

function normalizeForWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, "");
  // Evolution API espera o número com DDI (Brasil = 55), sem "+" e sem sufixo.
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export async function sendWhatsAppMessage(phone: string, text: string) {
  const { EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE } = process.env;
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    console.warn(
      `[whatsapp] Evolution API não configurada — mensagem para ${phone} não enviada.\n${text}`
    );
    return;
  }

  const res = await fetch(
    `${EVOLUTION_API_URL}/message/sendText/${encodeURIComponent(EVOLUTION_INSTANCE)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: normalizeForWhatsApp(phone),
        text,
      }),
    }
  ).catch((e) => {
    console.error("[whatsapp] Falha ao enviar mensagem:", e);
    return null;
  });

  if (res && !res.ok) {
    console.error("[whatsapp] Evolution API respondeu com erro:", await res.text());
  }
}
