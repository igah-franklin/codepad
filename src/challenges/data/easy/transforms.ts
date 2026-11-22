import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'transforms',
  title: 'Array Transforms',
  description: 'map, filter, prefix sums, chunking and rotating data.',
  challenges: [
    {
      title: 'Square Every Number', fn: 'squares', args: ['nums'],
      prompt: 'Return a new array containing the square of each number in nums, in the same order.',
      tests: [[[[1, 2, 3]], [1, 4, 9]], [[[]], []], [[[-2, 0, 2]], [4, 0, 4]], [[[10]], [100]]],
      js: String.raw`function squares(nums) {
  return nums.map((x) => x * x);
}`,
      py: String.raw`def squares(nums):
    return [x * x for x in nums]`,
      explain: `This is a map: apply the same function to every element and collect the results in a new array of the same length.

- JavaScript: Array.prototype.map takes a callback and returns a new array. The original is not modified.
- Python: a list comprehension, [f(x) for x in nums].

Map, filter and reduce are the three core list transformations. Learning to recognize them turns many loops into a single clear line:
- map: transform each item (same length out).
- filter: keep some items (same or shorter length).
- reduce: combine all items into one value.

Squaring makes negatives positive, so [-2, 0, 2] becomes [4, 0, 4].`,
      complexity: 'O(n) time and space',
    },
    {
      title: 'Keep the Positives', fn: 'positives', args: ['nums'],
      prompt: 'Return a new array containing only the numbers greater than zero, in their original order.',
      tests: [[[[1, -2, 3, 0, 5]], [1, 3, 5]], [[[]], []], [[[-1, -2]], []], [[[0]], []], [[[4, 4]], [4, 4]]],
      js: String.raw`function positives(nums) {
  return nums.filter((x) => x > 0);
}`,
      py: String.raw`def positives(nums):
    return [x for x in nums if x > 0]`,
      explain: `This is a filter: keep the elements for which a test (a predicate) returns true.

- JavaScript: nums.filter(x => x > 0).
- Python: a comprehension with an if clause, [x for x in nums if x > 0].

Read the specification carefully: "greater than zero" excludes 0. Zero is neither positive nor negative.

Filtering keeps the original order and never changes the items themselves. Map and filter can be chained, for example nums.filter(x => x > 0).map(x => x * 2) doubles only the positive numbers.`,
      complexity: 'O(n) time and space',
    },
    {
      title: 'Running Sum', fn: 'runningSum', args: ['nums'],
      prompt: 'Return an array where element i is the sum of nums[0] through nums[i] (a prefix sum).',
      tests: [[[[1, 2, 3, 4]], [1, 3, 6, 10]], [[[]], []], [[[5]], [5]], [[[3, -1, -2]], [3, 2, 0]], [[[1, 1, 1, 1, 1]], [1, 2, 3, 4, 5]]],
      js: String.raw`function runningSum(nums) {
  const out = [];
  let total = 0;
  for (const x of nums) {
    total += x;
    out.push(total);
  }
  return out;
}`,
      py: String.raw`def running_sum(nums):
    out = []
    total = 0
    for x in nums:
        total += x
        out.append(total)
    return out`,
      explain: `Carry a running total and record it after each addition.

The naive approach recomputes the sum from scratch for every position, which is O(n²). Each prefix sum is just the previous prefix sum plus one more element, so a single pass is enough.

Why prefix sums matter: once you have them, the sum of any range i..j is prefix[j] - prefix[i - 1], found in O(1). That turns many "sum of a subarray" questions into simple subtraction. You will use this in Subarray Sum Equals K and range-query problems in Medium.

Python has itertools.accumulate(nums) for this.`,
      complexity: 'O(n) time and space',
    },
    {
      title: 'Chunk an Array', fn: 'chunk', args: ['arr', 'size'],
      prompt: 'Split arr into groups of length size (size ≥ 1). The last group may be shorter.',
      tests: [[[[1, 2, 3, 4, 5], 2], [[1, 2], [3, 4], [5]]], [[[1, 2, 3], 3], [[1, 2, 3]]], [[[], 2], []], [[[1, 2, 3], 5], [[1, 2, 3]]], [[[1, 2, 3, 4], 1], [[1], [2], [3], [4]]]],
      js: String.raw`function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}`,
      py: String.raw`def chunk(arr, size):
    return [arr[i:i + size] for i in range(0, len(arr), size)]`,
      explain: `Step the index forward by size each time and slice out one group.

slice(i, i + size) (or arr[i:i + size] in Python) returns elements from i up to, but not including, i + size. If i + size runs past the end, slicing stops at the end instead of failing, which is what makes the last, shorter group work with no special case.

The loop starts at 0, size, 2 × size, and so on until it passes the end of the array.

Chunking is used for pagination (items per page), batching API requests, and laying out grids (items per row).`,
      complexity: 'O(n) time and space',
    },
    {
      title: 'Flatten One Level', fn: 'flatten', args: ['arr'],
      prompt: 'arr contains numbers and arrays of numbers. Return a new array with the nested arrays expanded one level: [1, [2, 3], 4] → [1, 2, 3, 4].',
      tests: [[[[1, [2, 3], 4]], [1, 2, 3, 4]], [[[[]]], []], [[[[1], [2], [3]]], [1, 2, 3]], [[[1, 2]], [1, 2]], [[[[1, [2]], 3]], [1, [2], 3]]],
      js: String.raw`function flatten(arr) {
  const out = [];
  for (const x of arr) {
    if (Array.isArray(x)) out.push(...x);
    else out.push(x);
  }
  return out;
}`,
      py: String.raw`def flatten(arr):
    out = []
    for x in arr:
        if isinstance(x, list):
            out.extend(x)
        else:
            out.append(x)
    return out`,
      explain: `For each element, check whether it is an array. If so, add its items individually; otherwise add the element itself.

- Checking the type: Array.isArray(x) in JavaScript and isinstance(x, list) in Python.
- Adding many items: out.push(...x) spreads the array in JavaScript, and out.extend(x) does the same in Python. Using push(x) or append(x) would insert the array as a single nested item.

Only one level is expanded: [1, [2]] inside the input stays as [1, [2]] in the output. To flatten completely, call the function recursively on nested arrays. JavaScript also has arr.flat() for one level and arr.flat(Infinity) for all levels.`,
      complexity: 'O(n) time and space, where n is the total number of items',
    },
    {
      title: 'Zip Two Arrays', fn: 'zip', args: ['a', 'b'],
      prompt: 'Return an array of pairs [a[i], b[i]]. If the arrays differ in length, stop at the shorter one.',
      tests: [[[[1, 2, 3], ['a', 'b', 'c']], [[1, 'a'], [2, 'b'], [3, 'c']]], [[[1, 2], [9]], [[1, 9]]], [[[], [1]], []], [[[true], [false]], [[true, false]]]],
      js: String.raw`function zip(a, b) {
  const n = Math.min(a.length, b.length);
  const out = [];
  for (let i = 0; i < n; i++) out.push([a[i], b[i]]);
  return out;
}`,
      py: String.raw`def zip(a, b):
    n = min(len(a), len(b))
    return [[a[i], b[i]] for i in range(n)]`,
      explain: `Loop up to the length of the shorter array, so you never read past the end of either one, and pair up the elements at each index.

Computing n = min(lengths) once before the loop states the rule explicitly.

Python already has a built-in zip with this exact behavior. Here the function is named zip too, so inside this file it hides the built-in. Shadowing built-in names is legal but usually a bad idea in real code, so we write the loop by hand.

Zipping and its reverse (unzip: turning pairs back into two lists) appear whenever two parallel lists describe the same things, such as names and scores, or keys and values.`,
      complexity: 'O(min(|a|, |b|)) time and space',
    },
    {
      title: 'Rotate Left', fn: 'rotateLeft', args: ['nums', 'k'],
      prompt: 'Return a new array with nums rotated left by k positions: [1,2,3,4,5] rotated by 2 gives [3,4,5,1,2]. k may be larger than the length.',
      tests: [[[[1, 2, 3, 4, 5], 2], [3, 4, 5, 1, 2]], [[[1, 2, 3], 0], [1, 2, 3]], [[[1, 2, 3], 3], [1, 2, 3]], [[[1, 2, 3], 4], [2, 3, 1]], [[[], 5], []], [[[7], 100], [7]]],
      js: String.raw`function rotateLeft(nums, k) {
  if (nums.length === 0) return [];
  k %= nums.length;
  return nums.slice(k).concat(nums.slice(0, k));
}`,
      py: String.raw`def rotate_left(nums, k):
    if not nums:
        return []
    k %= len(nums)
    return nums[k:] + nums[:k]`,
      explain: `Rotating left by k moves the first k elements to the back, so the result is the tail followed by the head.

1. Rotating by the array's length gets you back where you started, so only k % n matters. Rotating [1, 2, 3] by 4 is the same as rotating by 1.
2. Take the elements from index k to the end, then append the first k elements.

The empty array is checked first, because k % 0 is NaN in JavaScript and raises ZeroDivisionError in Python.

In-place version (a classic interview follow-up): reverse the first k elements, reverse the rest, then reverse the whole array. Three reversals give a rotation using O(1) extra space.`,
      complexity: 'O(n) time and space',
    },
    {
      title: 'Pairwise Differences', fn: 'differences', args: ['nums'],
      prompt: 'Return an array of the differences between consecutive elements: nums[i+1] - nums[i]. An array with fewer than two elements gives [].',
      tests: [[[[1, 4, 9, 16]], [3, 5, 7]], [[[5]], []], [[[]], []], [[[3, 3, 3]], [0, 0]], [[[10, 7, 12]], [-3, 5]]],
      js: String.raw`function differences(nums) {
  const out = [];
  for (let i = 1; i < nums.length; i++) out.push(nums[i] - nums[i - 1]);
  return out;
}`,
      py: String.raw`def differences(nums):
    return [nums[i] - nums[i - 1] for i in range(1, len(nums))]`,
      explain: `Compare each element with the one before it. Starting the loop at index 1 guarantees that nums[i - 1] always exists, so short arrays need no special handling: the loop simply never runs.

The output has n - 1 elements for n inputs, one for each gap between neighbors.

This is the reverse of Running Sum. Running-summing the differences, starting from nums[0], rebuilds the original array. The pair works like derivative and integral for lists.

Uses include daily changes in prices or temperatures, detecting trends (are all differences positive?), and spotting arithmetic sequences (are all differences equal?).`,
      complexity: 'O(n) time and space',
    },
    {
      title: 'Count Above Average', fn: 'countAboveAverage', args: ['nums'],
      prompt: 'Return how many numbers in nums are strictly greater than the average of the array. Return 0 for an empty array.',
      tests: [[[[1, 2, 3, 4]], 2], [[[]], 0], [[[5, 5, 5]], 0], [[[1, 1, 10]], 1], [[[-1, 0, 1, 2]], 2]],
      js: String.raw`function countAboveAverage(nums) {
  if (nums.length === 0) return 0;
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  return nums.filter((x) => x > avg).length;
}`,
      py: String.raw`def count_above_average(nums):
    if not nums:
        return 0
    avg = sum(nums) / len(nums)
    return sum(1 for x in nums if x > avg)`,
      explain: `This takes two passes: you cannot know which values are above average until you know the average.

1. Pass one: compute the average (sum ÷ length).
2. Pass two: count the elements strictly above it.

Many problems need some global information (a total, a maximum, a count) before you can decide anything about individual elements. Two linear passes are still O(n) overall, which is perfectly efficient.

When all values are equal, none is strictly greater than the average, so the answer is 0. That is why the test with [5, 5, 5] expects 0.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Evens Before Odds', fn: 'evensFirst', args: ['nums'],
      prompt: 'Return a new array with all even numbers first and then all odd numbers, keeping the original relative order inside each group.',
      tests: [[[[1, 2, 3, 4, 5, 6]], [2, 4, 6, 1, 3, 5]], [[[]], []], [[[1, 3]], [1, 3]], [[[2, 4]], [2, 4]], [[[5, 2, 7, 8, 0]], [2, 8, 0, 5, 7]]],
      js: String.raw`function evensFirst(nums) {
  const evens = [], odds = [];
  for (const x of nums) (x % 2 === 0 ? evens : odds).push(x);
  return evens.concat(odds);
}`,
      py: String.raw`def evens_first(nums):
    evens = [x for x in nums if x % 2 == 0]
    odds = [x for x in nums if x % 2 != 0]
    return evens + odds`,
      explain: `This is a partition: sort items into buckets in one pass, then join the buckets.

Keeping the original order within each group (a stable partition) comes for free, because each bucket only ever appends in the order elements were seen.

The JavaScript version picks the target array with a ternary and pushes into it, which is a compact way to write "if even, push to evens, else push to odds".

An in-place partition that swaps elements with two pointers uses O(1) extra space but is not stable: it scrambles the order inside each group. When the problem requires preserving order, buckets are the simplest correct approach.

This is also the core step of quicksort, which partitions around a pivot instead of by parity.`,
      complexity: 'O(n) time and space',
    },
  ],
};

export default m;
