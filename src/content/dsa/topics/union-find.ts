import type { Topic } from '../../schema';

export const unionFind: Topic = {
  id: 'union-find',
  name: 'Union-Find (DSU)',
  phase: 3,
  estHours: 8,
  prerequisites: ['graphs'],

  whyItMatters:
    'Union-find answers "are these two things in the same group?" in effectively constant time, and unlike DFS it works when edges ARRIVE OVER TIME. That single property is why it wins: re-running a traversal after every new edge is O(V + E) per query, while union-find absorbs each edge in near O(1). The moment a problem says connections are added incrementally, this is the answer.',

  fundamentals: [
    {
      heading: 'Thirty lines that you should be able to write cold',
      body:
        'Each element points to a parent; the root of a chain identifies the set. find walks to the root, union attaches one root under another. Two optimisations make it fast and you should always include both: PATH COMPRESSION flattens the chain during find, and UNION BY SIZE attaches the smaller tree under the larger. Together they give O(alpha(n)) amortised, where alpha is the inverse Ackermann function and is at most 4 for any n you will ever see.',
      code: {
        cpp: `struct DSU {
  vector<int> parent, size;
  int components;

  DSU(int n) : parent(n), size(n, 1), components(n) {
    iota(parent.begin(), parent.end(), 0);      // each element is its own root
  }

  int find(int x) {
    while (parent[x] != x) {
      parent[x] = parent[parent[x]];            // path compression, halving
      x = parent[x];
    }
    return x;
  }

  bool unite(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra == rb) return false;                 // already together: this edge is redundant

    if (size[ra] < size[rb]) swap(ra, rb);      // union by size
    parent[rb] = ra;
    size[ra] += size[rb];
    --components;
    return true;
  }
};`,
        java: `class DSU {
  int[] parent, size;
  int components;

  DSU(int n) {
    parent = new int[n]; size = new int[n]; components = n;
    for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
  }

  int find(int x) {
    while (parent[x] != x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  boolean union(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra == rb) return false;

    if (size[ra] < size[rb]) { int t = ra; ra = rb; rb = t; }
    parent[rb] = ra;
    size[ra] += size[rb];
    components--;
    return true;
  }
}`,
      },
      costs: [
        { op: 'find / union with both optimisations', cost: 'O(alpha(n))', note: 'effectively O(1); alpha <= 4 in practice' },
        { op: 'without path compression', cost: 'O(log n)', note: 'still fine, but why leave it out' },
        { op: 'without either', cost: 'O(n)', note: 'degenerates to a linked list' },
        { op: 'component count', cost: 'O(1)', note: 'maintain it as a counter during union' },
      ],
    },
    {
      heading: 'union returning a boolean is the useful design',
      body:
        'Have union return false when the two elements were ALREADY in the same set. That one return value directly answers several problems: a redundant edge is an edge whose union returns false, a cycle in an undirected graph is the first such edge, and Kruskal\'s MST simply skips them. Writing union as void throws away information you will immediately want back.',
    },
    {
      heading: 'When union-find beats DFS, and when it does not',
      body:
        'Union-find wins for incremental connectivity, for cycle detection in undirected graphs, and for Kruskal\'s algorithm. It cannot do: shortest paths, directed graph cycles, or anything needing the actual path between nodes. It also cannot UNDO a union without extra machinery. If the problem removes edges over time, the standard trick is to process the timeline in reverse so removals become additions.',
    },
    {
      heading: 'Mapping non-integer elements',
      body:
        'DSU is indexed by integers, so strings, emails or grid cells must be mapped first. A hash map from the item to a fresh integer id is the general answer; for a grid, the flattening r * C + c is faster and allocation-free. Do the mapping once up front rather than inside the loop.',
    },
  ],

  questionTypes: [
    {
      id: 'dsu-connectivity',
      name: 'Connectivity and redundant edges',
      signal:
        '"Are these two connected", "find the edge that creates a cycle", "merge these groups". Union every edge; an edge whose endpoints already share a root is redundant.',
      time: 'O(E · alpha(n))',
      space: 'O(n)',
      googleHeavy: true,
      template: {
        cpp: `DSU dsu(n);
for (auto& e : edges) {
  if (!dsu.unite(e[0], e[1])) {
    // endpoints already connected: this edge closes a cycle
  }
}`,
        java: `DSU dsu = new DSU(n);
for (int[] e : edges) {
  if (!dsu.union(e[0], e[1])) {
    // redundant edge
  }
}`,
      },
      taught: {
        lc: 684,
        title: 'Redundant Connection',
        slug: 'redundant-connection',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 35,
        insight:
          'Process the edges in order. The first edge whose endpoints are already connected is the one that closes the cycle — and since the input guarantees exactly one extra edge, that is the answer.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'It turns the union return value into the entire solution, which is the cleanest possible demonstration of why union should report whether it did anything.',
        walkthrough: {
          howToSeeIt: [
            'A tree on n nodes has exactly n-1 edges. You are given n edges, so precisely one creates a cycle, and the task is to identify it.',
            'An edge creates a cycle exactly when its two endpoints are ALREADY connected by earlier edges — there is already a path, so adding a direct link closes a loop.',
            'Union-find answers "already connected?" in near constant time. Walk the edges in order and union each; the first one that reports its endpoints already share a root is the answer.',
            'Return it immediately. The problem asks for the last such edge in the input order, and since there is exactly one cycle, the first detection IS that edge.',
          ],
          wherePeopleLoseIt:
            'Node labels are 1-indexed, so size the DSU n+1 or subtract one consistently — an off-by-one here produces an out-of-bounds or silently wrong roots. The other trap is reaching for DFS: it works, but you must re-search after each edge, which is O(V·E) versus near-linear here.',
          time: 'O(n · alpha(n)).',
          space: 'O(n).',
          code: {
            cpp: `vector<int> findRedundantConnection(vector<vector<int>>& edges) {
  int n = (int)edges.size();
  vector<int> parent(n + 1), sz(n + 1, 1);       // nodes are 1-indexed
  iota(parent.begin(), parent.end(), 0);

  function<int(int)> find = [&](int x) {
    while (parent[x] != x) {
      parent[x] = parent[parent[x]];             // path compression
      x = parent[x];
    }
    return x;
  };

  for (auto& e : edges) {
    int ra = find(e[0]), rb = find(e[1]);

    if (ra == rb) return e;                      // already connected => this closes a cycle

    if (sz[ra] < sz[rb]) swap(ra, rb);
    parent[rb] = ra;
    sz[ra] += sz[rb];
  }
  return {};
}`,
            java: `public int[] findRedundantConnection(int[][] edges) {
  int n = edges.length;
  int[] parent = new int[n + 1], sz = new int[n + 1];
  for (int i = 0; i <= n; i++) { parent[i] = i; sz[i] = 1; }

  for (int[] e : edges) {
    int ra = find(parent, e[0]), rb = find(parent, e[1]);

    if (ra == rb) return e;

    if (sz[ra] < sz[rb]) { int t = ra; ra = rb; rb = t; }
    parent[rb] = ra;
    sz[ra] += sz[rb];
  }
  return new int[0];
}

private int find(int[] parent, int x) {
  while (parent[x] != x) {
    parent[x] = parent[parent[x]];
    x = parent[x];
  }
  return x;
}`,
          },
          followUp: 'The directed version (LC 685) is much harder — a node with two parents and a cycle are different failure modes and must be handled separately.',
        },
      },
      practice: [
        {
          lc: 721,
          title: 'Accounts Merge',
          slug: 'accounts-merge',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 45,
          insight: 'Map each email to an integer id, union all emails within an account, then group by root. The mapping step is most of the work.',
          companies: ['google', 'meta', 'amazon'],
        },
        {
          lc: 990,
          title: 'Satisfiability of Equality Equations',
          slug: 'satisfiability-of-equality-equations',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped into two passes: union all the equalities FIRST, then verify no inequality joins two elements now sharing a root. Order matters absolutely.',
        },
      ],
    },

    {
      id: 'dsu-counting',
      name: 'Tracking component count and sizes',
      signal:
        '"How many groups remain", "size of the largest group", "how many edges to connect everything". Maintain a component counter and a size array inside the DSU.',
      time: 'O(E · alpha(n))',
      space: 'O(n)',
      template: {
        cpp: `// components starts at n and decreases by one on every successful union.
// To connect c components you need exactly c - 1 more edges.
int redundant = 0;
for (auto& e : edges)
  if (!dsu.unite(e[0], e[1])) ++redundant;      // spare cable

return redundant >= dsu.components - 1 ? dsu.components - 1 : -1;`,
        java: `int redundant = 0;
for (int[] e : edges)
  if (!dsu.union(e[0], e[1])) redundant++;

return redundant >= dsu.components - 1 ? dsu.components - 1 : -1;`,
      },
      taught: {
        lc: 1319,
        title: 'Number of Operations to Make Network Connected',
        slug: 'number-of-operations-to-make-network-connected',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 35,
        insight:
          'Every redundant cable can be moved somewhere useful, and joining c components needs exactly c-1 cables. So the answer is feasible precisely when spare cables >= components - 1.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'It uses both DSU byproducts at once — the component count and the redundancy signal — and the counting argument is a small, clean proof.',
        walkthrough: {
          howToSeeIt: [
            'Two separate questions: is it even possible, and if so how many moves. Answer the feasibility first, because it is a pure counting argument.',
            'To connect c components into one you need at least c-1 links; each link can reduce the count by at most one. Independently, with n computers you need at least n-1 cables overall, so if fewer are supplied it is impossible.',
            'Union every cable. Each union that returns false is a cable joining already-connected machines — it is redundant and therefore movable. Count those.',
            'At the end you have the component count and the spare-cable count. If spares >= components - 1, the answer is components - 1; otherwise -1.',
          ],
          wherePeopleLoseIt:
            'Checking connections.size() < n - 1 as the only feasibility test, which is correct but people often forget it entirely and then return a positive answer for an impossible input. Also: counting spares is equivalent to that check, so doing both is belt and braces — say which one you rely on.',
          time: 'O(E · alpha(n)).',
          space: 'O(n).',
          code: {
            cpp: `int makeConnected(int n, vector<vector<int>>& connections) {
  if ((int)connections.size() < n - 1) return -1;    // not enough cable, full stop

  vector<int> parent(n), sz(n, 1);
  iota(parent.begin(), parent.end(), 0);
  int components = n;

  function<int(int)> find = [&](int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  };

  for (auto& e : connections) {
    int ra = find(e[0]), rb = find(e[1]);
    if (ra == rb) continue;                          // redundant cable, free to move

    if (sz[ra] < sz[rb]) swap(ra, rb);
    parent[rb] = ra;
    sz[ra] += sz[rb];
    --components;
  }

  return components - 1;                             // c - 1 moves to join c components
}`,
            java: `public int makeConnected(int n, int[][] connections) {
  if (connections.length < n - 1) return -1;

  int[] parent = new int[n], sz = new int[n];
  for (int i = 0; i < n; i++) { parent[i] = i; sz[i] = 1; }
  int components = n;

  for (int[] e : connections) {
    int ra = find(parent, e[0]), rb = find(parent, e[1]);
    if (ra == rb) continue;

    if (sz[ra] < sz[rb]) { int t = ra; ra = rb; rb = t; }
    parent[rb] = ra;
    sz[ra] += sz[rb];
    components--;
  }

  return components - 1;
}

private int find(int[] parent, int x) {
  while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
  return x;
}`,
          },
          followUp: 'Report the largest component size at every step — maintain a running maximum inside union, since only the merged root can become the new largest.',
        },
      },
      practice: [
        {
          lc: 1971,
          title: 'Find if Path Exists in Graph',
          slug: 'find-if-path-exists-in-graph',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 20,
          insight: 'The simplest possible use: union everything, then compare two roots. Note that a single query makes plain BFS equally good — say which you would pick and why.',
        },
        {
          lc: 947,
          title: 'Most Stones Removed with Same Row or Column',
          slug: 'most-stones-removed-with-same-row-or-column',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight:
            'Flipped and clever: union stones sharing a row or column, then the answer is n minus the number of components, because each group collapses to one survivor.',
          companies: ['google'],
        },
      ],
    },

    {
      id: 'kruskal-mst',
      name: 'Kruskal and minimum spanning trees',
      signal:
        '"Connect all points at minimum cost", "cheapest way to link every city". Sort the edges by weight and union greedily, skipping any edge whose endpoints are already connected.',
      time: 'O(E log E)',
      space: 'O(V)',
      template: {
        cpp: `sort(edges.begin(), edges.end());       // by weight

DSU dsu(n);
long long total = 0;
int used = 0;

for (auto& [w, u, v] : edges) {
  if (!dsu.unite(u, v)) continue;       // would close a cycle: skip
  total += w;
  if (++used == n - 1) break;           // a spanning tree needs exactly n-1 edges
}`,
        java: `Arrays.sort(edges, (a, b) -> Integer.compare(a[0], b[0]));

long total = 0;
int used = 0;
for (int[] e : edges) {
  if (!dsu.union(e[1], e[2])) continue;
  total += e[0];
  if (++used == n - 1) break;
}`,
      },
      taught: {
        lc: 1584,
        title: 'Min Cost to Connect All Points',
        slug: 'min-cost-to-connect-all-points',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 45,
        insight:
          'Build all pairwise edges, sort by cost, and union greedily while skipping cycles. Taking the cheapest safe edge at every step is provably optimal — that is the cut property.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'The standard MST question, and it has a real justification you can state in one sentence rather than an algorithm you merely recall.',
        walkthrough: {
          howToSeeIt: [
            'Recognise the shape: connect every node, no cycles needed, minimise total weight. That is a minimum spanning tree, and two algorithms build one — Kruskal with union-find, or Prim with a heap.',
            'The graph is complete and implicit: every pair of points has an edge whose weight is the Manhattan distance. With n up to 1000 that is about 500,000 edges, which is acceptable to materialise.',
            'Kruskal: sort the edges ascending, then take each one unless its endpoints are already connected. Union-find makes that check near constant.',
            'Why greedy is correct — the cut property: for any way of splitting the nodes into two groups, the cheapest edge crossing the split belongs to some MST. Kruskal always takes such an edge, so it never makes a wrong choice. Stop once n-1 edges are used.',
          ],
          wherePeopleLoseIt:
            'Forgetting to skip cycle-closing edges, which produces something that is not a tree and overcounts the cost. Second: the sum needs 64 bits at these limits. And if the graph were dense with n far larger, Prim with an adjacency matrix at O(n^2) would beat Kruskal at O(n^2 log n) — worth naming.',
          time: 'O(n^2 log n) — dominated by sorting the pairwise edges.',
          space: 'O(n^2) for the edge list.',
          code: {
            cpp: `int minCostConnectPoints(vector<vector<int>>& points) {
  int n = (int)points.size();

  vector<tuple<int,int,int>> edges;                 // (weight, u, v)
  edges.reserve((size_t)n * (n - 1) / 2);

  for (int i = 0; i < n; ++i)
    for (int j = i + 1; j < n; ++j) {
      int w = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1]);
      edges.push_back({w, i, j});
    }

  sort(edges.begin(), edges.end());                 // cheapest first

  vector<int> parent(n), sz(n, 1);
  iota(parent.begin(), parent.end(), 0);

  function<int(int)> find = [&](int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  };

  long long total = 0;
  int used = 0;

  for (auto& [w, u, v] : edges) {
    int ru = find(u), rv = find(v);
    if (ru == rv) continue;                         // would close a cycle

    if (sz[ru] < sz[rv]) swap(ru, rv);
    parent[rv] = ru;
    sz[ru] += sz[rv];

    total += w;
    if (++used == n - 1) break;                     // spanning tree complete
  }
  return (int)total;
}`,
            java: `public int minCostConnectPoints(int[][] points) {
  int n = points.length;
  List<int[]> edges = new ArrayList<>();

  for (int i = 0; i < n; i++)
    for (int j = i + 1; j < n; j++) {
      int w = Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]);
      edges.add(new int[]{w, i, j});
    }

  edges.sort((a, b) -> Integer.compare(a[0], b[0]));

  int[] parent = new int[n], sz = new int[n];
  for (int i = 0; i < n; i++) { parent[i] = i; sz[i] = 1; }

  long total = 0;
  int used = 0;

  for (int[] e : edges) {
    int ru = find(parent, e[1]), rv = find(parent, e[2]);
    if (ru == rv) continue;

    if (sz[ru] < sz[rv]) { int t = ru; ru = rv; rv = t; }
    parent[rv] = ru;
    sz[ru] += sz[rv];

    total += e[0];
    if (++used == n - 1) break;
  }
  return (int) total;
}

private int find(int[] parent, int x) {
  while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
  return x;
}`,
          },
          followUp: 'Write Prim with a heap and compare: Prim is better on dense graphs, Kruskal on sparse ones. Knowing which to reach for is the real deliverable.',
        },
      },
      practice: [
        {
          lc: 1697,
          title: 'Checking Existence of Edge Length Limited Paths',
          slug: 'checking-existence-of-edge-length-limited-paths',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 50,
          insight:
            'Offline processing: sort the queries by limit and the edges by weight, then union edges in as the limit rises. Answering queries out of order is the trick.',
          companies: ['google'],
        },
        {
          lc: 1489,
          title: 'Find Critical and Pseudo-Critical Edges in Minimum Spanning Tree',
          slug: 'find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 60,
          insight:
            'Flipped: run Kruskal repeatedly — once excluding each edge to test criticality, once forcing it in to test pseudo-criticality. Brute force over a fast subroutine.',
        },
      ],
    },
  ],
};
