import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { KIND_LABEL, PaletteService } from '../../core/palette.service';

@Component({
  selector: 'fg-palette',
  standalone: true,
  template: `
    @if (palette.open()) {
      <div class="scrim no-print" (click)="palette.close()"></div>

      <div class="panel no-print" role="dialog" aria-modal="true" aria-label="Command palette">
        <input
          #box
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          [attr.aria-activedescendant]="palette.results().length ? 'palette-opt-' + palette.cursor() : null"
          aria-label="Search topics, patterns and problems"
          placeholder="Search topics, patterns, problems…"
          [value]="palette.query()"
          (input)="palette.setQuery($any($event.target).value)"
          (keydown)="onKey($event)"
        />

        <ul id="palette-list" role="listbox" aria-label="Results">
          @for (item of palette.results(); track item.id; let i = $index) {
            <li
              role="option"
              [id]="'palette-opt-' + i"
              [attr.aria-selected]="i === palette.cursor()"
              [class.on]="i === palette.cursor()"
              (mouseenter)="palette.cursor.set(i)"
              (click)="palette.runAt(i)"
            >
              <span class="kind" [attr.data-kind]="item.kind">{{ kindLabel[item.kind] }}</span>
              <span class="text">
                <span class="label">{{ item.label }}</span>
                <span class="hint">{{ item.hint }}</span>
              </span>
            </li>
          } @empty {
            <li class="none" role="presentation">Nothing matches. Try a topic name or a LeetCode number.</li>
          }
        </ul>

        <footer>
          <span><kbd>↑</kbd><kbd>↓</kbd> move</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </footer>
      </div>
    }
  `,
  styles: [
    `
      .scrim {
        position: fixed;
        inset: 0;
        background: rgba(15, 27, 45, 0.35);
        z-index: 50;
      }

      .panel {
        position: fixed;
        top: 12vh;
        left: 50%;
        transform: translateX(-50%);
        width: min(640px, calc(100vw - 32px));
        max-height: 70vh;
        display: flex;
        flex-direction: column;
        background: var(--surface);
        border: 1px solid var(--border-strong);
        border-radius: var(--radius-lg);
        box-shadow: 0 16px 48px rgba(15, 27, 45, 0.25);
        z-index: 51;
        overflow: hidden;
      }

      input {
        font: inherit;
        font-size: 16px;
        padding: var(--space-4);
        border: 0;
        border-bottom: 1px solid var(--border);
        background: transparent;
        color: var(--ink);
        outline: none;
      }

      ul { margin: 0; padding: var(--space-2); list-style: none; overflow-y: auto; }

      li {
        display: flex;
        align-items: baseline;
        gap: var(--space-3);
        padding: var(--space-2) var(--space-3);
        border-radius: var(--radius-sm);
        cursor: pointer;
      }
      li.on { background: var(--primary-soft); }

      .kind {
        flex-shrink: 0;
        width: 58px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--ink-muted);
        font-family: var(--font-mono);
      }
      .kind[data-kind='go'], .kind[data-kind='action'] { color: var(--primary); }

      .text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
      .label { font-size: 14px; font-weight: 500; }
      .hint {
        font-size: 12px;
        color: var(--ink-muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .none { color: var(--ink-muted); font-size: 13px; cursor: default; }

      footer {
        display: flex;
        gap: var(--space-4);
        padding: var(--space-2) var(--space-4);
        border-top: 1px solid var(--border);
        font-size: 11px;
        color: var(--ink-muted);
      }
      kbd {
        font-family: var(--font-mono);
        border: 1px solid var(--border-strong);
        border-radius: 3px;
        padding: 0 4px;
        margin-right: 3px;
      }

      @media (max-width: 640px) {
        .panel { top: 6vh; max-height: 80vh; }
        .kind { width: 46px; }
      }
    `,
  ],
})
export class PaletteComponent {
  readonly palette = inject(PaletteService);
  readonly kindLabel = KIND_LABEL;

  private readonly box = viewChild<ElementRef<HTMLInputElement>>('box');
  private returnFocusTo: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.palette.open()) {
        this.returnFocusTo = document.activeElement as HTMLElement | null;
        // The input only exists once the block renders, so focus on the next frame.
        queueMicrotask(() => this.box()?.nativeElement.focus());
      } else if (this.returnFocusTo) {
        this.returnFocusTo.focus();
        this.returnFocusTo = null;
      }
    });
  }

  onKey(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.palette.move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.palette.move(-1);
        break;
      case 'Enter':
        event.preventDefault();
        this.palette.runAt(this.palette.cursor());
        break;
      case 'Escape':
        event.preventDefault();
        this.palette.close();
        break;
      default:
        break;
    }
  }
}
