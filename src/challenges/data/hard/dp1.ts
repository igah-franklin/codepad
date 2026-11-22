import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'dp-1',
  title: 'Dynamic Programming I',
  description: 'Define a subproblem, find its recurrence, fill a table: the classic 1D and 2D DPs.',
  challenges: [
    {
      title: 'Coin Change', fn: 'coinChange', args: ['coins', 'amount'],
      prompt: 'Return the fewest coins needed to make up amount using unlimited coins of the given denominations, or -1 if it cannot be done.',
      tests: [[[[1, 2, 5], 11], 3], [[[2], 3], -1], [[[1], 0], 0], [[[1, 3, 4], 6], 2], [[[186, 419, 83, 408], 6249], 20], [[[2, 5, 10, 1], 27], 4]],
      js: String.raw`function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity); // dp[a] = fewest coins for amount a
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1;
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
      py: String.raw`def coin_change(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return -1 if dp[amount] == INF else dp[amount]`,
      explain: `Why not greedy? With coins [1, 3, 4] and amount 6, greedy takes 4 + 1 + 1 (3 coins), but 3 + 3 uses only 2. Greedy only works for special coin systems, so we need dynamic programming.

1. Subproblem: dp[a] = the fewest coins that make amount a.
2. Recurrence: the last coin used is some c, so dp[a] = 1 + min over all coins c of dp[a - c].
3. Base case: dp[0] = 0, because no coins are needed for nothing.
4. Order: compute a from 1 upward, so every dp[a - c] is ready before it is needed.

Unreachable amounts stay at Infinity, so 1 + Infinity is still Infinity and never wins a min. At the end, Infinity means -1.

Every DP problem fits this recipe: define the state, write the recurrence, set the base cases, choose a fill order, then read the answer. Getting the state definition right is the hard part.

Coin Change is an unbounded knapsack: each coin can be used any number of times.`,
      complexity: 'O(amount × coins) time, O(amount) space',
    },
    {
      title: 'Longest Increasing Subsequence', fn: 'lengthOfLIS', args: ['nums'],
      prompt: 'Return the length of the longest strictly increasing subsequence of nums (not necessarily contiguous). Aim for O(n log n).',
      tests: [[[[10, 9, 2, 5, 3, 7, 101, 18]], 4], [[[0, 1, 0, 3, 2, 3]], 4], [[[7, 7, 7, 7]], 1], [[[]], 0], [[[1, 2, 3, 4, 5]], 5], [[[5, 4, 3, 2, 1]], 1], [[[3, 10, 2, 1, 20]], 3]],
      js: String.raw`function lengthOfLIS(nums) {
  // tails[k] = smallest possible tail of an increasing subsequence of length k + 1
  const tails = [];
  for (const x of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x; // extend (lo === length) or improve an existing tail
  }
  return tails.length;
}`,
      py: String.raw`from bisect import bisect_left

def length_of_lis(nums):
    tails = []
    for x in nums:
        i = bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)`,
      explain: `The O(n²) DP comes first: dp[i] = the length of the longest increasing subsequence ending at i, which is 1 + max(dp[j]) over every j < i with nums[j] < nums[i]. The answer is max(dp). That is correct and easy to explain.

The O(n log n) "patience sorting" version: keep tails, where tails[k] is the smallest possible last value of an increasing subsequence of length k + 1.

For each x:
- If x is larger than every tail, it extends the longest subsequence, so append it.
- Otherwise, replace the first tail that is at least x with x. A subsequence of that length can now end on a smaller value, which leaves more room to extend it later.

tails is always sorted, so finding the spot is a binary search (lower bound).

tails is not itself a valid subsequence. Only its length is meaningful. Recovering an actual subsequence takes extra bookkeeping with parent pointers.

Strictly increasing means using lower bound. For non-decreasing, you would use upper bound instead.`,
      complexity: 'O(n log n) time, O(n) space',
    },
    {
      title: 'Longest Common Subsequence', fn: 'longestCommonSubsequence', args: ['a', 'b'],
      prompt: 'Return the length of the longest subsequence common to strings a and b. ("ace" is a common subsequence of "abcde" and "ace".)',
      tests: [[['abcde', 'ace'], 3], [['abc', 'abc'], 3], [['abc', 'def'], 0], [['', 'abc'], 0], [['bsbininm', 'jmjkbkjkv'], 1], [['oxcpqrsvwf', 'shmtulqrypy'], 2]],
      js: String.raw`function longestCommonSubsequence(a, b) {
  const n = a.length, m = b.length;
  // dp[i][j] = LCS of a[0..i) and b[0..j)
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[n][m];
}`,
      py: String.raw`def longest_common_subsequence(a, b):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[n][m]`,
      explain: `This is the classic two-string DP. The state is a pair of prefix lengths.

dp[i][j] = the length of the LCS of the first i characters of a and the first j characters of b.

Look at the last characters, a[i-1] and b[j-1]:
- If they are equal, they can both end the common subsequence: dp[i-1][j-1] + 1.
- If they differ, at least one of them is not in the LCS, so drop one and take the better result: max(dp[i-1][j], dp[i][j-1]).

Base cases: an empty prefix has an LCS of 0. That is the extra row and column of zeros, and it is why the table is (n + 1) × (m + 1).

Fill the table row by row. Each cell depends only on the cell above, the cell to the left, and the cell diagonally up-left.

Space optimization: each row needs only the previous row, so two arrays of length m + 1 are enough.

The LCS is the engine behind diff tools (git diff), DNA sequence alignment and plagiarism detection.`,
      complexity: 'O(n·m) time, O(n·m) space (O(m) with rolling rows)',
    },
    {
      title: 'Edit Distance', fn: 'minDistance', args: ['a', 'b'],
      prompt: 'Return the minimum number of single-character insertions, deletions or replacements needed to turn a into b (the Levenshtein distance).',
      tests: [[['horse', 'ros'], 3], [['intention', 'execution'], 5], [['', 'abc'], 3], [['abc', ''], 3], [['same', 'same'], 0], [['kitten', 'sitting'], 3]],
      js: String.raw`function minDistance(a, b) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]); // replace, delete, insert
    }
  }
  return dp[n][m];
}`,
      py: String.raw`def min_distance(a, b):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    return dp[n][m]`,
      explain: `This has the same table shape as LCS, with different transitions.

