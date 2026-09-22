import { Component, OnDestroy, computed, inject, input, signal } from '@angular/core';
import { ProgressService } from '../../core/progress.service';
import type { MockSet } from '../../../content/schema';

type Phase = 'idle' | 'running' | 'scoring';

@Component({
  selector: 'fg-mock-set',
  standalone: true,
  template: `
    <article class="set" [class.running]="phase() === 'running'">
      <header>
        <div>
          <h3>{{ set().name }}</h3>
          <p class="focus">{{ set().focus }}</p>
        </div>
        <div class="clock">
          <!-- aria-live is off deliberately: a countdown that announces every
               second is unusable. The stop button reports the outcome instead. -->
          <span
            class="time mono"
            role="timer"
            aria-live="off"
            [attr.aria-label]="'Time remaining ' + clock()"
            [class.low]="remaining() <= 300 && phase() === 'running'"
          >
            {{ clock() }}
          </span>
          @if (phase() === 'idle') {
            <button type="button" class="primary" (click)="start()">Start {{ set().minutes }}m</button>
          } @else if (phase() === 'running') {
            <button type="button" (click)="stop()">Stop and score</button>
          } @else {
            <button type="button" (click)="reset()">Reset</button>
          }
        </div>
      </header>

      @if (last(); as result) {
        <p class="last">
          Last run {{ result.at }} — scored <strong>{{ result.score }}</strong> / 100.
        </p>
      }

      <div class="problems">
        @for (p of set().problems; track p.lc) {
          <div class="problem">
            @if (phase() === 'idle') {
              <span class="hidden-title">Problem hidden until the clock starts</span>
            } @else {
              <a
                [href]="'https://leetcode.com/problems/' + p.slug + '/'"
                target="_blank"
                rel="noopener"
                [attr.aria-label]="p.lc + '. ' + p.title + ' — opens on LeetCode in a new tab'"
              >
                {{ p.lc }}. {{ p.title }}
              </a>
            }
            <span class="diff mono" [class]="p.difficulty">{{ p.difficulty }}</span>
            <span class="mins mono">{{ p.estMinutes }}m</span>
          </div>
        }
      </div>

      @if (phase() === 'scoring') {
        <section class="rubric">
          <h4>Score it before you look anything up</h4>
          @for (item of set().rubric; track item.id) {
            <label class="item" [class.on]="awarded().has(item.id)">
              <input
                type="checkbox"
                [checked]="awarded().has(item.id)"
                (change)="toggle(item.id)"
              />
              <span class="text">
                <span class="criterion">{{ item.criterion }} <span class="w mono">{{ item.weight }}</span></span>
                <span class="good">{{ item.whatGoodLooksLike }}</span>
              </span>
            </label>
          }

          <div class="total">
            <span
              class="score mono"
              role="status"
              aria-live="polite"
              [attr.aria-label]="'Current score ' + score() + ' out of 100'"
              [class.pass]="score() >= 75"
            >{{ score() }}</span>
            <span class="of" aria-hidden="true">/ 100</span>
            <p class="bar">{{ set().passBar }}</p>
            <button type="button" class="primary" (click)="save()">Save score</button>
          </div>
        </section>

        <details class="debrief">
          <summary>Debrief — what each problem actually wanted</summary>
          <div class="body">
            @for (p of set().problems; track p.lc) {
              <p><strong>{{ p.lc }}. {{ p.title }}</strong> — {{ p.insight }}</p>
            }
          </div>
        </details>
      }
    </article>
  `,
  styles: [
    `
      .set {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: var(--space-5);
        margin-bottom: var(--space-4);
      }
      .set.running { border-color: var(--primary); box-shadow: var(--shadow-md); }

      header { display: flex; gap: var(--space-5); align-items: flex-start; }
      h3 { margin: 0 0 var(--space-1); font-size: 17px; }
      .focus { margin: 0; font-size: 13px; color: var(--ink-muted); max-width: 70ch; }

      .clock { margin-left: auto; display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-2); }
      .time { font-size: 26px; font-weight: 600; letter-spacing: -0.02em; }
      .time.low { color: var(--hard); }

      button {
        border: 1px solid var(--border-strong);
        background: var(--surface);
        color: var(--ink-muted);
        border-radius: var(--radius-sm);
        padding: var(--space-2) var(--space-4);
        font-size: 13px;
        white-space: nowrap;
      }
      button.primary { background: var(--primary); border-color: var(--primary); color: #fff; }

      .last { margin: var(--space-3) 0 0; font-size: 13px; color: var(--ink-muted); }

      .problems { margin-top: var(--space-4); }
      .problem {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-2) 0;
        border-top: 1px solid var(--border);
        font-size: 14px;
      }
      .problem > a, .hidden-title { flex: 1; }
      .hidden-title { color: var(--ink-muted); font-style: italic; font-size: 13px; }
      .diff { font-size: 12px; font-weight: 600; text-transform: capitalize; width: 64px; }
      .diff.easy { color: var(--easy); }
      .diff.medium { color: var(--medium); }
      .diff.hard { color: var(--hard); }
      .mins { font-size: 12px; color: var(--ink-muted); }

      .rubric { margin-top: var(--space-5); border-top: 1px solid var(--border); padding-top: var(--space-4); }
      h4 { margin: 0 0 var(--space-3); font-size: 14px; }

      .item {
        display: flex;
        gap: var(--space-3);
        padding: var(--space-3);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        margin-bottom: var(--space-2);
        cursor: pointer;
        background: var(--canvas);
      }
      .item.on { border-color: var(--easy); background: color-mix(in srgb, var(--easy) 8%, var(--surface)); }
      .item input { margin-top: 3px; flex-shrink: 0; }
      .text { display: flex; flex-direction: column; gap: var(--space-1); }
      .criterion { font-size: 14px; font-weight: 600; }
      .w { font-size: 12px; color: var(--ink-muted); font-weight: 400; }
      .good { font-size: 13px; color: var(--ink-muted); }

      .total { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; margin-top: var(--space-4); }
      .score { font-size: 30px; font-weight: 600; color: var(--hard); }
      .score.pass { color: var(--easy); }
      .of { color: var(--ink-muted); font-size: 13px; }
      .bar { flex: 1 1 320px; margin: 0; font-size: 13px; color: var(--ink-muted); }

      .debrief { margin-top: var(--space-4); background: var(--canvas); border: 1px solid var(--border); border-radius: var(--radius-md); }
      summary { cursor: pointer; padding: var(--space-3) var(--space-4); font-size: 14px; font-weight: 600; }
      .debrief .body { padding: 0 var(--space-4) var(--space-3); }
      .debrief p { font-size: 14px; }

      @media (max-width: 720px) {
        header { flex-direction: column; }
        .clock { margin-left: 0; align-items: flex-start; flex-direction: row; }
      }
    `,
  ],
})
export class MockSetComponent implements OnDestroy {
  readonly set = input.required<MockSet>();

