"use client";

import { useEffect, useRef, useState } from "react";
import type { VideoContent } from "@/lib/activity-types";

type VideoAsset = {
  url: string;
  captionsUrl: string | null;
  transcript: string | null;
  lowResUrl: string | null;
  durationSec: number | null;
};

const SPEEDS = [0.75, 1, 1.25, 1.5];
// Save the resume position at most this often while playing, so a crash or
// closed tab never loses more than a few seconds of progress.
const CHECKPOINT_INTERVAL_SECONDS = 10;

export function VideoPlayer({
  content,
  asset,
  initialPositionSeconds,
  onCheckpoint,
  onDone,
}: {
  content: VideoContent;
  asset: VideoAsset | null;
  initialPositionSeconds?: number;
  onCheckpoint: (seconds: number) => void;
  onDone: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastCheckpointRef = useRef(0);
  const [lowRes, setLowRes] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [resumedFrom, setResumedFrom] = useState<number | null>(null);
  const [ended, setEnded] = useState(false);

  const src = (lowRes && asset?.lowResUrl) || asset?.url;
  const appliedResumeRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.playbackRate = speed;
  }, [speed, src]);

  // Resume-at-checkpoint, applied via a native listener rather than the
  // onLoadedMetadata React prop: if the video is already cached, metadata
  // can be ready (readyState >= 1) before React finishes attaching event
  // handlers, so the React event fires late or not at all and the seek is
  // silently missed. Checking readyState directly covers that race.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || appliedResumeRef.current) return;
    if (!initialPositionSeconds || initialPositionSeconds <= 0) return;

    function apply() {
      if (appliedResumeRef.current || !video) return;
      if (video.duration && initialPositionSeconds! < video.duration) {
        video.currentTime = initialPositionSeconds!;
        appliedResumeRef.current = true;
        setResumedFrom(initialPositionSeconds!);
      }
    }

    if (video.readyState >= 1) {
      apply();
    } else {
      video.addEventListener("loadedmetadata", apply, { once: true });
      return () => video.removeEventListener("loadedmetadata", apply);
    }
  }, [initialPositionSeconds, src]);

  if (!asset) {
    return (
      <div className="card p-6 space-y-4 text-center">
        <p style={{ color: "var(--color-ink-muted)" }}>
          Este video todavía no está disponible.
        </p>
        <button type="button" onClick={onDone} className="btn-primary px-6 py-2 font-semibold focus-ring">
          Continuar →
        </button>
      </div>
    );
  }

  function saveCheckpointNow() {
    const video = videoRef.current;
    if (!video) return;
    const seconds = Math.floor(video.currentTime);
    lastCheckpointRef.current = seconds;
    onCheckpoint(seconds);
  }

  return (
    <div className="card p-6 space-y-4">
      {content.demoDisclaimer && (
        <p
          role="note"
          className="text-sm rounded-md px-3 py-2 font-medium"
          style={{ background: "color-mix(in srgb, var(--color-coral) 15%, white)", color: "var(--color-coral)" }}
        >
          ⚠️ {content.demoDisclaimer}
        </p>
      )}

      {content.introText && <p>{content.introText}</p>}

      {resumedFrom !== null && (
        <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
          Continuando desde el minuto {Math.floor(resumedFrom / 60)}:
          {String(resumedFrom % 60).padStart(2, "0")}.
        </p>
      )}

      <video
        ref={videoRef}
        key={src}
        controls
        className="w-full rounded-lg"
        onLoadedMetadata={(e) => {
          e.currentTarget.playbackRate = speed;
        }}
        onPause={saveCheckpointNow}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          if (t - lastCheckpointRef.current >= CHECKPOINT_INTERVAL_SECONDS) saveCheckpointNow();
        }}
        onEnded={() => {
          saveCheckpointNow();
          setEnded(true);
        }}
      >
        <source src={src} />
        {asset.captionsUrl && (
          <track kind="captions" src={asset.captionsUrl} srcLang="es" label="Español" default />
        )}
        Tu navegador no puede reproducir este video.
      </video>

      <div className="flex items-center gap-4 flex-wrap text-sm">
        <label className="flex items-center gap-2">
          <span style={{ color: "var(--color-ink-muted)" }}>Velocidad</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="rounded-md border px-2 py-1 focus-ring"
            style={{ borderColor: "var(--color-border)" }}
          >
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s}×
              </option>
            ))}
          </select>
        </label>

        {asset.lowResUrl && (
          <button
            type="button"
            onClick={() => setLowRes((v) => !v)}
            className="underline focus-ring"
          >
            {lowRes ? "Calidad normal" : "Modo de datos bajos"}
          </button>
        )}

        {asset.transcript && (
          <button
            type="button"
            onClick={() => setShowTranscript((v) => !v)}
            className="underline focus-ring"
          >
            {showTranscript ? "Ocultar transcripción" : "Ver transcripción"}
          </button>
        )}
      </div>

      {showTranscript && asset.transcript && (
        <div
          className="rounded-lg p-4 text-sm whitespace-pre-wrap"
          style={{ background: "color-mix(in srgb, var(--color-primary) 8%, white)" }}
        >
          {asset.transcript}
        </div>
      )}

      <div className="text-right">
        <button
          type="button"
          onClick={onDone}
          className="btn-primary px-6 py-2 font-semibold focus-ring"
        >
          {ended ? "Continuar ✓" : "Continuar →"}
        </button>
      </div>
    </div>
  );
}
