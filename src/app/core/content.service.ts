import { Injectable } from '@angular/core';
import { ATLAS, PHASES, TOPICS } from '../../content/dsa';
import type { AtlasNode, Phase, Problem, QuestionType, Topic } from '../../content/schema';

export interface AtlasEntry extends AtlasNode {
  authored: boolean;
  /** LeetCode numbers of every problem in this topic. */
  lcs: number[];
  /** Timed sets, for the topics that carry them instead of question types. */
  mockSetCount: number;
}

/** A problem plus where it sits, so the session and dashboard can label it. */
export interface Located {
  problem: Problem;
  topicId: string;
  topicName: string;
  typeId: string;
  typeName: string;
  signal: string;
  phase: number;
}

@Injectable({ providedIn: 'root' })
export class ContentService {
  readonly phases: Phase[] = PHASES;
  private readonly byId = new Map<string, Topic>(TOPICS.map((t) => [t.id, t]));

  /** Every problem in atlas order — the order they should be worked in. */
  readonly ordered: Located[] = ATLAS.flatMap((node) => {
    const topic = this.byId.get(node.id);
    if (!topic) return [];
    return topic.questionTypes.flatMap((type) =>
      typeProblems(type).map<Located>((problem) => ({
        problem,
        topicId: topic.id,
        topicName: topic.name,
        typeId: type.id,
        typeName: type.name,
        signal: type.signal,
        phase: topic.phase,
      })),
    );
  });

  private readonly byLc = new Map<number, Located>(this.ordered.map((l) => [l.problem.lc, l]));

  readonly atlas: AtlasEntry[] = ATLAS.map((node) => {
    const topic = this.byId.get(node.id);
    return {
      ...node,
      authored: topic !== undefined,
      lcs: topic ? problemsOf(topic).map((p) => p.lc) : [],
      mockSetCount: topic?.mockSets?.length ?? 0,
    };
  });

  topic(id: string): Topic | undefined {
    return this.byId.get(id);
  }

  phase(id: number): Phase | undefined {
    return this.phases.find((p) => p.id === id);
  }

  located(lc: number): Located | undefined {
    return this.byLc.get(lc);
  }

  prerequisiteNames(node: AtlasNode): string[] {
    return node.prerequisites.map((id) => ATLAS.find((n) => n.id === id)?.name ?? id);
  }

  problems(topic: Topic): Problem[] {
    return problemsOf(topic);
  }

  typeProblems(type: QuestionType): Problem[] {
    return typeProblems(type);
  }
}

function typeProblems(type: QuestionType): Problem[] {
  return [type.taught, ...type.practice, ...(type.prove ? [type.prove] : [])];
}

function problemsOf(topic: Topic): Problem[] {
  return topic.questionTypes.flatMap(typeProblems);
}
