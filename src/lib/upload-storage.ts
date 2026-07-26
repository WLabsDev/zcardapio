/**
 * Remoção dos arquivos em public/uploads quando a imagem deixa de ser usada.
 * Sem isso o volume persistente só cresce: cada troca de foto de produto, logo
 * ou capa deixava o arquivo antigo órfão no disco para sempre.
 */
import { unlink } from "node:fs/promises";
import path from "node:path";

/** Só apaga o que este app gravou: /uploads/<uuid>.<ext>, sem subpastas. */
const UPLOAD_URL = /^\/uploads\/([\w-]+\.[a-z0-9]+)$/i;

/**
 * Apaga o arquivo apontado por `url`, se for um upload local. Ignora URL
 * externa, valor vazio e arquivo já inexistente — some silenciosamente é o
 * comportamento certo aqui: falhar ao apagar não pode derrubar o salvamento.
 */
export async function deleteUploadedFile(url: string | null | undefined) {
  const match = UPLOAD_URL.exec((url ?? "").trim());
  if (!match) return;

  const filePath = path.join(process.cwd(), "public", "uploads", match[1]);
  await unlink(filePath).catch((e: NodeJS.ErrnoException) => {
    if (e.code !== "ENOENT") {
      console.error(`[upload] não foi possível apagar ${match[1]}:`, e);
    }
  });
}

/**
 * Apaga o arquivo antigo quando ele foi trocado por outro. Não faz nada se a
 * imagem continua a mesma (ou se o campo nem foi enviado na atualização).
 */
export async function deleteReplacedUpload(
  previousUrl: string | null | undefined,
  nextUrl: string | null | undefined
) {
  if (nextUrl === undefined) return;
  if (!previousUrl || previousUrl === nextUrl) return;
  await deleteUploadedFile(previousUrl);
}
