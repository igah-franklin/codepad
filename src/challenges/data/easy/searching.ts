import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'searching',
  title: 'Sorting & Searching',
  description: 'Your first sorting algorithms, binary search and order statistics.',
  challenges: [
    {
      title: 'Is Sorted', fn: 'isSorted', args: ['nums'],
      prompt: 'Return true if nums is sorted in non-decreasing order (each element is ≤ the next).',
      tests: [[[[1, 2, 3]], true], [[[1, 3, 2]], false], [[[]], true], [[[5]], true], [[[2, 2, 2]], true], [[[3, 2, 1]], false]],
      js: String.raw`function isSorted(nums) {
  for (let i = 1; i < nums.length; i++) {
    if (nums[i - 1] > nums[i]) return false;
  }
  return true;
}`,
      py: String.raw`def is_sorted(nums):
    for i in range(1, len(nums)):
        if nums[i - 1] > nums[i]:
            return False
    return True`,
      explain: `An array is sorted exactly when every adjacent pair is in order. You do not need to compare elements that are far apart: if a ≤ b and b ≤ c, then a ≤ c follows automatically.

So check each neighbor pair and stop at the first one that is out of order. If no pair fails, the array is sorted.

"Non-decreasing" allows equal neighbors, which is why the test is nums[i - 1] > nums[i] (strictly greater means a violation). [2, 2, 2] counts as sorted.

Empty and single-element arrays have no pairs at all, so they are trivially sorted.

Checking a property for every element (a "for all" check) follows a fixed shape: return false at the first counterexample, and return true after the loop.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Binary Search', fn: 'binarySearch', args: ['nums', 'target'],
      prompt: 'nums is sorted in ascending order with distinct values. Return the index of target, or -1 if it is absent. Your solution should run in O(log n).',
      tests: [[[[1, 3, 5, 7, 9], 7], 3], [[[1, 3, 5, 7, 9], 1], 0], [[[1, 3, 5, 7, 9], 9], 4], [[[1, 3, 5, 7, 9], 4], -1], [[[], 1], -1], [[[2], 2], 0], [[[-10, -3, 0, 8], -3], 1]],
      js: String.raw`function binarySearch(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
      py: String.raw`def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
      explain: `Binary search uses the sorted order to discard half of the remaining candidates with every comparison, the way you look up a word in a paper dictionary.

1. Keep a window [lo, hi] that must contain the target if it is present at all.
2. Look at the middle element.
3. If it is the target, you are done. If it is too small, the target can only be to the right, so set lo = mid + 1. If it is too big, set hi = mid - 1.
4. When lo passes hi, the window is empty and the target is absent.

Why it is fast: halving a million elements takes only about 20 steps (2 to the power 20 is roughly a million).

Getting it right: the condition is lo <= hi (a one-element window still needs checking), and the updates are mid + 1 and mid - 1. Using lo = mid can loop forever. Binary search is famous for these off-by-one traps, so trace a 1- or 2-element example whenever you write one.`,
      complexity: 'O(log n) time, O(1) space',
    },
    {
      title: 'Merge Two Sorted Arrays', fn: 'mergeSorted', args: ['a', 'b'],
      prompt: 'a and b are each sorted ascending. Return one sorted array containing all their elements, in O(n + m) time (do not just concatenate and sort).',
      tests: [[[[1, 3, 5], [2, 4, 6]], [1, 2, 3, 4, 5, 6]], [[[], [1, 2]], [1, 2]], [[[1, 2], []], [1, 2]], [[[1, 1], [1]], [1, 1, 1]], [[[0, 10, 20], [5]], [0, 5, 10, 20]]],
      js: String.raw`function mergeSorted(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}`,
      py: String.raw`def merge_sorted(a, b):
    out = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i]); i += 1
        else:
            out.append(b[j]); j += 1
    out.extend(a[i:])
    out.extend(b[j:])
    return out`,
      explain: `Picture two sorted piles of cards face up. The smallest remaining card is always on top of one of the two piles, so repeatedly take the smaller top card.

1. Pointers i and j mark the front of each array.
2. While both arrays still have elements, append the smaller front element and advance that pointer.
3. When one array runs out, the rest of the other is already sorted, so append it all.

Using <= takes from a on ties, which keeps equal elements in their original order (a stable merge).

Each element is handled exactly once, giving O(n + m). Concatenating and then sorting would be O((n + m) log(n + m)).

This merge step is the heart of merge sort, which you will implement in the Medium level. It also appears in Merge K Sorted Lists in Hard.`,
      complexity: 'O(n + m) time and space',
    },
    {
      title: 'Bubble Sort', fn: 'bubbleSort', args: ['nums'],
      prompt: 'Return nums sorted ascending using bubble sort: repeatedly swap adjacent elements that are out of order. Do not use the built-in sort.',
      tests: [[[[5, 1, 4, 2, 8]], [1, 2, 4, 5, 8]], [[[]], []], [[[1]], [1]], [[[3, 3, 1]], [1, 3, 3]], [[[9, 8, 7, 6, 5]], [5, 6, 7, 8, 9]], [[[1, 2, 3]], [1, 2, 3]]],
      js: String.raw`function bubbleSort(nums) {
  const a = nums.slice();
  for (let end = a.length - 1; end > 0; end--) {
    let swapped = false;
    for (let i = 0; i < end; i++) {
      if (a[i] > a[i + 1]) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return a;
}`,
      py: String.raw`def bubble_sort(nums):
    a = nums[:]
    for end in range(len(a) - 1, 0, -1):
        swapped = False
        for i in range(end):
            if a[i] > a[i + 1]:
                a[i], a[i + 1] = a[i + 1], a[i]
                swapped = True
        if not swapped:
            break
    return a`,
      explain: `Each pass walks through the array, swapping neighbors that are out of order. The largest remaining value "bubbles up" to the end of the unsorted part, like an air bubble rising.

1. After the first pass, the maximum is in its final place at the end.
2. So each later pass can stop one position earlier. That is what the end variable tracks.
3. Early exit: if a whole pass makes no swaps, the array is already sorted, so stop. A sorted input then takes only O(n).

We copy the input first (nums.slice() or nums[:]) so the caller's array is not modified.

Bubble sort is O(n²) and too slow for real use, but it is the easiest sorting algorithm to understand and prove correct. Built-in sorts use O(n log n) algorithms such as Timsort.`,
      complexity: 'O(n²) time worst case (O(n) if already sorted), O(n) space for the copy',
    },
    {
      title: 'Insertion Sort', fn: 'insertionSort', args: ['nums'],
      prompt: 'Return nums sorted ascending using insertion sort: grow a sorted prefix by inserting each next element into its correct place.',
      tests: [[[[4, 3, 2, 10, 12, 1]], [1, 2, 3, 4, 10, 12]], [[[]], []], [[[2, 1]], [1, 2]], [[[1, 1, 1]], [1, 1, 1]], [[[-1, -3, 2]], [-3, -1, 2]]],
      js: String.raw`function insertionSort(nums) {
  const a = nums.slice();
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
  }
  return a;
}`,
      py: String.raw`def insertion_sort(nums):
    a = nums[:]
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
    return a`,
      explain: `This is how many people sort a hand of playing cards: pick up the next card and slide it left until it sits in the right place.

1. Everything before index i is already sorted. Initially that is just the first element.
2. Lift out key = a[i].
3. Shift every larger element in the sorted part one step right to open a gap.
4. Drop key into the gap.

Shifting instead of swapping does one assignment per move rather than three.

Insertion sort is O(n²) in the worst case (reverse-sorted input), but it is very fast on small or nearly sorted arrays, because each element moves only a little. That is why Python's Timsort and many quicksort implementations switch to insertion sort for small pieces.

It is also stable: equal elements never pass each other, because we only shift while a[j] > key, strictly greater.`,
      complexity: 'O(n²) worst case, O(n) on sorted input; O(n) space for the copy',
    },
    {
      title: 'Find the Missing Number', fn: 'missingNumber', args: ['nums'],
      prompt: 'nums contains n distinct numbers taken from 0, 1, ..., n, so exactly one number in that range is missing. Return it in O(n) time and O(1) extra space.',
      tests: [[[[3, 0, 1]], 2], [[[0, 1]], 2], [[[9, 6, 4, 2, 3, 5, 7, 0, 1]], 8], [[[0]], 1], [[[1]], 0]],
      js: String.raw`function missingNumber(nums) {
  const n = nums.length;
  let expected = (n * (n + 1)) / 2;
  for (const x of nums) expected -= x;
  return expected;
}`,
      py: String.raw`def missing_number(nums):
    n = len(nums)
    return n * (n + 1) // 2 - sum(nums)`,
      explain: `Use the Gauss formula from Basics: the numbers 0..n add up to n × (n + 1) / 2. Subtract the numbers you actually have, and what is left is the missing one.

For [3, 0, 1]: n = 3, the expected sum is 6 and the actual sum is 4, so 2 is missing.

The trick is that n is the array's length, because n numbers are present out of the n + 1 values 0..n.

XOR alternative: x XOR x = 0 and x XOR 0 = x, so XOR-ing all indices 0..n together with all the values cancels every number that appears twice, leaving only the missing one. It never risks overflow, which matters in languages with fixed-size integers.

Sorting and scanning also works, but it is O(n log n). A set uses O(n) space. The sum trick meets both the time and space requirements.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Sort Words by Length', fn: 'sortByLength', args: ['words'],
      prompt: 'Return the words sorted by length, shortest first. Words of equal length keep their original relative order.',
      tests: [[[['banana', 'kiwi', 'apple', 'fig']], ['fig', 'kiwi', 'apple', 'banana']], [[[]], []], [[['bb', 'aa', 'c']], ['c', 'bb', 'aa']], [[['same', 'four', 'size']], ['same', 'four', 'size']]],
      js: String.raw`function sortByLength(words) {
  return words.slice().sort((a, b) => a.length - b.length);
}`,
      py: String.raw`def sort_by_length(words):
    return sorted(words, key=len)`,
      explain: `Built-in sorts accept a rule for comparing items, and mastering that is more useful in practice than writing sorts yourself.

- JavaScript: sort takes a comparator (a, b) => number. A negative result puts a first, a positive result puts b first, and 0 keeps them as they are. a.length - b.length sorts by length ascending.
- Python: sorted(words, key=len) computes a key for each item and sorts by the keys.

Stability: both JavaScript's sort (guaranteed since ES2019) and Python's sort are stable, meaning equal items keep their original order. That is what keeps 'bb' before 'aa'.

JavaScript's sort works in place and returns the same array, so slice() first to avoid changing the caller's array. Python's sorted always returns a new list.

Without a comparator, JavaScript sorts as strings, so [10, 9, 1].sort() gives [1, 10, 9]. Always pass (a, b) => a - b for numbers.`,
      complexity: 'O(n log n) time, O(n) space',
    },
    {
      title: 'Median', fn: 'median', args: ['nums'],
      prompt: 'Return the median of the non-empty array nums: the middle value after sorting, or the average of the two middle values if the length is even.',
      compare: 'float',
      tests: [[[[3, 1, 2]], 2], [[[4, 1, 3, 2]], 2.5], [[[7]], 7], [[[1, 2]], 1.5], [[[5, 5, 5, 5]], 5], [[[-5, 10, 0]], 0]],
      js: String.raw`function median(nums) {
  const a = nums.slice().sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 === 1 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}`,
      py: String.raw`def median(nums):
    a = sorted(nums)
    mid = len(a) // 2
    return a[mid] if len(a) % 2 == 1 else (a[mid - 1] + a[mid]) / 2`,
      explain: `Sort, then read the middle.

- Odd length n: the median is at index floor(n / 2). For n = 3 that is index 1, the second element.
- Even length n: there are two middle elements, at indices n / 2 - 1 and n / 2. Average them.

Use a numeric comparator in JavaScript, as explained in Sort Words by Length.

The median is a "robust" average: one huge outlier barely moves it, while it can shift the mean a lot. That is why reports use median income and median house prices.

Faster methods exist. Quickselect finds the median in O(n) on average without fully sorting, and Find Median from Data Stream in Hard keeps a running median using two heaps.`,
      complexity: 'O(n log n) time, O(n) space',
    },
    {
      title: 'K-th Smallest', fn: 'kthSmallest', args: ['nums', 'k'],
      prompt: 'Return the k-th smallest element of nums (k is 1-based, so k = 1 is the minimum). Duplicates count separately.',
      tests: [[[[7, 10, 4, 3, 20, 15], 3], 7], [[[1], 1], 1], [[[5, 3, 1], 1], 1], [[[5, 3, 1], 3], 5], [[[2, 2, 1], 2], 2]],
      js: String.raw`function kthSmallest(nums, k) {
  const a = nums.slice().sort((x, y) => x - y);
  return a[k - 1];
}`,
      py: String.raw`def kth_smallest(nums, k):
    return sorted(nums)[k - 1]`,
      explain: `After sorting ascending, the k-th smallest element sits at index k - 1, converting the 1-based k to a 0-based index.

Duplicates count separately: in [2, 2, 1] the sorted order is [1, 2, 2], so the 2nd smallest is 2.

Sorting is O(n log n), which is simple and usually good enough. Better options exist when n is huge or k is small:
- A max-heap of size k: keep only the k smallest values seen so far. That is O(n log k).
- Quickselect: partition like quicksort, but only recurse into the side that contains index k - 1. That is O(n) on average.

These come up in Kth Largest Element in the Medium level.`,
      complexity: 'O(n log n) time, O(n) space',
    },
    {
      title: 'Closest Value', fn: 'closest', args: ['nums', 'target'],
      prompt: 'Return the value in the non-empty array nums that is closest to target. If two values are equally close, return the smaller one.',
      tests: [[[[1, 5, 9], 6], 5], [[[1, 5, 9], 7], 5], [[[1, 5, 9], 8], 9], [[[10], -3], 10], [[[-2, 2], 0], -2], [[[4, 1, 7], 4], 4]],
      js: String.raw`function closest(nums, target) {
  let best = nums[0];
  for (const x of nums) {
    const d = Math.abs(x - target), bd = Math.abs(best - target);
    if (d < bd || (d === bd && x < best)) best = x;
  }
  return best;
}`,
      py: String.raw`def closest(nums, target):
    return min(nums, key=lambda x: (abs(x - target), x))`,
      explain: `This is the running-champion pattern with a two-part comparison: first by distance, then by value to break ties.

JavaScript: replace best when x is strictly closer, or exactly as close but smaller.

Python: min with a tuple key. Tuples compare element by element, so (distance, value) orders first by distance and then by value. That expresses "closest, and the smaller one on ties" in a single key, and the trick works anywhere you sort or select by several criteria.

For target 7 with [1, 5, 9], both 5 and 9 are 2 away, and the tie goes to 5.

If nums were sorted, binary search would find the insertion point for target in O(log n). The closest value would then be one of the two neighbors at that point.`,
      complexity: 'O(n) time, O(1) space',
    },
  ],
};

export default m;
