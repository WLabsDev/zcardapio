import { ImageResponse } from "next/og";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Artigo do blog do zCardápio";

// Imagem de preview gerada por post — aparece ao compartilhar o link no
// WhatsApp/Facebook. Cores do tema (aproximadas de oklch → hex), mesmo padrão
// da OG image da home.
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await db.query.posts.findFirst({
    where: and(eq(posts.slug, slug), eq(posts.published, true)),
  });
  const title = post?.title ?? "Blog do zCardápio";

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
          <span style={{ fontSize: "44px", fontWeight: 800, color: ink }}>
            zCardápio
          </span>
          <span
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: primary,
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            blog
          </span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: title.length > 60 ? "56px" : "72px",
            fontWeight: 800,
            color: ink,
            lineHeight: 1.08,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", fontSize: "30px", color: ink }}>
          zcardapio.com.br/blog
        </div>
      </div>
    ),
    { ...size }
  );
}
