import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/guards";
import { markAllNotificationsRead } from "@/actions/notifications";

const NOTIFICATION_ICON: Record<string, string> = {
  WEEKLY_SUMMARY: "📊",
  TEACHER_MESSAGE: "💬",
  ASSIGNMENT_DUE: "📅",
  ACHIEVEMENT_EARNED: "🏅",
  SYSTEM: "🔔",
};

export default async function ParentHomePage() {
  const session = await requireAdult(["PARENT"]);

  const guardianships = await prisma.guardianship.findMany({
    where: { userId: session.sub },
    include: { studentProfile: { include: { currentGrade: true } } },
  });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const children = await Promise.all(
    guardianships.map(async (g) => {
      const [completedCount, timeSpentAgg] = await Promise.all([
        prisma.progressCheckpoint.count({
          where: { studentProfileId: g.studentProfileId, completed: true },
        }),
        prisma.attempt.aggregate({
          where: { studentProfileId: g.studentProfileId },
          _sum: { timeSpentSeconds: true },
        }),
      ]);
      return {
        profile: g.studentProfile,
        completedCount,
        minutesSpent: Math.round((timeSpentAgg._sum.timeSpentSeconds ?? 0) / 60),
      };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis hijos</h1>
        <Link href="/profiles/new" className="btn-primary px-4 py-2 text-sm font-semibold focus-ring">
          + Agregar estudiante
        </Link>
      </div>

      {notifications.length > 0 && (
        <section className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">
              🔔 Notificaciones {unreadCount > 0 && `(${unreadCount} nuevas)`}
            </h2>
            {unreadCount > 0 && (
              <form action={markAllNotificationsRead}>
                <button type="submit" className="text-xs underline focus-ring">
                  Marcar todas como leídas
                </button>
              </form>
            )}
          </div>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 text-sm p-2 rounded-md"
                style={{ background: n.readAt ? "transparent" : "color-mix(in srgb, var(--color-accent) 12%, white)" }}
              >
                <span aria-hidden>{NOTIFICATION_ICON[n.type] ?? "🔔"}</span>
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p style={{ color: "var(--color-ink-muted)" }}>{n.body}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-ink-muted)" }}>
                    {n.createdAt.toLocaleDateString("es-DO")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {children.length === 0 && (
        <p style={{ color: "var(--color-ink-muted)" }}>
          Aún no has creado un perfil de estudiante.
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {children.map(({ profile, completedCount, minutesSpent }) => (
          <Link
            key={profile.id}
            href={`/parent/children/${profile.id}`}
            className="card p-5 block hover:shadow-md focus-ring"
          >
            <h2 className="font-semibold text-lg">{profile.displayName}</h2>
            <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
              {profile.currentGrade?.name}
            </p>
            <div className="flex gap-4 mt-3 text-sm">
              <span>✅ {completedCount} lecciones</span>
              <span>⏱ {minutesSpent} min</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
