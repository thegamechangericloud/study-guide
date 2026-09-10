import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/guards";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const session = await requireStudent();
  const { lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId, status: "PUBLISHED" },
    include: {
      activities: {
        orderBy: { order: "asc" },
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: { answerOptions: { orderBy: { order: "asc" } } },
          },
          mediaAssets: true,
        },
      },
    },
  });
  if (!lesson || lesson.activities.length === 0) notFound();

  const checkpoint = await prisma.progressCheckpoint.findUnique({
    where: { studentProfileId_lessonId: { studentProfileId: session.sub, lessonId } },
  });

  return (
    <LessonPlayer
      lessonId={lesson.id}
      lessonTitle={lesson.title}
      activities={lesson.activities.map((a) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        content: a.content,
        questions: a.questions,
        mediaAssets: a.mediaAssets,
      }))}
      initialStep={checkpoint?.positionStep ?? 0}
      initialPositionSeconds={checkpoint?.positionSeconds ?? undefined}
      alreadyCompleted={checkpoint?.completed ?? false}
    />
  );
}
