"use client";

import { useEffect } from "react";

/// Mounted on a lesson page so the service worker explicitly caches this
/// lesson's URL as soon as it's opened — not just passively on next visit.
/// See public/sw.js's "CACHE_URLS" message handler.
export function OfflineLessonCacher() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({
        type: "CACHE_URLS",
        urls: [window.location.pathname],
      });
    });
  }, []);
  return null;
}
