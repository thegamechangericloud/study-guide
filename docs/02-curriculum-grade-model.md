# 2. Curriculum and Grade Model

## 2.1 Source of truth

The **content** taught (competencies, achievement indicators, objectives)
must ultimately come from MINERD's official published curriculum. This
prototype does **not** claim to contain the reviewed MINERD curriculum — it
seeds a small number of illustrative, internally-authored demonstration
lessons (see `docs/09-content-production-plan.md` for how real curriculum
content gets sourced, mapped, reviewed, and published). The **structure**
below (levels, grades, subject list) is taken directly from the product
specification; cycle groupings are a reasonable placeholder for Phase 1 and
must be validated against the current MINERD ordinances before Phase 2
curriculum mapping begins.

## 2.2 Level → Cycle → Grade

```
Nivel Inicial (Initial Level)
  Ciclo Único
    Pre-Kínder        (3–4 años)
    Kínder             (4–5 años)
    Preprimario        (5–6 años)

Nivel Primario (Primary Level)
  Primer Ciclo
    1er Grado          (6–7 años)
    2do Grado          (7–8 años)
    3er Grado          (8–9 años)
  Segundo Ciclo
    4to Grado          (9–10 años)
    5to Grado          (10–11 años)
    6to Grado          (11–12 años)

Nivel Secundario (Secondary Level)
  Primer Ciclo
    1er Año            (12–13 años)
    2do Año            (13–14 años)
    3er Año            (14–15 años)
  Segundo Ciclo
    4to Año            (15–16 años)
    5to Año            (16–17 años)
    6to Año            (17–18 años)
```

7th/8th year of Secondary are intentionally **not** seeded — they are not
part of the standard current MINERD structure. A school that needs a
custom/legacy grade label can create one: `Grade.isCustom = true` scoped to
that `schoolId`, alongside the standard grades, without altering the shared
structure (`prisma/schema.prisma`, `Grade` model). This is implemented as an
admin capability in the data model; the Phase 1 prototype seeds the standard
grades only — a dedicated "add custom grade" admin screen is a small Phase 2
addition on top of the existing `Grade` model.

## 2.3 Age-interface groups vs. grade enrollment

Five presentation/difficulty modes drive the *interface*, not the
*curriculum path*:

| Group | Ages | Typical grades |
|---|---|---|
| Early Explorers | 3–5 | Pre-Kínder, Kínder |
| Beginning Readers | 5–8 | Preprimario, 1er–2do Grado |
| Developing Learners | 8–11 | 3er–5to Grado |
| Independent Learners | 11–13 | 6to Grado, 1er Año Secundaria |
| Secondary Learners | 13–18 | 2do–6to Año Secundaria |

Each `StudentProfile` stores its own `ageInterfaceGroup`, defaulted from its
current `Grade.defaultAgeGroup` at profile creation but editable independent
of grade — because, per spec §2, "age should guide presentation and
difficulty, but grade enrollment, diagnostic results, and teacher assignments
should determine each student's actual learning path." A student can be
enrolled in one grade for curriculum/assignment purposes while the UI
presents at a different age-interface density (e.g., an older student who is
a beginning reader still gets large-target, low-text navigation without
being placed in a younger grade).

## 2.4 Subjects

Global subject catalog (`Subject` model), available per grade via
`SchoolSubjectConfig` (enable/disable per school, per subject, optionally per
grade):

1. Lengua Española y Alfabetización (Spanish Language and Literacy)
2. Matemática (Mathematics)
3. Ciencias Naturales (Natural Sciences)
4. Ciencias Sociales (Social Sciences)
5. Inglés (English)
6. Educación Artística (Artistic Education)
7. Educación Física, Salud y Bienestar (Physical Education, Health & Wellness)
8. Formación Humana y Religiosa Integral (the official MINERD subject)
9. Estudios Bíblicos (Bible Studies — **not** the MINERD subject above;
   `Subject.isFaithBased = true`, off by default, toggled per school in the
   admin panel — `src/app/admin/page.tsx`, `toggleBibleStudies` action)
10. Alfabetización Digital y Tecnología (Digital Literacy & Technology)
11. Ciudadanía y Valores Dominicanos (Citizenship and Dominican Values)
12. Aprendizaje Socioemocional (Social and Emotional Learning)

## 2.5 Content hierarchy

```
Grade
 └─ Subject
     └─ Unit
         └─ Lesson
             ├─ Competency (Fundamental | Specific) + Achievement Indicators
             └─ Activity (typed: story, video, matching, quiz, drag-and-drop,
                           drawing/trace, reading passage, …)
                 ├─ MediaAsset (video/audio/image — captions + transcript)
                 └─ Question + AnswerOption (for QUIZ activities)
```

This matches spec §12 exactly, with `Competency` sitting under
`Subject × Grade` (MINERD organizes competencies per grade per subject) and
`Lesson` linked to one or more competencies/indicators via join tables
(`LessonCompetency`, `LessonIndicator`), since a single lesson often
addresses more than one achievement indicator.

## 2.6 What's actually seeded in this prototype

One fully authored, `PUBLISHED` demonstration lesson per age-interface group
(`prisma/seed.ts`), each combining 3–4 activity types:

| Age group | Grade | Subject | Lesson |
|---|---|---|---|
| Early Explorers | Pre-Kínder | Spanish | "La letra M de mango" — story, letter tracing, matching, quiz |
| Beginning Readers | 1er Grado | Spanish | "Ana va al colmado" — decodable reading passage w/ record-yourself, quiz, sentence word-builder, vocabulary matching |
| Developing Learners | 4to Grado | Mathematics | "Fracciones con el peso dominicano" — story, matching, quiz |
| Independent Learners | 1er Año Secundaria | Social Sciences | "Las regiones de la República Dominicana" — story, matching, quiz |
| Secondary Learners | 4to Año Secundaria | Natural Sciences | "Ecosistemas de la República Dominicana" — story, matching, quiz |

All five carry a full `ContentApproval` trail (Draft → Academic Review →
Safety Review → Approved → Published) so the workflow is demonstrable, not
just described.
