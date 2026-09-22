import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { ProgressService } from '../../core/progress.service';

@Component({
  selector: 'fg-atlas',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="head">
      <h1>The Atlas</h1>
      <p class="sub">
        {{ totals().topics }} topics · {{ totals().types }} question types · {{ totals().problems }} problems ·
        {{ totals().hours }} hours. Phase 0 opens 1 Oct 2026; target 1 Jun 2027.
      </p>
    </section>

    @for (phase of content.phases; track phase.id) {
      <section class="phase">
        <header>
          <h2><span class="num">{{ phase.id }}</span> {{ phase.name }}</h2>
          <span class="window">{{ phase.window.from }} → {{ phase.window.to }} · {{ phase.estHours }}h</span>
        </header>

        <div class="grid">
          @for (node of topicsIn(phase.id); track node.id) {
            <a class="card" [class.empty]="!node.authored" [routerLink]="['/topic', node.id]">
              <div class="top">
                <h3>{{ node.name }}</h3>
                <span class="hours">{{ node.estHours }}h</span>
              </div>

              <p class="meta">
                @if (node.mockSetCount) {
                  {{ node.mockSetCount }} timed sets
                } @else if (node.authored) {
                  {{ node.typeCount }} types · {{ node.lcs.length }} problems
                } @else {
                  Not authored yet
                }
              </p>

              @if (node.prerequisites.length) {
                <p class="pre">after {{ content.prerequisiteNames(node).join(', ') }}</p>
              }

              @if (node.authored && node.lcs.length) {
                <div class="bar" [attr.aria-label]="solved(node.lcs) + ' of ' + node.lcs.length + ' solved'">
                  <span [style.width.%]="pct(node.lcs)"></span>
                </div>
                <p class="count">{{ solved(node.lcs) }} / {{ node.lcs.length }} solved</p>
              }
            </a>
          }
        </div>
      </section>
    }
  `,
  styles: [
    `
      .head { margin-bottom: var(--space-7); }
      h1 { font-size: 32px; margin: 0 0 var(--space-2); letter-spacing: -0.02em; }
      .sub { margin: 0; color: var(--ink-muted); font-size: 14px; max-width: 70ch; }

      .phase { margin-bottom: var(--space-7); }
      .phase > header {
        display: flex;
        align-items: baseline;
        gap: var(--space-3);
        margin-bottom: var(--space-4);
        padding-bottom: var(--space-2);
        border-bottom: 1px solid var(--border);
      }
      h2 { font-size: 16px; margin: 0; display: flex; align-items: center; gap: var(--space-2); }
      .num {
        font-family: var(--font-mono);
        font-size: 12px;
        background: var(--primary-soft);
        color: var(--primary);
        border-radius: var(--radius-sm);
        padding: 1px 6px;
      }
      .window { font-size: 12px; color: var(--ink-muted); font-family: var(--font-mono); margin-left: auto; }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
        gap: var(--space-3);
      }

      .card {
        display: block;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: var(--space-4);
        color: var(--ink);
        transition: border-color 120ms ease, box-shadow 120ms ease;
      }
      .card:hover { text-decoration: none; border-color: var(--border-strong); box-shadow: var(--shadow-md); }
      .card.empty { background: var(--surface-sunken); border-style: dashed; }

      .top { display: flex; justify-content: space-between; align-items: baseline; gap: var(--space-2); }
      h3 { font-size: 15px; margin: 0; font-weight: 600; }
      .hours { font-family: var(--font-mono); font-size: 12px; color: var(--ink-muted); }

      .meta { margin: var(--space-2) 0 0; font-size: 12px; color: var(--ink-muted); }
      .pre { margin: var(--space-1) 0 0; font-size: 12px; color: var(--ink-muted); font-style: italic; }

      .bar {
        margin-top: var(--space-3);
        height: 4px;
        border-radius: 2px;
        background: var(--surface-sunken);
        overflow: hidden;
      }
      .card.empty .bar { background: var(--border); }
      .bar span { display: block; height: 100%; background: var(--primary); }
      .count { margin: var(--space-1) 0 0; font-size: 11px; color: var(--ink-muted); font-family: var(--font-mono); }
    `,
  ],
})
export class AtlasComponent {
  readonly content = inject(ContentService);
  private readonly progress = inject(ProgressService);

  readonly totals = computed(() => ({
    topics: this.content.atlas.length,
    types: this.content.atlas.reduce((n, t) => n + t.typeCount, 0),
    problems: this.content.atlas.reduce((n, t) => n + t.lcs.length, 0),
    hours: this.content.atlas.reduce((n, t) => n + t.estHours, 0),
  }));

  topicsIn(phase: number) {
    return this.content.atlas.filter((t) => t.phase === phase);
  }

  solved(lcs: number[]): number {
    return this.progress.topicSolved(lcs);
  }

  pct(lcs: number[]): number {
    return lcs.length === 0 ? 0 : Math.round((this.solved(lcs) / lcs.length) * 100);
  }
}
