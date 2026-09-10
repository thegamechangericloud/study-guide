import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RegisterForm } from "@/components/forms/RegisterForm";

export default async function RegisterPage() {
  const schools = await prisma.school.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-4">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>
      <RegisterForm schools={schools} />
      <p className="text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="underline focus-ring">
          Iniciar sesión
        </Link>
      </p>
    </main>
  );
}
