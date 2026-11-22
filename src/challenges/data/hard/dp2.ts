import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'dp-2',
  title: 'Dynamic Programming II',
  description: 'Pattern matching, interval DP, counting DPs and state machines.',
  challenges: [
    {
      title: 'Maximum Product Subarray', fn: 'maxProduct', args: ['nums'],
      prompt: 'Return the largest product of any non-empty contiguous subarray of nums. Values can be negative or zero.',
      tests: [[[[2, 3, -2, 4]], 6], [[[-2, 0, -1]], 0], [[[-2, 3, -4]], 24], [[[-2]], -2], [[[0, 2]], 2], [[[-1, -2, -3, 0, -4, -5]], 20], [[[2, -5, -2, -4, 3]], 24]],
      js: String.raw`function maxProduct(nums) {
  let hi = nums[0], lo = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i];
    const candidates = [x, hi * x, lo * x];
    hi = Math.max(...candidates);
    lo = Math.min(...candidates);
    best = Math.max(best, hi);
  }
  return best;
}`,
      py: String.raw`def max_product(nums):
    hi = lo = best = nums[0]
    for x in nums[1:]:
        c = (x, hi * x, lo * x)
        hi, lo = max(c), min(c)
        best = max(best, hi)
    return best`,
      explain: `Kadane's algorithm for maximum sum keeps the best sum ending at each position. Products are trickier: a negative number turns the largest product into the smallest one, and the smallest into the largest.

So track two values for subarrays ending at the current index:
- hi: the largest product,
- lo: the smallest (most negative) product.

For each x, the best subarray ending here is one of:
- x alone (start fresh, which is useful after a zero),
- hi × x (extend the best),
- lo × x (a negative times a negative can jump to the top).

Set hi and lo to the max and min of those three, computing all three before overwriting either variable.

[-2, 3, -4]: at -4, lo is -6 (from -2 × 3), and -6 × -4 = 24, which is the answer.

Zeros reset everything, because the "x alone" option takes over.

This is DP with two states per position. Tracking both extremes whenever a sign flip can swap them is a pattern worth remembering.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Regular Expression Matching', fn: 'isMatch', args: ['s', 'p'],
      prompt: 'Implement matching for patterns with "." (any single character) and "*" (zero or more of the preceding element). The pattern must match the entire string.',
      tests: [[['aa', 'a'], false], [['aa', 'a*'], true], [['ab', '.*'], true], [['aab', 'c*a*b'], true], [['mississippi', 'mis*is*p*.'], false], [['', 'a*b*'], true], [['ab', '.*c'], false], [['aaa', 'a*a'], true]],
      js: String.raw`function isMatch(s, p) {
  const n = s.length, m = p.length;
  // dp[i][j]: s[i..] matches p[j..]
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(false));
  dp[n][m] = true;
  for (let i = n; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      const first = i < n && (p[j] === s[i] || p[j] === '.');
      if (p[j + 1] === '*') {
        dp[i][j] = dp[i][j + 2] || (first && dp[i + 1][j]); // skip "x*" or use it once more
      } else {
        dp[i][j] = first && dp[i + 1][j + 1];
      }
    }
  }
  return dp[0][0];
}`,
      py: String.raw`def is_match(s, p):
    n, m = len(s), len(p)
    dp = [[False] * (m + 1) for _ in range(n + 1)]
    dp[n][m] = True
    for i in range(n, -1, -1):
        for j in range(m - 1, -1, -1):
            first = i < n and p[j] in (s[i], ".")
            if j + 1 < m and p[j + 1] == "*":
                dp[i][j] = dp[i][j + 2] or (first and dp[i + 1][j])
            else:
                dp[i][j] = first and dp[i + 1][j + 1]
    return dp[0][0]`,
      explain: `dp[i][j] = does the suffix s[i:] match the pattern suffix p[j:]?

Look at the current pattern element:
- first = there is a character left in s, and p[j] matches it (equal, or ".").
- If p[j + 1] is "*", the pair "x*" can match:
  - zero copies: skip the pair, dp[i][j + 2];
  - one more copy: only if first matches, consume one character of s and keep the pattern where it is, dp[i + 1][j].
