import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/guards";
import { assignLesson, addTeacherFeedback, reopenAssignmentForStudent } from "@/actions/teacher";

export default async function ClassroomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdult(["TEACHER", "SCHOOL_ADMIN", "PLATFORM_ADMIN"]);
  const { id } = await params;

  const classroom = await prisma.classroom.findUnique({
    where: { id },
    include: {
      grade: true,
      teachers: true,
      enrollments: { include: { studentProfile: true } },
      assignments: { include: { lesson: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!classroom) notFound();
  if (session.role === "TEACHER" && !classroom.teachers.some((t) => t.teacherId === session.sub)) {
    notFound();
  }

  const availableLessons = await prisma.lesson.findMany({
    where: { status: "PUBLISHED", unit: { gradeId: classroom.gradeId } },
    orderBy: { title: "asc" },
  });

  const studentIds = classroom.enrollments.map((e) => e.studentProfileId);
  const checkpoints = await prisma.progressCheckpoint.findMany({
    where: { studentProfileId: { in: studentIds }, lessonId: { in: classroom.assignments.map((a) => a.lessonId) } },
  });
  const checkpointKey = (studentId: string, lessonId: string) => `${studentId}:${lessonId}`;
  const checkpointMap = new Map(
    checkpoints.map((c) => [checkpointKey(c.studentProfileId, c.lessonId), c])
  );

  // Teacher-only ranking (not shown to students/parents), all completed
  // lessons for the student, not just this classroom's assignments —
  // gives the teacher a fuller picture of engagement.
  const allCompletedCounts = await prisma.progressCheckpoint.groupBy({
    by: ["studentProfileId"],
    where: { studentProfileId: { in: studentIds }, completed: true },
    _count: { _all: true },
  });
  const completedCountMap = new Map(allCompletedCounts.map((r) => [r.studentProfileId, r._count._all]));
  const leaderboard = [...classroom.enrollments]
    .map((e) => ({
      studentProfileId: e.studentProfileId,
      name: e.studentProfile.displayName,
      completedCount: completedCountMap.get(e.studentProfileId) ?? 0,
    }))
    .sort((a, b) => b.completedCount - a.completedCount);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          {classroom.grade.name} — Sección {classroom.section}
        </h1>
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          Código de clase: <span className="font-mono">{classroom.classCode}</span>
        </p>
      </div>

      <section className="card p-5">
        <h2 className="font-semibold mb-3">Asignar lección</h2>
        <form action={assignLesson} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="classroomId" value={classroom.id} />
          <div>
            <label className="block text-xs font-medium mb-1" htmlFor="lessonId">
              Lección
            </label>
            <select
              id="lessonId"
              name="lessonId"
              required
              className="border rounded-md px-3 py-2 focus-ring"
              style={{ borderColor: "var(--color-border)" }}
            >
              {availableLessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" htmlFor="dueOn">
              Fecha límite
            </label>
            <input
              id="dueOn"
              name="dueOn"
              type="date"
              className="border rounded-md px-3 py-2 focus-ring"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>
          <button type="submit" className="btn-primary px-4 py-2 font-semibold focus-ring">
            Asignar
          </button>
        </form>
      </section>

      <section className="card p-5">
        <h2 className="font-semibold mb-1">🏆 Participación de la clase</h2>
        <p className="text-xs mb-3" style={{ color: "var(--color-ink-muted)" }}>
          Solo visible para el maestro/a — no se muestra a estudiantes ni familias.
        </p>
        <div className="space-y-1.5">
          {leaderboard.map((s, i) => (
            <div key={s.studentProfileId} className="flex items-center gap-3 text-sm">
              <span className="w-5 text-center font-semibold" style={{ color: "var(--color-ink-muted)" }}>
                {i + 1}
              </span>
              <span className="flex-1">{s.name}</span>
              <span className="font-semibold">{s.completedCount} lecciones</span>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-x-auto">
        <h2 className="font-semibold mb-3">Progreso de la clase</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left">
              <th className="py-2 pr-4">Estudiante</th>
              {classroom.assignments.map((a) => (
                <th key={a.id} className="py-2 pr-4">
                  {a.lesson.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {classroom.enrollments.map((e) => (
              <tr key={e.id} className="border-t" style={{ borderColor: "var(--color-border)" }}>
                <td className="py-2 pr-4 font-medium">{e.studentProfile.displayName}</td>
                {classroom.assignments.map((a) => {
                  const cp = checkpointMap.get(checkpointKey(e.studentProfileId, a.lessonId));
                  return (
                    <td key={a.id} className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <span>
                          {cp?.completed ? "✅ Completado" : cp ? "▶ En progreso" : "○ Sin comenzar"}
                        </span>
                        <form action={reopenAssignmentForStudent}>
                          <input type="hidden" name="assignmentId" value={a.id} />
                          <input type="hidden" name="studentProfileId" value={e.studentProfileId} />
                          <input type="hidden" name="classroomId" value={classroom.id} />
                          <button type="submit" className="text-xs underline focus-ring">
                            Reabrir
                          </button>
                        </form>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Enviar retroalimentación</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {classroom.enrollments.map((e) => (
            <form key={e.id} action={addTeacherFeedback} className="card p-4 space-y-2">
              <input type="hidden" name="studentProfileId" value={e.studentProfileId} />
              <input type="hidden" name="classroomId" value={classroom.id} />
              <p className="font-medium text-sm">{e.studentProfile.displayName}</p>
              <textarea
                name="message"
                required
                rows={2}
                placeholder="Escribe una nota para la familia…"
                className="w-full border rounded-md px-2 py-1.5 text-sm focus-ring"
                style={{ borderColor: "var(--color-border)" }}
              />
              <button type="submit" className="text-sm btn-primary px-3 py-1.5 focus-ring">
                Enviar
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
