import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'two-pointers',
  title: 'Two Pointers',
  description: 'Walk inward from both ends, or run a fast and a slow index together.',
  challenges: [
    {
      title: 'Valid Palindrome', fn: 'isPalindromeAlnum', args: ['s'],
      prompt: 'Return true if s is a palindrome after converting to lower case and removing every character that is not a letter or digit. "A man, a plan, a canal: Panama" is a palindrome.',
      tests: [[['A man, a plan, a canal: Panama'], true], [['race a car'], false], [[' '], true], [['0P'], false], [['No lemon, no melon'], true], [['ab_a'], true]],
      js: String.raw`function isPalindromeAlnum(s) {
  const ok = (c) => /[a-z0-9]/i.test(c);
  let i = 0, j = s.length - 1;
  while (i < j) {
    if (!ok(s[i])) { i++; continue; }
    if (!ok(s[j])) { j--; continue; }
    if (s[i].toLowerCase() !== s[j].toLowerCase()) return false;
    i++;
    j--;
  }
  return true;
}`,
      py: String.raw`def is_palindrome_alnum(s):
    i, j = 0, len(s) - 1
    while i < j:
        if not s[i].isalnum():
            i += 1
        elif not s[j].isalnum():
            j -= 1
        elif s[i].lower() != s[j].lower():
            return False
        else:
            i += 1
            j -= 1
    return True`,
      explain: `This is the two-pointer palindrome check from Easy, with skipping added.

1. i starts at the left end and j at the right.
2. If s[i] is not a letter or digit, move i right. If s[j] is not, move j left.
3. Once both point at alphanumeric characters, compare them case-insensitively. A mismatch means it is not a palindrome.
4. Move both inward and repeat until they meet.

Doing the filtering on the fly avoids building a cleaned copy of the string, so it uses O(1) extra space. Building the cleaned string first and comparing it with its reverse is also correct and simpler, but it uses O(n) memory.

Edge cases: a string with no alphanumeric characters (like " ") is a palindrome. "0P" is not, because 0 and p differ. Underscores count as non-alphanumeric, so "ab_a" reads "aba".`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Two Sum (Sorted Input)', fn: 'twoSumSorted', args: ['nums', 'target'],
      prompt: 'nums is sorted ascending. Return the indices [i, j] (i < j) of the two numbers that add to target, using O(1) extra space. Exactly one solution exists.',
      tests: [[[[2, 7, 11, 15], 9], [0, 1]], [[[2, 3, 4], 6], [0, 2]], [[[-1, 0], -1], [0, 1]], [[[1, 2, 3, 4, 4, 9, 56, 90], 8], [3, 4]], [[[-10, -3, 2, 8, 20], 5], [1, 3]]],
      js: String.raw`function twoSumSorted(nums, target) {
  let i = 0, j = nums.length - 1;
  while (i < j) {
    const sum = nums[i] + nums[j];
    if (sum === target) return [i, j];
    if (sum < target) i++;
    else j--;
  }
  return [];
}`,
      py: String.raw`def two_sum_sorted(nums, target):
    i, j = 0, len(nums) - 1
    while i < j:
        s = nums[i] + nums[j]
        if s == target:
            return [i, j]
        if s < target:
            i += 1
        else:
            j -= 1
    return []`,
      explain: `Sorted input lets you drop the hash map from Two Sum.

Start with the smallest element (i at the left) and the largest (j at the right):
- If their sum is too small, the only way to increase it is to move i right to a larger number.
- If the sum is too big, move j left to a smaller number.
- If it equals target, you are done.

Why can't this skip the answer? Suppose the answer is (a, b) and i reaches a first. While i sits at a, every j to the right of b gives a sum that is too big, so j keeps moving left until it reaches b. The symmetric argument holds if j reaches b first. Each step rules out one element that cannot be part of the answer.

Each pointer moves at most n times, so it is O(n) time with O(1) space, compared with O(n) space for the hash map. The same squeeze is the inner loop of 3Sum.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Container With Most Water', fn: 'maxArea', args: ['height'],
      prompt: 'height[i] is the height of a vertical line at x = i. Choose two lines that, with the x-axis, form a container holding the most water. Return that maximum area (width × the shorter height).',
      tests: [[[[1, 8, 6, 2, 5, 4, 8, 3, 7]], 49], [[[1, 1]], 1], [[[4, 3, 2, 1, 4]], 16], [[[1, 2, 1]], 2], [[[2, 3, 10, 5, 7, 8, 9]], 36]],
      js: String.raw`function maxArea(height) {
  let i = 0, j = height.length - 1, best = 0;
  while (i < j) {
    const area = (j - i) * Math.min(height[i], height[j]);
    best = Math.max(best, area);
    if (height[i] < height[j]) i++;
    else j--;
  }
  return best;
}`,
      py: String.raw`def max_area(height):
    i, j, best = 0, len(height) - 1, 0
    while i < j:
        best = max(best, (j - i) * min(height[i], height[j]))
        if height[i] < height[j]:
            i += 1
        else:
            j -= 1
    return best`,
      explain: `Brute force tries every pair, which is O(n²). Two pointers solve it in O(n).

Start with the widest container, the two outermost lines. Then repeatedly move the pointer at the shorter line inward.

Why move the shorter one? The area is width × min(left, right). Moving inward always shrinks the width. If you moved the taller line, the minimum height could not increase, because it is capped by the shorter line, which stays put. So the area could only get worse. Moving the shorter line is the only move that might find a taller line and a bigger area.

That argument proves we never skip the best pair: every pair we skip contains the shorter line with a narrower partner, and all such pairs have a smaller area than the one we just measured.

Greedy pointer movement backed by an "exchange argument" like this is a pattern worth learning.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: '3Sum', fn: 'threeSum', args: ['nums'],
      prompt: 'Return all unique triplets [a, b, c] from nums with a + b + c = 0. No duplicate triplets. The order of triplets and of numbers within a triplet does not matter.',
      compare: 'unorderedDeep',
      tests: [[[[-1, 0, 1, 2, -1, -4]], [[-1, -1, 2], [-1, 0, 1]]], [[[0, 1, 1]], []], [[[0, 0, 0]], [[0, 0, 0]]], [[[0, 0, 0, 0]], [[0, 0, 0]]], [[[-2, 0, 1, 1, 2]], [[-2, 0, 2], [-2, 1, 1]]], [[[]], []]],
      js: String.raw`function threeSum(nums) {
  const a = nums.slice().sort((x, y) => x - y);
  const out = [];
  for (let i = 0; i < a.length - 2; i++) {
    if (a[i] > 0) break;
    if (i > 0 && a[i] === a[i - 1]) continue; // skip duplicate anchors
    let lo = i + 1, hi = a.length - 1;
    while (lo < hi) {
      const sum = a[i] + a[lo] + a[hi];
      if (sum < 0) lo++;
      else if (sum > 0) hi--;
      else {
        out.push([a[i], a[lo], a[hi]]);
        while (lo < hi && a[lo] === a[lo + 1]) lo++;
        while (lo < hi && a[hi] === a[hi - 1]) hi--;
        lo++;
        hi--;
      }
    }
  }
  return out;
}`,
      py: String.raw`def three_sum(nums):
    a = sorted(nums)
    out = []
    for i in range(len(a) - 2):
        if a[i] > 0:
            break
        if i > 0 and a[i] == a[i - 1]:
            continue
        lo, hi = i + 1, len(a) - 1
        while lo < hi:
            s = a[i] + a[lo] + a[hi]
            if s < 0:
                lo += 1
            elif s > 0:
                hi -= 1
            else:
                out.append([a[i], a[lo], a[hi]])
                while lo < hi and a[lo] == a[lo + 1]:
                    lo += 1
                while lo < hi and a[hi] == a[hi - 1]:
                    hi -= 1
                lo += 1
                hi -= 1
    return out`,
      explain: `Reduce 3Sum to many runs of Two Sum (Sorted Input).

1. Sort the array.
2. Fix each element a[i] as the first number. Then find pairs to its right that sum to -a[i] using the two-pointer squeeze.
3. Skip duplicates so no triplet is reported twice:
- If a[i] equals the previous anchor, skip it, because the same triplets were already found.
- After finding a triplet, move lo and hi past any repeated values.
4. Early exit: once a[i] > 0, every remaining number is positive too, so no triplet can sum to 0.

Sorting is what makes both the squeeze and the duplicate skipping possible, because equal values end up adjacent.

Total time: O(n log n) to sort, plus n anchors × O(n) squeeze, which gives O(n²). That is the best known approach for this problem, compared with O(n³) brute force.`,
      complexity: 'O(n²) time, O(log n) to O(n) space for sorting',
    },
    {
      title: 'Remove Duplicates from Sorted Array', fn: 'removeDuplicatesSorted', args: ['nums'],
      prompt: 'nums is sorted. Remove duplicates in place using the read/write two-pointer technique, and return the first k elements (the unique values).',
      tests: [[[[1, 1, 2]], [1, 2]], [[[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], [0, 1, 2, 3, 4]], [[[]], []], [[[5]], [5]], [[[1, 2, 3]], [1, 2, 3]]],
      js: String.raw`function removeDuplicatesSorted(nums) {
  if (nums.length === 0) return [];
  let write = 1;
  for (let read = 1; read < nums.length; read++) {
    if (nums[read] !== nums[write - 1]) {
      nums[write] = nums[read];
      write++;
    }
  }
  return nums.slice(0, write);
}`,
      py: String.raw`def remove_duplicates_sorted(nums):
    if not nums:
        return []
    write = 1
    for read in range(1, len(nums)):
        if nums[read] != nums[write - 1]:
            nums[write] = nums[read]
            write += 1
    return nums[:write]`,
      explain: `This is the slow/fast (write/read) pointer pattern for in-place filtering.

- read scans every element.
- write marks where the next kept element should go. Everything before write is the deduplicated result so far.

Because the array is sorted, duplicates are adjacent. An element is new exactly when it differs from the last kept value, nums[write - 1]. When it is new, copy it to position write and advance write.

Trace [1, 1, 2]: write = 1. read = 1 sees 1, which equals the last kept 1, so skip it. read = 2 sees 2, which is different, so nums[1] = 2 and write = 2. The result is the first two elements, [1, 2].

The same template handles "remove all copies of a value", "move zeroes" and "keep at most two of each value": only the keep condition changes.`,
      complexity: 'O(n) time, O(1) extra space',
    },
    {
      title: 'Move Zeroes', fn: 'moveZeroes', args: ['nums'],
      prompt: 'Move all 0s to the end of nums while keeping the relative order of the non-zero elements. Do it in place and return the array.',
      tests: [[[[0, 1, 0, 3, 12]], [1, 3, 12, 0, 0]], [[[0]], [0]], [[[1, 2, 3]], [1, 2, 3]], [[[0, 0, 1]], [1, 0, 0]], [[[4, 0, 5, 0, 0, 6]], [4, 5, 6, 0, 0, 0]]],
      js: String.raw`function moveZeroes(nums) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      [nums[write], nums[read]] = [nums[read], nums[write]];
      write++;
    }
  }
  return nums;
}`,
      py: String.raw`def move_zeroes(nums):
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]
            write += 1
    return nums`,
      explain: `This uses the read/write pointer template with swaps instead of copies.

write is the slot for the next non-zero value. Every time read finds a non-zero, swap it into position write and advance write. The zeros get pushed toward the back, and the non-zeros keep their relative order because they are placed in the order they were found.

Why swap rather than copy? Copying non-zeros forward and then filling the tail with zeros also works, and it does fewer writes when there are many zeros. Swapping does it in a single pass with no cleanup loop.

When there are no zeros, read and write move together and each swap exchanges an element with itself, which is harmless.

This is a stable partition done in place, a close relative of Evens Before Odds from Easy, but with O(1) extra space.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Squares of a Sorted Array', fn: 'sortedSquares', args: ['nums'],
      prompt: 'nums is sorted ascending and may include negatives. Return the squares of each number, also sorted ascending, in O(n) time.',
      tests: [[[[-4, -1, 0, 3, 10]], [0, 1, 9, 16, 100]], [[[-7, -3, 2, 3, 11]], [4, 9, 9, 49, 121]], [[[1, 2, 3]], [1, 4, 9]], [[[-3, -2, -1]], [1, 4, 9]], [[[]], []]],
      js: String.raw`function sortedSquares(nums) {
  const n = nums.length;
  const out = new Array(n);
  let i = 0, j = n - 1;
  for (let k = n - 1; k >= 0; k--) {
    if (Math.abs(nums[i]) > Math.abs(nums[j])) {
      out[k] = nums[i] * nums[i];
      i++;
    } else {
      out[k] = nums[j] * nums[j];
      j--;
    }
  }
  return out;
}`,
      py: String.raw`def sorted_squares(nums):
    n = len(nums)
    out = [0] * n
    i, j = 0, n - 1
    for k in range(n - 1, -1, -1):
        if abs(nums[i]) > abs(nums[j]):
            out[k] = nums[i] * nums[i]
            i += 1
        else:
            out[k] = nums[j] * nums[j]
            j -= 1
    return out`,
      explain: `Squaring and then sorting is O(n log n). Two pointers do it in O(n).

Observation: the largest square comes from whichever end has the larger absolute value, either the most negative number or the most positive one. The values closest to zero sit somewhere in the middle.

1. Put pointers at both ends.
2. Fill the output from the back (largest first): compare the absolute values at the two ends, write the bigger square into position k, and move that pointer inward.
3. Repeat until every slot is filled.

This is really a merge of two sorted sequences: the negative part read backwards and the non-negative part read forwards. It is the same idea as Merge Two Sorted Arrays, just approached from the outside in.

Filling from the back is the trick. We always know which value is the biggest remaining, but not which is the smallest.`,
      complexity: 'O(n) time, O(n) space for the output',
    },
    {
      title: 'Reverse Vowels', fn: 'reverseVowels', args: ['s'],
      prompt: 'Reverse only the vowels (a, e, i, o, u in either case) in s, leaving every other character in place.',
      tests: [[['hello'], 'holle'], [['leetcode'], 'leotcede'], [['aA'], 'Aa'], [['xyz'], 'xyz'], [[''], ''], [['Codepad'], 'Cadepod']],
      js: String.raw`function reverseVowels(s) {
  const v = new Set('aeiouAEIOU');
  const a = [...s];
  let i = 0, j = a.length - 1;
  while (i < j) {
    if (!v.has(a[i])) i++;
    else if (!v.has(a[j])) j--;
    else {
      [a[i], a[j]] = [a[j], a[i]];
      i++;
      j--;
    }
  }
  return a.join('');
}`,
      py: String.raw`def reverse_vowels(s):
    v = set("aeiouAEIOU")
    a = list(s)
    i, j = 0, len(a) - 1
    while i < j:
        if a[i] not in v:
            i += 1
        elif a[j] not in v:
            j -= 1
        else:
            a[i], a[j] = a[j], a[i]
            i += 1
            j -= 1
    return "".join(a)`,
      explain: `Reversing a whole array means swapping the ends and moving inward. Here only vowels take part, so each pointer skips forward until it reaches a vowel, and then the two vowels are swapped.

1. i searches from the left and j from the right.
2. Skip consonants on either side.
3. When both point at vowels, swap them and move both pointers inward.

Strings are immutable, so convert to an array of characters first and join it back at the end.

This is the Valid Palindrome skeleton, with "skip non-vowels" in place of "skip non-alphanumerics" and "swap" in place of "compare". Most two-pointer problems follow this shape: advance the pointers past irrelevant items, act on the relevant pair, and repeat.`,
      complexity: 'O(n) time, O(n) space for the character array',
    },
    {
      title: 'Is Subsequence', fn: 'isSubsequence', args: ['s', 't'],
      prompt: 'Return true if s is a subsequence of t: s can be formed by deleting zero or more characters of t without changing the order of the rest. "ace" is a subsequence of "abcde"; "aec" is not.',
      tests: [[['abc', 'ahbgdc'], true], [['axc', 'ahbgdc'], false], [['', 'abc'], true], [['abc', ''], false], [['ace', 'abcde'], true], [['aec', 'abcde'], false]],
      js: String.raw`function isSubsequence(s, t) {
  let i = 0;
  for (let j = 0; j < t.length && i < s.length; j++) {
    if (s[i] === t[j]) i++;
  }
  return i === s.length;
}`,
      py: String.raw`def is_subsequence(s, t):
    i = 0
    for c in t:
        if i < len(s) and s[i] == c:
            i += 1
    return i == len(s)`,
      explain: `Walk through t once, keeping a pointer i into s that marks the next character you still need.

Whenever t's current character matches s[i], that need is met, so advance i. If i reaches the end of s, every character of s was found in order.

Why greedy matching is safe: matching s[i] at the earliest possible position in t never hurts. It leaves as much of t as possible for the remaining characters of s. If any valid matching exists, the greedy one succeeds.

The empty string is a subsequence of everything.

Follow-up (a classic): if you must check many different s against the same huge t, precompute, for each character, the sorted list of its positions in t. Each query then binary-searches for "the next position after the current one", which is fast even when t is enormous.`,
      complexity: 'O(|t|) time, O(1) space',
    },
    {
      title: 'Sort Colors', fn: 'sortColors', args: ['nums'],
      prompt: 'nums contains only 0s, 1s and 2s. Sort it in place in a single pass without using a sort function, and return it. (This is the Dutch National Flag problem.)',
      tests: [[[[2, 0, 2, 1, 1, 0]], [0, 0, 1, 1, 2, 2]], [[[2, 0, 1]], [0, 1, 2]], [[[0]], [0]], [[[1, 1, 1]], [1, 1, 1]], [[[2, 2, 0, 0]], [0, 0, 2, 2]], [[[]], []]],
      js: String.raw`function sortColors(nums) {
  let lo = 0, mid = 0, hi = nums.length - 1;
  while (mid <= hi) {
    if (nums[mid] === 0) {
      [nums[lo], nums[mid]] = [nums[mid], nums[lo]];
      lo++;
      mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      [nums[mid], nums[hi]] = [nums[hi], nums[mid]];
      hi--;
    }
  }
  return nums;
}`,
      py: String.raw`def sort_colors(nums):
    lo, mid, hi = 0, 0, len(nums) - 1
    while mid <= hi:
        if nums[mid] == 0:
            nums[lo], nums[mid] = nums[mid], nums[lo]
            lo += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[hi] = nums[hi], nums[mid]
            hi -= 1
    return nums
`,
      explain: `Three pointers split the array into four regions:
- [0, lo): all 0s
- [lo, mid): all 1s
- [mid, hi]: not yet examined
- (hi, end]: all 2s

Look at nums[mid]:
- 0: swap it into the 0 region at lo, then advance both lo and mid. The value swapped back from lo is a 1 (or the same element), which has already been examined.
- 1: it is already in the right region, so just advance mid.
- 2: swap it with nums[hi] and shrink hi. Do not advance mid, because the value that came from hi has not been examined yet.

The loop ends when the unexamined region is empty (mid > hi).

Counting sort (count the 0s, 1s and 2s, then overwrite) is simpler but takes two passes. Dijkstra's three-way partition does it in one, and the same partition makes quicksort fast on arrays with many duplicate values.`,
      complexity: 'O(n) time, O(1) space',
    },
  ],
};

export default m;
