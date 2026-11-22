import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'backtracking',
  title: 'Recursion & Backtracking',
  description: 'Build answers step by step, undoing choices to explore every possibility.',
  challenges: [
    {
      title: 'Subsets', fn: 'subsets', args: ['nums'],
      prompt: 'nums has distinct integers. Return all possible subsets (the power set). Any order is fine.',
      compare: 'unorderedDeep',
      tests: [[[[1, 2, 3]], [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]], [[[0]], [[], [0]]], [[[]], [[]]], [[[5, 9]], [[], [5], [9], [5, 9]]]],
      js: String.raw`function subsets(nums) {
  const out = [], cur = [];
  const go = (i) => {
    if (i === nums.length) {
      out.push(cur.slice());
      return;
    }
    go(i + 1); // skip nums[i]
    cur.push(nums[i]); // take nums[i]
    go(i + 1);
    cur.pop(); // undo
  };
  go(0);
  return out;
}`,
      py: String.raw`def subsets(nums):
    out, cur = [], []
    def go(i):
        if i == len(nums):
            out.append(cur[:])
            return
        go(i + 1)
        cur.append(nums[i])
        go(i + 1)
        cur.pop()
    go(0)
    return out`,
      explain: `Every element is either in or out of a subset, so there are 2^n subsets. Recursion explores that decision tree.

go(i) decides about nums[i]:
1. Branch 1: skip it and decide about the rest.
2. Branch 2: add it to cur, decide about the rest, then remove it (pop). Removing it is what makes this backtracking: undo the choice so that cur is clean for the next branch.
3. When i reaches the end, every decision has been made, so record a copy of cur.

Why copy (cur.slice() / cur[:])? cur keeps changing. Storing the array itself would leave many references to the same list, which ends up empty.

Iterative alternative: start with [[]], and for each number, add a copy of every existing subset with the number appended. Or use bitmasks: each integer from 0 to 2^n - 1 encodes one subset.

The choose, explore, un-choose template is the core of every backtracking problem in this module.`,
      complexity: 'O(n · 2^n) time and output space',
    },
    {
      title: 'Permutations', fn: 'permute', args: ['nums'],
      prompt: 'nums has distinct integers. Return all possible orderings. The list of permutations may be in any order.',
      compare: 'unordered',
      tests: [[[[1, 2, 3]], [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]], [[[0, 1]], [[0, 1], [1, 0]]], [[[1]], [[1]]]],
      js: String.raw`function permute(nums) {
  const out = [], cur = [], used = new Array(nums.length).fill(false);
  const go = () => {
    if (cur.length === nums.length) {
      out.push(cur.slice());
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      cur.push(nums[i]);
      go();
      cur.pop();
      used[i] = false;
    }
  };
  go();
  return out;
}`,
      py: String.raw`def permute(nums):
    out, cur = [], []
    used = [False] * len(nums)
    def go():
        if len(cur) == len(nums):
            out.append(cur[:])
            return
        for i, x in enumerate(nums):
            if used[i]:
                continue
            used[i] = True
            cur.append(x)
            go()
            cur.pop()
            used[i] = False
    go()
    return out`,
      explain: `Build a permutation one position at a time. At each position you can place any number that has not been used yet.

1. used[i] records which numbers are already placed.
2. For every unused number: mark it, append it, recurse to fill the next position, then undo both changes.
3. When cur is full, record a copy.

The recursion tree has n choices at the first level, n - 1 at the second, and so on, which gives n! leaves, one per permutation.

Undo order: reverse the changes in the opposite order you made them (pop, then unmark). That keeps the state consistent for the next loop iteration.

Swap-based alternative: permute in place by swapping nums[start] with each nums[i] at or after start, recursing on start + 1, and swapping back. It needs no used array.

Python's itertools.permutations does this for you, but implementing it yourself is a classic interview question.`,
      complexity: 'O(n · n!) time and output space',
    },
    {
      title: 'Combinations', fn: 'combine', args: ['n', 'k'],
      prompt: 'Return all combinations of k numbers chosen from 1..n. Each combination should be in ascending order; the list of combinations may be in any order.',
      compare: 'unordered',
      tests: [[[4, 2], [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]], [[1, 1], [[1]]], [[3, 3], [[1, 2, 3]]], [[5, 1], [[1], [2], [3], [4], [5]]]],
      js: String.raw`function combine(n, k) {
  const out = [], cur = [];
  const go = (start) => {
    if (cur.length === k) {
      out.push(cur.slice());
      return;
    }
    // prune: we need k - cur.length more numbers, so stop early enough
    for (let x = start; x <= n - (k - cur.length) + 1; x++) {
      cur.push(x);
      go(x + 1);
      cur.pop();
    }
  };
  go(1);
  return out;
}`,
      py: String.raw`def combine(n, k):
    out, cur = [], []
    def go(start):
        if len(cur) == k:
            out.append(cur[:])
            return
        for x in range(start, n - (k - len(cur)) + 2):
            cur.append(x)
            go(x + 1)
            cur.pop()
    go(1)
    return out`,
      explain: `Combinations ignore order, so {1, 2} and {2, 1} are the same combination. To avoid generating both, only ever pick numbers in increasing order: after choosing x, the next choice starts at x + 1.

1. go(start) may choose any number from start up to n.
2. Choose x, recurse with start = x + 1, then undo.
3. Record cur once it holds k numbers.

Pruning: if you still need r more numbers, the next choice can be at most n - r + 1. Otherwise there are not enough numbers left to finish the combination. The loop bound encodes that, which removes dead branches early.

Pruning branches that cannot possibly lead to an answer is what makes backtracking practical on larger inputs.

There are C(n, k) = n! / (k! (n - k)!) combinations in total.`,
      complexity: 'O(k · C(n, k)) time and output space',
    },
    {
      title: 'Combination Sum', fn: 'combinationSum', args: ['candidates', 'target'],
      prompt: 'candidates are distinct positive integers. Return all unique combinations that sum to target, where each candidate may be used any number of times. Combinations are multisets: [2,2,3] and [3,2,2] count as the same.',
      compare: 'unorderedDeep',
      tests: [[[[2, 3, 6, 7], 7], [[2, 2, 3], [7]]], [[[2, 3, 5], 8], [[2, 2, 2, 2], [2, 3, 3], [3, 5]]], [[[2], 1], []], [[[1], 2], [[1, 1]]], [[[7, 3], 6], [[3, 3]]]],
      js: String.raw`function combinationSum(candidates, target) {
  const c = candidates.slice().sort((a, b) => a - b);
  const out = [], cur = [];
  const go = (start, remain) => {
    if (remain === 0) {
      out.push(cur.slice());
      return;
    }
    for (let i = start; i < c.length && c[i] <= remain; i++) {
      cur.push(c[i]);
      go(i, remain - c[i]); // i, not i + 1: the same number may be reused
      cur.pop();
    }
  };
  go(0, target);
  return out;
}`,
      py: String.raw`def combination_sum(candidates, target):
    c = sorted(candidates)
    out, cur = [], []
    def go(start, remain):
        if remain == 0:
            out.append(cur[:])
            return
        for i in range(start, len(c)):
            if c[i] > remain:
                break
            cur.append(c[i])
            go(i, remain - c[i])
            cur.pop()
    go(0, target)
    return out`,
      explain: `This is the Combinations template with two changes.

1. Reuse is allowed: after choosing c[i], recurse with start = i rather than i + 1, so the same number can be picked again.
2. The goal is a sum rather than a size: track remain = target - (sum so far). Record cur when remain is 0.

Duplicates such as [2, 3, 2] cannot appear, because choices are made in non-decreasing order of index.

Pruning with sorting: once c[i] > remain, every later candidate is even bigger, so stop the loop.

Why not dynamic programming? DP can count the combinations quickly (as in Coin Change II), but listing every one of them still needs a search like this.

Trace for target 7: 2, 2, 2 leaves 1 remaining, and nothing fits, so backtrack. 2, 2, 3 reaches 0, so record it. Later the single 7 reaches 0 too.`,
      complexity: 'Exponential in target / min(candidate); O(target / min) recursion depth',
    },
    {
      title: 'Letter Combinations of a Phone Number', fn: 'letterCombinations', args: ['digits'],
      prompt: 'Given a string of digits 2–9, return all letter combinations they could spell on a phone keypad (2 = abc, 3 = def, 4 = ghi, 5 = jkl, 6 = mno, 7 = pqrs, 8 = tuv, 9 = wxyz). Return [] for an empty input. Any order.',
      compare: 'unordered',
      tests: [[['23'], ['ad', 'ae', 'af', 'bd', 'be', 'bf', 'cd', 'ce', 'cf']], [[''], []], [['2'], ['a', 'b', 'c']], [['79'], ['pw', 'px', 'py', 'pz', 'qw', 'qx', 'qy', 'qz', 'rw', 'rx', 'ry', 'rz', 'sw', 'sx', 'sy', 'sz']]],
      js: String.raw`function letterCombinations(digits) {
  if (!digits) return [];
  const map = { 2: 'abc', 3: 'def', 4: 'ghi', 5: 'jkl', 6: 'mno', 7: 'pqrs', 8: 'tuv', 9: 'wxyz' };
  const out = [];
  const go = (i, prefix) => {
    if (i === digits.length) {
      out.push(prefix);
      return;
    }
    for (const ch of map[digits[i]]) go(i + 1, prefix + ch);
  };
  go(0, '');
  return out;
}`,
      py: String.raw`def letter_combinations(digits):
    if not digits:
        return []
    keypad = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl", "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
    out = []
    def go(i, prefix):
        if i == len(digits):
            out.append(prefix)
            return
        for ch in keypad[digits[i]]:
            go(i + 1, prefix + ch)
    go(0, "")
    return out`,
      explain: `This is a Cartesian product: pick one letter for each digit, in order.

The recursion has one level per digit, and the branches at each level are that digit's letters. When every digit has a letter, the prefix is a full combination.

Passing the prefix as a new string (prefix + ch) means there is nothing to undo, because each call has its own copy. It is still backtracking, with the undo happening implicitly. Using a shared array with push and pop saves allocations on deep searches.

Count: the product of the number of letters per digit. "79" gives 4 × 4 = 16.

Iterative version: start with [""]. For each digit, replace the list with every existing string extended by each of the digit's letters. Python's itertools.product(*letter_lists) does the same.

Empty input is a special case. The product of zero choices would technically be [""], but the problem asks for [].`,
      complexity: 'O(4^n · n) time and output space',
    },
    {
      title: 'Generate Parentheses', fn: 'generateParenthesis', args: ['n'],
      prompt: 'Return every string of n pairs of well-formed (balanced) parentheses. Any order.',
      compare: 'unordered',
      tests: [[[3], ['((()))', '(()())', '(())()', '()(())', '()()()']], [[1], ['()']], [[2], ['(())', '()()']], [[0], ['']]],
      js: String.raw`function generateParenthesis(n) {
  const out = [];
  const go = (s, open, close) => {
    if (s.length === 2 * n) {
      out.push(s);
      return;
    }
    if (open < n) go(s + '(', open + 1, close);
    if (close < open) go(s + ')', open, close + 1);
  };
  go('', 0, 0);
  return out;
}`,
      py: String.raw`def generate_parenthesis(n):
    out = []
    def go(s, open_, close):
        if len(s) == 2 * n:
            out.append(s)
            return
        if open_ < n:
            go(s + "(", open_ + 1, close)
        if close < open_:
            go(s + ")", open_, close + 1)
    go("", 0, 0)
    return out`,
      explain: `Generating all 2^(2n) strings of brackets and filtering the valid ones wastes a lot of work. Instead, only ever build valid prefixes.

Two rules keep a prefix valid:
1. You may add "(" if fewer than n have been used.
2. You may add ")" only if it closes an open one, meaning close < open.

Following these rules, every complete string of length 2n is balanced, and no invalid prefix is ever explored.

This is constraint-guided backtracking: check the rules before recursing, rather than generating everything and filtering afterwards.

The number of results is the n-th Catalan number: 1, 1, 2, 5, 14, 42, ... Catalan numbers also count binary tree shapes, polygon triangulations and mountain paths, because all of these share this "never dip below zero" structure.

n = 0 gives [""], since the empty string is trivially balanced.`,
      complexity: 'O(4^n / √n) time, the n-th Catalan number of results',
    },
    {
      title: 'Palindrome Partitioning', fn: 'partition', args: ['s'],
      prompt: 'Split s into pieces so that every piece is a palindrome. Return all possible such splits (each split keeps the pieces in order). The list of splits may be in any order.',
      compare: 'unordered',
      tests: [[['aab'], [['a', 'a', 'b'], ['aa', 'b']]], [['a'], [['a']]], [['aba'], [['a', 'b', 'a'], ['aba']]], [['abc'], [['a', 'b', 'c']]], [['aaa'], [['a', 'a', 'a'], ['a', 'aa'], ['aa', 'a'], ['aaa']]]],
      js: String.raw`function partition(s) {
  const out = [], cur = [];
  const isPal = (i, j) => {
    while (i < j) if (s[i++] !== s[j--]) return false;
    return true;
  };
  const go = (start) => {
    if (start === s.length) {
      out.push(cur.slice());
      return;
    }
    for (let end = start; end < s.length; end++) {
      if (!isPal(start, end)) continue;
      cur.push(s.slice(start, end + 1));
      go(end + 1);
      cur.pop();
    }
  };
  go(0);
  return out;
}`,
      py: String.raw`def partition(s):
    out, cur = [], []
    def go(start):
        if start == len(s):
            out.append(cur[:])
            return
        for end in range(start, len(s)):
            piece = s[start:end + 1]
            if piece != piece[::-1]:
                continue
            cur.append(piece)
            go(end + 1)
            cur.pop()
    go(0)
    return out`,
      explain: `At each position, choose where the next piece ends. Only continue if that piece is a palindrome.

1. go(start) tries every end from start to the end of the string.
2. If s[start..end] is a palindrome, add it, recurse from end + 1, then remove it.
3. When start reaches the end of s, the whole string has been split into palindromes, so record a copy.

This is the general template for splitting a string: the choice at each step is the length of the next piece. Word Break and Restore IP Addresses (in Hard) follow the same pattern with different validity checks.

Optimization: precompute isPal[i][j] for every substring with dynamic programming in O(n²), so each check becomes O(1) instead of O(n).

There can be up to 2^(n-1) ways to split a string (every gap is a cut or not), which is why "aaa" has 4.`,
      complexity: 'O(n · 2^n) time worst case, O(n) recursion depth',
    },
    {
      title: 'Word Search', fn: 'exist', args: ['board', 'word'],
      prompt: 'Return true if word can be traced on the grid of letters by moving between horizontally or vertically adjacent cells, using each cell at most once.',
      tests: [[[[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'ABCCED'], true], [[[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'SEE'], true], [[[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'ABCB'], false], [[[['a']], 'a'], true], [[[['a', 'b'], ['c', 'd']], 'abdc'], true], [[[['a', 'b'], ['c', 'd']], 'abcd'], false]],
      js: String.raw`function exist(board, word) {
  const R = board.length, C = board[0].length;
  const dfs = (r, c, k) => {
    if (k === word.length) return true;
    if (r < 0 || r >= R || c < 0 || c >= C || board[r][c] !== word[k]) return false;
    const saved = board[r][c];
    board[r][c] = '#'; // mark as used on this path
    const found = dfs(r + 1, c, k + 1) || dfs(r - 1, c, k + 1) || dfs(r, c + 1, k + 1) || dfs(r, c - 1, k + 1);
    board[r][c] = saved; // backtrack
    return found;
  };
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (dfs(r, c, 0)) return true;
  return false;
}`,
      py: String.raw`def exist(board, word):
    R, C = len(board), len(board[0])
    def dfs(r, c, k):
        if k == len(word):
            return True
        if r < 0 or r >= R or c < 0 or c >= C or board[r][c] != word[k]:
            return False
        saved = board[r][c]
        board[r][c] = "#"
        found = dfs(r + 1, c, k + 1) or dfs(r - 1, c, k + 1) or dfs(r, c + 1, k + 1) or dfs(r, c - 1, k + 1)
        board[r][c] = saved
        return found
    return any(dfs(r, c, 0) for r in range(R) for c in range(C))`,
      explain: `Try starting from every cell, then DFS through the neighbors while the letters keep matching.

dfs(r, c, k) asks: can word[k:] be traced starting at (r, c)?
1. If k equals the word's length, everything has matched, so return true.
2. If the cell is off the grid or does not hold word[k], return false.
3. Mark the cell as used (overwrite it with "#"), try all 4 directions for k + 1, then restore it.

The restore step is the backtracking. A cell used on one path must be available again for other paths. Without restoring it, a failed attempt would block a later successful one.

Marking in place avoids a separate visited set.

Short-circuiting with || or "or" stops exploring as soon as any direction succeeds.

Worst case: R × C starting cells × 3^L paths (each step has at most 3 new directions), for a word of length L. Pruning on mismatched letters keeps it fast in practice. Word Search II in Hard adds a trie to search many words at once.`,
      complexity: 'O(R·C·3^L) time, O(L) recursion depth',
    },
    {
      title: 'Subsets II (With Duplicates)', fn: 'subsetsWithDup', args: ['nums'],
      prompt: 'nums may contain duplicates. Return all possible subsets without duplicate subsets. Any order.',
      compare: 'unorderedDeep',
      tests: [[[[1, 2, 2]], [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]], [[[0]], [[], [0]]], [[[2, 2, 2]], [[], [2], [2, 2], [2, 2, 2]]], [[[4, 4, 1]], [[], [1], [1, 4], [1, 4, 4], [4], [4, 4]]]],
      js: String.raw`function subsetsWithDup(nums) {
  const a = nums.slice().sort((x, y) => x - y);
  const out = [], cur = [];
  const go = (start) => {
    out.push(cur.slice()); // every node of the tree is a subset
    for (let i = start; i < a.length; i++) {
      if (i > start && a[i] === a[i - 1]) continue; // skip duplicate choices at this level
      cur.push(a[i]);
      go(i + 1);
      cur.pop();
    }
  };
  go(0);
  return out;
}`,
      py: String.raw`def subsets_with_dup(nums):
    a = sorted(nums)
    out, cur = [], []
    def go(start):
        out.append(cur[:])
        for i in range(start, len(a)):
            if i > start and a[i] == a[i - 1]:
                continue
            cur.append(a[i])
            go(i + 1)
            cur.pop()
    go(0)
    return out`,
      explain: `With duplicates, the in/out approach from Subsets produces repeats. [1, 2a] and [1, 2b] are the same subset. The fix is to sort, then skip duplicate choices at the same level of the tree.

This version uses a different formulation of subsets. Each recursive call chooses the next element to add, starting from index start, and every node in the tree (not only the leaves) is a subset.

The skip rule: if i > start and a[i] == a[i - 1], skip it. At this level, choosing the second 2 would create exactly the same subtree as choosing the first 2.

Why i > start and not i > 0? Taking a second copy of a value deeper in the recursion is allowed. That is how [2, 2] is produced. The rule only removes duplicate choices among siblings.

Sorting puts duplicates next to each other, which is what makes the single comparison with a[i - 1] enough.

The same "sort + skip equal siblings" rule fixes Permutations II and Combination Sum II.`,
      complexity: 'O(n · 2^n) time worst case, O(n) recursion depth',
    },
    {
      title: 'Letter Case Permutation', fn: 'letterCasePermutation', args: ['s'],
      prompt: 'Each letter in s can be lower or upper case; digits stay as they are. Return every string you can create. Any order.',
      compare: 'unordered',
      tests: [[['a1b2'], ['a1b2', 'a1B2', 'A1b2', 'A1B2']], [['3z4'], ['3z4', '3Z4']], [['12345'], ['12345']], [['C'], ['c', 'C']], [[''], ['']]],
      js: String.raw`function letterCasePermutation(s) {
  const out = [];
  const go = (i, cur) => {
    if (i === s.length) {
      out.push(cur);
      return;
    }
    const c = s[i];
    if (/[a-z]/i.test(c)) {
      go(i + 1, cur + c.toLowerCase());
      go(i + 1, cur + c.toUpperCase());
    } else {
      go(i + 1, cur + c);
    }
  };
  go(0, '');
  return out;
}`,
      py: String.raw`def letter_case_permutation(s):
    out = []
    def go(i, cur):
        if i == len(s):
            out.append(cur)
            return
        c = s[i]
        if c.isalpha():
            go(i + 1, cur + c.lower())
            go(i + 1, cur + c.upper())
        else:
            go(i + 1, cur + c)
    go(0, "")
    return out`,
      explain: `Each letter is a binary choice (lower or upper case), and each digit is a forced single choice. The recursion branches twice at letters and once at digits.

With L letters there are 2^L results. Digits do not multiply the count.

This is Subsets in disguise: choosing which letters to capitalize is choosing a subset of the letter positions.

Iterative alternative: start with [""]. For each character, extend every string in the list. Letters double the list and digits keep its size. Or loop over bitmasks from 0 to 2^L - 1, where bit k says whether the k-th letter is uppercase.

Recognizing that a new problem is "subsets of something" or "a product of independent choices" lets you reuse templates you already trust.`,
      complexity: 'O(n · 2^L) time and output space, L = number of letters',
    },
  ],
};

export default m;
