"use client";

import { useState } from "react";
import type { WordBuilderContent } from "@/lib/activity-types";

export function WordBuilder({
  content,
  onDone,
}: {
  content: WordBuilderContent;
  onDone: (result: { correct: number; total: number }) => void;
}) {
  // Shuffled once at mount via a lazy initializer — not recomputed on re-render.
  const [bank] = useState(() => [...content.wordBank].sort(() => Math.random() - 0.5));
  const [used, setUsed] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const answer = used.map((i) => bank[i]);

  function addWord(i: number) {
    if (used.includes(i)) return;
    setUsed((u) => [...u, i]);
    setFeedback(null);
  }
  function reset() {
    setUsed([]);
    setFeedback(null);
  }
  function check() {
    const ok = answer.join(" ") === content.correctOrder.join(" ");
    setFeedback(ok ? "correct" : "wrong");
    if (ok) {
      setTimeout(() => onDone({ correct: 1, total: 1 }), 700);
    }
  }

  return (
    <div className="card p-6 space-y-5">
      <p className="text-lg font-semibold">{content.prompt}</p>

      <div
        className="min-h-16 rounded-lg border-2 border-dashed p-3 flex flex-wrap gap-2 items-center"
        style={{ borderColor: "var(--color-border)" }}
      >
        {answer.length === 0 && (
          <span className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            Toca las palabras abajo en orden…
          </span>
        )}
        {answer.map((w, i) => (
          <span key={i} className="px-3 py-1.5 rounded-md font-medium" style={{ background: "var(--color-accent)" }}>
            {w}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {bank.map((w, i) => (
          <button
            key={i}
            type="button"
            disabled={used.includes(i)}
            onClick={() => addWord(i)}
            className="px-3 py-1.5 rounded-md border font-medium focus-ring disabled:opacity-30"
            style={{ borderColor: "var(--color-border)" }}
          >
            {w}
          </button>
        ))}
      </div>

      {feedback === "wrong" && (
        <p style={{ color: "var(--color-coral)" }}>No es el orden correcto. ¡Inténtalo de nuevo!</p>
      )}
      {feedback === "correct" && <p style={{ color: "var(--color-palm)" }}>¡Perfecto! 🎉</p>}

      <div className="flex justify-between">
        <button type="button" onClick={reset} className="px-4 py-2 card focus-ring">
          Reiniciar
        </button>
        <button
          type="button"
          disabled={answer.length !== content.correctOrder.length}
          onClick={check}
          className="btn-fun px-6 py-2.5 focus-ring disabled:opacity-40"
        >
          Comprobar
        </button>
      </div>
    </div>
  );
}
