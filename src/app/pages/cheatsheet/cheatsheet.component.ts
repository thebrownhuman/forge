import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { ProgressService } from '../../core/progress.service';
import type { Lang, QuestionType, Topic } from '../../../content/schema';

interface Group {
  phase: number;
  phaseName: string;
  topics: Array<{ topic: Topic; types: QuestionType[] }>;
}

@Component({
  selector: 'fg-cheatsheet',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="controls no-print">
      <div>
        <h1>Cheatsheet</h1>
        <p class="sub">
          Every signal in one document, in atlas order. Print it, or save it as a PDF from the print dialog.
          Built for the week before the interview — read the trigger, not the solution.
        </p>
      </div>

      <div class="opts">
        <label>
          <input type="checkbox" [checked]="withTemplates()" (change)="withTemplates.set(!withTemplates())" />
          Include code templates
        </label>
        <label>
          <input type="checkbox" [checked]="googleOnly()" (change)="googleOnly.set(!googleOnly())" />
          Google-heavy only
        </label>
        <label>
          <input type="checkbox" [checked]="weakOnly()" (change)="weakOnly.set(!weakOnly())" />
          Only where I have unsolved problems
        </label>

        @if (withTemplates()) {
          <div class="langs" role="group" aria-label="Template language">
            @for (l of languages; track l.id) {
              <button
                type="button"
                [class.on]="lang() === l.id"
                [attr.aria-pressed]="lang() === l.id"
                (click)="lang.set(l.id)"
              >{{ l.label }}</button>
            }
          </div>
        }

        <button type="button" class="primary" (click)="print()">Print</button>
        <a routerLink="/patterns" class="back">Back to Patterns</a>
      </div>
    </section>

    <p class="count no-print" role="status" aria-live="polite">
      {{ typeCount() }} of {{ total }} question types included.
    </p>

    <article class="sheet">
      <header class="sheet-head">
        <h2>Forge — pattern cheatsheet</h2>
        <p>{{ typeCount() }} question types · generated {{ generatedOn }}</p>
      </header>

      @for (group of groups(); track group.phase) {
        <section class="phase">
          <h3 class="phase-name">Phase {{ group.phase }} — {{ group.phaseName }}</h3>

          @for (entry of group.topics; track entry.topic.id) {
            <section class="topic">
              <h4>{{ entry.topic.name }}</h4>

              @for (type of entry.types; track type.id) {
                <div class="type">
                  <p class="name">
                    {{ type.name }}
                    <span class="cx mono">{{ type.time }} / {{ type.space }}</span>
                    @if (type.googleHeavy) { <span class="g">G</span> }
                  </p>
                  <p class="signal">{{ type.signal }}</p>
                  <p class="lose"><em>Loses it:</em> {{ type.taught.walkthrough.wherePeopleLoseIt }}</p>
                  @if (withTemplates()) {
                    <pre class="mono">{{ type.template[lang()] }}</pre>
                  }
                </div>
              }
            </section>
          }
        </section>
      } @empty {
        <p class="none">Nothing matches those filters.</p>
      }
    </article>
  `,
  styles: [
    `
      .controls { display: flex; gap: var(--space-6); align-items: flex-start; margin-bottom: var(--space-4); }
      h1 { font-size: 32px; margin: 0 0 var(--space-2); letter-spacing: -0.02em; }
      .sub { margin: 0; color: var(--ink-muted); font-size: 14px; max-width: 62ch; }

      .opts { margin-left: auto; display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-2); flex-shrink: 0; }
      .opts label { font-size: 13px; display: flex; gap: var(--space-2); align-items: center; cursor: pointer; }

      .langs { display: inline-flex; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); overflow: hidden; }
      .langs button { background: var(--surface); border: 0; padding: var(--space-1) var(--space-3); font-size: 12px; color: var(--ink-muted); }
      .langs button.on { background: var(--primary); color: #fff; }

      .opts button.primary {
        background: var(--primary); border: 1px solid var(--primary); color: #fff;
        border-radius: var(--radius-sm); padding: var(--space-2) var(--space-4); font-size: 13px; font-weight: 600;
      }
      .back { font-size: 13px; }

      .count { font-size: 12px; color: var(--ink-muted); font-family: var(--font-mono); margin: 0 0 var(--space-4); }

      .sheet {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: var(--space-6);
      }
      .sheet-head { border-bottom: 2px solid var(--ink); padding-bottom: var(--space-2); margin-bottom: var(--space-5); }
      .sheet-head h2 { margin: 0; font-size: 20px; }
      .sheet-head p { margin: var(--space-1) 0 0; font-size: 12px; color: var(--ink-muted); font-family: var(--font-mono); }

      .phase-name {
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--primary);
        margin: var(--space-5) 0 var(--space-3);
        border-bottom: 1px solid var(--border);
        padding-bottom: var(--space-1);
      }
      .topic { margin-bottom: var(--space-4); }
      .topic h4 { margin: 0 0 var(--space-2); font-size: 15px; }

      .type { margin-bottom: var(--space-3); padding-left: var(--space-3); border-left: 2px solid var(--border); }
      .name { margin: 0; font-size: 13.5px; font-weight: 600; }
      .cx { font-size: 11px; color: var(--ink-muted); font-weight: 400; margin-left: var(--space-2); }
      .g {
        font-size: 10px; font-weight: 700; color: var(--primary);
        background: var(--primary-soft); border-radius: 3px; padding: 1px 5px; margin-left: var(--space-2);
      }
      .signal { margin: var(--space-1) 0 0; font-size: 13px; }
      .lose { margin: var(--space-1) 0 0; font-size: 12px; color: var(--ink-muted); }
      pre { background: var(--surface-sunken); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-2); font-size: 11px; overflow-x: auto; margin: var(--space-2) 0 0; }

      .none { color: var(--ink-muted); }

      @media (max-width: 720px) {
        .controls { flex-direction: column; }
        .opts { margin-left: 0; }
      }

      /* The printed artefact is the product here; the screen version is a preview.
         Two columns, black on white, and no card chrome. */
      @media print {
        .sheet { border: 0; padding: 0; background: #fff; border-radius: 0; }
        .phase { break-inside: auto; }
        .topic { break-inside: avoid; }
        .type { break-inside: avoid; border-left-color: #ccc; }
        .sheet-head h2, .topic h4, .name { color: #000; }
        .signal { color: #000; }
        .lose, .cx, .sheet-head p { color: #444; }
        .phase-name { color: #000; border-bottom-color: #000; }
        .g { background: transparent; border: 1px solid #000; color: #000; }
        pre { background: #f4f4f4; border-color: #ccc; }

        .phase { column-count: 2; column-gap: 24px; }
        .phase-name { column-span: all; }
      }
    `,
  ],
})
export class CheatsheetComponent {
  private readonly content = inject(ContentService);
  private readonly progress = inject(ProgressService);

  readonly languages: Array<{ id: Lang; label: string }> = [
    { id: 'cpp', label: 'C++' },
    { id: 'java', label: 'Java' },
  ];

  readonly withTemplates = signal(false);
  readonly googleOnly = signal(false);
  readonly weakOnly = signal(false);
  readonly lang = signal<Lang>('cpp');

  readonly total = this.content.atlas.reduce((n, t) => n + t.typeCount, 0);
  readonly generatedOn = new Date().toLocaleDateString('en-CA');

  readonly groups = computed<Group[]>(() =>
    this.content.phases
      .map((phase) => ({
        phase: phase.id,
        phaseName: phase.name,
        topics: this.content.atlas
          .filter((node) => node.phase === phase.id && node.authored)
          .flatMap((node) => {
            const topic = this.content.topic(node.id);
            if (!topic) return [];
            const types = topic.questionTypes.filter((t) => this.include(t));
            return types.length ? [{ topic, types }] : [];
          }),
      }))
      .filter((g) => g.topics.length > 0),
  );

  readonly typeCount = computed(() =>
    this.groups().reduce((n, g) => n + g.topics.reduce((m, t) => m + t.types.length, 0), 0),
  );

  print(): void {
    window.print();
  }

  private include(type: QuestionType): boolean {
    if (this.googleOnly() && !type.googleHeavy) return false;
    if (this.weakOnly()) {
      const lcs = this.content.typeProblems(type).map((p) => p.lc);
      if (this.progress.topicSolved(lcs) === lcs.length) return false;
    }
    return true;
  }
}
