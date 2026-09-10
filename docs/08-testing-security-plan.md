# 8. Testing and Security Plans

## 8.1 Testing plan

### 8.1.1 What exists today

| Layer | Tool | Coverage |
|---|---|---|
| Type safety | `tsc --noEmit` | Whole codebase; run in CI on every push (see §8.1.3) |
| Static analysis | `next lint` (ESLint, `eslint-config-next`) | Whole codebase |
| End-to-end | Playwright (`tests/e2e/full-flow.mjs`) | The Phase 1 acceptance-criteria path: parent login → PIN child login → resume mid-lesson → complete a multi-activity-type lesson → parent sees progress + feedback → teacher sees classroom progress → content-approval status → new-adult registration → accessibility settings apply |

Run it:

```bash
npm run build && npm run start -- -p 3100 &
BASE_URL=http://localhost:3100 node tests/e2e/full-flow.mjs
```

The e2e test is written as direct `assert` calls against real rendered HTML
— it fails loudly (non-zero exit, stack trace) rather than only logging
booleans, so it is CI-usable as-is.

### 8.1.2 Test pyramid (target — Phase 2)

1. **Unit tests** (Vitest, not yet added) for pure logic: mastery-level
   calculation (`recordAttempt`), content-status transition rules
   (`advanceContentStatus`), age-interface-group defaulting.
