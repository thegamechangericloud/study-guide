# 5. Wireframes

These are low-fidelity layout sketches for the required screens (spec §18).
Where a screen is implemented in the Phase 1 prototype, the file path is
given — the sketch and the shipped layout match. Where it is not yet built,
that's called out explicitly (see also §13/§7 in `docs/07-implementation-roadmap.md`).

## 5.1 Public welcome page — `src/app/page.tsx` ✅ built

```
┌─────────────────────────────────────────────────────────┐
│ 🌺 Estudia RD                    [Iniciar sesión] [Crear cuenta] │
├─────────────────────────────────────────────────────────┤
│  Aprender a leer y crecer,        ┌───────────────────┐ │
│  un paso a la vez.                │ Diseñada para toda │ │
│                                    │ la familia escolar │ │
│  [Comenzar gratis]                │ 📚 🎮 👨‍👩‍👧 🧑‍🏫 🔒 📶  │ │
│  [Ya tengo un perfil]             └───────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  [Nivel Inicial]   [Nivel Primario]   [Nivel Secundario] │
├─────────────────────────────────────────────────────────┤
│              Configuración de accesibilidad              │
└─────────────────────────────────────────────────────────┘
```

## 5.2 Registration / Login — `src/app/register`, `src/app/login` ✅ built

```
┌───────────────────────────┐
│  Crear cuenta              │
│  ┌───────────────────────┐│
│  │ Tipo de cuenta  [▾]    ││   Parent | Teacher | School Admin
│  │ Nombre completo        ││
│  │ Correo electrónico     ││
│  │ Contraseña             ││
│  │ (Escuela, si aplica)   ││
│  │ [Crear cuenta]         ││
│  └───────────────────────┘│
└───────────────────────────┘
```

## 5.3 Child-profile selector — `src/app/profiles/page.tsx` ✅ built

```
┌──────────────────────────────────────────────────┐
│ ¿Quién va a estudiar hoy?          Cerrar sesión  │
│  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐       │
│  │ 🧒     │  │ 🧒     │  │ 🧒     │  │  ＋    │       │
│  │ Camila │  │ Josué  │  │Valent. │  │Agregar │       │
│  └───────┘  └───────┘  └───────┘  └───────┘       │
└──────────────────────────────────────────────────┘
```
PIN entry (`profiles/[id]/pin`) is a focused, single-purpose screen: avatar,
name, large numeric PIN field, nothing else — minimizes distraction/error for
a young child entering a PIN unassisted.

## 5.4 Student home dashboard — `src/app/student/page.tsx` ✅ built

```
┌───────────────────────────────────────────────┐
│ 🌺 Estudia RD      Hola, Josué 👋  Mis logros ⚙️ Salir │
├───────────────────────────────────────────────┤
│ CONTINUAR APRENDIENDO                           │
│ ┌───────────────────────────────────────────┐ │
│ │ Ana va al colmado          [▶ Continuar]   │ │
│ │ Lengua Española · Lectura guiada           │ │
│ └───────────────────────────────────────────┘ │
├───────────────────────────────────────────────┤
│ MIS MATERIAS                                    │
│ Lengua Española                                 │
│  [Ana va al colmado ▶]                          │
│ Matemática                                      │
│  [Fracciones… ○]                                │
└───────────────────────────────────────────────┘
```

## 5.5 Interactive lesson player — `src/app/student/lesson/[lessonId]`, `src/components/lesson/*` ✅ built

```
┌───────────────────────────────────────────────┐
│ Ana va al colmado                 Lee el cuento│
│ ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░  (progress bar)        │
├───────────────────────────────────────────────┤
│                                                  │
│   Ana  va  al  colmado.  Ana  lleva  un  peso.  │  ← tap any word to hear it
│                                                  │
│   🔊 Escuchar el modelo                          │
│   [🎙️ Grabar mi lectura]   ▶ audio playback      │
│                                                  │
│                                   [Continuar →] │
└───────────────────────────────────────────────┘
```
The same container (`LessonPlayer.tsx`) swaps in a story reader, a
letter-tracing canvas, a matching game, a quiz (with immediate per-answer
explanation), or a word-builder, driven entirely by `Activity.type` — one
resume/progress mechanism underneath every activity format.

## 5.6 Video lesson screen — Phase 2 (spec §5 checkpoint-video requirements)

No demo lesson currently uses `ActivityType.VIDEO` — see
`docs/07-implementation-roadmap.md` for why (no placeholder video content is
shipped as if it were reviewed curriculum). The data model
(`MediaAsset.captionsUrl`, `.transcript`, `.lowResUrl`) and the activity-type
enum already support it; the player component is the remaining work:

```
┌───────────────────────────────────────────────┐
│  [ video ]                    CC  ⚙  ⛶         │
│  ▶ ⏸ ⏹  ──●────────────  0:42 / 3:10  🔊 1x     │
├───────────────────────────────────────────────┤
│  ⏸ Pausado para pregunta de comprobación        │
│  ¿Qué acabas de observar?  [ ] [ ] [ ]          │
└───────────────────────────────────────────────┘
```

