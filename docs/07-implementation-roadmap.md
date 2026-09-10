# 7. Implementation Roadmap

Phrased against the three phases defined in the product spec (§13).

## Phase 1 — Foundation (this build)

| Item | Status |
|---|---|
| Application architecture | ✅ `docs/01-architecture.md` |
| Authentication and role management | ✅ two-tier adult/student sessions, RBAC guards |
| Student progress and resume functionality | ✅ `ProgressCheckpoint`, verified end-to-end (`tests/e2e/full-flow.mjs`) |
| Curriculum database structure | ✅ full Prisma schema, MINERD-aligned grade/level seed |
| Parent, teacher, and administrator dashboards | ✅ functional, not yet feature-complete (see §5.11) |
| Interactive lesson player | ✅ 6 activity types: narrated story, letter tracing, matching, quiz, reading passage w/ record-yourself, word builder |
| Spanish literacy prototype | ✅ "La letra M de mango" (Pre-Kínder), "Ana va al colmado" (1er Grado) |
| One reviewed demo unit per age group | ✅ 5/5 age groups, each with a full Draft→Published approval trail |

Not finished in Phase 1, called out explicitly rather than silently skipped:

- **Video activities.** The data model and player dispatch already support
  `ActivityType.VIDEO` with captions/transcript/checkpoint fields
  (`MediaAsset`), but no demo lesson ships one — there is no real,
  rights-cleared, captioned video to seed, and shipping a placeholder would
  violate "no placeholder content presented as approved curriculum" (spec
  §13, §20). Building the `VideoPlayer` component (checkpoint-pause,
  captions, transcript, speed/volume, low-res mode) is scoped for Phase 2
  alongside sourcing real media.
- **Object storage / CDN / adaptive streaming.** No media pipeline exists
  yet because Phase 1 has no media to pipe. Needed the moment video/audio
  assets are introduced.
- **Diagnostic assessment → learning-path recommendation.** `DiagnosticAssessment`/
  `DiagnosticResult` models exist; the assessment flow and recommendation
  logic are not implemented.
- **Background jobs, offline lesson *content* sync.** The service worker
  caches the navigational shell only; downloading a lesson bundle for
  offline play is Phase 2 (needs the object storage + sync-conflict policy
  described in the architecture doc §1.7).
- **Invitation-based teacher/school-admin provisioning.** Currently
  self-serve for demo purposes — flagged as a Phase 2 requirement in
  `docs/03-roles-permissions-matrix.md` §3.1.
- **Kiosk-mode student login** (class code + PIN grid without an adult
  login step) — see architecture doc §1.5.
- **MFA for admin accounts.** `User.mfaEnabled`/`mfaSecret` exist in the
  schema; the enrollment/verification flow is not built.
- **Email verification.** `User.emailVerifiedAt` is tracked but nothing
  currently sends or checks a verification email.

## Phase 2 — Curriculum Expansion

1. Real MINERD curriculum mapping — replace the illustrative demo lessons'
   underlying `Competency`/`AchievementIndicator` records with the actual
   published indicators, sourced and reviewed per
   `docs/09-content-production-plan.md`.
2. Reviewed lesson templates per subject so content authors aren't building
   every lesson from a blank `Activity` array.
3. Assessment bank (a pool of reusable, tagged `Question`s beyond one-off
   per-lesson quizzes).
4. Reading library (decodable + leveled texts beyond the single Phase 1
   demo passage).
5. Mathematics manipulatives (interactive fraction bars, number lines, base-10
   blocks — new `ActivityType` values + components, same pattern as the
   existing six).
6. Science/social-studies interactive maps, timelines, simulations.
7. English, Art, Religious Formation, Bible Studies, PE, and Technology
   content tracks.
8. Object storage + CDN + adaptive video streaming; the `VideoPlayer`
   component.
9. Diagnostic assessment flow + recommendation engine (easier
   explanations / additional practice / enrichment / prerequisite
   insertion, per spec §7), with teacher override UI.
10. Invitation-based provisioning for teacher/school-admin accounts; MFA
    enrollment; email verification.
11. Offline lesson-content download + background sync with conflict
    resolution.
12. Native curriculum-authoring UI (create/edit units, lessons, activities,
    media from the admin panel instead of a seed script).

## Phase 3 — Full Content Production

1. Professionally authored and reviewed lessons for every curriculum
   objective across all grades/subjects (the content-production pipeline in
   `docs/09-content-production-plan.md` running at scale).
2. Narrated audio recorded by voice talent (not just browser TTS) for
   flagship content, with TTS remaining as the low-bandwidth fallback.
3. Interactive video and illustration/animation production.
4. Printable materials and teacher guides generated per lesson.
5. Parent take-home activities at scale.
6. Full WCAG 2.2 AA accessibility audit (beyond the Phase 1 self-check in
   the testing plan) by a third party or accessibility specialist.
7. Pilot testing with real Dominican teachers and students; a feedback loop
   back into the content-production pipeline.
8. Kiosk mode, native mobile app (API extraction per architecture doc §1.10),
   multi-factor auth rollout, formal data-retention automation.

## Sequencing rationale

Phase 1 deliberately over-invests in the *mechanism* (auth, progress/resume,
RBAC, content-approval workflow, accessibility tokens) relative to *content
volume*, because every later phase is content production running through
that mechanism. Getting resume-at-checkpoint, role isolation, and the
Draft→Published gate right once is what makes Phase 2's much larger content
volume safe to publish quickly.
