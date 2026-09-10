"use client";

import { useActionState } from "react";
import { loginStudentWithPin } from "@/actions/students";
import type { FormState } from "@/actions/auth";

export function PinLoginForm({ profileId }: { profileId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    loginStudentWithPin,
    undefined
  );

  return (
    <form action={formAction} className="card p-6 space-y-4 max-w-xs w-full">
      <input type="hidden" name="profileId" value={profileId} />
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="pin">
          Ingresa tu PIN
        </label>
        <input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          autoFocus
          className="w-full border rounded-md px-3 py-3 text-center text-2xl tracking-widest focus-ring"
          style={{ borderColor: "var(--color-border)" }}
        />
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-center" style={{ color: "var(--color-coral)" }}>
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full py-2.5 font-semibold focus-ring disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
