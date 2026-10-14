import { deleteOffering, upsertOffering } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { AdminTitle, Flash, Panel, btnDanger } from "@/components/admin/ui";
import { getServices, serviceKeys } from "@/content/services";
import { listOfferings, type Offering } from "@/lib/repo/offerings";
import { formatPrice } from "@/lib/time";

export const metadata = { title: "Consultations & tarifs" };

function OfferingForm({ o }: { o?: Offering }) {
  const services = getServices("fr");
  return (
    <form action={upsertOffering} className="space-y-4">
      {o && <input type="hidden" name="id" value={o.id} />}
      <div className="grid gap-3 md:grid-cols-4">
        <label className="field md:col-span-2">
          <span className="field-label">Approche liée</span>
          <select name="serviceKey" className="input" defaultValue={o?.serviceKey ?? "natal"}>
            {serviceKeys.map((k) => (
              <option key={k} value={k}>{services[k].title}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Identifiant</span>
          <input name="slug" className="input" defaultValue={o?.slug ?? ""} placeholder="theme-natal" pattern="[a-z0-9-]+" required />
        </label>
        <label className="field">
          <span className="field-label">Ordre</span>
          <input name="sort" type="number" className="input" defaultValue={o?.sort ?? 10} min={0} max={999} />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {(["fr", "en", "ar"] as const).map((l) => (
          <div key={l} className="space-y-3">
            <label className="field">
              <span className="field-label">Nom ({l.toUpperCase()})</span>
              <input name={`name_${l}`} className="input" defaultValue={o?.name[l] ?? ""} dir={l === "ar" ? "rtl" : "ltr"} required />
            </label>
            <label className="field">
              <span className="field-label">Description courte ({l.toUpperCase()})</span>
              <textarea name={`summary_${l}`} className="input !min-h-24" defaultValue={o?.summary[l] ?? ""} dir={l === "ar" ? "rtl" : "ltr"} maxLength={400} />
            </label>
          </div>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        <label className="field">
          <span className="field-label">Durée (min)</span>
          <input name="duration" type="number" className="input" defaultValue={o?.durationMin ?? 90} min={15} max={480} required />
        </label>
        <label className="field">
          <span className="field-label">Prix</span>
          <input name="price" type="number" step="0.01" className="input" defaultValue={o ? o.priceCents / 100 : 120} min={0} required />
        </label>
        <label className="field">
          <span className="field-label">Devise</span>
          <input name="currency" className="input" defaultValue={o?.currency ?? "EUR"} pattern="[A-Z]{3}" maxLength={3} required />
        </label>
        <label className="flex items-center gap-2 self-end pb-3 text-sm text-mist">
          <input type="checkbox" name="requiresPartner" className="checkbox !mt-0" defaultChecked={o?.requiresPartner ?? false} /> 2 personnes
        </label>
        <label className="flex items-center gap-2 self-end pb-3 text-sm text-mist">
          <input type="checkbox" name="active" className="checkbox !mt-0" defaultChecked={o?.active ?? true} /> Visible
        </label>
      </div>
      <button className="btn btn-primary !h-11">{o ? "Enregistrer" : "Ajouter la consultation"}</button>
    </form>
  );
}

export default async function OfferingsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const offerings = await listOfferings(false);
  return (
    <>
      <AdminTitle title="Consultations & tarifs" subtitle="Ce que les visiteurs voient sur la page Tarifs et peuvent réserver." />
      <Flash sp={sp} />
      <div className="space-y-4">
        {offerings.map((o) => (
          <details key={o.id} className="group rounded-2xl border border-line bg-deep/60">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
              <span>
                <span className="font-display text-2xl text-ivory">{o.name.fr}</span>
                {!o.active && <span className="ms-3 rounded-full border border-line px-2 py-0.5 text-xs text-mist">masquée</span>}
                <span className="block text-sm text-mist">{o.durationMin} min · {formatPrice(o.priceCents, o.currency, "fr")}</span>
              </span>
              <span className="text-gold transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="border-t border-line p-5">
              <OfferingForm o={o} />
              <form action={deleteOffering} className="mt-4">
                <input type="hidden" name="id" value={o.id} />
                <ConfirmButton message="Supprimer cette consultation ? (Les réservations existantes sont conservées.)" className={btnDanger}>
                  Supprimer
                </ConfirmButton>
              </form>
            </div>
          </details>
        ))}
      </div>
      <Panel className="mt-8">
        <h2 className="mb-4 font-display text-2xl text-ivory">Nouvelle consultation</h2>
        <OfferingForm />
      </Panel>
    </>
  );
}
