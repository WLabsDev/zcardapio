/** Envia uma imagem para /api/vendedor/upload e retorna a URL local. */
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/vendedor/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.url) {
    throw new Error(data?.message ?? "Não foi possível enviar a imagem.");
  }
  return data.url as string;
}
