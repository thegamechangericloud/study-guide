"use client";

import type { PrintableWorksheetContent } from "@/lib/activity-types";

export function WorksheetPlayer({
  title,
  content,
  onDone,
}: {
  title: string;
  content: PrintableWorksheetContent;
  onDone: () => void;
}) {
  return (
    <div className="card p-6 space-y-5">
      <div className="print:hidden flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: "var(--color-ink-muted)" }}>
          Hoja de trabajo imprimible
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="btn-primary px-4 py-2 text-sm font-semibold focus-ring"
        >
          🖨️ Imprimir
        </button>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-1 hidden print:block">{title}</h2>
        <p>{content.instructions}</p>
      </div>

      <ol className="space-y-4">
        {content.items.map((item, i) => (
          <li key={i} className="text-lg">
            <span className="font-semibold mr-2">{i + 1}.</span>
            {item}
            <div
              className="mt-1 h-8 border-b-2"
              style={{ borderColor: "var(--color-border)" }}
              aria-hidden
            />
          </li>
        ))}
      </ol>

      <div className="text-right print:hidden">
        <button type="button" onClick={onDone} className="btn-primary px-6 py-2 font-semibold focus-ring">
          Continuar →
        </button>
      </div>
    </div>
  );
}
