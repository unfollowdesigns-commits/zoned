"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { login, type LoginState } from "@/app/actions/admin";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, initialState);
  // Submit via a transition so a failed attempt doesn't clear the e-mail field.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  };
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="field">
        <span className="field-label">E-mail</span>
        <input className="input" name="email" type="email" autoComplete="username" required autoFocus />
      </label>
      <label className="field">
        <span className="field-label">Mot de passe</span>
        <input className="input" name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error && (
        <p className="field-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