dp[i][j] = the minimum edits to turn the first i characters of a into the first j characters of b.

If the last characters match, they need no edit: dp[i][j] = dp[i-1][j-1].

Otherwise, take the cheapest of three operations, each costing 1:
- Replace a[i-1] with b[j-1]: dp[i-1][j-1] + 1.
- Delete a[i-1]: dp[i-1][j] + 1.
- Insert b[j-1]: dp[i][j-1] + 1.

Base cases: turning i characters into an empty string takes i deletions, and turning an empty string into j characters takes j insertions. That fills the first column and the first row.

horse → ros: replace h with r (rorse), delete r (rose), delete e (ros). That is 3.

Uses include spell checkers, fuzzy search, DNA alignment and "did you mean...?" suggestions. Like LCS, it can use rolling rows for O(m) space.`,
      complexity: 'O(n·m) time, O(n·m) space',
    },
    {
      title: 'Word Break', fn: 'wordBreak', args: ['s', 'words'],
      prompt: 'Return true if s can be split into a sequence of one or more dictionary words (words can be reused).',
      tests: [[['leetcode', ['leet', 'code']], true], [['applepenapple', ['apple', 'pen']], true], [['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']], false], [['', ['a']], true], [['aaaaaaa', ['aaaa', 'aaa']], true], [['ab', ['a']], false]],
      js: String.raw`function wordBreak(s, words) {
  const dict = new Set(words);
  const maxLen = Math.max(0, ...words.map((w) => w.length));
  const dp = new Array(s.length + 1).fill(false); // dp[i]: s[0..i) can be segmented
  dp[0] = true;
  for (let i = 1; i <= s.length; i++) {
    for (let j = Math.max(0, i - maxLen); j < i && !dp[i]; j++) {
      if (dp[j] && dict.has(s.slice(j, i))) dp[i] = true;
    }
  }
  return dp[s.length];
}`,
      py: String.raw`def word_break(s, words):
    d = set(words)
    max_len = max((len(w) for w in words), default=0)
    dp = [True] + [False] * len(s)
    for i in range(1, len(s) + 1):
        for j in range(max(0, i - max_len), i):
            if dp[j] and s[j:i] in d:
                dp[i] = True
                break
    return dp[len(s)]`,
      explain: `dp[i] = true if the first i characters can be split into dictionary words.

