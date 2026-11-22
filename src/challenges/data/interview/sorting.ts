import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'sorting',
  title: 'Sorting & Searching',
  description: 'Custom orders, k-closest windows, staircase searches and voting with multiple candidates.',
  challenges: [
    {
      title: 'Next Permutation', fn: 'nextPermutation', args: ['nums'],
      prompt: 'Rearrange nums into the next lexicographically greater permutation, in place. If it is already the largest, wrap around to the smallest (sorted ascending). Return nums.',
      tests: [[[[1, 2, 3]], [1, 3, 2]], [[[3, 2, 1]], [1, 2, 3]], [[[1, 1, 5]], [1, 5, 1]], [[[1]], [1]], [[[1, 3, 2]], [2, 1, 3]], [[[2, 3, 1, 3, 3]], [2, 3, 3, 1, 3]], [[[1, 5, 8, 4, 7, 6, 5, 3, 1]], [1, 5, 8, 5, 1, 3, 4, 6, 7]]],
      js: String.raw`function nextPermutation(nums) {
  // 1. find the rightmost "ascent" i with nums[i] < nums[i + 1]
  let i = nums.length - 2;
  while (i >= 0 && nums[i] >= nums[i + 1]) i--;
  if (i >= 0) {
    // 2. swap it with the smallest larger element to its right (rightmost such)
    let j = nums.length - 1;
    while (nums[j] <= nums[i]) j--;
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  // 3. the suffix is descending: reverse it to make it the smallest
  for (let l = i + 1, r = nums.length - 1; l < r; l++, r--) [nums[l], nums[r]] = [nums[r], nums[l]];
  return nums;
}`,
      py: String.raw`def next_permutation(nums):
    i = len(nums) - 2
    while i >= 0 and nums[i] >= nums[i + 1]:
        i -= 1
    if i >= 0:
        j = len(nums) - 1
        while nums[j] <= nums[i]:
            j -= 1
        nums[i], nums[j] = nums[j], nums[i]
    nums[i + 1:] = reversed(nums[i + 1:])
    return nums`,
      explain: `This is the classic algorithm that C++'s std::next_permutation uses.

Think of the permutation as a number you want to increase as little as possible.
1. Scan from the right for the first position i where nums[i] < nums[i + 1]. Everything to the right of i is in descending order, which is already the largest arrangement of those values, so it cannot be increased. Position i is the rightmost place that can grow.
2. Swap nums[i] with the smallest value to its right that is larger than it. Because the suffix is descending, that is the rightmost element greater than nums[i].
3. Reverse the suffix after i. It is still descending after the swap, and reversing makes it ascending, the smallest possible arrangement.

If there is no such i (the whole array is descending, the last permutation), skip step 2 and reverse everything, which wraps around to the first permutation.

[1, 5, 8, 4, 7, 6, 5, 3, 1]: the ascent is at 4 (index 3). The smallest larger value to its right is 5. Swap, giving ...5, 7, 6, 4, 3, 1, then reverse the suffix to get 1, 3, 4, 6, 7.

Using <= and >= in the scans handles duplicates correctly ([1, 1, 5] → [1, 5, 1]).

Calling it repeatedly lists every permutation in lexicographic order, without recursion.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Find K Closest Elements', fn: 'findClosestElements', args: ['arr', 'k', 'x'],
      prompt: 'arr is sorted. Return the k elements closest to x, in ascending order. Ties prefer the smaller element.',
      tests: [[[[1, 2, 3, 4, 5], 4, 3], [1, 2, 3, 4]], [[[1, 2, 3, 4, 5], 4, -1], [1, 2, 3, 4]], [[[1, 1, 2, 3, 4, 5], 4, -1], [1, 1, 2, 3]], [[[1, 3], 1, 2], [1]], [[[0, 0, 1, 2, 3, 3, 4, 7, 7, 8], 3, 5], [3, 3, 4]], [[[1, 10, 15, 25, 35, 45, 50, 59], 1, 30], [25]]],
      js: String.raw`function findClosestElements(arr, k, x) {
  // binary search the LEFT edge of the best window [lo, lo + k)
  let lo = 0, hi = arr.length - k;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    // if x is closer to arr[mid + k] than to arr[mid], the window should move right
    if (x - arr[mid] > arr[mid + k] - x) lo = mid + 1;
    else hi = mid;
  }
  return arr.slice(lo, lo + k);
}`,
      py: String.raw`def find_closest_elements(arr, k, x):
    lo, hi = 0, len(arr) - k
    while lo < hi:
        mid = (lo + hi) // 2
        if x - arr[mid] > arr[mid + k] - x:
            lo = mid + 1
        else:
            hi = mid
    return arr[lo:lo + k]`,
      explain: `The answer is always a contiguous window of length k in the sorted array, so you only need to find where it starts.

Binary search on the left edge, over the range 0 to n - k:
- compare the window [mid, mid + k) with the window shifted right by one, [mid + 1, mid + k + 1). They differ only in arr[mid], which leaves, and arr[mid + k], which enters.
- if x - arr[mid] > arr[mid + k] - x, the leaving element is farther from x than the entering one, so the best window starts further right: lo = mid + 1.
- otherwise (including ties, which prefer the smaller element) keep mid as a candidate: hi = mid.

Why no absolute values? Writing x - arr[mid] versus arr[mid + k] - x (without abs) correctly handles cases where x is outside the window. It is a subtle point, and the tests with x = -1 check it.

The result is already in ascending order, since it is a slice of the sorted array.

Alternatives:
- Two pointers shrinking from both ends: remove the farther end until k elements remain. O(n - k).
- A heap of the k closest: O(n log k), and it does not need sorted input.

Binary search gives O(log(n - k) + k).`,
      complexity: 'O(log(n − k) + k) time, O(1) extra space',
    },
    {
      title: 'Top K Frequent Words', fn: 'topKFrequentWords', args: ['words', 'k'],
      prompt: 'Return the k most frequent words, sorted by frequency (highest first); words with the same frequency are sorted alphabetically.',
      tests: [[[['i', 'love', 'leetcode', 'i', 'love', 'coding'], 2], ['i', 'love']], [[['the', 'day', 'is', 'sunny', 'the', 'the', 'the', 'sunny', 'is', 'is'], 4], ['the', 'is', 'sunny', 'day']], [[['a'], 1], ['a']], [[['b', 'a', 'c'], 2], ['a', 'b']], [[['aaa', 'aa', 'a'], 3], ['a', 'aa', 'aaa']]],
      js: String.raw`function topKFrequentWords(words, k) {
  const count = new Map();
  for (const w of words) count.set(w, (count.get(w) || 0) + 1);
  return [...count.keys()]
    .sort((a, b) => count.get(b) - count.get(a) || (a < b ? -1 : a > b ? 1 : 0))
    .slice(0, k);
}`,
      py: String.raw`import heapq

def top_k_frequent_words(words, k):
    count = {}
    for w in words:
        count[w] = count.get(w, 0) + 1
    # nsmallest with key (-freq, word): highest frequency first, then alphabetical
    return heapq.nsmallest(k, count, key=lambda w: (-count[w], w))`,
      explain: `Count the words, then select by a two-part order: frequency descending, then the word ascending.

Sorting all the distinct words (JavaScript): a comparator using freq(b) - freq(a), falling back to an alphabetical comparison. That is O(m log m) for m distinct words.

Heap selection (Python): heapq.nsmallest(k, ..., key=(-freq, word)). Negating the frequency turns "most frequent" into "smallest key", and the tuple's second element breaks ties alphabetically. That is O(m log k).

Tie-breaking matters. In ["b", "a", "c"] every word appears once, so alphabetical order picks ["a", "b"].

Why not reuse bucket sort from Top K Frequent Elements? You could, but each bucket would still need sorting alphabetically, so the gain is smaller.

Interview point: the extra tie-break rule is the twist that separates this from the Medium version. Encode multi-key orderings as tuples or chained comparators, and say your tie-break rule out loud.`,
      complexity: 'O(n + m log k) with a heap, O(n + m log m) with a full sort',
    },
    {
      title: 'Relative Sort Array', fn: 'relativeSortArray', args: ['arr1', 'arr2'],
      prompt: 'arr2 has distinct values, all present in arr1. Sort arr1 so that its elements follow the order of arr2; elements not in arr2 go at the end in ascending order.',
      tests: [[[[2, 3, 1, 3, 2, 4, 6, 7, 9, 2, 19], [2, 1, 4, 3, 9, 6]], [2, 2, 2, 1, 4, 3, 3, 9, 6, 7, 19]], [[[28, 6, 22, 8, 44, 17], [22, 28, 8, 6]], [22, 28, 8, 6, 17, 44]], [[[1, 2, 3], []], [1, 2, 3]], [[[5, 5, 5], [5]], [5, 5, 5]]],
      js: String.raw`function relativeSortArray(arr1, arr2) {
  const rank = new Map(arr2.map((v, i) => [v, i]));
  return arr1.slice().sort((a, b) => {
    const ra = rank.has(a) ? rank.get(a) : Infinity;
    const rb = rank.has(b) ? rank.get(b) : Infinity;
    return ra !== rb ? ra - rb : a - b; // by rank; unranked ones by value
  });
}`,
      py: String.raw`def relative_sort_array(arr1, arr2):
    rank = {v: i for i, v in enumerate(arr2)}
    n = len(arr2)
    return sorted(arr1, key=lambda x: (rank.get(x, n), x))`,
      explain: `Turn arr2 into a ranking, then sort by (rank, value).

1. rank[v] = the position of v in arr2.
2. Values missing from arr2 get a rank larger than every real rank (Infinity, or len(arr2)), so they sort after all the ranked values.
3. Among equal ranks, which only happens for unranked values, sort by the value itself.

Python's tuple key (rank, x) expresses that two-level rule directly.

This is the general recipe for any custom ordering: map each item to a sortable key that captures the rule.

Counting-sort alternative (when values are small, for example 0 to 1000): count every value, emit arr2's values in order according to their counts, then emit the remaining values in ascending order. That is O(n + range).

Related: Custom Sort String (order the characters of a string by a given alphabet) uses the same technique.`,
      complexity: 'O(n log n) time, O(n) space',
    },
    {
      title: 'Minimum Absolute Difference', fn: 'minimumAbsDifference', args: ['arr'],
      prompt: 'arr has distinct integers. Return every pair [a, b] (a < b) whose difference equals the minimum absolute difference between any two elements, with pairs in ascending order.',
      tests: [[[[4, 2, 1, 3]], [[1, 2], [2, 3], [3, 4]]], [[[1, 3, 6, 10, 15]], [[1, 3]]], [[[3, 8, -10, 23, 19, -4, -14, 27]], [[-14, -10], [19, 23], [23, 27]]], [[[5, 1]], [[1, 5]]]],
      js: String.raw`function minimumAbsDifference(arr) {
  const a = arr.slice().sort((x, y) => x - y);
  let best = Infinity;
  for (let i = 1; i < a.length; i++) best = Math.min(best, a[i] - a[i - 1]);
  const out = [];
  for (let i = 1; i < a.length; i++) if (a[i] - a[i - 1] === best) out.push([a[i - 1], a[i]]);
  return out;
}`,
      py: String.raw`def minimum_abs_difference(arr):
    a = sorted(arr)
    best = min(a[i] - a[i - 1] for i in range(1, len(a)))
    return [[a[i - 1], a[i]] for i in range(1, len(a)) if a[i] - a[i - 1] == best]`,
      explain: `After sorting, the closest pair is always made of neighbors. A non-adjacent pair has some element in between, so it is at least as far apart as one of the adjacent pairs inside it.

1. Sort: O(n log n).
2. One pass to find the smallest adjacent gap.
3. A second pass to collect every adjacent pair with that gap. They come out in ascending order automatically.

Checking every pair would be O(n²). Sorting reduces "closest pair" to looking at neighbors, the same trick as Meeting Rooms and Is Sorted.

The two passes could be merged into one: whenever a smaller gap appears, reset the result list, and on an equal gap, append. Two passes are easier to read.

In 2D, the closest pair of points needs a divide-and-conquer O(n log n) algorithm. Sorting alone does not work there, because neighbors in x are not necessarily close in y.`,
      complexity: 'O(n log n) time, O(n) space',
    },
    {
      title: 'Arranging Coins', fn: 'arrangeCoins', args: ['n'],
      prompt: 'You have n coins and build a staircase where row k has exactly k coins. Return the number of complete rows.',
      tests: [[[5], 2], [[8], 3], [[1], 1], [[0], 0], [[3], 2], [[6], 3], [[2147483647], 65535]],
      js: String.raw`function arrangeCoins(n) {
  // largest k with k(k+1)/2 <= n
  let lo = 0, hi = n;
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    if ((mid * (mid + 1)) / 2 <= n) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}`,
      py: String.raw`def arrange_coins(n):
    lo, hi = 0, n
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if mid * (mid + 1) // 2 <= n:
            lo = mid
        else:
            hi = mid - 1
    return lo`,
      explain: `k complete rows need 1 + 2 + ... + k = k(k + 1) / 2 coins (the Gauss sum from Easy). Find the largest k with k(k + 1) / 2 ≤ n.

That condition is monotonic in k (more rows always need more coins), so binary search on k with the "last true" template from Integer Square Root: round mid up, and use lo = mid when it fits.

Math shortcut: solve k² + k - 2n ≤ 0, which gives k = floor((√(8n + 1) - 1) / 2). It is O(1), but floating-point square roots can be off by one for large n, so production code verifies the result and adjusts it.

Simulation (subtract 1, 2, 3, ... until you run out) takes O(√n), which is fine too, but binary search shows the "search over the answer" technique.

The largest test, 2^31 - 1, shows why mid × (mid + 1) overflows 32-bit integers in some languages. JavaScript and Python are safe here, but in Java or C++ you would use 64-bit arithmetic.`,
      complexity: 'O(log n) time, O(1) space',
    },
    {
      title: '3Sum Closest', fn: 'threeSumClosest', args: ['nums', 'target'],
      prompt: 'Return the sum of the three integers in nums whose sum is closest to target. Exactly one closest sum exists.',
      tests: [[[[-1, 2, 1, -4], 1], 2], [[[0, 0, 0], 1], 0], [[[1, 1, 1, 0], -100], 2], [[[4, 0, 5, -5, 3, 3, 0, -4, -5], -2], -2], [[[1, 2, 5, 10, 11], 12], 13]],
      js: String.raw`function threeSumClosest(nums, target) {
  const a = nums.slice().sort((x, y) => x - y);
  let best = a[0] + a[1] + a[2];
  for (let i = 0; i < a.length - 2; i++) {
    let lo = i + 1, hi = a.length - 1;
    while (lo < hi) {
      const s = a[i] + a[lo] + a[hi];
      if (Math.abs(s - target) < Math.abs(best - target)) best = s;
      if (s === target) return s; // can't do better
      if (s < target) lo++;
      else hi--;
    }
  }
  return best;
}`,
      py: String.raw`def three_sum_closest(nums, target):
    a = sorted(nums)
    best = a[0] + a[1] + a[2]
    for i in range(len(a) - 2):
        lo, hi = i + 1, len(a) - 1
        while lo < hi:
            s = a[i] + a[lo] + a[hi]
            if abs(s - target) < abs(best - target):
                best = s
            if s == target:
                return s
            if s < target:
                lo += 1
            else:
                hi -= 1
    return best`,
      explain: `This is the 3Sum skeleton (in Medium), optimizing a distance instead of finding an exact match.

1. Sort.
2. Fix each a[i], then squeeze lo and hi inward over the rest of the array.
3. At every step, compare the current sum with the best one so far.
4. Move the pointers toward the target: a sum that is too small means lo++, and a sum that is too big means hi--.

Why is this exhaustive enough? For a fixed i, the squeeze visits a sequence of pairs that includes the closest one. Every pair it skips is provably farther from the target than a pair it did measure, by the same argument as Two Sum on sorted input.

If you hit the target exactly, stop, because nothing can beat a distance of 0.

Seed best with any real triple, not Infinity, so the return value is always an actual sum.

The duplicate skipping from 3Sum is not needed here, since only the distance matters. It would only speed things up slightly.`,
      complexity: 'O(n²) time, O(log n) to O(n) space for sorting',
    },
    {
      title: 'Count Negatives in a Sorted Matrix', fn: 'countNegatives', args: ['grid'],
      prompt: 'Every row and every column of grid is sorted in non-increasing order. Return the number of negative numbers, in O(rows + cols).',
      tests: [[[[[4, 3, 2, -1], [3, 2, 1, -1], [1, 1, -1, -2], [-1, -1, -2, -3]]], 8], [[[[3, 2], [1, 0]]], 0], [[[[-1]]], 1], [[[[5, 1, 0], [-5, -5, -5]]], 3], [[[[1, -1], [-1, -1]]], 3]],
      js: String.raw`function countNegatives(grid) {
  const R = grid.length, C = grid[0].length;
  let r = 0, c = C - 1, count = 0;
  // staircase walk from the top-right corner
  while (r < R && c >= 0) {
    if (grid[r][c] < 0) {
      count += R - r; // this cell and everything below it in the column are negative
      c--;
    } else r++;
  }
  return count;
}`,
      py: String.raw`def count_negatives(grid):
    R, C = len(grid), len(grid[0])
    r, c, count = 0, C - 1, 0
    while r < R and c >= 0:
        if grid[r][c] < 0:
            count += R - r
            c -= 1
        else:
            r += 1
    return count`,
      explain: `Sorted rows and columns allow a staircase search, the same idea as searching a sorted 2D matrix in O(m + n).

Start at the top-right corner.
- If the cell is negative, everything below it in that column is negative too, because the columns are non-increasing going down. Count R - r cells and move left to the next column.
- Otherwise the cell is non-negative, and so is everything to its left in that row (rows are non-increasing going right). Move down.

Each step discards a whole row or a whole column, so there are at most R + C steps.

Picture the boundary between non-negative and negative cells. It is a staircase descending from the top-right, and the walk traces it exactly.

Other approaches:
- Binary search in each row for the first negative: O(R log C).
- Check every cell: O(R × C).

The staircase is optimal and is a good technique to know for "sorted in both directions" matrices (also kth smallest, and searching for a target).`,
      complexity: 'O(R + C) time, O(1) space',
    },
    {
      title: 'Majority Element II', fn: 'majorityElementII', args: ['nums'],
      prompt: 'Return all values that appear more than ⌊n/3⌋ times, in any order, using O(1) extra space.',
      compare: 'unordered',
      tests: [[[[3, 2, 3]], [3]], [[[1]], [1]], [[[1, 2]], [1, 2]], [[[1, 1, 1, 3, 3, 2, 2, 2]], [1, 2]], [[[2, 2, 1, 3]], [2]], [[[4, 5, 6]], []]],
      js: String.raw`function majorityElementII(nums) {
  // Boyer-Moore with two candidates: at most two values can exceed n/3
  let c1 = null, c2 = null, n1 = 0, n2 = 0;
  for (const x of nums) {
    if (x === c1) n1++;
    else if (x === c2) n2++;
    else if (n1 === 0) { c1 = x; n1 = 1; }
    else if (n2 === 0) { c2 = x; n2 = 1; }
    else { n1--; n2--; } // x cancels one vote from each
  }
  // verify: candidates are only possibilities
  return [c1, c2].filter((c, i, arr) => c !== null && arr.indexOf(c) === i && nums.filter((x) => x === c).length > nums.length / 3);
}`,
      py: String.raw`def majority_element_ii(nums):
    c1 = c2 = None
    n1 = n2 = 0
    for x in nums:
        if x == c1:
            n1 += 1
        elif x == c2:
            n2 += 1
        elif n1 == 0:
            c1, n1 = x, 1
        elif n2 == 0:
            c2, n2 = x, 1
        else:
            n1 -= 1
            n2 -= 1
    return [c for c in {c1, c2} if c is not None and nums.count(c) > len(nums) // 3]`,
      explain: `This generalizes Boyer-Moore voting (from Majority Element) to a threshold of n/3.

At most two values can each appear more than n/3 times, because three of them would need more than n elements. So track two candidates with two counters.

For each x:
- if it matches a candidate, increment that candidate's counter;
- else if a counter is 0, x takes over that slot;
- else x cancels one vote from each candidate. Three distinct values are removed together, which can never eliminate a value that has more than a third of the votes.

After the pass, the candidates are only possibilities. With [4, 5, 6] nothing qualifies, but 5 and 6 are left as candidates. A second pass counts their real occurrences.

The general rule: for a threshold of n/k, keep k - 1 candidates. That is the Misra-Gries "frequent items" algorithm, used for finding heavy hitters in data streams with tiny memory.

The order of the checks matters: compare with the existing candidates before trying to fill an empty slot, so the same value never occupies both slots.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Intersection of Two Arrays', fn: 'intersectionUnique', args: ['a', 'b'],
      prompt: 'Return the distinct values that appear in both arrays, in any order.',
      compare: 'unordered',
      tests: [[[[1, 2, 2, 1], [2, 2]], [2]], [[[4, 9, 5], [9, 4, 9, 8, 4]], [9, 4]], [[[], [1]], []], [[[1, 2, 3], [4, 5, 6]], []], [[[7, 7, 7], [7]], [7]]],
      js: String.raw`function intersectionUnique(a, b) {
  const setA = new Set(a);
  const out = new Set();
  for (const x of b) if (setA.has(x)) out.add(x);
  return [...out];
}`,
      py: String.raw`def intersection_unique(a, b):
    return list(set(a) & set(b))`,
      explain: `This is set intersection. Put one array in a set, then keep the elements of the other that are in it.

Because the output is a set too, duplicates collapse automatically: [7, 7, 7] and [7] give [7].

Python has the set operator &. JavaScript (ES2025) adds Set.prototype.intersection, and in older engines you loop as shown.

Variants:
- Keep the multiplicity (each value as many times as it appears in both): Intersection with Counts, in Medium.
- Both arrays sorted: two pointers, with O(1) extra space.
- One array huge and on disk, the other small: put the small one in a set and stream the large one.
- Many arrays: intersect the sets in order from smallest to largest, so the result shrinks quickly.

Interviewers use this warm-up to see whether you can discuss these follow-ups, not just the one-liner.`,
      complexity: 'O(n + m) time, O(n) space',
    },
  ],
};

export default m;
