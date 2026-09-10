import "server-only";
import { prisma } from "@/lib/prisma";
import { notifyGuardiansOfStudent } from "@/lib/notify";

/// Achievement codes must match Achievement.code rows seeded in
/// prisma/seed.ts exactly. Defined once here so the seed data and the
/// runtime award-checker never drift apart.
export const ACHIEVEMENT_CODES = {
  FIRST_LESSON: "FIRST_LESSON",
  FIVE_LESSONS: "FIVE_LESSONS",
  TEN_LESSONS: "TEN_LESSONS",
  TWENTY_LESSONS: "TWENTY_LESSONS",
  STREAK_3: "STREAK_3",
  STREAK_7: "STREAK_7",
  PERFECT_QUIZ: "PERFECT_QUIZ",
  MULTI_SUBJECT_3: "MULTI_SUBJECT_3",
} as const;

/// Computes the student's current daily-activity streak (consecutive
/// calendar days, most recent day first) from ProgressCheckpoint access
/// timestamps — no dedicated streak column, so a student's streak is
/// always derivable from their real activity history rather than a
/// counter that can drift out of sync with it.
export async function computeStreakDays(studentProfileId: string): Promise<number> {
  const checkpoints = await prisma.progressCheckpoint.findMany({
    where: { studentProfileId },
    select: { lastAccessedAt: true },
    orderBy: { lastAccessedAt: "desc" },
  });
  if (checkpoints.length === 0) return 0;

  const activeDays = new Set(
    checkpoints.map((c) => c.lastAccessedAt.toISOString().slice(0, 10))
  );
  const today = new Date();
  let streak = 0;
  for (let i = 0; ; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (activeDays.has(key)) {
      streak++;
    } else if (i === 0) {
      // Today has no activity yet — that's fine, check if yesterday
      // continues an existing streak before giving up.
      continue;
    } else {
      break;
    }
  }
  return streak;
}

/// Call after any event that could unlock an achievement (lesson
/// completed, quiz scored). Awards every newly-qualifying achievement and
/// notifies guardians — safe to call often, already-awarded achievements
/// are skipped via the unique (studentProfileId, achievementId) pair.
export async function checkAndAwardAchievements(studentProfileId: string) {
  const [completedCount, attempts, completedLessons, streak, awardedRows] = await Promise.all([
    prisma.progressCheckpoint.count({ where: { studentProfileId, completed: true } }),
    prisma.attempt.findMany({
      where: { studentProfileId, scoreRaw: { not: null }, scoreMax: { not: null } },
      select: { scoreRaw: true, scoreMax: true },
    }),
    prisma.progressCheckpoint.findMany({
      where: { studentProfileId, completed: true },
      include: { lesson: { include: { unit: true } } },
    }),
    computeStreakDays(studentProfileId),
    prisma.studentAchievement.findMany({
      where: { studentProfileId },
      select: { achievement: { select: { code: true } } },
    }),
  ]);

  const perfectQuizCount = attempts.filter((a) => a.scoreRaw === a.scoreMax).length;
  const subjectCount = new Set(completedLessons.map((r) => r.lesson.unit.subjectId)).size;
  const alreadyAwarded = new Set(awardedRows.map((r) => r.achievement.code));

  const qualifies: { code: string }[] = [];
  if (completedCount >= 1) qualifies.push({ code: ACHIEVEMENT_CODES.FIRST_LESSON });
  if (completedCount >= 5) qualifies.push({ code: ACHIEVEMENT_CODES.FIVE_LESSONS });
  if (completedCount >= 10) qualifies.push({ code: ACHIEVEMENT_CODES.TEN_LESSONS });
  if (completedCount >= 20) qualifies.push({ code: ACHIEVEMENT_CODES.TWENTY_LESSONS });
  if (streak >= 3) qualifies.push({ code: ACHIEVEMENT_CODES.STREAK_3 });
  if (streak >= 7) qualifies.push({ code: ACHIEVEMENT_CODES.STREAK_7 });
  if (perfectQuizCount >= 1) qualifies.push({ code: ACHIEVEMENT_CODES.PERFECT_QUIZ });
  if (subjectCount >= 3) qualifies.push({ code: ACHIEVEMENT_CODES.MULTI_SUBJECT_3 });

  const toAward = qualifies.filter((q) => !alreadyAwarded.has(q.code));
  if (toAward.length === 0) return [];

  const achievementRows = await prisma.achievement.findMany({
    where: { code: { in: toAward.map((t) => t.code) } },
  });

  for (const achievement of achievementRows) {
    await prisma.studentAchievement.create({
      data: { studentProfileId, achievementId: achievement.id },
    });
    await notifyGuardiansOfStudent(studentProfileId, {
      type: "ACHIEVEMENT_EARNED",
      title: `¡Nueva insignia! ${achievement.title}`,
      body: achievement.description,
    });
  }

  return achievementRows;
}
