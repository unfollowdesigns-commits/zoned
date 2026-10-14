import "server-only";
import type { Row } from "@libsql/client";
import type { Locale } from "@/i18n/config";
import { all, num, one, run, str } from "../db";

export type Offering = {
  id: number;
  slug: string;
  serviceKey: string;
  name: Record<Locale, string>;
  summary: Record<Locale, string>;
  durationMin: number;
  priceCents: number;
  currency: string;
  requiresPartner: boolean;
  active: boolean;
  sort: number;
};

const map = (r: Row): Offering => ({
  id: num(r.id),
  slug: str(r.slug),
  serviceKey: str(r.service_key),
  name: { fr: str(r.name_fr), en: str(r.name_en), ar: str(r.name_ar) },
  summary: { fr: str(r.summary_fr), en: str(r.summary_en), ar: str(r.summary_ar) },
  durationMin: num(r.duration_min),
  priceCents: num(r.price_cents),
  currency: str(r.currency),
  requiresPartner: num(r.requires_partner) === 1,
  active: num(r.active) === 1,
  sort: num(r.sort),
});

export const listOfferings = (activeOnly = true) =>
  all(`SELECT * FROM offerings ${activeOnly ? "WHERE active = 1" : ""} ORDER BY sort, id`, [], map);

export const getOffering = (id: number) => one("SELECT * FROM offerings WHERE id = ?", [id], map);

export type OfferingInput = Omit<Offering, "id">;

export async function saveOffering(id: number | null, o: OfferingInput): Promise<void> {
  const args = [
    o.slug, o.serviceKey, o.name.fr, o.name.en, o.name.ar, o.summary.fr, o.summary.en, o.summary.ar,
    o.durationMin, o.priceCents, o.currency, o.requiresPartner ? 1 : 0, o.active ? 1 : 0, o.sort,
  ];
  if (id) {
    await run(
      `UPDATE offerings SET slug=?, service_key=?, name_fr=?, name_en=?, name_ar=?, summary_fr=?, summary_en=?, summary_ar=?,
       duration_min=?, price_cents=?, currency=?, requires_partner=?, active=?, sort=? WHERE id=?`,
      [...args, id],
    );
  } else {
    await run(
      `INSERT INTO offerings (slug, service_key, name_fr, name_en, name_ar, summary_fr, summary_en, summary_ar,
       duration_min, price_cents, currency, requires_partner, active, sort) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args,
    );
  }
}

export async function deleteOffering(id: number): Promise<void> {
  await run("DELETE FROM offerings WHERE id = ?", [id]);
}
