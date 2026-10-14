import { changePassword, logout, logoutEverywhere, purgeOldData, updateSettings } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { AdminTitle, Flash, Panel, btnDanger, btnSm } from "@/components/admin/ui";
import { getSettings, type SettingKey } from "@/lib/settings";

export const metadata = { title: "Paramètres" };

const fields: { key: SettingKey; label: string; hint?: string; type?: string }[] = [
  { key: "contact_email", label: "E-mail de contact (affiché sur le site)", type: "email" },
  { key: "whatsapp", label: "Numéro WhatsApp", hint: "Format international, chiffres uniquement (ex. 33612345678)." },
  { key: "instagram", label: "Compte Instagram (facultatif)", hint: "Sans @, ex. rania.astrologie" },
  { key: "timezone", label: "Fuseau horaire des consultations", hint: "Format IANA : Europe/Paris, Africa/Casablanca, Asia/Dubai…" },
  { key: "cancellation_hours", label: "Délai d'annulation en ligne (heures)", type: "number" },
  { key: "retention_months", label: "Conservation des données (mois)", type: "number" },
  { key: "legal_name", label: "Nom légal (mentions légales)" },
  { key: "legal_address", label: "Adresse professionnelle" },
  { key: "legal_id", label: "SIRET / numéro d'immatriculation" },
  { key: "host_info", label: "Hébergeur (nom et adresse)" },
];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const settings = await getSettings();
  return (
    <>
      <AdminTitle title="Paramètres" />
      <Flash sp={sp} />
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <h2 className="font-display text-2xl text-ivory">Informations du site</h2>
          <form action={updateSettings} className="mt-5 grid gap-4 md:grid-cols-2">
            {fields.map((f) => (
              <label key={f.key} className="field">
                <span className="field-label">{f.label}</span>
                <input className="input" name={f.key} type={f.type ?? "text"} defaultValue={settings[f.key]} />
                {f.hint && <span className="text-xs text-mist">{f.hint}</span>}
              </label>
            ))}
            <div className="md:col-span-2">
              <button className="btn btn-primary !h-11">Enregistrer</button>
            </div>
          </form>
        </Panel>
        <div className="space-y-6">
          <Panel>
            <h2 className="font-display text-2xl text-ivory">Mot de passe</h2>
            <form action={changePassword} className="mt-4 space-y-3">
              <input className="input" type="password" name="current" placeholder="Mot de passe actuel" autoComplete="current-password" required />
              <input className="input" type="password" name="next" placeholder="Nouveau (12 caractères min.)" autoComplete="new-password" minLength={12} required />
              <input className="input" type="password" name="confirm" placeholder="Confirmer" autoComplete="new-password" minLength={12} required />
              <button className="btn btn-ghost !h-10 w-full !text-xs">Changer le mot de passe</button>
            </form>
          </Panel>
          <Panel>
            <h2 className="font-display text-2xl text-ivory">Sécurité</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <form action={logout}><button className={btnSm}>Se déconnecter</button></form>
              <form action={logoutEverywhere}><button className={btnSm}>Déconnecter tous les appareils</button></form>
            </div>
          </Panel>
          <Panel>
            <h2 className="font-display text-2xl text-ivory">Données personnelles</h2>
            <p className="mt-2 text-sm text-mist">
              Supprime les réservations et messages de plus de {settings.retention_months} mois (politique de conservation RGPD).
            </p>
            <form action={purgeOldData} className="mt-4">
              <ConfirmButton message="Purger définitivement les données anciennes ?" className={btnDanger}>Purger maintenant</ConfirmButton>
            </form>
          </Panel>
        </div>
      </div>
    </>
  );
}
