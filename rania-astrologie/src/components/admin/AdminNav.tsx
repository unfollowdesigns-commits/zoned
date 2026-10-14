"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const items = [
  { href: "/admin", label: "Tableau de bord", icon: "◎" },
  { href: "/admin/reservations", label: "Réservations", icon: "☉" },
  { href: "/admin/creneaux", label: "Créneaux", icon: "◷" },
  { href: "/admin/consultations", label: "Consultations & tarifs", icon: "✦" },
  { href: "/admin/articles", label: "Articles", icon: "✎" },
  { href: "/admin/messages", label: "Messages", icon: "✉" },
  { href: "/admin/parametres", label: "Paramètres", icon: "⚙" },
];

export function AdminNav({ unread, pending }: { unread: number; pending: number }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const badge = (href: string) => (href === "/admin/messages" ? unread : href === "/admin/reservations" ? pending : 0);
  return (
    <>
      <button type="button" onClick={() => setOpen((v) => !v)} className="btn btn-ghost !h-10 lg:hidden" aria-expanded={open}>
        Menu
      </button>
      <nav className={`${open ? "block" : "hidden"} lg:block`} aria-label="Administration">
        <ul className="space-y-1">
          {items.map((it) => {
            const active = it.href === "/admin" ? path === "/admin" : path.startsWith(it.href);
            const n = badge(it.href);
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors ${
                    active ? "bg-gold/12 text-gold-bright" : "text-ivory/75 hover:bg-ivory/5 hover:text-ivory"
                  }`}
                >
                  <span className="w-5 text-center text-gold/80">{it.icon}</span>
                  <span className="flex-1">{it.label}</span>
                  {n > 0 && <span className="rounded-full bg-gold px-2 py-0.5 text-[0.7rem] font-semibold text-ink">{n}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
