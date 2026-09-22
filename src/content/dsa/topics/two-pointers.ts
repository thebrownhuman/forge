import type { Topic } from '../../schema';

export const twoPointers: Topic = {
  id: 'two-pointers',
  name: 'Two Pointers',
  phase: 1,
  estHours: 10,
  prerequisites: ['arrays'],

  whyItMatters:
    'Two pointers is how you drop a loop when the data has order. Sorted input plus a target is almost always two pointers rather than a hash map, because it costs O(1) space instead of O(n) — and "can you do it without extra space?" is the follow-up you will be asked. It is also the parent pattern of sliding window, so getting the four variants clear here makes that topic mostly revision.',

  fundamentals: [
    {
      heading: 'Four arrangements, and how to pick',
      body:
        'Opposite ends, moving inward: needs SORTED input, and each step eliminates one candidate permanently. Same direction at different speeds: cycle detection and midpoints. Read and write pointers: in-place compaction. Two separate sequences: merging or subsequence matching. Almost every problem in this topic is one of these four, and naming which one you are using out loud is worth real credit.',
    },
    {
      heading: 'Why opposite-ends is correct, not just fast',
      body:
        'On a sorted array with a target sum, if a[l] + a[r] is too small then a[l] paired with ANYTHING at or below r is also too small — r is the largest partner available. So l can never be part of a solution again and you advance it, permanently discarding one candidate. That elimination argument is the proof, and an interviewer asking "why is this correct?" is asking for exactly this sentence.',
      code: {
        cpp: `int l = 0, r = n - 1;
while (l < r) {
  int sum = a[l] + a[r];
  if (sum == target) return {l, r};
  if (sum < target) ++l;        // a[l] can never work: r was its best partner
  else --r;
}`,
        java: `int l = 0, r = n - 1;
while (l < r) {
  int sum = a[l] + a[r];
  if (sum == target) return new int[]{l, r};
  if (sum < target) l++;
  else r--;
}`,
      },
    },
    {
      heading: 'Sorting first is allowed — unless indices matter',
      body:
        'Many two-pointer solutions begin with a sort, which costs O(n log n) and is usually fine. The trap: if the problem wants ORIGINAL indices, sorting destroys them. That is exactly why LC 1 (Two Sum, unsorted, wants indices) is a hash-map problem while LC 167 (sorted, wants positions in the sorted array) is a two-pointer problem. Same-looking questions, different tools, for this one reason.',
    },
    {
      heading: 'Skipping duplicates',
      body:
        'When a problem asks for distinct tuples, you must skip repeated values after recording a hit — otherwise you emit the same triple many times. Do it by comparing against the value you just used, and always guard the bound: while (l < r && a[l] == a[l-1]) ++l. Deduplicating with a set at the end works but is the lazy answer and costs extra space.',
    },
  ],

  questionTypes: [
    {
      id: 'opposite-ends',
      name: 'Opposite ends on sorted data',
      signal:
        'Sorted input plus "find a pair/triple summing to X", or a quantity that depends on both ends such as width. Start wide, move the end that cannot possibly improve.',
      time: 'O(n), or O(n^2) for triples',
      space: 'O(1)',
      googleHeavy: true,
      template: {
        cpp: `int l = 0, r = n - 1;
while (l < r) {
  if (good(a[l], a[r])) { record(); ++l; --r; }
  else if (tooSmall(a[l], a[r])) ++l;
  else --r;
}`,
        java: `int l = 0, r = n - 1;
while (l < r) {
  if (good(a[l], a[r])) { record(); l++; r--; }
  else if (tooSmall(a[l], a[r])) l++;
  else r--;
}`,
      },
      taught: {
        lc: 15,
        title: '3Sum',
        slug: '3sum',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 45,
        insight:
          'Sort, fix the first element, then two-point the remainder for the complement. The difficulty is not the search — it is skipping duplicates in two places.',
        companies: ['google', 'meta', 'amazon'],
        whyThisOne:
          'The most-asked problem in this topic, and the one that teaches reduction: an unfamiliar triple problem becomes a familiar pair problem by fixing one variable.',
        walkthrough: {
          howToSeeIt: [
            'Brute force is three nested loops, O(n^3). Reduce the dimension: fix the first number, and the rest of the task is "find two numbers summing to -a[i]" — a problem you already solve in O(n).',
            'Sort first. That enables the two-pointer scan, and it groups equal values together so duplicates become adjacent and cheap to skip.',
            'Outer loop picks i. Skip it if a[i] equals a[i-1], because that first element was already fully explored — every triple it can start has been emitted. Break entirely once a[i] > 0, since three sorted non-negative numbers cannot sum to zero.',
            'Inner two-pointer scan over i+1..n-1 for the complement. After recording a hit, advance BOTH pointers past their duplicate runs — this is the second dedup site and the one people forget.',
          ],
          wherePeopleLoseIt:
            'Duplicate handling, in both places. Skipping at the outer loop but not after an inner hit emits the same triple repeatedly; using a set to clean up afterwards works but signals you did not understand the structure. The other trap is skipping the outer duplicate by comparing forwards (a[i] == a[i+1]) instead of backwards, which skips valid triples like [-1,-1,2].',
          time: 'O(n^2) — n outer positions, each with an O(n) scan.',
          space: 'O(1) beyond the sort and the output.',
          code: {
            cpp: `vector<vector<int>> threeSum(vector<int>& nums) {
  sort(nums.begin(), nums.end());
  vector<vector<int>> out;
  int n = (int)nums.size();

  for (int i = 0; i < n - 2; ++i) {
    if (nums[i] > 0) break;                          // sorted: no zero sum possible
    if (i > 0 && nums[i] == nums[i - 1]) continue;   // dedup site 1, look BACKWARDS

    int l = i + 1, r = n - 1;
    while (l < r) {
      long long sum = (long long)nums[i] + nums[l] + nums[r];

      if (sum < 0) ++l;
      else if (sum > 0) --r;
      else {
        out.push_back({nums[i], nums[l], nums[r]});
        ++l; --r;
        while (l < r && nums[l] == nums[l - 1]) ++l;   // dedup site 2
        while (l < r && nums[r] == nums[r + 1]) --r;
      }
    }
  }
  return out;
}`,
            java: `public List<List<Integer>> threeSum(int[] nums) {
  Arrays.sort(nums);
  List<List<Integer>> out = new ArrayList<>();

  for (int i = 0; i < nums.length - 2; i++) {
    if (nums[i] > 0) break;
    if (i > 0 && nums[i] == nums[i - 1]) continue;

    int l = i + 1, r = nums.length - 1;
    while (l < r) {
      long sum = (long) nums[i] + nums[l] + nums[r];

      if (sum < 0) l++;
      else if (sum > 0) r--;
      else {
        out.add(Arrays.asList(nums[i], nums[l], nums[r]));
        l++; r--;
        while (l < r && nums[l] == nums[l - 1]) l++;
        while (l < r && nums[r] == nums[r + 1]) r--;
      }
    }
  }
  return out;
}`,
          },
          followUp: '4Sum (LC 18) — fix two elements and two-point the rest, O(n^3). The generalisation is kSum by recursion.',
        },
      },
      practice: [
        {
          lc: 167,
          title: 'Two Sum II - Input Array Is Sorted',
          slug: 'two-sum-ii-input-array-is-sorted',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 12,
          insight: 'The bare skeleton, and the O(1)-space contrast with hash-map Two Sum. Be able to say exactly why sorted changes the tool.',
        },
        {
          lc: 11,
          title: 'Container With Most Water',
          slug: 'container-with-most-water',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped: no sorting, and you always move the SHORTER wall — moving the taller one can never increase the area, because width shrinks and height is capped by the shorter side.',
          companies: ['google', 'amazon'],
        },
      ],
    },

    {
      id: 'read-write',
      name: 'Read and write pointers',
      signal:
        'In-place modification with O(1) extra space: remove, deduplicate, compact, partition. One pointer reads everything, a slower one marks where the next keeper goes.',
      time: 'O(n)',
      space: 'O(1)',
      template: {
        cpp: `int w = 0;
for (int r = 0; r < n; ++r)
  if (keep(a[r], w)) a[w++] = a[r];
return w;`,
        java: `int w = 0;
for (int r = 0; r < n; r++)
  if (keep(a[r], w)) a[w++] = a[r];
return w;`,
      },
      taught: {
        lc: 80,
        title: 'Remove Duplicates from Sorted Array II',
        slug: 'remove-duplicates-from-sorted-array-ii',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 25,
        insight:
          'Compare against what you already WROTE, not what you read: keep a[r] when w < 2 or a[r] != a[w-2]. That one test encodes "at most two copies".',
        whyThisOne:
          'It upgrades the write-pointer idea from a simple filter to a filter with memory, and the a[w-2] trick generalises to "at most k copies" immediately.',
        walkthrough: {
          howToSeeIt: [
            'In-place plus O(1) space means the write-pointer skeleton. The only question is what the keep test should be.',
            'The naive test counts runs with a separate counter, which works but carries extra state. There is a cleaner invariant available.',
            'The output prefix is itself sorted. So if a[r] differs from the element two slots back in the OUTPUT, fewer than two copies of it exist there and it can be kept. That is the whole test: w < 2 || a[r] != a[w-2].',
            'Comparing against the output rather than the input is the key move — it self-corrects, because the output is exactly what the caller will read. For "at most k", the test becomes a[r] != a[w-k].',
          ],
          wherePeopleLoseIt:
            'Comparing against the input (a[r] != a[r-2]) instead of the output. On input like [1,1,1,2] the two agree early and diverge later, so it passes simple cases and fails long runs. Guarding w >= 2 before touching a[w-2] is the other required line.',
          time: 'O(n).',
          space: 'O(1).',
          code: {
            cpp: `int removeDuplicates(vector<int>& nums) {
  int w = 0;
  for (int r = 0; r < (int)nums.size(); ++r) {
    // Fewer than 2 written yet, or this value differs from 2 slots back in the OUTPUT.
    if (w < 2 || nums[r] != nums[w - 2]) nums[w++] = nums[r];
  }
  return w;
}`,
            java: `public int removeDuplicates(int[] nums) {
  int w = 0;
  for (int r = 0; r < nums.length; r++) {
    if (w < 2 || nums[r] != nums[w - 2]) nums[w++] = nums[r];
  }
  return w;
}`,
          },
          followUp: 'Generalise to at most k duplicates — replace 2 with k everywhere and the same proof holds.',
        },
      },
      practice: [
        {
          lc: 905,
          title: 'Sort Array By Parity',
          slug: 'sort-array-by-parity',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 12,
          insight: 'Partition rather than filter: swap evens forward with the write pointer. Nothing is discarded, so swap instead of overwrite.',
        },
        {
          lc: 2540,
          title: 'Minimum Common Value',
          slug: 'minimum-common-value',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 12,
          insight: 'Flipped to two arrays: advance whichever pointer is behind. The merge-style walk that the next type builds on.',
        },
      ],
    },

    {
      id: 'three-way-partition',
      name: 'Three-way partition (Dutch flag)',
      signal:
        'Three categories to separate in one pass — "sort 0s, 1s and 2s", "group by less/equal/greater than a pivot". Three pointers: a low boundary, a scanner, and a high boundary.',
      time: 'O(n)',
      space: 'O(1)',
      template: {
        cpp: `int low = 0, i = 0, high = n - 1;
while (i <= high) {
  if (a[i] < pivot) swap(a[low++], a[i++]);
  else if (a[i] > pivot) swap(a[i], a[high--]);   // do NOT advance i
  else ++i;
}`,
        java: `int low = 0, i = 0, high = n - 1;
while (i <= high) {
  if (a[i] < pivot) { swap(a, low++, i++); }
  else if (a[i] > pivot) { swap(a, i, high--); }
  else i++;
}`,
      },
      taught: {
        lc: 75,
        title: 'Sort Colors',
        slug: 'sort-colors',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'Three regions grow from both ends. After a swap with the HIGH side, do not advance the scanner — the value you just pulled in has not been examined yet.',
        companies: ['microsoft', 'amazon'],
        whyThisOne:
          'One pass, O(1) space, and the asymmetric advance rule is a genuinely subtle invariant that rewards reasoning instead of memorising.',
        walkthrough: {
          howToSeeIt: [
            'Counting sort in two passes is a legitimate first answer — count 0s, 1s, 2s, then overwrite. The problem asks for one pass without counting, so improve it.',
            'Maintain three regions by invariant: everything before low is 0, everything from low up to i is 1, everything after high is 2, and the span between i and high is unexamined.',
            'On a 0, swap it down to low and advance both low and i. The element arriving from low is already known to be a 1 (or i == low), so it is safe to step past.',
            'On a 2, swap it up to high and decrement high — but do NOT advance i, because the value swapped in came from the unexamined region and must still be classified. That asymmetry is the entire problem.',
          ],
          wherePeopleLoseIt:
            'Advancing i after the high-side swap. It skips an unexamined value and leaves the array unsorted in ways that pass short tests. The loop condition must also be i <= high, not i < high, or the final element is never classified.',
          time: 'O(n) — one pass.',
          space: 'O(1).',
          code: {
            cpp: `void sortColors(vector<int>& nums) {
  int low = 0, i = 0, high = (int)nums.size() - 1;

  while (i <= high) {                 // <=, not <
    if (nums[i] == 0)      swap(nums[low++], nums[i++]);
    else if (nums[i] == 2) swap(nums[i], nums[high--]);   // i does NOT advance
    else                   ++i;
  }
}`,
            java: `public void sortColors(int[] nums) {
  int low = 0, i = 0, high = nums.length - 1;

  while (i <= high) {
    if (nums[i] == 0) { int t = nums[low]; nums[low++] = nums[i]; nums[i++] = t; }
    else if (nums[i] == 2) { int t = nums[high]; nums[high--] = nums[i]; nums[i] = t; }
    else i++;
  }
}`,
          },
          followUp: 'This is exactly the partition step of quicksort with duplicate keys — it is why three-way quicksort handles repeated values well.',
        },
      },
      practice: [
        {
          lc: 215,
          title: 'Kth Largest Element in an Array',
          slug: 'kth-largest-element-in-an-array',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight: 'Quickselect: partition, then recurse into only the side containing k. O(n) average. Revisit after the heap solution and compare.',
          companies: ['google', 'meta'],
        },
        {
          lc: 283,
          title: 'Move Zeroes',
          slug: 'move-zeroes',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 12,
          insight: 'Flipped to two regions: a degenerate Dutch flag. Solve it with swaps this time, not the copy-then-clear approach.',
          companies: ['meta'],
        },
      ],
    },

    {
      id: 'two-sequences',
      name: 'Two sequences, one pointer each',
      signal:
        'Two arrays or strings walked together — merge, intersect, match a subsequence. Advance whichever side is behind. When writing into one of them in place, fill from the BACK.',
      time: 'O(n + m)',
      space: 'O(1)',
      template: {
        cpp: `int i = n - 1, j = m - 1, w = n + m - 1;
while (j >= 0) {
  if (i >= 0 && a[i] > b[j]) a[w--] = a[i--];
  else                       a[w--] = b[j--];
}`,
        java: `int i = n - 1, j = m - 1, w = n + m - 1;
while (j >= 0) {
  if (i >= 0 && a[i] > b[j]) a[w--] = a[i--];
  else                       a[w--] = b[j--];
}`,
      },
      taught: {
        lc: 88,
        title: 'Merge Sorted Array',
        slug: 'merge-sorted-array',
        difficulty: 'easy',
        role: 'taught',
        estMinutes: 20,
        insight:
          'Fill from the back. The tail of the first array is empty space, so writing largest-first never overwrites a value you still need to read.',
        companies: ['meta', 'google'],
        whyThisOne:
          'It looks trivial and is failed constantly, because the natural front-to-back instinct is wrong here. The fill-from-the-back trick recurs throughout in-place array work.',
        walkthrough: {
          howToSeeIt: [
            'Merging front to front needs somewhere to put the result. Writing into the front of the first array would overwrite elements you have not read yet, so the obvious direction is blocked.',
            'Look at where the free space is: it is at the END of the first array. So write there, which means emitting the LARGEST remaining element first.',
            'Three indices: one at the last real element of each input, and a write index at the very end. Each step takes the larger of the two candidates and writes it down.',
            'Stop when the second array is exhausted. Anything left in the first array is already in place, which is why the loop condition only watches j — a neat detail worth pointing out.',
          ],
          wherePeopleLoseIt:
            'Looping while both i >= 0 and j >= 0, then adding a cleanup loop for the leftovers. Harmless but noisy, and people commonly write the wrong cleanup. Looping on j alone, with an i >= 0 guard inside the comparison, handles everything. Also note the comparison must be a[i] > b[j] — flip it and equal elements come out unstable.',
          time: 'O(n + m).',
          space: 'O(1).',
          code: {
            cpp: `void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
  int i = m - 1, j = n - 1, w = m + n - 1;

  while (j >= 0) {                                   // only j needs watching
    if (i >= 0 && nums1[i] > nums2[j]) nums1[w--] = nums1[i--];
    else                               nums1[w--] = nums2[j--];
  }
}`,
            java: `public void merge(int[] nums1, int m, int[] nums2, int n) {
  int i = m - 1, j = n - 1, w = m + n - 1;

  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) nums1[w--] = nums1[i--];
    else                               nums1[w--] = nums2[j--];
  }
}`,
          },
        },
      },
      practice: [
        {
          lc: 977,
          title: 'Squares of a Sorted Array',
          slug: 'squares-of-a-sorted-array',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 15,
          insight: 'The largest square sits at one END of the array, so two pointers inward plus filling the output from the back gives O(n) without sorting.',
        },
        {
          lc: 392,
          title: 'Is Subsequence',
          slug: 'is-subsequence',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 15,
          insight:
            'Flipped: only one pointer advances on a match. Then answer the real follow-up — for 10^9 queries against one target, preprocess next-occurrence tables and binary search.',
          companies: ['google'],
        },
      ],
    },
  ],
};
