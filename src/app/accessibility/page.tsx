import { getA11yPrefs } from "@/lib/accessibility";
import { updateA11yPrefs } from "@/actions/accessibility";

export default async function AccessibilityPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const prefs = await getA11yPrefs();
  const { returnTo } = await searchParams;

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-12">
      <form action={updateA11yPrefs} className="card p-6 space-y-6 max-w-md w-full">
        <h1 className="text-2xl font-bold">Configuración de accesibilidad</h1>
        <input type="hidden" name="returnTo" value={returnTo ?? "/"} />

        <fieldset>
          <legend className="font-medium mb-2">Contraste</legend>
          <label className="flex items-center gap-2 mb-1">
            <input type="radio" name="contrast" value="normal" defaultChecked={prefs.contrast === "normal"} />
            Normal
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="contrast" value="high" defaultChecked={prefs.contrast === "high"} />
            Alto contraste
          </label>
        </fieldset>

        <fieldset>
          <legend className="font-medium mb-2">Tamaño del texto</legend>
          {(["normal", "large", "xl"] as const).map((size) => (
            <label key={size} className="flex items-center gap-2 mb-1">
              <input type="radio" name="textSize" value={size} defaultChecked={prefs.textSize === size} />
              {size === "normal" ? "Normal" : size === "large" ? "Grande" : "Muy grande"}
            </label>
          ))}
        </fieldset>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="reducedMotion" defaultChecked={prefs.reducedMotion} />
          Reducir animaciones
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="dyslexiaFont" defaultChecked={prefs.dyslexiaFont} />
          Fuente amigable para dislexia
        </label>

        <button type="submit" className="btn-primary w-full py-2.5 font-semibold focus-ring">
          Guardar
        </button>
      </form>
    </main>
  );
}
