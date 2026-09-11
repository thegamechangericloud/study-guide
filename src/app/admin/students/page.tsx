import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/guards";

export default async function AdminStudentsPage() {
  const session = await requireAdult(["SCHOOL_ADMIN", "PLATFORM_ADMIN"]);

  const students = await prisma.studentProfile.findMany({
    where: { schoolId: session.schoolId ?? undefined },
    include: {
      currentGrade: true,
      enrollments: {
        where: { exitedAt: null },
        include: { classroom: { include: { teachers: { include: { teacher: true } } } } },
      },
    },
    orderBy: { displayName: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Estudiantes</h1>
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          Edita la información de un estudiante, su grado y su clase asignada.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="py-2 pr-4">Nombre</th>
              <th className="py-2 pr-4">Grado</th>
              <th className="py-2 pr-4">Clase</th>
              <th className="py-2 pr-4">Maestro/a</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const enrollment = s.enrollments[0];
              const teacherNames = enrollment?.classroom.teachers.map((t) => t.teacher.name).join(", ");
              return (
                <tr key={s.id} className="border-t" style={{ borderColor: "var(--color-border)" }}>
                  <td className="py-2 pr-4 font-medium">{s.displayName}</td>
                  <td className="py-2 pr-4">{s.currentGrade?.name ?? "—"}</td>
                  <td className="py-2 pr-4">
                    {enrollment ? `${enrollment.classroom.section}` : "Sin asignar"}
                  </td>
                  <td className="py-2 pr-4">{teacherNames || "—"}</td>
                  <td className="py-2 pr-4">
                    <Link href={`/admin/students/${s.id}`} className="underline focus-ring">
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
