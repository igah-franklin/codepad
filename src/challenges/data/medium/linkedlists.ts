import type { ModuleDef } from '../../types';

const NOTE = 'Lists are shown as arrays in the tests; your function receives and returns ListNode objects (val, next).';

const m: ModuleDef = {
  id: 'linked-lists',
  title: 'Linked Lists',
  description: 'Pointer manipulation: reversing, merging, dummy heads and fast/slow runners.',
  challenges: [
    {
      title: 'Reverse a Linked List', fn: 'reverseList', args: ['head'],
      prompt: 'Reverse a singly linked list and return the new head.',
      notes: [NOTE],
      types: { args: ['list'], ret: 'list' },
      tests: [[[[1, 2, 3, 4, 5]], [5, 4, 3, 2, 1]], [[[1, 2]], [2, 1]], [[[]], []], [[[7]], [7]]],
      js: String.raw`function reverseList(head) {
  let prev = null, cur = head;
  while (cur) {
    const next = cur.next; // save the rest of the list
    cur.next = prev; // flip the pointer
    prev = cur;
    cur = next;
  }
  return prev;
}`,
      py: String.raw`def reverse_list(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev = cur
        cur = nxt
    return prev`,
      explain: `Walk the list once and flip every next pointer so it points backwards.

You need three references:
- prev: the already-reversed part, which starts empty (null).
- cur: the node being processed.
- next: saved before flipping, because once cur.next is overwritten you would lose the rest of the list.

At each step: save next, point cur.next at prev, then move prev and cur one step forward.

When cur becomes null, prev is the old tail, which is the new head.

Trace 1 → 2 → 3: first 1 → null, then 2 → 1 → null, then 3 → 2 → 1 → null.

Recursive version: reverse the rest of the list, then set head.next.next = head and head.next = null. It is elegant, but uses O(n) stack space.

Reversing a linked list is the most common linked-list interview question, and it is a building block for Palindrome List, Reverse Nodes in k-Group, and others.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Merge Two Sorted Lists', fn: 'mergeTwoLists', args: ['l1', 'l2'],
      prompt: 'Merge two sorted linked lists into one sorted list by splicing their nodes together, and return its head.',
      notes: [NOTE],
      types: { args: ['list', 'list'], ret: 'list' },
      tests: [[[[1, 2, 4], [1, 3, 4]], [1, 1, 2, 3, 4, 4]], [[[], []], []], [[[], [0]], [0]], [[[5], [1, 2, 3]], [1, 2, 3, 5]]],
      js: String.raw`function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      tail.next = l1;
      l1 = l1.next;
    } else {
      tail.next = l2;
      l2 = l2.next;
    }
    tail = tail.next;
  }
  tail.next = l1 || l2; // attach whatever is left
  return dummy.next;
}`,
      py: String.raw`def merge_two_lists(l1, l2):
    dummy = ListNode(0)
    tail = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            tail.next, l1 = l1, l1.next
        else:
            tail.next, l2 = l2, l2.next
        tail = tail.next
    tail.next = l1 or l2
    return dummy.next`,
      explain: `This is the array merge from Easy, done with pointers.

The dummy head trick: start with a fake node so the result always has somewhere to attach to. Without it, you need special code to choose the real head. At the end, return dummy.next.

1. tail points to the last node of the merged list.
2. While both lists have nodes, attach the smaller head to tail and advance that list.
3. When one list runs out, attach the rest of the other in a single step. It is already sorted, so there is no need to loop.

No new nodes are created (apart from the dummy). The existing nodes are relinked, which is why the extra space is O(1).

Using <= keeps the merge stable.

Dummy heads simplify almost every linked-list problem that might change the head: removals, partitions, insertions.`,
      complexity: 'O(n + m) time, O(1) extra space',
    },
    {
      title: 'Remove Nth Node From End', fn: 'removeNthFromEnd', args: ['head', 'n'],
      prompt: 'Remove the n-th node from the end of the list (n = 1 is the last node) in a single pass, and return the head. n is always valid.',
      notes: [NOTE],
      types: { args: ['list', null], ret: 'list' },
      tests: [[[[1, 2, 3, 4, 5], 2], [1, 2, 3, 5]], [[[1], 1], []], [[[1, 2], 1], [1]], [[[1, 2], 2], [2]], [[[1, 2, 3], 3], [2, 3]]],
      js: String.raw`function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let fast = dummy, slow = dummy;
  for (let i = 0; i <= n; i++) fast = fast.next; // gap of n nodes
  while (fast) {
    fast = fast.next;
    slow = slow.next;
  }
  slow.next = slow.next.next; // skip the target
  return dummy.next;
}`,
      py: String.raw`def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    fast = slow = dummy
    for _ in range(n + 1):
        fast = fast.next
    while fast:
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next
    return dummy.next`,
      explain: `Two pointers with a fixed gap between them.

