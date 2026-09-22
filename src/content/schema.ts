/**
 * Forge content schema.
 *
 * The content IS the product. Everything the app renders comes from these
 * shapes — no prose lives in components.
 *
 * The binding rule: every QuestionType has exactly one `taught` problem and
 * exactly two `practice` problems. `validateTopic()` enforces it at build time.
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

export type ProblemRole = 'taught' | 'practice' | 'prove';

export type Lang = 'cpp' | 'java';

/** A single LeetCode problem, linked out — Forge never hosts statements. */
export interface Problem {
  /** LeetCode problem number, used as the stable id. */
  lc: number;
  title: string;
  slug: string;
  difficulty: Difficulty;
  role: ProblemRole;
  /** Realistic minutes for someone seeing this type for the second time. */
  estMinutes: number;
  /**
   * One sentence naming the move that cracks it. Shown upfront on `taught`,
   * behind a click on `practice`, withheld on `prove`.
   */
  insight: string;
  /** Companies that ask this often. Drives the final-sprint filter. */
  companies?: Array<'google' | 'meta' | 'amazon' | 'microsoft' | 'apple'>;
  /** Why this specific problem sits here and not a similar one. */
  whyThisOne?: string;
}

/** The fully worked explanation attached to a `taught` problem. */
export interface Walkthrough {
  /** Numbered reasoning steps: how you get from prompt to approach. */
  howToSeeIt: string[];
  /** Named failure mode — the thing that looks right and is not. */
  wherePeopleLoseIt: string;
  time: string;
  space: string;
  /** Solution per language. Both required. */
  code: Record<Lang, string>;
  /** Follow-up an interviewer asks once you solve it. */
  followUp?: string;
}

/**
 * A question type — the unit that actually transfers between problems.
 * Recognising the signal is the skill; the code is the easy part.
 */
export interface QuestionType {
  id: string;
  name: string;
  /**
   * "When you see X in the prompt, reach for this." The single most valuable
   * sentence in the app. Written as a trigger, never as a definition.
   */
  signal: string;
  /** Reusable skeleton the learner memorises by writing it out. */
  template: Record<Lang, string>;
  time: string;
  space: string;
  /** Exactly one taught problem. */
  taught: Problem & { walkthrough: Walkthrough };
  /** Exactly two practice problems. The second flips something. */
  practice: [Problem, Problem];
  /** Optional hard twist that breaks naive application of the template. */
  prove?: Problem;
  /** Types elsewhere in the atlas that share machinery. */
  relatedTypeIds?: string[];
  googleHeavy?: boolean;
}

export interface Topic {
  id: string;
  name: string;
  phase: 0 | 1 | 2 | 3 | 4;
  estHours: number;
  /** Topic ids that must be done first. Drives Atlas locking. */
  prerequisites: string[];
  /** Two or three sentences. Why this exists, in interview terms. */
  whyItMatters: string;
  /** Short concept notes read before the first question type. */
  fundamentals: ConceptNote[];
  questionTypes: QuestionType[];
  /**
   * Timed two-problem sets. Only the mocks topic carries these — a mock is not a
   * question type, so forcing it into that shape would mean inventing a signal
   * and a template that do not exist.
   */
  mockSets?: MockSet[];
}

/** One sitting: two problems, a clock, and an honest score afterwards. */
export interface MockSet {
  id: string;
  name: string;
  /** Wall-clock minutes for the whole sitting, both problems. */
  minutes: number;
  /** What this set is actually testing, in interview terms. */
  focus: string;
  /** The two problems, unseen by design — none appear in the learning ladder. */
  problems: [Problem, Problem];
  /** Scored after the clock stops, not during. */
  rubric: RubricItem[];
  /** What counts as a pass. Written as a bar, not a vibe. */
  passBar: string;
}

export interface RubricItem {
  id: string;
  criterion: string;
  /** Points out of 100. The set's weights must total exactly 100. */
  weight: number;
  /** The observable behaviour that earns the points. */
  whatGoodLooksLike: string;
}

