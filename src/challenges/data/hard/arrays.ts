import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'arrays',
  title: 'Advanced Arrays',
  description: 'Monotonic stacks and deques, cyclic placement, merge-sort counting and partition search.',
  challenges: [
    {
      title: 'Trapping Rain Water', fn: 'trap', args: ['height'],
      prompt: 'height[i] is the height of a bar of width 1. Return how much rain water is trapped between the bars after raining.',
      tests: [[[[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], 6], [[[4, 2, 0, 3, 2, 5]], 9], [[[]], 0], [[[3]], 0], [[[1, 2, 3]], 0], [[[5, 0, 5]], 5], [[[2, 0, 1, 0, 3]], 5]],
      js: String.raw`function trap(height) {
  let i = 0, j = height.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (i < j) {
    if (height[i] < height[j]) {
      // the right side has a wall at least this tall, so the left max decides
      leftMax = Math.max(leftMax, height[i]);
      water += leftMax - height[i];
      i++;
    } else {
      rightMax = Math.max(rightMax, height[j]);
      water += rightMax - height[j];
      j--;
    }
  }
  return water;
}`,
      py: String.raw`def trap(height):
    i, j = 0, len(height) - 1
    left_max = right_max = water = 0
    while i < j:
        if height[i] < height[j]:
            left_max = max(left_max, height[i])
            water += left_max - height[i]
            i += 1
        else:
            right_max = max(right_max, height[j])
            water += right_max - height[j]
            j -= 1
    return water`,
      explain: `The water above bar i is min(tallest bar to its left, tallest bar to its right) - height[i]. The water level is set by the shorter of the two surrounding walls.

Version 1 (clear): precompute leftMax[] and rightMax[] arrays with two passes, then sum. That is O(n) time and O(n) space.

Version 2 (used here, O(1) space): two pointers moving inward.
- If height[i] < height[j], there is a wall at least as tall as height[i] somewhere on the right (namely j). So the water at i is limited only by leftMax, which we already know. Add leftMax - height[i] and move i right.
- Otherwise, do the same from the right side using rightMax.

Why is that safe? We always process the side with the smaller current bar, and the opposite side is guaranteed to have a wall at least that tall. So the min(leftMax, rightMax) needed at that position is exactly the max on our own side.

A third approach uses a monotonic stack and fills the water layer by layer as "valleys" close.

This is one of the most famous interview problems. Explaining the precompute version first and then optimizing it is a great way to present it.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Largest Rectangle in Histogram', fn: 'largestRectangleArea', args: ['heights'],
      prompt: 'heights are the bar heights of a histogram (each bar width 1). Return the area of the largest rectangle that fits inside it.',
      tests: [[[[2, 1, 5, 6, 2, 3]], 10], [[[2, 4]], 4], [[[]], 0], [[[1]], 1], [[[2, 2, 2, 2]], 8], [[[6, 2, 5, 4, 5, 1, 6]], 12], [[[1, 2, 3, 4, 5]], 9]],
      js: String.raw`function largestRectangleArea(heights) {
  const stack = []; // indices with increasing heights
  let best = 0;
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i]; // sentinel 0 flushes the stack
    while (stack.length && heights[stack[stack.length - 1]] >= h) {
      const height = heights[stack.pop()];
      const left = stack.length ? stack[stack.length - 1] : -1; // first smaller bar on the left
      best = Math.max(best, height * (i - left - 1)); // i is the first smaller bar on the right
    }
    stack.push(i);
  }
  return best;
}`,
      py: String.raw`def largest_rectangle_area(heights):
    stack = []
    best = 0
    for i in range(len(heights) + 1):
        h = 0 if i == len(heights) else heights[i]
        while stack and heights[stack[-1]] >= h:
            height = heights[stack.pop()]
            left = stack[-1] if stack else -1
            best = max(best, height * (i - left - 1))
        stack.append(i)
    return best`,
      explain: `For each bar, the widest rectangle using that bar's full height extends left and right until it meets a shorter bar. If you knew the previous smaller bar and the next smaller bar for every index, the area would be height × (next - prev - 1).

A monotonic increasing stack finds both in one pass:
- Keep indices whose heights increase from bottom to top.
- When a bar of height h arrives that is at most the top's height, the top bar has found its next smaller bar (i). Its previous smaller bar is the element just below it in the stack. Pop it and compute its area.
- Push i.

A final sentinel bar of height 0 forces every remaining bar to be popped and measured.

[2, 1, 5, 6, 2, 3]: when the 2 at index 4 arrives, it pops 6 (area 6 × 1) and 5 (area 5 × 2 = 10, the answer).

This is the same structure as Daily Temperatures and Next Greater Element, applied to "smaller" in both directions.

Maximal Rectangle (later in this module) runs this algorithm on every row of a matrix.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Sliding Window Maximum', fn: 'maxSlidingWindow', args: ['nums', 'k'],
      prompt: 'Return the maximum of every contiguous window of size k as it slides from left to right, in O(n).',
      tests: [[[[1, 3, -1, -3, 5, 3, 6, 7], 3], [3, 3, 5, 5, 6, 7]], [[[1], 1], [1]], [[[1, -1], 1], [1, -1]], [[[9, 8, 7, 6], 2], [9, 8, 7]], [[[1, 2, 3, 4], 4], [4]], [[[4, 4, 4], 2], [4, 4]]],
      js: String.raw`function maxSlidingWindow(nums, k) {
  const dq = []; // indices; their values decrease from front to back
  let head = 0; // front of the deque (avoids O(n) shift)
  const out = [];
  for (let i = 0; i < nums.length; i++) {
    if (head < dq.length && dq[head] <= i - k) head++; // front left the window
    while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i]) dq.pop(); // smaller ones are useless now
    dq.push(i);
    if (i >= k - 1) out.push(nums[dq[head]]);
  }
  return out;
}`,
      py: String.raw`from collections import deque

def max_sliding_window(nums, k):
    dq = deque()
    out = []
    for i, x in enumerate(nums):
        if dq and dq[0] <= i - k:
            dq.popleft()
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out`,
      explain: `The monotonic deque is the classic tool for "max or min of every window".

Keep a deque of indices whose values are decreasing from front to back. The front is always the maximum of the current window.

For each new index i:
1. Drop the front if it has slid out of the window (index ≤ i - k).
2. Pop from the back every index whose value is ≤ nums[i]. They can never be a window maximum again: nums[i] is at least as large and will stay in the window longer.
3. Push i.
4. Once the first full window exists, record the front value.

Each index is pushed and popped at most once, so the total is O(n), even though the inner loop can pop several at a time.

Compare: a heap gives O(n log k) with lazy deletion, and brute force is O(n × k).

In the JavaScript version, a head pointer stands in for popleft, so the front removal is O(1).

The same deque idea powers Shortest Subarray with Sum at Least K (the last challenge here), "constrained subsequence sum", and the DP optimizations known as "monotone queue optimization".`,
      complexity: 'O(n) time, O(k) space',
    },
    {
      title: 'First Missing Positive', fn: 'firstMissingPositive', args: ['nums'],
      prompt: 'Return the smallest positive integer not present in the unsorted array nums, in O(n) time and O(1) extra space.',
      tests: [[[[1, 2, 0]], 3], [[[3, 4, -1, 1]], 2], [[[7, 8, 9, 11, 12]], 1], [[[]], 1], [[[1]], 2], [[[1, 1]], 2], [[[2, 1]], 3]],
      js: String.raw`function firstMissingPositive(nums) {
  const a = nums.slice(), n = a.length;
  // place each value v in 1..n at index v-1
  for (let i = 0; i < n; i++) {
    while (a[i] >= 1 && a[i] <= n && a[a[i] - 1] !== a[i]) {
      const j = a[i] - 1;
      [a[i], a[j]] = [a[j], a[i]];
    }
  }
  for (let i = 0; i < n; i++) if (a[i] !== i + 1) return i + 1;
  return n + 1;
}`,
      py: String.raw`def first_missing_positive(nums):
    a = nums[:]
    n = len(a)
    for i in range(n):
        while 1 <= a[i] <= n and a[a[i] - 1] != a[i]:
            j = a[i] - 1
            a[i], a[j] = a[j], a[i]
    for i in range(n):
        if a[i] != i + 1:
            return i + 1
    return n + 1`,
      explain: `Observation: the answer is always between 1 and n + 1. With n numbers you can fill at most 1..n, so only values in that range matter.

Cyclic placement: use the array itself as a hash table, where value v belongs at index v - 1.
1. For each position, while it holds a value v in 1..n that is not already at its home index, swap it there.
2. Scan again. The first index i where a[i] is not i + 1 means i + 1 is missing.
3. If every position holds its value, the answer is n + 1.

The duplicate check a[v - 1] !== v prevents an infinite loop: with [1, 1], the second 1 sees that its home already holds a 1, so it stops.

Why is it O(n)? Every swap puts at least one value into its final home, and that value never moves again, so there are at most n swaps in total.

The solution copies the input, which keeps the tests clean. An in-place version would meet the O(1) space requirement exactly.

Another O(1)-space trick: use signs as markers. Replace values outside 1..n with n + 1, then for each value v make a[v - 1] negative. The first positive index tells you the answer.`,
      complexity: 'O(n) time, O(1) extra space (in place)',
    },
    {
      title: 'Median of Two Sorted Arrays', fn: 'findMedianSortedArrays', args: ['a', 'b'],
      prompt: 'Given two sorted arrays, return the median of all their elements combined in O(log(min(m, n))) time.',
      compare: 'float',
      tests: [[[[1, 3], [2]], 2], [[[1, 2], [3, 4]], 2.5], [[[], [1]], 1], [[[2], []], 2], [[[1, 3, 8, 9, 15], [7, 11, 18, 19, 21, 25]], 11], [[[0, 0], [0, 0]], 0], [[[1, 2, 3, 4, 5], [6, 7, 8, 9]], 5]],
      js: String.raw`function findMedianSortedArrays(a, b) {
  if (a.length > b.length) [a, b] = [b, a]; // binary search the shorter array
  const m = a.length, n = b.length, half = (m + n + 1) >> 1;
  let lo = 0, hi = m;
  while (lo <= hi) {
    const i = (lo + hi) >> 1; // elements taken from a for the left half
    const j = half - i; // elements taken from b
    const aL = i > 0 ? a[i - 1] : -Infinity, aR = i < m ? a[i] : Infinity;
    const bL = j > 0 ? b[j - 1] : -Infinity, bR = j < n ? b[j] : Infinity;
    if (aL <= bR && bL <= aR) {
      const leftMax = Math.max(aL, bL);
      if ((m + n) % 2) return leftMax;
      return (leftMax + Math.min(aR, bR)) / 2;
    }
    if (aL > bR) hi = i - 1; // took too many from a
    else lo = i + 1;
  }
  return 0;
}`,
      py: String.raw`def find_median_sorted_arrays(a, b):
    if len(a) > len(b):
        a, b = b, a
    m, n = len(a), len(b)
    half = (m + n + 1) // 2
    lo, hi = 0, m
    INF = float("inf")
    while lo <= hi:
        i = (lo + hi) // 2
        j = half - i
        a_l = a[i - 1] if i > 0 else -INF
        a_r = a[i] if i < m else INF
        b_l = b[j - 1] if j > 0 else -INF
        b_r = b[j] if j < n else INF
        if a_l <= b_r and b_l <= a_r:
            left_max = max(a_l, b_l)
            if (m + n) % 2:
                return left_max
            return (left_max + min(a_r, b_r)) / 2
        if a_l > b_r:
            hi = i - 1
        else:
            lo = i + 1
    return 0`,
      explain: `Merging the arrays is O(m + n). The O(log) solution binary searches for a partition instead.

The goal: split both arrays into left and right parts so that
1. the left parts together hold half the elements (rounded up), and
2. every element on the left is ≤ every element on the right.
Then the median comes from the boundary values.

If you take i elements from a, you must take j = half - i from b. Only i needs searching. The partition is valid when:
- aL ≤ bR (a's last left element ≤ b's first right element), and
- bL ≤ aR.

If aL > bR, too many came from a, so move i left. Otherwise move it right.

Once the partition is valid:
- odd total: the median is max(aL, bL);
- even total: (max(aL, bL) + min(aR, bR)) / 2.

Infinity sentinels handle partitions at the very edges (taking none or all of an array).

Search the shorter array, so that j stays within range and the cost is O(log min(m, n)).

This is one of the hardest standard binary-search problems. The key move is searching over the partition position rather than over values.`,
      complexity: 'O(log min(m, n)) time, O(1) space',
    },
    {
      title: 'Count of Smaller Numbers After Self', fn: 'countSmaller', args: ['nums'],
      prompt: 'Return an array where counts[i] is how many elements to the right of nums[i] are strictly smaller than it, in O(n log n).',
      tests: [[[[5, 2, 6, 1]], [2, 1, 1, 0]], [[[-1]], [0]], [[[-1, -1]], [0, 0]], [[[]], []], [[[1, 2, 3]], [0, 0, 0]], [[[3, 2, 1]], [2, 1, 0]], [[[2, 0, 1]], [2, 0, 0]]],
      js: String.raw`function countSmaller(nums) {
  const n = nums.length, counts = new Array(n).fill(0);
  let idx = nums.map((_, i) => i);
  // merge sort on indices; when a right-half element is placed before a left one, it is smaller
  const sort = (lo, hi) => {
    if (hi - lo <= 1) return;
    const mid = (lo + hi) >> 1;
    sort(lo, mid);
    sort(mid, hi);
    const merged = [];
    let i = lo, j = mid, movedRight = 0;
    while (i < mid || j < hi) {
      if (j === hi || (i < mid && nums[idx[i]] <= nums[idx[j]])) {
        counts[idx[i]] += movedRight; // all right elements placed so far are smaller
        merged.push(idx[i++]);
      } else {
        movedRight++;
        merged.push(idx[j++]);
      }
    }
    for (let k = 0; k < merged.length; k++) idx[lo + k] = merged[k];
  };
  sort(0, n);
  return counts;
}`,
      py: String.raw`def count_smaller(nums):
    n = len(nums)
    counts = [0] * n
    idx = list(range(n))
    def sort(lo, hi):
        if hi - lo <= 1:
            return
        mid = (lo + hi) // 2
        sort(lo, mid)
        sort(mid, hi)
        merged = []
        i, j, moved = lo, mid, 0
        while i < mid or j < hi:
            if j == hi or (i < mid and nums[idx[i]] <= nums[idx[j]]):
                counts[idx[i]] += moved
                merged.append(idx[i])
                i += 1
            else:
                moved += 1
                merged.append(idx[j])
                j += 1
        idx[lo:hi] = merged
    sort(0, n)
    return counts`,
      explain: `Brute force is O(n²). Merge sort can count "smaller elements to the right" as it merges.

During the merge of a left half and a right half (both already sorted):
- When an element from the right half is placed before left-half elements, it is smaller than all of them, and it was originally to their right.
- So keep a counter movedRight of how many right-half elements have been placed. Each time you place a left-half element, every right element placed so far is smaller and to its right, so add movedRight to its count.

Sort indices rather than values, so counts can be credited to the original positions.

Ties: using <= places equal left elements first, so equal values are not counted as smaller. The problem asks for strictly smaller.

Every pair (i, j) with i < j is in different halves exactly once, at the level where they get separated, so every inversion is counted exactly once.

Alternatives: a Fenwick tree (binary indexed tree) over value ranks, scanning from the right. "Count inversions" is the same technique summed into one number.`,
      complexity: 'O(n log n) time, O(n) space',
    },
    {
      title: 'Subarrays with K Different Integers', fn: 'subarraysWithKDistinct', args: ['nums', 'k'],
      prompt: 'Return the number of contiguous subarrays that contain exactly k distinct integers.',
      tests: [[[[1, 2, 1, 2, 3], 2], 7], [[[1, 2, 1, 3, 4], 3], 3], [[[1, 1, 1], 1], 6], [[[1, 2], 3], 0], [[[1, 2, 3], 1], 3], [[[2, 1, 1, 1, 2], 1], 8]],
      js: String.raw`function subarraysWithKDistinct(nums, k) {
  // exactly(k) = atMost(k) - atMost(k - 1)
  const atMost = (K) => {
    const count = new Map();
    let left = 0, total = 0;
    for (let right = 0; right < nums.length; right++) {
      count.set(nums[right], (count.get(nums[right]) || 0) + 1);
      while (count.size > K) {
        const x = nums[left++];
        count.set(x, count.get(x) - 1);
        if (count.get(x) === 0) count.delete(x);
      }
      total += right - left + 1; // windows ending at right
    }
    return total;
  };
  return atMost(k) - atMost(k - 1);
}`,
      py: String.raw`def subarrays_with_k_distinct(nums, k):
    def at_most(K):
        count = {}
        left = total = 0
        for right, x in enumerate(nums):
            count[x] = count.get(x, 0) + 1
            while len(count) > K:
                y = nums[left]
                count[y] -= 1
                if count[y] == 0:
                    del count[y]
                left += 1
            total += right - left + 1
        return total
    return at_most(k) - at_most(k - 1)`,
      explain: `A sliding window naturally counts subarrays with at most K distinct values. Exactly K is harder, because when the window shrinks, some subarrays inside it might have fewer than K distinct values.

Trick: exactly(K) = atMost(K) - atMost(K - 1).

atMost(K) is the Fruit Into Baskets window combined with the counting idea from Product Less Than K:
1. Extend right and add the value to the frequency map.
2. While more than K distinct values are present, shrink from the left.
3. Every subarray ending at right and starting anywhere in [left, right] has at most K distinct values, so add right - left + 1.

Subtracting the at-most-(K - 1) count removes the subarrays with fewer than K distinct values, leaving exactly K.

[1, 2, 1, 2, 3] with K = 2: atMost(2) = 12 and atMost(1) = 5, so the answer is 7.

This exactly = atMost(K) - atMost(K - 1) identity also solves "count subarrays with exactly K odd numbers" and "binary subarrays with sum S". Whenever exact counting with one window is awkward, try it.`,
      complexity: 'O(n) time, O(k) space',
    },
    {
      title: 'Maximal Rectangle', fn: 'maximalRectangle', args: ['matrix'],
      prompt: 'matrix contains "0" and "1". Return the area of the largest rectangle containing only 1s.',
      tests: [[[[['1', '0', '1', '0', '0'], ['1', '0', '1', '1', '1'], ['1', '1', '1', '1', '1'], ['1', '0', '0', '1', '0']]], 6], [[[['0']]], 0], [[[['1']]], 1], [[[['1', '1'], ['1', '1']]], 4], [[[['0', '1'], ['1', '0']]], 1], [[[['1', '1', '1', '1'], ['1', '1', '1', '0']]], 6]],
      js: String.raw`function maximalRectangle(matrix) {
  if (!matrix.length) return 0;
  const C = matrix[0].length;
  const h = new Array(C).fill(0); // histogram of consecutive 1s ending at this row
  let best = 0;
  const largest = (heights) => {
    const st = [];
    let area = 0;
    for (let i = 0; i <= heights.length; i++) {
      const cur = i === heights.length ? 0 : heights[i];
      while (st.length && heights[st[st.length - 1]] >= cur) {
        const ht = heights[st.pop()];
        const left = st.length ? st[st.length - 1] : -1;
        area = Math.max(area, ht * (i - left - 1));
      }
      st.push(i);
    }
    return area;
  };
  for (const row of matrix) {
    for (let j = 0; j < C; j++) h[j] = row[j] === '1' ? h[j] + 1 : 0;
    best = Math.max(best, largest(h));
  }
  return best;
}`,
      py: String.raw`def maximal_rectangle(matrix):
    if not matrix:
        return 0
    C = len(matrix[0])
    h = [0] * C
    def largest(heights):
        st, area = [], 0
        for i in range(len(heights) + 1):
            cur = 0 if i == len(heights) else heights[i]
            while st and heights[st[-1]] >= cur:
                ht = heights[st.pop()]
                left = st[-1] if st else -1
                area = max(area, ht * (i - left - 1))
            st.append(i)
        return area
    best = 0
    for row in matrix:
        for j in range(C):
            h[j] = h[j] + 1 if row[j] == "1" else 0
        best = max(best, largest(h))
    return best`,
      explain: `Reduce the 2D problem to the 1D Largest Rectangle in Histogram, solved once per row.

Treat each row as the floor of a histogram. h[j] = the number of consecutive 1s ending at this row in column j: it grows by 1 on a "1" and resets to 0 on a "0".

Any all-1s rectangle has a bottom row. On that row's histogram, the rectangle is exactly a rectangle under the bars. So:
1. For each row, update the histogram (O(C)).
2. Run the monotonic-stack largest-rectangle algorithm on it (O(C)).
3. Keep the best area.

That is O(R × C) overall, which is optimal because you have to read every cell.

Compare it with Maximal Square, which has a simpler DP. Rectangles need the histogram trick because their width and height vary independently.

Building on an earlier solution (here, reusing Largest Rectangle in Histogram) is how most hard problems are actually solved.`,
      complexity: 'O(R·C) time, O(C) space',
    },
    {
      title: 'Longest Increasing Path in a Matrix', fn: 'longestIncreasingPath', args: ['matrix'],
      prompt: 'Return the length of the longest strictly increasing path in the matrix, moving up, down, left or right.',
      tests: [[[[[9, 9, 4], [6, 6, 8], [2, 1, 1]]], 4], [[[[3, 4, 5], [3, 2, 6], [2, 2, 1]]], 4], [[[[1]]], 1], [[[[1, 2], [4, 3]]], 4], [[[[7, 7], [7, 7]]], 1]],
      js: String.raw`function longestIncreasingPath(matrix) {
  const R = matrix.length, C = matrix[0].length;
  const memo = Array.from({ length: R }, () => new Array(C).fill(0));
  const dfs = (r, c) => {
    if (memo[r][c]) return memo[r][c];
    let best = 1;
    for (const [a, b] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (a >= 0 && a < R && b >= 0 && b < C && matrix[a][b] > matrix[r][c]) {
        best = Math.max(best, 1 + dfs(a, b));
      }
    }
    return (memo[r][c] = best);
  };
  let ans = 0;
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) ans = Math.max(ans, dfs(r, c));
  return ans;
}`,
      py: String.raw`def longest_increasing_path(matrix):
    R, C = len(matrix), len(matrix[0])
    memo = [[0] * C for _ in range(R)]
    def dfs(r, c):
        if memo[r][c]:
            return memo[r][c]
        best = 1
        for a, b in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= a < R and 0 <= b < C and matrix[a][b] > matrix[r][c]:
                best = max(best, 1 + dfs(a, b))
        memo[r][c] = best
        return best
    return max(dfs(r, c) for r in range(R) for c in range(C))`,
      explain: `This is DFS with memoization on an implicit DAG.

Draw an edge from each cell to every strictly larger neighbor. Because the values strictly increase along every edge, there can be no cycles: the grid is a directed acyclic graph. On a DAG, the longest path can be computed with DP.

dfs(r, c) = the longest increasing path starting at (r, c) = 1 + the max of dfs over its larger neighbors, or 1 if there are none.

Memoize: each cell's answer never changes, so compute it once. With R × C cells and 4 neighbors each, the total is O(R × C).

No visited set is needed. Strictly increasing steps can never lead back to a cell already on the current path, so the acyclic structure guarantees termination.

Alternatively, a topological sort (Kahn's BFS, peeling cells in order of value) gives the longest path as the number of BFS layers.

Spotting that the moves form a DAG is the key. Once you see it, "longest path" stops being a hard problem.`,
      complexity: 'O(R·C) time and space',
    },
    {
      title: 'Shortest Subarray with Sum at Least K', fn: 'shortestSubarray', args: ['nums', 'k'],
      prompt: 'Return the length of the shortest non-empty contiguous subarray with sum at least k, or -1. nums may contain negative numbers.',
      tests: [[[[1], 1], 1], [[[1, 2], 4], -1], [[[2, -1, 2], 3], 3], [[[84, -37, 32, 40, 95], 167], 3], [[[-28, 81, -20, 28, -29], 89], 3], [[[1, 1, 1, 1], 2], 2]],
      js: String.raw`function shortestSubarray(nums, k) {
  const n = nums.length;
  const prefix = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];
  const dq = []; // indices with increasing prefix sums
  let head = 0, best = Infinity;
  for (let j = 0; j <= n; j++) {
    // the front can pair with j: record and drop it (later j would only be longer)
    while (head < dq.length && prefix[j] - prefix[dq[head]] >= k) best = Math.min(best, j - dq[head++]);
    // a larger-or-equal prefix behind j is never a better start than j
    while (dq.length > head && prefix[dq[dq.length - 1]] >= prefix[j]) dq.pop();
    dq.push(j);
  }
  return best === Infinity ? -1 : best;
}`,
      py: String.raw`from collections import deque

def shortest_subarray(nums, k):
    prefix = [0]
    for x in nums:
        prefix.append(prefix[-1] + x)
    dq = deque()
    best = float("inf")
    for j, p in enumerate(prefix):
        while dq and p - prefix[dq[0]] >= k:
            best = min(best, j - dq.popleft())
        while dq and prefix[dq[-1]] >= p:
            dq.pop()
        dq.append(j)
    return -1 if best == float("inf") else best`,
      explain: `With negative numbers the simple sliding window breaks: growing the window can lower the sum. Use prefix sums and a monotonic deque instead.

The subarray (i, j] has sum P[j] - P[i]. For each end j, we want the largest i with P[i] ≤ P[j] - k.

The deque holds candidate start indices with increasing prefix sums:
1. Front check: while P[j] - P[front] ≥ k, the front is a valid start. Record the length, then pop it. Any later j would give it a longer subarray, so it is no longer useful.
2. Back cleanup: pop every index whose prefix is ≥ P[j]. j is a later start with a smaller or equal prefix, so it is always at least as good, giving a shorter subarray and a bigger sum.
3. Push j.

Each index enters and leaves at most once, so it is O(n).

Why it works: an index is only discarded when it can never again produce a better answer. Both pop rules are such dominance arguments.

This combines Sliding Window Maximum's deque with Subarray Sum Equals K's prefix sums, two earlier tools put together for a harder problem.`,
      complexity: 'O(n) time, O(n) space',
    },
  ],
};

export default m;
