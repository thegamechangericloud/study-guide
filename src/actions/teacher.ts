"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/guards";
import { logAudit } from "@/lib/audit";

const assignSchema = z.object({
  classroomId: z.string(),
  lessonId: z.string(),
  dueOn: z.string().optional(),
});

export async function assignLesson(formData: FormData) {
  const session = await requireAdult(["TEACHER", "SCHOOL_ADMIN"]);
  const parsed = assignSchema.parse({
    classroomId: formData.get("classroomId"),
    lessonId: formData.get("lessonId"),
    dueOn: formData.get("dueOn") || undefined,
  });

  const classroom = await prisma.classroom.findUnique({
    where: { id: parsed.classroomId },
    include: { teachers: true },
  });
  if (!classroom) throw new Error("Classroom not found");
  if (
    session.role === "TEACHER" &&
    !classroom.teachers.some((t) => t.teacherId === session.sub)
  ) {
    throw new Error("Not authorized for this classroom");
  }

  const assignment = await prisma.assignment.create({
    data: {
      classroomId: parsed.classroomId,
      lessonId: parsed.lessonId,
      dueOn: parsed.dueOn ? new Date(parsed.dueOn) : undefined,
    },
  });

  await logAudit({
    actorId: session.sub,
    schoolId: session.schoolId,
    action: "LESSON_ASSIGNED",
    entityType: "Assignment",
    entityId: assignment.id,
  });

  revalidatePath(`/teacher/classrooms/${parsed.classroomId}`);
}

const feedbackSchema = z.object({
  studentProfileId: z.string(),
  message: z.string().min(1),
  classroomId: z.string(),
});

/// Teacher -> parent/student feedback only, through this auditable channel —
/// never a private, unsupervised message to a child (spec section 10).
export async function addTeacherFeedback(formData: FormData) {
  const session = await requireAdult(["TEACHER", "SCHOOL_ADMIN"]);
  const parsed = feedbackSchema.parse({
    studentProfileId: formData.get("studentProfileId"),
    message: formData.get("message"),
    classroomId: formData.get("classroomId"),
  });

  const feedback = await prisma.teacherFeedback.create({
    data: {
      teacherId: session.sub,
      studentProfileId: parsed.studentProfileId,
      message: parsed.message,
    },
  });

  await logAudit({
    actorId: session.sub,
    schoolId: session.schoolId,
    action: "TEACHER_FEEDBACK_ADDED",
    entityType: "TeacherFeedback",
    entityId: feedback.id,
  });

  revalidatePath(`/teacher/classrooms/${parsed.classroomId}`);
}

const reopenSchema = z.object({
  assignmentId: z.string(),
  studentProfileId: z.string(),
  classroomId: z.string(),
});

/// Reopens an assignment for one student without deleting their historical
/// attempts (spec section 6: separate completion history from re-open).
export async function reopenAssignmentForStudent(formData: FormData) {
  const session = await requireAdult(["TEACHER", "SCHOOL_ADMIN"]);
  const parsed = reopenSchema.parse({
    assignmentId: formData.get("assignmentId"),
    studentProfileId: formData.get("studentProfileId"),
    classroomId: formData.get("classroomId"),
  });

  await prisma.assignmentStudentOverride.upsert({
    where: {
      assignmentId_studentProfileId: {
        assignmentId: parsed.assignmentId,
        studentProfileId: parsed.studentProfileId,
      },
    },
    create: {
      assignmentId: parsed.assignmentId,
      studentProfileId: parsed.studentProfileId,
      reopened: true,
    },
    update: { reopened: true },
  });

  await logAudit({
    actorId: session.sub,
    schoolId: session.schoolId,
    action: "ASSIGNMENT_REOPENED",
    entityType: "Assignment",
    entityId: parsed.assignmentId,
    metadata: { studentProfileId: parsed.studentProfileId },
  });

  revalidatePath(`/teacher/classrooms/${parsed.classroomId}`);
}
