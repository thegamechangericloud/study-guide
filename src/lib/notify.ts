import "server-only";
import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

/// Creates an in-app notification for every guardian of a student, or a
/// single user directly. No email/SMS delivery exists in this deployment —
/// notifications are read inside the app (parent dashboard bell), never
/// sent externally, so no SMTP/API credentials are needed.
export async function notifyGuardiansOfStudent(
  studentProfileId: string,
  input: { type: NotificationType; title: string; body: string }
) {
  const guardianships = await prisma.guardianship.findMany({
    where: { studentProfileId },
    select: { userId: true },
  });
  if (guardianships.length === 0) return;
  await prisma.notification.createMany({
    data: guardianships.map((g) => ({
      userId: g.userId,
      type: input.type,
      title: input.title,
      body: input.body,
    })),
  });
}

export async function notifyUser(
  userId: string,
  input: { type: NotificationType; title: string; body: string }
) {
  await prisma.notification.create({
    data: { userId, type: input.type, title: input.title, body: input.body },
  });
}