2. **Integration tests** for Server Actions against a real (test) Postgres
   database — auth flows, checkpoint upsert idempotency, tenant-isolation
   queries (a `SCHOOL_ADMIN` from School A must get zero rows querying
   School B's data).
3. **End-to-end tests** (Playwright, expand `tests/e2e/`) — one spec per
   acceptance criterion in spec §20: unauthorized cross-student access is
   rejected, video checkpoint-pause behaves correctly (once built),
   offline-shell loads without network, PWA installs.
4. **Accessibility tests** — automated `axe-core` scan on every page in CI,
   plus manual keyboard-only and screen-reader (NVDA/VoiceOver) passes on
   the student lesson player specifically, since it's the most
   interaction-dense screen.
5. **Load/performance tests** on low-bandwidth emulation (Chrome DevTools
   "Slow 3G" throttling) — this platform's core audience is exactly the
   users most affected by ignoring this.

### 8.1.3 CI pipeline (Phase 2 — not yet wired up)

```yaml
on: [push, pull_request]
jobs:
  build-and-test:
    steps:
      - npm ci
      - npx tsc --noEmit
      - npx next lint
      - npx prisma migrate deploy   # against an ephemeral test DB
      - npx prisma db seed
      - npm run build
      - npm run start -- -p 3100 &
      - BASE_URL=http://localhost:3100 node tests/e2e/full-flow.mjs
      - (Phase 2) npx vitest run
      - (Phase 2) axe-core accessibility scan
```

### 8.1.4 Manual QA checklist before any release

Directly from spec §20 — each item should be re-verified by a human on a
real phone, tablet, and classroom desktop before shipping:

- [ ] Parent/teacher/admin can create a student profile
- [ ] Student signs in with PIN only, no email
- [ ] Student sees grade-appropriate content only
- [ ] Progress saves automatically; killing the tab mid-lesson and
      returning resumes at the same activity
- [ ] Audio narration (TTS) works on iOS Safari, Android Chrome, desktop
      Chrome/Firefox (voice availability varies by platform — verify the
      fallback voice still reads Spanish intelligibly)
- [ ] Teachers can assign, reopen, and give feedback
- [ ] Parents can read their child's report without training
- [ ] Admin can manage users, curriculum status, Bible Studies config
- [ ] A logged-in student/parent cannot reach another family's data by
      editing the URL
- [ ] App shell loads with network disabled (offline PWA)
- [ ] Every visible button/link on every screen does something — no dead
      demo affordances (spec: "no demonstration buttons or screens are
      nonfunctional")

## 8.2 Security plan

### 8.2.1 Threat model summary

The highest-value asset is **children's data** (identity, behavior,
recordings) and the highest-consequence failure is **cross-tenant or
cross-family data exposure** — a parent or student seeing another family's
records. Secondary concerns: account takeover of adult accounts (which
cascade to child profile access), and content-safety (unreviewed or unsafe
material reaching a child).

### 8.2.2 Controls implemented in Phase 1

| Control | Implementation |
|---|---|
| Password storage | bcrypt, cost factor 12 (`src/lib/password.ts`) — never plaintext, never reversible |
| Child PIN storage | Same bcrypt hashing as adult passwords — a PIN is a credential, not a convenience string |
| Session tokens | Signed JWT (HS256), httpOnly, `sameSite=lax`, `secure` in production (`src/lib/session.ts`) — not readable or forgeable by client JS |
| Session scoping | Two independent, separately-expiring cookies (adult 14d, student 8h) — see architecture doc §1.5 |
| Authorization | Route-guard + query-scoping, doubled up deliberately (`docs/03-roles-permissions-matrix.md` §3.3) |
| Input validation | `zod` schemas at every Server Action boundary (`src/actions/*.ts`) — untrusted `FormData` is never passed to Prisma unvalidated |
| SQL injection | Prisma parameterizes every query; no raw SQL string concatenation anywhere in the codebase |
| XSS | React escapes all interpolated text by default; no `dangerouslySetInnerHTML` is used anywhere in the app |
| CSRF | Server Actions are POST-only, same-origin by the Next.js framework's built-in Origin header check |
| Audit trail | Append-only `AuditLog` on every security/privacy-relevant mutation (`src/lib/audit.ts`) |
| No child-targeted tracking/ads | Zero third-party scripts, zero analytics SDKs, zero ad tags in the codebase |
| No public child exposure | No screen renders a student's full profile, real name-plus-photo, or contact info to anyone outside their guardians/teachers/school admin |
| Consent trail | `ConsentRecord` written at child-profile creation (`ACCOUNT_CREATION`), extensible to `DATA_PROCESSING`/`MEDIA_RECORDING`/`MARKETING_COMMUNICATION` |
| Microphone use | Reading-recording only activates the mic on explicit user tap (`getUserMedia`), never on page load; recordings stay in-browser (`URL.createObjectURL`) in Phase 1 — no audio is uploaded yet, so there is nothing server-side to secure until that pipeline is built (Phase 2) |

### 8.2.3 Gaps to close before production (tracked, not hidden)

- **Transport/at-rest encryption** — TLS termination and disk-level
  encryption are deployment/infra concerns, not application code; must be
  configured on whatever hosting platform is chosen (spec §15, §16).
- **MFA for admin accounts** — schema supports it (`User.mfaEnabled`), flow
  not implemented (Phase 2 roadmap item).
- **Automated backups, monitoring/alerting** — infra-level, not yet
  provisioned (this is a local prototype).
- **Rate limiting on auth endpoints** — `loginAdult`/`loginStudentWithPin`
  have no brute-force throttling yet; needed before production (e.g., a
  sliding-window limiter keyed on IP + account, or a managed WAF rule).
- **Formal penetration test / dependency audit** — `npm audit` currently
  reports vulnerabilities in transitive dependencies (see `package.json`);
  these need triage before production, and a third-party security review is
  warranted given the child-safety stakes (spec §15).
- **Data retention automation** — `ConsentRecord`/audit data model supports
  retention policy, but no scheduled job enforces one yet.
- **Content-safety review tooling** — the Draft→Safety Review→Published gate
  exists as a workflow (§12 in the main spec), but the actual *safety review*
  step today is a manual human action (an admin clicking "Advance"); no
  automated content-safety scanning (image/video moderation, profanity
  filtering on any future user-submitted text) exists, because Phase 1 has
  no user-submitted content beyond reading recordings (which stay local, not
  server-processed, in this phase).
- **Formal incident-response runbook** — "process for reporting inappropriate
  content" (spec §15) needs a dedicated support/report screen and triage
  process; not yet built.

### 8.2.4 Privacy-by-design checklist (spec §15) — status

- [x] Minimum child data collected (display name, avatar, grade, optional
      student ID, PIN — no email, no address, no photo required)
- [x] Verified adult required to create a child profile
- [x] No public profiles, no public/direct child messaging
- [x] No behavioral advertising (no ad code exists at all)
- [x] No full student names exposed publicly (names only ever render inside
      an authenticated, scoped session — parent's own children, teacher's
      own roster, admin's own school)
- [ ] Encryption in transit/at rest — deployment-time responsibility, not
      yet configured (no production deployment exists yet)
- [x] Role-based access control
- [ ] MFA for administrators — not yet implemented
- [x] Auditable access/content-change logs
- [ ] Guardian-controlled data export/deletion UI — `ConsentRecord` model
      exists; self-service export/delete screen not yet built
- [ ] Formal data-retention rules — not yet automated
- [ ] Content-report process — not yet built
