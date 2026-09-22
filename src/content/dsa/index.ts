import type { Topic } from '../schema';
import { validateAll } from '../schema';
import { complexity } from './topics/complexity';
import { stl } from './topics/stl';
import { arrays } from './topics/arrays';
import { strings } from './topics/strings';
import { twoPointers } from './topics/two-pointers';
import { slidingWindow } from './topics/sliding-window';
import { binarySearch } from './topics/binary-search';
import { hashing } from './topics/hashing';
import { stacks } from './topics/stacks';
import { queues } from './topics/queues';
import { linkedLists } from './topics/linked-lists';
import { recursion } from './topics/recursion';
import { binaryTrees } from './topics/binary-trees';
import { bst } from './topics/bst';
import { heaps } from './topics/heaps';
import { tries } from './topics/tries';
import { intervals } from './topics/intervals';
import { sorting } from './topics/sorting';
import { matrix } from './topics/matrix';
import { graphs } from './topics/graphs';
import { topoSort } from './topics/topo-sort';
import { unionFind } from './topics/union-find';
import { shortestPaths } from './topics/shortest-paths';
import { dp } from './topics/dp';
import { greedy } from './topics/greedy';
import { bitManipulation } from './topics/bit-manipulation';
import { math } from './topics/math';
import { segmentTree } from './topics/segment-tree';
import { design } from './topics/design';
import { mocks } from './topics/mocks';

export { ATLAS, PHASES, START_DATE, TARGET_DATE, TOTAL_TYPES, CORE_PROBLEM_COUNT } from './atlas';

/** Topics with authored content. The Atlas lists all 30; this grows to match. */
export const TOPICS: Topic[] = [
  // Phase 0
  complexity,
  stl,
  arrays,
  strings,
  // Phase 1
  twoPointers,
  slidingWindow,
  binarySearch,
  hashing,
  stacks,
  queues,
  linkedLists,
  // Phase 2
  recursion,
  binaryTrees,
  bst,
  heaps,
  tries,
  intervals,
  sorting,
  matrix,
  // Phase 3
  graphs,
  topoSort,
  unionFind,
  shortestPaths,
  dp,
  greedy,
  // Phase 4
  bitManipulation,
  math,
  segmentTree,
  design,
  mocks,
];

export const TOPICS_BY_ID: Record<string, Topic> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t]),
);

/** Every question type across authored topics - powers the Patterns screen. */
export const ALL_QUESTION_TYPES = TOPICS.flatMap((topic) =>
  topic.questionTypes.map((qt) => ({ ...qt, topicId: topic.id, topicName: topic.name })),
);

/** Every problem, flattened, with its role and origin. */
export const ALL_PROBLEMS = TOPICS.flatMap((topic) =>
  topic.questionTypes.flatMap((qt) =>
    [qt.taught, ...qt.practice, ...(qt.prove ? [qt.prove] : [])].map((p) => ({
      ...p,
      topicId: topic.id,
      typeId: qt.id,
    })),
  ),
);

export const CONTENT_ISSUES = validateAll(TOPICS);

