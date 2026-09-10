"use client";

import { useActionState } from "react";
import { loginAdult, type FormState } from "@/actions/auth";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    loginAdult,
    undefined
  );

  return (
    <form action={formAction} className="card p-6 space-y-4 max-w-sm w-full">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="email">
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full border rounded-md px-3 py-2 focus-ring"
          style={{ borderColor: "var(--color-border)" }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full border rounded-md px-3 py-2 focus-ring"
          style={{ borderColor: "var(--color-border)" }}
        />
      </div>
      {state?.error && (
        <p role="alert" className="text-sm" style={{ color: "var(--color-coral)" }}>
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full py-2.5 font-semibold focus-ring disabled:opacity-60"
      >
        {pending ? "Ingresando…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
