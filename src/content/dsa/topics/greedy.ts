import type { Topic } from '../../schema';

export const greedy: Topic = {
  id: 'greedy',
  name: 'Greedy',
  phase: 3,
  estHours: 8,
  prerequisites: ['sorting', 'intervals'],

  whyItMatters:
    'Greedy is the highest-risk topic in interviews because wrong greedy solutions look right and pass the sample tests. The valuable skill is not spotting a greedy — it is being able to ARGUE that the greedy choice is safe, and to recognise when it is not and DP is required. An interviewer asking "why does that work?" after a greedy answer is asking for a proof sketch, and most candidates have none.',

  fundamentals: [
    {
      heading: 'Two conditions, and you should name both',
      body:
        'Greedy is valid when a problem has the GREEDY CHOICE PROPERTY — some locally optimal choice is part of SOME optimal solution — and OPTIMAL SUBSTRUCTURE, meaning the rest of the problem after that choice is the same problem on a smaller input. If the second holds but the first does not, you are in DP territory: you must consider several choices and keep the best.',
    },
    {
      heading: 'The exchange argument, in three sentences',
      body:
        'This is how you prove a greedy is safe, and it is short enough to say aloud. Take any optimal solution. Show that if it does not contain your greedy choice, you can swap that choice in without making the solution worse or invalid. Therefore an optimal solution containing your greedy choice exists, and induction handles the rest. Practise stating this for interval scheduling until it is automatic — it transfers to nearly every greedy.',
    },
    {
      heading: 'How to break your own greedy quickly',
      body:
        'Before committing, spend thirty seconds hunting for a counter-example, because that is cheaper than discovering one mid-implementation. The standard adversarial shapes: one very large item that blocks many small ones, a choice that is locally best but leaves an unusable remainder, and ties broken the wrong way. Coin change with coins {1, 3, 4} and target 6 is the classic killer — greedy takes 4+1+1 for three coins where 3+3 needs two. That single example is why coin change is DP.',
      code: {
        cpp: `// Greedy FAILS here: coins {1, 3, 4}, amount 6
// greedy: 4 + 1 + 1 = 3 coins
// optimal: 3 + 3     = 2 coins
// No local rule fixes this, so coin change is DP.`,
        java: `// same counter-example: {1, 3, 4} with amount 6`,
      },
      costs: [
        { op: 'typical greedy', cost: 'O(n log n)', note: 'the sort usually dominates' },
        { op: 'greedy with a heap', cost: 'O(n log n)', note: 'when the best choice changes over time' },
        { op: 'the DP alternative', cost: 'O(n·W) or worse', note: 'what you pay when greedy is unsafe' },
      ],
    },
    {
      heading: 'Sorting is usually the greedy',
      body:
        'In most greedy problems the entire algorithm is: choose the right sort key, then sweep once taking whatever is legal. So the real work is deciding the key — earliest end for interval scheduling, tallest first for queue reconstruction, largest ratio for fractional knapsack. When a greedy fails, the fix is almost always the key rather than the sweep.',
    },
  ],

  questionTypes: [
    {
      id: 'greedy-reach',
      name: 'Furthest-reach and jump problems',
      signal:
        '"Can you reach the end", "minimum jumps", "refuelling stops". Track the furthest position reachable so far and extend it as you walk; you never need to decide WHICH jump to take.',
      time: 'O(n)',
      space: 'O(1)',
      template: {
        cpp: `int reach = 0;
for (int i = 0; i < n; ++i) {
  if (i > reach) return false;             // this index is unreachable
  reach = max(reach, i + nums[i]);         // extend the frontier
}
return true;`,
        java: `int reach = 0;
for (int i = 0; i < n; i++) {
  if (i > reach) return false;
  reach = Math.max(reach, i + nums[i]);
}
return true;`,
      },
      taught: {
        lc: 55,
        title: 'Jump Game',
        slug: 'jump-game',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'You never have to choose a jump. Track only the furthest index reachable so far; if the walk ever passes that frontier, everything beyond is unreachable.',
        companies: ['google', 'amazon', 'meta'],
        whyThisOne:
          'It shows greedy replacing an exponential search entirely, and the reachability invariant is easy to state and easy to believe.',
        walkthrough: {
          howToSeeIt: [
            'The brute force tries every jump length from every position — exponential. DP over reachable positions is O(n^2). Both compute far more than the question needs.',
            'Reframe: the question is not "which jumps" but "is the last index reachable". That collapses the choice entirely.',
            'Maintain one number, the furthest index reachable using the positions examined so far. At index i the new frontier is max(frontier, i + nums[i]).',
            'Walk forward. If i ever exceeds the frontier, there is a gap that nothing can cross, so return false. Surviving the loop means the end is reachable.',
          ],
          wherePeopleLoseIt:
            'Checking the frontier after updating it rather than before, which lets an unreachable index update the frontier using a value you could never have reached. Check i > reach FIRST. The other trap is thinking a greedy needs to pick jump lengths at all — it does not.',
          time: 'O(n).',
          space: 'O(1).',
          code: {
            cpp: `bool canJump(vector<int>& nums) {
  int reach = 0;

  for (int i = 0; i < (int)nums.size(); ++i) {
    if (i > reach) return false;              // CHECK before updating
    reach = max(reach, i + nums[i]);
  }
  return true;
}`,
            java: `public boolean canJump(int[] nums) {
  int reach = 0;

  for (int i = 0; i < nums.length; i++) {
    if (i > reach) return false;
    reach = Math.max(reach, i + nums[i]);
  }
  return true;
}`,
          },
          followUp: 'Return the MINIMUM number of jumps (LC 45) — still greedy, but now you track the end of the current jump level and increment a counter when you cross it, which is BFS in disguise.',
        },
      },
      practice: [
        {
          lc: 45,
          title: 'Jump Game II',
          slug: 'jump-game-ii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight: 'Each jump is a BFS level: track the current level end and the furthest reach, incrementing when you arrive at the level end. O(n), no queue.',
          companies: ['google', 'amazon'],
        },
        {
          lc: 134,
          title: 'Gas Station',
          slug: 'gas-station',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight:
            'Flipped: if the total gas covers the total cost a solution exists, and the start is the station right after the lowest running deficit. Two insights, both provable in a line.',
          companies: ['google', 'amazon'],
        },
      ],
    },

    {
      id: 'greedy-with-heap',
      name: 'Greedy that revises itself with a heap',
      signal:
        'A greedy choice that may need to be UNDONE later — "keep the k best so far", "drop the worst commitment when you overrun". Sort to fix the order, then use a heap to retract the worst pick.',
      time: 'O(n log n)',
      space: 'O(n)',
      googleHeavy: true,
      template: {
        cpp: `sort(items.begin(), items.end(), byDeadline);

priority_queue<int> chosen;                 // max-heap of committed costs
long long used = 0;

for (auto& [cost, deadline] : items) {
  chosen.push(cost);
  used += cost;

  if (used > deadline) {                    // overcommitted: drop the worst pick
    used -= chosen.top();
    chosen.pop();
  }
}
return (int)chosen.size();`,
        java: `Arrays.sort(items, (a, b) -> Integer.compare(a[1], b[1]));

PriorityQueue<Integer> chosen = new PriorityQueue<>(Comparator.reverseOrder());
long used = 0;

for (int[] it : items) {
  chosen.add(it[0]);
  used += it[0];

  if (used > it[1]) { used -= chosen.poll(); }
}
return chosen.size();`,
      },
      taught: {
        lc: 630,
        title: 'Course Schedule III',
        slug: 'course-schedule-iii',
        difficulty: 'hard',
        role: 'taught',
        estMinutes: 50,
        insight:
          'Sort by deadline and take every course optimistically. When the running time overruns a deadline, drop the LONGEST course taken so far — that always frees the most time for the fewest losses.',
        companies: ['google'],
        whyThisOne:
          'It is the clearest example of a greedy that can take something back, and the exchange argument for dropping the longest course is genuinely satisfying.',
        walkthrough: {
          howToSeeIt: [
            'Sorting by deadline is forced: a course with an earlier deadline must be considered earlier, because taking a late-deadline course first can never help an earlier one fit.',
            'Now sweep and take everything greedily, accumulating total time. Most of the time it fits and you move on.',
            'When the accumulated time exceeds the current deadline, something must go — but not necessarily the course you just added. Drop whichever taken course has the LONGEST duration, since that frees the most time while still losing only one course.',
            'The exchange argument: swapping out the longest course for any other leaves the count the same and the remaining time no worse, so the greedy choice is safe. A max-heap of taken durations makes that drop O(log n).',
          ],
          wherePeopleLoseIt:
            'Rejecting the newly added course instead of the longest one. That is the natural instinct and it is wrong — sometimes the new course is short and a previously taken monster should go. The heap exists precisely to make that retraction cheap.',
          time: 'O(n log n).',
          space: 'O(n).',
          code: {
            cpp: `int scheduleCourse(vector<vector<int>>& courses) {
  // Earliest deadline first — forced by the structure of the problem.
  sort(courses.begin(), courses.end(),
       [](const vector<int>& a, const vector<int>& b) { return a[1] < b[1]; });

  priority_queue<int> taken;      // MAX-heap of durations already committed
  long long used = 0;

  for (auto& c : courses) {
    int duration = c[0], deadline = c[1];

    taken.push(duration);         // take it optimistically
    used += duration;

    if (used > deadline) {        // overrun: retract the LONGEST commitment
      used -= taken.top();
      taken.pop();
    }
  }
  return (int)taken.size();
}`,
            java: `public int scheduleCourse(int[][] courses) {
  Arrays.sort(courses, (a, b) -> Integer.compare(a[1], b[1]));

  PriorityQueue<Integer> taken = new PriorityQueue<>(Comparator.reverseOrder());
  long used = 0;

  for (int[] c : courses) {
    taken.add(c[0]);
    used += c[0];

    if (used > c[1]) {
      used -= taken.poll();
    }
  }
  return taken.size();
}`,
          },
          followUp: 'Maximise total VALUE rather than course count — then greedy collapses and it becomes a weighted scheduling DP. Knowing where the boundary lies is the real lesson.',
        },
      },
      practice: [
        {
          lc: 502,
          title: 'IPO',
          slug: 'ipo',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 45,
          insight: 'Two heaps: one on capital to unlock available projects, one on profit to pick the best unlocked. The greedy is only valid because capital never decreases.',
          companies: ['google'],
        },
        {
          lc: 871,
          title: 'Minimum Number of Refueling Stops',
          slug: 'minimum-number-of-refueling-stops',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 45,
          insight:
            'Flipped: drive past stations without stopping, and when you run dry retroactively refuel at the largest station already passed. Retrospective greedy at its purest.',
        },
      ],
    },

    {
      id: 'greedy-local-rule',
      name: 'Local rules and two-pass sweeps',
      signal:
        'Constraints between NEIGHBOURS — "each child with a higher rating gets more candy than its neighbour", "make the array non-decreasing". Sweep left to right, then right to left, and combine.',
      time: 'O(n)',
      space: 'O(n)',
      template: {
        cpp: `vector<int> give(n, 1);

for (int i = 1; i < n; ++i)                        // left to right
  if (r[i] > r[i - 1]) give[i] = give[i - 1] + 1;

for (int i = n - 2; i >= 0; --i)                   // right to left
  if (r[i] > r[i + 1]) give[i] = max(give[i], give[i + 1] + 1);   // max: keep both`,
        java: `int[] give = new int[n];
Arrays.fill(give, 1);

for (int i = 1; i < n; i++)
  if (r[i] > r[i - 1]) give[i] = give[i - 1] + 1;

for (int i = n - 2; i >= 0; i--)
  if (r[i] > r[i + 1]) give[i] = Math.max(give[i], give[i + 1] + 1);`,
      },
      taught: {
        lc: 135,
        title: 'Candy',
        slug: 'candy',
        difficulty: 'hard',
        role: 'taught',
        estMinutes: 40,
        insight:
          'Each child has two independent constraints — one from the left neighbour, one from the right. Satisfy each with its own sweep, then take the maximum so both hold at once.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'It teaches decomposition of a two-sided constraint, which is a move that recurs in trapping rain water, stock problems and product-of-array-except-self.',
        walkthrough: {
          howToSeeIt: [
            'Two rules apply to every child: more candy than the left neighbour if rated higher, and more than the right neighbour if rated higher. Trying to satisfy both in one pass fails because a later child can invalidate an earlier decision.',
            'Separate them. A left-to-right sweep can satisfy every left-neighbour constraint by itself, ignoring the right rule entirely.',
            'A right-to-left sweep does the same for the right-neighbour constraints. Each pass is trivially correct in isolation.',
            'Combine by taking the maximum at each position. The maximum satisfies both constraints simultaneously, and since each pass assigns the minimum needed for its own rule, the maximum is the minimum value satisfying both. Sum for the answer.',
          ],
          wherePeopleLoseIt:
            'Overwriting in the second pass rather than taking the max, which destroys the left constraints just satisfied. The other failure is attempting a single clever pass — it can be done with an up-down run counter, but the two-pass version is far easier to get right and to explain.',
          time: 'O(n).',
          space: 'O(n).',
          code: {
            cpp: `int candy(vector<int>& ratings) {
  int n = (int)ratings.size();
  vector<int> give(n, 1);                          // everyone gets at least one

  for (int i = 1; i < n; ++i)                      // LEFT constraints
    if (ratings[i] > ratings[i - 1]) give[i] = give[i - 1] + 1;

  for (int i = n - 2; i >= 0; --i)                 // RIGHT constraints
    if (ratings[i] > ratings[i + 1])
      give[i] = max(give[i], give[i + 1] + 1);     // max, NOT assignment

  long long total = 0;
  for (int g : give) total += g;
  return (int)total;
}`,
            java: `public int candy(int[] ratings) {
  int n = ratings.length;
  int[] give = new int[n];
  Arrays.fill(give, 1);

  for (int i = 1; i < n; i++)
    if (ratings[i] > ratings[i - 1]) give[i] = give[i - 1] + 1;

  for (int i = n - 2; i >= 0; i--)
    if (ratings[i] > ratings[i + 1])
      give[i] = Math.max(give[i], give[i + 1] + 1);

  long total = 0;
  for (int g : give) total += g;
  return (int) total;
}`,
          },
          followUp: 'Do it in O(1) extra space by counting the lengths of the increasing and decreasing runs — much harder to write, and worth attempting only after the two-pass version is solid.',
        },
      },
      practice: [
        {
          lc: 42,
          title: 'Trapping Rain Water',
          slug: 'trapping-rain-water',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 45,
          insight:
            'The same two-sided decomposition: water above a bar is min(maxLeft, maxRight) minus its height. Two sweeps, then an O(1)-space two-pointer version as the follow-up.',
          companies: ['google', 'amazon', 'meta'],
        },
        {
          lc: 238,
          title: 'Product of Array Except Self',
          slug: 'product-of-array-except-self',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'Flipped to products: prefix products left to right, suffix products right to left, multiplied. Division is banned, which is exactly why the two-pass shape is forced.',
          companies: ['google', 'meta', 'amazon'],
        },
      ],
    },

    {
      id: 'greedy-vs-dp',
      name: 'Recognising when greedy fails',
      signal:
        'A problem that looks greedy but has a counter-example — coin change with awkward denominations, weighted scheduling, 0/1 knapsack. The tell: a locally best choice can leave an unusable remainder.',
      time: 'O(n·W) once you switch to DP',
      space: 'O(W)',
      template: {
        cpp: `// Greedy: take the largest coin that fits. FAILS on {1,3,4} with amount 6.
// DP: consider every coin at every amount and keep the best.
vector<int> dp(amount + 1, amount + 1);
dp[0] = 0;

for (int a = 1; a <= amount; ++a)
  for (int c : coins)
    if (c <= a) dp[a] = min(dp[a], dp[a - c] + 1);

return dp[amount] > amount ? -1 : dp[amount];`,
        java: `int[] dp = new int[amount + 1];
Arrays.fill(dp, amount + 1);
dp[0] = 0;

for (int a = 1; a <= amount; a++)
  for (int c : coins)
    if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);

return dp[amount] > amount ? -1 : dp[amount];`,
      },
      taught: {
        lc: 322,
        title: 'Coin Change',
        slug: 'coin-change',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          'Greedy fails: with coins {1, 3, 4} and amount 6 it takes 4+1+1 for three coins, while 3+3 needs two. No local rule repairs that, so every option must be considered — which is DP.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'It is the definitive greedy counter-example, and being able to produce {1,3,4} on demand is worth more in an interview than any single algorithm in this topic.',
        walkthrough: {
          howToSeeIt: [
            'The greedy instinct is to take the largest coin that fits. Test it before trusting it: coins {1, 3, 4}, amount 6. Greedy takes 4, then 1, then 1 — three coins. The optimum is 3 + 3 — two coins.',
            'Diagnose why it failed. The large coin left a remainder of 2 that no coin fits efficiently. The greedy choice property does not hold, because the locally best pick destroys the structure of what remains.',
            'Note that greedy DOES work for real currency systems, which are designed to be canonical. That is why the instinct feels right and why the interviewer chose awkward denominations.',
            'So consider every coin at every amount: dp[a] is the fewest coins making a, computed as min over coins of dp[a - coin] + 1. Bottom-up, O(amount × coins).',
          ],
          wherePeopleLoseIt:
            'Submitting the greedy and only discovering the failure on a hidden test. Always test a greedy against an adversarial input before writing it. Second: initialise the DP with a sentinel larger than any real answer — using -1 as "impossible" inside the min breaks the comparison.',
          time: 'O(amount × coins).',
          space: 'O(amount).',
          code: {
            cpp: `int coinChange(vector<int>& coins, int amount) {
  // amount + 1 is an impossible coin count, so it works as infinity.
  vector<int> dp(amount + 1, amount + 1);
  dp[0] = 0;

  for (int a = 1; a <= amount; ++a)
    for (int c : coins)
      if (c <= a)
        dp[a] = min(dp[a], dp[a - c] + 1);      // try EVERY coin, not the largest

  return dp[amount] > amount ? -1 : dp[amount];
}`,
            java: `public int coinChange(int[] coins, int amount) {
  int[] dp = new int[amount + 1];
  Arrays.fill(dp, amount + 1);
  dp[0] = 0;

  for (int a = 1; a <= amount; a++)
    for (int c : coins)
      if (c <= a)
        dp[a] = Math.min(dp[a], dp[a - c] + 1);

  return dp[amount] > amount ? -1 : dp[amount];
}`,
          },
          followUp: 'Count the number of ways instead of the minimum (LC 518) — and note the loop order flips: coins outermost, or you count permutations rather than combinations.',
        },
      },
      practice: [
        {
          lc: 763,
          title: 'Partition Labels',
          slug: 'partition-labels',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'A contrast case where greedy IS safe: record each letter\'s last occurrence, then cut as soon as the running frontier is reached. Articulating why this cannot backfire — unlike coin change — is the exercise.',
          companies: ['amazon', 'google'],
        },
        {
          lc: 1710,
          title: 'Maximum Units on a Truck',
          slug: 'maximum-units-on-a-truck',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 20,
          insight:
            'Flipped: greedy works here because boxes are divisible by count — take the highest-value boxes first. Fractional knapsack is greedy; 0/1 knapsack is not. Know which you are in.',
        },
      ],
    },
  ],
};
