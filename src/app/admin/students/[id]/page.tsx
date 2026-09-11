import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/guards";
import { editStudentProfile, assignStudentToClassroom } from "@/actions/admin";

export default async function AdminStudentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdult(["SCHOOL_ADMIN", "PLATFORM_ADMIN"]);
  const { id } = await params;

  const [student, grades, classrooms] = await Promise.all([
    prisma.studentProfile.findUnique({
      where: { id },
      include: { enrollments: { where: { exitedAt: null }, include: { classroom: true } } },
    }),
    prisma.grade.findMany({ orderBy: [{ level: "asc" }, { order: "asc" }] }),
    prisma.classroom.findMany({
      where: { schoolId: session.schoolId ?? undefined },
      include: { grade: true },
      orderBy: [{ grade: { order: "asc" } }, { section: "asc" }],
    }),
  ]);
  if (!student) notFound();

  const currentClassroomId = student.enrollments[0]?.classroomId;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Editar estudiante</h1>

      <section className="card p-5 max-w-md">
        <h2 className="font-semibold mb-3">Información básica</h2>
        <form action={editStudentProfile} className="space-y-3">
          <input type="hidden" name="studentProfileId" value={student.id} />
          <div>
            <label className="block text-xs font-medium mb-1" htmlFor="displayName">
              Nombre
            </label>
            <input
              id="displayName"
              name="displayName"
              defaultValue={student.displayName}
              required
              className="border rounded-md px-3 py-2 w-full focus-ring"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" htmlFor="dateOfBirth">
              Fecha de nacimiento
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              defaultValue={student.dateOfBirth ? student.dateOfBirth.toISOString().slice(0, 10) : ""}
              className="border rounded-md px-3 py-2 w-full focus-ring"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" htmlFor="gradeId">
              Grado
            </label>
            <select
              id="gradeId"
              name="gradeId"
              defaultValue={student.currentGradeId ?? ""}
              required
              className="border rounded-md px-3 py-2 w-full focus-ring"
              style={{ borderColor: "var(--color-border)" }}
            >
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <input type="hidden" name="avatarKey" value={student.avatarKey} />
          <button type="submit" className="btn-primary px-4 py-2 font-semibold focus-ring">
            Guardar cambios
          </button>
        </form>
      </section>

      <section className="card p-5 max-w-md">
        <h2 className="font-semibold mb-3">Clase asignada</h2>
        <p className="text-sm mb-3" style={{ color: "var(--color-ink-muted)" }}>
          Asignar una clase determina el maestro/a del estudiante — cada clase tiene su propio
          maestro/a asignado en la página de Clases.
        </p>
        <form action={assignStudentToClassroom} className="flex items-end gap-2">
          <input type="hidden" name="studentProfileId" value={student.id} />
          <select
            name="classroomId"
            defaultValue={currentClassroomId ?? ""}
            required
            className="border rounded-md px-3 py-2 flex-1 focus-ring"
            style={{ borderColor: "var(--color-border)" }}
          >
            <option value="" disabled>
              Selecciona una clase…
            </option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.grade.name} — Sección {c.section}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary px-4 py-2 font-semibold focus-ring">
            Asignar
          </button>
        </form>
      </section>
    </div>
  );
}
