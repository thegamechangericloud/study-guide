import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/guards";
import { PrintButton } from "@/components/PrintButton";

const MASTERY_LABEL: Record<string, string> = {
  NOT_STARTED: "Por comenzar",
  DEVELOPING: "En desarrollo",
  PROFICIENT: "Competente",
  MASTERED: "Dominado",
};

export default async function ChildProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdult(["PARENT"]);
  const { id } = await params;

  const guardianship = await prisma.guardianship.findUnique({
    where: { userId_studentProfileId: { userId: session.sub, studentProfileId: id } },
  });
  if (!guardianship) notFound();

  const [profile, checkpoints, mastery, feedback] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { id }, include: { currentGrade: true } }),
    prisma.progressCheckpoint.findMany({
      where: { studentProfileId: id },
      include: { lesson: { include: { unit: { include: { subject: true } } } } },
      orderBy: { lastAccessedAt: "desc" },
    }),
    prisma.skillMastery.findMany({
      where: { studentProfileId: id },
      include: { competency: { include: { subject: true } } },
    }),
    prisma.teacherFeedback.findMany({
      where: { studentProfileId: id, visibleToParent: true },
      include: { teacher: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  if (!profile) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{profile.displayName}</h1>
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            {profile.currentGrade?.name}
          </p>
        </div>
        <PrintButton />
      </div>

      <section>
        <h2 className="font-semibold mb-3">Lecciones recientes</h2>
        <div className="space-y-2">
          {checkpoints.length === 0 && (
            <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
              Sin actividad todavía.
            </p>
          )}
          {checkpoints.map((c) => (
            <div key={c.id} className="card p-3 flex justify-between text-sm">
              <span>
                {c.lesson.title}{" "}
                <span style={{ color: "var(--color-ink-muted)" }}>
                  ({c.lesson.unit.subject.name})
                </span>
              </span>
              <span>{c.completed ? "✅ Completada" : "▶ En progreso"}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Destrezas mostradas / a reforzar</h2>
        <div className="space-y-2">
          {mastery.length === 0 && (
            <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
              Aún no hay datos de destrezas.
            </p>
          )}
          {mastery.map((m) => (
            <div key={m.id} className="card p-3 flex justify-between text-sm">
              <span>
                {m.competency.subject.name} — {m.competency.description}
              </span>
              <span className="font-semibold">{MASTERY_LABEL[m.level]}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Comentarios del maestro/a</h2>
        <div className="space-y-2">
          {feedback.length === 0 && (
            <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
              Sin comentarios todavía.
            </p>
          )}
          {feedback.map((f) => (
            <div key={f.id} className="card p-3 text-sm">
              <p>{f.message}</p>
              <p className="text-xs mt-1" style={{ color: "var(--color-ink-muted)" }}>
                — {f.teacher.name}, {f.createdAt.toLocaleDateString("es-DO")}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
