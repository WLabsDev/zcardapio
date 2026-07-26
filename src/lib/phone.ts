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

/** Tira o DDI 55 quando ele veio junto (12 ou 13 dígitos: 55 + DDD + número). */
function stripCountryCode(digits: string): string {
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return digits.slice(2);
  }
  return digits;
}

/**
 * Forma canônica do telefone: celular brasileiro sempre com o nono dígito.
 *
 * Desde 2016 o celular tem 9 dígitos (DDD + 9 + 8 dígitos), mas muita gente
 * ainda digita o número antigo, de 8. "11 8765-4321" e "11 98765-4321" são a
 * mesma pessoa — sem canonizar, quem se cadastra com o 9 não consegue entrar
 * digitando sem ele.
 *
 * Fixo (o número começa em 2–5) não leva o nono dígito e fica como está.
 */
export function canonicalPhone(phone: string): string {
  const digits = stripCountryCode(normalizePhone(phone));
  if (digits.length !== 10) return digits;
  // Celular antigo: DDD + 8 dígitos começando em 6, 7, 8 ou 9.
  return /^[6-9]/.test(digits.slice(2)) ? `${digits.slice(0, 2)}9${digits.slice(2)}` : digits;
}

/**
 * As grafias equivalentes do mesmo número, para procurar no banco. Contas
 * antigas podem ter sido salvas sem o nono dígito, então a busca precisa
 * aceitar as duas — não dá para confiar só na forma canônica.
 */
export function phoneVariants(phone: string): string[] {
  const canonical = canonicalPhone(phone);
  const variants = new Set([canonical, normalizePhone(phone)]);

  // Celular com o 9: aceita também a grafia antiga, sem ele.
  if (canonical.length === 11 && canonical[2] === "9") {
    variants.add(`${canonical.slice(0, 2)}${canonical.slice(3)}`);
  }
  variants.delete("");
  return [...variants];
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
