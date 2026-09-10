"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getStudentSession } from "@/lib/session";
import { checkAndAwardAchievements } from "@/lib/achievements";

const checkpointSchema = z.object({
  lessonId: z.string(),
  activityId: z.string().optional(),
  positionStep: z.number().int().nonnegative().optional(),
  positionSeconds: z.number().int().nonnegative().optional(),
  completed: z.boolean().optional(),
});

/// Called after every activity/video checkpoint. Upserts a single row per
/// (student, lesson) so "Continue Learning" always resumes exactly here.
export async function saveCheckpoint(input: z.infer<typeof checkpointSchema>) {
  const session = await getStudentSession();
  if (!session) return { ok: false as const, error: "No hay sesión de estudiante activa." };

  const parsed = checkpointSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Datos de progreso inválidos." };

  const { lessonId, activityId, positionStep, positionSeconds, completed } = parsed.data;

  await prisma.progressCheckpoint.upsert({
    where: {
      studentProfileId_lessonId: {
        studentProfileId: session.sub,
        lessonId,
      },
    },
    create: {
      studentProfileId: session.sub,
      lessonId,
      lastActivityId: activityId,
      positionStep,
      positionSeconds,
      completed: completed ?? false,
      completedAt: completed ? new Date() : null,
    },
    update: {
      lastActivityId: activityId,
      positionStep,
      positionSeconds,
      completed: completed ?? undefined,
      completedAt: completed ? new Date() : undefined,
      lastAccessedAt: new Date(),
    },
  });

  if (completed) {
    await checkAndAwardAchievements(session.sub);
  }

  return { ok: true as const };
}

const attemptSchema = z.object({
  activityId: z.string(),
  scoreRaw: z.number().int().nonnegative().optional(),
  scoreMax: z.number().int().nonnegative().optional(),
  timeSpentSeconds: z.number().int().nonnegative().default(0),
  responsePayload: z.unknown().optional(),
});

/// Attempts (score/time/completion) are recorded separately from mastery —
/// completing an activity doesn't automatically imply mastery of the
/// underlying competencies.
export async function recordAttempt(input: z.infer<typeof attemptSchema>) {
  const session = await getStudentSession();
  if (!session) return { ok: false as const, error: "No hay sesión de estudiante activa." };

  const parsed = attemptSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Datos de intento inválidos." };

  const attempt = await prisma.attempt.create({
    data: {
      studentProfileId: session.sub,
      activityId: parsed.data.activityId,
      status: "SUBMITTED",
      scoreRaw: parsed.data.scoreRaw,
      scoreMax: parsed.data.scoreMax,
      timeSpentSeconds: parsed.data.timeSpentSeconds,
      responsePayload: parsed.data.responsePayload as never,
      completedAt: new Date(),
    },
  });

  if (
    parsed.data.scoreRaw !== undefined &&
    parsed.data.scoreMax !== undefined &&
    parsed.data.scoreMax > 0
  ) {
    const ratio = parsed.data.scoreRaw / parsed.data.scoreMax;
    const activity = await prisma.activity.findUnique({
      where: { id: parsed.data.activityId },
      include: { lesson: { include: { competencies: true } } },
    });
    if (activity) {
      const level = ratio >= 0.9 ? "MASTERED" : ratio >= 0.7 ? "PROFICIENT" : "DEVELOPING";
      for (const lc of activity.lesson.competencies) {
        await prisma.skillMastery.upsert({
          where: {
            studentProfileId_competencyId: {
              studentProfileId: session.sub,
              competencyId: lc.competencyId,
            },
          },
          create: {
            studentProfileId: session.sub,
            competencyId: lc.competencyId,
            level,
          },
          update: { level },
        });
      }
    }
  }

  return { ok: true as const, attemptId: attempt.id };
}
