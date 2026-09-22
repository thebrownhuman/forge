import type { Topic } from '../../schema';

export const heaps: Topic = {
  id: 'heaps',
  name: 'Heaps & Priority Queues',
  phase: 2,
  estHours: 10,
  prerequisites: ['stl'],

  whyItMatters:
    'A heap is the right answer whenever you need the extreme element repeatedly but never need a full ordering. That covers top-K, k-way merging, running medians and every greedy scheduling problem — and it powers Dijkstra in Phase 3. The recurring interview move is recognising that sorting gives you far more than the question asked for, and paying O(n log k) instead of O(n log n).',

  fundamentals: [
    {
      heading: 'What a heap gives you, and what it does not',
      body:
        'A binary heap is a complete tree stored in an array, keeping only one promise: every parent beats its children. That is enough for O(1) peek at the extreme and O(log n) push and pop — but it means nothing else is ordered. You cannot search a heap, you cannot iterate it in order, and you cannot remove an arbitrary element cheaply. When a problem needs any of those, you need a different structure or a second index.',
      costs: [
        { op: 'peek the extreme', cost: 'O(1)', note: '' },
        { op: 'push / pop', cost: 'O(log n)', note: 'sift up or down one path' },
        { op: 'build from n items', cost: 'O(n)', note: 'heapify beats n pushes — worth knowing' },
        { op: 'find an arbitrary element', cost: 'O(n)', note: 'no ordering to exploit' },
        { op: 'delete an arbitrary element', cost: 'O(n)', note: 'the reason LRU uses a list, not a heap' },
      ],
    },
    {
      heading: 'The inversion that trips everyone',
      body:
        'To keep the k LARGEST elements you use a MIN-heap of size k, because the element you want to evict is the smallest of your keepers and it must be instantly reachable. To keep the k smallest, use a max-heap. Say the rule out loud when you write it: "min-heap to keep the largest". Reaching for the heap that matches the adjective in the question is the single most common bug in this topic.',
      code: {
        cpp: `priority_queue<int> maxHeap;                                  // default: MAX
priority_queue<int, vector<int>, greater<int>> minHeap;       // greater => MIN

// keep the k largest:
minHeap.push(x);
if ((int)minHeap.size() > k) minHeap.pop();   // drops the smallest keeper`,
        java: `PriorityQueue<Integer> minHeap = new PriorityQueue<>();                      // default: MIN
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());

minHeap.add(x);
if (minHeap.size() > k) minHeap.poll();`,
      },
    },
    {
      heading: 'The two language defaults are opposites',
      body:
        'C++ priority_queue is a MAX-heap by default; passing greater<int> makes it a min-heap, which reads backwards to most people. Java PriorityQueue is a MIN-heap by default. Getting this wrong produces a solution that is structurally perfect and returns the opposite answer — so state which default you are working against before you write the declaration.',
    },
    {
      heading: 'Heap versus sorting versus quickselect',
      body:
        'Three tools for top-K, and you should be able to compare them unprompted. Sorting: O(n log n), simplest, gives you everything. Heap of size k: O(n log k), better when k is small, and the ONLY option on a stream because it never needs the whole input at once. Quickselect: O(n) average but O(n^2) worst case, O(1) space, and it destroys the input order. Naming the streaming constraint is usually what decides it.',
    },
  ],

  questionTypes: [
    {
      id: 'top-k',
      name: 'Top-K with a bounded heap',
      signal:
        '"K closest", "K most frequent", "K largest" — especially on a stream or when k is much smaller than n. Hold exactly k elements and evict the worst keeper each time.',
      time: 'O(n log k)',
      space: 'O(k)',
      googleHeavy: true,
      template: {
        cpp: `priority_queue<pair<long long,int>> maxHeap;    // keep the k SMALLEST distances
for (int i = 0; i < n; ++i) {
  maxHeap.push({dist(i), i});
  if ((int)maxHeap.size() > k) maxHeap.pop();   // evict the largest keeper
}`,
        java: `PriorityQueue<int[]> maxHeap = new PriorityQueue<>((a, b) -> b[0] - a[0]);
for (int i = 0; i < n; i++) {
  maxHeap.add(new int[]{dist(i), i});
  if (maxHeap.size() > k) maxHeap.poll();
}`,
      },
      taught: {
        lc: 973,
        title: 'K Closest Points to Origin',
        slug: 'k-closest-points-to-origin',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'Keeping the k SMALLEST distances needs a MAX-heap, so the worst keeper is on top and evictable. Also: never take a square root — comparing squared distances is equivalent and exact.',
        companies: ['google', 'meta', 'amazon'],
        whyThisOne:
          'It combines the heap inversion with a small numerical insight, and the interviewer almost always follows up with quickselect, giving you a natural chance to compare all three tools.',
        walkthrough: {
          howToSeeIt: [
            'Sorting all points by distance is O(n log n) and answers far more than was asked — you only need which k are closest, not their order relative to everything else.',
            'Hold exactly k candidates. To evict, you must instantly see the WORST of your keepers, which here is the farthest point. That means a max-heap, even though the question says "closest".',
            'Push each point; whenever the size exceeds k, pop the top. What remains is the k closest. O(n log k), and O(k) memory regardless of how large n is — which matters if the points arrive as a stream.',
            'Skip the square root. Distance ordering is preserved by squaring, and sqrt costs time and introduces floating-point error for no benefit. Mentioning this unprompted reads well.',
          ],
          wherePeopleLoseIt:
            'Reaching for a min-heap because the word is "closest". A min-heap of size k exposes the closest point, which is the one you never want to remove. Second trap: distances can exceed the 32-bit range when coordinates are large, so accumulate in a 64-bit type.',
          time: 'O(n log k).',
          space: 'O(k).',
          code: {
            cpp: `vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
  // MAX-heap keyed by squared distance: the top is the worst keeper.
  priority_queue<pair<long long, int>> maxHeap;

  for (int i = 0; i < (int)points.size(); ++i) {
    long long x = points[i][0], y = points[i][1];
    long long d = x * x + y * y;            // no sqrt, 64-bit

    maxHeap.push({d, i});
    if ((int)maxHeap.size() > k) maxHeap.pop();   // evict the farthest
  }

  vector<vector<int>> out;
  while (!maxHeap.empty()) { out.push_back(points[maxHeap.top().second]); maxHeap.pop(); }
  return out;
}`,
            java: `public int[][] kClosest(int[][] points, int k) {
  PriorityQueue<int[]> maxHeap =
      new PriorityQueue<>((a, b) -> Long.compare(dist(b), dist(a)));   // MAX by distance

  for (int[] p : points) {
    maxHeap.add(p);
    if (maxHeap.size() > k) maxHeap.poll();
  }

  int[][] out = new int[k][2];
  for (int i = 0; i < k; i++) out[i] = maxHeap.poll();
  return out;
}

private long dist(int[] p) {
  return (long) p[0] * p[0] + (long) p[1] * p[1];
}`,
          },
          followUp: 'Do it in O(n) average with quickselect, and state the trade: better average time, worse worst case, and it cannot handle a stream.',
        },
      },
      practice: [
        {
          lc: 692,
          title: 'Top K Frequent Words',
          slug: 'top-k-frequent-words',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight:
            'Two-level comparator — frequency ascending, then word DESCENDING alphabetically, because the eviction heap must be the inverse of the desired output order. Think it through slowly.',
          companies: ['amazon'],
        },
        {
          lc: 1046,
          title: 'Last Stone Weight',
          slug: 'last-stone-weight',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 15,
          insight: 'Flipped: repeatedly pull the two largest and push the difference back. Pure simulation, and the cleanest place to practise the C++ max-heap default.',
        },
      ],
    },

    {
      id: 'k-way-merge',
      name: 'K-way merge and ordered generation',
      signal:
        'Several sorted sequences, or a conceptual grid of sorted candidates, and you want them merged or the k-th smallest overall. Seed the heap with the frontier and refill from whichever source you consumed.',
      time: 'O(k log k) or O(N log k)',
      space: 'O(k)',
      template: {
        cpp: `priority_queue<tuple<int,int,int>, vector<tuple<int,int,int>>, greater<>> pq;
for (int i = 0; i < min(k, n1); ++i) pq.push({a[i] + b[0], i, 0});   // frontier only

while (k-- && !pq.empty()) {
  auto [sum, i, j] = pq.top(); pq.pop();
  out.push_back({a[i], b[j]});
  if (j + 1 < n2) pq.push({a[i] + b[j + 1], i, j + 1});              // advance one step
}`,
        java: `PriorityQueue<int[]> pq = new PriorityQueue<>((x, y) -> (a[x[0]] + b[x[1]]) - (a[y[0]] + b[y[1]]));
for (int i = 0; i < Math.min(k, a.length); i++) pq.add(new int[]{i, 0});

while (k-- > 0 && !pq.isEmpty()) {
  int[] cur = pq.poll();
  out.add(List.of(a[cur[0]], b[cur[1]]));
  if (cur[1] + 1 < b.length) pq.add(new int[]{cur[0], cur[1] + 1});
}`,
      },
      taught: {
        lc: 373,
        title: 'Find K Pairs with Smallest Sums',
        slug: 'find-k-pairs-with-smallest-sums',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 45,
        insight:
          'Never build all n·m pairs. Seed the heap with the first column only, and each time you take (i, j) push (i, j+1) — the frontier stays at most k wide.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'It generalises k-way merge from "several lists" to "an implicit sorted grid", which is the reframing behind the k-th smallest in a sorted matrix and several ugly-number problems.',
        walkthrough: {
          howToSeeIt: [
            'Generating every pair is O(n·m) work and memory before you even sort — impossible at the stated limits. So the pairs must be generated in increasing order, lazily.',
            'Picture the pairs as a grid where row i is a[i] paired with every b[j]. Each row is sorted because b is sorted, and each column is sorted because a is sorted. This is a k-way merge with n sorted rows.',
            'Seed the heap with the head of each row — that is (i, 0) — but only the first min(k, n) rows, since no more than k results are ever needed.',
            'Pop the smallest, record it, and push its right neighbour (i, j+1). Every pair enters the heap at most once, and the heap holds only the frontier, so the whole thing is O(k log k).',
          ],
          wherePeopleLoseIt:
            'Also pushing the downward neighbour (i+1, j), which generates the same pair from two directions and produces duplicates. Seeding the entire first column and then only ever moving right guarantees each cell is reached exactly once. If you seed only (0,0) instead, then you must push both neighbours AND carry a visited set.',
          time: 'O(k log k).',
          space: 'O(k).',
          code: {
            cpp: `vector<vector<int>> kSmallestPairs(vector<int>& a, vector<int>& b, int k) {
  vector<vector<int>> out;
  if (a.empty() || b.empty()) return out;

  // (sum, i, j), min-heap
  priority_queue<tuple<int,int,int>, vector<tuple<int,int,int>>, greater<>> pq;

  // Seed the first column only: each row's head. Moving right is the only move.
  for (int i = 0; i < min((int)a.size(), k); ++i) pq.push({a[i] + b[0], i, 0});

  while (k-- > 0 && !pq.empty()) {
    auto [sum, i, j] = pq.top(); pq.pop();
    out.push_back({a[i], b[j]});

    if (j + 1 < (int)b.size()) pq.push({a[i] + b[j + 1], i, j + 1});
  }
  return out;
}`,
            java: `public List<List<Integer>> kSmallestPairs(int[] a, int[] b, int k) {
  List<List<Integer>> out = new ArrayList<>();
  if (a.length == 0 || b.length == 0) return out;

  PriorityQueue<int[]> pq = new PriorityQueue<>(
      (x, y) -> Integer.compare(a[x[0]] + b[x[1]], a[y[0]] + b[y[1]]));

  for (int i = 0; i < Math.min(a.length, k); i++) pq.add(new int[]{i, 0});

  while (k-- > 0 && !pq.isEmpty()) {
    int[] cur = pq.poll();
    out.add(List.of(a[cur[0]], b[cur[1]]));

    if (cur[1] + 1 < b.length) pq.add(new int[]{cur[0], cur[1] + 1});
  }
  return out;
}`,
          },
          followUp: 'The k-th smallest in a fully sorted matrix (LC 378) — the same frontier idea, or binary search on the VALUE with an O(n) counting check.',
        },
      },
      practice: [
        {
          lc: 378,
          title: 'Kth Smallest Element in a Sorted Matrix',
          slug: 'kth-smallest-element-in-a-sorted-matrix',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight: 'Solve it twice: heap frontier, then binary search on the answer value counting elements <= mid. Comparing the two is the real lesson.',
          companies: ['google'],
        },
        {
          lc: 264,
          title: 'Ugly Number II',
          slug: 'ugly-number-ii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight:
            'Flipped: the sequence generates itself — pop the smallest and push its multiples by 2, 3 and 5. A set prevents duplicates, and the three-pointer DP version removes the heap entirely.',
        },
      ],
    },

    {
      id: 'two-heaps',
      name: 'Two heaps for a running median',
      signal:
        '"Median of a stream", "balance two halves", "the middle element as data arrives". A max-heap for the lower half, a min-heap for the upper, kept within one element of each other.',
      time: 'O(log n) per insert, O(1) per query',
      space: 'O(n)',
      template: {
        cpp: `priority_queue<int> lo;                                   // max-heap, lower half
priority_queue<int, vector<int>, greater<int>> hi;        // min-heap, upper half

void add(int x) {
  lo.push(x);                    // always into lo first
  hi.push(lo.top()); lo.pop();   // move its largest across: keeps order correct
  if (hi.size() > lo.size()) { lo.push(hi.top()); hi.pop(); }   // rebalance
}
double median() {
  return lo.size() > hi.size() ? lo.top() : (lo.top() + hi.top()) / 2.0;
}`,
        java: `PriorityQueue<Integer> lo = new PriorityQueue<>(Comparator.reverseOrder());
PriorityQueue<Integer> hi = new PriorityQueue<>();

void add(int x) {
  lo.add(x);
  hi.add(lo.poll());
  if (hi.size() > lo.size()) lo.add(hi.poll());
}`,
      },
      taught: {
        lc: 295,
        title: 'Find Median from Data Stream',
        slug: 'find-median-from-data-stream',
        difficulty: 'hard',
        role: 'taught',
        estMinutes: 45,
        insight:
          'Split the data at the median. The max-heap top and min-heap top are the two middle elements, so the median is O(1) once the halves stay balanced.',
        companies: ['google', 'amazon', 'meta'],
        whyThisOne:
          'The definitive two-heaps problem, and the push-then-move-then-rebalance sequence is a genuinely elegant way to avoid a pile of comparison branches.',
        walkthrough: {
          howToSeeIt: [
            'Re-sorting on every query is O(n log n) per call. Inserting into a sorted array is O(n) per insert. Both are too slow, and neither exploits the fact that only the MIDDLE matters.',
            'You never need the elements in order — only the one or two at the centre. So keep the smaller half in a max-heap (its top is the largest of the small values) and the larger half in a min-heap (its top is the smallest of the large values). Those two tops straddle the median.',
            'Insert without branching: always push into lo, immediately move lo\'s top into hi, then if hi has grown larger, move its top back. The round trip guarantees the value lands on the correct side no matter where it belongs.',
            'Maintain lo.size() equal to hi.size() or exactly one greater. Odd total: lo\'s top is the median. Even total: average the two tops.',
          ],
          wherePeopleLoseIt:
            'Pushing directly into whichever heap "looks right" based on a comparison. It works until an insert belongs on the far side of the current median and the invariant silently breaks. The unconditional push-move-rebalance is three lines and cannot be wrong. Second trap: integer overflow when averaging two large ints — divide as doubles.',
          time: 'O(log n) insert, O(1) median.',
          space: 'O(n).',
          code: {
            cpp: `class MedianFinder {
  priority_queue<int> lo;                                // max-heap: lower half
  priority_queue<int, vector<int>, greater<int>> hi;     // min-heap: upper half

public:
  void addNum(int num) {
    lo.push(num);                      // 1. always into lo
    hi.push(lo.top()); lo.pop();       // 2. hand its largest to hi (places it correctly)

    if (hi.size() > lo.size()) {       // 3. rebalance so lo >= hi
      lo.push(hi.top()); hi.pop();
    }
  }

  double findMedian() {
    if (lo.size() > hi.size()) return lo.top();
    return (lo.top() + hi.top()) / 2.0;
  }
};`,
            java: `class MedianFinder {
  private final PriorityQueue<Integer> lo = new PriorityQueue<>(Comparator.reverseOrder());
  private final PriorityQueue<Integer> hi = new PriorityQueue<>();

  public void addNum(int num) {
    lo.add(num);
    hi.add(lo.poll());
    if (hi.size() > lo.size()) lo.add(hi.poll());
  }

  public double findMedian() {
    if (lo.size() > hi.size()) return lo.peek();
    return (lo.peek() + hi.peek()) / 2.0;
  }
}`,
          },
          followUp: 'If all values are 0 to 100, counting buckets give O(1) insert. And if 99% of values are in a small range, bucket the common case and heap the tail — a good systems answer.',
        },
      },
      practice: [
        {
          lc: 480,
          title: 'Sliding Window Median',
          slug: 'sliding-window-median',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 60,
          insight:
            'Two heaps plus REMOVAL, which heaps do not support. Lazy deletion with a map of pending removals, or two multisets. The problem that shows exactly where heaps run out.',
        },
        {
          lc: 502,
          title: 'IPO',
          slug: 'ipo',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 45,
          insight: 'Flipped: two heaps with different keys — a min-heap on capital to unlock projects, a max-heap on profit to pick among the unlocked.',
          companies: ['google'],
        },
      ],
    },

    {
      id: 'heap-scheduling',
      name: 'Greedy scheduling with a heap',
      signal:
        '"Schedule tasks with a cooldown", "reorganise so no two adjacent match", "process in priority order as items become available". The heap repeatedly answers "what is the best legal choice right now?".',
      time: 'O(n log k)',
      space: 'O(k)',
      template: {
        cpp: `priority_queue<int> pq;                    // most frequent first
for (auto& [item, count] : freq) pq.push(count);

while (!pq.empty()) {
  vector<int> held;                        // taken this round, cannot reuse yet
  for (int i = 0; i < cooldown && !pq.empty(); ++i) {
    int c = pq.top(); pq.pop();
    if (--c > 0) held.push_back(c);
  }
  for (int c : held) pq.push(c);           // return them after the cooldown
}`,
        java: `PriorityQueue<Integer> pq = new PriorityQueue<>(Comparator.reverseOrder());
for (int f : freq) if (f > 0) pq.add(f);

while (!pq.isEmpty()) {
  List<Integer> held = new ArrayList<>();      // taken this round, cannot reuse yet
  for (int i = 0; i < cooldown && !pq.isEmpty(); i++) {
    int c = pq.poll();
    if (--c > 0) held.add(c);
  }
  pq.addAll(held);                             // return them after the cooldown
}`,
      },
      taught: {
        lc: 621,
        title: 'Task Scheduler',
        slug: 'task-scheduler',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          'Always run the most frequent remaining task, because it is the one most likely to be blocked later. A heap delivers that choice in O(log k) each round.',
        companies: ['google', 'meta', 'amazon'],
        whyThisOne:
          'It teaches the greedy-with-a-heap shape and has a closed-form counting solution as a follow-up, so you get both the general tool and the specific insight.',
        walkthrough: {
          howToSeeIt: [
            'Only the COUNTS matter, not the identities — the labels never affect legality, just how many of each remain. So reduce the input to a frequency multiset immediately.',
            'Greedy choice: schedule the most frequent remaining task first. Intuition: the bottleneck is whichever task has the most copies left, so delaying it only makes the ending worse. A heap gives that task in O(log k).',
            'Each round consumes up to n+1 distinct tasks — one slot for the task plus its cooldown. Hold the ones you used aside, decrement their counts, and push the survivors back only after the round completes. Returning them early would let a task repeat inside its own cooldown.',
            'Count the time: a full round costs n+1 ticks, but the final round costs only as many ticks as tasks actually ran, because trailing idles are not required.',
          ],
          wherePeopleLoseIt:
            'Pushing decremented counts straight back into the heap during the round, which permits an immediate repeat and undercounts the idle time. The hold-aside list is what enforces the cooldown. The closed form — (maxCount - 1) * (n + 1) + numberOfTasksWithMaxCount, floored at the total task count — is worth knowing as the follow-up.',
          time: 'O(n log k) with the heap, O(n) with the formula.',
          space: 'O(k), at most 26 here.',
          code: {
            cpp: `int leastInterval(vector<char>& tasks, int n) {
  vector<int> freq(26, 0);
  for (char c : tasks) ++freq[c - 'A'];

  priority_queue<int> pq;                       // most frequent on top
  for (int f : freq) if (f > 0) pq.push(f);

  int time = 0;
  while (!pq.empty()) {
    vector<int> held;                           // held until the round ends
    int slots = n + 1;

    while (slots-- > 0 && !pq.empty()) {
      int c = pq.top(); pq.pop();
      if (--c > 0) held.push_back(c);
      ++time;                                   // a real task ran
    }

    for (int c : held) pq.push(c);              // only NOW may they run again
    if (!pq.empty()) time += slots + 1;         // pad with idles, except in the last round
  }
  return time;
}`,
            java: `public int leastInterval(char[] tasks, int n) {
  int[] freq = new int[26];
  for (char c : tasks) freq[c - 'A']++;

  PriorityQueue<Integer> pq = new PriorityQueue<>(Comparator.reverseOrder());
  for (int f : freq) if (f > 0) pq.add(f);

  int time = 0;
  while (!pq.isEmpty()) {
    List<Integer> held = new ArrayList<>();
    int slots = n + 1;

    while (slots-- > 0 && !pq.isEmpty()) {
      int c = pq.poll();
      if (--c > 0) held.add(c);
      time++;
    }

    pq.addAll(held);
    if (!pq.isEmpty()) time += slots + 1;
  }
  return time;
}`,
          },
          followUp: 'Derive the O(n) formula and explain why it is correct — the max-frequency task defines a skeleton of rows and everything else fills the gaps.',
        },
      },
      practice: [
        {
          lc: 767,
          title: 'Reorganize String',
          slug: 'reorganize-string',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight: 'Cooldown of 1: take the two most frequent each round. Impossible exactly when one character exceeds (n+1)/2 — prove that bound before coding.',
          companies: ['google', 'amazon'],
        },
        {
          lc: 1834,
          title: 'Single-Threaded CPU',
          slug: 'single-threaded-cpu',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 45,
          insight:
            'Flipped: tasks become AVAILABLE over time, so sort by arrival and feed the heap as the clock advances. The pattern behind most event-driven simulations.',
        },
      ],
    },
  ],
};
