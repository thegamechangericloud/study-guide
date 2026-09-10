import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/guards";
import { toggleBibleStudies } from "@/actions/admin";

export default async function AdminHomePage() {
  const session = await requireAdult(["SCHOOL_ADMIN", "PLATFORM_ADMIN"]);

  const school = session.schoolId
    ? await prisma.school.findUnique({ where: { id: session.schoolId } })
    : null;

  const [teacherCount, studentCount, classroomCount, users, contentBySubject] = await Promise.all([
    prisma.user.count({ where: { role: "TEACHER", schoolId: session.schoolId ?? undefined } }),
    prisma.studentProfile.count({ where: { schoolId: session.schoolId ?? undefined } }),
    prisma.classroom.count({ where: { schoolId: session.schoolId ?? undefined } }),
    prisma.user.findMany({
      where: { schoolId: session.schoolId ?? undefined },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.subject.findMany({
      include: { units: { include: { _count: { select: { lessons: true } } } } },
      orderBy: { name: "asc" },
    }),
  ]);
  const coverage = contentBySubject
    .map((s) => ({
      name: s.name,
      total: s.units.reduce((sum, u) => sum + u._count.lessons, 0),
    }))
    .filter((s) => s.total > 0);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{school?.name ?? "Panel de administración"}</h1>

      <section className="grid sm:grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <p className="text-3xl font-extrabold" style={{ color: "var(--color-primary)" }}>
            {teacherCount}
          </p>
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            Maestros
          </p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-extrabold" style={{ color: "var(--color-secondary)" }}>
            {studentCount}
          </p>
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            Estudiantes
          </p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-extrabold" style={{ color: "var(--color-palm)" }}>
            {classroomCount}
          </p>
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            Clases
          </p>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-semibold mb-3">📚 Cobertura de contenido por materia</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {coverage.map((s) => (
            <div key={s.name} className="flex items-center justify-between text-sm border-b pb-1.5" style={{ borderColor: "var(--color-border)" }}>
              <span>{s.name}</span>
              <span className="font-semibold">{s.total} lecciones</span>
            </div>
          ))}
        </div>
      </section>

      {school && (
        <section className="card p-5">
          <h2 className="font-semibold mb-2">Configuración de Estudios Bíblicos</h2>
          <p className="text-sm mb-3" style={{ color: "var(--color-ink-muted)" }}>
            Materia opcional y separada del currículo oficial de Formación Humana y Religiosa
            del MINERD. Actívala según la orientación religiosa de tu escuela.
          </p>
          <form action={toggleBibleStudies} className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              name="enabled"
              defaultChecked={school.bibleStudiesEnabled}
              className="w-4 h-4"
            />
            <label htmlFor="enabled" className="text-sm">
              Habilitar Estudios Bíblicos para esta escuela
            </label>
            <button type="submit" className="ml-3 text-sm btn-primary px-3 py-1.5 focus-ring">
              Guardar
            </button>
          </form>
        </section>
      )}

      <section>
        <h2 className="font-semibold mb-3">Usuarios</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">Correo</th>
                <th className="py-2 pr-4">Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t" style={{ borderColor: "var(--color-border)" }}>
                  <td className="py-2 pr-4">{u.name}</td>
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
