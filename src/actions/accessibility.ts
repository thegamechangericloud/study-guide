"use server";

import { redirect } from "next/navigation";
import { setA11yPrefs, type A11yPrefs } from "@/lib/accessibility";

export async function updateA11yPrefs(formData: FormData) {
  const prefs: A11yPrefs = {
    contrast: formData.get("contrast") === "high" ? "high" : "normal",
    textSize: (formData.get("textSize") as A11yPrefs["textSize"]) ?? "normal",
    reducedMotion: formData.get("reducedMotion") === "on",
    dyslexiaFont: formData.get("dyslexiaFont") === "on",
  };
  await setA11yPrefs(prefs);
  const returnTo = formData.get("returnTo");
  redirect(typeof returnTo === "string" && returnTo ? returnTo : "/accessibility");
}