  private readonly progress = inject(ProgressService);

  readonly phase = signal<Phase>('idle');
  readonly remaining = signal(0);
  readonly awarded = signal<Set<string>>(new Set());

  private timer: ReturnType<typeof setInterval> | null = null;

  readonly last = computed(() => this.progress.mockResult(this.set().id));

  readonly score = computed(() =>
    this.set()
      .rubric.filter((r) => this.awarded().has(r.id))
      .reduce((n, r) => n + r.weight, 0),
  );

  readonly clock = computed(() => {
    const total = this.phase() === 'idle' ? this.set().minutes * 60 : this.remaining();
    const mins = Math.floor(Math.abs(total) / 60);
    const secs = Math.abs(total) % 60;
    return `${total < 0 ? '-' : ''}${mins}:${String(secs).padStart(2, '0')}`;
  });

  start(): void {
    // Problems stay hidden until here: reading them before the clock runs is the
    // most common way people flatter their own mock score.
    this.remaining.set(this.set().minutes * 60);
    this.awarded.set(new Set());
    this.phase.set('running');
    this.timer = setInterval(() => {
      const next = this.remaining() - 1;
      this.remaining.set(next);
      if (next <= 0) this.stop();
    }, 1000);
  }

  stop(): void {
    this.clearTimer();
    this.phase.set('scoring');
  }

  reset(): void {
    this.clearTimer();
    this.phase.set('idle');
    this.remaining.set(0);
  }

  toggle(id: string): void {
    const next = new Set(this.awarded());
    if (!next.delete(id)) next.add(id);
    this.awarded.set(next);
  }

  save(): void {
    this.progress.saveMock(this.set().id, this.score(), [...this.awarded()]);
    this.reset();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
