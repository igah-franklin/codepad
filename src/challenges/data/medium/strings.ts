import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'strings',
  title: 'String Algorithms',
  description: 'Parsing, palindromes, number systems and digit-by-digit arithmetic.',
  challenges: [
    {
      title: 'Longest Palindromic Substring', fn: 'longestPalindrome', args: ['s'],
      prompt: 'Return the longest substring of s that is a palindrome. If several have the same maximum length, return the one that starts first.',
      tests: [[['cbbd'], 'bb'], [['a'], 'a'], [['racecarxyz'], 'racecar'], [['forgeeksskeegfor'], 'geeksskeeg'], [['abcd'], 'a'], [[''], ''], [['aaaa'], 'aaaa']],
      js: String.raw`function longestPalindrome(s) {
  let start = 0, len = 0;
  const expand = (l, r) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    return [l + 1, r - l - 1]; // start, length
  };
  for (let i = 0; i < s.length; i++) {
    for (const [a, b] of [expand(i, i), expand(i, i + 1)]) {
      if (b > len) { start = a; len = b; }
    }
  }
  return s.slice(start, start + len);
}`,
      py: String.raw`def longest_palindrome(s):
    start, length = 0, 0

    def expand(l, r):
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1
            r += 1
        return l + 1, r - l - 1

    for i in range(len(s)):
        for a, b in (expand(i, i), expand(i, i + 1)):
            if b > length:
                start, length = a, b
    return s[start:start + length]`,
      explain: `Expand around the center. Every palindrome mirrors around its middle, so try every possible middle and grow outward while the characters match.

There are 2n - 1 possible centers:
- odd-length palindromes ("aba") are centered on a character: expand(i, i);
- even-length palindromes ("abba") are centered between two characters: expand(i, i + 1).

expand keeps moving l left and r right while s[l] == s[r]. When it stops, the palindrome is s[l + 1 .. r - 1], which has length r - l - 1.

Keep the longest one found. Using strict > keeps the earliest start on ties.

Each expansion is O(n) in the worst case, so the total is O(n²) with O(1) extra space. Dynamic programming is also O(n²) but uses an O(n²) table. Manacher's algorithm does it in O(n), but it is rarely expected in interviews.`,
      complexity: 'O(n²) time, O(1) space',
    },
    {
      title: 'String to Integer (atoi)', fn: 'myAtoi', args: ['s'],
      prompt: 'Parse an integer from s: skip leading spaces, read an optional + or - sign, then read digits until a non-digit. Clamp the result to the 32-bit signed range [-2147483648, 2147483647]. Return 0 if no digits are read.',
      tests: [[['42'], 42], [['   -42'], -42], [['4193 with words'], 4193], [['words and 987'], 0], [['-91283472332'], -2147483648], [['91283472332'], 2147483647], [['+1'], 1], [['+-12'], 0], [[''], 0], [['  0000123'], 123]],
      js: String.raw`function myAtoi(s) {
  const MAX = 2147483647, MIN = -2147483648;
  let i = 0, sign = 1, n = 0;
  while (s[i] === ' ') i++;
  if (s[i] === '+' || s[i] === '-') {
    if (s[i] === '-') sign = -1;
    i++;
  }
  while (i < s.length && s[i] >= '0' && s[i] <= '9') {
    n = n * 10 + (s.charCodeAt(i) - 48);
    if (sign * n > MAX) return MAX;
    if (sign * n < MIN) return MIN;
    i++;
  }
  return sign * n || 0; // avoid -0
}`,
      py: String.raw`def my_atoi(s):
    MAX, MIN = 2**31 - 1, -2**31
    i, n, sign = 0, 0, 1
    while i < len(s) and s[i] == " ":
        i += 1
    if i < len(s) and s[i] in "+-":
        sign = -1 if s[i] == "-" else 1
        i += 1
    while i < len(s) and s[i].isdigit():
        n = n * 10 + int(s[i])
        if sign * n > MAX:
            return MAX
        if sign * n < MIN:
            return MIN
        i += 1
    return sign * n`,
      explain: `Parsing problems are about following the specification exactly. Write it as a sequence of phases, each moving one index forward.

1. Skip spaces.
2. Optional sign: at most one + or -. "+-12" stops right after the + because "-" is not a digit, so the result is 0.
3. Digits: build the number with n = n × 10 + digit (Horner's method from Binary to Decimal).
4. Stop at the first non-digit. Anything after it is ignored.

Clamping: check after each new digit and return the bound immediately. In languages with fixed-size integers you must check before multiplying to avoid overflow. JavaScript numbers are exact well beyond 32 bits, and Python integers never overflow, so checking after each step is safe here.

Leading zeros fall out naturally: 0000123 builds 0, 0, 0, 0, 1, 12, 123.

The JavaScript || 0 turns "-0" into 0. A fiddly detail, but exactly the kind of edge case parsers have to handle.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Zigzag Conversion', fn: 'convert', args: ['s', 'numRows'],
      prompt: 'Write s in a zigzag across numRows rows (down, then diagonally up, repeating), then read the rows left to right. "PAYPALISHIRING" with 3 rows gives "PAHNAPLSIIGYIR".',
      tests: [[['PAYPALISHIRING', 3], 'PAHNAPLSIIGYIR'], [['PAYPALISHIRING', 4], 'PINALSIGYAHRPI'], [['A', 1], 'A'], [['AB', 1], 'AB'], [['ABCD', 2], 'ACBD'], [['ABC', 5], 'ABC']],
      js: String.raw`function convert(s, numRows) {
  if (numRows === 1 || numRows >= s.length) return s;
  const rows = Array.from({ length: numRows }, () => []);
  let r = 0, step = 1;
  for (const c of s) {
    rows[r].push(c);
    if (r === 0) step = 1;
    else if (r === numRows - 1) step = -1;
    r += step;
  }
  return rows.map((row) => row.join('')).join('');
}`,
      py: String.raw`def convert(s, num_rows):
    if num_rows == 1 or num_rows >= len(s):
        return s
    rows = [[] for _ in range(num_rows)]
    r, step = 0, 1
    for c in s:
        rows[r].append(c)
        if r == 0:
            step = 1
        elif r == num_rows - 1:
            step = -1
        r += step
    return "".join("".join(row) for row in rows)`,
      explain: `Simulate the pen moving up and down.

1. Make one bucket per row.
2. Walk through the characters, dropping each into the current row.
3. The row index moves down (+1) until it reaches the bottom row, then up (-1) until it reaches the top, then down again. Flip the direction at each end.
4. Concatenate the rows.

Positions in the visual zigzag do not matter, only which row each character lands on. That is why buckets are enough and there is no need for a 2D grid.

Edge cases: with 1 row there is no zigzag (and the direction flip would break), and with more rows than characters every character gets its own row. Both just return s.

Math alternative: the pattern repeats every 2 × (numRows - 1) characters, so each row's characters can be read directly by index arithmetic. That is the same O(n), with no buckets.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Count and Say', fn: 'countAndSay', args: ['n'],
      prompt: 'The sequence starts with "1". Each next term reads the previous one aloud: "1" is "one 1" → "11", "11" is "two 1s" → "21", then "1211", "111221", ... Return the n-th term (1-based).',
      tests: [[[1], '1'], [[2], '11'], [[3], '21'], [[4], '1211'], [[5], '111221'], [[8], '1113213211']],
      js: String.raw`function countAndSay(n) {
  let s = '1';
  for (let k = 1; k < n; k++) {
    let next = '';
    let i = 0;
    while (i < s.length) {
      let j = i;
      while (j < s.length && s[j] === s[i]) j++;
      next += (j - i) + s[i];
      i = j;
    }
    s = next;
  }
  return s;
}`,
      py: String.raw`def count_and_say(n):
    s = "1"
    for _ in range(n - 1):
        nxt = []
        i = 0
        while i < len(s):
            j = i
            while j < len(s) and s[j] == s[i]:
                j += 1
            nxt.append(str(j - i) + s[i])
            i = j
        s = "".join(nxt)
    return s`,
      explain: `Each term is the run-length encoding of the previous term, with the count written before the digit. It is the Run-Length Encoding challenge from Easy with the order swapped.

1. Start from "1".
2. Repeat n - 1 times: scan the current string in runs of equal digits. For each run, write its length and then the digit.

The inner run-finding loop is the same "advance j while equal, then jump i to j" pattern, so each step is linear in the length of the current term.

The terms grow by about 30% per step (Conway's constant, about 1.3036), so the total work grows exponentially with n, but for the n used here that is still tiny.

The sequence never contains a digit larger than 3, a fun property you can try to prove.`,
      complexity: 'O(total length of all terms) time, O(length of the last term) space',
    },
    {
      title: 'Reverse Words', fn: 'reverseWords', args: ['s'],
      prompt: 'Return the words of s in reverse order, separated by single spaces. s may have leading, trailing or repeated spaces, which should not appear in the output.',
      tests: [[['the sky is blue'], 'blue is sky the'], [['  hello world  '], 'world hello'], [['a good   example'], 'example good a'], [['single'], 'single'], [['   '], '']],
      js: String.raw`function reverseWords(s) {
  const words = [];
  let i = s.length - 1;
  while (i >= 0) {
    while (i >= 0 && s[i] === ' ') i--;
    if (i < 0) break;
    let j = i;
    while (j >= 0 && s[j] !== ' ') j--;
    words.push(s.slice(j + 1, i + 1));
    i = j;
  }
  return words.join(' ');
}`,
      py: String.raw`def reverse_words(s):
    return " ".join(reversed(s.split()))`,
      explain: `The idiomatic answer splits on whitespace (which drops the empty pieces), reverses the list, and joins it with single spaces. In Python that is one line.

The JavaScript version shows the manual technique interviewers sometimes ask for. Scan from the right:
1. Skip spaces.
2. Mark the end of a word, then move left to its start.
3. Take that slice and continue.

Words come out last-first, which is exactly the order we want.

Classic follow-up: reverse the words in place in a character array with O(1) extra space. Reverse the whole array, then reverse each word on its own. "the sky" becomes "yks eht", then "sky the". It uses the same three-reversal trick as rotating an array.

The JavaScript one-liner equivalent: s.trim().split(/\\s+/).reverse().join(' '), with care for the all-spaces case.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'String Compression', fn: 'compressString', args: ['s'],
      prompt: 'Compress runs of repeated characters as character + count ("aabcccccaaa" → "a2b1c5a3"). If the compressed string is not shorter than the original, return the original.',
      tests: [[['aabcccccaaa'], 'a2b1c5a3'], [['abc'], 'abc'], [[''], ''], [['aa'], 'aa'], [['aaa'], 'a3'], [['aabb'], 'aabb']],
      js: String.raw`function compressString(s) {
  const parts = [];
  let i = 0;
  while (i < s.length) {
    let j = i;
    while (j < s.length && s[j] === s[i]) j++;
    parts.push(s[i] + (j - i));
    i = j;
  }
  const out = parts.join('');
  return out.length < s.length ? out : s;
}`,
      py: String.raw`def compress_string(s):
    parts = []
    i = 0
    while i < len(s):
        j = i
        while j < len(s) and s[j] == s[i]:
            j += 1
        parts.append(s[i] + str(j - i))
        i = j
    out = "".join(parts)
    return out if len(out) < len(s) else s`,
      explain: `This is run-length encoding with a practical rule: only use the compressed form when it actually saves space.

1. Encode the runs as in Easy's Run-Length Encoding.
2. Compare lengths. Return the compressed form only if it is strictly shorter.

"aa" compresses to "a2", which is the same length, so the original is returned. "aabb" becomes "a2b2", also the same length.

This is Cracking the Coding Interview problem 1.6. Two points to make in an interview:
- Build the result with a list and join, not with repeated string concatenation, so it stays O(n).
- Optimization: compute the compressed length first and return early if it would not be shorter, which avoids building a string you would throw away.

Real compressors make the same decision: when compression would make the data bigger, they store the original.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Roman to Integer', fn: 'romanToInt', args: ['s'],
      prompt: 'Convert a Roman numeral to an integer. I=1, V=5, X=10, L=50, C=100, D=500, M=1000. A smaller value before a larger one is subtracted (IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900).',
      tests: [[['III'], 3], [['LVIII'], 58], [['MCMXCIV'], 1994], [['IV'], 4], [['IX'], 9], [['MMMCMXCIX'], 3999], [['XLII'], 42]],
      js: String.raw`function romanToInt(s) {
  const v = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = v[s[i]], next = v[s[i + 1]] || 0;
    total += cur < next ? -cur : cur;
  }
  return total;
}`,
      py: String.raw`def roman_to_int(s):
    v = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    total = 0
    for i, ch in enumerate(s):
        cur = v[ch]
        nxt = v[s[i + 1]] if i + 1 < len(s) else 0
        total += -cur if cur < nxt else cur
    return total`,
      explain: `The rule fits in one line: a symbol is subtracted if it is followed by a larger one, and added otherwise.

MCMXCIV:
- M (1000), next is C, which is smaller, so +1000.
- C (100), next is M, which is larger, so -100.
- M, so +1000.
- X, next is C, so -10.
- C, so +100.
- I, next is V, so -1.
- V, so +5.

The total is 1994.

Why does this local rule work? In valid Roman numerals, a subtractive pair (IV, IX, XL, XC, CD, CM) is the only case where a smaller symbol comes before a larger one. You never need to look further ahead than the next character.

A lookup table for the symbol values keeps the code free of a long if-else chain.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Integer to Roman', fn: 'intToRoman', args: ['num'],
      prompt: 'Convert an integer from 1 to 3999 to a Roman numeral, using the subtractive forms (IV, IX, XL, XC, CD, CM).',
      tests: [[[3], 'III'], [[58], 'LVIII'], [[1994], 'MCMXCIV'], [[4], 'IV'], [[3999], 'MMMCMXCIX'], [[40], 'XL'], [[444], 'CDXLIV']],
      js: String.raw`function intToRoman(num) {
  const table = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let out = '';
  for (const [value, sym] of table) {
    while (num >= value) {
      out += sym;
      num -= value;
    }
  }
  return out;
}`,
      py: String.raw`def int_to_roman(num):
    table = [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"),
             (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]
    out = []
    for value, sym in table:
        while num >= value:
            out.append(sym)
            num -= value
    return "".join(out)`,
      explain: `Greedy: always take the largest value that still fits, like counting out change with the biggest coins first.

The trick is to put the subtractive forms in the table as if they were symbols of their own (900 = CM, 400 = CD, and so on). The greedy loop then produces correct numerals with no special cases.

For 1994: M (994 left), CM (94 left), XC (4 left), IV (0 left). The result is MCMXCIV.

Why is greedy correct here? With the subtractive pairs included, the table works like a canonical coin system, and taking the largest symbol that fits always gives the standard numeral.

This is the inverse of Roman to Integer. Writing both, and checking that converting there and back gives the original for every number from 1 to 3999, is a great way to test them.`,
      complexity: 'O(1) time (the output is at most 15 characters), O(1) space',
    },
    {
      title: 'Multiply Strings', fn: 'multiplyStrings', args: ['a', 'b'],
      prompt: 'a and b are non-negative integers written as decimal strings, possibly very long. Return their product as a string without converting the whole strings to numbers (no BigInt or int()).',
      tests: [[['2', '3'], '6'], [['123', '456'], '56088'], [['0', '9999'], '0'], [['999', '999'], '998001'], [['123456789', '987654321'], '121932631112635269'], [['1', '1'], '1']],
      js: String.raw`function multiplyStrings(a, b) {
  const res = new Array(a.length + b.length).fill(0);
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      const mul = (a.charCodeAt(i) - 48) * (b.charCodeAt(j) - 48);
      const sum = mul + res[i + j + 1];
      res[i + j + 1] = sum % 10;
      res[i + j] += Math.floor(sum / 10);
    }
  }
  const s = res.join('').replace(/^0+/, '');
  return s === '' ? '0' : s;
}`,
      py: String.raw`def multiply_strings(a, b):
    res = [0] * (len(a) + len(b))
    for i in range(len(a) - 1, -1, -1):
        for j in range(len(b) - 1, -1, -1):
            mul = (ord(a[i]) - 48) * (ord(b[j]) - 48)
            total = mul + res[i + j + 1]
            res[i + j + 1] = total % 10
            res[i + j] += total // 10
    s = "".join(map(str, res)).lstrip("0")
    return s or "0"`,
      explain: `This is grade-school long multiplication, done digit by digit.

Key fact: digit i of a times digit j of b contributes to result positions i + j (the carry) and i + j + 1 (the units). The product of an m-digit and an n-digit number has at most m + n digits.

1. Allocate m + n zeros.
2. For every pair of digits, from right to left: multiply them, add whatever is already at position i + j + 1, keep the units digit there, and carry the tens to position i + j.
3. Join the digits and strip leading zeros. If everything was stripped, the product is "0".

Why process right to left? So that carries flow toward the more significant positions, exactly as on paper.

Character to digit: charCodeAt(i) - 48, because "0" has character code 48.

This is how arbitrary-precision libraries (BigInt, Python int) work at their core. Faster algorithms such as Karatsuba take over for very large numbers.`,
      complexity: 'O(m·n) time, O(m + n) space',
    },
    {
      title: 'Valid Palindrome II', fn: 'validPalindromeDelete', args: ['s'],
      prompt: 'Return true if s can become a palindrome after deleting at most one character.',
      tests: [[['aba'], true], [['abca'], true], [['abc'], false], [[''], true], [['deeee'], true], [['ebcbbececabbacecbbcbe'], true], [['abcdba'], true], [['abcdeba'], false]],
      js: String.raw`function validPalindromeDelete(s) {
  const isPal = (i, j) => {
    while (i < j) if (s[i++] !== s[j--]) return false;
    return true;
  };
  let i = 0, j = s.length - 1;
  while (i < j) {
    if (s[i] !== s[j]) return isPal(i + 1, j) || isPal(i, j - 1);
    i++;
    j--;
  }
  return true;
}`,
      py: String.raw`def valid_palindrome_delete(s):
    def is_pal(i, j):
        while i < j:
            if s[i] != s[j]:
                return False
            i += 1
            j -= 1
        return True
    i, j = 0, len(s) - 1
    while i < j:
        if s[i] != s[j]:
            return is_pal(i + 1, j) or is_pal(i, j - 1)
        i += 1
        j -= 1
    return True`,
      explain: `Run the usual two-pointer palindrome check. At the first mismatch, one of the two mismatched characters has to be the one you delete, so try both options.

1. Move inward while s[i] == s[j].
2. At the first mismatch, either skip the left character (check s[i+1..j]) or skip the right one (check s[i..j-1]). If either remainder is a palindrome, the answer is yes.

Why only the first mismatch? Every pair matched before it is already fine, and deleting a character inside that matched region would not help.

Each pointer moves at most n steps, and the two extra checks are O(n) each, so the whole thing is O(n). Trying every possible deletion would be O(n²).

The idea generalizes. With up to k deletions allowed, you branch at each mismatch, and the cleaner solution becomes dynamic programming on the longest palindromic subsequence.`,
      complexity: 'O(n) time, O(1) space',
    },
  ],
};

export default m;
