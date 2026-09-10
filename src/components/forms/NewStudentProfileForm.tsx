"use client";

import { useActionState } from "react";
import { createStudentProfile } from "@/actions/students";
import type { FormState } from "@/actions/auth";

const AVATARS = ["🦜", "🐢", "🐬", "🦋", "🌴", "🌺"];

export function NewStudentProfileForm({
  grades,
  showRelationship,
}: {
  grades: { id: string; name: string; level: string }[];
  showRelationship: boolean;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createStudentProfile,
    undefined
  );

  return (
    <form action={formAction} className="card p-6 space-y-4 max-w-md w-full">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="displayName">
          Nombre del estudiante
        </label>
        <input
          id="displayName"
          name="displayName"
          required
          className="w-full border rounded-md px-3 py-2 focus-ring"
          style={{ borderColor: "var(--color-border)" }}
        />
      </div>

      <div>
        <span className="block text-sm font-medium mb-1">Avatar</span>
        <div className="flex gap-2">
          {AVATARS.map((a, i) => (
            <label key={a} className="cursor-pointer">
              <input
                type="radio"
                name="avatarKey"
                value={a}
                defaultChecked={i === 0}
                className="sr-only peer"
              />
              <span className="text-2xl inline-flex w-10 h-10 items-center justify-center rounded-full border peer-checked:ring-2 peer-checked:ring-offset-1" style={{ borderColor: "var(--color-border)" }}>
                {a}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="gradeId">
          Grado
        </label>
        <select
          id="gradeId"
          name="gradeId"
          required
          className="w-full border rounded-md px-3 py-2 focus-ring"
          style={{ borderColor: "var(--color-border)" }}
        >
          <option value="">Selecciona…</option>
          {grades.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {showRelationship && (
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="relationship">
            Tu relación con el estudiante
          </label>
          <select
            id="relationship"
            name="relationship"
            className="w-full border rounded-md px-3 py-2 focus-ring"
            style={{ borderColor: "var(--color-border)" }}
          >
            <option value="MOTHER">Madre</option>
            <option value="FATHER">Padre</option>
            <option value="LEGAL_GUARDIAN">Tutor/a legal</option>
            <option value="OTHER_FAMILY">Otro familiar</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="pin">
          PIN de acceso (4 a 6 dígitos)
        </label>
        <input
          id="pin"
          name="pin"
          inputMode="numeric"
          pattern="\d{4,6}"
          required
          className="w-full border rounded-md px-3 py-2 focus-ring"
          style={{ borderColor: "var(--color-border)" }}
        />
        <p className="text-xs mt-1" style={{ color: "var(--color-ink-muted)" }}>
          El estudiante usará este PIN para entrar a su perfil. No se requiere correo
          electrónico.
        </p>
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
        {pending ? "Creando perfil…" : "Crear perfil de estudiante"}
      </button>
    </form>
  );
}
