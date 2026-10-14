import type { ReactNode } from "react";

export function AdminTitle({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl text-ivory md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 text-mist">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-deep/60 p-6 backdrop-blur ${className}`}>{children}</div>;
}

const messages: Record<string, string> = {
  "ok=1": "Modifications enregistrées.",
  "ok=deleted": "Élément supprimé.",
  "ok=cleaned": "Anciens créneaux supprimés.",
  "ok=password": "Mot de passe modifié. Les autres sessions ont été déconnectées.",
  "ok=purged": "Données anciennes purgées.",
  "error=slug": "Cet identifiant (slug) est déjà utilisé.",
  "error=format": "Format de date ou d'heure invalide.",
  "error=past": "Ce créneau est dans le passé.",
  "error=range": "La période doit être comprise entre 0 et 180 jours.",
  "error=booked": "Ce créneau est réservé : il ne peut pas être supprimé.",
  "error=current": "Mot de passe actuel incorrect.",
  "error=confirm": "Les deux mots de passe ne correspondent pas.",
  "error=timezone": "Fuseau horaire invalide (ex. Europe/Paris).",
  "error=email": "Adresse e-mail invalide.",
  "error=notfound": "Élément introuvable.",
};

export function Flash({ sp }: { sp: Record<string, string | string[] | undefined> }) {
  const ok = typeof sp.ok === "string" ? sp.ok : undefined;
  const error = typeof sp.error === "string" ? sp.error : undefined;
  if (!ok && !error) return null;
  let text = error ? messages[`error=${error}`] ?? `Erreur : ${error}` : messages[`ok=${ok}`];
  if (ok && /^\d+$/.test(ok) && ok !== "1") text = `${ok} créneau(x) ajouté(s).`;
  if (ok === "purged") text = `Purge effectuée : ${sp.b ?? 0} réservation(s), ${sp.m ?? 0} message(s).`;
  if (!text) text = "Opération effectuée.";
  return (
    <p role="status" className={`mb-6 rounded-xl border px-4 py-3 text-sm ${error ? "border-rose/40 bg-rose/10 text-rose" : "border-gold/30 bg-gold/10 text-gold-bright"}`}>
      {text}
    </p>
  );
}

export const statusLabel: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  declined: "Refusée",
  cancelled: "Annulée",
  completed: "Réalisée",
};

export function StatusBadge({ status }: { status: string }) {
  const color: Record<string, string> = {
    pending: "border-gold/50 text-gold-bright",
    confirmed: "border-emerald-400/40 text-emerald-300",
    declined: "border-rose/40 text-rose",
    cancelled: "border-line text-mist",
    completed: "border-violet/40 text-violet",
  };
  return <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${color[status] ?? "border-line"}`}>{statusLabel[status] ?? status}</span>;
}

export const btnSm = "inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-xs text-ivory/85 transition-colors hover:border-gold hover:text-gold-bright";
export const btnDanger = "inline-flex items-center gap-2 rounded-full border border-rose/40 px-3.5 py-1.5 text-xs text-rose transition-colors hover:bg-rose/10";
