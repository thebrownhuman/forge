import type { Topic } from '../../schema';

export const stacks: Topic = {
  id: 'stacks',
  name: 'Stacks',
  phase: 1,
  estHours: 10,
  prerequisites: ['stl'],

  whyItMatters:
    'A stack is the data structure for "I cannot resolve this yet — hold it until I can". That covers matching brackets, parsing expressions, and the entire monotonic-stack family that answers next-greater questions in O(n) instead of O(n^2). Monotonic stack in particular is a Google favourite and is almost never discovered on the spot; you either know the shape or you do not.',

  fundamentals: [
    {
      heading: 'The stack is deferred work',
      body:
        'Every stack problem has the same underlying story: you meet something you cannot finish processing, so you push it and continue; later you meet the thing that resolves it, so you pop. Brackets, operators awaiting operands, bars awaiting a shorter bar. If you can name what "unresolved" means in a problem, you have chosen your stack contents.',
      costs: [
        { op: 'push / pop / top', cost: 'O(1)', note: '' },
        { op: 'total work in a monotonic scan', cost: 'O(n)', note: 'each element is pushed once and popped at most once' },
      ],
    },
    {
      heading: 'Monotonic stack, and why it is linear',
      body:
        'A monotonic stack keeps its contents sorted — decreasing for next-greater problems, increasing for next-smaller. When a new element arrives, pop everything it dominates; each popped element has just found its answer. The inner while loop looks quadratic but is not: every index is pushed exactly once and popped at most once, so the total is O(n). This is the same amortised argument as the sliding window, and you should be able to state it.',
      code: {
        cpp: `stack<int> st;                         // holds INDICES, values decreasing
for (int i = 0; i < n; ++i) {
  while (!st.empty() && a[st.top()] < a[i]) {
    int j = st.top(); st.pop();
    answer[j] = i - j;                   // a[i] is the next greater for j
  }
  st.push(i);
}`,
        java: `Deque<Integer> st = new ArrayDeque<>();
for (int i = 0; i < n; i++) {
  while (!st.isEmpty() && a[st.peek()] < a[i]) {
    int j = st.pop();
    answer[j] = i - j;
  }
  st.push(i);
}`,
      },
    },
    {
      heading: 'Store indices, not values',
      body:
        'Almost always push the index. From an index you can recover the value, but from a value you cannot recover the position — and most problems need distances, widths or positions in the answer. This is the same lesson as the monotonic deque in sliding window, and it is the most common reason a first attempt needs rewriting.',
    },
    {
      heading: 'Use ArrayDeque in Java, not Stack',
      body:
        'java.util.Stack extends Vector and is synchronised, which makes it slower and gives it a surprising iteration order. The idiomatic choice is ArrayDeque used via push, pop and peek. In C++, std::stack is fine, though a plain vector with push_back and pop_back is often clearer when you also want to inspect the bottom.',
    },
  ],

  questionTypes: [
    {
      id: 'matching-pairs',
      name: 'Matching pairs and nesting',
      signal:
        'Brackets, tags, or anything with open and close markers where the most recent opening must be closed first. Push openers, and on a closer check the top matches.',
      time: 'O(n)',
      space: 'O(n)',
      template: {
        cpp: `stack<char> st;
for (char c : s) {
  if (isOpen(c)) st.push(c);
  else {
    if (st.empty() || !matches(st.top(), c)) return false;
    st.pop();
  }
}
return st.empty();                 // leftovers mean unclosed openers`,
        java: `Deque<Character> st = new ArrayDeque<>();
for (char c : s.toCharArray()) {
  if (isOpen(c)) st.push(c);
  else {
    if (st.isEmpty() || !matches(st.peek(), c)) return false;
    st.pop();
  }
}
return st.isEmpty();`,
      },
      taught: {
        lc: 20,
        title: 'Valid Parentheses',
        slug: 'valid-parentheses',
        difficulty: 'easy',
        role: 'taught',
        estMinutes: 15,
        insight:
          'Nesting means last-opened must be first-closed, which is the definition of a stack. Counting alone cannot work because it ignores type and order.',
        companies: ['google', 'amazon', 'meta'],
        whyThisOne:
          'The clearest statement of why a stack is required rather than convenient — and the counter-example that kills the counter approach is easy to produce on demand.',
        walkthrough: {
          howToSeeIt: [
            'Try counting first, then break it: "([)]" has balanced counts of every bracket type and is invalid. So counters cannot capture ORDER, and order is the entire constraint.',
            'The rule is that the most recently opened bracket must close first. That is last-in-first-out, so a stack is not a trick here, it is the direct encoding of the rule.',
            'Push every opener. On a closer, the stack top must be its matching opener — otherwise the string is invalid immediately.',
            'Two end conditions catch the two failure modes: an empty stack on a closer means a closer with no opener, and a non-empty stack at the end means unclosed openers. Both are required.',
          ],
          wherePeopleLoseIt:
            'Forgetting the empty-stack check before reading the top, which crashes on input like ")". And returning true without verifying the stack is empty, which wrongly accepts "(((". Both are one line and both are routinely missed.',
          time: 'O(n).',
          space: 'O(n).',
          code: {
            cpp: `bool isValid(string s) {
  stack<char> st;
  unordered_map<char,char> pairs{{')','('}, {']','['}, {'}','{'}};

  for (char c : s) {
    if (c == '(' || c == '[' || c == '{') {
      st.push(c);
    } else {
      if (st.empty() || st.top() != pairs[c]) return false;   // check BEFORE top()
      st.pop();
    }
  }
  return st.empty();                                          // no unclosed openers
}`,
            java: `public boolean isValid(String s) {
  Deque<Character> st = new ArrayDeque<>();

  for (char c : s.toCharArray()) {
    if (c == '(' || c == '[' || c == '{') {
      st.push(c);
    } else {
      if (st.isEmpty()) return false;
      char open = st.pop();
      if ((c == ')' && open != '(') || (c == ']' && open != '[') || (c == '}' && open != '{'))
        return false;
    }
  }
  return st.isEmpty();
}`,
          },
          followUp: 'Return the length of the longest valid substring (LC 32) — same stack, but you push indices and measure gaps.',
        },
      },
      practice: [
        {
          lc: 921,
          title: 'Minimum Add to Make Parentheses Valid',
          slug: 'minimum-add-to-make-parentheses-valid',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 15,
          insight: 'Only one bracket type, so two counters replace the stack. Good for seeing exactly when a stack is overkill.',
        },
        {
          lc: 1249,
          title: 'Minimum Remove to Make Valid Parentheses',
          slug: 'minimum-remove-to-make-valid-parentheses',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped: you must return the repaired string, so the stack holds INDICES of unmatched openers and you blank them out at the end.',
          companies: ['meta'],
        },
      ],
    },

    {
      id: 'monotonic-stack',
      name: 'Monotonic stack',
      signal:
        '"Next greater", "previous smaller", "how many days until", "largest rectangle", "trapping water". Anything asking about the nearest element on one side satisfying a comparison.',
      time: 'O(n)',
      space: 'O(n)',
      googleHeavy: true,
      template: {
        cpp: `vector<int> out(n, 0);
stack<int> st;                              // indices, values DECREASING
for (int i = 0; i < n; ++i) {
  while (!st.empty() && a[st.top()] < a[i]) {
    int j = st.top(); st.pop();
    out[j] = i - j;                         // i is j's next greater
  }
  st.push(i);
}`,
        java: `int[] out = new int[n];
Deque<Integer> st = new ArrayDeque<>();
for (int i = 0; i < n; i++) {
  while (!st.isEmpty() && a[st.peek()] < a[i]) {
    int j = st.pop();
    out[j] = i - j;
  }
  st.push(i);
}`,
      },
      taught: {
        lc: 739,
        title: 'Daily Temperatures',
        slug: 'daily-temperatures',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'Keep unresolved days on a decreasing stack. A warmer day resolves every colder day still waiting — each index is pushed once and popped once, so it is O(n).',
        companies: ['google', 'amazon'],
        whyThisOne:
          'The friendliest monotonic-stack problem: the "waiting days" story maps perfectly onto the stack contents, which makes the abstraction concrete before the harder variants.',
        walkthrough: {
          howToSeeIt: [
            'Brute force scans forward from every day: O(n^2). Notice the wasted work — many days share the same answer day, and you rescan the same stretch repeatedly.',
            'Invert the question. Instead of each day searching for its warmer future, let each new day announce itself to everyone still waiting.',
            'Keep the unresolved days on a stack. Because any day that is warmer than an earlier unresolved one would already have resolved it, the stack is automatically decreasing in temperature — you never have to sort it.',
            'When day i arrives, pop every day colder than it and record the distance i - j for each. Push i, which is now itself unresolved. Anything still on the stack at the end never warms up and keeps its default of 0.',
          ],
          wherePeopleLoseIt:
            'Pushing temperatures rather than indices, which makes the distance impossible to compute. The other is fearing the nested while and rewriting it as something quadratic — state the amortised argument out loud: n pushes, at most n pops, O(n) total.',
          time: 'O(n) amortised.',
          space: 'O(n).',
          code: {
            cpp: `vector<int> dailyTemperatures(vector<int>& temps) {
  int n = (int)temps.size();
  vector<int> out(n, 0);        // default 0: never gets warmer
  stack<int> st;                // indices, temperatures decreasing

  for (int i = 0; i < n; ++i) {
    while (!st.empty() && temps[st.top()] < temps[i]) {
      int j = st.top(); st.pop();
      out[j] = i - j;           // day i resolves day j
    }
    st.push(i);
  }
  return out;
}`,
            java: `public int[] dailyTemperatures(int[] temps) {
  int n = temps.length;
  int[] out = new int[n];
  Deque<Integer> st = new ArrayDeque<>();

  for (int i = 0; i < n; i++) {
    while (!st.isEmpty() && temps[st.peek()] < temps[i]) {
      int j = st.pop();
      out[j] = i - j;
    }
    st.push(i);
  }
  return out;
}`,
          },
          followUp: 'Make the array circular (LC 503) — walk it twice with modular indexing and push only on the first lap.',
        },
      },
      practice: [
        {
          lc: 496,
          title: 'Next Greater Element I',
          slug: 'next-greater-element-i',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 20,
          insight: 'Same scan, with a hash map to redirect results back to the query array. Two structures, each doing what it is good at.',
        },
        {
          lc: 84,
          title: 'Largest Rectangle in Histogram',
          slug: 'largest-rectangle-in-histogram',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 60,
          insight:
            'Flipped: on popping a bar you learn BOTH its boundaries at once, so width is i - newTop - 1. The hardest standard use of this pattern — expect to fight it.',
          companies: ['google', 'amazon'],
        },
      ],
    },

    {
      id: 'expression-eval',
      name: 'Expression evaluation',
      signal:
        'Arithmetic in a string — RPN, infix with precedence, nested parentheses. Push operands; apply an operator when its operands are both available.',
      time: 'O(n)',
      space: 'O(n)',
      template: {
        cpp: `stack<long long> nums;
for (const string& tok : tokens) {
  if (isOperator(tok)) {
    long long b = nums.top(); nums.pop();
    long long a = nums.top(); nums.pop();     // order matters: a OP b
    nums.push(apply(a, b, tok));
  } else {
    nums.push(stoll(tok));
  }
}
return nums.top();`,
        java: `Deque<Long> nums = new ArrayDeque<>();
for (String tok : tokens) {
  if (isOperator(tok)) {
    long b = nums.pop(), a = nums.pop();
    nums.push(apply(a, b, tok));
  } else {
    nums.push(Long.parseLong(tok));
  }
}
return nums.pop();`,
      },
      taught: {
        lc: 150,
        title: 'Evaluate Reverse Polish Notation',
        slug: 'evaluate-reverse-polish-notation',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 25,
        insight:
          'RPN needs no precedence rules at all — operands are always the two most recent values. Pop order is reversed: the first pop is the RIGHT operand.',
        companies: ['amazon', 'google'],
        whyThisOne:
          'It isolates the evaluation mechanism without precedence, which is the right foundation before infix calculators where precedence is the whole difficulty.',
        walkthrough: {
          howToSeeIt: [
            'In postfix notation an operator always follows its two operands, so there is nothing to look ahead for. That is exactly why RPN exists and why it is stack-native.',
            'Push numbers. On an operator, the two most recent values are its operands — pop them, apply, push the result back.',
            'Watch the order. The FIRST value popped is the right operand, because it was pushed last. For minus and divide this matters; for plus and times it silently does not, which is why the bug hides.',
            'A well-formed expression leaves exactly one value on the stack, and that is the answer.',
          ],
          wherePeopleLoseIt:
            'Reversed operands on subtraction and division. It works on every commutative test case and fails on the first "5 1 -", which is why people submit it confidently. Overflow is the second issue: accumulate in a 64-bit type.',
          time: 'O(n).',
          space: 'O(n).',
          code: {
            cpp: `int evalRPN(vector<string>& tokens) {
  stack<long long> nums;

  for (const string& t : tokens) {
    if (t == "+" || t == "-" || t == "*" || t == "/") {
      long long b = nums.top(); nums.pop();     // RIGHT operand pops first
      long long a = nums.top(); nums.pop();

      if      (t == "+") nums.push(a + b);
      else if (t == "-") nums.push(a - b);
      else if (t == "*") nums.push(a * b);
      else               nums.push(a / b);      // truncates toward zero
    } else {
      nums.push(stoll(t));
    }
  }
  return (int)nums.top();
}`,
            java: `public int evalRPN(String[] tokens) {
  Deque<Long> nums = new ArrayDeque<>();

  for (String t : tokens) {
    switch (t) {
      case "+": { long b = nums.pop(), a = nums.pop(); nums.push(a + b); break; }
      case "-": { long b = nums.pop(), a = nums.pop(); nums.push(a - b); break; }
      case "*": { long b = nums.pop(), a = nums.pop(); nums.push(a * b); break; }
      case "/": { long b = nums.pop(), a = nums.pop(); nums.push(a / b); break; }
      default:  nums.push(Long.parseLong(t));
    }
  }
  return nums.pop().intValue();
}`,
          },
          followUp: 'Now evaluate infix with precedence (LC 227) — hold a pending operator and defer multiplication by popping and combining immediately.',
        },
      },
      practice: [
        {
          lc: 227,
          title: 'Basic Calculator II',
          slug: 'basic-calculator-ii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 40,
          insight: 'Precedence without parentheses: push for + and -, but for * and / pop, combine and push back immediately so the stack only ever holds addable terms.',
          companies: ['amazon', 'google'],
        },
        {
          lc: 224,
          title: 'Basic Calculator',
          slug: 'basic-calculator',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 50,
          insight:
            'Flipped: parentheses and unary minus, no multiplication. Push the running result and the sign at "(", restore them at ")". A different stack content entirely.',
          companies: ['google'],
        },
      ],
    },

    {
      id: 'stack-simulation',
      name: 'Stack as a simulation of nesting',
      signal:
        'Nested structure that must be expanded or undone — "decode 3[a2[c]]", "simplify this path", "undo the last operation", "maintain a minimum alongside the data".',
      time: 'O(n) or O(output length)',
      space: 'O(n)',
      template: {
        cpp: `stack<pair<int,string>> st;          // saved (count, text) at each '['
int k = 0; string cur;
for (char c : s) {
  if (isdigit(c))      k = k * 10 + (c - '0');
  else if (c == '[') { st.push({k, cur}); k = 0; cur.clear(); }
  else if (c == ']') { auto [cnt, prev] = st.top(); st.pop();
                       string rep; while (cnt--) rep += cur;
                       cur = prev + rep; }
  else                 cur += c;
}`,
        java: `Deque<Integer> counts = new ArrayDeque<>();
Deque<StringBuilder> parts = new ArrayDeque<>();
int k = 0; StringBuilder cur = new StringBuilder();`,
      },
      taught: {
        lc: 394,
        title: 'Decode String',
        slug: 'decode-string',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          'On "[" push the CONTEXT you are leaving — the repeat count and the text built so far — and start fresh. On "]" restore it and append the repeated block.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'It makes the stack hold context rather than data, which is the mental step that also explains recursion, call stacks and later tree traversals.',
        walkthrough: {
          howToSeeIt: [
            'Nesting can be arbitrarily deep, so a single pass with a few variables cannot work. Either recursion or an explicit stack is required — and the stack version makes the saved state visible, which is why it is worth writing.',
            'Decide what must survive a nested block. When you enter "[", two things are at risk: the multiplier just parsed, and the text accumulated before the block began. Push both.',
            'Inside the block, build fresh. Digits accumulate a multi-digit number — k = k*10 + digit, because counts above 9 exist and single-digit parsing is a classic silent failure.',
            'On "]", pop the saved pair, repeat the freshly built text that many times, and append it to the saved prefix. The result becomes the current text of the enclosing level.',
          ],
          wherePeopleLoseIt:
            'Parsing only one digit, so "12[a]" becomes one "a" followed by literal noise. And forgetting to reset both k and the current string after pushing — the nested level then inherits state it should not see.',
          time: 'O(total output length).',
          space: 'O(nesting depth).',
          code: {
            cpp: `string decodeString(string s) {
  stack<pair<int,string>> st;   // (repeat count, text before this block)
  string cur;
  int k = 0;

  for (char c : s) {
    if (isdigit((unsigned char)c)) {
      k = k * 10 + (c - '0');            // multi-digit counts
    } else if (c == '[') {
      st.push({k, cur});                 // save the context we are leaving
      k = 0;
      cur.clear();
    } else if (c == ']') {
      auto [count, prev] = st.top(); st.pop();
      string repeated;
      while (count--) repeated += cur;
      cur = prev + repeated;             // splice back into the outer level
    } else {
      cur += c;
    }
  }
  return cur;
}`,
            java: `public String decodeString(String s) {
  Deque<Integer> counts = new ArrayDeque<>();
  Deque<String> prevs = new ArrayDeque<>();
  StringBuilder cur = new StringBuilder();
  int k = 0;

  for (char c : s.toCharArray()) {
    if (Character.isDigit(c)) {
      k = k * 10 + (c - '0');
    } else if (c == '[') {
      counts.push(k);
      prevs.push(cur.toString());
      k = 0;
      cur = new StringBuilder();
    } else if (c == ']') {
      int count = counts.pop();
      StringBuilder sb = new StringBuilder(prevs.pop());
      for (int i = 0; i < count; i++) sb.append(cur);
      cur = sb;
    } else {
      cur.append(c);
    }
  }
  return cur.toString();
}`,
          },
          followUp: 'Write the recursive version and note it is the same algorithm — the call stack simply stores the context you were pushing by hand.',
        },
      },
      practice: [
        {
          lc: 155,
          title: 'Min Stack',
          slug: 'min-stack',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight: 'Store the minimum alongside each entry, or keep a parallel stack of minima. The point: a stack can carry derived state, not just values.',
          companies: ['amazon', 'google'],
        },
        {
          lc: 946,
          title: 'Validate Stack Sequences',
          slug: 'validate-stack-sequences',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight: 'Flipped: simulate the stack and pop greedily whenever the top matches the next expected value. Valid exactly when the stack empties.',
        },
      ],
    },
  ],
};
