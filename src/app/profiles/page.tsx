import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/guards";
import { logoutAdult } from "@/actions/auth";

export default async function ProfileSelectorPage() {
  const session = await requireAdult();

  const profiles = await prisma.studentProfile.findMany({
    where: {
      active: true,
      OR: [
        { createdById: session.sub },
        { guardians: { some: { userId: session.sub } } },
        ...(session.schoolId
          ? [{ schoolId: session.schoolId, school: { users: { some: { id: session.sub, role: "SCHOOL_ADMIN" as const } } } }]
          : []),
      ],
    },
    include: { currentGrade: true },
    orderBy: { displayName: "asc" },
  });

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-12 gap-6">
      <div className="w-full max-w-2xl flex items-center justify-between">
        <h1 className="text-2xl font-bold">¿Quién va a estudiar hoy?</h1>
        <form action={logoutAdult}>
          <button className="text-sm underline focus-ring" type="submit">
            Cerrar sesión ({session.name})
          </button>
        </form>
      </div>

      <div className="w-full max-w-2xl grid sm:grid-cols-3 gap-4">
        {profiles.map((p) => (
          <Link
            key={p.id}
            href={`/profiles/${p.id}/pin`}
            className="card p-5 flex flex-col items-center gap-2 hover:shadow-md transition-shadow focus-ring"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{ background: "var(--color-accent)" }}
              aria-hidden
            >
              🧒
            </div>
            <span className="font-semibold">{p.displayName}</span>
            <span className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
              {p.currentGrade?.name}
            </span>
          </Link>
        ))}

        <Link
          href="/profiles/new"
          className="card p-5 flex flex-col items-center justify-center gap-2 border-dashed focus-ring"
        >
          <span className="text-3xl" aria-hidden>
            ＋
          </span>
          <span className="font-semibold text-sm">Agregar estudiante</span>
        </Link>
      </div>

      {profiles.length === 0 && (
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          Aún no has creado ningún perfil de estudiante.
        </p>
      )}
    </main>
  );
}
