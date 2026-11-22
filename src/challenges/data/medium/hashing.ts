import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'hashing',
  title: 'Hash Maps & Sets',
  description: 'Trade memory for speed: O(1) lookups turn O(n²) scans into O(n).',
  challenges: [
    {
      title: 'Two Sum', fn: 'twoSum', args: ['nums', 'target'],
      prompt: 'Return the indices [i, j] (i < j) of the two numbers in nums that add up to target. Exactly one solution exists, and you may not use the same element twice.',
      tests: [[[[2, 7, 11, 15], 9], [0, 1]], [[[3, 2, 4], 6], [1, 2]], [[[3, 3], 6], [0, 1]], [[[-1, -2, -3, -4, -5], -8], [2, 4]], [[[1, 5, 9, 14], 23], [2, 3]]],
      js: String.raw`function twoSum(nums, target) {
  const seen = new Map(); // value -> index
  for (let j = 0; j < nums.length; j++) {
    const need = target - nums[j];
    if (seen.has(need)) return [seen.get(need), j];
    seen.set(nums[j], j);
  }
  return [];
}`,
      py: String.raw`def two_sum(nums, target):
    seen = {}  # value -> index
    for j, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], j]
        seen[x] = j
    return []`,
      explain: `Brute force checks every pair, which is O(n²). The hash map version needs only one pass.

Key insight: for each number x, its partner must be exactly target - x. Instead of searching for that partner, remember every number you have already passed, and ask the map whether the partner is among them.

1. Walk through nums with index j.
2. Compute need = target - nums[j].
3. If need is already in the map, its stored index i and the current j are the answer. Since i was seen earlier, i < j.
4. Otherwise store nums[j] mapped to j and continue.

Why check before inserting? So an element can never pair with itself. With [3, 3] and target 6, the first 3 is stored, and the second 3 finds it.

This "complement lookup" idea is the foundation of many problems: 3Sum, 4Sum, pairs with a given difference, and subarray sums.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Group Anagrams', fn: 'groupAnagrams', args: ['words'],
      prompt: 'Group the words that are anagrams of each other. Return a list of groups; the order of groups and of words inside each group does not matter.',
      compare: 'unorderedDeep',
      tests: [[[['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], [['bat'], ['nat', 'tan'], ['ate', 'eat', 'tea']]], [[['']], [['']]], [[['a']], [['a']]], [[['abc', 'bca', 'xyz', 'zyx', 'q']], [['abc', 'bca'], ['xyz', 'zyx'], ['q']]]],
      js: String.raw`function groupAnagrams(words) {
  const groups = new Map();
  for (const w of words) {
    const key = [...w].sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  return [...groups.values()];
}`,
      py: String.raw`def group_anagrams(words):
    groups = {}
    for w in words:
        key = "".join(sorted(w))
        groups.setdefault(key, []).append(w)
    return list(groups.values())`,
      explain: `Anagrams become identical once their letters are sorted: "eat", "tea" and "ate" all sort to "aet". Use that sorted string as a dictionary key and group the words under it.

1. For each word, compute its canonical key by sorting its letters.
2. Append the word to the list stored under that key.
3. Return all the lists.

This is the grouping pattern from Easy, with a clever choice of key. Choosing a canonical form, a representation that is identical for everything you consider equivalent, is a powerful general idea.

Faster key: instead of sorting (O(k log k) per word), count the letters into an array of 26 numbers and use that as the key, for example "1#0#0#...". That is O(k) per word.`,
      complexity: 'O(n · k log k) time for n words of length k, O(n · k) space',
    },
    {
      title: 'Top K Frequent Elements', fn: 'topKFrequent', args: ['nums', 'k'],
      prompt: 'Return the k most frequent values in nums, in any order. The answer is guaranteed to be unique.',
      compare: 'unordered',
      tests: [[[[1, 1, 1, 2, 2, 3], 2], [1, 2]], [[[1], 1], [1]], [[[4, 4, 5, 5, 5, 6], 1], [5]], [[[-1, -1, 2, 2, 2, 3, 3, 3, 3], 2], [3, 2]]],
      js: String.raw`function topKFrequent(nums, k) {
  const freq = new Map();
  for (const x of nums) freq.set(x, (freq.get(x) || 0) + 1);
  // Bucket sort: buckets[c] holds the values that appear c times.
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [x, c] of freq) buckets[c].push(x);
  const out = [];
  for (let c = nums.length; c > 0 && out.length < k; c--) out.push(...buckets[c]);
  return out.slice(0, k);
}`,
      py: String.raw`def top_k_frequent(nums, k):
    freq = {}
    for x in nums:
        freq[x] = freq.get(x, 0) + 1
    buckets = [[] for _ in range(len(nums) + 1)]
    for x, c in freq.items():
        buckets[c].append(x)
    out = []
    for c in range(len(nums), 0, -1):
        out.extend(buckets[c])
        if len(out) >= k:
            break
    return out[:k]`,
      explain: `First count the frequencies, then pick the k largest counts.

The simple way is to sort the distinct values by count, which is O(n log n). Bucket sort does better:
1. No value can appear more than n times, so make n + 1 buckets indexed by count.
2. Put each value into the bucket for its count.
3. Walk the buckets from the highest count down, collecting values until you have k.

Every step is linear, so the whole algorithm is O(n).

Heap alternative: keep a min-heap of size k keyed by frequency. Push each value, and pop whenever the heap grows past k. That is O(n log k), and it is the standard choice when values arrive as a stream.

Knowing several options (sort, heap, bucket) and their trade-offs is what interviewers look for.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Nearby Duplicate', fn: 'containsNearbyDuplicate', args: ['nums', 'k'],
      prompt: 'Return true if there are two different indices i and j with nums[i] === nums[j] and |i − j| ≤ k.',
      tests: [[[[1, 2, 3, 1], 3], true], [[[1, 0, 1, 1], 1], true], [[[1, 2, 3, 1, 2, 3], 2], false], [[[], 0], false], [[[99, 99], 2], true], [[[1, 2, 1], 0], false]],
      js: String.raw`function containsNearbyDuplicate(nums, k) {
  const last = new Map(); // value -> most recent index
  for (let i = 0; i < nums.length; i++) {
    if (last.has(nums[i]) && i - last.get(nums[i]) <= k) return true;
    last.set(nums[i], i);
  }
  return false;
}`,
      py: String.raw`def contains_nearby_duplicate(nums, k):
    last = {}
    for i, x in enumerate(nums):
        if x in last and i - last[x] <= k:
            return True
        last[x] = i
    return False`,
      explain: `For each value, you only need the most recent index where you saw it. Any earlier occurrence is even farther away, so it could never give a smaller distance.

1. Map each value to the last index where it appeared.
2. At index i, if the value was seen before and the gap i - last is at most k, return true.
3. Otherwise update the last index to i.

Remembering only the most useful past information, here the nearest previous position, is a common way to reduce memory and work.

Sliding-window alternative: keep a set of the last k values. Add nums[i], and remove nums[i - k - 1] once the window is full. A duplicate inside the window answers the question. That uses O(k) space instead of O(n).`,
      complexity: 'O(n) time, O(n) space (O(k) with the window set)',
    },
    {
      title: 'Longest Consecutive Sequence', fn: 'longestConsecutive', args: ['nums'],
      prompt: 'Return the length of the longest run of consecutive integers that can be formed from the values in nums (in any order). Aim for O(n) time.',
      tests: [[[[100, 4, 200, 1, 3, 2]], 4], [[[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], 9], [[[]], 0], [[[5]], 1], [[[1, 2, 0, 1]], 3], [[[10, 30, 20]], 1]],
      js: String.raw`function longestConsecutive(nums) {
  const set = new Set(nums);
  let best = 0;
  for (const x of set) {
    if (set.has(x - 1)) continue; // not the start of a run
    let len = 1;
    while (set.has(x + len)) len++;
    best = Math.max(best, len);
  }
  return best;
}`,
      py: String.raw`def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 in s:
            continue
        length = 1
        while x + length in s:
            length += 1
        best = max(best, length)
    return best`,
      explain: `Sorting solves it in O(n log n). A set gets it down to O(n).

1. Put every value in a set for O(1) membership checks.
2. A value x starts a run only if x - 1 is not in the set. That one check is the whole trick.
3. From each start, count upward (x + 1, x + 2, ...) while the values exist.
4. Track the longest run.

Why is this O(n) despite the inner while loop? The inner loop runs only from run starts, and each value is counted as part of exactly one run. In total the while loops do at most n steps across the whole algorithm.

Without the "is it a start?" check, you would recount each run from every member, which is O(n²) in the worst case.

Duplicates disappear automatically in the set, so [1, 2, 0, 1] has the run 0, 1, 2 of length 3.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Subarray Sum Equals K', fn: 'subarraySum', args: ['nums', 'k'],
      prompt: 'Return the number of contiguous subarrays whose elements sum to k. nums may contain negative numbers.',
      tests: [[[[1, 1, 1], 2], 2], [[[1, 2, 3], 3], 2], [[[1, -1, 0], 0], 3], [[[], 0], 0], [[[3, 4, 7, 2, -3, 1, 4, 2], 7], 4], [[[5], 5], 1]],
      js: String.raw`function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]); // prefix sum -> how many times seen
  let sum = 0, count = 0;
  for (const x of nums) {
    sum += x;
    count += seen.get(sum - k) || 0;
    seen.set(sum, (seen.get(sum) || 0) + 1);
  }
  return count;
}`,
      py: String.raw`def subarray_sum(nums, k):
    seen = {0: 1}
    total = count = 0
    for x in nums:
        total += x
        count += seen.get(total - k, 0)
        seen[total] = seen.get(total, 0) + 1
    return count`,
      explain: `This combines prefix sums (Running Sum in Easy) with the complement lookup from Two Sum.

