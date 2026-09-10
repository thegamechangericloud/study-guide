import Link from "next/link";
import { requireAdult } from "@/lib/guards";
import { logoutAdult } from "@/actions/auth";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdult(["PARENT"]);

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: "var(--color-border)" }}>
        <Link href="/parent" className="font-bold flex items-center gap-2 focus-ring">
          <span aria-hidden>👨‍👩‍👧</span> Panel Familiar
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span>{session.name}</span>
          <Link href="/profiles" className="underline focus-ring">
            Perfiles de estudiante
          </Link>
          <form action={logoutAdult}>
            <button type="submit" className="underline focus-ring">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">{children}</main>
    </div>
  );
}
