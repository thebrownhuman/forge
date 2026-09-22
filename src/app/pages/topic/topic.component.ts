import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContentService } from '../../core/content.service';
import { MockSetComponent } from './mock-set.component';
import { ProgressService, STATUS_LABEL, type Status } from '../../core/progress.service';
import type { Lang, Problem } from '../../../content/schema';

@Component({
  selector: 'fg-topic',
  standalone: true,
  imports: [RouterLink, MockSetComponent],
  template: `
    @if (topic(); as t) {
      <nav class="crumbs"><a routerLink="/atlas">Atlas</a> <span>/</span> {{ t.name }}</nav>

      <header class="head">
        <div>
          <h1>{{ t.name }}</h1>
          <p class="why">{{ t.whyItMatters }}</p>
        </div>
        <div class="stats">
          <span>{{ t.estHours }}h</span>
          @if (t.questionTypes.length) {
            <span>{{ t.questionTypes.length }} types</span>
            <span>{{ solvedHere() }} / {{ allProblems().length }} solved</span>
          }
          @if (t.mockSets?.length) {
            <span>{{ t.mockSets?.length }} mock sets</span>
          }
        </div>
      </header>

      @if (t.questionTypes.length) {
      <div class="langs" role="group" aria-label="Language">
        @for (l of languages; track l.id) {
          <button
            type="button"
            [class.on]="lang() === l.id"
            [attr.aria-pressed]="lang() === l.id"
            (click)="setLang(l.id)"
          >{{ l.label }}</button>
        }
      </div>
      }

      @if (t.fundamentals.length) {
        <section class="block">
          <h2>Fundamentals</h2>
          <p class="hint">Read these before the first problem. They explain the mechanism, not the API.</p>
          @for (note of t.fundamentals; track note.heading) {
            <details class="note">
              <summary>{{ note.heading }}</summary>
              <div class="body">
                <p>{{ note.body }}</p>
                @if (note.code?.[lang()]; as code) {
                  <pre class="mono">{{ code }}</pre>
                }
                @if (note.costs?.length) {
                  <table class="costs">
                    <tbody>
                      @for (c of note.costs; track c.op) {
                        <tr>
                          <td class="mono">{{ c.op }}</td>
                          <td class="mono cost">{{ c.cost }}</td>
                          <td class="muted">{{ c.note }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                }
              </div>
            </details>
          }
        </section>
      }

      @if (t.mockSets?.length) {
        <section class="block">
          <h2>Mock sets</h2>
          <p class="hint">
            Timed and unseen — the problems stay hidden until you start the clock. Score yourself before
            you look anything up.
          </p>
          @for (set of t.mockSets ?? []; track set.id) {
            <fg-mock-set [set]="set" />
          }
        </section>
      }

      @if (t.questionTypes.length) {
      <section class="block">
        <h2>Question types</h2>
        <p class="hint">
          One taught problem plus two to practise, per type. Recognising the signal is the skill.
        </p>

        @for (type of t.questionTypes; track type.id) {
          <article class="type">
            <header>
              <h3>{{ type.name }}</h3>
              <span class="complexity mono">{{ type.time }} / {{ type.space }}</span>
              @if (type.googleHeavy) { <span class="tag">Google-heavy</span> }
            </header>

            <p class="signal"><strong>Signal.</strong> {{ type.signal }}</p>

            <details class="fold">
              <summary>Template</summary>
              <pre class="mono">{{ type.template[lang()] }}</pre>
            </details>

            <details class="fold">
              <summary>Walkthrough — {{ type.taught.title }}</summary>
              <div class="walk">
                <ol>
                  @for (step of type.taught.walkthrough.howToSeeIt; track step) { <li>{{ step }}</li> }
                </ol>
                <p class="lose"><strong>Where people lose it.</strong> {{ type.taught.walkthrough.wherePeopleLoseIt }}</p>
                <p class="cx mono">{{ type.taught.walkthrough.time }} time · {{ type.taught.walkthrough.space }} space</p>
                <pre class="mono">{{ type.taught.walkthrough.code[lang()] }}</pre>
                @if (type.taught.walkthrough.followUp) {
                  <p class="follow"><strong>Follow-up.</strong> {{ type.taught.walkthrough.followUp }}</p>
                }
              </div>
            </details>

            <table class="problems">
              <caption class="sr-only">Problems for {{ type.name }}</caption>
              <thead>
                <tr>
                  <th scope="col"><span class="sr-only">Role</span></th>
                  <th scope="col"><span class="sr-only">Problem</span></th>
                  <th scope="col"><span class="sr-only">Difficulty</span></th>
                  <th scope="col"><span class="sr-only">Estimated minutes</span></th>
                  <th scope="col"><span class="sr-only">Status</span></th>
                </tr>
              </thead>
              <tbody>
                @for (p of content.typeProblems(type); track p.lc) {
                  <tr [class.done]="isDone(p.lc)">
                    <td class="role">{{ p.role }}</td>
                    <td class="title">
                      <a [href]="'https://leetcode.com/problems/' + p.slug + '/'" target="_blank" rel="noopener">
                        {{ p.lc }}. {{ p.title }}
                      </a>
                      @if (p.role !== 'prove') {
                        <button
                          class="reveal"
                          type="button"
                          [attr.aria-expanded]="shown().has(p.lc)"
                          [attr.aria-label]="(shown().has(p.lc) ? 'Hide' : 'Show') + ' insight for ' + p.title"
                          (click)="toggleInsight(p.lc)"
                        >
                          {{ shown().has(p.lc) ? 'hide insight' : 'insight' }}
                        </button>
                        @if (shown().has(p.lc)) { <span class="insight">{{ p.insight }}</span> }
                      } @else {
                        <span class="insight muted">No hint. That is the point.</span>
                      }
                    </td>
                    <td class="diff" [class]="p.difficulty">{{ p.difficulty }}</td>
                    <td class="mins mono">{{ p.estMinutes }}m</td>
                    <td class="status">
                      <button
                        type="button"
                        [attr.data-status]="statusOf(p.lc)"
                        [attr.aria-label]="ariaStatus(p.lc, p.title)"
                        (click)="progress.advance(p.lc)"
                      >
                        {{ label(p.lc) }}
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </article>
        }
      </section>
      }
    } @else {
      <p class="missing">
        No content authored for this topic yet. <a routerLink="/atlas">Back to the Atlas</a>.
      </p>
    }
  `,
  styles: [
    `
      .crumbs { font-size: 13px; color: var(--ink-muted); margin-bottom: var(--space-4); }
      .crumbs span { margin: 0 var(--space-2); }

      .head { display: flex; gap: var(--space-6); align-items: flex-start; margin-bottom: var(--space-5); }
      h1 { font-size: 30px; margin: 0 0 var(--space-2); letter-spacing: -0.02em; }
      .why { margin: 0; color: var(--ink-muted); max-width: 72ch; font-size: 15px; }
      .stats { margin-left: auto; display: flex; flex-direction: column; gap: var(--space-1); text-align: right; }
      .stats span { font-size: 13px; color: var(--ink-muted); font-family: var(--font-mono); white-space: nowrap; }

      .langs { display: inline-flex; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); overflow: hidden; margin-bottom: var(--space-6); }
      .langs button { background: var(--surface); border: 0; padding: var(--space-1) var(--space-4); font-size: 13px; color: var(--ink-muted); }
      .langs button.on { background: var(--primary); color: #fff; }

      .block { margin-bottom: var(--space-7); }
      h2 { font-size: 18px; margin: 0 0 var(--space-1); }
      .hint { margin: 0 0 var(--space-4); font-size: 13px; color: var(--ink-muted); }

      details { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); margin-bottom: var(--space-2); }
      summary { cursor: pointer; padding: var(--space-3) var(--space-4); font-weight: 600; font-size: 14px; }
      summary::marker { color: var(--ink-muted); }
      .body, .walk { padding: 0 var(--space-4) var(--space-4); }
      .body p, .walk p { font-size: 14px; }

      pre {
        background: var(--surface-sunken);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: var(--space-3);
        overflow-x: auto;
        font-size: 13px;
        line-height: 1.55;
        margin: var(--space-3) 0 0;
      }

      .costs { border-collapse: collapse; margin-top: var(--space-3); font-size: 13px; }
      .costs td { padding: var(--space-1) var(--space-4) var(--space-1) 0; }
      .cost { color: var(--primary); }
      .muted { color: var(--ink-muted); }

      .type {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: var(--space-5);
        margin-bottom: var(--space-4);
      }
      .type > header { display: flex; align-items: baseline; gap: var(--space-3); flex-wrap: wrap; }
      h3 { font-size: 17px; margin: 0; }
      .complexity { font-size: 12px; color: var(--ink-muted); }
      .tag {
        font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
        color: var(--primary); background: var(--primary-soft); padding: 2px 8px; border-radius: 999px;
      }

      .signal {
        margin: var(--space-3) 0 var(--space-4);
        padding: var(--space-3) var(--space-4);
        background: var(--primary-soft);
        border-left: 3px solid var(--primary);
        border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
        font-size: 14px;
      }

      .fold { background: var(--canvas); }
      .walk ol { margin: var(--space-2) 0; padding-left: var(--space-5); font-size: 14px; }
      .walk li { margin-bottom: var(--space-1); }
      .lose { border-left: 3px solid var(--hard); padding-left: var(--space-3); }
      .cx { font-size: 12px; color: var(--ink-muted); }
      .follow { color: var(--ink-muted); }

      .problems { width: 100%; border-collapse: collapse; margin-top: var(--space-4); }
      .problems td { padding: var(--space-2) var(--space-2); border-top: 1px solid var(--border); vertical-align: top; font-size: 14px; }
      .problems thead th { padding: 0; height: 0; border: 0; }
      .problems tr.done .title a { color: var(--ink-muted); }

      .role { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ink-muted); width: 72px; }
      .title a { font-weight: 500; }
      .reveal {
        margin-left: var(--space-2);
        background: transparent; border: 0; padding: 0;
        font-size: 12px; color: var(--ink-muted); text-decoration: underline;
      }
      .insight { display: block; margin-top: var(--space-1); font-size: 13px; color: var(--ink-muted); max-width: 66ch; }

      .diff { width: 72px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
      .diff.easy { color: var(--easy); }
      .diff.medium { color: var(--medium); }
      .diff.hard { color: var(--hard); }
      .mins { width: 52px; color: var(--ink-muted); font-size: 12px; }

      .status { width: 118px; text-align: right; }
      .status button {
        width: 100%;
        border: 1px solid var(--border-strong);
        background: var(--surface);
        color: var(--ink-muted);
        border-radius: var(--radius-sm);
        padding: var(--space-1) var(--space-2);
        font-size: 12px;
      }
      .status button[data-status='solved'] { border-color: var(--easy); color: var(--easy); }
      .status button[data-status='mastered'] { background: var(--easy); border-color: var(--easy); color: #fff; }
      .status button[data-status='struggled'] { border-color: var(--hard); color: var(--hard); }
      .status button[data-status='attempted'] { border-color: var(--medium); color: var(--medium); }

      .missing { color: var(--ink-muted); }

      @media (pointer: coarse) {
        /* Inline targets clear the 24px minimum without changing the desktop look. */
        .title a, .reveal, .crumbs a { display: inline-block; padding-block: var(--space-1); }
      }

      @media (max-width: 720px) {
        .head { flex-direction: column; gap: var(--space-3); }
        .stats { margin-left: 0; text-align: left; flex-direction: row; gap: var(--space-4); }
        .role, .mins { display: none; }
      }
    `,
  ],
})
export class TopicComponent {
  readonly content = inject(ContentService);
  readonly progress = inject(ProgressService);
  private readonly route = inject(ActivatedRoute);

