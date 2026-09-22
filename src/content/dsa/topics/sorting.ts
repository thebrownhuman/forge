import type { Topic } from '../../schema';

export const sorting: Topic = {
  id: 'sorting',
  name: 'Sorting Algorithms',
  phase: 2,
  estHours: 8,
  prerequisites: ['arrays'],

  whyItMatters:
    'You will rarely be asked to implement a sort, but you will constantly be asked to reason about one: is it stable, can you beat O(n log n) given these constraints, why does quicksort degrade, how would you sort 100GB on a 4GB machine. "Sort first" is also the single most productive opening move in interviews — it converts unordered chaos into structure that two pointers, greedy and binary search can all exploit.',

  fundamentals: [
    {
      heading: 'The comparison lower bound, and how to break it',
      body:
        'Any sort that works by comparing pairs needs at least O(n log n) comparisons — there are n! possible orderings and each comparison splits the possibilities in half at best. That bound is unbeatable in general. You escape it only by NOT comparing: counting sort, bucket sort and radix sort read the values themselves, achieving O(n + k) when the value range k is small. So when an interviewer asks "can you do better than O(n log n)?", they are asking you to find a constraint on the values.',
      costs: [
        { op: 'merge sort', cost: 'O(n log n) always', note: 'stable, O(n) extra space' },
        { op: 'quicksort', cost: 'O(n log n) average, O(n^2) worst', note: 'unstable, O(log n) stack, fastest in practice' },
        { op: 'heapsort', cost: 'O(n log n) always', note: 'unstable, O(1) space, poor cache behaviour' },
        { op: 'counting sort', cost: 'O(n + k)', note: 'only for small integer ranges' },
        { op: 'quickselect', cost: 'O(n) average', note: 'k-th element without full sorting' },
      ],
    },
    {
      heading: 'Stability, and when it actually matters',
      body:
        'A stable sort preserves the relative order of equal elements. It matters whenever you sort by several keys in sequence — sort by name, then stably by department, and within each department names remain ordered. Know your defaults: Java Arrays.sort is stable for objects and NOT stable for primitives; C++ std::sort is not stable, std::stable_sort is. Getting this wrong produces output that is subtly, intermittently wrong.',
    },
    {
      heading: 'Why quicksort degrades, and the standard fixes',
      body:
        'Quicksort is O(n^2) when the pivot consistently splits off almost nothing — classically on already-sorted input with a first-element pivot. Fixes: choose a random pivot, use median-of-three, or switch to heapsort once recursion gets too deep (introsort, which is what std::sort actually does). Mentioning that library sorts are hybrids reads as real knowledge rather than textbook recall.',
      code: {
        cpp: `// Lomuto partition — the version to write under pressure.
int partition(vector<int>& a, int lo, int hi) {
  swap(a[lo + rand() % (hi - lo + 1)], a[hi]);   // random pivot: avoids the sorted worst case
  int pivot = a[hi], i = lo;

  for (int j = lo; j < hi; ++j)
    if (a[j] < pivot) swap(a[i++], a[j]);

  swap(a[i], a[hi]);
  return i;                                       // pivot's final resting position
}`,
        java: `int partition(int[] a, int lo, int hi) {
  int p = lo + rnd.nextInt(hi - lo + 1);
  swap(a, p, hi);

  int pivot = a[hi], i = lo;
  for (int j = lo; j < hi; j++)
    if (a[j] < pivot) swap(a, i++, j);

  swap(a, i, hi);
  return i;
}`,
      },
    },
    {
      heading: 'Sorting as a preprocessing move',
      body:
        'The most valuable use of sorting in interviews is not the algorithm but the decision. Sorting costs O(n log n) and buys you: adjacent duplicates, two-pointer scans, greedy by earliest end, and binary search. If your brute force is O(n^2) and the data is unordered, ask what sorting would make possible — that question alone solves a surprising share of Medium problems.',
    },
  ],

  questionTypes: [
    {
      id: 'merge-sort',
      name: 'Merge sort and divide-and-conquer counting',
      signal:
        'You need a guaranteed O(n log n), or stability, or the merge step itself computes something — counting inversions, counting smaller elements to the right, sorting a linked list.',
      time: 'O(n log n)',
      space: 'O(n)',
      template: {
        cpp: `void mergeSort(vector<int>& a, int lo, int hi, vector<int>& buf) {
  if (hi - lo <= 1) return;
  int mid = lo + (hi - lo) / 2;

  mergeSort(a, lo, mid, buf);
  mergeSort(a, mid, hi, buf);

  int i = lo, j = mid, k = lo;
  while (i < mid && j < hi) buf[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];  // <= keeps it stable
  while (i < mid) buf[k++] = a[i++];
  while (j < hi)  buf[k++] = a[j++];

  copy(buf.begin() + lo, buf.begin() + hi, a.begin() + lo);
}`,
        java: `void mergeSort(int[] a, int lo, int hi, int[] buf) {
  if (hi - lo <= 1) return;
  int mid = lo + (hi - lo) / 2;

  mergeSort(a, lo, mid, buf);
  mergeSort(a, mid, hi, buf);

  int i = lo, j = mid, k = lo;
  while (i < mid && j < hi) buf[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
  while (i < mid) buf[k++] = a[i++];
  while (j < hi)  buf[k++] = a[j++];

  System.arraycopy(buf, lo, a, lo, hi - lo);
}`,
      },
      taught: {
        lc: 912,
        title: 'Sort an Array',
        slug: 'sort-an-array',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          'Split, sort both halves, merge. The merge is where all the work happens — and using <= rather than < is exactly what makes the sort stable.',
        whyThisOne:
          'The only problem that asks you to implement a sort outright, and it is the foundation for the counting variants where the merge step computes the actual answer.',
        walkthrough: {
          howToSeeIt: [
            'Divide and conquer: a one-element array is sorted by definition, and two sorted halves can be combined in linear time. Those two facts are the whole algorithm.',
            'The merge walks both halves with a pointer each, always taking the smaller front element. It needs an output buffer — merging in place is possible but genuinely hard and not worth it here.',
            'Allocate the buffer ONCE at the top and pass it down. Allocating inside the recursion gives O(n log n) allocations and is the difference between passing and timing out.',
            'Use <= in the comparison so that when both sides tie, the left element is taken first. That is what preserves the original relative order — the definition of stability.',
          ],
          wherePeopleLoseIt:
            'Allocating a fresh vector at every recursion level, which is correct but slow enough to fail large tests. Second, mixing inclusive and exclusive bounds — pick half-open [lo, hi) and use it everywhere, exactly as in binary search.',
          time: 'O(n log n) guaranteed.',
          space: 'O(n) for the buffer, O(log n) stack.',
          code: {
            cpp: `class Solution {
  void msort(vector<int>& a, int lo, int hi, vector<int>& buf) {
    if (hi - lo <= 1) return;
    int mid = lo + (hi - lo) / 2;

    msort(a, lo, mid, buf);
    msort(a, mid, hi, buf);

    int i = lo, j = mid, k = lo;
    while (i < mid && j < hi) buf[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];   // <= => stable
    while (i < mid) buf[k++] = a[i++];
    while (j < hi)  buf[k++] = a[j++];

    copy(buf.begin() + lo, buf.begin() + hi, a.begin() + lo);
  }

public:
  vector<int> sortArray(vector<int>& nums) {
    vector<int> buf(nums.size());        // allocated ONCE
    msort(nums, 0, (int)nums.size(), buf);
    return nums;
  }
};`,
            java: `class Solution {
  public int[] sortArray(int[] nums) {
    int[] buf = new int[nums.length];
    msort(nums, 0, nums.length, buf);
    return nums;
  }

  private void msort(int[] a, int lo, int hi, int[] buf) {
    if (hi - lo <= 1) return;
    int mid = lo + (hi - lo) / 2;

    msort(a, lo, mid, buf);
    msort(a, mid, hi, buf);

    int i = lo, j = mid, k = lo;
    while (i < mid && j < hi) buf[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
    while (i < mid) buf[k++] = a[i++];
    while (j < hi)  buf[k++] = a[j++];

    System.arraycopy(buf, lo, a, lo, hi - lo);
  }
}`,
          },
          followUp: 'Count inversions during the merge — when you take an element from the right half, every remaining element in the left half forms an inversion with it. One added line, and it is LC 493.',
        },
      },
      practice: [
        {
          lc: 148,
          title: 'Sort List',
          slug: 'sort-list',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 45,
          insight: 'Merge sort on a linked list: split with fast/slow, merge with the dummy-node template. This is where merge sort beats quicksort — no random access required.',
          companies: ['google', 'meta'],
        },
        {
          lc: 493,
          title: 'Reverse Pairs',
          slug: 'reverse-pairs',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 55,
          insight:
            'Flipped: the sort is scaffolding and the counting is the answer. Count qualifying pairs with a separate two-pointer pass before each merge.',
          companies: ['google'],
        },
      ],
    },

    {
      id: 'quickselect',
      name: 'Quickselect and partitioning',
      signal:
        '"K-th largest", "top K", "median" — when you need a position rather than a full ordering, and O(n) average beats sorting.',
      time: 'O(n) average, O(n^2) worst',
      space: 'O(1)',
      template: {
        cpp: `int quickselect(vector<int>& a, int lo, int hi, int k) {   // k = target INDEX
  while (lo < hi) {
    int p = partition(a, lo, hi);
    if (p == k) return a[p];
    if (p < k) lo = p + 1;      // recurse into ONE side only — that is the saving
    else       hi = p - 1;
  }
  return a[lo];
}`,
        java: `int quickselect(int[] a, int lo, int hi, int k) {
  while (lo < hi) {
    int p = partition(a, lo, hi);
    if (p == k) return a[p];
    if (p < k) lo = p + 1;
    else       hi = p - 1;
  }
  return a[lo];
}`,
      },
      taught: {
        lc: 215,
        title: 'Kth Largest Element in an Array',
        slug: 'kth-largest-element-in-an-array',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          'Partitioning places the pivot at its FINAL sorted position for free. Compare that position to k and recurse into one side only — which turns O(n log n) into O(n) average.',
        companies: ['google', 'meta', 'amazon'],
        whyThisOne:
          'Revisiting it after the heap solution makes the comparison concrete, and quickselect is the expected answer when the interviewer says "now do it without extra space".',
        walkthrough: {
          howToSeeIt: [
            'Sorting gives the answer in O(n log n) but computes the position of every element when you only wanted one. That surplus is what you are trying to eliminate.',
            'Quicksort\'s partition does something remarkable as a side effect: after it runs, the pivot sits exactly where it belongs in the fully sorted array, with everything smaller before it and everything larger after.',
            'So compare the pivot\'s final index with the index you want. Equal means done. Otherwise the target is strictly on one side, and the other half can be discarded entirely rather than sorted.',
            'Discarding half each time gives n + n/2 + n/4 + ... = 2n expected work, hence O(n) average. Say "average" deliberately: an adversarial pivot sequence still yields O(n^2), which a random pivot makes vanishingly unlikely.',
          ],
          wherePeopleLoseIt:
            'Index confusion. The k-th LARGEST sits at sorted index n - k, and mixing that up produces an off-by-one that only appears for some k. Second, taking a fixed pivot: on sorted input every partition splits off one element and it degrades to O(n^2). Randomise, and say why.',
          time: 'O(n) average, O(n^2) worst.',
          space: 'O(1) with the iterative loop.',
          code: {
            cpp: `class Solution {
  int partition(vector<int>& a, int lo, int hi) {
    swap(a[lo + rand() % (hi - lo + 1)], a[hi]);   // random pivot, not a[hi] blindly
    int pivot = a[hi], i = lo;

    for (int j = lo; j < hi; ++j)
      if (a[j] < pivot) swap(a[i++], a[j]);

    swap(a[i], a[hi]);
    return i;                                       // final sorted position
  }

public:
  int findKthLargest(vector<int>& nums, int k) {
    int target = (int)nums.size() - k;              // k-th largest = index n - k
    int lo = 0, hi = (int)nums.size() - 1;

    while (lo < hi) {
      int p = partition(nums, lo, hi);
      if (p == target) return nums[p];
      if (p < target) lo = p + 1;                   // one side only
      else            hi = p - 1;
    }
    return nums[lo];
  }
}`,
            java: `class Solution {
  private final Random rnd = new Random();

  public int findKthLargest(int[] nums, int k) {
    int target = nums.length - k;
    int lo = 0, hi = nums.length - 1;

    while (lo < hi) {
      int p = partition(nums, lo, hi);
      if (p == target) return nums[p];
      if (p < target) lo = p + 1;
      else            hi = p - 1;
    }
    return nums[lo];
  }

  private int partition(int[] a, int lo, int hi) {
    swap(a, lo + rnd.nextInt(hi - lo + 1), hi);
    int pivot = a[hi], i = lo;

    for (int j = lo; j < hi; j++)
      if (a[j] < pivot) swap(a, i++, j);

    swap(a, i, hi);
    return i;
  }

  private void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }
}`,
          },
          followUp: 'Guarantee O(n) worst case with median-of-medians — beautiful, but the constant factor is so bad that nobody uses it in practice. Knowing that nuance is the point.',
        },
      },
      practice: [
        {
          lc: 973,
          title: 'K Closest Points to Origin',
          slug: 'k-closest-points-to-origin',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight: 'Quickselect on squared distance. Compare directly against the heap solution: better average time, worse worst case, and useless on a stream.',
          companies: ['google', 'meta'],
        },
        {
          lc: 347,
          title: 'Top K Frequent Elements',
          slug: 'top-k-frequent-elements',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight:
            'Flipped: quickselect over frequency COUNTS. Then note bucket sort solves it in true O(n), because a frequency can never exceed n — the constraint that breaks the comparison bound.',
          companies: ['amazon', 'google'],
        },
      ],
    },

    {
      id: 'non-comparison-sort',
      name: 'Counting, bucket and radix sort',
      signal:
        'Values are bounded and small — ages, letters, frequencies, digits — or the interviewer explicitly asks for better than O(n log n). Read the values instead of comparing them.',
      time: 'O(n + k)',
      space: 'O(n + k)',
      template: {
        cpp: `// Counting sort: k = value range
vector<int> count(k, 0);
for (int x : a) ++count[x];

int w = 0;
for (int v = 0; v < k; ++v)
  while (count[v]-- > 0) a[w++] = v;

// Bucket by frequency: buckets[f] holds every value occurring f times.
vector<vector<int>> buckets(n + 1);
for (auto& [value, freq] : counts) buckets[freq].push_back(value);`,
        java: `int[] count = new int[k];
for (int x : a) count[x]++;

int w = 0;
for (int v = 0; v < k; v++)
  while (count[v]-- > 0) a[w++] = v;`,
      },
      taught: {
        lc: 75,
        title: 'Sort Colors',
        slug: 'sort-colors',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 25,
        insight:
          'Only three distinct values exist, so counting them and rewriting is O(n) — and the one-pass Dutch flag partition does it without even a counting array.',
        companies: ['microsoft', 'amazon'],
        whyThisOne:
          'The smallest problem where the comparison lower bound is visibly irrelevant, and it connects directly to the partition step of quicksort.',
        walkthrough: {
          howToSeeIt: [
            'A general sort is O(n log n) because comparisons carry little information. Here the values are only 0, 1 and 2 — knowing a value tells you its final region immediately, so no comparison is needed.',
            'Two-pass counting sort: count the three values, then overwrite the array with that many 0s, then 1s, then 2s. O(n) time, O(1) space, and completely obvious. Offer it first.',
            'The problem asks for one pass, which is the Dutch national flag partition: a low boundary, a scanner and a high boundary, as covered in two pointers.',
            'State the generalisation: with values in [0, k) counting sort is O(n + k), which beats O(n log n) whenever k is small relative to n and is useless when k is huge.',
          ],
          wherePeopleLoseIt:
            'Reaching for counting sort when the range is unbounded. Sorting ages 0-120 with counting sort is excellent; sorting arbitrary 32-bit integers that way needs a 4-billion-entry table. Always check k against n before claiming the improvement.',
          time: 'O(n).',
          space: 'O(1) — three counters.',
          code: {
            cpp: `void sortColors(vector<int>& nums) {
  // Two-pass counting sort: no comparisons at all.
  int count[3] = {0, 0, 0};
  for (int x : nums) ++count[x];

  int w = 0;
  for (int v = 0; v < 3; ++v)
    while (count[v]-- > 0) nums[w++] = v;
}

// One-pass alternative (Dutch national flag):
void sortColorsOnePass(vector<int>& nums) {
  int low = 0, i = 0, high = (int)nums.size() - 1;
  while (i <= high) {
    if (nums[i] == 0)      swap(nums[low++], nums[i++]);
    else if (nums[i] == 2) swap(nums[i], nums[high--]);   // i does NOT advance
    else                   ++i;
  }
}`,
            java: `public void sortColors(int[] nums) {
  int[] count = new int[3];
  for (int x : nums) count[x]++;

  int w = 0;
  for (int v = 0; v < 3; v++)
    while (count[v]-- > 0) nums[w++] = v;
}`,
          },
          followUp: 'How would you sort 10 million 32-bit integers? Radix sort by byte — four counting-sort passes, O(4n), and it genuinely beats comparison sorts at that scale.',
        },
      },
      practice: [
        {
          lc: 1122,
          title: 'Relative Sort Array',
          slug: 'relative-sort-array',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 20,
          insight: 'Counting sort with a custom output order: emit values in the order given by the second array, then whatever remains in ascending order.',
        },
        {
          lc: 164,
          title: 'Maximum Gap',
          slug: 'maximum-gap',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 50,
          insight:
            'Flipped: linear time is REQUIRED, so sorting is banned. Bucket by the pigeonhole principle — the largest gap must fall between buckets, never inside one.',
          companies: ['google'],
        },
      ],
    },

    {
      id: 'sort-as-preprocessing',
      name: 'Sorting as the enabling move',
      signal:
        'An unordered-input problem where brute force is O(n^2), and order would make duplicates adjacent, enable two pointers, or justify a greedy. Ask what sorting would buy before you write the nested loops.',
      time: 'O(n log n)',
      space: 'O(1) to O(n)',
      googleHeavy: true,
      template: {
        cpp: `sort(a.begin(), a.end(), [](const auto& x, const auto& y) {
  if (x.height != y.height) return x.height > y.height;   // tallest first
  return x.k < y.k;                                        // tie-break ascending
});

for (auto& p : a) out.insert(out.begin() + p.k, p);        // insert at its index`,
        java: `Arrays.sort(people, (x, y) -> x[0] != y[0] ? y[0] - x[0] : x[1] - y[1]);

List<int[]> out = new ArrayList<>();
for (int[] p : people) out.add(p[1], p);`,
      },
      taught: {
        lc: 406,
        title: 'Queue Reconstruction by Height',
        slug: 'queue-reconstruction-by-height',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          'Sort tallest first, then insert each person at the index given by their own k. Shorter people inserted later are invisible to everyone already placed, so no earlier placement is ever disturbed.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'It looks impossible until the sort order is chosen correctly, after which it is two lines. The best demonstration that the sort key IS the algorithm.',
        walkthrough: {
          howToSeeIt: [
            'Each person knows how many people at least as tall stand ahead of them. Trying to build the queue in arbitrary order fails, because inserting someone changes everyone else\'s count.',
            'Ask which insertions are SAFE. Inserting a shorter person cannot change the count of anyone taller, since the counts only track people at least as tall. So if you place people from tallest to shortest, every placement is permanent.',
            'Once only people of equal-or-greater height are present, a person\'s k is exactly their index in the partial queue. So insert each person at position k — the answer is literally their own value.',
            'Tie-break by ascending k among equal heights, so that within a height group the smaller index is placed first and the later insertions push correctly.',
          ],
          wherePeopleLoseIt:
            'Sorting shortest first, which feels natural and makes every later insertion invalidate earlier counts. The insight is the direction of the sort. A minor note: list insertion is O(n) per person, so this is O(n^2) overall — fine at the given limits, and worth mentioning before being asked.',
          time: 'O(n^2) because of the insertions; O(n log n) for the sort itself.',
          space: 'O(n).',
          code: {
            cpp: `vector<vector<int>> reconstructQueue(vector<vector<int>>& people) {
  // Tallest first; among equal heights, smaller k first.
  sort(people.begin(), people.end(), [](const vector<int>& a, const vector<int>& b) {
    if (a[0] != b[0]) return a[0] > b[0];
    return a[1] < b[1];
  });

  vector<vector<int>> out;
  for (auto& p : people)
    out.insert(out.begin() + p[1], p);   // k IS the index, once only taller people are present

  return out;
}`,
            java: `public int[][] reconstructQueue(int[][] people) {
  Arrays.sort(people, (a, b) -> a[0] != b[0] ? b[0] - a[0] : a[1] - b[1]);

  List<int[]> out = new ArrayList<>();
  for (int[] p : people) out.add(p[1], p);

  return out.toArray(new int[0][]);
}`,
          },
          followUp: 'Do the insertions in O(n log n) with a Fenwick tree over free positions — the practical answer if n were a million.',
        },
      },
      practice: [
        {
          lc: 881,
          title: 'Boats to Save People',
          slug: 'boats-to-save-people',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight: 'Sort, then two pointers from both ends: pair the lightest with the heaviest when they fit. Sorting is what makes the greedy pairing provably optimal.',
        },
        {
          lc: 1233,
          title: 'Remove Sub-Folders from the Filesystem',
          slug: 'remove-sub-folders-from-the-filesystem',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped to strings: lexicographic sorting places every parent immediately before its children, so one pass comparing against the last kept folder suffices.',
        },
      ],
    },
  ],
};