- Otherwise it is a plain single match: first and dp[i + 1][j + 1].

Base case: both empty means a match, so dp[n][m] = true. When the string is empty but the pattern is not (i = n), only "x*" pairs can still match. The loop handles that, because first is false when i = n.

Fill from the end of both strings backwards, since each cell depends on cells with larger i or j.

Plain recursion following these rules is correct, but exponential on patterns like "a*a*a*a*b". Memoizing it, or this table, makes it O(n·m).

This is a classic hard interview problem. Explaining the two "*" cases clearly is most of the battle.`,
      complexity: 'O(n·m) time and space',
    },
    {
      title: 'Wildcard Matching', fn: 'isMatchWildcard', args: ['s', 'p'],
      prompt: 'Match s against a pattern where "?" matches any single character and "*" matches any sequence (including empty). The match must cover the whole string.',
      tests: [[['aa', 'a'], false], [['aa', '*'], true], [['cb', '?a'], false], [['adceb', '*a*b'], true], [['acdcb', 'a*c?b'], false], [['', '*'], true], [['', '?'], false], [['abc', 'a**c'], true]],
      js: String.raw`function isMatchWildcard(s, p) {
  const n = s.length, m = p.length;
  let prev = new Array(m + 1).fill(false); // row for s[0..i-1)
  prev[0] = true;
  for (let j = 1; j <= m; j++) prev[j] = prev[j - 1] && p[j - 1] === '*';
  for (let i = 1; i <= n; i++) {
    const cur = new Array(m + 1).fill(false);
    for (let j = 1; j <= m; j++) {
      if (p[j - 1] === '*') cur[j] = cur[j - 1] || prev[j]; // * matches empty, or one more char
      else if (p[j - 1] === '?' || p[j - 1] === s[i - 1]) cur[j] = prev[j - 1];
    }
    prev = cur;
  }
  return prev[m];
}`,
      py: String.raw`def is_match_wildcard(s, p):
    n, m = len(s), len(p)
    prev = [False] * (m + 1)
    prev[0] = True
    for j in range(1, m + 1):
        prev[j] = prev[j - 1] and p[j - 1] == "*"
    for i in range(1, n + 1):
        cur = [False] * (m + 1)
        for j in range(1, m + 1):
            if p[j - 1] == "*":
                cur[j] = cur[j - 1] or prev[j]
            elif p[j - 1] in ("?", s[i - 1]):
                cur[j] = prev[j - 1]
        prev = cur
    return prev[m]`,
      explain: `dp[i][j] = the first i characters of s match the first j characters of p.

Transitions for p[j-1]:
- "*": it matches nothing, dp[i][j-1], or it absorbs one more character of s, dp[i-1][j]. Because "*" can keep absorbing, this one rule covers any length.
- "?" or the same letter: it consumes one character from each, dp[i-1][j-1].
- Anything else: no match.

Base row (empty s): only a prefix made entirely of "*" can match an empty string.

Rolling rows: each row only needs the previous one, so the space is O(m).

How it differs from Regular Expression Matching: there, "*" modifies the previous character. Here it is a standalone wildcard, which makes the recurrence simpler.

A greedy alternative with backtracking to the last "*" also runs fast in practice. It remembers where the last star matched and retries from one position later on a mismatch. It is a good follow-up to mention.`,
      complexity: 'O(n·m) time, O(m) space',
    },
    {
      title: 'Distinct Subsequences', fn: 'numDistinct', args: ['s', 't'],
      prompt: 'Return the number of distinct ways t can be formed as a subsequence of s (choosing different index sets counts as different).',
      tests: [[['rabbbit', 'rabbit'], 3], [['babgbag', 'bag'], 5], [['abc', ''], 1], [['', 'a'], 0], [['aaa', 'aa'], 3], [['abc', 'abcd'], 0]],
      js: String.raw`function numDistinct(s, t) {
  const m = t.length;
  const dp = new Array(m + 1).fill(0); // dp[j] = ways to form t[0..j)
  dp[0] = 1;
  for (const c of s) {
    for (let j = m; j >= 1; j--) {
      if (t[j - 1] === c) dp[j] += dp[j - 1]; // use this char as t[j-1]
    }
  }
  return dp[m];
}`,
      py: String.raw`def num_distinct(s, t):
    m = len(t)
    dp = [1] + [0] * m
    for c in s:
        for j in range(m, 0, -1):
            if t[j - 1] == c:
                dp[j] += dp[j - 1]
    return dp[m]`,
      explain: `This is a counting DP: instead of true/false or a min/max, each cell holds a number of ways.

