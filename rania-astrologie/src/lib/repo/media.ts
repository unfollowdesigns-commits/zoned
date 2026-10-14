import "server-only";
import { num, one, run, str } from "../db";
import { randomToken } from "../security";
import { sniffImage } from "../image-sniff";

export { sniffImage };

export const MAX_MEDIA_BYTES = 3 * 1024 * 1024;

export async function saveMedia(file: File): Promise<{ id: string } | { error: string }> {
  if (file.size === 0) return { error: "Fichier vide." };
  if (file.size > MAX_MEDIA_BYTES) return { error: "Image trop lourde (3 Mo maximum)." };
  const buf = new Uint8Array(await file.arrayBuffer());
  const mime = sniffImage(buf);
  if (!mime) return { error: "Format non pris en charge (JPEG, PNG, WebP ou AVIF)." };
  const id = randomToken(12);
  await run("INSERT INTO media (id, mime, size, data, created_at) VALUES (?, ?, ?, ?, ?)", [
    id, mime, buf.byteLength, buf, Date.now(),
  ]);
  return { id };
}

export async function getMedia(id: string) {
  if (!/^[A-Za-z0-9_-]{8,40}$/.test(id)) return null;
  return one("SELECT mime, size, data FROM media WHERE id = ?", [id], (r) => ({
    mime: str(r.mime),
    size: num(r.size),
    data: r.data as ArrayBuffer,
  }));
}

export async function deleteMedia(id: string) {
  await run("DELETE FROM media WHERE id = ?", [id]);
}
