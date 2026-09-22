# Forge — Design System (MASTER)

**Status:** v1 — global source of truth. Page-specific overrides live in `design-system/forge/pages/`.
**Stack:** Angular 18+ standalone, SCSS + CSS custom properties, no UI framework.

---

## 0. Provenance & deviations

Generated via `ui-ux-pro-max --design-system`, query `"developer tool technical documentation reference"` (variance 5 / motion 4 / density 8).

- **Adopted from the match:** style = *Minimalism & Swiss Style* (grid-based, high contrast, functional; light + dark both supported, accessibility risk: low), typography pairing = *IBM Plex Sans / JetBrains Mono*, effects = subtle 200–250ms hover, sharp shadows, clear hierarchy.
- **Rejected:** the matched palette (`#020617` dark-first "code dark + endpoint green"). The brief calls for a light-blue/white canvas with dark as a peer theme. Palette below is authored, not matched — every text pair contrast-verified (§1.3).
- **Also rejected:** a first search on `"learning platform"` returned Claymorphism + Baloo 2/Comic Neue + indigo — a children's-education profile. Wrong audience. Forge is an adult technical tool; it should look closer to a well-made docs site than to a kids' app.
- The matched *pattern* ("FAQ/Documentation Landing") is a marketing-page structure and does not apply — Forge has no landing page in v1. Ignored.

---

## 1. Color

### 1.1 Philosophy

Three jobs, three color families, no overlap:

| Family | Owns | Rule |
|---|---|---|
| **Neutrals** (canvas/surface/ink) | 90% of the screen | Everything structural. Never colored for decoration. |
| **Azure** (primary) | Navigation, links, active state, progress fill | The only "brand" color. Used sparingly enough that it always means *interactive or progressing*. |
| **Amber** (streak) | Streaks, achievements, milestones — **nothing else** | Scarcity is the point. If amber shows up on a button, the streak stops feeling earned. |

Difficulty semantics (green/amber-brown/rose) are a fourth, closed set used **only** inside difficulty chips. Never reused for general status.

### 1.2 Tokens

```css
:root {
  /* Neutrals — light */
  --canvas:        #F6F9FC;  /* page background, faint blue cast */
  --surface:       #FFFFFF;  /* cards, tables, panels */
  --surface-sunken:#EEF3F9;  /* table header, code block, inset wells */
  --ink:           #0F1B2D;  /* primary text — deep navy-slate */
  --ink-muted:     #55637A;  /* secondary text, labels, meta */
  --border:        #DDE5EF;  /* hairlines, card edges */
  --border-strong: #C3D0E0;  /* input borders, dividers that must read */

  /* Azure — primary */
  --primary:       #0B63CE;
  --primary-hover: #0A57B4;
  --primary-soft:  #E7F0FC;  /* tinted backgrounds, active nav pill */
  --on-primary:    #FFFFFF;

  /* Amber — streaks & achievements ONLY */
  --streak:        #B45309;  /* text/icon on light surfaces */
  --streak-fill:   #F59E0B;  /* the flame, the filled node */
  --streak-soft:   #FEF3C7;

  /* Difficulty (closed set) */
  --easy:          #15803D;  --easy-soft:   #DCFCE7;
  --medium:        #B45309;  --medium-soft: #FEF3C7;
  --hard:          #BE123C;  --hard-soft:   #FFE4E6;

  /* Feedback */
  --success: #15803D;  --warning: #B45309;  --danger: #BE123C;
  --focus-ring: #0B63CE;
}

:root[data-theme="dark"],
:root:not([data-theme="light"]) { /* under @media (prefers-color-scheme: dark) */
  --canvas:        #0B1220;
  --surface:       #121B2C;
  --surface-sunken:#0E1626;
  --ink:           #E8EEF7;
  --ink-muted:     #94A3B8;
  --border:        #24314A;
  --border-strong: #35486A;

  --primary:       #5BA4F5;
  --primary-hover: #7FBAFF;
  --primary-soft:  #14273F;
  --on-primary:    #071322;

  --streak:        #FBBF24;
  --streak-fill:   #F59E0B;
  --streak-soft:   #2A2010;

  --easy:    #4ADE80;  --easy-soft:   #10291A;
  --medium:  #FBBF24;  --medium-soft: #2A2010;
  --hard:    #FB7185;  --hard-soft:   #2E1420;

  --success: #4ADE80;  --warning: #FBBF24;  --danger: #FB7185;
  --focus-ring: #7FBAFF;
}
```

Dark mode is implemented as `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`, plus an explicit `:root[data-theme="dark"]` block, so the manual toggle always wins over the OS.

