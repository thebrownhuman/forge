import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ProgressService } from './core/progress.service';
import { PaletteService } from './core/palette.service';
import { PaletteComponent } from './pages/palette/palette.component';

@Component({
  selector: 'fg-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, PaletteComponent],
  template: `
    <button type="button" class="skip-link" (click)="skipToContent()">Skip to content</button>

    <header class="bar no-print">
      <a class="brand" routerLink="/today">
        <span class="mark"></span>
        Forge
      </a>

      <nav aria-label="Sections">
        <a routerLink="/today" routerLinkActive="on">Today</a>
        <a routerLink="/atlas" routerLinkActive="on">Atlas</a>
        <a routerLink="/patterns" routerLinkActive="on">Patterns</a>
        <a routerLink="/progress" routerLinkActive="on">Progress</a>
        <a routerLink="/system-design" routerLinkActive="on">Design</a>
      </nav>

      <div class="right">
        <span class="streak" [class.cold]="progress.streak() === 0" [attr.aria-label]="streakLabel()">
          <span aria-hidden="true">
            {{ progress.streak() }} {{ progress.streak() === 1 ? 'day' : 'days' }}
            @if (progress.longestStreak() > progress.streak()) {
              <span class="best">best {{ progress.longestStreak() }}</span>
            } @else if (progress.streak() > 0) {
              <span class="best">longest yet</span>
            }
          </span>
        </span>
        <span class="count">{{ progress.solvedCount() }} solved</span>
        <button type="button" class="palette-btn" (click)="palette.show()" aria-label="Open command palette">
          Search <kbd>{{ modKey }}K</kbd>
        </button>
        <button type="button" (click)="exportBackup()" aria-label="Download progress backup">Backup</button>
        <button type="button" (click)="picker.click()" aria-label="Restore progress from a backup file">Restore</button>
        <input #picker type="file" accept="application/json" hidden (change)="restoreBackup($event)" />
        <button type="button" (click)="toggleTheme()" [attr.aria-label]="'Switch to ' + (theme() === 'light' ? 'dark' : 'light') + ' theme'">
          {{ theme() === 'light' ? 'Dark' : 'Light' }}
        </button>
      </div>
    </header>

    <main id="main" tabindex="-1">
      <router-outlet />
    </main>

    <fg-palette />

    <!-- Status changes are silent without this: the button's own label updates,
         but a label change on a focused control is not reliably announced. -->
    <div class="sr-only" role="status" aria-live="polite">{{ announcement() }}</div>
  `,
  styles: [
    `
      :host { display: block; min-height: 100vh; }

      .bar {
        display: flex;
        align-items: center;
        gap: var(--space-6);
        padding: var(--space-3) var(--space-6);
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        position: sticky;
        top: 0;
        z-index: 10;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-weight: 700;
        font-size: 18px;
        letter-spacing: -0.01em;
        color: var(--ink);
      }
      .brand:hover { text-decoration: none; }
      .mark {
        width: 14px; height: 14px;
        border-radius: 3px;
        background: var(--primary);
        box-shadow: inset 0 0 0 3px var(--surface), 0 0 0 1px var(--primary);
      }

      nav { display: flex; gap: var(--space-4); }
      nav a {
        color: var(--ink-muted);
        font-weight: 500;
        font-size: 14px;
        padding: var(--space-1) 0;
        border-bottom: 2px solid transparent;
      }
      nav a:hover { color: var(--ink); text-decoration: none; }
      nav a.on { color: var(--ink); border-bottom-color: var(--primary); }

      .right { margin-left: auto; display: flex; align-items: center; gap: var(--space-3); }

      .streak {
        font-size: 13px;
        font-weight: 600;
        color: var(--streak);
        background: color-mix(in srgb, var(--streak-fill) 14%, transparent);
        padding: var(--space-1) var(--space-3);
        border-radius: 999px;
        display: inline-flex;
        gap: var(--space-2);
        align-items: baseline;
      }
      .streak.cold { color: var(--ink-muted); background: var(--surface-sunken); }
      .best { font-weight: 400; font-size: 12px; opacity: 0.8; }

      .count { font-size: 13px; color: var(--ink-muted); }

      main:focus { outline: none; }

      .skip-link { border: 0; font-weight: 600; }

      .right button {
        background: transparent;
        border: 1px solid var(--border-strong);
        color: var(--ink-muted);
        border-radius: var(--radius-sm);
        padding: var(--space-1) var(--space-3);
        font-size: 13px;
      }
      .right button:hover { color: var(--ink); border-color: var(--ink-muted); }

      .palette-btn { display: flex; align-items: center; gap: var(--space-2); }
      .palette-btn kbd {
        font-family: var(--font-mono);
        font-size: 11px;
        border: 1px solid var(--border);
        border-radius: 3px;
        padding: 0 4px;
        background: var(--surface-sunken);
      }

      main { max-width: 1200px; margin: 0 auto; padding: var(--space-6); }

      @media (max-width: 640px) {
        .bar { flex-wrap: wrap; gap: var(--space-3); padding: var(--space-3) var(--space-4); }
        .right { width: 100%; margin-left: 0; flex-wrap: wrap; }
        nav { flex-wrap: wrap; }
        /* There is no Ctrl+K on a phone, so the shortcut button is dead weight
           and it is what pushes the header past the viewport. */
        .palette-btn { display: none; }
        main { padding: var(--space-4); }
      }
    `,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  readonly progress = inject(ProgressService);
  readonly palette = inject(PaletteService);
  readonly modKey = navigator.platform.toLowerCase().includes('mac') ? '⌘' : 'Ctrl+';
  readonly theme = signal<'light' | 'dark'>(readStoredTheme());
  readonly announcement = computed(() =>
    this.progress.loaded()
      ? `${this.progress.solvedCount()} problems solved, ${this.progress.streak()} day streak.`
      : '',
  );

  readonly streakLabel = computed(() => {
    const n = this.progress.streak();
    const best = this.progress.longestStreak();
    const run = `${n} day${n === 1 ? '' : 's'} streak`;
    return best > n ? `${run}, longest ${best} days` : `${run}, longest yet`;
  });

  ngOnInit(): void {
    document.documentElement.dataset['theme'] = this.theme();
    void this.progress.init();

    this.palette.registerActions([
      {
        id: 'action:theme',
        kind: 'action',
        label: 'Toggle theme',
        hint: 'Switch between light and dark',
        weight: 0,
        haystack: 'toggle theme dark light mode',
        run: () => this.toggleTheme(),
      },
      {
        id: 'action:backup',
        kind: 'action',
        label: 'Download backup',
        hint: 'Export all progress as JSON',
        weight: 1,
        haystack: 'download backup export json save progress',
        run: () => this.exportBackup(),
      },
    ]);

    window.addEventListener('keydown', this.onGlobalKey);
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.onGlobalKey);
  }

  /** Bound field, not a method, so add and remove see the same reference. */
  private readonly onGlobalKey = (event: KeyboardEvent): void => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.palette.toggle();
      return;
    }
    // Escape has to work from anywhere: the palette input is not always focused
    // once the pointer has been used to hover a result.
    if (event.key === 'Escape' && this.palette.open()) {
      this.palette.close();
    }
  };

  /** The entire backup story: one JSON file, on this machine. No cloud, by design. */
  exportBackup(): void {
    const blob = new Blob([this.progress.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forge-progress-${new Date().toLocaleDateString('en-CA')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async restoreBackup(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      await this.progress.importJson(await file.text());
    } catch {
      alert('That file is not a Forge backup. Nothing was changed.');
    }
  }

  skipToContent(): void {
    document.getElementById('main')?.focus();
  }

  toggleTheme(): void {
    const next = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(next);
    document.documentElement.dataset['theme'] = next;
    try {
      localStorage.setItem('forge.theme', next);
    } catch {
      // Private window or blocked storage: theme just resets next load.
    }
  }
}

function readStoredTheme(): 'light' | 'dark' {
  try {
    const stored = localStorage.getItem('forge.theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // ignore
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
