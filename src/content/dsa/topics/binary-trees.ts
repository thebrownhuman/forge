import type { Topic } from '../../schema';

export const binaryTrees: Topic = {
  id: 'binary-trees',
  name: 'Binary Trees',
  phase: 2,
  estHours: 18,
  prerequisites: ['recursion', 'queues'],

  whyItMatters:
    'Trees are the most-asked topic at every large company, and they are the topic most people claim not to understand. The reason is usually not recursion itself but one missing distinction: whether information flows DOWN the tree as parameters or UP as return values. Once you can name which direction a problem needs, almost every tree question collapses into one of six shapes.',

  fundamentals: [
    {
      heading: 'The only two directions information can flow',
      body:
        'TOP-DOWN: the answer at a node depends on its ancestors, so you pass state down as parameters — a running path sum, a valid range, a maximum seen so far. BOTTOM-UP: the answer at a node depends on its children, so each call RETURNS a value and the parent combines them — height, diameter, whether a subtree is balanced. Before writing any tree function, say which one this problem is. That single sentence prevents most tree bugs.',
      code: {
        cpp: `// TOP-DOWN: state flows down as parameters
void down(TreeNode* node, int runningSum) {
  if (!node) return;
  down(node->left,  runningSum + node->val);
  down(node->right, runningSum + node->val);
}

// BOTTOM-UP: values flow up as returns
int up(TreeNode* node) {
  if (!node) return 0;                          // base case defines the identity
  int L = up(node->left), R = up(node->right);
  return 1 + max(L, R);                         // combine, then hand upward
}`,
        java: `void down(TreeNode node, int runningSum) {
  if (node == null) return;
  down(node.left,  runningSum + node.val);
  down(node.right, runningSum + node.val);
}

int up(TreeNode node) {
  if (node == null) return 0;
  int L = up(node.left), R = up(node.right);
  return 1 + Math.max(L, R);
}`,
      },
    },
    {
      heading: 'The base case is the whole design',
      body:
        'Almost every tree recursion starts with if (!node) return SOMETHING, and choosing that something correctly is most of the work. Height returns 0. Sum returns 0. Maximum returns negative infinity. "Is this valid" returns true, because an empty tree is vacuously valid. Get the identity value right and the rest of the function usually writes itself; get it wrong and the bug appears only at the leaves.',
    },
    {
      heading: 'Traversal orders, and what each is for',
      body:
        'PREORDER (node, left, right) processes a node before its children — use it for copying a tree or serialising one. INORDER (left, node, right) visits a BST in sorted order, which is the single most useful fact in the next topic. POSTORDER (left, right, node) processes children first — use it whenever you must compute something about subtrees before the node, such as deleting a tree or computing heights. LEVEL ORDER is BFS with a queue.',
      costs: [
        { op: 'any full traversal', cost: 'O(n)', note: 'every node visited once' },
        { op: 'recursion stack', cost: 'O(h)', note: 'h = height: O(log n) balanced, O(n) skewed' },
        { op: 'BFS queue', cost: 'O(w)', note: 'w = maximum width, up to n/2 at the last level' },
      ],
    },
    {
      heading: 'Returning two things at once',
      body:
        'Many problems need a subtree to report more than one fact — its height AND whether it is balanced, or its sum AND its node count. Three options: return a small struct or pair, return one value and update a member variable for the other, or encode a sentinel such as -1 for failure. The struct is clearest and the member variable is fastest to write under time pressure. Say which you are using and why, rather than reaching for globals silently.',
    },
  ],

  questionTypes: [
    {
      id: 'dfs-traversal',
      name: 'DFS traversal, recursive and iterative',
      signal:
        '"Return the inorder traversal", "visit every node", or any interviewer asking for the iterative version. Know all three orders recursively, and inorder iteratively with an explicit stack.',
      time: 'O(n)',
      space: 'O(h)',
      template: {
        cpp: `// Iterative inorder: go left as far as possible, then process, then go right.
stack<TreeNode*> st;
TreeNode* cur = root;
while (cur || !st.empty()) {
  while (cur) { st.push(cur); cur = cur->left; }   // dive left
  cur = st.top(); st.pop();
  visit(cur);                                      // process here
  cur = cur->right;                                // then pivot right
}`,
        java: `Deque<TreeNode> st = new ArrayDeque<>();
TreeNode cur = root;
while (cur != null || !st.isEmpty()) {
  while (cur != null) { st.push(cur); cur = cur.left; }
  cur = st.pop();
  visit(cur);
  cur = cur.right;
}`,
      },
      taught: {
        lc: 94,
        title: 'Binary Tree Inorder Traversal',
        slug: 'binary-tree-inorder-traversal',
        difficulty: 'easy',
        role: 'taught',
        estMinutes: 30,
        insight:
          'The iterative version makes the call stack explicit: dive left pushing everything, pop and visit, then pivot to the right child and repeat.',
        companies: ['microsoft', 'amazon'],
        whyThisOne:
          'The recursion is three lines, so the real content is the iterative form — which is what makes the hidden machinery of recursion visible, and it is a standard follow-up.',
        walkthrough: {
          howToSeeIt: [
            'Recursively it is one line of structure: traverse left, visit, traverse right. Write it, then answer the inevitable "can you do it without recursion?".',
            'Ask what the call stack was actually storing: the chain of ancestors you still owe a visit to. So replace it with an explicit stack holding exactly that chain.',
            'The outer loop continues while either the current pointer is non-null or the stack is non-empty. Those two conditions mean "more to dive into" and "more to come back to" — both are needed.',
            'Inner loop dives left, pushing every node passed. Then pop, visit, and move to the right child. The next outer iteration dives left from there, which is precisely what the recursion did.',
          ],
          wherePeopleLoseIt:
            'Using while (cur != null) as the outer condition, which terminates as soon as you reach the leftmost leaf and never unwinds the stack. Both clauses are required. For preorder the iterative version is easier — push right before left — and postorder is easiest as reversed modified-preorder.',
          time: 'O(n).',
          space: 'O(h) — the stack holds one path.',
          code: {
            cpp: `vector<int> inorderTraversal(TreeNode* root) {
  vector<int> out;
  stack<TreeNode*> st;
  TreeNode* cur = root;

  while (cur || !st.empty()) {              // BOTH clauses
    while (cur) { st.push(cur); cur = cur->left; }   // dive as far left as possible

    cur = st.top(); st.pop();
    out.push_back(cur->val);                // visit between left and right

    cur = cur->right;                       // pivot right; next loop dives left again
  }
  return out;
}`,
            java: `public List<Integer> inorderTraversal(TreeNode root) {
  List<Integer> out = new ArrayList<>();
  Deque<TreeNode> st = new ArrayDeque<>();
  TreeNode cur = root;

  while (cur != null || !st.isEmpty()) {
    while (cur != null) { st.push(cur); cur = cur.left; }

    cur = st.pop();
    out.add(cur.val);

    cur = cur.right;
  }
  return out;
}`,
          },
          followUp: 'Do it in O(1) space — Morris traversal, which temporarily rewires right pointers to build threads back to ancestors and then removes them.',
        },
      },
      practice: [
        {
          lc: 144,
          title: 'Binary Tree Preorder Traversal',
          slug: 'binary-tree-preorder-traversal',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 15,
          insight: 'Iteratively the easiest: push the root, then pop and push RIGHT before LEFT so left comes off first.',
        },
        {
          lc: 145,
          title: 'Binary Tree Postorder Traversal',
          slug: 'binary-tree-postorder-traversal',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 20,
          insight: 'Flipped: do preorder with left and right swapped, then reverse the result. Far easier than a genuine two-pass postorder stack.',
        },
      ],
    },

    {
      id: 'bottom-up',
      name: 'Bottom-up: children report to the parent',
      signal:
        'The answer at a node needs facts from BOTH subtrees — height, diameter, balance, maximum path. Return a value from each child and combine, keeping the global answer separately.',
      time: 'O(n)',
      space: 'O(h)',
      googleHeavy: true,
      template: {
        cpp: `int best = 0;                       // the ANSWER, updated as a side effect

int depth(TreeNode* node) {         // the RETURN is a different quantity
  if (!node) return 0;
  int L = depth(node->left), R = depth(node->right);
  best = max(best, L + R);          // consider a path THROUGH this node
  return 1 + max(L, R);             // report upward: only one side can continue
}`,
        java: `int best = 0;

int depth(TreeNode node) {
  if (node == null) return 0;
  int L = depth(node.left), R = depth(node.right);
  best = Math.max(best, L + R);
  return 1 + Math.max(L, R);
}`,
      },
      taught: {
        lc: 543,
        title: 'Diameter of Binary Tree',
        slug: 'diameter-of-binary-tree',
        difficulty: 'easy',
        role: 'taught',
        estMinutes: 30,
        insight:
          'What you RETURN and what you ANSWER are different quantities. Return the depth so the parent can build on it; record the through-path L + R separately as the answer.',
        companies: ['meta', 'google', 'amazon'],
        whyThisOne:
          'It teaches the return-versus-answer split, which is the single idea behind maximum path sum, balanced checks, longest univalue path and a dozen other Hard-labelled problems.',
        walkthrough: {
          howToSeeIt: [
            'The diameter is the longest path between any two nodes, and that path has a highest point — some node it passes through. So ask: for each node, how long is the best path through it?',
            'Through a node, the path goes down into the left subtree and down into the right subtree: leftDepth + rightDepth edges. Taking the maximum of that over all nodes is the diameter.',
            'But a parent cannot use both of your sides — a path continuing upward can only enter and leave once. So what you report upward is 1 + max(L, R), while what you record is L + R.',
            'Those two quantities being different is the entire problem. Keep the answer in a member variable updated during the traversal, and let the return value serve only the parent.',
          ],
          wherePeopleLoseIt:
            'Returning L + R, which is what you want to record, not what the parent needs. The tree then reports impossible path lengths. The other trap is recomputing depth inside a separate function for every node — that is O(n^2), and one bottom-up pass is what makes it O(n).',
          time: 'O(n) — each node visited once.',
          space: 'O(h).',
          code: {
            cpp: `class Solution {
  int best = 0;

  int depth(TreeNode* node) {
    if (!node) return 0;

    int L = depth(node->left);
    int R = depth(node->right);

    best = max(best, L + R);        // ANSWER: path through this node, in edges
    return 1 + max(L, R);           // RETURN: usable length for the parent
  }

public:
  int diameterOfBinaryTree(TreeNode* root) {
    depth(root);
    return best;
  }
};`,
            java: `class Solution {
  private int best = 0;

  public int diameterOfBinaryTree(TreeNode root) {
    depth(root);
    return best;
  }

  private int depth(TreeNode node) {
    if (node == null) return 0;

    int L = depth(node.left);
    int R = depth(node.right);

    best = Math.max(best, L + R);
    return 1 + Math.max(L, R);
  }
}`,
          },
          followUp: 'Maximum path sum (LC 124) — same structure, but clamp negative child contributions to 0 since you may decline to use a subtree.',
        },
      },
      practice: [
        {
          lc: 124,
          title: 'Binary Tree Maximum Path Sum',
          slug: 'binary-tree-maximum-path-sum',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 45,
          insight: 'Identical shape to diameter with one addition: max(0, childSum), because a negative subtree is better skipped entirely.',
          companies: ['google', 'meta', 'amazon'],
        },
        {
          lc: 110,
          title: 'Balanced Binary Tree',
          slug: 'balanced-binary-tree',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped: return -1 as a sentinel meaning "already unbalanced" so the failure propagates upward and the whole check stays O(n) instead of O(n log n).',
        },
      ],
    },

    {
      id: 'top-down',
      name: 'Top-down: carry state into the children',
      signal:
        'A node\'s answer depends on the path from the root — running sums, a maximum seen so far, a valid range, accumulated digits. Pass the state down as a parameter.',
      time: 'O(n)',
      space: 'O(h)',
      template: {
        cpp: `void go(TreeNode* node, int remaining, vector<int>& path) {
  if (!node) return;

  path.push_back(node->val);
  remaining -= node->val;

  if (!node->left && !node->right && remaining == 0) record(path);   // LEAF check

  go(node->left,  remaining, path);
  go(node->right, remaining, path);

  path.pop_back();                     // backtrack, same as any other path problem
}`,
        java: `void go(TreeNode node, int remaining, List<Integer> path) {
  if (node == null) return;

  path.add(node.val);
  remaining -= node.val;

  if (node.left == null && node.right == null && remaining == 0) out.add(new ArrayList<>(path));

  go(node.left,  remaining, path);
  go(node.right, remaining, path);

  path.remove(path.size() - 1);
}`,
      },
      taught: {
        lc: 112,
        title: 'Path Sum',
        slug: 'path-sum',
        difficulty: 'easy',
        role: 'taught',
        estMinutes: 25,
        insight:
          'Subtract as you descend, and test for zero only at a LEAF. A null node is not a leaf, and confusing the two is the entire bug surface of this problem.',
        whyThisOne:
          'The clearest case where the null check and the leaf check must be different, which trips up a surprising number of otherwise solid candidates.',
        walkthrough: {
          howToSeeIt: [
            'The condition involves the whole root-to-leaf path, so information must travel DOWN. Carry the remaining target as a parameter rather than summing on the way back up.',
            'At each node subtract its value from the remaining target. The question at the bottom becomes simply "is remaining zero?".',
            'Test that only at a leaf — a node with no left AND no right child. Testing at a null child is wrong: a node with one child would then be treated as a leaf through its missing side.',
            'Recurse into both children and return true if either succeeds. Short-circuit || stops early on success.',
          ],
          wherePeopleLoseIt:
            'Using if (!node) return remaining == 0. On a tree like 1 → left 2 with target 1, the null right child of the root reports success even though no leaf was reached. The null case must return false; only a genuine leaf may report success.',
          time: 'O(n).',
          space: 'O(h).',
          code: {
            cpp: `bool hasPathSum(TreeNode* root, int targetSum) {
  if (!root) return false;                       // null is NOT a leaf

  int remaining = targetSum - root->val;

  if (!root->left && !root->right)               // genuine leaf
    return remaining == 0;

  return hasPathSum(root->left, remaining) || hasPathSum(root->right, remaining);
}`,
            java: `public boolean hasPathSum(TreeNode root, int targetSum) {
  if (root == null) return false;

  int remaining = targetSum - root.val;

  if (root.left == null && root.right == null)
    return remaining == 0;

  return hasPathSum(root.left, remaining) || hasPathSum(root.right, remaining);
}`,
          },
          followUp: 'Return every qualifying path (LC 113) — now you carry a path buffer and backtrack, joining this pattern to the recursion topic.',
        },
      },
      practice: [
        {
          lc: 113,
          title: 'Path Sum II',
          slug: 'path-sum-ii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'Top-down state plus backtracking: push the value, recurse, pop. Copy the path when recording or every entry aliases the same buffer.',
        },
        {
          lc: 1448,
          title: 'Count Good Nodes in Binary Tree',
          slug: 'count-good-nodes-in-binary-tree',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight: 'Flipped: the carried state is the maximum seen on the path so far, and you count rather than collect. The cleanest possible top-down drill.',
          companies: ['amazon'],
        },
      ],
    },

    {
      id: 'bfs-levels',
      name: 'BFS by level',
      signal:
        '"Level order", "right side view", "minimum depth", "zigzag", "average per level". Anything where the LEVEL is part of the answer — snapshot the queue size before processing.',
      time: 'O(n)',
      space: 'O(w)',
      template: {
        cpp: `queue<TreeNode*> q;
if (root) q.push(root);

while (!q.empty()) {
  int levelSize = (int)q.size();        // snapshot BEFORE the inner loop
  vector<int> level;

  for (int i = 0; i < levelSize; ++i) {
    TreeNode* node = q.front(); q.pop();
    level.push_back(node->val);
    if (node->left)  q.push(node->left);
    if (node->right) q.push(node->right);
  }
  out.push_back(level);
}`,
        java: `Queue<TreeNode> q = new ArrayDeque<>();
if (root != null) q.add(root);

while (!q.isEmpty()) {
  int levelSize = q.size();
  List<Integer> level = new ArrayList<>();

  for (int i = 0; i < levelSize; i++) {
    TreeNode node = q.poll();
    level.add(node.val);
    if (node.left != null)  q.add(node.left);
    if (node.right != null) q.add(node.right);
  }
  out.add(level);
}`,
      },
      taught: {
        lc: 102,
        title: 'Binary Tree Level Order Traversal',
        slug: 'binary-tree-level-order-traversal',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 25,
        insight:
          'Capture the queue size before processing a level — that count IS the level. Reading the size inside the loop is wrong, because the queue grows as you enqueue children.',
        companies: ['google', 'amazon', 'microsoft'],
        whyThisOne:
          'This exact loop reappears in graphs, shortest paths and multi-source spreading. Owning it here means Phase 3 is about the graph rather than about the queue.',
        walkthrough: {
          howToSeeIt: [
            'Levels are distance from the root, and BFS visits nodes in exactly that order. So the queue naturally holds nodes level by level; the only task is knowing where one level ends.',
            'Before processing, the queue contains exactly the current level and nothing else. So its size right then is the level width.',
            'Snapshot that size into a variable, then loop exactly that many times. Children enqueued during the loop belong to the next level and are correctly excluded.',
            'Guard the empty tree by only enqueueing a non-null root, and only enqueueing non-null children. Pushing nulls and filtering later works but adds noise.',
          ],
          wherePeopleLoseIt:
            'Writing for (int i = 0; i < q.size(); i++) — the size changes as children are pushed, so levels bleed into one another. Take the snapshot. It is one line and it is the whole pattern.',
          time: 'O(n).',
          space: 'O(w) — up to n/2 at the widest level.',
          code: {
            cpp: `vector<vector<int>> levelOrder(TreeNode* root) {
  vector<vector<int>> out;
  queue<TreeNode*> q;
  if (root) q.push(root);

  while (!q.empty()) {
    int levelSize = (int)q.size();        // SNAPSHOT — this is the whole trick
    vector<int> level;

    for (int i = 0; i < levelSize; ++i) {
      TreeNode* node = q.front(); q.pop();
      level.push_back(node->val);

      if (node->left)  q.push(node->left);
      if (node->right) q.push(node->right);
    }
    out.push_back(level);
  }
  return out;
}`,
            java: `public List<List<Integer>> levelOrder(TreeNode root) {
  List<List<Integer>> out = new ArrayList<>();
  Queue<TreeNode> q = new ArrayDeque<>();
  if (root != null) q.add(root);

  while (!q.isEmpty()) {
    int levelSize = q.size();
    List<Integer> level = new ArrayList<>(levelSize);

    for (int i = 0; i < levelSize; i++) {
      TreeNode node = q.poll();
      level.add(node.val);

      if (node.left != null)  q.add(node.left);
      if (node.right != null) q.add(node.right);
    }
    out.add(level);
  }
  return out;
}`,
          },
          followUp: 'Minimum depth — BFS returns the moment it meets the first leaf, which beats DFS on a deep skewed tree. Knowing when BFS is better than DFS is the point.',
        },
      },
      practice: [
        {
          lc: 199,
          title: 'Binary Tree Right Side View',
          slug: 'binary-tree-right-side-view',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight: 'Take the LAST node of each level. One line changed from level order — and worth noting a DFS visiting right-first also solves it.',
          companies: ['meta', 'amazon'],
        },
        {
          lc: 103,
          title: 'Binary Tree Zigzag Level Order Traversal',
          slug: 'binary-tree-zigzag-level-order-traversal',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped: alternate direction per level. Reverse the collected level rather than the traversal itself — reversing the queue logic is where people tie themselves in knots.',
        },
      ],
    },

    {
      id: 'lca-ancestor',
      name: 'Lowest common ancestor and node relationships',
      signal:
        '"Lowest common ancestor", "distance between two nodes", "all nodes at distance K". The move: a node reports upward whether it found anything, and the first node hearing yes from both sides is the meeting point.',
      time: 'O(n)',
      space: 'O(h)',
      googleHeavy: true,
      template: {
        cpp: `TreeNode* lca(TreeNode* node, TreeNode* p, TreeNode* q) {
  if (!node || node == p || node == q) return node;    // found one, or nothing

  TreeNode* L = lca(node->left,  p, q);
  TreeNode* R = lca(node->right, p, q);

  if (L && R) return node;        // one target on each side: THIS is the LCA
  return L ? L : R;               // otherwise pass up whatever was found
}`,
        java: `TreeNode lca(TreeNode node, TreeNode p, TreeNode q) {
  if (node == null || node == p || node == q) return node;

  TreeNode L = lca(node.left, p, q);
  TreeNode R = lca(node.right, p, q);

  if (L != null && R != null) return node;
  return L != null ? L : R;
}`,
      },
      taught: {
        lc: 236,
        title: 'Lowest Common Ancestor of a Binary Tree',
        slug: 'lowest-common-ancestor-of-a-binary-tree',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          'Each call returns "what I found below me". A node receiving a non-null from both children is the split point, and therefore the answer.',
        companies: ['google', 'meta', 'amazon', 'microsoft'],
        whyThisOne:
          'Six lines that look like magic until you read the return value as a message. It is the best demonstration that a recursive return can carry meaning beyond a plain value.',
        walkthrough: {
          howToSeeIt: [
            'Define precisely what the function returns, and the code follows: "either p, or q, or the LCA if both were found in this subtree, or null if neither is here".',
            'Base case: a null node found nothing. A node that IS p or q reports itself — and crucially you do not search deeper, because if the other target is below it, this node is still the ancestor.',
            'Recurse both sides. If both come back non-null, the targets are in different subtrees, so the current node is where they meet. That is the answer, and it is returned upward unchanged from here on.',
            'If only one side is non-null, pass it up. Either that side holds one target and the other is elsewhere above, or it already holds the answer — both cases are handled by the same line.',
          ],
          wherePeopleLoseIt:
            'Believing the function returns "the LCA" at every level. It does not — it returns a MESSAGE whose meaning depends on context, and once both sides report in, that message becomes the answer permanently. The other trap is assuming both nodes exist in the tree; if the problem does not guarantee it, you need an extra found-flag pass.',
          time: 'O(n).',
          space: 'O(h).',
          code: {
            cpp: `TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
  if (!root || root == p || root == q) return root;   // report what I am

  TreeNode* L = lowestCommonAncestor(root->left,  p, q);
  TreeNode* R = lowestCommonAncestor(root->right, p, q);

  if (L && R) return root;      // targets split here => this node is the LCA
  return L ? L : R;             // otherwise forward the single finding upward
}`,
            java: `public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
  if (root == null || root == p || root == q) return root;

  TreeNode L = lowestCommonAncestor(root.left, p, q);
  TreeNode R = lowestCommonAncestor(root.right, p, q);

  if (L != null && R != null) return root;
  return L != null ? L : R;
}`,
          },
          followUp: 'With parent pointers it becomes the linked-list intersection problem. In a BST it is easier still — compare values and walk down in O(h).',
        },
      },
      practice: [
        {
          lc: 863,
          title: 'All Nodes Distance K in Binary Tree',
          slug: 'all-nodes-distance-k-in-binary-tree',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 45,
          insight: 'Add parent pointers with one pass, which turns the tree into an undirected graph — then it is plain BFS to depth K.',
          companies: ['meta', 'amazon'],
        },
        {
          lc: 1123,
          title: 'Lowest Common Ancestor of Deepest Leaves',
          slug: 'lowest-common-ancestor-of-deepest-leaves',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight: 'Flipped: return a (depth, node) pair bottom-up. Equal depths on both sides means this node is the answer for its subtree.',
        },
      ],
    },

    {
      id: 'construct-serialize',
      name: 'Constructing and serialising trees',
      signal:
        '"Build the tree from these traversals", "serialise and deserialise". You are running a traversal in reverse — emitting or consuming nodes in a fixed order.',
      time: 'O(n)',
      space: 'O(n)',
      template: {
        cpp: `// preorder gives the root; inorder tells you how the rest splits
unordered_map<int,int> pos;               // value -> index in inorder, for O(1) splits
int preIdx = 0;

TreeNode* build(int lo, int hi) {
  if (lo > hi) return nullptr;

  int val = preorder[preIdx++];           // preorder hands out roots in order
  TreeNode* node = new TreeNode(val);

  int mid = pos[val];
  node->left  = build(lo, mid - 1);       // left first: preorder demands it
  node->right = build(mid + 1, hi);
  return node;
}`,
        java: `Map<Integer,Integer> pos = new HashMap<>();
int preIdx = 0;

TreeNode build(int[] preorder, int lo, int hi) {
  if (lo > hi) return null;

  int val = preorder[preIdx++];
  TreeNode node = new TreeNode(val);

  int mid = pos.get(val);
  node.left  = build(preorder, lo, mid - 1);
  node.right = build(preorder, mid + 1, hi);
  return node;
}`,
      },
      taught: {
        lc: 105,
        title: 'Construct Binary Tree from Preorder and Inorder Traversal',
        slug: 'construct-binary-tree-from-preorder-and-inorder-traversal',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 45,
        insight:
          'Preorder hands you roots in the exact order you need them; inorder tells you where each root splits its range. A value-to-index map makes each split O(1).',
        companies: ['google', 'amazon', 'microsoft'],
        whyThisOne:
          'It forces you to reason about what each traversal actually encodes, and the shared preorder index is a genuinely elegant piece of recursion worth internalising.',
        walkthrough: {
          howToSeeIt: [
            'State what each traversal gives you. Preorder: the first element is always the root of the current subtree. Inorder: everything left of the root belongs to the left subtree, everything right to the right subtree.',
            'Combine them. Take the next preorder value as the root, find it in inorder, and the two sides of that position are exactly the two subtrees — with their sizes now known.',
            'Recurse on inorder RANGES while consuming preorder sequentially with a single shared index. Because preorder is root, then all of the left subtree, then all of the right, building left before right keeps that index perfectly aligned. Swapping the order silently corrupts the tree.',
            'Searching inorder for each root is O(n), making the whole thing O(n^2). Precompute a value-to-index map and it drops to O(n).',
          ],
          wherePeopleLoseIt:
            'Building the right subtree before the left. The shared preorder index then consumes the wrong values and the tree comes out plausible-looking but wrong. The order of those two lines is load-bearing — a comment saying so is worth writing.',
          time: 'O(n) with the index map.',
          space: 'O(n).',
          code: {
            cpp: `class Solution {
  unordered_map<int,int> pos;        // inorder value -> index
  int preIdx = 0;
  vector<int>* pre;

  TreeNode* build(int lo, int hi) {
    if (lo > hi) return nullptr;

    int val = (*pre)[preIdx++];      // preorder yields roots in the right order
    TreeNode* node = new TreeNode(val);

    int mid = pos[val];
    node->left  = build(lo, mid - 1);   // LEFT FIRST — preorder requires it
    node->right = build(mid + 1, hi);
    return node;
  }

public:
  TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
    pre = &preorder;
    for (int i = 0; i < (int)inorder.size(); ++i) pos[inorder[i]] = i;
    return build(0, (int)inorder.size() - 1);
  }
};`,
            java: `class Solution {
  private final Map<Integer,Integer> pos = new HashMap<>();
  private int preIdx = 0;
  private int[] pre;

  public TreeNode buildTree(int[] preorder, int[] inorder) {
    pre = preorder;
    for (int i = 0; i < inorder.length; i++) pos.put(inorder[i], i);
    return build(0, inorder.length - 1);
  }

  private TreeNode build(int lo, int hi) {
    if (lo > hi) return null;

    int val = pre[preIdx++];
    TreeNode node = new TreeNode(val);

    int mid = pos.get(val);
    node.left  = build(lo, mid - 1);
    node.right = build(mid + 1, hi);
    return node;
  }
}`,
          },
          followUp: 'Why can preorder plus postorder NOT reconstruct a binary tree uniquely? Because a single child cannot be identified as left or right — a good question to answer crisply.',
        },
      },
      practice: [
        {
          lc: 297,
          title: 'Serialize and Deserialize Binary Tree',
          slug: 'serialize-and-deserialize-binary-tree',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 45,
          insight: 'Preorder WITH null markers is self-delimiting, so one traversal suffices and no second array is needed. The null markers are the whole idea.',
          companies: ['google', 'meta', 'amazon'],
        },
        {
          lc: 108,
          title: 'Convert Sorted Array to Binary Search Tree',
          slug: 'convert-sorted-array-to-binary-search-tree',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 20,
          insight: 'Flipped: a sorted array IS an inorder traversal, and choosing the middle element as root each time is what guarantees balance.',
        },
      ],
    },
  ],
};
