import { readFile } from "node:fs/promises";
import path from "node:path";

const CONTENT_TYPE: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/**
 * Serve os uploads (logos, capas, fotos de produtos) gravados em
 * public/uploads. Em produção o `next start` NÃO serve arquivos adicionados ao
 * public/ em runtime (retorna 404), então esta rota é quem entrega as imagens.
 * No Docker, public/uploads deve ser um volume persistente.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  // Sanitiza contra path traversal (o nome vem como segmento único da URL).
  const safeName = path.basename(name);
  if (!safeName || safeName !== name || safeName.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", "uploads", safeName);
  const buffer = await readFile(filePath).catch(() => null);
  if (!buffer) {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(safeName).toLowerCase();
  return new Response(buffer, {
    headers: {
      "Content-Type": CONTENT_TYPE[ext] ?? "application/octet-stream",
      // Nomes são UUIDs imutáveis → pode cachear agressivamente.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
