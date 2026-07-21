"use client";

import { useEffect } from "react";
import type { Restaurant } from "@/lib/mock/types";
import { isDarkTheme, restaurantThemeVars } from "@/lib/theme";

/**
 * Aplica a paleta do restaurante no <html> para que os componentes renderizados
 * em portal (Dialog, Sheet, Select, DropdownMenu — que ficam fora do wrapper da
 * página) também herdem as cores e o tema escuro.
 *
 * O conteúdo normal já recebe as variáveis via wrapper (SSR, sem flash); este
 * provider cobre os portais e limpa tudo ao desmontar, evitando que o tema
 * "vaze" para outras páginas.
 */
export function RestaurantThemeProvider({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
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

    return () => {
      for (const key of applied) root.style.removeProperty(key);
      if (dark) root.classList.remove("dark");
    };
  }, [restaurant]);

  return null;
}
