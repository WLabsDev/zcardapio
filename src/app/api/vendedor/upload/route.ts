import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { optimizeUploadedImage } from "@/lib/image-optimize";
import { requireVendedorRestaurant } from "@/lib/vendedor";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { apiHandler } from "@/lib/api";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const EXT_BY_DETECTED: Record<"jpeg" | "png" | "webp", "jpg" | "png" | "webp"> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
};

/**
 * Detecta o tipo real da imagem pelos magic bytes (assinatura binária), sem
 * confiar no MIME enviado pelo cliente (que pode ser forjado). Retorna null se
 * o conteúdo não for um JPG/PNG/WebP válido.
 */
function detectImageType(bytes: Uint8Array): "jpeg" | "png" | "webp" | null {
  if (bytes.length < 12) return null;
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }
  // WebP: "RIFF" nos bytes 0-3 e "WEBP" nos bytes 8-11
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

export const POST = apiHandler(async (request: Request) => {
  const { error } = await requireVendedorRestaurant();
  if (error) return error;

  // Evita abuso (ex.: encher o disco): no máx. 30 uploads/minuto por IP.
  const rl = rateLimit(`upload:${clientIp(request)}`, 30, 60_000);
  if (!rl.ok) {
    return Response.json(
      { message: "Muitos envios. Aguarde instantes e tente novamente." },
      { status: 429 }
    );
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return Response.json({ message: "Envie um arquivo." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_SIZE) {
    return Response.json(
      { message: "Imagem muito grande — máximo de 5MB." },
      { status: 400 }
    );
  }

  // Valida pelo conteúdo real (magic bytes), não pelo MIME declarado.
  const detected = detectImageType(buffer);
  if (!detected) {
    return Response.json(
      { message: "Formato inválido — use JPG, PNG ou WebP." },
      { status: 400 }
    );
  }

  // Reduz e converte para WebP antes de gravar — ver src/lib/image-optimize.ts.
  const optimized = await optimizeUploadedImage(buffer, EXT_BY_DETECTED[detected]);

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${optimized.ext}`;
  await writeFile(path.join(dir, name), optimized.buffer);

  return Response.json({ url: `/uploads/${name}` }, { status: 201 });
});
