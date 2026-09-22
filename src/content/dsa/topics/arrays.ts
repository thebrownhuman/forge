import type { Topic } from '../../schema';

export const arrays: Topic = {
  id: 'arrays',
  name: 'Arrays & Prefix Sums',
  phase: 0,
  estHours: 10,
  prerequisites: ['complexity', 'stl'],

  whyItMatters:
    'Arrays are the substrate for almost every other topic — sliding window, two pointers, binary search and most DP all run on them. Prefix sums in particular are the single highest-leverage trick in Phase 0: they turn "sum of any range" from O(n) per query into O(1), and combined with a hash map they solve an entire family of subarray problems that look unrelated until you see it.',

  fundamentals: [
    {
      heading: 'The prefix sum array, and the off-by-one that kills it',
      body:
        'Define prefix[0] = 0 and prefix[i] = a[0] + ... + a[i-1]. The extra leading zero is not decoration — it is what makes the range formula uniform with no special case for ranges starting at index 0. With that convention, the sum of a[l..r] inclusive is prefix[r+1] - prefix[l]. Build it once in O(n), answer any range in O(1).',
      code: {
        cpp: `vector<long long> prefix(n + 1, 0);
for (int i = 0; i < n; ++i) prefix[i + 1] = prefix[i] + a[i];

long long rangeSum = prefix[r + 1] - prefix[l];   // a[l..r] inclusive`,
        java: `long[] prefix = new long[n + 1];
for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + a[i];

long rangeSum = prefix[r + 1] - prefix[l];`,
      },
      costs: [
        { op: 'build prefix array', cost: 'O(n)', note: 'once' },
        { op: 'range sum query', cost: 'O(1)', note: 'after the build' },
        { op: 'point update', cost: 'O(n)', note: 'rebuild — if updates are frequent, use a Fenwick tree instead' },
      ],
    },
    {
      heading: 'Use long long, or overflow silently',
      body:
        'Prefix sums accumulate. With n = 10^5 and values up to 10^9, the total reaches 10^14, which overflows a 32-bit int without any warning — the answer is just wrong on the large test. Default to long long in C++ and long in Java for anything that accumulates. This is the most common invisible bug in this topic.',
    },
    {
      heading: 'Why prefix sums pair with a hash map',
      body:
        'Rearrange the range formula: a subarray a[l..r] sums to K exactly when prefix[r+1] - prefix[l] = K, that is prefix[l] = prefix[r+1] - K. So while scanning, at each position you are asking "have I seen this particular earlier prefix value?" — which is a hash-map lookup. That single rearrangement converts an O(n^2) search into one O(n) pass, and it is the engine behind LC 560, 523 and 974.',
    },
    {
      heading: 'In-place tricks: encoding two things in one slot',
      body:
        'Some O(1)-space problems want you to store extra state inside the array itself — negating a[i] to mark index i as seen, or storing a second value as a multiple of n. These are legitimate and occasionally expected, but say what you are doing out loud; silent mutation of the input is a code-review smell unless the problem invites it.',
    },
  ],

  questionTypes: [
    {
      id: 'prefix-range-query',
      name: 'Prefix sums for range queries',
      signal:
        'Many queries over the same static array, or any repeated "sum between i and j". Build once, answer each query in O(1). If updates are also frequent, that is the signal for a Fenwick tree instead.',
      time: 'O(n) build, O(1) per query',
      space: 'O(n)',
      template: {
        cpp: `vector<long long> prefix(n + 1, 0);
for (int i = 0; i < n; ++i) prefix[i + 1] = prefix[i] + a[i];
// query(l, r) = prefix[r + 1] - prefix[l]`,
        java: `long[] prefix = new long[n + 1];
for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + a[i];
// query(l, r) = prefix[r + 1] - prefix[l]`,
      },
      taught: {
        lc: 303,
        title: 'Range Sum Query - Immutable',
        slug: 'range-sum-query-immutable',
        difficulty: 'easy',
        role: 'taught',
        estMinutes: 15,
        insight: 'Pay O(n) once in the constructor so every query is O(1). The leading zero removes the l == 0 special case.',
        whyThisOne:
          'It isolates the technique with nothing else attached, and it makes the build-once-query-many trade explicit, which is the reusable idea.',
        walkthrough: {
          howToSeeIt: [
            'The naive query loops from l to r: O(n) per call. With many calls that is O(q·n), and the class-based shape of the problem is a hint that precomputation is intended.',
            'The array never changes ("Immutable" is in the title), so any work done once can be reused forever. Compute every prefix total in the constructor.',
            'Size the prefix array n+1, not n, and set prefix[0] = 0. Then sum(l, r) = prefix[r+1] - prefix[l] with no branch for l == 0. Skipping the leading zero forces an if, and that if is where bugs live.',
            'State the trade in the interview: O(n) extra space and O(n) setup buys O(1) queries. If there were only one query ever, the naive loop would be the better answer.',
          ],
          wherePeopleLoseIt:
            'Indexing confusion — writing prefix[r] - prefix[l] and losing the element at r, or building an n-length prefix and then needing a special case. Fix the convention once (prefix[i] is the sum of the first i elements) and never deviate.',
          time: 'O(n) constructor, O(1) per query.',
          space: 'O(n).',
          code: {
            cpp: `class NumArray {
  vector<long long> prefix;
public:
  NumArray(vector<int>& nums) : prefix(nums.size() + 1, 0) {
    for (int i = 0; i < (int)nums.size(); ++i)
      prefix[i + 1] = prefix[i] + nums[i];
  }
  int sumRange(int left, int right) {
    return (int)(prefix[right + 1] - prefix[left]);
  }
};`,
            java: `class NumArray {
  private final long[] prefix;

  public NumArray(int[] nums) {
    prefix = new long[nums.length + 1];
    for (int i = 0; i < nums.length; i++)
      prefix[i + 1] = prefix[i] + nums[i];
  }

  public int sumRange(int left, int right) {
    return (int) (prefix[right + 1] - prefix[left]);
  }
}`,
          },
          followUp: 'Now allow updates (LC 307) — prefix sums degrade to O(n) per update, so switch to a Fenwick tree for O(log n) on both.',
        },
      },
      practice: [
        {
          lc: 724,
          title: 'Find Pivot Index',
          slug: 'find-pivot-index',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 15,
          insight: 'You only need the running left sum and the total, so the prefix array collapses to two variables: right = total - left - a[i].',
        },
        {
          lc: 304,
          title: 'Range Sum Query 2D - Immutable',
          slug: 'range-sum-query-2d-immutable',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight:
            'Flipped into two dimensions: inclusion-exclusion, sum = D - B - C + A. Draw the four rectangles or you will guess the signs wrong.',
        },
      ],
    },

    {
      id: 'prefix-hashmap',
      name: 'Prefix sum + hash map',
      signal:
        'COUNT or FIND a subarray with a target sum, especially when negative numbers are allowed so sliding window is invalid. Rearrange to prefix[l] = prefix[r+1] - K and look it up in a map.',
      time: 'O(n)',
      space: 'O(n)',
      googleHeavy: true,
      template: {
        cpp: `unordered_map<long long, int> seen{{0, 1}};   // empty prefix, seen once
long long running = 0;
int count = 0;
for (int x : a) {
  running += x;
  count += seen.count(running - k) ? seen[running - k] : 0;
  ++seen[running];
}`,
        java: `Map<Long,Integer> seen = new HashMap<>();
seen.put(0L, 1);
long running = 0;
int count = 0;
for (int x : a) {
  running += x;
  count += seen.getOrDefault(running - k, 0);
  seen.merge(running, 1, Integer::sum);
}`,
      },
      taught: {
        lc: 560,
        title: 'Subarray Sum Equals K',
        slug: 'subarray-sum-equals-k',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 35,
        insight:
          'A subarray ending here sums to K exactly when some earlier prefix equals running - K. Count how many such prefixes you have already seen.',
        companies: ['google', 'meta', 'amazon'],
        whyThisOne:
          'It is the problem that teaches you sliding window has limits. Negatives break window monotonicity, and this is the tool that replaces it.',
        walkthrough: {
          howToSeeIt: [
            'First, rule out sliding window and say why: the values can be negative, so extending a window can decrease the sum. There is no monotonic shrink condition, so the window approach is simply invalid here — not merely slower.',
            'Write the range identity: sum(l..r) = prefix[r+1] - prefix[l]. Set it equal to K and solve for the unknown end: prefix[l] = prefix[r+1] - K.',
            'Read that as a question you can ask while scanning: standing at r with a running prefix, how many earlier prefixes equalled running - K? Each one is a distinct valid subarray, so keep a map from prefix value to how many times it occurred.',
            'Seed the map with {0: 1} before the loop. That represents the empty prefix and is what lets a subarray starting at index 0 be counted. Without it, every such subarray is missed.',
          ],
          wherePeopleLoseIt:
            'Two things. Forgetting the {0: 1} seed, which silently undercounts and still passes the small examples. And updating the map BEFORE querying it, which lets a zero-length subarray match when K is 0. Query first, then insert — the order encodes "earlier prefixes only".',
          time: 'O(n) — one pass, O(1) map work per element.',
          space: 'O(n) for the map.',
          code: {
            cpp: `int subarraySum(vector<int>& nums, int k) {
  unordered_map<long long, int> seen;
  seen[0] = 1;                      // the empty prefix

  long long running = 0;
  int count = 0;

  for (int x : nums) {
    running += x;

    auto it = seen.find(running - k);
    if (it != seen.end()) count += it->second;   // QUERY first

    ++seen[running];                             // then record
  }
  return count;
}`,
            java: `public int subarraySum(int[] nums, int k) {
  Map<Long,Integer> seen = new HashMap<>();
  seen.put(0L, 1);

  long running = 0;
  int count = 0;

  for (int x : nums) {
    running += x;
    count += seen.getOrDefault(running - k, 0);
    seen.merge(running, 1, Integer::sum);
  }
  return count;
}`,
          },
          followUp: 'Return the LONGEST such subarray instead of the count — then the map stores the EARLIEST index per prefix value, and you only insert when the key is new.',
        },
      },
      practice: [
        {
          lc: 974,
          title: 'Subarray Sums Divisible by K',
          slug: 'subarray-sums-divisible-by-k',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight:
            'Same machine, keyed on prefix MOD k instead of the prefix itself. Normalise negative remainders with ((r % k) + k) % k or the count is wrong.',
        },
        {
          lc: 523,
          title: 'Continuous Subarray Sum',
          slug: 'continuous-subarray-sum',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped: existence with a minimum length of 2, so the map stores the first INDEX per remainder and you compare index distance rather than counting.',
          companies: ['meta'],
        },
      ],
    },

    {
      id: 'kadane',
      name: 'Kadane — running best ending here',
      signal:
        '"Maximum subarray", "best contiguous run", "maximum product". The move: at each index decide whether to extend the previous run or start fresh, and keep a separate global best.',
      time: 'O(n)',
      space: 'O(1)',
      template: {
        cpp: `long long cur = a[0], best = a[0];
for (int i = 1; i < n; ++i) {
  cur = max((long long)a[i], cur + a[i]);   // extend, or restart at a[i]
  best = max(best, cur);
}`,
        java: `long cur = a[0], best = a[0];
for (int i = 1; i < n; i++) {
  cur = Math.max(a[i], cur + a[i]);
  best = Math.max(best, cur);
}`,
      },
      taught: {
        lc: 53,
        title: 'Maximum Subarray',
        slug: 'maximum-subarray',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 25,
        insight:
          'Track the best sum ENDING AT i. If the previous run is negative it can only hurt, so drop it and start fresh at a[i].',
        companies: ['google', 'amazon', 'microsoft'],
        whyThisOne:
          'It is the smallest true DP: one state, one transition, and the "ending here versus anywhere" distinction that unlocks a large slice of Phase 3.',
        walkthrough: {
          howToSeeIt: [
            'Brute force checks every (l, r) pair: O(n^2). To do better, fix the right end and ask a local question instead of a global one.',
            'Define cur as the best sum of a subarray ENDING exactly at i. That framing is the whole insight — "best anywhere" has no recurrence, "best ending here" does.',
            'The transition has exactly two options: extend the previous run (cur + a[i]) or start a new run at a[i]. Take the larger. Equivalently: if cur ever goes negative, throw it away, since a negative prefix can never help a later sum.',
            'Keep best separately, updated after each step. cur may dip while best holds the high-water mark — conflating the two is the classic bug.',
          ],
          wherePeopleLoseIt:
            'Initialising best to 0. If every number is negative the answer is the largest single element, and a zero start returns 0 — wrong, and it passes every test with a positive number in it. Start both cur and best at a[0]. The other trap is updating best inside a branch rather than every iteration.',
          time: 'O(n).',
          space: 'O(1).',
          code: {
            cpp: `int maxSubArray(vector<int>& nums) {
  long long cur = nums[0], best = nums[0];   // NOT 0 — all-negative input

  for (int i = 1; i < (int)nums.size(); ++i) {
    cur = max((long long)nums[i], cur + nums[i]);   // restart or extend
    best = max(best, cur);
  }
  return (int)best;
}`,
            java: `public int maxSubArray(int[] nums) {
  long cur = nums[0], best = nums[0];

  for (int i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return (int) best;
}`,
          },
          followUp: 'Return the subarray indices, not just the sum — record a start index whenever you restart, and freeze it whenever best improves.',
        },
      },
      practice: [
        {
          lc: 152,
          title: 'Maximum Product Subarray',
          slug: 'maximum-product-subarray',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight:
            'Track the running MINIMUM as well — a negative times the smallest negative becomes the largest product. One extra variable, completely different problem.',
          companies: ['google'],
        },
        {
          lc: 918,
          title: 'Maximum Sum Circular Subarray',
          slug: 'maximum-sum-circular-subarray',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight:
            'Flipped: the best wrapping subarray is total minus the MINIMUM subarray. Run Kadane twice, and special-case the all-negative input where that formula returns an empty array.',
        },
      ],
    },

    {
      id: 'difference-array',
      name: 'Difference array for range updates',
      signal:
        'Many range updates, then one final read of the whole array. Mark +v at the start and -v just past the end, then take one prefix sum at the end. Each update becomes O(1).',
      time: 'O(n + q)',
      space: 'O(n)',
      template: {
        cpp: `vector<long long> diff(n + 1, 0);
for (auto& [l, r, v] : updates) {   // add v to a[l..r]
  diff[l] += v;
  diff[r + 1] -= v;                 // the +1 is the whole trick
}
for (int i = 1; i < n; ++i) diff[i] += diff[i - 1];   // prefix sum => final array`,
        java: `long[] diff = new long[n + 1];
for (int[] u : updates) {
  diff[u[0]] += u[2];
  diff[u[1] + 1] -= u[2];
}
for (int i = 1; i < n; i++) diff[i] += diff[i - 1];`,
      },
      taught: {
        lc: 1109,
        title: 'Corporate Flight Bookings',
        slug: 'corporate-flight-bookings',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'Record only where each range STARTS and STOPS, not every element it covers. One prefix sum at the end materialises the whole array.',
        companies: ['google'],
        whyThisOne:
          'It is the mirror image of prefix sums — prefix answers range queries, difference applies range updates — and seeing the pair makes both stick.',
        walkthrough: {
          howToSeeIt: [
            'The direct approach loops over every seat in every booking: O(q·n), which times out when both are large. The constraint sizes tell you that before you write it.',
            'Notice the array is only read ONCE, at the very end. That means intermediate states never need to be correct — you only need enough information to reconstruct the final array.',
            'Store the CHANGE at each boundary instead of the values: +v where the range begins, -v immediately after it ends. Each booking is now two O(1) writes.',
            'A running prefix sum over the difference array reproduces the true values: the +v switches the contribution on and the -v switches it off at exactly the right place. Size the array n+1 so the -v at r+1 always has somewhere to land.',
          ],
          wherePeopleLoseIt:
            'The off-by-one on the closing marker. Ranges here are 1-indexed and inclusive, so the -v belongs at r+1 in 1-indexed terms — put it at r and the last seat of every booking is silently dropped. Write one tiny example by hand before trusting it.',
          time: 'O(n + q).',
          space: 'O(n).',
          code: {
            cpp: `vector<int> corpFlightBookings(vector<vector<int>>& bookings, int n) {
  vector<long long> diff(n + 2, 0);        // +2 so r + 1 always fits

  for (auto& b : bookings) {
    int first = b[0], last = b[1], seats = b[2];
    diff[first] += seats;
    diff[last + 1] -= seats;               // switch off AFTER the last flight
  }

  vector<int> out(n);
  long long running = 0;
  for (int i = 1; i <= n; ++i) {
    running += diff[i];
    out[i - 1] = (int)running;
  }
  return out;
}`,
            java: `public int[] corpFlightBookings(int[][] bookings, int n) {
  long[] diff = new long[n + 2];

  for (int[] b : bookings) {
    diff[b[0]] += b[2];
    diff[b[1] + 1] -= b[2];
  }

  int[] out = new int[n];
  long running = 0;
  for (int i = 1; i <= n; i++) {
    running += diff[i];
    out[i - 1] = (int) running;
  }
  return out;
}`,
          },
          followUp: 'What if you must answer queries BETWEEN updates? Then the difference array no longer applies and you need a Fenwick tree with range update and point query.',
        },
      },
      practice: [
        {
          lc: 1094,
          title: 'Car Pooling',
          slug: 'car-pooling',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight: 'Difference array over locations, then sweep and check the running total never exceeds capacity. Passengers get off AT the end point, so no +1 here — think about why.',
        },
        {
          lc: 1854,
          title: 'Maximum Population Year',
          slug: 'maximum-population-year',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 20,
          insight: 'Flipped: the range is a lifespan and you want the peak of the running total rather than the final array. Same sweep, different question.',
        },
      ],
    },
  ],
};
