"use client";

import { useActionState, useState } from "react";
import { cancelBookingByToken, type CancelState } from "@/app/actions/public";
import type { Dictionary } from "@/i18n";

const initialState: CancelState = { status: "idle" };

export function CancelForm({ token, t, rateLimited }: { token: string; t: Dictionary["manage"]; rateLimited: string }) {
  const [state, action, pending] = useActionState<CancelState, FormData>(cancelBookingByToken, initialState);
  const [confirm, setConfirm] = useState(false);

  if (state.status === "cancelled") return <p className="text-gold-bright" role="status">{t.cancelled}</p>;
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state.status === "tooLate" && <p className="field-error" role="alert">{t.tooLate}</p>}
      {state.status === "invalid" && <p className="field-error" role="alert">{t.invalid}</p>}
      {state.status === "rateLimited" && <p className="field-error" role="alert">{rateLimited}</p>}
      {!confirm ? (
        <button type="button" className="btn btn-ghost" onClick={() => setConfirm(true)}>
          {t.cancel}
        </button>
      ) : (
        <button type="submit" className="btn btn-ghost !border-rose/60 !text-rose" disabled={pending}>
          {t.cancelConfirm}
        </button>
      )}
    </form>
  );
}
