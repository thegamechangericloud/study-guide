"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/guards";

const submitSchema = z.object({
  diagnosticAssessmentId: z.string(),
  score: z.number().int().min(0),
  total: z.number().int().min(1),
});

/// Maps a raw score to a starting-point recommendation. Deliberately a
/// simple heuristic (score thresholds), not a real adaptive-testing model —
/// see docs/07-implementation-roadmap.md, this is a lightweight MVP of the
/// "diagnostic assessment -> recommendation" Phase 2 item, not the full
/// teacher-overridable engine described in the product spec §7.
function recommendLevel(score: number, total: number): string {
  const ratio = score / total;
  if (ratio >= 0.8) return "Listo para avanzar";
  if (ratio >= 0.5) return "En nivel esperado";
  return "Reforzar fundamentos";
}

export async function submitDiagnostic(input: { diagnosticAssessmentId: string; score: number; total: number }) {
  const session = await requireStudent();
  const parsed = submitSchema.parse(input);

  await prisma.diagnosticResult.create({
    data: {
      studentProfileId: session.sub,
      diagnosticAssessmentId: parsed.diagnosticAssessmentId,
      recommendedLevel: recommendLevel(parsed.score, parsed.total),
    },
  });

  redirect("/student?diagnostic=done");
}
