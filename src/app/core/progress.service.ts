import { Injectable, computed, signal } from '@angular/core';
import { kvGet, kvSet } from './db';

export type Status = 'unseen' | 'attempted' | 'struggled' | 'solved' | 'mastered';

export const STATUS_ORDER: Status[] = ['unseen', 'attempted', 'struggled', 'solved', 'mastered'];

export const STATUS_LABEL: Record<Status, string> = {
  unseen: 'Not started',
  attempted: 'Attempted',
  struggled: 'Struggled',
  solved: 'Solved',
  mastered: 'Mastered',
};

/**
 * Days until a problem comes back. Deliberately coarse — the point is that the
 * thing you fumbled returns this week and the thing you nailed returns next month.
 * `reps` stretches the interval each time you clear it without struggling.
 */
const INTERVAL_DAYS: Record<Status, number | null> = {
  unseen: null,
  attempted: 1,
  struggled: 2,
  solved: 7,
  mastered: 21,
};

export interface Entry {
  status: Status;
  /** ISO date of the last status change. */
  at: string;
  /** ISO date this problem should resurface. */
  due: string | null;
  /** Consecutive clean passes. Stretches the interval; a struggle resets it. */
  reps: number;
}

/** A scored sitting. Kept per set so a re-run overwrites rather than accumulates. */
export interface MockResult {
  score: number;
  at: string;
  /** Rubric item ids that were awarded. */
  awarded: string[];
}

/** How far a system design module has been taken. Its own ladder, not the DSA one. */
export type SdStage = 'unseen' | 'read' | 'outlined' | 'deep' | 'mastered';

export const SD_STAGE_ORDER: SdStage[] = ['unseen', 'read', 'outlined', 'deep', 'mastered'];

export const SD_STAGE_LABEL: Record<SdStage, string> = {
  unseen: 'Not started',
  read: 'Read',
  outlined: 'Outlined',
  deep: 'Deep-dived',
  mastered: 'Can run it cold',
};

export interface ProgressState {
  version: 2;
  /** LeetCode number → entry. LC numbers are the stable key across topics. */
  problems: Record<number, Entry>;
  /** ISO dates on which at least one problem moved. */
  activeDays: string[];
  /** ISO dates covered by a spent streak freeze. */
  freezesUsed: string[];
  /** Minutes the user intends to study per day. */
  dailyMinutes: number;
  /** Mock set id → last scored result. */
  mocks: Record<string, MockResult>;
  /** System design module id → stage plus the date it last moved. */
  sd: Record<string, { stage: SdStage; at: string }>;
}

const KEY = 'progress.v1';
const MAX_HELD_FREEZES = 3;
const DAYS_PER_FREEZE = 7;
/** A freeze covers a slip, not a disappearance. Longer gaps end the streak. */
const MAX_GAP_TO_FREEZE = 2;

const EMPTY: ProgressState = {
  version: 2,
  problems: {},
  activeDays: [],
  freezesUsed: [],
  dailyMinutes: 60,
  mocks: {},
  sd: {},
};

export function today(): string {
  return toIso(new Date());
}

export function toIso(d: Date): string {
  return d.toLocaleDateString('en-CA');
}

export function dayDiff(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toIso(d);
}

