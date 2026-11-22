import type { ModuleDef } from '../../types';

const NOTE = 'Trees are shown in level order with null for missing children, e.g. [3, 9, 20, null, null, 15, 7]. Your function receives TreeNode objects (val, left, right).';

const m: ModuleDef = {
  id: 'trees',
  title: 'Tree Classics',
  description: 'The binary-tree questions every interview loop includes: depth, mirroring, traversals and BST order.',
  challenges: [
    {
      title: 'Maximum Depth', fn: 'maxDepth', args: ['root'],
      prompt: 'Return the number of nodes along the longest path from the root down to a leaf.',
      notes: [NOTE],
      types: { args: ['tree'] },
      tests: [[[[3, 9, 20, null, null, 15, 7]], 3], [[[1, null, 2]], 2], [[[]], 0], [[[1]], 1], [[[1, 2, null, 3, null, 4]], 4]],
      js: String.raw`function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
      py: String.raw`def max_depth(root):
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))`,
      explain: `This is the purest example of tree recursion: trust the recursive call to solve the subtrees, then combine.

- An empty tree has depth 0 (the base case).
- Otherwise the depth is 1 (this node) plus the deeper of the two subtrees.

Every tree recursion has this shape:
1. Handle null.
2. Recurse on the children.
3. Combine their results with this node's information.

Iterative alternatives:
- BFS level by level, counting the levels. That avoids deep recursion on very tall trees.
- A DFS with an explicit stack of (node, depth) pairs.

A skewed tree (essentially a linked list) can be 10,000 levels deep, which can overflow the call stack in some languages. That is the main reason to know the iterative version.`,
      complexity: 'O(n) time, O(h) space',
    },
    {
      title: 'Invert Binary Tree', fn: 'invertTree', args: ['root'],
      prompt: 'Mirror the tree: swap the left and right children of every node. Return the root.',
      notes: [NOTE],
      types: { args: ['tree'], ret: 'tree' },
      tests: [[[[4, 2, 7, 1, 3, 6, 9]], [4, 7, 2, 9, 6, 3, 1]], [[[2, 1, 3]], [2, 3, 1]], [[[]], []], [[[1, 2]], [1, null, 2]]],
      js: String.raw`function invertTree(root) {
  if (!root) return null;
  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];
  return root;
}`,
      py: String.raw`def invert_tree(root):
    if root is None:
        return None
    root.left, root.right = invert_tree(root.right), invert_tree(root.left)
    return root`,
      explain: `To mirror a tree, mirror both subtrees and swap them.

1. Base: an empty tree mirrors to itself.
2. Recursively invert the right subtree and make it the new left, and invert the left subtree and make it the new right.

Simultaneous assignment evaluates both recursive calls before assigning either, so no temporary variable is needed.

The order does not matter. Swapping first and then recursing (pre-order) works just as well as recursing first and then swapping (post-order). Every node gets visited and swapped exactly once either way.

BFS version: take each node from a queue, swap its children, and enqueue them.

This question is famous for an anecdote about a well-known engineer failing it at an interview. Its real value is checking that you are comfortable with basic recursion on trees.`,
      complexity: 'O(n) time, O(h) space',
    },
    {
      title: 'Same Tree', fn: 'isSameTree', args: ['p', 'q'],
      prompt: 'Return true if the two trees have identical structure and node values.',
      notes: [NOTE],
      types: { args: ['tree', 'tree'] },
      tests: [[[[1, 2, 3], [1, 2, 3]], true], [[[1, 2], [1, null, 2]], false], [[[1, 2, 1], [1, 1, 2]], false], [[[], []], true], [[[1], []], false]],
      js: String.raw`function isSameTree(p, q) {
  if (!p || !q) return p === q; // both null -> true, one null -> false
  return p.val === q.val && isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}`,
      py: String.raw`def is_same_tree(p, q):
    if p is None or q is None:
        return p is q
    return p.val == q.val and is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)`,
      explain: `This walks two trees in lockstep.

1. If either node is null, they match only if both are null. p === q captures that compactly: it is true for null === null and false for a node against null.
2. Otherwise, the values must match and both pairs of subtrees must match.

Short-circuit AND stops at the first difference, so mismatched trees are rejected quickly.

[1, 2] vs [1, null, 2] are different: the same values, but 2 is a left child in one and a right child in the other. Structure matters.

