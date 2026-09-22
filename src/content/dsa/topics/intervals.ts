import type { Topic } from '../../schema';

export const intervals: Topic = {
  id: 'intervals',
  name: 'Intervals',
  phase: 2,
  estHours: 8,
  prerequisites: ['sorting'],

  whyItMatters:
    'Interval problems are everywhere in real systems — calendar booking, resource allocation, rate limiting, range merging in databases — and they are asked constantly because the naive O(n^2) pairwise comparison is so tempting. Nearly every one collapses to the same two moves: sort by the right endpoint, then sweep once. The skill is knowing WHICH endpoint to sort by, because that single choice decides whether the problem is easy or impossible.',

  fundamentals: [
    {
      heading: 'Sorting by start versus sorting by end',
      body:
        'Sort by START when you are merging or need to process intervals in timeline order — merging, inserting, finding gaps. Sort by END when you are choosing a maximum non-overlapping subset, because finishing earliest leaves the most room for everything after it. Choosing wrong does not merely slow you down; the greedy becomes incorrect. Say which you are sorting by and why before writing the comparator.',
      costs: [
        { op: 'sort', cost: 'O(n log n)', note: 'dominates every solution here' },
        { op: 'sweep after sorting', cost: 'O(n)', note: 'one pass, one merge test' },
        { op: 'naive pairwise overlap check', cost: 'O(n^2)', note: 'the thing sorting eliminates' },
      ],
    },
    {
      heading: 'The overlap test, written once',
      body:
        'Two intervals [a1, a2] and [b1, b2] overlap exactly when a1 <= b2 AND b1 <= a2. Equivalently they do NOT overlap when one ends before the other starts. Write it as the non-overlap test when possible — it has fewer cases and is harder to get backwards. Then settle the touching question explicitly: does [1,2] overlap [2,3]? For merging usually yes; for meeting rooms usually no, because a meeting ending at 2 frees the room at 2.',
      code: {
        cpp: `bool overlap(const Interval& a, const Interval& b) {
  return a.start <= b.end && b.start <= a.end;
}

// After sorting by start, the test simplifies: only the previous end matters.
if (cur.start <= prevEnd) prevEnd = max(prevEnd, cur.end);   // merge
else                      emit(cur);                          // disjoint`,
        java: `boolean overlap(int[] a, int[] b) {
  return a[0] <= b[1] && b[0] <= a[1];
}`,
      },
    },
    {
      heading: 'The sweep line: events, not intervals',
      body:
        'For counting problems — "how many rooms at peak", "maximum concurrent users" — stop thinking about intervals and think about EVENTS. Each interval becomes a +1 at its start and a -1 at its end. Sort all events by time and sweep, tracking a running count; the maximum of that count is the answer. This reframing turns several Hard-looking problems into a sort plus a loop, and it is the same idea as the difference array from Phase 0.',
    },
    {
      heading: 'Ties are where the bugs live',
      body:
        'When one interval ends exactly as another begins, the tie-break order decides the answer. For counting concurrent meetings, process the END before the START, so a room freed at 10:00 is reused by a meeting starting at 10:00. Get that backwards and you over-count by one at every touching boundary. Decide it deliberately and state your choice — interviewers watch for exactly this.',
    },
  ],

  questionTypes: [
    {
      id: 'merge-intervals',
      name: 'Merge overlapping intervals',
      signal:
        '"Merge", "consolidate", "combine overlapping ranges", "insert into a sorted set of ranges". Sort by start, then extend the current interval or emit it and start a new one.',
      time: 'O(n log n)',
      space: 'O(n) for output',
      googleHeavy: true,
      template: {
        cpp: `sort(iv.begin(), iv.end());                 // by START
vector<vector<int>> out;

for (auto& cur : iv) {
  if (!out.empty() && cur[0] <= out.back()[1])
    out.back()[1] = max(out.back()[1], cur[1]);   // extend — max() is essential
  else
    out.push_back(cur);                           // disjoint: start a new one
}`,
        java: `Arrays.sort(iv, (a, b) -> Integer.compare(a[0], b[0]));
List<int[]> out = new ArrayList<>();

for (int[] cur : iv) {
  if (!out.isEmpty() && cur[0] <= out.get(out.size() - 1)[1])
    out.get(out.size() - 1)[1] = Math.max(out.get(out.size() - 1)[1], cur[1]);
  else
    out.add(cur);
}`,
      },
      taught: {
        lc: 56,
        title: 'Merge Intervals',
        slug: 'merge-intervals',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'After sorting by start, an interval can only overlap the one currently being built — so a single pass suffices. Extend with max(), never by assignment.',
        companies: ['google', 'meta', 'amazon', 'microsoft'],
        whyThisOne:
          'The foundation of the whole topic, and the max() detail is a real bug that survives most test cases — the fully-contained interval is the only input that exposes it.',
        walkthrough: {
          howToSeeIt: [
            'Unsorted, any interval might overlap any other, so you are stuck comparing all pairs. Sorting by start imposes an order where overlaps can only be local.',
            'Specifically: once sorted, if the current interval does not overlap the one you are building, it cannot overlap anything earlier either, because every earlier interval starts no later and you have already absorbed their reach.',
            'So keep one interval open. If the next one starts at or before the open interval\'s end, merge it in; otherwise close the open interval and open a new one.',
            'When merging, the new end is max(openEnd, currentEnd). Assigning currentEnd directly is wrong whenever the current interval is entirely contained in the open one — [1,10] followed by [2,3] would shrink the result to [1,3].',
          ],
          wherePeopleLoseIt:
            'That max(). It passes on every partially-overlapping test and fails only on a contained interval. The other decision is whether touching intervals merge: with cur[0] <= end they do, so [1,2] and [2,3] become [1,3]. Ask the interviewer which behaviour they want rather than assuming.',
          time: 'O(n log n) — dominated by the sort.',
          space: 'O(n) for the output.',
          code: {
            cpp: `vector<vector<int>> merge(vector<vector<int>>& intervals) {
  sort(intervals.begin(), intervals.end());     // by start

  vector<vector<int>> out;
  for (auto& cur : intervals) {
    if (!out.empty() && cur[0] <= out.back()[1]) {
      out.back()[1] = max(out.back()[1], cur[1]);   // max: [1,10] then [2,3]
    } else {
      out.push_back(cur);
    }
  }
  return out;
}`,
            java: `public int[][] merge(int[][] intervals) {
  Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));

  List<int[]> out = new ArrayList<>();
  for (int[] cur : intervals) {
    int[] last = out.isEmpty() ? null : out.get(out.size() - 1);

    if (last != null && cur[0] <= last[1]) {
      last[1] = Math.max(last[1], cur[1]);
    } else {
      out.add(new int[]{cur[0], cur[1]});
    }
  }
  return out.toArray(new int[0][]);
}`,
          },
          followUp: 'Intervals arrive as a stream and you must answer queries between insertions — that needs an ordered map keyed by start, with floor and ceiling lookups.',
        },
      },
      practice: [
        {
          lc: 57,
          title: 'Insert Interval',
          slug: 'insert-interval',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight: 'Already sorted, so no sort needed — three phases: copy everything before, merge the overlapping run, copy everything after. O(n).',
          companies: ['google', 'meta'],
        },
        {
          lc: 986,
          title: 'Interval List Intersections',
          slug: 'interval-list-intersections',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped: intersect rather than merge. Two pointers over two sorted lists; the intersection is [max(starts), min(ends)] and you advance whichever ends first.',
          companies: ['meta'],
        },
      ],
    },

    {
      id: 'sweep-line',
      name: 'Sweep line and event counting',
      signal:
        '"How many at once", "maximum concurrent", "minimum rooms needed", "peak population". Convert each interval into a +1 start event and a -1 end event, sort, then sweep.',
      time: 'O(n log n)',
      space: 'O(n)',
      googleHeavy: true,
      template: {
        cpp: `vector<pair<int,int>> events;              // (time, delta)
for (auto& iv : intervals) {
  events.push_back({iv[0], +1});
  events.push_back({iv[1], -1});
}
sort(events.begin(), events.end());        // ties: -1 sorts before +1, room freed first

int cur = 0, best = 0;
for (auto& [t, delta] : events) {
  cur += delta;
  best = max(best, cur);
}`,
        java: `int[] starts = new int[n], ends = new int[n];
// sort both independently, then two-pointer sweep
int cur = 0, best = 0, j = 0;
for (int i = 0; i < n; i++) {
  while (j < n && ends[j] <= starts[i]) { cur--; j++; }   // free rooms first
  cur++;
  best = Math.max(best, cur);
}`,
      },
      taught: {
        lc: 1094,
        title: 'Car Pooling',
        slug: 'car-pooling',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'Stop tracking trips and track CHANGES at each location. Passengers board at the start and leave at the end, so the running total is occupancy — check it never exceeds capacity.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'The cleanest sweep-line statement, and the tie-break — riders exit before new riders board at the same stop — is the decision that makes or breaks this family of problems.',
        walkthrough: {
          howToSeeIt: [
            'Simulating every location for every trip is O(trips × locations). The wasted work is obvious: nothing changes between a trip\'s start and end, so only the boundaries matter.',
            'Turn each trip into two events: +passengers at the pickup, -passengers at the drop-off. The intervals themselves become irrelevant.',
            'Sort the events by location and sweep, maintaining a running occupancy. The answer is whether that running total ever exceeds capacity.',
            'Tie-break: at a location where one trip ends and another begins, the drop-off must be processed FIRST — those seats are genuinely free. Sorting by (location, delta) achieves that automatically, since -1 sorts before +1.',
          ],
          wherePeopleLoseIt:
            'Processing boarding before alighting at the same stop, which reports a false capacity violation. Since locations here are bounded and small, a difference array over positions is even simpler than sorting events — recognising that shortcut is worth saying out loud.',
          time: 'O(n log n) sorting events, or O(maxLocation) with a difference array.',
          space: 'O(n).',
          code: {
            cpp: `bool carPooling(vector<vector<int>>& trips, int capacity) {
  // Locations are bounded (0..1000), so a difference array beats sorting events.
  vector<int> delta(1001, 0);

  for (auto& t : trips) {
    delta[t[1]] += t[0];       // board at from
    delta[t[2]] -= t[0];       // alight at to — freeing the seat AT that stop
  }

  int occupancy = 0;
  for (int loc = 0; loc <= 1000; ++loc) {
    occupancy += delta[loc];
    if (occupancy > capacity) return false;
  }
  return true;
}`,
            java: `public boolean carPooling(int[][] trips, int capacity) {
  int[] delta = new int[1001];

  for (int[] t : trips) {
    delta[t[1]] += t[0];
    delta[t[2]] -= t[0];
  }

  int occupancy = 0;
  for (int loc = 0; loc <= 1000; loc++) {
    occupancy += delta[loc];
    if (occupancy > capacity) return false;
  }
  return true;
}`,
          },
          followUp: 'If locations were unbounded — timestamps, say — the difference array is impossible and you must sort events. Know both and when each applies.',
        },
      },
      practice: [
        {
          lc: 253,
          title: 'Meeting Rooms II',
          slug: 'meeting-rooms-ii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight:
            'The canonical concurrency question. Two solutions worth writing: sorted start and end arrays swept together, or a min-heap of end times. The heap version is the one that generalises.',
          companies: ['google', 'meta', 'amazon'],
        },
        {
          lc: 731,
          title: 'My Calendar II',
          slug: 'my-calendar-ii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 45,
          insight:
            'Flipped into an online problem: bookings arrive one at a time and triple-booking must be rejected. An ordered map of deltas lets you sweep after each insert.',
        },
      ],
    },

    {
      id: 'interval-greedy',
      name: 'Greedy selection by earliest end',
      signal:
        '"Maximum non-overlapping intervals", "minimum removals to make them disjoint", "fewest arrows to burst all balloons". Sort by END and take greedily — the exchange argument proves it optimal.',
      time: 'O(n log n)',
      space: 'O(1)',
      template: {
        cpp: `sort(iv.begin(), iv.end(), [](auto& a, auto& b) { return a[1] < b[1]; });  // by END

int kept = 0;
long long lastEnd = LLONG_MIN;
for (auto& cur : iv) {
  if (cur[0] >= lastEnd) { ++kept; lastEnd = cur[1]; }   // no overlap: take it
}
return (int)iv.size() - kept;                            // removals needed`,
        java: `Arrays.sort(iv, (a, b) -> Integer.compare(a[1], b[1]));

int kept = 0;
long lastEnd = Long.MIN_VALUE;
for (int[] cur : iv) {
  if (cur[0] >= lastEnd) { kept++; lastEnd = cur[1]; }
}
return iv.length - kept;`,
      },
      taught: {
        lc: 435,
        title: 'Non-overlapping Intervals',
        slug: 'non-overlapping-intervals',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 35,
        insight:
          'Sort by END, not by start. Always keeping the interval that finishes earliest leaves the maximum room for everything after it — and that greedy choice is provably optimal.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'It is the one place in this topic where the sorting key is genuinely counter-intuitive, and it comes with an exchange argument short enough to deliver at a whiteboard.',
        walkthrough: {
          howToSeeIt: [
            'Reframe first: minimising removals is the same as MAXIMISING how many you keep. Maximisation problems have cleaner greedy arguments, so always flip to that form.',
            'Try sorting by start and break it: one enormous interval starting first would be taken and would block everything else. Sorting by start is simply wrong for selection.',
            'Sort by end instead. Take the interval that finishes earliest; it leaves at least as much room as any alternative. Then take the next interval whose start is at or after that end, and repeat.',
            'The exchange argument: if some optimal solution does not begin with the earliest-finishing interval, swap its first interval for that one. The swap cannot conflict with anything, since the earliest-finishing interval ends no later. So an optimal solution containing the greedy choice exists, and induction does the rest.',
          ],
          wherePeopleLoseIt:
            'Sorting by start because merge problems do. Here that produces a plausible-looking but incorrect answer, and only certain inputs expose it. Second, the touching case: [1,2] and [2,3] do not overlap, so the test is cur[0] >= lastEnd with >=, not >.',
          time: 'O(n log n).',
          space: 'O(1) beyond the sort.',
          code: {
            cpp: `int eraseOverlapIntervals(vector<vector<int>>& intervals) {
  if (intervals.empty()) return 0;

  // Sort by END — earliest finish leaves the most room afterwards.
  sort(intervals.begin(), intervals.end(),
       [](const vector<int>& a, const vector<int>& b) { return a[1] < b[1]; });

  int kept = 0;
  long long lastEnd = LLONG_MIN;

  for (auto& cur : intervals) {
    if (cur[0] >= lastEnd) {        // >= : touching is NOT overlapping
      ++kept;
      lastEnd = cur[1];
    }
  }
  return (int)intervals.size() - kept;
}`,
            java: `public int eraseOverlapIntervals(int[][] intervals) {
  if (intervals.length == 0) return 0;

  Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));

  int kept = 0;
  long lastEnd = Long.MIN_VALUE;

  for (int[] cur : intervals) {
    if (cur[0] >= lastEnd) {
      kept++;
      lastEnd = cur[1];
    }
  }
  return intervals.length - kept;
}`,
          },
          followUp: 'If each interval carried a weight and you wanted the maximum total weight, greedy fails — that becomes a DP with binary search, which is a good sanity check on when greedy is legitimate.',
        },
      },
      practice: [
        {
          lc: 452,
          title: 'Minimum Number of Arrows to Burst Balloons',
          slug: 'minimum-number-of-arrows-to-burst-balloons',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'Same greedy, inverted answer: count the groups instead of the removals. Here touching DOES count as overlapping, so the comparison flips to >.',
        },
        {
          lc: 646,
          title: 'Maximum Length of Pair Chain',
          slug: 'maximum-length-of-pair-chain',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight: 'Flipped to a chain length: identical earliest-end greedy. Solving it as DP too, and noticing the greedy matches, makes the exchange argument concrete.',
        },
      ],
    },
  ],
};
