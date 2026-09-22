# Forge

A local-only interview prep platform. Two tracks: Data Structures & Algorithms, and System Design.

Not a judge and not a compiler. Forge owns **what to solve, why, in what order, and whether you actually did it**. Problems link out to LeetCode; nothing is hosted here.

## Why it exists

A pretty problem list is a worse LeetCode. The thing that actually moves someone from "I do badly at trees" to interview-ready is the **pattern layer** — knowing which of 121 techniques a new problem is asking for. That recognition is what Forge teaches.

Every question type carries a *signal*: a trigger sentence in the form "when you see X in the prompt, reach for this". Then one taught problem worked line by line, and two to practise on different terrain.

## Content

Everything is versioned TypeScript under `src/content/`, validated at build time. A thin or broken module fails the build rather than wasting a study day.

**DSA** — 30 topics, 121 question types, 364 problems, 10 timed mock sets, 310 hours.
Ratio is non-negotiable: per question type, exactly 1 taught problem + 2 practice problems. Every pattern ships with both a C++ and a Java template.

**System Design** — 18 modules, 66 hours: a 45-minute interview method, 9 concept modules, 8 worked case studies, 54 defended tradeoffs, 82 figures worth memorising.

## The app

Angular 19, standalone components and signals. No backend, no account, no cloud, ever.

- **Today** — builds an hour from reviews that are due plus new ground in atlas order
- **Atlas** — all 30 topics by phase, with prerequisites and progress
- **Patterns** — search all 121 signals by the words that appear in a problem statement
- **Progress** — pace against the plan, 12-week heatmap, phase burn-down, weakest topics
- **Cheatsheet** — every signal on one printable page
- **Mocks** — timed two-problem sets, problems hidden until the clock starts, scored against a rubric
- **System Design** — worked designs stay hidden until you have attempted them

Spaced repetition on a 1/2/7/21-day ladder. Streaks with freezes earned every 7 active days. State lives in IndexedDB on one machine; the backup story is a JSON export button.

## Run it

```bash
npm install
npm start
```

Then `http://localhost:4200`.

```bash
npm run validate:content   # content gate
npm run build              # production build
```

## Deliberate non-features

- **No LeetCode sync.** There is no public API. The unofficial endpoint needs a server-side proxy, which the local-only constraint rules out. Marking is manual. Forge never asks for a LeetCode password or session cookie.
- **No hosted problem statements.** Names and links only — LeetCode's content is theirs.
- **No accounts, no telemetry, no sync.** One machine.

## Licence

Content and code are original. Not affiliated with LeetCode.
