import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'text',
  title: 'Strings II',
  description: 'Words, ciphers, prefixes and simple compression.',
  challenges: [
    {
      title: 'Title Case', fn: 'titleCase', args: ['s'],
      prompt: 'Return s with the first letter of every word in upper case and the remaining letters in lower case. Words are separated by single spaces.',
      tests: [[['hello world'], 'Hello World'], [['tHE qUICK brown'], 'The Quick Brown'], [[''], ''], [['a'], 'A'], [['codepad is FUN'], 'Codepad Is Fun']],
      js: String.raw`function titleCase(s) {
  return s
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ');
}`,
      py: String.raw`def title_case(s):
    return " ".join(w[:1].upper() + w[1:].lower() for w in s.split(" "))`,
      explain: `This is the split, transform, join pipeline, one of the most common string patterns.

1. Split the sentence into words.
2. Transform each word: uppercase its first character and lowercase the rest.
3. Join the words back together with spaces.

Empty words: splitting "" gives [""], so the transform must not crash on an empty string. JavaScript checks w before indexing. Python's slice w[:1] safely returns "" for an empty word, while w[0] would raise an IndexError.

Python's built-in s.title() is close, but it treats apostrophes as word breaks ("don't" becomes "Don'T"). Writing your own gives you control over such details.`,
      complexity: 'O(n) time and space',
    },
    {
      title: 'Count Words', fn: 'countWords', args: ['s'],
      prompt: 'Return the number of words in s. Words are separated by one or more spaces, and there may be spaces at the start or end.',
      tests: [[['hello world'], 2], [['  lots   of   space  '], 3], [[''], 0], [['   '], 0], [['one'], 1], [['a b c d e'], 5]],
      js: String.raw`function countWords(s) {
  let count = 0, inWord = false;
  for (const c of s) {
    if (c !== ' ' && !inWord) {
      count++;
      inWord = true;
    } else if (c === ' ') {
      inWord = false;
    }
  }
  return count;
}`,
      py: String.raw`def count_words(s):
    return len(s.split())`,
      explain: `Naively splitting on a single space breaks with repeated spaces: "a  b".split(' ') gives ["a", "", "b"], with an empty string in the middle.

State-machine approach (the JavaScript solution): walk the characters and remember whether you are currently inside a word. Each time you go from "outside" to "inside", meaning you see a non-space after a space or at the start, a new word begins, so count it. This handles any number of leading, trailing or repeated spaces in one pass.

Python's split() with no arguments splits on runs of whitespace and ignores the ends, so len(s.split()) is enough. The JavaScript equivalent is s.trim().split(/\\s+/), plus a special case for the empty string.

Tracking a small amount of state while scanning is a powerful pattern that shows up in parsers and tokenizers.`,
      complexity: 'O(n) time, O(1) space for the state machine',
    },
    {
      title: 'Make an Acronym', fn: 'acronym', args: ['phrase'],
      prompt: 'Return the upper-case first letters of each word in phrase. Words are separated by spaces or hyphens: "Portable Network Graphics" → "PNG", "Complementary metal-oxide semiconductor" → "CMOS".',
      tests: [[['Portable Network Graphics'], 'PNG'], [['as soon as possible'], 'ASAP'], [['Complementary metal-oxide semiconductor'], 'CMOS'], [['hello'], 'H'], [['  spaced   out  '], 'SO']],
      js: String.raw`function acronym(phrase) {
  return phrase
    .split(/[\s-]+/)
    .filter((w) => w.length > 0)
    .map((w) => w[0].toUpperCase())
    .join('');
}`,
      py: String.raw`import re

def acronym(phrase):
    words = [w for w in re.split(r"[\s-]+", phrase) if w]
    return "".join(w[0].upper() for w in words)`,
      explain: `Split on any run of separators, drop empty pieces, and take the first letter of each remaining word.

The regular expression [\\s-]+ means "one or more characters that are either whitespace or a hyphen". Regular expressions let you split on a pattern rather than a fixed character, which handles hyphens and repeated spaces in one go.

Leading or trailing separators produce empty strings at the ends of the split result. Filtering them out avoids reading w[0] on an empty word.

This is a small pipeline of split, filter, map and join. Writing it as a chain of steps makes each step easy to check on its own.`,
      complexity: 'O(n) time and space',
    },
    {
      title: 'Caesar Cipher', fn: 'caesar', args: ['s', 'shift'],
      prompt: 'Shift every letter in s forward by shift places in the alphabet, wrapping from z to a. Keep the case, and leave non-letters unchanged. shift is between 0 and 25.',
      tests: [[['abc', 1], 'bcd'], [['xyz', 3], 'abc'], [['Hello, World!', 13], 'Uryyb, Jbeyq!'], [['', 5], ''], [['Zz', 1], 'Aa'], [['same', 0], 'same']],
      js: String.raw`function caesar(s, shift) {
  let out = '';
  for (const c of s) {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) out += String.fromCharCode(((code - 65 + shift) % 26) + 65);
    else if (code >= 97 && code <= 122) out += String.fromCharCode(((code - 97 + shift) % 26) + 97);
    else out += c;
  }
  return out;
}`,
      py: String.raw`def caesar(s, shift):
    out = []
    for c in s:
        if "A" <= c <= "Z":
            out.append(chr((ord(c) - 65 + shift) % 26 + 65))
        elif "a" <= c <= "z":
            out.append(chr((ord(c) - 97 + shift) % 26 + 97))
        else:
            out.append(c)
    return "".join(out)`,
      explain: `Characters are stored as numbers (character codes). 'A' is 65 to 'Z' at 90, and 'a' is 97 to 'z' at 122.

For each letter:
1. Convert it to its position in the alphabet, 0 to 25, by subtracting the code of 'A' or 'a'.
2. Add the shift and wrap with % 26, so position 25 ('z') plus 1 becomes 0 ('a').
3. Convert back by adding the base code again.

Upper and lower case use different bases, which is why there are two branches, and that is also what preserves the case. Everything else (spaces, punctuation, digits) passes through unchanged.

Tools: charCodeAt and String.fromCharCode in JavaScript; ord and chr in Python.

Shift 13 is ROT13. Applying it twice returns the original text, because 13 + 13 = 26.

Modular arithmetic like % 26 is the standard tool for any wrap-around: clock hours, days of the week, circular buffers.`,
      complexity: 'O(n) time and space',
    },
    {
      title: 'Remove Vowels', fn: 'removeVowels', args: ['s'],
      prompt: 'Return s with all vowels (a, e, i, o, u in either case) removed.',
      tests: [[['hello world'], 'hll wrld'], [['AEIOUaeiou'], ''], [['rhythm'], 'rhythm'], [[''], ''], [['Codepad'], 'Cdpd']],
      js: String.raw`function removeVowels(s) {
  return s.replace(/[aeiou]/gi, '');
}`,
      py: String.raw`def remove_vowels(s):
    return "".join(c for c in s if c.lower() not in "aeiou")`,
      explain: `Two ways to filter characters.

Regular expression (JavaScript): /[aeiou]/gi matches any one vowel. The g flag replaces every match, not just the first, and the i flag ignores case. Replacing each match with an empty string deletes it.

Explicit filter (Python): keep each character whose lowercase form is not a vowel, then join what remains.

Both are O(n). The regular expression is concise once you can read it. The filter is easier to extend with arbitrary logic, such as "remove a vowel only when it is followed by a consonant".

Forgetting the g flag is a classic JavaScript bug: "banana".replace(/a/, "") only removes the first a.`,
      complexity: 'O(n) time and space',
    },
    {
      title: 'Is Pangram', fn: 'isPangram', args: ['s'],
      prompt: 'A pangram contains every letter of the English alphabet at least once. Return true if s is a pangram (ignore case and non-letters).',
      tests: [[['The quick brown fox jumps over the lazy dog'], true], [['Hello world'], false], [[''], false], [['abcdefghijklmnopqrstuvwxyz'], true], [['ABCDEFGHIJKLMNOPQRSTUVWXY'], false], [['Pack my box with five dozen liquor jugs!'], true]],
      js: String.raw`function isPangram(s) {
  const seen = new Set();
  for (const c of s.toLowerCase()) {
    if (c >= 'a' && c <= 'z') seen.add(c);
  }
  return seen.size === 26;
}`,
      py: String.raw`def is_pangram(s):
    seen = {c for c in s.lower() if "a" <= c <= "z"}
    return len(seen) == 26`,
      explain: `Collect the distinct letters you see and check that all 26 are there.

A set stores each letter only once, however many times it appears, so its size is the number of distinct letters. If the size is 26, every letter is present.

Comparison operators work on characters by their codes, so c >= 'a' && c <= 'z' is a simple "is it a lowercase letter?" test. Lowercasing first handles capital letters.

Early exit optimization: return true as soon as the set reaches 26, which helps with very long texts.

Alternative: use a fixed array of 26 booleans indexed by c.charCodeAt(0) - 97. It uses the same amount of memory as the set, without hashing.`,
      complexity: 'O(n) time, O(1) space (at most 26 letters)',
    },
    {
      title: 'First Unique Character', fn: 'firstUnique', args: ['s'],
      prompt: 'Return the first character in s that appears exactly once. If there is none, return an empty string.',
      tests: [[['leetcode'], 'l'], [['loveleetcode'], 'v'], [['aabb'], ''], [[''], ''], [['z'], 'z'], [['aabbc'], 'c']],
      js: String.raw`function firstUnique(s) {
  const freq = {};
  for (const c of s) freq[c] = (freq[c] || 0) + 1;
  for (const c of s) if (freq[c] === 1) return c;
  return '';
}`,
      py: String.raw`def first_unique(s):
    freq = {}
    for c in s:
        freq[c] = freq.get(c, 0) + 1
    for c in s:
        if freq[c] == 1:
            return c
    return ""`,
      explain: `Count first, then scan in order.

1. Build a frequency map of every character.
2. Walk the string again from the left and return the first character whose count is 1.

Why two passes? While scanning the first time, you cannot know whether a character will appear again later. In "loveleetcode", 'l' looks unique until index 4. The counts settle that question, and the second pass respects the original order.

A brute-force approach that checks, for each character, whether it appears elsewhere is O(n²). The frequency map brings it down to O(n).

This "count, then query" structure is a classic interview pattern.`,
      complexity: 'O(n) time, O(k) space for k distinct characters',
    },
    {
      title: 'Longest Common Prefix', fn: 'longestCommonPrefix', args: ['words'],
      prompt: 'Return the longest string that is a prefix of every word in the list. Return "" if there is none or the list is empty.',
      tests: [[[['flower', 'flow', 'flight']], 'fl'], [[['dog', 'racecar', 'car']], ''], [[[]], ''], [[['alone']], 'alone'], [[['same', 'same']], 'same'], [[['ab', 'a']], 'a']],
      js: String.raw`function longestCommonPrefix(words) {
  if (words.length === 0) return '';
  let i = 0;
  while (true) {
    const c = words[0][i];
    if (c === undefined) break;
    if (!words.every((w) => w[i] === c)) break;
    i++;
  }
  return words[0].slice(0, i);
}`,
      py: String.raw`def longest_common_prefix(words):
    if not words:
        return ""
    i = 0
    while True:
        if i >= len(words[0]):
            break
        c = words[0][i]
        if any(i >= len(w) or w[i] != c for w in words):
            break
        i += 1
    return words[0][:i]`,
      explain: `Vertical scan: compare the words one column at a time.

1. Take the character at position i from the first word.
2. Check whether every word has that same character at position i.
3. If all match, move to the next column. Stop at the first mismatch, or when any word runs out of characters.
4. The prefix is the first i characters.

Stopping at the end of the shortest word happens automatically: in JavaScript, w[i] is undefined past the end, which never equals a real character. Python checks i >= len(w) explicitly, because indexing past the end raises an error.

A neat alternative: sort the words. The common prefix of the whole list is then the common prefix of only the first and last words, because they are the most different.`,
      complexity: 'O(S) time where S is the total number of characters, O(1) extra space',
    },
    {
      title: 'Run-Length Encoding', fn: 'rle', args: ['s'],
      prompt: 'Compress s by replacing each run of identical characters with the character followed by its count: "aaabcc" → "a3b1c2".',
      tests: [[['aaabcc'], 'a3b1c2'], [[''], ''], [['a'], 'a1'], [['abc'], 'a1b1c1'], [['zzzzzzzzzzzz'], 'z12'], [['aabbaa'], 'a2b2a2']],
      js: String.raw`function rle(s) {
  let out = '';
  let i = 0;
  while (i < s.length) {
    let j = i;
    while (j < s.length && s[j] === s[i]) j++;
    out += s[i] + (j - i);
    i = j;
  }
  return out;
}`,
      py: String.raw`def rle(s):
    out = []
    i = 0
    while i < len(s):
        j = i
        while j < len(s) and s[j] == s[i]:
            j += 1
        out.append(s[i] + str(j - i))
        i = j
    return "".join(out)`,
      explain: `Find each run, record it, and jump past it.

1. i marks the start of the current run.
2. Advance j while s[j] equals s[i]. When the inner loop stops, the run covers positions i to j - 1, so its length is j - i.
3. Output the character and the count, then continue from j, the first character of the next run.

Although there are two nested loops, every character is visited by j only once, because i jumps straight to j. That makes the whole thing O(n), not O(n²). This kind of reasoning about loops is called amortized analysis.

Runs are not merged across gaps: "aabbaa" has three runs (a2, b2, a2), not "a4b2".

Run-length encoding is a real compression method, used in fax machines, early bitmap formats and as one stage inside JPEG.`,
      complexity: 'O(n) time and space',
    },
    {
      title: 'Count Occurrences', fn: 'countOccurrences', args: ['s', 'sub'],
      prompt: 'Return how many times the non-empty string sub appears in s, counting overlapping matches ("aaa" contains "aa" twice).',
      tests: [[['aaa', 'aa'], 2], [['banana', 'ana'], 2], [['hello', 'l'], 2], [['abc', 'd'], 0], [['', 'a'], 0], [['abababa', 'aba'], 3]],
      js: String.raw`function countOccurrences(s, sub) {
  let count = 0;
  for (let i = 0; i + sub.length <= s.length; i++) {
    if (s.slice(i, i + sub.length) === sub) count++;
  }
  return count;
}`,
      py: String.raw`def count_occurrences(s, sub):
    count = 0
    for i in range(len(s) - len(sub) + 1):
        if s[i:i + len(sub)] == sub:
            count += 1
    return count`,
      explain: `Try every starting position and compare the slice there against sub.

The last position worth checking is s.length - sub.length, because any later start does not leave enough characters. The loop condition i + sub.length <= s.length encodes that.

Overlap is counted automatically because we advance by 1, not by sub.length. In "banana", "ana" matches at index 1 and again at index 3.

Built-ins usually do not count overlaps. Python's "aaa".count("aa") returns 1, and so does a global regular expression match in JavaScript. Always check which behavior a problem asks for.

This brute force is O(n × m). Algorithms such as KMP (in the Hard level) do it in O(n + m).`,
      complexity: 'O(n × m) time, O(m) space for each slice',
    },
  ],
};

export default m;
