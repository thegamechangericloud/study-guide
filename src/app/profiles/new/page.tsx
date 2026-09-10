import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/guards";
import { NewStudentProfileForm } from "@/components/forms/NewStudentProfileForm";

export default async function NewProfilePage() {
  const session = await requireAdult(["PARENT", "TEACHER", "SCHOOL_ADMIN"]);

  const grades = await prisma.grade.findMany({
    orderBy: [{ level: "asc" }, { order: "asc" }],
    select: { id: true, name: true, level: true },
  });

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-12 gap-4">
      <h1 className="text-2xl font-bold">Agregar estudiante</h1>
      <NewStudentProfileForm grades={grades} showRelationship={session.role === "PARENT"} />
    </main>
  );
}
