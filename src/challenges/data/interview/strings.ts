import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'strings',
  title: 'String Classics',
  description: 'Phone-screen favourites: uniqueness, edits, rotations, binary strings and spelling numbers.',
  challenges: [
    {
      title: 'Is Unique', fn: 'isUnique', args: ['s'],
      prompt: 'Return true if every character in s is distinct. Then think about how you would do it with no additional data structures.',
      tests: [[['abcde'], true], [['hello'], false], [[''], true], [['a'], true], [['aA'], true], [['abcdefghijklmnopqrstuvwxyza'], false]],
      js: String.raw`function isUnique(s) {
  if (s.length > 128) return false; // pigeonhole for ASCII
  const seen = new Set();
  for (const c of s) {
    if (seen.has(c)) return false;
    seen.add(c);
  }
  return true;
}`,
      py: String.raw`def is_unique(s):
    if len(s) > 128:
        return False
    seen = set()
    for c in s:
        if c in seen:
            return False
        seen.add(c)
    return True`,
      explain: `This is Cracking the Coding Interview problem 1.1, a warm-up that is really about discussing options.

1. Set of seen characters (used here): O(n) time and O(alphabet) space, with an exit at the first repeat.
2. Pigeonhole shortcut: with an alphabet of 128 ASCII characters, any longer string must contain a repeat. Ask the interviewer what character set to assume.
3. Bit vector: for lowercase a to z, a single 32-bit integer works as the set. Bit c - 'a' marks a letter as seen. That is O(1) space.
4. No extra data structures: compare every pair (O(n²)), or sort and check neighbors (O(n log n), but sorting may need space or modify the input).

Case matters: 'a' and 'A' are different characters unless the problem says otherwise, so clarify it.

The answer the interviewer wants is less a particular solution than hearing you weigh time, space and the assumptions you are making.`,
      complexity: 'O(n) time, O(min(n, alphabet)) space',
    },
    {
      title: 'Palindrome Permutation', fn: 'palindromePermutation', args: ['s'],
      prompt: 'Return true if the letters of s can be rearranged into a palindrome. Ignore spaces and letter case. "Tact Coa" → true ("taco cat").',
      tests: [[['Tact Coa'], true], [['code'], false], [['aab'], true], [[''], true], [['carerac'], true], [['ab'], false], [['A a'], true]],
      js: String.raw`function palindromePermutation(s) {
  const odd = new Set(); // characters with an odd count so far
  for (const c of s.toLowerCase()) {
    if (c === ' ') continue;
    if (odd.has(c)) odd.delete(c);
    else odd.add(c);
  }
  return odd.size <= 1;
}`,
      py: String.raw`def palindrome_permutation(s):
    odd = set()
    for c in s.lower():
        if c == " ":
            continue
        odd ^= {c}  # toggle membership
    return len(odd) <= 1`,
      explain: `You do not need to produce the palindrome, only to know whether one exists.

In a palindrome, characters pair up around the center. So every character count must be even, except that one character may have an odd count (the middle of an odd-length palindrome).

Track parity with a toggle set: add a character the first time, remove it the next time, add it again on the third. At the end, the set holds exactly the characters with odd counts. The answer is yes if there is at most one.

"Tact Coa" (ignoring the space and case): t:2, a:2, c:2, o:1. Only o is odd, so it can be rearranged ("taco cat").

A frequency map plus a count of odd values works the same way. The toggle set does it in one pass with less bookkeeping.

Bit-vector version: XOR a bit for each letter. A palindrome is possible if the final mask is 0 or has exactly one bit set. Test that with mask & (mask - 1) == 0, which is Kernighan's trick again.

Normalizing the input (lowercasing, ignoring spaces) is part of reading the problem carefully.`,
      complexity: 'O(n) time, O(alphabet) space',
    },
    {
      title: 'One Edit Away', fn: 'oneEditAway', args: ['a', 'b'],
      prompt: 'There are three edits: insert a character, remove a character, or replace a character. Return true if a and b are at most one edit apart.',
      tests: [[['pale', 'ple'], true], [['pales', 'pale'], true], [['pale', 'bale'], true], [['pale', 'bake'], false], [['', ''], true], [['', 'ab'], false], [['abc', 'abc'], true], [['ab', 'ba'], false]],
      js: String.raw`function oneEditAway(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a.length > b.length) [a, b] = [b, a]; // a is the shorter one
  let i = 0, j = 0, edited = false;
  while (i < a.length && j < b.length) {
    if (a[i] !== b[j]) {
      if (edited) return false;
      edited = true;
      if (a.length === b.length) i++; // replace: advance both
      // insert into a: advance only b
    } else i++;
    j++;
  }
  return true;
}`,
      py: String.raw`def one_edit_away(a, b):
    if abs(len(a) - len(b)) > 1:
        return False
    if len(a) > len(b):
        a, b = b, a
    i = j = 0
    edited = False
    while i < len(a) and j < len(b):
        if a[i] != b[j]:
            if edited:
                return False
            edited = True
            if len(a) == len(b):
                i += 1
        else:
            i += 1
        j += 1
    return True`,
      explain: `This is Edit Distance (from Hard DP) limited to at most 1, which makes it O(n) with no table at all.

1. If the lengths differ by more than 1, it takes at least 2 edits.
2. Make a the shorter string, so an insertion always goes into a.
3. Walk both strings. At the first mismatch:
- equal lengths: it must be a replacement, so skip that character in both;
- different lengths: it must be an insertion into a, so skip the character only in b.
4. A second mismatch means more than one edit.

Merging the three cases (insert, remove, replace) into one loop works because removing from a is the same as inserting into b. Swapping so that a is shorter folds the two cases together.

Any trailing extra character in b is the single insertion, and the loop ends without needing to see it.

"ab" vs "ba" is false: one replacement fixes the first position, but the second position still differs.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'String Rotation', fn: 'isRotation', args: ['s1', 's2'],
      prompt: 'Return true if s2 is a rotation of s1 ("waterbottle" → "erbottlewat"), using a single substring check.',
      tests: [[['waterbottle', 'erbottlewat'], true], [['hello', 'llohe'], true], [['hello', 'helol'], false], [['', ''], true], [['a', ''], false], [['aa', 'aaa'], false], [['abc', 'abc'], true]],
      js: String.raw`function isRotation(s1, s2) {
  return s1.length === s2.length && (s1 + s1).includes(s2);
}`,
      py: String.raw`def is_rotation(s1, s2):
    return len(s1) == len(s2) and s2 in s1 + s1`,
      explain: `A rotation splits s1 into x and y, then swaps them: s1 = xy and s2 = yx.

Write s1 twice: s1 + s1 = xyxy. That contains yx in the middle. So every rotation of s1 is a substring of s1 + s1, and any substring of s1 + s1 with the same length as s1 is a rotation.

The length check is essential. Without it, "aa" would count as a rotation of "aaa", since "aa" appears in "aaaaaa".

This is CTCI 1.9. The point is the trick, which reduces the problem to a single built-in substring search.

Compare it with Repeated Substring Pattern (in Hard Strings), which searches for s inside (s + s) with the ends trimmed. The same doubling idea answers a different question.

Cost: building s1 + s1 is O(n). The substring search is O(n) with KMP, and usually fast with built-in algorithms.`,
      complexity: 'O(n) time with a linear-time substring search, O(n) space',
    },
    {
      title: 'URLify', fn: 'urlify', args: ['s'],
      prompt: 'Replace every space in s with "%20". Explain how you would do it in place in a character array that has enough extra room at the end.',
      tests: [[['Mr John Smith'], 'Mr%20John%20Smith'], [['nospace'], 'nospace'], [[' a '], '%20a%20'], [[''], ''], [['a  b'], 'a%20%20b']],
      js: String.raw`function urlify(s) {
  // in-place style: count spaces, size the buffer, then fill from the back
  let spaces = 0;
  for (const c of s) if (c === ' ') spaces++;
  const buf = new Array(s.length + spaces * 2);
  let k = buf.length - 1;
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] === ' ') {
      buf[k--] = '0';
      buf[k--] = '2';
      buf[k--] = '%';
    } else buf[k--] = s[i];
  }
  return buf.join('');
}`,
      py: String.raw`def urlify(s):
    spaces = s.count(" ")
    buf = [""] * (len(s) + 2 * spaces)
    k = len(buf) - 1
    for i in range(len(s) - 1, -1, -1):
        if s[i] == " ":
            buf[k - 2:k + 1] = ["%", "2", "0"]
            k -= 3
        else:
            buf[k] = s[i]
            k -= 1
    return "".join(buf)`,
      explain: `In a high-level language, s.replaceAll(' ', '%20') is the right answer, so say that first. The interview version (CTCI 1.3) asks for it in place in a character array, which teaches an important technique.

