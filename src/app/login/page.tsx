import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-4">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      <LoginForm />
      <p className="text-sm">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="underline focus-ring">
          Crear una cuenta
        </Link>
      </p>
    </main>
  );
}
