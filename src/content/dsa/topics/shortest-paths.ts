import type { Topic } from '../../schema';

export const shortestPaths: Topic = {
  id: 'shortest-paths',
  name: 'Shortest Paths',
  phase: 3,
  estHours: 12,
  prerequisites: ['graphs', 'heaps'],

  whyItMatters:
    'Shortest path is the graph question with the most variants, and each variant has a specific right answer. Picking Dijkstra when edges can be negative gives a confidently wrong result; picking Bellman-Ford when you only needed BFS wastes a factor of V. The skill being tested is choosing the algorithm from the constraints — which is why interviewers state the weight rules so carefully.',

  fundamentals: [
    {
      heading: 'The decision table — memorise this',
      body:
        'Read the edge weights and the question, then pick. Unweighted, or all weights equal: BFS, O(V + E). Weights of only 0 and 1: 0-1 BFS with a deque, O(V + E). Non-negative weights: Dijkstra with a heap, O(E log V). Negative weights allowed: Bellman-Ford, O(V·E), which also detects negative cycles. All pairs, small V: Floyd-Warshall, O(V^3). A path limited to at most k edges: Bellman-Ford with k rounds. Stating this table unprompted is worth real credit.',
      costs: [
        { op: 'BFS (unweighted)', cost: 'O(V + E)', note: 'first arrival is optimal' },
        { op: '0-1 BFS (deque)', cost: 'O(V + E)', note: 'push front on weight 0, back on weight 1' },
        { op: 'Dijkstra (binary heap)', cost: 'O(E log V)', note: 'non-negative weights only' },
        { op: 'Bellman-Ford', cost: 'O(V·E)', note: 'handles negatives, detects negative cycles' },
        { op: 'Floyd-Warshall', cost: 'O(V^3)', note: 'all pairs, trivial to write' },
      ],
    },
    {
      heading: 'Why Dijkstra breaks on negative edges',
      body:
        'Dijkstra finalises a node the moment it pops it, on the assumption that no later path can be cheaper — true only when every edge adds non-negative cost. With a negative edge, a longer route could still reduce the total after the node is already locked in, so the answer is wrong. This is the single most valuable fact in the topic: when asked "why not Dijkstra here?", that sentence is the answer.',
    },
    {
      heading: 'Lazy deletion in the heap',
      body:
        'Binary heaps cannot decrease a key, so the standard implementation pushes a new entry whenever a shorter distance is found and leaves the stale ones behind. On popping, compare the stored distance with the current best and skip if it is stale. The heap may hold up to E entries, which is why the bound is O(E log V) rather than O(E log E) — and that stale check is required, not optional.',
      code: {
        cpp: `priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>> pq;
vector<long long> dist(n, LLONG_MAX);

dist[src] = 0;
pq.push({0, src});

while (!pq.empty()) {
  auto [d, u] = pq.top(); pq.pop();
  if (d > dist[u]) continue;                 // stale entry: skip it

  for (auto [v, w] : adj[u]) {
    if (d + w < dist[v]) {
      dist[v] = d + w;
      pq.push({dist[v], v});                 // push a fresh entry, leave the old one
    }
  }
}`,
        java: `PriorityQueue<long[]> pq = new PriorityQueue<>((a, b) -> Long.compare(a[0], b[0]));
long[] dist = new long[n];
Arrays.fill(dist, Long.MAX_VALUE);

dist[src] = 0;
pq.add(new long[]{0, src});

while (!pq.isEmpty()) {
  long[] cur = pq.poll();
  int u = (int) cur[1];
  if (cur[0] > dist[u]) continue;

  for (int[] e : adj.get(u)) {
    if (cur[0] + e[1] < dist[e[0]]) {
      dist[e[0]] = cur[0] + e[1];
      pq.add(new long[]{dist[e[0]], e[0]});
    }
  }
}`,
      },
    },
    {
      heading: 'Relaxation is the one idea underneath all of them',
      body:
        'Every algorithm here repeats the same step: if dist[u] + weight(u, v) is better than dist[v], improve dist[v]. They differ only in the ORDER of relaxations. Dijkstra relaxes from the closest unfinalised node. Bellman-Ford relaxes every edge V-1 times, because after k rounds all shortest paths using at most k edges are correct. Floyd-Warshall relaxes through each possible intermediate node in turn.',
    },
  ],

  questionTypes: [
    {
      id: 'dijkstra',
      name: 'Dijkstra with a heap',
      signal:
        '"Minimum time", "cheapest route", "shortest path" with NON-NEGATIVE weights. Always expand the closest unfinalised node, using a min-heap keyed by distance.',
      time: 'O(E log V)',
      space: 'O(V + E)',
      googleHeavy: true,
      template: {
        cpp: `vector<long long> dist(n, LLONG_MAX);
priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>> pq;

dist[src] = 0;
pq.push({0, src});

while (!pq.empty()) {
  auto [d, u] = pq.top(); pq.pop();
  if (d > dist[u]) continue;                   // stale
  for (auto [v, w] : adj[u])
    if (d + w < dist[v]) { dist[v] = d + w; pq.push({dist[v], v}); }
}`,
        java: `long[] dist = new long[n];
Arrays.fill(dist, Long.MAX_VALUE);
PriorityQueue<long[]> pq = new PriorityQueue<>((a, b) -> Long.compare(a[0], b[0]));
dist[src] = 0;
pq.add(new long[]{0, src});`,
      },
      taught: {
        lc: 743,
        title: 'Network Delay Time',
        slug: 'network-delay-time',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          'The time for all nodes to receive the signal is the MAXIMUM of the shortest distances. One Dijkstra run from the source answers it; the max over dist is the answer.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'The plainest Dijkstra statement with one small reframing on top, so the algorithm is the focus rather than the problem\'s wrapping.',
        walkthrough: {
          howToSeeIt: [
            'Name the pieces: nodes are network machines, directed edges carry a positive delay, and the signal reaches each node along its fastest route. So each node\'s arrival time is its shortest-path distance.',
            'Weights are positive, so Dijkstra is correct. Say why you are not using BFS: the weights differ, so the fewest-hops path is not necessarily the fastest.',
            'Run Dijkstra from the source, then take the maximum finite distance — the last machine to hear the signal determines the total time.',
            'If any node is still at infinity it is unreachable, so return -1. Check that before taking the maximum, or the sentinel value leaks into the answer.',
          ],
          wherePeopleLoseIt:
            'Skipping the stale check after popping. Without it every outdated heap entry is expanded again, which is still correct but degrades badly on dense graphs. The other trap is leaving the unreachable sentinel in the maximum — check reachability explicitly rather than hoping.',
          time: 'O(E log V).',
          space: 'O(V + E).',
          code: {
            cpp: `int networkDelayTime(vector<vector<int>>& times, int n, int k) {
  vector<vector<pair<int,int>>> adj(n + 1);          // 1-indexed nodes
  for (auto& t : times) adj[t[0]].push_back({t[1], t[2]});

  vector<long long> dist(n + 1, LLONG_MAX);
  priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>> pq;

  dist[k] = 0;
  pq.push({0, k});

  while (!pq.empty()) {
    auto [d, u] = pq.top(); pq.pop();
    if (d > dist[u]) continue;                       // stale entry — required

    for (auto [v, w] : adj[u]) {
      if (d + w < dist[v]) {
        dist[v] = d + w;
        pq.push({dist[v], v});
      }
    }
  }

  long long worst = 0;
  for (int i = 1; i <= n; ++i) {
    if (dist[i] == LLONG_MAX) return -1;             // unreachable
    worst = max(worst, dist[i]);
  }
  return (int)worst;
}`,
            java: `public int networkDelayTime(int[][] times, int n, int k) {
  List<List<int[]>> adj = new ArrayList<>();
  for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
  for (int[] t : times) adj.get(t[0]).add(new int[]{t[1], t[2]});

  long[] dist = new long[n + 1];
  Arrays.fill(dist, Long.MAX_VALUE);
  dist[k] = 0;

  PriorityQueue<long[]> pq = new PriorityQueue<>((a, b) -> Long.compare(a[0], b[0]));
  pq.add(new long[]{0, k});

  while (!pq.isEmpty()) {
    long[] cur = pq.poll();
    int u = (int) cur[1];
    if (cur[0] > dist[u]) continue;

    for (int[] e : adj.get(u)) {
      if (cur[0] + e[1] < dist[e[0]]) {
        dist[e[0]] = cur[0] + e[1];
        pq.add(new long[]{dist[e[0]], e[0]});
      }
    }
  }

  long worst = 0;
  for (int i = 1; i <= n; i++) {
    if (dist[i] == Long.MAX_VALUE) return -1;
    worst = Math.max(worst, dist[i]);
  }
  return (int) worst;
}`,
          },
          followUp: 'Reconstruct the actual path — store a parent per node whenever you improve its distance, then walk back from the target.',
        },
      },
      practice: [
        {
          lc: 1631,
          title: 'Path With Minimum Effort',
          slug: 'path-with-minimum-effort',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 45,
          insight:
            'The path cost is the MAXIMUM edge along it, not the sum. Dijkstra still works — replace the sum with a max in the relaxation. Binary search on the answer also solves it.',
          companies: ['google'],
        },
        {
          lc: 1514,
          title: 'Path with Maximum Probability',
          slug: 'path-with-maximum-probability',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight:
            'Flipped to maximisation with multiplied probabilities: use a MAX-heap and relax on products. Probabilities are at most 1, so multiplying never increases — the Dijkstra argument survives.',
        },
      ],
    },

    {
      id: 'bellman-ford',
      name: 'Bellman-Ford and edge-limited paths',
      signal:
        'Negative weights are possible, or the path may use AT MOST K edges. Relax every edge in rounds; after k rounds every shortest path using at most k edges is final.',
      time: 'O(V·E), or O(K·E)',
      space: 'O(V)',
      googleHeavy: true,
      template: {
        cpp: `vector<long long> dist(n, LLONG_MAX);
dist[src] = 0;

for (int round = 0; round < k; ++round) {
  vector<long long> prev = dist;              // snapshot: use LAST round's values only
  for (auto& [u, v, w] : edges)
    if (prev[u] != LLONG_MAX && prev[u] + w < dist[v])
      dist[v] = prev[u] + w;
}`,
        java: `long[] dist = new long[n];
Arrays.fill(dist, Long.MAX_VALUE);
dist[src] = 0;

for (int round = 0; round < k; round++) {
  long[] prev = dist.clone();
  for (int[] e : edges)
    if (prev[e[0]] != Long.MAX_VALUE && prev[e[0]] + e[2] < dist[e[1]])
      dist[e[1]] = prev[e[0]] + e[2];
}`,
      },
      taught: {
        lc: 787,
        title: 'Cheapest Flights Within K Stops',
        slug: 'cheapest-flights-within-k-stops',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 50,
        insight:
          'The stop limit is what rules out Dijkstra — a cheaper route may use too many hops. Bellman-Ford with k+1 rounds naturally bounds the number of edges, but you must relax from a SNAPSHOT of the previous round.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'It is the clearest demonstration that Dijkstra is not universal, and the snapshot requirement is a genuine correctness subtlety rather than a coding detail.',
        walkthrough: {
          howToSeeIt: [
            'Explain why Dijkstra fails first. It finalises by cost alone, so it may lock in a cheap route that already used too many stops, then be unable to reconsider. The constraint is on edge COUNT, which Dijkstra does not track.',
            'Bellman-Ford has exactly the right property: after round i, dist holds the best cost using at most i edges. With at most k stops you may use k+1 flights, so run k+1 rounds.',
            'Each round relaxes every edge once. That is O(K · E), which the constraints comfortably allow.',
            'Critical detail: relax using a SNAPSHOT of the previous round. Reading the array being written lets one round chain several edges together and silently exceed the hop limit.',
          ],
          wherePeopleLoseIt:
            'Omitting the snapshot. The code then permits paths longer than k+1 edges within a single round, and it returns a cheaper-but-illegal answer that passes small tests. Copy the array each round, or use a separate next array. Second: rounds are k+1, not k — the limit is on STOPS, and n stops means n+1 flights.',
          time: 'O(K · E).',
          space: 'O(V).',
          code: {
            cpp: `int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
  const long long INF = LLONG_MAX / 4;
  vector<long long> dist(n, INF);
  dist[src] = 0;

  // k stops means at most k + 1 edges, so k + 1 rounds.
  for (int round = 0; round <= k; ++round) {
    vector<long long> prev = dist;              // SNAPSHOT — the whole correctness argument

    for (auto& f : flights) {
      int u = f[0], v = f[1], w = f[2];
      if (prev[u] == INF) continue;
      dist[v] = min(dist[v], prev[u] + w);      // read prev, write dist
    }
  }

  return dist[dst] == INF ? -1 : (int)dist[dst];
}`,
            java: `public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
  final long INF = Long.MAX_VALUE / 4;
  long[] dist = new long[n];
  Arrays.fill(dist, INF);
  dist[src] = 0;

  for (int round = 0; round <= k; round++) {
    long[] prev = dist.clone();

    for (int[] f : flights) {
      if (prev[f[0]] == INF) continue;
      dist[f[1]] = Math.min(dist[f[1]], prev[f[0]] + f[2]);
    }
  }

  return dist[dst] == INF ? -1 : (int) dist[dst];
}`,
          },
          followUp: 'Detect a negative cycle — run one extra round, and if any distance still improves, a negative cycle is reachable. That is the standard use of Bellman-Ford outside this problem.',
        },
      },
      practice: [
        {
          lc: 1928,
          title: 'Minimum Cost to Reach Destination in Time',
          slug: 'minimum-cost-to-reach-destination-in-time',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 55,
          insight: 'Two constraints at once — cost and time — so the state becomes (node, timeUsed). A reminder that adding a dimension to the state is always available.',
        },
        {
          lc: 2093,
          title: 'Minimum Cost to Reach City With Discounts',
          slug: 'minimum-cost-to-reach-city-with-discounts',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 45,
          insight:
            'Flipped: a second budget dimension, so the state is (city, discountsUsed). Weights stay non-negative, so Dijkstra over the enlarged state graph is the cleaner answer here.',
        },
      ],
    },

    {
      id: 'floyd-warshall',
      name: 'Floyd-Warshall for all pairs',
      signal:
        'Distances between EVERY pair of nodes, with V small — typically under a few hundred. Three nested loops, with the intermediate node as the OUTER one.',
      time: 'O(V^3)',
      space: 'O(V^2)',
      template: {
        cpp: `// dist[i][j] initialised: 0 on the diagonal, edge weights, INF otherwise.
for (int k = 0; k < n; ++k)                 // intermediate node MUST be outermost
  for (int i = 0; i < n; ++i)
    for (int j = 0; j < n; ++j)
      if (dist[i][k] != INF && dist[k][j] != INF)
        dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);`,
        java: `for (int k = 0; k < n; k++)
  for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++)
      if (dist[i][k] != INF && dist[k][j] != INF)
        dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);`,
      },
      taught: {
        lc: 1334,
        title: 'Find the City With the Smallest Number of Neighbors at a Threshold Distance',
        slug: 'find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 35,
        insight:
          'You need every pair, and V is at most 100, so O(V^3) is roughly a million operations — trivial. Four lines beat running Dijkstra V times, and they are far harder to get wrong.',
        companies: ['google'],
        whyThisOne:
          'It is the problem where recognising the constraint is the entire decision: V <= 100 makes the simplest possible algorithm also the right one.',
        walkthrough: {
          howToSeeIt: [
            'The question needs, for every city, how many others lie within a threshold. That is all-pairs shortest paths — the first clue.',
            'Check the constraint: n is at most 100. So V^3 is 10^6, which runs instantly. Running Dijkstra from each node would be O(V · E log V) and is more code for no gain.',
            'Initialise the matrix: 0 on the diagonal, the given weights on edges (taking the minimum if duplicates appear), infinity elsewhere.',
            'Then the triple loop, with k — the allowed intermediate node — as the OUTERMOST loop. Reading it as DP makes it obvious: after iteration k, dist holds the best paths using only nodes 0..k as intermediates.',
          ],
          wherePeopleLoseIt:
            'Putting k innermost. The code still runs and produces plausible numbers that are wrong, because the DP layering is destroyed — you would be using intermediates that have not been finalised. The loop order is the algorithm. Second: guard against adding two infinities, which overflows.',
          time: 'O(V^3).',
          space: 'O(V^2).',
          code: {
            cpp: `int findTheCity(int n, vector<vector<int>>& edges, int distanceThreshold) {
  const int INF = 1e9;
  vector<vector<int>> dist(n, vector<int>(n, INF));

  for (int i = 0; i < n; ++i) dist[i][i] = 0;
  for (auto& e : edges) {
    dist[e[0]][e[1]] = min(dist[e[0]][e[1]], e[2]);   // min: duplicate edges
    dist[e[1]][e[0]] = min(dist[e[1]][e[0]], e[2]);
  }

  for (int k = 0; k < n; ++k)                          // intermediate OUTERMOST
    for (int i = 0; i < n; ++i)
      for (int j = 0; j < n; ++j)
        if (dist[i][k] < INF && dist[k][j] < INF)      // avoid INF + INF
          dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);

  int best = -1, fewest = n + 1;
  for (int i = 0; i < n; ++i) {
    int reachable = 0;
    for (int j = 0; j < n; ++j)
      if (i != j && dist[i][j] <= distanceThreshold) ++reachable;

    if (reachable <= fewest) { fewest = reachable; best = i; }   // ties: largest index
  }
  return best;
}`,
            java: `public int findTheCity(int n, int[][] edges, int distanceThreshold) {
  final int INF = 1_000_000_000;
  int[][] dist = new int[n][n];
  for (int[] row : dist) Arrays.fill(row, INF);
  for (int i = 0; i < n; i++) dist[i][i] = 0;

  for (int[] e : edges) {
    dist[e[0]][e[1]] = Math.min(dist[e[0]][e[1]], e[2]);
    dist[e[1]][e[0]] = Math.min(dist[e[1]][e[0]], e[2]);
  }

  for (int k = 0; k < n; k++)
    for (int i = 0; i < n; i++)
      for (int j = 0; j < n; j++)
        if (dist[i][k] < INF && dist[k][j] < INF)
          dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);

  int best = -1, fewest = n + 1;
  for (int i = 0; i < n; i++) {
    int reachable = 0;
    for (int j = 0; j < n; j++)
      if (i != j && dist[i][j] <= distanceThreshold) reachable++;

    if (reachable <= fewest) { fewest = reachable; best = i; }
  }
  return best;
}`,
          },
          followUp: 'Detect a negative cycle with the same matrix — if any dist[i][i] becomes negative, node i sits on one.',
        },
      },
      practice: [
        {
          lc: 399,
          title: 'Evaluate Division',
          slug: 'evaluate-division',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 45,
          insight:
            'Weighted edges that MULTIPLY rather than add. Floyd-Warshall with products works, and so does DFS per query or weighted union-find — a genuinely three-way problem.',
          companies: ['google', 'meta'],
        },
        {
          lc: 2642,
          title: 'Design Graph With Shortest Path Calculator',
          slug: 'design-graph-with-shortest-path-calculator',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 40,
          insight:
            'Flipped to incremental: adding one edge only needs an O(V^2) update rather than a full rebuild, because only paths through that edge can improve.',
        },
      ],
    },

    {
      id: 'zero-one-bfs',
      name: '0-1 BFS with a deque',
      signal:
        'Every edge costs exactly 0 or 1 — "minimum obstacles to remove", "fewest direction changes", "cheapest with some free moves". A deque replaces the heap and drops the log factor.',
      time: 'O(V + E)',
      space: 'O(V)',
      template: {
        cpp: `deque<int> dq;
vector<int> dist(n, INT_MAX);

dist[src] = 0;
dq.push_front(src);

while (!dq.empty()) {
  int u = dq.front(); dq.pop_front();

  for (auto [v, w] : adj[u]) {
    if (dist[u] + w >= dist[v]) continue;
    dist[v] = dist[u] + w;

    if (w == 0) dq.push_front(v);     // free move: same layer, process first
    else        dq.push_back(v);      // costly move: next layer
  }
}`,
        java: `Deque<Integer> dq = new ArrayDeque<>();
int[] dist = new int[n];
Arrays.fill(dist, Integer.MAX_VALUE);

dist[src] = 0;
dq.addFirst(src);

while (!dq.isEmpty()) {
  int u = dq.pollFirst();
  for (int[] e : adj.get(u)) {
    if (dist[u] + e[1] >= dist[e[0]]) continue;
    dist[e[0]] = dist[u] + e[1];
    if (e[1] == 0) dq.addFirst(e[0]);
    else           dq.addLast(e[0]);
  }
}`,
      },
      taught: {
        lc: 2290,
        title: 'Minimum Obstacle Removal to Reach Corner',
        slug: 'minimum-obstacle-removal-to-reach-corner',
        difficulty: 'hard',
        role: 'taught',
        estMinutes: 45,
        insight:
          'Moving into an empty cell costs 0, into an obstacle costs 1. Push zero-cost moves to the FRONT of a deque and costly ones to the back, and the deque stays sorted by distance without a heap.',
        companies: ['google'],
        whyThisOne:
          'It is the clean statement of a technique most candidates have never seen, and it explains exactly why BFS generalises to weights of 0 and 1 but no further.',
        walkthrough: {
          howToSeeIt: [
            'Name the graph: cells are nodes, and the cost of an edge is 1 if the destination holds an obstacle and 0 otherwise. Minimising removals is a shortest path over those weights.',
            'Dijkstra works and is O(E log V). But with only two distinct weights there is a better structure available.',
            'Plain BFS keeps its queue sorted by distance because every edge adds exactly 1. With weights of 0 and 1 you can preserve that property using a deque: a 0-cost move keeps the same distance, so it belongs at the FRONT; a 1-cost move belongs at the back.',
            'The deque therefore holds at most two distinct distance values at any moment, front to back — which is exactly the invariant BFS relies on. O(V + E), no heap, no log factor.',
          ],
          wherePeopleLoseIt:
            'Pushing both cases to the back, which is plain BFS and gives wrong answers as soon as weights differ. The reverse error is using push_front for everything, which turns it into DFS. Also keep the distance check before pushing — without it a node re-enters the deque endlessly.',
          time: 'O(R·C).',
          space: 'O(R·C).',
          code: {
            cpp: `int minimumObstacles(vector<vector<int>>& grid) {
  int R = (int)grid.size(), C = (int)grid[0].size();
  vector<vector<int>> dist(R, vector<int>(C, INT_MAX));

  deque<pair<int,int>> dq;
  dist[0][0] = grid[0][0];                      // entering the start may cost 1
  dq.push_front({0, 0});

  const int dr[4] = {-1, 1, 0, 0}, dc[4] = {0, 0, -1, 1};

  while (!dq.empty()) {
    auto [r, c] = dq.front(); dq.pop_front();

    for (int d = 0; d < 4; ++d) {
      int nr = r + dr[d], nc = c + dc[d];
      if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;

      int w = grid[nr][nc];                     // 0 or 1
      if (dist[r][c] + w >= dist[nr][nc]) continue;

      dist[nr][nc] = dist[r][c] + w;

      if (w == 0) dq.push_front({nr, nc});      // same distance layer
      else        dq.push_back({nr, nc});       // next distance layer
    }
  }
  return dist[R - 1][C - 1];
}`,
            java: `public int minimumObstacles(int[][] grid) {
  int R = grid.length, C = grid[0].length;
  int[][] dist = new int[R][C];
  for (int[] row : dist) Arrays.fill(row, Integer.MAX_VALUE);

  Deque<int[]> dq = new ArrayDeque<>();
  dist[0][0] = grid[0][0];
  dq.addFirst(new int[]{0, 0});

  int[][] dirs = {{-1,0},{1,0},{0,-1},{0,1}};

  while (!dq.isEmpty()) {
    int[] cur = dq.pollFirst();

    for (int[] d : dirs) {
      int nr = cur[0] + d[0], nc = cur[1] + d[1];
      if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;

      int w = grid[nr][nc];
      if (dist[cur[0]][cur[1]] + w >= dist[nr][nc]) continue;

      dist[nr][nc] = dist[cur[0]][cur[1]] + w;

      if (w == 0) dq.addFirst(new int[]{nr, nc});
      else        dq.addLast(new int[]{nr, nc});
    }
  }
  return dist[R - 1][C - 1];
}`,
          },
          followUp: 'Why does this not extend to weights of 0, 1 and 2? Because a deque can only maintain two adjacent distance layers — beyond that you need a heap or bucket queue.',
        },
      },
      practice: [
        {
          lc: 1368,
          title: 'Minimum Cost to Make at Least One Valid Path in a Grid',
          slug: 'minimum-cost-to-make-at-least-one-valid-path-in-a-grid',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 50,
          insight: 'Following the arrow is free, any other direction costs 1. The textbook 0-1 BFS, and unmistakable once you know the pattern.',
          companies: ['google'],
        },
        {
          lc: 1293,
          title: 'Shortest Path in a Grid with Obstacles Elimination',
          slug: 'shortest-path-in-a-grid-with-obstacles-elimination',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 50,
          insight:
            'Flipped: the state becomes (row, col, eliminationsLeft) and plain BFS works again because every move costs 1. Adding a dimension to the state is the move.',
          companies: ['google'],
        },
      ],
    },
  ],
};
