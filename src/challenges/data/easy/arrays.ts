import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'arrays',
  title: 'Arrays I',
  description: 'Looping over lists, accumulating results and searching for values.',
  challenges: [
    {
      title: 'Sum of an Array', fn: 'sumArray', args: ['nums'],
      prompt: 'Return the sum of all numbers in the array nums. The sum of an empty array is 0.',
      tests: [[[[1, 2, 3, 4]], 10], [[[]], 0], [[[-1, 1]], 0], [[[5]], 5], [[[10, -20, 30]], 20]],
      js: String.raw`function sumArray(nums) {
  let total = 0;
  for (const x of nums) total += x;
  return total;
}`,
      py: String.raw`def sum_array(nums):
    total = 0
    for x in nums:
        total += x
    return total`,
      explain: `The accumulator pattern: start from a neutral value and fold every element into it.

1. total = 0. Zero is the neutral value for addition, which also makes the empty-array case return 0 automatically.
2. For each element, add it to total.
3. Return total.

for...of in JavaScript and for x in nums in Python give you each element directly, without managing an index.

Built-ins: sum(nums) in Python, and nums.reduce((a, b) => a + b, 0) in JavaScript. Always pass the 0 initial value to reduce: without it, reduce throws an error on an empty array.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Find the Maximum', fn: 'findMax', args: ['nums'],
      prompt: 'Return the largest number in the non-empty array nums without using a built-in max.',
      tests: [[[[3, 7, 2]], 7], [[[-5, -2, -9]], -2], [[[42]], 42], [[[1, 1, 1]], 1], [[[0, -1, 100, 99]], 100]],
      js: String.raw`function findMax(nums) {
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > best) best = nums[i];
  }
  return best;
}`,
      py: String.raw`def find_max(nums):
    best = nums[0]
    for x in nums[1:]:
        if x > best:
            best = x
    return best`,
      explain: `Use the running-champion pattern across the whole array.

1. Start with the first element as best.
2. Compare each remaining element against best and replace best when it is larger.
3. After the loop, best is the maximum.

Why start with nums[0] and not 0? If every number is negative, like [-5, -2, -9], starting at 0 would wrongly return 0, a value that is not even in the array. Seeding with a real element (or with -Infinity) avoids that bug. This is one of the most common mistakes in coding interviews.

Built-ins: Math.max(...nums) in JavaScript and max(nums) in Python. Spreading very large arrays into Math.max can hit argument limits, so the loop is more robust.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Count the Evens', fn: 'countEvens', args: ['nums'],
      prompt: 'Return how many numbers in nums are even.',
      tests: [[[[1, 2, 3, 4]], 2], [[[1, 3, 5]], 0], [[[]], 0], [[[0, -2, -3]], 2], [[[2, 2, 2, 2]], 4]],
      js: String.raw`function countEvens(nums) {
  let count = 0;
  for (const x of nums) if (x % 2 === 0) count++;
  return count;
}`,
      py: String.raw`def count_evens(nums):
    return sum(1 for x in nums if x % 2 == 0)`,
      explain: `This combines the counting loop with the even test from Basics.

For each number, x % 2 === 0 tells you whether it is even, and the counter goes up when it is. Zero and negative even numbers count as even, which the remainder check handles correctly.

JavaScript alternative: nums.filter(x => x % 2 === 0).length. It is short and clear, but it builds a temporary array just to measure its length. Python's sum(1 for ...) counts without building a list.

Spotting that a new problem is two known patterns put together is a core problem-solving skill.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Average of an Array', fn: 'averageOf', args: ['nums'],
      prompt: 'Return the average of the numbers in nums. Return 0 for an empty array.',
      compare: 'float',
      tests: [[[[1, 2, 3, 4]], 2.5], [[[]], 0], [[[10]], 10], [[[-2, 2]], 0], [[[1, 2]], 1.5], [[[3, 3, 4]], 3.3333333333]],
      js: String.raw`function averageOf(nums) {
  if (nums.length === 0) return 0;
  let total = 0;
  for (const x of nums) total += x;
  return total / nums.length;
}`,
      py: String.raw`def average_of(nums):
    if not nums:
        return 0
    return sum(nums) / len(nums)`,
      explain: `Average = sum ÷ count, but dividing by zero needs care.

