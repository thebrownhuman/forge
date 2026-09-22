import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ContentService } from './content.service';
import { SD_MODULES } from '../../content/system-design';

export type CommandKind = 'go' | 'topic' | 'pattern' | 'problem' | 'design' | 'action';

export interface Command {
  id: string;
  kind: CommandKind;
  label: string;
  /** Second line: where it lives, or what it does. */
  hint: string;
  /** Lower sorts first within an equal match quality. */
  weight: number;
  haystack: string;
  /** A short handle that should win outright when typed exactly, e.g. a topic id. */
  exact?: string;
  run: () => void;
}

export const KIND_LABEL: Record<CommandKind, string> = {
  go: 'Go',
  action: 'Action',
  topic: 'Topic',
  pattern: 'Pattern',
  problem: 'Problem',
  design: 'Design',
};

const MAX_RESULTS = 40;

@Injectable({ providedIn: 'root' })
export class PaletteService {
  private readonly content = inject(ContentService);
  private readonly router = inject(Router);

  readonly open = signal(false);
  readonly query = signal('');
  readonly cursor = signal(0);

  /** Registered by the shell, which owns the things a command can act on. */
  private actions: Command[] = [];

  private readonly index = computed<Command[]>(() => [
    ...this.actions,
    ...this.navCommands(),
    ...this.topicCommands(),
    ...this.patternCommands(),
    ...this.designCommands(),
    ...this.problemCommands(),
  ]);

  readonly results = computed<Command[]>(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.index();
    if (q === '') {
      return all.filter((c) => c.kind === 'go' || c.kind === 'action').slice(0, MAX_RESULTS);
    }

    // Rank by where the match lands: a label prefix beats a label hit, which
    // beats a hit anywhere in the haystack. Typing "dp" should not surface
    // twenty problems whose insight happens to mention it before the topic.
    const scored: Array<{ c: Command; score: number }> = [];
    for (const c of all) {
      const label = c.label.toLowerCase();
      let score: number;
      // "dp" means the topic, not the first pattern whose name happens to start
      // with those letters.
      if (c.exact === q) score = -1;
      else if (label.startsWith(q)) score = 0;
      else if (label.includes(q)) score = 1;
      else if (c.haystack.includes(q)) score = 2;
      else continue;
      scored.push({ c, score: score * 100 + c.weight });
    }
    return scored.sort((a, b) => a.score - b.score).slice(0, MAX_RESULTS).map((s) => s.c);
  });

  registerActions(actions: Command[]): void {
    this.actions = actions;
  }

  toggle(): void {
    this.open() ? this.close() : this.show();
  }

  show(): void {
    this.query.set('');
    this.cursor.set(0);
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }

  move(delta: number): void {
    const n = this.results().length;
    if (n === 0) return;
    this.cursor.set((this.cursor() + delta + n) % n);
  }

  setQuery(value: string): void {
    this.query.set(value);
    this.cursor.set(0);
  }

  runAt(index: number): void {
    const command = this.results()[index];
    if (!command) return;
    this.close();
    command.run();
  }

  private navCommands(): Command[] {
    const routes: Array<[string, string, string]> = [
      ['Today', '/today', "The session: reviews due plus new ground"],
      ['Atlas', '/atlas', 'All 30 topics by phase'],
      ['Patterns', '/patterns', 'Search all 121 signals'],
      ['Progress', '/progress', 'Pace, streak, weakest topics'],
      ['Cheatsheet', '/cheatsheet', 'Printable signal reference'],
      ['System Design', '/system-design', 'The second track: method, concepts, cases'],
    ];
    return routes.map(([label, path, hint], i) => ({
      id: `go:${path}`,
      kind: 'go' as const,
      label,
      hint,
      weight: i,
      haystack: `${label} ${hint}`.toLowerCase(),
      run: () => void this.router.navigate([path]),
    }));
  }

  private topicCommands(): Command[] {
    return this.content.atlas
      .filter((node) => node.authored)
      .map((node) => ({
        id: `topic:${node.id}`,
        kind: 'topic' as const,
        label: node.name,
        hint: `Phase ${node.phase} · ${node.estHours}h · ${node.typeCount || node.mockSetCount} ${node.typeCount ? 'types' : 'mock sets'}`,
        weight: 5,
        exact: node.id,
        haystack: `${node.name} ${node.id}`.toLowerCase(),
        run: () => void this.router.navigate(['/topic', node.id]),
      }));
  }

  private patternCommands(): Command[] {
    return this.content.atlas
      .filter((node) => node.authored)
      .flatMap((node) => {
        const topic = this.content.topic(node.id);
        if (!topic) return [];
        return topic.questionTypes.map((type) => ({
          id: `pattern:${topic.id}/${type.id}`,
          kind: 'pattern' as const,
          label: type.name,
          hint: `${topic.name} · ${type.signal}`,
          weight: 20,
          haystack: `${type.name} ${type.signal} ${topic.name} ${topic.id}`.toLowerCase(),
          run: () => void this.router.navigate(['/topic', topic.id]),
        }));
      });
  }

  private designCommands(): Command[] {
    return SD_MODULES.map((m) => ({
      id: `design:${m.id}`,
      kind: 'design' as const,
      label: m.name,
      hint: `System design · ${m.kind} · ${m.estHours}h`,
      weight: 15,
      haystack: `${m.name} ${m.id} system design ${m.caseStudy?.prompt ?? ''}`.toLowerCase(),
      run: () => void this.router.navigate(['/system-design', m.id]),
    }));
  }

  private problemCommands(): Command[] {
    return this.content.ordered.map((l) => ({
      id: `problem:${l.problem.lc}`,
      kind: 'problem' as const,
      label: `${l.problem.lc}. ${l.problem.title}`,
      hint: `${l.topicName} · ${l.typeName} · opens on LeetCode`,
      weight: 30,
      haystack: `${l.problem.lc} ${l.problem.title} ${l.topicName}`.toLowerCase(),
      run: () => {
        window.open(`https://leetcode.com/problems/${l.problem.slug}/`, '_blank', 'noopener');
      },
    }));
  }
}
