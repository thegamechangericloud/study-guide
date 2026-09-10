import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/guards";

const MASTERY_LABEL: Record<string, string> = {
  NOT_STARTED: "Por comenzar",
  DEVELOPING: "En desarrollo",
  PROFICIENT: "Competente",
  MASTERED: "Dominado",
};

export default async function StudentProgressPage() {
  const session = await requireStudent();

  const [checkpoints, mastery, achievements] = await Promise.all([
    prisma.progressCheckpoint.findMany({
      where: { studentProfileId: session.sub },
      include: { lesson: true },
      orderBy: { lastAccessedAt: "desc" },
    }),
    prisma.skillMastery.findMany({
      where: { studentProfileId: session.sub },
      include: { competency: { include: { subject: true } } },
    }),
    prisma.studentAchievement.findMany({
      where: { studentProfileId: session.sub },
      include: { achievement: true },
    }),
  ]);

  const completedCount = checkpoints.filter((c) => c.completed).length;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Mis logros</h1>

      <section className="grid sm:grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <p className="text-3xl font-extrabold" style={{ color: "var(--color-primary)" }}>
            {completedCount}
          </p>
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            Lecciones completadas
          </p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-extrabold" style={{ color: "var(--color-secondary)" }}>
            {achievements.length}
          </p>
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            Insignias ganadas
          </p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-extrabold" style={{ color: "var(--color-palm)" }}>
            {mastery.filter((m) => m.level === "MASTERED").length}
          </p>
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            Destrezas dominadas
          </p>
        </div>
      </section>

      {achievements.length > 0 && (
        <section>
          <h2 className="font-semibold mb-3">Insignias</h2>
          <div className="flex flex-wrap gap-3">
            {achievements.map((a) => (
              <div key={a.id} className="card px-4 py-3 flex items-center gap-2">
                <span className="text-2xl" aria-hidden>
                  🏅
                </span>
                <span className="text-sm font-medium">{a.achievement.title}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-semibold mb-3">Destrezas por materia</h2>
        <div className="space-y-2">
          {mastery.length === 0 && (
            <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
              Completa lecciones para ver tu progreso aquí.
            </p>
          )}
          {mastery.map((m) => (
            <div key={m.id} className="card p-3 flex items-center justify-between text-sm">
              <span>
                {m.competency.subject.name} — {m.competency.description}
              </span>
              <span className="font-semibold">{MASTERY_LABEL[m.level]}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
