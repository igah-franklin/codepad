import type { ModuleDef } from '../../types';

const PUZZLE = [
  ['5', '3', '.', '.', '7', '.', '.', '.', '.'],
  ['6', '.', '.', '1', '9', '5', '.', '.', '.'],
  ['.', '9', '8', '.', '.', '.', '.', '6', '.'],
  ['8', '.', '.', '.', '6', '.', '.', '.', '3'],
  ['4', '.', '.', '8', '.', '3', '.', '.', '1'],
  ['7', '.', '.', '.', '2', '.', '.', '.', '6'],
  ['.', '6', '.', '.', '.', '.', '2', '8', '.'],
  ['.', '.', '.', '4', '1', '9', '.', '.', '5'],
  ['.', '.', '.', '.', '8', '.', '.', '7', '9'],
];
const SOLVED = [
  ['5', '3', '4', '6', '7', '8', '9', '1', '2'],
  ['6', '7', '2', '1', '9', '5', '3', '4', '8'],
  ['1', '9', '8', '3', '4', '2', '5', '6', '7'],
  ['8', '5', '9', '7', '6', '1', '4', '2', '3'],
  ['4', '2', '6', '8', '5', '3', '7', '9', '1'],
  ['7', '1', '3', '9', '2', '4', '8', '5', '6'],
  ['9', '6', '1', '5', '3', '7', '2', '8', '4'],
  ['2', '8', '7', '4', '1', '9', '6', '3', '5'],
  ['3', '4', '5', '2', '8', '6', '1', '7', '9'],
];

