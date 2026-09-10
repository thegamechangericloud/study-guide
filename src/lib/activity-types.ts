// Typed shapes for the `Activity.content` JSON column, keyed by ActivityType.
// Validated at the API boundary (not enforced by Postgres) so new
// interaction types can be added without a schema migration for every game.

export type NarratedStoryContent = {
  sentences: string[];
};

export type MatchingContent = {
  pairs: { left: string; right: string }[];
};

export type DrawingTraceContent = {
  letter: string;
  instructions: string;
};

export type ReadingPassageContent = {
  passage: string;
  words: string[]; // tappable words, in order, matching the passage
};

export type WordBuilderContent = {
  wordBank: string[];
  correctOrder: string[];
  prompt: string;
};

export type QuizContent = Record<string, never>; // quizzes use the relational Question/AnswerOption tables

// The actual media (url/captions/transcript/lowRes) lives on the related
// MediaAsset row, not here — this only carries per-activity player config.
export type VideoContent = {
  introText?: string;
  // Rendered as a prominent banner above the player. Used to mark a clip
  // that is not reviewed MINERD curriculum (see spec §13, §20) — e.g. a
  // freely-licensed demo used only to exercise the VideoPlayer component.
  demoDisclaimer?: string;
};

export type PrintableWorksheetContent = {
  instructions: string;
  // Each item becomes one numbered line with a blank writing space —
  // e.g. a word to copy, a short-answer prompt, a math problem to solve.
  items: string[];
};
