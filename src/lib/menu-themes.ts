/**
 * Registro de temas estruturais do cardápio público (/r/[slug]).
 * Cores/fonte/raio continuam sendo personalização por restaurante
 * (colunas próprias + restaurantThemeVars); o tema controla a
 * "assinatura visual" estrutural (bordas, sombras, densidade).
 *
 * Para adicionar um tema novo: registre aqui e trate as diferenças
 * estruturais nos componentes do cardápio via useMenuTheme() e/ou em
 * globals.css sob a classe `menu-theme-<id>` aplicada no <html>.
 */
export const MENU_THEMES = [
  {
    id: "classico",
    label: "Clássico",
    description: "O visual marcante do zCardápio: bordas fortes e sombras duras.",
  },
  {
    id: "clean",
    label: "Clean",
    description: "Moderno e leve: bordas finas, sombras suaves, sem inclinações.",
  },
] as const;

export type MenuThemeId = (typeof MENU_THEMES)[number]["id"];

export const MENU_THEME_IDS = MENU_THEMES.map((t) => t.id);

export function isMenuTheme(
  value: string | null | undefined
): value is MenuThemeId {
  return (MENU_THEME_IDS as string[]).includes(value ?? "");
}

/** Classe no <html> para o CSS estrutural do tema (Clássico = sem classe). */
export function menuThemeClass(theme: MenuThemeId | undefined): string | null {
  return theme && theme !== "classico" ? `menu-theme-${theme}` : null;
}
