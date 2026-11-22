import type { ModuleDef } from '../../types';

const NOTE = 'Trees are shown in level order with null for missing children, e.g. [1, 2, 3, null, 4]. Your function receives TreeNode objects (val, left, right).';

const m: ModuleDef = {
  id: 'trees',
  title: 'Trees (Advanced)',
  description: 'Recursion that returns information upward: BSTs, path sums, construction and ancestors.',
  challenges: [
    {
      title: 'Validate Binary Search Tree', fn: 'isValidBST', args: ['root'],
      prompt: 'Return true if the tree is a valid BST: every node in the left subtree is strictly smaller and every node in the right subtree strictly larger than the node, recursively.',
      notes: [NOTE],
      types: { args: ['tree'] },
      tests: [[[[2, 1, 3]], true], [[[5, 1, 4, null, null, 3, 6]], false], [[[5, 4, 6, null, null, 3, 7]], false], [[[]], true], [[[1, 1]], false], [[[10, 5, 15, 3, 7, 12, 20]], true]],
      js: String.raw`function isValidBST(root) {
  const ok = (node, lo, hi) => {
    if (!node) return true;
    if (node.val <= lo || node.val >= hi) return false;
    return ok(node.left, lo, node.val) && ok(node.right, node.val, hi);
  };
  return ok(root, -Infinity, Infinity);
}`,
      py: String.raw`def is_valid_bst(root):
    def ok(node, lo, hi):
        if node is None:
            return True
        if not (lo < node.val < hi):
            return False
        return ok(node.left, lo, node.val) and ok(node.right, node.val, hi)
    return ok(root, float("-inf"), float("inf"))`,
      explain: `The common mistake is to check only that left child < node < right child. That misses violations deeper down. In [5, 4, 6, null, null, 3, 7], node 3 is a valid left child of 6, but it sits in the right subtree of 5, so it must be greater than 5.

Fix: pass down the allowed range (lo, hi) that every node in a subtree must respect.
- The root may be anything: (-∞, +∞).
- Going left, the current value becomes the new upper bound.
- Going right, it becomes the new lower bound.
- Any node outside its range breaks the BST property.

Strictly < and >: duplicates are not allowed, so [1, 1] is invalid.

An alternative uses the defining property of BSTs: an in-order traversal visits the values in sorted order. Do an in-order walk and check that each value is greater than the previous one.

Passing constraints down while returning results up is the core of tree recursion.`,
      complexity: 'O(n) time, O(h) recursion space for height h',
    },
    {
      title: 'Lowest Common Ancestor', fn: 'lowestCommonAncestor', args: ['root', 'p', 'q'],
      prompt: 'Given a binary tree (not necessarily a BST) with unique values, return the value of the lowest node that has both p and q as descendants (a node counts as its own descendant). Both values exist in the tree.',
      notes: [NOTE],
      types: { args: ['tree', null, null] },
      tests: [[[[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 1], 3], [[[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 4], 5], [[[1, 2], 1, 2], 1], [[[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 7, 8], 3], [[[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 6, 4], 5]],
      js: String.raw`function lowestCommonAncestor(root, p, q) {
  // returns the node equal to p or q found in this subtree, or their LCA if both are there
  const go = (node) => {
    if (!node || node.val === p || node.val === q) return node;
    const left = go(node.left), right = go(node.right);
    if (left && right) return node; // p and q are on different sides
    return left || right;
  };
  return go(root).val;
}`,
      py: String.raw`def lowest_common_ancestor(root, p, q):
    def go(node):
        if node is None or node.val in (p, q):
            return node
        left, right = go(node.left), go(node.right)
        if left and right:
            return node
        return left or right
    return go(root).val`,
      explain: `Each recursive call reports back what it found in its subtree:
- nothing (null),
- one of the targets (that node), or
- the LCA itself, once both targets have been found below it.

At each node:
1. If the node is null, or is p or q, return it. If it is a target, there is no need to look deeper: if the other target is below it, this node is the LCA anyway.
2. Search both children.
3. If both sides returned something, p and q are split across this node, so it is the lowest common ancestor.
4. Otherwise pass up whichever side found something.

Why is the first split point the lowest? Recursion returns bottom-up, so the deepest node with targets on both sides is detected first, and its ancestors simply pass it along.

For a BST it is simpler: walk down from the root. If both values are smaller, go left. If both are larger, go right. Otherwise you are at the split, which is the LCA.`,
      complexity: 'O(n) time, O(h) space',
    },
    {
      title: 'Binary Tree Maximum Path Sum', fn: 'maxPathSum', args: ['root'],
      prompt: 'A path is any sequence of connected nodes (each used at most once); it need not pass through the root. Return the maximum sum of values along any non-empty path. Values can be negative.',
      notes: [NOTE],
      types: { args: ['tree'] },
      tests: [[[[1, 2, 3]], 6], [[[-10, 9, 20, null, null, 15, 7]], 42], [[[-3]], -3], [[[2, -1]], 2], [[[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]], 48], [[[-2, -1]], -1]],
      js: String.raw`function maxPathSum(root) {
  let best = -Infinity;
  // returns the best sum of a downward path starting at node
  const gain = (node) => {
    if (!node) return 0;
    const l = Math.max(0, gain(node.left)); // drop negative branches
    const r = Math.max(0, gain(node.right));
    best = Math.max(best, node.val + l + r); // path that bends at node
    return node.val + Math.max(l, r); // a parent can extend only one side
  };
  gain(root);
  return best;
}`,
      py: String.raw`def max_path_sum(root):
    best = float("-inf")
    def gain(node):
        nonlocal best
        if node is None:
            return 0
        l = max(0, gain(node.left))
        r = max(0, gain(node.right))
        best = max(best, node.val + l + r)
        return node.val + max(l, r)
    gain(root)
    return best`,
      explain: `Every path has a single highest node, the point where it bends. If you know, for each node, the best path that goes straight down from it, you can evaluate every bend point.

gain(node) returns the best sum of a downward path starting at node:
1. Recursively get the left and right gains. Clamp them at 0, because a negative branch only hurts, so leave it out.
2. The best path that bends here is node.val + left + right. Update the global best with it.
3. Return node.val + max(left, right) to the parent. A parent can only continue the path into one side, or it would stop being a path.

The distinction between the value you return upward (one side only) and the value you record (both sides) is the whole trick, and it appears in many tree problems: diameter, longest univalue path, camera placement.

All-negative trees: since best starts at -∞ and every node is considered as a bend point, the answer is the largest single value (-1 in the last test).`,
      complexity: 'O(n) time, O(h) space',
    },
    {
      title: 'Build Tree from Preorder & Inorder', fn: 'buildTree', args: ['preorder', 'inorder'],
      prompt: 'Given the preorder and inorder traversals of a binary tree with unique values, reconstruct and return the tree.',
      notes: [NOTE],
      types: { ret: 'tree' },
      tests: [[[[3, 9, 20, 15, 7], [9, 3, 15, 20, 7]], [3, 9, 20, null, null, 15, 7]], [[[-1], [-1]], [-1]], [[[1, 2], [2, 1]], [1, 2]], [[[1, 2], [1, 2]], [1, null, 2]], [[[1, 2, 4, 5, 3, 6], [4, 2, 5, 1, 3, 6]], [1, 2, 3, 4, 5, null, 6]], [[[], []], []]],
      js: String.raw`function buildTree(preorder, inorder) {
  const pos = new Map(inorder.map((v, i) => [v, i]));
  let next = 0; // index of the next root in preorder
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const val = preorder[next++];
    const node = new TreeNode(val);
    const mid = pos.get(val);
    node.left = build(lo, mid - 1); // everything left of the root in inorder
    node.right = build(mid + 1, hi);
    return node;
  };
  return build(0, inorder.length - 1);
}`,
      py: String.raw`def build_tree(preorder, inorder):
    pos = {v: i for i, v in enumerate(inorder)}
    nxt = 0
    def build(lo, hi):
        nonlocal nxt
        if lo > hi:
            return None
        val = preorder[nxt]
        nxt += 1
        node = TreeNode(val)
        mid = pos[val]
        node.left = build(lo, mid - 1)
        node.right = build(mid + 1, hi)
        return node
    return build(0, len(inorder) - 1)`,
      explain: `Each traversal gives a different piece of information:
- Preorder (root, left, right): the first element is the root.
- Inorder (left, root, right): everything before the root belongs to its left subtree, and everything after it to the right subtree.

Recursion:
1. Take the next preorder value as the root of the current subtree.
2. Find its position mid in the inorder array, using a map for O(1) lookups.
3. Build the left subtree from inorder[lo..mid-1], then the right subtree from inorder[mid+1..hi].

Build left before right. Preorder lists the whole left subtree before the right one, so the shared next pointer consumes the values in exactly the right order.

The position map makes it O(n). Searching the inorder array each time would be O(n²) for a skewed tree.

Why are both traversals needed? Preorder alone is ambiguous: [1, 2] could have 2 as either a left or a right child. The third and fourth tests show exactly that pair. Inorder settles which side each node is on.`,
      complexity: 'O(n) time and space',
    },
    {
      title: 'Zigzag Level Order', fn: 'zigzagLevelOrder', args: ['root'],
      prompt: 'Return the node values level by level, alternating direction: left-to-right on the first level, right-to-left on the next, and so on.',
      notes: [NOTE],
      types: { args: ['tree'] },
      tests: [[[[3, 9, 20, null, null, 15, 7]], [[3], [20, 9], [15, 7]]], [[[1]], [[1]]], [[[]], []], [[[1, 2, 3, 4, 5, 6, 7]], [[1], [3, 2], [4, 5, 6, 7]]], [[[1, 2, null, 3, null, 4]], [[1], [2], [3], [4]]]],
      js: String.raw`function zigzagLevelOrder(root) {
  const out = [];
  let level = root ? [root] : [];
  let leftToRight = true;
  while (level.length) {
    const vals = level.map((n) => n.val);
    out.push(leftToRight ? vals : vals.reverse());
    leftToRight = !leftToRight;
    const next = [];
    for (const n of level) {
      if (n.left) next.push(n.left);
      if (n.right) next.push(n.right);
    }
    level = next;
  }
  return out;
}`,
      py: String.raw`def zigzag_level_order(root):
    out = []
    level = [root] if root else []
    left_to_right = True
    while level:
        vals = [n.val for n in level]
        out.append(vals if left_to_right else vals[::-1])
        left_to_right = not left_to_right
        level = [c for n in level for c in (n.left, n.right) if c]
    return out`,
      explain: `This is level-order BFS, one level at a time, with each odd level reversed.

1. Keep the current level as a list of nodes.
2. Record their values, reversed on every other level.
3. Build the next level from the children, always left before right.

Only the output is reversed, never the traversal order. Changing the order in which you push children based on direction is a common source of bugs.

Processing whole levels (rather than a single queue with markers) makes per-level questions easy: level averages, the largest value per level, right side view, the deepest level's sum.

Alternative: a deque. Depending on direction, add values to the front or the back of each level's list, which avoids the reversal.`,
      complexity: 'O(n) time, O(width) space',
    },
    {
      title: 'Path Sum III', fn: 'pathSumCount', args: ['root', 'target'],
      prompt: 'Count the paths whose node values sum to target. A path must go downward (parent to child) but can start and end at any nodes.',
      notes: [NOTE],
      types: { args: ['tree', null] },
      tests: [[[[10, 5, -3, 3, 2, null, 11, 3, -2, null, 1], 8], 3], [[[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1], 22], 3], [[[], 0], 0], [[[1], 1], 1], [[[1, -1, 1], 0], 1], [[[0, 0, 0], 0], 5]],
      js: String.raw`function pathSumCount(root, target) {
  const seen = new Map([[0, 1]]); // prefix sums on the current root-to-node path
  const go = (node, sum) => {
    if (!node) return 0;
    sum += node.val;
    let count = seen.get(sum - target) || 0; // paths ending here
    seen.set(sum, (seen.get(sum) || 0) + 1);
    count += go(node.left, sum) + go(node.right, sum);
    seen.set(sum, seen.get(sum) - 1); // backtrack: leave this path
    return count;
  };
  return go(root, 0);
}`,
      py: String.raw`def path_sum_count(root, target):
    seen = {0: 1}
    def go(node, s):
        if node is None:
            return 0
        s += node.val
        count = seen.get(s - target, 0)
        seen[s] = seen.get(s, 0) + 1
        count += go(node.left, s) + go(node.right, s)
        seen[s] -= 1
        return count
    return go(root, 0)`,
      explain: `This is Subarray Sum Equals K, on the paths of a tree.

Along any root-to-node path the values form a sequence, and a downward path is a contiguous piece of that sequence. Its sum is prefix[end] - prefix[start]. So, at each node, count the earlier prefix sums on the current path that equal (current sum - target).

1. Keep a map of prefix sum to count for the path from the root to the current node. Seed it with {0: 1} so paths starting at the root are counted.
2. At each node, add the count of (sum - target), then record the current sum.
3. Recurse into both children.
4. Backtrack: remove the current sum before returning, because sibling subtrees must not see prefixes from this branch.

The backtracking step is what makes the map represent only the current path, not the whole tree.

The brute force starts a DFS from every node, which is O(n²) on skewed trees. Prefix sums make it O(n).

[0, 0, 0] with target 0 has 5 paths: each of the 3 nodes alone, plus root to left and root to right.`,
      complexity: 'O(n) time, O(h) space',
    },
    {
      title: 'Maximum Width of Binary Tree', fn: 'widthOfBinaryTree', args: ['root'],
      prompt: 'The width of a level is the distance between its leftmost and rightmost non-null nodes, counting the null positions between them as if the tree were complete. Return the maximum width over all levels.',
      notes: [NOTE],
      types: { args: ['tree'] },
      tests: [[[[1, 3, 2, 5, 3, null, 9]], 4], [[[1, 3, 2, 5, null, null, 9, 6, null, 7]], 7], [[[1, 3, 2, 5]], 2], [[[1]], 1], [[[]], 0]],
      js: String.raw`function widthOfBinaryTree(root) {
  if (!root) return 0;
  let best = 0;
  let level = [[root, 0]]; // node with its position index in a complete tree
  while (level.length) {
    const first = level[0][1];
    best = Math.max(best, level[level.length - 1][1] - first + 1);
    const next = [];
    for (const [node, i] of level) {
      const j = i - first; // re-base indices each level to keep numbers small
      if (node.left) next.push([node.left, 2 * j]);
      if (node.right) next.push([node.right, 2 * j + 1]);
    }
    level = next;
  }
  return best;
}`,
      py: String.raw`def width_of_binary_tree(root):
    if root is None:
        return 0
    best = 0
    level = [(root, 0)]
    while level:
        first = level[0][1]
        best = max(best, level[-1][1] - first + 1)
        nxt = []
        for node, i in level:
            j = i - first
            if node.left:
                nxt.append((node.left, 2 * j))
            if node.right:
                nxt.append((node.right, 2 * j + 1))
        level = nxt
    return best`,
      explain: `Number the positions as in a heap: if a node has index i, its children are 2i and 2i + 1. Positions then line up exactly as they would in a complete tree, gaps included.

The width of a level is (last index - first index + 1).

BFS level by level, carrying each node's index.

The overflow trap: indices double at every level, so a deep, skinny tree produces enormous numbers (2 to the power of the depth). Fix this by subtracting the level's first index before computing the children. Only differences within a level matter, so the result is unchanged and the numbers stay small. In JavaScript, numbers above 2^53 lose precision, so this step is essential there.

The same heap-style indexing is how binary heaps are stored in arrays, and it is useful whenever you need positions in a tree.`,
      complexity: 'O(n) time, O(width) space',
    },
    {
      title: 'Flatten Tree to Linked List', fn: 'flatten', args: ['root'],
      prompt: 'Flatten the tree in place into a "linked list" that uses right pointers in preorder order, with every left pointer null. Return the root.',
      notes: [NOTE],
      types: { args: ['tree'], ret: 'tree' },
      tests: [[[[1, 2, 5, 3, 4, null, 6]], [1, null, 2, null, 3, null, 4, null, 5, null, 6]], [[[]], []], [[[0]], [0]], [[[1, 2]], [1, null, 2]], [[[1, null, 2, 3]], [1, null, 2, null, 3]]],
      js: String.raw`function flatten(root) {
  let cur = root;
  while (cur) {
    if (cur.left) {
      // find the rightmost node of the left subtree
      let pre = cur.left;
      while (pre.right) pre = pre.right;
      pre.right = cur.right; // hang the right subtree after it
      cur.right = cur.left; // move the left subtree to the right
      cur.left = null;
    }
    cur = cur.right;
  }
  return root;
}`,
      py: String.raw`def flatten(root):
    cur = root
    while cur:
        if cur.left:
            pre = cur.left
            while pre.right:
                pre = pre.right
            pre.right = cur.right
            cur.right = cur.left
            cur.left = None
        cur = cur.right
    return root`,
      explain: `In preorder, a node's whole left subtree comes before its right subtree. So the right subtree should follow the last preorder node of the left subtree, which is that subtree's rightmost node.

Morris-style approach with O(1) extra space:
1. If cur has a left child, find the rightmost node of the left subtree (pre).
2. Attach cur.right to pre.right.
3. Move the left subtree into cur.right and clear cur.left.
4. Advance down the right pointer.

Each step removes one left link. When none remain, the tree is a right-leaning chain in preorder.

Is it O(n)? Each edge is walked at most a couple of times in total while searching for pre nodes, so yes, amortized.

The recursive alternative flattens the left and right subtrees, then splices them (or uses a reverse preorder visiting right, left, root, keeping a prev pointer). It is simpler to reason about, but uses O(h) stack space.

Rewiring pointers in place to avoid extra memory is the same skill as in the linked-list module, applied to a tree.`,
      complexity: 'O(n) time, O(1) extra space',
    },
    {
      title: 'Sum Root-to-Leaf Numbers', fn: 'sumNumbers', args: ['root'],
      prompt: 'Each node holds a digit 0–9. Every root-to-leaf path forms a number (1 → 2 → 3 is 123). Return the sum of all those numbers.',
      notes: [NOTE],
      types: { args: ['tree'] },
      tests: [[[[1, 2, 3]], 25], [[[4, 9, 0, 5, 1]], 1026], [[[5]], 5], [[[]], 0], [[[1, 0]], 10], [[[2, null, 3, null, 4]], 234]],
      js: String.raw`function sumNumbers(root) {
  const go = (node, num) => {
    if (!node) return 0;
    num = num * 10 + node.val;
    if (!node.left && !node.right) return num; // leaf: a complete number
    return go(node.left, num) + go(node.right, num);
  };
  return go(root, 0);
}`,
      py: String.raw`def sum_numbers(root):
    def go(node, num):
        if node is None:
            return 0
        num = num * 10 + node.val
        if node.left is None and node.right is None:
            return num
        return go(node.left, num) + go(node.right, num)
    return go(root, 0)`,
      explain: `Carry the number formed so far down the recursion, and add up the results at the leaves.

At each node, append its digit: num × 10 + val, the same Horner step used in Binary to Decimal and atoi.

- At a leaf, the path is complete, so return num.
- Otherwise return the sum from both children.
- A null child contributes 0. That matters for nodes with only one child: their missing side must not count as a finished number.

[4, 9, 0, 5, 1] gives the paths 495, 491 and 40, which sum to 1026.

This is a top-down state (the prefix value is passed in) combined with a bottom-up result (the sums are returned). Many path problems need both directions.

Pitfall: treating a node with one child as a leaf would add extra numbers, which is why the leaf check tests both children.`,
      complexity: 'O(n) time, O(h) space',
    },
    {
      title: 'All Nodes Distance K', fn: 'distanceK', args: ['root', 'target', 'k'],
      prompt: 'Return the values of all nodes exactly k edges away from the node with value target (values are unique). Any order.',
      notes: [NOTE],
      compare: 'unordered',
      types: { args: ['tree', null, null] },
      tests: [[[[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 2], [7, 4, 1]], [[[1], 1, 3], []], [[[1], 1, 0], [1]], [[[0, 1, null, 3, 2], 2, 1], [1]], [[[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 3, 3], [7, 4]], [[[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 6, 3], [7, 4, 1]]],
      js: String.raw`function distanceK(root, target, k) {
  // 1. record parents so we can walk upward
  const parent = new Map();
  let start = null;
  const stack = root ? [root] : [];
  while (stack.length) {
    const n = stack.pop();
    if (n.val === target) start = n;
    for (const c of [n.left, n.right]) if (c) { parent.set(c, n); stack.push(c); }
  }
  // 2. BFS outward from the target, treating the tree as an undirected graph
  let level = [start];
  const seen = new Set([start]);
  for (let d = 0; d < k && level.length; d++) {
    const next = [];
    for (const n of level) {
      for (const m of [n.left, n.right, parent.get(n)]) {
        if (m && !seen.has(m)) { seen.add(m); next.push(m); }
      }
    }
    level = next;
  }
  return level.map((n) => n.val);
}`,
      py: String.raw`def distance_k(root, target, k):
    parent = {}
    start = None
    stack = [root] if root else []
    while stack:
        n = stack.pop()
        if n.val == target:
            start = n
        for c in (n.left, n.right):
            if c:
                parent[c] = n
                stack.append(c)
    level = [start]
    seen = {start}
    for _ in range(k):
        nxt = []
        for n in level:
            for m in (n.left, n.right, parent.get(n)):
                if m is not None and m not in seen:
                    seen.add(m)
                    nxt.append(m)
        level = nxt
        if not level:
            break
    return [n.val for n in level]`,
      explain: `Tree edges only point downward, but distance k can go up through ancestors and back down into other branches. The fix is to turn the tree into an undirected graph.

1. One DFS records each node's parent, and finds the target node.
2. BFS from the target, where each node's neighbors are its left child, its right child and its parent.
3. A seen set prevents walking back the way you came.
4. After k levels, the current frontier is the answer.

In the first test (target 5, k = 2): going down gives 7 and 4 (via 2), going up and over gives 1 (via 3). 6 is only 1 away and 0 and 8 are 3 away, so they are excluded.

The same trick of adding parent pointers to make the tree a graph also solves "burn a tree from a node", "minimum time to infect", and the k-th ancestor queries.

The alternative without a parent map uses recursion that returns the distance to the target up the tree. It is clever, but harder to get right under pressure.`,
      complexity: 'O(n) time and space',
    },
  ],
};

export default m;