Recurrence: dp[i] is true if there is some j < i where dp[j] is true (the part before j splits fine) and s[j:i] is a dictionary word (the last piece).

Base case: dp[0] = true. The empty prefix splits trivially.

Optimization: the last piece cannot be longer than the longest dictionary word, so j only needs to go back maxLen characters.

Why not backtracking alone? "aaaaaaa…b" with the words "a", "aa" and "aaa" has an exponential number of ways to split, and plain recursion would explore them all before failing. The DP table, or memoizing the recursion, ensures each prefix is solved only once.

"catsandog" fails: "cats"+"and" or "cat"+"sand" cover "catsand", but "og" is not a word, and no other split reaches the end.

Word Break II (in Hard Strings) lists all the sentences, which needs backtracking on top of this.`,
      complexity: 'O(n × L) substring checks for max word length L, O(n) space',
    },
    {
      title: 'Unique Paths with Obstacles', fn: 'uniquePathsWithObstacles', args: ['grid'],
      prompt: 'A robot starts at the top-left of a grid and can only move right or down. Cells with 1 are obstacles. Return the number of distinct paths to the bottom-right corner.',
      tests: [[[[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], 2], [[[[0, 1], [0, 0]]], 1], [[[[1]]], 0], [[[[0]]], 1], [[[[0, 0], [0, 1]]], 0], [[[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]], 10]],
      js: String.raw`function uniquePathsWithObstacles(grid) {
  const C = grid[0].length;
  const dp = new Array(C).fill(0); // one rolling row
  dp[0] = grid[0][0] === 0 ? 1 : 0;
  for (const row of grid) {
    for (let j = 0; j < C; j++) {
      if (row[j] === 1) dp[j] = 0;
      else if (j > 0) dp[j] += dp[j - 1]; // from above (old dp[j]) + from the left
    }
  }
  return dp[C - 1];
}`,
      py: String.raw`def unique_paths_with_obstacles(grid):
    C = len(grid[0])
    dp = [0] * C
    dp[0] = 1 if grid[0][0] == 0 else 0
    for row in grid:
        for j in range(C):
            if row[j] == 1:
                dp[j] = 0
            elif j > 0:
                dp[j] += dp[j - 1]
    return dp[C - 1]`,
      explain: `Paths into a cell arrive either from above or from the left, so paths(r, c) = paths(r-1, c) + paths(r, c-1). An obstacle has 0 paths.

Rolling row: process the grid one row at a time with a single array dp.
- Before the update, dp[j] still holds the value from the row above.
- dp[j - 1] has already been updated for this row, so it is the cell to the left.
- So dp[j] += dp[j - 1] adds "from above" and "from the left" in one step.

The start cell seeds dp[0] = 1, unless it is blocked.

In the first column there is no left neighbor, so a cell only inherits from above, and an obstacle there cuts off every cell below it.

