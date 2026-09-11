"use client";

import { useState } from "react";

type AnswerOption = { id: string; label: string; isCorrect: boolean };
type Question = { id: string; prompt: string; explanation: string | null; answerOptions: AnswerOption[] };

export function QuizPlayer({
  questions,
  onDone,
}: {
  questions: Question[];
  onDone: (result: { correct: number; total: number }) => void;
}) {
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const question = questions[index];
  const isLast = index === questions.length - 1;

  function choose(option: AnswerOption) {
    if (revealed) return;
    setSelectedId(option.id);
    setRevealed(true);
    if (option.isCorrect) setCorrectCount((c) => c + 1);
  }

  function next() {
    if (isLast) {
      onDone({ correct: correctCount, total: questions.length });
      return;
    }
    setIndex((i) => i + 1);
    setSelectedId(null);
    setRevealed(false);
  }

  const selected = question.answerOptions.find((o) => o.id === selectedId);

  return (
    <div className="card p-6 space-y-5">
      <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
        Pregunta {index + 1} de {questions.length}
      </p>
      <p className="text-xl font-semibold">{question.prompt}</p>

      <div className="space-y-2">
        {question.answerOptions.map((option) => {
          const showCorrect = revealed && option.isCorrect;
          const showWrong = revealed && selectedId === option.id && !option.isCorrect;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => choose(option)}
              disabled={revealed}
              className="w-full text-left px-4 py-3 rounded-xl border-2 font-semibold focus-ring transition-transform hover:scale-[1.01]"
              style={{
                borderColor: showCorrect
                  ? "var(--color-palm)"
                  : showWrong
                    ? "var(--color-coral)"
                    : "var(--color-border)",
                background: showCorrect
                  ? "color-mix(in srgb, var(--color-palm) 25%, white)"
                  : showWrong
                    ? "color-mix(in srgb, var(--color-coral) 25%, white)"
                    : "var(--color-surface)",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div
          role="status"
          className="text-sm p-3 rounded-md"
          style={{
            background: selected?.isCorrect
              ? "color-mix(in srgb, var(--color-palm) 15%, white)"
              : "color-mix(in srgb, var(--color-coral) 15%, white)",
          }}
        >
          {selected?.isCorrect ? "¡Correcto! 🎉" : "Casi. Sigue intentando."}{" "}
          {question.explanation}
        </div>
      )}

      {revealed && (
        <div className="text-right">
          <button type="button" onClick={next} className="btn-fun px-6 py-2.5 focus-ring">
            {isLast ? "Terminar" : "Siguiente →"}
          </button>
        </div>
      )}
    </div>
  );
}