The problem: each space grows from 1 character to 3. Writing from the front would overwrite characters you have not read yet.

The fix is to fill from the back:
1. Count the spaces. The final length is the original length + 2 × spaces.
2. Walk the original characters from right to left, with a write pointer starting at the end of the final buffer.
3. Copy normal characters across, and write '0', '2', '%' (in reverse) for each space.

The write pointer is always at or ahead of the read pointer, so nothing unread is ever overwritten.

It is the same idea as Merge Sorted Array In Place: when the output is at least as long as the input, process right to left.

The solution builds a separate buffer for clarity, but the pointer logic is exactly what you would run on a single array with spare room at the end.`,
      complexity: 'O(n) time, O(n) space (O(1) extra in a pre-sized array)',
    },
    {
      title: 'Add Binary', fn: 'addBinary', args: ['a', 'b'],
      prompt: 'Return the sum of two binary strings as a binary string, without converting the whole inputs to numbers.',
      tests: [[['11', '1'], '100'], [['1010', '1011'], '10101'], [['0', '0'], '0'], [['1', '111'], '1000'], [['110010', '10111'], '1001001']],
      js: String.raw`function addBinary(a, b) {
  let i = a.length - 1, j = b.length - 1, carry = 0;
  const out = [];
  while (i >= 0 || j >= 0 || carry) {
    const sum = (i >= 0 ? a.charCodeAt(i--) - 48 : 0) + (j >= 0 ? b.charCodeAt(j--) - 48 : 0) + carry;
    out.push(sum % 2);
    carry = sum >> 1;
  }
  return out.reverse().join('');
}`,
      py: String.raw`def add_binary(a, b):
    i, j, carry = len(a) - 1, len(b) - 1, 0
    out = []
    while i >= 0 or j >= 0 or carry:
        total = carry
        if i >= 0:
            total += int(a[i])
            i -= 1
        if j >= 0:
            total += int(b[j])
            j -= 1
        out.append(str(total % 2))
        carry = total // 2
    return "".join(reversed(out))`,
      explain: `This is column addition in base 2, the same pattern as Add Two Numbers and Plus One.

