import type { Topic } from '../../schema';

export const tries: Topic = {
  id: 'tries',
  name: 'Tries',
  phase: 2,
  estHours: 8,
  prerequisites: ['strings', 'recursion'],

  whyItMatters:
    'A trie turns "does any of my 10,000 words start with this prefix?" from a scan into a walk of length k. That is the data structure behind autocomplete, spell check and IP routing tables. In interviews it shows up whenever a problem involves many words at once — and the giveaway is that the naive solution re-scans the entire dictionary inside a loop.',

  fundamentals: [
    {
      heading: 'A trie stores the alphabet in the edges',
      body:
        'Each node holds one child slot per possible character, so the character is implied by WHICH edge you took rather than stored in the node. A boolean flag marks nodes where a complete word ends — without it you cannot distinguish the stored word "car" from the mere prefix of "card". That flag is the most commonly forgotten field in a first implementation.',
      code: {
        cpp: `struct TrieNode {
  TrieNode* next[26] = {};    // the character is the EDGE, not the node
  bool isWord = false;        // without this, prefixes and words are indistinguishable
};`,
        java: `class TrieNode {
  TrieNode[] next = new TrieNode[26];
  boolean isWord = false;
}`,
      },
      costs: [
        { op: 'insert a word of length k', cost: 'O(k)', note: 'independent of how many words are stored' },
        { op: 'search / startsWith', cost: 'O(k)', note: 'the entire point' },
        { op: 'memory', cost: 'O(total characters × alphabet)', note: 'the real cost — 26 pointers per node' },
        { op: 'same query with a hash set', cost: 'O(k) exact, O(n·k) prefix', note: 'hash sets cannot do prefixes' },
      ],
    },
    {
      heading: 'When a hash set is enough, and when it is not',
      body:
        'For exact-match lookup a hash set is simpler, faster and smaller — use it. A trie earns its memory only when you need PREFIX structure: prefix queries, wildcard matching, shared-prefix traversal, or enumerating all words under a node. If a problem only ever asks "is this exact word present?", reaching for a trie is over-engineering and you should say so.',
    },
    {
      heading: 'The memory problem, and the fix',
      body:
        'A 26-pointer array per node is wasteful when the branching is sparse — an English dictionary leaves most slots empty. Swap the array for a hash map from character to node and memory drops sharply at a small constant-factor cost in speed. For very large static dictionaries, real systems compress single-child chains into one node, which is a radix tree. Naming that trade-off is a strong signal.',
    },
    {
      heading: 'Tries pair with DFS',
      body:
        'The strongest use of a trie is running it alongside another search. In grid word search you walk the board and the trie simultaneously: the moment the current path is not a prefix in the trie, the whole branch is dead and you prune it. That converts "run word search once per word" into one traversal, and it is the highest-value idea in this topic.',
    },
  ],

  questionTypes: [
    {
      id: 'trie-basics',
      name: 'Insert, search, and prefix queries',
      signal:
        'Many words stored once and queried repeatedly, especially with startsWith or autocomplete. Build once in O(total characters), then answer each query in O(word length).',
      time: 'O(k) per operation',
      space: 'O(total characters × alphabet)',
      template: {
        cpp: `void insert(const string& w) {
  TrieNode* cur = root;
  for (char c : w) {
    int i = c - 'a';
    if (!cur->next[i]) cur->next[i] = new TrieNode();
    cur = cur->next[i];
  }
  cur->isWord = true;                 // mark the END, not just the path
}

TrieNode* walk(const string& p) {     // shared by search and startsWith
  TrieNode* cur = root;
  for (char c : p) {
    cur = cur->next[c - 'a'];
    if (!cur) return nullptr;
  }
  return cur;
}`,
        java: `void insert(String w) {
  TrieNode cur = root;
  for (char c : w.toCharArray()) {
    int i = c - 'a';
    if (cur.next[i] == null) cur.next[i] = new TrieNode();
    cur = cur.next[i];
  }
  cur.isWord = true;
}

TrieNode walk(String p) {
  TrieNode cur = root;
  for (char c : p.toCharArray()) {
    cur = cur.next[c - 'a'];
    if (cur == null) return null;
  }
  return cur;
}`,
      },
      taught: {
        lc: 208,
        title: 'Implement Trie (Prefix Tree)',
        slug: 'implement-trie-prefix-tree',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'search and startsWith are the same walk — they differ only in what they check at the end. Factor the walk out and both become one line.',
        companies: ['google', 'amazon', 'microsoft'],
        whyThisOne:
          'It is the foundation every other trie problem assumes, and the shared-walk refactor is exactly the kind of small design choice interviewers notice.',
        walkthrough: {
          howToSeeIt: [
            'Design the node first. It needs a child per character and a flag saying "a stored word ends here". Both are required — with only children you cannot tell a word from a prefix.',
            'Insert walks the word, creating missing nodes as it goes, and sets isWord at the final node. O(k) regardless of dictionary size, which is the property that makes tries worth the memory.',
            'search and startsWith share the entire walk. Factor it into one helper returning the node reached or null. Then search is "node exists AND isWord", startsWith is "node exists". Two one-liners.',
            'State the memory cost honestly: 26 pointers per node, so a large dictionary is expensive, and a hash map per node trades speed for space.',
          ],
          wherePeopleLoseIt:
            'Omitting isWord and returning true from search whenever the walk completes — then "app" is reported present merely because "apple" was inserted. The other is duplicating the walk in both methods, which is not wrong but is the kind of avoidable repetition a reviewer will flag.',
          time: 'O(k) per operation.',
          space: 'O(total characters × 26).',
          code: {
            cpp: `class Trie {
  struct Node {
    Node* next[26] = {};
    bool isWord = false;
  };
  Node* root;

  Node* walk(const string& s) {          // shared by search and startsWith
    Node* cur = root;
    for (char c : s) {
      cur = cur->next[c - 'a'];
      if (!cur) return nullptr;
    }
    return cur;
  }

public:
  Trie() : root(new Node()) {}

  void insert(string word) {
    Node* cur = root;
    for (char c : word) {
      int i = c - 'a';
      if (!cur->next[i]) cur->next[i] = new Node();
      cur = cur->next[i];
    }
    cur->isWord = true;                  // the flag that distinguishes word from prefix
  }

  bool search(string word)      { Node* n = walk(word);   return n && n->isWord; }
  bool startsWith(string prefix){ return walk(prefix) != nullptr; }
};`,
            java: `class Trie {
  private static class Node {
    Node[] next = new Node[26];
    boolean isWord = false;
  }

  private final Node root = new Node();

  private Node walk(String s) {
    Node cur = root;
    for (char c : s.toCharArray()) {
      cur = cur.next[c - 'a'];
      if (cur == null) return null;
    }
    return cur;
  }

  public void insert(String word) {
    Node cur = root;
    for (char c : word.toCharArray()) {
      int i = c - 'a';
      if (cur.next[i] == null) cur.next[i] = new Node();
      cur = cur.next[i];
    }
    cur.isWord = true;
  }

  public boolean search(String word)       { Node n = walk(word); return n != null && n.isWord; }
  public boolean startsWith(String prefix) { return walk(prefix) != null; }
}`,
          },
          followUp: 'Add delete — which needs a child counter or a reference count per node so you know when a node becomes safe to remove.',
        },
      },
      practice: [
        {
          lc: 648,
          title: 'Replace Words',
          slug: 'replace-words',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight: 'Walk each word and stop at the FIRST isWord node — that is the shortest root, which is exactly what the problem asks for.',
        },
        {
          lc: 1268,
          title: 'Search Suggestions System',
          slug: 'search-suggestions-system',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight:
            'Flipped: return the three lexicographically smallest completions per prefix. Either DFS from the prefix node, or sort the words and binary search — compare both.',
          companies: ['amazon'],
        },
      ],
    },

    {
      id: 'trie-wildcard',
      name: 'Wildcard and fuzzy matching',
      signal:
        'A search pattern containing "." or "any one character", or "differs by exactly one letter". The walk becomes a DFS, because a wildcard means branching into every child.',
      time: 'O(k) typical, O(26^k) worst case',
      space: 'O(k) recursion',
      template: {
        cpp: `bool dfs(TrieNode* node, const string& w, int i) {
  if (!node) return false;
  if (i == (int)w.size()) return node->isWord;

  if (w[i] != '.') return dfs(node->next[w[i] - 'a'], w, i + 1);

  for (int c = 0; c < 26; ++c)                    // wildcard: try every branch
    if (dfs(node->next[c], w, i + 1)) return true;

  return false;
}`,
        java: `boolean dfs(TrieNode node, String w, int i) {
  if (node == null) return false;
  if (i == w.length()) return node.isWord;

  char c = w.charAt(i);
  if (c != '.') return dfs(node.next[c - 'a'], w, i + 1);

  for (int j = 0; j < 26; j++)
    if (dfs(node.next[j], w, i + 1)) return true;

  return false;
}`,
      },
      taught: {
        lc: 211,
        title: 'Design Add and Search Words Data Structure',
        slug: 'design-add-and-search-words-data-structure',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 35,
        insight:
          'A wildcard turns a single walk into a branching search. Everything else stays a plain trie — only the search becomes recursive.',
        companies: ['google', 'meta', 'amazon'],
        whyThisOne:
          'It is the natural next step after the basic trie and shows the structure supporting a query type a hash set fundamentally cannot answer.',
        walkthrough: {
          howToSeeIt: [
            'Insertion is unchanged — wildcards appear only in queries, never in stored words. Say that explicitly; some candidates try to store them.',
            'Without a dot, search is the ordinary walk. With a dot at position i, every child of the current node is a candidate, so the walk forks.',
            'Write it recursively with the node and the index as parameters. A concrete character descends one child; a dot loops over all 26 and returns true if any branch succeeds.',
            'Two base cases. A null node fails. Reaching the end of the pattern succeeds only if isWord is set — the same word-versus-prefix distinction as before.',
          ],
          wherePeopleLoseIt:
            'Returning true at the end of the pattern without checking isWord, which matches prefixes instead of words. And forgetting the null guard at the top, which crashes when a wildcard branch hits an empty child. State the worst case honestly: a pattern of all dots explores the whole trie.',
          time: 'O(k) without wildcards, up to O(26^k) with them.',
          space: 'O(k) recursion depth.',
          code: {
            cpp: `class WordDictionary {
  struct Node {
    Node* next[26] = {};
    bool isWord = false;
  };
  Node* root;

  bool dfs(Node* node, const string& w, int i) {
    if (!node) return false;                          // dead branch
    if (i == (int)w.size()) return node->isWord;      // must be a WORD, not a prefix

    if (w[i] != '.') return dfs(node->next[w[i] - 'a'], w, i + 1);

    for (int c = 0; c < 26; ++c)                      // wildcard: fork
      if (dfs(node->next[c], w, i + 1)) return true;

    return false;
  }

public:
  WordDictionary() : root(new Node()) {}

  void addWord(string word) {
    Node* cur = root;
    for (char c : word) {
      int i = c - 'a';
      if (!cur->next[i]) cur->next[i] = new Node();
      cur = cur->next[i];
    }
    cur->isWord = true;
  }

  bool search(string word) { return dfs(root, word, 0); }
};`,
            java: `class WordDictionary {
  private static class Node {
    Node[] next = new Node[26];
    boolean isWord = false;
  }

  private final Node root = new Node();

  public void addWord(String word) {
    Node cur = root;
    for (char c : word.toCharArray()) {
      int i = c - 'a';
      if (cur.next[i] == null) cur.next[i] = new Node();
      cur = cur.next[i];
    }
    cur.isWord = true;
  }

  public boolean search(String word) { return dfs(root, word, 0); }

  private boolean dfs(Node node, String w, int i) {
    if (node == null) return false;
    if (i == w.length()) return node.isWord;

    char c = w.charAt(i);
    if (c != '.') return dfs(node.next[c - 'a'], w, i + 1);

    for (int j = 0; j < 26; j++)
      if (dfs(node.next[j], w, i + 1)) return true;

    return false;
  }
}`,
          },
          followUp: 'Bucket words by length first, so a query only searches tries of the matching length — a big practical win when wildcards dominate.',
        },
      },
      practice: [
        {
          lc: 676,
          title: 'Implement Magic Dictionary',
          slug: 'implement-magic-dictionary',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'Exactly one substitution, so carry a "have I used my change yet" flag through the DFS. The branch is allowed once and only once.',
        },
        {
          lc: 720,
          title: 'Longest Word in Dictionary',
          slug: 'longest-word-in-dictionary',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped: every prefix must also be a word, so the DFS may only descend through nodes with isWord set. The constraint lives in the traversal, not the query.',
        },
      ],
    },

    {
      id: 'trie-with-dfs',
      name: 'Trie combined with another search',
      signal:
        'Many words matched against a grid, a stream, or a set of numbers at once. Walk the trie in lockstep with the other traversal and prune the instant the prefix dies.',
      time: 'O(cells × 4^L) with heavy pruning',
      space: 'O(total characters)',
      googleHeavy: true,
      template: {
        cpp: `void dfs(int r, int c, TrieNode* node) {
  char ch = board[r][c];
  TrieNode* nxt = node->next[ch - 'a'];
  if (!nxt) return;                       // not a prefix of ANY word: prune the branch

  if (!nxt->word.empty()) { out.push_back(nxt->word); nxt->word.clear(); }  // dedup

  board[r][c] = '#';
  for (auto [dr, dc] : dirs) { /* recurse into bounds-checked neighbours */ }
  board[r][c] = ch;
}`,
        java: `void dfs(char[][] board, int r, int c, TrieNode node, List<String> out) {
  char ch = board[r][c];
  TrieNode nxt = node.next[ch - 'a'];
  if (nxt == null) return;

  if (nxt.word != null) { out.add(nxt.word); nxt.word = null; }

  board[r][c] = '#';
  // recurse into the four neighbours
  board[r][c] = ch;
}`,
      },
      taught: {
        lc: 212,
        title: 'Word Search II',
        slug: 'word-search-ii',
        difficulty: 'hard',
        role: 'taught',
        estMinutes: 60,
        insight:
          'Do not run word search once per word. Put every word in a trie and walk the board ONCE — a path that is no longer any word\'s prefix is abandoned immediately.',
        companies: ['google', 'amazon', 'meta'],
        whyThisOne:
          'The definitive demonstration of a trie as a pruning oracle, and the single most-asked Hard in this topic.',
        walkthrough: {
          howToSeeIt: [
            'The obvious approach runs LC 79 once per word: O(words × cells × 4^L). With many words that is hopeless, and the repeated work is obvious — every word re-explores the same board paths.',
            'Invert it. Walk the board once, and at each step ask the dictionary "is my current path still a prefix of anything?". A trie answers that in O(1) per character.',
            'So the DFS carries a trie node alongside the grid position. Move to a neighbour only if the trie has an edge for that letter. The moment it does not, the entire branch is dead — this prune is what makes the algorithm practical.',
            'Store the complete word ON the terminal node rather than rebuilding it from the path, and clear it after collecting so duplicates cannot occur. Optionally prune fully-consumed leaves to shrink the trie as you go.',
          ],
          wherePeopleLoseIt:
            'Collecting into a set to handle duplicates instead of clearing the stored word — correct, but it hides that you did not notice the cleaner fix. The bigger error is checking the trie AFTER recursing rather than before: the prune must happen on entry, or you are doing plain backtracking with extra steps.',
          time: 'O(cells × 4^L) worst case, far less in practice because of pruning.',
          space: 'O(total characters in the dictionary).',
          code: {
            cpp: `class Solution {
  struct Node {
    Node* next[26] = {};
    string word;                        // the whole word, stored at its end node
  };

  vector<string> out;
  int R, C;

  void dfs(vector<vector<char>>& board, int r, int c, Node* node) {
    if (r < 0 || r >= R || c < 0 || c >= C) return;

    char ch = board[r][c];
    if (ch == '#') return;                     // already on the current path

    Node* nxt = node->next[ch - 'a'];
    if (!nxt) return;                          // PRUNE: not a prefix of any word

    if (!nxt->word.empty()) {
      out.push_back(nxt->word);
      nxt->word.clear();                       // collect once, no set needed
    }

    board[r][c] = '#';
    dfs(board, r + 1, c, nxt);
    dfs(board, r - 1, c, nxt);
    dfs(board, r, c + 1, nxt);
    dfs(board, r, c - 1, nxt);
    board[r][c] = ch;                          // restore, always
  }

public:
  vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
    Node* root = new Node();
    for (const string& w : words) {            // build the trie once
      Node* cur = root;
      for (char c : w) {
        int i = c - 'a';
        if (!cur->next[i]) cur->next[i] = new Node();
        cur = cur->next[i];
      }
      cur->word = w;
    }

    R = (int)board.size(); C = (int)board[0].size();
    for (int r = 0; r < R; ++r)
      for (int c = 0; c < C; ++c)
        dfs(board, r, c, root);                // ONE traversal for all words

    return out;
  }
};`,
            java: `class Solution {
  private static class Node {
    Node[] next = new Node[26];
    String word = null;
  }

  private final List<String> out = new ArrayList<>();

  public List<String> findWords(char[][] board, String[] words) {
    Node root = new Node();
    for (String w : words) {
      Node cur = root;
      for (char c : w.toCharArray()) {
        int i = c - 'a';
        if (cur.next[i] == null) cur.next[i] = new Node();
        cur = cur.next[i];
      }
      cur.word = w;
    }

    for (int r = 0; r < board.length; r++)
      for (int c = 0; c < board[0].length; c++)
        dfs(board, r, c, root);

    return out;
  }

  private void dfs(char[][] board, int r, int c, Node node) {
    if (r < 0 || r >= board.length || c < 0 || c >= board[0].length) return;

    char ch = board[r][c];
    if (ch == '#') return;

    Node nxt = node.next[ch - 'a'];
    if (nxt == null) return;

    if (nxt.word != null) { out.add(nxt.word); nxt.word = null; }

    board[r][c] = '#';
    dfs(board, r + 1, c, nxt);
    dfs(board, r - 1, c, nxt);
    dfs(board, r, c + 1, nxt);
    dfs(board, r, c - 1, nxt);
    board[r][c] = ch;
  }
}`,
          },
          followUp: 'Prune the trie as you go — delete leaf nodes once their word is collected, so later board positions search a progressively smaller dictionary.',
        },
      },
      practice: [
        {
          lc: 421,
          title: 'Maximum XOR of Two Numbers in an Array',
          slug: 'maximum-xor-of-two-numbers-in-an-array',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 45,
          insight:
            'A BINARY trie over the bits of each number. Greedily walk toward the opposite bit at every level to maximise the XOR. Shows a trie is about prefixes, not letters.',
          companies: ['google'],
        },
        {
          lc: 1032,
          title: 'Stream of Characters',
          slug: 'stream-of-characters',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 40,
          insight:
            'Flipped: queries arrive one character at a time and match SUFFIXES, so store every word REVERSED and walk the recent stream backwards.',
          companies: ['google'],
        },
      ],
    },
  ],
};
