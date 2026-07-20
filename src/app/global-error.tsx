"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f8f5f0",
          color: "#2b2118",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", margin: "0 0 0.5rem" }}>
            Algo deu errado.
          </h1>
          <p style={{ color: "#6b5d4f", margin: "0 0 1.5rem" }}>
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <button
            onClick={() => unstable_retry()}
            style={{
              padding: "0.6rem 1.4rem",
              borderRadius: "9999px",
              border: "2px solid #2b2118",
              background: "#ea580c",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tentar de novo
          </button>
        </div>
      </body>
    </html>
  );
}
