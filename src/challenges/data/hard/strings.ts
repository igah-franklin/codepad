import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'strings',
  title: 'Advanced Strings',
  description: 'KMP, window covering, expression parsing and careful formatting.',
  challenges: [
    {
      title: 'Minimum Window Substring', fn: 'minWindow', args: ['s', 't'],
      prompt: 'Return the shortest substring of s that contains every character of t (including duplicates). Return "" if none exists. The answer is unique.',
      tests: [[['ADOBECODEBANC', 'ABC'], 'BANC'], [['a', 'a'], 'a'], [['a', 'aa'], ''], [['ab', 'b'], 'b'], [['aaflslflsldkalskaaa', 'aaa'], 'aaa'], [['cabwefgewcwaefgcf', 'cae'], 'cwae']],
      js: String.raw`function minWindow(s, t) {
  const need = new Map();
  for (const c of t) need.set(c, (need.get(c) || 0) + 1);
  let missing = t.length; // characters of t still not covered
  let left = 0, bestL = 0, bestLen = Infinity;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (need.has(c)) {
      if (need.get(c) > 0) missing--;
      need.set(c, need.get(c) - 1);
    }
    while (missing === 0) {
      if (right - left + 1 < bestLen) {
        bestLen = right - left + 1;
        bestL = left;
      }
      const d = s[left++];
      if (need.has(d)) {
        need.set(d, need.get(d) + 1);
        if (need.get(d) > 0) missing++;
      }
    }
  }
  return bestLen === Infinity ? '' : s.slice(bestL, bestL + bestLen);
}`,
      py: String.raw`def min_window(s, t):
    need = {}
    for c in t:
        need[c] = need.get(c, 0) + 1
    missing = len(t)
    left = best_l = 0
    best_len = float("inf")
    for right, c in enumerate(s):
        if c in need:
            if need[c] > 0:
                missing -= 1
            need[c] -= 1
        while missing == 0:
            if right - left + 1 < best_len:
                best_len = right - left + 1
                best_l = left
            d = s[left]
            left += 1
            if d in need:
                need[d] += 1
                if need[d] > 0:
                    missing += 1
    return "" if best_len == float("inf") else s[best_l:best_l + best_len]`,
      explain: `This is the hardest sliding-window classic, and it uses the "count satisfied constraints" trick from Find All Anagrams.

State:
- need[c]: how many more copies of c the window still needs. It goes negative when the window has extras.
- missing: the total number of characters of t not yet covered. The window is valid exactly when missing is 0.

Steps:
1. Expand right. If the new character is still needed (need > 0), it reduces missing. Always decrement need[c].
2. While the window is valid, record it if it is the shortest so far, then shrink from the left. Removing a character increments need. If its count rises above 0, the window lost a required character, so missing goes back up and shrinking stops.

Each character enters and leaves the window at most once, so the whole thing is O(|s| + |t|).

Negative counts handle duplicates gracefully. In "aaflsl..." with t = "aaa", extra a's push the count negative and then get released by the shrinking step without breaking validity.`,
      complexity: 'O(|s| + |t|) time, O(alphabet) space',
    },
    {
      title: 'Longest Valid Parentheses', fn: 'longestValidParentheses', args: ['s'],
      prompt: 's contains only "(" and ")". Return the length of the longest substring that is a well-formed parentheses string.',
      tests: [[['(()'], 2], [[')()())'], 4], [[''], 0], [['()(()'], 2], [['()(())'], 6], [['(()))())('], 4], [[')('], 0]],
      js: String.raw`function longestValidParentheses(s) {
  const stack = [-1]; // index before the current valid run
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') stack.push(i);
    else {
      stack.pop();
      if (stack.length === 0) stack.push(i); // unmatched ')' becomes the new base
      else best = Math.max(best, i - stack[stack.length - 1]);
    }
  }
  return best;
}`,
      py: String.raw`def longest_valid_parentheses(s):
    stack = [-1]
    best = 0
    for i, c in enumerate(s):
        if c == "(":
            stack.append(i)
        else:
            stack.pop()
            if not stack:
                stack.append(i)
            else:
                best = max(best, i - stack[-1])
    return best`,
      explain: `Use a stack of indices. Its bottom always holds the index just before the current valid stretch.

1. Start with -1 as the base, an imaginary position before the string.
2. "(": push its index.
3. ")": pop.
- If the stack becomes empty, this ")" had no partner. It is a wall, so push its index as the new base.
- Otherwise, the top of the stack is the index just before the current valid substring, so the length is i - top.

Why does subtracting from the top work? After popping the matched "(", the top is either an unmatched "(" or the last wall. Everything after it, up to i, is balanced.

"()(())": the base -1 stays at the bottom the whole time, so at the end i - (-1) = 6.

The O(1)-space alternative uses two counters with two scans (left to right, then right to left), comparing the counts of "(" and ")". Whenever they are equal you have a valid run, and when they go out of balance you reset. Each direction catches the cases the other misses.

There is also a DP: dp[i] = the longest valid run ending at i.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Find Substring (KMP)', fn: 'strStr', args: ['haystack', 'needle'],
      prompt: 'Return the index of the first occurrence of needle in haystack, or -1. An empty needle matches at 0. Implement the Knuth–Morris–Pratt algorithm for O(n + m) time.',
      tests: [[['sadbutsad', 'sad'], 0], [['leetcode', 'leeto'], -1], [['hello', 'll'], 2], [['aaaaab', 'aab'], 3], [['abc', ''], 0], [['ababcabcabababd', 'ababd'], 10], [['a', 'a'], 0]],
      js: String.raw`function strStr(haystack, needle) {
  if (needle === '') return 0;
  // lps[i] = length of the longest proper prefix of needle[0..i] that is also a suffix
  const lps = new Array(needle.length).fill(0);
  for (let i = 1, len = 0; i < needle.length; ) {
    if (needle[i] === needle[len]) lps[i++] = ++len;
    else if (len > 0) len = lps[len - 1];
    else lps[i++] = 0;
  }
  for (let i = 0, j = 0; i < haystack.length; ) {
    if (haystack[i] === needle[j]) {
      i++;
      j++;
      if (j === needle.length) return i - j;
    } else if (j > 0) j = lps[j - 1]; // fall back without moving i
    else i++;
  }
  return -1;
}`,
      py: String.raw`def str_str(haystack, needle):
    if needle == "":
        return 0
    lps = [0] * len(needle)
    length, i = 0, 1
    while i < len(needle):
        if needle[i] == needle[length]:
            length += 1
            lps[i] = length
            i += 1
        elif length > 0:
            length = lps[length - 1]
        else:
            lps[i] = 0
            i += 1
    i = j = 0
    while i < len(haystack):
        if haystack[i] == needle[j]:
            i += 1
            j += 1
            if j == len(needle):
                return i - j
        elif j > 0:
            j = lps[j - 1]
        else:
            i += 1
    return -1`,
      explain: `The brute-force search restarts the needle after every mismatch, which is O(n × m) in bad cases like "aaaaab" / "aab". KMP never moves backwards in the haystack.

Key idea: when a mismatch happens after matching j characters, you already know those j characters. The longest proper prefix of needle[0..j) that is also a suffix of it tells you how much of the match you can keep.

1. Preprocess: lps[i] = the length of the longest proper prefix of needle[0..i] that is also a suffix. For "ababd": [0, 0, 1, 2, 0].
2. Search: walk the haystack with i and the needle with j.
- On a match, advance both. If j reaches the needle's length, you have found it.
- On a mismatch with j > 0, set j = lps[j - 1] and keep i where it is.
- On a mismatch with j = 0, just advance i.

The lps table is computed with the same matching logic, the needle matched against itself.

i never decreases, and j can only fall back as far as it has advanced, so both phases are linear.

The lps table (also called the prefix function or failure function) also solves Shortest Palindrome and Repeated Substring Pattern in this module.`,
      complexity: 'O(n + m) time, O(m) space',
    },
    {
      title: 'Shortest Palindrome', fn: 'shortestPalindrome', args: ['s'],
      prompt: 'Add characters only to the front of s to make the shortest possible palindrome, and return it.',
      tests: [[['aacecaaa'], 'aaacecaaa'], [['abcd'], 'dcbabcd'], [[''], ''], [['a'], 'a'], [['aba'], 'aba'], [['aabba'], 'abbaabba']],
      js: String.raw`function shortestPalindrome(s) {
  const rev = [...s].reverse().join('');
  const t = s + '#' + rev; // '#' cannot be part of a match across the halves
  const lps = new Array(t.length).fill(0);
  for (let i = 1, len = 0; i < t.length; ) {
    if (t[i] === t[len]) lps[i++] = ++len;
    else if (len > 0) len = lps[len - 1];
    else lps[i++] = 0;
  }
  const palPrefix = lps[t.length - 1]; // longest palindromic prefix of s
  return rev.slice(0, s.length - palPrefix) + s;
}`,
      py: String.raw`def shortest_palindrome(s):
    rev = s[::-1]
    t = s + "#" + rev
    lps = [0] * len(t)
    length, i = 0, 1
    while i < len(t):
        if t[i] == t[length]:
            length += 1
            lps[i] = length
            i += 1
        elif length > 0:
            length = lps[length - 1]
        else:
            lps[i] = 0
            i += 1
    pal_prefix = lps[-1]
    return rev[:len(s) - pal_prefix] + s`,
      explain: `Find the longest prefix of s that is already a palindrome. Then the rest of s, reversed, must be placed in front.

s = "aacecaaa": the longest palindromic prefix is "aacecaa" (7 characters). The leftover "a" reversed goes in front, giving "a" + "aacecaaa".

Finding that prefix fast with KMP:
- A prefix of s is a palindrome exactly when it equals a suffix of reverse(s).
- So build t = s + "#" + reverse(s) and compute its lps table. lps of the last position is the longest prefix of t (which lies inside s) that is also a suffix of t (which lies inside reverse(s)).
- The "#" separator stops a match from running across the middle and becoming longer than s.

The answer is reverse(s)[0 : n - palPrefix] + s.

Brute force checks every prefix for being a palindrome, which is O(n²). KMP makes it O(n).

Transforming a problem into string matching (concatenating with a separator and running the prefix function) is a powerful technique for string problems.`,
      complexity: 'O(n) time and space',
    },
    {
      title: 'Text Justification', fn: 'fullJustify', args: ['words', 'maxWidth'],
      prompt: 'Format words into lines of exactly maxWidth characters. Pack as many words as fit per line. Distribute extra spaces between words as evenly as possible, with extra spaces going to the left gaps first. The last line, and lines with a single word, are left-justified and padded with trailing spaces.',
      tests: [
        [[['This', 'is', 'an', 'example', 'of', 'text', 'justification.'], 16], ['This    is    an', 'example  of text', 'justification.  ']],
        [[['What', 'must', 'be', 'acknowledgment', 'shall', 'be'], 16], ['What   must   be', 'acknowledgment  ', 'shall be        ']],
        [[['a'], 1], ['a']],
        [[['a', 'b', 'c', 'd', 'e'], 3], ['a b', 'c d', 'e  ']],
      ],
      js: String.raw`function fullJustify(words, maxWidth) {
  const lines = [];
  let i = 0;
  while (i < words.length) {
    // greedily take as many words as fit (with single spaces)
    let j = i, len = 0;
    while (j < words.length && len + words[j].length + (j - i) <= maxWidth) len += words[j++].length;
    const gaps = j - i - 1;
    let line;
    if (j === words.length || gaps === 0) {
      line = words.slice(i, j).join(' ');
      line += ' '.repeat(maxWidth - line.length);
    } else {
      const spaces = maxWidth - len;
      const each = Math.floor(spaces / gaps), extra = spaces % gaps;
      line = '';
      for (let k = i; k < j; k++) {
        line += words[k];
        if (k < j - 1) line += ' '.repeat(each + (k - i < extra ? 1 : 0));
      }
    }
    lines.push(line);
    i = j;
  }
  return lines;
}`,
      py: String.raw`def full_justify(words, max_width):
    lines = []
    i = 0
    while i < len(words):
        j, length = i, 0
        while j < len(words) and length + len(words[j]) + (j - i) <= max_width:
            length += len(words[j])
            j += 1
        gaps = j - i - 1
        if j == len(words) or gaps == 0:
            line = " ".join(words[i:j])
            line += " " * (max_width - len(line))
        else:
            spaces = max_width - length
            each, extra = divmod(spaces, gaps)
            parts = []
            for k in range(i, j):
                parts.append(words[k])
                if k < j - 1:
                    parts.append(" " * (each + (1 if k - i < extra else 0)))
            line = "".join(parts)
        lines.append(line)
        i = j
    return lines`,
      explain: `There is no clever algorithm here. The difficulty is in following a detailed specification exactly, which is what this problem tests.

For each line:
1. Pack greedily: add words while (letters so far) + (next word) + (the gaps it would need, one space each) fits in maxWidth.
2. Decide how to justify it:
- The last line, or a line with one word: join with single spaces and pad the right side.
- Otherwise: spaces = maxWidth - letters, spread across gaps = words - 1. Each gap gets spaces // gaps, and the first spaces % gaps gaps get one extra.

Check the first example: "This is an" has 8 letters and 2 gaps, so 8 spaces split 4 + 4, giving "This    is    an".

divmod gives the base gap width and the remainder in one call.

Break the specification into small, separately testable steps (pack, then justify, then pad), and test edge cases such as single-word lines, the last line, and a line where everything fits exactly. Real text layout engines (CSS text-align: justify, TeX) are refined versions of this. TeX uses dynamic programming to choose line breaks that look better.`,
      complexity: 'O(total characters) time and space',
    },
    {
      title: 'Basic Calculator', fn: 'calculate', args: ['s'],
      prompt: 'Evaluate an expression string containing non-negative integers, +, −, parentheses and spaces. "-" may also be unary, as in "-(2+3)". Do not use eval.',
      tests: [[['1 + 1'], 2], [[' 2-1 + 2 '], 3], [['(1+(4+5+2)-3)+(6+8)'], 23], [['-(2+3)'], -5], [['1-(     -2)'], 3], [['2147483647'], 2147483647], [['10 - (2 - (3 - 4))'], 7]],
      js: String.raw`function calculate(s) {
  let result = 0, sign = 1, num = 0;
  const stack = []; // saves [result, sign] at each "("
  for (const c of s) {
    if (c >= '0' && c <= '9') num = num * 10 + (c.charCodeAt(0) - 48);
    else if (c === '+' || c === '-') {
      result += sign * num;
      num = 0;
      sign = c === '+' ? 1 : -1;
    } else if (c === '(') {
      stack.push(result, sign);
      result = 0;
      sign = 1;
    } else if (c === ')') {
      result += sign * num;
      num = 0;
      const prevSign = stack.pop(), prevResult = stack.pop();
      result = prevResult + prevSign * result;
    }
  }
  return result + sign * num;
}`,
      py: String.raw`def calculate(s):
    result, sign, num = 0, 1, 0
    stack = []
    for c in s:
        if c.isdigit():
            num = num * 10 + int(c)
        elif c in "+-":
            result += sign * num
            num = 0
            sign = 1 if c == "+" else -1
        elif c == "(":
            stack.append(result)
            stack.append(sign)
            result, sign = 0, 1
        elif c == ")":
            result += sign * num
            num = 0
            prev_sign = stack.pop()
            prev_result = stack.pop()
            result = prev_result + prev_sign * result
    return result + sign * num`,
      explain: `With only + and -, every term is simply added with a sign. Parentheses create nested contexts, so save the outer state on a stack.

State:
- result: the running total in the current parentheses level.
- sign: the sign of the number being read (+1 or -1).
- num: the digits of the current number.

Rules:
- Digit: num = num × 10 + digit.
- "+" or "-": the current number is complete, so add sign × num to result, then set the sign for the next term.
- "(": push (result, sign), the outer total and the sign in front of the parentheses, and start fresh.
- ")": finish the inner result, then combine: outer result + saved sign × inner result.
- Spaces are ignored.

Unary minus works without special handling. "-(2+3)" starts with result 0, and the "-" becomes "0 - (...)".

Nested signs come out right. In 10 - (2 - (3 - 4)), the innermost group gives -1, then 2 - (-1) = 3, then 10 - 3 = 7. Each ")" multiplies the finished inner result by the sign saved in front of its "(", so double negatives cancel.

General parsers use recursive descent or shunting-yard. This stack approach is the compact interview version.`,
      complexity: 'O(n) time, O(depth) space',
    },
    {
      title: 'Basic Calculator II', fn: 'calculateII', args: ['s'],
      prompt: 'Evaluate an expression with non-negative integers, +, −, *, / and spaces (no parentheses). Division truncates toward zero. Respect precedence: * and / before + and −.',
      tests: [[['3+2*2'], 7], [[' 3/2 '], 1], [[' 3+5 / 2 '], 5], [['14-3/2'], 13], [['2*3*4-10/3'], 21], [['0-7/2'], -3], [['100'], 100]],
      js: String.raw`function calculateII(s) {
  const stack = []; // terms to be added at the end
  let num = 0, op = '+';
  for (let i = 0; i <= s.length; i++) {
    const c = s[i];
    if (c >= '0' && c <= '9') {
      num = num * 10 + (c.charCodeAt(0) - 48);
      continue;
    }
    if (c === ' ') continue;
    // c is an operator or the end: apply the PREVIOUS operator to num
    if (op === '+') stack.push(num);
    else if (op === '-') stack.push(-num);
    else if (op === '*') stack.push(stack.pop() * num);
    else stack.push(Math.trunc(stack.pop() / num));
    op = c;
    num = 0;
  }
  return stack.reduce((a, b) => a + b, 0);
}`,
      py: String.raw`def calculate_ii(s):
    stack = []
    num, op = 0, "+"
    for i in range(len(s) + 1):
        c = s[i] if i < len(s) else "$"
        if c.isdigit():
            num = num * 10 + int(c)
            continue
        if c == " ":
            continue
        if op == "+":
            stack.append(num)
        elif op == "-":
            stack.append(-num)
        elif op == "*":
            stack.append(stack.pop() * num)
        else:
            stack.append(int(stack.pop() / num))
        op = c
        num = 0
    return sum(stack)`,
      explain: `Precedence without parentheses: do * and / immediately, and postpone + and - by turning each term into a signed number to add at the end.

Keep op, the operator that came before the number being read. When the number ends (at the next operator, or at the end of the string), apply op:
- "+": push num.
- "-": push -num, so subtraction becomes adding a negative.
- "*": pop the previous term, multiply, push the result.
- "/": pop, divide truncating toward zero, push.

At the end, sum the stack.

Why does this respect precedence? * and / combine with the term right before them before anything is added, and + and - only ever push new terms.

"14-3/2" becomes the terms [14, -3], then -3 is replaced by trunc(-3 / 2) = -1, so 14 + (-1) = 13. Truncation toward zero means applying division to the signed value. Math.trunc and int(a / b) do that, while Python's // would floor -1.5 to -2.

Iterating one step past the end (or using a "$" sentinel) flushes the last number without duplicating the code.

O(1)-space variant: keep only the last term instead of the whole stack, adding it to the total whenever a + or - arrives.`,
      complexity: 'O(n) time, O(n) space (O(1) with a running total)',
    },
    {
      title: 'Word Break II', fn: 'wordBreakAll', args: ['s', 'words'],
      prompt: 'Return all ways to split s into dictionary words, as sentences with single spaces between words. Any order.',
      compare: 'unordered',
      tests: [[['catsanddog', ['cat', 'cats', 'and', 'sand', 'dog']], ['cats and dog', 'cat sand dog']], [['pineapplepenapple', ['apple', 'pen', 'applepen', 'pine', 'pineapple']], ['pine apple pen apple', 'pineapple pen apple', 'pine applepen apple']], [['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']], []], [['a', ['a']], ['a']]],
      js: String.raw`function wordBreakAll(s, words) {
  const dict = new Set(words);
  const memo = new Map(); // start index -> list of sentences for s[start..]
  const go = (start) => {
    if (start === s.length) return [''];
    if (memo.has(start)) return memo.get(start);
    const out = [];
    for (let end = start + 1; end <= s.length; end++) {
      const w = s.slice(start, end);
      if (!dict.has(w)) continue;
      for (const rest of go(end)) out.push(rest ? w + ' ' + rest : w);
    }
    memo.set(start, out);
    return out;
  };
  return go(0);
}`,
      py: String.raw`def word_break_all(s, words):
    d = set(words)
    memo = {}
    def go(start):
        if start == len(s):
            return [""]
        if start in memo:
            return memo[start]
        out = []
        for end in range(start + 1, len(s) + 1):
            w = s[start:end]
            if w in d:
                for rest in go(end):
                    out.append(w + " " + rest if rest else w)
        memo[start] = out
        return out
    return go(0)`,
      explain: `Word Break answered yes or no. Listing every sentence needs a search, and memoization stops repeated work.

go(start) returns every sentence that can be formed from s[start:]:
1. Try each dictionary word that matches at start.
2. For each, combine it with every sentence of the remainder, go(end).
3. Base: at the end of the string there is exactly one way, the empty sentence [""].

The memo matters. Without it, a remainder reachable by many paths (like "dog" in "catsanddog") would be solved again for every prefix split. With it, each start index is solved once.

Dead ends return [], so failed branches like "catsandog" produce nothing.

Even with memoization, the output itself can be exponential. "aaaa…" with the dictionary ["a", "aa", "aaa"] has a huge number of sentences, so no algorithm can be fast in the worst case. Memoization only avoids recomputation.

Practical tip: first run the boolean Word Break DP, so you can return [] immediately for impossible inputs without exploring.`,
      complexity: 'O(n² + output size) with memoization; the output can be exponential',
    },
    {
      title: 'Repeated Substring Pattern', fn: 'repeatedSubstringPattern', args: ['s'],
      prompt: 'Return true if s can be built by repeating one of its substrings two or more times ("abab" = "ab" × 2).',
      tests: [[['abab'], true], [['aba'], false], [['abcabcabcabc'], true], [['a'], false], [['aaaa'], true], [['abac'], false], [['ababab'], true], [['abaababaab'], true]],
      js: String.raw`function repeatedSubstringPattern(s) {
  // s is periodic iff it appears inside (s + s) with the first and last characters removed
  return (s + s).slice(1, -1).includes(s);
}`,
      py: String.raw`def repeated_substring_pattern(s):
    return s in (s + s)[1:-1]`,
      explain: `There is a one-line trick, and it is worth understanding why it works.

Claim: s is made of a repeated block exactly when s occurs inside (s + s) with its first and last characters removed.

- If s = pp...p (block p repeated k ≥ 2 times), then s + s is p repeated 2k times. Shifting by one block, s appears starting at position |p|, which lies strictly inside, so it survives trimming the ends.
- Conversely, if s appears in s + s at some shift d with 0 < d < n, then s equals its own rotation by d. A string that equals a nontrivial rotation of itself is periodic with a period dividing n, so it is a repeated block.

Removing the first and last characters rules out the two trivial matches at shift 0 and shift n.

includes or in is usually optimized and is fast in practice. For a guaranteed O(n), use KMP: s is periodic exactly when lps[n - 1] > 0 and n % (n - lps[n - 1]) == 0. The smallest period is n - lps[n - 1].

Direct approach: try every block length L that divides n, and check whether s equals s[:L] repeated n / L times. That is O(n × number of divisors).`,
      complexity: 'O(n) expected with built-in search (O(n) guaranteed with KMP)',
    },
    {
      title: 'Valid Number', fn: 'isNumber', args: ['s'],
      prompt: 'Return true if s is a valid decimal number: an optional sign, then digits with an optional single ".", with at least one digit overall; optionally followed by "e"/"E" and an integer exponent (optional sign, at least one digit). No spaces.',
      tests: [[['2'], true], [['0089'], true], [['-0.1'], true], [['+3.14'], true], [['4.'], true], [['-.9'], true], [['2e10'], true], [['-90E3'], true], [['3e+7'], true], [['53.5e93'], true], [['abc'], false], [['1a'], false], [['1e'], false], [['e3'], false], [['99e2.5'], false], [['--6'], false], [['-+3'], false], [['.'], false], [['95a54e53'], false], [['.e1'], false]],
      js: String.raw`function isNumber(s) {
  let seenDigit = false, seenDot = false, seenExp = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c >= '0' && c <= '9') seenDigit = true;
    else if (c === '+' || c === '-') {
      // a sign is allowed only at the start or right after the exponent marker
      if (i > 0 && s[i - 1] !== 'e' && s[i - 1] !== 'E') return false;
    } else if (c === '.') {
      if (seenDot || seenExp) return false;
      seenDot = true;
    } else if (c === 'e' || c === 'E') {
      if (seenExp || !seenDigit) return false;
      seenExp = true;
      seenDigit = false; // the exponent needs its own digits
    } else return false;
  }
  return seenDigit;
}`,
      py: String.raw`def is_number(s):
    seen_digit = seen_dot = seen_exp = False
    for i, c in enumerate(s):
        if c.isdigit():
            seen_digit = True
        elif c in "+-":
            if i > 0 and s[i - 1] not in "eE":
                return False
        elif c == ".":
            if seen_dot or seen_exp:
                return False
            seen_dot = True
        elif c in "eE":
            if seen_exp or not seen_digit:
                return False
            seen_exp = True
            seen_digit = False
        else:
            return False
    return seen_digit`,
      explain: `Validating formats is about turning the grammar into a few precise rules. Three flags are enough here.

Scan the characters:
- Digit: mark seenDigit.
- Sign: only allowed at the very start, or immediately after e or E.
- ".": only one, and never in the exponent, so it must come before any e.
- e or E: only one, and it must come after at least one digit. Then reset seenDigit, because the exponent needs digits of its own.
- Anything else is invalid.

At the end, seenDigit must be true. That rejects ".", "1e" and "+".

Why reset seenDigit at the e? "1e" has a digit before the e but none after it, and resetting makes the final check catch that.

Alternatives:
- A regular expression: ^[+-]?(\\d+\\.?\\d*|\\.\\d+)([eE][+-]?\\d+)?$, compact but hard to debug.
- An explicit finite-state machine with named states and a transition table. It is the most rigorous option, and it is how real lexers work.

The long list of tests is the real lesson: for parsers, write the tricky cases first.`,
      complexity: 'O(n) time, O(1) space',
    },
  ],
};

export default m;
