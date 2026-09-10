import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/guards";

export default async function TeacherHomePage() {
  const session = await requireAdult(["TEACHER", "SCHOOL_ADMIN", "PLATFORM_ADMIN"]);

  const classrooms = await prisma.classroom.findMany({
    where:
      session.role === "TEACHER"
        ? { teachers: { some: { teacherId: session.sub } } }
        : { schoolId: session.schoolId ?? undefined },
    include: {
      grade: true,
      _count: { select: { enrollments: true, assignments: true } },
    },
    orderBy: { section: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mis clases</h1>
      {classrooms.length === 0 && (
        <p style={{ color: "var(--color-ink-muted)" }}>
          Aún no tienes clases asignadas. Un administrador escolar puede crear una clase y
          agregarte como maestro/a.
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        {classrooms.map((c) => (
          <Link key={c.id} href={`/teacher/classrooms/${c.id}`} className="card p-5 block hover:shadow-md focus-ring">
            <h2 className="font-semibold text-lg">
              {c.grade.name} — Sección {c.section}
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--color-ink-muted)" }}>
              {c._count.enrollments} estudiantes · {c._count.assignments} tareas asignadas
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--color-ink-muted)" }}>
              Código de clase: <span className="font-mono">{c.classCode}</span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
