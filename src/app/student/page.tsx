import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/guards";

export default async function StudentHomePage() {
  const session = await requireStudent();

  const profile = await prisma.studentProfile.findUnique({
    where: { id: session.sub },
    include: { currentGrade: true },
  });

  const continueCheckpoint = await prisma.progressCheckpoint.findFirst({
    where: { studentProfileId: session.sub, completed: false },
    orderBy: { lastAccessedAt: "desc" },
    include: { lesson: { include: { unit: { include: { subject: true } } } } },
  });

  const lessons = profile?.currentGradeId
    ? await prisma.lesson.findMany({
        where: { status: "PUBLISHED", unit: { gradeId: profile.currentGradeId } },
        include: { unit: { include: { subject: true } } },
        orderBy: [{ unit: { order: "asc" } }, { order: "asc" }],
      })
    : [];

  const checkpoints = await prisma.progressCheckpoint.findMany({
    where: { studentProfileId: session.sub },
  });
  const checkpointByLesson = new Map(checkpoints.map((c) => [c.lessonId, c]));

  const bySubject = new Map<string, typeof lessons>();
  for (const lesson of lessons) {
    const key = lesson.unit.subject.name;
    if (!bySubject.has(key)) bySubject.set(key, []);
    bySubject.get(key)!.push(lesson);
  }

  return (
    <div className="space-y-10">
      {continueCheckpoint && (
        <section className="card p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold uppercase" style={{ color: "var(--color-secondary)" }}>
              Continuar aprendiendo
            </p>
            <h2 className="text-xl font-bold">{continueCheckpoint.lesson.title}</h2>
            <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
              {continueCheckpoint.lesson.unit.subject.name} · {continueCheckpoint.lesson.unit.title}
            </p>
          </div>
          <Link
            href={`/student/lesson/${continueCheckpoint.lessonId}`}
            className="btn-primary px-6 py-3 font-bold focus-ring"
          >
            ▶ Continuar
          </Link>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold mb-4">Mis materias</h2>
        {bySubject.size === 0 && (
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            Aún no hay lecciones publicadas para tu grado.
          </p>
        )}
        <div className="space-y-6">
          {[...bySubject.entries()].map(([subject, subjectLessons]) => (
            <div key={subject}>
              <h3 className="font-semibold mb-2">{subject}</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {subjectLessons.map((lesson) => {
                  const cp = checkpointByLesson.get(lesson.id);
                  return (
                    <Link
                      key={lesson.id}
                      href={`/student/lesson/${lesson.id}`}
                      className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow focus-ring"
                    >
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
                          {lesson.unit.title}
                        </p>
                      </div>
                      <span aria-hidden>{cp?.completed ? "✅" : cp ? "▶" : "○"}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
