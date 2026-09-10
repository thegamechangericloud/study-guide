"use client";

import { useEffect, useRef, useState } from "react";
import type { DrawingTraceContent } from "@/lib/activity-types";

export function TraceCanvas({
  content,
  onDone,
}: {
  content: DrawingTraceContent;
  onDone: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00000022";
    ctx.font = "bold 260px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(content.letter, canvas.width / 2, canvas.height / 2);
    ctx.strokeStyle = "#0f8b8d";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
  }, [content.letter]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    setHasDrawn(true);
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  function end() {
    drawing.current = false;
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00000022";
    ctx.font = "bold 260px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(content.letter, canvas.width / 2, canvas.height / 2);
    setHasDrawn(false);
  }

  return (
    <div className="card p-6 space-y-4 text-center">
      <p className="text-lg font-semibold">{content.instructions}</p>
      <canvas
        ref={canvasRef}
        width={480}
        height={360}
        className="mx-auto w-full max-w-md border rounded-lg touch-none"
        style={{ borderColor: "var(--color-border)", background: "white" }}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <div className="flex justify-center gap-3">
        <button type="button" onClick={clear} className="px-4 py-2 card focus-ring">
          Borrar
        </button>
        <button
          type="button"
          disabled={!hasDrawn}
          onClick={onDone}
          className="btn-primary px-6 py-2 font-semibold focus-ring disabled:opacity-40"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
