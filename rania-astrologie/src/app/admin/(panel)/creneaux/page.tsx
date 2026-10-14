import { addSingleSlot, cleanPastSlots, deleteSlot, generateSlots } from "@/app/actions/admin";
import { AdminTitle, Flash, Panel, btnSm } from "@/components/admin/ui";
import { listUpcomingSlots } from "@/lib/repo/slots";
import { getSettings } from "@/lib/settings";
import { nowMs, utcToZonedParts } from "@/lib/time";

export const metadata = { title: "Créneaux" };

const WEEKDAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default async function SlotsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [slots, settings] = await Promise.all([listUpcomingSlots(), getSettings()]);
  const tz = settings.timezone;
  const today = utcToZonedParts(nowMs(), tz).date;
  const inMonth = utcToZonedParts(nowMs() + 30 * 86_400_000, tz).date;

  const groups = new Map<string, typeof slots>();
  for (const s of slots) {
    const { date } = utcToZonedParts(s.startsAt, tz);
    if (!groups.has(date)) groups.set(date, []);
    groups.get(date)!.push(s);
  }
  const fmtDay = (d: string) =>
    new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));

  return (
    <>
      <AdminTitle title="Créneaux" subtitle={`Les visiteurs réservent parmi ces créneaux. Fuseau : ${tz}.`} />
      <Flash sp={sp} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6">
          <Panel>
            <h2 className="font-display text-2xl text-ivory">Générer des créneaux</h2>
            <p className="mt-1 text-sm text-mist">Créez votre agenda récurrent en une fois.</p>
            <form action={generateSlots} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="field"><span className="field-label">Du</span><input className="input" type="date" name="from" defaultValue={today} required /></label>
                <label className="field"><span className="field-label">Au</span><input className="input" type="date" name="to" defaultValue={inMonth} required /></label>
              </div>
              <fieldset>
                <legend className="field-label mb-2">Jours</legend>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                    <label key={d} className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm">
                      <input type="checkbox" name="days" value={d} className="checkbox !mt-0 !h-4 !w-4" defaultChecked={d >= 1 && d <= 5} /> {WEEKDAYS[d]}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="field">
                <span className="field-label">Heures de début (séparées par des virgules)</span>
                <input className="input" name="times" defaultValue="10:00, 14:00, 17:30" required />
              </label>
              <label className="field">
                <span className="field-label">Durée (minutes)</span>
                <input className="input" type="number" name="duration" min={15} max={480} defaultValue={90} />
              </label>
              <button className="btn btn-primary w-full !h-11">Générer</button>
            </form>
          </Panel>
          <Panel>
            <h2 className="font-display text-xl text-ivory">Ajouter un créneau</h2>
            <form action={addSingleSlot} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input className="input" type="date" name="date" min={today} required aria-label="Date" />
                <input className="input" type="time" name="time" required aria-label="Heure" />
              </div>
              <input className="input" type="number" name="duration" min={15} max={480} defaultValue={90} aria-label="Durée" />
              <button className="btn btn-ghost !h-10 w-full !text-xs">Ajouter</button>
            </form>
          </Panel>
          <form action={cleanPastSlots}>
            <button className={btnSm}>Nettoyer les créneaux passés non réservés</button>
          </form>
        </div>

        <Panel className="xl:col-span-2">
          <h2 className="font-display text-2xl text-ivory">À venir ({slots.length})</h2>
          {groups.size === 0 ? (
            <p className="mt-4 text-sm text-mist">Aucun créneau. Générez votre agenda à gauche.</p>
          ) : (
            <div className="mt-4 space-y-5">
              {[...groups.entries()].map(([date, items]) => (
                <div key={date}>
                  <p className="text-sm capitalize text-gold-bright">{fmtDay(date)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {items.map((s) => (
                      <form key={s.id} action={deleteSlot} className="contents">
                        <input type="hidden" name="id" value={s.id} />
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${s.booked ? "border-gold/50 bg-gold/10 text-gold-bright" : "border-line text-ivory"}`}>
                          {utcToZonedParts(s.startsAt, tz).time}
                          <span className="text-xs text-mist">{s.durationMin}′</span>
                          {s.booked ? (
                            <span className="text-xs">réservé</span>
                          ) : (
                            <button className="text-mist hover:text-rose" aria-label="Supprimer ce créneau" title="Supprimer">×</button>
                          )}
                        </span>
                      </form>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
