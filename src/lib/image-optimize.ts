/**
 * Compressão das imagens enviadas pelo vendedor.
 *
 * A foto costuma vir direto da câmera do celular (4000px, vários MB) para
 * aparecer no cardápio como uma miniatura de 96px. Guardar o original custa
 * banda do cliente em cada visita e espaço no volume para sempre — então a
 * imagem é reduzida e reconvertida para WebP no momento do upload, uma única
 * vez. O nome do arquivo é um UUID novo, então o cache `immutable` da rota
 * /uploads continua válido.
 */
import type { Buffer } from "node:buffer";

/** Lado maior da imagem guardada. Cobre com folga a maior exibição (capa). */
const MAX_DIMENSION = 1200;
const WEBP_QUALITY = 80;

export type OptimizedImage = { buffer: Buffer; ext: "webp" | "jpg" | "png" };

/**
 * Reduz e converte para WebP. Se o sharp não estiver disponível ou falhar
 * (binário ausente no ambiente, imagem corrompida), devolve o arquivo original
 * — vale mais um upload pesado do que um upload quebrado.
 */
export async function optimizeUploadedImage(
  original: Buffer,
  fallbackExt: "jpg" | "png" | "webp"
): Promise<OptimizedImage> {
  try {
    const { default: sharp } = await import("sharp");
    const buffer = await sharp(original)
      // A foto do celular vem com a orientação no EXIF; sem isto ela é gravada
      // deitada, já que o WebP de saída não carrega esse metadado.
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    // Imagem pequena e já otimizada pode crescer ao ser reconvertida.
    if (buffer.length >= original.length) {
      return { buffer: original, ext: fallbackExt };
    }
    return { buffer, ext: "webp" };
  } catch (e) {
    console.error("[upload] falha ao comprimir a imagem, salvando original:", e);
    return { buffer: original, ext: fallbackExt };
  }
}