dp[i][j] = the ways to form the first j characters of t from the first i characters of s.
- You can always ignore s[i-1]: dp[i-1][j] ways.
- If s[i-1] equals t[j-1], you can also use it as the last character: dp[i-1][j-1] more ways.

Base: the empty t can be formed in exactly 1 way (choose nothing).

The 1D version keeps a single row and iterates j downward, for the same reason as 0/1 knapsack: dp[j - 1] must still be the previous row's value, so each character of s is used at most once per subsequence.

"babgbag" → "bag" has 5 ways. Any of the b's at positions 0 and 2 can pair with an a after them and then with a g after that. The DP counts those combinations without listing them.

Counts can grow huge, and real problems often ask for them modulo 10^9 + 7.`,
      complexity: 'O(n·m) time, O(m) space',
    },
    {
      title: 'Interleaving String', fn: 'isInterleave', args: ['s1', 's2', 's3'],
      prompt: 'Return true if s3 is formed by interleaving s1 and s2: all characters of both, each string keeping its own order.',
      tests: [[['aabcc', 'dbbca', 'aadbbcbcac'], true], [['aabcc', 'dbbca', 'aadbbbaccc'], false], [['', '', ''], true], [['a', '', 'a'], true], [['abc', 'def', 'adbecf'], true], [['a', 'b', 'abc'], false]],
      js: String.raw`function isInterleave(s1, s2, s3) {
  const n = s1.length, m = s2.length;
  if (n + m !== s3.length) return false;
  // dp[j]: s1[0..i) and s2[0..j) can form s3[0..i+j)
  const dp = new Array(m + 1).fill(false);
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= m; j++) {
      if (i === 0 && j === 0) dp[j] = true;
      else {
        const fromS1 = i > 0 && dp[j] && s1[i - 1] === s3[i + j - 1];
        const fromS2 = j > 0 && dp[j - 1] && s2[j - 1] === s3[i + j - 1];
        dp[j] = fromS1 || fromS2;
      }
    }
  }
  return dp[m];
}`,
      py: String.raw`def is_interleave(s1, s2, s3):
    n, m = len(s1), len(s2)
    if n + m != len(s3):
        return False
    dp = [False] * (m + 1)
    for i in range(n + 1):
        for j in range(m + 1):
            if i == 0 and j == 0:
                dp[j] = True
            else:
                from_s1 = i > 0 and dp[j] and s1[i - 1] == s3[i + j - 1]
                from_s2 = j > 0 and dp[j - 1] and s2[j - 1] == s3[i + j - 1]
                dp[j] = from_s1 or from_s2
    return dp[m]`,
      explain: `Greedy fails here. When the next character of s3 matches both s1 and s2, you cannot know which one to take, so try both, which is what the DP does.

dp[i][j] = the first i characters of s1 and the first j characters of s2 can form the first i + j characters of s3.

The character s3[i + j - 1] came either:
- from s1: dp[i-1][j] was true and s1[i-1] matches it, or
- from s2: dp[i][j-1] was true and s2[j-1] matches it.

The lengths must add up, otherwise return false immediately.

With a rolling row, dp[j] still holds the previous row's value ("from s1", the cell above) when we read it, and dp[j - 1] already holds this row's value ("from s2", the cell to the left).

