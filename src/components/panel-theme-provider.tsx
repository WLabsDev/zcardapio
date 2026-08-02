"use client";

import { useEffect } from "react";

const THEME_CLASS = "panel-theme";

/**
 * Aplica o tema limpo dos painéis (tokens neutros + laranja da marca) no
 * <html> enquanto um layout de painel limpo (/vendedor ou /admin) estiver
 * montado. Os tokens ficam em globals.css sob html.panel-theme; a classe no
 * <html> garante que portais (Dialog, Sheet, Select, DropdownMenu, toasts)
 * também herdem o tema. Remove a classe ao desmontar, para o tema não vazar
 * para outras áreas (mesmo padrão do RestaurantThemeProvider).
 */
export function PanelThemeProvider() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add(THEME_CLASS);
    return () => root.classList.remove(THEME_CLASS);
  }, []);

  return null;
}
