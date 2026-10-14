import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/actions/admin";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoMark } from "@/components/Logo";
import { requireAdmin } from "@/lib/auth";
import { countByStatus } from "@/lib/repo/bookings";
import { countUnread } from "@/lib/repo/messages";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const [unread, counts] = await Promise.all([countUnread(), countByStatus()]);
  const pending = counts.find(([s]) => s === "pending")?.[1] ?? 0;
  return (
    <div className="mx-auto flex min-h-svh max-w-[1500px] flex-col gap-6 p-4 lg:flex-row lg:p-6">
      <aside className="shrink-0 lg:sticky lg:top-6 lg:h-[calc(100svh-3rem)] lg:w-64">
        <div className="flex h-full flex-col rounded-2xl border border-line bg-deep/60 p-4 backdrop-blur">
          <div className="mb-6 flex items-center justify-between gap-3 px-2">
            <Link href="/admin" className="flex items-center gap-3">
              <LogoMark className="h-9 w-9 text-gold-bright" />
              <span className="font-display text-2xl text-ivory">Rania</span>
            </Link>
          </div>
          <AdminNav unread={unread ?? 0} pending={pending} />
          <div className="mt-auto hidden space-y-2 border-t border-line px-2 pt-4 text-xs text-mist lg:block">
            <p className="truncate">{admin.email}</p>
            <div className="flex gap-2">
              <a href="/fr" target="_blank" className="underline-offset-2 hover:underline">Voir le site ↗</a>
              <form action={logout}>
                <button className="underline-offset-2 hover:text-rose hover:underline">Déconnexion</button>
              </form>
            </div>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 pb-16 lg:pt-4">{children}</main>
    </div>
  );
}
