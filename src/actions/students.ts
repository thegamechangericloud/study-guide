"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashSecret, verifySecret } from "@/lib/password";
import { getAdultSession } from "@/lib/session";
import { createStudentSession, destroyStudentSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import type { FormState } from "@/actions/auth";
import type { GuardianRelationship } from "@prisma/client";

const createProfileSchema = z.object({
  displayName: z.string().trim().min(1, "Ingresa el nombre del estudiante."),
  gradeId: z.string().min(1, "Selecciona el grado."),
  pin: z.string().regex(/^\d{4,6}$/, "El PIN debe tener entre 4 y 6 dígitos."),
  relationship: z.string().optional(),
  avatarKey: z.string().default("default"),
});

/// Only a verified adult (parent, teacher, or school admin) may create a
/// child profile — children never self-register. See spec section 6.
export async function createStudentProfile(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getAdultSession();
  if (!session) redirect("/login");

  const parsed = createProfileSchema.safeParse({
    displayName: formData.get("displayName"),
    gradeId: formData.get("gradeId"),
    pin: formData.get("pin"),
    relationship: formData.get("relationship") || undefined,
    avatarKey: formData.get("avatarKey") || "default",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const grade = await prisma.grade.findUnique({ where: { id: parsed.data.gradeId } });
  if (!grade) return { error: "Grado no válido." };

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) redirect("/login");

  const pinHash = await hashSecret(parsed.data.pin);

  const profile = await prisma.studentProfile.create({
    data: {
      displayName: parsed.data.displayName,
      avatarKey: parsed.data.avatarKey,
      pinHash,
      ageInterfaceGroup: grade.defaultAgeGroup,
      currentGradeId: grade.id,
      schoolId: user!.schoolId,
      createdById: session.sub,
    },
  });

  if (session.role === "PARENT") {
    await prisma.guardianship.create({
      data: {
        userId: session.sub,
        studentProfileId: profile.id,
        relationship: (parsed.data.relationship as GuardianRelationship) ?? "OTHER_FAMILY",
        isPrimary: true,
      },
    });
  }

  await logAudit({
    actorId: session.sub,
    schoolId: user?.schoolId,
    action: "STUDENT_PROFILE_CREATED",
    entityType: "StudentProfile",
    entityId: profile.id,
  });

  redirect("/profiles");
}

const pinLoginSchema = z.object({
  profileId: z.string().min(1),
  pin: z.string().min(4),
});

export async function loginStudentWithPin(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const adult = await getAdultSession();
  if (!adult) redirect("/login");

  const parsed = pinLoginSchema.safeParse({
    profileId: formData.get("profileId"),
    pin: formData.get("pin"),
  });
  if (!parsed.success) return { error: "PIN inválido." };

  const profile = await prisma.studentProfile.findUnique({
    where: { id: parsed.data.profileId },
  });
  if (!profile || !profile.active) return { error: "Perfil no encontrado." };

  const valid = await verifySecret(parsed.data.pin, profile.pinHash);
  if (!valid) return { error: "PIN incorrecto. Inténtalo de nuevo." };

  await createStudentSession({
    sub: profile.id,
    activatedByUserId: adult.sub,
    displayName: profile.displayName,
  });

  await logAudit({
    actorId: adult.sub,
    schoolId: profile.schoolId,
    action: "STUDENT_SESSION_STARTED",
    entityType: "StudentProfile",
    entityId: profile.id,
  });

  redirect("/student");
}

export async function exitStudentMode() {
  await destroyStudentSession();
  redirect("/profiles");
}
