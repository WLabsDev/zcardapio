/**
 * Envio de imagens do painel do vendedor.
 *
 * Antes de subir, a imagem é reduzida no próprio navegador: a foto sai da
 * câmera com 4000px e vários MB, e mandar isso pela rede do vendedor (muitas
 * vezes 4G, no meio do serviço) é lento e às vezes esbarra no limite de 5MB do
 * servidor. O servidor comprime de novo — esta etapa é só para o upload ser
 * rápido, não substitui a de lá.
 */

/** Mesmo lado máximo usado no servidor, com folga para ele reduzir de novo. */
const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.85;
/** Abaixo disso não compensa reprocessar — já está pequena. */
const SKIP_BELOW_BYTES = 300 * 1024;

/**
 * Reduz e converte para WebP usando canvas. Devolve o arquivo original quando
 * a conversão não é possível ou não compensa — nenhuma falha aqui pode impedir
 * o vendedor de subir a foto.
 */
async function compressInBrowser(file: File): Promise<File | Blob> {
  if (!file.type.startsWith("image/") || file.size <= SKIP_BELOW_BYTES) {
    return file;
  }

  try {
    // `imageOrientation: "from-image"` aplica o EXIF: sem isso a foto do
    // celular seria enviada deitada.
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(bitmap.width, bitmap.height)
    );
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
    );
    // Imagem já enxuta pode ficar maior depois de reconvertida.
    if (!blob || blob.size >= file.size) return file;
    return blob;
  } catch {
    return file;
  }
}

/** Envia uma imagem para /api/vendedor/upload e retorna a URL local. */
export async function uploadImage(file: File): Promise<string> {
  const compressed = await compressInBrowser(file);
  const form = new FormData();
  // O nome importa só para o multipart; o servidor decide a extensão real pelo
  // conteúdo do arquivo.
  form.append("file", compressed, file.name);
  const res = await fetch("/api/vendedor/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.url) {
    throw new Error(data?.message ?? "Não foi possível enviar a imagem.");
  }
  return data.url as string;
}
