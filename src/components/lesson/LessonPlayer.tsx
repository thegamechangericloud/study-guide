"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { saveCheckpoint, recordAttempt } from "@/actions/progress";
import { StoryPlayer } from "./StoryPlayer";
import { MatchingGame } from "./MatchingGame";
import { QuizPlayer } from "./QuizPlayer";
import { TraceCanvas } from "./TraceCanvas";
import { ReadingPassagePlayer } from "./ReadingPassagePlayer";
import { WordBuilder } from "./WordBuilder";
import { VideoPlayer } from "./VideoPlayer";
import { WorksheetPlayer } from "./WorksheetPlayer";
import type {
  NarratedStoryContent,
  MatchingContent,
  DrawingTraceContent,
  ReadingPassageContent,
  WordBuilderContent,
  VideoContent,
  PrintableWorksheetContent,
} from "@/lib/activity-types";

const KNOWN_TYPES = [
  "NARRATED_STORY",
  "MATCHING",
  "QUIZ",
  "DRAWING",
  "READING_PASSAGE",
  "DRAG_AND_DROP",
  "VIDEO",
  "PRINTABLE_WORKSHEET",
];

type AnswerOption = { id: string; label: string; isCorrect: boolean };
type Question = { id: string; prompt: string; explanation: string | null; answerOptions: AnswerOption[] };
type MediaAssetDTO = {
  url: string;
  captionsUrl: string | null;
  transcript: string | null;
  lowResUrl: string | null;
  durationSec: number | null;
};
type ActivityDTO = {
  id: string;
  type: string;
  title: string;
  content: unknown;
  questions: Question[];
  mediaAssets?: MediaAssetDTO[];
};

export function LessonPlayer({
  lessonId,
  lessonTitle,
  activities,
  initialStep,
  initialPositionSeconds,
  alreadyCompleted,
}: {
  lessonId: string;
  lessonTitle: string;
  activities: ActivityDTO[];
  initialStep: number;
  initialPositionSeconds?: number;
  alreadyCompleted: boolean;
}) {
  const [step, setStep] = useState(Math.min(initialStep, activities.length - 1));
  const [finished, setFinished] = useState(alreadyCompleted && initialStep >= activities.length - 1);
  const [, startTransition] = useTransition();

  const activity = activities[step];
  const progressPct = Math.round(((finished ? activities.length : step) / activities.length) * 100);

  function persist(nextStep: number, completed: boolean) {
    startTransition(() => {
      saveCheckpoint({
        lessonId,
        activityId: activity.id,
        positionStep: nextStep,
        completed,
      });
    });
  }

  // Video checkpoints save mid-activity (on pause / periodically) without
  // advancing the lesson step, so "Continue Learning" resumes at the exact
  // second the student left off, not just at the start of the video again.
  function persistVideoPosition(seconds: number) {
    startTransition(() => {
      saveCheckpoint({
        lessonId,
        activityId: activity.id,
        positionStep: step,
        positionSeconds: seconds,
        completed: false,
      });
    });
  }

  function advance() {
    const isLast = step === activities.length - 1;
    if (isLast) {
      persist(step, true);
      setFinished(true);
    } else {
      const next = step + 1;
      persist(next, false);
      setStep(next);
    }
  }

  function submitScored(result: { correct: number; total: number }) {
    startTransition(() => {
      recordAttempt({
        activityId: activity.id,
        scoreRaw: result.correct,
        scoreMax: result.total,
        timeSpentSeconds: 0,
      });
    });
    advance();
  }

  if (finished) {
    return (
      <div className="card p-10 text-center space-y-4">
        <p className="text-5xl" aria-hidden>
          🏆
        </p>
        <h2 className="text-2xl font-bold">¡Lección completada!</h2>
        <p style={{ color: "var(--color-ink-muted)" }}>{lessonTitle}</p>
        <Link href="/student" className="btn-primary inline-block px-6 py-2.5 font-semibold focus-ring">
          Volver a mi panel
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-xs mb-1" style={{ color: "var(--color-ink-muted)" }}>
          <span>{lessonTitle}</span>
          <span>{activity.title}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
          <div
            className="h-full transition-[width]"
            style={{ width: `${progressPct}%`, background: "var(--color-primary)" }}
          />
        </div>
      </div>

      {activity.type === "NARRATED_STORY" && (
        <StoryPlayer content={activity.content as NarratedStoryContent} onDone={advance} />
      )}
      {activity.type === "MATCHING" && (
        <MatchingGame content={activity.content as MatchingContent} onDone={submitScored} />
      )}
      {activity.type === "QUIZ" && <QuizPlayer questions={activity.questions} onDone={submitScored} />}
      {activity.type === "DRAWING" && (
        <TraceCanvas content={activity.content as DrawingTraceContent} onDone={advance} />
      )}
      {activity.type === "READING_PASSAGE" && (
        <ReadingPassagePlayer content={activity.content as ReadingPassageContent} onDone={advance} />
      )}
      {activity.type === "DRAG_AND_DROP" && (
        <WordBuilder content={activity.content as WordBuilderContent} onDone={submitScored} />
      )}
      {activity.type === "VIDEO" && (
        <VideoPlayer
          content={activity.content as VideoContent}
          asset={activity.mediaAssets?.[0] ?? null}
          initialPositionSeconds={step === initialStep ? initialPositionSeconds : undefined}
          onCheckpoint={persistVideoPosition}
          onDone={advance}
        />
      )}
      {activity.type === "PRINTABLE_WORKSHEET" && (
        <WorksheetPlayer
          title={activity.title}
          content={activity.content as PrintableWorksheetContent}
          onDone={advance}
        />
      )}
      {!KNOWN_TYPES.includes(activity.type) && (
        <div className="card p-6 space-y-4 text-center">
          <p style={{ color: "var(--color-ink-muted)" }}>
            Esta actividad todavía no está disponible en este dispositivo.
          </p>
          <button type="button" onClick={advance} className="btn-primary px-6 py-2 font-semibold focus-ring">
            Continuar →
          </button>
        </div>
      )}
    </div>
  );
}