This "compare two trees together" pattern is reused directly in Symmetric Tree (next), where you compare a tree with its own mirror, and in Subtree of Another Tree, where you run Same Tree from every node.`,
      complexity: 'O(min(n, m)) time, O(h) space',
    },
    {
      title: 'Symmetric Tree', fn: 'isSymmetric', args: ['root'],
      prompt: 'Return true if the tree is a mirror image of itself around its center.',
      notes: [NOTE],
      types: { args: ['tree'] },
      tests: [[[[1, 2, 2, 3, 4, 4, 3]], true], [[[1, 2, 2, null, 3, null, 3]], false], [[[]], true], [[[1]], true], [[[1, 2, 2, 2, null, 2]], false]],
      js: String.raw`function isSymmetric(root) {
  const mirror = (a, b) => {
    if (!a || !b) return a === b;
    return a.val === b.val && mirror(a.left, b.right) && mirror(a.right, b.left);
  };
  return !root || mirror(root.left, root.right);
}`,
      py: String.raw`def is_symmetric(root):
    def mirror(a, b):
        if a is None or b is None:
            return a is b
        return a.val == b.val and mirror(a.left, b.right) and mirror(a.right, b.left)
    return root is None or mirror(root.left, root.right)`,
      explain: `A tree is symmetric when its left subtree is the mirror image of its right subtree.

mirror(a, b) is Same Tree with the children crossed:
- the values must be equal;
- a's left must mirror b's right (the outer pair);
- a's right must mirror b's left (the inner pair).

Start with mirror(root.left, root.right).

Why crossing works: in a mirror, what is on the far left of one side appears on the far right of the other. So the outer children are compared with each other, and so are the inner ones.

Iterative version: a queue of pairs. Push (left, right). Each time, pop a pair, compare it, and push (a.left, b.right) and (a.right, b.left).

Tip: when two problems look similar (Same Tree and Symmetric Tree), find the single change that turns one into the other. Here it is crossing left with right.`,
      complexity: 'O(n) time, O(h) space',
    },
    {
      title: 'Level Order Traversal', fn: 'levelOrder', args: ['root'],
      prompt: 'Return the node values level by level, from left to right within each level.',
      notes: [NOTE],
      types: { args: ['tree'] },
      tests: [[[[3, 9, 20, null, null, 15, 7]], [[3], [9, 20], [15, 7]]], [[[1]], [[1]]], [[[]], []], [[[1, 2, 3, 4, null, null, 5]], [[1], [2, 3], [4, 5]]]],
      js: String.raw`function levelOrder(root) {
  const out = [];
  const queue = root ? [root] : [];
  let head = 0;
  while (head < queue.length) {
    const size = queue.length - head; // nodes on this level
    const level = [];
    for (let i = 0; i < size; i++) {
      const n = queue[head++];
      level.push(n.val);
      if (n.left) queue.push(n.left);
      if (n.right) queue.push(n.right);
    }
    out.push(level);
  }
  return out;
}`,
      py: String.raw`from collections import deque

def level_order(root):
    out = []
    q = deque([root] if root else [])
    while q:
        level = []
        for _ in range(len(q)):
            n = q.popleft()
            level.append(n.val)
            if n.left:
                q.append(n.left)
            if n.right:
                q.append(n.right)
        out.append(level)
    return out`,
      explain: `This is BFS with level boundaries, the standard template for anything "per level".

The trick: at the start of each round, the queue holds exactly the nodes of one level. Record its size, then process exactly that many nodes. Their children go to the back of the queue, and they form the next level.

1. Seed the queue with the root.
2. While the queue is not empty: take size = the number of nodes in it, pop that many while collecting their values, and enqueue their children.
3. Append the level's list to the output.

JavaScript: a head index instead of shift() keeps each dequeue O(1). Python: collections.deque.

This template solves Right Side View (the last of each level), Average of Levels, Zigzag order (reverse every other level), Minimum Depth (the first leaf found), and Maximum Width (with position indices).

