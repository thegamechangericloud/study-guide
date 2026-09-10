"use client";

import { useState, useTransition } from "react";
import { submitDiagnostic } from "@/actions/diagnostic";

type Question = {
  prompt: string;
  options: { label: string; correct: boolean }[];
};

// Five short, broadly-applicable literacy/counting questions — this is a
// lightweight placement heuristic for early grades (see submitDiagnostic's
// scoping note), not a full adaptive assessment bank.
const QUESTIONS: Question[] = [
  {
    prompt: "¿Cuál palabra empieza con la letra S?",
    options: [
      { label: "Sol", correct: true },
      { label: "Mango", correct: false },
      { label: "Perro", correct: false },
    ],
  },
  {
    prompt: "¿Cuántos cocos hay? 🥥🥥🥥",
    options: [
      { label: "2", correct: false },
      { label: "3", correct: true },
      { label: "5", correct: false },
    ],
  },
  {
    prompt: "\"Ana va al colmado.\" ¿A dónde va Ana?",
    options: [
      { label: "Al colmado", correct: true },
      { label: "A la escuela", correct: false },
      { label: "Al río", correct: false },
    ],
  },
  {
    prompt: "¿Cuál número es mayor?",
    options: [
      { label: "4", correct: false },
      { label: "7", correct: true },
      { label: "1", correct: false },
    ],
  },
  {
    prompt: "¿Qué palabra rima con \"gato\"?",
    options: [
      { label: "pato", correct: true },
      { label: "mesa", correct: false },
      { label: "sol", correct: false },
    ],
  },
];

export function DiagnosticQuiz({ diagnosticAssessmentId }: { diagnosticAssessmentId: string }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isPending, startTransition] = useTransition();
  const question = QUESTIONS[index];
  const isLast = index === QUESTIONS.length - 1;

  function choose(correct: boolean) {
    const nextScore = correct ? score + 1 : score;
    if (isLast) {
      startTransition(() => {
        submitDiagnostic({ diagnosticAssessmentId, score: nextScore, total: QUESTIONS.length });
      });
    } else {
      setScore(nextScore);
      setIndex((i) => i + 1);
    }
  }

  return (
    <div className="card p-6 space-y-6">
      <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
        Pregunta {index + 1} de {QUESTIONS.length}
      </p>
      <p className="text-xl font-semibold">{question.prompt}</p>
      <div className="grid gap-3">
        {question.options.map((opt) => (
          <button
            key={opt.label}
            type="button"
            disabled={isPending}
            onClick={() => choose(opt.correct)}
            className="kid-card px-4 py-3 text-left font-medium focus-ring disabled:opacity-50"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