1. Two pointers start at the last digits of both strings.
2. Each column sums the two bits (0 if a string has run out) plus the carry. The total is 0 to 3.
3. Output bit = total % 2, and new carry = total // 2.
4. Continue while either string has digits or a carry remains.
5. The bits come out least-significant first, so reverse at the end.

"11" + "1": 1 + 1 = 10 (write 0, carry 1), then 1 + carry = 10 (write 0, carry 1), then the final carry gives 1. The result is "100".

Why not parseInt(a, 2) + parseInt(b, 2)? The strings can be hundreds of bits long, far beyond 53-bit floating-point numbers. BigInt would work, but the point of the question is the carry logic.

Bit-trick variant: with arbitrary-precision integers, apply the Sum Without + loop (XOR for the sum, AND shifted for the carry) to the two numbers.`,
      complexity: 'O(max(n, m)) time and space',
    },
    {
      title: 'Longest Palindrome You Can Build', fn: 'longestPalindromeBuild', args: ['s'],
      prompt: 'Return the length of the longest palindrome that can be built from the letters of s (case-sensitive; each letter used at most as many times as it appears).',
      tests: [[['abccccdd'], 7], [['a'], 1], [['Aa'], 1], [[''], 0], [['aaabbbb'], 7], [['abc'], 1], [['ccc'], 3]],
      js: String.raw`function longestPalindromeBuild(s) {
  const count = {};
  for (const c of s) count[c] = (count[c] || 0) + 1;
  let length = 0, hasOdd = false;
  for (const n of Object.values(count)) {
    length += n - (n % 2); // use every complete pair
    if (n % 2) hasOdd = true;
  }
  return length + (hasOdd ? 1 : 0); // one odd letter can sit in the middle
}`,
      py: String.raw`def longest_palindrome_build(s):
    count = {}
    for c in s:
        count[c] = count.get(c, 0) + 1
    length = sum(n - n % 2 for n in count.values())
    has_odd = any(n % 2 for n in count.values())
    return length + (1 if has_odd else 0)`,
      explain: `This builds on Palindrome Permutation. Instead of asking whether all the letters fit, ask how many of them can be used.

