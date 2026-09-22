import type { Topic } from '../../schema';

export const stl: Topic = {
  id: 'stl',
  name: 'C++ & Java Standard Library',
  phase: 0,
  estHours: 8,
  prerequisites: [],

  whyItMatters:
    'Interviews are timed. Fluency with the standard containers is the difference between spending your 35 minutes on the algorithm or on remembering how to sort with a custom comparator. You are never asked to implement a hash map — you are asked to reach for the right one instantly and to know what it costs.',

  fundamentals: [
    {
      heading: 'Ordered versus unordered: the only decision that matters',
      body:
        'map/set are balanced trees: sorted order, O(log n), and they support range queries like "smallest key >= x". unordered_map/unordered_set are hash tables: no order, O(1) average but O(n) worst case on adversarial keys. Default to unordered when you only need lookup; reach for ordered the moment you need sorted iteration, floor/ceiling, or a predictable worst case. In Java the same split is TreeMap versus HashMap.',
      costs: [
        { op: 'unordered_map / HashMap lookup', cost: 'O(1) average', note: 'O(n) worst case with collisions' },
        { op: 'map / TreeMap lookup', cost: 'O(log n)', note: 'plus sorted iteration for free' },
        { op: 'map::lower_bound / TreeMap.ceilingKey', cost: 'O(log n)', note: 'the reason ordered maps exist' },
        { op: 'vector push_back / ArrayList.add', cost: 'O(1) amortised', note: '' },
        { op: 'vector insert/erase at middle', cost: 'O(n)', note: 'the hidden loop that ruins complexity' },
      ],
    },
    {
      heading: 'The idioms worth memorising cold',
      body:
        'These appear in a large fraction of solutions. Write them until they are automatic — hesitating here burns interview minutes on nothing.',
      code: {
        cpp: `sort(a.begin(), a.end());
sort(a.begin(), a.end(), [](const auto& x, const auto& y){ return x.second > y.second; });
auto it = lower_bound(a.begin(), a.end(), target);      // first >= target
int idx = it - a.begin();
priority_queue<int> maxHeap;
priority_queue<int, vector<int>, greater<int>> minHeap;
for (auto& [key, val] : myMap) { }                      // structured binding
string s(n, 'a'); reverse(s.begin(), s.end());`,
        java: `Arrays.sort(a);
list.sort((x, y) -> y.getValue() - x.getValue());
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
for (Map.Entry<K,V> e : map.entrySet()) { }
map.merge(key, 1, Integer::sum);      // the cleanest frequency count in Java
map.computeIfAbsent(key, k -> new ArrayList<>()).add(v);
new StringBuilder(s).reverse().toString();`,
      },
    },
    {
      heading: 'Strings are immutable in Java, mutable in C++',
      body:
        'In Java, s += c inside a loop allocates a new string every iteration — O(n^2) for the loop. Use StringBuilder. In C++, std::string is mutable and += is amortised O(1), so the same line is fine. This single difference causes more accidental timeouts in Java submissions than any other.',
    },
    {
      heading: 'Comparator direction, once and for all',
      body:
        'C++ sort takes a "less than" predicate: return true when x should come BEFORE y. So descending is x > y. C++ priority_queue is the confusing one — it is a MAX-heap by default, and passing greater<int> makes it a min-heap, which reads backwards. Java PriorityQueue is a MIN-heap by default and its comparator returns a negative number when x comes first. Say these out loud while writing; guessing costs a failed test.',
    },
  ],

  questionTypes: [
    {
      id: 'set-membership',
      name: 'Sets for membership and deduplication',
      signal:
        'The problem says "unique", "distinct", "appears in both", or you catch yourself writing a nested loop to check existence. A set turns that inner loop into O(1).',
      time: 'O(n + m)',
      space: 'O(n)',
      template: {
        cpp: `unordered_set<int> seen(a.begin(), a.end());
vector<int> out;
for (int x : b) if (seen.erase(x)) out.push_back(x);   // erase returns 1 if present`,
        java: `Set<Integer> seen = new HashSet<>();
for (int x : a) seen.add(x);
List<Integer> out = new ArrayList<>();
for (int x : b) if (seen.remove(x)) out.add(x);`,
      },
      taught: {
        lc: 349,
        title: 'Intersection of Two Arrays',
        slug: 'intersection-of-two-arrays',
        difficulty: 'easy',
        role: 'taught',
        estMinutes: 12,
        insight: 'Put the smaller array in a set, then stream the larger one past it. Erasing on a hit gives deduplication for free.',
        whyThisOne:
          'The smallest problem where the set-versus-sort trade-off is a genuine decision you should state rather than assume.',
        walkthrough: {
          howToSeeIt: [
            'Brute force is a nested loop: O(n·m). The inner loop only asks "is x in the other array?", which is exactly what a hash set answers in O(1).',
            'Build the set from one array, walk the other, collect hits. O(n + m) time, O(min(n, m)) space if you build from the smaller one — mention that choice, it is free credit.',
            'The result must contain distinct values. Rather than deduplicating at the end, erase each matched element from the set: a second occurrence then finds nothing and is skipped automatically.',
            'State the alternative: sort both and walk with two pointers for O(n log n + m log m) time and O(1) extra space. If the arrays were already sorted, that becomes the better answer.',
          ],
          wherePeopleLoseIt:
            'Forgetting that the output must be distinct, and returning duplicates when the second array repeats a value. The erase-on-hit trick handles it in one line; bolting on a dedup pass afterwards is noise.',
          time: 'O(n + m).',
          space: 'O(min(n, m)).',
          code: {
            cpp: `vector<int> intersection(vector<int>& nums1, vector<int>& nums2) {
  unordered_set<int> seen(nums1.begin(), nums1.end());
  vector<int> out;
  for (int x : nums2) {
    if (seen.erase(x)) out.push_back(x);   // erase => matched once, never again
  }
  return out;
}`,
            java: `public int[] intersection(int[] nums1, int[] nums2) {
  Set<Integer> seen = new HashSet<>();
  for (int x : nums1) seen.add(x);

  List<Integer> out = new ArrayList<>();
  for (int x : nums2) if (seen.remove(x)) out.add(x);

  int[] res = new int[out.size()];
  for (int i = 0; i < res.length; i++) res[i] = out.get(i);
  return res;
}`,
          },
          followUp: 'What if both arrays are enormous and stored on disk? Sort externally and merge — the streaming answer, not the hash answer.',
        },
      },
      practice: [
        {
          lc: 350,
          title: 'Intersection of Two Arrays II',
          slug: 'intersection-of-two-arrays-ii',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 15,
          insight: 'Multiplicity now matters, so the set becomes a frequency map and you decrement instead of erasing.',
        },
        {
          lc: 1207,
          title: 'Unique Number of Occurrences',
          slug: 'unique-number-of-occurrences',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 12,
          insight: 'Flipped: count first, then put the COUNTS into a set and compare sizes. Two containers, one line apart.',
        },
      ],
    },

    {
      id: 'custom-comparator',
      name: 'Sorting with a custom comparator',
      signal:
        'The order you need is not the natural one — sort by a computed key, by frequency, by a pairwise rule. Getting the comparator direction right on the first try is the skill.',
      time: 'O(n log n)',
      space: 'O(n) for the sort',
      template: {
        cpp: `sort(v.begin(), v.end(), [](const string& a, const string& b) {
  return a + b > b + a;         // "x before y" is true => descending by concatenation
});`,
        java: `list.sort((a, b) -> (b + a).compareTo(a + b));   // negative => a comes first`,
      },
      taught: {
        lc: 179,
        title: 'Largest Number',
        slug: 'largest-number',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'Order two strings by which concatenation is larger: a before b when a+b > b+a. That pairwise rule is transitive, so sort is valid.',
        companies: ['amazon', 'google'],
        whyThisOne:
          'It proves comparators are about defining an ORDER, not extracting a key — and it is the classic case where the obvious key (numeric value, or string length) is simply wrong.',
        walkthrough: {
          howToSeeIt: [
            'Try the obvious keys and watch them fail. Sorting numerically gives 3, 30 → "303" when "330" is larger. Sorting lexicographically fails too, because "9" must precede "30" despite "3" < "9" being irrelevant here.',
            'Shift the question from "what key?" to "given two items, which should come first?". Between a and b, the better arrangement is whichever concatenation is larger: a+b versus b+a.',
            'That rule is a valid strict weak ordering (it is transitive — worth asserting, since an inconsistent comparator is undefined behaviour in C++ and throws in Java), so sort can use it directly.',
            'Handle the all-zeros case at the end: input like [0, 0] produces "00", and the expected output is "0". Check whether the first character is 0 and return "0" if so.',
          ],
          wherePeopleLoseIt:
            'Writing the comparator backwards and shipping the reversed answer, or forgetting the leading-zero case, which is the single hidden test that fails otherwise. In Java, note the comparator is (b+a).compareTo(a+b) — reversed relative to the C++ predicate, because one returns "a is less" and the other returns an ordering int.',
          time: 'O(n log n · k) where k is the average string length.',
          space: 'O(n).',
          code: {
            cpp: `string largestNumber(vector<int>& nums) {
  vector<string> v;
  for (int x : nums) v.push_back(to_string(x));

  sort(v.begin(), v.end(), [](const string& a, const string& b) {
    return a + b > b + a;           // a first when a+b is the bigger arrangement
  });

  if (v[0] == "0") return "0";      // all zeros

  string out;
  for (const string& s : v) out += s;
  return out;
}`,
            java: `public String largestNumber(int[] nums) {
  String[] v = new String[nums.length];
  for (int i = 0; i < nums.length; i++) v[i] = String.valueOf(nums[i]);

  Arrays.sort(v, (a, b) -> (b + a).compareTo(a + b));

  if (v[0].equals("0")) return "0";

  StringBuilder sb = new StringBuilder();
  for (String s : v) sb.append(s);
  return sb.toString();
}`,
          },
        },
      },
      practice: [
        {
          lc: 1636,
          title: 'Sort Array by Increasing Frequency',
          slug: 'sort-array-by-increasing-frequency',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 20,
          insight: 'Two-level comparator: frequency ascending, then value descending as a tie-break. Practise chaining the two cleanly.',
        },
        {
          lc: 937,
          title: 'Reorder Data in Log Files',
          slug: 'reorder-data-in-log-files',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight:
            'Flipped: a stable sort is the requirement, because digit logs must keep their original order. Knowing your language default (Java Arrays.sort on objects is stable; C++ sort is NOT, use stable_sort) is the whole point.',
          companies: ['amazon'],
        },
      ],
    },

    {
      id: 'heap-basics',
      name: 'Heaps for top-K and streaming',
      signal:
        '"K largest", "K most frequent", "median of a stream". You need the extreme element repeatedly but not a full ordering — a heap gives that for O(log n) per operation instead of re-sorting.',
      time: 'O(n log k)',
      space: 'O(k)',
      template: {
        cpp: `priority_queue<int, vector<int>, greater<int>> minHeap;   // min-heap: keeps the LARGEST k
for (int x : a) {
  minHeap.push(x);
  if ((int)minHeap.size() > k) minHeap.pop();   // evict the smallest
}
return minHeap.top();   // the k-th largest`,
        java: `PriorityQueue<Integer> minHeap = new PriorityQueue<>();
for (int x : a) {
  minHeap.add(x);
  if (minHeap.size() > k) minHeap.poll();
}
return minHeap.peek();`,
      },
      taught: {
        lc: 215,
        title: 'Kth Largest Element in an Array',
        slug: 'kth-largest-element-in-an-array',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'To keep the k LARGEST, use a MIN-heap of size k — the smallest of your keepers sits on top, ready to be evicted. The inversion is the whole trick.',
        companies: ['google', 'meta', 'amazon'],
        whyThisOne:
          'The min-heap-for-max-k inversion trips up almost everyone the first time, and the quickselect follow-up is asked constantly.',
        walkthrough: {
          howToSeeIt: [
            'Sorting gives O(n log n) and is a perfectly acceptable opening answer — say it, then improve it. The improvement matters when k is much smaller than n, or the data is a stream you cannot sort.',
            'You only ever care about the top k. So hold exactly k elements and throw away anything that cannot belong. To throw away the worst of your keepers cheaply, the worst must be instantly reachable — so the heap must be a MIN-heap.',
            'Push each element, and whenever the size exceeds k, pop the minimum. What survives is the k largest, and its top is the k-th largest. O(n log k) time, O(k) space.',
            'Have quickselect ready for the follow-up: partition around a pivot and recurse into one side only, giving O(n) average, O(n^2) worst case, O(1) space. Name the worst case and the random-pivot mitigation.',
          ],
          wherePeopleLoseIt:
            'Reaching for a max-heap because the question says "largest". A max-heap of size k lets you see the biggest, which is exactly the element you never want to evict. The second trap is C++ syntax: priority_queue is a max-heap by default, and greater<int> is what makes it a min-heap — it reads backwards.',
          time: 'O(n log k) with the heap; O(n) average with quickselect.',
          space: 'O(k).',
          code: {
            cpp: `int findKthLargest(vector<int>& nums, int k) {
  priority_queue<int, vector<int>, greater<int>> minHeap;   // greater => MIN-heap
  for (int x : nums) {
    minHeap.push(x);
    if ((int)minHeap.size() > k) minHeap.pop();             // drop the smallest keeper
  }
  return minHeap.top();
}`,
            java: `public int findKthLargest(int[] nums, int k) {
  PriorityQueue<Integer> minHeap = new PriorityQueue<>();   // min-heap by default
  for (int x : nums) {
    minHeap.add(x);
    if (minHeap.size() > k) minHeap.poll();
  }
  return minHeap.peek();
}`,
          },
          followUp: 'Do it in O(n) average — quickselect. And: what if the input is an infinite stream? Then the heap is the only option, which is why LC 703 exists.',
        },
      },
      practice: [
        {
          lc: 347,
          title: 'Top K Frequent Elements',
          slug: 'top-k-frequent-elements',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'Count first, then heap over the counts. The O(n) follow-up is bucket sort by frequency, since a frequency cannot exceed n.',
          companies: ['amazon', 'google'],
        },
        {
          lc: 703,
          title: 'Kth Largest Element in a Stream',
          slug: 'kth-largest-element-in-a-stream',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 20,
          insight: 'Flipped into a design problem: the same size-k min-heap, but it persists between calls. Makes clear why sorting was never an option here.',
        },
      ],
    },

    {
      id: 'string-building',
      name: 'Building and parsing strings',
      signal:
        'You are constructing output character by character, or splitting input on delimiters. Get the O(n^2) accidental quadratic out of the way first, then parse with an index rather than a library split.',
      time: 'O(n)',
      space: 'O(n)',
      template: {
        cpp: `string out;
out.reserve(n);              // optional but free
for (char c : s) out += c;   // amortised O(1) in C++`,
        java: `StringBuilder sb = new StringBuilder();
for (char c : s.toCharArray()) sb.append(c);   // never s += c in a loop
return sb.toString();`,
      },
      taught: {
        lc: 151,
        title: 'Reverse Words in a String',
        slug: 'reverse-words-in-a-string',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 25,
        insight:
          'Walk from the end with two indices to carve out each word, appending as you go. One pass, no split, no reverse of a word list.',
        whyThisOne:
          'Messy whitespace rules make it a real parsing exercise, and the in-place O(1) follow-up is a genuine interview favourite.',
        walkthrough: {
          howToSeeIt: [
            'The easy version is split on whitespace, reverse the list, join. Say it — it is correct and clear — then note it allocates a whole word list.',
            'To avoid that, scan from the right. Skip spaces until you hit a word end, remember that index, keep walking left while the characters are non-space; the word is the slice between.',
            'Append each word followed by a single space, which normalises all the messy internal whitespace for free. Trim the one trailing space at the end.',
            'For the in-place follow-up (C++, where strings are mutable): reverse the entire string, then reverse each word individually. That is the classic O(1) extra space answer.',
          ],
          wherePeopleLoseIt:
            'The whitespace edge cases — leading spaces, trailing spaces, and multiple spaces between words. They are the entire difficulty of this problem and they are all handled by "skip spaces, then take a word" rather than by post-processing. In Java, using s += word here is the accidental O(n^2).',
          time: 'O(n).',
          space: 'O(n) for the output.',
          code: {
            cpp: `string reverseWords(string s) {
  string out;
  int i = (int)s.size() - 1;

  while (i >= 0) {
    while (i >= 0 && s[i] == ' ') --i;           // skip spaces
    if (i < 0) break;

    int end = i;
    while (i >= 0 && s[i] != ' ') --i;           // walk to the word start

    if (!out.empty()) out += ' ';
    out += s.substr(i + 1, end - i);
  }
  return out;
}`,
            java: `public String reverseWords(String s) {
  StringBuilder out = new StringBuilder();
  int i = s.length() - 1;

  while (i >= 0) {
    while (i >= 0 && s.charAt(i) == ' ') i--;
    if (i < 0) break;

    int end = i;
    while (i >= 0 && s.charAt(i) != ' ') i--;

    if (out.length() > 0) out.append(' ');
    out.append(s, i + 1, end + 1);
  }
  return out.toString();
}`,
          },
          followUp: 'Do it in O(1) extra space — reverse the whole string, then reverse each word in place.',
        },
      },
      practice: [
        {
          lc: 443,
          title: 'String Compression',
          slug: 'string-compression',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'In-place write pointer plus the awkward detail that a run length of 12 writes TWO characters, not one.',
          companies: ['google'],
        },
        {
          lc: 58,
          title: 'Length of Last Word',
          slug: 'length-of-last-word',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 8,
          insight: 'Flipped to the minimum: scan from the right, skip trailing spaces, count. A two-minute check that you own the idiom.',
        },
      ],
    },
  ],
};