The sum of the subarray (i, j] equals prefix[j] - prefix[i]. We want that to be k, which means prefix[i] = prefix[j] - k. So at each position j, the number of subarrays ending there with sum k equals the number of earlier prefix sums equal to the current sum minus k.

1. Keep a map from each prefix sum to how many times it has occurred. Start with {0: 1}, the empty prefix, so subarrays that start at index 0 are counted.
2. For each element, update the running sum, add the count of (sum - k) to the answer, then record the current sum.

Why not a sliding window? Windows only work when all numbers are non-negative, so that growing the window always increases the sum. Negative numbers break that, while prefix sums handle them fine.

The [1, -1, 0] example shows it: [1, -1], [0] and [1, -1, 0] all sum to 0.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Isomorphic Strings', fn: 'isIsomorphic', args: ['s', 't'],
      prompt: 'Two strings are isomorphic if the characters of s can be replaced to get t, where every occurrence of a character maps to the same character and no two characters map to the same one. Return true if s and t are isomorphic.',
      tests: [[['egg', 'add'], true], [['foo', 'bar'], false], [['paper', 'title'], true], [['badc', 'baba'], false], [['', ''], true], [['ab', 'aa'], false]],
      js: String.raw`function isIsomorphic(s, t) {
  if (s.length !== t.length) return false;
  const st = new Map(), ts = new Map();
  for (let i = 0; i < s.length; i++) {
    const a = s[i], b = t[i];
    if ((st.has(a) && st.get(a) !== b) || (ts.has(b) && ts.get(b) !== a)) return false;
    st.set(a, b);
    ts.set(b, a);
  }
  return true;
}`,
      py: String.raw`def is_isomorphic(s, t):
    if len(s) != len(t):
        return False
    st, ts = {}, {}
    for a, b in zip(s, t):
        if st.get(a, b) != b or ts.get(b, a) != a:
            return False
        st[a] = b
        ts[b] = a
    return True`,
      explain: `The mapping must be one-to-one in both directions, so keep two maps.

1. st maps characters of s to characters of t.
2. ts maps characters of t back to characters of s.
3. At each position, if either map already holds a different partner, the strings are not isomorphic.

Why two maps? With only s to t you would accept "badc" and "baba": b→b, a→a, d→b, c→a looks consistent, but d and b both map to b, and that collision is only visible from t's side. Checking t to s catches it.

The Python trick st.get(a, b) != b means: if a is unmapped, pretend it maps to b, so the check passes. Otherwise compare against its real partner.

Alternative: compare "first-seen index" patterns. "egg" gives [0, 1, 1] and "add" gives [0, 1, 1], so they are the same pattern. The next challenge uses this idea with words.`,
      complexity: 'O(n) time, O(1) space for a fixed alphabet',
    },
    {
      title: 'Word Pattern', fn: 'wordPattern', args: ['pattern', 's'],
      prompt: 'Return true if the space-separated words in s follow the same pattern as the letters in pattern: each letter maps to exactly one word and each word to exactly one letter.',
      tests: [[['abba', 'dog cat cat dog'], true], [['abba', 'dog cat cat fish'], false], [['aaaa', 'dog cat cat dog'], false], [['abba', 'dog dog dog dog'], false], [['abc', 'x y'], false], [['a', 'hi'], true]],
      js: String.raw`function wordPattern(pattern, s) {
  const words = s.split(' ');
  if (words.length !== pattern.length) return false;
  const pw = new Map(), wp = new Map();
  for (let i = 0; i < words.length; i++) {
    const p = pattern[i], w = words[i];
    if ((pw.has(p) && pw.get(p) !== w) || (wp.has(w) && wp.get(w) !== p)) return false;
    pw.set(p, w);
    wp.set(w, p);
  }
  return true;
}`,
      py: String.raw`def word_pattern(pattern, s):
    words = s.split(" ")
    if len(words) != len(pattern):
        return False
    pw, wp = {}, {}
    for p, w in zip(pattern, words):
        if pw.get(p, w) != w or wp.get(w, p) != p:
            return False
        pw[p] = w
        wp[w] = p
    return True`,
      explain: `This is the same bijection check as Isomorphic Strings, applied to letters and words.

1. Split s into words. If the number of words differs from the pattern length, it cannot match.
2. Keep letter-to-word and word-to-letter maps.
3. Every pair must agree with any mapping already recorded in both maps.

"abba" with "dog dog dog dog" fails in the reverse direction: the word dog would have to map to both a and b.

Recognizing that a new problem is an old one in disguise, here a bijection between two sequences, saves a lot of time in interviews. The tokens can be characters, words, or anything hashable.

Pattern-signature alternative: map each sequence to the list of first-occurrence indices of its tokens, and compare the two lists.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Intersection with Counts', fn: 'intersect', args: ['a', 'b'],
      prompt: 'Return the intersection of two arrays, where each value appears as many times as it appears in both (the minimum count). Order does not matter.',
      compare: 'unordered',
      tests: [[[[1, 2, 2, 1], [2, 2]], [2, 2]], [[[4, 9, 5], [9, 4, 9, 8, 4]], [4, 9]], [[[], [1]], []], [[[1, 1, 1], [1, 1]], [1, 1]], [[[1, 2, 3], [4, 5]], []]],
      js: String.raw`function intersect(a, b) {
  const count = new Map();
  for (const x of a) count.set(x, (count.get(x) || 0) + 1);
  const out = [];
  for (const x of b) {
    if (count.get(x) > 0) {
      out.push(x);
      count.set(x, count.get(x) - 1);
    }
  }
  return out;
}`,
      py: String.raw`def intersect(a, b):
    count = {}
    for x in a:
        count[x] = count.get(x, 0) + 1
    out = []
    for x in b:
        if count.get(x, 0) > 0:
            out.append(x)
            count[x] -= 1
    return out`,
      explain: `Count the values in one array, then "spend" those counts while scanning the other. It is the same technique as Is Anagram in Easy.

1. Build a frequency map of a.
2. For each x in b, if a still has a copy of x left, add x to the result and decrease its count.

Spending the counts ensures each value appears at most min(count in a, count in b) times.

Follow-ups interviewers ask:
- If both arrays are sorted, use two pointers instead: O(1) extra space.
- If one array is much smaller, build the map from the smaller one to save memory.
- If b is too big to fit in memory, stream it in chunks against the map of a.

Python's collections.Counter supports this directly: (Counter(a) & Counter(b)).elements().`,
      complexity: 'O(n + m) time, O(min(n, m)) space if you count the smaller array',
    },
    {
      title: 'Ransom Note', fn: 'canConstruct', args: ['note', 'magazine'],
      prompt: 'Return true if the string note can be built from the letters in magazine, where each magazine letter can be used at most once.',
      tests: [[['a', 'b'], false], [['aa', 'ab'], false], [['aa', 'aab'], true], [['', 'abc'], true], [['hello', 'oellh'], true], [['abc', ''], false]],
      js: String.raw`function canConstruct(note, magazine) {
  const count = {};
  for (const c of magazine) count[c] = (count[c] || 0) + 1;
  for (const c of note) {
    if (!count[c]) return false;
    count[c]--;
  }
  return true;
}`,
      py: String.raw`def can_construct(note, magazine):
    count = {}
    for c in magazine:
        count[c] = count.get(c, 0) + 1
    for c in note:
        if count.get(c, 0) == 0:
            return False
        count[c] -= 1
    return True`,
      explain: `Model the magazine as an inventory of letters, then try to pay for the note out of it.

1. Count the available letters in magazine.
2. For each letter of note, take one from the inventory. If none are left, fail immediately.

This is a multiset containment check: does the multiset of note fit inside the multiset of magazine? Only the counts matter, not the order.

Note that we count the magazine, the supply, and then spend it with the note, the demand. Doing it the other way round also works, but this version can stop at the first missing letter.

For lowercase-only input, an array of 26 integers is a faster stand-in for the map.`,
      complexity: 'O(n + m) time, O(1) space for a fixed alphabet',
    },
  ],
};

export default m;
