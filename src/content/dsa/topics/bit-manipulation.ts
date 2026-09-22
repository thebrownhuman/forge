import type { Topic } from '../../schema';

export const bitManipulation: Topic = {
  id: 'bit-manipulation',
  name: 'Bit Manipulation',
  phase: 4,
  estHours: 6,
  prerequisites: [],

  whyItMatters:
    'Bit problems are pure pattern recognition — there are about eight tricks and they cover almost everything asked. They are worth the six hours because they appear as warm-ups, as the O(1)-space follow-up to a hash-map solution, and as the enabling step in bitmask DP. You will rarely be asked a hard bit problem; you will frequently be asked whether you can remove the extra array.',

  fundamentals: [
    {
      heading: 'The eight operations worth memorising',
      body:
        'Test bit i: x & (1 << i). Set: x | (1 << i). Clear: x & ~(1 << i). Toggle: x ^ (1 << i). Lowest set bit: x & -x. Clear the lowest set bit: x & (x - 1). Count set bits: popcount, or repeatedly clear the lowest. Check a power of two: x > 0 && (x & (x - 1)) == 0. Write each once by hand and they stop being mysterious.',
      code: {
        cpp: `bool testBit(int x, int i) { return x & (1 << i); }
int  setBit (int x, int i) { return x | (1 << i); }
int  clrBit (int x, int i) { return x & ~(1 << i); }
int  toggle (int x, int i) { return x ^ (1 << i); }

int lowestSetBit(int x)    { return x & -x; }        // isolates it
int clearLowest(int x)     { return x & (x - 1); }   // the Brian Kernighan step
bool isPowerOfTwo(int x)   { return x > 0 && (x & (x - 1)) == 0; }`,
        java: `boolean testBit(int x, int i) { return (x & (1 << i)) != 0; }
int  setBit(int x, int i)     { return x | (1 << i); }
int  clearBit(int x, int i)   { return x & ~(1 << i); }
int  toggle(int x, int i)     { return x ^ (1 << i); }

int lowestSetBit(int x)       { return x & -x; }
int clearLowest(int x)        { return x & (x - 1); }
boolean isPowerOfTwo(int x)   { return x > 0 && (x & (x - 1)) == 0; }`,
      },
      costs: [
        { op: 'any single bit operation', cost: 'O(1)', note: 'one CPU instruction' },
        { op: 'counting set bits', cost: 'O(number of set bits)', note: 'with the clear-lowest loop' },
        { op: 'iterating all subsets of n items', cost: 'O(2^n)', note: 'the bitmask DP bound' },
      ],
    },
    {
      heading: 'XOR is the workhorse',
      body:
        'Three properties do almost all the work: x ^ x = 0, x ^ 0 = x, and XOR is commutative and associative so order never matters. Together they mean XOR-ing a list cancels every value that appears an even number of times — which is why "every element appears twice except one" is a one-liner. Say those three properties out loud before using them; that is the proof the interviewer wants.',
    },
    {
      heading: 'Signed shifts and other language traps',
      body:
        'In Java, >> preserves the sign and >>> does not — use >>> when treating an int as raw bits, or a negative number loops forever. In C++, shifting a signed value left into the sign bit is undefined behaviour, and 1 << 31 overflows a 32-bit int; write 1LL << i or use unsigned. These are not pedantic details: they cause wrong answers that appear only on negative inputs.',
    },
    {
      heading: 'When bits are genuinely the right tool',
      body:
        'Reach for bits when you need O(1) space instead of a hash set, when the alphabet is small enough to fit in one integer — 26 letters in a 32-bit mask — or when enumerating subsets of a set of at most about 20 elements. Do NOT reach for them to look clever: a hash map is clearer, and unnecessary bit tricks are a readability cost you will be judged on.',
    },
  ],

  questionTypes: [
    {
      id: 'xor-tricks',
      name: 'XOR cancellation',
      signal:
        '"Every element appears twice except one", "find the missing number", "find the difference between two strings". Things that pair up cancel, and what remains is the answer.',
      time: 'O(n)',
      space: 'O(1)',
      template: {
        cpp: `int result = 0;
for (int x : nums) result ^= x;     // duplicates cancel, the loner survives
return result;`,
        java: `int result = 0;
for (int x : nums) result ^= x;
return result;`,
      },
      taught: {
        lc: 136,
        title: 'Single Number',
        slug: 'single-number',
        difficulty: 'easy',
        role: 'taught',
        estMinutes: 15,
        insight:
          'XOR-ing everything cancels each pair to zero and leaves the unique value. One pass, one variable, and the three XOR properties are the proof.',
        companies: ['amazon', 'google'],
        whyThisOne:
          'The cleanest possible statement of XOR cancellation, and the O(1)-space requirement is exactly the follow-up that makes bit tricks worth knowing.',
        walkthrough: {
          howToSeeIt: [
            'A hash set or frequency map solves it in O(n) time and O(n) space. The problem explicitly asks for O(1) space, which rules those out and hints at an arithmetic or bitwise identity.',
            'Recall the three XOR facts: x ^ x = 0, x ^ 0 = x, and the operation is commutative and associative so the order of the array is irrelevant.',
            'Therefore XOR-ing every element pairs up the duplicates regardless of where they sit, each pair collapses to 0, and 0 XOR the unique value is the unique value.',
            'One accumulator, one pass. State the three properties when you present it — that is the difference between reciting a trick and explaining an algorithm.',
          ],
          wherePeopleLoseIt:
            'Nothing goes wrong in the code; what goes wrong is presenting it as magic. Interviewers probe with "why does that work?" and the answer must be the three properties. Also note this technique only works when the extras appear an EVEN number of times — three copies do not cancel, which is what makes LC 137 a different problem.',
          time: 'O(n).',
          space: 'O(1).',
          code: {
            cpp: `int singleNumber(vector<int>& nums) {
  int result = 0;
  for (int x : nums) result ^= x;    // pairs cancel: x ^ x == 0
  return result;                      // 0 ^ unique == unique
}`,
            java: `public int singleNumber(int[] nums) {
  int result = 0;
  for (int x : nums) result ^= x;
  return result;
}`,
          },
          followUp: 'Two unique numbers, everything else in pairs (LC 260) — XOR everything, isolate any set bit of the result with x & -x, and split the array by that bit.',
        },
      },
      practice: [
        {
          lc: 137,
          title: 'Single Number II',
          slug: 'single-number-ii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight: 'Triples do not cancel under XOR. Count set bits per position modulo 3, or use the two-accumulator ones/twos state machine.',
        },
        {
          lc: 389,
          title: 'Find the Difference',
          slug: 'find-the-difference',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 12,
          insight: 'Flipped across two strings: XOR every character of both, and only the added letter survives. Summing the char codes works identically.',
        },
      ],
    },

    {
      id: 'bit-counting',
      name: 'Counting and testing bits',
      signal:
        '"How many 1 bits", "is this a power of two", "count bits for every number up to n". The clear-lowest-bit step and the x & (x-1) identity do most of it.',
      time: 'O(set bits) or O(n)',
      space: 'O(1) or O(n)',
      template: {
        cpp: `int count = 0;
while (x) { x &= (x - 1); ++count; }     // clears exactly the lowest set bit
return count;

// For all numbers 0..n at once:
vector<int> dp(n + 1, 0);
for (int i = 1; i <= n; ++i) dp[i] = dp[i >> 1] + (i & 1);`,
        java: `int count = 0;
while (x != 0) { x &= (x - 1); count++; }
return count;

int[] dp = new int[n + 1];
for (int i = 1; i <= n; i++) dp[i] = dp[i >> 1] + (i & 1);`,
      },
      taught: {
        lc: 191,
        title: 'Number of 1 Bits',
        slug: 'number-of-1-bits',
        difficulty: 'easy',
        role: 'taught',
        estMinutes: 20,
        insight:
          'x & (x - 1) clears exactly the lowest set bit, so the loop runs once per SET bit rather than 32 times. That is Brian Kernighan\'s algorithm.',
        companies: ['amazon', 'microsoft'],
        whyThisOne:
          'It teaches the single most reusable bit identity, and the why — subtracting one flips the lowest one and everything below it — is short enough to derive live.',
        walkthrough: {
          howToSeeIt: [
            'The obvious loop tests all 32 bits: shift and mask. Correct, O(32), and a fine first answer to state.',
            'Improve it by asking how to skip the zeros. Consider x - 1: it turns the lowest set bit into 0 and turns every bit BELOW it into 1, leaving everything above untouched.',
            'So x & (x - 1) keeps the untouched high bits and zeroes the lowest set bit and everything below it — a single step that removes exactly one set bit.',
            'Loop until x becomes 0 and count the steps. The loop body runs once per set bit, so a number with two set bits costs two iterations no matter how wide the word.',
          ],
          wherePeopleLoseIt:
            'In Java, using >> in the naive version with a negative input loops forever because the sign bit keeps refilling — use >>> or the x & (x-1) form, which sidesteps it entirely. In C++ the parameter is typically unsigned, which avoids the issue, but say that you noticed.',
          time: 'O(number of set bits).',
          space: 'O(1).',
          code: {
            cpp: `int hammingWeight(uint32_t n) {
  int count = 0;
  while (n) {
    n &= (n - 1);      // clears exactly the lowest set bit
    ++count;
  }
  return count;
}`,
            java: `public int hammingWeight(int n) {
  int count = 0;
  while (n != 0) {
    n &= (n - 1);
    count++;
  }
  return count;
}`,
          },
          followUp: 'Count the bits of every number from 0 to n (LC 338) — dp[i] = dp[i >> 1] + (i & 1), which is O(n) instead of O(n log n).',
        },
      },
      practice: [
        {
          lc: 338,
          title: 'Counting Bits',
          slug: 'counting-bits',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 25,
          insight: 'DP over bits: a number has the same bits as itself halved, plus its lowest bit. The bridge between bit tricks and dynamic programming.',
        },
        {
          lc: 231,
          title: 'Power of Two',
          slug: 'power-of-two',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 10,
          insight: 'Flipped to a single test: a power of two has exactly one set bit, so x > 0 && (x & (x-1)) == 0. The positivity guard is required.',
        },
      ],
    },

    {
      id: 'subset-enumeration',
      name: 'Enumerating subsets with bitmasks',
      signal:
        'n is around 20 or less and you must consider every subset. Each integer from 0 to 2^n - 1 IS a subset, with bit i meaning "element i is included".',
      time: 'O(2^n · n)',
      space: 'O(1)',
      template: {
        cpp: `for (int mask = 0; mask < (1 << n); ++mask) {
  int value = 0;
  for (int i = 0; i < n; ++i)
    if (mask & (1 << i)) value ^= nums[i];    // element i is in this subset

  total += value;
}`,
        java: `for (int mask = 0; mask < (1 << n); mask++) {
  int value = 0;
  for (int i = 0; i < n; i++)
    if ((mask & (1 << i)) != 0) value ^= nums[i];

  total += value;
}`,
      },
      taught: {
        lc: 1863,
        title: 'Sum of All Subset XOR Totals',
        slug: 'sum-of-all-subset-xor-totals',
        difficulty: 'easy',
        role: 'taught',
        estMinutes: 25,
        insight:
          'Brute force over all 2^n masks is fine at n <= 12. Then notice the closed form: every bit set anywhere appears in exactly half the subsets, so the answer is OR of all values, shifted left by n-1.',
        whyThisOne:
          'It gives the mechanical enumeration and a counting insight side by side, which is exactly how interviewers like these problems to be answered.',
        walkthrough: {
          howToSeeIt: [
            'Check the constraint: n is at most 12, so 2^12 = 4096 subsets, each costing O(n) to evaluate. That is about 50,000 operations — brute force is clearly intended and you should say so.',
            'Encode a subset as an integer. Bit i of the mask means element i is included, so looping mask from 0 to 2^n - 1 enumerates every subset exactly once, with no recursion.',
            'For each mask, XOR the selected elements and add to a running total. Two nested loops, nothing more.',
            'Then offer the closed form. Fix any bit position that is set in at least one number: exactly half of all subsets contain an odd count of numbers with that bit, so it contributes 2^(n-1) times. Hence the answer is (OR of all numbers) << (n - 1).',
          ],
          wherePeopleLoseIt:
            'Writing 1 << i where i can reach 31 in a signed int — undefined behaviour in C++ and a negative number in Java. Use 1LL or keep n small and say why it is safe. Second: forgetting that mask = 0 is the empty subset, which is legitimate and contributes 0.',
          time: 'O(2^n · n), or O(n) with the closed form.',
          space: 'O(1).',
          code: {
            cpp: `int subsetXORSum(vector<int>& nums) {
  int n = (int)nums.size();
  int total = 0;

  for (int mask = 0; mask < (1 << n); ++mask) {   // every subset, exactly once
    int value = 0;

    for (int i = 0; i < n; ++i)
      if (mask & (1 << i)) value ^= nums[i];      // bit i set => include element i

    total += value;
  }
  return total;
}

// Closed form: each set bit appears in exactly half the subsets.
int subsetXORSumFast(vector<int>& nums) {
  int orAll = 0;
  for (int x : nums) orAll |= x;
  return orAll << (nums.size() - 1);
}`,
            java: `public int subsetXORSum(int[] nums) {
  int n = nums.length, total = 0;

  for (int mask = 0; mask < (1 << n); mask++) {
    int value = 0;

    for (int i = 0; i < n; i++)
      if ((mask & (1 << i)) != 0) value ^= nums[i];

    total += value;
  }
  return total;
}`,
          },
          followUp: 'Iterate only the subsets OF a given mask — for (int s = mask; s > 0; s = (s - 1) & mask) — which is the standard trick in subset-sum bitmask DP.',
        },
      },
      practice: [
        {
          lc: 2044,
          title: 'Count Number of Maximum Bitwise-OR Subsets',
          slug: 'count-number-of-maximum-bitwise-or-subsets',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'Same enumeration; the maximum OR is always the OR of everything, so you are counting subsets that reach it. Knowing the max up front removes a pass.',
        },
        {
          lc: 1720,
          title: 'Decode XORed Array',
          slug: 'decode-xored-array',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 15,
          insight: 'Flipped to reconstruction: if encoded[i] = arr[i] ^ arr[i+1], then arr[i+1] = encoded[i] ^ arr[i]. XOR being its own inverse is the entire solution.',
        },
      ],
    },

    {
      id: 'bit-arithmetic',
      name: 'Arithmetic and bit rearrangement',
      signal:
        '"Add without using +", "reverse the bits", "swap values without a temporary". You are simulating arithmetic circuits, or permuting bits directly.',
      time: 'O(1) to O(32)',
      space: 'O(1)',
      template: {
        cpp: `// Addition: XOR is the sum without carries, AND << 1 is the carry.
while (b != 0) {
  unsigned carry = (unsigned)(a & b) << 1;
  a = a ^ b;                  // add without carrying
  b = (int)carry;             // then fold the carry back in
}
return a;`,
        java: `while (b != 0) {
  int carry = (a & b) << 1;
  a = a ^ b;
  b = carry;
}
return a;`,
      },
      taught: {
        lc: 371,
        title: 'Sum of Two Integers',
        slug: 'sum-of-two-integers',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 35,
        insight:
          'XOR is addition without carries; AND shifted left is exactly the carries. Repeat until there is nothing left to carry — that is a ripple-carry adder in three lines.',
        companies: ['amazon', 'microsoft'],
        whyThisOne:
          'It shows bits modelling real hardware, and the loop-until-no-carry structure is genuinely satisfying once the two halves of addition are separated.',
        walkthrough: {
          howToSeeIt: [
            'Split addition into its two independent parts. Per bit position, the sum digit ignoring carries is a XOR b. The carry generated is a AND b, which applies to the NEXT position, hence shifted left by one.',
            'So one step computes a partial sum and a pending carry. If the carry is zero you are finished; otherwise add the carry to the partial sum, which is the same problem again.',
            'Loop: while b is nonzero, compute carry = (a & b) << 1, then a = a ^ b, then b = carry. Each iteration pushes carries further left, so it terminates within the word width.',
            'Order matters inside the loop — compute the carry BEFORE overwriting a, or you carry from the wrong value.',
          ],
          wherePeopleLoseIt:
            'Signed overflow. In C++, shifting a negative value left is undefined behaviour, so cast to unsigned for the carry and back afterwards. In Java the operation wraps predictably, so the plain version is legal — which is why the same code is fine there and not here. Say which language rule you are relying on.',
          time: 'O(32) — bounded by the word width.',
          space: 'O(1).',
          code: {
            cpp: `int getSum(int a, int b) {
  while (b != 0) {
    unsigned carry = (unsigned)(a & b) << 1;   // cast: shifting signed is UB
    a = a ^ b;                                  // sum without carries
    b = (int)carry;                             // fold the carry in next round
  }
  return a;
}`,
            java: `public int getSum(int a, int b) {
  while (b != 0) {
    int carry = (a & b) << 1;   // Java wrapping is defined, so no cast needed
    a = a ^ b;
    b = carry;
  }
  return a;
}`,
          },
          followUp: 'Subtraction is a + (-b) with two\'s complement, so negate by ~b + 1 and reuse the same loop.',
        },
      },
      practice: [
        {
          lc: 190,
          title: 'Reverse Bits',
          slug: 'reverse-bits',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 20,
          insight: 'Pull the lowest bit off the input and push it onto the output 32 times. The follow-up — many calls — is answered with a precomputed byte lookup table.',
        },
        {
          lc: 461,
          title: 'Hamming Distance',
          slug: 'hamming-distance',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 10,
          insight: 'Flipped to a two-step combination: XOR marks the differing positions, then count the set bits. Two tricks from this topic composed.',
        },
      ],
    },
  ],
};
