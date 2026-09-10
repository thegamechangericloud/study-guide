"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="px-4 py-2 card text-sm font-semibold focus-ring print:hidden"
    >
      🖨️ Descargar informe (PDF)
    </button>
  );
}
