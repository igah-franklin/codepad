import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'strings',
  title: 'Strings I',
  description: 'Indexing, looping over characters and building new strings.',
  challenges: [
    {
      title: 'Reverse a String', fn: 'reverseString', args: ['s'],
      prompt: 'Return the string s with its characters in reverse order.',
      tests: [[['hello'], 'olleh'], [['Codepad'], 'dapedoC'], [[''], ''], [['a'], 'a'], [['racecar'], 'racecar'], [['ab cd'], 'dc ba']],
      js: String.raw`function reverseString(s) {
  let out = '';
  for (let i = s.length - 1; i >= 0; i--) out += s[i];
  return out;
}`,
      py: String.raw`def reverse_string(s):
    return s[::-1]`,
      explain: `Strings are sequences of characters, each with an index from 0 to length - 1. To reverse, visit them from the last index down to 0 and collect them.

JavaScript solution: loop i from s.length - 1 down to 0 and append s[i] to a result string.

Python solution: slicing with a step of -1, s[::-1], walks the string backwards and returns a new string in one expression.

Other options: in JavaScript, s.split('').reverse().join('') turns the string into an array, reverses it, and glues it back together. In Python, ''.join(reversed(s)) does the same.

Strings are immutable in both languages, so you always build a new string rather than changing the original.`,
      complexity: 'O(n) time, O(n) space for the new string',
    },
    {
      title: 'Palindrome Check', fn: 'isPalindrome', args: ['s'],
      prompt: 'A palindrome reads the same forwards and backwards. Return true if s is a palindrome, ignoring upper/lower case.',
      tests: [[['racecar'], true], [['Level'], true], [['hello'], false], [[''], true], [['a'], true], [['abca'], false], [['Noon'], true]],
      js: String.raw`function isPalindrome(s) {
  s = s.toLowerCase();
  let i = 0, j = s.length - 1;
  while (i < j) {
    if (s[i] !== s[j]) return false;
    i++;
    j--;
  }
  return true;
}`,
      py: String.raw`def is_palindrome(s):
    s = s.lower()
    i, j = 0, len(s) - 1
    while i < j:
        if s[i] != s[j]:
            return False
        i += 1
        j -= 1
    return True`,
      explain: `First normalize the case so "Level" compares the same as "level".

Two-pointer approach:
1. Put i at the start and j at the end.
2. While i < j, compare s[i] and s[j]. If they differ, it is not a palindrome, so return false immediately.
3. Move both pointers inward and repeat.
4. If the pointers meet without a mismatch, return true.

Why it works: a palindrome mirrors around its center, so every character must equal its partner at the same distance from the other end.

The quick alternative is comparing s with its reverse (s === reversed). That is correct too but builds a whole new string. The two-pointer version uses no extra memory and can stop at the first mismatch. You will see this two-pointer pattern often in the Medium level.

The empty string and single characters are palindromes: the loop never runs and we return true.`,
      complexity: 'O(n) time, O(1) extra space (besides the lowercased copy)',
    },
    {
      title: 'Count Vowels', fn: 'countVowels', args: ['s'],
      prompt: 'Return how many vowels (a, e, i, o, u, in either case) appear in s.',
      tests: [[['hello'], 2], [['AEIOU'], 5], [['rhythm'], 0], [[''], 0], [['Programming is fun'], 5], [['aaa'], 3]],
      js: String.raw`function countVowels(s) {
  const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
  let count = 0;
  for (const ch of s.toLowerCase()) {
    if (vowels.has(ch)) count++;
  }
  return count;
}`,
      py: String.raw`def count_vowels(s):
    vowels = set("aeiou")
    return sum(1 for ch in s.lower() if ch in vowels)`,
      explain: `Walk through every character and count the ones that belong to the vowel group.

1. Lowercase the string so 'A' and 'a' are treated alike.
2. Keep a set of vowels. Checking "is this character in the set?" is fast and reads clearly.
3. For each character, add 1 to the count if it is a vowel.

The Python version uses a generator expression: sum(1 for ch in ... if ch in vowels) adds a 1 for every character that passes the test.

A string such as "aeiou" also supports the in check, and for five letters it is just as good. Sets become important when the group you test against is large.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Capitalize First Letter', fn: 'capitalize', args: ['s'],
      prompt: 'Return s with its first character in upper case and the rest unchanged. An empty string stays empty.',
      tests: [[['hello'], 'Hello'], [['codepad rocks'], 'Codepad rocks'], [['A'], 'A'], [[''], ''], [['already Capital'], 'Already Capital'], [['1st place'], '1st place']],
      js: String.raw`function capitalize(s) {
  if (s.length === 0) return s;
  return s[0].toUpperCase() + s.slice(1);
}`,
      py: String.raw`def capitalize(s):
    if not s:
        return s
    return s[0].upper() + s[1:]`,
      explain: `Split the string into two pieces: the first character and everything after it.

1. Guard against the empty string. s[0] does not exist there (it is undefined in JavaScript and an IndexError in Python).
2. Uppercase the first character.
3. Append the rest unchanged with s.slice(1) in JavaScript or s[1:] in Python.

Why not Python's built-in s.capitalize()? It also lowercases the rest of the string, so "already Capital" would become "Already capital". The task says to leave the rest unchanged, and reading a specification carefully like this is an important habit.

Digits and symbols have no upper case, so toUpperCase() leaves '1' as it is.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Repeat a String', fn: 'repeatString', args: ['s', 'n'],
      prompt: 'Return s repeated n times (n ≥ 0) without using a built-in repeat function.',
      tests: [[['ab', 3], 'ababab'], [['x', 5], 'xxxxx'], [['hi', 0], ''], [['', 4], ''], [['ok ', 2], 'ok ok ']],
      js: String.raw`function repeatString(s, n) {
  const parts = [];
  for (let i = 0; i < n; i++) parts.push(s);
  return parts.join('');
}`,
      py: String.raw`def repeat_string(s, n):
    parts = []
    for _ in range(n):
        parts.append(s)
    return "".join(parts)`,
      explain: `Repeat a step n times and collect the pieces.

1. Create an empty list.
2. Loop n times, pushing s each time.
3. Join the pieces into one string.

Why collect into a list and then join, instead of out += s? In many languages each += on a string copies the whole string so far, which can make repeated concatenation slow. Joining a list builds the result once. (Modern engines optimize += well, so both work here, but list-and-join is a good habit, especially in Python.)

Built-ins: s.repeat(n) in JavaScript and s * n in Python do the same thing.

When n is 0 the loop never runs and the result is an empty string, which is correct.`,
      complexity: 'O(n × |s|) time and space',
    },
    {
      title: 'Count a Character', fn: 'countChar', args: ['s', 'ch'],
      prompt: 'Return how many times the single character ch appears in s. The match is case-sensitive.',
      tests: [[['banana', 'a'], 3], [['banana', 'n'], 2], [['banana', 'z'], 0], [['', 'a'], 0], [['AaAa', 'A'], 2], [['mississippi', 's'], 4]],
      js: String.raw`function countChar(s, ch) {
  let count = 0;
  for (const c of s) if (c === ch) count++;
  return count;
}`,
      py: String.raw`def count_char(s, ch):
    count = 0
    for c in s:
        if c == ch:
            count += 1
    return count`,
      explain: `This is the classic counting loop: start a counter at zero, inspect each item, and add one whenever it matches.

1. count = 0.
2. For every character c in s, compare it with ch.
3. On a match, increment count.
4. Return count after the loop.

Case-sensitivity: 'A' and 'a' are different characters, so "AaAa" contains 'A' twice. If the problem had asked for a case-insensitive count, you would lowercase both s and ch first.

Python has s.count(ch) built in. In JavaScript, s.split(ch).length - 1 is a well-known trick.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Remove Spaces', fn: 'removeSpaces', args: ['s'],
      prompt: 'Return s with every space character removed.',
      tests: [[['h e l l o'], 'hello'], [['  lots   of   space  '], 'lotsofspace'], [['none'], 'none'], [[''], ''], [['   '], '']],
      js: String.raw`function removeSpaces(s) {
  let out = '';
  for (const c of s) if (c !== ' ') out += c;
  return out;
}`,
      py: String.raw`def remove_spaces(s):
    return "".join(c for c in s if c != " ")`,
      explain: `Filtering builds a new string that keeps only the characters you want.

1. Walk through s one character at a time.
2. Keep every character that is not a space.
3. Join what you kept.

Python's "".join(c for c in s if c != " ") reads almost like the description: join every c in s where c is not a space.

Alternatives: s.replaceAll(' ', '') in JavaScript and s.replace(" ", "") in Python (Python's replace already replaces every occurrence). To remove all whitespace, including tabs and newlines, use a regular expression such as s.replace(/\\s+/g, '').

Compare this with the trim functions, which only remove spaces at the ends of a string.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Longest Word', fn: 'longestWord', args: ['sentence'],
      prompt: 'Return the longest word in a sentence of words separated by single spaces. If several words tie, return the first one.',
      tests: [[['I love programming'], 'programming'], [['a bb cc d'], 'bb'], [['hello'], 'hello'], [['one three five seven'], 'three'], [['cat dog'], 'cat']],
      js: String.raw`function longestWord(sentence) {
  let best = '';
  for (const w of sentence.split(' ')) {
    if (w.length > best.length) best = w;
  }
  return best;
}`,
      py: String.raw`def longest_word(sentence):
    best = ""
    for w in sentence.split(" "):
        if len(w) > len(best):
            best = w
    return best`,
      explain: `Combine two ideas: split the sentence into words, then use the "best so far" pattern from Largest of Three.

1. split(' ') turns "I love programming" into ["I", "love", "programming"].
2. Keep best, starting as an empty string.
3. Replace best only when a word is strictly longer.

The tie rule ("return the first one") is handled by using > instead of >=. A later word of equal length does not replace the current best. With "a bb cc d", "bb" is found first and "cc" does not beat it.

Python one-liner: max(sentence.split(), key=len). max returns the first of several equal maximums, so it follows the same tie rule.`,
      complexity: 'O(n) time, O(n) space for the word list',
    },
    {
      title: 'Is Anagram', fn: 'isAnagram', args: ['a', 'b'],
      prompt: 'Two words are anagrams if they use exactly the same letters the same number of times (e.g. "listen" and "silent"). Return true if a and b are anagrams. Inputs are lowercase letters only.',
      tests: [[['listen', 'silent'], true], [['rat', 'car'], false], [['aab', 'abb'], false], [['', ''], true], [['evil', 'vile'], true], [['abc', 'abcd'], false]],
      js: String.raw`function isAnagram(a, b) {
  if (a.length !== b.length) return false;
  const counts = {};
  for (const c of a) counts[c] = (counts[c] || 0) + 1;
  for (const c of b) {
    if (!counts[c]) return false;
    counts[c]--;
  }
  return true;
}`,
      py: String.raw`def is_anagram(a, b):
    if len(a) != len(b):
        return False
    counts = {}
    for c in a:
        counts[c] = counts.get(c, 0) + 1
    for c in b:
        if counts.get(c, 0) == 0:
            return False
        counts[c] -= 1
    return True`,
      explain: `Anagrams have identical letter counts, so count the letters of one word and "spend" those counts with the other.

1. Different lengths cannot be anagrams, so return false early.
2. Count every letter of a in a dictionary: {'l': 1, 'i': 1, ...}.
3. For each letter of b, if no count is left for it, b has a letter a does not (or has too many of it), so return false. Otherwise decrement.
4. If we finish, every letter matched exactly. Because the lengths are equal, nothing can be left over.

Why "aab" vs "abb" fails: a has a:2, b:1. Reading b's second 'b' finds the count for b already at 0.

Shorter alternative: sort both strings and compare them. That is O(n log n) instead of O(n), but very readable: [...a].sort().join('') === [...b].sort().join('').`,
      complexity: 'O(n) time, O(1) space (at most 26 letters)',
    },
    {
      title: 'Swap Case', fn: 'swapCase', args: ['s'],
      prompt: 'Return s with upper-case letters turned into lower case and lower-case letters turned into upper case. Other characters stay the same.',
      tests: [[['Hello World'], 'hELLO wORLD'], [['abc'], 'ABC'], [['XYZ'], 'xyz'], [['123 !'], '123 !'], [[''], ''], [['cOdEpAd'], 'CoDePaD']],
      js: String.raw`function swapCase(s) {
  let out = '';
  for (const c of s) {
    const up = c.toUpperCase();
    out += c === up ? c.toLowerCase() : up;
  }
  return out;
}`,
      py: String.raw`def swap_case(s):
    out = []
    for c in s:
        out.append(c.lower() if c.isupper() else c.upper())
    return "".join(out)`,
      explain: `Transform each character independently and build a new string.

JavaScript has no isUpperCase(), so the solution uses a trick: if a character equals its own upper-case version, it is already upper case (or it has no case at all, like a digit), so lowercase it. Otherwise uppercase it. For digits and symbols, toLowerCase() and toUpperCase() return the character unchanged, so they pass through safely.

Python has c.isupper(), which makes the intent explicit.

Python also has s.swapcase() built in. Writing the loop yourself shows the general pattern of mapping every character through a small rule, the same shape as a Caesar cipher or ROT13.`,
      complexity: 'O(n) time, O(n) space',
    },
  ],
};

export default m;
