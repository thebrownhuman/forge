import type { AtlasNode, Phase } from '../schema';

/** Schedule derived from 1 Oct 2026 → 1 Jun 2027: 35 weeks, 310 h, ~8.9 h/week. */
export const PHASES: Phase[] = [
  { id: 0, name: 'Foundations', estHours: 30, window: { from: '2026-10-01', to: '2026-10-25' } },
  { id: 1, name: 'Core Linear', estHours: 75, window: { from: '2026-10-26', to: '2026-12-20' } },
  { id: 2, name: 'Trees & Recursion', estHours: 80, window: { from: '2026-12-21', to: '2027-02-21' } },
  { id: 3, name: 'Graphs & DP', estHours: 85, window: { from: '2027-02-22', to: '2027-04-25' } },
  { id: 4, name: 'Advanced & Mocks', estHours: 40, window: { from: '2027-04-26', to: '2027-06-01' } },
];

export const START_DATE = '2026-10-01';
export const TARGET_DATE = '2027-06-01';

/**
 * Prerequisites are deliberately sparse. A topic is locked only when starting it
 * without the prereq would genuinely waste time — not merely "it'd be nicer after".
 * Over-locking turns the Atlas into a corridor and kills the point of a map.
 */
export const ATLAS: AtlasNode[] = [
  // Phase 0 — Foundations
  { id: 'complexity', name: 'Complexity Analysis', phase: 0, estHours: 4, prerequisites: [], typeCount: 3 },
  { id: 'stl', name: 'C++ & Java Standard Library', phase: 0, estHours: 8, prerequisites: [], typeCount: 4 },
  { id: 'arrays', name: 'Arrays & Prefix Sums', phase: 0, estHours: 10, prerequisites: ['complexity', 'stl'], typeCount: 4 },
  { id: 'strings', name: 'Strings', phase: 0, estHours: 8, prerequisites: ['stl'], typeCount: 3 },

  // Phase 1 — Core Linear
  { id: 'two-pointers', name: 'Two Pointers', phase: 1, estHours: 10, prerequisites: ['arrays'], typeCount: 4 },
  { id: 'sliding-window', name: 'Sliding Window', phase: 1, estHours: 12, prerequisites: ['arrays', 'hashing'], typeCount: 5 },
  { id: 'binary-search', name: 'Binary Search', phase: 1, estHours: 14, prerequisites: ['arrays'], typeCount: 5 },
  { id: 'hashing', name: 'Hashing, Maps & Sets', phase: 1, estHours: 8, prerequisites: ['stl'], typeCount: 4 },
  { id: 'stacks', name: 'Stacks', phase: 1, estHours: 10, prerequisites: ['stl'], typeCount: 4 },
  { id: 'queues', name: 'Queues & Deques', phase: 1, estHours: 6, prerequisites: ['stl'], typeCount: 3 },
  { id: 'linked-lists', name: 'Linked Lists', phase: 1, estHours: 15, prerequisites: ['two-pointers'], typeCount: 7 },

  // Phase 2 — Trees & Recursion
  { id: 'recursion', name: 'Recursion & Backtracking', phase: 2, estHours: 12, prerequisites: ['arrays'], typeCount: 5 },
  { id: 'binary-trees', name: 'Binary Trees', phase: 2, estHours: 18, prerequisites: ['recursion', 'queues'], typeCount: 6 },
  { id: 'bst', name: 'Binary Search Trees', phase: 2, estHours: 10, prerequisites: ['binary-trees', 'binary-search'], typeCount: 4 },
  { id: 'heaps', name: 'Heaps & Priority Queues', phase: 2, estHours: 10, prerequisites: ['stl'], typeCount: 4 },
  { id: 'tries', name: 'Tries', phase: 2, estHours: 8, prerequisites: ['strings', 'recursion'], typeCount: 3 },
  { id: 'intervals', name: 'Intervals', phase: 2, estHours: 8, prerequisites: ['sorting'], typeCount: 3 },
  { id: 'sorting', name: 'Sorting Algorithms', phase: 2, estHours: 8, prerequisites: ['arrays'], typeCount: 4 },
  { id: 'matrix', name: 'Matrix & Grid', phase: 2, estHours: 6, prerequisites: ['arrays'], typeCount: 3 },

  // Phase 3 — Graphs & DP
  { id: 'graphs', name: 'Graph Traversal', phase: 3, estHours: 14, prerequisites: ['binary-trees', 'queues'], typeCount: 5 },
  { id: 'topo-sort', name: 'Topological Sort', phase: 3, estHours: 8, prerequisites: ['graphs'], typeCount: 3 },
  { id: 'shortest-paths', name: 'Shortest Paths', phase: 3, estHours: 12, prerequisites: ['graphs', 'heaps'], typeCount: 4 },
  { id: 'union-find', name: 'Union-Find (DSU)', phase: 3, estHours: 8, prerequisites: ['graphs'], typeCount: 3 },
  { id: 'dp', name: 'Dynamic Programming', phase: 3, estHours: 35, prerequisites: ['recursion'], typeCount: 10 },
  { id: 'greedy', name: 'Greedy', phase: 3, estHours: 8, prerequisites: ['sorting', 'intervals'], typeCount: 4 },

  // Phase 4 — Advanced & Mocks
  { id: 'bit-manipulation', name: 'Bit Manipulation', phase: 4, estHours: 6, prerequisites: [], typeCount: 4 },
  { id: 'math', name: 'Math & Number Theory', phase: 4, estHours: 6, prerequisites: [], typeCount: 4 },
  { id: 'segment-tree', name: 'Segment Tree & Fenwick', phase: 4, estHours: 8, prerequisites: ['binary-trees'], typeCount: 2 },
  { id: 'design', name: 'Design Problems', phase: 4, estHours: 8, prerequisites: ['linked-lists', 'hashing', 'heaps'], typeCount: 4 },
  { id: 'mocks', name: 'Mock Interview Sets', phase: 4, estHours: 12, prerequisites: ['dp', 'graphs'], typeCount: 0 },
];

/** Total question types across the atlas — the number the Patterns screen shows. */
export const TOTAL_TYPES = ATLAS.reduce((sum, node) => sum + node.typeCount, 0);

/** 1 taught + 2 practice per type, before prove/sprint extras. */
export const CORE_PROBLEM_COUNT = TOTAL_TYPES * 3;
