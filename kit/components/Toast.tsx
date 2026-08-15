"use client"

// Minimal toast system with an action slot, used to make destructive actions
// reversible (delete → "Undo") instead of silently unrecoverable.

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Undo2, X, AlertTriangle } from "lucide-react"
import { SPRING } from "../lib/motion"
import { useReducedMotion } from "../lib/use-reduced-motion"
import { cn } from "../lib/utils"

export interface Toast {
  id: string
  message: string
  tone?: "default" | "success" | "warn"
  actionLabel?: string
  onAction?: () => void
  duration?: number
}

const ToastCtx = React.createContext<{ push: (t: Omit<Toast, "id">) => void } | null>(null)

export function useToast() {
  const ctx = React.useContext(ToastCtx)
  // No-op fallback keeps components usable outside the provider (e.g. tests).
  return ctx ?? { push: () => {} }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const dismiss = React.useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const push = React.useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev.slice(-2), { ...t, id }])
    const ms = t.duration ?? 6000
    setTimeout(() => dismiss(id), ms)
  }, [dismiss])

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[200] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: SPRING }}
              exit={{ opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.22 } }}
              className="g-glass pointer-events-auto flex items-center gap-3 px-4 py-3"
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                  t.tone === "warn" ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500/15 text-emerald-300"
                )}
              >
                {t.tone === "warn" ? <AlertTriangle className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
              </span>
              <p className="min-w-0 flex-1 text-[var(--t-small)] text-zinc-200">{t.message}</p>
              {t.actionLabel && (
                <button
                  onClick={() => { t.onAction?.(); dismiss(t.id) }}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-semibold text-zinc-100 outline-none transition-colors hover:bg-white/[0.1] focus-visible:ring-2 focus-visible:ring-[var(--v-ring)]"
                >
                  <Undo2 className="h-3 w-3" /> {t.actionLabel}
                </button>
              )}
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="shrink-0 rounded-md p-1 text-zinc-600 outline-none transition-colors hover:text-zinc-300">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}