### 1.3 Verified contrast (computed, WCAG 2.1 relative luminance)

| Pair | Light | Dark |
|---|---|---|
| ink on canvas | **16.36** | 16.05 |
| ink on surface | **17.28** | 14.77 |
| ink-muted on surface | 5.76 | 6.72 |
| primary on surface | 5.69 | 6.62 |
| on-primary on primary | 5.69 | — |
| easy on surface | 5.02 | 9.89 |
| medium on surface | 5.02 | 10.32 |
| hard on surface | 6.29 | 6.40 |

All text pairs clear 4.5:1. Difficulty is **never** signalled by color alone — every chip carries its label ("Easy"/"Medium"/"Hard"). Solved state carries a check glyph, not just a green tint.

---

## 2. Typography

**Pairing:** `IBM Plex Sans` (UI) + `JetBrains Mono` (code, complexity notation, problem IDs).

```
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
```

IBM Plex Sans is deliberately not Inter — it carries slight engineering-drawing character that reads as technical without being cold, and it is legible at the 13–14px sizes the problem tables need.

### Scale (modular, 1.25)

| Token | Size / line-height / weight | Use |
|---|---|---|
| `--t-display` | 40 / 1.1 / 700 | Atlas page title only |
| `--t-h1` | 32 / 1.2 / 700 | Topic name |
| `--t-h2` | 24 / 1.3 / 600 | Section headers, pattern name |
| `--t-h3` | 19 / 1.35 / 600 | Card titles |
| `--t-body` | 16 / 1.6 / 400 | Prose, concept notes |
| `--t-sm` | 14 / 1.5 / 400 | Table rows, meta |
| `--t-xs` | 12.5 / 1.4 / 500 | Chips, labels, table headers (uppercase, 0.04em tracking) |
| `--t-code` | 14 / 1.6 / 400 mono | Templates, complexity, LC numbers |

**Weight contrast is mandatory:** 700 headlines against 400 body. No screen where everything is 500.

---

## 3. Spacing, radius, shadow

Density dial 8 (dashboard). 4px base.

```css
--space-1: 4px;  --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
--space-5: 24px; --space-6: 32px;  --space-7: 48px;  --space-8: 64px;

--radius-sm: 6px;    /* chips, inputs */
--radius-md: 10px;   /* cards, buttons */
--radius-lg: 16px;   /* panels, modals */
--radius-full: 999px;

/* Swiss style: shadows are crisp and rare. Hierarchy comes from borders. */
--shadow-sm: 0 1px 2px rgba(15,27,45,.06);
--shadow-md: 0 2px 8px rgba(15,27,45,.08);
--shadow-lg: 0 8px 24px rgba(15,27,45,.10);
```

In dark mode, shadows mostly stop working — **elevation there is communicated by `--surface` lightening and `--border`**, not by heavier shadow.

**Layout grid:** 12-column, 1200px max content width, 24px gutters, 16px page gutter on mobile. No horizontal page scroll at any breakpoint. Breakpoints: 375 / 768 / 1024 / 1440.

---

## 4. Motion

Motion tier 4/10 — standard, restrained. Every animation must mean something.

| Event | Duration | Easing |
|---|---|---|
| Hover / color change | 180ms | ease-out |
| Card expand (pattern card) | 240ms | cubic-bezier(.2,.8,.2,1) |
| Atlas node fill on completion | 500ms | ease-out |
| Streak count-up | 700ms | power1.out |
| Page transition | 200ms fade+4px rise | ease-out |
| Exit / collapse | 150ms | ease-in (exits are faster than entrances) |

Animate `transform` and `opacity` only — never `width`/`height`/`top`. Every non-essential animation is wrapped in `@media (prefers-reduced-motion: reduce)` and renders the final state instantly.

GSAP only if the Atlas needs it; CSS transitions handle everything else. No scroll-jacking, no parallax, no decorative loops.

---

## 5. Components

- **Buttons** — one primary per view (filled azure), rest secondary (border + ink) or ghost. 40px height, 44px touch target on mobile. `cursor: pointer` always. Visible 2px focus ring, 2px offset, `--focus-ring`.
- **Difficulty chip** — `--radius-full`, 12.5px, soft background + strong text from the difficulty set, always labelled.
- **Status control** — a 5-state cycle (Not started → Attempted → Solved → Solved clean → Needs review). Renders as an icon button with tooltip + `aria-label`; state is also written as text in the row for screen readers.
- **Pattern card** — collapsed: name + recognition signal + problem count. Expanded: full signal, C++/Java template tabs, complexity line, problem ladder. Language tab is a global preference — switching it on one card switches all of them.
- **Problem table** — sticky header, 44px rows, zebra via `--surface-sunken` at 40% or nothing at all (prefer hairlines). Sortable columns, filter chips above. On mobile it becomes a card list, never a horizontally-scrolling table.
- **Progress ring / bar** — azure fill on `--surface-sunken` track. Percentage always accompanied by raw counts ("62 / 180").
- **Streak flame** — the only amber element. Count in JetBrains Mono, 700.

