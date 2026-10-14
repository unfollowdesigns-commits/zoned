import "server-only";
import { all, num, one, run, str, strOrNull } from "../db";
import type { Row } from "@libsql/client";

export type Message = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  body: string;
  locale: string;
  isRead: boolean;
  createdAt: number;
};

const map = (r: Row): Message => ({
  id: num(r.id),
  name: str(r.name),
  email: str(r.email),
  phone: strOrNull(r.phone),
  subject: str(r.subject),
  body: str(r.body),
  locale: str(r.locale),
  isRead: num(r.is_read) === 1,
  createdAt: num(r.created_at),
});

export async function createMessage(m: Omit<Message, "id" | "isRead" | "createdAt">): Promise<void> {
  const now = Date.now();
  await run(
    "INSERT INTO messages (name, email, phone, subject, body, locale, consent_at, created_at) VALUES (?,?,?,?,?,?,?,?)",
    [m.name, m.email, m.phone, m.subject, m.body, m.locale, now, now],
  );
}

export const listMessages = () => all("SELECT * FROM messages ORDER BY created_at DESC LIMIT 500", [], map);
export const getMessage = (id: number) => one("SELECT * FROM messages WHERE id = ?", [id], map);
export const countUnread = () => one("SELECT COUNT(*) AS n FROM messages WHERE is_read = 0", [], (r) => num(r.n));

export async function setMessageRead(id: number, read: boolean) {
  await run("UPDATE messages SET is_read = ? WHERE id = ?", [read ? 1 : 0, id]);
}
export async function deleteMessage(id: number) {
  await run("DELETE FROM messages WHERE id = ?", [id]);
}