  readonly languages: Array<{ id: Lang; label: string }> = [
    { id: 'cpp', label: 'C++' },
    { id: 'java', label: 'Java' },
  ];

  private readonly params = toSignal(this.route.paramMap, { requireSync: true });
  readonly topic = computed(() => this.content.topic(this.params().get('id') ?? ''));
  readonly lang = signal<Lang>(readStoredLang());
  readonly shown = signal<Set<number>>(new Set());

  readonly allProblems = computed<Problem[]>(() => {
    const t = this.topic();
    return t ? this.content.problems(t) : [];
  });

  readonly solvedHere = computed(() => this.progress.topicSolved(this.allProblems().map((p) => p.lc)));

  setLang(lang: Lang): void {
    this.lang.set(lang);
    try {
      localStorage.setItem('forge.lang', lang);
    } catch {
      // Blocked storage just means the choice resets next load.
    }
  }

  toggleInsight(lc: number): void {
    const next = new Set(this.shown());
    if (!next.delete(lc)) next.add(lc);
    this.shown.set(next);
  }

  statusOf(lc: number): Status {
    return this.progress.statusOf(lc);
  }

  label(lc: number): string {
    return STATUS_LABEL[this.statusOf(lc)];
  }

  /** The visible label is one word; without this a screen reader hears "Solved"
   *  with no idea which problem it belongs to or that the button cycles. */
  ariaStatus(lc: number, title: string): string {
    return `${title} — status ${this.label(lc)}. Activate to change.`;
  }

  isDone(lc: number): boolean {
    const s = this.statusOf(lc);
    return s === 'solved' || s === 'mastered';
  }
}

function readStoredLang(): Lang {
  try {
    return localStorage.getItem('forge.lang') === 'java' ? 'java' : 'cpp';
  } catch {
    return 'cpp';
  }
}