DFS can also do it, by passing the depth and appending to out[depth]. Preorder visits left before right, so each level is still filled from left to right.`,
      complexity: 'O(n) time, O(width) space',
    },
    {
      title: 'Right Side View', fn: 'rightSideView', args: ['root'],
      prompt: 'Imagine standing to the right of the tree. Return the values of the nodes you can see, from top to bottom (the rightmost node of each level).',
      notes: [NOTE],
      types: { args: ['tree'] },
      tests: [[[[1, 2, 3, null, 5, null, 4]], [1, 3, 4]], [[[1, null, 3]], [1, 3]], [[[]], []], [[[1, 2, 3, 4]], [1, 3, 4]], [[[1, 2]], [1, 2]]],
      js: String.raw`function rightSideView(root) {
  const out = [];
  // DFS visiting the right child first: the first node seen at each depth is the visible one
  const dfs = (node, depth) => {
    if (!node) return;
    if (depth === out.length) out.push(node.val);
    dfs(node.right, depth + 1);
    dfs(node.left, depth + 1);
  };
  dfs(root, 0);
  return out;
}`,
      py: String.raw`def right_side_view(root):
    out = []
    def dfs(node, depth):
        if node is None:
            return
        if depth == len(out):
            out.append(node.val)
        dfs(node.right, depth + 1)
        dfs(node.left, depth + 1)
    dfs(root, 0)
    return out`,
      explain: `The visible node on each level is that level's rightmost node.

BFS version: run Level Order Traversal and keep the last value of each level.

DFS version (used here): visit the right child before the left. The first node you reach at each new depth is the rightmost one at that depth.
- out.length equals the number of depths already seen.
- If depth === out.length, this is the first visit to that depth, so record the node.

A left node can still be visible: in [1, 2, 3, 4], node 4 is the left child of 2, but it is the only node at depth 2, so it shows up. This catches solutions that only ever walk down right children.

The same DFS with the left child first gives the left side view.

"First node seen at each depth" is a neat use of DFS order, and it avoids queue bookkeeping.`,
      complexity: 'O(n) time, O(h) space',
    },
    {
      title: 'Diameter of Binary Tree', fn: 'diameterOfBinaryTree', args: ['root'],
      prompt: 'Return the length (number of edges) of the longest path between any two nodes. The path may or may not pass through the root.',
      notes: [NOTE],
      types: { args: ['tree'] },
      tests: [[[[1, 2, 3, 4, 5]], 3], [[[1, 2]], 1], [[[1]], 0], [[[]], 0], [[[1, 2, null, 3, 4, 5, null, null, 6]], 4]],
      js: String.raw`function diameterOfBinaryTree(root) {
  let best = 0;
  const height = (node) => {
    if (!node) return 0;
    const l = height(node.left), r = height(node.right);
    best = Math.max(best, l + r); // longest path that bends at this node
    return 1 + Math.max(l, r);
  };
  height(root);
  return best;
}`,
      py: String.raw`def diameter_of_binary_tree(root):
    best = 0
    def height(node):
        nonlocal best
        if node is None:
            return 0
        l, r = height(node.left), height(node.right)
        best = max(best, l + r)
        return 1 + max(l, r)
    height(root)
    return best`,
      explain: `This has the same shape as Maximum Path Sum (in Hard): return one thing upward, record another.

Every path has a highest node where it bends. A path bending at node X has length height(left) + height(right) in edges, going down the deepest branch on each side.

So during a single height computation:
- record left + right at every node as a candidate diameter;
- return 1 + max(left, right), the height, to the parent.

The answer is the largest candidate.

The longest path may not pass through the root. In the last test, the deepest part of the tree sits below node 2, and the best path stays there. Checking only the root's left and right heights is the classic mistake.

Computing the height separately for each node would be O(n²). Folding the diameter check into one post-order pass makes it O(n).

Careful with units: here the length counts edges. Some versions count nodes, which is the edge count + 1.`,
      complexity: 'O(n) time, O(h) space',
    },
    {
      title: 'Kth Smallest in a BST', fn: 'kthSmallest', args: ['root', 'k'],
      prompt: 'Return the k-th smallest value (1-indexed) in a binary search tree.',
      notes: [NOTE],
      types: { args: ['tree', null] },
      tests: [[[[3, 1, 4, null, 2], 1], 1], [[[5, 3, 6, 2, 4, null, null, 1], 3], 3], [[[1], 1], 1], [[[2, 1, 3], 3], 3], [[[5, 3, 6, 2, 4, null, null, 1], 6], 6]],
      js: String.raw`function kthSmallest(root, k) {
  // iterative in-order traversal visits BST values in sorted order
  const stack = [];
  let node = root;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    if (--k === 0) return node.val;
    node = node.right;
  }
  return -1;
}`,
      py: String.raw`def kth_smallest(root, k):
    stack, node = [], root
    while node or stack:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        k -= 1
        if k == 0:
            return node.val
        node = node.right
    return -1`,
      explain: `The defining property of a BST is that an in-order traversal (left, node, right) visits the values in sorted order. So the k-th value visited is the k-th smallest.

Iterative in-order traversal with a stack:
1. Go as far left as possible, pushing each node.
2. Pop: this is the next smallest value. Count it.
3. Move to its right subtree and repeat.

