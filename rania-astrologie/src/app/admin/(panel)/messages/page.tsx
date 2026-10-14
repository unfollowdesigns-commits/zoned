import { deleteMessage, toggleMessageRead } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { AdminTitle, Flash, btnDanger, btnSm } from "@/components/admin/ui";
import { listMessages } from "@/lib/repo/messages";
import { getSettings } from "@/lib/settings";
import { formatDateTime } from "@/lib/time";

export const metadata = { title: "Messages" };

const subjects: Record<string, string> = { consultation: "Demande de consultation", question: "Question sur une approche", other: "Autre" };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [messages, settings] = await Promise.all([listMessages(), getSettings()]);
  return (
    <>
      <AdminTitle title="Messages" subtitle="Reçus via le formulaire de contact." />
      <Flash sp={sp} />
      {messages.length === 0 ? (
        <p className="text-mist">Aucun message.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <article id={`m${m.id}`} key={m.id} className={`scroll-mt-6 rounded-2xl border p-6 ${m.isRead ? "border-line bg-deep/40" : "border-gold/40 bg-deep/70"}`}>
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 font-display text-2xl text-ivory">
                    {!m.isRead && <span className="h-2 w-2 rounded-full bg-gold" />}
                    {m.name}
                  </p>
                  <p className="text-sm text-mist">
                    <a href={`mailto:${m.email}`} className="hover:text-gold-bright">{m.email}</a>
                    {m.phone && ` · ${m.phone}`} · {subjects[m.subject] ?? m.subject} · {m.locale.toUpperCase()}
                  </p>
                </div>
                <p className="text-xs text-mist">{formatDateTime(m.createdAt, "fr", settings.timezone)}</p>
              </header>
              <p className="mt-4 whitespace-pre-wrap text-ivory/85" dir="auto">{m.body}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <a className={btnSm} href={`mailto:${m.email}?subject=${encodeURIComponent("Re: votre message")}`}>Répondre</a>
                <form action={toggleMessageRead}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="read" value={m.isRead ? "0" : "1"} />
                  <button className={btnSm}>{m.isRead ? "Marquer non lu" : "Marquer comme lu"}</button>
                </form>
                <form action={deleteMessage}>
                  <input type="hidden" name="id" value={m.id} />
                  <ConfirmButton message="Supprimer ce message ?" className={btnDanger}>Supprimer</ConfirmButton>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
