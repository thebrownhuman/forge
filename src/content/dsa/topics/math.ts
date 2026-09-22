import type { Topic } from '../../schema';

export const math: Topic = {
  id: 'math',
  name: 'Math & Number Theory',
  phase: 4,
  estHours: 6,
  prerequisites: [],

  whyItMatters:
    'Math questions are rarely the main event, but they appear as warm-ups and as the O(log n) follow-up to an O(n) loop. The four shapes here — gcd, sieve, fast power with modular arithmetic, and digit manipulation — cover nearly all of them. The recurring failure is not the mathematics; it is overflow and the sign rules around integer division, which quietly produce wrong answers.',

  fundamentals: [
    {
      heading: 'Overflow is the real enemy',
      body:
        'A 32-bit signed int holds up to about 2.1 billion. Multiplying two values near 10^5 overflows it, and in C++ signed overflow is undefined behaviour while in Java it silently wraps — either way the answer is wrong with no warning. Default to 64-bit for anything you multiply or accumulate, and when a problem says "answer modulo 10^9+7", take the modulus after every operation, not at the end.',
      code: {
        cpp: `const long long MOD = 1'000'000'007;

long long mulmod(long long a, long long b) {
  return (a % MOD) * (b % MOD) % MOD;     // reduce BEFORE multiplying
}

// Also: (a - b + MOD) % MOD for subtraction, or the result can be negative.`,
        java: `static final long MOD = 1_000_000_007L;

long mulmod(long a, long b) {
  return (a % MOD) * (b % MOD) % MOD;
}`,
      },
      costs: [
        { op: 'gcd (Euclid)', cost: 'O(log min(a, b))', note: 'astonishingly fast' },
        { op: 'sieve of Eratosthenes', cost: 'O(n log log n)', note: 'essentially linear' },
        { op: 'trial division primality', cost: 'O(sqrt(n))', note: 'fine for one number, not for a range' },
        { op: 'fast power', cost: 'O(log n)', note: 'versus O(n) for the naive loop' },
      ],
    },
    {
      heading: 'Integer division truncates toward zero',
      body:
        'In both C++ and Java, -7 / 2 is -3, not -4, and -7 % 2 is -1, not 1. That means a negative remainder can appear where you expected a non-negative one, which breaks any code keying a hash map by a modulus. The fix is the standard normalisation ((x % k) + k) % k. This single detail causes wrong answers in subarray-divisibility problems more often than any algorithmic mistake.',
    },
    {
      heading: 'Euclid, and why it terminates so fast',
      body:
        'gcd(a, b) = gcd(b, a mod b), and the recursion ends when b reaches 0. It is fast because a mod b is less than half of a whenever b <= a/2, and when b > a/2 the remainder is a - b, which is also less than a/2. So the arguments at least halve every two steps, giving O(log n). lcm follows as a / gcd(a, b) * b — divide FIRST to avoid overflowing on the product.',
      code: {
        cpp: `long long gcd(long long a, long long b) { return b == 0 ? a : gcd(b, a % b); }
long long lcm(long long a, long long b) { return a / gcd(a, b) * b; }   // divide first`,
        java: `long gcd(long a, long b) { return b == 0 ? a : gcd(b, a % b); }
long lcm(long a, long b) { return a / gcd(a, b) * b; }`,
      },
    },
    {
      heading: 'Check to the square root, not to n',
      body:
        'A composite number always has a divisor at or below its square root, so trial division only needs to test up to sqrt(n). Write the loop condition as i * i <= n rather than i <= sqrt(n) — it avoids floating-point rounding at the boundary and is faster. For testing many numbers in a range, abandon trial division entirely and sieve.',
    },
  ],

  questionTypes: [
    {
      id: 'gcd-lcm',
      name: 'GCD, LCM and divisibility structure',
      signal:
        '"Common divisor", "repeat this pattern", "when do two cycles align", "can I measure exactly X". Whenever things line up periodically, gcd or lcm is underneath.',
      time: 'O(log n)',
      space: 'O(1)',
      template: {
        cpp: `int gcd(int a, int b) { while (b) { int t = a % b; a = b; b = t; } return a; }

// Common idiom: the repeating unit of a string has length gcd(n, m).`,
        java: `int gcd(int a, int b) { while (b != 0) { int t = a % b; a = b; b = t; } return a; }`,
      },
      taught: {
        lc: 1071,
        title: 'Greatest Common Divisor of Strings',
        slug: 'greatest-common-divisor-of-strings',
        difficulty: 'easy',
        role: 'taught',
        estMinutes: 30,
        insight:
          'If a common repeating unit exists at all, then str1 + str2 equals str2 + str1 — and the unit has length gcd(len1, len2). One check, one gcd, done.',
        companies: ['google'],
        whyThisOne:
          'It hides a number-theory identity inside a string problem, which is exactly how math shows up in interviews: never labelled as math.',
        walkthrough: {
          howToSeeIt: [
            'Restate the requirement: some string t exists such that both inputs are t repeated a whole number of times. So both lengths are multiples of |t|, meaning |t| divides gcd of the two lengths.',
            'Existence first. If both strings are built from the same unit, then concatenating them in either order produces the same string — so str1 + str2 == str2 + str1 is a necessary condition. It is also sufficient, which is the non-obvious half and worth stating.',
            'Given existence, the LARGEST valid unit has length exactly gcd(len1, len2), since any common unit length must divide both and you want the biggest such.',
            'So the whole solution is: check the concatenation equality, then return the prefix of length gcd. Two lines after the insight.',
          ],
          wherePeopleLoseIt:
            'Skipping the concatenation check and returning the gcd-length prefix unconditionally. That returns a plausible-looking wrong answer for inputs like "ABAB" and "ABC", where no common unit exists at all. The existence test is not optional.',
          time: 'O(n + m) for the comparison, O(log n) for the gcd.',
          space: 'O(n + m) for the concatenations.',
          code: {
            cpp: `string gcdOfStrings(string str1, string str2) {
  // If any common unit exists, the concatenations must agree.
  if (str1 + str2 != str2 + str1) return "";

  int g = __gcd((int)str1.size(), (int)str2.size());
  return str1.substr(0, g);
}`,
            java: `public String gcdOfStrings(String str1, String str2) {
  if (!(str1 + str2).equals(str2 + str1)) return "";

  int g = gcd(str1.length(), str2.length());
  return str1.substring(0, g);
}

private int gcd(int a, int b) {
  while (b != 0) { int t = a % b; a = b; b = t; }
  return a;
}`,
          },
          followUp: 'Prove the concatenation criterion — it is the step that turns this from a trick into an argument, and interviewers do ask.',
        },
      },
      practice: [
        {
          lc: 914,
          title: 'X of a Kind in a Deck of Cards',
          slug: 'x-of-a-kind-in-a-deck-of-cards',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 20,
          insight: 'Count each value, then take the gcd of all the counts. A valid grouping exists exactly when that gcd is at least 2.',
        },
        {
          lc: 365,
          title: 'Water and Jug Problem',
          slug: 'water-and-jug-problem',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight:
            'Flipped into Bezout\'s identity: a target is measurable exactly when it is a multiple of gcd(x, y) and does not exceed x + y. A BFS also works but misses the point.',
        },
      ],
    },

    {
      id: 'primes-sieve',
      name: 'Primes and the sieve',
      signal:
        '"Count the primes below n", "prime factorisation", "which numbers in this range are prime". One number: trial division to sqrt. A whole range: sieve.',
      time: 'O(n log log n)',
      space: 'O(n)',
      template: {
        cpp: `vector<bool> isPrime(n, true);
if (n > 0) isPrime[0] = false;
if (n > 1) isPrime[1] = false;

for (long long p = 2; p * p < n; ++p)
  if (isPrime[p])
    for (long long m = p * p; m < n; m += p)   // start at p*p, not 2p
      isPrime[m] = false;`,
        java: `boolean[] isPrime = new boolean[n];
Arrays.fill(isPrime, true);
if (n > 0) isPrime[0] = false;
if (n > 1) isPrime[1] = false;

for (long p = 2; p * p < n; p++)
  if (isPrime[(int) p])
    for (long m = p * p; m < n; m += p)
      isPrime[(int) m] = false;`,
      },
      taught: {
        lc: 204,
        title: 'Count Primes',
        slug: 'count-primes',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'Testing each number individually is O(n·sqrt(n)). The sieve crosses out multiples instead, and starting each pass at p·p rather than 2p is what keeps it near-linear.',
        companies: ['amazon', 'microsoft'],
        whyThisOne:
          'The canonical sieve, and the two optimisations — start at p squared, stop the outer loop at sqrt — are small, provable and frequently asked about.',
        walkthrough: {
          howToSeeIt: [
            'Trial-dividing every number is O(n · sqrt(n)), which is far too slow for n near 5 million. Invert the work: rather than asking whether each number is prime, mark the numbers that cannot be.',
            'For each prime p, cross out its multiples. Anything never crossed out is prime, because it has no divisor other than 1 and itself.',
            'First optimisation: start crossing out at p·p. Every smaller multiple of p, such as 2p or 3p, has a smaller prime factor and was already crossed out by that factor.',
            'Second optimisation: stop the outer loop once p·p >= n. Beyond that there is nothing left to cross out, since the first multiple would already exceed the range. Use a 64-bit type for p·p or it overflows near the limit.',
          ],
          wherePeopleLoseIt:
            'Overflow in p * p when n is large and p is an int — cast to long. And starting the inner loop at 2p rather than p·p, which is correct but noticeably slower and misses the point of the optimisation. Also remember 0 and 1 are not prime; forgetting that shifts the count by two.',
          time: 'O(n log log n).',
          space: 'O(n) bits.',
          code: {
            cpp: `int countPrimes(int n) {
  if (n < 3) return 0;

  vector<bool> isPrime(n, true);
  isPrime[0] = isPrime[1] = false;

  for (long long p = 2; p * p < n; ++p) {       // 64-bit: p*p can overflow int
    if (!isPrime[(size_t)p]) continue;

    for (long long m = p * p; m < n; m += p)    // start at p*p, not 2p
      isPrime[(size_t)m] = false;
  }

  int count = 0;
  for (int i = 2; i < n; ++i) if (isPrime[i]) ++count;
  return count;
}`,
            java: `public int countPrimes(int n) {
  if (n < 3) return 0;

  boolean[] isPrime = new boolean[n];
  Arrays.fill(isPrime, true);
  isPrime[0] = isPrime[1] = false;

  for (long p = 2; p * p < n; p++) {
    if (!isPrime[(int) p]) continue;

    for (long m = p * p; m < n; m += p)
      isPrime[(int) m] = false;
  }

  int count = 0;
  for (int i = 2; i < n; i++) if (isPrime[i]) count++;
  return count;
}`,
          },
          followUp: 'Store the smallest prime factor for each number instead of a boolean — then any number in the range factorises in O(log n) with no division loop.',
        },
      },
      practice: [
        {
          lc: 1175,
          title: 'Prime Arrangements',
          slug: 'prime-arrangements',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 25,
          insight: 'Count the primes up to n, then multiply two factorials modulo 1e9+7. Combines the sieve with disciplined modular arithmetic.',
        },
        {
          lc: 762,
          title: 'Prime Number of Set Bits in Binary Representation',
          slug: 'prime-number-of-set-bits-in-binary-representation',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 20,
          insight:
            'Flipped: the bit count never exceeds about 20, so the relevant primes are a tiny fixed set — a hardcoded bitmask beats any sieve. Recognising the tiny range is the lesson.',
        },
      ],
    },

    {
      id: 'fast-power',
      name: 'Fast exponentiation and modular arithmetic',
      signal:
        '"x to the power n", "answer modulo 10^9+7", "n is up to 10^9". Halve the exponent each step instead of multiplying n times.',
      time: 'O(log n)',
      space: 'O(1)',
      googleHeavy: true,
      template: {
        cpp: `long long power(long long base, long long exp, long long mod) {
  long long result = 1;
  base %= mod;

  while (exp > 0) {
    if (exp & 1) result = result * base % mod;   // this bit of the exponent is set
    base = base * base % mod;                    // square for the next bit
    exp >>= 1;
  }
  return result;
}`,
        java: `long power(long base, long exp, long mod) {
  long result = 1;
  base %= mod;

  while (exp > 0) {
    if ((exp & 1) == 1) result = result * base % mod;
    base = base * base % mod;
    exp >>= 1;
  }
  return result;
}`,
      },
      taught: {
        lc: 50,
        title: 'Pow(x, n)',
        slug: 'powx-n',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 35,
        insight:
          'x^n = (x^(n/2))^2 for even n, and x times that for odd n. Each step halves the exponent, so a power of 10^9 takes about 30 multiplications.',
        companies: ['google', 'meta', 'amazon'],
        whyThisOne:
          'It is the standard O(log n) exponentiation, and the negative-exponent edge case involves a genuine integer-overflow trap that catches most first attempts.',
        walkthrough: {
          howToSeeIt: [
            'The naive loop multiplies n times, which is O(n) and hopeless when n reaches 10^9. Halving is the only way to get a logarithm.',
            'The identity: for even n, x^n is (x^(n/2)) squared, so one recursive value serves twice. For odd n, peel one factor off and the rest is even.',
            'Write it iteratively over the bits of n: whenever the current bit is set, multiply the accumulator by the current base; then square the base and shift. That is exactly the recursive identity unrolled.',
            'Negative exponents: compute the positive power and take the reciprocal. Handle n = INT_MIN carefully, because negating it overflows — convert to a 64-bit value BEFORE negating.',
          ],
          wherePeopleLoseIt:
            'Writing n = -n when n is INT_MIN. The negation overflows and the value stays negative, giving an infinite loop or a wrong result. Cast to long long first. Second: the recursive version must store the half-power in a variable rather than calling itself twice, or it is O(n) again.',
          time: 'O(log n).',
          space: 'O(1) iterative.',
          code: {
            cpp: `double myPow(double x, int n) {
  long long exp = n;              // widen BEFORE negating: INT_MIN overflows an int
  bool negative = exp < 0;
  if (negative) exp = -exp;

  double result = 1.0;
  while (exp > 0) {
    if (exp & 1) result *= x;     // bit set: take this factor
    x *= x;                        // square for the next bit
    exp >>= 1;
  }
  return negative ? 1.0 / result : result;
}`,
            java: `public double myPow(double x, int n) {
  long exp = n;
  boolean negative = exp < 0;
  if (negative) exp = -exp;

  double result = 1.0;
  while (exp > 0) {
    if ((exp & 1) == 1) result *= x;
    x *= x;
    exp >>= 1;
  }
  return negative ? 1.0 / result : result;
}`,
          },
          followUp: 'Do it modulo 10^9+7 with integer bases — then every multiplication needs a modulus and a 64-bit accumulator. That is the version used in combinatorics problems.',
        },
      },
      practice: [
        {
          lc: 372,
          title: 'Super Pow',
          slug: 'super-pow',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight: 'The exponent arrives as an array of digits, so process it digit by digit: result = result^10 * base^digit, all modulo 1337.',
        },
        {
          lc: 1922,
          title: 'Count Good Numbers',
          slug: 'count-good-numbers',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped to counting: even positions have 5 choices, odd have 4, so the answer is 5^a × 4^b modulo 1e9+7. Pure fast power once the counting is right.',
        },
      ],
    },

    {
      id: 'digit-manipulation',
      name: 'Digit and number manipulation',
      signal:
        '"Reverse the digits", "is it a palindrome number", "count trailing zeroes in n factorial". Peel digits with % 10 and / 10, and watch for overflow.',
      time: 'O(digits)',
      space: 'O(1)',
      template: {
        cpp: `long long reversed = 0;
while (x != 0) {
  int digit = x % 10;            // lowest digit
  x /= 10;                       // drop it
  reversed = reversed * 10 + digit;
}`,
        java: `long reversed = 0;
while (x != 0) {
  int digit = x % 10;
  x /= 10;
  reversed = reversed * 10 + digit;
}`,
      },
      taught: {
        lc: 7,
        title: 'Reverse Integer',
        slug: 'reverse-integer',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'The reversal is trivial; the problem is the overflow check, which must happen BEFORE the multiplication. Compare against INT_MAX/10 and the final digit.',
        companies: ['amazon', 'microsoft'],
        whyThisOne:
          'It is a pure overflow-discipline exercise, and the check-before-you-multiply habit transfers directly to atoi, fast power and every accumulation problem.',
        walkthrough: {
          howToSeeIt: [
            'Peeling digits is two operations: x % 10 gives the lowest digit, x / 10 removes it. Building the reversed number is result * 10 + digit.',
            'The catch is the 32-bit range. The reversed value can exceed it even though the input did not — 1534236469 reverses to something far past INT_MAX.',
            'You cannot detect that afterwards, because the overflow has already happened and is undefined behaviour in C++. Check before multiplying: if result exceeds INT_MAX/10, the next multiply must overflow. If it equals INT_MAX/10, only a final digit above 7 overflows.',
            'The symmetric check applies for the negative bound. Truncation toward zero means the sign handles itself in both languages — no special casing is needed for negative inputs.',
          ],
          wherePeopleLoseIt:
            'Accumulating in a 64-bit variable and checking at the end. That works in Java and in practice in C++, but it dodges the actual question, which is whether you can detect overflow within the type. Say you know both approaches and why the pre-check is the rigorous one.',
          time: 'O(digits) — at most 10 iterations.',
          space: 'O(1).',
          code: {
            cpp: `int reverse(int x) {
  int result = 0;

  while (x != 0) {
    int digit = x % 10;       // truncation toward zero keeps the sign right
    x /= 10;

    // CHECK BEFORE multiplying — afterwards is undefined behaviour.
    if (result > INT_MAX / 10 || (result == INT_MAX / 10 && digit > 7)) return 0;
    if (result < INT_MIN / 10 || (result == INT_MIN / 10 && digit < -8)) return 0;

    result = result * 10 + digit;
  }
  return result;
}`,
            java: `public int reverse(int x) {
  int result = 0;

  while (x != 0) {
    int digit = x % 10;
    x /= 10;

    if (result > Integer.MAX_VALUE / 10 || (result == Integer.MAX_VALUE / 10 && digit > 7)) return 0;
    if (result < Integer.MIN_VALUE / 10 || (result == Integer.MIN_VALUE / 10 && digit < -8)) return 0;

    result = result * 10 + digit;
  }
  return result;
}`,
          },
          followUp: 'Palindrome Number without converting to a string (LC 9) — reverse only HALF the digits and compare, which also sidesteps overflow entirely.',
        },
      },
      practice: [
        {
          lc: 9,
          title: 'Palindrome Number',
          slug: 'palindrome-number',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 20,
          insight: 'Reverse only half the number and stop when the reversed half meets or exceeds the remainder. Negative numbers are never palindromes — handle that first.',
        },
        {
          lc: 172,
          title: 'Factorial Trailing Zeroes',
          slug: 'factorial-trailing-zeroes',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight:
            'Flipped to counting factors: each trailing zero needs a 2 and a 5, and 5s are scarcer — so count multiples of 5, 25, 125 and so on. Never compute the factorial.',
          companies: ['google'],
        },
      ],
    },
  ],
};