function isDone(status: Status): boolean {
  return status === 'solved' || status === 'mastered';
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly state = signal<ProgressState>(EMPTY);
  readonly loaded = signal(false);

  readonly snapshot = computed(() => this.state());
  readonly dailyMinutes = computed(() => this.state().dailyMinutes);

  readonly solvedCount = computed(
    () => Object.values(this.state().problems).filter((e) => isDone(e.status)).length,
  );

  /** Days that count toward the streak: worked, or covered by a spent freeze. */
  private readonly creditedDays = computed(() => {
    const s = this.state();
    return [...new Set([...s.activeDays, ...s.freezesUsed])].sort();
  });

  readonly streak = computed(() => {
    const days = [...this.creditedDays()].reverse();
    if (days.length === 0) return 0;
    // Today not being done yet does not cost you the streak until the day ends.
    if (dayDiff(days[0], today()) > 1) return 0;
    let run = 1;
    for (let i = 1; i < days.length; i++) {
      if (dayDiff(days[i], days[i - 1]) !== 1) break;
      run++;
    }
    return run;
  });

  readonly longestStreak = computed(() => {
    const days = this.creditedDays();
    let best = 0;
    let run = 0;
    for (let i = 0; i < days.length; i++) {
      run = i > 0 && dayDiff(days[i - 1], days[i]) === 1 ? run + 1 : 1;
      if (run > best) best = run;
    }
    return best;
  });

  readonly activeToday = computed(() => this.state().activeDays.includes(today()));

  readonly freezesAvailable = computed(() => {
    const s = this.state();
    const earned = Math.floor(s.activeDays.length / DAYS_PER_FREEZE);
    return Math.max(0, Math.min(MAX_HELD_FREEZES, earned - s.freezesUsed.length));
  });

  /** LeetCode numbers due for review today or overdue, oldest due first. */
  readonly dueForReview = computed(() => {
    const now = today();
    return Object.entries(this.state().problems)
      .filter(([, e]) => e.due !== null && e.due <= now)
      .sort((a, b) => (a[1].due ?? '').localeCompare(b[1].due ?? ''))
      .map(([lc]) => Number(lc));
  });

  async init(): Promise<void> {
    const stored = await kvGet<unknown>(KEY);
    this.state.set(migrate(stored));
    this.applyFreezes();
    this.loaded.set(true);
  }

  entry(lc: number): Entry | undefined {
    return this.state().problems[lc];
  }

  statusOf(lc: number): Status {
    return this.state().problems[lc]?.status ?? 'unseen';
  }

  dueOf(lc: number): string | null {
    return this.state().problems[lc]?.due ?? null;
  }

  isDone(lc: number): boolean {
    return isDone(this.statusOf(lc));
  }

  topicSolved(lcs: number[]): number {
    const p = this.state().problems;
    return lcs.filter((lc) => p[lc] !== undefined && isDone(p[lc].status)).length;
  }

  /** ISO date → number of problems moved that day. Drives the dashboard. */
  readonly dailyCounts = computed(() => {
    const counts: Record<string, number> = {};
    for (const e of Object.values(this.state().problems)) {
      counts[e.at] = (counts[e.at] ?? 0) + 1;
    }
    return counts;
  });

  setStatus(lc: number, status: Status): void {
    const current = this.state();
    const prev = current.problems[lc];
    const day = today();

    const reps = status === 'struggled' || status === 'attempted' ? 0 : (prev?.reps ?? 0) + 1;
    const base = INTERVAL_DAYS[status];
    // Each clean rep stretches the gap; the multiplier is capped so nothing
    // disappears for half a year before the interview.
    const interval = base === null ? null : Math.min(base * Math.max(1, reps), 45);

    const problems = {
      ...current.problems,
      [lc]: {
        status,
        at: day,
        due: interval === null ? null : addDays(day, interval),
        reps,
      } satisfies Entry,
    };

    if (status === 'unseen') delete problems[lc];

    const activeDays =
      status === 'unseen' || current.activeDays.includes(day)
        ? current.activeDays
        : [...current.activeDays, day];

    this.persist({ ...current, problems, activeDays });
  }

  /** Cycles a problem through the status ladder. One click per state change. */
  advance(lc: number): void {
    const i = STATUS_ORDER.indexOf(this.statusOf(lc));
    this.setStatus(lc, STATUS_ORDER[(i + 1) % STATUS_ORDER.length]);
  }

  mockResult(setId: string): MockResult | undefined {
    return this.state().mocks[setId];
  }

  readonly mocksRun = computed(() => Object.keys(this.state().mocks).length);

  saveMock(setId: string, score: number, awarded: string[]): void {
    const current = this.state();
    const day = today();
    this.persist({
      ...current,
      mocks: { ...current.mocks, [setId]: { score, at: day, awarded } },
      activeDays: current.activeDays.includes(day) ? current.activeDays : [...current.activeDays, day],
    });
  }

  sdStage(moduleId: string): SdStage {
    return this.state().sd[moduleId]?.stage ?? 'unseen';
  }

  readonly sdStarted = computed(() => Object.keys(this.state().sd).length);

  readonly sdMastered = computed(
    () => Object.values(this.state().sd).filter((e) => e.stage === 'mastered').length,
  );

  advanceSd(moduleId: string): void {
    const current = this.state();
    const i = SD_STAGE_ORDER.indexOf(this.sdStage(moduleId));
    const stage = SD_STAGE_ORDER[(i + 1) % SD_STAGE_ORDER.length];
    const day = today();

    const sd = { ...current.sd, [moduleId]: { stage, at: day } };
    if (stage === 'unseen') delete sd[moduleId];

    const activeDays =
      stage === 'unseen' || current.activeDays.includes(day)
        ? current.activeDays
        : [...current.activeDays, day];

    this.persist({ ...current, sd, activeDays });
  }

  setDailyMinutes(minutes: number): void {
    this.persist({ ...this.state(), dailyMinutes: Math.max(15, Math.min(240, minutes)) });
  }

  exportJson(): string {
    return JSON.stringify(this.state(), null, 2);
  }

  async importJson(raw: string): Promise<void> {
    this.persist(migrate(JSON.parse(raw)));
  }

  /**
   * Spends held freezes to cover missed days, so one bad day does not erase
   * six weeks. Runs once at load — a freeze is spent automatically or not at all.
   */
  private applyFreezes(): void {
    const s = this.state();
    const credited = this.creditedDays();
    if (credited.length === 0) return;

    const last = credited[credited.length - 1];
    const gap = dayDiff(last, today());
    if (gap <= 1 || gap > MAX_GAP_TO_FREEZE + 1) return;

    const missing: string[] = [];
    for (let i = 1; i < gap; i++) missing.push(addDays(last, i));
    if (missing.length > this.freezesAvailable()) return;

    this.persist({ ...s, freezesUsed: [...s.freezesUsed, ...missing] });
  }

  private persist(next: ProgressState): void {
    this.state.set(next);
    void kvSet(KEY, next);
  }
}

