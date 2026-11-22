import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'dp',
  title: 'DP Warm-ups',
  description: 'The entry-level dynamic programming questions: stairs, robbers, grids and triangles.',
  challenges: [
    {
      title: 'Climbing Stairs', fn: 'climbStairs', args: ['n'],
      prompt: 'You climb a staircase of n steps, taking 1 or 2 steps at a time. Return how many distinct ways there are to reach the top.',
      tests: [[[1], 1], [[2], 2], [[3], 3], [[5], 8], [[10], 89], [[45], 1836311903]],
      js: String.raw`function climbStairs(n) {
  let a = 1, b = 1; // ways to reach step i-2 and i-1
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}`,
      py: String.raw`def climb_stairs(n):
    a, b = 1, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b`,
      explain: `This is the "hello world" of dynamic programming.

Think about the last move. To stand on step n, you either came from step n - 1 (a 1-step) or from step n - 2 (a 2-step). Those are disjoint options, so:
ways(n) = ways(n - 1) + ways(n - 2)

Base cases: ways(0) = 1 (doing nothing) and ways(1) = 1.

That is the Fibonacci recurrence, so keep only the last two values, exactly as in Easy's Fibonacci challenge.

How to find a DP recurrence:
1. Define the state (here, the number of ways to reach step i).
2. Ask "what was the last decision?" (a 1-step or a 2-step).
3. Sum (for counting) or min/max (for optimizing) over the options.

Variations: steps of {1, 2, 3} add a third term, and a set of allowed step sizes S gives ways(n) = the sum of ways(n - s) over s in S. Counting with forbidden steps just zeroes those entries.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'House Robber', fn: 'rob', args: ['nums'],
      prompt: 'Houses along a street hold nums[i] money. You cannot rob two adjacent houses. Return the maximum amount you can rob.',
      tests: [[[[1, 2, 3, 1]], 4], [[[2, 7, 9, 3, 1]], 12], [[[]], 0], [[[5]], 5], [[[2, 1, 1, 2]], 4], [[[10, 1, 1, 10]], 20]],
      js: String.raw`function rob(nums) {
  let prev2 = 0, prev1 = 0; // best up to i-2, best up to i-1
  for (const x of nums) [prev2, prev1] = [prev1, Math.max(prev1, prev2 + x)]; // skip i, or rob i
  return prev1;
}`,
      py: String.raw`def rob(nums):
    prev2 = prev1 = 0
    for x in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1`,
      explain: `For each house there are two choices:
- skip it: keep the best total up to the previous house, best(i - 1);
- rob it: you cannot have robbed the previous house, so best(i - 2) + nums[i].

best(i) = max(best(i - 1), best(i - 2) + nums[i])

Only the last two values matter, so it uses O(1) space.

Greedy approaches such as "take every other house" or "always take the biggest" fail. [2, 1, 1, 2] is best robbed at houses 0 and 3 (total 4), which is neither alternating pattern. [10, 1, 1, 10] gives 20 the same way.

This "take it or skip it, with a gap constraint" pattern is everywhere: scheduling non-adjacent tasks, Delete and Earn (later in this module), and maximum independent set on paths and trees (House Robber III on a binary tree returns the pair (rob this node, skip this node)).

The circular version (House Robber II) is in Hard DP I.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Min Cost Climbing Stairs', fn: 'minCostClimbingStairs', args: ['cost'],
      prompt: 'cost[i] is the price of stepping on stair i. You may start on stair 0 or 1, and from any stair climb 1 or 2 steps. Return the minimum cost to reach the top (just past the last stair).',
      tests: [[[[10, 15, 20]], 15], [[[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]], 6], [[[0, 0]], 0], [[[5, 1]], 1], [[[1, 2, 3]], 2]],
      js: String.raw`function minCostClimbingStairs(cost) {
  // a, b = cheapest way to stand on the previous two positions
  let a = 0, b = 0;
  for (let i = 2; i <= cost.length; i++) [a, b] = [b, Math.min(b + cost[i - 1], a + cost[i - 2])];
  return b;
}`,
      py: String.raw`def min_cost_climbing_stairs(cost):
    a = b = 0
    for i in range(2, len(cost) + 1):
        a, b = b, min(b + cost[i - 1], a + cost[i - 2])
    return b`,
      explain: `This is Climbing Stairs, but minimizing a cost instead of counting ways.

Let top(i) = the cheapest cost to arrive at position i, where position n is the top. You arrive at i from:
- position i - 1, paying cost[i - 1] to step off it,
- position i - 2, paying cost[i - 2].

top(i) = min(top(i - 1) + cost[i - 1], top(i - 2) + cost[i - 2])

Base: top(0) = top(1) = 0, because you may start on either stair for free.

[10, 15, 20]: start on stair 1 (15) and jump straight to the top, for a total of 15.

The modeling detail that trips people up is what "the top" means. It is the position after the last stair, which is why the loop runs up to and including cost.length.

This is a good reminder to define your DP state precisely in words before writing code: "top(i) = the minimum total paid to be standing at position i".`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Unique Paths', fn: 'uniquePaths', args: ['m', 'n'],
      prompt: 'A robot on an m×n grid starts at the top-left and can only move right or down. Return the number of distinct paths to the bottom-right.',
      tests: [[[3, 7], 28], [[3, 2], 3], [[1, 1], 1], [[1, 10], 1], [[7, 3], 28], [[10, 10], 48620]],
      js: String.raw`function uniquePaths(m, n) {
  const row = new Array(n).fill(1); // first row: one way to each cell
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) row[j] += row[j - 1]; // from above + from the left
  }
  return row[n - 1];
}`,
      py: String.raw`def unique_paths(m, n):
    row = [1] * n
    for _ in range(1, m):
        for j in range(1, n):
            row[j] += row[j - 1]
    return row[-1]`,
      explain: `paths(r, c) = paths(r - 1, c) + paths(r, c - 1), because you arrive from above or from the left. The first row and the first column have exactly 1 path each (a straight line).

Rolling row: one array holds the current row. Before the update, row[j] is the value from above, and row[j - 1] is the already-updated value to the left, so row[j] += row[j - 1] does the whole recurrence. That is the same trick as Unique Paths with Obstacles in Hard.

Closed form: every path is a sequence of (m - 1) downs and (n - 1) rights in some order. Choose where the downs go: C(m + n - 2, m - 1). For 3 × 7 that is C(8, 2) = 28.

Knowing both is worth it. The DP extends to obstacles, costs and other movement rules, while the formula is O(min(m, n)) and makes a nice interview bonus.

The grid is symmetric: m × n and n × m give the same answer.`,
      complexity: 'O(m·n) time, O(n) space (O(min) with the formula)',
    },
    {
      title: "Pascal's Triangle", fn: 'generatePascal', args: ['numRows'],
      prompt: 'Return the first numRows rows of Pascal\'s triangle. Each number is the sum of the two numbers directly above it.',
      tests: [[[5], [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]]], [[1], [[1]]], [[0], []], [[2], [[1], [1, 1]]]],
      js: String.raw`function generatePascal(numRows) {
  const rows = [];
  for (let r = 0; r < numRows; r++) {
    const row = new Array(r + 1).fill(1);
    for (let j = 1; j < r; j++) row[j] = rows[r - 1][j - 1] + rows[r - 1][j];
    rows.push(row);
  }
  return rows;
}`,
      py: String.raw`def generate_pascal(num_rows):
    rows = []
    for r in range(num_rows):
        row = [1] * (r + 1)
        for j in range(1, r):
            row[j] = rows[r - 1][j - 1] + rows[r - 1][j]
        rows.append(row)
    return rows`,
      explain: `Each row starts and ends with 1. Every inner element is the sum of the two elements above it:
row[r][j] = row[r-1][j-1] + row[r-1][j]

1. Create row r with r + 1 ones.
2. Fill in positions 1 to r - 1 from the previous row.

This is DP in its most visible form: every value is built from smaller subproblems that are already computed.

The numbers are binomial coefficients: row r, position j is C(r, j), the number of ways to choose j items from r. That is why Unique Paths' closed form is an entry in this triangle.

Related facts:
- row r sums to 2^r (the number of subsets);
- to get a single row (Pascal's Triangle II), update one array right to left, so values are not overwritten before they are used;
- C(n, k) = C(n, k-1) × (n - k + 1) / k computes one entry directly.`,
      complexity: 'O(numRows²) time and space (the output size)',
    },
    {
      title: 'Triangle Minimum Path', fn: 'minimumTotal', args: ['triangle'],
      prompt: 'Find the minimum path sum from the top of the triangle to the bottom. From index j on one row you may move to index j or j + 1 on the next row.',
      tests: [[[[[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]], 11], [[[[-10]]], -10], [[[[1], [2, 3]]], 3], [[[[-1], [2, 3], [1, -1, -3]]], -1]],
      js: String.raw`function minimumTotal(triangle) {
  // bottom-up: best[j] = min path sum from (row, j) down to the bottom
  const best = triangle[triangle.length - 1].slice();
  for (let r = triangle.length - 2; r >= 0; r--) {
    for (let j = 0; j <= r; j++) best[j] = triangle[r][j] + Math.min(best[j], best[j + 1]);
  }
  return best[0];
}`,
      py: String.raw`def minimum_total(triangle):
    best = triangle[-1][:]
    for r in range(len(triangle) - 2, -1, -1):
        for j in range(r + 1):
            best[j] = triangle[r][j] + min(best[j], best[j + 1])
    return best[0]`,
      explain: `Top-down DP works, but the bottom row creates many edge cases (positions with only one parent). Going bottom-up is cleaner.

best[j] = the minimum path sum from position (r, j) down to the bottom.
- Start with best = the bottom row itself.
- Moving up a row: best[j] = triangle[r][j] + min(best[j], best[j + 1]), the cheaper of the two children.
- At the top, best[0] is the answer.

Why bottom-up is nicer: every cell has exactly two children below it, so there are no boundary checks, and the answer ends up in a single cell instead of needing a min over the whole last row.

The single array is overwritten in place: best[j] is updated left to right, and best[j + 1] is still the old value from the row below when you read it, which is exactly what you need.

The greedy "always step to the smaller child" fails: a small number now can lead to huge numbers later. The test [[-1], [2, 3], [1, -1, -3]] shows that going right (3, then -3) beats going left.`,
      complexity: 'O(n²) time for n rows, O(n) space',
    },
    {
      title: 'Minimum Path Sum', fn: 'minPathSum', args: ['grid'],
      prompt: 'Find a path from the top-left to the bottom-right of a grid of non-negative numbers, moving only right or down, that minimizes the sum of the numbers along it. Return that sum.',
      tests: [[[[[1, 3, 1], [1, 5, 1], [4, 2, 1]]], 7], [[[[1, 2, 3], [4, 5, 6]]], 12], [[[[5]]], 5], [[[[1, 2], [1, 1]]], 3], [[[[0, 0, 0], [0, 0, 0]]], 0]],
      js: String.raw`function minPathSum(grid) {
  const R = grid.length, C = grid[0].length;
  const dp = new Array(C).fill(Infinity);
  dp[0] = 0;
  for (let r = 0; r < R; r++) {
    dp[0] += grid[r][0]; // first column: only from above
    for (let c = 1; c < C; c++) dp[c] = grid[r][c] + Math.min(dp[c], dp[c - 1]); // above vs left
  }
  return dp[C - 1];
}`,
      py: String.raw`def min_path_sum(grid):
    R, C = len(grid), len(grid[0])
    dp = [float("inf")] * C
    dp[0] = 0
    for r in range(R):
        dp[0] += grid[r][0]
        for c in range(1, C):
            dp[c] = grid[r][c] + min(dp[c], dp[c - 1])
    return dp[-1]`,
      explain: `This has the same grid shape as Unique Paths, but takes a minimum instead of a sum.

dp(r, c) = grid[r][c] + min(dp(r - 1, c), dp(r, c - 1))

Rolling row:
- dp[c] before the update holds the value from the row above;
- dp[c - 1] has already been updated, so it is the cell to the left.

Initializing the first row to Infinity, except dp[0] = 0, makes the first row work without special cases: from above is infinite, so the left neighbor always wins.

The first column has no left neighbor, so it only accumulates from above (dp[0] += ...).

[[1, 3, 1], [1, 5, 1], [4, 2, 1]]: the best path is 1 → 3 → 1 → 1 → 1, total 7.

If moves could go in all 4 directions, the grid would be a general graph with non-negative weights, and you would use Dijkstra instead of this DP. The right/down restriction is what makes the grid a DAG with an obvious fill order.`,
      complexity: 'O(R·C) time, O(C) space',
    },
    {
      title: 'Perfect Squares', fn: 'numSquares', args: ['n'],
      prompt: 'Return the least number of perfect square numbers (1, 4, 9, 16, ...) that sum to n.',
      tests: [[[12], 3], [[13], 2], [[1], 1], [[4], 1], [[7], 4], [[43], 3], [[100], 1]],
      js: String.raw`function numSquares(n) {
  const dp = new Array(n + 1).fill(Infinity); // dp[i] = fewest squares summing to i
  dp[0] = 0;
  for (let i = 1; i <= n; i++) {
    for (let s = 1; s * s <= i; s++) dp[i] = Math.min(dp[i], dp[i - s * s] + 1);
  }
  return dp[n];
}`,
      py: String.raw`def num_squares(n):
    dp = [0] + [float("inf")] * n
    for i in range(1, n + 1):
        s = 1
        while s * s <= i:
            dp[i] = min(dp[i], dp[i - s * s] + 1)
            s += 1
    return dp[n]`,
      explain: `This is Coin Change where the coins are the perfect squares up to n.

dp[i] = the fewest squares that sum to i = 1 + min(dp[i - s²]) over every square s² ≤ i.

12: dp[12] = 1 + min(dp[11], dp[8], dp[3]) = 1 + dp[8] = 1 + 2 = 3 (4 + 4 + 4). Greedy fails here: 9 + 1 + 1 + 1 uses 4 squares.

Each i tries about √i squares, so the total is O(n√n).

Number-theory bonus (a great interview remark):
- Lagrange's four-square theorem: every number is a sum of at most 4 squares.
- Legendre: the answer is exactly 4 when n has the form 4^a × (8b + 7). 7 is the smallest example.
- Otherwise, check for 1 (n is a perfect square) or 2 (n = a² + b²), and if neither, it is 3.

That gives an O(√n) solution. The DP is what interviewers expect, but mentioning the math can impress.`,
      complexity: 'O(n√n) time, O(n) space',
    },
    {
      title: 'Integer Break', fn: 'integerBreak', args: ['n'],
      prompt: 'Break the integer n (n ≥ 2) into the sum of at least two positive integers and maximize their product. Return that maximum product.',
      tests: [[[2], 1], [[3], 2], [[4], 4], [[10], 36], [[8], 18], [[58], 1549681956]],
      js: String.raw`function integerBreak(n) {
  // dp[i] = best product for i when it MAY stay whole (used as a part)
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    for (let j = 1; j < i; j++) {
      // split off j; the rest is either kept whole (i - j) or broken further (dp[i - j])
      dp[i] = Math.max(dp[i], j * Math.max(i - j, dp[i - j]));
    }
  }
  return dp[n];
}`,
      py: String.raw`def integer_break(n):
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        for j in range(1, i):
            dp[i] = max(dp[i], j * max(i - j, dp[i - j]))
    return dp[n]`,
      explain: `DP view: dp[i] = the best product from breaking i into at least two parts.

For the first piece j, the remainder i - j can either:
- stay whole: j × (i - j), or
- be broken further: j × dp[i - j].

dp[i] = max over j of j × max(i - j, dp[i - j]).

The inner max is needed because breaking is not always better. For the remainder 3, keeping 3 (product 3) beats breaking it into 1 + 2 (product 2).

That is O(n²). The math insight gives O(1): use as many 3s as possible.
- Any part of 5 or more can be split into 2 and n - 2, with product 2(n - 2) > n, so large parts are never optimal.
- 4 = 2 + 2 ties with 4, and 1s are useless.
- 3 × 3 > 2 × 2 × 2, so prefer 3s, and use 2s only to handle the remainder.
- So: n mod 3 = 0 gives 3^(n/3); mod 1 gives 3^(k-1) × 4; mod 2 gives 3^k × 2.

10 = 3 + 3 + 4, giving 36. The 58 test reaches 1549681956, still within safe integers.

Seeing the DP first and then discovering a closed form is a common and satisfying interview path.`,
      complexity: 'O(n²) time DP (O(1) with the 3s rule), O(n) space',
    },
    {
      title: 'Delete and Earn', fn: 'deleteAndEarn', args: ['nums'],
      prompt: 'Pick any nums[i] to earn its value; doing so deletes every element equal to nums[i] − 1 and nums[i] + 1. Repeat until empty. Return the maximum points you can earn.',
      tests: [[[[3, 4, 2]], 6], [[[2, 2, 3, 3, 3, 4]], 9], [[[1]], 1], [[[1, 1, 1, 2, 4, 5, 5, 5, 6]], 18], [[[8, 10, 4, 9, 1, 3, 5, 9, 4, 10]], 37]],
      js: String.raw`function deleteAndEarn(nums) {
  const max = Math.max(...nums);
  const points = new Array(max + 1).fill(0); // total points available for each value
  for (const x of nums) points[x] += x;
  // now it is House Robber over values 0..max: adjacent values conflict
  let prev2 = 0, prev1 = 0;
  for (const p of points) [prev2, prev1] = [prev1, Math.max(prev1, prev2 + p)];
  return prev1;
}`,
      py: String.raw`def delete_and_earn(nums):
    points = [0] * (max(nums) + 1)
    for x in nums:
        points[x] += x
    prev2 = prev1 = 0
    for p in points:
        prev2, prev1 = prev1, max(prev1, prev2 + p)
    return prev1`,
      explain: `This is a disguise problem: it reduces to House Robber.

1. If you take one copy of a value v, you might as well take every copy. Its neighbors v - 1 and v + 1 are deleted anyway, and the other copies of v are not. So group by value: points[v] = v × count(v).
2. Taking value v forbids v - 1 and v + 1. Line the values up as 0, 1, 2, ..., max, and "adjacent values conflict" is exactly "adjacent houses conflict".
3. Run House Robber over the points array.

[2, 2, 3, 3, 3, 4]: points are [0, 0, 4, 9, 4]. Robbing value 3 alone gives 9, which beats 2 + 4 = 8.

The array spans 0 to max, so this is O(n + max). If the values are huge but sparse, sort the distinct values and run the same DP. Only consecutive values (difference 1) conflict, and a gap of 2 or more means you can take both.

Recognizing an old problem under new wording is one of the most valuable interview skills, and the "transform the input, then reuse a known DP" approach is very common.`,
      complexity: 'O(n + max) time and space',
    },
  ],
};

export default m;
