import "server-only";
import { cache } from "react";
import { all, db, str } from "./db";

export const settingDefaults = {
  contact_email: "contact@rania-astrologie.com",
  whatsapp: "33600000000",
  instagram: "",
  timezone: "Europe/Paris",
  cancellation_hours: "48",
  retention_months: "24",
  legal_name: "Rania — [nom complet à compléter]",
  legal_address: "[adresse professionnelle à compléter]",
  legal_id: "[SIRET / numéro d'immatriculation à compléter]",
  host_info: "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
};
export type SettingKey = keyof typeof settingDefaults;
export type Settings = Record<SettingKey, string>;

export const getSettings = cache(async (): Promise<Settings> => {
  const out = { ...settingDefaults } as Settings;
  try {
    const rows = await all("SELECT key, value FROM settings", [], (r) => [str(r.key), str(r.value)] as const);
    for (const [k, v] of rows) if (k in out) out[k as SettingKey] = v;
  } catch (e) {
    // The public site must keep rendering even if the database is briefly unreachable.
    console.error("[settings] falling back to defaults:", e instanceof Error ? e.message : e);
  }
  return out;
});

export async function saveSettings(values: Partial<Settings>): Promise<void> {
  const c = await db();
  const stmts = Object.entries(values)
    .filter(([k]) => k in settingDefaults)
    .map(([k, v]) => ({
      sql: "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      args: [k, String(v ?? "")],
    }));
  if (stmts.length) await c.batch(stmts, "write");
}

export function whatsappLink(number: string, text?: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
