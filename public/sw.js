// Offline-capable service worker.
//
// Two different caching strategies, deliberately split by content type:
//
// 1. Lesson pages (/student/lesson/*) and the static app shell: cache-first
//    with background revalidation. This content is stable once published
//    (a lesson doesn't change while a student is partway through it), so
//    serving the cached copy instantly and refreshing in the background is
//    safe and is what makes a lesson opened once work offline afterward.
//    The dashboard also explicitly asks this worker to precache a lesson's
//    URL right when it's opened (see the CACHE_URLS message handler below
//    and src/components/OfflineLessonCacher.tsx) rather than waiting for a
//    second visit.
//
// 2. Every other page (dashboards, progress, parent/teacher/admin views):
//    network-first, falling back to a cached copy only when the network
//    request actually fails (i.e. truly offline). These pages show live,
//    frequently-changing, per-student data — checkpoint counts, streaks,
//    notifications — so serving a stale cached copy while online (as a
//    naive stale-while-revalidate would) is actively wrong, not just a
//    missing nicety.
//
// Out of scope (Phase 2, see docs/07-implementation-roadmap.md): syncing
// progress made while fully offline — writes still require a live
// connection, this only makes already-visited lesson *content* readable
// offline.
const CACHE_NAME = "estudia-rd-shell-v3";
const SHELL_ASSETS = ["/", "/manifest.json", "/icons/icon-192.svg", "/icons/icon-512.svg"];

function isLessonOrShellAsset(pathname) {
  return pathname.startsWith("/student/lesson/") || SHELL_ASSETS.includes(pathname) || pathname.startsWith("/icons/");
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Explicit "make this lesson available offline" request from the page —
// fetches and caches it immediately rather than waiting for the student to
// have visited it once already via the passive fetch handler below.
self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_URLS" || !Array.isArray(event.data.urls)) return;
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        event.data.urls.map((url) =>
          fetch(url)
            .then((response) => (response.ok ? cache.put(url, response) : null))
            .catch(() => null)
        )
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  // Never cache API/auth/student data routes — the server stays authoritative.
  if (url.pathname.startsWith("/api/")) return;

  if (isLessonOrShellAsset(url.pathname)) {
    // Cache-first, revalidate in the background.
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const network = fetch(event.request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Network-first for everything else — only fall back to a cached copy
  // when the network genuinely fails, so live pages never show stale data
  // while the student has a connection.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
