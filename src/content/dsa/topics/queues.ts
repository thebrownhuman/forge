import type { Topic } from '../../schema';

export const queues: Topic = {
  id: 'queues',
  name: 'Queues & Deques',
  phase: 1,
  estHours: 6,
  prerequisites: ['stl'],

  whyItMatters:
    'A queue is how you process things in arrival order, and that makes it the engine of BFS — which is most of the graph and tree work in Phases 2 and 3. Learning it here, on small self-contained problems, means BFS later is about the graph rather than about the container. The deque adds O(1) access at both ends, which is what makes sliding-window maximum linear.',

  fundamentals: [
    {
      heading: 'Queue, deque, and why a naive queue is wrong',
      body:
        'A queue is first-in-first-out. Implementing one on a plain array by shifting elements after every pop is O(n) per operation — the classic mistake. Real implementations use a circular buffer or a linked structure so both ends are O(1). In C++ reach for std::deque or std::queue; in Java use ArrayDeque for both stacks and queues and never LinkedList, which allocates a node per element.',
      costs: [
        { op: 'push_back / pop_front', cost: 'O(1)', note: 'the entire reason a queue exists' },
        { op: 'array queue with shifting', cost: 'O(n) per pop', note: 'the mistake to avoid' },
        { op: 'deque: access either end', cost: 'O(1)', note: 'enables the monotonic-deque pattern' },
        { op: 'deque: random access', cost: 'O(1) in C++', note: 'Java ArrayDeque has no indexing at all' },
      ],
    },
    {
      heading: 'The circular buffer',
      body:
        'Fixed-capacity queues wrap around a fixed array using modular arithmetic: tail = (tail + 1) % capacity. The one genuine design problem is distinguishing full from empty, since in both states head == tail. Two standard fixes: keep an explicit size counter, or waste one slot so full means (tail + 1) % capacity == head. Say which you chose and why — that choice is the interview content.',
      code: {
        cpp: `int data[capacity];
int head = 0, size = 0;
bool push(int x) {
  if (size == capacity) return false;
  data[(head + size) % capacity] = x;   // no separate tail needed
  ++size;
  return true;
}`,
        java: `int[] data = new int[capacity];
int head = 0, size = 0;
boolean push(int x) {
  if (size == capacity) return false;
  data[(head + size) % capacity] = x;
  size++;
  return true;
}`,
      },
    },
    {
      heading: 'The BFS shape you will reuse for months',
      body:
        'Snapshot the queue size before processing a level — that count IS the level, and reading queue.size() inside the loop is wrong because the queue grows as you push children. This one idiom covers level-order traversal, shortest path in an unweighted graph, and multi-source spreading. Learn it here so it is free later.',
      code: {
        cpp: `queue<Node*> q;
q.push(start);
int depth = 0;
while (!q.empty()) {
  int levelSize = (int)q.size();          // snapshot BEFORE the inner loop
  for (int i = 0; i < levelSize; ++i) {
    auto node = q.front(); q.pop();
    for (auto* next : neighbours(node)) q.push(next);
  }
  ++depth;
}`,
        java: `Queue<Node> q = new ArrayDeque<>();
q.add(start);
int depth = 0;
while (!q.isEmpty()) {
  int levelSize = q.size();
  for (int i = 0; i < levelSize; i++) {
    Node node = q.poll();
    for (Node next : neighbours(node)) q.add(next);
  }
  depth++;
}`,
      },
    },
  ],

  questionTypes: [
    {
      id: 'circular-buffer',
      name: 'Fixed-capacity and circular queues',
      signal:
        'Design a queue with a capacity limit, a ring buffer, or a sliding count of recent events. Modular indexing plus an explicit size, and one clear rule for full versus empty.',
      time: 'O(1) per operation',
      space: 'O(capacity)',
      template: {
        cpp: `int head = 0, size = 0, cap;
vector<int> buf;
bool enQueue(int v) { if (size == cap) return false; buf[(head + size++) % cap] = v; return true; }
bool deQueue()      { if (size == 0) return false;  head = (head + 1) % cap; --size; return true; }`,
        java: `int head = 0, size = 0, cap;
int[] buf;
boolean enQueue(int v) { if (size == cap) return false; buf[(head + size++) % cap] = v; return true; }
boolean deQueue()      { if (size == 0) return false;  head = (head + 1) % cap; size--; return true; }`,
      },
      taught: {
        lc: 622,
        title: 'Design Circular Queue',
        slug: 'design-circular-queue',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'Track head and SIZE rather than head and tail. The tail is derivable as (head + size) % capacity, and full versus empty becomes unambiguous for free.',
        whyThisOne:
          'It forces the full-versus-empty decision, which is the one genuine design question in every ring buffer — and ring buffers are real infrastructure, not just an exercise.',
        walkthrough: {
          howToSeeIt: [
            'Fixed capacity plus O(1) at both ends means a plain array with wraparound. Shifting elements on dequeue is the thing to avoid, so the head must move instead of the data.',
            'With head and tail pointers, head == tail is ambiguous — it describes both an empty queue and a full one. That ambiguity is the whole design problem.',
            'Two standard resolutions: keep an explicit size counter, or deliberately waste one slot so a full queue is (tail + 1) % cap == head. The size counter is clearer and costs four bytes; say that you know both.',
            'With head and size, everything follows: the tail slot is (head + size) % cap, enqueue writes there and increments size, dequeue advances head and decrements size. Front and rear are one-liners.',
          ],
          wherePeopleLoseIt:
            'Computing rear as (head + size) % cap and forgetting the -1 — the rear element sits at (head + size - 1) % cap. The other trap is a negative intermediate when size is 0; guard the empty case before computing any index.',
          time: 'O(1) for every operation.',
          space: 'O(capacity).',
          code: {
            cpp: `class MyCircularQueue {
  vector<int> buf;
  int head = 0, size = 0, cap;
public:
  MyCircularQueue(int k) : buf(k), cap(k) {}

  bool enQueue(int value) {
    if (size == cap) return false;
    buf[(head + size) % cap] = value;      // tail is derived, never stored
    ++size;
    return true;
  }
  bool deQueue() {
    if (size == 0) return false;
    head = (head + 1) % cap;
    --size;
    return true;
  }
  int Front() { return size == 0 ? -1 : buf[head]; }
  int Rear()  { return size == 0 ? -1 : buf[(head + size - 1) % cap]; }   // -1 matters
  bool isEmpty() { return size == 0; }
  bool isFull()  { return size == cap; }
};`,
            java: `class MyCircularQueue {
  private final int[] buf;
  private final int cap;
  private int head = 0, size = 0;

  public MyCircularQueue(int k) { buf = new int[k]; cap = k; }

  public boolean enQueue(int value) {
    if (size == cap) return false;
    buf[(head + size) % cap] = value;
    size++;
    return true;
  }
  public boolean deQueue() {
    if (size == 0) return false;
    head = (head + 1) % cap;
    size--;
    return true;
  }
  public int Front() { return size == 0 ? -1 : buf[head]; }
  public int Rear()  { return size == 0 ? -1 : buf[(head + size - 1) % cap]; }
  public boolean isEmpty() { return size == 0; }
  public boolean isFull()  { return size == cap; }
}`,
          },
          followUp: 'Make it thread-safe for one producer and one consumer — the lock-free single-producer single-consumer ring buffer is a real systems question.',
        },
      },
      practice: [
        {
          lc: 933,
          title: 'Number of Recent Calls',
          slug: 'number-of-recent-calls',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 15,
          insight: 'A queue as a time window: push the new timestamp, pop everything older than 3000ms, return the size. The simplest useful queue there is.',
        },
        {
          lc: 641,
          title: 'Design Circular Deque',
          slug: 'design-circular-deque',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight: 'Flipped to both ends: inserting at the front means head = (head - 1 + cap) % cap. The + cap before the modulo is mandatory in both languages.',
        },
      ],
    },

    {
      id: 'queue-from-stacks',
      name: 'Building one structure from another',
      signal:
        '"Implement a queue using stacks" or the reverse. The trick is amortisation: move elements between two containers only when the destination is empty.',
      time: 'O(1) amortised',
      space: 'O(n)',
      template: {
        cpp: `stack<int> in, out;
void push(int x) { in.push(x); }
int pop() {
  if (out.empty())                       // ONLY refill when out is empty
    while (!in.empty()) { out.push(in.top()); in.pop(); }
  int v = out.top(); out.pop();
  return v;
}`,
        java: `Deque<Integer> in = new ArrayDeque<>(), out = new ArrayDeque<>();
void push(int x) { in.push(x); }
int pop() {
  if (out.isEmpty())
    while (!in.isEmpty()) out.push(in.pop());
  return out.pop();
}`,
      },
      taught: {
        lc: 232,
        title: 'Implement Queue using Stacks',
        slug: 'implement-queue-using-stacks',
        difficulty: 'easy',
        role: 'taught',
        estMinutes: 25,
        insight:
          'Pouring one stack into another reverses the order. Do it only when the output stack is empty, and every element moves at most twice — O(1) amortised.',
        companies: ['microsoft', 'amazon'],
        whyThisOne:
          'The cleanest small proof of amortised analysis. Being able to explain why worst-case O(n) averages to O(1) is the actual interview content here.',
        walkthrough: {
          howToSeeIt: [
            'A stack is last-in-first-out, a queue is first-in-first-out, so something has to reverse the order. Pouring a stack into another stack does exactly that.',
            'The naive version pours back and forth on every operation, which is O(n) every time. That works but misses the point of the problem.',
            'Better: keep an input stack and an output stack. Push always goes to input. Pop takes from output — and only when output is EMPTY do you pour everything across.',
            'That gives the amortised argument: each element is pushed to input once, moved to output once, and popped once. Three constant operations per element over its lifetime, so O(1) amortised, even though one individual pop can cost O(n).',
          ],
          wherePeopleLoseIt:
            'Pouring when output is non-empty, which interleaves old and new elements and breaks FIFO order. The condition must be "only if output is empty" — it is one line and it is the entire correctness argument. Also remember peek needs the same refill logic, so factor it out.',
          time: 'O(1) amortised, O(n) worst case for a single pop.',
          space: 'O(n).',
          code: {
            cpp: `class MyQueue {
  stack<int> in, out;

  void shift() {
    if (out.empty())                      // ONLY when empty — this is the invariant
      while (!in.empty()) { out.push(in.top()); in.pop(); }
  }

public:
  void push(int x) { in.push(x); }

  int pop()  { shift(); int v = out.top(); out.pop(); return v; }
  int peek() { shift(); return out.top(); }
  bool empty() { return in.empty() && out.empty(); }
};`,
            java: `class MyQueue {
  private final Deque<Integer> in = new ArrayDeque<>();
  private final Deque<Integer> out = new ArrayDeque<>();

  private void shift() {
    if (out.isEmpty())
      while (!in.isEmpty()) out.push(in.pop());
  }

  public void push(int x) { in.push(x); }

  public int pop()  { shift(); return out.pop(); }
  public int peek() { shift(); return out.peek(); }
  public boolean empty() { return in.isEmpty() && out.isEmpty(); }
}`,
          },
          followUp: 'Now implement a stack using queues (LC 225) — and note the asymmetry: that direction cannot be O(1) amortised, one operation must be O(n).',
        },
      },
      practice: [
        {
          lc: 225,
          title: 'Implement Stack using Queues',
          slug: 'implement-stack-using-queues',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 25,
          insight: 'The reverse direction, and it is genuinely harder — rotating the queue on push makes push O(n) and pop O(1). Explain why no amortised trick rescues it.',
        },
        {
          lc: 1381,
          title: 'Design a Stack With Increment Operation',
          slug: 'design-a-stack-with-increment-operation',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped: lazy propagation. Record a pending increment at one index instead of touching k elements, and push it down on pop. O(1) for an operation that looks like O(k).',
        },
      ],
    },

    {
      id: 'deque-both-ends',
      name: 'Deques and round-robin simulation',
      signal:
        'Elements return to the back after being processed, or you need to take from both ends. Simulation problems where "goes to the back of the line" appears literally.',
      time: 'O(n) to O(n log n)',
      space: 'O(n)',
      template: {
        cpp: `deque<int> a, b;
while (!a.empty() && !b.empty()) {
  int x = a.front(); a.pop_front();
  int y = b.front(); b.pop_front();
  if (x < y) a.push_back(x + n);      // winner rejoins in the NEXT round
  else       b.push_back(y + n);
}`,
        java: `Deque<Integer> a = new ArrayDeque<>(), b = new ArrayDeque<>();
while (!a.isEmpty() && !b.isEmpty()) {
  int x = a.pollFirst(), y = b.pollFirst();
  if (x < y) a.addLast(x + n);
  else       b.addLast(y + n);
}`,
      },
      taught: {
        lc: 649,
        title: 'Dota2 Senate',
        slug: 'dota2-senate',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'Two queues of indices. The earlier index bans the later one and rejoins the line at position index + n, which encodes "next round" without any round bookkeeping.',
        whyThisOne:
          'It teaches the index + n trick for cyclic turn order, which is far cleaner than simulating rounds explicitly and generalises to many scheduling problems.',
        walkthrough: {
          howToSeeIt: [
            'Read the rule carefully: on each turn a senator bans the next opposing senator who would act after them, cyclically. Every senator acts greedily, so there is nothing to search — only to simulate.',
            'Order matters and elements return to the back, which is a queue. Two queues, one per party, holding INDICES so that original order is preserved.',
            'Each step compares the two front indices. The smaller index acts first and eliminates the other, which is simply not re-enqueued.',
            'The winner rejoins the back with index + n. Because every surviving index grows by n each round, comparisons across rounds stay correct without tracking round numbers at all. The loop ends when one queue empties.',
          ],
          wherePeopleLoseIt:
            'Re-enqueueing with the original index instead of index + n. The comparison then mixes senators from different rounds and the simulation silently produces the wrong winner. Writing out two rounds by hand is the fastest way to convince yourself the + n is required.',
          time: 'O(n) amortised — each elimination removes one senator permanently.',
          space: 'O(n).',
          code: {
            cpp: `string predictPartyVictory(string senate) {
  int n = (int)senate.size();
  queue<int> radiant, dire;

  for (int i = 0; i < n; ++i) {
    if (senate[i] == 'R') radiant.push(i);
    else                  dire.push(i);
  }

  while (!radiant.empty() && !dire.empty()) {
    int r = radiant.front(); radiant.pop();
    int d = dire.front();    dire.pop();

    // The earlier index acts first and bans the other; the winner returns NEXT round.
    if (r < d) radiant.push(r + n);
    else       dire.push(d + n);
  }
  return radiant.empty() ? "Dire" : "Radiant";
}`,
            java: `public String predictPartyVictory(String senate) {
  int n = senate.length();
  Queue<Integer> radiant = new ArrayDeque<>(), dire = new ArrayDeque<>();

  for (int i = 0; i < n; i++) {
    if (senate.charAt(i) == 'R') radiant.add(i);
    else                         dire.add(i);
  }

  while (!radiant.isEmpty() && !dire.isEmpty()) {
    int r = radiant.poll(), d = dire.poll();
    if (r < d) radiant.add(r + n);
    else       dire.add(d + n);
  }
  return radiant.isEmpty() ? "Dire" : "Radiant";
}`,
          },
        },
      },
      practice: [
        {
          lc: 950,
          title: 'Reveal Cards In Increasing Order',
          slug: 'reveal-cards-in-increasing-order',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'Run the described process BACKWARDS with a deque — sort, then repeatedly rotate the back to the front and push the next largest card.',
        },
        {
          lc: 2073,
          title: 'Time Needed to Buy Tickets',
          slug: 'time-needed-to-buy-tickets',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 20,
          insight:
            'Flipped: simulate with a queue first, then find the O(n) closed form by counting how many times each person is served before the target finishes.',
        },
      ],
    },
  ],
};
