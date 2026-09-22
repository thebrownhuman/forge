/**
 * System Design content schema.
 *
 * Deliberately not the DSA schema. A DSA question type has one right technique
 * and a verifiable answer; a system design question has a defensible position and
 * a set of tradeoffs you must be able to argue. Forcing the two into one shape
 * would flatten exactly the thing that makes the second round hard.
 */

export type SdKind = 'framework' | 'concept' | 'case';

/** How deep you have taken a module. Mirrors the DSA ladder without reusing it. */
export type SdStage = 'unseen' | 'read' | 'outlined' | 'deep' | 'mastered';

/** A number you should be able to recall without thinking. */
export interface Figure {
  label: string;
  value: string;
  /** Why this number is the one that matters, not just what it is. */
  soWhat: string;
}

/** A decision with two defensible sides. The core unit of a design interview. */
export interface Tradeoff {
  decision: string;
  optionA: { name: string; whenItWins: string; cost: string };
  optionB: { name: string; whenItWins: string; cost: string };
  /** The line that shows you understand the axis, not just the options. */
  howToDecide: string;
}

export interface SdNote {
  heading: string;
  body: string;
  /** Concrete mechanism, when prose is not enough. */
  detail?: string[];
}

/** One step of the interview method, with its time box. */
export interface FrameworkStep {
  id: string;
  name: string;
  minutes: number;
  /** What you produce in this step. An output, not an activity. */
  output: string;
  prompts: string[];
  failureMode: string;
}

/** The worked design for one classic question. */
export interface CaseStudy {
  id: string;
  name: string;
  /** The prompt as an interviewer would actually say it. */
  prompt: string;
  difficulty: 'warmup' | 'standard' | 'hard';
  estMinutes: number;
  /** Functional requirements to land before designing anything. */
  requirements: string[];
  /** Non-functional: the constraints that actually shape the architecture. */
  constraints: string[];
  /** The back-of-envelope pass, with the arithmetic shown. */
  estimation: Figure[];
  /** The API surface, as signatures. Small on purpose. */
  api: string[];
  /** The data model: entities and the access patterns that justify them. */
  dataModel: SdNote[];
  /** The high-level design, as a sequence of components and what flows between. */
  highLevel: string[];
  /** Where the interview actually goes. Each is a defensible position. */
  deepDives: Tradeoff[];
  /** What breaks first at scale, and the fix. */
  bottlenecks: SdNote[];
  /** What they ask once you have a working design. */
  followUps: string[];
  /** Companies that ask this shape of question. */
  askedBy?: string[];
}

export interface SdModule {
  id: string;
  kind: SdKind;
  name: string;
  /** Two or three sentences. Why this exists, in interview terms. */
  whyItMatters: string;
  estHours: number;
  /** Module ids worth doing first. */
  prerequisites: string[];
  notes: SdNote[];
  figures: Figure[];
  tradeoffs: Tradeoff[];
  /** Only the framework module carries these. */
  steps?: FrameworkStep[];
  /** Only case modules carry this. */
  caseStudy?: CaseStudy;
}

export interface SdValidationIssue {
  moduleId: string;
  message: string;
}

/* -------------------------------------------------------------------------- */
/* Validation — same principle as the DSA gate: a thin module fails the build. */
/* -------------------------------------------------------------------------- */

export function validateModule(m: SdModule): SdValidationIssue[] {
  const issues: SdValidationIssue[] = [];
  const at = (message: string) => issues.push({ moduleId: m.id, message });

  if (!m.whyItMatters.trim()) at('whyItMatters is empty');
  if (m.estHours <= 0) at('estHours must be positive');

  for (const t of m.tradeoffs) {
    // A tradeoff with a blank side is a preference dressed up as analysis.
    if (!t.optionA.whenItWins.trim() || !t.optionB.whenItWins.trim()) {
      at(`tradeoff "${t.decision}" does not say when each option wins`);
    }
    if (!t.optionA.cost.trim() || !t.optionB.cost.trim()) {
      at(`tradeoff "${t.decision}" does not state both costs`);
    }
    if (!t.howToDecide.trim()) at(`tradeoff "${t.decision}" has no deciding rule`);
  }

  for (const f of m.figures) {
    if (!f.soWhat.trim()) at(`figure "${f.label}" has no "so what"`);
  }

  if (m.kind === 'framework') {
    const steps = m.steps ?? [];
    if (steps.length < 5) at('the framework needs at least 5 steps to be a method');
    const total = steps.reduce((n, s) => n + s.minutes, 0);
    // A 45-minute round: a method that does not fit it is not a method.
    if (total < 30 || total > 60) at(`framework steps total ${total} minutes, expected 30–60`);
    for (const s of steps) {
      if (!s.output.trim()) at(`step "${s.name}" names no output`);
      if (s.prompts.length < 2) at(`step "${s.name}" needs at least 2 prompts`);
      if (!s.failureMode.trim()) at(`step "${s.name}" names no failure mode`);
    }
  }

  if (m.kind === 'concept') {
    if (m.notes.length < 3) at('a concept module needs at least 3 notes');
    if (m.tradeoffs.length < 2) at('a concept module needs at least 2 tradeoffs');
  }

  if (m.kind === 'case') {
    const c = m.caseStudy;
    if (!c) {
      at('a case module must carry a caseStudy');
      return issues;
    }
    if (c.requirements.length < 3) at('case needs at least 3 functional requirements');
    if (c.constraints.length < 2) at('case needs at least 2 non-functional constraints');
    if (c.estimation.length < 3) at('case needs at least 3 estimation figures');
    if (c.api.length < 2) at('case needs at least 2 API signatures');
    if (c.dataModel.length < 1) at('case needs a data model');
    if (c.highLevel.length < 4) at('case needs at least 4 high-level steps');
    if (c.deepDives.length < 3) at('case needs at least 3 deep dives — that is where the interview goes');
    if (c.bottlenecks.length < 2) at('case needs at least 2 bottlenecks');
    if (c.followUps.length < 2) at('case needs at least 2 follow-ups');
  }

  return issues;
}

export function validateAllModules(modules: SdModule[]): SdValidationIssue[] {
  const issues = modules.flatMap(validateModule);
  const seen = new Set<string>();
  for (const m of modules) {
    if (seen.has(m.id)) issues.push({ moduleId: m.id, message: 'duplicate module id' });
    seen.add(m.id);
  }
  for (const m of modules) {
    for (const p of m.prerequisites) {
      if (!seen.has(p)) issues.push({ moduleId: m.id, message: `unknown prerequisite "${p}"` });
    }
  }
  return issues;
}
