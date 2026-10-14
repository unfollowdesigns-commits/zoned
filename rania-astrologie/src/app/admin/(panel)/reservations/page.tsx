import Link from "next/link";
import { AdminTitle, Flash, StatusBadge, statusLabel } from "@/components/admin/ui";
import { bookingStatuses, listBookings, type BookingStatus } from "@/lib/repo/bookings";
import { getSettings } from "@/lib/settings";
import { formatDateTime } from "@/lib/time";

export const metadata = { title: "Réservations" };

export default async function BookingsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const status = (bookingStatuses as readonly string[]).includes(sp.status ?? "") ? (sp.status as BookingStatus) : undefined;
  const [bookings, settings] = await Promise.all([listBookings(status), getSettings()]);
  return (
    <>
      <AdminTitle title="Réservations" subtitle={`Horaires affichés en ${settings.timezone}.`} />
      <Flash sp={sp} />
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/admin/reservations" className={`rounded-full border px-4 py-1.5 text-sm ${!status ? "border-gold text-gold-bright" : "border-line text-mist"}`}>Toutes</Link>
        {bookingStatuses.map((s) => (
          <Link key={s} href={`/admin/reservations?status=${s}`} className={`rounded-full border px-4 py-1.5 text-sm ${status === s ? "border-gold text-gold-bright" : "border-line text-mist"}`}>
            {statusLabel[s]}
          </Link>
        ))}
      </div>
      {bookings.length === 0 ? (
        <p className="text-mist">Aucune réservation.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-deep/80 text-start text-xs uppercase tracking-wider text-mist">
              <tr>
                <th className="p-4 text-start">Client</th>
                <th className="p-4 text-start">Consultation</th>
                <th className="p-4 text-start">Date</th>
                <th className="p-4 text-start">Statut</th>
                <th className="p-4 text-start">Réf.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-ivory/[0.03]">
                  <td className="p-4">
                    <Link href={`/admin/reservations/${b.id}`} className="text-ivory hover:text-gold-bright">{b.name}</Link>
                    <span className="block text-xs text-mist">{b.email}</span>
                  </td>
                  <td className="p-4 text-ivory/85">{b.offeringName}</td>
                  <td className="p-4 text-ivory/85">{b.startsAt ? formatDateTime(b.startsAt, "fr", settings.timezone) : "—"}</td>
                  <td className="p-4"><StatusBadge status={b.status} /></td>
                  <td className="p-4 font-mono text-xs text-mist">{b.ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
