import Link from "next/link";
import { requireStudent } from "@/lib/guards";
import { exitStudentMode } from "@/actions/students";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStudent();

  return (
    <div className="flex-1 flex flex-col">
      <header
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: "var(--color-primary)", color: "white" }}
      >
        <Link href="/student" className="font-bold flex items-center gap-2 focus-ring">
          <span aria-hidden>🌺</span> Estudia RD
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span>Hola, {session.displayName} 👋</span>
          <Link href="/student/progress" className="underline focus-ring">
            Mis logros
          </Link>
          <Link href="/accessibility" className="underline focus-ring">
            ⚙️
          </Link>
          <form action={exitStudentMode}>
            <button type="submit" className="underline focus-ring">
              Salir
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">{children}</main>
    </div>
  );
}