1. Handle the empty array first. In JavaScript, 0 / 0 is NaN (not a number). In Python it raises ZeroDivisionError. The problem says to return 0, so check before dividing.
2. Sum the elements.
3. Divide by the length.

Handling edge cases explicitly at the top of a function (a "guard clause") keeps the main logic clean and makes the special case obvious to a reader.

In Python, if not nums: is the idiomatic way to test for an empty list, because empty collections are "falsy".`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Reverse an Array', fn: 'reverseArray', args: ['nums'],
      prompt: 'Return a new array with the elements of nums in reverse order. Try it without a built-in reverse.',
      tests: [[[[1, 2, 3]], [3, 2, 1]], [[[]], []], [[[7]], [7]], [[[1, 2]], [2, 1]], [[[5, 4, 3, 2, 1]], [1, 2, 3, 4, 5]]],
      js: String.raw`function reverseArray(nums) {
  const out = [];
  for (let i = nums.length - 1; i >= 0; i--) out.push(nums[i]);
  return out;
}`,
      py: String.raw`def reverse_array(nums):
    out = []
    for i in range(len(nums) - 1, -1, -1):
        out.append(nums[i])
    return out`,
      explain: `Walk the indices backwards and push each element into a fresh array.

In Python, range(len(nums) - 1, -1, -1) counts down from the last index to 0. The stop value -1 is exclusive, so 0 is included.

In-place alternative (useful when memory matters): swap nums[i] with nums[n - 1 - i] for the first half of the array. That is the two-pointer technique again, and it uses O(1) extra space.

Built-ins: nums.slice().reverse() in JavaScript (slice first, because reverse() changes the original array) and nums[::-1] or list(reversed(nums)) in Python. Knowing whether a built-in mutates its input is important. Unexpected mutation is a common source of bugs.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Contains Value', fn: 'contains', args: ['nums', 'target'],
      prompt: 'Return true if target appears in nums, otherwise false. Use a loop rather than includes / in.',
      tests: [[[[1, 2, 3], 2], true], [[[1, 2, 3], 5], false], [[[], 1], false], [[[0], 0], true], [[[-1, -2], -2], true]],
      js: String.raw`function contains(nums, target) {
  for (const x of nums) {
    if (x === target) return true;
  }
  return false;
}`,
      py: String.raw`def contains(nums, target):
    for x in nums:
        if x == target:
            return True
    return False`,
      explain: `Linear search: check each element in turn.

The key detail is where each return goes:
- return true goes inside the loop, the moment a match is found. There is no need to look further.
- return false goes after the loop, because you only know the target is absent once you have checked everything.

A frequent bug is putting "else return false" inside the loop. That gives up after the first non-matching element.

Built-ins: nums.includes(target) and target in nums do exactly this. Searching an unsorted array always takes O(n) in the worst case. To make lookups fast, store the values in a Set, which you will do in the Hash Maps module.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Index Of', fn: 'indexOf', args: ['nums', 'target'],
      prompt: 'Return the index of the first occurrence of target in nums, or -1 if it is not present.',
      tests: [[[[5, 3, 7, 3], 3], 1], [[[5, 3, 7], 9], -1], [[[], 0], -1], [[[4], 4], 0], [[[1, 2, 3], 3], 2]],
      js: String.raw`function indexOf(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === target) return i;
  }
  return -1;
}`,
      py: String.raw`def index_of(nums, target):
    for i, x in enumerate(nums):
        if x == target:
            return i
    return -1`,
      explain: `Same as Contains Value, but you need the position, so loop over indices.

Returning on the first match is what gives you the first occurrence: in [5, 3, 7, 3] the loop stops at index 1 and never reaches the second 3.

-1 is a common "not found" sentinel, because no valid index is negative.

