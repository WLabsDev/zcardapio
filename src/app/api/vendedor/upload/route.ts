import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireVendedorRestaurant } from "@/lib/vendedor";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  const { error } = await requireVendedorRestaurant();
  if (error) return error;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return Response.json({ message: "Envie um arquivo." }, { status: 400 });
  }

  const ext = EXT_BY_TYPE[file.type];
  if (!ext) {
    return Response.json(
      { message: "Formato inválido — use JPG, PNG ou WebP." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return Response.json(
      { message: "Imagem muito grande — máximo de 5MB." },
      { status: 400 }
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  return Response.json({ url: `/uploads/${name}` }, { status: 201 });
}
