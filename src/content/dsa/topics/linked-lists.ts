import type { Topic } from '../../schema';

export const linkedLists: Topic = {
  id: 'linked-lists',
  name: 'Linked Lists',
  phase: 1,
  estHours: 15,
  prerequisites: ['two-pointers'],

  whyItMatters:
    'Linked lists are almost never the right data structure in production, and that is exactly why they are asked: they test pointer discipline with nowhere to hide. There is no index to fall back on, so every solution is about holding the right references at the right moment. Master the seven shapes below and the topic stops being scary — there genuinely are only seven.',

  fundamentals: [
    {
      heading: 'A node is an address, not a box',
      body:
        'The single mental fix that makes linked lists click: a variable like cur does not CONTAIN a node, it POINTS at one. Writing cur = cur->next does not change the list at all — it moves your finger. Writing cur->next = x changes the list, because it edits the node itself. Every bug you will hit is a confusion between these two. Before writing any line, ask: am I moving my finger, or am I rewiring?',
      code: {
        cpp: `struct ListNode {
  int val;
  ListNode* next;
  ListNode(int v) : val(v), next(nullptr) {}
};

cur = cur->next;      // move my finger along; list unchanged
cur->next = other;    // rewire: the list itself changed`,
        java: `class ListNode {
  int val;
  ListNode next;
  ListNode(int v) { val = v; }
}

cur = cur.next;       // move my finger
cur.next = other;     // rewire`,
      },
      costs: [
        { op: 'access by index', cost: 'O(n)', note: 'no random access — this is the whole trade' },
        { op: 'insert / delete given the previous node', cost: 'O(1)', note: 'the one thing lists beat arrays at' },
        { op: 'insert / delete given only the node', cost: 'O(n)', note: 'you must find the previous node first' },
        { op: 'search', cost: 'O(n)', note: '' },
      ],
    },
    {
      heading: 'Draw it. Always. Three nodes is enough.',
      body:
        'Every experienced interviewer expects you to sketch. Draw three nodes and the pointers you hold, then perform each line of your loop by hand. Nearly all linked-list bugs are visible in a three-node drawing and invisible in your head. This is not a beginner crutch — it is the technique.',
    },
    {
      heading: 'The four edge cases that break everything',
      body:
        'Before you submit any linked-list solution, run these four in your head: (1) empty list, head == null; (2) single node; (3) the operation targets the HEAD itself; (4) the operation targets the TAIL. Case 3 is the most common failure and has a standard cure — the dummy node, question type 1 below. Case 2 breaks most fast/slow loops if the while condition is wrong.',
    },
    {
      heading: 'The reversal move, memorised',
      body:
        'Reversing a list in place is four lines, and you should be able to write them without thinking, because five of the seven question types use them. Hold three pointers. Save the next node BEFORE you overwrite the link — that is the whole trick. Overwrite cur->next first and you have severed the rest of the list and lost it forever.',
      code: {
        cpp: `ListNode* prev = nullptr;
ListNode* cur = head;
while (cur) {
  ListNode* nxt = cur->next;   // 1. save, BEFORE overwriting
  cur->next = prev;            // 2. flip the arrow
  prev = cur;                  // 3. advance prev
  cur = nxt;                   // 4. advance cur
}
return prev;                   // prev is the new head`,
        java: `ListNode prev = null, cur = head;
while (cur != null) {
  ListNode nxt = cur.next;
  cur.next = prev;
  prev = cur;
  cur = nxt;
}
return prev;`,
      },
    },
  ],

  questionTypes: [
    /* ---------------------------------------------------------------- 1 */
    {
      id: 'dummy-head',
      name: 'Dummy / sentinel head',
      signal:
        'Any insertion or deletion that could touch the head node. If the answer to "what if the thing I am removing IS the head?" needs a special branch, put a fake node in front and the branch disappears.',
      time: 'O(n)',
      space: 'O(1)',
      template: {
        cpp: `ListNode dummy(0);
dummy.next = head;
ListNode* prev = &dummy;

while (prev->next) {
  if (shouldRemove(prev->next)) prev->next = prev->next->next;  // unlink
  else prev = prev->next;                                        // advance
}
return dummy.next;   // never "return head" — head may have been removed`,
        java: `ListNode dummy = new ListNode(0);
dummy.next = head;
ListNode prev = dummy;

while (prev.next != null) {
  if (shouldRemove(prev.next)) prev.next = prev.next.next;
  else prev = prev.next;
}
return dummy.next;`,
      },
      taught: {
        lc: 19,
        title: 'Remove Nth Node From End of List',
        slug: 'remove-nth-node-from-end-of-list',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 25,
        insight:
          'Start both pointers at the dummy, gap them by n, walk together. The slow pointer lands on the node BEFORE the target — which is the only node that can unlink it.',
        companies: ['google', 'amazon', 'meta'],
        whyThisOne:
          'It fuses the dummy node with the gap trick, and its natural edge case — removing the head — is precisely what the dummy exists to kill.',
        walkthrough: {
          howToSeeIt: [
            'You are deleting, and "nth from the end" can be the head itself (n == length). That combination is the dummy-node signal, before you think about anything else.',
            'To unlink a node you need the node BEFORE it. You cannot go backwards in a singly linked list, so you must arrange to be standing on the predecessor when you arrive.',
            'Create the gap: advance fast by n+1 steps from the dummy. Now fast and slow are n+1 apart. Walk both until fast falls off the end; slow is now exactly on the predecessor of the target.',
            'Unlink with slow->next = slow->next->next and return dummy.next — never head, because head may be the node you just removed.',
          ],
          wherePeopleLoseIt:
            'Off-by-one in the gap. Advance fast n steps instead of n+1 and slow lands ON the target, not before it, so you delete the wrong node. Derive it once on a 3-node list instead of guessing — and start both pointers at the dummy, not at head, which is what makes n+1 correct.',
          time: 'O(n) — one pass.',
          space: 'O(1).',
          code: {
            cpp: `ListNode* removeNthFromEnd(ListNode* head, int n) {
  ListNode dummy(0);
  dummy.next = head;

  ListNode* fast = &dummy;
  ListNode* slow = &dummy;

  // Open a gap of n + 1 so slow stops on the PREDECESSOR.
  for (int i = 0; i <= n; ++i) fast = fast->next;

  while (fast) { fast = fast->next; slow = slow->next; }

  slow->next = slow->next->next;   // unlink
  return dummy.next;               // head may have been the target
}`,
            java: `public ListNode removeNthFromEnd(ListNode head, int n) {
  ListNode dummy = new ListNode(0);
  dummy.next = head;

  ListNode fast = dummy, slow = dummy;
  for (int i = 0; i <= n; i++) fast = fast.next;

  while (fast != null) { fast = fast.next; slow = slow.next; }

  slow.next = slow.next.next;
  return dummy.next;
}`,
          },
          followUp:
            'What if n is larger than the list length? In the real interview, say it out loud and add the guard — checking that fast survived the first loop. Naming an unstated precondition scores points.',
        },
      },
      practice: [
        {
          lc: 203,
          title: 'Remove Linked List Elements',
          slug: 'remove-linked-list-elements',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 15,
          insight: 'The pure dummy drill: leading nodes may all match, so without a dummy you need an ugly pre-loop.',
        },
        {
          lc: 82,
          title: 'Remove Duplicates from Sorted List II',
          slug: 'remove-duplicates-from-sorted-list-ii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped: you delete ALL copies, including the first, so prev must stay put while you skip a whole run. Advancing prev unconditionally is the bug this problem is built to catch.',
        },
      ],
    },

    /* ---------------------------------------------------------------- 2 */
    {
      id: 'fast-slow',
      name: 'Fast & slow pointers',
      signal:
        '"middle", "cycle", "k-th from the end", or "palindrome" — any of them with an O(1) space requirement. Two pointers moving at different speeds turn a length question into a meeting question.',
      time: 'O(n)',
      space: 'O(1)',
      googleHeavy: true,
      template: {
        cpp: `ListNode* slow = head;
ListNode* fast = head;
while (fast && fast->next) {   // this exact condition: both checks, this order
  slow = slow->next;
  fast = fast->next->next;
  if (slow == fast) { /* cycle */ }
}
// on exit, slow is the middle (second middle for even length)`,
        java: `ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
  slow = slow.next;
  fast = fast.next.next;
  if (slow == fast) { /* cycle */ }
}`,
      },
      taught: {
        lc: 142,
        title: 'Linked List Cycle II',
        slug: 'linked-list-cycle-ii',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          "After the pointers meet, restart one from the head and move both one step at a time — they meet exactly at the cycle entrance. That is Floyd's phase two, and it has a two-line proof.",
        companies: ['google', 'amazon'],
        whyThisOne:
          'Detecting a cycle is easy; FINDING the entrance is where people memorise without understanding. The proof below is short enough to derive at a whiteboard, which is what an interviewer is actually probing.',
        walkthrough: {
          howToSeeIt: [
            'O(1) space rules out a hash set of visited nodes. Two speeds are the only other tool — if there is a cycle, the fast pointer laps the slow one and they must collide.',
            'Phase one: run them until they meet. If fast hits null, there is no cycle. The meeting point is NOT the entrance, which is the thing everyone gets wrong.',
            'Now the algebra. Let F be the distance from head to the entrance, a the distance from the entrance to the meeting point, and C the cycle length. Slow travelled F + a. Fast travelled twice that, and also F + a + nC for some whole number of laps. So 2(F + a) = F + a + nC, which gives F + a = nC, that is F = nC − a.',
            'Read that last equation as a statement about distance: from the meeting point, walking C − a steps reaches the entrance, and F is exactly that distance plus whole laps. So a pointer starting at head and a pointer starting at the meeting point, both moving one step, arrive at the entrance together. Phase two is that walk.',
          ],
          wherePeopleLoseIt:
            'The loop condition. It must be while (fast && fast->next) — checking fast->next->next instead crashes, and checking only fast crashes on even-length lists. The other trap is starting the phase-two walk from slow AND fast rather than from head and the meeting point; that finds nothing.',
          time: 'O(n) — each phase is at most one traversal.',
          space: 'O(1).',
          code: {
            cpp: `ListNode* detectCycle(ListNode* head) {
  ListNode* slow = head;
  ListNode* fast = head;

  // Phase 1: find a meeting point inside the cycle.
  while (fast && fast->next) {
    slow = slow->next;
    fast = fast->next->next;
    if (slow == fast) {
      // Phase 2: F = nC - a, so these two meet at the entrance.
      ListNode* p = head;
      while (p != slow) { p = p->next; slow = slow->next; }
      return p;
    }
  }
  return nullptr;   // fast fell off the end: no cycle
}`,
            java: `public ListNode detectCycle(ListNode head) {
  ListNode slow = head, fast = head;

  while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) {
      ListNode p = head;
      while (p != slow) { p = p.next; slow = slow.next; }
      return p;
    }
  }
  return null;
}`,
          },
          followUp:
            'Return the cycle LENGTH as well — once the pointers have met, walk one of them around until it returns to the meeting point and count the steps.',
        },
      },
      practice: [
        {
          lc: 876,
          title: 'Middle of the Linked List',
          slug: 'middle-of-the-linked-list',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 10,
          insight:
            'The bare skeleton. Learn which middle you get for even length: starting both at head gives the SECOND middle; starting fast at head->next gives the first. You need the first one for palindrome splits.',
        },
        {
          lc: 287,
          title: 'Find the Duplicate Number',
          slug: 'find-the-duplicate-number',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 45,
          insight:
            "Flipped completely: an ARRAY, no list in sight. Treat i -> nums[i] as edges and the duplicate becomes a cycle entrance — LC 142 verbatim. Recognising this disguise is a genuine Google-level move.",
          companies: ['google'],
        },
      ],
    },

    /* ---------------------------------------------------------------- 3 */
    {
      id: 'in-place-reversal',
      name: 'In-place reversal',
      signal:
        '"reverse", "reorder", "palindrome", "swap in groups" — with O(1) space. Three pointers: prev, cur, next. Save next before you overwrite the link.',
      time: 'O(n)',
      space: 'O(1)',
      googleHeavy: true,
      template: {
        cpp: `ListNode* prev = nullptr;
ListNode* cur = head;
while (cur) {
  ListNode* nxt = cur->next;
  cur->next = prev;
  prev = cur;
  cur = nxt;
}
return prev;`,
        java: `ListNode prev = null, cur = head;
while (cur != null) {
  ListNode nxt = cur.next;
  cur.next = prev;
  prev = cur;
  cur = nxt;
}
return prev;`,
      },
      taught: {
        lc: 92,
        title: 'Reverse Linked List II',
        slug: 'reverse-linked-list-ii',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          'Walk to the node before position left and hold it. Then repeatedly pull the node after cur to the front of the segment — the head-insertion trick avoids re-stitching the ends afterwards.',
        companies: ['google', 'meta'],
        whyThisOne:
          'Full reversal (LC 206) is muscle memory; reversing a SEGMENT forces you to think about the two boundary joins, which is what every harder reversal problem is really testing.',
        walkthrough: {
          howToSeeIt: [
            'Reversal plus O(1) space, so the three-pointer move is the engine. The new part is that the segment has two seams: the node before left, and the node after right.',
            'left can be 1, meaning the segment starts at the head — dummy node, immediately. That removes the special case before it appears.',
            'Walk prev to the node just before position left. Everything that follows happens relative to prev, which never moves again. Anchoring on a fixed node is what keeps this manageable.',
            'Now the head-insertion loop, right − left times: take the node after cur, unhook it, and splice it directly after prev. The segment reverses in place and both seams stay connected the whole time, so there is nothing to reattach at the end.',
          ],
          wherePeopleLoseIt:
            'Trying to reverse the segment first and reconnect afterwards. It works, but you must hold four pointers at once and most people lose one. Head insertion holds three and never breaks the list. The second trap: looping right − left + 1 times instead of right − left, which pulls in one node too many.',
          time: 'O(n) — one walk to the segment, one pass through it.',
          space: 'O(1).',
          code: {
            cpp: `ListNode* reverseBetween(ListNode* head, int left, int right) {
  ListNode dummy(0);
  dummy.next = head;
  ListNode* prev = &dummy;

  // Stand on the node immediately before the segment.
  for (int i = 1; i < left; ++i) prev = prev->next;

  ListNode* cur = prev->next;          // first node of the segment; it becomes the last

  // Pull each following node to the front of the segment.
  for (int i = 0; i < right - left; ++i) {
    ListNode* moved = cur->next;
    cur->next = moved->next;           // unhook moved
    moved->next = prev->next;          // splice it in at the front
    prev->next = moved;
  }
  return dummy.next;
}`,
            java: `public ListNode reverseBetween(ListNode head, int left, int right) {
  ListNode dummy = new ListNode(0);
  dummy.next = head;
  ListNode prev = dummy;

  for (int i = 1; i < left; i++) prev = prev.next;

  ListNode cur = prev.next;

  for (int i = 0; i < right - left; i++) {
    ListNode moved = cur.next;
    cur.next = moved.next;
    moved.next = prev.next;
    prev.next = moved;
  }
  return dummy.next;
}`,
          },
          followUp:
            'Do it in one pass — the code above already is. Then: reverse every group of k nodes, which is LC 25 and applies this same loop repeatedly.',
        },
      },
      practice: [
        {
          lc: 206,
          title: 'Reverse Linked List',
          slug: 'reverse-linked-list',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 10,
          insight: 'The four lines you must be able to write in your sleep. Also write the recursive version once — it shows up again in tree problems.',
        },
        {
          lc: 25,
          title: 'Reverse Nodes in k-Group',
          slug: 'reverse-nodes-in-k-group',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 55,
          insight:
            'Flipped: repeated segment reversal, and you must check that k nodes REMAIN before reversing a group — a trailing partial group is left untouched.',
          companies: ['google', 'amazon', 'microsoft'],
        },
      ],
    },

    /* ---------------------------------------------------------------- 4 */
    {
      id: 'merge-lists',
      name: 'Merge & k-way merge',
      signal:
        'Sorted inputs and the word "merge". Two lists: a dummy plus one pointer. k lists: a min-heap of the current heads, or pairwise merging.',
      time: 'O(n) for two, O(N log k) for k',
      space: 'O(1) for two, O(k) for the heap',
      template: {
        cpp: `ListNode dummy(0);
ListNode* tail = &dummy;
while (a && b) {
  if (a->val <= b->val) { tail->next = a; a = a->next; }
  else                  { tail->next = b; b = b->next; }
  tail = tail->next;
}
tail->next = a ? a : b;    // attach whatever is left, wholesale
return dummy.next;`,
        java: `ListNode dummy = new ListNode(0), tail = dummy;
while (a != null && b != null) {
  if (a.val <= b.val) { tail.next = a; a = a.next; }
  else                { tail.next = b; b = b.next; }
  tail = tail.next;
}
tail.next = (a != null) ? a : b;
return dummy.next;`,
      },
      taught: {
        lc: 23,
        title: 'Merge k Sorted Lists',
        slug: 'merge-k-sorted-lists',
        difficulty: 'hard',
        role: 'taught',
        estMinutes: 45,
        insight:
          'Keep only the k current heads in a min-heap. Pop the smallest, append it, push its successor — you never hold more than k nodes at once.',
        companies: ['google', 'amazon', 'meta', 'microsoft'],
        whyThisOne:
          'It is the single most-asked linked-list Hard, and it rewards knowing WHY the heap holds heads rather than everything — which is the comparison the interviewer is listening for.',
        walkthrough: {
          howToSeeIt: [
            'Merging two sorted lists is the dummy-plus-tail template, O(1) space. The question is how to scale it to k.',
            'Naive: merge list 1 with 2, then with 3, and so on. Correct, but the growing accumulator is re-traversed every time, giving O(N·k). Say this out loud in an interview, then improve it — showing the progression is worth more than jumping to the answer.',
            'The insight: at every moment, the next node of the output is the smallest among the k current heads. Only k candidates ever matter. A min-heap of size k answers "which is smallest" in O(log k).',
            'So: push all k heads, then loop — pop the smallest, append it to the tail, and push its next node if one exists. Each of the N nodes is pushed and popped exactly once: O(N log k).',
          ],
          wherePeopleLoseIt:
            'Pushing every node into the heap upfront. It still works but costs O(N log N) time and O(N) space, and it misses the whole point. Second trap: forgetting to skip null lists when seeding the heap, which crashes on the empty-list test case that is always present.',
          time: 'O(N log k) where N is the total number of nodes.',
          space: 'O(k) for the heap.',
          code: {
            cpp: `ListNode* mergeKLists(vector<ListNode*>& lists) {
  auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };  // min-heap
  priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);

  for (ListNode* l : lists) if (l) pq.push(l);   // heads only, skip nulls

  ListNode dummy(0);
  ListNode* tail = &dummy;

  while (!pq.empty()) {
    ListNode* node = pq.top(); pq.pop();
    tail->next = node;
    tail = tail->next;
    if (node->next) pq.push(node->next);          // refill from that list
  }
  return dummy.next;
}`,
            java: `public ListNode mergeKLists(ListNode[] lists) {
  PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
  for (ListNode l : lists) if (l != null) pq.add(l);

  ListNode dummy = new ListNode(0), tail = dummy;

  while (!pq.isEmpty()) {
    ListNode node = pq.poll();
    tail.next = node;
    tail = tail.next;
    if (node.next != null) pq.add(node.next);
  }
  return dummy.next;
}`,
          },
          followUp:
            'Do it without a heap: merge lists pairwise in rounds, halving k each round. Same O(N log k), O(1) extra space. Knowing both, and the trade, is the complete answer.',
        },
      },
      practice: [
        {
          lc: 21,
          title: 'Merge Two Sorted Lists',
          slug: 'merge-two-sorted-lists',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 12,
          insight: 'The base template. Note the final line attaches the entire remaining list at once — no loop needed.',
        },
        {
          lc: 148,
          title: 'Sort List',
          slug: 'sort-list',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 45,
          insight:
            'Flipped: merge sort ON a list. Split with fast/slow (type 2), recurse, merge with the template. Lists are the one place merge sort beats quicksort — no random access needed.',
          companies: ['google', 'meta'],
        },
      ],
    },

    /* ---------------------------------------------------------------- 5 */
    {
      id: 'split-reverse-merge',
      name: 'Split, reverse, merge',
      signal:
        '"Reorder", "palindrome check", "fold the list" — any problem that needs the back half in reverse order, in O(1) space. Three known moves composed in sequence.',
      time: 'O(n)',
      space: 'O(1)',
      template: {
        cpp: `// 1. find the middle (fast/slow)
// 2. reverse the second half
// 3. walk both halves together, weaving or comparing`,
        java: `// 1. middle via fast/slow
// 2. reverse second half
// 3. walk both halves together`,
      },
      taught: {
        lc: 143,
        title: 'Reorder List',
        slug: 'reorder-list',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 40,
        insight:
          'L0 → Ln → L1 → Ln-1 is just the front half interleaved with the reversed back half. Three sub-problems you already know, run in order.',
        companies: ['google', 'amazon'],
        whyThisOne:
          'It teaches composition: no new technique at all, only the recognition that a scary-looking requirement decomposes into three moves you already own.',
        walkthrough: {
          howToSeeIt: [
            'Write out the target order and stare at it. L0, Ln, L1, Ln-1 — that is the first half and the reversed second half, alternating. The scary interleaving is just a weave.',
            'Getting the back half in reverse with O(1) space means physically reversing it — there is no backwards traversal in a singly linked list. So: find the middle, cut, reverse the tail.',
            'Find the middle with fast/slow. Here you want the FIRST middle on even lengths so the front half is never shorter — start fast at head->next.',
            'Cut the list at the middle (set first->next = null, or the weave will loop forever), reverse the second part, then weave: take one node from each side alternately until the second runs out.',
          ],
          wherePeopleLoseIt:
            'Forgetting to cut the list before reversing. The front half still points into the middle, so after reversal you have a cycle and the weave never terminates — it hangs instead of failing loudly, which makes it painful to debug. Cut first, always.',
          time: 'O(n) — three linear passes.',
          space: 'O(1).',
          code: {
            cpp: `void reorderList(ListNode* head) {
  if (!head || !head->next) return;

  // 1. First middle: slow ends on the last node of the front half.
  ListNode* slow = head;
  ListNode* fast = head->next;
  while (fast && fast->next) { slow = slow->next; fast = fast->next->next; }

  // 2. Cut, then reverse the back half.
  ListNode* second = slow->next;
  slow->next = nullptr;                 // THE cut — without it you build a cycle

  ListNode* prev = nullptr;
  while (second) {
    ListNode* nxt = second->next;
    second->next = prev;
    prev = second;
    second = nxt;
  }

  // 3. Weave the two halves.
  ListNode* first = head;
  while (prev) {
    ListNode* n1 = first->next;
    ListNode* n2 = prev->next;
    first->next = prev;
    prev->next = n1;
    first = n1;
    prev = n2;
  }
}`,
            java: `public void reorderList(ListNode head) {
  if (head == null || head.next == null) return;

  ListNode slow = head, fast = head.next;
  while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }

  ListNode second = slow.next;
  slow.next = null;

  ListNode prev = null;
  while (second != null) {
    ListNode nxt = second.next;
    second.next = prev;
    prev = second;
    second = nxt;
  }

  ListNode first = head;
  while (prev != null) {
    ListNode n1 = first.next, n2 = prev.next;
    first.next = prev;
    prev.next = n1;
    first = n1;
    prev = n2;
  }
}`,
          },
        },
      },
      practice: [
        {
          lc: 234,
          title: 'Palindrome Linked List',
          slug: 'palindrome-linked-list',
          difficulty: 'easy',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Same first two moves, then compare instead of weave. Rated Easy only if you allow O(n) space — the O(1) version is this pattern and is genuinely Medium.',
          companies: ['meta', 'amazon'],
        },
        {
          lc: 2130,
          title: 'Maximum Twin Sum of a Linked List',
          slug: 'maximum-twin-sum-of-a-linked-list',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight: 'Flipped: pair the halves and maximise a sum instead of weaving or comparing. Identical skeleton, different final pass.',
        },
      ],
    },

    /* ---------------------------------------------------------------- 6 */
    {
      id: 'node-cloning',
      name: 'Cloning with extra pointers',
      signal:
        'Nodes carry a pointer to an arbitrary other node — "random pointer", "clone this graph-ish list". You cannot set a link to a node that does not exist yet, so you need a map from old nodes to new ones, or an interleaving trick.',
      time: 'O(n)',
      space: 'O(n) with a map, O(1) interleaved',
      template: {
        cpp: `// Pass 1: clone every node, mapping old -> new
// Pass 2: now that all clones exist, wire next and random via the map
unordered_map<Node*, Node*> clone;`,
        java: `Map<Node,Node> clone = new HashMap<>();
// pass 1: create clones; pass 2: wire next and random`,
      },
      taught: {
        lc: 138,
        title: 'Copy List with Random Pointer',
        slug: 'copy-list-with-random-pointer',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 35,
        insight:
          'Two passes. Create every clone first so that every target exists, then wire the pointers by looking each original up in the map.',
        companies: ['google', 'amazon', 'meta'],
        whyThisOne:
          'It is the clearest example of a constraint forcing a two-pass structure, and its O(1)-space follow-up is a genuinely elegant trick worth owning.',
        walkthrough: {
          howToSeeIt: [
            'Try it in one pass and watch it break: node 1\'s random may point at node 5, which you have not created yet. You cannot assign a pointer to something that does not exist. The dependency is not linear, so one pass cannot work.',
            'Separate creation from wiring. Pass one: walk the list, create a clone of each node, and record original -> clone in a hash map. After this pass every clone exists, unlinked.',
            'Pass two: walk the originals again. For each one, set clone->next = map[orig->next] and clone->random = map[orig->random]. Map lookups on null return null, which handles the ends for free if you use a map that does so — or guard explicitly.',
            'Answer the O(1)-space follow-up before it is asked: interleave each clone directly after its original (A → A\' → B → B\' → ...). Then A\'->random is simply A->random->next, no map needed. Finally unzip the two lists apart.',
          ],
          wherePeopleLoseIt:
            'Deep-copy confusion — assigning clone->random = orig->random, which points into the ORIGINAL list. The copy then looks right on a shallow check and is silently wrong. Every pointer in the new list must point at a new node; say that rule out loud while wiring.',
          time: 'O(n) — two passes.',
          space: 'O(n) for the map; O(1) with the interleaving variant.',
          code: {
            cpp: `Node* copyRandomList(Node* head) {
  if (!head) return nullptr;
  unordered_map<Node*, Node*> clone;

  // Pass 1: every clone exists before any pointer is set.
  for (Node* cur = head; cur; cur = cur->next)
    clone[cur] = new Node(cur->val);

  // Pass 2: wire, entirely within the new list.
  for (Node* cur = head; cur; cur = cur->next) {
    clone[cur]->next   = cur->next   ? clone[cur->next]   : nullptr;
    clone[cur]->random = cur->random ? clone[cur->random] : nullptr;
  }
  return clone[head];
}`,
            java: `public Node copyRandomList(Node head) {
  if (head == null) return null;
  Map<Node,Node> clone = new HashMap<>();

  for (Node cur = head; cur != null; cur = cur.next)
    clone.put(cur, new Node(cur.val));

  for (Node cur = head; cur != null; cur = cur.next) {
    clone.get(cur).next   = clone.get(cur.next);    // null maps to null
    clone.get(cur).random = clone.get(cur.random);
  }
  return clone.get(head);
}`,
          },
          followUp: 'Now do it in O(1) extra space with the interleaving trick — this is asked almost every time.',
        },
      },
      practice: [
        {
          lc: 133,
          title: 'Clone Graph',
          slug: 'clone-graph',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight: 'Same old-to-new map, but the traversal is DFS or BFS because a graph has no single next. The map doubles as the visited set.',
          companies: ['google', 'meta'],
        },
        {
          lc: 1650,
          title: 'Lowest Common Ancestor of a Binary Tree III',
          slug: 'lowest-common-ancestor-of-a-binary-tree-iii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight:
            'Flipped: parent pointers turn two root-paths into two linked lists, and their lowest common ancestor is the intersection node — solvable with the two-pointer switch trick from LC 160.',
          companies: ['meta'],
        },
      ],
    },

    /* ---------------------------------------------------------------- 7 */
    {
      id: 'list-as-building-block',
      name: 'The list as a building block',
      signal:
        'A design question with an O(1) requirement — LRU cache, LFU cache, "insert, delete and get random in constant time". The list gives O(1) unlink; a hash map gives O(1) find. Neither works alone.',
      time: 'O(1) per operation',
      space: 'O(capacity)',
      googleHeavy: true,
      template: {
        cpp: `// hash map: key -> iterator/pointer into a doubly linked list
// list: most-recently-used at the front, least at the back
// get:  find via map, move that node to the front
// put:  insert at front; if over capacity, evict the back node AND its map key`,
        java: `// Map<Integer, Node> + doubly linked list with dummy head and tail
// touch(node): unlink, then insert after head
// evict: remove node before tail, and remove its key from the map`,
      },
      taught: {
        lc: 146,
        title: 'LRU Cache',
        slug: 'lru-cache',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 50,
        insight:
          'A hash map for O(1) lookup, a doubly linked list for O(1) reordering. The map stores pointers to list nodes so you can unlink without searching.',
        companies: ['google', 'amazon', 'meta', 'microsoft'],
        whyThisOne:
          'The most-asked design question that is really a data-structure question, and the clearest demonstration of why a DOUBLY linked list exists.',
        walkthrough: {
          howToSeeIt: [
            'Two requirements pull in opposite directions: O(1) lookup by key, and O(1) "move this item to most-recently-used". A hash map gives the first and cannot order; a list gives the second and cannot find. So use both, pointing at each other.',
            'Why doubly linked? To unlink a node in O(1) you need its neighbours. A singly linked list forces an O(n) walk to find the predecessor, which destroys the whole point. This is the reason the problem specifies a doubly linked list.',
            'Use dummy head and tail sentinels. Every insert and every remove then has identical code with no null checks — the type-1 dummy trick, applied twice.',
            'get(key): look up the node in the map, unlink it, reinsert after head, return its value. put(key, value): if present, update and move to front; otherwise insert at front and, if over capacity, remove the node before tail and erase its key from the map. Forgetting that map erase is the classic leak.',
          ],
          wherePeopleLoseIt:
            'Evicting from the list but leaving the key in the map. The cache then reports a hit for a node that is no longer in the list, and you dereference a dangling pointer. Write remove() so it always does both, and never inline the eviction.',
          time: 'O(1) for get and put.',
          space: 'O(capacity).',
          code: {
            cpp: `class LRUCache {
  struct Node { int key, val; Node *prev, *next; };

  int cap;
  unordered_map<int, Node*> map;
  Node* head;   // dummy: head->next is most recently used
  Node* tail;   // dummy: tail->prev is least recently used

  void unlink(Node* n) {
    n->prev->next = n->next;
    n->next->prev = n->prev;
  }
  void pushFront(Node* n) {
    n->next = head->next;
    n->prev = head;
    head->next->prev = n;
    head->next = n;
  }

public:
  LRUCache(int capacity) : cap(capacity) {
    head = new Node(); tail = new Node();
    head->next = tail; tail->prev = head;
  }

  int get(int key) {
    auto it = map.find(key);
    if (it == map.end()) return -1;
    unlink(it->second);
    pushFront(it->second);          // touching it makes it most recent
    return it->second->val;
  }

  void put(int key, int value) {
    auto it = map.find(key);
    if (it != map.end()) {
      it->second->val = value;
      unlink(it->second);
      pushFront(it->second);
      return;
    }
    if ((int)map.size() == cap) {
      Node* lru = tail->prev;
      unlink(lru);
      map.erase(lru->key);          // BOTH structures, always
      delete lru;
    }
    Node* n = new Node{key, value, nullptr, nullptr};
    pushFront(n);
    map[key] = n;
  }
};`,
            java: `class LRUCache {
  private static class Node {
    int key, val; Node prev, next;
    Node(int k, int v) { key = k; val = v; }
  }

  private final int cap;
  private final Map<Integer, Node> map = new HashMap<>();
  private final Node head = new Node(0, 0), tail = new Node(0, 0);

  public LRUCache(int capacity) {
    cap = capacity;
    head.next = tail; tail.prev = head;
  }

  private void unlink(Node n) { n.prev.next = n.next; n.next.prev = n.prev; }

  private void pushFront(Node n) {
    n.next = head.next; n.prev = head;
    head.next.prev = n; head.next = n;
  }

  public int get(int key) {
    Node n = map.get(key);
    if (n == null) return -1;
    unlink(n); pushFront(n);
    return n.val;
  }

  public void put(int key, int value) {
    Node n = map.get(key);
    if (n != null) { n.val = value; unlink(n); pushFront(n); return; }

    if (map.size() == cap) {
      Node lru = tail.prev;
      unlink(lru);
      map.remove(lru.key);
    }
    Node fresh = new Node(key, value);
    pushFront(fresh);
    map.put(key, fresh);
  }
}`,
          },
          followUp:
            'Make it thread-safe, and say what you would actually reach for in production — in Java, LinkedHashMap with accessOrder = true is an LRU in three lines. Knowing the real-world answer alongside the from-scratch one reads as seniority.',
        },
      },
      practice: [
        {
          lc: 460,
          title: 'LFU Cache',
          slug: 'lfu-cache',
          difficulty: 'hard',
          role: 'practice',
          estMinutes: 70,
          insight:
            'LRU plus a frequency dimension: a map from frequency to its own LRU list, and a running minimum frequency for O(1) eviction.',
          companies: ['google', 'amazon'],
        },
        {
          lc: 380,
          title: 'Insert Delete GetRandom O(1)',
          slug: 'insert-delete-getrandom-o1',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 30,
          insight:
            'Flipped: the pairing is a hash map plus an ARRAY, not a list, because getRandom needs indexing. Same lesson — two structures covering each other\'s weakness.',
          companies: ['google', 'amazon'],
        },
      ],
    },
  ],
};
