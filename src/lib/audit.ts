import "server-only";
import { prisma } from "@/lib/prisma";

export async function logAudit(params: {
  actorId?: string | null;
  schoolId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId ?? null,
      schoolId: params.schoolId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata as never,
    },
  });
}
