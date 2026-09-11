import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/guards";
import { createClassroom, assignTeacherToClassroom, removeTeacherFromClassroom } from "@/actions/admin";

export default async function AdminClassroomsPage() {
  const session = await requireAdult(["SCHOOL_ADMIN", "PLATFORM_ADMIN"]);

  const [classrooms, teachers, grades] = await Promise.all([
    prisma.classroom.findMany({
      where: { schoolId: session.schoolId ?? undefined },
      include: {
        grade: true,
        teachers: { include: { teacher: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: [{ grade: { order: "asc" } }, { section: "asc" }],
    }),
    prisma.user.findMany({
      where: { role: "TEACHER", schoolId: session.schoolId ?? undefined },
      orderBy: { name: "asc" },
    }),
    prisma.grade.findMany({ orderBy: [{ level: "asc" }, { order: "asc" }] }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Clases</h1>
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          Crea clases y asigna maestros/as a cada una.
        </p>
      </div>

      <section className="card p-5">
        <h2 className="font-semibold mb-3">Crear nueva clase</h2>
        <form action={createClassroom} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" htmlFor="gradeId">
              Grado
            </label>
            <select
              id="gradeId"
              name="gradeId"
              required
              className="border rounded-md px-3 py-2 focus-ring"
              style={{ borderColor: "var(--color-border)" }}
            >
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" htmlFor="section">
              Sección
            </label>
            <input
              id="section"
              name="section"
              required
              placeholder="A"
              className="border rounded-md px-3 py-2 w-24 focus-ring"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>
          <button type="submit" className="btn-primary px-4 py-2 font-semibold focus-ring">
            Crear clase
          </button>
        </form>
      </section>

      <div className="grid sm:grid-cols-2 gap-4">
        {classrooms.map((c) => (
          <section key={c.id} className="card p-5">
            <h2 className="font-semibold">
              {c.grade.name} — Sección {c.section}
            </h2>
            <p className="text-xs mb-3" style={{ color: "var(--color-ink-muted)" }}>
              Código: <span className="font-mono">{c.classCode}</span> · {c._count.enrollments} estudiantes
            </p>

            <p className="text-xs font-medium mb-1">Maestros/as asignados</p>
            <div className="space-y-1 mb-3">
              {c.teachers.length === 0 && (
                <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
                  Sin maestro/a asignado.
                </p>
              )}
              {c.teachers.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <span>{t.teacher.name}</span>
                  <form action={removeTeacherFromClassroom}>
                    <input type="hidden" name="classroomId" value={c.id} />
                    <input type="hidden" name="teacherId" value={t.teacherId} />
                    <button type="submit" className="text-xs underline focus-ring">
                      Quitar
                    </button>
                  </form>
                </div>
              ))}
            </div>

            <form action={assignTeacherToClassroom} className="flex items-end gap-2">
              <input type="hidden" name="classroomId" value={c.id} />
              <select
                name="teacherId"
                required
                className="border rounded-md px-2 py-1.5 text-sm flex-1 focus-ring"
                style={{ borderColor: "var(--color-border)" }}
              >
                <option value="">Asignar maestro/a…</option>
                {teachers
                  .filter((t) => !c.teachers.some((ct) => ct.teacherId === t.id))
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
              <button type="submit" className="text-sm btn-primary px-3 py-1.5 focus-ring">
                Asignar
              </button>
            </form>
          </section>
        ))}
      </div>
    </div>
  );
}
