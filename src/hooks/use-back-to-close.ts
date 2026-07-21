"use client";

import { useEffect, useRef } from "react";

/**
 * Faz o botão "voltar" do navegador fechar um modal/overlay em vez de sair da
 * página — comportamento esperado no mobile.
 *
 * Ao abrir, empurra uma entrada no histórico; quando o usuário volta (popstate),
 * essa entrada é consumida e `onClose` é chamado. Se o modal for fechado por
 * outro meio (botão, ESC, overlay), a entrada empurrada é removida com
 * history.back() para manter a pilha de histórico consistente.
 */
export function useBackToClose(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!open) return;

    window.history.pushState({ backToClose: true }, "");
    pushedRef.current = true;

    const onPopState = () => {
      if (pushedRef.current) {
        pushedRef.current = false;
        onCloseRef.current();
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      // Fechou por outro meio (botão/ESC/overlay) sem consumir a entrada →
      // remove-a para o próximo "voltar" não ficar "preso" aqui.
      if (pushedRef.current) {
        pushedRef.current = false;
        window.history.back();
      }
    };
  }, [open]);
}
