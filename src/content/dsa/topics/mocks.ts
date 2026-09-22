import type { MockSet, Problem, RubricItem, Topic } from '../../schema';

/**
 * The same rubric scores every set, because the thing being measured is the same
 * thing every time: did you behave like someone worth hiring, not just someone who
 * eventually produced working code. Weights total 100.
 *
 * "Correct solution" is worth 30 on purpose. In a real loop you can solve both
 * problems and still fail on silence, and you can miss the optimal and still pass
 * on reasoning. Scoring it any other way teaches the wrong lesson.
 */
const RUBRIC: RubricItem[] = [
  {
    id: 'clarify',
    criterion: 'Clarified before coding',
    weight: 10,
    whatGoodLooksLike:
      'You asked about input size, duplicates, empty input and value ranges, and you restated the problem in your own words before touching the keyboard.',
  },
  {
    id: 'approach',
    criterion: 'Approach and complexity stated up front',
    weight: 20,
    whatGoodLooksLike:
      'You named the technique and its time and space cost before writing a line, and you said why the brute force is not enough rather than skipping past it.',
  },
  {
    id: 'correct',
    criterion: 'Working solution',
    weight: 30,
    whatGoodLooksLike:
      'The code runs on the examples and on the edge cases you raised. Not "nearly right" — right.',
  },
  {
    id: 'edges',
    criterion: 'Edge cases handled',
    weight: 15,
    whatGoodLooksLike:
      'Empty, single element, all-equal, overflow and the off-by-one at the boundary are handled in the code, not just mentioned.',
  },
  {
    id: 'dryrun',
    criterion: 'Dry run before declaring done',
    weight: 15,
    whatGoodLooksLike:
      'You traced a non-trivial input by hand and found your own bug, rather than saying "that should work".',
  },
  {
    id: 'comms',
    criterion: 'Talked throughout',
    weight: 10,
    whatGoodLooksLike:
      'No silent stretch longer than about thirty seconds. When stuck, you said what you were considering and why you rejected it.',
  },
];

function prove(
  lc: number,
  title: string,
  slug: string,
  difficulty: Problem['difficulty'],
  estMinutes: number,
  insight: string,
): Problem {
  return { lc, title, slug, difficulty, role: 'prove', estMinutes, insight };
}

/**
 * Deliberate constraint: not one of these forty problems appears anywhere in the
 * learning ladder. A mock you have already been walked through measures recall,
 * not readiness.
 */
