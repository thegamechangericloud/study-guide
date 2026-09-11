"use client";

import { useState } from "react";
import { useSpeech } from "./useSpeech";
import type { NarratedStoryContent } from "@/lib/activity-types";

export function StoryPlayer({
  content,
  onDone,
}: {
  content: NarratedStoryContent;
  onDone: () => void;
}) {
  const { speak } = useSpeech();
  const [index, setIndex] = useState(0);
  const sentence = content.sentences[index];
  const isLast = index === content.sentences.length - 1;

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-ink-muted)" }}>
        <span>
          Oración {index + 1} de {content.sentences.length}
        </span>
        <button className="underline focus-ring" onClick={() => speak(sentence)} type="button">
          🔊 Escuchar
        </button>
      </div>

      <p className="text-2xl font-semibold leading-relaxed text-center">
        {sentence.split(" ").map((word, i) => (
          <button
            key={i}
            type="button"
            onClick={() => speak(word.replace(/[^\p{L}\p{N}]/gu, ""))}
            className="mx-1 rounded-md px-1 transition-colors focus-ring"
            onMouseEnter={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--color-accent) 35%, transparent)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {word}
          </button>
        ))}
      </p>

      <div className="flex justify-between">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="px-4 py-2 card focus-ring disabled:opacity-40"
        >
          ← Atrás
        </button>
        {isLast ? (
          <button type="button" onClick={onDone} className="btn-fun px-6 py-2.5 focus-ring">
            Continuar ✓
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(content.sentences.length - 1, i + 1))}
            className="btn-fun px-6 py-2.5 focus-ring"
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
}