Python's enumerate(nums) gives (index, value) pairs, which is more idiomatic than range(len(nums)). Python's built-in list.index() raises ValueError instead of returning -1, so the hand-written version is handy when you prefer a sentinel.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Second Largest', fn: 'secondLargest', args: ['nums'],
      prompt: 'Return the second largest distinct value in nums. The array always contains at least two distinct values. Solve it in a single pass.',
      tests: [[[[3, 1, 4, 2]], 3], [[[10, 10, 9]], 9], [[[-1, -2, -3]], -2], [[[1, 2]], 1], [[[5, 5, 4, 4, 3]], 4], [[[2, 9, 9, 1]], 2]],
      js: String.raw`function secondLargest(nums) {
  let first = -Infinity, second = -Infinity;
  for (const x of nums) {
    if (x > first) {
      second = first;
      first = x;
    } else if (x < first && x > second) {
      second = x;
    }
  }
  return second;
}`,
      py: String.raw`def second_largest(nums):
    first = second = float("-inf")
    for x in nums:
        if x > first:
            second = first
            first = x
        elif first > x > second:
            second = x
    return second`,
      explain: `Track the top two values as you scan, like keeping gold and silver medals.

For each x:
1. If x beats first, the old champion drops to second place and x becomes first.
2. Otherwise, if x is strictly less than first but beats second, x becomes second.
3. If x equals first, ignore it. Duplicates of the maximum must not count as "second largest" (that is why [10, 10, 9] gives 9).

Both trackers start at negative infinity so that any real number beats them, which works even when all values are negative.

Sorting (sort descending, then skip duplicates) also works, but it is O(n log n). The single pass is O(n), and it generalizes: to track the top k values efficiently you would use a heap, covered in the Hard level.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Remove Duplicates', fn: 'unique', args: ['nums'],
      prompt: 'Return a new array with duplicate values removed, keeping the first occurrence of each value in its original order.',
      tests: [[[[1, 2, 2, 3, 1]], [1, 2, 3]], [[[]], []], [[[4, 4, 4]], [4]], [[[3, 2, 1]], [3, 2, 1]], [[[1, 2, 1, 2, 3, 3]], [1, 2, 3]]],
      js: String.raw`function unique(nums) {
  const seen = new Set();
  const out = [];
  for (const x of nums) {
    if (!seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}`,
      py: String.raw`def unique(nums):
    seen = set()
    out = []
    for x in nums:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out`,
      explain: `Remember what you have already seen, and keep an element only the first time.

1. seen is a set, which checks membership in O(1) on average.
2. For each x, if it has not been seen, record it and append it to the output.
3. Later copies are skipped because they are already in seen.

Why not check "x in out" instead of using a set? That works, but searching a list is O(n), making the whole function O(n²). The set keeps it O(n).

Shortcuts that also preserve order: [...new Set(nums)] in JavaScript (Sets remember insertion order) and list(dict.fromkeys(nums)) in Python. list(set(nums)) in Python does not guarantee the original order.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Min and Max Together', fn: 'minMax', args: ['nums'],
      prompt: 'Return [min, max] of the non-empty array nums, finding both in a single loop.',
      tests: [[[[3, 1, 4, 1, 5]], [1, 5]], [[[7]], [7, 7]], [[[-3, -1, -2]], [-3, -1]], [[[2, 2]], [2, 2]], [[[10, -10, 0]], [-10, 10]]],
      js: String.raw`function minMax(nums) {
  let lo = nums[0], hi = nums[0];
  for (const x of nums) {
    if (x < lo) lo = x;
    if (x > hi) hi = x;
  }
  return [lo, hi];
}`,
      py: String.raw`def min_max(nums):
    lo = hi = nums[0]
    for x in nums:
        if x < lo:
            lo = x
        if x > hi:
            hi = x
    return [lo, hi]`,
      explain: `Two running champions at once: one for the smallest value and one for the largest.

1. Seed both lo and hi with the first element.
2. For each element, update lo if it is smaller and hi if it is larger. The two checks are independent, so use two separate ifs, not else-if.
3. Return both as a pair.

Calling min() and then max() would read the array twice. That is still O(n), but doing both in one pass is a small, useful optimization, and returning several results from one function (as an array or tuple) is a pattern you will use constantly.

A single-element array gives [x, x], because that element is both the minimum and the maximum.`,
      complexity: 'O(n) time, O(1) space',
    },
  ],
};

export default m;