const SETS: MockSet[] = [
  {
    id: 'mock-01-arrays-strings',
    name: 'Set 1 — Arrays and strings',
    minutes: 60,
    focus:
      'Index arithmetic under pressure. Both problems are easy to start and easy to get subtly wrong at the boundary.',
    problems: [
      prove(189, 'Rotate Array', 'rotate-array', 'medium', 25,
        'Three reversals in place. If you reached for an extra array, you solved a different, easier question than the one asked.'),
      prove(5, 'Longest Palindromic Substring', 'longest-palindromic-substring', 'medium', 35,
        'Expand around every centre, and remember there are 2n-1 centres, not n. The even-length case is the one people forget under a clock.'),
    ],
    rubric: RUBRIC,
    passBar:
      'Both solved, at least one in the optimal complexity, and you named the O(1)-space constraint on the first problem before being prompted.',
  },
  {
    id: 'mock-02-two-pointers-window',
    name: 'Set 2 — Two pointers and sliding window',
    minutes: 60,
    focus:
      'Choosing between a fixed and a variable window, and knowing when sorting is allowed to destroy the input order.',
    problems: [
      prove(611, 'Valid Triangle Number', 'valid-triangle-number', 'medium', 25,
        'Sort, fix the largest side, then two-pointer the rest. Counting all pairs at once instead of one at a time is what turns O(n^3) into O(n^2).'),
      prove(1004, 'Max Consecutive Ones III', 'max-consecutive-ones-iii', 'medium', 30,
        'A window that is allowed at most k zeros. The window never shrinks below its best size, which is why the answer is just the final width.'),
    ],
    rubric: RUBRIC,
    passBar:
      'Both solved in the optimal complexity. If you wrote a nested loop on the first, you have not internalised the pattern yet — repeat the topic.',
  },
  {
    id: 'mock-03-hashing-prefix',
    name: 'Set 3 — Hashing and prefix sums',
    minutes: 70,
    focus:
      'The prefix-sum-plus-hash-map move, first in one dimension and then in two. The second problem is a genuine hard.',
    problems: [
      prove(525, 'Contiguous Array', 'contiguous-array', 'medium', 25,
        'Map 0 to -1 and the question becomes "longest subarray summing to zero", which is a first-seen-index hash map.'),
      prove(1074, 'Number of Submatrices That Sum to Target', 'number-of-submatrices-that-sum-to-target', 'hard', 40,
        'Fix a pair of rows, collapse to one dimension, and it is subarray-sum-equals-k inside. The outer loop is O(rows^2) and that is fine.'),
    ],
    rubric: RUBRIC,
    passBar:
      'First solved cleanly. On the second, reducing to the 1-D subproblem out loud counts as a pass even if the code does not fully land.',
  },
  {
    id: 'mock-04-linked-lists',
    name: 'Set 4 — Linked lists',
    minutes: 55,
    focus:
      'Pointer surgery with no room for hand-waving. This is the set that exposes whether the linked-list topic actually stuck.',
    problems: [
      prove(61, 'Rotate List', 'rotate-list', 'medium', 25,
        'Close the list into a ring, walk to the new tail at length - k % length, then cut. Taking k modulo the length before anything else avoids the pointless walk.'),
      prove(445, 'Add Two Numbers II', 'add-two-numbers-ii', 'medium', 30,
        'Digits are most-significant first and you may not reverse. Two stacks, or build the result by prepending. The carry out of the final column is the classic miss.'),
    ],
    rubric: RUBRIC,
    passBar:
      'Both solved without drawing a wrong diagram twice. Draw three nodes before you write anything — if you skipped that and got lost, that is the finding.',
  },
  {
    id: 'mock-05-stacks-monotonic',
    name: 'Set 5 — Stacks and monotonic stacks',
    minutes: 65,
    focus:
      'Simulation first, then the monotonic stack as a counting device rather than a lookup device.',
    problems: [
      prove(735, 'Asteroid Collision', 'asteroid-collision', 'medium', 25,
        'Only a right-mover already on the stack meeting a left-mover collides. Getting the three outcomes — pop, break, push — in the right order is the whole problem.'),
      prove(907, 'Sum of Subarray Minimums', 'sum-of-subarray-minimums', 'medium', 35,
        'Count, for each element, how many subarrays it is the minimum of: previous-smaller and next-smaller spans multiplied. Strict on one side and non-strict on the other, or equal values get double-counted.'),
    ],
    rubric: RUBRIC,
    passBar:
      'Both solved. On the second, explicitly handling the duplicate-values tie-break earns the pass even if the arithmetic slips.',
  },
  {
    id: 'mock-06-trees',
    name: 'Set 6 — Binary trees',
    minutes: 60,
    focus:
      'One BFS with index bookkeeping, one post-order where the return value is a flow, not a value. Different muscles.',
    problems: [
      prove(662, 'Maximum Width of Binary Tree', 'maximum-width-of-binary-tree', 'medium', 25,
        'Index nodes as in a heap, 2i and 2i+1, and subtract the leftmost index on each level or the numbers overflow on a deep skewed tree.'),
      prove(979, 'Distribute Coins in Binary Tree', 'distribute-coins-in-binary-tree', 'medium', 30,
        'Each edge carries |excess| coins. Return the excess from each subtree and accumulate the absolute value on the way up — the moves are the sum of the flows.'),
    ],
    rubric: RUBRIC,
    passBar:
      'Both solved. On the second, saying "the answer is the total flow across edges" before coding is worth more than getting there by trial and error.',
  },
  {
    id: 'mock-07-bst-heaps',
    name: 'Set 7 — BSTs and heaps',
    minutes: 55,
    focus:
      'Ordered iteration without materialising everything, and spotting that a greedy needs a heap to stay correct.',
    problems: [
      prove(1305, 'All Elements in Two BSTs', 'all-elements-in-two-binary-search-trees', 'medium', 25,
        'Two iterative in-order traversals merged like merge-sort. Flattening both to lists first works and is worth saying, but the O(height) space version is the one they want.'),
      prove(1642, 'Furthest Building You Can Reach', 'furthest-building-you-can-reach', 'medium', 30,
        'Spend ladders on every climb, then downgrade the smallest ladder used so far to bricks via a min-heap. Greedy without the heap is wrong, not just slow.'),
    ],
    rubric: RUBRIC,
    passBar:
      'Both solved. On the second, a counter-example showing why "ladders on the biggest climbs, decided upfront" fails is a strong signal on its own.',
  },
  {
    id: 'mock-08-graphs',
    name: 'Set 8 — Graphs',
    minutes: 70,
    focus:
      'A grid flood fill with a boundary condition, then a BFS where the nodes are not the obvious thing.',
    problems: [
      prove(1254, 'Number of Closed Islands', 'number-of-closed-islands', 'medium', 25,
        'Flood the land touching the border first and erase it; count what is left. Trying to detect "closed" during the count is where this gets messy.'),
      prove(815, 'Bus Routes', 'bus-routes', 'hard', 40,
        'BFS over routes, not stops. Build stop → routes, and mark routes visited — modelling it as a graph of stops gives the wrong distance metric entirely.'),
    ],
    rubric: RUBRIC,
    passBar:
      'First solved. On the second, identifying that the BFS layer is "one bus ride" is the pass condition even if you run out of clock.',
  },
  {
    id: 'mock-09-dp',
    name: 'Set 9 — Dynamic programming',
    minutes: 75,
    focus:
      'A sort-then-DP, and a DP that needs binary search inside it. Both are about finding the ordering that makes the recurrence legal.',
    problems: [
      prove(1048, 'Longest String Chain', 'longest-string-chain', 'medium', 30,
        'Sort by length, then for each word try deleting each character and look up the predecessor. The sort is what makes the subproblem already solved.'),
      prove(1235, 'Maximum Profit in Job Scheduling', 'maximum-profit-in-job-scheduling', 'hard', 40,
        'Sort by end time, dp[i] = max(skip, take + dp[last non-overlapping]), and find that last one by binary search. Weighted interval scheduling — greedy by profit is wrong.'),
    ],
    rubric: RUBRIC,
    passBar:
      'First solved. On the second, stating the recurrence correctly with the binary search named is a pass; a clean greedy counter-example is half of that.',
  },
  {
    id: 'mock-10-mixed-final',
    name: 'Set 10 — Mixed, no warning',
    minutes: 70,
    focus:
      'No topic label. This is the closest thing to the real thing: two problems whose technique you have to recognise cold.',
    problems: [
      prove(456, '132 Pattern', '132-pattern', 'medium', 30,
        'Scan from the right with a monotonic decreasing stack, tracking the largest popped value as the candidate "2". Trying to fix the middle element first is the trap.'),
      prove(1345, 'Jump Game IV', 'jump-game-iv', 'hard', 40,
        'BFS for shortest jumps, with a value → indices map. Clear each value bucket after first use or the search degrades to quadratic on an array of equal values.'),
    ],
    rubric: RUBRIC,
    passBar:
      'Both recognised within five minutes and at least one solved. Recognition speed is what this set measures — the code is secondary.',
  },
];

