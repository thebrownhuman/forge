import type { Topic } from '../../schema';

export const slidingWindow: Topic = {
  id: 'sliding-window',
  name: 'Sliding Window',
  phase: 1,
  estHours: 12,
  prerequisites: ['arrays', 'hashing'],

  whyItMatters:
    'Any question about a contiguous subarray or substring that asks for a maximum, minimum, or count is a sliding window until proven otherwise. It turns the obvious O(n^2) double loop into O(n) by never re-reading what the window already knows. Google asks this constantly, usually disguised as a string problem.',

  fundamentals: [
    {
      heading: 'The window is a running answer, not a slice',
      body:
        'Beginners picture cutting out a subarray and re-summing it. That is the O(n^2) version. The real idea: keep a small piece of state (a sum, a count, a frequency map) that describes the current window, and repair it in O(1) as the edges move. Adding a[r] and removing a[l] is the whole algorithm. If repairing your state on removal is expensive, sliding window is the wrong tool — that is the honest test.',
      costs: [
        { op: 'extend right', cost: 'O(1)', note: 'add a[r] into the running state' },
        { op: 'shrink left', cost: 'O(1)', note: 'undo a[l] from the running state' },
        { op: 'total', cost: 'O(n)', note: 'each index enters once and leaves once' },
      ],
    },
    {
      heading: 'Why two pointers never go backwards',
      body:
        'The whole O(n) claim rests on one fact: l and r only ever increase. Each of the n indices is added once and removed at most once, so the inner while loop runs at most n times across the entire outer loop — not n times per step. This is amortised analysis, and it is the reason a nested while inside a for is still linear here. If your solution ever moves l backwards, you have broken the guarantee and it is no longer a sliding window.',
    },
    {
      heading: 'The monotonicity precondition',
      body:
        'Variable-size windows only work when the validity of a window is monotonic: if a window is invalid, every larger window containing it is also invalid. That is what makes "shrink until valid" correct. It holds for sums of non-negative numbers, distinct-character counts, and at-most-K constraints. It breaks the moment negative numbers enter a sum problem — which is exactly why "shortest subarray with sum at least K" on an array with negatives (LC 862) is Hard and needs a monotonic deque over prefix sums instead.',
    },
    {
      heading: 'Choosing your window state',
      body:
        'Pick the cheapest state that can answer "is this window valid?" in O(1). A running sum for sum constraints. An int counter of distinct keys for distinct constraints. A 26-slot array plus a matched counter for anagram problems — never compare whole maps each step, that is an avoidable O(26n).',
      code: {
        cpp: `int distinct = 0;
unordered_map<char,int> freq;
// on add:    if (++freq[c] == 1) ++distinct;
// on remove: if (--freq[c] == 0) --distinct;`,
        java: `int distinct = 0;
Map<Character,Integer> freq = new HashMap<>();
// on add:    if (freq.merge(c, 1, Integer::sum) == 1) distinct++;
// on remove: if (freq.merge(c, -1, Integer::sum) == 0) distinct--;`,
      },
    },
  ],

  questionTypes: [
    /* ---------------------------------------------------------------- 1 */
    {
      id: 'fixed-window',
      name: 'Fixed-size window',
      signal:
        'The prompt hands you k. "subarray of size k", "every k consecutive", "average of k". Because k is given, you never shrink — you slide: add one on the right, drop one on the left, forever.',
      time: 'O(n)',
      space: 'O(1)',
      template: {
        cpp: `long long sum = 0;
long long best = LLONG_MIN;
for (int r = 0; r < n; ++r) {
  sum += a[r];
  if (r >= k) sum -= a[r - k];      // drop the element leaving the window
  if (r >= k - 1) best = max(best, sum);  // only record once the window is k wide
}`,
        java: `long sum = 0;
long best = Long.MIN_VALUE;
for (int r = 0; r < n; r++) {
  sum += a[r];
  if (r >= k) sum -= a[r - k];
  if (r >= k - 1) best = Math.max(best, sum);
}`,
      },
      taught: {
        lc: 643,
        title: 'Maximum Average Subarray I',
        slug: 'maximum-average-subarray-i',
        difficulty: 'easy',
        role: 'taught',
        estMinutes: 12,
        insight: 'Maximise the sum of k elements, divide once at the end — never track the average itself.',
        whyThisOne:
          'The smallest possible problem that still contains the full fixed-window skeleton, so the shape is visible with nothing else in the way.',
        walkthrough: {
          howToSeeIt: [
            'The prompt gives you k explicitly. That single fact rules out every variable-window pattern — the window size is an input, not the answer.',
            'Maximising an average over a fixed count is identical to maximising the sum, because dividing by a constant k preserves order. So track the sum and divide once at the very end. Tracking a running average instead invites floating-point drift for no benefit.',
            'The window state is one number: the sum. Extending right means += a[r]. Sliding means -= a[r-k]. Both O(1).',
            'Guard the answer: the window is only genuinely k wide once r reaches k-1. Record before that and you compare partial windows against full ones.',
          ],
          wherePeopleLoseIt:
            'Recording the answer before the window is k wide, or initialising best to 0. Values can be negative, so best = 0 silently returns a wrong answer on all-negative input — the classic invisible bug. Start from the first complete window, or from LLONG_MIN.',
          time: 'O(n) — each index is added once and removed once.',
          space: 'O(1) — a single running sum.',
          code: {
            cpp: `double findMaxAverage(vector<int>& nums, int k) {
  long long sum = 0;
  for (int i = 0; i < k; ++i) sum += nums[i];   // first full window
  long long best = sum;

  for (int r = k; r < (int)nums.size(); ++r) {
    sum += nums[r] - nums[r - k];               // slide by one
    best = max(best, sum);
  }
  return (double)best / k;                      // divide once, at the end
}`,
            java: `public double findMaxAverage(int[] nums, int k) {
  long sum = 0;
  for (int i = 0; i < k; i++) sum += nums[i];
  long best = sum;

  for (int r = k; r < nums.length; r++) {
    sum += nums[r] - nums[r - k];
    best = Math.max(best, sum);
  }
  return (double) best / k;
}`,
          },
          followUp:
            'What if k can change between queries? Then precompute prefix sums once and answer each query in O(1) as prefix[r+1] - prefix[r+1-k].',
        },
      },
      practice: [
        {
          lc: 1456,
          title: 'Maximum Number of Vowels in a Substring of Given Length',
          slug: 'maximum-number-of-vowels-in-a-substring-of-given-length',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 15,
          insight: 'Same skeleton — the running state is a vowel count instead of a sum. Map each char to 0 or 1 and it is literally LC 643.',
        },
        {
          lc: 1343,
          title: 'Number of Sub-arrays of Size K and Average Greater than or Equal to Threshold',
          slug: 'number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 15,
          insight:
            'Flipped: you count qualifying windows instead of maximising one. Compare sum >= threshold * k to stay in integers and dodge floating point entirely.',
        },
      ],
      prove: {
        lc: 2841,
        title: 'Maximum Sum of Almost Unique Subarray',
        slug: 'maximum-sum-of-almost-unique-subarray',
        difficulty: 'medium',
        role: 'prove',
        estMinutes: 30,
        // Stored but never rendered for `prove` problems — the UI withholds it.
        insight: 'Fixed window plus a distinct-count map: track how many values are unique inside the window and require that count to be at least m.',
        companies: ['google'],
      },
    },

    /* ---------------------------------------------------------------- 2 */
    {
      id: 'variable-window',
      name: 'Variable window — grow, then shrink',
      signal:
        '"Longest" or "shortest" subarray/substring SUCH THAT some condition holds. The size is the answer, not the input. Right always advances; left advances only while the window is invalid.',
      time: 'O(n)',
      space: 'O(k) for the window state',
      googleHeavy: true,
      template: {
        cpp: `int l = 0, best = 0;
for (int r = 0; r < n; ++r) {
  add(a[r]);                     // extend right, unconditionally
  while (!valid()) {             // repair, never re-scan
    remove(a[l]);
    ++l;
  }
  best = max(best, r - l + 1);   // window is valid here
}`,
        java: `int l = 0, best = 0;
for (int r = 0; r < n; r++) {
  add(a[r]);
  while (!valid()) {
    remove(a[l]);
    l++;
  }
  best = Math.max(best, r - l + 1);
}`,
      },
      taught: {
        lc: 3,
        title: 'Longest Substring Without Repeating Characters',
        slug: 'longest-substring-without-repeating-characters',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 25,
        insight: 'Keep the last index of each character; jump l forward past the previous copy, but never backwards.',
        companies: ['google', 'amazon', 'meta'],
        whyThisOne:
          'The canonical variable window, and the one where the "never move l backwards" trap is most instructive.',
        walkthrough: {
          howToSeeIt: [
            '"Longest substring" plus a constraint — the length is what you are solving for, so the window size must be free to change. That rules out the fixed-window pattern immediately.',
            'The right pointer always moves forward. That is not a decision you make per step; every index must be visited.',
            'The only real question is: when is the window invalid? Here, invalid means a character repeats inside it. So the state you need is "have I seen this character, and where?".',
            'While invalid, move l forward. Record the answer only when the window is valid. With a last-seen index table you can skip l straight past the old copy in one step instead of looping — but you must clamp with max().',
          ],
          wherePeopleLoseIt:
            'Writing l = last[c] + 1 without max(l, ...). A stale index from far behind the current window drags l backwards, the window silently grows to include duplicates, and the answer comes out too large. Only test cases with a repeat well outside the window catch it — so it passes the examples and fails the submission.',
          time: 'O(n) — l and r each advance at most n times total.',
          space: 'O(min(n, alphabet)) — 128 slots here.',
          code: {
            cpp: `int lengthOfLongestSubstring(string s) {
  vector<int> last(128, -1);        // last index each char was seen at
  int best = 0, l = 0;

  for (int r = 0; r < (int)s.size(); ++r) {
    // If s[r] was seen inside the window, jump l past it.
    // max() is essential: last[s[r]] may point behind l.
    l = max(l, last[s[r]] + 1);
    last[s[r]] = r;
    best = max(best, r - l + 1);
  }
  return best;
}`,
            java: `public int lengthOfLongestSubstring(String s) {
  int[] last = new int[128];
  Arrays.fill(last, -1);
  int best = 0, l = 0;

  for (int r = 0; r < s.length(); r++) {
    char c = s.charAt(r);
    l = Math.max(l, last[c] + 1);
    last[c] = r;
    best = Math.max(best, r - l + 1);
  }
  return best;
}`,
          },
          followUp:
            'Return the substring itself, not the length — store the start index whenever you update best. Then: what changes for Unicode? The 128-slot array becomes a hash map and space becomes O(min(n, distinct)).',
        },
      },
      practice: [
        {
          lc: 424,
          title: 'Longest Repeating Character Replacement',
          slug: 'longest-repeating-character-replacement',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Valid means (window length − count of the most frequent char) <= k. The famous shortcut: you never need to decrease maxCount, because a smaller window can never beat the best already recorded.',
          companies: ['google', 'amazon'],
        },
        {
          lc: 209,
          title: 'Minimum Size Subarray Sum',
          slug: 'minimum-size-subarray-sum',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight:
            'Flipped: shortest instead of longest. So you shrink while the window is STILL valid and record inside the shrink loop — the mirror image of the template above.',
        },
      ],
    },

    /* ---------------------------------------------------------------- 3 */
    {
      id: 'at-most-k',
      name: 'At-most-K → exactly-K',
      signal:
        '"Count subarrays with EXACTLY K ...". Exact counts are not monotonic, so they cannot slide directly. Run the at-most version twice: atMost(K) − atMost(K−1).',
      time: 'O(n)',
      space: 'O(k)',
      googleHeavy: true,
      template: {
        cpp: `auto atMost = [&](int k) {
  int l = 0; long long count = 0;
  for (int r = 0; r < n; ++r) {
    add(a[r]);
    while (violates(k)) { remove(a[l]); ++l; }
    count += r - l + 1;      // every subarray ending at r is valid
  }
  return count;
};
return atMost(K) - atMost(K - 1);`,
        java: `long atMost(int[] a, int k) {
  int l = 0; long count = 0;
  for (int r = 0; r < a.length; r++) {
    add(a[r]);
    while (violates(k)) { remove(a[l]); l++; }
    count += r - l + 1;
  }
  return count;
}
// answer = atMost(K) - atMost(K - 1)`,
      },
      taught: {
        lc: 992,
        title: 'Subarrays with K Different Integers',
        slug: 'subarrays-with-k-different-integers',
        difficulty: 'hard',
        role: 'taught',
        estMinutes: 45,
        insight: 'exactly(K) = atMost(K) − atMost(K−1). Each is a plain variable window, so a Hard collapses into two Mediums.',
        companies: ['google'],
        whyThisOne:
          'It is rated Hard purely because of the exactly→atMost reframing. Once you own that move, the code is a pattern-2 window you already wrote.',
        walkthrough: {
          howToSeeIt: [
            'Notice you are COUNTING subarrays, not measuring one. Counting is the signal to think about "how many subarrays end at r", not "what is the best window".',
            'Try the direct approach and watch it fail: "exactly K distinct" is not monotonic. Shrinking a window with exactly K distinct can drop to K−1, and growing can jump to K+1 — there is no single point to shrink to. The window has no stable target.',
            '"At most K distinct" IS monotonic: shrink while distinct > K and you land on the largest valid window. And once the window ending at r is valid, every one of its suffixes is too — so it contributes exactly (r − l + 1) subarrays. That is the counting trick.',
            'Then arithmetic finishes it: subarrays with at most K, minus those with at most K−1, leaves precisely those with exactly K. Two linear passes, still O(n).',
          ],
          wherePeopleLoseIt:
            'Trying to force a single window to hold exactly K and hunting for the right shrink condition. It cannot be done in one pass — the structure genuinely is not monotonic. The other trap is forgetting that count += r - l + 1 counts subarrays ENDING at r; people write count++ and get a wildly low answer.',
          time: 'O(n) — two independent linear passes.',
          space: 'O(n) worst case for the frequency map.',
          code: {
            cpp: `int subarraysWithKDistinct(vector<int>& nums, int k) {
  return atMost(nums, k) - atMost(nums, k - 1);
}

int atMost(vector<int>& nums, int k) {
  unordered_map<int,int> freq;
  int l = 0, count = 0;

  for (int r = 0; r < (int)nums.size(); ++r) {
    if (++freq[nums[r]] == 1) --k;        // a new distinct value

    while (k < 0) {                       // too many distinct: shrink
      if (--freq[nums[l]] == 0) ++k;
      ++l;
    }
    count += r - l + 1;                   // all subarrays ending at r
  }
  return count;
}`,
            java: `public int subarraysWithKDistinct(int[] nums, int k) {
  return atMost(nums, k) - atMost(nums, k - 1);
}

private int atMost(int[] nums, int k) {
  Map<Integer,Integer> freq = new HashMap<>();
  int l = 0, count = 0;

  for (int r = 0; r < nums.length; r++) {
    if (freq.merge(nums[r], 1, Integer::sum) == 1) k--;

    while (k < 0) {
      if (freq.merge(nums[l], -1, Integer::sum) == 0) k++;
      l++;
    }
    count += r - l + 1;
  }
  return count;
}`,
          },
          followUp:
            'Can you do it in one pass? Yes — maintain two left pointers (one for at-most-K, one for at-most-K−1) and take their difference. Worth knowing, but the two-pass version is what you should write under interview pressure: it is far harder to get wrong.',
        },
      },
      practice: [
        {
          lc: 930,
          title: 'Binary Subarrays With Sum',
          slug: 'binary-subarrays-with-sum',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight: 'Same move on sums: exactly(S) = atMost(S) − atMost(S−1), since the array is all 0s and 1s so sums are monotonic.',
        },
        {
          lc: 1248,
          title: 'Count Number of Nice Subarrays',
          slug: 'count-number-of-nice-subarrays',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight:
            'Disguised: map odd→1, even→0 and "exactly k odd numbers" becomes LC 930 verbatim. Recognising the disguise is the entire exercise.',
        },
      ],
    },

    /* ---------------------------------------------------------------- 4 */
    {
      id: 'window-frequency-map',
      name: 'Window + frequency map',
      signal:
        'Anagrams and permutations — "contains a permutation of", "find all anagrams". The window is fixed at the pattern length, and validity is "do these two frequency maps match?".',
      time: 'O(n)',
      space: 'O(1) — 26 slots',
      template: {
        cpp: `vector<int> need(26, 0), have(26, 0);
for (char c : p) ++need[c - 'a'];
int matched = 0;                       // how many letters have the exact right count

for (int r = 0; r < (int)s.size(); ++r) {
  int in = s[r] - 'a';
  if (++have[in] == need[in]) ++matched;
  else if (have[in] == need[in] + 1) --matched;   // just overshot

  if (r >= (int)p.size()) {
    int out = s[r - p.size()] - 'a';
    if (--have[out] == need[out]) ++matched;
    else if (have[out] == need[out] - 1) --matched;
  }
  if (matched == 26) { /* window is an anagram */ }
}`,
        java: `int[] need = new int[26], have = new int[26];
for (char c : p.toCharArray()) need[c - 'a']++;
int matched = 0;

for (int r = 0; r < s.length(); r++) {
  int in = s.charAt(r) - 'a';
  if (++have[in] == need[in]) matched++;
  else if (have[in] == need[in] + 1) matched--;

  if (r >= p.length()) {
    int out = s.charAt(r - p.length()) - 'a';
    if (--have[out] == need[out]) matched++;
    else if (have[out] == need[out] - 1) matched--;
  }
  // matched == 26 means the window is an anagram
}`,
      },
      taught: {
        lc: 567,
        title: 'Permutation in String',
        slug: 'permutation-in-string',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 28,
        insight:
          'A permutation is exactly a matching letter-frequency map. Track a matched counter so each step is O(1), not O(26).',
        companies: ['google', 'microsoft'],
        whyThisOne:
          'Almost everyone first writes the O(26n) version that compares whole arrays. Seeing the matched-counter upgrade here is what makes LC 76 tractable later.',
        walkthrough: {
          howToSeeIt: [
            'A permutation of p has the same length as p and the same letter counts. So the window size is fixed at p.length() — this is a fixed window with a richer state than a sum.',
            'Validity means "the window\'s 26 counts equal p\'s 26 counts". Comparing the arrays each step works and is O(26n), which passes — but the interviewer will ask you to do better.',
            'Upgrade: maintain matched, the number of letters whose count is exactly right. Adjust it by at most one on each add and each remove. Then validity is the single comparison matched == 26.',
            'The adjustment logic has exactly two cases per edge. On add: if have becomes equal to need, one more letter is correct (matched++); if it becomes need+1, a previously correct letter just broke (matched--). On remove, mirrored.',
          ],
          wherePeopleLoseIt:
            'The matched bookkeeping. People update matched only when counts become equal and forget the overshoot case, so matched drifts upward and the function reports false positives. Writing both branches — became-equal and just-left-equal — is the discipline. Also: comparing full maps and then wondering why 76 times out.',
          time: 'O(n) — one pass, O(1) work per step.',
          space: 'O(1) — two fixed 26-element arrays.',
          code: {
            cpp: `bool checkInclusion(string p, string s) {
  if (p.size() > s.size()) return false;

  vector<int> need(26, 0), have(26, 0);
  for (char c : p) ++need[c - 'a'];

  int matched = 0;
  for (int i = 0; i < 26; ++i) if (need[i] == 0) ++matched;  // zero counts start correct

  for (int r = 0; r < (int)s.size(); ++r) {
    int in = s[r] - 'a';
    if (++have[in] == need[in]) ++matched;
    else if (have[in] == need[in] + 1) --matched;

    if (r >= (int)p.size()) {
      int out = s[r - p.size()] - 'a';
      if (--have[out] == need[out]) ++matched;
      else if (have[out] == need[out] - 1) --matched;
    }

    if (matched == 26) return true;
  }
  return false;
}`,
            java: `public boolean checkInclusion(String p, String s) {
  if (p.length() > s.length()) return false;

  int[] need = new int[26], have = new int[26];
  for (char c : p.toCharArray()) need[c - 'a']++;

  int matched = 0;
  for (int i = 0; i < 26; i++) if (need[i] == 0) matched++;

  for (int r = 0; r < s.length(); r++) {
    int in = s.charAt(r) - 'a';
    if (++have[in] == need[in]) matched++;
    else if (have[in] == need[in] + 1) matched--;

    if (r >= p.length()) {
      int out = s.charAt(r - p.length()) - 'a';
      if (--have[out] == need[out]) matched++;
      else if (have[out] == need[out] - 1) matched--;
    }

    if (matched == 26) return true;
  }
  return false;
}`,
          },
          followUp:
            'Return every start index instead of a boolean — that is LC 438, the same code with a results vector. Then: what if the alphabet is Unicode? Swap the arrays for maps and count distinct required keys instead of 26.',
        },
      },
      practice: [
        {
          lc: 438,
          title: 'Find All Anagrams in a String',
          slug: 'find-all-anagrams-in-a-string',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 22,
          insight: 'LC 567 with a results list instead of an early return. Write it from memory — if you cannot, you have not learned 567.',
          companies: ['amazon', 'google'],
        },
        {
          lc: 76,
          title: 'Minimum Window Substring',
          slug: 'minimum-window-substring',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 50,
          insight:
            'Flipped: the window size is now free, so it is pattern 2 and pattern 4 fused — grow until all letters are covered, then shrink while still covered, recording the minimum.',
          companies: ['google', 'meta', 'amazon'],
        },
      ],
    },

    /* ---------------------------------------------------------------- 5 */
    {
      id: 'monotonic-deque-window',
      name: 'Monotonic deque inside the window',
      signal:
        'You need the max or min OF THE CURRENT WINDOW in O(1). A heap gives O(n log n) and cannot evict the leaving element cheaply — a deque of indices can.',
      time: 'O(n)',
      space: 'O(k)',
      googleHeavy: true,
      template: {
        cpp: `deque<int> dq;                    // holds INDICES, values decreasing
for (int r = 0; r < n; ++r) {
  while (!dq.empty() && a[dq.back()] <= a[r]) dq.pop_back();  // dominated, drop
  dq.push_back(r);
  if (dq.front() <= r - k) dq.pop_front();                    // left the window
  if (r >= k - 1) out.push_back(a[dq.front()]);               // front is the max
}`,
        java: `Deque<Integer> dq = new ArrayDeque<>();
for (int r = 0; r < n; r++) {
  while (!dq.isEmpty() && a[dq.peekLast()] <= a[r]) dq.pollLast();
  dq.addLast(r);
  if (dq.peekFirst() <= r - k) dq.pollFirst();
  if (r >= k - 1) out[r - k + 1] = a[dq.peekFirst()];
}`,
      },
      taught: {
        lc: 239,
        title: 'Sliding Window Maximum',
        slug: 'sliding-window-maximum',
        difficulty: 'hard',
        role: 'taught',
        estMinutes: 45,
        insight:
          'Store indices, not values, in a deque kept decreasing. Anything smaller than a newer element can never be the max again, so discard it immediately.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'The purest statement of the monotonic-deque idea, and the answer to "your heap solution is O(n log n), can you do better?" — a question Google asks directly.',
        walkthrough: {
          howToSeeIt: [
            'Fixed window (k is given) but the state you need is the maximum, and a max cannot be repaired in O(1) on removal — when the max itself leaves, you do not know the next one. So a plain running variable fails.',
            'A max-heap fixes retrieval but not eviction: you cannot remove an arbitrary element cheaply, so you carry stale entries and pay O(n log n).',
            'The key observation: if a[i] <= a[j] and i < j, then a[i] is useless forever. It leaves the window earlier AND it is not larger. So you can throw it away the moment j arrives — no reason to ever reconsider it.',
            'Apply that rule on every insertion and the deque stays decreasing by construction. The front is always the window maximum, and elements that scroll off the left are dropped by index. Each index is pushed once and popped once: O(n) total, despite the inner while.',
          ],
          wherePeopleLoseIt:
            'Storing values instead of indices. Values alone cannot tell you whether the front has scrolled out of the window, and you end up scanning to find out — which destroys the O(n). The second trap is pop order: you must drop dominated elements from the BACK, then evict the expired front. Reversing those two makes it fail on the first duplicate.',
          time: 'O(n) — every index enters and leaves the deque exactly once.',
          space: 'O(k) — the deque holds at most one window of indices.',
          code: {
            cpp: `vector<int> maxSlidingWindow(vector<int>& nums, int k) {
  deque<int> dq;                // indices, their values strictly decreasing
  vector<int> out;

  for (int r = 0; r < (int)nums.size(); ++r) {
    // Any index whose value is <= nums[r] can never be the max again.
    while (!dq.empty() && nums[dq.back()] <= nums[r]) dq.pop_back();
    dq.push_back(r);

    // Front may have scrolled out of the window.
    if (dq.front() <= r - k) dq.pop_front();

    if (r >= k - 1) out.push_back(nums[dq.front()]);
  }
  return out;
}`,
            java: `public int[] maxSlidingWindow(int[] nums, int k) {
  Deque<Integer> dq = new ArrayDeque<>();
  int[] out = new int[nums.length - k + 1];

  for (int r = 0; r < nums.length; r++) {
    while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[r]) dq.pollLast();
    dq.addLast(r);

    if (dq.peekFirst() <= r - k) dq.pollFirst();

    if (r >= k - 1) out[r - k + 1] = nums[dq.peekFirst()];
  }
  return out;
}`,
          },
          followUp:
            'Now give me the window minimum too — run a second deque kept increasing. That combination is exactly LC 1438, where validity is max − min <= limit.',
        },
      },
      practice: [
        {
          lc: 1438,
          title: 'Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit',
          slug: 'longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight: 'Two deques at once — one decreasing for the max, one increasing for the min — inside a variable window.',
          companies: ['google'],
        },
        {
          lc: 862,
          title: 'Shortest Subarray with Sum at Least K',
          slug: 'shortest-subarray-with-sum-at-least-k',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 55,
          insight:
            'Flipped hard: negatives break window monotonicity, so you run the deque over PREFIX SUMS instead of raw values. The honest demonstration of when a plain sliding window is simply wrong.',
          companies: ['google'],
        },
      ],
    },
  ],
};
