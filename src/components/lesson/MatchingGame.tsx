"use client";

import { useState } from "react";
import { useSpeech } from "./useSpeech";
import type { MatchingContent } from "@/lib/activity-types";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function MatchingGame({
  content,
  onDone,
}: {
  content: MatchingContent;
  onDone: (result: { correct: number; total: number }) => void;
}) {
  const { speak } = useSpeech();
  // Shuffled once at mount via a lazy initializer — not recomputed on re-render.
  const [rightItems] = useState(() => shuffle(content.pairs.map((p) => p.right)));
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, boolean>>({});
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);

  const allMatched = Object.keys(matched).length === content.pairs.length;

  function handleRightClick(right: string) {
    if (!selectedLeft) return;
    const pair = content.pairs.find((p) => p.left === selectedLeft);
    if (pair?.right === right) {
      setMatched((m) => ({ ...m, [selectedLeft]: true }));
      setSelectedLeft(null);
    } else {
      setWrongFlash(right);
      setTimeout(() => setWrongFlash(null), 500);
    }
  }

  return (
    <div className="card p-6 space-y-6">
      <p className="text-lg font-semibold text-center">
        Toca una palabra a la izquierda y luego su pareja a la derecha
      </p>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          {content.pairs.map((p) => (
            <button
              key={p.left}
              type="button"
              disabled={matched[p.left]}
              onClick={() => {
                setSelectedLeft(p.left);
                speak(p.left);
              }}
              className="w-full text-left px-4 py-3 rounded-md border font-medium focus-ring"
              style={{
                borderColor: "var(--color-border)",
                background: matched[p.left]
                  ? "color-mix(in srgb, var(--color-palm) 20%, white)"
                  : selectedLeft === p.left
                    ? "color-mix(in srgb, var(--color-primary) 20%, white)"
                    : "var(--color-surface)",
                opacity: matched[p.left] ? 0.6 : 1,
              }}
            >
              {p.left} {matched[p.left] && "✓"}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {rightItems.map((right) => {
            const isMatched = Object.entries(matched).some(
              ([left]) => content.pairs.find((p) => p.left === left)?.right === right
            );
            return (
              <button
                key={right}
                type="button"
                disabled={isMatched}
                onClick={() => handleRightClick(right)}
                className="w-full text-left px-4 py-3 rounded-md border font-medium focus-ring"
                style={{
                  borderColor: "var(--color-border)",
                  background: isMatched
                    ? "color-mix(in srgb, var(--color-palm) 20%, white)"
                    : wrongFlash === right
                      ? "color-mix(in srgb, var(--color-coral) 30%, white)"
                      : "var(--color-surface)",
                  opacity: isMatched ? 0.6 : 1,
                }}
              >
                {right} {isMatched && "✓"}
              </button>
            );
          })}
        </div>
      </div>

      {allMatched && (
        <div className="text-center">
          <p className="font-semibold mb-3" style={{ color: "var(--color-palm)" }}>
            ¡Excelente trabajo! 🎉
          </p>
          <button
            type="button"
            onClick={() => onDone({ correct: content.pairs.length, total: content.pairs.length })}
            className="btn-primary px-6 py-2 font-semibold focus-ring"
          >
            Continuar →
          </button>
        </div>
      )}
    </div>
  );
}
