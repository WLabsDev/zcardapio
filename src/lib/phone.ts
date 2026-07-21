/**
 * Normaliza um telefone/WhatsApp para apenas dígitos (ex.: "(11) 99999-1234"
 * vira "11999991234"), garantindo comparação consistente no login/cadastro.
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}
