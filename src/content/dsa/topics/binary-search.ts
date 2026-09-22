import type { Topic } from '../../schema';

export const binarySearch: Topic = {
  id: 'binary-search',
  name: 'Binary Search',
  phase: 1,
  estHours: 14,
  prerequisites: ['arrays'],

  whyItMatters:
    'Everyone can binary search a sorted array. The interview-grade skill is recognising binary search where there is no array at all — searching the ANSWER space for "minimum capacity", "minimum speed", "smallest largest sum". That variant is heavily asked at Google, and candidates who only know the array version do not see it.',

  fundamentals: [
    {
      heading: 'Pick one template and never improvise',
      body:
        'Most binary search bugs are off-by-one errors created by mixing templates under pressure. Commit to the half-open form: lo = 0, hi = n, loop while lo < hi, and never write mid - 1. On each step you either discard the right half (hi = mid) or discard the left half including mid (lo = mid + 1). It terminates because the interval strictly shrinks, and lo == hi at the end is the answer position.',
      code: {
        cpp: `int lo = 0, hi = n;              // half-open [lo, hi)
while (lo < hi) {
  int mid = lo + (hi - lo) / 2;  // never (lo + hi) / 2 — overflow
  if (condition(mid)) hi = mid;  // mid might be the answer: keep it
  else                lo = mid + 1;
}
return lo;                       // first index where condition is true`,
        java: `int lo = 0, hi = n;
while (lo < hi) {
  int mid = lo + (hi - lo) / 2;
  if (condition(mid)) hi = mid;
  else                lo = mid + 1;
}
return lo;`,
      },
    },
    {
      heading: 'Binary search is really about a boolean predicate',
      body:
        'Stop thinking "find the value" and start thinking "find the boundary". Imagine mapping every position to false, false, ..., false, true, true, ..., true. Binary search finds the FIRST true. Everything in this topic is choosing that predicate. For lower_bound the predicate is a[i] >= target. For "minimum speed" it is canFinishAt(speed). Once the predicate is monotonic, the search is mechanical.',
      costs: [
        { op: 'binary search', cost: 'O(log n)', note: '10^9 elements in 30 steps' },
        { op: 'binary search on the answer', cost: 'O(n log range)', note: 'each check is an O(n) feasibility pass' },
        { op: 'sort then search once', cost: 'O(n log n)', note: 'if you only search once, a linear scan is better' },
      ],
    },
    {
      heading: 'The overflow line, and why it is not pedantry',
      body:
        'Write mid = lo + (hi - lo) / 2, never (lo + hi) / 2. With large bounds — and answer-space searches routinely run to 10^9 or beyond — the sum overflows a 32-bit int and mid goes negative, producing an out-of-bounds access or an infinite loop. This exact bug sat in the JDK binary search for nine years.',
    },
    {
      heading: 'Proving termination in your head',
      body:
        'Before running the code, check the interval strictly shrinks on both branches. With hi = mid and lo = mid + 1 it always does, because mid < hi is guaranteed by floor division. The classic infinite loop comes from writing lo = mid in the else branch — when hi == lo + 1, mid == lo and nothing changes. If your binary search hangs, this is the reason, every time.',
    },
  ],

  questionTypes: [
    {
      id: 'lower-upper-bound',
      name: 'Lower bound and upper bound',
      signal:
        '"First position where...", "insert position", "count of values equal to X", "smallest element >= target". Do not search for equality — search for the boundary.',
      time: 'O(log n)',
      space: 'O(1)',
      template: {
        cpp: `// lower_bound: first index with a[i] >= target
int lo = 0, hi = n;
while (lo < hi) {
  int mid = lo + (hi - lo) / 2;
  if (a[mid] >= target) hi = mid;
  else                  lo = mid + 1;
}
// upper_bound: change the test to a[mid] > target`,
        java: `int lo = 0, hi = n;
while (lo < hi) {
  int mid = lo + (hi - lo) / 2;
  if (a[mid] >= target) hi = mid;
  else                  lo = mid + 1;
}`,
      },
      taught: {
        lc: 34,
        title: 'Find First and Last Position of Element in Sorted Array',
        slug: 'find-first-and-last-position-of-element-in-sorted-array',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'Run the same search twice with different predicates: lower_bound for the first position, upper_bound for one past the last. Never scan outward from a hit.',
        companies: ['google', 'meta'],
        whyThisOne:
          'It forces the boundary mindset. The tempting "find any match then expand" solution is O(n) on an all-equal array, which is precisely the test case that fails it.',
        walkthrough: {
          howToSeeIt: [
            'The instinct is to find any occurrence, then walk left and right. On input like [8,8,8,...,8] that walk is O(n) and defeats the whole point. Reject it out loud.',
            'Reframe as two boundaries. The first position is the first index where a[i] >= target. One past the last position is the first index where a[i] > target. Both are monotonic predicates over the array.',
            'So write one search function parameterised by the comparison, and call it twice. Total O(log n).',
            'Check existence exactly once: if lo is out of range or a[lo] != target, the value is absent and the answer is [-1, -1]. Otherwise the pair is [lower, upper - 1].',
          ],
          wherePeopleLoseIt:
            'Forgetting that upper_bound returns one PAST the last occurrence, so the answer needs a -1. The other failure is checking existence with the upper bound instead of the lower one — when the value is missing, both land on the same index and only the lower-bound check is meaningful.',
          time: 'O(log n) — two searches.',
          space: 'O(1).',
          code: {
            cpp: `class Solution {
  // first index i with nums[i] >= target (or > target when strict)
  int bound(vector<int>& nums, int target, bool strict) {
    int lo = 0, hi = (int)nums.size();
    while (lo < hi) {
      int mid = lo + (hi - lo) / 2;
      bool goLeft = strict ? (nums[mid] > target) : (nums[mid] >= target);
      if (goLeft) hi = mid;
      else        lo = mid + 1;
    }
    return lo;
  }

public:
  vector<int> searchRange(vector<int>& nums, int target) {
    int first = bound(nums, target, false);
    if (first == (int)nums.size() || nums[first] != target) return {-1, -1};
    int afterLast = bound(nums, target, true);
    return {first, afterLast - 1};
  }
};`,
            java: `class Solution {
  private int bound(int[] nums, int target, boolean strict) {
    int lo = 0, hi = nums.length;
    while (lo < hi) {
      int mid = lo + (hi - lo) / 2;
      boolean goLeft = strict ? nums[mid] > target : nums[mid] >= target;
      if (goLeft) hi = mid;
      else        lo = mid + 1;
    }
    return lo;
  }

  public int[] searchRange(int[] nums, int target) {
    int first = bound(nums, target, false);
    if (first == nums.length || nums[first] != target) return new int[]{-1, -1};
    return new int[]{first, bound(nums, target, true) - 1};
  }
}`,
          },
          followUp: 'Count occurrences of target — upper minus lower, no extra work. That is how you count in O(log n) rather than O(n).',
        },
      },
      practice: [
        {
          lc: 704,
          title: 'Binary Search',
          slug: 'binary-search',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 10,
          insight: 'The skeleton by itself. Write it with the half-open template even though the classic form works — build the one habit.',
        },
        {
          lc: 35,
          title: 'Search Insert Position',
          slug: 'search-insert-position',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 10,
          insight: 'Flipped: lower_bound with no existence check, so the returned index is the answer whether or not the target is present.',
        },
      ],
    },

    {
      id: 'rotated-array',
      name: 'Rotated and partially sorted arrays',
      signal:
        '"Rotated sorted array", "find the minimum after a rotation". At every step one half is still properly sorted — identify which, then decide whether the target lives there.',
      time: 'O(log n)',
      space: 'O(1)',
      googleHeavy: true,
      template: {
        cpp: `int lo = 0, hi = n - 1;
while (lo < hi) {
  int mid = lo + (hi - lo) / 2;
  if (a[mid] > a[hi]) lo = mid + 1;   // minimum is strictly right of mid
  else                hi = mid;       // minimum is at mid or left of it
}
return lo;                            // index of the minimum / rotation point`,
        java: `int lo = 0, hi = n - 1;
while (lo < hi) {
  int mid = lo + (hi - lo) / 2;
  if (a[mid] > a[hi]) lo = mid + 1;
  else                hi = mid;
}
return lo;`,
      },
      taught: {
        lc: 33,
        title: 'Search in Rotated Sorted Array',
        slug: 'search-in-rotated-sorted-array',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          'Compare a[mid] with a[lo] to learn which half is sorted. Then a plain range check on that half tells you which way to go.',
        companies: ['google', 'meta', 'amazon', 'microsoft'],
        whyThisOne:
          'The standard test of whether you understand binary search or merely memorised it — the array is not sorted, yet the halving argument still applies.',
        walkthrough: {
          howToSeeIt: [
            'The array is not globally sorted, so the usual comparison against the target is not enough to pick a half. But a rotated sorted array has structure: cut it anywhere and at least one side is a clean ascending run.',
            'Detect which side. If a[lo] <= a[mid], the left half is sorted; otherwise the right half is.',
            'Now use the sorted half as an oracle. If the target lies within its value range, search there; otherwise it must be in the other half. One comparison eliminates half the array, so O(log n) survives.',
            'Write the range checks with the correct inclusivity: for the sorted left half the test is a[lo] <= target && target < a[mid]. Sloppy boundaries here are the whole difficulty.',
          ],
          wherePeopleLoseIt:
            'Two things. Using a[lo] < a[mid] instead of <=, which misclassifies two-element windows and loops forever. And with duplicates allowed (LC 81), a[lo] == a[mid] == a[hi] makes the sorted half undetectable — the honest answer there is to shrink lo by one and accept O(n) worst case. Knowing that is a genuine differentiator.',
          time: 'O(log n).',
          space: 'O(1).',
          code: {
            cpp: `int search(vector<int>& nums, int target) {
  int lo = 0, hi = (int)nums.size() - 1;

  while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (nums[mid] == target) return mid;

    if (nums[lo] <= nums[mid]) {                 // LEFT half is sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else                                          lo = mid + 1;
    } else {                                     // RIGHT half is sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else                                          hi = mid - 1;
    }
  }
  return -1;
}`,
            java: `public int search(int[] nums, int target) {
  int lo = 0, hi = nums.length - 1;

  while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (nums[mid] == target) return mid;

    if (nums[lo] <= nums[mid]) {
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else                                          lo = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else                                          hi = mid - 1;
    }
  }
  return -1;
}`,
          },
          followUp: 'Now allow duplicates (LC 81) — explain why the worst case degrades to O(n) and what you would do about it.',
        },
      },
      practice: [
        {
          lc: 153,
          title: 'Find Minimum in Rotated Sorted Array',
          slug: 'find-minimum-in-rotated-sorted-array',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight: 'Simpler and cleaner: compare against a[hi], never a[lo]. Understand why comparing against the left end fails on a non-rotated array.',
        },
        {
          lc: 81,
          title: 'Search in Rotated Sorted Array II',
          slug: 'search-in-rotated-sorted-array-ii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight: 'Flipped by duplicates: when a[lo] == a[mid] == a[hi] you learn nothing and must shrink by one. State the O(n) worst case explicitly.',
        },
      ],
    },

    {
      id: 'binary-search-on-answer',
      name: 'Binary search on the answer',
      signal:
        '"Minimum X such that...", "maximum X such that...", "smallest largest", "can we do it in time T?". There is no sorted array — you search the RANGE OF POSSIBLE ANSWERS, and each guess is checked by a feasibility function.',
      time: 'O(n log(range))',
      space: 'O(1)',
      googleHeavy: true,
      template: {
        cpp: `auto feasible = [&](long long guess) -> bool {
  // O(n) simulation: can we achieve the goal with this guess?
};

long long lo = minPossible, hi = maxPossible;
while (lo < hi) {
  long long mid = lo + (hi - lo) / 2;
  if (feasible(mid)) hi = mid;      // mid works; try smaller
  else               lo = mid + 1;  // mid fails; must go bigger
}
return lo;                          // smallest feasible answer`,
        java: `long lo = minPossible, hi = maxPossible;
while (lo < hi) {
  long mid = lo + (hi - lo) / 2;
  if (feasible(mid)) hi = mid;
  else               lo = mid + 1;
}
return lo;`,
      },
      taught: {
        lc: 875,
        title: 'Koko Eating Bananas',
        slug: 'koko-eating-bananas',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          'Speed is monotonic: if speed s finishes in time, every speed above s does too. So binary search the speed range and test feasibility in O(n).',
        companies: ['google', 'amazon'],
        whyThisOne:
          'The clearest instance of the pattern. Once you see that the searchable thing is the ANSWER and not the input, a whole family of Hard-looking problems becomes routine.',
        walkthrough: {
          howToSeeIt: [
            'There is no sorted array to search, so the array-based instinct finds nothing. The signal is the phrasing: "minimum integer speed such that she finishes in h hours".',
            'Test monotonicity, which is the precondition. If speed s works, does s+1 also work? Yes — eating faster never takes longer. So the feasibility function is false, false, ..., false, true, true, ... over the speed range. That is a binary-searchable boundary.',
            'Bound the range. The slowest sensible speed is 1; the fastest useful one is max(piles), since eating faster than the biggest pile saves nothing because each pile takes at least one hour.',
            'Write feasible(s) as an honest O(n) simulation: sum of ceil(pile / s) hours, compared against h. Then binary search for the first speed where it returns true. Total O(n log(max pile)).',
          ],
          wherePeopleLoseIt:
            'Integer division when computing hours. pile / s truncates, so a leftover partial hour is lost and the answer comes out too small. Use (pile + s - 1) / s. The second trap is failing to check monotonicity before applying the pattern — without it, binary search is simply invalid and you must find another approach.',
          time: 'O(n log(max pile)).',
          space: 'O(1).',
          code: {
            cpp: `int minEatingSpeed(vector<int>& piles, int h) {
  auto hoursNeeded = [&](int speed) -> long long {
    long long total = 0;
    for (int p : piles) total += (p + speed - 1) / speed;   // ceiling division
    return total;
  };

  int lo = 1, hi = *max_element(piles.begin(), piles.end());

  while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (hoursNeeded(mid) <= h) hi = mid;      // feasible: try slower
    else                       lo = mid + 1;  // too slow
  }
  return lo;
}`,
            java: `public int minEatingSpeed(int[] piles, int h) {
  int lo = 1, hi = 0;
  for (int p : piles) hi = Math.max(hi, p);

  while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    long hours = 0;
    for (int p : piles) hours += (p + mid - 1) / mid;

    if (hours <= h) hi = mid;
    else            lo = mid + 1;
  }
  return lo;
}`,
          },
          followUp: 'Same shape, different costume: minimum ship capacity in D days (LC 1011), and smallest largest subarray sum (LC 410).',
        },
      },
      practice: [
        {
          lc: 1011,
          title: 'Capacity To Ship Packages Within D Days',
          slug: 'capacity-to-ship-packages-within-d-days',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight: 'Identical machine. The only real thought is the lower bound: capacity must be at least max(weights), or one package never ships.',
          companies: ['google', 'amazon'],
        },
        {
          lc: 410,
          title: 'Split Array Largest Sum',
          slug: 'split-array-largest-sum',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 45,
          insight:
            'Flipped and rated Hard, but it is the same feasibility search: "can we split into <= k parts with no part exceeding X?" A greedy O(n) check answers it.',
          companies: ['google'],
        },
      ],
    },

    {
      id: 'peak-condition',
      name: 'Searching an unsorted array by local condition',
      signal:
        'Find a peak, a local minimum, or a crossover point in data that is NOT sorted. Compare a[mid] with its neighbour and move toward the side that must contain an answer.',
      time: 'O(log n)',
      space: 'O(1)',
      template: {
        cpp: `int lo = 0, hi = n - 1;
while (lo < hi) {
  int mid = lo + (hi - lo) / 2;
  if (a[mid] < a[mid + 1]) lo = mid + 1;   // ascending: a peak lies right
  else                     hi = mid;       // descending: a peak is here or left
}
return lo;`,
        java: `int lo = 0, hi = n - 1;
while (lo < hi) {
  int mid = lo + (hi - lo) / 2;
  if (a[mid] < a[mid + 1]) lo = mid + 1;
  else                     hi = mid;
}
return lo;`,
      },
      taught: {
        lc: 162,
        title: 'Find Peak Element',
        slug: 'find-peak-element',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'You do not need global order — only the guarantee that walking uphill must eventually stop. That guarantee alone justifies discarding half the array.',
        companies: ['google', 'meta'],
        whyThisOne:
          'It breaks the belief that binary search requires sorted input, which is the misconception blocking the answer-space pattern for most people.',
        walkthrough: {
          howToSeeIt: [
            'The array is unsorted, so the usual justification is unavailable. The problem still demands O(log n), which is a strong hint that halving must be defensible some other way.',
            'Use the boundary condition: elements outside the array count as negative infinity. So if you stand at mid and a[mid] < a[mid+1], the ascending run to your right must eventually turn down — either at a genuine peak or at the right edge. Therefore a peak is guaranteed in the right half.',
            'Symmetrically, if a[mid] >= a[mid+1] you are on a descending step, so a peak exists at mid or to its left.',
            'Either way half the array is discarded with a guarantee that the remaining half still contains an answer. That guarantee, not sortedness, is what binary search actually requires.',
          ],
          wherePeopleLoseIt:
            'Using lo <= hi with this template and reading a[mid+1] out of bounds. With lo < hi and hi = n-1, mid is always strictly less than hi, so mid+1 is always valid — another reason to keep one template rather than improvise.',
          time: 'O(log n).',
          space: 'O(1).',
          code: {
            cpp: `int findPeakElement(vector<int>& nums) {
  int lo = 0, hi = (int)nums.size() - 1;

  while (lo < hi) {                    // < keeps mid + 1 in bounds
    int mid = lo + (hi - lo) / 2;
    if (nums[mid] < nums[mid + 1]) lo = mid + 1;   // uphill: peak to the right
    else                           hi = mid;       // downhill: peak here or left
  }
  return lo;
}`,
            java: `public int findPeakElement(int[] nums) {
  int lo = 0, hi = nums.length - 1;

  while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (nums[mid] < nums[mid + 1]) lo = mid + 1;
    else                           hi = mid;
  }
  return lo;
}`,
          },
          followUp: 'A 2-D peak (LC 1901) — binary search over columns, taking the row maximum of each, keeps the same argument alive in two dimensions.',
        },
      },
      practice: [
        {
          lc: 852,
          title: 'Peak Index in a Mountain Array',
          slug: 'peak-index-in-a-mountain-array',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 15,
          insight: 'Same code with a stronger promise — exactly one peak exists. Good for cementing the template without edge cases.',
        },
        {
          lc: 367,
          title: 'Valid Perfect Square',
          slug: 'valid-perfect-square',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 15,
          insight: 'Flipped to a numeric range with no array at all — the bridge to answer-space searching. Watch for mid*mid overflowing; use long.',
        },
      ],
    },

    {
      id: 'binary-search-2d',
      name: 'Binary search over a matrix or partition',
      signal:
        'A sorted 2-D matrix, or a problem asking you to split two sorted arrays at the right place. Either flatten the matrix into one virtual sorted array, or binary search the PARTITION point.',
      time: 'O(log(m·n)) or O(log(min(m, n)))',
      space: 'O(1)',
      template: {
        cpp: `// Treat an m x n row-sorted matrix as one sorted array of length m*n.
int lo = 0, hi = m * n;
while (lo < hi) {
  int mid = lo + (hi - lo) / 2;
  int val = matrix[mid / n][mid % n];       // the index trick
  if (val >= target) hi = mid;
  else               lo = mid + 1;
}`,
        java: `int lo = 0, hi = m * n;
while (lo < hi) {
  int mid = lo + (hi - lo) / 2;
  int val = matrix[mid / n][mid % n];
  if (val >= target) hi = mid;
  else               lo = mid + 1;
}`,
      },
      taught: {
        lc: 4,
        title: 'Median of Two Sorted Arrays',
        slug: 'median-of-two-sorted-arrays',
        difficulty: 'hard',
        role: 'taught',
        estMinutes: 60,
        insight:
          'Do not search for the median — search for the PARTITION. Cut both arrays so the left side holds exactly half the elements and every left value is <= every right value.',
        companies: ['google', 'amazon', 'microsoft'],
        whyThisOne:
          'The hardest standard binary search, and the definitive example of searching a structural choice rather than a value. Worth the hour even if it never comes up.',
        walkthrough: {
          howToSeeIt: [
            'Merging is O(m + n) and is a fine first answer. The required O(log(m + n)) rules it out, so something must be halved — and the only halvable thing here is WHERE you cut.',
            'Reframe: the median is defined by a partition. Cut array A after i elements and array B after j elements such that i + j is exactly half the total. Then only the cut needs finding, not the value.',
            'Once i is chosen, j is forced: j = half - i. So there is one free variable, and binary searching i over the SMALLER array gives O(log(min(m, n))).',
            'A cut is correct when maxLeftA <= minRightB and maxLeftB <= minRightA. If maxLeftA > minRightB, i is too big, so move left; otherwise move right. Use infinities for the out-of-range edges so no special cases are needed.',
          ],
          wherePeopleLoseIt:
            'Not binary searching the smaller array, which lets j go out of range and produces an avalanche of edge cases. And forgetting the sentinel infinities at the boundaries — half the code becomes null checks without them. Binary search A only when A is smaller; otherwise swap the two arrays at the start.',
          time: 'O(log(min(m, n))).',
          space: 'O(1).',
          code: {
            cpp: `double findMedianSortedArrays(vector<int>& a, vector<int>& b) {
  if (a.size() > b.size()) return findMedianSortedArrays(b, a);   // search the SMALLER

  int m = (int)a.size(), n = (int)b.size();
  int half = (m + n + 1) / 2;
  int lo = 0, hi = m;

  while (lo <= hi) {
    int i = lo + (hi - lo) / 2;      // take i from a
    int j = half - i;                // j is then forced

    long long maxLeftA  = (i == 0) ? LLONG_MIN : a[i - 1];
    long long minRightA = (i == m) ? LLONG_MAX : a[i];
    long long maxLeftB  = (j == 0) ? LLONG_MIN : b[j - 1];
    long long minRightB = (j == n) ? LLONG_MAX : b[j];

    if (maxLeftA <= minRightB && maxLeftB <= minRightA) {
      if ((m + n) % 2) return (double)max(maxLeftA, maxLeftB);
      return (max(maxLeftA, maxLeftB) + min(minRightA, minRightB)) / 2.0;
    }
    if (maxLeftA > minRightB) hi = i - 1;   // took too many from a
    else                      lo = i + 1;
  }
  return 0.0;
}`,
            java: `public double findMedianSortedArrays(int[] a, int[] b) {
  if (a.length > b.length) return findMedianSortedArrays(b, a);

  int m = a.length, n = b.length, half = (m + n + 1) / 2;
  int lo = 0, hi = m;

  while (lo <= hi) {
    int i = lo + (hi - lo) / 2;
    int j = half - i;

    long maxLeftA  = (i == 0) ? Long.MIN_VALUE : a[i - 1];
    long minRightA = (i == m) ? Long.MAX_VALUE : a[i];
    long maxLeftB  = (j == 0) ? Long.MIN_VALUE : b[j - 1];
    long minRightB = (j == n) ? Long.MAX_VALUE : b[j];

    if (maxLeftA <= minRightB && maxLeftB <= minRightA) {
      if (((m + n) & 1) == 1) return Math.max(maxLeftA, maxLeftB);
      return (Math.max(maxLeftA, maxLeftB) + Math.min(minRightA, minRightB)) / 2.0;
    }
    if (maxLeftA > minRightB) hi = i - 1;
    else                      lo = i + 1;
  }
  return 0.0;
}`,
          },
          followUp: 'Generalise to the k-th element of two sorted arrays, then to k sorted arrays — which is where a heap returns.',
        },
      },
      practice: [
        {
          lc: 74,
          title: 'Search a 2D Matrix',
          slug: 'search-a-2d-matrix',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 20,
          insight: 'Fully sorted when flattened, so one binary search over m*n with mid/n and mid%n. Practise the index arithmetic until it is automatic.',
        },
        {
          lc: 240,
          title: 'Search a 2D Matrix II',
          slug: 'search-a-2d-matrix-ii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped: rows and columns are sorted but the flattening is not, so binary search fails. Start at the top-right corner and walk — O(m + n) staircase, a different tool entirely.',
          companies: ['amazon', 'google'],
        },
      ],
    },
  ],
};
