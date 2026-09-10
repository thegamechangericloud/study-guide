import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/guards";
import { advanceContentStatus } from "@/actions/admin";
import type { ContentStatus } from "@prisma/client";

const STATUS_FLOW: Record<ContentStatus, ContentStatus | null> = {
  DRAFT: "ACADEMIC_REVIEW",
  ACADEMIC_REVIEW: "SAFETY_REVIEW",
  SAFETY_REVIEW: "APPROVED",
  APPROVED: "PUBLISHED",
  PUBLISHED: "ARCHIVED",
  ARCHIVED: null,
};

const STATUS_LABEL: Record<ContentStatus, string> = {
  DRAFT: "Borrador",
  ACADEMIC_REVIEW: "Revisión académica",
  SAFETY_REVIEW: "Revisión de seguridad",
  APPROVED: "Aprobado",
  PUBLISHED: "Publicado",
  ARCHIVED: "Archivado",
};

export default async function CurriculumAdminPage() {
  await requireAdult(["SCHOOL_ADMIN", "PLATFORM_ADMIN"]);

  const levels = await prisma.grade.findMany({
    orderBy: [{ level: "asc" }, { order: "asc" }],
    include: {
      units: {
        include: {
          subject: true,
          lessons: { include: { author: true }, orderBy: { order: "asc" } },
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Currículo y contenido</h1>
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          Flujo de aprobación: Borrador → Revisión académica → Revisión de seguridad → Aprobado
          → Publicado. Solo el contenido &quot;Publicado&quot; es visible para los estudiantes.
        </p>
      </div>

      {levels.map((grade) =>
        grade.units.length === 0 ? null : (
          <section key={grade.id} className="space-y-3">
            <h2 className="font-semibold text-lg">{grade.name}</h2>
            {grade.units.map((unit) => (
              <div key={unit.id} className="card p-4">
                <p className="text-sm font-medium mb-2">
                  {unit.subject.name} — {unit.title}
                </p>
                <div className="space-y-2">
                  {unit.lessons.map((lesson) => {
                    const next = STATUS_FLOW[lesson.status];
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between text-sm border-t pt-2"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <div>
                          <p>{lesson.title}</p>
                          <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
                            Autor: {lesson.author.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="px-2 py-1 rounded-md text-xs font-semibold"
                            style={{
                              background:
                                lesson.status === "PUBLISHED"
                                  ? "color-mix(in srgb, var(--color-palm) 20%, white)"
                                  : "var(--color-border)",
                            }}
                          >
                            {STATUS_LABEL[lesson.status]}
                          </span>
                          {next && (
                            <form action={advanceContentStatus}>
                              <input type="hidden" name="lessonId" value={lesson.id} />
                              <input type="hidden" name="toStatus" value={next} />
                              <button type="submit" className="underline text-xs focus-ring">
                                Avanzar a {STATUS_LABEL[next]} →
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        )
      )}
    </div>
  );
}