1. A palindrome uses letters in mirrored pairs. A letter appearing n times contributes n rounded down to even.
2. One extra letter can sit alone in the middle, if any letter has an odd count left over.

"abccccdd": c:4 gives 4, d:2 gives 2, and a:1 and b:1 give 0 each. That is 6, plus 1 for the middle, so 7 (for example "dccaccd").

Equivalently: length - (the number of odd counts) + (1 if any count is odd).

Case-sensitive: "Aa" are two different letters, so only one can be used.

Problems about rearranging into a palindrome are always about the parity of the character counts. Once you see that, no construction is needed.`,
      complexity: 'O(n) time, O(alphabet) space',
    },
    {
      title: 'Excel Column Title', fn: 'convertToTitle', args: ['n'],
      prompt: 'Convert a positive integer to its spreadsheet column title: 1 → "A", 26 → "Z", 27 → "AA", 28 → "AB", 701 → "ZY".',
      tests: [[[1], 'A'], [[26], 'Z'], [[27], 'AA'], [[28], 'AB'], [[701], 'ZY'], [[702], 'ZZ'], [[703], 'AAA'], [[2147483647], 'FXSHRXW']],
      js: String.raw`function convertToTitle(n) {
  let out = '';
  while (n > 0) {
    n--; // shift to 0-based: A..Z = 0..25
    out = String.fromCharCode(65 + (n % 26)) + out;
    n = Math.floor(n / 26);
  }
  return out;
}`,
      py: String.raw`def convert_to_title(n):
    out = []
    while n > 0:
        n -= 1
        out.append(chr(65 + n % 26))
        n //= 26
    return "".join(reversed(out))`,
      explain: `This looks like base 26, but there is no zero digit. The digits run from A = 1 to Z = 26 (this is called bijective base-26). That is why naive base conversion breaks at Z.

The fix is to subtract 1 before each digit, which turns the current digit into the 0-based range 0 to 25:
1. n -= 1
2. digit = n % 26, which maps to 'A' + digit.
3. n = floor(n / 26).
4. Repeat while n > 0, building the title right to left.

Trace 28: n = 27, digit 1 (B), n = 1. Then n = 0, digit 0 (A), n = 0. The result is "AB".
Trace 26: n = 25, digit 25 (Z), n = 0. The result is "Z". Without the decrement you would get 26 % 26 = 0 and a wrong carry.

Off-by-one systems like this, and calendar years with no year 0, are common sources of bugs. The decrement trick is the standard fix.

The inverse is the next challenge.`,
      complexity: 'O(log₂₆ n) time and space',
    },
    {
      title: 'Excel Column Number', fn: 'titleToNumber', args: ['title'],
      prompt: 'Convert a spreadsheet column title to its number: "A" → 1, "Z" → 26, "AA" → 27, "ZY" → 701.',
      tests: [[['A'], 1], [['Z'], 26], [['AA'], 27], [['AB'], 28], [['ZY'], 701], [['FXSHRXW'], 2147483647]],
      js: String.raw`function titleToNumber(title) {
  let n = 0;
  for (const c of title) n = n * 26 + (c.charCodeAt(0) - 64); // A=1 .. Z=26
  return n;
}`,
      py: String.raw`def title_to_number(title):
    n = 0
    for c in title:
        n = n * 26 + (ord(c) - 64)
    return n`,
      explain: `Going this direction is easier. It is Horner's method (from Binary to Decimal) with base 26 and digits valued 1 to 26.

