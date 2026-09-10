"use client";

import { useRef, useState } from "react";
import { useSpeech } from "./useSpeech";
import type { ReadingPassageContent } from "@/lib/activity-types";

export function ReadingPassagePlayer({
  content,
  onDone,
}: {
  content: ReadingPassageContent;
  onDone: () => void;
}) {
  const { speak } = useSpeech();
  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [micError, setMicError] = useState<string | null>(null);

  async function startRecording() {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      setMicError("No se pudo acceder al micrófono en este dispositivo.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: "var(--color-ink-muted)" }}>
          Lectura guiada
        </p>
        <button type="button" onClick={() => speak(content.passage)} className="underline text-sm focus-ring">
          🔊 Escuchar el modelo
        </button>
      </div>

      <p className="text-xl leading-relaxed">
        {content.words.map((word, i) => (
          <button
            key={i}
            type="button"
            onClick={() => speak(word.replace(/[^\p{L}\p{N}]/gu, ""))}
            className="mx-1 rounded-md px-1 hover:bg-black/5 focus-ring"
          >
            {word}
          </button>
        ))}
      </p>

      <div className="rounded-lg p-4 space-y-3" style={{ background: "color-mix(in srgb, var(--color-primary) 8%, white)" }}>
        <p className="text-sm font-medium">Grábate leyendo el texto y luego escúchate</p>
        <div className="flex items-center gap-3 flex-wrap">
          {!recording ? (
            <button type="button" onClick={startRecording} className="btn-primary px-4 py-2 focus-ring">
              🎙️ Grabar mi lectura
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="px-4 py-2 font-semibold focus-ring rounded-md"
              style={{ background: "var(--color-coral)", color: "white" }}
            >
              ⏹ Detener
            </button>
          )}
          {recordedUrl && (
            <audio controls src={recordedUrl} className="max-w-full">
              <track kind="captions" />
            </audio>
          )}
        </div>
        {micError && (
          <p className="text-xs" style={{ color: "var(--color-coral)" }}>
            {micError} Puedes continuar sin grabar.
          </p>
        )}
      </div>

      <div className="text-right">
        <button type="button" onClick={onDone} className="btn-primary px-6 py-2 font-semibold focus-ring">
          Continuar →
        </button>
      </div>
    </div>
  );
}
