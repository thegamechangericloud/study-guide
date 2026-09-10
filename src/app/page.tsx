import Link from "next/link";
import { getAdultSession } from "@/lib/session";

export default async function WelcomePage() {
  const session = await getAdultSession();

  return (
    <main className="flex-1 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            🌺
          </span>
          <span className="font-bold text-lg" style={{ color: "var(--color-primary)" }}>
            Estudia RD
          </span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          {session ? (
            <Link
              href={
                session.role === "PARENT"
                  ? "/parent"
                  : session.role === "TEACHER"
                    ? "/teacher"
                    : "/admin"
              }
              className="btn-primary px-4 py-2 focus-ring"
            >
              Ir a mi panel
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 focus-ring">
                Iniciar sesión
              </Link>
              <Link href="/register" className="btn-primary px-4 py-2 focus-ring">
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="max-w-6xl mx-auto w-full px-6 py-12 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            Aprender a leer y crecer, un paso a la vez.
          </h1>
          <p className="text-lg mb-6" style={{ color: "var(--color-ink-muted)" }}>
            Lecciones interactivas, cuentos narrados y juegos educativos alineados con el
            currículo del MINERD — desde el Nivel Inicial hasta el final de la Secundaria.
            Para estudiantes, familias, maestros y escuelas de la República Dominicana.
          </p>
          <div className="flex gap-3">
            <Link href="/register" className="btn-primary px-6 py-3 font-semibold focus-ring">
              Comenzar gratis
            </Link>
            <Link
              href="/profiles"
              className="px-6 py-3 font-semibold card focus-ring"
            >
              Ya tengo un perfil de estudiante
            </Link>
          </div>
        </div>
        <div className="card p-8 flex flex-col gap-4">
          <h2 className="font-bold text-xl">Diseñada para toda la familia escolar</h2>
          <ul className="space-y-3 text-sm">
            <li>📚 Fonética, lectura, escritura y comprensión desde el Nivel Inicial.</li>
            <li>🎮 Juegos, videos interactivos y evaluaciones por competencia.</li>
            <li>👨‍👩‍👧 Panel para padres con progreso claro y comprensible.</li>
            <li>🧑‍🏫 Panel para maestros: clases, tareas y retroalimentación.</li>
            <li>🔒 Privacidad primero: sin publicidad ni mensajería pública.</li>
            <li>📶 Funciona incluso con conexión limitada.</li>
          </ul>
        </div>
      </section>

      <section className="max-w-6xl mx-auto w-full px-6 py-8 grid sm:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-2">Nivel Inicial</h3>
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            Pre-Kínder, Kínder y Preprimario — exploradores tempranos aprendiendo jugando.
          </p>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold mb-2">Nivel Primario</h3>
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            1ro a 6to grado — lectores en desarrollo dominando todas las materias.
          </p>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold mb-2">Nivel Secundario</h3>
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            1ro a 6to de secundaria — aprendices independientes con planes de estudio.
          </p>
        </div>
      </section>

      <footer className="mt-auto px-6 py-6 text-center text-xs" style={{ color: "var(--color-ink-muted)" }}>
        <Link href="/accessibility" className="underline focus-ring">
          Configuración de accesibilidad
        </Link>
      </footer>
    </main>
  );
}
