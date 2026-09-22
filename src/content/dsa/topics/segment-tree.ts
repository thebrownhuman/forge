import type { Topic } from '../../schema';

export const segmentTree: Topic = {
  id: 'segment-tree',
  name: 'Segment Tree & Fenwick',
  phase: 4,
  estHours: 8,
  prerequisites: ['binary-trees'],

  whyItMatters:
    'These structures exist for one situation: range queries mixed with updates. Prefix sums give O(1) queries but O(n) updates; a plain loop gives O(1) updates but O(n) queries. When both happen often, both are too slow, and a Fenwick or segment tree gives O(log n) for each. This is awareness-level material for most interviews — you should recognise the need and be able to sketch the structure, but you are unlikely to be asked to implement lazy propagation from scratch.',

  fundamentals: [
    {
      heading: 'Know which structure the problem needs',
      body:
        'Static array, many range queries, no updates: PREFIX SUMS, and reaching for anything fancier is over-engineering. Point updates plus prefix or range SUM queries: FENWICK TREE (binary indexed tree) — about fifteen lines and the one to prefer when it fits. Range queries for min, max, gcd or any associative operation, or range updates: SEGMENT TREE. Say which you chose and why before writing any code; the choice is most of the credit.',
      costs: [
        { op: 'prefix sums: query / update', cost: 'O(1) / O(n)', note: 'static data only' },
        { op: 'Fenwick: query / update', cost: 'O(log n) / O(log n)', note: 'sums only, tiny code' },
        { op: 'segment tree: query / update', cost: 'O(log n) / O(log n)', note: 'any associative operation' },
        { op: 'segment tree with lazy propagation', cost: 'O(log n) range update', note: 'awareness level' },
        { op: 'build', cost: 'O(n)', note: 'both structures' },
      ],
    },
    {
      heading: 'The Fenwick trick, in one sentence',
      body:
        'Index i is responsible for a block of values whose length is the lowest set bit of i. That is why both loops move by i += i & -i when updating and i -= i & -i when querying — each step jumps to the next responsible block, and there are at most log n of them. You do not need to derive this in an interview, but you should be able to state it rather than presenting the code as magic.',
      code: {
        cpp: `struct Fenwick {
  vector<long long> tree;                    // 1-indexed internally
  Fenwick(int n) : tree(n + 1, 0) {}

  void add(int i, long long delta) {         // point update
    for (++i; i < (int)tree.size(); i += i & -i) tree[i] += delta;
  }

  long long prefix(int i) {                  // sum of [0, i]
    long long total = 0;
    for (++i; i > 0; i -= i & -i) total += tree[i];
    return total;
  }

  long long range(int l, int r) { return prefix(r) - prefix(l - 1); }
};`,
        java: `class Fenwick {
  private final long[] tree;

  Fenwick(int n) { tree = new long[n + 1]; }

  void add(int i, long delta) {
    for (i++; i < tree.length; i += i & -i) tree[i] += delta;
  }

  long prefix(int i) {
    long total = 0;
    for (i++; i > 0; i -= i & -i) total += tree[i];
    return total;
  }
}`,
      },
    },
    {
      heading: 'The iterative segment tree is shorter than the recursive one',
      body:
        'Store the tree in an array of size 2n, with the leaves occupying positions n through 2n-1 and every internal node at position i covering the children at 2i and 2i+1. Updates walk upward from a leaf; queries walk inward from both ends. No recursion, no explicit node objects, and roughly fifteen lines. Learn this version — the recursive one with four parameters is much easier to get wrong under pressure.',
    },
    {
      heading: 'Coordinate compression makes huge ranges tractable',
      body:
        'Many problems involve values up to 10^9, which cannot be an array index. Collect every value that actually appears, sort and deduplicate them, and map each to its rank. The structure then only needs as many slots as there are DISTINCT values. This step is what makes counting-inversions and range-sum problems on arbitrary integers possible, and forgetting it is why a correct algorithm runs out of memory.',
    },
  ],

  questionTypes: [
    {
      id: 'fenwick-prefix',
      name: 'Fenwick tree for prefix sums with updates',
      signal:
        'Point updates interleaved with range-sum queries, or counting "how many earlier elements are smaller" while scanning. Prefix sums fail because updates are frequent.',
      time: 'O(log n) per operation',
      space: 'O(n)',
      googleHeavy: true,
      template: {
        cpp: `void add(int i, long long delta) {
  for (++i; i < (int)tree.size(); i += i & -i) tree[i] += delta;
}

long long prefix(int i) {
  long long total = 0;
  for (++i; i > 0; i -= i & -i) total += tree[i];
  return total;
}`,
        java: `void add(int i, long delta) {
  for (i++; i < tree.length; i += i & -i) tree[i] += delta;
}

long prefix(int i) {
  long total = 0;
  for (i++; i > 0; i -= i & -i) total += tree[i];
  return total;
}`,
      },
      taught: {
        lc: 307,
        title: 'Range Sum Query - Mutable',
        slug: 'range-sum-query-mutable',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 45,
        insight:
          'The word "Mutable" in the title is the whole signal. Prefix sums make queries O(1) but updates O(n); a Fenwick tree balances both at O(log n).',
        companies: ['google'],
        whyThisOne:
          'It is the minimal problem where prefix sums genuinely fail, so the structure is motivated rather than imposed — which is how you should present it in an interview.',
        walkthrough: {
          howToSeeIt: [
            'Compare the two naive options out loud. A prefix-sum array answers queries in O(1) but every update rebuilds a suffix, which is O(n). A plain array updates in O(1) but sums in O(n). With both operations frequent, each is quadratic overall.',
            'You want a structure where both cost O(log n). The idea: store partial sums over blocks arranged so that any prefix is the sum of at most log n of them, and any element belongs to at most log n blocks.',
            'A Fenwick tree does that, with index i covering a block whose length is the lowest set bit of i. Updating walks upward by i += i & -i; querying a prefix walks downward by i -= i & -i.',
            'update() takes a DELTA, so the class must remember the current values to compute newValue minus oldValue. Forgetting that stored copy is the most common implementation slip.',
          ],
          wherePeopleLoseIt:
            'Two things. Passing the new value instead of the delta to add(), which corrupts every stored sum. And index confusion: the Fenwick array is 1-indexed internally while the problem is 0-indexed, so the ++i and --i conversions must be consistent — pick one convention and put it in a comment.',
          time: 'O(log n) for both update and query, O(n log n) to build.',
          space: 'O(n).',
          code: {
            cpp: `class NumArray {
  vector<long long> tree;      // Fenwick, 1-indexed internally
  vector<int> values;          // current values, needed to compute deltas
  int n;

  void add(int i, long long delta) {
    for (++i; i <= n; i += i & -i) tree[i] += delta;
  }

  long long prefix(int i) {
    long long total = 0;
    for (++i; i > 0; i -= i & -i) total += tree[i];
    return total;
  }

public:
  NumArray(vector<int>& nums) : tree(nums.size() + 1, 0), values(nums), n((int)nums.size()) {
    for (int i = 0; i < n; ++i) add(i, nums[i]);
  }

  void update(int index, int val) {
    add(index, (long long)val - values[index]);   // DELTA, not the new value
    values[index] = val;
  }

  int sumRange(int left, int right) {
    return (int)(prefix(right) - (left > 0 ? prefix(left - 1) : 0));
  }
};`,
            java: `class NumArray {
  private final long[] tree;
  private final int[] values;
  private final int n;

  public NumArray(int[] nums) {
    n = nums.length;
    tree = new long[n + 1];
    values = nums.clone();
    for (int i = 0; i < n; i++) add(i, nums[i]);
  }

  private void add(int i, long delta) {
    for (i++; i <= n; i += i & -i) tree[i] += delta;
  }

  private long prefix(int i) {
    long total = 0;
    for (i++; i > 0; i -= i & -i) total += tree[i];
    return total;
  }

  public void update(int index, int val) {
    add(index, (long) val - values[index]);
    values[index] = val;
  }

  public int sumRange(int left, int right) {
    return (int) (prefix(right) - (left > 0 ? prefix(left - 1) : 0));
  }
}`,
          },
          followUp: 'Range UPDATE with point query — store deltas instead of values, which turns the Fenwick into a difference array with fast prefix reconstruction.',
        },
      },
      practice: [
        {
          lc: 315,
          title: 'Count of Smaller Numbers After Self',
          slug: 'count-of-smaller-numbers-after-self',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 60,
          insight:
            'Scan right to left, querying the Fenwick for how many smaller values were already seen, then inserting the current one. Needs coordinate compression first.',
          companies: ['google'],
        },
        {
          lc: 327,
          title: 'Count of Range Sum',
          slug: 'count-of-range-sum',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 60,
          insight:
            'Flipped onto prefix sums: count earlier prefixes lying inside a value window. Merge sort solves it too — comparing the two approaches is the exercise.',
        },
      ],
    },

    {
      id: 'segment-tree-range',
      name: 'Segment tree for range queries',
      signal:
        'Range min, max, gcd, or a custom associative merge — or range updates that must apply to a whole interval at once. Anything a Fenwick cannot express.',
      time: 'O(log n) per operation',
      space: 'O(n)',
      template: {
        cpp: `// Iterative segment tree: leaves at [n, 2n), parent of i is i/2.
vector<long long> t(2 * n, 0);

void update(int i, long long value) {
  for (t[i += n] = value; i > 1; i >>= 1)
    t[i >> 1] = merge(t[i], t[i ^ 1]);          // recompute ancestors
}

long long query(int l, int r) {                 // [l, r)
  long long res = IDENTITY;
  for (l += n, r += n; l < r; l >>= 1, r >>= 1) {
    if (l & 1) res = merge(res, t[l++]);        // l is a right child: take it
    if (r & 1) res = merge(res, t[--r]);        // r is a right child: take r-1
  }
  return res;
}`,
        java: `long[] t = new long[2 * n];

void update(int i, long value) {
  for (t[i += n] = value; i > 1; i >>= 1)
    t[i >> 1] = merge(t[i], t[i ^ 1]);
}

long query(int l, int r) {
  long res = IDENTITY;
  for (l += n, r += n; l < r; l >>= 1, r >>= 1) {
    if ((l & 1) == 1) res = merge(res, t[l++]);
    if ((r & 1) == 1) res = merge(res, t[--r]);
  }
  return res;
}`,
      },
      taught: {
        lc: 699,
        title: 'Falling Squares',
        slug: 'falling-squares',
        difficulty: 'hard',
        role: 'taught',
        estMinutes: 55,
        insight:
          'Each square needs the MAXIMUM height over an interval, then sets that whole interval to a new height. Range max plus range assignment is exactly what a segment tree is for.',
        companies: ['google'],
        whyThisOne:
          'It is a problem where the structure is genuinely necessary rather than decorative, and it forces coordinate compression, which is half of applying these structures in practice.',
        walkthrough: {
          howToSeeIt: [
            'Model one square: it lands on the tallest thing already occupying its horizontal span, so its top is (max height over that interval) + its side length. Then that interval becomes that height.',
            'So the two operations are range MAX query and range ASSIGN update. Fenwick cannot do either cleanly — max is not invertible and there is no range assignment — so a segment tree is the right structure.',
            'Coordinates reach 10^8, which cannot index an array. Collect all the interval endpoints, sort, deduplicate, and map each to its rank. The tree then only needs as many leaves as there are distinct endpoints.',
            'Process the squares in order, querying then updating, and track a running maximum for the answer after each drop. At the stated limits an O(n^2) brute force over previous squares also passes — say that, then present the segment tree as the scalable answer.',
          ],
          wherePeopleLoseIt:
            'Half-open versus closed intervals. A square covering [left, left + size) must not be treated as touching the next square that starts exactly at left + size — they only meet at a point. Fix the convention as half-open, map both endpoints, and apply it consistently or the heights leak sideways.',
          time: 'O(n log n) with the segment tree.',
          space: 'O(n).',
          code: {
            cpp: `vector<int> fallingSquares(vector<vector<int>>& positions) {
  // 1. Coordinate compression over all endpoints.
  vector<int> xs;
  for (auto& p : positions) { xs.push_back(p[0]); xs.push_back(p[0] + p[1]); }
  sort(xs.begin(), xs.end());
  xs.erase(unique(xs.begin(), xs.end()), xs.end());

  int m = (int)xs.size();
  vector<int> height(m, 0);                 // height over each compressed slot

  vector<int> out;
  int best = 0;

  for (auto& p : positions) {
    int l = (int)(lower_bound(xs.begin(), xs.end(), p[0]) - xs.begin());
    int r = (int)(lower_bound(xs.begin(), xs.end(), p[0] + p[1]) - xs.begin());

    int base = 0;                           // range MAX over [l, r)
    for (int i = l; i < r; ++i) base = max(base, height[i]);

    int top = base + p[1];
    for (int i = l; i < r; ++i) height[i] = top;   // range ASSIGN

    best = max(best, top);
    out.push_back(best);
  }
  return out;
}
// The loops above are the O(n^2) version, which passes at these limits.
// Replace both with a segment tree supporting range max + range assign for O(n log n).`,
            java: `public List<Integer> fallingSquares(int[][] positions) {
  TreeSet<Integer> set = new TreeSet<>();
  for (int[] p : positions) { set.add(p[0]); set.add(p[0] + p[1]); }

  List<Integer> xs = new ArrayList<>(set);
  Map<Integer,Integer> rank = new HashMap<>();
  for (int i = 0; i < xs.size(); i++) rank.put(xs.get(i), i);

  int[] height = new int[xs.size()];
  List<Integer> out = new ArrayList<>();
  int best = 0;

  for (int[] p : positions) {
    int l = rank.get(p[0]), r = rank.get(p[0] + p[1]);

    int base = 0;
    for (int i = l; i < r; i++) base = Math.max(base, height[i]);

    int top = base + p[1];
    for (int i = l; i < r; i++) height[i] = top;

    best = Math.max(best, top);
    out.add(best);
  }
  return out;
}`,
          },
          followUp: 'Implement the range assignment with LAZY PROPAGATION — store a pending assignment at each node and push it down only when a query descends through it.',
        },
      },
      practice: [
        {
          lc: 218,
          title: 'The Skyline Problem',
          slug: 'the-skyline-problem',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 70,
          insight:
            'Solvable with a sweep line and a multiset of active heights rather than a segment tree. Worth doing to see that the simpler structure often wins.',
          companies: ['google', 'meta'],
        },
        {
          lc: 732,
          title: 'My Calendar III',
          slug: 'my-calendar-iii',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 45,
          insight:
            'Flipped: maximum overlap count as bookings arrive. An ordered map of deltas swept each time is far simpler than a segment tree and passes comfortably.',
        },
      ],
    },
  ],
};