const m: ModuleDef = {
  id: 'backtracking',
  title: 'Backtracking (Advanced)',
  description: 'Constraint search with pruning: queens, Sudoku, tries and expression building.',
  challenges: [
    {
      title: 'N-Queens', fn: 'solveNQueens', args: ['n'],
      prompt: 'Place n queens on an n×n chessboard so that no two attack each other. Return every solution as a list of rows, where "Q" is a queen and "." is empty. Solutions may be in any order.',
      compare: 'unordered',
      tests: [[[4], [['.Q..', '...Q', 'Q...', '..Q.'], ['..Q.', 'Q...', '...Q', '.Q..']]], [[1], [['Q']]], [[2], []], [[3], []]],
      js: String.raw`function solveNQueens(n) {
  const out = [], cols = new Set(), d1 = new Set(), d2 = new Set(), place = [];
  const go = (r) => {
    if (r === n) {
      out.push(place.map((c) => '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)));
      return;
    }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue;
      cols.add(c); d1.add(r - c); d2.add(r + c); place.push(c);
      go(r + 1);
      cols.delete(c); d1.delete(r - c); d2.delete(r + c); place.pop();
    }
  };
  go(0);
  return out;
}`,
      py: String.raw`def solve_n_queens(n):
    out, place = [], []
    cols, d1, d2 = set(), set(), set()
    def go(r):
        if r == n:
            out.append(["." * c + "Q" + "." * (n - c - 1) for c in place])
            return
        for c in range(n):
            if c in cols or (r - c) in d1 or (r + c) in d2:
                continue
            cols.add(c); d1.add(r - c); d2.add(r + c); place.append(c)
            go(r + 1)
            cols.remove(c); d1.remove(r - c); d2.remove(r + c); place.pop()
    go(0)
    return out`,
      explain: `Place one queen per row, which removes row conflicts by construction. Then choose a column for each row.

Conflict checks in O(1) using three sets:
- columns in use;
- "\\" diagonals: cells on the same one share the same r - c;
- "/" diagonals: cells on the same one share the same r + c.

go(r):
1. For each column c, skip it if the column or either diagonal is taken.
2. Otherwise place the queen (add to all three sets), recurse to row r + 1, then remove it (backtrack).
3. When r reaches n, every queen is placed, so render the board.

Pruning is what keeps this fast. Each row only tries safe columns, so the search never builds an invalid board. Without pruning there would be n^n configurations to try.

Counts of solutions: n = 4 has 2, n = 8 has 92, and n = 2 or 3 has none.

The r - c and r + c diagonal trick is worth memorizing. It turns a geometric check into a set lookup.`,
      complexity: 'O(n!) time roughly, O(n) recursion space',
    },
    {
      title: 'N-Queens II', fn: 'totalNQueens', args: ['n'],
      prompt: 'Return the number of distinct solutions to the n-queens puzzle.',
      tests: [[[1], 1], [[2], 0], [[4], 2], [[5], 10], [[6], 4], [[8], 92]],
      js: String.raw`function totalNQueens(n) {
  // bitmasks: 1 bits = attacked positions in the current row
  const all = (1 << n) - 1;
  const go = (cols, d1, d2) => {
    if (cols === all) return 1;
    let count = 0;
    let free = all & ~(cols | d1 | d2);
    while (free) {
      const bit = free & -free; // lowest free column
      free -= bit;
      count += go(cols | bit, ((d1 | bit) << 1) & all, (d2 | bit) >> 1);
    }
    return count;
  };
  return go(0, 0, 0);
}`,
      py: String.raw`def total_n_queens(n):
    full = (1 << n) - 1
    def go(cols, d1, d2):
        if cols == full:
            return 1
        count = 0
        free = full & ~(cols | d1 | d2)
        while free:
            bit = free & -free
            free -= bit
            count += go(cols | bit, ((d1 | bit) << 1) & full, (d2 | bit) >> 1)
        return count
    return go(0, 0, 0)`,
      explain: `Counting is the same search as N-Queens, without building boards, so it can be made much faster with bitmasks.

Represent the attacked columns in the current row as three n-bit integers:
- cols: columns already holding a queen.
- d1: squares attacked by "\\" diagonals. Shift it left by one for each row you go down.
- d2: squares attacked by "/" diagonals. Shift it right by one for each row.

free = all bits not attacked = all & ~(cols | d1 | d2).

Loop over the free positions with the lowest-set-bit trick: bit = free & -free isolates the lowest 1 bit. Remove it with free -= bit, place a queen there, and recurse with the updated masks.

Why shift? A queen attacks diagonally, one column further left or right in each row below. Shifting the whole mask by one moves every diagonal attack into the next row at once.

This is the classic fast N-Queens. Each step is a few machine instructions instead of set operations. It is a good showcase of bit manipulation, which the next module covers more fully.`,
      complexity: 'O(n!) worst case but very fast in practice, O(n) space',
    },
    {
      title: 'Sudoku Solver', fn: 'solveSudoku', args: ['board'],
      prompt: 'Fill the empty cells (".") of the 9×9 Sudoku so that every row, column and 3×3 box contains 1–9 exactly once. The puzzle has exactly one solution. Fill the board in place and return it.',
      tests: [[[PUZZLE], SOLVED]],
      js: String.raw`function solveSudoku(board) {
  const rows = Array.from({ length: 9 }, () => new Set());
  const cols = Array.from({ length: 9 }, () => new Set());
  const boxes = Array.from({ length: 9 }, () => new Set());
  const empty = [];
  const box = (r, c) => Math.floor(r / 3) * 3 + Math.floor(c / 3);
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) {
      const v = board[r][c];
      if (v === '.') empty.push([r, c]);
      else { rows[r].add(v); cols[c].add(v); boxes[box(r, c)].add(v); }
    }
  const go = (k) => {
    if (k === empty.length) return true;
    const [r, c] = empty[k], b = box(r, c);
    for (let d = 1; d <= 9; d++) {
      const v = String(d);
      if (rows[r].has(v) || cols[c].has(v) || boxes[b].has(v)) continue;
      board[r][c] = v; rows[r].add(v); cols[c].add(v); boxes[b].add(v);
      if (go(k + 1)) return true;
      board[r][c] = '.'; rows[r].delete(v); cols[c].delete(v); boxes[b].delete(v);
    }
    return false; // no digit fits: backtrack
  };
  go(0);
  return board;
}`,
      py: String.raw`def solve_sudoku(board):
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    empty = []
    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if v == ".":
                empty.append((r, c))
            else:
                rows[r].add(v); cols[c].add(v); boxes[r // 3 * 3 + c // 3].add(v)
    def go(k):
        if k == len(empty):
            return True
        r, c = empty[k]
        b = r // 3 * 3 + c // 3
        for v in "123456789":
            if v in rows[r] or v in cols[c] or v in boxes[b]:
                continue
            board[r][c] = v; rows[r].add(v); cols[c].add(v); boxes[b].add(v)
            if go(k + 1):
                return True
            board[r][c] = "."; rows[r].remove(v); cols[c].remove(v); boxes[b].remove(v)
        return False
    go(0)
    return board`,
      explain: `This is classic constraint backtracking. Fill the empty cells one at a time, trying every digit that is still legal.

1. Precompute the digits used in each row, column and box as sets, so legality checks are O(1). Record the list of empty cells.
2. go(k) fills empty cell k:
- Try digits 1 to 9 that are not in the cell's row, column or box sets.
- Place one, update the sets, and recurse to k + 1.
- If the recursion succeeds, stop: the board is solved. If not, undo and try the next digit.
- If no digit fits, return false so the previous cell tries something else.

Returning true or false lets the recursion stop at the first full solution instead of exploring everything.

A big speedup is the "minimum remaining values" heuristic: always fill the empty cell with the fewest legal digits next. Forced moves happen first, which cuts the branching dramatically. Real solvers add constraint propagation (naked singles, hidden pairs) or Knuth's Dancing Links (Algorithm X) for exact cover.

Valid Sudoku (in Medium) is the checking half of this problem.`,
      complexity: 'Exponential worst case; fast for real puzzles. O(81) space',
    },
    {
      title: 'Word Search II', fn: 'findWords', args: ['board', 'words'],
      prompt: 'Return every word from the list that can be traced on the board (adjacent cells horizontally or vertically, no cell reused within a word). Any order.',
      compare: 'unordered',
      tests: [[[[['o', 'a', 'a', 'n'], ['e', 't', 'a', 'e'], ['i', 'h', 'k', 'r'], ['i', 'f', 'l', 'v']], ['oath', 'pea', 'eat', 'rain']], ['eat', 'oath']], [[[['a', 'b'], ['c', 'd']], ['abcb']], []], [[[['a']], ['a', 'b']], ['a']], [[[['a', 'b'], ['c', 'd']], ['ab', 'abdc', 'acdb', 'bd', 'x']], ['ab', 'abdc', 'acdb', 'bd']]],
      js: String.raw`function findWords(board, words) {
  // build a trie; store the full word at its last node
  const root = {};
  for (const w of words) {
    let node = root;
    for (const c of w) node = node[c] || (node[c] = {});
    node.$ = w;
  }
  const R = board.length, C = board[0].length, found = [];
  const dfs = (r, c, parent) => {
    const ch = board[r][c], node = parent[ch];
    if (!node) return;
    if (node.$) { found.push(node.$); delete node.$; } // avoid duplicates
    board[r][c] = '#';
    for (const [a, b] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (a >= 0 && a < R && b >= 0 && b < C && board[a][b] !== '#') dfs(a, b, node);
    }
    board[r][c] = ch;
    if (Object.keys(node).length === 0) delete parent[ch]; // prune finished branches
  };
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) dfs(r, c, root);
  return found;
}`,
      py: String.raw`def find_words(board, words):
    root = {}
    for w in words:
        node = root
        for c in w:
            node = node.setdefault(c, {})
        node["$"] = w
    R, C = len(board), len(board[0])
    found = []
    def dfs(r, c, parent):
        ch = board[r][c]
        node = parent.get(ch)
        if node is None:
            return
        if "$" in node:
            found.append(node.pop("$"))
        board[r][c] = "#"
        for a, b in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= a < R and 0 <= b < C and board[a][b] != "#":
                dfs(a, b, node)
        board[r][c] = ch
        if not node:
            del parent[ch]
    for r in range(R):
        for c in range(C):
            dfs(r, c, root)
    return found`,
      explain: `Running Word Search once per word repeats the same grid exploration for every word that shares a prefix. A trie (prefix tree) lets one DFS check every word at once.

1. Insert all the words into a trie, marking word ends (here, by storing the word itself at its last node).
2. DFS from every cell, walking the trie alongside the grid. If the current letter has no trie child, no word continues this way, so stop immediately. That is the key pruning.
3. When a node holds a word, record it, then remove the mark so it is not reported twice.
4. Mark cells as used during the path and restore them afterwards (backtracking, as in Word Search).
5. Optimization: after exploring a node, delete it from its parent if it has no children left. Later searches then skip branches that are already exhausted.

The trie turns many separate searches into one shared search, and pruning keeps it fast even with thousands of words.

A trie node here is just a dictionary from letter to child node. That is the simplest representation, and you will build a trie class in the Design module.`,
      complexity: 'O(R·C·4·3^(L-1)) worst case for max word length L; trie build O(total letters)',
    },
    {
      title: 'Combination Sum II', fn: 'combinationSum2', args: ['candidates', 'target'],
      prompt: 'candidates may contain duplicates. Return all unique combinations that sum to target, where each candidate may be used at most once. No duplicate combinations.',
      compare: 'unorderedDeep',
      tests: [[[[10, 1, 2, 7, 6, 1, 5], 8], [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]]], [[[2, 5, 2, 1, 2], 5], [[1, 2, 2], [5]]], [[[1], 2], []], [[[1, 1, 1, 1], 2], [[1, 1]]], [[[3, 1, 3, 5, 1, 1], 8], [[1, 1, 1, 5], [1, 1, 3, 3], [3, 5]]]],
      js: String.raw`function combinationSum2(candidates, target) {
  const c = candidates.slice().sort((a, b) => a - b);
  const out = [], cur = [];
  const go = (start, remain) => {
    if (remain === 0) {
      out.push(cur.slice());
      return;
    }
    for (let i = start; i < c.length && c[i] <= remain; i++) {
      if (i > start && c[i] === c[i - 1]) continue; // same value at the same level = duplicate
      cur.push(c[i]);
      go(i + 1, remain - c[i]); // i + 1: each element at most once
      cur.pop();
    }
  };
  go(0, target);
  return out;
}`,
      py: String.raw`def combination_sum2(candidates, target):
    c = sorted(candidates)
    out, cur = [], []
    def go(start, remain):
        if remain == 0:
            out.append(cur[:])
            return
        for i in range(start, len(c)):
            if c[i] > remain:
                break
            if i > start and c[i] == c[i - 1]:
                continue
            cur.append(c[i])
            go(i + 1, remain - c[i])
            cur.pop()
    go(0, target)
    return out`,
      explain: `This combines two templates from Medium:
- Combination Sum: build sums with a remaining target and prune once a candidate exceeds it.
- Subsets II: sort, then skip equal values among siblings to avoid duplicate results.

What changes from Combination Sum:
1. Recurse with i + 1 instead of i, because each element can be used at most once.
2. Skip duplicates at the same level with if (i > start && c[i] === c[i - 1]) continue.

The second rule allows [1, 1, 6], using two different 1s at different depths, but prevents generating [1, 2, 5] twice from the two 1s at the same depth.

Sorting enables both the duplicate skip (equal values become adjacent) and the early break (once c[i] > remain, every later value is too big).

Getting duplicate handling right is the most common difficulty in backtracking. "Sort, then skip equal siblings" fixes nearly all of these problems.`,
      complexity: 'O(2^n) worst case, O(n) recursion depth',
    },
    {
      title: 'Permutations II', fn: 'permuteUnique', args: ['nums'],
      prompt: 'nums may contain duplicates. Return all unique permutations, in any order.',
      compare: 'unordered',
      tests: [[[[1, 1, 2]], [[1, 1, 2], [1, 2, 1], [2, 1, 1]]], [[[1, 2, 3]], [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]], [[[2, 2, 2]], [[2, 2, 2]]], [[[0, 1, 0, 0]], [[0, 0, 0, 1], [0, 0, 1, 0], [0, 1, 0, 0], [1, 0, 0, 0]]]],
      js: String.raw`function permuteUnique(nums) {
  const a = nums.slice().sort((x, y) => x - y);
  const used = new Array(a.length).fill(false), cur = [], out = [];
  const go = () => {
    if (cur.length === a.length) {
      out.push(cur.slice());
      return;
    }
    for (let i = 0; i < a.length; i++) {
      if (used[i]) continue;
      // among equal values, only use them in left-to-right order
      if (i > 0 && a[i] === a[i - 1] && !used[i - 1]) continue;
      used[i] = true;
      cur.push(a[i]);
      go();
      cur.pop();
      used[i] = false;
    }
  };
  go();
  return out;
}`,
      py: String.raw`def permute_unique(nums):
    a = sorted(nums)
    used = [False] * len(a)
    cur, out = [], []
    def go():
        if len(cur) == len(a):
            out.append(cur[:])
            return
        for i in range(len(a)):
            if used[i]:
                continue
            if i > 0 and a[i] == a[i - 1] and not used[i - 1]:
                continue
            used[i] = True
            cur.append(a[i])
            go()
            cur.pop()
            used[i] = False
    go()
    return out`,
      explain: `This is the Permutations template plus a duplicate rule.

With [1a, 1b, 2], the orders "1a 1b 2" and "1b 1a 2" are the same permutation. To generate each distinct permutation once, make sure equal values are always used in a fixed order: 1a before 1b.

Rule: skip a[i] if it equals a[i - 1] and a[i - 1] is not currently used.

Read it as: "you may only use the second copy of a value once the first copy is already placed in the current permutation". That forces equal values to appear in their sorted order, so each distinct arrangement corresponds to exactly one way of choosing them.

Sorting puts equal values next to each other, which is why comparing with a[i - 1] is enough.

Alternative: at each position, use a set of values already tried at that position, and skip repeats. It needs no sorting, but uses extra memory per level.

The number of results is the multinomial n! / (count1! × count2! × ...). [0, 1, 0, 0] gives 4! / 3! = 4.`,
      complexity: 'O(n · n!) worst case, O(n) space',
    },
    {
      title: 'Restore IP Addresses', fn: 'restoreIpAddresses', args: ['s'],
      prompt: 'Return every valid IPv4 address that can be formed by inserting three dots into the digit string s. Each part must be 0–255 with no leading zeros (except "0" itself). Any order.',
      compare: 'unordered',
      tests: [[['25525511135'], ['255.255.11.135', '255.255.111.35']], [['0000'], ['0.0.0.0']], [['101023'], ['1.0.10.23', '1.0.102.3', '10.1.0.23', '10.10.2.3', '101.0.2.3']], [['1111'], ['1.1.1.1']], [['123'], []], [['256256256256'], []]],
      js: String.raw`function restoreIpAddresses(s) {
  const out = [], parts = [];
  const valid = (p) => p.length <= 3 && (p === '0' || (p[0] !== '0' && Number(p) <= 255));
  const go = (start) => {
    const left = 4 - parts.length, remaining = s.length - start;
    if (remaining < left || remaining > left * 3) return; // prune impossible lengths
    if (parts.length === 4) {
      out.push(parts.join('.'));
      return;
    }
    for (let len = 1; len <= 3 && start + len <= s.length; len++) {
      const p = s.slice(start, start + len);
      if (!valid(p)) continue;
      parts.push(p);
      go(start + len);
      parts.pop();
    }
  };
  go(0);
  return out;
}`,
      py: String.raw`def restore_ip_addresses(s):
    out, parts = [], []
    def valid(p):
        return len(p) <= 3 and (p == "0" or (p[0] != "0" and int(p) <= 255))
    def go(start):
        left, remaining = 4 - len(parts), len(s) - start
        if remaining < left or remaining > left * 3:
            return
        if len(parts) == 4:
            out.append(".".join(parts))
            return
        for length in range(1, 4):
            if start + length > len(s):
                break
            p = s[start:start + length]
            if valid(p):
                parts.append(p)
                go(start + length)
                parts.pop()
    go(0)
    return out`,
      explain: `This is the string-splitting backtracking from Palindrome Partitioning, with exactly 4 pieces and a different validity check.

At each step, take the next 1, 2 or 3 digits as a part, if they form a valid octet:
- "0" is allowed, but "01" and "00" are not (no leading zeros);
- the value must be at most 255.

Recurse until there are 4 parts that use up every digit.

Length pruning makes it efficient. With k parts still to place and r digits remaining, you need k ≤ r ≤ 3k. If not, return immediately. "123" fails at once (3 digits cannot make 4 parts), and so does a 13-digit string.

Bounded search space: there are at most 3^4 = 81 ways to split, so this is effectively O(1) for any input. Pruning matters more for problems where the space is not bounded.

Validating each part during the search, rather than building whole candidates and filtering at the end, is the backtracking habit that pays off on bigger problems.`,
      complexity: 'O(3^4) = O(1) splits, each O(|s|) to build',
    },
    {
      title: 'Expression Add Operators', fn: 'addOperators', args: ['num', 'target'],
      prompt: 'Insert +, − or * between the digits of num (or leave digits joined) so the expression evaluates to target. Return all such expressions. Numbers may not have leading zeros (but "0" is fine). Any order.',
      compare: 'unordered',
      tests: [[['123', 6], ['1+2+3', '1*2*3']], [['232', 8], ['2*3+2', '2+3*2']], [['3456237490', 9191], []], [['105', 5], ['1*0+5', '10-5']], [['00', 0], ['0+0', '0-0', '0*0']], [['5', 5], ['5']]],
      js: String.raw`function addOperators(num, target) {
  const out = [];
  // value = result so far; last = value of the last term (needed to undo it for *)
  const go = (i, expr, value, last) => {
    if (i === num.length) {
      if (value === target) out.push(expr);
      return;
    }
    for (let j = i + 1; j <= num.length; j++) {
      const s = num.slice(i, j);
      if (s.length > 1 && s[0] === '0') break; // no leading zeros
      const n = Number(s);
      if (i === 0) {
        go(j, s, n, n);
      } else {
        go(j, expr + '+' + s, value + n, n);
        go(j, expr + '-' + s, value - n, -n);
        go(j, expr + '*' + s, value - last + last * n, last * n); // replace last term by last * n
      }
    }
  };
  go(0, '', 0, 0);
  return out;
}`,
      py: String.raw`def add_operators(num, target):
    out = []
    def go(i, expr, value, last):
        if i == len(num):
            if value == target:
                out.append(expr)
            return
        for j in range(i + 1, len(num) + 1):
            s = num[i:j]
            if len(s) > 1 and s[0] == "0":
                break
            n = int(s)
            if i == 0:
                go(j, s, n, n)
            else:
                go(j, expr + "+" + s, value + n, n)
                go(j, expr + "-" + s, value - n, -n)
                go(j, expr + "*" + s, value - last + last * n, last * n)
    go(0, "", 0, 0)
    return out`,
      explain: `At each position, choose how many digits form the next number, and which operator goes before it.

The hard part is multiplication's precedence. If the running value is 1 + 2 and you then multiply by 3, the answer must be 1 + 2×3 = 7, not (1 + 2)×3 = 9.

The trick: remember the last term added (last).
- "+" n: value + n, and last becomes n.
- "-" n: value - n, and last becomes -n.
- "*" n: undo the last term and add it back multiplied: value - last + last × n, and last becomes last × n.

This handles chains like 2×3×4 correctly, because last keeps accumulating the product of the current term.

The first number has no operator in front of it, so handle it separately.

Leading zeros: once a number starts with "0", it can only be "0" itself, so stop extending it (the break).

With 3 operators and many ways to cut numbers, the search space is about 4^n, and this problem shows how carrying the right state (value and last) avoids having to parse each candidate expression.`,
      complexity: 'O(4^n · n) time, O(n) recursion depth',
    },
    {
      title: 'Palindrome Partitioning II', fn: 'minCut', args: ['s'],
      prompt: 'Return the minimum number of cuts needed to partition s so that every piece is a palindrome.',
      tests: [[['aab'], 1], [['a'], 0], [['ab'], 1], [['aba'], 0], [['abcde'], 4], [['abacdc'], 1], [['cabababcbc'], 3]],
      js: String.raw`function minCut(s) {
  const n = s.length;
  // cuts[i] = min cuts for s[0..i)
  const cuts = Array.from({ length: n + 1 }, (_, i) => i - 1);
  for (let center = 0; center < n; center++) {
    // expand palindromes around this center; each one ending at r allows cuts[r+1] = cuts[l] + 1
    for (const [l0, r0] of [[center, center], [center, center + 1]]) {
      let l = l0, r = r0;
      while (l >= 0 && r < n && s[l] === s[r]) {
        cuts[r + 1] = Math.min(cuts[r + 1], cuts[l] + 1);
        l--;
        r++;
      }
    }
  }
  return cuts[n];
}`,
      py: String.raw`def min_cut(s):
    n = len(s)
    cuts = [i - 1 for i in range(n + 1)]
    for center in range(n):
        for l, r in ((center, center), (center, center + 1)):
            while l >= 0 and r < n and s[l] == s[r]:
                cuts[r + 1] = min(cuts[r + 1], cuts[l] + 1)
                l -= 1
                r += 1
    return cuts[n]`,
      explain: `Listing every partition (as in Palindrome Partitioning) is exponential. Asking only for the minimum makes it a DP.

cuts[i] = the minimum cuts for the prefix s[0..i). If the last piece is a palindrome s[l..r], then cuts[r + 1] = cuts[l] + 1.

Base: cuts[0] = -1. The empty prefix needs no pieces, and that -1 cancels the "+1" when the whole prefix is a single palindrome, giving 0 cuts. The starting values i - 1 are the worst case (cut between every character).

Instead of checking every substring for being a palindrome, enumerate the palindromes directly by expanding around each center (odd and even lengths), the same technique as Longest Palindromic Substring. Every palindrome s[l..r] found gives the update cuts[r + 1] = min(cuts[r + 1], cuts[l] + 1).

Is the order safe? When we use cuts[l], is it final? Every palindrome ending before l has a center at or before l, and all of those have already been processed. So yes.

Total work is O(n²): one expansion per center, at most O(n) each, with O(n) space.`,
      complexity: 'O(n²) time, O(n) space',
    },
    {
      title: 'Beautiful Arrangement', fn: 'countArrangement', args: ['n'],
      prompt: 'A permutation perm of 1..n is beautiful if for every position i (1-based), perm[i] is divisible by i or i is divisible by perm[i]. Return how many beautiful arrangements exist.',
      tests: [[[1], 1], [[2], 2], [[3], 3], [[4], 8], [[6], 36], [[10], 700]],
      js: String.raw`function countArrangement(n) {
  const used = new Array(n + 1).fill(false);
  // fill positions from n down to 1: large positions have the fewest valid numbers, so pruning kicks in early
  const go = (pos) => {
    if (pos === 0) return 1;
    let count = 0;
    for (let v = 1; v <= n; v++) {
      if (used[v] || (v % pos !== 0 && pos % v !== 0)) continue;
      used[v] = true;
      count += go(pos - 1);
      used[v] = false;
    }
    return count;
  };
  return go(n);
}`,
      py: String.raw`def count_arrangement(n):
    used = [False] * (n + 1)
    def go(pos):
        if pos == 0:
            return 1
        count = 0
        for v in range(1, n + 1):
            if used[v] or (v % pos and pos % v):
                continue
            used[v] = True
            count += go(pos - 1)
            used[v] = False
        return count
    return go(n)`,
      explain: `Count permutations with a constraint on every position by placing numbers one position at a time and pruning immediately.

1. For the current position, try every unused number that satisfies the divisibility rule with that position.
2. Recurse to the next position, then backtrack.
3. A complete placement counts as 1.

Ordering trick: fill positions from n down to 1. Large positions have few valid numbers (their divisors and multiples), so the search hits dead ends early and prunes more. Position 1 accepts every number, so leaving it for last costs nothing.

Choosing the most constrained decision first (the "fail-first" heuristic) is the same idea as the minimum-remaining-values heuristic in Sudoku. It can speed up a backtracking search by orders of magnitude.

For even more speed: memoize on the set of used numbers as a bitmask. dp[mask] = the number of ways to finish. That gives O(n × 2^n), a technique called bitmask DP.`,
      complexity: 'O(k) where k is the number of valid partial arrangements; O(n) recursion depth',
    },
  ],
};

export default m;
