import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Imagem de preview (Open Graph) gerada dinamicamente — aparece ao compartilhar
// o link em WhatsApp/Facebook/etc. Cores aproximadas do tema (oklch → hex).
export default function OpengraphImage() {
  const cream = "#f7f2ea";
  const ink = "#33261c";
  const primary = "#d6482a";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: cream,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "78px",
              height: "78px",
              backgroundColor: primary,
              border: `5px solid ${ink}`,
              borderRadius: "20px",
              color: "#ffffff",
              fontSize: "46px",
              fontWeight: 800,
            }}
          >
            z
          </div>
          <span style={{ fontSize: "48px", fontWeight: 800, color: ink }}>
            zCardápio
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span
            style={{ fontSize: "86px", fontWeight: 800, color: ink, lineHeight: 1.02 }}
          >
            Cardápio digital
          </span>
          <span
            style={{ fontSize: "86px", fontWeight: 800, color: primary, lineHeight: 1.02 }}
          >
            sem comissão.
          </span>
        </div>

        <div
          style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: "34px", color: ink }}
        >
          <span>QR code na mesa</span>
          <span style={{ color: primary }}>·</span>
          <span>Pedidos no painel</span>
          <span style={{ color: primary }}>·</span>
          <span>Do seu jeito</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
