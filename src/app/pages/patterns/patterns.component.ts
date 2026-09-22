import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { ProgressService } from '../../core/progress.service';

interface Row {
  topicId: string;
  topicName: string;
  phase: number;
  typeId: string;
  name: string;
  signal: string;
  time: string;
  googleHeavy: boolean;
  lcs: number[];
  haystack: string;
}

@Component({
  selector: 'fg-patterns',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="head">
      <h1>Patterns</h1>
      <p class="sub">
        Every question type in one list. Read a problem prompt, scan the signals, find the technique it wants.
        This page is the point of Forge.
      </p>
    </section>

    <div class="controls">
      <input
        type="search"
        placeholder="Search a signal — &quot;contiguous&quot;, &quot;kth largest&quot;, &quot;cycle&quot;…"
        [value]="query()"
        (input)="query.set($any($event.target).value)"
        aria-label="Search patterns"
      />
      <button
        type="button"
        [class.on]="googleOnly()"
        [attr.aria-pressed]="googleOnly()"
        (click)="googleOnly.set(!googleOnly())"
      >Google-heavy</button>
      <span class="n" role="status" aria-live="polite">{{ rows().length }} of {{ all.length }}</span>
      <a class="sheet-link" routerLink="/cheatsheet">Printable cheatsheet</a>
    </div>

    @for (row of rows(); track row.typeId) {
      <a class="row" [routerLink]="['/topic', row.topicId]">
        <div class="l">
          <h3>{{ row.name }}</h3>
          <p class="sig">{{ row.signal }}</p>
        </div>
        <div class="r">
          <span class="topic">{{ row.topicName }}</span>
          <span class="mono cx">{{ row.time }}</span>
          @if (row.googleHeavy) { <span class="tag">Google</span> }
          <span class="mono done">{{ solved(row.lcs) }}/{{ row.lcs.length }}</span>
        </div>
      </a>
    } @empty {
      <p class="none">Nothing matches that. Try a word from the problem statement, not the algorithm name.</p>
    }
  `,
  styles: [
    `
      .head { margin-bottom: var(--space-5); }
      h1 { font-size: 32px; margin: 0 0 var(--space-2); letter-spacing: -0.02em; }
      .sub { margin: 0; color: var(--ink-muted); font-size: 14px; max-width: 72ch; }

      .controls { display: flex; gap: var(--space-3); align-items: center; margin-bottom: var(--space-5); flex-wrap: wrap; }
      input {
        flex: 1 1 320px;
        font: inherit;
        font-size: 14px;
        padding: var(--space-2) var(--space-3);
        border: 1px solid var(--border-strong);
        border-radius: var(--radius-sm);
        background: var(--surface);
        color: var(--ink);
      }
      .controls button {
        border: 1px solid var(--border-strong);
        background: var(--surface);
        color: var(--ink-muted);
        border-radius: var(--radius-sm);
        padding: var(--space-2) var(--space-3);
        font-size: 13px;
      }
      .controls button.on { background: var(--primary); border-color: var(--primary); color: #fff; }
      .n { font-size: 12px; color: var(--ink-muted); font-family: var(--font-mono); }
      .sheet-link { font-size: 13px; margin-left: auto; }

      .row {
        display: flex;
        gap: var(--space-5);
        align-items: flex-start;
        padding: var(--space-4);
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        margin-bottom: var(--space-2);
        color: var(--ink);
      }
      .row:hover { text-decoration: none; border-color: var(--border-strong); box-shadow: var(--shadow-sm); }

      .l { flex: 1; }
      h3 { margin: 0 0 var(--space-1); font-size: 15px; font-weight: 600; }
      .sig { margin: 0; font-size: 13px; color: var(--ink-muted); max-width: 80ch; }

      .r { display: flex; align-items: center; gap: var(--space-3); flex-shrink: 0; }
      .topic { font-size: 12px; color: var(--ink-muted); }
      .cx, .done { font-size: 12px; color: var(--ink-muted); }
      .tag {
        font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
        color: var(--primary); background: var(--primary-soft); padding: 2px 8px; border-radius: 999px;
      }

      .none { color: var(--ink-muted); font-size: 14px; }

      @media (max-width: 720px) {
        .row { flex-direction: column; gap: var(--space-2); }
        .r { flex-wrap: wrap; }
      }
    `,
  ],
})
export class PatternsComponent {
  private readonly content = inject(ContentService);
  private readonly progress = inject(ProgressService);

  readonly query = signal('');
  readonly googleOnly = signal(false);

  readonly all: Row[] = this.content.atlas
    .filter((node) => node.authored)
    .flatMap((node) => {
      const topic = this.content.topic(node.id);
      if (!topic) return [];
      return topic.questionTypes.map<Row>((type) => ({
        topicId: topic.id,
        topicName: topic.name,
        phase: topic.phase,
        typeId: `${topic.id}/${type.id}`,
        name: type.name,
        signal: type.signal,
        time: type.time,
        googleHeavy: type.googleHeavy === true,
        lcs: this.content.typeProblems(type).map((p) => p.lc),
        haystack: `${type.name} ${type.signal} ${topic.name}`.toLowerCase(),
      }));
    });

  readonly rows = computed(() => {
    const q = this.query().trim().toLowerCase();
    const google = this.googleOnly();
    return this.all.filter(
      (row) => (!google || row.googleHeavy) && (q === '' || row.haystack.includes(q)),
    );
  });

  solved(lcs: number[]): number {
    return this.progress.topicSolved(lcs);
  }
}
