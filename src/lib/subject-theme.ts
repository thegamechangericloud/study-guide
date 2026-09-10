// Per-subject color + icon, keyed by Subject.code (see prisma/seed.ts).
// Used to make the student-facing dashboard and lesson cards instantly
// scannable by color/icon for pre-readers, not just by text.

export type SubjectTheme = { color: string; bg: string; emoji: string };

export const SUBJECT_THEMES: Record<string, SubjectTheme> = {
  SPANISH: { color: "#d6336c", bg: "#fff0f6", emoji: "📖" },
  MATH: { color: "#0f8b8d", bg: "#e6fbfb", emoji: "🔢" },
  SCIENCE: { color: "#2f9e44", bg: "#ebfbee", emoji: "🔬" },
  SOCIAL: { color: "#e8590c", bg: "#fff4e6", emoji: "🌍" },
  ENGLISH: { color: "#5f3dc4", bg: "#f3f0ff", emoji: "🔤" },
  ART: { color: "#e64980", bg: "#fff0f6", emoji: "🎨" },
  PE: { color: "#1971c2", bg: "#e7f5ff", emoji: "⚽" },
  RELIGIOUS: { color: "#9c6b1f", bg: "#fff9e6", emoji: "🕊️" },
  BIBLE: { color: "#9c6b1f", bg: "#fff9e6", emoji: "✝️" },
  DIGITAL: { color: "#0891b2", bg: "#ecfeff", emoji: "💻" },
  CITIZENSHIP: { color: "#364fc7", bg: "#edf2ff", emoji: "🇩🇴" },
  SEL: { color: "#f08c00", bg: "#fff9db", emoji: "💛" },
};

export const DEFAULT_SUBJECT_THEME: SubjectTheme = {
  color: "var(--color-primary)",
  bg: "var(--color-surface)",
  emoji: "⭐",
};

export function subjectTheme(code: string | undefined | null): SubjectTheme {
  return (code && SUBJECT_THEMES[code]) || DEFAULT_SUBJECT_THEME;
}
