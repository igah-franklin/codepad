import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'sliding-window',
  title: 'Sliding Window',
  description: 'Grow the right edge, shrink the left: answer subarray questions in one pass.',
  challenges: [
    {
      title: 'Max Sum of Size K', fn: 'maxSumK', args: ['nums', 'k'],
      prompt: 'Return the largest sum of any contiguous subarray of exactly k elements (1 ≤ k ≤ nums.length).',
      tests: [[[[2, 1, 5, 1, 3, 2], 3], 9], [[[2, 3, 4, 1, 5], 2], 7], [[[5], 1], 5], [[[-1, -2, -3], 2], -3], [[[1, 2, 3, 4], 4], 10]],
      js: String.raw`function maxSumK(nums, k) {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += nums[i];
  let best = sum;
  for (let i = k; i < nums.length; i++) {
    sum += nums[i] - nums[i - k]; // slide: add the new element, drop the oldest
    best = Math.max(best, sum);
  }
  return best;
}`,
      py: String.raw`def max_sum_k(nums, k):
    s = sum(nums[:k])
    best = s
    for i in range(k, len(nums)):
        s += nums[i] - nums[i - k]
        best = max(best, s)
    return best`,
      explain: `This is the fixed-size sliding window, the simplest window pattern.

Recomputing every window's sum from scratch costs O(k) per window, O(n × k) in total. But neighbouring windows share k - 1 elements: moving one step right adds a single new element and drops a single old one.

1. Sum the first k elements.
2. For each new index i, add nums[i] and subtract nums[i - k], the element that just left the window.
3. Track the best sum seen.

Each step is O(1), so the whole scan is O(n).

Seeding best with the first window's sum, not 0, keeps the code correct when every number is negative, as in [-1, -2, -3] where the answer is -3.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Longest Substring Without Repeats', fn: 'lengthOfLongestSubstring', args: ['s'],
      prompt: 'Return the length of the longest substring of s that contains no repeated characters.',
      tests: [[['abcabcbb'], 3], [['bbbbb'], 1], [['pwwkew'], 3], [[''], 0], [['dvdf'], 3], [['abba'], 2], [['au'], 2]],
      js: String.raw`function lengthOfLongestSubstring(s) {
  const last = new Map(); // char -> last index seen
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (last.has(c) && last.get(c) >= left) left = last.get(c) + 1;
    last.set(c, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
      py: String.raw`def length_of_longest_substring(s):
    last = {}
    left = best = 0
    for right, c in enumerate(s):
        if c in last and last[c] >= left:
            left = last[c] + 1
        last[c] = right
        best = max(best, right - left + 1)
    return best`,
      explain: `This is a variable-size window that is always kept valid, meaning no repeats inside it.

1. right moves forward one character at a time, growing the window.
2. If the new character already appears inside the window, the window becomes invalid. Jump left to just past that earlier occurrence.
3. Record where this character was seen and update the best length (right - left + 1).

Why the check last.get(c) >= left? The map remembers every character ever seen, including ones that have already left the window. In "abba", when right reaches the final a, the earlier a at index 0 is already outside the window [2, 3], so left must not move backwards. Without that check the answer for "abba" would be wrong.

Jumping left directly with the map is an optimization. The basic version keeps a set and removes s[left] one at a time while the new character is present. Both are O(n), because left only ever moves forward.`,
      complexity: 'O(n) time, O(min(n, alphabet)) space',
    },
    {
      title: 'Minimum Size Subarray Sum', fn: 'minSubArrayLen', args: ['target', 'nums'],
      prompt: 'nums contains positive integers. Return the length of the shortest contiguous subarray whose sum is at least target, or 0 if none exists.',
      tests: [[[7, [2, 3, 1, 2, 4, 3]], 2], [[4, [1, 4, 4]], 1], [[11, [1, 1, 1, 1, 1, 1, 1, 1]], 0], [[15, [1, 2, 3, 4, 5]], 5], [[3, []], 0]],
      js: String.raw`function minSubArrayLen(target, nums) {
  let left = 0, sum = 0, best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    while (sum >= target) {
      best = Math.min(best, right - left + 1);
      sum -= nums[left++];
    }
  }
  return best === Infinity ? 0 : best;
}`,
      py: String.raw`def min_sub_array_len(target, nums):
    left = total = 0
    best = float("inf")
    for right, x in enumerate(nums):
        total += x
        while total >= target:
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == float("inf") else best`,
      explain: `This is a variable window that shrinks while it is valid, which is how you find the minimum length.

1. Extend right and add each element to the sum.
2. While the sum is at least target, the window is valid. Record its length, then shrink from the left to look for something shorter.
3. Continue until right reaches the end.

This only works because every number is positive. Adding an element always increases the sum and removing one always decreases it, so "too small: grow" and "big enough: shrink" are always the right moves. With negative numbers you would need prefix sums instead, as in Subarray Sum Equals K.

Even with the inner while loop, the total work is O(n). Each element enters the window once (right) and leaves at most once (left).

Infinity is the "nothing found yet" sentinel, converted to 0 at the end.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Max Consecutive Ones III', fn: 'longestOnes', args: ['nums', 'k'],
      prompt: 'nums contains only 0s and 1s. You may flip at most k zeros to ones. Return the length of the longest run of consecutive 1s you can make.',
      tests: [[[[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2], 6], [[[0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3], 10], [[[0, 0, 0], 0], 0], [[[1, 1, 1], 0], 3], [[[0, 0, 0], 5], 3]],
      js: String.raw`function longestOnes(nums, k) {
  let left = 0, zeros = 0, best = 0;
  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeros++;
    while (zeros > k) {
      if (nums[left] === 0) zeros--;
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
      py: String.raw`def longest_ones(nums, k):
    left = zeros = best = 0
    for right, x in enumerate(nums):
        if x == 0:
            zeros += 1
        while zeros > k:
            if nums[left] == 0:
                zeros -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`,
      explain: `Rephrase the problem: find the longest window that contains at most k zeros. Every zero in such a window can be flipped.

1. Grow the window with right and count the zeros inside it.
2. If there are more than k zeros, shrink from the left until there are k again.
3. The window is now valid, so record its length.

This is the general template for "longest window satisfying a constraint":
- keep a summary of the window (here, a count of zeros),
- extend right,
- shrink left while the constraint is broken,
- update the answer.

Turning "flip at most k" into "contain at most k bad items" is the key insight. You never actually flip anything.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Permutation in String', fn: 'checkInclusion', args: ['s1', 's2'],
      prompt: 'Return true if some permutation of s1 appears as a contiguous substring of s2. Strings contain lowercase letters only.',
      tests: [[['ab', 'eidbaooo'], true], [['ab', 'eidboaoo'], false], [['adc', 'dcda'], true], [['a', 'a'], true], [['abc', 'ab'], false], [['hello', 'ooolleoooleh'], false]],
      js: String.raw`function checkInclusion(s1, s2) {
  if (s1.length > s2.length) return false;
  const need = new Array(26).fill(0), have = new Array(26).fill(0);
  const idx = (c) => c.charCodeAt(0) - 97;
  for (const c of s1) need[idx(c)]++;
  const k = s1.length;
  for (let i = 0; i < s2.length; i++) {
    have[idx(s2[i])]++;
    if (i >= k) have[idx(s2[i - k])]--;
    if (i >= k - 1 && need.every((v, j) => v === have[j])) return true;
  }
  return false;
}`,
      py: String.raw`def check_inclusion(s1, s2):
    if len(s1) > len(s2):
        return False
    need = [0] * 26
    have = [0] * 26
    for c in s1:
        need[ord(c) - 97] += 1
    k = len(s1)
    for i, c in enumerate(s2):
        have[ord(c) - 97] += 1
        if i >= k:
            have[ord(s2[i - k]) - 97] -= 1
        if i >= k - 1 and have == need:
            return True
    return False`,
      explain: `A permutation of s1 is any string with the same letter counts, an anagram. So slide a fixed window of length |s1| across s2 and compare letter counts.

1. Count the letters of s1 in need, an array of 26.
2. Slide over s2: add the incoming character to have, and once the window is longer than k, remove the character that just left.
3. Whenever the window is exactly k long, compare have with need.

Comparing two 26-element arrays is O(26), effectively constant, so the scan is O(n).

Faster refinement: keep a count of how many of the 26 letters currently match between have and need, and update it in O(1) as characters enter and leave. That avoids the 26-element comparison on every step.

This is Is Anagram combined with a fixed-size window. The next-but-one challenge, Find All Anagrams, is the same idea, collecting every match instead of stopping at the first.`,
      complexity: 'O(n · 26) time, O(1) space',
    },
    {
      title: 'Longest Repeating Character Replacement', fn: 'characterReplacement', args: ['s', 'k'],
      prompt: 's has upper-case letters. You can change at most k characters to any letter. Return the length of the longest substring that can be made of one repeated letter.',
      tests: [[['ABAB', 2], 4], [['AABABBA', 1], 4], [['AAAA', 0], 4], [['', 2], 0], [['ABCDE', 1], 2], [['ABBB', 2], 4]],
      js: String.raw`function characterReplacement(s, k) {
  const count = {};
  let left = 0, maxFreq = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    count[s[right]] = (count[s[right]] || 0) + 1;
    maxFreq = Math.max(maxFreq, count[s[right]]);
    // window size - most common letter = letters we would need to change
    while (right - left + 1 - maxFreq > k) {
      count[s[left]]--;
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
      py: String.raw`def character_replacement(s, k):
    count = {}
    left = max_freq = best = 0
    for right, c in enumerate(s):
        count[c] = count.get(c, 0) + 1
        max_freq = max(max_freq, count[c])
        while right - left + 1 - max_freq > k:
            count[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`,
      explain: `A window can be turned into a single repeated letter if (window length) - (count of its most common letter) ≤ k. Those are the letters you would change.

1. Extend right and update the letter counts and maxFreq, the highest count seen.
2. If the window needs more than k changes, shrink it from the left.
3. Record the window size.

A subtle point: when we shrink, we do not decrease maxFreq, even though it might now overstate the real maximum in the window. That is safe, because we only care about windows longer than the best found so far. A longer valid window would need a higher maxFreq than any seen before, and that case is detected correctly whenever it happens. A stale maxFreq can only stop the window from shrinking, never produce a wrong answer.

Recomputing the true maximum over 26 letters on every step is also fine, at O(26n).`,
      complexity: 'O(n) time, O(1) space (26 letters)',
    },
    {
      title: 'Find All Anagrams', fn: 'findAnagrams', args: ['s', 'p'],
      prompt: 'Return the starting indices of every substring of s that is an anagram of p, in ascending order. Lowercase letters only.',
      tests: [[['cbaebabacd', 'abc'], [0, 6]], [['abab', 'ab'], [0, 1, 2]], [['a', 'ab'], []], [['aaaa', 'a'], [0, 1, 2, 3]], [['xyz', 'abc'], []]],
      js: String.raw`function findAnagrams(s, p) {
  const out = [];
  if (p.length > s.length) return out;
  const need = new Array(26).fill(0), have = new Array(26).fill(0);
  const idx = (c) => c.charCodeAt(0) - 97;
  for (const c of p) need[idx(c)]++;
  let matches = need.filter((v) => v === 0).length; // letters whose counts already agree
  const k = p.length;
  const bump = (i, d) => {
    if (have[i] === need[i]) matches--;
    have[i] += d;
    if (have[i] === need[i]) matches++;
  };
  for (let i = 0; i < s.length; i++) {
    bump(idx(s[i]), 1);
    if (i >= k) bump(idx(s[i - k]), -1);
    if (matches === 26) out.push(i - k + 1);
  }
  return out;
}`,
      py: String.raw`def find_anagrams(s, p):
    out = []
    if len(p) > len(s):
        return out
    need = [0] * 26
    have = [0] * 26
    for c in p:
        need[ord(c) - 97] += 1
    matches = sum(1 for v in need if v == 0)
    k = len(p)

    def bump(i, d):
        nonlocal matches
        if have[i] == need[i]:
            matches -= 1
        have[i] += d
        if have[i] == need[i]:
            matches += 1

    for i, c in enumerate(s):
        bump(ord(c) - 97, 1)
        if i >= k:
            bump(ord(s[i - k]) - 97, -1)
        if matches == 26:
            out.append(i - k + 1)
    return out`,
      explain: `This uses the same fixed window as Permutation in String, plus the O(1) refinement mentioned there.

Instead of comparing all 26 counts at every step, keep matches, the number of letters whose window count equals the count in p.

When one letter's count changes:
- if it matched before the change, it no longer does, so matches goes down by 1;
- if it matches after the change, matches goes up by 1.

Only the letter that entered and the letter that left change at each step, so updating matches is O(1). When matches equals 26, every count agrees and the window is an anagram. Its start index is i - k + 1.

Counting how many constraints are currently satisfied, instead of re-checking all of them, is a widely useful optimization. Minimum Window Substring in Hard uses exactly the same trick.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Fruit Into Baskets', fn: 'totalFruit', args: ['fruits'],
      prompt: 'fruits[i] is the type of fruit on tree i. You have two baskets, each holding a single type. Starting at any tree and moving right, pick one fruit per tree until you meet a third type. Return the most fruit you can pick, which is the longest subarray with at most 2 distinct values.',
      tests: [[[[1, 2, 1]], 3], [[[0, 1, 2, 2]], 3], [[[1, 2, 3, 2, 2]], 4], [[[3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4]], 5], [[[]], 0], [[[7]], 1]],
      js: String.raw`function totalFruit(fruits) {
  const count = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < fruits.length; right++) {
    count.set(fruits[right], (count.get(fruits[right]) || 0) + 1);
    while (count.size > 2) {
      const f = fruits[left++];
      count.set(f, count.get(f) - 1);
      if (count.get(f) === 0) count.delete(f);
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
      py: String.raw`def total_fruit(fruits):
    count = {}
    left = best = 0
    for right, f in enumerate(fruits):
        count[f] = count.get(f, 0) + 1
        while len(count) > 2:
            g = fruits[left]
            count[g] -= 1
            if count[g] == 0:
                del count[g]
            left += 1
        best = max(best, right - left + 1)
    return best`,
      explain: `Strip away the story and this is "longest subarray with at most K distinct values", with K = 2.

The window keeps a map from each type to its count:
1. Add the fruit at right.
2. While the map holds more than 2 types, remove the fruit at left, deleting a type completely once its count reaches 0, so that the map's size equals the number of distinct types.
3. Record the window length.

Deleting zero-count entries is essential, because the map's size is how we measure "distinct". Leaving zero entries in place would make the size wrong.

Word problems often hide a standard pattern. Translating the story into a precise statement, here "longest subarray with at most 2 distinct values", is half the work. Changing the 2 to a K solves the general problem.`,
      complexity: 'O(n) time, O(1) space (at most 3 keys)',
    },
    {
      title: 'Max Vowels in a Window', fn: 'maxVowels', args: ['s', 'k'],
      prompt: 'Return the maximum number of vowels (a, e, i, o, u) in any substring of s of length k.',
      tests: [[['abciiidef', 3], 3], [['aeiou', 2], 2], [['leetcode', 3], 2], [['rhythms', 4], 0], [['tryhard', 4], 1]],
      js: String.raw`function maxVowels(s, k) {
  const isV = (c) => 'aeiou'.includes(c);
  let cur = 0;
  for (let i = 0; i < k; i++) if (isV(s[i])) cur++;
  let best = cur;
  for (let i = k; i < s.length; i++) {
    if (isV(s[i])) cur++;
    if (isV(s[i - k])) cur--;
    best = Math.max(best, cur);
  }
  return best;
}`,
      py: String.raw`def max_vowels(s, k):
    vowels = set("aeiou")
    cur = sum(1 for c in s[:k] if c in vowels)
    best = cur
    for i in range(k, len(s)):
        cur += s[i] in vowels
        cur -= s[i - k] in vowels
        best = max(best, cur)
    return best`,
      explain: `This is a fixed-size window that tracks a count instead of a sum. It is the same template as Max Sum of Size K.

1. Count the vowels in the first k characters.
2. Slide: add 1 if the entering character is a vowel, and subtract 1 if the leaving one is.
3. Keep the maximum.

In Python, True and False behave as 1 and 0 in arithmetic, so cur += s[i] in vowels adds 1 exactly when the character is a vowel.

Early exit: if cur ever reaches k, every character in the window is a vowel and no window can do better, so you can return immediately.

The fixed-window template stays the same whatever the summary: sum, count, set of characters, frequency array. Only the add and remove steps change.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Subarrays With Product Less Than K', fn: 'numSubarrayProductLessThanK', args: ['nums', 'k'],
      prompt: 'nums contains positive integers. Return the number of contiguous subarrays whose product is strictly less than k.',
      tests: [[[[10, 5, 2, 6], 100], 8], [[[1, 2, 3], 0], 0], [[[1, 1, 1], 2], 6], [[[5], 6], 1], [[[2, 5, 3, 10], 30], 6]],
      js: String.raw`function numSubarrayProductLessThanK(nums, k) {
  if (k <= 1) return 0;
  let left = 0, prod = 1, count = 0;
  for (let right = 0; right < nums.length; right++) {
    prod *= nums[right];
    while (prod >= k) prod /= nums[left++];
    count += right - left + 1; // all windows ending at right
  }
  return count;
}`,
      py: String.raw`def num_subarray_product_less_than_k(nums, k):
    if k <= 1:
        return 0
    left, prod, count = 0, 1, 0
    for right, x in enumerate(nums):
        prod *= x
        while prod >= k:
            prod //= nums[left]
            left += 1
        count += right - left + 1
    return count`,
      explain: `Counting subarrays with a window uses one more idea: once the window [left, right] is valid, every subarray that ends at right and starts anywhere inside the window is also valid.

Why? With positive numbers, a shorter subarray has a smaller product. So [left..right], [left+1..right], ..., [right..right] all have a product below k, which gives right - left + 1 subarrays ending at right.

1. Multiply the new element into the product.
2. While the product is at least k, divide out nums[left] and move left forward.
3. Add right - left + 1 to the count.

Each subarray is counted exactly once, by its right end.

k ≤ 1 is a special case: every product of positive integers is at least 1, so nothing qualifies. Returning early also keeps the while loop from running left past right.

"Count the windows ending here" is the standard way to turn a longest-window solution into a counting one.`,
      complexity: 'O(n) time, O(1) space',
    },
  ],
};

export default m;
