import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'dicts',
  title: 'Objects & Dictionaries',
  description: 'Key–value maps for counting, grouping and fast lookups.',
  challenges: [
    {
      title: 'Word Count', fn: 'wordCount', args: ['sentence'],
      prompt: 'Return an object/dictionary mapping each word in the sentence to how many times it appears. Words are separated by single spaces and are case-sensitive. An empty sentence gives an empty object.',
      tests: [[['the cat and the hat'], { the: 2, cat: 1, and: 1, hat: 1 }], [['a a a'], { a: 3 }], [[''], {}], [['Hi hi'], { Hi: 1, hi: 1 }]],
      js: String.raw`function wordCount(sentence) {
  const counts = {};
  if (sentence === '') return counts;
  for (const w of sentence.split(' ')) {
    counts[w] = (counts[w] || 0) + 1;
  }
  return counts;
}`,
      py: String.raw`def word_count(sentence):
    counts = {}
    for w in sentence.split():
        counts[w] = counts.get(w, 0) + 1
    return counts`,
      explain: `Counting with a dictionary is one of the most useful patterns in programming.

For each word: look up its current count, using 0 if the word has not been seen yet, add 1, and store it back.

- JavaScript: counts[w] || 0 falls back to 0 when counts[w] is undefined.
- Python: counts.get(w, 0) returns the default 0 for a missing key. Writing counts[w] += 1 on a missing key raises KeyError.

Empty input: in JavaScript, ''.split(' ') returns [''], which would count an empty "word", so the code returns early. Python's split() with no argument splits on any run of whitespace and returns [] for an empty string.

Python also has collections.Counter(sentence.split()), which does all of this in one call.`,
      complexity: 'O(n) time, O(k) space for k distinct words',
    },
    {
      title: 'Character Frequency', fn: 'charFrequency', args: ['s'],
      prompt: 'Return an object/dictionary mapping every character in s (including spaces) to its number of occurrences.',
      tests: [[['hello'], { h: 1, e: 1, l: 2, o: 1 }], [[''], {}], [['aaa'], { a: 3 }], [['a b'], { a: 1, ' ': 1, b: 1 }]],
      js: String.raw`function charFrequency(s) {
  const freq = {};
  for (const c of s) freq[c] = (freq[c] || 0) + 1;
  return freq;
}`,
      py: String.raw`def char_frequency(s):
    freq = {}
    for c in s:
        freq[c] = freq.get(c, 0) + 1
    return freq`,
      explain: `The same counting pattern as Word Count, applied to characters instead of words.

Frequency maps like this are the basis of many problems you will meet later: anagram checks, finding the first unique character, checking whether a string can be rearranged into a palindrome, and sliding-window problems in the Medium level.

Spaces are characters too, so "a b" counts the space.

Note: a JavaScript object keeps string keys in insertion order. To use non-string keys, or to avoid clashing with built-in property names like "constructor", use a Map: freq.set(c, (freq.get(c) || 0) + 1).`,
      complexity: 'O(n) time, O(k) space for k distinct characters',
    },
    {
      title: 'Most Frequent Character', fn: 'mostFrequentChar', args: ['s'],
      prompt: 'Return the character that appears most often in the non-empty string s. If there is a tie, return the one that appears first in s.',
      tests: [[['hello'], 'l'], [['aabbb'], 'b'], [['abc'], 'a'], [['bbaa'], 'b'], [['mississippi'], 'i'], [['z'], 'z']],
      js: String.raw`function mostFrequentChar(s) {
  const freq = {};
  for (const c of s) freq[c] = (freq[c] || 0) + 1;
  let best = s[0];
  for (const c of s) {
    if (freq[c] > freq[best]) best = c;
  }
  return best;
}`,
      py: String.raw`def most_frequent_char(s):
    freq = {}
    for c in s:
        freq[c] = freq.get(c, 0) + 1
    best = s[0]
    for c in s:
        if freq[c] > freq[best]:
            best = c
    return best`,
      explain: `Two passes: first count, then choose.

1. Build a frequency map.
2. Walk the original string again, in order, and keep the character with the highest count. Using strict > means an equal count never replaces the current best, so ties go to whoever appeared first in s.

Why loop over s rather than over the dictionary in the second pass? The string defines "appears first" directly. Looping over s makes the tie rule obvious and does not depend on the iteration order of the dictionary.

"mississippi": i and s both appear 4 times, and i appears first (index 1), so the answer is i.

Two O(n) passes are still O(n) overall. Splitting a problem into "gather information" and then "use it" is often the clearest design.`,
      complexity: 'O(n) time, O(k) space',
    },
    {
      title: 'Invert a Dictionary', fn: 'invert', args: ['obj'],
      prompt: 'Given an object/dictionary whose values are unique strings, return a new one with keys and values swapped.',
      tests: [[[{ a: 'x', b: 'y' }], { x: 'a', y: 'b' }], [[{}], {}], [[{ one: '1', two: '2', three: '3' }], { '1': 'one', '2': 'two', '3': 'three' }]],
      js: String.raw`function invert(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) out[v] = k;
  return out;
}`,
      py: String.raw`def invert(obj):
    return {v: k for k, v in obj.items()}`,
      explain: `Iterate over the key/value pairs and insert each one into a new object the other way round.

- JavaScript: Object.entries(obj) gives an array of [key, value] pairs to destructure in the loop.
- Python: obj.items() does the same, and a dict comprehension {v: k for k, v in ...} builds the result in one expression.

The precondition "values are unique" is important. If two keys shared a value, both would map to the same new key, and the later one would overwrite the earlier one. To handle duplicates you would map each value to a list of keys instead, which is the grouping pattern in the next challenge.

Inverting maps is useful for reverse lookups, such as code to name and name to code.`,
      complexity: 'O(n) time and space',
    },
    {
      title: 'Merge Two Dictionaries', fn: 'merge', args: ['a', 'b'],
      prompt: 'Return a new object/dictionary containing all keys from a and b. When a key exists in both, the value from b wins. Do not modify the inputs.',
      tests: [[[{ x: 1 }, { y: 2 }], { x: 1, y: 2 }], [[{ x: 1, y: 2 }, { y: 3 }], { x: 1, y: 3 }], [[{}, {}], {}], [[{ a: 1 }, {}], { a: 1 }]],
      js: String.raw`function merge(a, b) {
  return { ...a, ...b };
}`,
      py: String.raw`def merge(a, b):
    return {**a, **b}`,
      explain: `The spread / unpack syntax copies every key of an object into a new literal, and later keys overwrite earlier ones. That gives "b wins" for free.

- JavaScript: { ...a, ...b }, or Object.assign({}, a, b).
- Python: {**a, **b}, or a | b in Python 3.9+.

Explicit loop version: copy a into a new object, then loop over b and set each key.

Why "do not modify the inputs" matters: Object.assign(a, b) or a.update(b) would change a in place. If the caller still uses a, they get a surprise. Returning a new object, an immutable update, is the safer default and is how state is updated in React apps.

This is a shallow merge. Nested objects are shared, not copied.`,
      complexity: 'O(|a| + |b|) time and space',
    },
    {
      title: 'Group Words by Length', fn: 'groupByLength', args: ['words'],
      prompt: 'Return an object/dictionary mapping each word length to the list of words with that length, in their original order.',
      tests: [[[['a', 'bb', 'cc', 'd', 'eee']], { '1': ['a', 'd'], '2': ['bb', 'cc'], '3': ['eee'] }], [[[]], {}], [[['hello']], { '5': ['hello'] }]],
      js: String.raw`function groupByLength(words) {
  const groups = {};
  for (const w of words) {
    const k = w.length;
    if (!groups[k]) groups[k] = [];
    groups[k].push(w);
  }
  return groups;
}`,
      py: String.raw`def group_by_length(words):
    groups = {}
    for w in words:
        groups.setdefault(len(w), []).append(w)
    return groups`,
      explain: `Grouping is counting's sibling: instead of adding 1 for each key, append the item to that key's list.

1. Compute the group key, here the word's length.
2. If that key has no list yet, create an empty one.
3. Append the word.

Python's setdefault(key, []) returns the existing list or inserts and returns a new empty one, so steps 2 and 3 happen in one line. collections.defaultdict(list) is another common way.

Original order is preserved because we walk the words in order and only ever append.

In JavaScript, object keys are always strings, so the length 1 becomes the key "1". The tests compare keys as strings, so Python's integer keys work too.

The same pattern groups anagrams (key = sorted letters), files by extension, or people by city.`,
      complexity: 'O(n) time and space',
    },
    {
      title: 'Sum of Values', fn: 'sumValues', args: ['obj'],
      prompt: 'Return the sum of all values in an object/dictionary whose values are numbers.',
      tests: [[[{ a: 1, b: 2, c: 3 }], 6], [[{}], 0], [[{ x: -5, y: 5 }], 0], [[{ apples: 10 }], 10]],
      js: String.raw`function sumValues(obj) {
  let total = 0;
  for (const v of Object.values(obj)) total += v;
  return total;
}`,
      py: String.raw`def sum_values(obj):
    return sum(obj.values())`,
      explain: `When you do not care about the keys, iterate over the values directly.

- JavaScript: Object.values(obj) returns an array of values. Object.keys() and Object.entries() are its siblings.
- Python: obj.values() is a view you can pass straight to sum.

Typical uses are totalling a shopping cart ({ apples: 3.5, bread: 2 }) or summing vote counts.

Watch out in JavaScript: for...in over an object also visits inherited enumerable properties. Object.values / keys / entries only return the object's own properties, so they are the safer default.`,
      complexity: 'O(n) time, O(n) space for the values array in JS (O(1) in Python)',
    },
    {
      title: 'Key With the Largest Value', fn: 'keyOfMax', args: ['obj'],
      prompt: 'Return the key whose value is largest in a non-empty object/dictionary of numbers. If several keys tie, return the one that comes first in insertion order.',
      tests: [[[{ a: 1, b: 5, c: 3 }], 'b'], [[{ x: 10 }], 'x'], [[{ p: 2, q: 2 }], 'p'], [[{ m: -1, n: -5 }], 'm']],
      js: String.raw`function keyOfMax(obj) {
  let bestKey = null;
  for (const [k, v] of Object.entries(obj)) {
    if (bestKey === null || v > obj[bestKey]) bestKey = k;
  }
  return bestKey;
}`,
      py: String.raw`def key_of_max(obj):
    return max(obj, key=obj.get)`,
      explain: `This is the running-champion pattern again, but we remember the key rather than the value, because the key is the answer.

JavaScript: loop over the entries, and update bestKey when there is none yet or when the value beats the current best. Strict > keeps the earliest key on ties.

Python: max(obj, key=obj.get) iterates over the keys and compares them by obj.get(key), which is their value. max returns the first maximal item, which matches the tie rule, and dictionaries keep insertion order.

The key= argument (also accepted by min and sorted) is very useful: it lets you choose by one property while returning the whole item.

Starting with bestKey = null rather than a value like 0 makes the code work even when all values are negative.`,
      complexity: 'O(n) time, O(1) extra space (O(n) in JS for the entries array)',
    },
    {
      title: 'Phone Book Lookup', fn: 'lookup', args: ['entries', 'name'],
      prompt: 'entries is a list of [name, number] pairs. Build a lookup table and return the number for name, or "not found". If a name appears more than once, the last entry wins.',
      tests: [[[[['ana', '555-1234'], ['bo', '555-9876']], 'bo'], '555-9876'], [[[['ana', '555-1234']], 'cy'], 'not found'], [[[], 'ana'], 'not found'], [[[['ana', '1'], ['ana', '2']], 'ana'], '2']],
      js: String.raw`function lookup(entries, name) {
  const book = new Map(entries);
  return book.has(name) ? book.get(name) : 'not found';
}`,
      py: String.raw`def lookup(entries, name):
    book = dict(entries)
    return book.get(name, "not found")`,
      explain: `This shows why dictionaries exist. Searching a list of pairs takes O(n) time per lookup, while a hash map finds a key in about O(1) time.

Both languages can build a map straight from a list of [key, value] pairs: new Map(entries) in JavaScript and dict(entries) in Python. Later pairs overwrite earlier ones with the same key, which gives "last entry wins".

For the missing case, Python's get(key, default) returns the fallback. In JavaScript, check has() first. Using book.get(name) || 'not found' would also treat legitimate falsy values like an empty string as missing.

If you need many lookups, build the map once and reuse it. That trade of a little memory for a lot of speed is at the heart of the Hash Maps module in Medium.`,
      complexity: 'O(n) to build, O(1) average per lookup',
    },
    {
      title: 'Pairs to Object', fn: 'fromPairs', args: ['keys', 'values'],
      prompt: 'Given two arrays of equal length, return an object/dictionary mapping keys[i] to values[i].',
      tests: [[[['a', 'b'], [1, 2]], { a: 1, b: 2 }], [[[], []], {}], [[['name', 'age'], ['Ada', 36]], { name: 'Ada', age: 36 }], [[['x', 'y', 'z'], [true, false, null]], { x: true, y: false, z: null }]],
      js: String.raw`function fromPairs(keys, values) {
  const out = {};
  for (let i = 0; i < keys.length; i++) out[keys[i]] = values[i];
  return out;
}`,
      py: String.raw`def from_pairs(keys, values):
    return dict(zip(keys, values))`,
      explain: `Walk both arrays in step using the same index, so that each key meets the value at the same position.

Python's zip(keys, values) pairs the elements up as (keys[0], values[0]), (keys[1], values[1]), and so on, and dict() turns those pairs into a dictionary. zip stops at the shorter input, so mismatched lengths do not crash; whether that is what you want depends on the situation.

JavaScript has no built-in zip, so the index loop is the standard approach. Another option is Object.fromEntries(keys.map((k, i) => [k, values[i]])).

Values can be any type, including booleans and null. The map stores them unchanged.`,
      complexity: 'O(n) time and space',
    },
  ],
};

export default m;
