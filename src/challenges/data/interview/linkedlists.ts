import type { ModuleDef } from '../../types';

const NOTE = 'Lists are shown as arrays in the tests; your function receives and returns ListNode objects (val, next).';

const m: ModuleDef = {
  id: 'linked-lists',
  title: 'Linked List Classics',
  description: 'Dedup, partition, partial and grouped reversal, sorting and reordering lists in place.',
  challenges: [
    {
      title: 'Remove Duplicates from Sorted List', fn: 'deleteDuplicates', args: ['head'],
      prompt: 'The list is sorted. Delete duplicates so each value appears only once, and return the head.',
      notes: [NOTE],
      types: { args: ['list'], ret: 'list' },
      tests: [[[[1, 1, 2]], [1, 2]], [[[1, 1, 2, 3, 3]], [1, 2, 3]], [[[]], []], [[[5, 5, 5]], [5]], [[[1, 2, 3]], [1, 2, 3]]],
      js: String.raw`function deleteDuplicates(head) {
  let cur = head;
  while (cur && cur.next) {
    if (cur.next.val === cur.val) cur.next = cur.next.next; // skip the copy
    else cur = cur.next;
  }
  return head;
}`,
      py: String.raw`def delete_duplicates(head):
    cur = head
    while cur and cur.next:
        if cur.next.val == cur.val:
            cur.next = cur.next.next
        else:
            cur = cur.next
    return head`,
      explain: `Because the list is sorted, duplicates are adjacent. Walk the list, and whenever the next node has the same value, bypass it.

The rule from Remove Elements applies again: after deleting, do not advance, because the new next node might be another copy. [5, 5, 5] needs two deletions from the same position.

The head never changes, since the first occurrence of each value is kept, so no dummy node is needed.

For an unsorted list, keep a set of seen values. That is O(n) time with O(n) space (CTCI 2.1). Without extra space, use a runner pointer that scans ahead for each node, which is O(n²).`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Remove All Duplicated Values', fn: 'deleteDuplicatesAll', args: ['head'],
      prompt: 'The list is sorted. Delete every node whose value appears more than once, keeping only values that were unique. Return the head.',
      notes: [NOTE],
      types: { args: ['list'], ret: 'list' },
      tests: [[[[1, 2, 3, 3, 4, 4, 5]], [1, 2, 5]], [[[1, 1, 1, 2, 3]], [2, 3]], [[[]], []], [[[1, 1]], []], [[[1, 2, 2]], [1]], [[[1, 2, 3]], [1, 2, 3]]],
      js: String.raw`function deleteDuplicatesAll(head) {
  const dummy = new ListNode(0, head);
  let prev = dummy; // last node known to be unique
  while (prev.next) {
    let cur = prev.next;
    if (cur.next && cur.next.val === cur.val) {
      const v = cur.val;
      while (cur && cur.val === v) cur = cur.next; // skip the whole run
      prev.next = cur;
    } else {
      prev = cur;
    }
  }
  return dummy.next;
}`,
      py: String.raw`def delete_duplicates_all(head):
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next:
        cur = prev.next
        if cur.next and cur.next.val == cur.val:
            v = cur.val
            while cur and cur.val == v:
                cur = cur.next
            prev.next = cur
        else:
            prev = cur
    return dummy.next`,
      explain: `Harder than the previous challenge: duplicated values disappear completely, including their first occurrence. That means the head itself can be removed ([1, 1, 1, 2, 3] → [2, 3]), so use a dummy node.

prev always points to the last node that is definitely staying.

At each step, look at the run starting at prev.next:
- If the next node has the same value, the run is a duplicate. Skip every node with that value and link prev directly past the run. Do not move prev: the node after the run might start another duplicate run.
- Otherwise the node is unique, so advance prev to it.

Linking prev past the whole run in one step is cleaner than deleting nodes one at a time.

Interviewers like this pair because it shows whether you recognize when a dummy head becomes necessary: whenever the head might be deleted.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Partition List', fn: 'partitionList', args: ['head', 'x'],
      prompt: 'Rearrange the list so all nodes with value less than x come before nodes with value ≥ x, keeping the original relative order within each group. Return the head.',
      notes: [NOTE],
      types: { args: ['list', null], ret: 'list' },
      tests: [[[[1, 4, 3, 2, 5, 2], 3], [1, 2, 2, 4, 3, 5]], [[[2, 1], 2], [1, 2]], [[[], 0], []], [[[3, 1, 2], 4], [3, 1, 2]], [[[5, 6, 1], 2], [1, 5, 6]]],
      js: String.raw`function partitionList(head, x) {
  const lessHead = new ListNode(0), moreHead = new ListNode(0);
  let less = lessHead, more = moreHead;
  for (let n = head; n; n = n.next) {
    if (n.val < x) less = less.next = n;
    else more = more.next = n;
  }
  more.next = null; // end the second chain (it may still point into the old list)
  less.next = moreHead.next;
  return lessHead.next;
}`,
      py: String.raw`def partition_list(head, x):
    less_head, more_head = ListNode(0), ListNode(0)
    less, more = less_head, more_head
    n = head
    while n:
        if n.val < x:
            less.next = n
            less = n
        else:
            more.next = n
            more = n
        n = n.next
    more.next = None
    less.next = more_head.next
    return less_head.next`,
      explain: `Build two chains as you walk, one for values below x and one for the rest, then join them.

1. Two dummy heads, each with a tail pointer.
2. Append each node to the right chain. Since nodes are appended in their original order, each group stays stable.
3. Terminate the second chain (more.next = null), then attach it after the first.

Why the explicit null? The last node in the more chain still has its old next pointer, which may point back to a node in the less chain. Forgetting this creates a cycle, and the program loops forever when it reads the list.

This is the linked-list version of Evens Before Odds (stable partition with buckets), and it uses O(1) extra space because the nodes are relinked rather than copied.

It is also the partition step of quicksort on linked lists, the reason quicksort is more practical on lists than people expect.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Reverse a Sublist', fn: 'reverseBetween', args: ['head', 'left', 'right'],
      prompt: 'Reverse the nodes from position left to position right (1-indexed, inclusive) in one pass, and return the head.',
      notes: [NOTE],
      types: { args: ['list', null, null], ret: 'list' },
      tests: [[[[1, 2, 3, 4, 5], 2, 4], [1, 4, 3, 2, 5]], [[[5], 1, 1], [5]], [[[1, 2, 3], 1, 3], [3, 2, 1]], [[[1, 2], 1, 2], [2, 1]], [[[1, 2, 3, 4], 3, 4], [1, 2, 4, 3]]],
      js: String.raw`function reverseBetween(head, left, right) {
  const dummy = new ListNode(0, head);
  let before = dummy;
  for (let i = 1; i < left; i++) before = before.next; // node just before the sublist
  const first = before.next; // will become the sublist's tail
  // head insertion: repeatedly move the node after "first" to the front of the sublist
  for (let i = 0; i < right - left; i++) {
    const move = first.next;
    first.next = move.next;
    move.next = before.next;
    before.next = move;
  }
  return dummy.next;
}`,
      py: String.raw`def reverse_between(head, left, right):
    dummy = ListNode(0, head)
    before = dummy
    for _ in range(left - 1):
        before = before.next
    first = before.next
    for _ in range(right - left):
        move = first.next
        first.next = move.next
        move.next = before.next
        before.next = move
    return dummy.next`,
      explain: `The head-insertion technique reverses a sublist in a single pass.

1. Walk to before, the node just before position left. Use a dummy, because left may be 1.
2. first = the first node of the sublist. It ends up as the sublist's tail and never moves.
3. Repeat right - left times: take the node right after first and move it to the front of the sublist, just after before.

[1, 2, 3, 4, 5], left = 2, right = 4:
- move 3 to the front: 1 3 2 4 5
- move 4 to the front: 1 4 3 2 5

Each move changes three pointers: first skips the moved node, the moved node points at the current front, and before points at the moved node.

The alternative cuts out the sublist, reverses it with the standard algorithm, and stitches it back in. It is also O(n), but needs more bookkeeping to remember the four boundary nodes.

Reverse Nodes in k-Group (next) applies this to every block of k.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Reverse Nodes in k-Group', fn: 'reverseKGroup', args: ['head', 'k'],
      prompt: 'Reverse the list k nodes at a time. If the final group has fewer than k nodes, leave it as it is. Return the head.',
      notes: [NOTE],
      types: { args: ['list', null], ret: 'list' },
      tests: [[[[1, 2, 3, 4, 5], 2], [2, 1, 4, 3, 5]], [[[1, 2, 3, 4, 5], 3], [3, 2, 1, 4, 5]], [[[1, 2, 3], 1], [1, 2, 3]], [[[1, 2], 3], [1, 2]], [[[1, 2, 3, 4, 5, 6], 3], [3, 2, 1, 6, 5, 4]]],
      js: String.raw`function reverseKGroup(head, k) {
  const dummy = new ListNode(0, head);
  let before = dummy;
  while (true) {
    // check that k nodes remain
    let probe = before;
    for (let i = 0; i < k; i++) {
      probe = probe.next;
      if (!probe) return dummy.next;
    }
    // reverse this group by head insertion
    const first = before.next;
    for (let i = 0; i < k - 1; i++) {
      const move = first.next;
      first.next = move.next;
      move.next = before.next;
      before.next = move;
    }
    before = first; // first is now the group's tail
  }
}`,
      py: String.raw`def reverse_k_group(head, k):
    dummy = ListNode(0, head)
    before = dummy
    while True:
        probe = before
        for _ in range(k):
            probe = probe.next
            if probe is None:
                return dummy.next
        first = before.next
        for _ in range(k - 1):
            move = first.next
            first.next = move.next
            move.next = before.next
            before.next = move
        before = first`,
      explain: `This is the previous challenge applied block after block.

Loop:
1. Probe ahead to check that k nodes remain. If not, stop, because the leftover tail stays as it is.
2. Reverse the next k nodes with head insertion (k - 1 moves), exactly as in Reverse a Sublist.
3. The block's original first node is now its tail, and it becomes before for the next block.

Using a dummy handles the first block, which changes the head.

Each node is probed once and moved at most once, so O(n) time and O(1) space. Recursive solutions are shorter, but use O(n / k) stack.

This is a well-known hard-rated interview problem. The way through it is to reuse a sub-routine you trust (the sublist reversal) and add the "enough nodes?" check.

Swap Nodes in Pairs (in Medium) is the special case k = 2.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Sort a Linked List', fn: 'sortList', args: ['head'],
      prompt: 'Sort the linked list in ascending order in O(n log n) time and return the head.',
      notes: [NOTE],
      types: { args: ['list'], ret: 'list' },
      tests: [[[[4, 2, 1, 3]], [1, 2, 3, 4]], [[[-1, 5, 3, 4, 0]], [-1, 0, 3, 4, 5]], [[[]], []], [[[1]], [1]], [[[3, 3, 1, 1]], [1, 1, 3, 3]], [[[9, 8, 7, 6, 5, 4, 3, 2, 1]], [1, 2, 3, 4, 5, 6, 7, 8, 9]]],
      js: String.raw`function sortList(head) {
  if (!head || !head.next) return head;
  // split in half with slow/fast pointers
  let slow = head, fast = head.next;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  const second = slow.next;
  slow.next = null;
  // sort halves, then merge
  let a = sortList(head), b = sortList(second);
  const dummy = new ListNode(0);
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) { tail.next = a; a = a.next; }
    else { tail.next = b; b = b.next; }
    tail = tail.next;
  }
  tail.next = a || b;
  return dummy.next;
}`,
      py: String.raw`def sort_list(head):
    if head is None or head.next is None:
        return head
    slow, fast = head, head.next
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    second = slow.next
    slow.next = None
    a, b = sort_list(head), sort_list(second)
    dummy = ListNode(0)
    tail = dummy
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next`,
      explain: `Merge sort is the natural sort for linked lists.

1. Split: find the middle with slow and fast pointers, and cut the list into two halves. Starting fast at head.next makes slow stop at the end of the first half, so even a two-node list splits correctly.
2. Sort each half recursively.
3. Merge them with Merge Two Sorted Lists.

Why merge sort and not quicksort or heapsort?
- Lists have no random access, so heapsort and the quicksort pivot tricks lose their advantages.
- Merging lists needs no extra array, because you just relink nodes, unlike array merge sort's O(n) buffer.
- It is stable and guarantees O(n log n).

The recursion depth is O(log n). For strict O(1) space, use bottom-up merge sort: merge runs of size 1, 2, 4, ... iteratively. It is more code, but has no recursion.

This one problem combines three earlier linked-list skills: finding the middle, cutting the list, and merging.`,
      complexity: 'O(n log n) time, O(log n) recursion space',
    },
    {
      title: 'Reorder List', fn: 'reorderList', args: ['head'],
      prompt: 'Reorder L0 → L1 → … → Ln into L0 → Ln → L1 → Ln−1 → L2 → … in place, and return the head.',
      notes: [NOTE],
      types: { args: ['list'], ret: 'list' },
      tests: [[[[1, 2, 3, 4]], [1, 4, 2, 3]], [[[1, 2, 3, 4, 5]], [1, 5, 2, 4, 3]], [[[1]], [1]], [[[1, 2]], [1, 2]], [[[]], []], [[[1, 2, 3, 4, 5, 6]], [1, 6, 2, 5, 3, 4]]],
      js: String.raw`function reorderList(head) {
  if (!head || !head.next) return head;
  // 1. middle
  let slow = head, fast = head;
  while (fast.next && fast.next.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  // 2. reverse the second half
  let prev = null, cur = slow.next;
  slow.next = null;
  while (cur) {
    const next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  // 3. weave the halves together
  let a = head, b = prev;
  while (b) {
    const an = a.next, bn = b.next;
    a.next = b;
    b.next = an;
    a = an;
    b = bn;
  }
  return head;
}`,
      py: String.raw`def reorder_list(head):
    if head is None or head.next is None:
        return head
    slow = fast = head
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next
    prev, cur = None, slow.next
    slow.next = None
    while cur:
        nxt = cur.next
        cur.next = prev
        prev, cur = cur, nxt
    a, b = head, prev
    while b:
        an, bn = a.next, b.next
        a.next = b
        b.next = an
        a, b = an, bn
    return head`,
      explain: `This is a three-step composition, like Palindrome Linked List.

1. Find the middle with slow and fast pointers. The first half gets the extra node when the length is odd.
2. Reverse the second half, after cutting it off from the first. [1, 2, 3, 4, 5] becomes the halves 1 → 2 → 3 and 5 → 4.
3. Weave: alternately take a node from each half. a → b → (a's old next) → (b's old next) → ...

Saving both next pointers (an, bn) before relinking is essential. Once a.next is overwritten, you would lose the rest of the first half.

The loop runs while the second half has nodes. The first half is the same length or one longer, so its last node stays at the end, already terminated.

With extra memory you could store the nodes in an array and use two indices, but the in-place version is the expected answer.

Breaking a scary-looking transformation into known primitives is the main skill here.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Add Two Numbers II', fn: 'addTwoNumbersII', args: ['l1', 'l2'],
      prompt: 'Two non-negative integers are stored as linked lists with the most significant digit first (7 → 2 → 4 → 3 is 7243). Return their sum as a list in the same format, without reversing the input lists.',
      notes: [NOTE],
      types: { args: ['list', 'list'], ret: 'list' },
      tests: [[[[7, 2, 4, 3], [5, 6, 4]], [7, 8, 0, 7]], [[[2, 4, 3], [5, 6, 4]], [8, 0, 7]], [[[0], [0]], [0]], [[[9, 9], [1]], [1, 0, 0]], [[[5], [5]], [1, 0]]],
      js: String.raw`function addTwoNumbersII(l1, l2) {
  const s1 = [], s2 = [];
  for (let n = l1; n; n = n.next) s1.push(n.val);
  for (let n = l2; n; n = n.next) s2.push(n.val);
  let carry = 0, head = null;
  while (s1.length || s2.length || carry) {
    const sum = (s1.pop() || 0) + (s2.pop() || 0) + carry; // least significant first
    carry = Math.floor(sum / 10);
    head = new ListNode(sum % 10, head); // prepend: builds the result most-significant first
  }
  return head;
}`,
      py: String.raw`def add_two_numbers_ii(l1, l2):
    s1, s2 = [], []
    n = l1
    while n:
        s1.append(n.val)
        n = n.next
    n = l2
    while n:
        s2.append(n.val)
        n = n.next
    carry, head = 0, None
    while s1 or s2 or carry:
        total = (s1.pop() if s1 else 0) + (s2.pop() if s2 else 0) + carry
        carry, digit = divmod(total, 10)
        head = ListNode(digit, head)
    return head`,
      explain: `Addition has to start from the least significant digit, but these lists start at the most significant one. Stacks reverse the order without modifying the input lists.

1. Push each list's digits onto its own stack.
2. Pop from both, so the last digits come first, and add with a carry, exactly as in Add Two Numbers.
3. Prepend each new digit to the result (head = new node pointing to the old head). Results come out least-significant first, and prepending makes the final list most-significant first.

The loop runs while either stack has digits or there is a carry left, which produces the extra leading 1 in 99 + 1 = 100.

Alternatives:
- Reverse both lists, add, and reverse the result. It is O(1) extra space, but modifies the inputs, and the problem says not to.
- Recursion after padding the shorter list with zeros: the carry returns up the call stack.

The general lesson: when the order you are given is the opposite of the order you need, reach for a stack.`,
      complexity: 'O(n + m) time and space',
    },
    {
      title: 'Delete the Middle Node', fn: 'deleteMiddle', args: ['head'],
      prompt: 'Delete the middle node (index ⌊n/2⌋, 0-based) of the list and return the head. A single-node list becomes empty.',
      notes: [NOTE],
      types: { args: ['list'], ret: 'list' },
      tests: [[[[1, 3, 4, 7, 1, 2, 6]], [1, 3, 4, 1, 2, 6]], [[[1, 2, 3, 4]], [1, 2, 4]], [[[2, 1]], [2]], [[[1]], []], [[[1, 2, 3]], [1, 3]]],
      js: String.raw`function deleteMiddle(head) {
  if (!head.next) return null;
  // slow stops just BEFORE the middle: give fast a head start of two steps
  let slow = head, fast = head.next.next;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  slow.next = slow.next.next;
  return head;
}`,
      py: String.raw`def delete_middle(head):
    if head.next is None:
        return None
    slow, fast = head, head.next.next
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    slow.next = slow.next.next
    return head`,
      explain: `To delete a node you need the node before it. So adjust the slow and fast pointers to stop one step earlier than in Middle of the Linked List.

Giving fast a two-step head start (starting at head.next.next) makes slow land on the node just before the middle. Then slow.next = slow.next.next removes the middle.

Check it with small sizes:
- 2 nodes: the middle is index 1. fast starts at null, so slow stays at node 0 and node 1 is removed.
- 3 nodes: the middle is index 1, and slow stays at 0.
- 4 nodes: the middle is index 2. fast starts at node 2, so slow moves once to node 1, and node 2 is removed.

A single node is a special case: there is no previous node, so the result is empty.

Tweaking where fast starts to land slow exactly where you need it is a fiddly but very common adjustment. Always verify with lists of length 1 to 4.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Kth to Last Element', fn: 'kthToLast', args: ['head', 'k'],
      prompt: 'Return the value of the k-th to last node (k = 1 is the last node) in one pass. k is always valid.',
      notes: [NOTE],
      types: { args: ['list', null] },
      tests: [[[[1, 2, 3, 4, 5], 2], 4], [[[1, 2, 3, 4, 5], 1], 5], [[[1, 2, 3, 4, 5], 5], 1], [[[7], 1], 7], [[[10, 20], 2], 10]],
      js: String.raw`function kthToLast(head, k) {
  let lead = head, trail = head;
  for (let i = 0; i < k; i++) lead = lead.next; // lead is k nodes ahead
  while (lead) {
    lead = lead.next;
    trail = trail.next;
  }
  return trail.val;
}`,
      py: String.raw`def kth_to_last(head, k):
    lead = trail = head
    for _ in range(k):
        lead = lead.next
    while lead:
        lead = lead.next
        trail = trail.next
    return trail.val`,
      explain: `This is CTCI 2.2, using the fixed-gap pointers from Remove Nth Node From End.

1. Move lead k nodes ahead of trail.
2. Advance both until lead falls off the end.
3. The gap is still k, so trail is now k nodes from the end. That is the answer.

Here we want the node itself, not the one before it, so the gap is exactly k (not k + 1 as in the removal problem), and no dummy is needed.

Other approaches to mention:
- Two passes: count the length L, then walk L - k steps. That is also O(n), and simpler, but takes two passes.
- Recursion: count positions on the way back up. It is clever, but uses O(n) stack.

In an interview, stating the two-pass solution first and then improving to one pass shows clear thinking.`,
      complexity: 'O(n) time, O(1) space',
    },
  ],
};

export default m;