Without obstacles there is a closed form: C(R + C - 2, R - 1). For a 3 × 4 grid that is C(5, 2) = 10. The DP approach generalizes to obstacles, weighted costs (Minimum Path Sum) and more movement options.`,
      complexity: 'O(R·C) time, O(C) space',
    },
    {
      title: 'Decode Ways', fn: 'numDecodings', args: ['s'],
      prompt: 'Letters A–Z are encoded as "1"–"26". Given a string of digits, return how many ways it can be decoded. "12" can be "AB" (1,2) or "L" (12). Leading zeros are invalid ("06" is not 6).',
      tests: [[['12'], 2], [['226'], 3], [['06'], 0], [['10'], 1], [['2101'], 1], [['11106'], 2], [['27'], 1], [['1111111111'], 89]],
      js: String.raw`function numDecodings(s) {
  // prev2 = ways for s[0..i-2), prev1 = ways for s[0..i-1)
  let prev2 = 1, prev1 = s[0] === '0' ? 0 : 1;
  for (let i = 2; i <= s.length; i++) {
    let cur = 0;
    if (s[i - 1] !== '0') cur += prev1; // single digit 1-9
    const two = Number(s.slice(i - 2, i));
    if (two >= 10 && two <= 26) cur += prev2; // two digits 10-26
    prev2 = prev1;
    prev1 = cur;
  }
  return s.length ? prev1 : 0;
}`,
      py: String.raw`def num_decodings(s):
    if not s:
        return 0
    prev2, prev1 = 1, 0 if s[0] == "0" else 1
    for i in range(2, len(s) + 1):
        cur = 0
        if s[i - 1] != "0":
            cur += prev1
        if 10 <= int(s[i - 2:i]) <= 26:
            cur += prev2
        prev2, prev1 = prev1, cur
    return prev1`,
      explain: `This is Fibonacci with conditions.

dp[i] = the number of ways to decode the first i digits. The last letter of a decoding uses either:
- one digit (s[i-1]), valid if it is not "0", contributing dp[i-1] ways;
- two digits (s[i-2..i-1]), valid if they form 10 to 26, contributing dp[i-2] ways.

So dp[i] = (one-digit valid ? dp[i-1] : 0) + (two-digit valid ? dp[i-2] : 0).

Base cases: dp[0] = 1 (the empty prefix), and dp[1] = 1 unless the first digit is "0".

Zeros are what make it tricky: "0" can never stand alone, so "10" and "20" have to pair up, and "06" or "30" are dead ends.

Only the last two values are needed, so two variables replace the array, exactly like the iterative Fibonacci.

A string of ten 1s has 89 decodings, a Fibonacci number, because with no zeros and every pair valid, the recurrence is exactly dp[i] = dp[i-1] + dp[i-2].`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Partition Equal Subset Sum', fn: 'canPartition', args: ['nums'],
      prompt: 'nums contains positive integers. Return true if it can be split into two subsets with equal sums.',
      tests: [[[[1, 5, 11, 5]], true], [[[1, 2, 3, 5]], false], [[[1, 1]], true], [[[2]], false], [[[3, 3, 3, 4, 5]], true], [[[100, 100, 100, 100, 100, 100, 100, 100]], true], [[[1, 2, 5]], false]],
      js: String.raw`function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2) return false;
  const target = total / 2;
  const can = new Array(target + 1).fill(false); // can[s]: some subset sums to s
  can[0] = true;
  for (const x of nums) {
    for (let s = target; s >= x; s--) {
      if (can[s - x]) can[s] = true; // iterate downward so each number is used once
    }
  }
  return can[target];
}`,
      py: String.raw`def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    can = [True] + [False] * target
    for x in nums:
        for s in range(target, x - 1, -1):
            if can[s - x]:
                can[s] = True
    return can[target]`,
      explain: `Reframe the problem: two equal halves exist exactly when some subset sums to total / 2. That is subset sum, a 0/1 knapsack.

1. An odd total can never split evenly, so return false.
2. can[s] = true if some subset of the numbers processed so far sums to s. Start with can[0] = true (the empty subset).
3. For each number x, every sum s that was reachable as s - x now becomes reachable too.

Iterate s downward. Going upward would let the same x be used again within one pass: can[x] becomes true, then can[2x] reads that new value and becomes true too, as if x had been used twice. Downward iteration only reads values from before x was considered. That is the difference between 0/1 knapsack (each item once) and unbounded knapsack (Coin Change).

The table is indexed by sum, so the cost is O(n × target). This is called pseudo-polynomial: fast when the numbers are small. The general problem is NP-complete.