## 5.7 Quiz / assessment screen — `src/components/lesson/QuizPlayer.tsx` ✅ built

```
┌───────────────────────────────────────────────┐
│ Pregunta 1 de 2                                 │
│ ¿A dónde va Ana?                                │
│  ( ) Al colmado      ( ) A la escuela           │
│  ( ) Al parque                                  │
│  [selected → immediate feedback + explanation]  │
│                                   [Siguiente →] │
└───────────────────────────────────────────────┘
```

## 5.8 Student progress & rewards — `src/app/student/progress/page.tsx` ✅ built

```
┌───────────────────────────────────────────────┐
│ Mis logros                                      │
│  [3 lecciones]  [2 insignias]  [1 destreza]     │
│  🏅 Primera lección completada                   │
│  Lengua Española — Reconocer letra M: Dominado  │
└───────────────────────────────────────────────┘
```
No leaderboard, no cross-student comparison anywhere on this screen or
anywhere else in the app — see §3.4 in the roles/permissions doc.

## 5.9 Parent dashboard — `src/app/parent/page.tsx`, `parent/children/[id]` ✅ built

```
┌───────────────────────────────────────────────┐
│ 👨‍👩‍👧 Panel Familiar         Ana Martínez  Salir │
│  Mis hijos                    [+ Agregar]       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │ Camila  │ │ Josué   │ │Valentina│            │
│  │ ✅0 ⏱0m │ │ ✅1 ⏱0m │ │ ✅1 ⏱0m │            │
│  └─────────┘ └─────────┘ └─────────┘            │
└───────────────────────────────────────────────┘
        ↓ click a child
┌───────────────────────────────────────────────┐
│ Josué — 1er Grado           [🖨️ Descargar (PDF)]│
│  Lecciones recientes: Ana va al colmado ✅       │
│  Destrezas: Comprensión lectora — Dominado       │
│  Comentario de Rosa Pérez: "¡Josué está…"        │
└───────────────────────────────────────────────┘
```
"Downloadable progress report" is implemented as a print-optimized view
(browser Print → Save as PDF) in Phase 1; a formatted, backend-generated PDF
via a background job is a Phase 2 item (needs the queue infra from
`docs/01-architecture.md` §1.3).

## 5.10 Teacher dashboard & classroom — `src/app/teacher/page.tsx`, `teacher/classrooms/[id]` ✅ built

```
┌───────────────────────────────────────────────┐
│ 🧑‍🏫 Panel del Maestro     Rosa Pérez     Salir │
│  1er Grado — Sección A                          │
│  12 estudiantes · 1 tarea asignada              │
└───────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────┐
│ Asignar lección: [Lección ▾] [fecha] [Asignar] │
├───────────────────────────────────────────────┤
│ Estudiante   │ Ana va al colmado                │
│ Josué        │ ✅ Completado      [Reabrir]      │
│ Diego        │ ○ Sin comenzar     [Reabrir]      │
├───────────────────────────────────────────────┤
│ Enviar retroalimentación                        │
│  [Josué: ______________ ] [Enviar]              │
└───────────────────────────────────────────────┘
```

## 5.11 School administration & curriculum editor — `src/app/admin/*` 🟡 partially built

Implemented: school overview (counts, user list), Bible Studies toggle,
content-approval workflow view (`admin/curriculum`) with a
Draft→Review→Approved→Published→Archived control per lesson.

Not yet built (Phase 2): a full curriculum *authoring* editor (creating new
units/lessons/activities from the UI rather than via seed data), academic
year/term management UI, teacher-permission management UI, announcements.

```
┌───────────────────────────────────────────────┐
│ 🏫 Administración Escolar          Currículo    │
│  [12 Maestros] [340 Estudiantes] [15 Clases]    │
│  ☑ Habilitar Estudios Bíblicos      [Guardar]   │
│  Usuarios: nombre · correo · rol                │
└───────────────────────────────────────────────┘
        ↓ Currículo
┌───────────────────────────────────────────────┐
│ 1er Grado                                       │
│  Lengua Española — Lectura guiada               │
│   Ana va al colmado    [Publicado] Avanzar → …  │
└───────────────────────────────────────────────┘
```

## 5.12 Accessibility settings — `src/app/accessibility/page.tsx` ✅ built

```
┌───────────────────────────┐
│ Configuración de           │
│ accesibilidad              │
│  Contraste: ( ) Normal     │
│             ( ) Alto       │
│  Tamaño de texto: N/G/XL   │
│  ☐ Reducir animaciones     │
│  ☐ Fuente para dislexia    │
│  [Guardar]                 │
└───────────────────────────┘
```

## 5.13 Not yet built (Phase 2/3 — see roadmap)

Help & support center, privacy/consent center (self-service; consent is
currently recorded server-side at profile creation but has no dedicated
management UI), reports/analytics beyond the per-classroom and per-child
views above, assignment builder beyond "assign one published lesson."