Picture it as a path on an (n+1) × (m+1) grid, where moving down consumes s1 and moving right consumes s2. The question is whether some path from the top-left to the bottom-right spells s3. Many two-string DPs read naturally as grid paths like this.`,
      complexity: 'O(n·m) time, O(m) space',
    },
    {
      title: 'Maximal Square', fn: 'maximalSquare', args: ['matrix'],
      prompt: 'matrix contains "0" and "1". Return the area of the largest square containing only 1s.',
      tests: [[[[['1', '0', '1', '0', '0'], ['1', '0', '1', '1', '1'], ['1', '1', '1', '1', '1'], ['1', '0', '0', '1', '0']]], 4], [[[['0', '1'], ['1', '0']]], 1], [[[['0']]], 0], [[[['1', '1'], ['1', '1']]], 4], [[[['1', '1', '1'], ['1', '1', '1'], ['1', '1', '1']]], 9]],
      js: String.raw`function maximalSquare(matrix) {
  const R = matrix.length, C = matrix[0].length;
  const dp = new Array(C + 1).fill(0); // dp[j+1] = side of the best square ending at (i, j)
  let best = 0;
  for (let i = 0; i < R; i++) {
    let diag = 0; // dp value up-left of the current cell
    for (let j = 0; j < C; j++) {
      const up = dp[j + 1];
      dp[j + 1] = matrix[i][j] === '1' ? 1 + Math.min(up, dp[j], diag) : 0;
      diag = up;
      best = Math.max(best, dp[j + 1]);
    }
  }
  return best * best;
}`,
      py: String.raw`def maximal_square(matrix):
    R, C = len(matrix), len(matrix[0])
    dp = [0] * (C + 1)
    best = 0
    for i in range(R):
        diag = 0
        for j in range(C):
            up = dp[j + 1]
            dp[j + 1] = 1 + min(up, dp[j], diag) if matrix[i][j] == "1" else 0
            diag = up
            best = max(best, dp[j + 1])
    return best * best`,
      explain: `dp[i][j] = the side length of the largest all-1 square whose bottom-right corner is (i, j).

Recurrence: if the cell is "1", then dp = 1 + min(top, left, top-left).

Why the minimum of three? A square of side k ending at (i, j) needs squares of side k - 1 ending directly above, directly to the left and diagonally up-left. The smallest of the three limits how far the new square can grow. If any of them is 0, the cell can only form a 1 × 1 square.

Rolling array details: dp[j + 1] before the update is the cell above. dp[j], already updated, is the cell to the left. The up-left value has been overwritten by the time we need it, so save it in diag before each update.

Return the area, side × side.

The related problem Maximal Rectangle (in Hard Arrays) is harder. It uses the "largest rectangle in a histogram" technique row by row.`,
      complexity: 'O(R·C) time, O(C) space',
    },
    {
      title: 'Burst Balloons', fn: 'maxCoins', args: ['nums'],
      prompt: 'Bursting balloon i earns nums[left] × nums[i] × nums[right], where left and right are its current neighbors (out-of-range neighbors count as 1). Balloons close the gap after bursting. Return the maximum coins from bursting them all.',
      tests: [[[[3, 1, 5, 8]], 167], [[[1, 5]], 10], [[[]], 0], [[[7]], 7], [[[9, 76, 64, 21]], 116718]],
      js: String.raw`function maxCoins(nums) {
  const a = [1, ...nums, 1];
  const n = a.length;
  // dp[l][r] = best coins from bursting everything strictly between l and r
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let len = 2; len < n; len++) {
    for (let l = 0; l + len < n; l++) {
      const r = l + len;
      for (let k = l + 1; k < r; k++) {
        // k is the LAST balloon burst between l and r
        dp[l][r] = Math.max(dp[l][r], dp[l][k] + a[l] * a[k] * a[r] + dp[k][r]);
      }
    }
  }
  return dp[0][n - 1];
}`,
      py: String.raw`def max_coins(nums):
    a = [1] + nums + [1]
    n = len(a)
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n):
        for l in range(0, n - length):
            r = l + length
            best = 0
            for k in range(l + 1, r):
                best = max(best, dp[l][k] + a[l] * a[k] * a[r] + dp[k][r])
            dp[l][r] = best
    return dp[0][n - 1]`,
      explain: `This is a famous interval DP, and the key insight is counter-intuitive: think about which balloon you burst last, not first.

