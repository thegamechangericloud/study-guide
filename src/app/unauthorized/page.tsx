import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-4 text-center">
      <h1 className="text-2xl font-bold">Acceso no autorizado</h1>
      <p style={{ color: "var(--color-ink-muted)" }}>
        Tu cuenta no tiene permiso para ver esta página.
      </p>
      <Link href="/" className="btn-primary px-6 py-2.5 focus-ring">
        Volver al inicio
      </Link>
    </main>
  );
}
