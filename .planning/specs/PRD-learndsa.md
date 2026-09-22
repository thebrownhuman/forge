# PRD — Forge: A DSA + System Design Learning Platform

**Author:** Shivansh
**Date:** 2026-09-22
**Status:** v1.1 — scope locked, open questions resolved
**Target outcome:** Be Google-interview-ready on DSA by **June 2027**, with System Design as a second module afterwards.

## Locked decisions

| Decision | Value |
|---|---|
| Product name | **Forge** |
| Languages | **C++ and Java** (both templates on every pattern) |
| Target date | **June 2027** |
| Roadmap day 1 | **1 Oct 2026** |
| Devices | **One machine, fully local.** No backend, no account, no cloud, ever. Runs from the laptop. |
| Content ratio | **Per question type: 1 taught problem + 2 practice problems.** Non-negotiable. |
| Why | Clear the DSA round at a top-tier company. Strong on AI/LLM work already; DSA is the gap. |

Derived schedule: 1 Oct 2026 → 1 Jun 2027 = **35 weeks**. 310 hr ÷ 35 = **~8.9 hr/week ≈ 1.3 hr/day, 7 days/week**, or 1.5 hr × 5 weekdays + 1.5 hr one weekend day. There is ~2 weeks of slack total. Missing a week costs ~25 min/day on every remaining day — the roadmap screen must show that arithmetic, not hide it.

---

## 1. Problem Statement

The user knows basic C++ and can code, but does not have working intuition for data structures and algorithms. Specific failure points named: linked lists and trees. The deeper problem is not capability — it is **motivation and structure**:

1. **No map.** DSA is presented as ~500 unrelated problems. There is no visible "you are here" or "this is what's left."
2. **No pattern layer.** Solving problems without naming the underlying technique (fast/slow pointers, monotonic stack, binary search on answer) means nothing transfers to the next problem.
3. **Low adherence.** Self-declared laziness. Existing tools (LeetCode, GFG) are either ugly, overwhelming, or feel like a chore list.

So the product is **not** a judge/compiler and **not** a course. It is a **beautiful, opinionated map + progress engine** that makes an hour a day feel worth showing up for.

### Explicit non-goal

No in-browser compiler or code execution. Solving happens on LeetCode. This app owns *what to solve, why, in what order, and whether you actually did it.*

---

## 2. Goals & Success Metrics

| Goal | Metric | Target by Jun 2027 |
|---|---|---|
| Full DSA coverage | Topics completed | 30/30 topics |
| Type fluency | Question types marked "can solve cold" | 110/121 |
| Volume | Problems solved | ~390 curated (not 3000 random) |
| Consistency | Longest daily streak | 60+ days; ≥5 active days/week average |
| Interview readiness | Timed mock sets passed (2 problems / 45 min) | 20 sessions, ≥70% pass rate |
| Retention | Spaced-repetition reviews completed on time | ≥80% |

**Leading indicator to watch weekly:** minutes-in-app per active day. If it drops below ~25 min, the motivation design is failing and that is the bug to fix — not the content.

---

## 3. Users

**Primary (n=1, be honest about it):** Shivansh. Intermediate C++ coder, weak DSA foundations, high ambition, low baseline discipline, high sensitivity to UI quality. Studies ~1–1.5 hr/day on weekdays, more on weekends.

**Secondary (future):** Any CS student / SWE prepping for FAANG-tier interviews who wants a curated path instead of a problem firehose.

Design implication: this must be **single-player-excellent first**. No social features, no leaderboards in v1. Streaks compete against yourself.

---

## 4. Content Model — The Core Asset

The content is the product. The UI just makes it pleasant. Content hierarchy:

```
Track (DSA | System Design)
 └── Phase (Foundations → Core → Advanced → Interview Sim)
      └── Topic (e.g. Linked List) — has: est. hours, prerequisites, "why it matters"
           └── Concept notes (short, visual, C++-flavored)
                └── Pattern (e.g. Fast & Slow Pointers) — the unit that actually transfers
                     └── Problem (name, LeetCode URL, difficulty, tags, "the trick")
```

### 4.1 The Pattern Layer (the differentiator)

Every problem is attached to **at least one named pattern**, and every pattern carries:

