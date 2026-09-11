import Link from "next/link";
import type { CSSProperties } from "react";
import { getAdultSession } from "@/lib/session";

const LEVELS = [
  {
    title: "Nivel Inicial",
    emoji: "🌱",
    color: "var(--color-accent)",
    blurb: "Pre-Kínder, Kínder y Preprimario — exploradores tempranos aprendiendo jugando.",
  },
  {
    title: "Nivel Primario",
    emoji: "📖",
    color: "var(--color-palm)",
    blurb: "1ro a 6to grado — lectores en desarrollo dominando todas las materias.",
  },
  {
    title: "Nivel Secundario",
    emoji: "🚀",
    color: "var(--color-sky)",
    blurb: "1ro a 6to de secundaria — aprendices independientes con planes de estudio.",
  },
];

const FEATURES = [
  { emoji: "📚", text: "Fonética, lectura, escritura y comprensión desde el Nivel Inicial.", color: "var(--color-coral)" },
  { emoji: "🎮", text: "Juegos, videos interactivos y evaluaciones por competencia.", color: "var(--color-grape)" },
  { emoji: "👨‍👩‍👧", text: "Panel para padres con progreso claro y comprensible.", color: "var(--color-secondary)" },
  { emoji: "🧑‍🏫", text: "Panel para maestros: clases, tareas y retroalimentación.", color: "var(--color-sky)" },
  { emoji: "🔒", text: "Privacidad primero: sin publicidad ni mensajería pública.", color: "var(--color-primary)" },
  { emoji: "📶", text: "Funciona incluso con conexión limitada.", color: "var(--color-palm)" },
];

export default async function WelcomePage() {
  const session = await getAdultSession();

  return (
    <main className="flex-1 flex flex-col kid-zone">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-3xl" aria-hidden>
            🌺
          </span>
          <span className="font-extrabold text-xl" style={{ color: "var(--color-primary)" }}>
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
              className="btn-fun px-5 py-2.5 focus-ring"
            >
              Ir a mi panel
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 font-semibold focus-ring">
                Iniciar sesión
              </Link>
              <Link href="/register" className="btn-fun px-5 py-2.5 focus-ring">
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="max-w-6xl mx-auto w-full px-6 py-12 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Aprender a leer y crecer,{" "}
            <span style={{ color: "var(--color-secondary)" }}>jugando</span> un paso a la vez. 🎈
          </h1>
          <p className="text-lg mb-6" style={{ color: "var(--color-ink-muted)" }}>
            Lecciones interactivas, cuentos narrados y juegos educativos alineados con el
            currículo del MINERD — desde el Nivel Inicial hasta el final de la Secundaria.
            Para estudiantes, familias, maestros y escuelas de la República Dominicana.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="btn-fun px-6 py-3 text-lg focus-ring">
              🎉 Comenzar gratis
            </Link>
            <Link
              href="/profiles"
              className="px-6 py-3 font-semibold kid-card focus-ring"
            >
              Ya tengo un perfil de estudiante
            </Link>
          </div>
        </div>
        <div className="kid-card p-8 flex flex-col gap-4" style={{ "--subject-color": "var(--color-primary)" } as CSSProperties}>
          <h2 className="font-extrabold text-xl">✨ Diseñada para toda la familia escolar</h2>
          <ul className="space-y-3 text-sm">
            {FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3">
                <span className="subject-icon" style={{ "--subject-color": f.color } as CSSProperties} aria-hidden>
                  {f.emoji}
                </span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-6xl mx-auto w-full px-6 py-8 grid sm:grid-cols-3 gap-6">
        {LEVELS.map((lvl) => (
          <div
            key={lvl.title}
            className="kid-card p-6 text-center"
            style={{ "--subject-color": lvl.color } as CSSProperties}
          >
            <span className="subject-icon mx-auto mb-3" style={{ fontSize: "1.75rem", width: "3.5rem", height: "3.5rem" }} aria-hidden>
              {lvl.emoji}
            </span>
            <h3 className="font-bold mb-2">{lvl.title}</h3>
            <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
              {lvl.blurb}
            </p>
          </div>
        ))}
      </section>

      <footer className="mt-auto px-6 py-6 text-center text-xs" style={{ color: "var(--color-ink-muted)" }}>
        <Link href="/accessibility" className="underline focus-ring">
          Configuración de accesibilidad
        </Link>
      </footer>
    </main>
  );
}
