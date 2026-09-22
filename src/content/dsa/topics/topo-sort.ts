import type { Topic } from '../../schema';

export const topoSort: Topic = {
  id: 'topo-sort',
  name: 'Topological Sort',
  phase: 3,
  estHours: 8,
  prerequisites: ['graphs'],

  whyItMatters:
    'Any question about ordering things with dependencies — course prerequisites, build systems, task schedulers, package managers, spreadsheet recalculation — is a topological sort. It is also the standard way to detect a cycle in a directed graph, because a valid ordering exists if and only if there is no cycle. Two implementations cover everything, and knowing when each is preferable is the whole topic.',

  fundamentals: [
    {
      heading: 'What a topological order actually promises',
      body:
        'A linear ordering of the nodes such that every directed edge u to v places u before v. It exists only for a DAG — a directed acyclic graph — and it is usually not unique. That non-uniqueness matters: if a problem demands a specific order, such as lexicographically smallest, plain Kahn\'s algorithm is not enough and you need a priority queue instead of a plain queue.',
      costs: [
        { op: 'Kahn (BFS)', cost: 'O(V + E)', note: 'iterative, detects cycles by counting output' },
        { op: 'DFS-based', cost: 'O(V + E)', note: 'order is the reverse of finish times' },
        { op: 'lexicographically smallest order', cost: 'O(V log V + E)', note: 'Kahn with a min-heap' },
      ],
    },
    {
      heading: 'Get the edge direction right, every time',
      body:
        'This is where most of the errors in this topic come from. "To take course B you must first take A" means the edge runs A to B, and B\'s in-degree increases. Read the input format carefully: LeetCode\'s prerequisite pairs are given as [course, prerequisite], which is the REVERSE of the edge direction. Write down one concrete example before coding — reversed edges produce a confidently wrong answer that still looks like a valid ordering.',
      code: {
        cpp: `vector<vector<int>> adj(n);
vector<int> indegree(n, 0);

for (auto& p : prerequisites) {
  int course = p[0], prereq = p[1];   // pair is [course, prereq]
  adj[prereq].push_back(course);      // edge goes prereq -> course
  ++indegree[course];                 // the COURSE gains the dependency
}`,
        java: `List<List<Integer>> adj = new ArrayList<>();
int[] indegree = new int[n];

for (int[] p : prerequisites) {
  adj.get(p[1]).add(p[0]);
  indegree[p[0]]++;
}`,
      },
    },
    {
      heading: 'Kahn\'s algorithm, and why the count detects cycles',
      body:
        'Repeatedly take any node with in-degree zero — nothing depends on it being done later — output it, and decrement the in-degree of everything it points to. If you finish having output fewer than V nodes, the remainder all had a nonzero in-degree forever, which can only happen if they form a cycle. That count check is the cleanest cycle detection in directed graphs, and it comes free.',
    },
    {
      heading: 'The DFS alternative: reverse finish order',
      body:
        'Run DFS and push each node onto a list AFTER exploring all its descendants. Reversing that list yields a topological order, because a node finishes only once everything it depends on has finished. Cycle detection needs three colours — white unvisited, grey in progress, black done — and meeting a GREY node means a back edge, hence a cycle. Meeting a black node is fine and merely means you already handled it.',
    },
  ],

  questionTypes: [
    {
      id: 'kahn',
      name: 'Kahn\'s algorithm (BFS peeling)',
      signal:
        '"Can all tasks be finished", "return a valid order", "detect a cycle in a directed graph". Peel off in-degree-zero nodes layer by layer.',
      time: 'O(V + E)',
      space: 'O(V + E)',
      googleHeavy: true,
      template: {
        cpp: `queue<int> q;
for (int i = 0; i < n; ++i) if (indegree[i] == 0) q.push(i);

vector<int> order;
while (!q.empty()) {
  int u = q.front(); q.pop();
  order.push_back(u);

  for (int v : adj[u])
    if (--indegree[v] == 0) q.push(v);      // v is now unblocked
}

if ((int)order.size() != n) return {};      // fewer than n => a cycle exists`,
        java: `Queue<Integer> q = new ArrayDeque<>();
for (int i = 0; i < n; i++) if (indegree[i] == 0) q.add(i);

List<Integer> order = new ArrayList<>();
while (!q.isEmpty()) {
  int u = q.poll();
  order.add(u);

  for (int v : adj.get(u))
    if (--indegree[v] == 0) q.add(v);
}

if (order.size() != n) return new int[0];`,
      },
      taught: {
        lc: 207,
        title: 'Course Schedule',
        slug: 'course-schedule',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 35,
        insight:
          'You can finish every course exactly when the graph has no cycle. Peel off courses with no outstanding prerequisites; if anything is left over, those courses depend on each other in a loop.',
        companies: ['google', 'amazon', 'meta', 'microsoft'],
        whyThisOne:
          'The canonical topological sort, and the count-versus-V cycle check is one of the tidiest ideas in graph algorithms — no extra colouring, no extra pass.',
        walkthrough: {
          howToSeeIt: [
            'Name the graph: a node is a course, and an edge runs from a prerequisite to the course that needs it. "Can all courses be finished?" becomes "is this graph acyclic?".',
            'Compute the in-degree of every node — how many prerequisites each course is still waiting on. Courses with in-degree 0 can be taken immediately, so seed the queue with all of them.',
            'Take a course, output it, and decrement the in-degree of everything that depended on it. When any of those reaches 0, it is now unblocked and joins the queue.',
            'At the end, compare how many courses you output with the total. Fewer means the rest never reached in-degree 0, which is only possible inside a cycle. That single comparison is the answer.',
          ],
          wherePeopleLoseIt:
            'Reversing the edge direction. The input pair is [course, prerequisite], so the edge is prerequisite to course — writing it the other way builds the reverse graph and detects cycles that are not there. Second: pushing a node when its in-degree merely decreases rather than when it hits exactly 0, which enqueues it repeatedly.',
          time: 'O(V + E).',
          space: 'O(V + E).',
          code: {
            cpp: `bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
  vector<vector<int>> adj(numCourses);
  vector<int> indegree(numCourses, 0);

  for (auto& p : prerequisites) {
    int course = p[0], prereq = p[1];      // [course, prereq]
    adj[prereq].push_back(course);         // edge: prereq -> course
    ++indegree[course];
  }

  queue<int> q;
  for (int i = 0; i < numCourses; ++i)
    if (indegree[i] == 0) q.push(i);       // nothing blocks these

  int taken = 0;
  while (!q.empty()) {
    int u = q.front(); q.pop();
    ++taken;

    for (int v : adj[u])
      if (--indegree[v] == 0) q.push(v);   // push only when it hits exactly 0
  }

  return taken == numCourses;              // leftovers => a cycle
}`,
            java: `public boolean canFinish(int numCourses, int[][] prerequisites) {
  List<List<Integer>> adj = new ArrayList<>();
  for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
  int[] indegree = new int[numCourses];

  for (int[] p : prerequisites) {
    adj.get(p[1]).add(p[0]);
    indegree[p[0]]++;
  }

  Queue<Integer> q = new ArrayDeque<>();
  for (int i = 0; i < numCourses; i++)
    if (indegree[i] == 0) q.add(i);

  int taken = 0;
  while (!q.isEmpty()) {
    int u = q.poll();
    taken++;

    for (int v : adj.get(u))
      if (--indegree[v] == 0) q.add(v);
  }

  return taken == numCourses;
}`,
          },
          followUp: 'Return the actual order (LC 210) — collect the nodes as you pop them. Then: return the lexicographically smallest valid order, which needs a min-heap instead of a queue.',
        },
      },
      practice: [
        {
          lc: 210,
          title: 'Course Schedule II',
          slug: 'course-schedule-ii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'Identical algorithm, but collect the popped nodes. Return an empty array when the collected count falls short — the same cycle check, reused.',
          companies: ['google', 'amazon', 'meta'],
        },
        {
          lc: 2115,
          title: 'Find All Possible Recipes from Given Supplies',
          slug: 'find-all-possible-recipes-from-given-supplies',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight:
            'Flipped: the nodes are strings and some ingredients are supplied for free. Seed the queue with the supplies and only count in-degrees for ingredients that are themselves recipes.',
        },
      ],
    },

    {
      id: 'dfs-topo',
      name: 'DFS ordering and three-colour cycle detection',
      signal:
        'You need the order computed on the way BACK from the recursion, or you must distinguish "currently on the stack" from "already finished". Three colours: white, grey, black.',
      time: 'O(V + E)',
      space: 'O(V)',
      template: {
        cpp: `enum { WHITE, GREY, BLACK };
vector<int> color(n, WHITE);
vector<int> order;

bool dfs(int u) {
  color[u] = GREY;                       // on the current recursion stack

  for (int v : adj[u]) {
    if (color[v] == GREY) return false;  // back edge => cycle
    if (color[v] == WHITE && !dfs(v)) return false;
  }

  color[u] = BLACK;                      // fully explored
  order.push_back(u);                    // push AFTER descendants
  return true;
}
// reverse(order) is a topological ordering`,
        java: `int[] color = new int[n];    // 0 white, 1 grey, 2 black
List<Integer> order = new ArrayList<>();

boolean dfs(int u) {
  color[u] = 1;

  for (int v : adj.get(u)) {
    if (color[v] == 1) return false;
    if (color[v] == 0 && !dfs(v)) return false;
  }

  color[u] = 2;
  order.add(u);
  return true;
}`,
      },
      taught: {
        lc: 802,
        title: 'Find Eventual Safe States',
        slug: 'find-eventual-safe-states',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          'A node is safe when every path from it reaches a terminal node. Three-colour DFS answers that directly: grey means you are back on your own path, which is a cycle and therefore unsafe.',
        companies: ['google'],
        whyThisOne:
          'It forces the grey-versus-black distinction to matter. A two-state visited array cannot tell "on my current path" from "already known safe", and that gap is precisely what this problem exposes.',
        walkthrough: {
          howToSeeIt: [
            'Restate: a node is unsafe when some path from it can loop forever, which means it can reach a cycle. So the task is per-node cycle reachability, not mere cycle existence.',
            'A simple visited array is not enough. Seeing an already-visited node tells you nothing — it might be a safe node you finished earlier, or a node still open on your current path, which would be a cycle.',
            'Three colours resolve it. WHITE is untouched. GREY means the node is on the current recursion stack, so meeting grey is a back edge and a genuine cycle. BLACK means fully explored and already proven safe.',
            'A node turns BLACK only after all its successors come back safe. Any grey encounter propagates failure up, and those nodes stay unsafe. Collect the black nodes in ascending order for the answer.',
          ],
          wherePeopleLoseIt:
            'Collapsing grey and black into one visited flag, which reports cycles that are not there — revisiting a finished safe node is completely fine. The two states mean different things and both are needed. Note also that a node left grey after a failed branch must NOT be reset to white, or exponential re-exploration follows.',
          time: 'O(V + E).',
          space: 'O(V).',
          code: {
            cpp: `class Solution {
  vector<int> color;                    // 0 white, 1 grey (on stack), 2 black (safe)

  bool safe(vector<vector<int>>& graph, int u) {
    if (color[u] == 1) return false;    // grey: back on my own path => cycle
    if (color[u] == 2) return true;     // black: already proven safe

    color[u] = 1;                       // enter the stack
    for (int v : graph[u])
      if (!safe(graph, v)) return false;

    color[u] = 2;                       // all successors safe => this node is safe
    return true;
  }

public:
  vector<int> eventualSafeNodes(vector<vector<int>>& graph) {
    int n = (int)graph.size();
    color.assign(n, 0);

    vector<int> out;
    for (int u = 0; u < n; ++u)
      if (safe(graph, u)) out.push_back(u);   // ascending by construction

    return out;
  }
};`,
            java: `class Solution {
  private int[] color;

  public List<Integer> eventualSafeNodes(int[][] graph) {
    color = new int[graph.length];

    List<Integer> out = new ArrayList<>();
    for (int u = 0; u < graph.length; u++)
      if (safe(graph, u)) out.add(u);

    return out;
  }

  private boolean safe(int[][] graph, int u) {
    if (color[u] == 1) return false;
    if (color[u] == 2) return true;

    color[u] = 1;
    for (int v : graph[u])
      if (!safe(graph, v)) return false;

    color[u] = 2;
    return true;
  }
}`,
          },
          followUp: 'Solve it with Kahn on the REVERSED graph — peel nodes with out-degree zero. Seeing both views of the same problem is the real prize here.',
        },
      },
      practice: [
        {
          lc: 310,
          title: 'Minimum Height Trees',
          slug: 'minimum-height-trees',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 45,
          insight:
            'Peel leaves layer by layer, like Kahn on an undirected graph with degree 1 as the trigger. The last one or two nodes remaining are the centroids.',
          companies: ['google'],
        },
        {
          lc: 2192,
          title: 'All Ancestors of a Node in a Directed Acyclic Graph',
          slug: 'all-ancestors-of-a-node-in-a-directed-acyclic-graph',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight: 'Flipped: run a traversal FROM each node and record it as an ancestor of everything reached. Starting from ancestors keeps the results sorted for free.',
        },
      ],
    },

    {
      id: 'topo-with-state',
      name: 'Topological order carrying accumulated state',
      signal:
        'You need more than the order — the longest chain, a maximum count along paths, or the number of semesters. Process in topological order and propagate a value along each edge.',
      time: 'O(V + E) or O(V·K + E)',
      space: 'O(V)',
      template: {
        cpp: `vector<int> depth(n, 0);           // or any accumulated quantity

queue<int> q;
for (int i = 0; i < n; ++i) if (indegree[i] == 0) { q.push(i); depth[i] = 1; }

int processed = 0, answer = 0;
while (!q.empty()) {
  int u = q.front(); q.pop();
  ++processed;
  answer = max(answer, depth[u]);

  for (int v : adj[u]) {
    depth[v] = max(depth[v], depth[u] + 1);   // relax along the edge
    if (--indegree[v] == 0) q.push(v);
  }
}
if (processed != n) return -1;                // cycle`,
        java: `int[] depth = new int[n];

Queue<Integer> q = new ArrayDeque<>();
for (int i = 0; i < n; i++) if (indegree[i] == 0) { q.add(i); depth[i] = 1; }

int processed = 0, answer = 0;
while (!q.isEmpty()) {
  int u = q.poll();
  processed++;
  answer = Math.max(answer, depth[u]);

  for (int v : adj.get(u)) {
    depth[v] = Math.max(depth[v], depth[u] + 1);
    if (--indegree[v] == 0) q.add(v);
  }
}`,
      },
      taught: {
        lc: 1857,
        title: 'Largest Color Value in a Directed Graph',
        slug: 'largest-color-value-in-a-directed-graph',
        difficulty: 'hard',
        role: 'taught',
        estMinutes: 55,
        insight:
          'Carry 26 running counts per node instead of one number. In topological order, a node\'s best counts are the element-wise maximum over its predecessors, plus one for its own colour.',
        companies: ['google'],
        whyThisOne:
          'It shows topological order as a DP evaluation order — once nodes are processed in dependency order, every predecessor is already final, which is exactly what makes the relaxation correct.',
        walkthrough: {
          howToSeeIt: [
            'Trying every path is exponential. But notice the answer for a node depends only on the answers of its PREDECESSORS, which is a recurrence — so this is DP on a graph, and topological order is the evaluation order that makes it valid.',
            'The state cannot be one number, because the best path for colour A may differ from the best for colour B. So each node carries a vector of 26 counts: the maximum occurrences of each colour along any path ending there.',
            'Relax along each edge: for the target node, take the element-wise maximum against the source\'s counts. After processing the source\'s own colour increment, every one of its outgoing edges can safely push its final values.',
            'Cycle check as usual — if fewer than V nodes are processed, return -1. The answer is the maximum entry across all count vectors.',
          ],
          wherePeopleLoseIt:
            'Incrementing the node\'s own colour at the wrong time. Add it when the node is POPPED, after its counts are final from all predecessors, not while relaxing into it. Incrementing during relaxation double-counts along diamond-shaped paths. Also note the memory: 26 ints per node is fine here, but say the number out loud before committing.',
          time: 'O(26 · (V + E)).',
          space: 'O(26 · V).',
          code: {
            cpp: `int largestPathValue(string colors, vector<vector<int>>& edges) {
  int n = (int)colors.size();
  vector<vector<int>> adj(n);
  vector<int> indegree(n, 0);

  for (auto& e : edges) {
    adj[e[0]].push_back(e[1]);
    ++indegree[e[1]];
  }

  vector<array<int,26>> count(n, array<int,26>{});   // per-node colour maxima

  queue<int> q;
  for (int i = 0; i < n; ++i) if (indegree[i] == 0) q.push(i);

  int processed = 0, answer = 0;
  while (!q.empty()) {
    int u = q.front(); q.pop();
    ++processed;

    ++count[u][colors[u] - 'a'];            // add own colour ONCE, when final
    answer = max(answer, count[u][colors[u] - 'a']);

    for (int v : adj[u]) {
      for (int c = 0; c < 26; ++c)
        count[v][c] = max(count[v][c], count[u][c]);   // element-wise max

      if (--indegree[v] == 0) q.push(v);
    }
  }
  return processed == n ? answer : -1;       // cycle => -1
}`,
            java: `public int largestPathValue(String colors, int[][] edges) {
  int n = colors.length();
  List<List<Integer>> adj = new ArrayList<>();
  for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
  int[] indegree = new int[n];

  for (int[] e : edges) {
    adj.get(e[0]).add(e[1]);
    indegree[e[1]]++;
  }

  int[][] count = new int[n][26];

  Queue<Integer> q = new ArrayDeque<>();
  for (int i = 0; i < n; i++) if (indegree[i] == 0) q.add(i);

  int processed = 0, answer = 0;
  while (!q.isEmpty()) {
    int u = q.poll();
    processed++;

    int own = colors.charAt(u) - 'a';
    count[u][own]++;
    answer = Math.max(answer, count[u][own]);

    for (int v : adj.get(u)) {
      for (int c = 0; c < 26; c++)
        count[v][c] = Math.max(count[v][c], count[u][c]);

      if (--indegree[v] == 0) q.add(v);
    }
  }
  return processed == n ? answer : -1;
}`,
          },
        },
      },
      practice: [
        {
          lc: 1136,
          title: 'Parallel Courses',
          slug: 'parallel-courses',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'Each BFS LEVEL is one semester, since everything in a level is independent. Level-count topological sort, nothing more.',
        },
        {
          lc: 630,
          title: 'Course Schedule III',
          slug: 'course-schedule-iii',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 45,
          insight:
            'Flipped: no graph at all. Sort by deadline and keep a max-heap of chosen durations, dropping the longest when you overrun. A greedy that only LOOKS like this topic.',
          companies: ['google'],
        },
      ],
    },
  ],
};