/** A fundamentals note — the "understand it deeply" layer, before any problem. */
export interface ConceptNote {
  heading: string;
  /** Markdown-ish body. Short. Explains the mechanism, not the API. */
  body: string;
  /** Optional code that makes the mechanism concrete. */
  code?: Partial<Record<Lang, string>>;
  /** Costs worth memorising, e.g. "push_back amortised O(1)". */
  costs?: Array<{ op: string; cost: string; note?: string }>;
}

export interface Phase {
  id: 0 | 1 | 2 | 3 | 4;
  name: string;
  estHours: number;
  /** ISO dates, from the 1 Oct 2026 → 1 Jun 2027 schedule. */
  window: { from: string; to: string };
}

/** Lightweight node for the Atlas, so the map renders without loading topics. */
export interface AtlasNode {
  id: string;
  name: string;
  phase: 0 | 1 | 2 | 3 | 4;
  estHours: number;
  prerequisites: string[];
  /** Filled once the topic's content file exists. */
  typeCount: number;
}

/* -------------------------------------------------------------------------- */
/* Validation — runs in a build step and in unit tests. Content bugs fail loud. */
/* -------------------------------------------------------------------------- */

export interface ValidationIssue {
  topicId: string;
  typeId?: string;
  message: string;
}

export function validateTopic(topic: Topic): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seenLc = new Set<number>();

  if (topic.questionTypes.length === 0 && (topic.mockSets?.length ?? 0) === 0) {
    issues.push({ topicId: topic.id, message: 'topic has neither question types nor mock sets' });
  }

  for (const qt of topic.questionTypes) {
    const at = (message: string) => issues.push({ topicId: topic.id, typeId: qt.id, message });

    // The 1 + 2 rule.
    if (qt.taught.role !== 'taught') at('taught problem must have role "taught"');
    if (qt.practice.length !== 2) at('must have exactly 2 practice problems');
    for (const p of qt.practice) {
      if (p.role !== 'practice') at(`problem ${p.lc} must have role "practice"`);
    }
    if (qt.prove && qt.prove.role !== 'prove') at('prove problem must have role "prove"');

    // Every problem needs its one sentence.
    for (const p of [qt.taught, ...qt.practice, ...(qt.prove ? [qt.prove] : [])]) {
      if (!p.insight || p.insight.trim().length < 10) at(`problem ${p.lc} has no usable insight`);
      if (seenLc.has(p.lc)) at(`problem ${p.lc} appears twice in this topic`);
      seenLc.add(p.lc);
    }

    // Both languages, always — a missing Java template must never ship silently.
    for (const lang of ['cpp', 'java'] as Lang[]) {
      if (!qt.template[lang]?.trim()) at(`template missing for ${lang}`);
      if (!qt.taught.walkthrough.code[lang]?.trim()) at(`walkthrough code missing for ${lang}`);
    }

    if (!qt.signal.trim()) at('signal is empty');
    if (qt.taught.walkthrough.howToSeeIt.length < 2) at('walkthrough needs at least 2 reasoning steps');
  }

  for (const set of topic.mockSets ?? []) {
    const at = (message: string) => issues.push({ topicId: topic.id, typeId: set.id, message });

    if (set.problems.length !== 2) at('a mock set must have exactly 2 problems');
    if (set.minutes < 30 || set.minutes > 120) at(`implausible sitting length: ${set.minutes} minutes`);
    if (!set.passBar.trim()) at('pass bar is empty');

    for (const p of set.problems) {
      // A mock problem you have already been taught is not a mock.
      if (p.role !== 'prove') at(`problem ${p.lc} in a mock set must have role "prove"`);
      if (seenLc.has(p.lc)) at(`problem ${p.lc} appears twice in this topic`);
      seenLc.add(p.lc);
    }

    const weight = set.rubric.reduce((n, r) => n + r.weight, 0);
    if (weight !== 100) at(`rubric weights total ${weight}, must total 100`);
    if (set.rubric.length < 4) at('rubric needs at least 4 criteria to be worth scoring');
    for (const r of set.rubric) {
      if (!r.whatGoodLooksLike.trim()) at(`rubric item ${r.id} does not say what good looks like`);
    }
  }

  return issues;
}

export function validateAll(topics: Topic[]): ValidationIssue[] {
  return topics.flatMap(validateTopic);
}
