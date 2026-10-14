import Link from "next/link";
import { AdminTitle, Panel, StatusBadge } from "@/components/admin/ui";
import { listArticlesAdmin } from "@/lib/repo/articles";
import { countByStatus, listUpcomingConfirmed } from "@/lib/repo/bookings";
import { listMessages } from "@/lib/repo/messages";
import { listOpenSlots } from "@/lib/repo/slots";
import { getSettings } from "@/lib/settings";
import { formatDateTime } from "@/lib/time";

export const metadata = { title: "Tableau de bord" };

export default async function Dashboard() {
  const [counts, upcoming, messages, articles, open, settings] = await Promise.all([
    countByStatus(),
    listUpcomingConfirmed(),
    listMessages(),
    listArticlesAdmin(),
    listOpenSlots(0),
    getSettings(),
  ]);
  const c = Object.fromEntries(counts) as Record<string, number>;
  const stats = [
    { label: "Demandes en attente", value: c.pending ?? 0, href: "/admin/reservations?status=pending" },
    { label: "Consultations confirmées", value: c.confirmed ?? 0, href: "/admin/reservations?status=confirmed" },
    { label: "Créneaux ouverts", value: open.length, href: "/admin/creneaux" },
    { label: "Messages non lus", value: messages.filter((m) => !m.isRead).length, href: "/admin/messages" },
  ];

  return (
    <>
      <AdminTitle title="Bonjour Rania ✦" subtitle="Voici l'essentiel de votre activité." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-line bg-deep/60 p-6 transition-colors hover:border-gold/40">
            <p className="font-display text-5xl text-gold-bright">{s.value}</p>
            <p className="mt-2 text-sm text-mist">{s.label}</p>
          </Link>
        ))}
      </div>

      {open.length === 0 && (
        <p className="mt-6 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-bright">
          Aucun créneau ouvert : les visiteurs ne peuvent pas réserver en ligne.{" "}
          <Link href="/admin/creneaux" className="underline">Ajouter des créneaux →</Link>
        </p>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel>
          <h2 className="font-display text-2xl text-ivory">Prochaines consultations</h2>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-mist">Aucune consultation à venir.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {upcoming.map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/reservations/${b.id}`} className="flex items-center justify-between gap-4 py-3 hover:text-gold-bright">
                    <span>
                      <span className="block text-ivory">{b.name}</span>
                      <span className="text-xs text-mist">
                        {b.offeringName} · {b.startsAt ? formatDateTime(b.startsAt, "fr", settings.timezone) : "—"}
                      </span>
                    </span>
                    <StatusBadge status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel>
          <h2 className="font-display text-2xl text-ivory">Derniers messages</h2>
          {messages.length === 0 ? (
            <p className="mt-4 text-sm text-mist">Aucun message.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {messages.slice(0, 6).map((m) => (
                <li key={m.id} className="py-3">
                  <Link href={`/admin/messages#m${m.id}`} className="block hover:text-gold-bright">
                    <span className="flex items-center gap-2 text-ivory">
                      {!m.isRead && <span className="h-2 w-2 rounded-full bg-gold" />} {m.name}
                    </span>
                    <span className="line-clamp-1 text-xs text-mist">{m.body}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel className="xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-ivory">Journal</h2>
            <Link href="/admin/articles/new" className="btn btn-primary !h-10 !text-xs">Nouvel article</Link>
          </div>
          <p className="mt-2 text-sm text-mist">
            {articles.filter((a) => a.status === "published").length} publié(s) · {articles.filter((a) => a.status === "draft").length} brouillon(s)
          </p>
        </Panel>
      </div>
    </>
  );
}
