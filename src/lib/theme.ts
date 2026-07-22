import type { CSSProperties } from "react";
import type { Restaurant } from "@/lib/mock/types";

const FONT_DISPLAY: Record<NonNullable<Restaurant["font"]>, string> = {
  bricolage: "var(--font-bricolage)",
  jakarta: "var(--font-jakarta)",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

/** Luminância relativa (0–1) de um hex, para decidir o texto sobre a cor. */
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const channel = (offset: number) => {
    const c = parseInt(h.substring(offset, offset + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/**
 * Variáveis CSS que personalizam o cardápio público de um restaurante.
 * - --primary / --primary-foreground: cor de destaque e o texto sobre ela
 *   (calculado por luminância para garantir contraste nos dois temas).
 * - --heading, --foreground, --muted-foreground, --background, --card:
 *   paleta personalizada; quando vazia, vale o padrão do tema claro/escuro.
 * - background opaco para o tema escuro não "vazar" o fundo claro do body.
 */
export function restaurantThemeVars(restaurant: Restaurant): CSSProperties {
  const font = restaurant.font ?? "bricolage";
  const buttonStyle = restaurant.buttonStyle ?? "arredondado";
  const primary = restaurant.primaryColor ?? "#ea580c";
  const onPrimary = luminance(primary) > 0.45 ? "#1c1917" : "#fafaf9";

  const vars: Record<string, string> = {
    "--primary": primary,
    "--primary-foreground": onPrimary,
    "--ring": primary,
    "--font-display": FONT_DISPLAY[font],
    "--radius": buttonStyle === "reto" ? "0.125rem" : "0.625rem",
    background: "var(--background)",
  };

  if (restaurant.headingColor) vars["--heading"] = restaurant.headingColor;
  if (restaurant.productTitleColor)
    vars["--product-title"] = restaurant.productTitleColor;
  if (restaurant.bodyColor) {
    // --card-foreground e --popover-foreground não herdam de --foreground no
    // CSS base (são tokens independentes), então textos dentro de Card/Select
    // ficavam com a cor padrão em vez da cor de corpo escolhida pelo vendedor.
    vars["--foreground"] = restaurant.bodyColor;
    vars["--card-foreground"] = restaurant.bodyColor;
    vars["--popover-foreground"] = restaurant.bodyColor;
  }
  if (restaurant.mutedColor) vars["--muted-foreground"] = restaurant.mutedColor;
  if (restaurant.bgColor) vars["--background"] = restaurant.bgColor;
  if (restaurant.cardColor) vars["--card"] = restaurant.cardColor;
  if (restaurant.badgeColor) {
    vars["--badge"] = restaurant.badgeColor;
    vars["--badge-foreground"] =
      luminance(restaurant.badgeColor) > 0.45 ? "#1c1917" : "#fafaf9";
  }
  // Texto do badge: se definido, tem prioridade sobre o contraste automático.
  if (restaurant.badgeTextColor) {
    vars["--badge-foreground"] = restaurant.badgeTextColor;
  }

  return vars as CSSProperties;
}

export function isDarkTheme(restaurant: Restaurant): boolean {
  return restaurant.theme === "escuro";
}