/** Reads both the v1 shape (bare status map) and v2. Never throws on a stranger. */
function migrate(raw: unknown): ProgressState {
  if (raw === null || typeof raw !== 'object') return EMPTY;
  const obj = raw as Partial<ProgressState> & { problems?: Record<string, unknown> };

  const problems: Record<number, Entry> = {};
  for (const [lc, value] of Object.entries(obj.problems ?? {})) {
    if (typeof value === 'string') {
      // v1: status only, no dates. Backdate to the earliest known active day.
      const status = value as Status;
      if (status === 'unseen') continue;
      const at = (obj.activeDays ?? [])[0] ?? today();
      const interval = INTERVAL_DAYS[status];
      problems[Number(lc)] = {
        status,
        at,
        due: interval === null ? null : addDays(at, interval),
        reps: isDone(status) ? 1 : 0,
      };
    } else if (value !== null && typeof value === 'object') {
      const e = value as Partial<Entry>;
      if (e.status === undefined || e.status === 'unseen') continue;
      problems[Number(lc)] = {
        status: e.status,
        at: e.at ?? today(),
        due: e.due ?? null,
        reps: e.reps ?? 0,
      };
    }
  }

  return {
    version: 2,
    problems,
    activeDays: [...new Set(obj.activeDays ?? [])].sort(),
    freezesUsed: [...new Set(obj.freezesUsed ?? [])].sort(),
    dailyMinutes: obj.dailyMinutes ?? 60,
    mocks: obj.mocks ?? {},
    sd: obj.sd ?? {},
  };
}
