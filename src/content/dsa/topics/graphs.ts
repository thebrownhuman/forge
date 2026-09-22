import type { Topic } from '../../schema';

export const graphs: Topic = {
  id: 'graphs',
  name: 'Graph Traversal',
  phase: 3,
  estHours: 14,
  prerequisites: ['binary-trees', 'queues'],

  whyItMatters:
    'A graph is a tree that is allowed to have cycles and multiple parents, which means exactly one thing changes: you need a visited set. That single addition is the whole conceptual jump, and once you make it, everything from tree traversal transfers directly. Graphs then cover an enormous share of real interview questions, because almost any relationship — courses, friends, flights, grid cells, word transformations — is a graph once you name the nodes and edges.',

  fundamentals: [
    {
      heading: 'Name the nodes and the edges first',
      body:
        'Most graph problems do not look like graph problems. Before anything else, say out loud: what is a node, and what makes two nodes adjacent? In a grid, a node is a cell and neighbours are the four sides. In word ladder, a node is a word and an edge means one letter differs. In course scheduling, a node is a course and an edge is a prerequisite. Getting this sentence right IS solving the problem; the traversal afterwards is boilerplate.',
    },
    {
      heading: 'Build the adjacency list — do not work from the edge list',
      body:
        'Input usually arrives as an edge list, which is useless for traversal because finding a node\'s neighbours is O(E). Convert it once into an adjacency list in O(V + E) and every lookup becomes O(1). For an undirected graph add BOTH directions; forgetting the second is the most common silent bug in this topic, and it produces answers that are right on some components and wrong on others.',
      code: {
        cpp: `vector<vector<int>> adj(n);
for (auto& e : edges) {
  adj[e[0]].push_back(e[1]);
  adj[e[1]].push_back(e[0]);      // UNDIRECTED: both directions
}`,
        java: `List<List<Integer>> adj = new ArrayList<>();
for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
for (int[] e : edges) {
  adj.get(e[0]).add(e[1]);
  adj.get(e[1]).add(e[0]);
}`,
      },
      costs: [
        { op: 'build adjacency list', cost: 'O(V + E)', note: 'once, always worth it' },
        { op: 'DFS or BFS', cost: 'O(V + E)', note: 'every node and edge considered once' },
        { op: 'adjacency matrix lookup', cost: 'O(1)', note: 'but O(V^2) memory — only for dense graphs' },
        { op: 'recursion depth in DFS', cost: 'O(V)', note: 'a path graph of 10^5 nodes will overflow' },
      ],
    },
    {
      heading: 'Mark visited when you ENQUEUE, not when you dequeue',
      body:
        'In BFS, mark a node visited at the moment you push it into the queue. If you wait until you pop it, the same node can be enqueued many times by different neighbours before it is ever processed, and the queue blows up — quadratic behaviour on dense graphs, and it still returns the right answer, so it is easy to miss. Mark on push. Always.',
    },
    {
      heading: 'DFS or BFS — choose deliberately',
      body:
        'BFS explores in order of distance, so it finds the shortest path in an UNWEIGHTED graph. DFS goes deep and is the natural fit for connectivity, cycle detection, topological ordering and anything computed on the way back up. If the question says "fewest steps", "minimum moves" or "shortest", that is BFS and saying so immediately is worth credit. Also remember DFS recursion can overflow the stack on a 10^5-node path; an explicit stack or BFS is the safe answer at that scale.',
    },
  ],

  questionTypes: [
    {
      id: 'connected-components',
      name: 'Connected components and reachability',
      signal:
        '"How many groups", "are these two connected", "count the clusters". Launch a traversal from every unvisited node; the number of launches is the number of components.',
      time: 'O(V + E)',
      space: 'O(V)',
      template: {
        cpp: `vector<bool> seen(n, false);
int components = 0;

for (int start = 0; start < n; ++start) {
  if (seen[start]) continue;
  ++components;

  stack<int> st; st.push(start); seen[start] = true;
  while (!st.empty()) {
    int u = st.top(); st.pop();
    for (int v : adj[u])
      if (!seen[v]) { seen[v] = true; st.push(v); }   // mark on PUSH
  }
}`,
        java: `boolean[] seen = new boolean[n];
int components = 0;

for (int start = 0; start < n; start++) {
  if (seen[start]) continue;
  components++;

  Deque<Integer> st = new ArrayDeque<>();
  st.push(start); seen[start] = true;
  while (!st.isEmpty()) {
    int u = st.pop();
    for (int v : adj.get(u))
      if (!seen[v]) { seen[v] = true; st.push(v); }
  }
}`,
      },
      taught: {
        lc: 547,
        title: 'Number of Provinces',
        slug: 'number-of-provinces',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'The input is an adjacency MATRIX, not an edge list — cell [i][j] already tells you adjacency. Count how many traversals you must launch to cover every node.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'It is Number of Islands with the grid replaced by a real graph, so the component-counting idea transfers visibly from Phase 2 into graph vocabulary.',
        walkthrough: {
          howToSeeIt: [
            'Name the pieces. A node is a city; an edge exists when isConnected[i][j] is 1. A province is a connected component. The question is just "how many components?".',
            'Component counting always has the same shape: scan every node, and whenever you find one not yet visited, start a traversal and increment the counter. The traversal claims everything reachable.',
            'No adjacency list is needed here because the matrix already is one — neighbours of i are all j with isConnected[i][j] == 1. Scanning that row is O(n), so the total is O(n^2), which matches the input size.',
            'DFS or BFS both work; connectivity does not care about order. Union-find is the third option and is the better answer if edges arrive incrementally — mention it.',
          ],
          wherePeopleLoseIt:
            'Forgetting that the relation is symmetric and transitive: if A connects to B and B to C, all three are one province even with no direct A-C edge. Visiting only direct neighbours of each start node, rather than fully traversing, over-counts. The traversal must be exhaustive from each launch.',
          time: 'O(n^2) — the matrix is the graph.',
          space: 'O(n).',
          code: {
            cpp: `int findCircleNum(vector<vector<int>>& isConnected) {
  int n = (int)isConnected.size();
  vector<bool> seen(n, false);
  int provinces = 0;

  for (int start = 0; start < n; ++start) {
    if (seen[start]) continue;
    ++provinces;                                  // a new component begins here

    stack<int> st;
    st.push(start);
    seen[start] = true;

    while (!st.empty()) {
      int u = st.top(); st.pop();
      for (int v = 0; v < n; ++v) {
        if (isConnected[u][v] == 1 && !seen[v]) {
          seen[v] = true;                         // mark on push
          st.push(v);
        }
      }
    }
  }
  return provinces;
}`,
            java: `public int findCircleNum(int[][] isConnected) {
  int n = isConnected.length;
  boolean[] seen = new boolean[n];
  int provinces = 0;

  for (int start = 0; start < n; start++) {
    if (seen[start]) continue;
    provinces++;

    Deque<Integer> st = new ArrayDeque<>();
    st.push(start);
    seen[start] = true;

    while (!st.isEmpty()) {
      int u = st.pop();
      for (int v = 0; v < n; v++) {
        if (isConnected[u][v] == 1 && !seen[v]) {
          seen[v] = true;
          st.push(v);
        }
      }
    }
  }
  return provinces;
}`,
          },
          followUp: 'Cities get connected one at a time and you must report the count after each — that is union-find, because re-running the traversal per query is too slow.',
        },
      },
      practice: [
        {
          lc: 133,
          title: 'Clone Graph',
          slug: 'clone-graph',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'A map from original node to clone doubles as the visited set — one structure, two jobs. Same two-phase idea as copying a list with random pointers.',
          companies: ['google', 'meta'],
        },
        {
          lc: 2316,
          title: 'Count Unreachable Pairs of Nodes in an Undirected Graph',
          slug: 'count-unreachable-pairs-of-nodes-in-an-undirected-graph',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped: count component SIZES, then each component contributes size × (nodes outside it), halved. Use 64-bit — the pair count overflows int easily.',
        },
      ],
    },

    {
      id: 'bfs-shortest-unweighted',
      name: 'BFS for shortest path in an unweighted graph',
      signal:
        '"Fewest steps", "minimum moves", "shortest transformation". Every edge costs the same, so the first time BFS reaches a node it has reached it by a shortest path.',
      time: 'O(V + E)',
      space: 'O(V)',
      googleHeavy: true,
      template: {
        cpp: `queue<int> q;
vector<int> dist(n, -1);
q.push(start); dist[start] = 0;

while (!q.empty()) {
  int u = q.front(); q.pop();
  if (u == target) return dist[u];

  for (int v : neighbours(u)) {
    if (dist[v] != -1) continue;      // already reached, and reached no later
    dist[v] = dist[u] + 1;
    q.push(v);                        // mark (set dist) on PUSH
  }
}
return -1;`,
        java: `Queue<Integer> q = new ArrayDeque<>();
int[] dist = new int[n];
Arrays.fill(dist, -1);
q.add(start); dist[start] = 0;

while (!q.isEmpty()) {
  int u = q.poll();
  if (u == target) return dist[u];

  for (int v : neighbours(u)) {
    if (dist[v] != -1) continue;
    dist[v] = dist[u] + 1;
    q.add(v);
  }
}
return -1;`,
      },
      taught: {
        lc: 127,
        title: 'Word Ladder',
        slug: 'word-ladder',
        difficulty: 'hard',
        role: 'taught',
        estMinutes: 50,
        insight:
          'The graph is implicit: words are nodes and an edge means one letter differs. Never build all pairs — generate neighbours by mutating each position, which is O(26·L) per word.',
        companies: ['google', 'amazon', 'meta'],
        whyThisOne:
          'The clearest case of a problem that is a graph only once you name the nodes, and it punishes the O(n^2) edge-building instinct that makes it time out.',
        walkthrough: {
          howToSeeIt: [
            'Name the pieces: a node is a word, and two words are adjacent when they differ in exactly one position. "Shortest transformation sequence" is then literally shortest path, and every edge costs 1, so BFS.',
            'Do NOT build the edges by comparing all pairs — that is O(n^2 · L) and it is why most first attempts time out. Instead generate neighbours on demand: for each of the L positions try all 26 letters and keep the results present in the dictionary.',
            'Put the word list in a hash set so membership is O(1). The generated-neighbour cost is O(26 · L) per word, independent of dictionary size, which is the whole performance argument.',
            'Standard BFS from beginWord, tracking the level as the sequence length. Erase each word from the set the moment you enqueue it — that is the visited set, and it avoids a second structure.',
          ],
          wherePeopleLoseIt:
            'Building the adjacency by pairwise comparison. It is correct and it times out, and candidates often conclude the algorithm is wrong when only the neighbour generation was. Second: not removing words from the set on enqueue, which lets the same word enter the queue many times.',
          time: 'O(N · L · 26) where N is the dictionary size and L the word length.',
          space: 'O(N · L).',
          code: {
            cpp: `int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
  unordered_set<string> dict(wordList.begin(), wordList.end());
  if (!dict.count(endWord)) return 0;

  queue<string> q;
  q.push(beginWord);
  dict.erase(beginWord);
  int steps = 1;

  while (!q.empty()) {
    int levelSize = (int)q.size();               // level = sequence length

    for (int i = 0; i < levelSize; ++i) {
      string word = q.front(); q.pop();
      if (word == endWord) return steps;

      // Generate neighbours instead of precomputing edges.
      for (int p = 0; p < (int)word.size(); ++p) {
        char original = word[p];
        for (char c = 'a'; c <= 'z'; ++c) {
          if (c == original) continue;
          word[p] = c;

          if (dict.count(word)) {
            dict.erase(word);                    // visited = removed from the dict
            q.push(word);
          }
        }
        word[p] = original;                      // restore before the next position
      }
    }
    ++steps;
  }
  return 0;
}`,
            java: `public int ladderLength(String beginWord, String endWord, List<String> wordList) {
  Set<String> dict = new HashSet<>(wordList);
  if (!dict.contains(endWord)) return 0;

  Queue<String> q = new ArrayDeque<>();
  q.add(beginWord);
  dict.remove(beginWord);
  int steps = 1;

  while (!q.isEmpty()) {
    int levelSize = q.size();

    for (int i = 0; i < levelSize; i++) {
      String word = q.poll();
      if (word.equals(endWord)) return steps;

      char[] chars = word.toCharArray();
      for (int p = 0; p < chars.length; p++) {
        char original = chars[p];
        for (char c = 'a'; c <= 'z'; c++) {
          if (c == original) continue;
          chars[p] = c;

          String next = new String(chars);
          if (dict.remove(next)) q.add(next);
        }
        chars[p] = original;
      }
    }
    steps++;
  }
  return 0;
}`,
          },
          followUp: 'Bidirectional BFS — search from both ends and meet in the middle, roughly halving the exponent. It is the expected optimisation once the basic version works.',
        },
      },
      practice: [
        {
          lc: 1091,
          title: 'Shortest Path in Binary Matrix',
          slug: 'shortest-path-in-binary-matrix',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'Grid BFS with EIGHT directions. Mark on enqueue; marking on dequeue makes the queue blow up while still returning the right answer.',
        },
        {
          lc: 752,
          title: 'Open the Lock',
          slug: 'open-the-lock',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight: 'Flipped: nodes are 4-digit states and each has 8 neighbours. Deadends are simply pre-visited nodes — one line, no special handling.',
          companies: ['google'],
        },
      ],
    },

    {
      id: 'multi-source-bfs',
      name: 'Multi-source BFS',
      signal:
        '"Nearest X for EVERY cell", "spread from all sources simultaneously", "time until everything is reached". Seed the queue with every source at distance 0 and run one BFS.',
      time: 'O(V + E)',
      space: 'O(V)',
      googleHeavy: true,
      template: {
        cpp: `queue<pair<int,int>> q;
for (every source s) { q.push(s); dist[s] = 0; }   // ALL sources start at distance 0

while (!q.empty()) {
  auto [r, c] = q.front(); q.pop();
  for (auto [nr, nc] : neighbours(r, c)) {
    if (dist[nr][nc] != -1) continue;
    dist[nr][nc] = dist[r][c] + 1;
    q.push({nr, nc});
  }
}`,
        java: `Queue<int[]> q = new ArrayDeque<>();
// seed every source with distance 0, then one ordinary BFS`,
      },
      taught: {
        lc: 994,
        title: 'Rotting Oranges',
        slug: 'rotting-oranges',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 35,
        insight:
          'Running a separate BFS per source is O(sources × cells). Seeding every source into the queue at distance 0 makes one BFS compute all the distances at once.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'It makes the multi-source idea obvious — rot genuinely does spread from every rotten orange at the same time — and that framing transfers to every nearest-X problem.',
        walkthrough: {
          howToSeeIt: [
            'Name the pieces: a node is a cell, edges join the four neighbours, and one minute is one BFS level. So "minutes until nothing fresh remains" is the maximum distance from any rotten orange.',
            'The naive plan runs BFS from each rotten orange and takes minimums, which is far too slow. But notice all rot starts simultaneously, so the answer is distance to the NEAREST source.',
            'That is exactly what a single BFS computes if every source begins in the queue at distance 0. The frontier then expands from all of them at once and the first arrival at any cell is its nearest-source distance.',
            'Count fresh oranges up front, decrement as each is reached, and at the end return -1 if any remain unreachable. The answer is the last level number, which is one less than the number of levels processed.',
          ],
          wherePeopleLoseIt:
            'Returning the level count rather than the level number — with only one starting rotten orange and one fresh neighbour, the answer is 1 minute, not 2. Second: forgetting the unreachable check and returning a time when some fresh oranges are walled off.',
          time: 'O(R·C).',
          space: 'O(R·C).',
          code: {
            cpp: `int orangesRotting(vector<vector<int>>& grid) {
  int R = (int)grid.size(), C = (int)grid[0].size();
  queue<pair<int,int>> q;
  int fresh = 0;

  for (int r = 0; r < R; ++r)
    for (int c = 0; c < C; ++c) {
      if (grid[r][c] == 2) q.push({r, c});     // EVERY source seeded at time 0
      else if (grid[r][c] == 1) ++fresh;
    }

  if (fresh == 0) return 0;                    // nothing to rot

  int minutes = 0;
  const int dr[4] = {-1, 1, 0, 0}, dc[4] = {0, 0, -1, 1};

  while (!q.empty() && fresh > 0) {
    int levelSize = (int)q.size();
    ++minutes;                                 // one level = one minute

    for (int i = 0; i < levelSize; ++i) {
      auto [r, c] = q.front(); q.pop();

      for (int d = 0; d < 4; ++d) {
        int nr = r + dr[d], nc = c + dc[d];
        if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
        if (grid[nr][nc] != 1) continue;

        grid[nr][nc] = 2;                      // mark on push
        --fresh;
        q.push({nr, nc});
      }
    }
  }
  return fresh == 0 ? minutes : -1;            // walled-off oranges => -1
}`,
            java: `public int orangesRotting(int[][] grid) {
  int R = grid.length, C = grid[0].length;
  Queue<int[]> q = new ArrayDeque<>();
  int fresh = 0;

  for (int r = 0; r < R; r++)
    for (int c = 0; c < C; c++) {
      if (grid[r][c] == 2) q.add(new int[]{r, c});
      else if (grid[r][c] == 1) fresh++;
    }

  if (fresh == 0) return 0;

  int minutes = 0;
  int[][] dirs = {{-1,0},{1,0},{0,-1},{0,1}};

  while (!q.isEmpty() && fresh > 0) {
    int levelSize = q.size();
    minutes++;

    for (int i = 0; i < levelSize; i++) {
      int[] cur = q.poll();

      for (int[] d : dirs) {
        int nr = cur[0] + d[0], nc = cur[1] + d[1];
        if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
        if (grid[nr][nc] != 1) continue;

        grid[nr][nc] = 2;
        fresh--;
        q.add(new int[]{nr, nc});
      }
    }
  }
  return fresh == 0 ? minutes : -1;
}`,
          },
          followUp: 'If different sources spread at different speeds, BFS no longer applies and you need Dijkstra — a clean illustration of why equal edge weights matter.',
        },
      },
      practice: [
        {
          lc: 542,
          title: '01 Matrix',
          slug: '01-matrix',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'Distance to the nearest 0 for every cell. Seed all zeros at once — BFS from each 1 separately is the trap this problem is built to punish.',
          companies: ['google', 'meta'],
        },
        {
          lc: 1162,
          title: 'As Far from Land as Possible',
          slug: 'as-far-from-land-as-possible',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'Flipped: you want the MAXIMUM of the nearest-source distances, so seed all land and take the last level reached.',
        },
      ],
    },

    {
      id: 'bipartite-coloring',
      name: 'Two-colouring and conflict detection',
      signal:
        '"Split into two groups", "can these people be separated", "is this graph bipartite". Colour as you traverse; a neighbour that already has YOUR colour is a contradiction.',
      time: 'O(V + E)',
      space: 'O(V)',
      template: {
        cpp: `vector<int> color(n, 0);                 // 0 = uncoloured, 1 and -1 = the two sides

for (int start = 0; start < n; ++start) {
  if (color[start] != 0) continue;
  color[start] = 1;

  queue<int> q; q.push(start);
  while (!q.empty()) {
    int u = q.front(); q.pop();
    for (int v : adj[u]) {
      if (color[v] == color[u]) return false;         // same side: contradiction
      if (color[v] == 0) { color[v] = -color[u]; q.push(v); }
    }
  }
}
return true;`,
        java: `int[] color = new int[n];

for (int start = 0; start < n; start++) {
  if (color[start] != 0) continue;
  color[start] = 1;

  Queue<Integer> q = new ArrayDeque<>();
  q.add(start);
  while (!q.isEmpty()) {
    int u = q.poll();
    for (int v : adj.get(u)) {
      if (color[v] == color[u]) return false;
      if (color[v] == 0) { color[v] = -color[u]; q.add(v); }
    }
  }
}
return true;`,
      },
      taught: {
        lc: 785,
        title: 'Is Graph Bipartite?',
        slug: 'is-graph-bipartite',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 35,
        insight:
          'Assign colours during the traversal and check every edge as you cross it. A graph is bipartite exactly when it contains no odd-length cycle, and this detects that without ever finding the cycle.',
        companies: ['google', 'meta'],
        whyThisOne:
          'It shows a traversal computing a property rather than a distance, and the disconnected-graph requirement catches candidates who only ever start from node 0.',
        walkthrough: {
          howToSeeIt: [
            'Restate it: can every node be put in one of two groups so that no edge joins two nodes in the same group? That is a colouring question, and it can be answered greedily — once a node has a colour, all its neighbours are forced.',
            'So traverse, and colour each newly discovered node the opposite of the node you came from. There is no choice to make, which is why no backtracking is needed.',
            'The check is on every edge, including edges to already-coloured nodes: if a neighbour shares your colour, two adjacent nodes are on the same side and the graph is not bipartite.',
            'Loop over ALL nodes as potential starts. The graph may be disconnected, and a violation can hide in a component unreachable from node 0.',
          ],
          wherePeopleLoseIt:
            'Starting only from node 0 and reporting true for a disconnected graph whose second component is not bipartite. The other trap is using 0 as a colour when it also means uncoloured — use 1 and -1 for the sides so the negation trick works and 0 stays unambiguous.',
          time: 'O(V + E).',
          space: 'O(V).',
          code: {
            cpp: `bool isBipartite(vector<vector<int>>& graph) {
  int n = (int)graph.size();
  vector<int> color(n, 0);            // 0 uncoloured, 1 / -1 the two sides

  for (int start = 0; start < n; ++start) {
    if (color[start] != 0) continue;  // every component must be checked

    color[start] = 1;
    queue<int> q; q.push(start);

    while (!q.empty()) {
      int u = q.front(); q.pop();

      for (int v : graph[u]) {
        if (color[v] == color[u]) return false;      // conflict on this edge
        if (color[v] == 0) {
          color[v] = -color[u];                      // forced opposite colour
          q.push(v);
        }
      }
    }
  }
  return true;
}`,
            java: `public boolean isBipartite(int[][] graph) {
  int n = graph.length;
  int[] color = new int[n];

  for (int start = 0; start < n; start++) {
    if (color[start] != 0) continue;

    color[start] = 1;
    Queue<Integer> q = new ArrayDeque<>();
    q.add(start);

    while (!q.isEmpty()) {
      int u = q.poll();

      for (int v : graph[u]) {
        if (color[v] == color[u]) return false;
        if (color[v] == 0) { color[v] = -color[u]; q.add(v); }
      }
    }
  }
  return true;
}`,
          },
          followUp: 'Return the two groups, not just a boolean — and explain the equivalence: a graph is bipartite if and only if it has no odd-length cycle.',
        },
      },
      practice: [
        {
          lc: 886,
          title: 'Possible Bipartition',
          slug: 'possible-bipartition',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight: 'Identical problem behind a story — build the adjacency list from the dislike pairs first. Recognising the disguise is the exercise.',
        },
        {
          lc: 1042,
          title: 'Flower Planting With No Adjacent',
          slug: 'flower-planting-with-no-adjacent',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped: FOUR colours and a guarantee of at most three neighbours, so a greedy first-available colour always works. No conflict is ever possible — understand why.',
        },
      ],
    },

    {
      id: 'graph-dfs-memo',
      name: 'DFS with memoisation on a graph',
      signal:
        '"Longest path in a DAG", "can I reach the end from here", "how many paths". The answer for a node depends only on the node, so cache it — that turns exponential into linear.',
      time: 'O(V + E)',
      space: 'O(V)',
      googleHeavy: true,
      template: {
        cpp: `vector<int> memo(n, -1);

int best(int u) {
  if (memo[u] != -1) return memo[u];

  int result = 1;                                // count the node itself
  for (int v : adj[u]) result = max(result, 1 + best(v));

  return memo[u] = result;
}`,
        java: `int[] memo = new int[n];
Arrays.fill(memo, -1);

int best(int u) {
  if (memo[u] != -1) return memo[u];

  int result = 1;
  for (int v : adj.get(u)) result = Math.max(result, 1 + best(v));

  return memo[u] = result;
}`,
      },
      taught: {
        lc: 329,
        title: 'Longest Increasing Path in a Matrix',
        slug: 'longest-increasing-path-in-a-matrix',
        difficulty: 'hard',
        role: 'taught',
        estMinutes: 45,
        insight:
          'Because the path must strictly increase, the graph has no cycles — so no visited set is needed and each cell\'s answer can be cached forever.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'It is the cleanest bridge from graph traversal into dynamic programming: the acyclicity argument is what makes memoisation legal, and that reasoning is the whole lesson.',
        walkthrough: {
          howToSeeIt: [
            'Name the graph: a node is a cell, and an edge goes from a cell to a strictly LARGER neighbour. Because values strictly increase along every edge, no cycle can exist — the graph is a DAG.',
            'That matters enormously. Without cycles you need no visited set during the DFS, and a cell\'s longest path depends only on the cell itself, never on how you arrived.',
            'So define f(cell) as the longest increasing path starting there: 1 plus the best among larger neighbours. Plain recursion recomputes shared suffixes exponentially.',
            'Cache f per cell and each is computed once: O(R·C) total, since each cell examines four neighbours. The overall answer is the maximum of f over all cells.',
          ],
          wherePeopleLoseIt:
            'Adding a visited set out of graph habit. It is unnecessary here and, worse, it makes results depend on traversal order, so the cache becomes invalid and answers come out too small. The acyclicity argument is what licenses the cache — state it before writing the code.',
          time: 'O(R·C) — each cell computed once.',
          space: 'O(R·C) for the memo and recursion.',
          code: {
            cpp: `class Solution {
  int R, C;
  vector<vector<int>> memo;
  const int dr[4] = {-1, 1, 0, 0}, dc[4] = {0, 0, -1, 1};

  int best(vector<vector<int>>& g, int r, int c) {
    if (memo[r][c] != 0) return memo[r][c];

    int result = 1;                             // the cell alone is a path of length 1
    for (int d = 0; d < 4; ++d) {
      int nr = r + dr[d], nc = c + dc[d];
      if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
      if (g[nr][nc] <= g[r][c]) continue;       // edges only go to strictly larger

      result = max(result, 1 + best(g, nr, nc));  // no visited set: the graph is acyclic
    }
    return memo[r][c] = result;
  }

public:
  int longestIncreasingPath(vector<vector<int>>& matrix) {
    if (matrix.empty()) return 0;
    R = (int)matrix.size(); C = (int)matrix[0].size();
    memo.assign(R, vector<int>(C, 0));

    int answer = 0;
    for (int r = 0; r < R; ++r)
      for (int c = 0; c < C; ++c)
        answer = max(answer, best(matrix, r, c));

    return answer;
  }
};`,
            java: `class Solution {
  private int[][] memo;
  private final int[][] dirs = {{-1,0},{1,0},{0,-1},{0,1}};

  public int longestIncreasingPath(int[][] matrix) {
    if (matrix.length == 0) return 0;
    memo = new int[matrix.length][matrix[0].length];

    int answer = 0;
    for (int r = 0; r < matrix.length; r++)
      for (int c = 0; c < matrix[0].length; c++)
        answer = Math.max(answer, best(matrix, r, c));

    return answer;
  }

  private int best(int[][] g, int r, int c) {
    if (memo[r][c] != 0) return memo[r][c];

    int result = 1;
    for (int[] d : dirs) {
      int nr = r + d[0], nc = c + d[1];
      if (nr < 0 || nr >= g.length || nc < 0 || nc >= g[0].length) continue;
      if (g[nr][nc] <= g[r][c]) continue;

      result = Math.max(result, 1 + best(g, nr, nc));
    }
    return memo[r][c] = result;
  }
}`,
          },
          followUp: 'Solve it with topological sort instead — peel cells in increasing value order and the recursion disappears entirely.',
        },
      },
      practice: [
        {
          lc: 417,
          title: 'Pacific Atlantic Water Flow',
          slug: 'pacific-atlantic-water-flow',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight: 'Invert the flow: start from each ocean border and walk UPHILL. Two reachability sets, and the answer is their intersection.',
          companies: ['google', 'amazon'],
        },
        {
          lc: 1462,
          title: 'Course Schedule IV',
          slug: 'course-schedule-iv',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight:
            'Flipped to reachability between all pairs: either memoised DFS per query or Floyd-Warshall over booleans. Comparing the two is the point.',
        },
      ],
    },
  ],
};
