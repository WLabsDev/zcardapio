/**
 * Normaliza um telefone/WhatsApp para apenas dígitos (ex.: "(11) 99999-1234"
 * vira "11999991234"), garantindo comparação consistente no login/cadastro.
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Formata progressivamente os dígitos como um WhatsApp brasileiro enquanto o
 * usuário digita: "(11) 9999-1234" (fixo, 10 dígitos) ou "(11) 99999-1234"
 * (celular, 11 dígitos).
 */
export function formatPhone(value: string): string {
  const digits = normalizePhone(value).slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Número pronto para WhatsApp: só dígitos e com o DDI do Brasil (55) na frente.
 * Não duplica o 55 se o vendedor já tiver digitado o DDI.
 */
export function toWhatsAppNumber(phone: string): string {
  const digits = normalizePhone(phone);
  if (!digits) return "";
  return digits.startsWith("55") ? digits : `55${digits}`;
}

/**
 * Link wa.me para abrir a conversa, opcionalmente com mensagem pronta.
 * Retorna string vazia quando não há número — quem chama decide se esconde o
 * botão.
 */
export function whatsappLink(phone: string, text?: string): string {
  const number = toWhatsAppNumber(phone);
  if (!number) return "";
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