The obvious way takes two passes: count the length L, then walk L - n steps. To do it in one pass, keep fast exactly n + 1 nodes ahead of slow.

1. Both start at a dummy node placed before the head.
2. Move fast forward n + 1 steps.
3. Move both forward together until fast falls off the end.
4. slow now sits just before the node to remove, so unlink it with slow.next = slow.next.next.

Why n + 1? To delete a node you need the node before it. The extra step stops slow one node early.

The dummy handles removing the head itself (n = list length). In that case slow stays on the dummy, and dummy.next is updated correctly.

Fast/slow runner pointers are a core linked-list technique: finding the middle, detecting cycles, and finding the k-th from the end.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Middle of the Linked List', fn: 'middleNode', args: ['head'],
      prompt: 'Return the middle node of the list. With an even number of nodes, return the second of the two middle nodes. (The tests show the list from that node onward.)',
      notes: [NOTE],
      types: { args: ['list'], ret: 'list' },
      tests: [[[[1, 2, 3, 4, 5]], [3, 4, 5]], [[[1, 2, 3, 4, 5, 6]], [4, 5, 6]], [[[1]], [1]], [[[1, 2]], [2]]],
      js: String.raw`function middleNode(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}`,
      py: String.raw`def middle_node(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow`,
      explain: `This is the tortoise and the hare: slow moves 1 step for every 2 steps fast moves. When fast reaches the end, slow has covered half the distance, so it is at the middle.

The loop condition fast && fast.next makes sure fast can safely take two steps.

Which middle do you get?
- Odd length (5 nodes): fast lands on the last node, and slow is at node 3, the exact middle.
- Even length (6 nodes): fast runs off the end, and slow is at node 4, the second middle.

For the first middle instead, start fast at head.next.

The same pair of pointers finds the middle for merge sort on linked lists and for Palindrome Linked List (next), and it detects cycles: if fast ever meets slow, there is a loop (Floyd's algorithm).`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Palindrome Linked List', fn: 'isPalindromeList', args: ['head'],
      prompt: 'Return true if the values of the linked list read the same forwards and backwards. Aim for O(n) time and O(1) extra space.',
      notes: [NOTE],
      types: { args: ['list'] },
      tests: [[[[1, 2, 2, 1]], true], [[[1, 2]], false], [[[1]], true], [[[]], true], [[[1, 2, 3, 2, 1]], true], [[[1, 2, 3, 1]], false]],
      js: String.raw`function isPalindromeList(head) {
  // 1. find the middle
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  // 2. reverse the second half
  let prev = null;
  while (slow) {
    const next = slow.next;
    slow.next = prev;
    prev = slow;
    slow = next;
  }
  // 3. compare the halves
  let a = head, b = prev;
  while (b) {
    if (a.val !== b.val) return false;
    a = a.next;
    b = b.next;
  }
  return true;
}`,
      py: String.raw`def is_palindrome_list(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    prev = None
    while slow:
        nxt = slow.next
        slow.next = prev
        prev = slow
        slow = nxt
    a, b = head, prev
    while b:
        if a.val != b.val:
            return False
        a, b = a.next, b.next
    return True`,
      explain: `Copying the values into an array and checking that is O(n) space. For O(1) space, combine the two previous techniques.

1. Find the middle with slow and fast pointers.
2. Reverse the second half in place, as in Reverse a Linked List.
3. Walk from the head and from the reversed second half at the same time, comparing values. Stop when the second half runs out.

With an odd length, the middle node ends up in the reversed half, and comparing against itself is harmless.

This solution modifies the list. In production code you would reverse the second half back afterwards to restore it, and in an interview you should mention that.

Combining small, well-understood routines (find middle, reverse, compare) is how most "hard-looking" linked-list problems are solved.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Remove Elements', fn: 'removeElements', args: ['head', 'val'],
      prompt: 'Remove every node whose value equals val and return the new head.',
      notes: [NOTE],
      types: { args: ['list', null], ret: 'list' },
      tests: [[[[1, 2, 6, 3, 4, 5, 6], 6], [1, 2, 3, 4, 5]], [[[], 1], []], [[[7, 7, 7, 7], 7], []], [[[1, 2, 3], 4], [1, 2, 3]], [[[5, 1, 5], 5], [1]]],
      js: String.raw`function removeElements(head, val) {
  const dummy = new ListNode(0, head);
  let cur = dummy;
  while (cur.next) {
    if (cur.next.val === val) cur.next = cur.next.next; // unlink, stay put
    else cur = cur.next;
  }
  return dummy.next;
}`,
      py: String.raw`def remove_elements(head, val):
    dummy = ListNode(0, head)
    cur = dummy
    while cur.next:
        if cur.next.val == val:
            cur.next = cur.next.next
        else:
            cur = cur.next
    return dummy.next`,
      explain: `Deleting from a singly linked list means changing the previous node's next pointer. So stand on the node before each candidate and look ahead.

