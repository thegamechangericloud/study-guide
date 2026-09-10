"use client";

import { useActionState, useState } from "react";
import { registerAdult, type FormState } from "@/actions/auth";

export function RegisterForm({ schools }: { schools: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    registerAdult,
    undefined
  );
  const [role, setRole] = useState<"PARENT" | "TEACHER" | "SCHOOL_ADMIN">("PARENT");

  return (
    <form action={formAction} className="card p-6 space-y-4 max-w-md w-full">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="role">
          Tipo de cuenta
        </label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as typeof role)}
          className="w-full border rounded-md px-3 py-2 focus-ring"
          style={{ borderColor: "var(--color-border)" }}
        >
          <option value="PARENT">Padre, madre o tutor</option>
          <option value="TEACHER">Maestro/a</option>
          <option value="SCHOOL_ADMIN">Administrador/a escolar</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="name">
          Nombre completo
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full border rounded-md px-3 py-2 focus-ring"
          style={{ borderColor: "var(--color-border)" }}
        />
      </div>

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
          minLength={8}
          required
          className="w-full border rounded-md px-3 py-2 focus-ring"
          style={{ borderColor: "var(--color-border)" }}
        />
      </div>

      {role === "TEACHER" && (
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="schoolId">
            Escuela
          </label>
          <select
            id="schoolId"
            name="schoolId"
            required
            className="w-full border rounded-md px-3 py-2 focus-ring"
            style={{ borderColor: "var(--color-border)" }}
          >
            <option value="">Selecciona tu escuela…</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {role === "SCHOOL_ADMIN" && (
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="schoolId2">
            Escuela existente (opcional)
          </label>
          <select
            id="schoolId2"
            name="schoolId"
            className="w-full border rounded-md px-3 py-2 mb-2 focus-ring"
            style={{ borderColor: "var(--color-border)" }}
          >
            <option value="">— Crear una nueva escuela —</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <label className="block text-sm font-medium mb-1" htmlFor="newSchoolName">
            Nombre de la nueva escuela
          </label>
          <input
            id="newSchoolName"
            name="newSchoolName"
            className="w-full border rounded-md px-3 py-2 focus-ring"
            style={{ borderColor: "var(--color-border)" }}
          />
        </div>
      )}

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
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </button>
      <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
        Los niños no crean su propia cuenta. Después de registrarte, podrás crear un
        perfil protegido para cada estudiante.
      </p>
    </form>
  );
}
