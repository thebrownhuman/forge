import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../core/session.service';
import { ProgressService, STATUS_LABEL, type Status } from '../../core/progress.service';
import { RoadmapService } from '../../core/roadmap.service';

@Component({
  selector: 'fg-today',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="head">
      <div>
        <h1>Today</h1>
        <p class="sub">
          @if (!roadmap().started) {
            Phase 0 opens {{ roadmap().startDate }} — {{ roadmap().daysToStart }} days out. Nothing stops you starting early.
          } @else if (plan().slots.length === 0) {
            Nothing due and nothing left unstarted. Pick a topic from the Atlas and go deeper.
          } @else {
            {{ plan().slots.length }} problems · {{ plan().minutes }} of {{ plan().budget }} minutes.
            @if (focus(); as f) { Pushing into <a [routerLink]="['/topic', f.id]">{{ f.name }}</a>. }
          }
        </p>
      </div>

      <label class="budget">
        <span>Daily minutes</span>
        <input
          type="number"
          min="15"
          max="240"
          step="15"
          [value]="progress.dailyMinutes()"
          (change)="setBudget($any($event.target).value)"
        />
      </label>
    </section>

    <div class="strip">
      <div class="stat">
        <span class="k">{{ progress.streak() }}</span>
        <span class="l">day streak</span>
      </div>
      <div class="stat">
        <span class="k">{{ session.doneToday() }}</span>
        <span class="l">moved today</span>
      </div>
      <div class="stat">
        <span class="k">{{ progress.dueForReview().length }}</span>
        <span class="l">due for review</span>
      </div>
      <div class="stat">
        <span class="k freeze">{{ progress.freezesAvailable() }}</span>
        <span class="l">freezes held</span>
      </div>
    </div>

    @if (reviews().length) {
      <section class="block" aria-labelledby="review-heading">
        <h2 id="review-heading">Review first</h2>
        <p class="hint">
          These came back because the interval expired. Re-derive them; do not re-read the solution.
        </p>
        @for (slot of reviews(); track slot.problem.lc) {
          <div class="slot review">
            <div class="l">
              <a [href]="lcUrl(slot.problem.slug)" target="_blank" rel="noopener">
                {{ slot.problem.lc }}. {{ slot.problem.title }}
              </a>
              <p class="sig">{{ slot.typeName }} — {{ slot.signal }}</p>
            </div>
            <div class="r">
              <span class="overdue mono">{{ overdueLabel(slot.due) }}</span>
              <span class="diff mono" [class]="slot.problem.difficulty">{{ slot.problem.difficulty }}</span>
              <button
                type="button"
                [attr.data-status]="status(slot.problem.lc)"
                [attr.aria-label]="slot.problem.title + ' — status ' + label(slot.problem.lc) + '. Activate to change.'"
                (click)="progress.advance(slot.problem.lc)"
              >
                {{ label(slot.problem.lc) }}
              </button>
            </div>
          </div>
        }
        @if (plan().reviewsDeferred > 0) {
          <p class="hint">
            {{ plan().reviewsDeferred }} more {{ plan().reviewsDeferred === 1 ? 'review is' : 'reviews are' }} waiting —
            they carry to tomorrow rather than eating the hour.
          </p>
        }
      </section>
    }

    @if (fresh().length) {
      <section class="block" aria-labelledby="new-heading">
        <h2 id="new-heading">New ground</h2>
        <p class="hint">In atlas order. The taught problem of a type comes before its practice pair.</p>
        @for (slot of fresh(); track slot.problem.lc) {
          <div class="slot">
            <div class="l">
              <a [href]="lcUrl(slot.problem.slug)" target="_blank" rel="noopener">
                {{ slot.problem.lc }}. {{ slot.problem.title }}
              </a>
              <p class="sig">
                <a [routerLink]="['/topic', slot.topicId]">{{ slot.topicName }}</a> ·
                {{ slot.typeName }} · <span class="role">{{ slot.problem.role }}</span>
              </p>
            </div>
            <div class="r">
              <span class="mins mono">{{ slot.problem.estMinutes }}m</span>
              <span class="diff mono" [class]="slot.problem.difficulty">{{ slot.problem.difficulty }}</span>
              <button
                type="button"
                [attr.data-status]="status(slot.problem.lc)"
                [attr.aria-label]="slot.problem.title + ' — status ' + label(slot.problem.lc) + '. Activate to change.'"
                (click)="progress.advance(slot.problem.lc)"
              >
                {{ label(slot.problem.lc) }}
              </button>
            </div>
          </div>
        }
      </section>
    }
  `,
  styles: [
    `
      .head { display: flex; align-items: flex-start; gap: var(--space-5); margin-bottom: var(--space-5); }
      h1 { font-size: 32px; margin: 0 0 var(--space-2); letter-spacing: -0.02em; }
      .sub { margin: 0; color: var(--ink-muted); font-size: 14px; max-width: 70ch; }

      .budget { margin-left: auto; display: flex; flex-direction: column; gap: var(--space-1); font-size: 12px; color: var(--ink-muted); }
      .budget input {
        font: inherit;
        font-family: var(--font-mono);
        width: 84px;
        padding: var(--space-1) var(--space-2);
        background: var(--surface);
        color: var(--ink);
        border: 1px solid var(--border-strong);
        border-radius: var(--radius-sm);
      }

      .strip { display: flex; gap: var(--space-3); margin-bottom: var(--space-6); flex-wrap: wrap; }
      .stat {
        flex: 1 1 120px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: var(--space-4);
      }
      .k { display: block; font-size: 26px; font-weight: 600; font-family: var(--font-mono); letter-spacing: -0.02em; }
      .k.freeze { color: var(--streak); }
      .l { font-size: 12px; color: var(--ink-muted); }

      .block { margin-bottom: var(--space-7); }
      h2 { font-size: 18px; margin: 0 0 var(--space-1); }
      .hint { margin: 0 0 var(--space-3); font-size: 13px; color: var(--ink-muted); }

      .slot {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: var(--space-3) var(--space-4);
        margin-bottom: var(--space-2);
      }
      .slot.review { border-left: 3px solid var(--streak-fill); }
      .slot .l { flex: 1; min-width: 0; }
      .slot .l > a { font-weight: 500; font-size: 15px; }
      .sig { margin: var(--space-1) 0 0; font-size: 12px; color: var(--ink-muted); }
      .role { text-transform: uppercase; letter-spacing: 0.04em; font-size: 11px; }

      .r { display: flex; align-items: center; gap: var(--space-3); flex-shrink: 0; }
      .overdue { font-size: 12px; color: var(--streak); }
      .mins { font-size: 12px; color: var(--ink-muted); }
      .diff { font-size: 12px; font-weight: 600; text-transform: capitalize; width: 60px; }
      .diff.easy { color: var(--easy); }
      .diff.medium { color: var(--medium); }
      .diff.hard { color: var(--hard); }

      .r button {
        width: 110px;
        border: 1px solid var(--border-strong);
        background: var(--surface);
        color: var(--ink-muted);
        border-radius: var(--radius-sm);
        padding: var(--space-1) var(--space-2);
        font-size: 12px;
      }
      .r button[data-status='solved'] { border-color: var(--easy); color: var(--easy); }
      .r button[data-status='mastered'] { background: var(--easy); border-color: var(--easy); color: #fff; }
      .r button[data-status='struggled'] { border-color: var(--hard); color: var(--hard); }
      .r button[data-status='attempted'] { border-color: var(--medium); color: var(--medium); }

      @media (pointer: coarse) {
        .slot .l > a, .sig a { display: inline-block; padding-block: var(--space-1); }
      }

      @media (max-width: 720px) {
        .head { flex-direction: column; }
        .budget { margin-left: 0; }
        .slot { flex-direction: column; align-items: stretch; }
        .r { justify-content: space-between; }
      }
    `,
  ],
})
export class TodayComponent {
  readonly progress = inject(ProgressService);
  readonly session = inject(SessionService);
  private readonly roadmapService = inject(RoadmapService);

  readonly plan = this.session.plan;
  readonly focus = this.session.focusTopic;
  readonly roadmap = this.roadmapService.roadmap;

  readonly reviews = computed(() => this.plan().slots.filter((s) => s.kind === 'review'));
  readonly fresh = computed(() => this.plan().slots.filter((s) => s.kind === 'new'));

  readonly budget = signal(this.progress.dailyMinutes());

  setBudget(value: string): void {
    const n = Number(value);
    if (Number.isFinite(n)) this.progress.setDailyMinutes(n);
  }

  lcUrl(slug: string): string {
    return `https://leetcode.com/problems/${slug}/`;
  }

  status(lc: number): Status {
    return this.progress.statusOf(lc);
  }

  label(lc: number): string {
    return STATUS_LABEL[this.status(lc)];
  }

  overdueLabel(due: string | null): string {
    if (due === null) return '';
    const days = Math.round((Date.now() - Date.parse(`${due}T00:00:00`)) / 86_400_000);
    if (days <= 0) return 'due today';
    return `${days}d overdue`;
  }
}
