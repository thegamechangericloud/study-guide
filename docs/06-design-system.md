# 6. Design System

The design system is implemented as CSS custom properties in
`src/app/globals.css`, consumed via Tailwind utilities and a handful of
shared classes (`.card`, `.btn-primary`, `.focus-ring`). It is small and
functional by design — Phase 1 proves the pattern; a component library
(Storybook, documented variants, illustrated mascot set) is Phase 2 scope.

## 6.1 Principles

- **Warm, not saccharine.** Caribbean-inspired but not a stereotype: a teal/
  turquoise primary (sea), mango orange secondary, sunshine yellow accent,
  palm green and coral for state (success/attention) — no palm-tree clip art,
  no flag-as-wallpaper.
- **Encouraging, never punitive.** No countdown timers with alarm sounds, no
  red "wrong" buzzers — incorrect answers get a calm coral highlight and an
  explanation, never a penalty, and every activity can be retried (spec §4,
  §7, §8).
- **Age-adaptive density, not age-adaptive branding.** The same palette and
  components scale via `--font-scale` and larger touch targets for younger
  interface groups, rather than maintaining two visually disconnected apps.
- **Accessible by default, not as an add-on.** High-contrast and text-size
  are first-class tokens (`data-contrast`, `data-text-size` on `<html>`),
  not a separate theme bolted on later. See §14 in the top-level spec and
  `docs/08-testing-security-plan.md` for the accessibility test plan.

## 6.2 Color tokens

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#fbf7ef` | App background — warm off-white, not clinical white |
| `--color-surface` | `#ffffff` | Cards |
| `--color-ink` | `#1f2a2e` | Primary text |
| `--color-ink-muted` | `#52636a` | Secondary text |
| `--color-primary` | `#0f8b8d` | Caribbean teal — primary actions, headers |
| `--color-secondary` | `#ff8a3d` | Mango — highlights, "Continue Learning" label |
| `--color-accent` | `#ffcb3d` | Sunshine yellow — badges, avatars, focus rings |
| `--color-palm` | `#2f9e44` | Success / mastery |
| `--color-coral` | `#f2545b` | Gentle error/attention (never harsh red) |
| `--color-border` | `#e4dcc9` | Card borders, dividers |

`html[data-contrast="high"]` remaps every token to a black/near-black
background with high-luminance teal/orange/yellow foregrounds and pure-white
borders — verified against WCAG 2.2 AA contrast ratios (see testing plan).

## 6.3 Type & scale

System font stack (no external font fetch — see architecture doc §1.7 for
why this matters for low-bandwidth classrooms). Size scales via
`--font-scale` (`1` / `1.15` / `1.35`) driven by the accessibility
`textSize` preference, applied once at `body` so every `rem`-based size in
the app scales together.

## 6.4 Components

- **`.card`** — rounded-2xl (`--radius-lg`), 1px border, surface background.
  The single container primitive; every screen is composed of cards.
- **`.btn-primary`** — teal fill, white text, rounded-xl (`--radius-md`).
  Reserved for the one primary action per screen (Continue, Crear cuenta,
  Guardar). Secondary actions are plain `.card` buttons or underlined text
  links — this visual hierarchy is what keeps young-student screens from
  feeling like a wall of equally-weighted buttons.
- **`.focus-ring`** — a 3px accent-yellow outline on `:focus-visible`,
  applied to every interactive element project-wide. This is the single
  biggest lever for keyboard accessibility and is applied unconditionally,
  not opt-in per component.
- **Avatars** — emoji-based (🦜🐢🐬🦋🌴🌺) rather than uploaded photos, by
  design: no photo of a child is ever required or stored, consistent with
  the "no full student names/photos exposed" privacy rule (spec §15). A
  production illustrated-mascot set (Phase 2) would follow the same
  constraint — original characters, not photos.

## 6.5 Age-interface density

| Group | Button size | Copy length | Navigation |
|---|---|---|---|
| Early Explorers / Beginning Readers | Large (`py-3`, `text-xl`+) | Minimal — icons + short labels, narrated | Single primary action per screen, linear "next" flow |
| Developing / Independent Learners | Medium | Moderate | Grid library, subject grouping |
| Secondary Learners | Standard | Full | Study-plan-style navigation, denser progress detail |

The same `LessonPlayer` and activity components serve all groups today;
`ageInterfaceGroup` currently informs default settings (e.g., which
activities are offered) rather than swapping component variants. A true
per-group component variant system (larger touch targets automatically
applied, not just via generous base sizing) is a Phase 2 refinement once
there's usage data on where younger students actually struggle.

## 6.6 Motion

Animations are intentionally minimal in Phase 1 (CSS transitions on
progress bars and button states only) — partly to keep the bundle small for
low-bandwidth users, partly because `data-reduced-motion="true"` must be
able to neutralize *everything* animated, which is far easier to guarantee
correct when there is little motion to begin with. Richer, optional
animation (mascot reactions, page transitions) is Phase 2, and must ship
with its reduced-motion fallback in the same PR, not after.