export const mocks: Topic = {
  id: 'mocks',
  name: 'Mock Interview Sets',
  phase: 4,
  estHours: 12,
  prerequisites: ['dp', 'graphs'],
  whyItMatters:
    'Solving problems and performing in an interview are different skills, and only one of them gets you the offer. These ten sets are timed, unseen, and scored against a rubric that weights how you worked as heavily as whether you finished. Run them in the last six weeks, one every few days, and fix what the scores expose rather than grinding more new problems.',
  fundamentals: [
    {
      heading: 'How to run a set',
      body:
        'Clock visible, both problems open, no editorials, no compiler help beyond what a shared doc gives you. Say everything out loud even alone — the silence is the thing being trained. When the clock stops, stop, even mid-line. Then score yourself before you look at anything.',
    },
    {
      heading: 'Score it honestly or do not score it',
      body:
        'The rubric is worthless if you round yourself up. "Working solution" means it ran on your edge cases, not that it would have with five more minutes. A 55 that you believe is far more useful than an 80 you negotiated with yourself, because only the honest number tells you what to fix.',
    },
    {
      heading: 'What a bad score actually means',
      body:
        'Losing points on approach or communication is a rehearsal problem and fixes fast — do two more sets. Losing points on correctness across several sets is a content problem: go back to the topic those problems came from and redo its question types. Do not answer a correctness gap with more mocks.',
    },
    {
      heading: 'Spacing',
      body:
        'One set every two or three days across the final six weeks, not ten in a fortnight. Each set should be followed by a session fixing what it exposed, otherwise you are only collecting scores. Set 10 is deliberately unlabelled — save it for last.',
    },
  ],
  questionTypes: [],
  mockSets: SETS,
};
