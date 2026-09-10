import "server-only";
import { cookies } from "next/headers";

export type A11yPrefs = {
  contrast: "normal" | "high";
  textSize: "normal" | "large" | "xl";
  reducedMotion: boolean;
  dyslexiaFont: boolean;
};

export const DEFAULT_A11Y_PREFS: A11yPrefs = {
  contrast: "normal",
  textSize: "normal",
  reducedMotion: false,
  dyslexiaFont: false,
};

const COOKIE_NAME = "sg_a11y";

export async function getA11yPrefs(): Promise<A11yPrefs> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return DEFAULT_A11Y_PREFS;
  try {
    return { ...DEFAULT_A11Y_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_A11Y_PREFS;
  }
}

export async function setA11yPrefs(prefs: A11yPrefs) {
  const store = await cookies();
  store.set(COOKIE_NAME, JSON.stringify(prefs), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