1. A dummy node before the head lets you delete the head with the same code as any other node, which covers runs like [7, 7, 7, 7] at the front.
2. If cur.next should be removed, bypass it, and do not advance, because the new cur.next might also need removing.
3. Otherwise advance.

The "don't advance after deleting" rule is the subtle part. Advancing would skip the node right after a deleted one, and consecutive matches would survive.

This look-ahead with a dummy head is the linked-list version of the read/write pointer filtering you used on arrays.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Odd Even Linked List', fn: 'oddEvenList', args: ['head'],
      prompt: 'Regroup the list so that all nodes at odd positions (1st, 3rd, ...) come first, followed by all nodes at even positions, keeping the relative order inside each group. O(1) extra space.',
      notes: [NOTE],
      types: { args: ['list'], ret: 'list' },
      tests: [[[[1, 2, 3, 4, 5]], [1, 3, 5, 2, 4]], [[[2, 1, 3, 5, 6, 4, 7]], [2, 3, 6, 7, 1, 5, 4]], [[[]], []], [[[1]], [1]], [[[1, 2]], [1, 2]]],
      js: String.raw`function oddEvenList(head) {
  if (!head) return head;
  let odd = head, even = head.next;
  const evenHead = even;
  while (even && even.next) {
    odd.next = even.next;
    odd = odd.next;
    even.next = odd.next;
    even = even.next;
  }
  odd.next = evenHead; // append the even chain after the odd chain
  return head;
}`,
      py: String.raw`def odd_even_list(head):
    if not head:
        return head
    odd, even = head, head.next
    even_head = even
    while even and even.next:
        odd.next = even.next
        odd = odd.next
        even.next = odd.next
        even = even.next
    odd.next = even_head
    return head`,
      explain: `Weave two separate chains out of the one list, then join them.

1. odd starts at node 1 and even starts at node 2. Remember where the even chain starts.
2. Repeatedly:
- link odd to the node after even (the next odd position) and move odd there;
- link even to the node after the new odd (the next even position) and move even there.
3. When the even pointer runs out, attach the saved even head to the end of the odd chain.

Positions matter, not values: [2, 1, 3, ...] is grouped by index.

The loop condition even && even.next ensures there is a next odd node to jump to.

Every node is relinked in place, with no new nodes and no arrays, so it uses O(1) extra space. Splitting into chains and rejoining them also solves Partition List (values less than x first) and splitting a list into k parts.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Add Two Numbers', fn: 'addTwoNumbers', args: ['l1', 'l2'],
      prompt: 'Two non-negative integers are stored in linked lists with their digits in reverse order (342 is 2 → 4 → 3). Return their sum as a list in the same format.',
      notes: [NOTE],
      types: { args: ['list', 'list'], ret: 'list' },
      tests: [[[[2, 4, 3], [5, 6, 4]], [7, 0, 8]], [[[0], [0]], [0]], [[[9, 9, 9, 9, 9, 9, 9], [9, 9, 9, 9]], [8, 9, 9, 9, 0, 0, 0, 1]], [[[5], [5]], [0, 1]], [[[1, 8], [0]], [1, 8]]],
      js: String.raw`function addTwoNumbers(l1, l2) {
  const dummy = new ListNode(0);
  let tail = dummy, carry = 0;
  while (l1 || l2 || carry) {
    const sum = (l1 ? l1.val : 0) + (l2 ? l2.val : 0) + carry;
    carry = Math.floor(sum / 10);
    tail.next = new ListNode(sum % 10);
    tail = tail.next;
    l1 = l1 && l1.next;
    l2 = l2 && l2.next;
  }
  return dummy.next;
}`,
      py: String.raw`def add_two_numbers(l1, l2):
    dummy = ListNode(0)
    tail, carry = dummy, 0
    while l1 or l2 or carry:
        total = (l1.val if l1 else 0) + (l2.val if l2 else 0) + carry
        carry, digit = divmod(total, 10)
        tail.next = ListNode(digit)
        tail = tail.next
        l1 = l1.next if l1 else None
        l2 = l2.next if l2 else None
    return dummy.next`,
      explain: `Storing the digits in reverse puts the ones digit first, which is exactly where column addition starts. So simulate adding by hand.

1. Add the current digits (0 if a list has ended) plus the carry.
2. The new digit is sum % 10, and the carry is sum // 10.
3. Advance both lists.

The loop continues while either list has digits or a carry remains. That last condition produces the extra leading 1 in 5 + 5 = 10, which becomes [0, 1].

