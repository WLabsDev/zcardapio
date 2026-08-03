"use client";

import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { isMenuTheme, menuThemeClass, type MenuThemeId } from "@/lib/menu-themes";
import type { Restaurant } from "@/lib/mock/types";
import { isDarkTheme, restaurantThemeVars } from "@/lib/theme";

const MenuThemeContext = createContext<MenuThemeId>("classico");

/** Tema estrutural ativo do cardápio público (ver src/lib/menu-themes.ts). */
export function useMenuTheme(): MenuThemeId {
  return useContext(MenuThemeContext);
}

/**
 * Aplica a paleta do restaurante no <html> para que os componentes renderizados
 * em portal (Dialog, Sheet, Select, DropdownMenu — que ficam fora do wrapper da
 * página) também herdem as cores e o tema escuro, e ativa a classe estrutural
 * do tema do cardápio (menu-theme-<id>).
 *
 * O conteúdo normal já recebe as variáveis via wrapper (SSR, sem flash); este
 * provider cobre os portais e limpa tudo ao desmontar, evitando que o tema
 * "vaze" para outras páginas. Também provê o tema via context (SSR-safe, pois
 * deriva direto da prop) para os componentes alternarem classes estruturais.
 */
export function RestaurantThemeProvider({
  restaurant,
  children,
}: {
  restaurant: Restaurant;
  children?: ReactNode;
}) {
  const theme: MenuThemeId = isMenuTheme(restaurant.menuTheme)
    ? restaurant.menuTheme
    : "classico";

  useEffect(() => {
    const root = document.documentElement;
    const vars = restaurantThemeVars(restaurant) as Record<string, string>;
    const applied: string[] = [];

    for (const [key, value] of Object.entries(vars)) {
      if (key.startsWith("--")) {
        root.style.setProperty(key, value);
        applied.push(key);
      }
    }

    const dark = isDarkTheme(restaurant);
    if (dark) root.classList.add("dark");

    const themeCls = menuThemeClass(theme);
    if (themeCls) root.classList.add(themeCls);

    return () => {
      for (const key of applied) root.style.removeProperty(key);
      if (dark) root.classList.remove("dark");
      if (themeCls) root.classList.remove(themeCls);
    };
  }, [restaurant, theme]);

  return (
    <MenuThemeContext.Provider value={theme}>
      {children}
    </MenuThemeContext.Provider>
  );
}
