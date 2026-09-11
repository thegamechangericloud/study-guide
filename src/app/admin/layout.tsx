import Link from "next/link";
import { requireAdult } from "@/lib/guards";
import { logoutAdult } from "@/actions/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdult(["SCHOOL_ADMIN", "PLATFORM_ADMIN"]);

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: "var(--color-border)" }}>
        <Link href="/admin" className="font-bold flex items-center gap-2 focus-ring">
          <span aria-hidden>🏫</span> Administración Escolar
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/admin/curriculum" className="underline focus-ring">
            Currículo
          </Link>
          <Link href="/admin/classrooms" className="underline focus-ring">
            Clases
          </Link>
          <Link href="/admin/students" className="underline focus-ring">
            Estudiantes
          </Link>
          <span>{session.name}</span>
          <form action={logoutAdult}>
            <button type="submit" className="underline focus-ring">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">{children}</main>
    </div>
  );
}
