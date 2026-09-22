import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { ProgressService, STATUS_LABEL, addDays, today, type Status } from '../../core/progress.service';
import { RoadmapService } from '../../core/roadmap.service';

const HEATMAP_DAYS = 84;

interface Cell {
  date: string;
  count: number;
  frozen: boolean;
}

@Component({
  selector: 'fg-progress',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="head">
      <h1>Progress</h1>
      <p class="sub">
        {{ round(r().hoursDone) }} of {{ r().totalHours }} hours · target {{ r().targetDate }}.
        @if (!r().started) {
          The schedule has not started yet, so there is no drift to report.
        } @else if (r().driftHours >= 0) {
          {{ round(r().driftHours) }}h ahead of the plan.
        } @else {
          {{ round(-r().driftHours) }}h behind the plan.
        }
      </p>
    </section>

    <div class="strip">
      <div class="stat">
        <span class="k">{{ round(r().requiredPace) }}h</span>
        <span class="l">needed per week</span>
      </div>
      <div class="stat">
        <span class="k" [class.warn]="r().actualPace < r().requiredPace && r().started">{{ round(r().actualPace) }}h</span>
        <span class="l">actual, last 4 weeks</span>
      </div>
      <div class="stat">
        <span class="k">{{ round(r().weeksLeft) }}</span>
        <span class="l">weeks left</span>
      </div>
      <div class="stat">
        <span class="k">{{ r().projectedFinish ?? 'n/a' }}</span>
        <span class="l">
          @if (r().projectedFinish) { projected finish } @else { projected finish — pace too low to extrapolate }
        </span>
      </div>
    </div>

    <section class="block">
      <h2>Plan vs actual</h2>
      <div class="track" role="img" [attr.aria-label]="round(r().hoursDone) + ' hours done of ' + r().totalHours">
        <span class="done" [style.width.%]="pct(r().hoursDone, r().totalHours)"></span>
        @if (r().started) {
          <span class="marker" [style.left.%]="pct(r().expectedHours, r().totalHours)"></span>
        }
      </div>
      <p class="hint">
        The bar is what you have done. The notch is where the 1 Oct 2026 → 1 Jun 2027 schedule says you should be.
      </p>
    </section>

    <section class="block">
      <h2>Last 12 weeks</h2>
      <div class="heat" role="img" [attr.aria-label]="heatmapLabel()">
        @for (cell of heatmap(); track cell.date) {
          <span
            class="cell"
            aria-hidden="true"
            [class.frozen]="cell.frozen"
            [attr.data-level]="level(cell.count)"
            [title]="cell.date + ': ' + (cell.frozen && cell.count === 0 ? 'freeze spent' : cell.count + ' moved')"
          ></span>
        }
      </div>
      <p class="hint">
        Streak {{ progress.streak() }} · longest {{ progress.longestStreak() }} · {{ progress.freezesAvailable() }} freezes held.
        A freeze is earned every 7 active days and spent automatically to cover a missed day.
      </p>
    </section>

    <section class="block">
      <h2>By phase</h2>
      @for (row of phaseRows(); track row.id) {
        <div class="phase">
          <span class="name">{{ row.id }} · {{ row.name }}</span>
          <div
            class="track slim"
            role="img"
            [attr.aria-label]="row.name + ': ' + row.solved + ' of ' + row.total + ' problems solved'"
          >
            <span class="done" [style.width.%]="row.pct"></span>
          </div>
          <span class="mono n">{{ row.solved }}/{{ row.total }}</span>
        </div>
      }
    </section>

    <section class="block">
      <h2>Status mix</h2>
      <div class="mix">
        @for (row of statusRows(); track row.status) {
          <div class="chip" [attr.data-status]="row.status">
            <span class="mono">{{ row.count }}</span> {{ row.label }}
          </div>
        }
      </div>
    </section>

    <section class="block">
      <h2>Weakest topics</h2>
      <p class="hint">Ranked by problems you marked struggled. These are what the review queue keeps returning.</p>
      @for (row of weakest(); track row.id) {
        <div class="weak">
          <a [routerLink]="['/topic', row.id]">{{ row.name }}</a>
          <span class="mono">{{ row.struggled }} struggled</span>
        </div>
      } @empty {
        <p class="hint">Nothing marked struggled yet. Mark honestly — that column is what drives review.</p>
      }
    </section>
  `,
  styles: [
    `
      .head { margin-bottom: var(--space-5); }
      h1 { font-size: 32px; margin: 0 0 var(--space-2); letter-spacing: -0.02em; }
      .sub { margin: 0; color: var(--ink-muted); font-size: 14px; max-width: 72ch; }

      .strip { display: flex; gap: var(--space-3); margin-bottom: var(--space-6); flex-wrap: wrap; }
      .stat { flex: 1 1 150px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-4); }
      .k { display: block; font-size: 24px; font-weight: 600; font-family: var(--font-mono); letter-spacing: -0.02em; }
      .k.warn { color: var(--hard); }
      .l { font-size: 12px; color: var(--ink-muted); }

      .block { margin-bottom: var(--space-7); }
      h2 { font-size: 18px; margin: 0 0 var(--space-3); }
      .hint { margin: var(--space-2) 0 0; font-size: 13px; color: var(--ink-muted); max-width: 72ch; }

      .track {
        position: relative;
        height: 12px;
        background: var(--surface-sunken);
        border: 1px solid var(--border);
        border-radius: 999px;
        overflow: hidden;
      }
      .track.slim { height: 8px; flex: 1; }
      .track .done { display: block; height: 100%; background: var(--primary); }
      .marker {
        position: absolute; top: -3px; bottom: -3px; width: 2px;
        background: var(--ink); opacity: 0.55;
      }

      .heat { display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px; max-width: 420px; }
      .cell {
        aspect-ratio: 1;
        border-radius: 2px;
        background: var(--surface-sunken);
        border: 1px solid var(--border);
      }
      .cell[data-level='1'] { background: color-mix(in srgb, var(--primary) 30%, var(--surface)); }
      .cell[data-level='2'] { background: color-mix(in srgb, var(--primary) 60%, var(--surface)); }
      .cell[data-level='3'] { background: var(--primary); border-color: var(--primary); }
      .cell.frozen { background: color-mix(in srgb, var(--streak-fill) 40%, var(--surface)); border-color: var(--streak-fill); }

      .phase { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2); }
      .name { font-size: 13px; width: 190px; flex-shrink: 0; }
      .n { font-size: 12px; color: var(--ink-muted); width: 64px; text-align: right; }

      .mix { display: flex; gap: var(--space-2); flex-wrap: wrap; }
      .chip {
        font-size: 13px;
        padding: var(--space-2) var(--space-3);
        border: 1px solid var(--border-strong);
        border-radius: 999px;
        color: var(--ink-muted);
      }
      .chip[data-status='solved'] { border-color: var(--easy); color: var(--easy); }
      .chip[data-status='mastered'] { background: var(--easy); border-color: var(--easy); color: #fff; }
      .chip[data-status='struggled'] { border-color: var(--hard); color: var(--hard); }
      .chip[data-status='attempted'] { border-color: var(--medium); color: var(--medium); }

      .weak {
        display: flex;
        justify-content: space-between;
        padding: var(--space-2) var(--space-3);
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        margin-bottom: var(--space-2);
        font-size: 14px;
      }
      .weak span { font-size: 12px; color: var(--hard); }

      @media (max-width: 640px) {
        .name { width: 120px; }
        .heat { max-width: none; }
      }
    `,
  ],
})
export class ProgressComponent {
  readonly progress = inject(ProgressService);
  private readonly content = inject(ContentService);
  private readonly roadmap = inject(RoadmapService);

  readonly r = this.roadmap.roadmap;

  readonly heatmap = computed<Cell[]>(() => {
    const counts = this.progress.dailyCounts();
    const frozen = new Set(this.progress.snapshot().freezesUsed);
    const end = today();
    const cells: Cell[] = [];
    for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
      const date = addDays(end, -i);
      cells.push({ date, count: counts[date] ?? 0, frozen: frozen.has(date) });
    }
    return cells;
  });

  readonly phaseRows = computed(() =>
    this.content.phases.map((phase) => {
      const nodes = this.content.atlas.filter((n) => n.phase === phase.id);
      const lcs = nodes.flatMap((n) => n.lcs);
      const solved = this.progress.topicSolved(lcs);
      return {
        id: phase.id,
        name: phase.name,
        solved,
        total: lcs.length,
        pct: lcs.length === 0 ? 0 : Math.round((solved / lcs.length) * 100),
      };
    }),
  );

  readonly statusRows = computed(() => {
    const counts: Record<Status, number> = {
      unseen: 0,
      attempted: 0,
      struggled: 0,
      solved: 0,
      mastered: 0,
    };
    for (const e of Object.values(this.progress.snapshot().problems)) counts[e.status]++;
    counts.unseen = this.content.ordered.length - Object.keys(this.progress.snapshot().problems).length;
    return (Object.keys(counts) as Status[]).map((status) => ({
      status,
      label: STATUS_LABEL[status],
      count: counts[status],
    }));
  });

  readonly weakest = computed(() => {
    const tally = new Map<string, { id: string; name: string; struggled: number }>();
    for (const [lc, entry] of Object.entries(this.progress.snapshot().problems)) {
      if (entry.status !== 'struggled') continue;
      const located = this.content.located(Number(lc));
      if (!located) continue;
      const row = tally.get(located.topicId) ?? {
        id: located.topicId,
        name: located.topicName,
        struggled: 0,
      };
      row.struggled++;
      tally.set(located.topicId, row);
    }
    return [...tally.values()].sort((a, b) => b.struggled - a.struggled).slice(0, 5);
  });

  readonly heatmapLabel = computed(() => {
    const cells = this.heatmap();
    const active = cells.filter((c) => c.count > 0).length;
    const frozen = cells.filter((c) => c.frozen).length;
    const moved = cells.reduce((n, c) => n + c.count, 0);
    return `Activity over the last 12 weeks: ${moved} problems moved across ${active} active days, ${frozen} days covered by a freeze.`;
  });

  level(count: number): number {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    return 3;
  }

  pct(value: number, total: number): number {
    return total === 0 ? 0 : Math.min(100, Math.round((value / total) * 100));
  }

  round(n: number): number {
    return Math.round(n * 10) / 10;
  }
}
