"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/guards";
import { logAudit } from "@/lib/audit";
import type { ContentStatus } from "@prisma/client";

const STATUS_ORDER: ContentStatus[] = [
  "DRAFT",
  "ACADEMIC_REVIEW",
  "SAFETY_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "ARCHIVED",
];

/// Moves a lesson one step forward (or to ARCHIVED) in the
/// Draft -> ... -> Published workflow. Content only becomes visible to
/// students once it reaches PUBLISHED — see spec section 12.
export async function advanceContentStatus(formData: FormData) {
  const session = await requireAdult(["SCHOOL_ADMIN", "PLATFORM_ADMIN"]);
  const lessonId = String(formData.get("lessonId"));
  const toStatus = formData.get("toStatus") as ContentStatus;

  if (!STATUS_ORDER.includes(toStatus)) throw new Error("Invalid status");

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw new Error("Lesson not found");

  await prisma.$transaction([
    prisma.lesson.update({
      where: { id: lessonId },
      data: {
        status: toStatus,
        publishedAt: toStatus === "PUBLISHED" ? new Date() : lesson.publishedAt,
      },
    }),
    prisma.contentApproval.create({
      data: {
        lessonId,
        fromStatus: lesson.status,
        toStatus,
        reviewerId: session.sub,
      },
    }),
  ]);

  await logAudit({
    actorId: session.sub,
    schoolId: session.schoolId,
    action: "CONTENT_STATUS_CHANGED",
    entityType: "Lesson",
    entityId: lessonId,
    metadata: { from: lesson.status, to: toStatus },
  });

  revalidatePath("/admin/curriculum");
}

export async function toggleBibleStudies(formData: FormData) {
  const session = await requireAdult(["SCHOOL_ADMIN"]);
  const enabled = formData.get("enabled") === "on";
  if (!session.schoolId) throw new Error("No school associated with this account");

  await prisma.school.update({
    where: { id: session.schoolId },
    data: { bibleStudiesEnabled: enabled },
  });

  await logAudit({
    actorId: session.sub,
    schoolId: session.schoolId,
    action: "BIBLE_STUDIES_CONFIG_CHANGED",
    entityType: "School",
    entityId: session.schoolId,
    metadata: { enabled },
  });

  revalidatePath("/admin");
}
