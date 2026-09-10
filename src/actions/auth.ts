"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashSecret, verifySecret } from "@/lib/password";
import { createAdultSession, destroyAdultSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import type { UserRole } from "@prisma/client";

export type FormState = { error?: string } | undefined;

const registerSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre completo."),
  email: z.string().trim().email("Correo electrónico inválido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  role: z.enum(["PARENT", "TEACHER", "SCHOOL_ADMIN"]),
  schoolId: z.string().optional(),
  newSchoolName: z.string().optional(),
});

/// Self-serve registration is intentionally limited to PARENT, TEACHER, and
/// SCHOOL_ADMIN for this demo build. In production, teacher and school-admin
/// accounts should be provisioned/invited by an existing school admin or
/// platform admin rather than opened to the public — see
/// docs/03-roles-permissions-matrix.md.
export async function registerAdult(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    schoolId: formData.get("schoolId") || undefined,
    newSchoolName: formData.get("newSchoolName") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { name, email, password, role, schoolId, newSchoolName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con este correo electrónico." };
  }

  let resolvedSchoolId: string | null = null;
  if (role === "TEACHER") {
    if (!schoolId) return { error: "Selecciona la escuela a la que perteneces." };
    resolvedSchoolId = schoolId;
  } else if (role === "SCHOOL_ADMIN") {
    if (schoolId) {
      resolvedSchoolId = schoolId;
    } else if (newSchoolName && newSchoolName.trim().length > 1) {
      const school = await prisma.school.create({ data: { name: newSchoolName.trim() } });
      resolvedSchoolId = school.id;
    } else {
      return { error: "Indica el nombre de tu escuela o selecciona una existente." };
    }
  }

  const passwordHash = await hashSecret(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role as UserRole,
      schoolId: resolvedSchoolId,
      emailVerifiedAt: null, // demo: email verification flow is a Phase 2 item
    },
  });

  await logAudit({
    actorId: user.id,
    schoolId: resolvedSchoolId,
    action: "USER_REGISTERED",
    entityType: "User",
    entityId: user.id,
    metadata: { role },
  });

  await createAdultSession({
    sub: user.id,
    role: user.role,
    schoolId: user.schoolId,
    name: user.name,
  });

  redirect(role === "PARENT" ? "/parent" : role === "TEACHER" ? "/teacher" : "/admin");
}

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function loginAdult(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Ingresa un correo y contraseña válidos." };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || user.suspendedAt) {
    return { error: "Correo o contraseña incorrectos." };
  }
  const valid = await verifySecret(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { error: "Correo o contraseña incorrectos." };
  }

  await createAdultSession({
    sub: user.id,
    role: user.role,
    schoolId: user.schoolId,
    name: user.name,
  });

  await logAudit({
    actorId: user.id,
    schoolId: user.schoolId,
    action: "USER_LOGIN",
    entityType: "User",
    entityId: user.id,
  });

  redirect(
    user.role === "PARENT"
      ? "/parent"
      : user.role === "TEACHER"
        ? "/teacher"
        : "/admin"
  );
}

export async function logoutAdult() {
  await destroyAdultSession();
  redirect("/");
}
