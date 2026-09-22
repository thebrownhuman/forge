import type { Topic } from '../../schema';

export const hashing: Topic = {
  id: 'hashing',
  name: 'Hashing, Maps & Sets',
  phase: 1,
  estHours: 8,
  prerequisites: ['stl'],

  whyItMatters:
    'Hashing is the universal loop-remover: any inner loop that asks "have I seen this before?" collapses into an O(1) lookup. It is the single most reusable trade in interviews — spend O(n) memory, buy O(n) time. Knowing when NOT to reach for it (sorted input, O(1) space required, need for ordering) is just as valuable.',

  fundamentals: [
    {
      heading: 'What a hash map actually costs',
      body:
        'O(1) is an AVERAGE, not a guarantee. Collisions degrade lookups, and adversarial keys can drive them to O(n) — real systems have been attacked this way. In interviews, say "O(1) average" rather than "O(1)"; the distinction is noticed. Also remember hashing is not free: a hash map has significant constant-factor overhead, so for small fixed alphabets a 26-slot array genuinely beats it.',
      costs: [
        { op: 'insert / lookup / erase', cost: 'O(1) average', note: 'O(n) worst case with collisions' },
        { op: 'iteration order', cost: 'unspecified', note: 'never rely on it — it changes between runs' },
        { op: 'memory per entry', cost: 'high', note: 'pointers plus bucket overhead; an array is far leaner' },
        { op: 'ordered map alternative', cost: 'O(log n)', note: 'buys sorted iteration and floor/ceiling queries' },
      ],
    },
    {
      heading: 'Three shapes: set, counter, index map',
      body:
        'A SET answers membership: have I seen this? A COUNTER answers multiplicity: how many times? An INDEX MAP answers position: where did I last see it? Most problems are a one-line change between these three, and picking the wrong one is why a solution nearly works. Ask what the problem needs to recall about a previous element, then choose.',
      code: {
        cpp: `unordered_set<int> seen;                 // membership
unordered_map<int,int> freq;             // multiplicity:  ++freq[x]
unordered_map<int,int> lastIndex;        // position:      lastIndex[x] = i`,
        java: `Set<Integer> seen = new HashSet<>();
Map<Integer,Integer> freq = new HashMap<>();      // freq.merge(x, 1, Integer::sum)
Map<Integer,Integer> lastIndex = new HashMap<>(); // lastIndex.put(x, i)`,
      },
    },
    {
      heading: 'Designing a canonical key',
      body:
        'Grouping problems reduce to choosing a key such that two items belong together exactly when their keys are equal. Sorted letters group anagrams. A 26-count signature does the same in O(n) instead of O(n log n). Normalised character-to-character mappings group isomorphic strings. Picking the key IS the problem; once it is right, the code is three lines.',
    },
    {
      heading: 'Hashing custom types',
      body:
        'C++ unordered_map will not accept a pair or a vector as a key without a custom hash — easiest is to encode into a single value (r * cols + c for grid cells) or use std::map instead. Java handles it if you use a record or a class with equals and hashCode, but a mutable key whose hash changes after insertion corrupts the map silently. Encode to a primitive when you can.',
    },
  ],

  questionTypes: [
    {
      id: 'complement-lookup',
      name: 'Complement lookup',
      signal:
        'Find a pair (or group) summing to a target in UNSORTED data, especially when original indices are required. Store what you have seen; for each new element look up exactly what would complete it.',
      time: 'O(n)',
      space: 'O(n)',
      template: {
        cpp: `unordered_map<int,int> seen;              // value -> index
for (int i = 0; i < n; ++i) {
  auto it = seen.find(target - a[i]);
  if (it != seen.end()) return {it->second, i};
  seen[a[i]] = i;                          // insert AFTER looking up
}`,
        java: `Map<Integer,Integer> seen = new HashMap<>();
for (int i = 0; i < n; i++) {
  Integer j = seen.get(target - a[i]);
  if (j != null) return new int[]{j, i};
  seen.put(a[i], i);
}`,
      },
      taught: {
        lc: 1,
        title: 'Two Sum',
        slug: 'two-sum',
        difficulty: 'easy',
        role: 'taught',
        estMinutes: 15,
        insight:
          'For each element, the partner you need is fully determined: target - a[i]. So look for that exact value rather than scanning for any match.',
        companies: ['google', 'amazon', 'meta', 'microsoft'],
        whyThisOne:
          'The origin of the whole pattern, and the cleanest place to state why hashing beats sorting here — sorting destroys the indices the problem asks for.',
        walkthrough: {
          howToSeeIt: [
            'Brute force is two nested loops, O(n^2). Look at what the inner loop does: for a fixed a[i], it searches for one specific value, target - a[i]. Searching for a KNOWN value is a lookup, not a scan.',
            'So remember everything already visited in a map from value to index. For each new element, check whether its complement is in the map.',
            'Look up BEFORE inserting the current element. Insert first and an element whose value is exactly half the target will pair with itself, which the problem forbids.',
            'Say why not sorting: two pointers would be O(n log n) and O(1) space, but sorting scrambles the indices the answer requires. That comparison is the reason this is a hashing problem and LC 167 is not.',
          ],
          wherePeopleLoseIt:
            'Inserting before querying, which produces the self-pairing bug — and it only shows up when a value equals exactly half the target, so the examples pass. The other one is storing index-to-value instead of value-to-index, which makes the lookup useless.',
          time: 'O(n) average.',
          space: 'O(n).',
          code: {
            cpp: `vector<int> twoSum(vector<int>& nums, int target) {
  unordered_map<int,int> seen;                  // value -> index

  for (int i = 0; i < (int)nums.size(); ++i) {
    auto it = seen.find(target - nums[i]);
    if (it != seen.end()) return {it->second, i};   // QUERY first

    seen[nums[i]] = i;                             // then record
  }
  return {};
}`,
            java: `public int[] twoSum(int[] nums, int target) {
  Map<Integer,Integer> seen = new HashMap<>();

  for (int i = 0; i < nums.length; i++) {
    Integer j = seen.get(target - nums[i]);
    if (j != null) return new int[]{j, i};

    seen.put(nums[i], i);
  }
  return new int[0];
}`,
          },
          followUp: 'What if the array is sorted and you may not use extra space? Then it is two pointers — know both and know which question each answers.',
        },
      },
      practice: [
        {
          lc: 454,
          title: '4Sum II',
          slug: '4sum-ii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'Meet in the middle: hash all sums of the first two arrays, then look up complements from the last two. O(n^2) instead of O(n^4).',
        },
        {
          lc: 2006,
          title: 'Count Number of Pairs With Absolute Difference K',
          slug: 'count-number-of-pairs-with-absolute-difference-k',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 15,
          insight: 'Flipped to differences and counting: each element has TWO complements, x + k and x - k, and you accumulate counts rather than returning early.',
        },
      ],
    },

    {
      id: 'group-by-key',
      name: 'Grouping by a canonical key',
      signal:
        '"Group the anagrams", "which of these are equivalent", "bucket these together". Design a key that is identical exactly for items that belong in the same group, then use a map from key to list.',
      time: 'O(n · k)',
      space: 'O(n · k)',
      template: {
        cpp: `unordered_map<string, vector<string>> groups;
for (const string& s : words) groups[canonical(s)].push_back(s);

vector<vector<string>> out;
for (auto& [key, list] : groups) out.push_back(move(list));`,
        java: `Map<String, List<String>> groups = new HashMap<>();
for (String s : words) groups.computeIfAbsent(canonical(s), k -> new ArrayList<>()).add(s);
return new ArrayList<>(groups.values());`,
      },
      taught: {
        lc: 49,
        title: 'Group Anagrams',
        slug: 'group-anagrams',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 25,
        insight:
          'Anagrams share a letter multiset, so a 26-count signature is a canonical key — and it is O(k) to build versus O(k log k) for sorting.',
        companies: ['amazon', 'google', 'meta'],
        whyThisOne:
          'It makes key design explicit and offers a real choice between two correct keys, which is exactly the kind of trade interviewers want discussed.',
        walkthrough: {
          howToSeeIt: [
            'Comparing every pair of words is O(n^2 · k). Grouping never needs pairwise comparison — it needs a key that collides precisely for group members.',
            'Anagrams have identical letter counts. The obvious key is the sorted string, which is correct and costs O(k log k) per word.',
            'A better key: the 26 counts themselves, serialised into a string such as "1#0#2#...". That is O(k) per word, so the total drops to O(n · k). State both and pick.',
            'Then it is one pass: compute the key, append the word to that bucket, and finally collect the bucket values. Order within groups follows input order, which the problem permits.',
          ],
          wherePeopleLoseIt:
            'Building the count key by concatenating digits without a separator — counts of 1 and 12 then collide with 11 and 2, a bug that only appears on long words. Use a delimiter. In C++, remember an array cannot be a map key directly; convert to a string.',
          time: 'O(n · k) with the count key.',
          space: 'O(n · k).',
          code: {
            cpp: `vector<vector<string>> groupAnagrams(vector<string>& strs) {
  unordered_map<string, vector<string>> groups;

  for (const string& s : strs) {
    array<int,26> count{};
    for (char c : s) ++count[c - 'a'];

    string key;
    for (int c : count) { key += to_string(c); key += '#'; }   // delimiter matters

    groups[key].push_back(s);
  }

  vector<vector<string>> out;
  out.reserve(groups.size());
  for (auto& [key, list] : groups) out.push_back(move(list));
  return out;
}`,
            java: `public List<List<String>> groupAnagrams(String[] strs) {
  Map<String, List<String>> groups = new HashMap<>();

  for (String s : strs) {
    int[] count = new int[26];
    for (char c : s.toCharArray()) count[c - 'a']++;

    StringBuilder key = new StringBuilder();
    for (int c : count) key.append(c).append('#');

    groups.computeIfAbsent(key.toString(), k -> new ArrayList<>()).add(s);
  }
  return new ArrayList<>(groups.values());
}`,
          },
          followUp: 'Group words that are isomorphic instead — the key becomes a normalised pattern such as "abb" for both "egg" and "add".',
        },
      },
      practice: [
        {
          lc: 890,
          title: 'Find and Replace Pattern',
          slug: 'find-and-replace-pattern',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'The key is a normalised pattern, and the mapping must be a bijection — check both directions or "abb" wrongly matches "aaa".',
        },
        {
          lc: 1657,
          title: 'Determine if Two Strings Are Close',
          slug: 'determine-if-two-strings-are-close',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped: the key is the SORTED MULTISET OF COUNTS plus the set of letters used. Two conditions, and reasoning out why both are needed is the exercise.',
        },
      ],
    },

    {
      id: 'set-membership-sequence',
      name: 'Sets for O(1) membership and sequence building',
      signal:
        '"Longest consecutive run", "does this cycle", "which number is missing". Load everything into a set, then ask questions that would otherwise need sorting.',
      time: 'O(n)',
      space: 'O(n)',
      template: {
        cpp: `unordered_set<int> s(a.begin(), a.end());
for (int x : s) {
  if (s.count(x - 1)) continue;         // not a run start: skip
  int len = 1;
  while (s.count(x + len)) ++len;       // walk the run once
  best = max(best, len);
}`,
        java: `Set<Integer> s = new HashSet<>();
for (int x : a) s.add(x);
for (int x : s) {
  if (s.contains(x - 1)) continue;
  int len = 1;
  while (s.contains(x + len)) len++;
  best = Math.max(best, len);
}`,
      },
      taught: {
        lc: 128,
        title: 'Longest Consecutive Sequence',
        slug: 'longest-consecutive-sequence',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 35,
        insight:
          'Only start counting at a run START — a value x with no x-1 present. That single guard is what makes the nested while loop O(n) overall rather than O(n^2).',
        companies: ['google', 'amazon'],
        whyThisOne:
          'A loop inside a loop that is genuinely linear, justified by an amortised argument. Being able to explain why is exactly what separates a real answer from a memorised one.',
        walkthrough: {
          howToSeeIt: [
            'Sorting gives O(n log n) and is a fine opening answer. The problem explicitly demands O(n), which rules sorting out and points at hashing.',
            'Put everything in a set so membership is O(1). Now a run starting at x can be measured by checking x+1, x+2, ... directly.',
            'Done naively that is O(n^2): for [1,2,3,...,n] you would walk the full run from every element. The fix is to only begin a walk at a run START — a value x where x-1 is absent.',
            'With that guard, each run is traversed exactly once across the entire algorithm, so the total work is O(n) even though a while sits inside a for. Say the amortised argument out loud; it is the point of the problem.',
          ],
          wherePeopleLoseIt:
            'Omitting the run-start guard and then claiming O(n). It passes the tests but the complexity claim is wrong, and a good interviewer will push on it. A smaller one: iterate over the SET, not the array, or duplicates cause repeated work.',
          time: 'O(n) — each value is visited at most twice.',
          space: 'O(n).',
          code: {
            cpp: `int longestConsecutive(vector<int>& nums) {
  unordered_set<int> s(nums.begin(), nums.end());
  int best = 0;

  for (int x : s) {
    if (s.count(x - 1)) continue;        // only start at a run START

    int len = 1;
    while (s.count(x + len)) ++len;      // each run walked exactly once
    best = max(best, len);
  }
  return best;
}`,
            java: `public int longestConsecutive(int[] nums) {
  Set<Integer> s = new HashSet<>();
  for (int x : nums) s.add(x);

  int best = 0;
  for (int x : s) {
    if (s.contains(x - 1)) continue;

    int len = 1;
    while (s.contains(x + len)) len++;
    best = Math.max(best, len);
  }
  return best;
}`,
          },
          followUp: 'Return the run itself, and handle a streaming input where the set grows over time — which points toward union-find.',
        },
      },
      practice: [
        {
          lc: 202,
          title: 'Happy Number',
          slug: 'happy-number',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 20,
          insight: 'A set detects the cycle. Then do it in O(1) space with fast and slow pointers — the same Floyd machinery from linked lists.',
        },
        {
          lc: 268,
          title: 'Missing Number',
          slug: 'missing-number',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 15,
          insight:
            'Flipped: a set works, but the sum formula or an XOR gives O(1) space. Worth solving three ways — it is a compact lesson in when hashing is the lazy choice.',
        },
      ],
    },

    {
      id: 'hash-design',
      name: 'Design problems built on hashing',
      signal:
        'A class with several operations that must all be O(1) or O(log n) — "get the value at a timestamp", "insert, delete and get random". Compose a map with a second structure that covers what the map cannot do.',
      time: 'O(1) or O(log n) per operation',
      space: 'O(n)',
      googleHeavy: true,
      template: {
        cpp: `// map from key -> a container that supports the ordered query you need
unordered_map<string, vector<pair<int,string>>> store;   // key -> [(time, value)]
// writes append (timestamps arrive increasing), reads binary search`,
        java: `Map<String, List<int[]>> store = new HashMap<>();
// append on set; binary search on get`,
      },
      taught: {
        lc: 981,
        title: 'Time Based Key-Value Store',
        slug: 'time-based-key-value-store',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 35,
        insight:
          'A hash map gets you to the right key in O(1); binary search over that key\'s append-only, time-sorted list answers "at or before this timestamp" in O(log n).',
        companies: ['google', 'meta'],
        whyThisOne:
          'The clearest example of composing two structures because neither suffices alone, which is the entire skill behind design questions.',
        walkthrough: {
          howToSeeIt: [
            'Two different lookups are required: exact by key, and nearest-at-or-before by timestamp. A hash map does the first and cannot do the second, since it has no order at all.',
            'So map each key to its own ordered collection of (timestamp, value) pairs. The key lookup stays O(1); the timestamp question is answered inside that collection.',
            'Read the guarantee in the problem statement: timestamps for a given key are strictly increasing. That means simple appending keeps each list sorted for free — no insertion cost, no rebalancing.',
            'A sorted list plus "largest timestamp <= query" is exactly upper_bound minus one. O(log n) per get, O(1) per set.',
          ],
          wherePeopleLoseIt:
            'Searching for an exact timestamp match. The query asks for the most recent value at OR BEFORE the given time, so it is a boundary search, not an equality search — this is the binary-search boundary lesson reappearing inside a design question. Also remember to return the empty string when every stored timestamp is later than the query.',
          time: 'O(1) set, O(log n) get.',
          space: 'O(n).',
          code: {
            cpp: `class TimeMap {
  unordered_map<string, vector<pair<int,string>>> store;   // key -> sorted by time
public:
  void set(string key, string value, int timestamp) {
    store[key].push_back({timestamp, value});              // timestamps increase
  }

  string get(string key, int timestamp) {
    auto it = store.find(key);
    if (it == store.end()) return "";

    auto& v = it->second;
    // first entry with time > timestamp, then step back one
    int lo = 0, hi = (int)v.size();
    while (lo < hi) {
      int mid = lo + (hi - lo) / 2;
      if (v[mid].first > timestamp) hi = mid;
      else                          lo = mid + 1;
    }
    return lo == 0 ? "" : v[lo - 1].second;
  }
};`,
            java: `class TimeMap {
  private final Map<String, List<Object[]>> store = new HashMap<>();

  public void set(String key, String value, int timestamp) {
    store.computeIfAbsent(key, k -> new ArrayList<>()).add(new Object[]{timestamp, value});
  }

  public String get(String key, int timestamp) {
    List<Object[]> v = store.get(key);
    if (v == null) return "";

    int lo = 0, hi = v.size();
    while (lo < hi) {
      int mid = lo + (hi - lo) / 2;
      if ((int) v.get(mid)[0] > timestamp) hi = mid;
      else                                 lo = mid + 1;
    }
    return lo == 0 ? "" : (String) v.get(lo - 1)[1];
  }
}`,
          },
          followUp: 'What if timestamps could arrive out of order? Then appending no longer keeps the list sorted, and you need a TreeMap per key with floorEntry.',
        },
      },
      practice: [
        {
          lc: 380,
          title: 'Insert Delete GetRandom O(1)',
          slug: 'insert-delete-getrandom-o1',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'Map plus array: to delete in O(1), swap the doomed element with the last one and pop. The swap-with-last trick is worth owning.',
          companies: ['google', 'amazon'],
        },
        {
          lc: 705,
          title: 'Design HashSet',
          slug: 'design-hashset',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped: build the structure instead of using it. Buckets plus chaining makes the O(1)-average claim concrete, and explains where the worst case comes from.',
        },
      ],
    },
  ],
};
