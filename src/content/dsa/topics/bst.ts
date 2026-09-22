import type { Topic } from '../../schema';

export const bst: Topic = {
  id: 'bst',
  name: 'Binary Search Trees',
  phase: 2,
  estHours: 10,
  prerequisites: ['binary-trees', 'binary-search'],

  whyItMatters:
    'A BST is binary search made persistent — the same halving argument, but on a structure you can insert into and delete from. Almost every BST question is solved by one of two facts: inorder traversal yields sorted order, or the value at a node tells you which single child to descend into. Candidates who memorise tree recursion but never internalise those two facts end up writing O(n) solutions to O(h) problems.',

  fundamentals: [
    {
      heading: 'The invariant, stated precisely',
      body:
        'For every node, ALL values in the left subtree are less than the node, and ALL values in the right subtree are greater. Note "all", not "the immediate child" — that distinction is the entire content of the validation problem. Comparing only against direct children accepts trees that are not BSTs, and it is the most common wrong answer in this topic.',
      costs: [
        { op: 'search / insert / delete', cost: 'O(h)', note: 'h = height' },
        { op: 'h when balanced', cost: 'O(log n)', note: 'what you hope for' },
        { op: 'h when degenerate', cost: 'O(n)', note: 'a sorted insert order builds a linked list' },
        { op: 'inorder traversal', cost: 'O(n)', note: 'yields values in sorted order' },
      ],
    },
    {
      heading: 'Inorder is sorted — the single most useful fact',
      body:
        'Left, node, right produces ascending values. That immediately gives you: validation (check the sequence is strictly increasing), k-th smallest (stop at the k-th visit), minimum difference between nodes (compare adjacent values only), and two-sum on a BST. Whenever a BST problem mentions order, rank or sortedness, the answer starts with an inorder walk and a "previous value" variable.',
      code: {
        cpp: `TreeNode* prev = nullptr;
bool inorder(TreeNode* node) {
  if (!node) return true;
  if (!inorder(node->left)) return false;

  if (prev && prev->val >= node->val) return false;   // compare with PREDECESSOR
  prev = node;

  return inorder(node->right);
}`,
        java: `TreeNode prev = null;
boolean inorder(TreeNode node) {
  if (node == null) return true;
  if (!inorder(node.left)) return false;

  if (prev != null && prev.val >= node.val) return false;
  prev = node;

  return inorder(node.right);
}`,
      },
    },
    {
      heading: 'Descend, do not search',
      body:
        'In a plain binary tree you must examine both subtrees because there is no ordering to exploit. In a BST you compare once and discard an entire side. Any BST solution that recurses into BOTH children is almost certainly leaving a log factor on the table — unless the problem genuinely requires visiting everything, such as summing all nodes.',
    },
    {
      heading: 'Balance is an assumption, not a guarantee',
      body:
        'A plain BST built by inserting sorted data degrades into a linked list, making every operation O(n). Real implementations — red-black trees behind std::map and Java TreeMap, or AVL trees — rebalance on insert to keep h at O(log n). You will not be asked to implement one, but you should state the worst case and name the fix when you claim O(log n).',
    },
  ],

  questionTypes: [
    {
      id: 'inorder-sorted',
      name: 'Exploit the sorted inorder sequence',
      signal:
        '"Validate", "k-th smallest", "minimum difference between any two nodes", "is this sorted". Walk inorder and compare only with the PREVIOUS value visited.',
      time: 'O(n) worst case, often early-exit',
      space: 'O(h)',
      googleHeavy: true,
      template: {
        cpp: `TreeNode* prev = nullptr;
void inorder(TreeNode* node) {
  if (!node) return;
  inorder(node->left);
  if (prev) consider(prev->val, node->val);   // adjacent in sorted order
  prev = node;
  inorder(node->right);
}`,
        java: `TreeNode prev = null;
void inorder(TreeNode node) {
  if (node == null) return;
  inorder(node.left);
  if (prev != null) consider(prev.val, node.val);
  prev = node;
  inorder(node.right);
}`,
      },
      taught: {
        lc: 98,
        title: 'Validate Binary Search Tree',
        slug: 'validate-binary-search-tree',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'Comparing a node to its direct children is not enough — the invariant is about entire subtrees. Either carry a (min, max) range down, or check that the inorder sequence strictly increases.',
        companies: ['google', 'meta', 'amazon', 'microsoft'],
        whyThisOne:
          'It punishes the shallow reading of the BST property, and it offers two clean correct solutions — one top-down, one inorder — which makes the earlier direction distinction concrete.',
        walkthrough: {
          howToSeeIt: [
            'Write the naive check and break it: node.left.val < node.val < node.right.val. Now build a counter-example — root 10, left child 5, and 5 has a right child of 20. Every local check passes, but 20 sits in the left subtree of 10. Local checks cannot see that.',
            'The invariant constrains a node against ALL its ancestors, not just its parent. So the information a node needs comes from above: a valid open range (low, high).',
            'Top-down solution: descend carrying that range. Going left tightens the upper bound to the current value; going right tightens the lower bound. A node outside its range fails immediately.',
            'Inorder solution: a tree is a BST exactly when its inorder sequence is strictly increasing. Keep a pointer to the previously visited node and compare. Both are O(n); mention both and pick one.',
          ],
          wherePeopleLoseIt:
            'Using int bounds with sentinel values of INT_MIN and INT_MAX — a node legitimately holding INT_MIN then fails. Use long long, or pass node pointers that may be null. The other trap is >= versus >: duplicates are not allowed here, so equality must fail.',
          time: 'O(n).',
          space: 'O(h).',
          code: {
            cpp: `class Solution {
  bool go(TreeNode* node, long long low, long long high) {
    if (!node) return true;                          // empty is vacuously valid
    if (node->val <= low || node->val >= high) return false;

    return go(node->left,  low, node->val)           // tighten the upper bound
        && go(node->right, node->val, high);         // tighten the lower bound
  }

public:
  bool isValidBST(TreeNode* root) {
    return go(root, LLONG_MIN, LLONG_MAX);           // long long, not int
  }
};`,
            java: `class Solution {
  public boolean isValidBST(TreeNode root) {
    return go(root, Long.MIN_VALUE, Long.MAX_VALUE);
  }

  private boolean go(TreeNode node, long low, long high) {
    if (node == null) return true;
    if (node.val <= low || node.val >= high) return false;

    return go(node.left, low, node.val)
        && go(node.right, node.val, high);
  }
}`,
          },
          followUp: 'Two nodes have been swapped — recover the tree (LC 99). The inorder view makes the two out-of-order positions visible, and O(1) space needs Morris traversal.',
        },
      },
      practice: [
        {
          lc: 230,
          title: 'Kth Smallest Element in a BST',
          slug: 'kth-smallest-element-in-a-bst',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight: 'Inorder with a counter, returning at the k-th visit. Then answer the follow-up: with frequent modifications, store subtree sizes for O(h) rank queries.',
          companies: ['google', 'amazon'],
        },
        {
          lc: 783,
          title: 'Minimum Distance Between BST Nodes',
          slug: 'minimum-distance-between-bst-nodes',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 20,
          insight: 'Flipped: the closest pair must be ADJACENT in sorted order, so comparing each node with its inorder predecessor is sufficient — no pairwise comparison needed.',
        },
      ],
    },

    {
      id: 'bst-descend',
      name: 'Descend by comparison',
      signal:
        'Search, insert, or find a relationship between two values in a BST. One comparison eliminates an entire subtree, giving O(h) instead of O(n).',
      time: 'O(h)',
      space: 'O(1) iterative',
      template: {
        cpp: `TreeNode* cur = root;
while (cur) {
  if (target < cur->val)      cur = cur->left;
  else if (target > cur->val) cur = cur->right;
  else                        return cur;
}
return nullptr;`,
        java: `TreeNode cur = root;
while (cur != null) {
  if (target < cur.val)      cur = cur.left;
  else if (target > cur.val) cur = cur.right;
  else                       return cur;
}
return null;`,
      },
      taught: {
        lc: 235,
        title: 'Lowest Common Ancestor of a Binary Search Tree',
        slug: 'lowest-common-ancestor-of-a-binary-search-tree',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 25,
        insight:
          'Walk down while both targets sit on the same side. The first node that falls BETWEEN them — or equals one of them — is the split point and therefore the LCA.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'Placed right after the general-tree LCA, it shows what the ordering buys you: O(n) recursion becomes an O(h) loop with no stack at all.',
        walkthrough: {
          howToSeeIt: [
            'Recall the general-tree version: recurse both sides and see which report back. That is O(n) because a plain tree gives no way to know where a value lives.',
            'The BST invariant tells you exactly where each target is relative to the current node. If both values are smaller, both targets are in the left subtree — so the LCA must be there too, and the right subtree is irrelevant.',
            'Symmetrically, if both are larger, go right. Otherwise the targets straddle the current node, or one equals it, and by definition that is where their paths diverge: the LCA.',
            'Because each step makes one comparison and moves down, write it as a loop. No recursion, no stack, O(1) space — worth pointing out explicitly.',
          ],
          wherePeopleLoseIt:
            'Forgetting that a node can be an ancestor of itself. If p equals the current node, the straddle condition already handles it — but people add a separate equality branch that returns too early or too late. Let the two directional tests do the work and return on anything else.',
          time: 'O(h).',
          space: 'O(1).',
          code: {
            cpp: `TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
  TreeNode* cur = root;

  while (cur) {
    if (p->val < cur->val && q->val < cur->val)      cur = cur->left;   // both left
    else if (p->val > cur->val && q->val > cur->val) cur = cur->right;  // both right
    else return cur;                                  // split here, or cur is one of them
  }
  return nullptr;
}`,
            java: `public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
  TreeNode cur = root;

  while (cur != null) {
    if (p.val < cur.val && q.val < cur.val)      cur = cur.left;
    else if (p.val > cur.val && q.val > cur.val) cur = cur.right;
    else return cur;
  }
  return null;
}`,
          },
          followUp: 'What if the tree is badly unbalanced? Then h is O(n) and this is no better than the general solution — which is the honest caveat on every O(h) claim.',
        },
      },
      practice: [
        {
          lc: 700,
          title: 'Search in a Binary Search Tree',
          slug: 'search-in-a-binary-search-tree',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 10,
          insight: 'The bare descent. Write it iteratively to make the O(1) space explicit.',
        },
        {
          lc: 701,
          title: 'Insert into a Binary Search Tree',
          slug: 'insert-into-a-binary-search-tree',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 20,
          insight: 'Flipped: descend to a null slot and attach there. Note that repeated sorted inserts build a degenerate list — the motivation for self-balancing trees.',
        },
      ],
    },

    {
      id: 'bst-restructure',
      name: 'Deleting and restructuring',
      signal:
        '"Delete a node", "trim to a range", "convert to a greater-sum tree". The structure changes, so the hard part is preserving the invariant while rewiring.',
      time: 'O(h) or O(n)',
      space: 'O(h)',
      template: {
        cpp: `// Deletion by cases; the two-child case is the only interesting one.
TreeNode* del(TreeNode* node, int key) {
  if (!node) return nullptr;

  if (key < node->val)      node->left  = del(node->left, key);
  else if (key > node->val) node->right = del(node->right, key);
  else {
    if (!node->left)  return node->right;      // 0 or 1 child: splice
    if (!node->right) return node->left;

    TreeNode* succ = node->right;              // smallest in the right subtree
    while (succ->left) succ = succ->left;
    node->val = succ->val;                     // copy the value up
    node->right = del(node->right, succ->val); // then delete the successor
  }
  return node;
}`,
        java: `TreeNode del(TreeNode node, int key) {
  if (node == null) return null;

  if (key < node.val)      node.left  = del(node.left, key);
  else if (key > node.val) node.right = del(node.right, key);
  else {
    if (node.left == null)  return node.right;
    if (node.right == null) return node.left;

    TreeNode succ = node.right;
    while (succ.left != null) succ = succ.left;
    node.val = succ.val;
    node.right = del(node.right, succ.val);
  }
  return node;
}`,
      },
      taught: {
        lc: 450,
        title: 'Delete Node in a BST',
        slug: 'delete-node-in-a-bst',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          'Three cases. No children or one child: splice past it. Two children: overwrite the value with its inorder SUCCESSOR, then delete that successor — which is guaranteed to have at most one child.',
        companies: ['google', 'microsoft'],
        whyThisOne:
          'The only BST operation with genuine case analysis, and the successor trick is a small piece of real algorithm design rather than a template.',
        walkthrough: {
          howToSeeIt: [
            'Descend to find the node, reassigning child pointers on the way back up — return the (possibly new) subtree root from each call. That pattern removes all parent-pointer bookkeeping.',
            'Zero children: return null, and the parent assignment removes it. One child: return that child, splicing it into the gap. Both handled by a single pair of lines.',
            'Two children is the real case. You cannot simply remove the node, so instead replace its VALUE with the next value in sorted order — the inorder successor, which is the leftmost node of the right subtree.',
            'That successor has no left child by construction, so deleting it recursively falls into the easy cases and terminates. The predecessor works equally well; say which you chose.',
          ],
          wherePeopleLoseIt:
            'Copying the successor value but forgetting to delete the successor node, which leaves the value duplicated in the tree. Or searching for the successor in the whole tree rather than the right subtree. The one-line rule: leftmost node of the right child, then recursive delete in the right subtree.',
          time: 'O(h).',
          space: 'O(h).',
          code: {
            cpp: `TreeNode* deleteNode(TreeNode* root, int key) {
  if (!root) return nullptr;

  if (key < root->val)      root->left  = deleteNode(root->left, key);
  else if (key > root->val) root->right = deleteNode(root->right, key);
  else {
    if (!root->left)  return root->right;   // 0 or 1 child
    if (!root->right) return root->left;

    TreeNode* succ = root->right;           // inorder successor
    while (succ->left) succ = succ->left;

    root->val = succ->val;                            // copy value up
    root->right = deleteNode(root->right, succ->val); // then remove it below
  }
  return root;
}`,
            java: `public TreeNode deleteNode(TreeNode root, int key) {
  if (root == null) return null;

  if (key < root.val)      root.left  = deleteNode(root.left, key);
  else if (key > root.val) root.right = deleteNode(root.right, key);
  else {
    if (root.left == null)  return root.right;
    if (root.right == null) return root.left;

    TreeNode succ = root.right;
    while (succ.left != null) succ = succ.left;

    root.val = succ.val;
    root.right = deleteNode(root.right, succ.val);
  }
  return root;
}`,
          },
          followUp: 'Deleting repeatedly can unbalance the tree — which is where red-black rotations come in, and why library maps do this for you.',
        },
      },
      practice: [
        {
          lc: 669,
          title: 'Trim a Binary Search Tree',
          slug: 'trim-a-binary-search-tree',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'When a node is below the range, its ENTIRE left subtree is too — so return the trimmed right child directly and skip that half of the work.',
        },
        {
          lc: 538,
          title: 'Convert BST to Greater Tree',
          slug: 'convert-bst-to-greater-tree',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight: 'Flipped: a REVERSE inorder walk (right, node, left) visits values in descending order, so a running sum is exactly what each node needs.',
        },
      ],
    },

    {
      id: 'bst-iterator',
      name: 'Controlled traversal and iterators',
      signal:
        '"Design an iterator", "two-sum on a BST", "next smallest on demand". You need the inorder sequence one element at a time, in O(h) space rather than O(n).',
      time: 'O(1) amortised per next()',
      space: 'O(h)',
      template: {
        cpp: `stack<TreeNode*> st;
void pushLeft(TreeNode* node) { while (node) { st.push(node); node = node->left; } }

// constructor: pushLeft(root)
int next() {
  TreeNode* node = st.top(); st.pop();
  pushLeft(node->right);            // stage the successor's left spine
  return node->val;
}
bool hasNext() { return !st.empty(); }`,
        java: `Deque<TreeNode> st = new ArrayDeque<>();
void pushLeft(TreeNode node) { while (node != null) { st.push(node); node = node.left; } }

int next() {
  TreeNode node = st.pop();
  pushLeft(node.right);
  return node.val;
}
boolean hasNext() { return !st.isEmpty(); }`,
      },
      taught: {
        lc: 173,
        title: 'Binary Search Tree Iterator',
        slug: 'binary-search-tree-iterator',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 35,
        insight:
          'Pause the iterative inorder traversal mid-flight. The stack holds only the left spine, which is O(h), and each node is pushed and popped exactly once across all calls — O(1) amortised.',
        companies: ['google', 'meta', 'microsoft'],
        whyThisOne:
          'It converts a traversal into a resumable object, which is exactly how real iterators work, and the amortised argument is a clean one to be able to deliver.',
        walkthrough: {
          howToSeeIt: [
            'Flattening the whole tree into a sorted array in the constructor works and gives O(1) next(), but costs O(n) memory. The stated follow-up asks for O(h), so that is the target.',
            'Take the iterative inorder traversal and freeze it. Its stack at any moment holds exactly the ancestors still owing a visit — and that is the left spine, at most h nodes.',
            'The constructor pushes the left spine from the root. next() pops the top, which is the smallest unvisited node, then pushes the left spine of its right child to stage what comes after.',
            'hasNext() is just a non-empty stack. For the complexity claim: every node is pushed once and popped once over the entire sequence of calls, so next() is O(1) amortised even though one call may push h nodes.',
          ],
          wherePeopleLoseIt:
            'Pushing the right child itself rather than its whole left spine, which returns nodes out of order. The staging step must dive left all the way down. Second, claiming O(1) worst case for next() — it is amortised, and the distinction is exactly what the interviewer is checking.',
          time: 'O(1) amortised per next(), O(h) constructor.',
          space: 'O(h).',
          code: {
            cpp: `class BSTIterator {
  stack<TreeNode*> st;

  void pushLeft(TreeNode* node) {
    while (node) { st.push(node); node = node->left; }   // the ENTIRE left spine
  }

public:
  BSTIterator(TreeNode* root) { pushLeft(root); }

  int next() {
    TreeNode* node = st.top(); st.pop();
    pushLeft(node->right);            // stage everything before the next successor
    return node->val;
  }

  bool hasNext() { return !st.empty(); }
};`,
            java: `class BSTIterator {
  private final Deque<TreeNode> st = new ArrayDeque<>();

  public BSTIterator(TreeNode root) { pushLeft(root); }

  private void pushLeft(TreeNode node) {
    while (node != null) { st.push(node); node = node.left; }
  }

  public int next() {
    TreeNode node = st.pop();
    pushLeft(node.right);
    return node.val;
  }

  public boolean hasNext() { return !st.isEmpty(); }
}`,
          },
          followUp: 'Add prev() for bidirectional iteration — much harder, and worth discussing why: a single stack cannot walk backwards without parent pointers.',
        },
      },
      practice: [
        {
          lc: 653,
          title: 'Two Sum IV - Input is a BST',
          slug: 'two-sum-iv-input-is-a-bst',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 25,
          insight: 'Two iterators — one forward, one reverse — reproduce the sorted-array two-pointer solution in O(h) space instead of flattening to O(n).',
        },
        {
          lc: 99,
          title: 'Recover Binary Search Tree',
          slug: 'recover-binary-search-tree',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight:
            'Flipped: two nodes are swapped, so the inorder sequence has one or two descents. Catch the first and last offenders and swap their values. O(1) space needs Morris traversal.',
          companies: ['google'],
        },
      ],
    },
  ],
};