If you choose which balloon to burst first, its neighbors change afterwards, and the two remaining sides depend on each other.

If k is the last balloon burst inside the open interval (l, r), then while all the others in (l, r) burst, k is still standing. That keeps the left part (l, k) and the right part (k, r) completely separate. When k finally bursts, its neighbors are exactly l and r.

So dp[l][r] = the max over k of dp[l][k] + a[l] × a[k] × a[r] + dp[k][r].

Padding with 1 on both sides handles the "out of range counts as 1" rule, and gives fixed boundaries that are never burst.

Compute intervals from short to long, so the smaller subintervals are always ready.

The same "choose the last or root split point" interval DP solves Matrix Chain Multiplication, Optimal BST and Minimum Cost to Merge Stones.`,
      complexity: 'O(n³) time, O(n²) space',
    },
    {
      title: 'Coin Change II', fn: 'change', args: ['amount', 'coins'],
      prompt: 'Return the number of combinations of coins (unlimited supply) that sum to amount. Order does not matter: 1+2 and 2+1 count once.',
      tests: [[[5, [1, 2, 5]], 4], [[3, [2]], 0], [[10, [10]], 1], [[0, [7]], 1], [[100, [1, 5, 10, 25, 50]], 292], [[4, [1, 2, 3]], 4]],
      js: String.raw`function change(amount, coins) {
  const ways = new Array(amount + 1).fill(0);
  ways[0] = 1;
  for (const c of coins) {
    // outer loop over coins => each combination is counted once, in coin order
    for (let a = c; a <= amount; a++) ways[a] += ways[a - c];
  }
  return ways[amount];
}`,
      py: String.raw`def change(amount, coins):
    ways = [1] + [0] * amount
    for c in coins:
        for a in range(c, amount + 1):
            ways[a] += ways[a - c]
    return ways[amount]`,
      explain: `This counts combinations, not the fewest coins. Loop order decides whether you count combinations or permutations.

ways[a] = the number of ways to make amount a using the coins processed so far.

Coins in the outer loop: when coin c is processed, ways[a - c] only counts combinations of the earlier coins (and c itself). Every combination is therefore built in one fixed coin order, such as all 1s, then 2s, then 5s, so each multiset is counted exactly once.

If you swap the loops (amounts outer, coins inner), you count sequences instead, and 1+2 and 2+1 become different. That is a different problem (Combination Sum IV).

Iterate a upward within each coin, because each coin can be used unlimited times (unbounded knapsack). Compare that with Partition Equal Subset Sum, which iterates downward for 0/1 use.

ways[0] = 1: there is one way to make 0, using no coins.

The 292 test is the classic "ways to make change for a dollar" with US coins.`,
      complexity: 'O(amount × coins) time, O(amount) space',
    },
    {
      title: 'Stock Trading with Cooldown', fn: 'maxProfitCooldown', args: ['prices'],
      prompt: 'You may complete as many buy/sell transactions as you like, holding at most one share at a time, but after selling you must wait one day before buying again. Return the maximum profit.',
      tests: [[[[1, 2, 3, 0, 2]], 3], [[[1]], 0], [[[]], 0], [[[5, 4, 3, 2, 1]], 0], [[[1, 2, 4]], 3], [[[2, 1, 4, 5, 2, 9, 7]], 10]],
      js: String.raw`function maxProfitCooldown(prices) {
  let hold = -Infinity, sold = 0, rest = 0;
  for (const p of prices) {
    const prevSold = sold;
    sold = hold + p; // sell today
    hold = Math.max(hold, rest - p); // keep holding, or buy today (only from rest)
    rest = Math.max(rest, prevSold); // do nothing; cooldown ends
  }
  return Math.max(sold, rest);
}`,
      py: String.raw`def max_profit_cooldown(prices):
    hold, sold, rest = float("-inf"), 0, 0
    for p in prices:
        prev_sold = sold
        sold = hold + p
        hold = max(hold, rest - p)
        rest = max(rest, prev_sold)
    return max(sold, rest)`,
      explain: `Model each day as a state machine with three states:
