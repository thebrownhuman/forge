import { Injectable, computed, inject } from '@angular/core';
import { START_DATE, TARGET_DATE } from '../../content/dsa';
import { ContentService } from './content.service';
import { ProgressService, addDays, dayDiff, today } from './progress.service';

export interface Roadmap {
  startDate: string;
  targetDate: string;
  totalHours: number;
  hoursDone: number;
  hoursLeft: number;
  /** Weeks remaining until the target date. Floors at a fraction, never zero. */
  weeksLeft: number;
  /** Hours per week needed from here to land on the target. */
  requiredPace: number;
  /** Hours per week actually achieved over the last 28 days. */
  actualPace: number;
  /** Hours the original schedule says should be done by today. */
  expectedHours: number;
  /** Positive = ahead of schedule, in hours. */
  driftHours: number;
  /** Projected finish at the current pace. Null until the pace means something. */
  projectedFinish: string | null;
  started: boolean;
  daysToStart: number;
}

const WINDOW_DAYS = 28;
/** Hours per week below which a projection is noise. */
const MIN_PACE_TO_PROJECT = 2;

@Injectable({ providedIn: 'root' })
export class RoadmapService {
  private readonly content = inject(ContentService);
  private readonly progress = inject(ProgressService);

  /** Hours a single problem is worth: its topic's hours split across its problems. */
  private readonly hoursPerProblem = computed(() => {
    const map = new Map<number, number>();
    for (const node of this.content.atlas) {
      if (node.lcs.length === 0) continue;
      const each = node.estHours / node.lcs.length;
      for (const lc of node.lcs) map.set(lc, each);
    }
    return map;
  });

  readonly roadmap = computed<Roadmap>(() => {
    const perProblem = this.hoursPerProblem();
    const state = this.progress.snapshot();
    const now = today();

    const totalHours = this.content.atlas.reduce((n, t) => n + t.estHours, 0);

    let hoursDone = 0;
    let recentHours = 0;
    const windowStart = addDays(now, -WINDOW_DAYS);

    for (const [lc, entry] of Object.entries(state.problems)) {
      if (entry.status !== 'solved' && entry.status !== 'mastered') continue;
      const worth = perProblem.get(Number(lc)) ?? 0;
      hoursDone += worth;
      if (entry.at >= windowStart) recentHours += worth;
    }

    const daysToStart = dayDiff(now, START_DATE);
    const daysLeft = Math.max(1, dayDiff(now, TARGET_DATE));
    const weeksLeft = daysLeft / 7;
    const hoursLeft = Math.max(0, totalHours - hoursDone);

    const elapsed = dayDiff(START_DATE, now);
    const planSpan = dayDiff(START_DATE, TARGET_DATE);
    const expectedHours =
      elapsed <= 0 ? 0 : Math.min(totalHours, (totalHours * elapsed) / planSpan);

    const actualPace = (recentHours / WINDOW_DAYS) * 7;
    // A single problem in four weeks projects a finish in 2059. That is arithmetic,
    // not information — withhold the projection until the pace is worth extrapolating.
    const projectedFinish =
      actualPace >= MIN_PACE_TO_PROJECT
        ? addDays(now, Math.ceil((hoursLeft / actualPace) * 7))
        : null;

    return {
      startDate: START_DATE,
      targetDate: TARGET_DATE,
      totalHours,
      hoursDone,
      hoursLeft,
      weeksLeft,
      requiredPace: hoursLeft / weeksLeft,
      actualPace,
      expectedHours,
      driftHours: hoursDone - expectedHours,
      projectedFinish,
      started: daysToStart <= 0,
      daysToStart,
    };
  });
}