A neat trick in Python: a big integer used as a bitset, with bits |= bits << x for each x.`,
      complexity: 'O(n × sum) time, O(sum) space',
    },
    {
      title: 'House Robber II', fn: 'robCircular', args: ['nums'],
      prompt: 'Houses are arranged in a circle, so the first and last are neighbors. You cannot rob two adjacent houses. Return the most money you can rob.',
      tests: [[[[2, 3, 2]], 3], [[[1, 2, 3, 1]], 4], [[[1, 2, 3]], 3], [[[5]], 5], [[[]], 0], [[[200, 3, 140, 20, 10]], 340], [[[1, 3, 1, 3, 100]], 103]],
      js: String.raw`function robCircular(nums) {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];
  const robLine = (lo, hi) => {
    let take = 0, skip = 0; // best if we rob / don't rob the previous house
    for (let i = lo; i <= hi; i++) [take, skip] = [skip + nums[i], Math.max(take, skip)];
    return Math.max(take, skip);
  };
  return Math.max(robLine(0, nums.length - 2), robLine(1, nums.length - 1));
}`,
      py: String.raw`def rob_circular(nums):
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]
    def rob_line(lo, hi):
        take = skip = 0
        for i in range(lo, hi + 1):
            take, skip = skip + nums[i], max(take, skip)
        return max(take, skip)
    return max(rob_line(0, len(nums) - 2), rob_line(1, len(nums) - 1))`,
      explain: `First, the linear version (House Robber I). Walk along the street keeping two values:
- take: the best total if you rob the current house, which is skip + nums[i];
- skip: the best total if you do not, which is max(take, skip) from the previous house.

The circle adds one constraint: the first and last houses cannot both be robbed. So split the problem into two linear ones:
1. Exclude the last house and rob houses 0 to n-2.
2. Exclude the first house and rob houses 1 to n-1.

The answer is the better of the two. Every valid circular choice leaves out the first or the last house (or both), so it is covered by at least one of the cases.

Breaking a circular constraint into a few linear cases is a reusable trick.

Edge cases: an empty list gives 0, and a single house can be robbed on its own (it is not its own neighbor).`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Longest Palindromic Subsequence', fn: 'longestPalindromeSubseq', args: ['s'],
      prompt: 'Return the length of the longest subsequence of s that is a palindrome. ("bbbab" → "bbbb", length 4.)',
      tests: [[['bbbab'], 4], [['cbbd'], 2], [['a'], 1], [['abcde'], 1], [['agbdba'], 5], [[''], 0]],
      js: String.raw`function longestPalindromeSubseq(s) {
  const n = s.length;
  if (n === 0) return 0;
  // dp[i][j] = answer for s[i..j]
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      dp[i][j] = s[i] === s[j] ? dp[i + 1][j - 1] + 2 : Math.max(dp[i + 1][j], dp[i][j - 1]);
    }
  }
  return dp[0][n - 1];
}`,
      py: String.raw`def longest_palindrome_subseq(s):
    n = len(s)
    if n == 0:
        return 0
    dp = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            if s[i] == s[j]:
                dp[i][j] = dp[i + 1][j - 1] + 2
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1]`,
      explain: `This is interval DP: the state is a substring range [i, j].

dp[i][j] = the longest palindromic subsequence inside s[i..j].
- If the end characters match, they wrap around the best answer for the inside: dp[i+1][j-1] + 2.
- Otherwise drop one end: max(dp[i+1][j], dp[i][j-1]).
- A single character is a palindrome of length 1.

Fill order matters. dp[i][j] needs dp[i+1][...], the row below, so loop i from the end down to 0, and j from i + 1 upward. When i + 1 > j - 1 (two adjacent equal characters), dp[i+1][j-1] is an untouched 0, which correctly gives 2.

Shortcut: the longest palindromic subsequence of s equals the LCS of s and reverse(s), so you can reuse the earlier solution directly.

Do not confuse this with Longest Palindromic Substring, which must be contiguous and uses expand-around-center. Subsequences can skip characters, which is why "agbdba" gives "abdba", length 5.`,
      complexity: 'O(n²) time and space',
    },
  ],
};

export default m;
