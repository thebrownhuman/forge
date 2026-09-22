import type { Topic } from '../../schema';

export const recursion: Topic = {
  id: 'recursion',
  name: 'Recursion & Backtracking',
  phase: 2,
  estHours: 12,
  prerequisites: ['arrays'],

  whyItMatters:
    'Backtracking is how you enumerate every possibility without writing nested loops you cannot count in advance. Every subsets, permutations and combinations question is the same three-line skeleton with a different choice set — and once you see that, a whole class of intimidating problems becomes mechanical. It is also the foundation for trees, graphs and DP: all three are recursion with different bookkeeping.',

  fundamentals: [
    {
      heading: 'Choose, explore, un-choose',
      body:
        'Every backtracking function has the same body: for each available choice, make it, recurse, then undo it. The undo is what makes it "backtracking" — you are reusing one mutable path buffer instead of copying state down every branch, which is why the memory stays O(depth) rather than O(number of solutions). If you forget the undo, later branches inherit choices they never made.',
      code: {
        cpp: `void backtrack(State& path) {
  if (isComplete(path)) { record(path); return; }

  for (auto choice : choices(path)) {
    path.push_back(choice);   // choose
    backtrack(path);          // explore
    path.pop_back();          // UN-choose — the line people forget
  }
}`,
        java: `void backtrack(List<Integer> path) {
  if (isComplete(path)) { out.add(new ArrayList<>(path)); return; }

  for (int choice : choices(path)) {
    path.add(choice);
    backtrack(path);
    path.remove(path.size() - 1);
  }
}`,
      },
    },
    {
      heading: 'Three questions that define any backtracking problem',
      body:
        'Before writing code, answer these out loud. (1) What is a complete solution — when do I record and stop? (2) What choices exist at this step — the loop bounds? (3) What makes a choice invalid — the prune? Nearly every bug is one of these three being wrong, and stating them first turns an unfamiliar problem into a template fill-in.',
    },
    {
      heading: 'Copy at the leaf, not along the path',
      body:
        'When you record a solution you must COPY the path, because the buffer keeps mutating after you return. In Java that is new ArrayList<>(path); in C++ pushing the vector by value copies it already. Forgetting this gives an output full of identical empty lists — one of the most confusing wrong answers in this topic, because the algorithm is right and only the recording is broken.',
    },
    {
      heading: 'Counting the cost honestly',
      body:
        'Subsets are O(n · 2^n): there are 2^n of them and copying each costs O(n). Permutations are O(n · n!). These are not failures — the output itself is that large, so no algorithm can do better. Say it that way in an interview: "the complexity is output-bound". What you CAN improve is pruning invalid branches early, which changes the constant and often the practical runtime enormously.',
      costs: [
        { op: 'subsets', cost: 'O(n · 2^n)', note: 'output-bound' },
        { op: 'permutations', cost: 'O(n · n!)', note: 'output-bound' },
        { op: 'combinations C(n,k)', cost: 'O(k · C(n,k))', note: '' },
        { op: 'recursion stack', cost: 'O(depth)', note: 'always mention it' },
      ],
    },
  ],

  questionTypes: [
    {
      id: 'subsets',
      name: 'Subsets — include or exclude',
      signal:
        '"All subsets", "power set", "all combinations of any length". Each element has exactly two fates: in or out. The start index prevents re-picking earlier elements and therefore prevents duplicate sets.',
      time: 'O(n · 2^n)',
      space: 'O(n) excluding output',
      template: {
        cpp: `void go(int start, vector<int>& path) {
  out.push_back(path);                 // EVERY node is a valid subset
  for (int i = start; i < n; ++i) {
    path.push_back(a[i]);
    go(i + 1, path);                   // i + 1: never look back
    path.pop_back();
  }
}`,
        java: `void go(int start, List<Integer> path) {
  out.add(new ArrayList<>(path));
  for (int i = start; i < n; i++) {
    path.add(a[i]);
    go(i + 1, path);
    path.remove(path.size() - 1);
  }
}`,
      },
      taught: {
        lc: 78,
        title: 'Subsets',
        slug: 'subsets',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'Record at EVERY node, not just at the leaves — every prefix of the path is itself a valid subset. The start index is what makes each subset appear once.',
        companies: ['google', 'meta', 'amazon'],
        whyThisOne:
          'The simplest complete backtracking skeleton, and the record-at-every-node detail distinguishes it from permutations in a way that clarifies both.',
        walkthrough: {
          howToSeeIt: [
            'Answer the three questions. Complete: every node is complete, since subsets of all lengths count. Choices: any element after the last one taken. Invalid: nothing — every subset is valid.',
            'Because every node is complete, the record happens at the TOP of the function rather than inside a base case. That is the structural difference from most backtracking problems and the thing to notice.',
            'The start index enforces order. Recursing with i + 1 means you only ever extend with later elements, so {1,2} is generated but {2,1} is not — they are the same subset, and you want it once.',
            'There is no explicit base case. The loop simply does not run when start reaches n, which returns naturally. Adding an if for it is harmless but unnecessary.',
          ],
          wherePeopleLoseIt:
            'Recursing with start + 1 instead of i + 1. It looks almost identical and silently generates the wrong family of subsets — i + 1 says "continue after the element I just took", start + 1 says "continue after where this level began", which ignores the loop entirely. Trace n = 3 by hand once.',
          time: 'O(n · 2^n) — output-bound.',
          space: 'O(n) recursion depth, excluding the output.',
          code: {
            cpp: `vector<vector<int>> subsets(vector<int>& nums) {
  vector<vector<int>> out;
  vector<int> path;

  function<void(int)> go = [&](int start) {
    out.push_back(path);                 // every node is a subset

    for (int i = start; i < (int)nums.size(); ++i) {
      path.push_back(nums[i]);           // choose
      go(i + 1);                         // explore — i + 1, not start + 1
      path.pop_back();                   // un-choose
    }
  };

  go(0);
  return out;
}`,
            java: `public List<List<Integer>> subsets(int[] nums) {
  List<List<Integer>> out = new ArrayList<>();
  go(nums, 0, new ArrayList<>(), out);
  return out;
}

private void go(int[] nums, int start, List<Integer> path, List<List<Integer>> out) {
  out.add(new ArrayList<>(path));        // COPY, or every entry mutates

  for (int i = start; i < nums.length; i++) {
    path.add(nums[i]);
    go(nums, i + 1, path, out);
    path.remove(path.size() - 1);
  }
}`,
          },
          followUp: 'Do it iteratively with bitmasks — each of the 2^n integers encodes which elements are in. And handle duplicates, which is LC 90.',
        },
      },
      practice: [
        {
          lc: 90,
          title: 'Subsets II',
          slug: 'subsets-ii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight: 'Sort, then skip i > start && a[i] == a[i-1]. The i > start part is essential — it allows duplicates WITHIN a path while blocking duplicate paths.',
        },
        {
          lc: 784,
          title: 'Letter Case Permutation',
          slug: 'letter-case-permutation',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight: 'Flipped: the binary choice is upper or lower rather than in or out, and digits offer no choice at all. Same tree, different branching.',
        },
      ],
    },

    {
      id: 'permutations',
      name: 'Permutations — order matters',
      signal:
        '"All orderings", "arrangements", "permutations". Unlike subsets, every element is used exactly once and position matters, so the loop restarts from 0 each level and a used[] array prevents reuse.',
      time: 'O(n · n!)',
      space: 'O(n)',
      template: {
        cpp: `void go(vector<int>& path, vector<bool>& used) {
  if ((int)path.size() == n) { out.push_back(path); return; }

  for (int i = 0; i < n; ++i) {         // from 0 every time, not from start
    if (used[i]) continue;
    used[i] = true;  path.push_back(a[i]);
    go(path, used);
    path.pop_back(); used[i] = false;
  }
}`,
        java: `void go(List<Integer> path, boolean[] used) {
  if (path.size() == n) { out.add(new ArrayList<>(path)); return; }

  for (int i = 0; i < n; i++) {
    if (used[i]) continue;
    used[i] = true;  path.add(a[i]);
    go(path, used);
    path.remove(path.size() - 1); used[i] = false;
  }
}`,
      },
      taught: {
        lc: 46,
        title: 'Permutations',
        slug: 'permutations',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'No start index — order matters, so every unused element is a candidate at every level. A used[] array replaces the index as the thing preventing reuse.',
        companies: ['google', 'meta', 'amazon'],
        whyThisOne:
          'Placing it immediately after subsets makes the one structural difference unmissable: start index means combinations, used[] means permutations.',
        walkthrough: {
          howToSeeIt: [
            'Three questions again. Complete: when the path holds all n elements. Choices: any element not yet used. Invalid: already used.',
            'Contrast with subsets. There, {1,2} and {2,1} were the same answer, so a start index suppressed one. Here they are different answers, so the loop must scan all n positions every level.',
            'Something still has to stop reuse within one path — that is the used[] array. Mark on the way down, unmark on the way back, exactly mirroring push and pop.',
            'The base case is now real, because only full-length paths count. Record and return there, unlike subsets which recorded everywhere.',
          ],
          wherePeopleLoseIt:
            'Forgetting to reset used[i] = false during the undo. The first branch then poisons every later one and you get a fraction of the expected output. Pair every mutation with its undo on adjacent lines so the symmetry is visible.',
          time: 'O(n · n!) — output-bound.',
          space: 'O(n) for the path, used[] and the stack.',
          code: {
            cpp: `vector<vector<int>> permute(vector<int>& nums) {
  int n = (int)nums.size();
  vector<vector<int>> out;
  vector<int> path;
  vector<bool> used(n, false);

  function<void()> go = [&]() {
    if ((int)path.size() == n) { out.push_back(path); return; }

    for (int i = 0; i < n; ++i) {       // start from 0 every level
      if (used[i]) continue;

      used[i] = true;                   // choose
      path.push_back(nums[i]);

      go();                             // explore

      path.pop_back();                  // un-choose, BOTH parts
      used[i] = false;
    }
  };

  go();
  return out;
}`,
            java: `public List<List<Integer>> permute(int[] nums) {
  List<List<Integer>> out = new ArrayList<>();
  go(nums, new ArrayList<>(), new boolean[nums.length], out);
  return out;
}

private void go(int[] nums, List<Integer> path, boolean[] used, List<List<Integer>> out) {
  if (path.size() == nums.length) { out.add(new ArrayList<>(path)); return; }

  for (int i = 0; i < nums.length; i++) {
    if (used[i]) continue;

    used[i] = true;
    path.add(nums[i]);

    go(nums, path, used, out);

    path.remove(path.size() - 1);
    used[i] = false;
  }
}`,
          },
          followUp: 'Do it by swapping in place, which removes the used[] array entirely — and explain why that version generates permutations in a different order.',
        },
      },
      practice: [
        {
          lc: 47,
          title: 'Permutations II',
          slug: 'permutations-ii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight:
            'Sort, then skip i > 0 && a[i] == a[i-1] && !used[i-1]. The !used[i-1] clause is subtle — it enforces that equal values are consumed left to right.',
        },
        {
          lc: 31,
          title: 'Next Permutation',
          slug: 'next-permutation',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight:
            'Flipped entirely: no recursion at all. Find the rightmost ascent, swap with its next-larger successor, reverse the tail. Pure O(n) index work, and asked constantly.',
          companies: ['google', 'meta'],
        },
      ],
    },

    {
      id: 'combination-target',
      name: 'Combinations toward a target',
      signal:
        '"Sum to target", "choose k that satisfy X", "all ways to make change with distinct combinations". A running total plus pruning when it overshoots.',
      time: 'exponential, heavily reduced by pruning',
      space: 'O(target / min element)',
      template: {
        cpp: `void go(int start, int remaining, vector<int>& path) {
  if (remaining == 0) { out.push_back(path); return; }
  if (remaining < 0)  return;                       // prune

  for (int i = start; i < n; ++i) {
    if (a[i] > remaining) break;                    // sorted: everything later is worse
    path.push_back(a[i]);
    go(i, remaining - a[i], path);                  // i, not i+1: reuse allowed
    path.pop_back();
  }
}`,
        java: `void go(int start, int remaining, List<Integer> path) {
  if (remaining == 0) { out.add(new ArrayList<>(path)); return; }
  if (remaining < 0) return;

  for (int i = start; i < a.length; i++) {
    if (a[i] > remaining) break;
    path.add(a[i]);
    go(i, remaining - a[i], path);
    path.remove(path.size() - 1);
  }
}`,
      },
      taught: {
        lc: 39,
        title: 'Combination Sum',
        slug: 'combination-sum',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 35,
        insight:
          'Recurse with i rather than i + 1 to allow reusing the same number, while the start index still prevents the same COMBINATION appearing in a different order.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'The i-versus-i+1 decision is the single most transferable detail in this topic, and this problem makes its meaning explicit rather than incidental.',
        walkthrough: {
          howToSeeIt: [
            'Three questions. Complete: remaining hits exactly 0. Choices: any candidate from start onward. Invalid: remaining goes negative.',
            'Unlimited reuse is allowed, so after taking a[i] you may take it again — recurse with i, not i + 1. That single character is the difference between this and LC 40.',
            'Keep the start index anyway. Without it you would generate [2,3] and [3,2] as separate answers, and the problem wants combinations, not orderings.',
            'Sort the candidates and break out of the loop once a[i] exceeds the remainder. Since everything later is at least as large, no later branch can succeed — this prune is what makes the runtime practical.',
          ],
          wherePeopleLoseIt:
            'Recursing with i + 1 out of habit, which silently solves the no-reuse problem instead. Both produce plausible output, so the mistake survives casual testing. Say out loud which problem you are solving before writing that argument.',
          time: 'Exponential in the worst case; pruning dominates in practice.',
          space: 'O(target / smallest candidate).',
          code: {
            cpp: `vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
  sort(candidates.begin(), candidates.end());        // enables the break prune
  vector<vector<int>> out;
  vector<int> path;

  function<void(int,int)> go = [&](int start, int remaining) {
    if (remaining == 0) { out.push_back(path); return; }

    for (int i = start; i < (int)candidates.size(); ++i) {
      if (candidates[i] > remaining) break;          // sorted: stop, do not continue

      path.push_back(candidates[i]);
      go(i, remaining - candidates[i]);              // i => reuse allowed
      path.pop_back();
    }
  };

  go(0, target);
  return out;
}`,
            java: `public List<List<Integer>> combinationSum(int[] candidates, int target) {
  Arrays.sort(candidates);
  List<List<Integer>> out = new ArrayList<>();
  go(candidates, 0, target, new ArrayList<>(), out);
  return out;
}

private void go(int[] c, int start, int remaining, List<Integer> path, List<List<Integer>> out) {
  if (remaining == 0) { out.add(new ArrayList<>(path)); return; }

  for (int i = start; i < c.length; i++) {
    if (c[i] > remaining) break;

    path.add(c[i]);
    go(c, i, remaining - c[i], path, out);
    path.remove(path.size() - 1);
  }
}`,
          },
          followUp: 'Count the combinations instead of listing them — that is a DP problem (coin change 2), and the difference between counting and listing is why one is polynomial and the other is not.',
        },
      },
      practice: [
        {
          lc: 40,
          title: 'Combination Sum II',
          slug: 'combination-sum-ii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight: 'Each candidate used once (i + 1) AND duplicates in the input, so you need both the index bump and the i > start skip. The two rules together.',
        },
        {
          lc: 216,
          title: 'Combination Sum III',
          slug: 'combination-sum-iii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'Flipped: fixed length k from the digits 1 to 9, so there are two stopping conditions — the sum AND the length. Prune on both.',
        },
      ],
    },

    {
      id: 'grid-backtracking',
      name: 'Backtracking on a grid or board',
      signal:
        'Place pieces, fill a board, or search for a path through a 2-D grid — N-Queens, Sudoku, word search. Mark a cell, recurse into neighbours, unmark on the way out.',
      time: 'exponential',
      space: 'O(cells)',
      googleHeavy: true,
      template: {
        cpp: `bool go(int r, int c, int k) {
  if (k == (int)word.size()) return true;
  if (r < 0 || r >= R || c < 0 || c >= C) return false;
  if (board[r][c] != word[k]) return false;

  char saved = board[r][c];
  board[r][c] = '#';                                   // mark visited in place
  bool found = go(r+1,c,k+1) || go(r-1,c,k+1)
            || go(r,c+1,k+1) || go(r,c-1,k+1);
  board[r][c] = saved;                                 // restore
  return found;
}`,
        java: `boolean go(char[][] board, String word, int r, int c, int k) {
  if (k == word.length()) return true;
  if (r < 0 || r >= board.length || c < 0 || c >= board[0].length) return false;
  if (board[r][c] != word.charAt(k)) return false;

  char saved = board[r][c];
  board[r][c] = '#';
  boolean found = go(board, word, r+1, c, k+1) || go(board, word, r-1, c, k+1)
               || go(board, word, r, c+1, k+1) || go(board, word, r, c-1, k+1);
  board[r][c] = saved;
  return found;
}`,
      },
      taught: {
        lc: 79,
        title: 'Word Search',
        slug: 'word-search',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          'Mark the cell in the board itself instead of carrying a visited set, then restore it on the way out. O(1) extra space per cell and no allocation.',
        companies: ['google', 'meta', 'amazon'],
        whyThisOne:
          'It joins backtracking to grid traversal, which is the bridge to the graph topic, and the mark-in-place trick is reused constantly in Phase 3.',
        walkthrough: {
          howToSeeIt: [
            'A path may revisit no cell, so you need a visited marker. A separate boolean grid works; mutating the board in place is cheaper and is the expected answer.',
            'Order the guards carefully: bounds first, then character match, then recurse. Checking the character before the bounds reads out of the array.',
            'Save the character, overwrite with a sentinel that cannot match any letter, recurse in four directions, then restore. The restore is the backtracking step — without it, a failed branch permanently damages the board for every later attempt.',
            'Short-circuit evaluation with || means the recursion stops at the first success, which is both correct and a large practical speedup.',
          ],
          wherePeopleLoseIt:
            'Restoring only on failure. The restore must happen on every path out of the function, success included, or the caller sees a corrupted board — and the bug only appears when the same starting cell is tried again. Write the restore immediately after the recursion, before any return.',
          time: 'O(R · C · 4^L) where L is the word length.',
          space: 'O(L) recursion depth.',
          code: {
            cpp: `bool exist(vector<vector<char>>& board, string word) {
  int R = (int)board.size(), C = (int)board[0].size();

  function<bool(int,int,int)> go = [&](int r, int c, int k) -> bool {
    if (k == (int)word.size()) return true;                 // consumed the word
    if (r < 0 || r >= R || c < 0 || c >= C) return false;   // bounds BEFORE access
    if (board[r][c] != word[k]) return false;

    char saved = board[r][c];
    board[r][c] = '#';                                      // mark

    bool found = go(r + 1, c, k + 1) || go(r - 1, c, k + 1)
              || go(r, c + 1, k + 1) || go(r, c - 1, k + 1);

    board[r][c] = saved;                                    // ALWAYS restore
    return found;
  };

  for (int r = 0; r < R; ++r)
    for (int c = 0; c < C; ++c)
      if (go(r, c, 0)) return true;

  return false;
}`,
            java: `public boolean exist(char[][] board, String word) {
  for (int r = 0; r < board.length; r++)
    for (int c = 0; c < board[0].length; c++)
      if (go(board, word, r, c, 0)) return true;
  return false;
}

private boolean go(char[][] board, String word, int r, int c, int k) {
  if (k == word.length()) return true;
  if (r < 0 || r >= board.length || c < 0 || c >= board[0].length) return false;
  if (board[r][c] != word.charAt(k)) return false;

  char saved = board[r][c];
  board[r][c] = '#';

  boolean found = go(board, word, r + 1, c, k + 1) || go(board, word, r - 1, c, k + 1)
               || go(board, word, r, c + 1, k + 1) || go(board, word, r, c - 1, k + 1);

  board[r][c] = saved;
  return found;
}`,
          },
          followUp: 'Search for many words at once (LC 212) — a trie over the word list turns repeated scans into one traversal.',
        },
      },
      practice: [
        {
          lc: 51,
          title: 'N-Queens',
          slug: 'n-queens',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 55,
          insight: 'Place one queen per row, so conflicts reduce to three sets: columns, r+c diagonals and r-c anti-diagonals. Checking in O(1) is the whole craft.',
          companies: ['google'],
        },
        {
          lc: 37,
          title: 'Sudoku Solver',
          slug: 'sudoku-solver',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 60,
          insight:
            'Flipped: return a boolean up the stack to stop at the first solution rather than enumerating all. Constraint bitsets per row, column and box make it fast.',
        },
      ],
    },

    {
      id: 'string-partition',
      name: 'Partitioning a string or sequence',
      signal:
        '"Split into valid parts", "all palindrome partitions", "restore IP addresses", "generate valid parentheses". At each step choose how much to consume, then recurse on the rest.',
      time: 'exponential',
      space: 'O(n)',
      template: {
        cpp: `void go(int start, vector<string>& path) {
  if (start == (int)s.size()) { out.push_back(path); return; }

  for (int end = start; end < (int)s.size(); ++end) {     // choose a cut length
    if (!valid(start, end)) continue;
    path.push_back(s.substr(start, end - start + 1));
    go(end + 1, path);
    path.pop_back();
  }
}`,
        java: `void go(int start, List<String> path) {
  if (start == s.length()) { out.add(new ArrayList<>(path)); return; }

  for (int end = start; end < s.length(); end++) {
    if (!valid(start, end)) continue;
    path.add(s.substring(start, end + 1));
    go(end + 1, path);
    path.remove(path.size() - 1);
  }
}`,
      },
      taught: {
        lc: 131,
        title: 'Palindrome Partitioning',
        slug: 'palindrome-partitioning',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          'The choice at each step is where to make the next cut. Only cuts producing a palindrome are explored, so validity acts as the prune rather than a post-filter.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'It shows the choice being a LENGTH rather than an element, which is the variant people fail to see — and the DP precomputation follow-up is a natural bridge to Phase 3.',
        walkthrough: {
          howToSeeIt: [
            'Three questions. Complete: the whole string is consumed, start == n. Choices: every possible end position for the next piece. Invalid: the piece is not a palindrome.',
            'That makes the loop range over cut positions rather than over array elements — the structural difference from subsets, where the loop ranged over items.',
            'Check validity BEFORE recursing. Generating every partition and filtering afterwards is exponentially more work; pruning here removes whole subtrees.',
            'For the follow-up, precompute isPal[i][j] with an O(n^2) DP so each check is O(1) instead of O(n). That turns a repeated linear scan into a table lookup.',
          ],
          wherePeopleLoseIt:
            'Off-by-one on the substring bounds — the piece runs from start to end inclusive, so the length is end - start + 1 and the recursion continues at end + 1. Getting either wrong produces overlapping or skipped characters, and the output looks almost right.',
          time: 'O(n · 2^n) worst case.',
          space: 'O(n) depth, plus O(n^2) if you precompute the palindrome table.',
          code: {
            cpp: `vector<vector<string>> partition(string s) {
  int n = (int)s.size();
  vector<vector<string>> out;
  vector<string> path;

  auto isPal = [&](int i, int j) {
    while (i < j) if (s[i++] != s[j--]) return false;
    return true;
  };

  function<void(int)> go = [&](int start) {
    if (start == n) { out.push_back(path); return; }

    for (int end = start; end < n; ++end) {          // choose the cut point
      if (!isPal(start, end)) continue;              // prune, do not post-filter

      path.push_back(s.substr(start, end - start + 1));
      go(end + 1);
      path.pop_back();
    }
  };

  go(0);
  return out;
}`,
            java: `public List<List<String>> partition(String s) {
  List<List<String>> out = new ArrayList<>();
  go(s, 0, new ArrayList<>(), out);
  return out;
}

private void go(String s, int start, List<String> path, List<List<String>> out) {
  if (start == s.length()) { out.add(new ArrayList<>(path)); return; }

  for (int end = start; end < s.length(); end++) {
    if (!isPal(s, start, end)) continue;

    path.add(s.substring(start, end + 1));
    go(s, end + 1, path, out);
    path.remove(path.size() - 1);
  }
}

private boolean isPal(String s, int i, int j) {
  while (i < j) if (s.charAt(i++) != s.charAt(j--)) return false;
  return true;
}`,
          },
          followUp: 'Find the MINIMUM number of cuts instead of listing all partitions (LC 132) — that is DP, because you need a value, not an enumeration.',
        },
      },
      practice: [
        {
          lc: 93,
          title: 'Restore IP Addresses',
          slug: 'restore-ip-addresses',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight: 'Cut length is capped at 3, exactly 4 parts are needed, and leading zeros are invalid. Three prunes that shrink the tree enormously.',
        },
        {
          lc: 22,
          title: 'Generate Parentheses',
          slug: 'generate-parentheses',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped: build rather than split. Two counters, and the rule that a close is legal only while close < open means invalid strings are never generated at all.',
          companies: ['google', 'amazon'],
        },
      ],
    },
  ],
};
