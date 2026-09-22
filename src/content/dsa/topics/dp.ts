import type { Topic } from '../../schema';

export const dp: Topic = {
  id: 'dp',
  name: 'Dynamic Programming',
  phase: 3,
  estHours: 35,
  prerequisites: ['recursion'],

  whyItMatters:
    'DP is the topic that decides most senior interview loops, and it is the one people fear most — usually because they try to memorise solutions instead of the recipe. There is a recipe. Define the state, write the recurrence, fix the base case, choose an evaluation order. Every problem below is that same four-step procedure with a different state. Learn the procedure and the ten shapes here, and DP stops being a wall.',

  fundamentals: [
    {
      heading: 'The four-step recipe — say it out loud every time',
      body:
        '1) STATE: what do I need to know to solve a subproblem? Name dp[i] or dp[i][j] in words, not symbols — "the fewest coins making amount a". 2) RECURRENCE: how does this state follow from smaller ones? 3) BASE CASE: the smallest input, answered directly. 4) ORDER: iterate so that every value is final before it is read. Writing these four lines before any code turns DP from inspiration into procedure, and it is what interviewers want to hear.',
    },
    {
      heading: 'Memoisation first, tabulation second',
      body:
        'Write the plain recursion, add a cache, and you are done — that is top-down DP and it is usually easier to get right because the recurrence is the code. Convert to bottom-up only when you need the speed or the space optimisation, since tabulation avoids stack depth and enables rolling arrays. Under interview pressure, memoised recursion is the safer first answer, and saying "I will memoise this, then convert if we need the space" is a strong opening.',
      code: {
        cpp: `// Top-down: the recurrence IS the code.
vector<int> memo(n + 1, -1);
int solve(int i) {
  if (i <= 1) return base(i);
  if (memo[i] != -1) return memo[i];
  return memo[i] = combine(solve(i - 1), solve(i - 2));
}

// Bottom-up: same recurrence, explicit order, no stack.
vector<int> dp(n + 1);
dp[0] = base(0); dp[1] = base(1);
for (int i = 2; i <= n; ++i) dp[i] = combine(dp[i - 1], dp[i - 2]);`,
        java: `int[] memo = new int[n + 1];
Arrays.fill(memo, -1);

int solve(int i) {
  if (i <= 1) return base(i);
  if (memo[i] != -1) return memo[i];
  return memo[i] = combine(solve(i - 1), solve(i - 2));
}`,
      },
      costs: [
        { op: 'states × transitions', cost: 'the total cost', note: 'always compute it this way' },
        { op: '1-D DP', cost: 'O(n)', note: 'often O(1) space with rolling variables' },
        { op: '2-D DP', cost: 'O(n·m)', note: 'often O(m) with a rolling row' },
        { op: 'bitmask DP', cost: 'O(2^n · n)', note: 'only viable for n around 20' },
      ],
    },
    {
      heading: 'Space optimisation is mechanical',
      body:
        'If dp[i] only reads dp[i-1] and dp[i-2], you need two variables, not an array. If dp[i][j] only reads the previous row, you need one row, not a table. For 0/1 knapsack with a single row you must iterate the capacity DOWNWARD, or you reuse an item within the same iteration and silently solve the unbounded version instead. That direction rule is one of the most commonly asked details in the topic.',
    },
    {
      heading: 'Reading the constraints to guess the state',
      body:
        'Constraint sizes hint at the intended state. n up to 10^5 with a simple answer suggests 1-D DP or greedy. n up to 1000 suggests O(n^2), so a two-dimensional state. n up to 20 with subsets in the statement is bitmask DP, because 2^20 is about a million. A second small bound — "at most k transactions", "at most 100 capacity" — is usually an extra dimension of the state.',
    },
  ],

  questionTypes: [
    {
      id: 'dp-linear',
      name: '1-D DP along a sequence',
      signal:
        'A decision at each position that depends on one or two earlier positions — rob or skip, take or leave, climb one or two. State is a single index.',
      time: 'O(n)',
      space: 'O(1) after rolling',
      template: {
        cpp: `int prev2 = 0, prev1 = 0;                 // dp[i-2], dp[i-1]
for (int x : nums) {
  int cur = max(prev1, prev2 + x);        // skip, or take and add
  prev2 = prev1;
  prev1 = cur;
}
return prev1;`,
        java: `int prev2 = 0, prev1 = 0;
for (int x : nums) {
  int cur = Math.max(prev1, prev2 + x);
  prev2 = prev1;
  prev1 = cur;
}
return prev1;`,
      },
      taught: {
        lc: 198,
        title: 'House Robber',
        slug: 'house-robber',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'dp[i] is the best haul from the first i houses. At each house the only choice is take it and add dp[i-2], or skip it and keep dp[i-1].',
        companies: ['google', 'amazon'],
        whyThisOne:
          'The smallest problem with a genuine choice at every step, so the four-step recipe is visible end to end with nothing else in the way.',
        walkthrough: {
          howToSeeIt: [
            'STATE: dp[i] is the maximum money obtainable considering only the first i houses. Say it in words — vague states are why DP attempts fail.',
            'RECURRENCE: at house i there are exactly two options. Skip it, leaving dp[i-1]. Or rob it, which forbids house i-1 and gives nums[i] + dp[i-2]. Take the larger.',
            'BASE CASE: dp[0] = 0 with no houses, dp[1] = nums[0] with one. Getting these right is half the work.',
            'ORDER: left to right, since dp[i] reads only smaller indices. Then notice only the last two values are ever read, so two variables replace the array and space drops to O(1).',
          ],
          wherePeopleLoseIt:
            'Rolling the variables in the wrong order and overwriting prev1 before prev2 has copied it. Compute cur first, then shift. Second: greedily robbing alternate houses is not optimal — [2,1,1,2] gives 4 by robbing the ends, which no alternating rule finds.',
          time: 'O(n).',
          space: 'O(1).',
          code: {
            cpp: `int rob(vector<int>& nums) {
  int prev2 = 0;   // dp[i - 2]
  int prev1 = 0;   // dp[i - 1]

  for (int x : nums) {
    int cur = max(prev1, prev2 + x);   // skip house, or rob it
    prev2 = prev1;                     // shift AFTER computing cur
    prev1 = cur;
  }
  return prev1;
}`,
            java: `public int rob(int[] nums) {
  int prev2 = 0, prev1 = 0;

  for (int x : nums) {
    int cur = Math.max(prev1, prev2 + x);
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
}`,
          },
          followUp: 'Houses in a circle (LC 213) — run the linear version twice, once excluding the first house and once excluding the last, then take the better.',
        },
      },
      practice: [
        {
          lc: 213,
          title: 'House Robber II',
          slug: 'house-robber-ii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'A circle means the first and last conflict. Run the linear solver on two slices and take the max — reducing to a solved problem rather than inventing a new recurrence.',
        },
        {
          lc: 740,
          title: 'Delete and Earn',
          slug: 'delete-and-earn',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight:
            'Flipped and disguised: bucket the values by number, and taking value v forbids v-1 and v+1. It is House Robber over the value axis, not the index axis.',
        },
      ],
    },

    {
      id: 'dp-grid',
      name: '2-D grid paths',
      signal:
        '"How many paths", "minimum path sum", "can you reach the bottom right". State is the cell, and you arrive only from above or from the left.',
      time: 'O(R·C)',
      space: 'O(C) after rolling',
      template: {
        cpp: `vector<int> row(C, 0);
row[0] = grid[0][0];
for (int c = 1; c < C; ++c) row[c] = row[c - 1] + grid[0][c];   // first row

for (int r = 1; r < R; ++r) {
  row[0] += grid[r][0];                                          // first column
  for (int c = 1; c < C; ++c)
    row[c] = min(row[c], row[c - 1]) + grid[r][c];               // above vs left
}
return row[C - 1];`,
        java: `int[] row = new int[C];
row[0] = grid[0][0];
for (int c = 1; c < C; c++) row[c] = row[c - 1] + grid[0][c];

for (int r = 1; r < R; r++) {
  row[0] += grid[r][0];
  for (int c = 1; c < C; c++)
    row[c] = Math.min(row[c], row[c - 1]) + grid[r][c];
}
return row[C - 1];`,
      },
      taught: {
        lc: 64,
        title: 'Minimum Path Sum',
        slug: 'minimum-path-sum',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'Movement is restricted to right and down, so a cell is reachable only from above or from the left. With one rolling row, row[c] still holds the value from ABOVE when you read it.',
        companies: ['amazon', 'google'],
        whyThisOne:
          'It makes the rolling-array trick concrete: the not-yet-overwritten entry is exactly the previous row, and seeing that once makes every 2-D space optimisation obvious.',
        walkthrough: {
          howToSeeIt: [
            'STATE: dp[r][c] is the cheapest path from the start to cell (r, c). RECURRENCE: dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1]), because those are the only two predecessors.',
            'BASE CASE: the first row and first column each have a single possible path, so they are running prefix sums.',
            'ORDER: row by row, left to right, so both predecessors are already final when you read them.',
            'Space: dp[r] reads only dp[r-1], so keep one row. When updating row[c], the value still stored there is from the previous row — that is your "above" — and row[c-1] has already been updated this row, which is your "left". One array, both predecessors.',
          ],
          wherePeopleLoseIt:
            'Getting the rolling row backwards by updating right to left, which destroys the "left" value before it is read. Left to right is required here. Second: seeding row[0] for each new row with += rather than =, since the first column accumulates down the grid.',
          time: 'O(R·C).',
          space: 'O(C).',
          code: {
            cpp: `int minPathSum(vector<vector<int>>& grid) {
  int R = (int)grid.size(), C = (int)grid[0].size();
  vector<int> row(C, 0);

  row[0] = grid[0][0];
  for (int c = 1; c < C; ++c) row[c] = row[c - 1] + grid[0][c];   // first row only

  for (int r = 1; r < R; ++r) {
    row[0] += grid[r][0];                                         // first column
    for (int c = 1; c < C; ++c)
      // row[c] is still the value from ABOVE; row[c-1] is already the LEFT.
      row[c] = min(row[c], row[c - 1]) + grid[r][c];
  }
  return row[C - 1];
}`,
            java: `public int minPathSum(int[][] grid) {
  int R = grid.length, C = grid[0].length;
  int[] row = new int[C];

  row[0] = grid[0][0];
  for (int c = 1; c < C; c++) row[c] = row[c - 1] + grid[0][c];

  for (int r = 1; r < R; r++) {
    row[0] += grid[r][0];
    for (int c = 1; c < C; c++)
      row[c] = Math.min(row[c], row[c - 1]) + grid[r][c];
  }
  return row[C - 1];
}`,
          },
          followUp: 'Allow movement in all four directions and the DP collapses — it becomes Dijkstra, because the dependency graph now has cycles.',
        },
      },
      practice: [
        {
          lc: 62,
          title: 'Unique Paths',
          slug: 'unique-paths',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight: 'Counting instead of minimising, so the min becomes a sum. Also has a closed form as a binomial coefficient — mention it.',
        },
        {
          lc: 120,
          title: 'Triangle',
          slug: 'triangle',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped: work BOTTOM-UP and the two children merge into the parent, which removes all the edge cases that a top-down pass creates. Direction is a design choice.',
        },
      ],
    },

    {
      id: 'knapsack-01',
      name: '0/1 knapsack — each item used once',
      signal:
        '"Subset that sums to X", "partition into equal halves", "pick items within a capacity". Each item is taken at most once, so the capacity loop must run DOWNWARD.',
      time: 'O(n·W)',
      space: 'O(W)',
      googleHeavy: true,
      template: {
        cpp: `vector<bool> dp(W + 1, false);
dp[0] = true;                            // zero capacity is always achievable

for (int x : items)
  for (int w = W; w >= x; --w)           // DOWNWARD: each item used at most once
    dp[w] = dp[w] || dp[w - x];`,
        java: `boolean[] dp = new boolean[W + 1];
dp[0] = true;

for (int x : items)
  for (int w = W; w >= x; w--)
    dp[w] = dp[w] || dp[w - x];`,
      },
      taught: {
        lc: 416,
        title: 'Partition Equal Subset Sum',
        slug: 'partition-equal-subset-sum',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 45,
        insight:
          'Splitting into two equal halves means finding a subset summing to total/2 — that is 0/1 knapsack with a boolean value. The downward capacity loop is what enforces using each number once.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'It teaches the reduction to knapsack and contains the single most-asked DP detail: why the inner loop goes downward.',
        walkthrough: {
          howToSeeIt: [
            'Reduce first. Two subsets with equal sums each total half the overall sum, so an odd total is immediately impossible — check that and return early.',
            'STATE: dp[w] is true when some subset of the numbers seen so far sums exactly to w. RECURRENCE: dp[w] becomes true if it already was, or if dp[w - x] was true before this item.',
            'BASE CASE: dp[0] = true, because the empty subset sums to zero. Everything else starts false.',
            'ORDER: for each item, sweep the capacity DOWNWARD. Going upward would let dp[w - x], already updated with x in this same pass, be reused — which permits taking x twice and silently solves the unbounded problem instead.',
          ],
          wherePeopleLoseIt:
            'The loop direction. Upward compiles, runs, and answers a different question, so the failure is invisible until a test with a reusable element. Say the rule aloud while writing it: 0/1 goes down, unbounded goes up. Second: forget the odd-total early return and you waste work or return nonsense.',
          time: 'O(n · sum/2).',
          space: 'O(sum/2).',
          code: {
            cpp: `bool canPartition(vector<int>& nums) {
  int total = 0;
  for (int x : nums) total += x;
  if (total % 2 != 0) return false;        // odd cannot split evenly

  int target = total / 2;
  vector<bool> dp(target + 1, false);
  dp[0] = true;                            // empty subset

  for (int x : nums)
    for (int w = target; w >= x; --w)      // DOWNWARD — each number once
      if (dp[w - x]) dp[w] = true;

  return dp[target];
}`,
            java: `public boolean canPartition(int[] nums) {
  int total = 0;
  for (int x : nums) total += x;
  if (total % 2 != 0) return false;

  int target = total / 2;
  boolean[] dp = new boolean[target + 1];
  dp[0] = true;

  for (int x : nums)
    for (int w = target; w >= x; w--)
      if (dp[w - x]) dp[w] = true;

  return dp[target];
}`,
          },
          followUp: 'Return the actual subset, not just whether one exists — keep a 2-D table and walk backwards from dp[n][target] deciding at each step whether the item was used.',
        },
      },
      practice: [
        {
          lc: 494,
          title: 'Target Sum',
          slug: 'target-sum',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 45,
          insight:
            'Assigning plus and minus signs reduces to a subset-sum: the positive group must total (sum + target) / 2. Deriving that algebra is the whole problem.',
          companies: ['meta', 'google'],
        },
        {
          lc: 1049,
          title: 'Last Stone Weight II',
          slug: 'last-stone-weight-ii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 45,
          insight: 'Flipped: split the stones into two piles with the smallest possible difference, which is subset-sum as close to half as possible. Same machine, different objective.',
        },
      ],
    },

    {
      id: 'knapsack-unbounded',
      name: 'Unbounded knapsack — items reusable',
      signal:
        '"Unlimited coins", "any number of each", "fewest perfect squares". Each item may be reused, so the capacity loop runs UPWARD.',
      time: 'O(n·W)',
      space: 'O(W)',
      template: {
        cpp: `vector<long long> dp(W + 1, 0);
dp[0] = 1;                               // one way to make zero

for (int coin : coins)                   // coins OUTER => combinations
  for (int w = coin; w <= W; ++w)        // UPWARD: reuse allowed
    dp[w] += dp[w - coin];`,
        java: `long[] dp = new long[W + 1];
dp[0] = 1;

for (int coin : coins)
  for (int w = coin; w <= W; w++)
    dp[w] += dp[w - coin];`,
      },
      taught: {
        lc: 518,
        title: 'Coin Change II',
        slug: 'coin-change-ii',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 45,
        insight:
          'Loop order carries meaning. Coins in the OUTER loop counts combinations; amounts outside would count permutations, treating 1+2 and 2+1 as different.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'It is the one DP where the loop order changes the ANSWER rather than just the efficiency, and that distinction is asked directly and often.',
        walkthrough: {
          howToSeeIt: [
            'STATE: dp[w] is the number of ways to make amount w. BASE: dp[0] = 1, because there is exactly one way to make nothing — the empty selection.',
            'RECURRENCE: for each coin, dp[w] += dp[w - coin]. Upward, since coins may be reused within the same pass.',
            'Now the crucial part: put the COINS in the outer loop. Then each coin is fully considered before the next, so a combination is only ever counted in a fixed coin order, and 1+2 and 2+1 are the same.',
            'Reversing the loops counts each ordering separately, which answers a different question — that is LC 377. Both are correct code for different problems, which is exactly why this detail matters.',
          ],
          wherePeopleLoseIt:
            'Reversing the loops and over-counting. The code looks identical and the failure is conceptual, not syntactic. State which quantity you want before writing the loops. Second: the counts overflow 32-bit ints on larger inputs, so use a 64-bit accumulator.',
          time: 'O(coins × amount).',
          space: 'O(amount).',
          code: {
            cpp: `int change(int amount, vector<int>& coins) {
  vector<unsigned long long> dp(amount + 1, 0);
  dp[0] = 1;                                   // one way to make zero

  for (int coin : coins)                       // COINS outer => combinations
    for (int w = coin; w <= amount; ++w)       // UPWARD => reuse allowed
      dp[w] += dp[w - coin];

  return (int)dp[amount];
}`,
            java: `public int change(int amount, int[] coins) {
  long[] dp = new long[amount + 1];
  dp[0] = 1;

  for (int coin : coins)
    for (int w = coin; w <= amount; w++)
      dp[w] += dp[w - coin];

  return (int) dp[amount];
}`,
          },
          followUp: 'Swap the loops and you have LC 377, counting permutations. Be able to say which loop order gives which, without running it.',
        },
      },
      practice: [
        {
          lc: 279,
          title: 'Perfect Squares',
          slug: 'perfect-squares',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight: 'Unbounded knapsack where the items are the perfect squares up to n, minimising count. Also solvable as BFS over the number line — compare the two.',
        },
        {
          lc: 377,
          title: 'Combination Sum IV',
          slug: 'combination-sum-iv',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped loop order: the title says combinations but it counts PERMUTATIONS, so the amount goes outside. Solve it right after LC 518 to lock the distinction in.',
        },
      ],
    },

    {
      id: 'lis',
      name: 'Longest increasing subsequence',
      signal:
        '"Longest increasing subsequence", "maximum chain", "how many can be nested". The O(n^2) DP is the honest first answer; patience sorting with binary search gives O(n log n).',
      time: 'O(n^2) or O(n log n)',
      space: 'O(n)',
      googleHeavy: true,
      template: {
        cpp: `// O(n log n): tails[k] = smallest possible tail of an increasing run of length k+1
vector<int> tails;
for (int x : nums) {
  auto it = lower_bound(tails.begin(), tails.end(), x);
  if (it == tails.end()) tails.push_back(x);     // extends the longest run
  else *it = x;                                  // improves an existing run's tail
}
return (int)tails.size();                        // NOT the actual subsequence`,
        java: `List<Integer> tails = new ArrayList<>();
for (int x : nums) {
  int i = Collections.binarySearch(tails, x);
  if (i < 0) i = -(i + 1);
  if (i == tails.size()) tails.add(x);
  else tails.set(i, x);
}
return tails.size();`,
      },
      taught: {
        lc: 300,
        title: 'Longest Increasing Subsequence',
        slug: 'longest-increasing-subsequence',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 50,
        insight:
          'tails[k] holds the smallest tail value among all increasing subsequences of length k+1. Keeping tails as small as possible maximises what can follow, and the array is always sorted, so binary search applies.',
        companies: ['google', 'meta', 'amazon'],
        whyThisOne:
          'The O(n log n) version is a genuinely surprising algorithm, and knowing that the tails array is NOT the answer subsequence is the detail that separates understanding from memorising.',
        walkthrough: {
          howToSeeIt: [
            'Start with the O(n^2) DP and state it: dp[i] is the longest increasing subsequence ENDING at i, computed as 1 plus the best dp[j] over all j < i with nums[j] < nums[i]. Correct, simple, and the right opening answer.',
            'To improve it, change what you track. Keep tails, where tails[k] is the smallest tail value over all increasing subsequences of length k+1. A smaller tail is always at least as useful, since more values can extend it.',
            'tails is automatically sorted — a longer run must end at a value at least as large. So for each new x, binary search for the first tail >= x. If none exists, x extends the longest run and is appended; otherwise it replaces that tail, improving it.',
            'The ANSWER is the length of tails. The contents are not a valid subsequence of the input — they are a bookkeeping device. Stating that unprompted is a strong signal.',
          ],
          wherePeopleLoseIt:
            'Returning the tails array as the subsequence. It has the right length and usually wrong contents. To recover the actual sequence you must store a predecessor index per element and walk back. Second: strictly increasing uses lower_bound, non-decreasing uses upper_bound — pick deliberately.',
          time: 'O(n log n).',
          space: 'O(n).',
          code: {
            cpp: `int lengthOfLIS(vector<int>& nums) {
  vector<int> tails;                 // tails[k] = smallest tail of a length-(k+1) run

  for (int x : nums) {
    auto it = lower_bound(tails.begin(), tails.end(), x);   // strictly increasing

    if (it == tails.end()) tails.push_back(x);   // x extends the longest run
    else *it = x;                                // x improves this run's tail
  }
  return (int)tails.size();          // length only — tails is NOT the subsequence
}`,
            java: `public int lengthOfLIS(int[] nums) {
  List<Integer> tails = new ArrayList<>();

  for (int x : nums) {
    int i = Collections.binarySearch(tails, x);
    if (i < 0) i = -(i + 1);

    if (i == tails.size()) tails.add(x);
    else tails.set(i, x);
  }
  return tails.size();
}`,
          },
          followUp: 'Reconstruct the actual subsequence — store for each element the index of its predecessor when it was placed, then follow the chain back from the final append.',
        },
      },
      practice: [
        {
          lc: 354,
          title: 'Russian Doll Envelopes',
          slug: 'russian-doll-envelopes',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 55,
          insight:
            'Sort by width ascending and, for equal widths, height DESCENDING — that descending tie-break prevents two envelopes of the same width from nesting. Then LIS on heights.',
          companies: ['google'],
        },
        {
          lc: 673,
          title: 'Number of Longest Increasing Subsequence',
          slug: 'number-of-longest-increasing-subsequence',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 50,
          insight: 'Flipped to counting, which forces the O(n^2) DP with a second count array — the patience-sorting version cannot count. A good lesson in an optimisation losing information.',
        },
      ],
    },

    {
      id: 'two-sequence-dp',
      name: 'Two-sequence tables',
      signal:
        'Two strings or arrays compared — longest common subsequence, edit distance, interleaving. State is a pair of prefix lengths, dp[i][j].',
      time: 'O(n·m)',
      space: 'O(m) after rolling',
      googleHeavy: true,
      template: {
        cpp: `vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));

for (int i = 1; i <= n; ++i)
  for (int j = 1; j <= m; ++j)
    if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;   // match: consume both
    else                      dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);`,
        java: `int[][] dp = new int[n + 1][m + 1];

for (int i = 1; i <= n; i++)
  for (int j = 1; j <= m; j++)
    if (a.charAt(i - 1) == b.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1] + 1;
    else                                     dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);`,
      },
      taught: {
        lc: 1143,
        title: 'Longest Common Subsequence',
        slug: 'longest-common-subsequence',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 45,
        insight:
          'dp[i][j] is the answer for the first i characters of one string and the first j of the other. On a match, consume both and add one; otherwise try dropping one character from either side.',
        companies: ['google', 'amazon', 'microsoft'],
        whyThisOne:
          'The template for the entire two-sequence family. Edit distance, interleaving and shortest common supersequence are all this table with a different recurrence.',
        walkthrough: {
          howToSeeIt: [
            'STATE: dp[i][j] is the length of the longest common subsequence of a\'s first i characters and b\'s first j. Two prefix lengths, which is why the table is 2-D.',
            'RECURRENCE: if the current characters match, they can both be consumed and dp[i][j] = dp[i-1][j-1] + 1. If not, one of them must be discarded, so take the better of dp[i-1][j] and dp[i][j-1].',
            'BASE CASE: an empty prefix on either side gives 0. Sizing the table (n+1) by (m+1) makes row 0 and column 0 exactly those base cases, with no special handling inside the loops.',
            'ORDER: increasing i then increasing j, so all three predecessors are already computed. Space: each row reads only the previous row, so a rolling row works with one saved diagonal value.',
          ],
          wherePeopleLoseIt:
            'Index confusion between the table and the strings. dp[i][j] refers to characters a[i-1] and b[j-1], because the table is offset by one. Write that correspondence in a comment before the loop. Second: confusing subsequence with substring — subsequences may skip, which is precisely why dropping one side is allowed.',
          time: 'O(n·m).',
          space: 'O(n·m), reducible to O(m).',
          code: {
            cpp: `int longestCommonSubsequence(string a, string b) {
  int n = (int)a.size(), m = (int)b.size();
  vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));   // row/col 0 = empty prefix

  for (int i = 1; i <= n; ++i)
    for (int j = 1; j <= m; ++j)
      // dp[i][j] concerns a[i-1] and b[j-1] — the table is offset by one.
      if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else                      dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);

  return dp[n][m];
}`,
            java: `public int longestCommonSubsequence(String a, String b) {
  int n = a.length(), m = b.length();
  int[][] dp = new int[n + 1][m + 1];

  for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++)
      if (a.charAt(i - 1) == b.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1] + 1;
      else                                     dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);

  return dp[n][m];
}`,
          },
          followUp: 'Reconstruct the subsequence by walking back from dp[n][m], moving diagonally on matches. And note the shortest common supersequence is n + m - LCS.',
        },
      },
      practice: [
        {
          lc: 72,
          title: 'Edit Distance',
          slug: 'edit-distance',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 50,
          insight:
            'Same table, three operations: insert is dp[i][j-1], delete is dp[i-1][j], replace is dp[i-1][j-1], each plus one. Know which cell each operation corresponds to.',
          companies: ['google', 'amazon', 'microsoft'],
        },
        {
          lc: 97,
          title: 'Interleaving String',
          slug: 'interleaving-string',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 45,
          insight:
            'Flipped to a boolean table: dp[i][j] says whether s3\'s first i+j characters can be formed. The length check s1 + s2 == s3 must come first or the indexing breaks.',
        },
      ],
    },

    {
      id: 'interval-dp',
      name: 'Interval and partition DP',
      signal:
        '"Burst", "merge stones", "matrix chain", "longest palindromic subsequence". State is a RANGE [i, j], and you choose a split point or a last element inside it.',
      time: 'O(n^3)',
      space: 'O(n^2)',
      template: {
        cpp: `for (int len = 2; len <= n; ++len)             // shortest ranges FIRST
  for (int i = 0; i + len - 1 < n; ++i) {
    int j = i + len - 1;
    for (int k = i; k <= j; ++k)                 // the split / last-choice point
      dp[i][j] = max(dp[i][j], dp[i][k - 1] + value(k) + dp[k + 1][j]);
  }`,
        java: `for (int len = 2; len <= n; len++)
  for (int i = 0; i + len - 1 < n; i++) {
    int j = i + len - 1;
    for (int k = i; k <= j; k++)
      dp[i][j] = Math.max(dp[i][j], dp[i][k - 1] + value(k) + dp[k + 1][j]);
  }`,
      },
      taught: {
        lc: 312,
        title: 'Burst Balloons',
        slug: 'burst-balloons',
        difficulty: 'hard',
        role: 'taught',
        estMinutes: 60,
        insight:
          'Think about which balloon is burst LAST in a range, not first. The last one has both range boundaries still intact as neighbours, which makes the two sides independent.',
        companies: ['google'],
        whyThisOne:
          'The definitive interval DP, and the reversal from "first" to "last" is one of the most instructive moves in all of DP — the forward formulation genuinely does not decompose.',
        walkthrough: {
          howToSeeIt: [
            'Try the forward version and watch it fail. If you burst a balloon first, its neighbours merge and the two remaining sides now interact, so the subproblems are not independent and there is no clean recurrence.',
            'Reverse the question: in the range (i, j), which balloon is burst LAST? At that moment every other balloon in the range is already gone, so its neighbours are exactly the boundaries i and j — fixed and known.',
            'That makes the sides independent: everything strictly inside (i, k) is resolved before, and everything inside (k, j) likewise, and neither affects the other.',
            'STATE: dp[i][j] is the best score bursting all balloons strictly between i and j. RECURRENCE: max over k of dp[i][k] + nums[i]*nums[k]*nums[j] + dp[k][j]. Pad the array with 1s at both ends so the boundary multiplications are uniform, and iterate by increasing range LENGTH so the smaller ranges are already final.',
          ],
          wherePeopleLoseIt:
            'Formulating it as "which balloon first", which cannot decompose and burns most of the time budget. If you find yourself unable to separate subproblems, try reversing the order of decisions — that is the general lesson here. Second: iterating i and j directly rather than by length reads cells that have not been computed yet.',
          time: 'O(n^3).',
          space: 'O(n^2).',
          code: {
            cpp: `int maxCoins(vector<int>& nums) {
  int n = (int)nums.size();

  vector<int> v(n + 2, 1);                      // pad with 1s so edges multiply cleanly
  for (int i = 0; i < n; ++i) v[i + 1] = nums[i];

  int m = n + 2;
  vector<vector<int>> dp(m, vector<int>(m, 0)); // dp[i][j]: burst everything BETWEEN i and j

  for (int len = 2; len < m; ++len)             // by RANGE LENGTH, smallest first
    for (int i = 0; i + len < m; ++i) {
      int j = i + len;

      for (int k = i + 1; k < j; ++k)           // k = the LAST balloon burst in (i, j)
        dp[i][j] = max(dp[i][j],
                       dp[i][k] + v[i] * v[k] * v[j] + dp[k][j]);
    }

  return dp[0][m - 1];
}`,
            java: `public int maxCoins(int[] nums) {
  int n = nums.length;

  int[] v = new int[n + 2];
  v[0] = v[n + 1] = 1;
  for (int i = 0; i < n; i++) v[i + 1] = nums[i];

  int m = n + 2;
  int[][] dp = new int[m][m];

  for (int len = 2; len < m; len++)
    for (int i = 0; i + len < m; i++) {
      int j = i + len;

      for (int k = i + 1; k < j; k++)
        dp[i][j] = Math.max(dp[i][j], dp[i][k] + v[i] * v[k] * v[j] + dp[k][j]);
    }

  return dp[0][m - 1];
}`,
          },
          followUp: 'Matrix chain multiplication is the same shape with a cheaper recurrence, and merge stones (LC 1000) adds a divisibility constraint on the split.',
        },
      },
      practice: [
        {
          lc: 516,
          title: 'Longest Palindromic Subsequence',
          slug: 'longest-palindromic-subsequence',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight: 'Range DP with matching ends: equal endpoints add 2 to the inner range. Also equals LCS of the string with its reverse — know both framings.',
        },
        {
          lc: 1039,
          title: 'Minimum Score Triangulation of Polygon',
          slug: 'minimum-score-triangulation-of-polygon',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight: 'Flipped to geometry: k is the third vertex of the triangle on edge (i, j). Identical loop structure to burst balloons, which is the point of pairing them.',
        },
      ],
    },

    {
      id: 'state-machine-dp',
      name: 'State machine DP',
      signal:
        'Stock trading with cooldowns, fees or transaction limits; any problem where you are in one of a few MODES and transitions are restricted. State is (position, mode).',
      time: 'O(n·states)',
      space: 'O(states)',
      googleHeavy: true,
      template: {
        cpp: `int hold = INT_MIN;      // holding a stock
int sold = 0;            // just sold today (cooldown active)
int rest = 0;            // free to buy

for (int price : prices) {
  int prevHold = hold, prevSold = sold, prevRest = rest;

  hold = max(prevHold, prevRest - price);   // keep holding, or buy from rest
  sold = prevHold + price;                  // sell what we held
  rest = max(prevRest, prevSold);           // stay free, or cool down from sold
}
return max(sold, rest);`,
        java: `int hold = Integer.MIN_VALUE, sold = 0, rest = 0;

for (int price : prices) {
  int prevHold = hold, prevSold = sold, prevRest = rest;

  hold = Math.max(prevHold, prevRest - price);
  sold = prevHold + price;
  rest = Math.max(prevRest, prevSold);
}
return Math.max(sold, rest);`,
      },
      taught: {
        lc: 309,
        title: 'Best Time to Buy and Sell Stock with Cooldown',
        slug: 'best-time-to-buy-and-sell-stock-with-cooldown',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 45,
        insight:
          'Draw the states first — holding, just sold, resting — and the legal transitions between them. The recurrence then writes itself directly from the diagram.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'It converts a confusing rule into a tiny diagram, and once drawn the whole stock family becomes the same problem with a different state count.',
        walkthrough: {
          howToSeeIt: [
            'Enumerate the modes you can be in at the end of a day. HOLD: you own a stock. SOLD: you sold today, so tomorrow is a cooldown. REST: you own nothing and are free to buy.',
            'Draw the legal transitions. You reach HOLD by continuing to hold or by buying from REST. You reach SOLD only from HOLD. You reach REST by staying in REST or by coming out of SOLD — which is exactly what encodes the cooldown.',
            'Each state holds the best profit achievable while in that mode, so the recurrences are one line each, read straight off the diagram.',
            'Only the previous day is read, so three variables suffice. Snapshot all three before updating any of them, since they depend on each other within the same step.',
          ],
          wherePeopleLoseIt:
            'Updating in place without snapshotting, so hold reads the sold value from TODAY instead of yesterday. Copy all three first. Second: initialise hold to a very negative number, not 0 — starting at 0 implies acquiring a stock for free.',
          time: 'O(n).',
          space: 'O(1).',
          code: {
            cpp: `int maxProfit(vector<int>& prices) {
  int hold = INT_MIN;   // best profit while holding a stock
  int sold = 0;         // best profit having sold TODAY (cooldown tomorrow)
  int rest = 0;         // best profit holding nothing and free to buy

  for (int price : prices) {
    int prevHold = hold, prevSold = sold, prevRest = rest;   // SNAPSHOT first

    hold = max(prevHold, prevRest - price);   // hold on, or buy while free
    sold = prevHold + price;                  // can only sell from holding
    rest = max(prevRest, prevSold);           // stay free, or finish cooling down
  }
  return max(sold, rest);                     // never end while still holding
}`,
            java: `public int maxProfit(int[] prices) {
  int hold = Integer.MIN_VALUE, sold = 0, rest = 0;

  for (int price : prices) {
    int prevHold = hold, prevSold = sold, prevRest = rest;

    hold = Math.max(prevHold, prevRest - price);
    sold = prevHold + price;
    rest = Math.max(prevRest, prevSold);
  }
  return Math.max(sold, rest);
}`,
          },
          followUp: 'At most k transactions (LC 188) — add a transaction-count dimension, giving dp[k][hold]. The same diagram, indexed by how many trades remain.',
        },
      },
      practice: [
        {
          lc: 714,
          title: 'Best Time to Buy and Sell Stock with Transaction Fee',
          slug: 'best-time-to-buy-and-sell-stock-with-transaction-fee',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'Only two states, hold and free, with the fee subtracted on one side. Be deliberate about charging the fee at buy or at sell — do not charge it twice.',
        },
        {
          lc: 188,
          title: 'Best Time to Buy and Sell Stock IV',
          slug: 'best-time-to-buy-and-sell-stock-iv',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 55,
          insight:
            'Flipped by adding a dimension for the transaction count. When k exceeds n/2 the limit is irrelevant and it collapses to the unlimited greedy — that special case is expected.',
          companies: ['google'],
        },
      ],
    },

    {
      id: 'tree-dp',
      name: 'DP on trees',
      signal:
        'A tree where each node has a small set of modes — rob or skip, covered or not, matched or not. Post-order traversal, and each node returns one value per mode.',
      time: 'O(n)',
      space: 'O(h)',
      template: {
        cpp: `// Return one value per mode; the parent combines the children's modes.
pair<int,int> solve(TreeNode* node) {           // {withNode, withoutNode}
  if (!node) return {0, 0};

  auto [lWith, lWithout] = solve(node->left);
  auto [rWith, rWithout] = solve(node->right);

  int withNode    = node->val + lWithout + rWithout;          // children excluded
  int withoutNode = max(lWith, lWithout) + max(rWith, rWithout);

  return {withNode, withoutNode};
}`,
        java: `int[] solve(TreeNode node) {      // {withNode, withoutNode}
  if (node == null) return new int[]{0, 0};

  int[] L = solve(node.left), R = solve(node.right);

  int withNode    = node.val + L[1] + R[1];
  int withoutNode = Math.max(L[0], L[1]) + Math.max(R[0], R[1]);

  return new int[]{withNode, withoutNode};
}`,
      },
      taught: {
        lc: 337,
        title: 'House Robber III',
        slug: 'house-robber-iii',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          'Return TWO values from every node — the best with it robbed and the best without. A single return value forces the parent to guess what the child did.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'It joins the bottom-up tree pattern to DP, and the "return a pair, not a number" move is what unlocks the entire tree-DP family.',
        walkthrough: {
          howToSeeIt: [
            'This is House Robber where the sequence is replaced by a tree: robbing a node forbids robbing its children.',
            'A single return value fails. If a child returns only its best total, the parent cannot tell whether that total involved robbing the child — which is exactly what it needs to know.',
            'So return a pair: the best achievable with this node robbed, and the best with it skipped. Now the parent has complete information.',
            'Combine: robbing the node means adding its value to both children\'s SKIPPED values. Skipping it means each child independently contributes its own better option. Post-order, because both children must be final first.',
          ],
          wherePeopleLoseIt:
            'Memoising on the node with a single value and recursing to grandchildren directly. That works but recomputes subtrees and obscures the structure. The pair-returning version is O(n) with no map at all. Second: when skipping a node, each child takes its OWN maximum — they are independent, and forcing the same choice on both is wrong.',
          time: 'O(n).',
          space: 'O(h).',
          code: {
            cpp: `class Solution {
  // {best with this node robbed, best with this node skipped}
  pair<int,int> solve(TreeNode* node) {
    if (!node) return {0, 0};

    auto [lWith, lWithout] = solve(node->left);
    auto [rWith, rWithout] = solve(node->right);

    int withNode    = node->val + lWithout + rWithout;   // children must be skipped
    int withoutNode = max(lWith, lWithout)               // each child chooses freely
                    + max(rWith, rWithout);

    return {withNode, withoutNode};
  }

public:
  int rob(TreeNode* root) {
    auto [with, without] = solve(root);
    return max(with, without);
  }
};`,
            java: `class Solution {
  public int rob(TreeNode root) {
    int[] r = solve(root);
    return Math.max(r[0], r[1]);
  }

  private int[] solve(TreeNode node) {
    if (node == null) return new int[]{0, 0};

    int[] L = solve(node.left), R = solve(node.right);

    int withNode    = node.val + L[1] + R[1];
    int withoutNode = Math.max(L[0], L[1]) + Math.max(R[0], R[1]);

    return new int[]{withNode, withoutNode};
  }
}`,
          },
          followUp: 'Binary Tree Cameras (LC 968) uses three modes rather than two — not covered, covered without a camera, and has a camera. Same machinery, richer state.',
        },
      },
      practice: [
        {
          lc: 968,
          title: 'Binary Tree Cameras',
          slug: 'binary-tree-cameras',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 55,
          insight: 'Three states per node, and a greedy placement — put cameras at the parents of leaves. Both a DP and a greedy solution exist; try to write each.',
          companies: ['google'],
        },
        {
          lc: 1372,
          title: 'Longest ZigZag Path in a Binary Tree',
          slug: 'longest-zigzag-path-in-a-binary-tree',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight: 'Flipped: the two returned values are "best path arriving from the left" and "from the right". Direction is the mode.',
        },
      ],
    },

    {
      id: 'bitmask-dp',
      name: 'Bitmask DP over subsets',
      signal:
        'n is small — around 20 — and the problem is about SUBSETS: assign tasks to workers, visit all nodes, partition into k groups. The state is an integer whose bits say which elements are used.',
      time: 'O(2^n · n)',
      space: 'O(2^n)',
      googleHeavy: true,
      template: {
        cpp: `vector<int> dp(1 << n, INT_MAX);
dp[0] = 0;

for (int mask = 0; mask < (1 << n); ++mask) {
  if (dp[mask] == INT_MAX) continue;

  for (int i = 0; i < n; ++i) {
    if (mask & (1 << i)) continue;                 // i already used
    int next = mask | (1 << i);                    // add i to the set
    dp[next] = min(dp[next], dp[mask] + cost(mask, i));
  }
}
return dp[(1 << n) - 1];                           // all bits set = everything used`,
        java: `int[] dp = new int[1 << n];
Arrays.fill(dp, Integer.MAX_VALUE);
dp[0] = 0;

for (int mask = 0; mask < (1 << n); mask++) {
  if (dp[mask] == Integer.MAX_VALUE) continue;

  for (int i = 0; i < n; i++) {
    if ((mask & (1 << i)) != 0) continue;
    int next = mask | (1 << i);
    dp[next] = Math.min(dp[next], dp[mask] + cost(mask, i));
  }
}`,
      },
      taught: {
        lc: 847,
        title: 'Shortest Path Visiting All Nodes',
        slug: 'shortest-path-visiting-all-nodes',
        difficulty: 'hard',
        role: 'taught',
        estMinutes: 55,
        insight:
          'The state is (current node, set of visited nodes). Revisiting a node is allowed, so the visited SET — not the node alone — is what must not repeat.',
        companies: ['google'],
        whyThisOne:
          'It shows a bitmask as an ordinary BFS state, which demystifies the technique: the mask is just another coordinate of the state.',
        walkthrough: {
          howToSeeIt: [
            'Check the constraint: n is at most 12, and 2^12 is 4096. A bound that small with "visit all nodes" is the bitmask signal.',
            'Plain BFS on nodes fails, because you may need to pass through a node more than once. So the state must record WHICH nodes have been visited — an n-bit mask.',
            'State: (node, mask). There are n · 2^n of them, about 49,000 here, which is tiny. Every edge costs 1, so BFS gives the shortest path over this state graph.',
            'Start from every node simultaneously with mask = 1 << start, since you may begin anywhere. The answer is the first time any state reaches a full mask.',
          ],
          wherePeopleLoseIt:
            'Marking visited by node instead of by (node, mask). That forbids legitimate revisits and yields answers that are too large or no answer at all. The visited set must be indexed by the full state. Second: seeding only from node 0 — every starting point is allowed here.',
          time: 'O(2^n · n^2).',
          space: 'O(2^n · n).',
          code: {
            cpp: `int shortestPathLength(vector<vector<int>>& graph) {
  int n = (int)graph.size();
  int full = (1 << n) - 1;

  vector<vector<bool>> seen(n, vector<bool>(1 << n, false));
  queue<pair<int,int>> q;                       // (node, mask)

  for (int i = 0; i < n; ++i) {                 // may start anywhere
    int mask = 1 << i;
    q.push({i, mask});
    seen[i][mask] = true;
  }

  int steps = 0;
  while (!q.empty()) {
    int levelSize = (int)q.size();

    for (int s = 0; s < levelSize; ++s) {
      auto [u, mask] = q.front(); q.pop();
      if (mask == full) return steps;           // every node visited

      for (int v : graph[u]) {
        int next = mask | (1 << v);
        if (seen[v][next]) continue;            // visited keyed by the FULL state

        seen[v][next] = true;
        q.push({v, next});
      }
    }
    ++steps;
  }
  return 0;
}`,
            java: `public int shortestPathLength(int[][] graph) {
  int n = graph.length, full = (1 << n) - 1;

  boolean[][] seen = new boolean[n][1 << n];
  Queue<int[]> q = new ArrayDeque<>();

  for (int i = 0; i < n; i++) {
    q.add(new int[]{i, 1 << i});
    seen[i][1 << i] = true;
  }

  int steps = 0;
  while (!q.isEmpty()) {
    int levelSize = q.size();

    for (int s = 0; s < levelSize; s++) {
      int[] cur = q.poll();
      if (cur[1] == full) return steps;

      for (int v : graph[cur[0]]) {
        int next = cur[1] | (1 << v);
        if (seen[v][next]) continue;

        seen[v][next] = true;
        q.add(new int[]{v, next});
      }
    }
    steps++;
  }
  return 0;
}`,
          },
          followUp: 'This is the travelling salesman shape — Held-Karp is the same (node, mask) state with weighted edges and a DP table instead of a queue.',
        },
      },
      practice: [
        {
          lc: 698,
          title: 'Partition to K Equal Sum Subsets',
          slug: 'partition-to-k-equal-sum-subsets',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 55,
          insight:
            'The mask records which numbers are used; the remainder of the running sum tells you which bucket you are filling. Sorting descending prunes enormously.',
          companies: ['google'],
        },
        {
          lc: 526,
          title: 'Beautiful Arrangement',
          slug: 'beautiful-arrangement',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight:
            'Flipped to counting: the position is derivable from the popcount of the mask, so the state is the mask alone. Noticing that removes an entire dimension.',
        },
      ],
    },
  ],
};
