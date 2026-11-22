import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'binary-search',
  title: 'Binary Search',
  description: 'Halve the search space: boundaries, rotated arrays and searching over answers.',
  challenges: [
    {
      title: 'Search Insert Position', fn: 'searchInsert', args: ['nums', 'target'],
      prompt: 'nums is sorted with distinct values. Return the index of target if present, otherwise the index where it would be inserted to keep the order. O(log n).',
      tests: [[[[1, 3, 5, 6], 5], 2], [[[1, 3, 5, 6], 2], 1], [[[1, 3, 5, 6], 7], 4], [[[1, 3, 5, 6], 0], 0], [[[], 3], 0], [[[4], 4], 0]],
      js: String.raw`function searchInsert(nums, target) {
  let lo = 0, hi = nums.length; // answer is in [lo, hi]
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}`,
      py: String.raw`def search_insert(nums, target):
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo`,
      explain: `This is the lower bound template: find the first index whose value is at least target. That single question answers both cases. If target exists, the first value at least target is target itself. If not, that index is where target would be inserted.

Template details (memorize this form):
- The search range is [lo, hi) with hi = n, because the answer can be n (insert at the end).
- If nums[mid] < target, the answer is strictly to the right, so lo = mid + 1.
- Otherwise mid could be the answer, so keep it with hi = mid.
- The loop runs while lo < hi and ends with lo == hi, the answer.

Why this never loops forever: mid is always less than hi, so hi = mid shrinks the range, and lo = mid + 1 always moves past mid.

Most binary-search problems can be rephrased as "find the first index where some condition becomes true", and this one template solves all of them. Python's bisect.bisect_left implements exactly this.`,
      complexity: 'O(log n) time, O(1) space',
    },
    {
      title: 'First and Last Position', fn: 'searchRange', args: ['nums', 'target'],
      prompt: 'nums is sorted and may contain duplicates. Return [first, last] indices of target, or [-1, -1] if it is absent. O(log n).',
      tests: [[[[5, 7, 7, 8, 8, 10], 8], [3, 4]], [[[5, 7, 7, 8, 8, 10], 6], [-1, -1]], [[[], 0], [-1, -1]], [[[2, 2, 2], 2], [0, 2]], [[[1], 1], [0, 0]], [[[1, 2, 3], 3], [2, 2]]],
      js: String.raw`function searchRange(nums, target) {
  // first index with nums[i] >= x
  const lower = (x) => {
    let lo = 0, hi = nums.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (nums[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  const first = lower(target);
  if (first === nums.length || nums[first] !== target) return [-1, -1];
  return [first, lower(target + 1) - 1];
}`,
      py: String.raw`def search_range(nums, target):
    def lower(x):
        lo, hi = 0, len(nums)
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] < x:
                lo = mid + 1
            else:
                hi = mid
        return lo
    first = lower(target)
    if first == len(nums) or nums[first] != target:
        return [-1, -1]
    return [first, lower(target + 1) - 1]`,
      explain: `Run the lower-bound search from Search Insert Position twice.

1. first = the first index with value at least target. If that index is past the end, or the value there is not target, then target is absent.
2. The last occurrence is just before the first value greater than target. For integers that is lower(target + 1) - 1.

Why not find one occurrence and then scan left and right? With an array of a million copies of target, that scan is O(n). Two binary searches are always O(log n).

A general version that works for any type uses an upper bound (the first index with value > x) instead of lower(x + 1). The only difference is changing < to <= in the condition. Python's bisect_left and bisect_right are exactly these two functions.

The same pair answers "how many times does x appear": upper(x) - lower(x).`,
      complexity: 'O(log n) time, O(1) space',
    },
    {
      title: 'Integer Square Root', fn: 'mySqrt', args: ['x'],
      prompt: 'Return the square root of the non-negative integer x rounded down, without using a built-in sqrt or exponent function.',
      tests: [[[4], 2], [[8], 2], [[0], 0], [[1], 1], [[15], 3], [[16], 4], [[2147395599], 46339], [[1000000], 1000]],
      js: String.raw`function mySqrt(x) {
  // largest r with r * r <= x
  let lo = 0, hi = x;
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2); // round up so lo = mid makes progress
    if (mid * mid <= x) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}`,
      py: String.raw`def my_sqrt(x):
    lo, hi = 0, x
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if mid * mid <= x:
            lo = mid
        else:
            hi = mid - 1
    return lo`,
      explain: `This is binary search over the answer rather than over an array. The candidates 0..x are sorted, and the condition r × r ≤ x is true for small r and false for large r. We want the last r where it is true.

Upper-bound template (the mirror image of lower bound):
- If mid × mid ≤ x, mid is a valid answer and something larger might be too, so lo = mid.
- Otherwise mid is too big, so hi = mid - 1.

Rounding mid up is essential. With lo = 3, hi = 4, rounding down gives mid = 3. If 3 is valid we set lo = 3 again, and the loop never ends. Rounding up gives mid = 4, which always makes progress.

Rule of thumb: when the update is lo = mid, compute mid rounding up. When it is hi = mid, round down.

Newton's method converges even faster: r = (r + x / r) / 2. Binary search, though, generalizes to any monotonic condition, which the next challenges rely on.`,
      complexity: 'O(log x) time, O(1) space',
    },
    {
      title: 'Search in Rotated Sorted Array', fn: 'searchRotated', args: ['nums', 'target'],
      prompt: 'A sorted array of distinct values was rotated at an unknown pivot ([0,1,2,4,5,6,7] → [4,5,6,7,0,1,2]). Return the index of target or -1, in O(log n).',
      tests: [[[[4, 5, 6, 7, 0, 1, 2], 0], 4], [[[4, 5, 6, 7, 0, 1, 2], 3], -1], [[[1], 0], -1], [[[1], 1], 0], [[[3, 1], 1], 1], [[[5, 1, 3], 5], 0], [[[6, 7, 1, 2, 3, 4, 5], 6], 0]],
      js: String.raw`function searchRotated(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {
      // left half [lo..mid] is sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      // right half [mid..hi] is sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}`,
      py: String.raw`def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1`,
      explain: `The whole array is not sorted, but at least one half around any mid always is.

At each step:
1. If nums[mid] is the target, you are done.
2. Work out which half is sorted. If nums[lo] <= nums[mid], the left half has no rotation break inside it. Otherwise the right half is sorted.
3. In the sorted half you can tell immediately whether target lies within its range. If it does, search there. Otherwise search the other half.

Example: [4, 5, 6, 7, 0, 1, 2] with target 0. mid = 3 holds 7. The left half [4..7] is sorted, and 0 is not inside it, so go right. That leaves [0, 1, 2], and the next step finds 0.

The <= in nums[lo] <= nums[mid] covers the case where lo == mid, a one-element left half.

The lesson: binary search does not need fully sorted data. It needs some test that tells you which half can safely be thrown away.`,
      complexity: 'O(log n) time, O(1) space',
    },
    {
      title: 'Minimum in Rotated Sorted Array', fn: 'findMin', args: ['nums'],
      prompt: 'Return the minimum of a rotated sorted array of distinct values in O(log n).',
      tests: [[[[3, 4, 5, 1, 2]], 1], [[[4, 5, 6, 7, 0, 1, 2]], 0], [[[11, 13, 15, 17]], 11], [[[2, 1]], 1], [[[1]], 1], [[[5, 6, 7, 8, 9, 1, 2, 3, 4]], 1]],
      js: String.raw`function findMin(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] > nums[hi]) lo = mid + 1; // the drop is to the right of mid
    else hi = mid; // mid..hi is sorted, so the min is at mid or to its left
  }
  return nums[lo];
}`,
      py: String.raw`def find_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    return nums[lo]`,
      explain: `Compare the middle element with the right end.

- If nums[mid] > nums[hi], the values decrease somewhere between mid and hi, so the rotation point, and with it the minimum, is strictly to the right of mid: lo = mid + 1.
- Otherwise the stretch from mid to hi is sorted, so the minimum is at mid or to its left: hi = mid.

When lo meets hi, it points at the minimum.

Why compare with nums[hi] and not nums[lo]? An array that is not rotated at all, like [11, 13, 15, 17], has nums[lo] < nums[mid], which looks exactly like "the minimum is to the right" in some rotated cases, so comparing with the left end is ambiguous. The right end decides the question cleanly in every case.

This uses the lower-bound shape (hi = mid, loop while lo < hi). The condition "nums[i] <= nums[last]" is false before the rotation point and true from it onwards, which is the monotonic yes/no pattern binary search needs.`,
      complexity: 'O(log n) time, O(1) space',
    },
    {
      title: 'Find Peak Element', fn: 'findPeak', args: ['nums'],
      prompt: 'nums strictly increases up to a single peak and then strictly decreases (either side may be empty). Return the index of the peak in O(log n).',
      tests: [[[[1, 3, 5, 4, 2]], 2], [[[1, 2, 3]], 2], [[[3, 2, 1]], 0], [[[7]], 0], [[[0, 10, 5]], 1], [[[1, 2, 3, 4, 5, 6, 0]], 5]],
      js: String.raw`function findPeak(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] < nums[mid + 1]) lo = mid + 1; // still climbing
    else hi = mid; // descending: the peak is mid or to its left
  }
  return lo;
}`,
      py: String.raw`def find_peak(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < nums[mid + 1]:
            lo = mid + 1
        else:
            hi = mid
    return lo`,
      explain: `Compare mid with its right neighbor to find out which slope you are on.

- nums[mid] < nums[mid + 1]: you are on the rising slope, so the peak is to the right: lo = mid + 1.
- Otherwise you are on the falling slope or at the peak itself: hi = mid.

mid + 1 is always a valid index, because the loop only runs while lo < hi, which means mid < hi.

The condition "is nums[i] > nums[i + 1]?" is false all the way up the rising slope and true from the peak onwards. Finding the first true is the lower-bound template again.

The general version (LeetCode 162) allows several peaks and accepts any one of them. The same code still works there: moving toward the higher neighbor always leads to some peak, because the values cannot keep rising forever before the array ends.

Binary search on a slope, not on sorted values, is the key idea. The same idea solves "find the maximum of a unimodal function".`,
      complexity: 'O(log n) time, O(1) space',
    },
    {
      title: 'Koko Eating Bananas', fn: 'minEatingSpeed', args: ['piles', 'h'],
      prompt: 'There are piles of bananas. Each hour Koko picks one pile and eats up to k bananas from it. Return the minimum integer speed k that lets her finish every pile within h hours (h ≥ number of piles).',
      tests: [[[[3, 6, 7, 11], 8], 4], [[[30, 11, 23, 4, 20], 5], 30], [[[30, 11, 23, 4, 20], 6], 23], [[[1], 1], 1], [[[1000000000], 2], 500000000], [[[2, 2], 4], 1]],
      js: String.raw`function minEatingSpeed(piles, h) {
  const hours = (k) => piles.reduce((t, p) => t + Math.ceil(p / k), 0);
  let lo = 1, hi = Math.max(...piles);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (hours(mid) <= h) hi = mid; // fast enough: try slower
    else lo = mid + 1;
  }
  return lo;
}`,
      py: String.raw`def min_eating_speed(piles, h):
    def hours(k):
        return sum((p + k - 1) // k for p in piles)
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if hours(mid) <= h:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      explain: `This is binary search on the answer, one of the most valuable patterns.

1. The possible speeds range from 1 to max(pile), and eating faster than the largest pile never helps.
2. Feasibility is monotonic: if speed k finishes in time, every faster speed does too. So the speeds form a run of "too slow" followed by a run of "fast enough".
3. Binary search for the first "fast enough" speed.

The feasibility check for a speed k: each pile p takes ceil(p / k) hours, and the total must be at most h. In Python, (p + k - 1) // k is integer ceiling division.

Complexity: about log(max) checks, each O(n), so O(n log max). Trying every speed from 1 up would be O(n × max).

How to recognize this pattern: the question asks for the minimum (or maximum) value such that something is possible, and checking a given value is easy. Shipping Capacity (next), Split Array Largest Sum and Aggressive Cows all have the same structure.`,
      complexity: 'O(n log m) time where m = max pile, O(1) space',
    },
    {
      title: 'Capacity to Ship Packages', fn: 'shipWithinDays', args: ['weights', 'days'],
      prompt: 'Packages with the given weights must ship in order. Each day you load packages onto a ship without exceeding its capacity. Return the minimum capacity that ships everything within the given number of days.',
      tests: [[[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5], 15], [[[3, 2, 2, 4, 1, 4], 3], 6], [[[1, 2, 3, 1, 1], 4], 3], [[[10], 1], 10], [[[5, 5, 5], 3], 5], [[[5, 5, 5], 1], 15]],
      js: String.raw`function shipWithinDays(weights, days) {
  const daysNeeded = (cap) => {
    let d = 1, load = 0;
    for (const w of weights) {
      if (load + w > cap) {
        d++;
        load = 0;
      }
      load += w;
    }
    return d;
  };
  let lo = Math.max(...weights), hi = weights.reduce((a, b) => a + b, 0);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (daysNeeded(mid) <= days) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
      py: String.raw`def ship_within_days(weights, days):
    def days_needed(cap):
        d, load = 1, 0
        for w in weights:
            if load + w > cap:
                d += 1
                load = 0
            load += w
        return d
    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if days_needed(mid) <= days:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      explain: `This is the same pattern as Koko: binary search over capacities, with a greedy check for each one.

Bounds:
- The lowest possible capacity is the heaviest package, since every package has to fit on its own.
- The highest needed is the sum of all weights, which ships everything in one day.

Feasibility check for a capacity cap: load packages greedily, starting a new day whenever the next package would overflow the ship. Count the days. Filling each day as much as possible is optimal, because loading less can never reduce the number of days.

Monotonic: a bigger capacity never needs more days. So binary search for the smallest capacity that needs at most the allowed number of days.

This is exactly "split the array into at most k contiguous parts, minimizing the largest part sum" (Split Array Largest Sum), presented as a story.`,
      complexity: 'O(n log S) time where S = sum of weights, O(1) space',
    },
    {
      title: 'Search a 2D Matrix', fn: 'searchMatrix', args: ['matrix', 'target'],
      prompt: 'Each row of matrix is sorted, and the first value of each row is greater than the last value of the previous row. Return true if target is in the matrix, in O(log(m·n)).',
      tests: [[[[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3], true], [[[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13], false], [[[[1]], 1], true], [[[[1, 3]], 3], true], [[[[1], [3]], 2], false], [[[], 5], false]],
      js: String.raw`function searchMatrix(matrix, target) {
  if (!matrix.length || !matrix[0].length) return false;
  const rows = matrix.length, cols = matrix[0].length;
  let lo = 0, hi = rows * cols - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const v = matrix[Math.floor(mid / cols)][mid % cols];
    if (v === target) return true;
    if (v < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}`,
      py: String.raw`def search_matrix(matrix, target):
    if not matrix or not matrix[0]:
        return False
    rows, cols = len(matrix), len(matrix[0])
    lo, hi = 0, rows * cols - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        v = matrix[mid // cols][mid % cols]
        if v == target:
            return True
        if v < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False`,
      explain: `Read row by row, the matrix is one long sorted list. Binary search that virtual list without building it.

Index mapping: virtual index i corresponds to row floor(i / cols), column i % cols. This is how 2D arrays are laid out in memory (row-major order).

Then it is ordinary binary search over 0 to rows × cols - 1.

The two-search alternative (find the row, then search inside it) has the same complexity but more code and more boundary cases.

Variant: if each row and each column is sorted, but rows do not continue from one another (LeetCode 240), this flattening is not valid. Start at the top-right corner instead, moving left when the value is too big and down when it is too small. That staircase search is O(m + n).

Converting between 1D and 2D indices is a basic skill used in grids, images and game boards.`,
      complexity: 'O(log(m·n)) time, O(1) space',
    },
    {
      title: 'Single Element in a Sorted Array', fn: 'singleNonDuplicate', args: ['nums'],
      prompt: 'In a sorted array, every value appears exactly twice except one that appears once. Return that single value in O(log n) time.',
      tests: [[[[1, 1, 2, 3, 3, 4, 4, 8, 8]], 2], [[[3, 3, 7, 7, 10, 11, 11]], 10], [[[5]], 5], [[[1, 1, 2]], 2], [[[0, 1, 1]], 0]],
      js: String.raw`function singleNonDuplicate(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    let mid = (lo + hi) >> 1;
    if (mid % 2 === 1) mid--; // look at the start of a would-be pair
    if (nums[mid] === nums[mid + 1]) lo = mid + 2; // pairs intact so far: single is to the right
    else hi = mid; // a pair is broken: single is at mid or to its left
  }
  return nums[lo];
}`,
      py: String.raw`def single_non_duplicate(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if mid % 2 == 1:
            mid -= 1
        if nums[mid] == nums[mid + 1]:
            lo = mid + 2
        else:
            hi = mid
    return nums[lo]`,
      explain: `XOR-ing all the values finds the single one in O(n). The sorted order makes O(log n) possible.

Look at how the pairs line up. Before the single element, each pair starts at an even index: (0, 1), (2, 3), and so on. After it, everything shifts by one, so pairs start at odd indices.

So look at an even index i (if mid is odd, step back by one):
- If nums[i] == nums[i + 1], the pairs are still aligned, so the single element is further right: lo = i + 2.
- Otherwise the alignment is already broken, so the single element is at i or before it: hi = i.

The question "is the pair starting at this even index intact?" is yes up to the single element and no afterwards, which is the monotonic condition binary search needs.

Spotting a structural property such as index parity, rather than comparing values, is what turns many "find the odd one out" problems into O(log n) searches.`,
      complexity: 'O(log n) time, O(1) space',
    },
  ],
};

export default m;