- **Recognition signal** — "when you see X in the prompt, reach for this." e.g. *"Asked for the k-th from the end, or detect a cycle, in O(1) space → two pointers at different speeds."*
- **Template** — a ~10-line skeleton the user memorizes by writing, not reading. **Two tabs: C++ and Java.** Same algorithm, idiomatic in each (`unordered_map` / `HashMap`, `priority_queue` / `PriorityQueue`, `vector` / `ArrayList`). Language choice is a global toggle, remembered.
- **Complexity** — time/space, and the trap variant.
- **Problem ladder** — 1 teaching problem, 2–3 reps, 1 twist that breaks naive application.

**Linked List worked example** (the user asked for exactly this):

| Pattern | Recognition signal | Canonical problems |
|---|---|---|
| Dummy/sentinel head | Any deletion or insertion that could touch the head | Remove Nth From End (19), Remove Linked List Elements (203), Merge Two Sorted Lists (21) |
| Fast & slow pointers | "middle", "cycle", "k-th from end", O(1) space | Middle of LL (876), Linked List Cycle (141), Cycle II (142) — incl. Floyd phase-2 proof |
| In-place reversal | "reverse", "reorder", "palindrome check", O(1) space | Reverse LL (206), Reverse LL II (92), Reverse Nodes in k-Group (25) |
| Merge / k-way merge | Sorted inputs, "merge", heap of heads | Merge k Sorted Lists (23), Sort List (148 — merge sort on LL) |
| Split + reverse + merge | "reorder", "palindrome" — combining the three above | Reorder List (143), Palindrome LL (234) |
| Hash-map cloning | Nodes carry extra pointers | Copy List with Random Pointer (138) |
| LL as building block | LRU/LFU cache, design questions | LRU Cache (146), LFU Cache (460) |

Same treatment for every topic. This table structure **is** the content schema.

### 4.2 Full Topic Coverage & Time Budget

Total estimated: **~310 focused hours** across 35 weeks (1 Oct 2026 → 1 Jun 2027) = **~8.9 hr/week**. This is a real commitment with roughly two weeks of slack in the whole run. The roadmap UI states the required weekly hours plainly and recalculates on every slip rather than pretending the date is safe.

Phase pacing against the calendar:

| Phase | Hours | Target window |
|---|---|---|
| 0 — Foundations | 30 | Oct 1 – Oct 25 |
| 1 — Core Linear | 75 | Oct 26 – Dec 20 |
| 2 — Trees, Heaps, Recursion | 80 | Dec 21 – Feb 21 |
| 3 — Graphs & DP | 85 | Feb 22 – Apr 25 |
| 4 — Advanced + Mocks | 40 | Apr 26 – Jun 1 |

**Phase 0 — Foundations (30 hr)**

| Topic | Hr | Key patterns |
|---|---|---|
| Complexity analysis (Big-O, amortized, space) | 4 | Counting loops, recurrence intuition, Master theorem (lite) |
| C++ STL for interviews | 8 | vector, string, map/unordered_map, set, priority_queue, deque, pair/tuple, sort + comparators, iterators |
| Arrays & prefix sums | 10 | Prefix/suffix arrays, difference array, Kadane, running aggregates |
| Strings | 8 | Frequency maps, in-place two-pointer, parsing, string-builder patterns |

**Phase 1 — Core Linear Structures (75 hr)**

| Topic | Hr | Key patterns |
|---|---|---|
| Two Pointers | 10 | Opposite ends, same direction, sorted-pair, 3Sum family, partitioning |
| Sliding Window | 12 | Fixed-size, variable-size (grow/shrink), at-most-K → exactly-K trick, window + hashmap |
| Binary Search | 14 | On sorted array, on rotated array, **on the answer space** (the one people miss), lower/upper bound, 2D matrix search |
| Hashing / Maps & Sets | 8 | Frequency count, seen-set, grouping by key, prefix-sum + hashmap (subarray sum K) |
| Stacks | 10 | Monotonic increasing/decreasing, next-greater, valid parentheses, expression eval, histogram |
| Queues & Deques | 6 | BFS queue, monotonic deque (sliding-window max), circular buffer |
| Linked Lists | 15 | The 7 patterns in §4.1 |

**Phase 2 — Trees, Heaps, Recursion (80 hr)**

