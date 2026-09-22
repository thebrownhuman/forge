import type { Topic } from '../../schema';

export const complexity: Topic = {
  id: 'complexity',
  name: 'Complexity Analysis',
  phase: 0,
  estHours: 4,
  prerequisites: [],

  whyItMatters:
    'Every interview answer is graded on complexity, and most follow-up questions are just "can you do better?". More practically: complexity is how you CHOOSE an approach before writing code. If the input is 10^5 you know O(n^2) is dead before you type, which eliminates half the wrong paths instantly.',

  fundamentals: [
    {
      heading: 'Read the constraints, then pick the shape',
      body:
        'The input bound in the problem statement tells you the intended complexity. Memorise this table and you will stop guessing approaches. Roughly 10^8 simple operations per second is the working budget.',
      costs: [
        { op: 'n <= 10', cost: 'O(n!) or O(2^n)', note: 'permutations, subsets, brute-force backtracking' },
        { op: 'n <= 25', cost: 'O(2^n)', note: 'subsets, bitmask DP' },
        { op: 'n <= 5,000', cost: 'O(n^2)', note: 'nested loops fine, 2-D DP fine' },
        { op: 'n <= 10^6', cost: 'O(n log n)', note: 'sorting, heap, binary search per element' },
        { op: 'n <= 10^8', cost: 'O(n)', note: 'single pass only, no sort' },
        { op: 'n > 10^9', cost: 'O(log n) or O(1)', note: 'math, binary search on the answer' },
      ],
    },
    {
      heading: 'Count operations, not lines',
      body:
        'Big-O describes growth, so constants and lower terms vanish: O(3n + 50) is O(n). What does NOT vanish is a hidden loop inside a call you did not write. s = s + c in a loop copies the whole string every time — that innocent line is O(n^2). Same for erasing from the middle of a vector or an ArrayList inside a loop. Whenever you call something inside a loop, ask what it costs, because that is where the real complexity hides.',
    },
    {
      heading: 'Amortised means averaged over the sequence',
      body:
        'push_back / ArrayList.add is O(1) amortised, not O(1) worst case. The array occasionally doubles and copies everything, which is O(n) that one time — but it happens so rarely that across n pushes the total is O(n), so each push averages O(1). The same reasoning justifies the sliding-window inner while loop: it can run many times on one step, but at most n times overall. Saying "amortised" correctly in an interview is a real signal.',
    },
    {
      heading: 'Space counts the output, or does not — say which',
      body:
        'Convention: the space you are charged for is auxiliary space, excluding the output. Sorting in place is O(1) auxiliary even though the array is O(n). Recursion is NOT free — the call stack is O(depth), which is O(n) for a skewed tree and O(log n) for a balanced one. Interviewers routinely ask whether you counted the stack; most candidates have not.',
    },
  ],

  questionTypes: [
    {
      id: 'brute-to-linear',
      name: 'Brute force, then cut a loop',
      signal:
        'The obvious answer is two nested loops over the same array. Ask what the inner loop is actually looking for — if it is "something I have already seen", a hash map or a running variable replaces it and O(n^2) becomes O(n).',
      time: 'O(n) after the improvement',
      space: 'O(1) to O(n)',
      template: {
        cpp: `// The pattern: replace "search what I've seen" with "remember what I've seen".
int best = 0, seenMin = INT_MAX;
for (int x : a) {
  best = max(best, x - seenMin);   // uses the past in O(1)
  seenMin = min(seenMin, x);
}`,
        java: `int best = 0, seenMin = Integer.MAX_VALUE;
for (int x : a) {
  best = Math.max(best, x - seenMin);
  seenMin = Math.min(seenMin, x);
}`,
      },
      taught: {
        lc: 121,
        title: 'Best Time to Buy and Sell Stock',
        slug: 'best-time-to-buy-and-sell-stock',
        difficulty: 'easy',
        role: 'taught',
        estMinutes: 15,
        insight: 'The best sell on day i only needs the minimum price before i — one running variable replaces the entire inner loop.',
        companies: ['amazon', 'google'],
        whyThisOne:
          'The cleanest demonstration that dropping a loop is about noticing what the inner loop recomputes, not about a clever trick.',
        walkthrough: {
          howToSeeIt: [
            'Brute force first, out loud: for every buy day, try every sell day after it. That is O(n^2), and with n up to 10^5 the constraints already tell you it will not pass.',
            'Ask what the inner loop computes. For a fixed sell day i, it is scanning for the cheapest buy day before i. That value does not depend on i at all beyond "so far".',
            'So carry it: one variable holding the minimum price seen so far, updated as you walk. The inner loop disappears.',
            'Order matters inside the loop. Compute the profit against the minimum BEFORE updating the minimum with today, or you allow buying and selling on the same day.',
          ],
          wherePeopleLoseIt:
            'Updating seenMin before computing the profit, which permits a same-day buy and sell. It still returns 0 correctly on the decreasing test case, so it looks right — and quietly reports a profit of 0 where a real one existed only in edge cases. Fix the order, and initialise best to 0 since doing nothing is allowed.',
          time: 'O(n) — one pass.',
          space: 'O(1).',
          code: {
            cpp: `int maxProfit(vector<int>& prices) {
  int seenMin = INT_MAX, best = 0;
  for (int p : prices) {
    best = max(best, p - seenMin);   // sell today against the cheapest past day
    seenMin = min(seenMin, p);       // then today becomes a candidate buy
  }
  return best;
}`,
            java: `public int maxProfit(int[] prices) {
  int seenMin = Integer.MAX_VALUE, best = 0;
  for (int p : prices) {
    best = Math.max(best, p - seenMin);
    seenMin = Math.min(seenMin, p);
  }
  return best;
}`,
          },
          followUp: 'Unlimited transactions (LC 122) — then the answer is the sum of every upward step, which is a one-line greedy.',
        },
      },
      practice: [
        {
          lc: 217,
          title: 'Contains Duplicate',
          slug: 'contains-duplicate',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 8,
          insight: 'The inner loop asks "have I seen this?" — that is literally a hash set. State the O(n) time / O(n) space trade against sorting for O(n log n) / O(1).',
        },
        {
          lc: 219,
          title: 'Contains Duplicate II',
          slug: 'contains-duplicate-ii',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 15,
          insight: 'Flipped: the set now needs positions, so store the last index per value — a map, not a set.',
        },
      ],
    },

    {
      id: 'amortised-in-place',
      name: 'Amortised cost and in-place writes',
      signal:
        'A problem says "modify in place" and "O(1) extra space", or your solution erases from the middle of an array inside a loop. The fix is a write pointer that lags behind the read pointer.',
      time: 'O(n)',
      space: 'O(1)',
      template: {
        cpp: `int w = 0;                       // write index
for (int r = 0; r < n; ++r) {    // read index
  if (keep(a[r])) a[w++] = a[r];
}
return w;                        // new logical length`,
        java: `int w = 0;
for (int r = 0; r < n; r++) {
  if (keep(a[r])) a[w++] = a[r];
}
return w;`,
      },
      taught: {
        lc: 27,
        title: 'Remove Element',
        slug: 'remove-element',
        difficulty: 'easy',
        role: 'taught',
        estMinutes: 12,
        insight: 'Never erase from the middle. Keep a write pointer and copy survivors forward — one pass, no shifting.',
        whyThisOne:
          'It makes the hidden-cost lesson concrete: the intuitive solution is O(n^2) for a reason people can see and then never forget.',
        walkthrough: {
          howToSeeIt: [
            'The intuitive move is to erase each matching element. Price that out: erase from the middle of a vector shifts everything after it, which is O(n). Inside a loop, that is O(n^2).',
            'Reframe from "remove the bad" to "keep the good". You are building the surviving prefix, not deleting from the original.',
            'Two indices: r reads every position, w marks where the next survivor goes. When you keep something, write it at w and advance w. When you skip, only r advances.',
            'w never overtakes r, so you never overwrite something you have not read yet. That is the invariant that makes writing into the same array safe. Return w as the new length.',
          ],
          wherePeopleLoseIt:
            'Using the same index for reading and writing, which corrupts the array the moment you skip an element. The other trap is returning the original length — the caller reads exactly the first w entries, and anything past w is intentionally garbage.',
          time: 'O(n) — one pass, one write at most per element.',
          space: 'O(1) — in place.',
          code: {
            cpp: `int removeElement(vector<int>& nums, int val) {
  int w = 0;
  for (int r = 0; r < (int)nums.size(); ++r) {
    if (nums[r] != val) nums[w++] = nums[r];   // survivors compact forward
  }
  return w;
}`,
            java: `public int removeElement(int[] nums, int val) {
  int w = 0;
  for (int r = 0; r < nums.length; r++) {
    if (nums[r] != val) nums[w++] = nums[r];
  }
  return w;
}`,
          },
        },
      },
      practice: [
        {
          lc: 26,
          title: 'Remove Duplicates from Sorted Array',
          slug: 'remove-duplicates-from-sorted-array',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 12,
          insight: 'Same skeleton; "keep" now means "differs from the last thing I wrote", so the test looks backwards at a[w-1].',
        },
        {
          lc: 283,
          title: 'Move Zeroes',
          slug: 'move-zeroes',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 12,
          insight: 'Flipped: you must also clear the tail after compacting, since the array keeps its original length.',
          companies: ['meta'],
        },
      ],
    },

    {
      id: 'recursion-cost',
      name: 'Recursion cost and memoisation',
      signal:
        'A recursive solution that recomputes the same arguments. Draw two levels of the call tree — if a subproblem appears twice, the cost is exponential and a cache makes it linear.',
      time: 'O(n) after memoisation',
      space: 'O(n) cache + O(n) stack, or O(1) iterative',
      template: {
        cpp: `// Exponential: f(n) = f(n-1) + f(n-2) recomputes everything.
// Memoised: each argument is computed once.
vector<int> memo(n + 1, -1);
function<int(int)> f = [&](int i) {
  if (i <= 1) return i;
  if (memo[i] != -1) return memo[i];
  return memo[i] = f(i - 1) + f(i - 2);
};`,
        java: `int[] memo = new int[n + 1];
Arrays.fill(memo, -1);
int f(int i) {
  if (i <= 1) return i;
  if (memo[i] != -1) return memo[i];
  return memo[i] = f(i - 1) + f(i - 2);
}`,
      },
      taught: {
        lc: 509,
        title: 'Fibonacci Number',
        slug: 'fibonacci-number',
        difficulty: 'easy',
        role: 'taught',
        estMinutes: 20,
        insight:
          'The naive recursion is O(2^n) because the call tree branches twice at every level. Caching each argument makes every subproblem compute once: O(n).',
        whyThisOne:
          'It is the smallest problem where you can literally draw the duplicated subtree, and it is the entry point to the entire DP topic later.',
        walkthrough: {
          howToSeeIt: [
            'Write the naive recursion and draw the tree for n = 5. f(3) appears twice, f(2) three times. Each level roughly doubles the node count, so the total is about 2^n calls.',
            'Nothing about f(3) changes between calls — the function is pure. Anything computed from the same argument can be stored.',
            'Add a cache keyed by the argument. Now each of the n arguments is computed exactly once and every other call is a lookup: O(n) time, O(n) space for the cache plus O(n) stack depth.',
            'Then notice you only ever need the previous two values, so drop the cache entirely and iterate with two variables: O(n) time, O(1) space, no stack. That memo-to-tabulation-to-two-variables progression is the whole of DP in miniature.',
          ],
          wherePeopleLoseIt:
            'Using 0 as the "not computed yet" marker when 0 is a legitimate answer, so f(0) is recomputed forever. Use -1, or a separate visited flag. The second trap is forgetting the stack in the space analysis — memoised recursion is O(n) space even with an O(1) cache claim.',
          time: 'O(2^n) naive, O(n) memoised.',
          space: 'O(n) memo + O(n) stack; O(1) iterative.',
          code: {
            cpp: `// Final form: no recursion, no cache, O(1) space.
int fib(int n) {
  if (n <= 1) return n;
  int prev = 0, cur = 1;
  for (int i = 2; i <= n; ++i) {
    int next = prev + cur;
    prev = cur;
    cur = next;
  }
  return cur;
}`,
            java: `public int fib(int n) {
  if (n <= 1) return n;
  int prev = 0, cur = 1;
  for (int i = 2; i <= n; i++) {
    int next = prev + cur;
    prev = cur;
    cur = next;
  }
  return cur;
}`,
          },
          followUp: 'Compute fib(10^18) mod 1e9+7 — that needs matrix exponentiation or fast doubling, O(log n).',
        },
      },
      practice: [
        {
          lc: 70,
          title: 'Climbing Stairs',
          slug: 'climbing-stairs',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 15,
          insight: 'Fibonacci wearing a costume — ways(n) = ways(n-1) + ways(n-2). Recognising the disguise is the exercise.',
        },
        {
          lc: 746,
          title: 'Min Cost Climbing Stairs',
          slug: 'min-cost-climbing-stairs',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 20,
          insight: 'Flipped: minimise a cost instead of counting ways, so the recurrence takes a min and adds the step cost.',
        },
      ],
    },
  ],
};
