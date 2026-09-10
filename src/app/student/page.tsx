import Link from "next/link";
import type { CSSProperties } from "react";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/guards";
import { subjectTheme } from "@/lib/subject-theme";

export default async function StudentHomePage() {
  const session = await requireStudent();

  const profile = await prisma.studentProfile.findUnique({
    where: { id: session.sub },
    include: { currentGrade: true },
  });

  // The lightweight diagnostic (src/components/DiagnosticQuiz.tsx) is only
  // scoped to the literacy-foundational age bands — see submitDiagnostic's
  // note on why this isn't offered app-wide.
  const showDiagnosticPrompt =
    (profile?.currentGrade?.defaultAgeGroup === "EARLY_EXPLORERS" ||
      profile?.currentGrade?.defaultAgeGroup === "BEGINNING_READERS") &&
    (await prisma.diagnosticResult.count({ where: { studentProfileId: session.sub } })) === 0;

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

  const bySubject = new Map<string, { name: string; code: string; lessons: typeof lessons }>();
  for (const lesson of lessons) {
    const key = lesson.unit.subject.code;
    if (!bySubject.has(key)) {
      bySubject.set(key, { name: lesson.unit.subject.name, code: key, lessons: [] });
    }
    bySubject.get(key)!.lessons.push(lesson);
  }

  return (
    <div className="space-y-10">
      {showDiagnosticPrompt && (
        <section className="kid-card p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-semibold">📝 ¿Por dónde empezamos?</p>
            <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
              Responde 5 preguntas cortas para ayudarnos a recomendarte el mejor punto de partida.
            </p>
          </div>
          <Link href="/student/diagnostic" className="btn-fun px-5 py-2.5 focus-ring">
            Comenzar
          </Link>
        </section>
      )}

      {continueCheckpoint && (
        <section
          className="kid-card p-6 flex items-center justify-between flex-wrap gap-4"
          style={{ "--subject-color": subjectTheme(continueCheckpoint.lesson.unit.subject.code).color } as CSSProperties}
        >
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: "var(--color-secondary)" }}>
              ▶ Continuar aprendiendo
            </p>
            <h2 className="text-xl font-bold">{continueCheckpoint.lesson.title}</h2>
            <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
              {subjectTheme(continueCheckpoint.lesson.unit.subject.code).emoji}{" "}
              {continueCheckpoint.lesson.unit.subject.name} · {continueCheckpoint.lesson.unit.title}
            </p>
          </div>
          <Link href={`/student/lesson/${continueCheckpoint.lessonId}`} className="btn-fun px-6 py-3 focus-ring">
            ▶ Continuar
          </Link>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold mb-4">🌟 Mis materias</h2>
        {bySubject.size === 0 && (
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            Aún no hay lecciones publicadas para tu grado.
          </p>
        )}
        <div className="space-y-8">
          {[...bySubject.values()].map(({ name, code, lessons: subjectLessons }) => {
            const theme = subjectTheme(code);
            return (
              <div key={code}>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="subject-chip"
                    style={{ "--subject-color": theme.color } as CSSProperties}
                  >
                    {theme.emoji} {name}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {subjectLessons.map((lesson) => {
                    const cp = checkpointByLesson.get(lesson.id);
                    return (
                      <Link
                        key={lesson.id}
                        href={`/student/lesson/${lesson.id}`}
                        className="kid-card p-4 flex items-center gap-3 focus-ring"
                        style={{ "--subject-color": theme.color } as CSSProperties}
                      >
                        <span className="subject-icon" aria-hidden>
                          {theme.emoji}
                        </span>
                        <span className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{lesson.title}</p>
                          <p className="text-xs truncate" style={{ color: "var(--color-ink-muted)" }}>
                            {lesson.unit.title}
                          </p>
                        </span>
                        <span aria-hidden className="text-xl">
                          {cp?.completed ? "✅" : cp ? "▶️" : "⭐"}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