| Topic | Hr | Key patterns |
|---|---|---|
| Recursion & backtracking foundations | 12 | Choose/explore/unchoose, subsets, permutations, combinations, N-Queens, word search, pruning |
| Binary Trees | 18 | DFS (pre/in/post), BFS level order, top-down vs bottom-up return values, path problems, LCA, diameter, serialize/deserialize, view problems |
| BSTs | 10 | Inorder = sorted invariant, validate, insert/delete, k-th smallest, BST from sorted array, successor/predecessor |
| Heaps / Priority Queues | 10 | Top-K, k-way merge, two-heaps (running median), scheduling with a heap |
| Tries | 8 | Prefix insert/search, word dictionary with wildcard, Word Search II (trie + DFS) |
| Intervals | 8 | Sort-by-start merge, sweep line, meeting rooms, insert interval |
| Sorting algorithms | 8 | Merge, quick/quickselect, counting/bucket/radix, custom comparators, "sort first" as a meta-pattern |
| Matrix / Grid | 6 | Traversal, in-place rotation, spiral, flood fill, grid-as-graph |

**Phase 3 — Graphs & DP (85 hr)**

| Topic | Hr | Key patterns |
|---|---|---|
| Graph representation & traversal | 14 | Adjacency-list build, BFS/DFS on grid and graph, connected components, bipartite check, multi-source BFS |
| Topological sort | 8 | Kahn's algorithm, DFS-based, cycle detection in directed graphs, course-schedule family |
| Shortest paths | 12 | Dijkstra, 0-1 BFS, Bellman-Ford (negative edges, k-stops), Floyd-Warshall |
| Union-Find (DSU) | 8 | Path compression + union by rank, connectivity, Kruskal MST, accounts-merge family |
| Dynamic Programming | 35 | 1-D (climbing stairs / house robber / decode ways), 2-D grid, knapsack 0/1 + unbounded, subsequences (LIS, LCS, edit distance), partition, interval DP (burst balloons, MCM), DP on trees, bitmask DP, state-machine DP (stock series), memo → tabulation → space-optimized conversion |
| Greedy | 8 | Exchange-argument intuition, interval scheduling, jump game, gas station, task scheduler |

**Phase 4 — Advanced & Interview Simulation (40 hr)**

| Topic | Hr | Key patterns |
|---|---|---|
| Bit manipulation | 6 | XOR tricks, masks, subsets via bits, single-number family, power-of-two |
| Math & number theory | 6 | GCD/LCM, primes/sieve, modular arithmetic, fast power, combinatorics basics |
| Segment tree / Fenwick (BIT) | 8 | Range sum/min, point update, lazy propagation (awareness-level only) |
| Design problems | 8 | LRU/LFU, min-stack, Twitter feed, rate limiter, iterator design, hashmap from scratch |
| Mock interview sets | 12 | Timed 2-problem sets, talk-aloud protocol, follow-up/optimization drills |

**Total: 18 core topic groups across 5 phases.**

### 4.3 Problem Curation Rules

**The 1 + 2 rule (binding).** Every question type carries exactly:

- **1 taught problem** — worked end to end in the app: how to *recognise* it, the step-by-step reasoning, the full C++ and Java solution, complexity, and the specific place people get it wrong. You read this one; you do not solve it cold.
- **2 practice problems** — same shape, different terrain. The second one deliberately flips something (longest → shortest, array → string, max → count) so the shape transfers instead of the memory.

**Corrected counts (from the built atlas, `src/content/dsa/atlas.ts`).** Earlier drafts said "18 topics / 52 types"; the real map, once every topic was enumerated, is **30 topics across the 5 phases carrying ~121 question types**. The 18 was a coarser grouping and the 52 was a guess. At 1 taught + 2 practice that is **~363 core problems**, plus a **Prove** tier (~1 hard twist per topic, ~30) for roughly **390 problems**.

That is more than the "~220" figure this document briefly carried — discard that number. It is also close to the original 450, but the composition is completely different: every problem now belongs to a named type and has a stated job (teach it / drill it / break it), instead of being volume for its own sake. A topic with 10 types gets 10 taught + 20 practice, exactly as specified.

**Load check:** ~121 taught write-ups are the real cost of this project, not the app. At 310 hours total, taught problems are *read*, not solved cold, which is what keeps the arithmetic survivable.

