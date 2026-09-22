import type { Topic } from '../../schema';

export const design: Topic = {
  id: 'design',
  name: 'Design Problems',
  phase: 4,
  estHours: 8,
  prerequisites: ['linked-lists', 'hashing', 'heaps'],

  whyItMatters:
    'Design problems are where DSA meets system design, and they are increasingly the second round at large companies. They are not about knowing a new algorithm — they are about COMPOSING two structures so each covers the other\'s weakness, and about stating complexity per operation rather than for the whole program. They also reward clean interfaces, which is the one place interviewers judge your code taste directly.',

  fundamentals: [
    {
      heading: 'Start from the operations table',
      body:
        'Before writing anything, list every required operation and the target complexity for each. That table immediately tells you which structures are candidates and which are disqualified. "getRandom in O(1)" rules out linked lists and demands an array. "move to most-recent in O(1)" rules out arrays and demands a linked list. Needing both is why LRU uses a hash map plus a doubly linked list — the requirements dictate the design.',
      costs: [
        { op: 'hash map', cost: 'O(1) lookup', note: 'no order, no ranking, no random access' },
        { op: 'array', cost: 'O(1) index and random pick', note: 'O(n) delete from the middle' },
        { op: 'doubly linked list', cost: 'O(1) unlink given the node', note: 'O(n) to find anything' },
        { op: 'heap', cost: 'O(log n) extreme', note: 'cannot remove an arbitrary element' },
        { op: 'ordered map / TreeMap', cost: 'O(log n)', note: 'floor, ceiling and sorted iteration' },
      ],
    },
    {
      heading: 'Every structure covers another\'s weakness',
      body:
        'This is the entire skill. Hash map plus doubly linked list gives O(1) lookup AND O(1) reordering — that is LRU. Hash map plus array gives O(1) lookup AND O(1) random selection, with the swap-with-last trick for deletion. Hash map plus heap gives priority ordering with fast lookup, usually needing lazy deletion. Name the weakness you are covering out loud; it makes the design sound deliberate rather than recalled.',
    },
    {
      heading: 'Lazy deletion, and when you need it',
      body:
        'Heaps cannot remove an arbitrary element, so when a design needs both priority order and removal, the standard answer is to leave stale entries in the heap and skip them on pop — checking a separate map or a version counter to tell whether an entry is still valid. It keeps every operation O(log n) amortised at the cost of extra memory. Say the trade explicitly; interviewers are listening for whether you noticed the memory growth.',
      code: {
        cpp: `// Lazy deletion: mark as removed, skip on pop.
unordered_map<int,int> pendingRemovals;

int top() {
  while (!pq.empty() && pendingRemovals[pq.top()] > 0) {
    --pendingRemovals[pq.top()];
    pq.pop();
  }
  return pq.top();
}`,
        java: `Map<Integer,Integer> pending = new HashMap<>();

int top() {
  while (!pq.isEmpty() && pending.getOrDefault(pq.peek(), 0) > 0) {
    pending.merge(pq.peek(), -1, Integer::sum);
    pq.poll();
  }
  return pq.peek();
}`,
      },
    },
    {
      heading: 'State the amortised versus worst case honestly',
      body:
        'Many designs are O(1) amortised but O(n) occasionally — a growing array resize, a queue-from-two-stacks pour, a lazy-deletion cleanup. Claiming flat O(1) invites a correction. Saying "O(1) amortised, with an occasional O(n) step, and here is why the total is still linear" is the answer that lands, and it is usually the reason the problem was chosen.',
    },
  ],

  questionTypes: [
    {
      id: 'composite-structures',
      name: 'Composing a map with a second structure',
      signal:
        'Two operations that pull in opposite directions — fast lookup plus fast ordering, or fast lookup plus fast random access. One structure cannot do both, so use two that point at each other.',
      time: 'O(1) or O(log n) per operation',
      space: 'O(n)',
      googleHeavy: true,
      template: {
        cpp: `// Map for lookup + a second structure for whatever the map cannot do.
unordered_map<int, list<int>::iterator> where;   // key -> its node in the list
list<int> order;                                  // ordering the map cannot express

void touch(int key) {
  order.erase(where[key]);          // O(1) given the iterator
  order.push_front(key);
  where[key] = order.begin();
}`,
        java: `Map<Integer, Node> where = new HashMap<>();
// plus an explicit doubly linked list with head/tail sentinels`,
      },
      taught: {
        lc: 355,
        title: 'Design Twitter',
        slug: 'design-twitter',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 50,
        insight:
          'Store each user\'s tweets as their own list, then merge the followed users\' lists with a heap at read time. Merging ten feeds on demand beats fanning every tweet out to every follower.',
        companies: ['amazon', 'google'],
        whyThisOne:
          'It is the clearest DSA problem that is genuinely a system-design question in miniature, and the fan-out-on-read versus fan-out-on-write trade is real production reasoning.',
        walkthrough: {
          howToSeeIt: [
            'Write the operations table first. postTweet should be O(1). getNewsFeed returns the 10 most recent tweets across the people you follow. follow and unfollow should be O(1).',
            'Two designs exist and you should name both. Fan-out on WRITE pushes each tweet into every follower\'s prebuilt feed — reads are instant, but a user with a million followers makes one post cost a million writes. Fan-out on READ keeps per-user tweet lists and merges at query time.',
            'Choose read-time merging here: posts are cheap, and the feed only needs 10 items, so you merge at most followees lists and stop early. That is exactly the k-way merge from the heaps topic.',
            'Structures: a map from user to their tweet list (each tweet carrying a global timestamp for ordering), and a map from user to their set of followees. Seed a heap with the head of each followed list, pop ten times, refilling from whichever list you consumed.',
          ],
          wherePeopleLoseIt:
            'Forgetting that a user must see their OWN tweets, which requires adding self to the merge whether or not they follow themselves. Second: using insertion order instead of a global counter for timestamps — without a monotonically increasing id, tweets from different users cannot be ordered against each other.',
          time: 'O(1) post, O(k log k) feed for k followees.',
          space: 'O(total tweets + follow edges).',
          code: {
            cpp: `class Twitter {
  int clock = 0;                                          // global ordering
  unordered_map<int, vector<pair<int,int>>> tweets;       // user -> [(time, tweetId)]
  unordered_map<int, unordered_set<int>> following;       // user -> followees

public:
  void postTweet(int userId, int tweetId) {
    tweets[userId].push_back({clock++, tweetId});         // O(1)
  }

  vector<int> getNewsFeed(int userId) {
    // Max-heap over the newest unconsumed tweet of each relevant user.
    priority_queue<tuple<int,int,int>> pq;                // (time, userId, index)

    auto seed = [&](int u) {
      auto it = tweets.find(u);
      if (it == tweets.end() || it->second.empty()) return;
      int last = (int)it->second.size() - 1;
      pq.push({it->second[last].first, u, last});
    };

    seed(userId);                                          // own tweets count
    for (int f : following[userId]) if (f != userId) seed(f);

    vector<int> out;
    while (!pq.empty() && (int)out.size() < 10) {
      auto [time, u, idx] = pq.top(); pq.pop();
      out.push_back(tweets[u][idx].second);

      if (idx > 0) pq.push({tweets[u][idx - 1].first, u, idx - 1});   // refill
    }
    return out;
  }

  void follow(int followerId, int followeeId)   { following[followerId].insert(followeeId); }
  void unfollow(int followerId, int followeeId) { following[followerId].erase(followeeId); }
};`,
            java: `class Twitter {
  private int clock = 0;
  private final Map<Integer, List<int[]>> tweets = new HashMap<>();      // user -> [time, id]
  private final Map<Integer, Set<Integer>> following = new HashMap<>();

  public void postTweet(int userId, int tweetId) {
    tweets.computeIfAbsent(userId, k -> new ArrayList<>()).add(new int[]{clock++, tweetId});
  }

  public List<Integer> getNewsFeed(int userId) {
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> b[0] - a[0]);  // [time, user, idx]

    Set<Integer> sources = new HashSet<>(following.getOrDefault(userId, Set.of()));
    sources.add(userId);

    for (int u : sources) {
      List<int[]> list = tweets.get(u);
      if (list == null || list.isEmpty()) continue;
      int last = list.size() - 1;
      pq.add(new int[]{list.get(last)[0], u, last});
    }

    List<Integer> out = new ArrayList<>();
    while (!pq.isEmpty() && out.size() < 10) {
      int[] cur = pq.poll();
      out.add(tweets.get(cur[1]).get(cur[2])[1]);

      if (cur[2] > 0) {
        int[] prev = tweets.get(cur[1]).get(cur[2] - 1);
        pq.add(new int[]{prev[0], cur[1], cur[2] - 1});
      }
    }
    return out;
  }

  public void follow(int followerId, int followeeId) {
    following.computeIfAbsent(followerId, k -> new HashSet<>()).add(followeeId);
  }

  public void unfollow(int followerId, int followeeId) {
    Set<Integer> s = following.get(followerId);
    if (s != null) s.remove(followeeId);
  }
}`,
          },
          followUp: 'At real scale you would use a hybrid: fan-out on write for ordinary users, fan-out on read for celebrities. Naming that split is the system-design answer.',
        },
      },
      practice: [
        {
          lc: 895,
          title: 'Maximum Frequency Stack',
          slug: 'maximum-frequency-stack',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 45,
          insight:
            'A map from frequency to a stack of values at that frequency, plus a running maximum frequency. Pushing a value onto EVERY frequency stack up to its count is the elegant part.',
          companies: ['amazon', 'google'],
        },
        {
          lc: 432,
          title: 'All O`one Data Structure',
          slug: 'all-oone-data-structure',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 60,
          insight:
            'Flipped: O(1) for min AND max, which rules out heaps entirely. A doubly linked list of count buckets, each holding a set of keys, with a map from key to its bucket.',
        },
      ],
    },

    {
      id: 'iterator-design',
      name: 'Iterators and lazy evaluation',
      signal:
        '"Design an iterator", "flatten this nested structure", "peek at the next element", "decompress on demand". Produce values one at a time without materialising everything.',
      time: 'O(1) amortised per next()',
      space: 'O(depth)',
      template: {
        cpp: `// Hold the work still to do on a stack; do it only when next() is called.
stack<NestedInteger> st;

bool hasNext() {
  while (!st.empty()) {
    if (st.top().isInteger()) return true;

    auto list = st.top().getList(); st.pop();
    for (int i = (int)list.size() - 1; i >= 0; --i) st.push(list[i]);   // reverse: keep order
  }
  return false;
}`,
        java: `Deque<NestedInteger> st = new ArrayDeque<>();

public boolean hasNext() {
  while (!st.isEmpty()) {
    if (st.peek().isInteger()) return true;

    List<NestedInteger> list = st.pop().getList();
    for (int i = list.size() - 1; i >= 0; i--) st.push(list.get(i));
  }
  return false;
}`,
      },
      taught: {
        lc: 341,
        title: 'Flatten Nested List Iterator',
        slug: 'flatten-nested-list-iterator',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          'Do the flattening inside hasNext(), lazily. Push list contents in REVERSE so that popping yields the original order, and the stack only ever holds the unexplored remainder.',
        companies: ['google', 'meta'],
        whyThisOne:
          'It teaches lazy evaluation — the difference between precomputing everything and computing on demand — which is the point of an iterator and a real memory consideration.',
        walkthrough: {
          howToSeeIt: [
            'The easy version flattens everything into a list in the constructor and then iterates it. Correct, and O(total elements) memory even if the caller only reads the first item. State it, then offer the lazy version.',
            'Lazy means the constructor only stores the top-level list, and the work happens when asked. Use a stack holding the items not yet examined.',
            'Push in REVERSE order, because a stack reverses what it receives — pushing forwards would emit the list backwards. This is the detail that catches people.',
            'Put the flattening inside hasNext(): pop and expand lists until an integer sits on top, then report true without consuming it. next() can then simply pop and return, and calling hasNext() repeatedly stays safe because it never removes an integer.',
          ],
          wherePeopleLoseIt:
            'Putting the expansion logic in next() instead of hasNext(). The contract allows hasNext() to be called several times before next(), and allows next() to be called after a true from hasNext() — putting the work in hasNext() satisfies both cleanly. The reverse-push order is the other reliable trip-up.',
          time: 'O(1) amortised per next().',
          space: 'O(depth × width) worst case for the stack.',
          code: {
            cpp: `class NestedIterator {
  stack<NestedInteger> st;

public:
  NestedIterator(vector<NestedInteger>& nestedList) {
    for (int i = (int)nestedList.size() - 1; i >= 0; --i)
      st.push(nestedList[i]);                       // REVERSE, so popping keeps order
  }

  bool hasNext() {
    while (!st.empty()) {
      if (st.top().isInteger()) return true;        // ready: do NOT consume it

      auto list = st.top().getList(); st.pop();     // expand one level, lazily
      for (int i = (int)list.size() - 1; i >= 0; --i) st.push(list[i]);
    }
    return false;
  }

  int next() {
    int value = st.top().getInteger();              // hasNext() guaranteed an integer on top
    st.pop();
    return value;
  }
};`,
            java: `public class NestedIterator implements Iterator<Integer> {
  private final Deque<NestedInteger> st = new ArrayDeque<>();

  public NestedIterator(List<NestedInteger> nestedList) {
    for (int i = nestedList.size() - 1; i >= 0; i--) st.push(nestedList.get(i));
  }

  @Override
  public boolean hasNext() {
    while (!st.isEmpty()) {
      if (st.peek().isInteger()) return true;

      List<NestedInteger> list = st.pop().getList();
      for (int i = list.size() - 1; i >= 0; i--) st.push(list.get(i));
    }
    return false;
  }

  @Override
  public Integer next() {
    return st.pop().getInteger();
  }
}`,
          },
          followUp: 'Add remove() to the iterator contract, or support an infinite nested structure — lazy evaluation is what makes the second possible at all.',
        },
      },
      practice: [
        {
          lc: 284,
          title: 'Peeking Iterator',
          slug: 'peeking-iterator',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'Cache one element ahead and remember whether the cache is filled. The whole problem is keeping that flag consistent across every entry point.',
        },
        {
          lc: 900,
          title: 'RLE Iterator',
          slug: 'rle-iterator',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'Flipped to skipping: consume n elements at once by decrementing run counts rather than stepping one at a time, which keeps large skips cheap.',
        },
      ],
    },

    {
      id: 'versioned-structures',
      name: 'Versioned and time-indexed structures',
      signal:
        '"Snapshot the array", "value at this timestamp", "the last k products". Store a HISTORY per key and binary search it, rather than copying the whole structure.',
      time: 'O(log n) per query',
      space: 'O(total writes)',
      template: {
        cpp: `// Per index, keep (version, value) pairs in increasing version order.
vector<vector<pair<int,int>>> history;

int get(int index, int snapId) {
  auto& h = history[index];
  // last entry with version <= snapId
  int lo = 0, hi = (int)h.size();
  while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (h[mid].first > snapId) hi = mid;
    else                        lo = mid + 1;
  }
  return lo == 0 ? 0 : h[lo - 1].second;
}`,
        java: `List<List<int[]>> history = new ArrayList<>();   // per index: [version, value]`,
      },
      taught: {
        lc: 1146,
        title: 'Snapshot Array',
        slug: 'snapshot-array',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          'Never copy the array on snapshot — that is O(n) per snap. Record a (version, value) pair per index only when it CHANGES, and binary search the history at read time.',
        companies: ['google'],
        whyThisOne:
          'It is the cleanest example of trading a copy for a history, which is the idea behind persistent data structures and multi-version concurrency control in real databases.',
        walkthrough: {
          howToSeeIt: [
            'The naive design copies the whole array on every snap: O(n) per snapshot and O(n × snapshots) memory. With 50,000 of each that is far too much — the constraints rule it out immediately.',
            'Observe that most indices do not change between snapshots. Storing an unchanged value repeatedly is the waste.',
            'So keep, for each index, only the versions at which it actually changed: a list of (snapId, value) pairs appended in increasing snapId order. snap() then just increments a counter — O(1), no copying at all.',
            'get(index, snapId) is a boundary search over that index\'s history for the last entry with version <= snapId. If none exists the value was never set, so return the default of 0.',
          ],
          wherePeopleLoseIt:
            'Searching for an exact version match. The query asks for the value AS OF a snapshot, so it is a floor query, not equality — the same binary-search boundary lesson as the time-based key-value store. Second: multiple sets between two snaps should overwrite the last entry rather than append a duplicate version.',
          time: 'O(1) set and snap, O(log writes) get.',
          space: 'O(total writes).',
          code: {
            cpp: `class SnapshotArray {
  int currentSnap = 0;
  vector<vector<pair<int,int>>> history;    // index -> [(snapId, value)]

public:
  SnapshotArray(int length) : history(length) {}

  void set(int index, int val) {
    auto& h = history[index];

    if (!h.empty() && h.back().first == currentSnap) h.back().second = val;   // same version
    else h.push_back({currentSnap, val});
  }

  int snap() { return currentSnap++; }      // O(1): no copying

  int get(int index, int snap_id) {
    auto& h = history[index];

    // First entry with version > snap_id, then step back one.
    int lo = 0, hi = (int)h.size();
    while (lo < hi) {
      int mid = lo + (hi - lo) / 2;
      if (h[mid].first > snap_id) hi = mid;
      else                        lo = mid + 1;
    }
    return lo == 0 ? 0 : h[lo - 1].second;  // never set before this snapshot
  }
};`,
            java: `class SnapshotArray {
  private int currentSnap = 0;
  private final List<List<int[]>> history;

  public SnapshotArray(int length) {
    history = new ArrayList<>(length);
    for (int i = 0; i < length; i++) history.add(new ArrayList<>());
  }

  public void set(int index, int val) {
    List<int[]> h = history.get(index);

    if (!h.isEmpty() && h.get(h.size() - 1)[0] == currentSnap) h.get(h.size() - 1)[1] = val;
    else h.add(new int[]{currentSnap, val});
  }

  public int snap() { return currentSnap++; }

  public int get(int index, int snap_id) {
    List<int[]> h = history.get(index);

    int lo = 0, hi = h.size();
    while (lo < hi) {
      int mid = lo + (hi - lo) / 2;
      if (h.get(mid)[0] > snap_id) hi = mid;
      else                          lo = mid + 1;
    }
    return lo == 0 ? 0 : h.get(lo - 1)[1];
  }
}`,
          },
          followUp: 'Support deleting old snapshots to reclaim memory — that needs reference counting per version, which is how real MVCC databases handle garbage collection.',
        },
      },
      practice: [
        {
          lc: 1352,
          title: 'Product of the Last K Numbers',
          slug: 'product-of-the-last-k-numbers',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Keep prefix PRODUCTS and divide. A zero breaks division entirely, so reset the history when one arrives — handling that case is the whole problem.',
        },
        {
          lc: 2034,
          title: 'Stock Price Fluctuation',
          slug: 'stock-price-fluctuation',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight:
            'Flipped: records can be CORRECTED after the fact, so you need min and max over current values. Two heaps with lazy deletion, or an ordered multiset.',
        },
      ],
    },

    {
      id: 'randomized-design',
      name: 'Randomised structures',
      signal:
        '"Pick with weight", "random node", "shuffle the array", "insert, delete and getRandom in O(1)". Prefix sums plus binary search, or an array plus the swap-with-last trick.',
      time: 'O(log n) or O(1) per pick',
      space: 'O(n)',
      googleHeavy: true,
      template: {
        cpp: `// Weighted pick: cumulative sums, then binary search a uniform draw.
vector<int> prefix;                       // prefix[i] = sum of weights up to i

int pickIndex() {
  int target = rand() % prefix.back();    // uniform in [0, total)
  return (int)(upper_bound(prefix.begin(), prefix.end(), target) - prefix.begin());
}`,
        java: `int[] prefix;
private final Random rnd = new Random();

public int pickIndex() {
  int target = rnd.nextInt(prefix[prefix.length - 1]);
  int lo = 0, hi = prefix.length;
  while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (prefix[mid] > target) hi = mid;
    else                      lo = mid + 1;
  }
  return lo;
}`,
      },
      taught: {
        lc: 528,
        title: 'Random Pick with Weight',
        slug: 'random-pick-with-weight',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 35,
        insight:
          'Lay the weights end to end as intervals on a line, draw a uniform point, and binary search which interval contains it. Interval length is exactly the probability.',
        companies: ['google', 'meta', 'amazon'],
        whyThisOne:
          'It joins prefix sums to binary search in a probabilistic setting, and the half-open interval reasoning is a place where being off by one silently skews the distribution.',
        walkthrough: {
          howToSeeIt: [
            'Reframe geometrically. Put the weights end to end along a line: index 0 occupies [0, w0), index 1 occupies [w0, w0+w1), and so on. A uniformly random point on that line lands in each interval with probability proportional to its length — exactly the required distribution.',
            'The interval boundaries are the prefix sums, computed once in the constructor.',
            'To pick: draw a uniform integer in [0, total) and find the first prefix sum strictly greater than it. That is an upper-bound search, and the index it returns is the answer.',
            'Complexity: O(n) to build, O(log n) per pick, O(n) memory. Say whether the weights can change — if they can, the prefix array must be rebuilt and a Fenwick tree becomes the better structure.',
          ],
          wherePeopleLoseIt:
            'Interval boundary errors. The draw must be in [0, total), not [1, total], and the search must be strictly-greater, not greater-or-equal. Get either wrong and zero-weight entries can be selected, or the last index becomes unreachable — a bug that only shows up statistically, which makes it nasty. Also use the language RNG properly rather than rand() % total, which is slightly biased.',
          time: 'O(n) build, O(log n) per pick.',
          space: 'O(n).',
          code: {
            cpp: `class Solution {
  vector<int> prefix;                       // cumulative weights
  mt19937 rng{random_device{}()};

public:
  Solution(vector<int>& w) {
    prefix.reserve(w.size());
    int running = 0;
    for (int x : w) { running += x; prefix.push_back(running); }
  }

  int pickIndex() {
    uniform_int_distribution<int> dist(0, prefix.back() - 1);   // [0, total)
    int target = dist(rng);

    // First prefix strictly greater than target.
    return (int)(upper_bound(prefix.begin(), prefix.end(), target) - prefix.begin());
  }
};`,
            java: `class Solution {
  private final int[] prefix;
  private final Random rnd = new Random();

  public Solution(int[] w) {
    prefix = new int[w.length];
    int running = 0;
    for (int i = 0; i < w.length; i++) { running += w[i]; prefix[i] = running; }
  }

  public int pickIndex() {
    int target = rnd.nextInt(prefix[prefix.length - 1]);   // [0, total)

    int lo = 0, hi = prefix.length;
    while (lo < hi) {
      int mid = lo + (hi - lo) / 2;
      if (prefix[mid] > target) hi = mid;
      else                      lo = mid + 1;
    }
    return lo;
  }
}`,
          },
          followUp: 'What if weights change often? Replace the prefix array with a Fenwick tree so updates stay O(log n), and binary search the tree directly.',
        },
      },
      practice: [
        {
          lc: 382,
          title: 'Linked List Random Node',
          slug: 'linked-list-random-node',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight:
            'Reservoir sampling: keep the i-th element with probability 1/i as you walk. O(1) memory and it works on a stream of unknown length — prove the uniformity.',
          companies: ['google', 'meta'],
        },
        {
          lc: 384,
          title: 'Shuffle an Array',
          slug: 'shuffle-an-array',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped: Fisher-Yates, swapping position i with a random index in [i, n). Drawing from [0, n) instead is the classic biased shuffle — know why it is wrong.',
        },
      ],
    },
  ],
};