---

## 6. Anti-generic rules (binding)

Forbidden, no exceptions:

- Purple/violet gradient on white. Any decorative gradient, really — Swiss style earns hierarchy with type and space.
- Blob/wave/mesh background shapes.
- Gray text on gray background below 4.5:1.
- Emoji as icons. Use Lucide SVG, 1.5px stroke, `currentColor`, `aria-hidden` when decorative.
- Everything-is-a-rounded-white-card layouts. Vary density and use full-bleed sections and hairline rules to separate.
- Motivational-poster copy: "Unlock your potential", "You got this! 🎉", "Let's crush it". Forge's voice is a competent colleague stating facts: *"14 days. Longest yet."* / *"Sliding Window — 6 of 18 solved. 4 due for review."* / *"You're 9 days behind. Readiness moved to June 18."*
- Amber used for anything that is not a streak or achievement.

---

## 7. Screen direction

### 7.1 Topic Atlas (home)

The answer to "where am I". A **dependency map**, not a grid of cards.

- Left-to-right phase columns (Foundations → Core Linear → Trees & Recursion → Graphs & DP → Advanced), edges drawn where a topic has prerequisites. SVG, pan/zoom off by default — it must fit 1440px without interaction.
- Each node: topic name, hours, a thin azure completion arc around it. States: **locked** (prereqs unmet — muted, dashed border), **available** (surface + border), **in progress** (azure ring partially filled), **done** (azure fill + check). Completion animates the arc once, 500ms.
- Fixed header strip, always visible: streak flame + count · today's minutes · problems solved · **projected readiness date vs. Jun 1 2027**, green when ahead, amber when behind. This strip is the app's conscience.
- Primary CTA, sticky: **Start today's hour**.
- Mobile: the graph degrades to a vertical phase-by-phase accordion list with the same node states. Do not try to pan a graph on a phone.
- Empty state (Oct 1, nothing done): the map is fully drawn and visible — only Phase 0 is unlocked. Copy: *"18 topics. 310 hours. Starts with Big-O."* Inviting, not accusatory.

### 7.2 Topic detail

Two-pane at ≥1024px: sticky left rail (topic meta, prerequisites, progress ring, jump-to-pattern list), right content column.

Order down the page: why it matters (2–3 sentences) → concept notes → **pattern cards** → problem tables in Learn / Drill / Prove tiers.

The pattern card is the most-visited surface in the app; give it the most design care. Recognition signal gets `--t-h3` treatment, not fine print — it is the single most valuable sentence on the page.

Problem tables: columns = status · title (links out to LeetCode, external-link glyph) · LC# (mono) · difficulty chip · patterns · est. min · insight (hidden behind a click in Drill, absent in Prove). Filter chips: pattern, difficulty, status. Sticky header on scroll.

### 7.3 Daily Session

One decision, one screen. Deliberately the sparsest surface in the app.

- Full-width, single column, max 720px, generous vertical rhythm — a visual break from the dense tables.
- Step indicator: `1 concept · 3 problems · 2 reviews`, ticks off as you go.
- One card at a time. Large title, difficulty, an "I'm stuck → show the pattern" escape hatch (never a full solution).
- Timer runs quietly in the corner. Visible but not a countdown pressure device — elapsed, not remaining.
- On finish: minutes logged, streak advanced (the one amber moment in the app, 700ms count-up), tomorrow previewed in one line. No confetti.

---

## 8. Pre-delivery checklist

- [ ] No emoji icons — Lucide SVG only
- [ ] `cursor: pointer` on every clickable
- [ ] Hover transitions 180–250ms
- [ ] All text pairs ≥4.5:1, both themes (§1.3 re-verified after any color change)
- [ ] Visible focus ring on every interactive element, 3:1 against its background
- [ ] `prefers-reduced-motion` honored everywhere
- [ ] Responsive verified at 375 / 768 / 1024 / 1440, no horizontal scroll
- [ ] Tables become card lists below 768px
- [ ] Empty, loading (skeleton), error, and completed states designed for every screen
- [ ] Status and difficulty never conveyed by color alone
- [ ] Amber appears only on streaks/achievements
- [ ] `@for` blocks use `track item.id`, state via signals (zoneless-ready)