- hold: you own a share.
- sold: you sold today, so tomorrow is a forced cooldown.
- rest: you own nothing and are free to buy.

Transitions, using yesterday's values:
- sold = hold + price (sell what you held).
- hold = max(hold, rest - price) (keep holding, or buy today, but only from rest, never straight after a sale).
- rest = max(rest, sold) (stay idle, or finish the cooldown).

Save the old sold before updating, because rest needs yesterday's value.

The answer is the best state with no share at the end: max(sold, rest).

The same state-machine DP covers the whole stock family:
- One transaction: track the minimum price so far.
- Unlimited transactions: add every upward step.
- A transaction fee: subtract the fee when selling.
- At most k transactions: add the transaction count as a dimension.

Thinking in states and transitions is often the clearest way to set up a DP.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Minimum Cost For Tickets', fn: 'mincostTickets', args: ['days', 'costs'],
      prompt: 'You travel on the given days of the year (sorted, 1–365). Tickets cost costs[0] for 1 day, costs[1] for 7 consecutive days and costs[2] for 30 consecutive days. Return the minimum cost to cover every travel day.',
      tests: [[[[1, 4, 6, 7, 8, 20], [2, 7, 15]], 11], [[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 30, 31], [2, 7, 15]], 17], [[[5], [3, 10, 20]], 3], [[[1, 2, 3, 4, 5, 6, 7], [5, 7, 100]], 7], [[[], [2, 7, 15]], 0]],
      js: String.raw`function mincostTickets(days, costs) {
  const travel = new Set(days);
  const last = days.length ? days[days.length - 1] : 0;
  const dp = new Array(last + 1).fill(0); // dp[d] = cheapest way to cover travel days up to d
  for (let d = 1; d <= last; d++) {
    if (!travel.has(d)) {
      dp[d] = dp[d - 1];
      continue;
    }
    dp[d] = Math.min(
      dp[d - 1] + costs[0],
      dp[Math.max(0, d - 7)] + costs[1],
      dp[Math.max(0, d - 30)] + costs[2],
    );
  }
  return dp[last];
}`,
      py: String.raw`def mincost_tickets(days, costs):
    travel = set(days)
    last = days[-1] if days else 0
    dp = [0] * (last + 1)
    for d in range(1, last + 1):
        if d not in travel:
            dp[d] = dp[d - 1]
            continue
        dp[d] = min(dp[d - 1] + costs[0],
                    dp[max(0, d - 7)] + costs[1],
                    dp[max(0, d - 30)] + costs[2])
    return dp[last]`,
      explain: `dp[d] = the cheapest cost to cover every travel day from 1 to d.

- If d is not a travel day, nothing extra is needed: dp[d] = dp[d - 1].
- If it is, consider the ticket that covers day d, as if bought so that it ends on day d:
  - 1-day ticket: dp[d - 1] + costs[0]
  - 7-day ticket: covers d - 6 to d, so dp[d - 7] + costs[1]
  - 30-day ticket: covers d - 29 to d, so dp[d - 30] + costs[2]
  Take the cheapest. Clamp indices below 0 to 0, since there is nothing to cover before day 1.

Why imagine the pass ending on day d? Any optimal plan can be shifted so that each pass ends on a travel day without costing more. Then "the pass covering day d" has only three possibilities, which is exactly what the recurrence needs.

The tests show non-obvious wins: in the 4th case, a 7-day pass for 7 beats seven 1-day tickets for 35.

The table is indexed by calendar day (at most 365). An alternative indexes by trip number and uses pointers to find the first trip a pass does not cover, which is better when days are sparse over a huge range.`,
      complexity: 'O(D) time and space where D = last travel day',
    },
  ],
};

export default m;
