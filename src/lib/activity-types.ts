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