Handling different lengths with "treat missing as 0" avoids three separate loops (both present, only l1, only l2).

Python's divmod(total, 10) returns the quotient and remainder together.

Follow-up: if the digits were stored most-significant first, reverse both lists first, or push the digits onto stacks and add from the top.`,
      complexity: 'O(max(n, m)) time, O(max(n, m)) space for the result',
    },
    {
      title: 'Rotate List', fn: 'rotateRight', args: ['head', 'k'],
      prompt: 'Rotate the list to the right by k places: [1,2,3,4,5] with k = 2 becomes [4,5,1,2,3]. k may be larger than the length.',
      notes: [NOTE],
      types: { args: ['list', null], ret: 'list' },
      tests: [[[[1, 2, 3, 4, 5], 2], [4, 5, 1, 2, 3]], [[[0, 1, 2], 4], [2, 0, 1]], [[[], 3], []], [[[1], 99], [1]], [[[1, 2], 2], [1, 2]]],
      js: String.raw`function rotateRight(head, k) {
  if (!head || !head.next) return head;
  let n = 1, tail = head;
  while (tail.next) {
    tail = tail.next;
    n++;
  }
  k %= n;
  if (k === 0) return head;
  tail.next = head; // make it a ring
  let newTail = head;
  for (let i = 0; i < n - k - 1; i++) newTail = newTail.next;
  const newHead = newTail.next;
  newTail.next = null; // break the ring
  return newHead;
}`,
      py: String.raw`def rotate_right(head, k):
    if not head or not head.next:
        return head
    n, tail = 1, head
    while tail.next:
        tail = tail.next
        n += 1
    k %= n
    if k == 0:
        return head
    tail.next = head
    new_tail = head
    for _ in range(n - k - 1):
        new_tail = new_tail.next
    new_head = new_tail.next
    new_tail.next = None
    return new_head`,
      explain: `Rotating right by k moves the last k nodes to the front. Close the list into a ring, then cut it at the right place.

1. Find the length n and the tail.
2. Reduce k with k %= n, because rotating by n changes nothing. This handles huge values of k.
3. Link the tail to the head, making a ring.
4. The new tail is the node at position n - k - 1 from the old head. Walk there, take its next node as the new head, and cut the link.

[1, 2, 3, 4, 5] with k = 2: n = 5, so the new tail is node 3 (index 2) and the new head is 4. The result is 4 → 5 → 1 → 2 → 3.

This is the linked-list version of Rotate Left from Easy. With arrays you rebuild by slicing. With lists you only move a couple of pointers, so no data is copied.

Edge cases: an empty list, a single node, and k a multiple of n all return the original head.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Swap Nodes in Pairs', fn: 'swapPairs', args: ['head'],
      prompt: 'Swap every two adjacent nodes and return the new head. Change the links, not the values: [1,2,3,4] becomes [2,1,4,3].',
      notes: [NOTE],
      types: { args: ['list'], ret: 'list' },
      tests: [[[[1, 2, 3, 4]], [2, 1, 4, 3]], [[[]], []], [[[1]], [1]], [[[1, 2, 3]], [2, 1, 3]], [[[1, 2, 3, 4, 5, 6]], [2, 1, 4, 3, 6, 5]]],
      js: String.raw`function swapPairs(head) {
  const dummy = new ListNode(0, head);
  let prev = dummy;
  while (prev.next && prev.next.next) {
    const a = prev.next, b = a.next;
    a.next = b.next; // a -> rest
    b.next = a; // b -> a
    prev.next = b; // prev -> b
    prev = a; // a is now the second of the pair
  }
  return dummy.next;
}`,
      py: String.raw`def swap_pairs(head):
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next and prev.next.next:
        a = prev.next
        b = a.next
        a.next = b.next
        b.next = a
        prev.next = b
        prev = a
    return dummy.next`,
      explain: `Each swap changes three pointers. Name the nodes involved first and the order of the updates becomes clear: prev → a → b → rest should become prev → b → a → rest.

1. a.next = b.next (a now points to the rest)
2. b.next = a (b points back to a)
3. prev.next = b (whatever came before now points to b)
4. Move prev to a, which is now the second node of the swapped pair.

The dummy head gives the first pair a "prev" too, so the head swap needs no special case.

An odd final node has no partner, and the loop condition leaves it alone.

When you are unsure about pointer order, draw the boxes and arrows, and only overwrite a pointer after you have saved whatever it pointed to.

Recursive version: swap the first two nodes and let the second point at swapPairs(rest). It is short, but uses O(n) stack.

The generalization, Reverse Nodes in k-Group, uses the same dummy and prev bookkeeping.`,
      complexity: 'O(n) time, O(1) space',
    },
  ],
};

export default m;
