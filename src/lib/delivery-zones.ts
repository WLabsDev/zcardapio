/**
 * Casamento entre o endereço digitado pelo cliente e as regiões de entrega
 * cadastradas pelo restaurante.
 *
 * O cliente não escolhe a região: se o endereço menciona uma região cadastrada,
 * vale a taxa dela; senão, vale a taxa padrão do restaurante. A mesma função
 * roda no checkout (para mostrar o valor) e na criação do pedido (que é quem
 * decide de verdade) — nunca deixe as duas divergirem.
 */

/** Minúsculas, sem acento e sem pontuação, para comparar "Jd. América" com "jardim america". */
export function normalizeZoneText(value: string): string {
  // NFD separa o acento da letra (á → a + ´) e o replace seguinte apaga o
  // acento solto. Sem esse passo o filtro final trocaria o acento por espaço e
  // "américa" viraria "ame rica".
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * A região cujo nome aparece no endereço. Compara palavra inteira — assim
 * "Sul" não casa com "Consulado" — e, havendo mais de uma, devolve a de nome
 * mais longo (a mais específica: "Jardim América" ganha de "Jardim").
 */
export function findZoneForAddress<T extends { name: string }>(
  address: string,
  zones: T[]
): T | undefined {
  const haystack = normalizeZoneText(address);
  if (!haystack) return undefined;

  return zones
    .filter((zone) => {
      const needle = normalizeZoneText(zone.name);
      if (!needle) return false;
      return new RegExp(`(^| )${escapeRegExp(needle)}( |$)`).test(haystack);
    })
    .sort((a, b) => b.name.length - a.name.length)[0];
}