- Each problem row: `title · LeetCode URL · difficulty · type · role (taught | practice | prove) · est. minutes · "the insight" · company tags`.
- Taught problems show everything upfront. Practice problems hide the insight behind a click. Prove shows nothing.
- Curation sources: Blind 75 / NeetCode 150 / Grind 169 as the spine, Striver A2Z sheet for coverage completeness, LeetCode Google-tagged list for the final 3 months.
- **Legal note:** we link out to LeetCode and store only titles, URLs, and our own pattern notes. We do not copy LeetCode problem statements, editorials, or test cases.

---

## 5. Feature Requirements

### 5.1 Must-have (v1)

| # | Feature | Description |
|---|---|---|
| F1 | **Topic Atlas** | Visual map of all 18 topics as a dependency graph/roadmap, colored by completion. Click → topic page. This is the home screen and the cure for "no map". |
| F2 | **Topic page** | Hours estimate, prerequisites, why-it-matters, concept notes, pattern cards, problem tables in Learn/Drill/Prove tiers. |
| F3 | **Pattern card** | Recognition signal, C++ template, complexity, linked problems. Expandable. The most-visited surface in the app. |
| F4 | **Problem tracker** | Per-problem status: `Not started / Attempted / Solved / Solved clean / Needs review`. Manual toggle, notes field, time-taken field. |
| F5 | **Daily session** | "Today's hour": 1 concept + 3 problems, auto-picked from the current phase plus due reviews. One button: *Start today's hour.* Reduces the whole day to one decision. |
| F6 | **Streak engine** | Login streak + solve streak. Streak freezes (2/month) so one bad day does not erase 40 — critical for a self-described lazy user. |
| F7 | **Progress dashboard** | Problems solved by topic/difficulty/pattern, hours logged, streak calendar heatmap, projected readiness date vs. the June 2027 target. |
| F8 | **Roadmap / schedule** | Week-by-week plan from today to the target date. Adapts: fall behind and it re-spreads remaining hours and shows the honest new completion date. |
| F9 | **Spaced repetition** | Solved problems resurface at 3/7/21/60 days. "Can you still see the trick in 60 seconds?" → yes/no reschedules it. |
| F10 | **Local persistence** | Everything works offline via IndexedDB/localStorage. No login required to start. |

### 5.2 Should-have (v1.5)

| # | Feature | Description |
|---|---|---|
| F11 | **LeetCode sync** | See §7 — read the constraints before promising this. |
| F12 | **Timed mock mode** | 45-min timer, 2 problems at target difficulty, no hints, post-session self-scoring rubric. |
| F13 | **Cheatsheet export** | Auto-generated single-page print/PDF view of every pattern template, for pre-interview revision. |
| F14 | **Command palette** | `Cmd+K` → jump to any topic, pattern, or problem. |
| F15 | **Notes & flashcards** | Personal notes per pattern; auto-generated flashcards from recognition signals. |

### 5.3 Future (v2 — System Design track)

Same shell, new content track. Topics: scaling basics, CAP/consistency, load balancing, caching, DB choice & sharding, replication, message queues, rate limiting, consistent hashing, CDN, search indexing, observability — then ~20 case studies (URL shortener, Twitter feed, chat, YouTube, Uber, Google Docs, Maps, Drive, notification system, ad-click aggregator), each with requirements → estimation → API → schema → HLD diagram → bottlenecks → deep dive.

Architecture must not hardcode "DSA" anywhere. `Track` is a first-class entity from day one.

### 5.4 Explicitly out of scope

Code editor, compiler, judge, submissions, discussion forum, leaderboards, user-generated content, native mobile app (responsive web only), payments.

---

## 6. Design Direction

Stated requirement: *very good looking, prettified, interactive, colorful but not noisy — light blue, white, some dark.* Run the `ui-ux-pro-max` skill before implementation to produce the formal token set. Direction to give it:

