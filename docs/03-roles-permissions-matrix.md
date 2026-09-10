# 3. User Roles and Permission Matrix

## 3.1 Roles

| Role | Account type | Created by | Notes |
|---|---|---|---|
| **Student** | `StudentProfile` (no email/password) | An adult (parent/teacher/school admin) | Authenticates with a PIN or picture password after an adult is already signed in (`/profiles` → PIN). Never receives a `User` row. |
| **Parent / Guardian** | `User`, role `PARENT` | Self-service registration | Linked to one or more `StudentProfile`s via `Guardianship`. |
| **Teacher** | `User`, role `TEACHER` | Self-service (demo) / invited by school admin (production) | Linked to `Classroom`s via `ClassroomTeacher`. |
| **School Administrator** | `User`, role `SCHOOL_ADMIN` | Self-service (demo, creates a `School`) / invited by platform admin (production) | Scoped to exactly one `School`. |
| **Platform Administrator** | `User`, role `PLATFORM_ADMIN` | Seed/ops only, never self-service | Not scoped to a school; cross-tenant support & oversight only. |

> **Phase 1 demo note:** `/register` currently lets anyone self-serve a
> `TEACHER` or `SCHOOL_ADMIN` account so reviewers can exercise every role
> without a seeded backdoor. This is explicitly called out as a demo-only
> shortcut in `src/actions/auth.ts` — production must gate teacher/admin
> provisioning behind an invitation flow from an existing school admin or
> platform admin (Phase 2 item, see roadmap).

## 3.2 Permission matrix

Legend: ✅ full access · 🟡 scoped/partial access · — no access

| Capability | Student | Parent | Teacher | School Admin | Platform Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| Create own account | — (never) | ✅ | ✅ (demo) | ✅ (demo) | — |
| Create a child profile | — | ✅ (own children) | ✅ (their students) | ✅ (their school) | ✅ |
| View/play published lessons for own grade | ✅ | — | — | — | — |
| Record progress/attempts for self | ✅ | — | — | — | — |
| View own progress, achievements | ✅ | — | — | — | — |
| View a specific child's progress | — | 🟡 own children only | 🟡 own classroom students only | 🟡 own school only | ✅ |
| Create/manage classrooms | — | — | 🟡 assigned to them | ✅ (own school) | ✅ |
| Assign lessons/quizzes to a class | — | — | 🟡 own classes | ✅ (own school) | ✅ |
| Reopen a student's assignment | — | — | 🟡 own classes | ✅ (own school) | ✅ |
| Send feedback to a student/family | — | receive only | 🟡 own students | ✅ (own school) | ✅ |
| Message a child privately, outside school workflow | — | — | ❌ never | ❌ never | ❌ never |
| Manage users at a school | — | — | — | ✅ (own school) | ✅ |
| Configure Bible Studies for a school | — | — | — | ✅ (own school) | ✅ |
| Author/edit curriculum content (Draft) | — | — | 🟡 (Phase 2: content-author permission) | ✅ | ✅ |
| Advance content status (Draft → … → Published) | — | — | — | ✅ (own school's authored content) | ✅ |
| View audit logs | — | — | — | 🟡 own school | ✅ |
| Manage schools (create/suspend) | — | — | — | 🟡 own school only | ✅ |
| Cross-school reporting / support access | — | — | — | — | ✅ |

## 3.3 Enforcement

Permissions are enforced twice, deliberately redundant:

1. **Route-level guard** — every protected route group has a `layout.tsx`
   that calls `requireAdult([...roles])` or `requireStudent()`
   (`src/lib/guards.ts`) before any child page renders. An unauthorized role
   is redirected to `/unauthorized`; an unauthenticated request is redirected
   to `/login` or `/profiles`.
2. **Query-level scoping** — every data-fetching query additionally filters
   by the caller's `schoolId`, `userId` (as creator/guardian), or classroom
   membership, so even a correctly-authenticated request cannot enumerate
   another tenant's or another family's records. Example:
   `src/app/teacher/classrooms/[id]/page.tsx` 404s a `TEACHER` who is not on
   that classroom's `teachers` list, even though the classroom id itself is
   guessable.

A student session can never read or write another `StudentProfile`'s data —
all student-scoped Server Actions (`src/actions/progress.ts`) derive the
target `studentProfileId` from the signed session cookie itself, never from
client-supplied input, so there is no parameter a malicious client could
tamper with to act as a different student.

## 3.4 Never-allowed interactions (safety rules, not just permissions)

These are enforced by *absence of a code path*, not by a runtime check that
could be bypassed:

- No screen or API allows a `TEACHER` (or any adult) to message a
  `StudentProfile` directly. `TeacherFeedback` always targets a student
  record but is only ever *read* by parents/teachers — there is no inbound
  channel from a student to a teacher outside a supervised assignment
  submission.
- No screen displays another student's full profile to a parent who is not
  that student's guardian, or to a teacher whose classroom the student is
  not enrolled in.
- Students never see a public leaderboard, another student's score, or any
  other student's identity — gamification (streaks, badges, stars) is always
  scoped to `session.sub` (the signed-in student) only.
