# Estudia RD — Interactive Learning Platform for Dominican Students

A production-architected, child-friendly educational web app and Progressive
Web App for schools, families, teachers, and students in the Dominican
Republic — helping children learn to read and progressively master every
school subject from the Initial Level through Secondary, aligned with the
MINERD curriculum structure.

This repository contains the **Phase 1 foundation** deliverables: full
product architecture, curriculum/grade model, database schema, design
system, and a working prototype covering the core acceptance criteria
(accounts, resume-exact-checkpoint progress, an interactive multi-activity
lesson player, and parent/teacher/admin dashboards). See
**[docs/07-implementation-roadmap.md](docs/07-implementation-roadmap.md)**
for exactly what's built vs. planned — nothing here claims to be the
complete, reviewed MINERD curriculum (see
[docs/09-content-production-plan.md](docs/09-content-production-plan.md)
for how that gets built).

## Documentation

| # | Document |
|---|---|
| 1 | [Product architecture](docs/01-architecture.md) |
| 2 | [Curriculum and grade model](docs/02-curriculum-grade-model.md) |
| 3 | [Roles and permissions matrix](docs/03-roles-permissions-matrix.md) |
| 4 | [Database schema](docs/04-database-schema.md) |
| 5 | [Wireframes](docs/05-wireframes.md) |
| 6 | [Design system](docs/06-design-system.md) |
| 7 | [Implementation roadmap](docs/07-implementation-roadmap.md) |
| 8 | [Testing and security plans](docs/08-testing-security-plan.md) |
| 9 | [Content production plan](docs/09-content-production-plan.md) |

## Stack

Next.js 16 (App Router, TypeScript) · PostgreSQL + Prisma · Tailwind CSS v4 ·
signed-cookie session auth (no third-party auth SDK — see architecture doc
§1.3 for why) · installable PWA with an offline app-shell service worker.

## Local development

Requires Node.js 20+ and a PostgreSQL instance.

```bash
# 1. Start Postgres (docker compose, or point DATABASE_URL at any Postgres)
docker compose up -d

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# edit .env if your DATABASE_URL / AUTH_SECRET differ from the defaults

# 4. Run migrations + seed demo data
npx prisma migrate dev
npx prisma db seed

# 5. Run the app
npm run dev
```

Open http://localhost:3000.

### Demo accounts

Seeded by `prisma/seed.ts` (password `Demo1234!` for every adult account;
PIN `1234` for every student profile):

| Role | Email |
|---|---|
| Platform admin | `platform-admin@estudiard.demo` |
| School admin | `admin@estudiard.demo` |
| Teacher | `maestra@estudiard.demo` |
| Parent | `familia@estudiard.demo` |

The parent account has five child profiles (Camila, Josué, Valentina,
Miguel, Sofía) spanning all five age-interface groups; Josué is enrolled in
the demo classroom taught by `maestra@estudiard.demo`, with an in-progress
lesson checkpoint ready to demonstrate "Continue Learning."

### Running the end-to-end test

```bash
npm run build && npm run start -- -p 3100 &
BASE_URL=http://localhost:3100 node tests/e2e/full-flow.mjs
```

This drives a real browser through the full acceptance-criteria path: PIN
login → resume mid-lesson → complete a multi-activity lesson → parent sees
progress and teacher feedback → teacher sees classroom progress → content
approval workflow → new-account registration → accessibility settings. See
[docs/08-testing-security-plan.md](docs/08-testing-security-plan.md).

## Project layout

```
src/app/        Next.js routes, grouped by audience (student/parent/teacher/admin)
src/actions/    Server Actions (auth, students, progress, teacher, admin)
src/components/ UI, including the interactive lesson-activity players
src/lib/        Session/auth guards, Prisma client, audit log, a11y prefs
prisma/         Schema + migrations + seed script
tests/e2e/      Playwright end-to-end test
docs/           Architecture, curriculum, roles, schema, design, roadmap,
                testing/security, content-production documentation
```