Stopping as soon as k reaches 0 means you only visit about h + k nodes, not the whole tree.

This iterative form is worth memorizing. It is also the basis of the BST Iterator design problem (next() and hasNext() in O(1) amortized time) and of Validate BST via in-order order.

Follow-up: if the tree changes often and k-th queries are frequent, store each node's subtree size. Then compare k with the left subtree's size and descend directly, in O(h) per query. That is called an order-statistic tree.`,
      complexity: 'O(h + k) time, O(h) space',
    },
    {
      title: 'Path Sum', fn: 'hasPathSum', args: ['root', 'target'],
      prompt: 'Return true if the tree has a root-to-leaf path whose values add up to target.',
      notes: [NOTE],
      types: { args: ['tree', null] },
      tests: [[[[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], 22], true], [[[1, 2, 3], 5], false], [[[], 0], false], [[[1, 2], 1], false], [[[-2, null, -3], -5], true], [[[1], 1], true]],
      js: String.raw`function hasPathSum(root, target) {
  if (!root) return false;
  if (!root.left && !root.right) return root.val === target; // leaf
  const rest = target - root.val;
  return hasPathSum(root.left, rest) || hasPathSum(root.right, rest);
}`,
      py: String.raw`def has_path_sum(root, target):
    if root is None:
        return False
    if root.left is None and root.right is None:
        return root.val == target
    rest = target - root.val
    return has_path_sum(root.left, rest) or has_path_sum(root.right, rest)`,
      explain: `Pass the remaining target down the tree. At each node, subtract its value. At a leaf, check whether exactly the node's value is left.

1. A null node gives false (an empty tree has no paths).
2. A leaf succeeds if its value equals the remaining target.
3. Otherwise recurse into the children with target - val.

The leaf condition matters. [1, 2] with target 1: the root alone sums to 1, but the root is not a leaf, since it has a child 2. So the answer is false. Stopping at any node instead of only at leaves is the classic bug, and this test catches it.

Negative values are allowed, so you cannot prune when the running sum exceeds the target.

Variations:
- Path Sum II: return all such paths (backtracking with a path list).
- Path Sum III (Hard Trees): count downward paths that can start anywhere (prefix sums).
- Max Path Sum (Hard Trees): any path, choosing the best one.`,
      complexity: 'O(n) time, O(h) space',
    },
    {
      title: 'Minimum Depth', fn: 'minDepth', args: ['root'],
      prompt: 'Return the number of nodes on the shortest path from the root down to the nearest leaf.',
      notes: [NOTE],
      types: { args: ['tree'] },
      tests: [[[[3, 9, 20, null, null, 15, 7]], 2], [[[2, null, 3, null, 4, null, 5, null, 6]], 5], [[[]], 0], [[[1]], 1], [[[1, 2]], 2]],
      js: String.raw`function minDepth(root) {
  if (!root) return 0;
  // BFS: the first leaf we meet is the shallowest
  let level = [root], depth = 1;
  while (level.length) {
    const next = [];
    for (const n of level) {
      if (!n.left && !n.right) return depth;
      if (n.left) next.push(n.left);
      if (n.right) next.push(n.right);
    }
    level = next;
    depth++;
  }
  return depth;
}`,
      py: String.raw`def min_depth(root):
    if root is None:
        return 0
    level, depth = [root], 1
    while level:
        nxt = []
        for n in level:
            if n.left is None and n.right is None:
                return depth
            if n.left:
                nxt.append(n.left)
            if n.right:
                nxt.append(n.right)
        level = nxt
        depth += 1
    return depth`,
      explain: `This is not simply Maximum Depth with min instead of max.

The trap: 1 + min(minDepth(left), minDepth(right)) is wrong when one child is missing. For [1, 2], the right subtree is empty (depth 0), so the formula gives 1. But node 1 is not a leaf, so the real answer is 2. A missing child is not a path to a leaf.

The recursive fix: if one child is null, use only the other child.

BFS (used here) avoids the issue entirely and is faster on lopsided trees: explore level by level and return the depth of the first leaf found. It never visits anything deeper than the shallowest leaf, while a full DFS visits every node.

The skewed test [2, null, 3, null, 4, ...] is the case that catches the naive formula.

Rule of thumb: for the shortest or nearest anything, think BFS first. It stops as soon as it finds an answer.`,
      complexity: 'O(n) worst case, but stops at the shallowest leaf; O(width) space',
    },
  ],
};

export default m;
