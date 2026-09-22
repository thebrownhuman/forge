import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SD_COUNTS, SD_MODULES, SD_TOTAL_HOURS } from '../../../content/system-design';
import { ProgressService, SD_STAGE_LABEL, type SdStage } from '../../core/progress.service';
import type { SdKind } from '../../../content/system-design/schema';

const SECTIONS: Array<{ kind: SdKind; title: string; blurb: string }> = [
  {
    kind: 'framework',
    title: 'The method',
    blurb: 'Learn this first and run it every time. The round is graded on process before content.',
  },
  {
    kind: 'concept',
    title: 'Concepts',
    blurb: 'The vocabulary and the numbers. Every case below draws on these, so do them in order.',
  },
  {
    kind: 'case',
    title: 'Case studies',
    blurb: 'Worked designs. Read one, then close it and run the method from a blank page before reading the next.',
  },
];

@Component({
  selector: 'fg-sd-index',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="head">
      <h1>System Design</h1>
      <p class="sub">
        {{ modules.length }} modules · {{ hours }} hours · {{ counts.tradeoffs }} defended tradeoffs ·
        {{ counts.figures }} numbers worth knowing. This track is scheduled <strong>after</strong> June 2027 —
        it is here so the material is ready, not so it competes with the round you sit first.
      </p>
      <p class="sub">
        {{ started() }} of {{ modules.length }} started · {{ mastered() }} you could run cold.
      </p>
    </section>

    @for (section of sections; track section.kind) {
      <section class="group">
        <header>
          <h2>{{ section.title }}</h2>
          <p>{{ section.blurb }}</p>
        </header>

        <div class="grid">
          @for (m of modulesOf(section.kind); track m.id) {
            <a class="card" [routerLink]="['/system-design', m.id]" [attr.data-stage]="stage(m.id)">
              <div class="top">
                <h3>{{ m.name }}</h3>
                <span class="hours mono">{{ m.estHours }}h</span>
              </div>
              <p class="why">{{ m.whyItMatters }}</p>
              <div class="foot">
                <span class="stage" [attr.data-stage]="stage(m.id)">{{ stageLabel(m.id) }}</span>
                @if (m.caseStudy) {
                  <span class="meta mono">{{ m.caseStudy.deepDives.length }} deep dives · {{ m.caseStudy.estMinutes }}m</span>
                } @else {
                  <span class="meta mono">{{ m.tradeoffs.length }} tradeoffs</span>
                }
              </div>
            </a>
          }
        </div>
      </section>
    }
  `,
  styles: [
    `
      .head { margin-bottom: var(--space-6); }
      h1 { font-size: 32px; margin: 0 0 var(--space-2); letter-spacing: -0.02em; }
      .sub { margin: 0 0 var(--space-2); color: var(--ink-muted); font-size: 14px; max-width: 76ch; }

      .group { margin-bottom: var(--space-7); }
      .group > header { margin-bottom: var(--space-4); padding-bottom: var(--space-2); border-bottom: 1px solid var(--border); }
      h2 { font-size: 17px; margin: 0 0 var(--space-1); }
      .group > header p { margin: 0; font-size: 13px; color: var(--ink-muted); }

      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: var(--space-3); }

      .card {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        background: var(--surface);
        border: 1px solid var(--border);
        border-left: 3px solid var(--border-strong);
        border-radius: var(--radius-md);
        padding: var(--space-4);
        color: var(--ink);
      }
      .card:hover { text-decoration: none; border-color: var(--border-strong); box-shadow: var(--shadow-md); }
      .card[data-stage='read'] { border-left-color: var(--medium); }
      .card[data-stage='outlined'] { border-left-color: var(--primary); }
      .card[data-stage='deep'] { border-left-color: var(--easy); }
      .card[data-stage='mastered'] { border-left-color: var(--easy); background: color-mix(in srgb, var(--easy) 6%, var(--surface)); }

      .top { display: flex; justify-content: space-between; align-items: baseline; gap: var(--space-2); }
      h3 { margin: 0; font-size: 15px; font-weight: 600; }
      .hours { font-size: 12px; color: var(--ink-muted); }

      .why {
        margin: 0;
        font-size: 13px;
        color: var(--ink-muted);
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .foot { display: flex; align-items: center; gap: var(--space-3); margin-top: auto; padding-top: var(--space-2); }
      .stage {
        font-size: 11px;
        font-weight: 600;
        border: 1px solid var(--border-strong);
        border-radius: 999px;
        padding: 1px 8px;
        color: var(--ink-muted);
      }
      .stage[data-stage='deep'], .stage[data-stage='mastered'] { border-color: var(--easy); color: var(--easy); }
      .stage[data-stage='outlined'] { border-color: var(--primary); color: var(--primary); }
      .meta { font-size: 11px; color: var(--ink-muted); margin-left: auto; }
    `,
  ],
})
export class SdIndexComponent {
  private readonly progress = inject(ProgressService);

  readonly modules = SD_MODULES;
  readonly hours = SD_TOTAL_HOURS;
  readonly counts = SD_COUNTS;
  readonly sections = SECTIONS;

  readonly started = computed(() => this.progress.sdStarted());
  readonly mastered = computed(() => this.progress.sdMastered());

  modulesOf(kind: SdKind) {
    return this.modules.filter((m) => m.kind === kind);
  }

  stage(id: string): SdStage {
    return this.progress.sdStage(id);
  }

  stageLabel(id: string): string {
    return SD_STAGE_LABEL[this.stage(id)];
  }
}
