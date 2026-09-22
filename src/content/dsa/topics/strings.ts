import type { Topic } from '../../schema';

export const strings: Topic = {
  id: 'strings',
  name: 'Strings',
  phase: 0,
  estHours: 8,
  prerequisites: ['stl'],

  whyItMatters:
    'A large share of interview questions are array questions wearing a string costume — sliding window, two pointers and hashing all show up here first. The genuinely string-specific skills are three: counting characters, walking from both ends, and parsing messy input without a library split. Parsing in particular is where careful candidates separate themselves, because the edge cases are the problem.',

  fundamentals: [
    {
      heading: 'A string is an array of bytes with sharp edges',
      body:
        'Index it, walk it, two-point it exactly like an array. The differences that bite: in Java it is immutable, so building with += inside a loop is O(n^2) — use StringBuilder. In C++ it is mutable, so in-place O(1)-space solutions are actually available. And s.substr / s.substring allocate a copy, so calling either inside a loop quietly adds a factor of n.',
      costs: [
        { op: 'charAt / operator[]', cost: 'O(1)', note: '' },
        { op: 'substr / substring', cost: 'O(k)', note: 'copies — never free, watch for it in loops' },
        { op: 'Java s += c in a loop', cost: 'O(n^2)', note: 'the most common accidental timeout' },
        { op: 'StringBuilder.append', cost: 'O(1) amortised', note: 'the fix' },
      ],
    },
    {
      heading: 'The 26-slot array beats a hash map',
      body:
        'When the problem says lowercase English letters — and it almost always does — use int[26] indexed by c - \'a\'. It is faster than a hash map, has no hashing overhead, and makes "compare two frequency profiles" a fixed 26-step loop, which is O(1). Reach for a real map only when the alphabet is genuinely open, such as Unicode or arbitrary words.',
      code: {
        cpp: `vector<int> freq(26, 0);
for (char c : s) ++freq[c - 'a'];`,
        java: `int[] freq = new int[26];
for (char c : s.toCharArray()) freq[c - 'a']++;`,
      },
    },
    {
      heading: 'Ask about the alphabet before you code',
      body:
        'Lowercase only? ASCII? Unicode? Case-sensitive? This is the single best clarifying question in any string problem, it takes five seconds, and it changes both your data structure and your complexity. Interviewers explicitly score whether you ask it.',
    },
    {
      heading: 'Parse with an index, not with split',
      body:
        'Library split is fine when the delimiters are clean. The moment input has repeated separators, optional signs, leading whitespace or nested structure, an explicit index pointer is clearer and handles the edges honestly. The shape is always the same: skip what you do not want, then consume a run of what you do, in a while loop that guards the bound first.',
    },
  ],

  questionTypes: [
    {
      id: 'char-frequency',
      name: 'Character frequency and canonical keys',
      signal:
        '"Anagram", "permutation", "can be rearranged into", "group these words". Two strings are equivalent when their letter counts match — so reduce each string to a canonical key and compare or group by it.',
      time: 'O(n)',
      space: 'O(1) for a fixed alphabet',
      template: {
        cpp: `vector<int> freq(26, 0);
for (char c : s) ++freq[c - 'a'];
for (char c : t) if (--freq[c - 'a'] < 0) return false;   // t has a letter s lacks
return true;                                               // lengths checked earlier`,
        java: `int[] freq = new int[26];
for (char c : s.toCharArray()) freq[c - 'a']++;
for (char c : t.toCharArray()) if (--freq[c - 'a'] < 0) return false;
return true;`,
      },
      taught: {
        lc: 242,
        title: 'Valid Anagram',
        slug: 'valid-anagram',
        difficulty: 'easy',
        role: 'taught',
        estMinutes: 12,
        insight:
          'Count up for one string, down for the other. If any count goes negative, the second string has a letter the first cannot supply — no second pass needed.',
        whyThisOne:
          'The smallest correct statement of "reduce to a canonical form and compare", which is the idea behind grouping, palindrome permutations and the anagram sliding window later.',
        walkthrough: {
          howToSeeIt: [
            'Sorting both strings and comparing works and is O(n log n) — say it first, it is a legitimate answer and shows you know the trade.',
            'Anagram means identical letter multisets, and counting is how you compare multisets in linear time. So count instead of sort.',
            'One array, not two. Increment for s, decrement for t. At the end every count must be zero — but you can do better than a final scan: if any decrement drives a count below zero, t needs a letter s does not have, so you can return false immediately.',
            'Check the lengths first. Equal lengths plus "no count went negative" is sufficient, which is why no verification loop is needed at the end.',
          ],
          wherePeopleLoseIt:
            'Skipping the length check and relying only on the negative test. With unequal lengths, t could be a strict prefix-multiset of s and every decrement stays non-negative, so the function wrongly returns true. One line, easy to forget, and the examples do not catch it.',
          time: 'O(n).',
          space: 'O(1) — 26 fixed slots.',
          code: {
            cpp: `bool isAnagram(string s, string t) {
  if (s.size() != t.size()) return false;    // essential, not decoration

  vector<int> freq(26, 0);
  for (char c : s) ++freq[c - 'a'];

  for (char c : t) {
    if (--freq[c - 'a'] < 0) return false;   // t needs a letter s lacks
  }
  return true;
}`,
            java: `public boolean isAnagram(String s, String t) {
  if (s.length() != t.length()) return false;

  int[] freq = new int[26];
  for (char c : s.toCharArray()) freq[c - 'a']++;

  for (char c : t.toCharArray()) {
    if (--freq[c - 'a'] < 0) return false;
  }
  return true;
}`,
          },
          followUp: 'What if the input is Unicode? Swap the array for a hash map keyed by code point, and compare map sizes as well as contents.',
        },
      },
      practice: [
        {
          lc: 383,
          title: 'Ransom Note',
          slug: 'ransom-note',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 10,
          insight: 'Containment rather than equality: counts must be sufficient, not identical, so drop the length check and keep the negative test.',
        },
        {
          lc: 387,
          title: 'First Unique Character in a String',
          slug: 'first-unique-character-in-a-string',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 12,
          insight: 'Flipped: count in pass one, then re-walk the ORIGINAL string in order to find the first count of 1 — position matters, so the map alone cannot answer it.',
          companies: ['amazon'],
        },
      ],
    },

    {
      id: 'two-pointer-string',
      name: 'Two pointers from both ends',
      signal:
        '"Palindrome", "reverse in place", "compare ignoring some characters". Start at both ends and walk inward, skipping whatever the problem says to ignore.',
      time: 'O(n)',
      space: 'O(1)',
      template: {
        cpp: `int l = 0, r = (int)s.size() - 1;
while (l < r) {
  while (l < r && !keep(s[l])) ++l;      // skip from the left
  while (l < r && !keep(s[r])) --r;      // skip from the right
  if (norm(s[l]) != norm(s[r])) return false;
  ++l; --r;
}
return true;`,
        java: `int l = 0, r = s.length() - 1;
while (l < r) {
  while (l < r && !keep(s.charAt(l))) l++;
  while (l < r && !keep(s.charAt(r))) r--;
  if (norm(s.charAt(l)) != norm(s.charAt(r))) return false;
  l++; r--;
}
return true;`,
      },
      taught: {
        lc: 125,
        title: 'Valid Palindrome',
        slug: 'valid-palindrome',
        difficulty: 'easy',
        role: 'taught',
        estMinutes: 15,
        insight:
          'Skip non-alphanumerics in place rather than building a cleaned copy — that is what turns an O(n)-space solution into an O(1)-space one.',
        whyThisOne:
          'It teaches the skip-in-place discipline, and its inner while loops are where the infinite-loop and out-of-bounds bugs of this whole family live.',
        walkthrough: {
          howToSeeIt: [
            'The easy version builds a filtered lowercase copy and compares it with its reverse. Correct, O(n) time, O(n) space — state it, then improve the space.',
            'To avoid the copy, do the filtering during the walk. Two pointers move inward, and each one skips characters the problem says to ignore before any comparison happens.',
            'Both inner skip loops must re-check l < r on every iteration. A string of only punctuation will otherwise run a pointer straight off the end.',
            'Normalise case at comparison time with tolower, not by mutating the string. Compare, then step both pointers inward.',
          ],
          wherePeopleLoseIt:
            'Dropping the l < r guard inside the skip loops, which reads out of bounds on input like ".,". The other one is using isalnum on a possibly negative char in C++ — cast to unsigned char, since passing a negative value to the ctype functions is undefined behaviour.',
          time: 'O(n).',
          space: 'O(1).',
          code: {
            cpp: `bool isPalindrome(string s) {
  int l = 0, r = (int)s.size() - 1;

  while (l < r) {
    while (l < r && !isalnum((unsigned char)s[l])) ++l;   // guard l < r every time
    while (l < r && !isalnum((unsigned char)s[r])) --r;

    if (tolower((unsigned char)s[l]) != tolower((unsigned char)s[r])) return false;
    ++l; --r;
  }
  return true;
}`,
            java: `public boolean isPalindrome(String s) {
  int l = 0, r = s.length() - 1;

  while (l < r) {
    while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;
    while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;

    if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) return false;
    l++; r--;
  }
  return true;
}`,
          },
          followUp: 'Allow deleting at most one character (LC 680) — on the first mismatch, try skipping the left OR the right and test both remainders.',
        },
      },
      practice: [
        {
          lc: 344,
          title: 'Reverse String',
          slug: 'reverse-string',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 6,
          insight: 'The bare skeleton: swap and step inward. Thirty seconds, but it is the loop every other problem in this type is built on.',
        },
        {
          lc: 680,
          title: 'Valid Palindrome II',
          slug: 'valid-palindrome-ii',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 25,
          insight:
            'Flipped: one deletion allowed, so on a mismatch you branch into two independent palindrome checks. Rated Easy, genuinely Medium — the branch is the whole problem.',
          companies: ['meta'],
        },
      ],
    },

    {
      id: 'string-parsing',
      name: 'Parsing with an explicit index',
      signal:
        'Messy input: optional signs, repeated delimiters, version numbers, paths, arbitrary whitespace. Walk with an index and consume the input in named phases rather than reaching for split.',
      time: 'O(n)',
      space: 'O(1) beyond the output',
      template: {
        cpp: `int i = 0, n = (int)s.size();
while (i < n && s[i] == ' ') ++i;                      // phase 1: skip whitespace
int sign = 1;
if (i < n && (s[i] == '+' || s[i] == '-'))             // phase 2: optional sign
  sign = (s[i++] == '-') ? -1 : 1;
long long val = 0;
while (i < n && isdigit((unsigned char)s[i]))          // phase 3: consume digits
  val = val * 10 + (s[i++] - '0');`,
        java: `int i = 0, n = s.length();
while (i < n && s.charAt(i) == ' ') i++;
int sign = 1;
if (i < n && (s.charAt(i) == '+' || s.charAt(i) == '-'))
  sign = s.charAt(i++) == '-' ? -1 : 1;
long val = 0;
while (i < n && Character.isDigit(s.charAt(i)))
  val = val * 10 + (s.charAt(i++) - '0');`,
      },
      taught: {
        lc: 8,
        title: 'String to Integer (atoi)',
        slug: 'string-to-integer-atoi',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 35,
        insight:
          'Four ordered phases: skip spaces, read an optional sign, consume digits, clamp on overflow. The specification IS the algorithm — follow it literally.',
        companies: ['google', 'microsoft'],
        whyThisOne:
          'It is disliked precisely because it rewards careful reading over cleverness, which is exactly the muscle real interviews test. Overflow handling here is the transferable part.',
        walkthrough: {
          howToSeeIt: [
            'Read the specification and write the phases down as a list before coding. Skip leading spaces, accept at most one sign, consume digits until a non-digit, clamp to the 32-bit range. Everything else is invalid and stops the parse.',
            'Each phase is a small loop or an if, in order, sharing one index. No backtracking anywhere — that is what makes it a single O(n) pass.',
            'Overflow is the real content. You cannot detect it after the fact in a 32-bit int, because the wraparound has already happened. Check BEFORE multiplying: if val already exceeds INT_MAX/10, or equals it while the next digit would exceed 7, clamp and stop.',
            'Alternatively accumulate into a 64-bit value and clamp once it leaves the 32-bit range — simpler to write under pressure, and worth saying that you would ask which the interviewer prefers.',
          ],
          wherePeopleLoseIt:
            'Detecting overflow after it has occurred, which is undefined behaviour for signed ints in C++ and silently wraps in Java. The second trap is accepting whitespace or a second sign after digits have started — the spec says the parse ends at the first invalid character, and no phase ever runs twice.',
          time: 'O(n).',
          space: 'O(1).',
          code: {
            cpp: `int myAtoi(string s) {
  int i = 0, n = (int)s.size();

  while (i < n && s[i] == ' ') ++i;                        // 1. whitespace

  int sign = 1;
  if (i < n && (s[i] == '+' || s[i] == '-'))               // 2. one optional sign
    sign = (s[i++] == '-') ? -1 : 1;

  long long val = 0;
  while (i < n && isdigit((unsigned char)s[i])) {          // 3. digits
    val = val * 10 + (s[i++] - '0');
    if (sign == 1 && val > INT_MAX) return INT_MAX;        // 4. clamp early
    if (sign == -1 && -val < INT_MIN) return INT_MIN;
  }
  return (int)(sign * val);
}`,
            java: `public int myAtoi(String s) {
  int i = 0, n = s.length();

  while (i < n && s.charAt(i) == ' ') i++;

  int sign = 1;
  if (i < n && (s.charAt(i) == '+' || s.charAt(i) == '-'))
    sign = s.charAt(i++) == '-' ? -1 : 1;

  long val = 0;
  while (i < n && Character.isDigit(s.charAt(i))) {
    val = val * 10 + (s.charAt(i++) - '0');
    if (sign == 1 && val > Integer.MAX_VALUE) return Integer.MAX_VALUE;
    if (sign == -1 && -val < Integer.MIN_VALUE) return Integer.MIN_VALUE;
  }
  return (int) (sign * val);
}`,
          },
          followUp: 'Do it without a 64-bit type — then the pre-multiplication check is mandatory, and writing it correctly is the real exercise.',
        },
      },
      practice: [
        {
          lc: 165,
          title: 'Compare Version Numbers',
          slug: 'compare-version-numbers',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight: 'Parse both sides in lockstep, treating a missing segment as 0 — that is what makes "1.0" and "1" compare equal without padding either string.',
        },
        {
          lc: 71,
          title: 'Simplify Path',
          slug: 'simplify-path',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped: parsing feeds a stack, because ".." must undo the previous segment. The first place where parsing and a data structure combine.',
          companies: ['meta'],
        },
      ],
    },
  ],
};
