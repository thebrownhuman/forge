import { Injectable, computed, inject } from '@angular/core';
import { ContentService, type Located } from './content.service';
import { ProgressService, type Status } from './progress.service';

export type SlotKind = 'review' | 'new';

export interface Slot extends Located {
  kind: SlotKind;
  status: Status;
  due: string | null;
}

export interface Plan {
  slots: Slot[];
  minutes: number;
  budget: number;
  /** Reviews that did not fit today. */
  reviewsDeferred: number;
}

/** Reviews never eat the whole hour — new ground still has to be covered. */
const REVIEW_SHARE = 0.4;

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly content = inject(ContentService);
  private readonly progress = inject(ProgressService);

  readonly plan = computed<Plan>(() => {
    const budget = this.progress.dailyMinutes();
    const reviewBudget = Math.round(budget * REVIEW_SHARE);

    const due = this.progress
      .dueForReview()
      .map((lc) => this.content.located(lc))
      .filter((l): l is Located => l !== undefined);

    const slots: Slot[] = [];
    let minutes = 0;
    let reviewMinutes = 0;
    let deferred = 0;

    for (const l of due) {
      // A review is re-derivation, not a first solve: budget it at half the time.
      const cost = Math.ceil(l.problem.estMinutes / 2);
      if (reviewMinutes + cost > reviewBudget && slots.length > 0) {
        deferred++;
        continue;
      }
      slots.push({ ...l, kind: 'review', status: this.progress.statusOf(l.problem.lc), due: this.progress.dueOf(l.problem.lc) });
      reviewMinutes += cost;
      minutes += cost;
    }

    for (const l of this.content.ordered) {
      if (minutes >= budget) break;
      if (this.progress.statusOf(l.problem.lc) !== 'unseen') continue;
      slots.push({ ...l, kind: 'new', status: 'unseen', due: null });
      minutes += l.problem.estMinutes;
    }

    return { slots, minutes, budget, reviewsDeferred: deferred };
  });

  /** The topic the plan is currently pushing into. Drives the session heading. */
  readonly focusTopic = computed(() => {
    const next = this.plan().slots.find((s) => s.kind === 'new');
    return next ? { id: next.topicId, name: next.topicName } : null;
  });

  readonly doneToday = computed(() => {
    const day = this.progress.dailyCounts();
    return day[todayKey()] ?? 0;
  });
}

function todayKey(): string {
  return new Date().toLocaleDateString('en-CA');
}
