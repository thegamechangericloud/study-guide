"use server";

import { z } from "zod";
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

const createClassroomSchema = z.object({
  gradeId: z.string().min(1, "Selecciona el grado."),
  section: z.string().trim().min(1, "Ingresa la sección."),
});

export async function createClassroom(formData: FormData) {
  const session = await requireAdult(["SCHOOL_ADMIN", "PLATFORM_ADMIN"]);
  if (!session.schoolId) throw new Error("No school associated with this account");

  const parsed = createClassroomSchema.parse({
    gradeId: formData.get("gradeId"),
    section: formData.get("section"),
  });

  const academicYear = await prisma.academicYear.findFirst({
    where: { schoolId: session.schoolId },
    orderBy: { startsOn: "desc" },
  });
  if (!academicYear) throw new Error("No academic year configured for this school");

  const grade = await prisma.grade.findUnique({ where: { id: parsed.gradeId } });
  if (!grade) throw new Error("Invalid grade");

  const classCode = `${grade.name.slice(0, 3).toUpperCase().replace(/\s/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const classroom = await prisma.classroom.create({
    data: {
      schoolId: session.schoolId,
      academicYearId: academicYear.id,
      gradeId: parsed.gradeId,
      section: parsed.section,
      classCode,
    },
  });

  await logAudit({
    actorId: session.sub,
    schoolId: session.schoolId,
    action: "CLASSROOM_CREATED",
    entityType: "Classroom",
    entityId: classroom.id,
  });

  revalidatePath("/admin/classrooms");
}

const assignTeacherSchema = z.object({
  classroomId: z.string().min(1),
  teacherId: z.string().min(1, "Selecciona un maestro/a."),
});

export async function assignTeacherToClassroom(formData: FormData) {
  const session = await requireAdult(["SCHOOL_ADMIN", "PLATFORM_ADMIN"]);
  const parsed = assignTeacherSchema.parse({
    classroomId: formData.get("classroomId"),
    teacherId: formData.get("teacherId"),
  });

  await prisma.classroomTeacher.upsert({
    where: { classroomId_teacherId: { classroomId: parsed.classroomId, teacherId: parsed.teacherId } },
    create: parsed,
    update: {},
  });

  await logAudit({
    actorId: session.sub,
    schoolId: session.schoolId,
    action: "TEACHER_ASSIGNED_TO_CLASSROOM",
    entityType: "Classroom",
    entityId: parsed.classroomId,
    metadata: { teacherId: parsed.teacherId },
  });

  revalidatePath("/admin/classrooms");
}

const removeTeacherSchema = z.object({
  classroomId: z.string().min(1),
  teacherId: z.string().min(1),
});

export async function removeTeacherFromClassroom(formData: FormData) {
  const session = await requireAdult(["SCHOOL_ADMIN", "PLATFORM_ADMIN"]);
  const parsed = removeTeacherSchema.parse({
    classroomId: formData.get("classroomId"),
    teacherId: formData.get("teacherId"),
  });

  await prisma.classroomTeacher.delete({
    where: { classroomId_teacherId: parsed },
  });

  await logAudit({
    actorId: session.sub,
    schoolId: session.schoolId,
    action: "TEACHER_REMOVED_FROM_CLASSROOM",
    entityType: "Classroom",
    entityId: parsed.classroomId,
    metadata: { teacherId: parsed.teacherId },
  });

  revalidatePath("/admin/classrooms");
}

const editStudentSchema = z.object({
  studentProfileId: z.string().min(1),
  displayName: z.string().trim().min(1, "Ingresa el nombre del estudiante."),
  dateOfBirth: z.string().optional(),
  avatarKey: z.string().default("default"),
  gradeId: z.string().min(1, "Selecciona el grado."),
});

/// Admin-only edit of an existing student's profile — separate from
/// createStudentProfile (parents create profiles; admins correct/maintain
/// them, e.g. after a mid-year grade promotion).
export async function editStudentProfile(formData: FormData) {
  const session = await requireAdult(["SCHOOL_ADMIN", "PLATFORM_ADMIN"]);
  const parsed = editStudentSchema.parse({
    studentProfileId: formData.get("studentProfileId"),
    displayName: formData.get("displayName"),
    dateOfBirth: formData.get("dateOfBirth") || undefined,
    avatarKey: formData.get("avatarKey") || "default",
    gradeId: formData.get("gradeId"),
  });

  const grade = await prisma.grade.findUnique({ where: { id: parsed.gradeId } });
  if (!grade) throw new Error("Invalid grade");

  await prisma.studentProfile.update({
    where: { id: parsed.studentProfileId },
    data: {
      displayName: parsed.displayName,
      dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : null,
      avatarKey: parsed.avatarKey,
      currentGradeId: parsed.gradeId,
      ageInterfaceGroup: grade.defaultAgeGroup,
    },
  });

  await logAudit({
    actorId: session.sub,
    schoolId: session.schoolId,
    action: "STUDENT_PROFILE_EDITED",
    entityType: "StudentProfile",
    entityId: parsed.studentProfileId,
  });

  revalidatePath(`/admin/students/${parsed.studentProfileId}`);
  revalidatePath("/admin/students");
}

const assignClassroomSchema = z.object({
  studentProfileId: z.string().min(1),
  classroomId: z.string().min(1, "Selecciona una clase."),
});

/// Enrolling a student in a classroom is how "assign to a specific
/// teacher" works in this schema — a classroom's teacher(s) come from
/// ClassroomTeacher, so enrolling the student there is the assignment.
export async function assignStudentToClassroom(formData: FormData) {
  const session = await requireAdult(["SCHOOL_ADMIN", "PLATFORM_ADMIN"]);
  const parsed = assignClassroomSchema.parse({
    studentProfileId: formData.get("studentProfileId"),
    classroomId: formData.get("classroomId"),
  });

  const classroom = await prisma.classroom.findUnique({ where: { id: parsed.classroomId } });
  if (!classroom) throw new Error("Classroom not found");

  // A student has one active classroom at a time in this demo — close out
  // any prior enrollment before creating the new one.
  await prisma.$transaction([
    prisma.enrollment.updateMany({
      where: { studentProfileId: parsed.studentProfileId, exitedAt: null },
      data: { exitedAt: new Date() },
    }),
    prisma.enrollment.create({
      data: {
        studentProfileId: parsed.studentProfileId,
        classroomId: parsed.classroomId,
        gradeId: classroom.gradeId,
      },
    }),
  ]);

  await logAudit({
    actorId: session.sub,
    schoolId: session.schoolId,
    action: "STUDENT_ASSIGNED_TO_CLASSROOM",
    entityType: "StudentProfile",
    entityId: parsed.studentProfileId,
    metadata: { classroomId: parsed.classroomId },
  });

  revalidatePath(`/admin/students/${parsed.studentProfileId}`);
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