For each letter, left to right: n = n × 26 + (letter value), where A = 1, ..., Z = 26 (character code minus 64).

"ZY": Z gives 26, then 26 × 26 + 25 = 701.

There is no off-by-one trouble here, because the digit values are used exactly as defined.

Testing tip: implement both directions and check that titleToNumber(convertToTitle(n)) == n for many values of n, including the boundaries 26, 27, 702 and 703. Round-trip tests are a cheap and powerful way to catch conversion bugs.`,
      complexity: 'O(L) time, O(1) space',
    },
    {
      title: 'Integer to English Words', fn: 'numberToWords', args: ['num'],
      prompt: 'Convert a non-negative integer below 2^31 to English words: 123 → "One Hundred Twenty Three", 1234567 → "One Million Two Hundred Thirty Four Thousand Five Hundred Sixty Seven", 0 → "Zero".',
      tests: [[[123], 'One Hundred Twenty Three'], [[12345], 'Twelve Thousand Three Hundred Forty Five'], [[1234567], 'One Million Two Hundred Thirty Four Thousand Five Hundred Sixty Seven'], [[0], 'Zero'], [[1000010], 'One Million Ten'], [[20], 'Twenty'], [[2147483647], 'Two Billion One Hundred Forty Seven Million Four Hundred Eighty Three Thousand Six Hundred Forty Seven'], [[100000], 'One Hundred Thousand']],
      js: String.raw`function numberToWords(num) {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
    'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const scales = ['', 'Thousand', 'Million', 'Billion'];
  // words for 1..999
  const chunk = (n) => {
    const w = [];
    if (n >= 100) { w.push(ones[Math.floor(n / 100)], 'Hundred'); n %= 100; }
    if (n >= 20) { w.push(tens[Math.floor(n / 10)]); n %= 10; }
    if (n > 0) w.push(ones[n]);
    return w;
  };
  const words = [];
  for (let i = 3; i >= 0; i--) {
    const part = Math.floor(num / 1000 ** i) % 1000;
    if (part) words.push(...chunk(part), scales[i]);
  }
  return words.filter(Boolean).join(' ');
}`,
      py: String.raw`def number_to_words(num):
    if num == 0:
        return "Zero"
    ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
            "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
    tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
    scales = ["", "Thousand", "Million", "Billion"]
    def chunk(n):
        w = []
        if n >= 100:
            w += [ones[n // 100], "Hundred"]
            n %= 100
        if n >= 20:
            w.append(tens[n // 10])
            n %= 10
        if n:
            w.append(ones[n])
        return w
    words = []
    for i in range(3, -1, -1):
        part = num // 1000 ** i % 1000
        if part:
            words += chunk(part) + [scales[i]]
    return " ".join(w for w in words if w)`,
      explain: `English reads numbers in groups of three digits: billions, millions, thousands, and units. Each group is spoken the same way, followed by its scale word.

1. Split num into 3-digit chunks with division and % 1000.
2. Convert each non-zero chunk (1 to 999) to words:
- hundreds: "X Hundred";
- 20 to 99: a tens word ("Forty"), then a ones word if needed;
- 1 to 19: special names. "Eleven" to "Nineteen" are irregular, which is why they sit in the ones table.
3. Append the scale ("Thousand", "Million", "Billion") after each non-zero chunk.
4. Skip zero chunks completely, so 1,000,010 becomes "One Million Ten" with no "Zero Thousand".

Zero is a special case handled up front, because every other path skips zeros.

Filtering out empty strings before joining removes the gaps from the empty scale word for the units chunk.

This is a classic phone-screen question (Microsoft, Facebook) that tests whether you can decompose a messy specification into a small, regular core (chunk) plus tables of data. The interesting part is the edge cases: 0, 10 to 19, round numbers like 100000, and the maximum value.`,
      complexity: 'O(1) time and space (at most 4 chunks)',
    },
  ],
};

export default m;