- **Palette:** off-white / very-light-blue canvas (~`#F7FAFC`), deep navy-slate ink, a single confident azure as primary accent, one warm secondary (amber) reserved **only** for streaks and achievements so they feel earned, semantic green/amber/red for difficulty. Full dark mode as a first-class theme, not an afterthought.
- **Anti-generic rules apply** (per project design rules): no purple gradient on white, no blob/wave backgrounds, no gray-on-gray, no AI-boilerplate copy. Real copy in a direct human voice.
- **Typography:** one geometric/humanist sans for UI, a genuine monospace for all code and complexity notation. Strong weight contrast — 700 headlines against 400 body, not 500 everywhere.
- **Motion:** purposeful only. Topic node fills as it completes. Streak count-up. Card expansion. Respect `prefers-reduced-motion`. No decorative parallax.
- **Density:** problem tables are the workhorse — scannable at a glance, sortable, filterable by pattern/difficulty/status, and never horizontally scrolling on mobile.
- **All states designed:** empty (day 1, nothing solved — must feel inviting, not accusatory), loading skeletons, error, and the 400-problems-solved end state.
- **Accessibility:** 4.5:1 contrast minimum, 44px touch targets, visible focus rings, fully keyboard-navigable.

**Tone principle:** encouraging, never patronizing. No "You got this! 🎉". Prefer honest signal: *"14 days. Longest yet."*

---

## 7. LeetCode Integration — Read This Before Promising It

**LeetCode has no public, documented, supported API.** Practical options, ranked:

1. **Manual toggle (v1 — ship this).** User marks solved in-app. Zero dependencies, zero breakage, works offline. Friction mitigated by a one-tap toggle on the problem row plus a "paste your solved list" bulk importer.
2. **Unofficial GraphQL endpoint (v1.5, best-effort).** `leetcode.com/graphql` exposes public profile stats (total solved, split by difficulty, recent accepted submissions) for a username. Unauthenticated, undocumented, CORS-restricted from the browser → **requires a small backend proxy**. Can break without notice. Use it to *reconcile* local state, never as source of truth.
3. **Browser extension (v2, optional).** Detects an accepted submission on leetcode.com and pings the app. Most accurate, most work.
4. **Never:** ask for or store the LeetCode password or session cookie.

**Decision:** v1 ships manual-only. The data model stores `source: 'manual' | 'synced'` per problem from day one, so sync layers in without a migration.

**Superseded by the local-only decision:** options 2 and 3 both need a server or an extension. Neither gets built. Forge stays a folder on the laptop — `npm start`, opens in the browser, progress in IndexedDB, nothing leaves the machine. The one thing worth adding later is a **JSON export/import button** so progress survives a laptop reinstall. That is the entire backup story, and it is enough.

---

## 8. Technical Approach

**Stack:** Angular 18+ (standalone components, signals), TypeScript strict, SCSS with CSS custom properties for tokens, Angular Router for the shell, IndexedDB (thin wrapper) for progress, Jest/Vitest + Playwright for tests. Deploy: static host (Vercel / Netlify / Cloudflare Pages).

**Content as data, not markup.** All topics/patterns/problems live in versioned JSON/TS under `src/content/`, validated against a schema at build time. Consequences: content edits need no component changes, everything is diffable in git, and a future CMS or backend can serve the same shape.

**Architecture:**

```
src/
  app/
    core/        services: progress, streak, scheduler, spaced-repetition, theme
    shared/      ui primitives: card, tag, table, progress-ring, streak-flame
    features/
      atlas/     topic map (home)
      topic/     topic detail + pattern cards + problem tables
      session/   today's hour
      progress/  dashboard + heatmap
      roadmap/   schedule to target date
  content/
    dsa/            tracks → phases → topics → patterns → problems (JSON)
    system-design/  (empty in v1, schema ready)
```

**No backend in v1.** Fully client-side. A backend arrives only when LeetCode sync (needs a CORS proxy) or cross-device sync is wanted — at which point a small service with `/sync` and `/leetcode/:username` is enough.

---

## 9. Delivery Plan

