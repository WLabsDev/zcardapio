import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { deleteReplacedUpload, deleteUploadedFile } from "./upload-storage";

const dir = path.join(process.cwd(), "public", "uploads");
const criados: string[] = [];

/** Cria um arquivo de verdade em public/uploads e devolve nome e URL. */
async function criarUpload() {
  await mkdir(dir, { recursive: true });
  const name = `teste-${randomUUID()}.webp`;
  const file = path.join(dir, name);
  await writeFile(file, "conteudo");
  criados.push(file);
  return { name, url: `/uploads/${name}`, file };
}

const existe = (file: string) =>
  readFile(file).then(
    () => true,
    () => false
  );

afterEach(async () => {
  await Promise.all(criados.splice(0).map((f) => rm(f, { force: true })));
});

describe("deleteUploadedFile", () => {
  it("apaga o arquivo do upload", async () => {
    const { url, file } = await criarUpload();
    await deleteUploadedFile(url);
    expect(await existe(file)).toBe(false);
  });

  it("ignora valor vazio, URL externa e caminho fora de /uploads", async () => {
    const { file } = await criarUpload();
    await deleteUploadedFile("");
    await deleteUploadedFile(null);
    await deleteUploadedFile("https://cdn.exemplo.com/foto.jpg");
    await deleteUploadedFile("/imagens/foto.webp");
    expect(await existe(file)).toBe(true);
  });

  it("não aceita path traversal", async () => {
    // Se o regex deixasse passar, isto apagaria um arquivo fora da pasta.
    await deleteUploadedFile("/uploads/../../package.json");
    await deleteUploadedFile("/uploads/sub/foto.webp");
    expect(await existe(path.join(process.cwd(), "package.json"))).toBe(true);
  });

  it("não quebra quando o arquivo já não existe", async () => {
    await expect(
      deleteUploadedFile(`/uploads/${randomUUID()}.webp`)
    ).resolves.toBeUndefined();
  });
});

describe("deleteReplacedUpload", () => {
  it("apaga a imagem antiga quando ela é trocada", async () => {
    const antiga = await criarUpload();
    await deleteReplacedUpload(antiga.url, "/uploads/nova.webp");
    expect(await existe(antiga.file)).toBe(false);
  });

  it("mantém quando a imagem continua a mesma", async () => {
    const atual = await criarUpload();
    await deleteReplacedUpload(atual.url, atual.url);
    expect(await existe(atual.file)).toBe(true);
  });

  it("mantém quando o campo não foi enviado na atualização", async () => {
    const atual = await criarUpload();
    await deleteReplacedUpload(atual.url, undefined);
    expect(await existe(atual.file)).toBe(true);
  });

  it("apaga quando a imagem é removida (string vazia)", async () => {
    const atual = await criarUpload();
    await deleteReplacedUpload(atual.url, "");
    expect(await existe(atual.file)).toBe(false);
  });
});
