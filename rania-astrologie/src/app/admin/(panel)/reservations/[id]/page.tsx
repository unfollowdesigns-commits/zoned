import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteBooking, saveBookingNote, updateBookingStatus } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { AdminTitle, Flash, Panel, StatusBadge, btnDanger } from "@/components/admin/ui";
import { getBooking } from "@/lib/repo/bookings";
import { getSettings } from "@/lib/settings";
import { formatDateTime, formatPrice } from "@/lib/time";

export const metadata = { title: "Réservation" };

const formats: Record<string, string> = { video: "Visioconférence", phone: "Téléphone", whatsapp: "WhatsApp" };
const languages: Record<string, string> = { fr: "Français", en: "Anglais", ar: "Arabe" };

export default async function BookingDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  const b = await getBooking(Number(id));
  if (!b) notFound();
  const settings = await getSettings();
  const row = (k: string, v: string | null | undefined) => (
    <div className="grid gap-1 border-b border-line py-3 sm:grid-cols-3">
      <dt className="text-sm text-mist">{k}</dt>
      <dd className="whitespace-pre-wrap text-ivory sm:col-span-2">{v || "—"}</dd>
    </div>
  );

  return (
    <>
      <Link href="/admin/reservations" className="text-sm text-mist hover:text-gold-bright">← Réservations</Link>
      <AdminTitle title={b.name} subtitle={`${b.offeringName} · ${b.ref}`} actions={<StatusBadge status={b.status} />} />
      <Flash sp={sp} />
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <dl>
            {row("Date", b.startsAt ? `${formatDateTime(b.startsAt, "fr", settings.timezone)} (${settings.timezone})` : null)}
            {row("Consultation", `${b.offeringName} — ${formatPrice(b.priceCents, b.currency, "fr")}`)}
            {row("Format", formats[b.format] ?? b.format)}
            {row("E-mail", b.email)}
            {row("Téléphone", b.phone)}
            {row("Langue", languages[b.locale])}
            {row("Naissance", `${b.birthDate} · ${b.birthTime ?? "heure inconnue"} · ${b.birthPlace}`)}
            {b.partnerName && row("Seconde personne", `${b.partnerName} · ${b.partnerBirthDate ?? "?"} · ${b.partnerBirthTime ?? "heure inconnue"} · ${b.partnerBirthPlace ?? "?"}`)}
            {row("Question / contexte", b.question)}
            {row("Reçue le", formatDateTime(b.createdAt, "fr", settings.timezone))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className="btn btn-ghost !h-10 !text-xs" href={`mailto:${b.email}?subject=${encodeURIComponent(`Votre consultation (${b.ref})`)}`}>Répondre par e-mail</a>
            {b.phone && (
              <a className="btn btn-ghost !h-10 !text-xs" href={`https://wa.me/${b.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            )}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <h2 className="font-display text-2xl text-ivory">Changer le statut</h2>
            <form action={updateBookingStatus} className="mt-4 space-y-4">
              <input type="hidden" name="id" value={b.id} />
              <label className="field">
                <span className="field-label">Nouveau statut</span>
                <select name="status" className="input" defaultValue={b.status === "pending" ? "confirmed" : b.status}>
                  <option value="confirmed">Confirmer</option>
                  <option value="declined">Refuser (libère le créneau)</option>
                  <option value="cancelled">Annuler (libère le créneau)</option>
                  <option value="completed">Marquer comme réalisée</option>
                  <option value="pending">Remettre en attente</option>
                </select>
              </label>
              <label className="field">
                <span className="field-label">Message au client (facultatif)</span>
                <textarea name="note" className="input !min-h-28" defaultValue={b.adminNote ?? ""} placeholder="Lien de visioconférence, modalités de règlement…" />
              </label>
              <label className="flex items-center gap-2 text-sm text-mist">
                <input type="checkbox" name="notify" className="checkbox !mt-0" defaultChecked /> Prévenir le client par e-mail
              </label>
              <button className="btn btn-primary w-full !h-11">Enregistrer</button>
            </form>
          </Panel>
          <Panel>
            <h2 className="font-display text-xl text-ivory">Note interne</h2>
            <form action={saveBookingNote} className="mt-3 space-y-3">
              <input type="hidden" name="id" value={b.id} />
              <textarea name="note" className="input !min-h-24" defaultValue={b.adminNote ?? ""} />
              <button className="btn btn-ghost !h-10 !text-xs">Enregistrer la note</button>
            </form>
          </Panel>
          <Panel>
            <h2 className="font-display text-xl text-ivory">Données personnelles</h2>
            <p className="mt-2 text-sm text-mist">Suppression définitive (droit à l&apos;effacement, RGPD).</p>
            <form action={deleteBooking} className="mt-4">
              <input type="hidden" name="id" value={b.id} />
              <ConfirmButton message="Supprimer définitivement cette réservation et ses données ?" className={btnDanger}>
                Supprimer la réservation
              </ConfirmButton>
            </form>
          </Panel>
        </div>
      </div>
    </>
  );
}
