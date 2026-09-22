import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SD_BY_ID } from '../../../content/system-design';
import { ProgressService, SD_STAGE_LABEL, type SdStage } from '../../core/progress.service';

@Component({
  selector: 'fg-sd-module',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (module(); as m) {
      <nav class="crumbs"><a routerLink="/system-design">System Design</a> <span>/</span> {{ m.name }}</nav>

      <header class="head">
        <div>
          <h1>{{ m.name }}</h1>
          <p class="why">{{ m.whyItMatters }}</p>
        </div>
        <div class="side">
          <span class="mono">{{ m.estHours }}h</span>
          <button
            type="button"
            class="stage"
            [attr.data-stage]="stage()"
            [attr.aria-label]="m.name + ' — stage ' + stageLabel() + '. Activate to change.'"
            (click)="progress.advanceSd(m.id)"
          >
            {{ stageLabel() }}
          </button>
        </div>
      </header>

      @if (m.caseStudy; as c) {
        <section class="prompt">
          <span class="tag">Prompt</span>
          <p>{{ c.prompt }}</p>
          <p class="advice">
            Read the requirements, then stop and design it yourself against the clock
            ({{ c.estMinutes }} minutes). Reading a worked answer you have not attempted
            teaches recognition, not recall.
          </p>
          <button type="button" class="reveal" (click)="revealed.set(!revealed())">
            {{ revealed() ? 'Hide the worked design' : 'Show the worked design' }}
          </button>
        </section>

        <section class="block">
          <h2>Requirements</h2>
          <ul>
            @for (r of c.requirements; track r) { <li>{{ r }}</li> }
          </ul>
          <h3>Constraints</h3>
          <ul class="muted">
            @for (r of c.constraints; track r) { <li>{{ r }}</li> }
          </ul>
        </section>

        @if (revealed()) {
          <section class="block">
            <h2>Estimation</h2>
            <table class="figures">
              <caption class="sr-only">Back-of-envelope figures for {{ c.name }}</caption>
              <thead>
                <tr><th scope="col"><span class="sr-only">Quantity</span></th><th scope="col"><span class="sr-only">Value</span></th><th scope="col"><span class="sr-only">Why it matters</span></th></tr>
              </thead>
              <tbody>
                @for (f of c.estimation; track f.label) {
                  <tr>
                    <td class="l">{{ f.label }}</td>
                    <td class="v mono">{{ f.value }}</td>
                    <td class="s">{{ f.soWhat }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </section>

          <section class="block">
            <h2>API</h2>
            <pre class="mono">{{ joinLines(c.api) }}</pre>
          </section>

          <section class="block">
            <h2>Data model</h2>
            @for (n of c.dataModel; track n.heading) {
              <div class="note">
                <h3>{{ n.heading }}</h3>
                <p>{{ n.body }}</p>
                @if (n.detail?.length) {
                  <ul>@for (d of n.detail ?? []; track d) { <li>{{ d }}</li> }</ul>
                }
              </div>
            }
          </section>

          <section class="block">
            <h2>High-level design</h2>
            <ol class="flow">
              @for (step of c.highLevel; track step) { <li>{{ step }}</li> }
            </ol>
          </section>

          <section class="block">
            <h2>Deep dives</h2>
            <p class="hint">Where the interview actually goes. Each has a defensible answer, not a correct one.</p>
            @for (t of c.deepDives; track t.decision) {
              <article class="tradeoff">
                <h3>{{ t.decision }}</h3>
                <div class="pair">
                  <div class="opt">
                    <h4>{{ t.optionA.name }}</h4>
                    <p><strong>Wins when.</strong> {{ t.optionA.whenItWins }}</p>
                    <p class="cost"><strong>Costs.</strong> {{ t.optionA.cost }}</p>
                  </div>
                  <div class="opt">
                    <h4>{{ t.optionB.name }}</h4>
                    <p><strong>Wins when.</strong> {{ t.optionB.whenItWins }}</p>
                    <p class="cost"><strong>Costs.</strong> {{ t.optionB.cost }}</p>
                  </div>
                </div>
                <p class="decide"><strong>How to decide.</strong> {{ t.howToDecide }}</p>
              </article>
            }
          </section>

          <section class="block">
            <h2>Bottlenecks</h2>
            @for (n of c.bottlenecks; track n.heading) {
              <div class="note bottleneck">
                <h3>{{ n.heading }}</h3>
                <p>{{ n.body }}</p>
              </div>
            }
          </section>

          <section class="block">
            <h2>Follow-ups</h2>
            <p class="hint">Have an angle on each of these before you consider this case done.</p>
            <ul>
              @for (f of c.followUps; track f) { <li>{{ f }}</li> }
            </ul>
          </section>
        }
      } @else {
        @if (m.steps?.length) {
          <section class="block">
            <h2>The steps</h2>
            <p class="hint">
              Total {{ totalMinutes() }} minutes. Rehearse the order until it is automatic.
            </p>
            @for (s of m.steps ?? []; track s.id) {
              <article class="step">
                <header>
                  <h3>{{ s.name }}</h3>
                  <span class="mins mono">{{ s.minutes }} min</span>
                </header>
                <p class="output"><strong>Output.</strong> {{ s.output }}</p>
                <ul>@for (p of s.prompts; track p) { <li>{{ p }}</li> }</ul>
                <p class="fail"><strong>Failure mode.</strong> {{ s.failureMode }}</p>
              </article>
            }
          </section>
        }

        @if (m.notes.length) {
          <section class="block">
            <h2>Notes</h2>
            @for (n of m.notes; track n.heading) {
              <div class="note">
                <h3>{{ n.heading }}</h3>
                <p>{{ n.body }}</p>
                @if (n.detail?.length) {
                  <ul>@for (d of n.detail ?? []; track d) { <li>{{ d }}</li> }</ul>
                }
              </div>
            }
          </section>
        }

        @if (m.figures.length) {
          <section class="block">
            <h2>Numbers</h2>
            <table class="figures">
              <caption class="sr-only">Figures for {{ m.name }}</caption>
              <thead>
                <tr><th scope="col"><span class="sr-only">Quantity</span></th><th scope="col"><span class="sr-only">Value</span></th><th scope="col"><span class="sr-only">Why it matters</span></th></tr>
              </thead>
              <tbody>
                @for (f of m.figures; track f.label) {
                  <tr>
                    <td class="l">{{ f.label }}</td>
                    <td class="v mono">{{ f.value }}</td>
                    <td class="s">{{ f.soWhat }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </section>
        }

        @if (m.tradeoffs.length) {
          <section class="block">
            <h2>Tradeoffs</h2>
            @for (t of m.tradeoffs; track t.decision) {
              <article class="tradeoff">
                <h3>{{ t.decision }}</h3>
                <div class="pair">
                  <div class="opt">
                    <h4>{{ t.optionA.name }}</h4>
                    <p><strong>Wins when.</strong> {{ t.optionA.whenItWins }}</p>
                    <p class="cost"><strong>Costs.</strong> {{ t.optionA.cost }}</p>
                  </div>
                  <div class="opt">
                    <h4>{{ t.optionB.name }}</h4>
                    <p><strong>Wins when.</strong> {{ t.optionB.whenItWins }}</p>
                    <p class="cost"><strong>Costs.</strong> {{ t.optionB.cost }}</p>
                  </div>
                </div>
                <p class="decide"><strong>How to decide.</strong> {{ t.howToDecide }}</p>
              </article>
            }
          </section>
        }
      }
    } @else {
      <p class="missing">No such module. <a routerLink="/system-design">Back to the track</a>.</p>
    }
  `,
  styles: [
    `
      .crumbs { font-size: 13px; color: var(--ink-muted); margin-bottom: var(--space-4); }
      .crumbs span { margin: 0 var(--space-2); }

      .head { display: flex; gap: var(--space-6); align-items: flex-start; margin-bottom: var(--space-5); }
      h1 { font-size: 30px; margin: 0 0 var(--space-2); letter-spacing: -0.02em; }
      .why { margin: 0; color: var(--ink-muted); font-size: 15px; max-width: 76ch; }
      .side { margin-left: auto; display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-2); flex-shrink: 0; }
      .side .mono { font-size: 13px; color: var(--ink-muted); }

      .stage {
        border: 1px solid var(--border-strong);
        background: var(--surface);
        color: var(--ink-muted);
        border-radius: var(--radius-sm);
        padding: var(--space-2) var(--space-3);
        font-size: 13px;
        white-space: nowrap;
      }
      .stage[data-stage='outlined'] { border-color: var(--primary); color: var(--primary); }
      .stage[data-stage='deep'] { border-color: var(--easy); color: var(--easy); }
      .stage[data-stage='mastered'] { background: var(--easy); border-color: var(--easy); color: #fff; }

      .prompt {
        background: var(--primary-soft);
        border-left: 3px solid var(--primary);
        border-radius: 0 var(--radius-md) var(--radius-md) 0;
        padding: var(--space-4);
        margin-bottom: var(--space-5);
      }
      .tag {
        font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
        color: var(--primary);
      }
      .prompt p { margin: var(--space-2) 0 0; font-size: 15px; }
      .advice { color: var(--ink-muted); font-size: 13px !important; }
      .reveal {
        margin-top: var(--space-3);
        background: var(--primary); border: 1px solid var(--primary); color: #fff;
        border-radius: var(--radius-sm); padding: var(--space-2) var(--space-4); font-size: 13px; font-weight: 600;
      }

      .block { margin-bottom: var(--space-6); }
      h2 { font-size: 18px; margin: 0 0 var(--space-2); }
      h3 { font-size: 15px; margin: 0 0 var(--space-1); }
      .hint { margin: 0 0 var(--space-3); font-size: 13px; color: var(--ink-muted); }

      ul, ol { margin: 0; padding-left: var(--space-5); font-size: 14px; line-height: 1.6; }
      li { margin-bottom: var(--space-1); }
      ul.muted li { color: var(--ink-muted); }

      .note {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: var(--space-4);
        margin-bottom: var(--space-2);
      }
      .note p { margin: 0 0 var(--space-2); font-size: 14px; }
      .bottleneck { border-left: 3px solid var(--hard); }

      .flow { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-4) var(--space-4) var(--space-4) var(--space-7); }

      .figures { width: 100%; border-collapse: collapse; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); }
      .figures thead th { padding: 0; height: 0; border: 0; }
      .figures td { padding: var(--space-2) var(--space-3); border-top: 1px solid var(--border); font-size: 13px; vertical-align: top; }
      .figures tr:first-child td { border-top: 0; }
      .l { font-weight: 600; width: 190px; }
      .v { color: var(--primary); width: 150px; white-space: nowrap; }
      .s { color: var(--ink-muted); }

      pre {
        background: var(--surface-sunken);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: var(--space-3);
        font-size: 13px;
        overflow-x: auto;
        margin: 0;
        line-height: 1.7;
      }

      .tradeoff {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: var(--space-4);
        margin-bottom: var(--space-3);
      }
      .pair { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin: var(--space-3) 0; }
      .opt { background: var(--canvas); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-3); }
      .opt h4 { margin: 0 0 var(--space-2); font-size: 13px; }
      .opt p { margin: 0 0 var(--space-2); font-size: 13px; }
      .cost { color: var(--ink-muted); }
      .decide { margin: 0; font-size: 14px; border-left: 3px solid var(--primary); padding-left: var(--space-3); }

      .step { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-4); margin-bottom: var(--space-2); }
      .step > header { display: flex; align-items: baseline; gap: var(--space-3); margin-bottom: var(--space-2); }
      .mins { margin-left: auto; font-size: 12px; color: var(--ink-muted); }
      .output { margin: 0 0 var(--space-2); font-size: 14px; }
      .fail { margin: var(--space-2) 0 0; font-size: 13px; color: var(--ink-muted); border-left: 3px solid var(--hard); padding-left: var(--space-3); }

      .missing { color: var(--ink-muted); }

      @media (max-width: 760px) {
        .head { flex-direction: column; }
        .side { margin-left: 0; align-items: flex-start; flex-direction: row; }
        .pair { grid-template-columns: 1fr; }

        /* A three-column figures table cannot fit 375px, so stack each row:
           label, value, then the "so what" underneath. */
        .figures, .figures tbody, .figures tr, .figures td { display: block; width: auto; }
        .figures tr { border-top: 1px solid var(--border); padding: var(--space-2) 0; }
        .figures tr:first-child { border-top: 0; }
        .figures td { border-top: 0; padding: 0 var(--space-3); }
        .v { white-space: normal; }
      }
    `,
  ],
})
export class SdModuleComponent {
  readonly progress = inject(ProgressService);
  private readonly route = inject(ActivatedRoute);

  private readonly params = toSignal(this.route.paramMap, { requireSync: true });
  readonly module = computed(() => SD_BY_ID[this.params().get('id') ?? '']);
  readonly revealed = signal(false);

  readonly totalMinutes = computed(() =>
    (this.module()?.steps ?? []).reduce((n, s) => n + s.minutes, 0),
  );

  joinLines(lines: string[]): string {
    return lines.join('\n');
  }

  stage(): SdStage {
    const m = this.module();
    return m ? this.progress.sdStage(m.id) : 'unseen';
  }

  stageLabel(): string {
    return SD_STAGE_LABEL[this.stage()];
  }
}