| Milestone | Scope | Est. |
|---|---|---|
| **M0 — This PRD approved** | Scope locked | — |
| **M1 — Design system** | Run `ui-ux-pro-max`, produce tokens + 3 key screen designs (Atlas, Topic, Session), design-gate review | 1–2 days |
| **M2 — Content schema + Phase 0–1 content** | ✅ **DONE.** Schema + build-time validation gate, 11 topics, 46 question types | — |
| **M3 — App shell + Atlas + Topic page** | ✅ **DONE.** Angular 19 standalone + signals, hash routing, light/dark tokens, Atlas, Topic detail (fundamentals, pattern cards, templates, walkthroughs, problem tables), Patterns catalogue with signal search. | 3–4 days |
| **M4 — Progress engine** | ✅ **DONE.** 5-state status with dated history, IndexedDB (v1→v2 migration), streak + longest + earned/auto-spent freezes, Progress dashboard (pace vs plan, 12-week heatmap, phase burn-down, status mix, weakest topics), JSON backup export/import. | 2–3 days |
| **M5 — Session + Roadmap + SRS** | ✅ **DONE.** Today screen builds an hour from due reviews (capped at 40% of budget) plus new ground in atlas order; configurable daily minutes; interval-based SRS (1/2/7/21 days, stretched by clean reps, capped at 45); roadmap pace maths with drift and a guarded finish projection. | 2–3 days |
| **M6 — Remaining content** | ✅ **DONE.** Phases 2–4: 18 further topics, 75 further question types. **All 121 types authored, 364 problems, 310 hours, validation green.** | — |
| **M7 — Polish** | Mock mode ✅, a11y pass ✅ (skip link, live region, sr-only table headers, labelled status/toggle controls, text alternatives for bars and heatmap, 24px+ touch targets), responsive QA ✅ (375 / 768 / desktop, no horizontal scroll). cheatsheet export ✅ (all 121 signals, print/PDF, optional templates, Google-heavy and unsolved-only filters). command palette ✅ (Ctrl/⌘K over topics, patterns, problems by LC number, and actions). **M7 complete.** | 2–3 days |
| **M8 — System Design track** | ✅ **DONE.** 18 modules, 66 h: the 45-minute method (7 timed steps), 9 concept modules, 8 worked case studies. 54 defended tradeoffs, 82 figures. Own schema + build-time gate; own stage ladder; worked designs hidden until revealed. **Scheduled after June 2027 — do not start it before the DSA round.** | later (post-Jun 2027) |

**Critical path is content, not code.** The app is roughly two weeks of building; the curated, pattern-tagged 450-problem corpus is the expensive part — and the part worth doing properly.

---

## 10. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Building the app becomes procrastination from doing DSA** | Fatal to the actual goal | Timebox M1–M5 to ~2 weeks. Ship with only Phase 0–1 content and *start studying*. Backfill content while already using it. |
| Motivation decay after week 3 | Product fails silently | Streak freezes, one-decision daily session, honest projected-readiness date, visible wins in week 1 |
| 310 hr in 35 weeks (~8.9 hr/wk) has ~2 weeks of slack | Miss June 2027 | Roadmap states required weekly hours and recalculates on every slip. Better to see it in November than in May. If slip exceeds 3 weeks, cut Phase 4 segment-tree/math down to awareness-level — they are the lowest-yield hours for a Google loop. |
| C++ + Java doubles template authoring | Content slips | C++ first, Java backfilled per phase; a missing Java template never blocks a study day |
| LeetCode sync breaks | Feature rot | Manual is always source of truth; sync is decoration |
| Content drifts into a generic problem list | Loses the entire differentiator | Schema validation enforces ≥1 pattern tag and a one-sentence insight on every problem, at build time |
| Scope creep into a LeetCode clone | Never ships | §5.4 out-of-scope list is binding |

---

## 11. Resolved Questions

All five answered — see **Locked decisions** at the top.

One consequence worth naming: **C++ *and* Java roughly doubles template authoring cost** (~50 patterns × 2 languages). It does not change the problem corpus or the app. Accepted, with the constraint that C++ templates are authored first and Java is backfilled per phase — so a missing Java template never blocks studying.

Remaining thing to decide later, not now: whether the System Design track starts Feb 2027 in parallel (risks the June DSA date) or after June. Default assumption: **after**.

---

## 12. Recommendation

Approve scope as written, answer the five open questions, then proceed:
`M1 design system` → `M2 content schema + Phase 0–1` → `M3–M5 app` → **start studying at ~week 2** → backfill Phases 2–4 content while using the tool daily.

The highest-leverage decision in this document is §4.1: **the pattern layer is the product.** A pretty problem list is a worse LeetCode. A pretty *pattern map* that tells you which of 50 techniques a new problem is asking for — that is what moves someone from "I do shit at trees" to Google-ready.
