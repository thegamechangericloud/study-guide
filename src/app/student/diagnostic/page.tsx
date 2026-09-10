import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/guards";
import { DiagnosticQuiz } from "@/components/DiagnosticQuiz";

export default async function DiagnosticPage() {
  await requireStudent();

  const assessment = await prisma.diagnosticAssessment.findFirst({
    where: { title: "Diagnóstico inicial de lectura" },
  });
  if (!assessment) notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">📝 Diagnóstico inicial</h1>
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          Cinco preguntas cortas para saber por dónde empezar. No hay calificación — ¡solo
          contesta lo mejor que puedas!
        </p>
      </div>
      <DiagnosticQuiz diagnosticAssessmentId={assessment.id} />
    </div>
  );
}
