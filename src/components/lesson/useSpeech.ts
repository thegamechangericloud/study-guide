"use client";

import { useCallback } from "react";

/// Wraps the browser's built-in speech synthesis so words/sentences/stories
/// can be read aloud without shipping or streaming audio files — important
/// for the low-bandwidth classrooms this platform targets.
export function useSpeech() {
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice =
      voices.find((v) => v.lang === "es-DO") ??
      voices.find((v) => v.lang?.startsWith("es")) ??
      undefined;
    if (spanishVoice) utterance.voice = spanishVoice;
    utterance.lang = spanishVoice?.lang ?? "es-ES";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, []);

  return { speak };
}
