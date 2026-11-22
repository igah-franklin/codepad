import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'arrays',
  title: 'Array Classics',
  description: 'The array questions interviewers ask most: stock prices, Kadane, prefix products and cycle detection.',
  challenges: [
    {
      title: 'Best Time to Buy and Sell Stock', fn: 'maxProfit', args: ['prices'],
      prompt: 'prices[i] is a stock price on day i. Choose one day to buy and a later day to sell. Return the maximum profit, or 0 if no profit is possible.',
      tests: [[[[7, 1, 5, 3, 6, 4]], 5], [[[7, 6, 4, 3, 1]], 0], [[[1]], 0], [[[2, 4, 1]], 2], [[[3, 2, 6, 5, 0, 3]], 4], [[[1, 2]], 1]],
      js: String.raw`function maxProfit(prices) {
  let minPrice = Infinity, best = 0;
  for (const p of prices) {
    if (p < minPrice) minPrice = p; // best day to have bought so far
    else best = Math.max(best, p - minPrice); // sell today?
  }
  return best;
}`,
      py: String.raw`def max_profit(prices):
    min_price = float("inf")
    best = 0
    for p in prices:
        if p < min_price:
            min_price = p
        else:
            best = max(best, p - min_price)
    return best`,
      explain: `For each possible selling day, the best buying day is the cheapest day before it. So scan once, remembering the lowest price seen so far.

1. minPrice = the cheapest price up to today.
2. Today's best profit = price - minPrice. Keep the maximum.

Selling before buying is impossible here, because minPrice only ever comes from earlier (or the same) days.

[7, 1, 5, 3, 6, 4]: the minimum drops to 1 on day 1, and the best sale is at 6 on day 4, for a profit of 5.

The O(n²) brute force tries every pair of days. The one-pass version is a tiny DP: "best so far" plus "best answer using the current element".

Interview follow-ups:
- Unlimited transactions (Stock II): add every positive day-to-day difference.
- With a cooldown, or at most k transactions: the state-machine DPs from Hard.

Equivalent view: this is Maximum Subarray (next) applied to the daily price changes.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Maximum Subarray (Kadane)', fn: 'maxSubArray', args: ['nums'],
      prompt: 'Return the largest sum of any non-empty contiguous subarray.',
      tests: [[[[-2, 1, -3, 4, -1, 2, 1, -5, 4]], 6], [[[1]], 1], [[[5, 4, -1, 7, 8]], 23], [[[-3, -1, -2]], -1], [[[0, -1, 0]], 0], [[[8, -19, 5, -4, 20]], 21]],
      js: String.raw`function maxSubArray(nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]); // extend, or start fresh here
    best = Math.max(best, cur);
  }
  return best;
}`,
      py: String.raw`def max_sub_array(nums):
    cur = best = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best`,
      explain: `Kadane's algorithm is one of the most famous one-pass DPs.

cur = the best sum of a subarray that ends at the current index. For each new element x you have two choices:
- extend the previous subarray: cur + x;
- start a new subarray at x: x.

Take the larger. If the running sum has gone negative, it only drags x down, so starting fresh wins.

best = the maximum cur ever seen, because the best subarray has to end somewhere.

Seed both with nums[0], not 0. Otherwise an all-negative array would wrongly return 0, the sum of an empty subarray, which is not allowed. The answer for [-3, -1, -2] is -1.

Divide and conquer also works in O(n log n): the best subarray is in the left half, in the right half, or crosses the middle. It is a classic follow-up.

To return the subarray itself, record where cur last restarted and where best was last updated.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Product of Array Except Self', fn: 'productExceptSelf', args: ['nums'],
      prompt: 'Return an array where answer[i] is the product of every element except nums[i], in O(n) time and without using division.',
      tests: [[[[1, 2, 3, 4]], [24, 12, 8, 6]], [[[-1, 1, 0, -3, 3]], [0, 0, 9, 0, 0]], [[[2, 3]], [3, 2]], [[[0, 0]], [0, 0]], [[[5, 1, 1]], [1, 5, 5]]],
      js: String.raw`function productExceptSelf(nums) {
  const n = nums.length, ans = new Array(n).fill(1);
  let prefix = 1;
  for (let i = 0; i < n; i++) {
    ans[i] = prefix; // product of everything to the left
    prefix *= nums[i];
  }
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    ans[i] *= suffix; // times everything to the right
    suffix *= nums[i];
  }
  return ans.map((x) => x || 0); // normalise -0 to 0
}`,
      py: String.raw`def product_except_self(nums):
    n = len(nums)
    ans = [1] * n
    prefix = 1
    for i in range(n):
        ans[i] = prefix
        prefix *= nums[i]
    suffix = 1
    for i in range(n - 1, -1, -1):
        ans[i] *= suffix
        suffix *= nums[i]
    return ans`,
      explain: `The product of everything except nums[i] is (the product of everything to the left of i) × (the product of everything to the right of i).

Two passes compute both without division:
1. Left to right: ans[i] = the product of nums[0..i-1], tracked in a running prefix.
2. Right to left: multiply ans[i] by the product of nums[i+1..n-1], tracked in a running suffix.

The output array holds the prefixes, so the only extra space is two variables: O(1) beyond the output.

Why "no division"? The obvious trick, total product ÷ nums[i], breaks with zeros. You cannot divide by 0, and with one zero almost every answer is 0 except at the zero itself. The prefix/suffix approach handles zeros naturally.

The JavaScript map(x => x || 0) turns -0 into 0, a display detail of floating-point multiplication.

The same two-direction trick appeared in Candy and Trapping Rain Water. It is a reliable tool whenever an answer depends on both sides of an index.`,
      complexity: 'O(n) time, O(1) extra space',
    },
    {
      title: 'Contains Duplicate', fn: 'containsDuplicate', args: ['nums'],
      prompt: 'Return true if any value appears at least twice in nums.',
      tests: [[[[1, 2, 3, 1]], true], [[[1, 2, 3, 4]], false], [[[]], false], [[[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], true], [[[-1, -2, -1]], true]],
      js: String.raw`function containsDuplicate(nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}`,
      py: String.raw`def contains_duplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False`,
      explain: `This is the simplest hash-set problem, and a good one for discussing trade-offs out loud.

Option A, hash set (used here): add elements one by one and stop at the first repeat. O(n) time and O(n) space. It exits early, so inputs with an early duplicate are fast.

Option B, sort first: duplicates become adjacent, so check neighbors. O(n log n) time but O(1) extra space if you sort in place. Mention that sorting in place modifies the input.

Option C, compare sizes: new Set(nums).size !== nums.length. It is a one-liner, but always processes the whole array.

Brute force compares every pair, O(n²), which is only fine for tiny inputs.

In an interview, the useful habit is to state the options with their time and space costs, pick one, and explain why. The code here is easy, and the reasoning is what is being assessed.

Follow-ups: Contains Duplicate II (within distance k, in Medium Hash Maps) and III (values within t of each other, solved with bucketing or an ordered set).`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Majority Element', fn: 'majorityElement', args: ['nums'],
      prompt: 'Return the element that appears more than ⌊n/2⌋ times (it always exists). Aim for O(n) time and O(1) space.',
      tests: [[[[3, 2, 3]], 3], [[[2, 2, 1, 1, 1, 2, 2]], 2], [[[1]], 1], [[[6, 5, 5]], 5], [[[4, 4, 4, 1, 2]], 4]],
      js: String.raw`function majorityElement(nums) {
  let candidate = null, count = 0;
  for (const x of nums) {
    if (count === 0) candidate = x;
    count += x === candidate ? 1 : -1;
  }
  return candidate;
}`,
      py: String.raw`def majority_element(nums):
    candidate, count = None, 0
    for x in nums:
        if count == 0:
            candidate = x
        count += 1 if x == candidate else -1
    return candidate`,
      explain: `The Boyer-Moore voting algorithm.

Picture each element as a vote. Pair up each vote for the candidate with a vote for someone else, and cancel the pair. The majority has more than half the votes, so it cannot be fully cancelled and always survives.

1. Keep a candidate and a count.
2. If count is 0, the next element becomes the candidate.
3. A matching element adds 1, and any other element subtracts 1.

At the end, the candidate is the majority, guaranteed because one exists. If it might not exist, do a second pass to count the candidate's occurrences and confirm.

Trace [2, 2, 1, 1, 1, 2, 2]: candidate 2 (count 2), the two 1s cancel it to 0, the next 1 becomes candidate, then the 2s cancel it and 2 takes over with a final count of 1. The answer is 2.

Alternatives: a frequency map (O(n) space), or sorting and taking the middle element (O(n log n)). The middle works because a majority element must cover the center of the sorted array.

Generalization: Majority Element II (more than n/3) keeps two candidates, and appears in this level's Sorting & Searching module.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Rotate Array', fn: 'rotateArray', args: ['nums', 'k'],
      prompt: 'Rotate nums to the right by k steps in place with O(1) extra space, and return it. [1,2,3,4,5,6,7] with k = 3 becomes [5,6,7,1,2,3,4].',
      tests: [[[[1, 2, 3, 4, 5, 6, 7], 3], [5, 6, 7, 1, 2, 3, 4]], [[[-1, -100, 3, 99], 2], [3, 99, -1, -100]], [[[1, 2], 3], [2, 1]], [[[1], 0], [1]], [[[1, 2, 3], 3], [1, 2, 3]]],
      js: String.raw`function rotateArray(nums, k) {
  const n = nums.length;
  k %= n;
  const reverse = (i, j) => {
    while (i < j) [nums[i++], nums[j--]] = [nums[j], nums[i]];
  };
  reverse(0, n - 1); // 7 6 5 4 3 2 1
  reverse(0, k - 1); // 5 6 7 | 4 3 2 1
  reverse(k, n - 1); // 5 6 7 | 1 2 3 4
  return nums;
}`,
      py: String.raw`def rotate_array(nums, k):
    n = len(nums)
    k %= n
    def reverse(i, j):
        while i < j:
            nums[i], nums[j] = nums[j], nums[i]
            i += 1
            j -= 1
    reverse(0, n - 1)
    reverse(0, k - 1)
    reverse(k, n - 1)
    return nums`,
      explain: `Copying into a new array is easy. The interview twist is doing it in place with O(1) extra space.

The three-reversal trick:
1. Reverse the whole array. The last k elements move to the front, but backwards.
2. Reverse the first k elements to put them in the right order.
3. Reverse the remaining n - k elements to fix them too.

[1, 2, 3, 4, 5, 6, 7] with k = 3 becomes 7 6 5 4 3 2 1, then 5 6 7 4 3 2 1, then 5 6 7 1 2 3 4.

Why it works: rotating is the same as swapping two blocks, AB → BA, and reversing gives (AB)^R = B^R A^R. Reversing each block again turns that into B A.

Always reduce k with k %= n first. Rotating by n is a no-op, and a huge k would otherwise break the index math.

Other approaches: cyclic replacements (move each element directly to its final position, following cycles), or the extra-array copy at O(n) space. The reversal trick is the easiest to get right under pressure.`,
      complexity: 'O(n) time, O(1) extra space',
    },
    {
      title: 'Plus One', fn: 'plusOne', args: ['digits'],
      prompt: 'digits represents a non-negative integer, most significant digit first. Add one and return the resulting digits.',
      tests: [[[[1, 2, 3]], [1, 2, 4]], [[[4, 3, 2, 1]], [4, 3, 2, 2]], [[[9]], [1, 0]], [[[9, 9, 9]], [1, 0, 0, 0]], [[[0]], [1]], [[[1, 9, 9]], [2, 0, 0]]],
      js: String.raw`function plusOne(digits) {
  const d = digits.slice();
  for (let i = d.length - 1; i >= 0; i--) {
    if (d[i] < 9) {
      d[i]++;
      return d; // no carry: done
    }
    d[i] = 0; // 9 + 1 = 10: write 0, carry on
  }
  return [1, ...d]; // every digit was 9
}`,
      py: String.raw`def plus_one(digits):
    d = digits[:]
    for i in range(len(d) - 1, -1, -1):
        if d[i] < 9:
            d[i] += 1
            return d
        d[i] = 0
    return [1] + d`,
      explain: `Grade-school addition, but you only ever add 1.

Start from the last digit:
- If it is less than 9, add 1 and stop. There is no carry.
- If it is 9, it becomes 0, and the carry moves to the next digit to the left.

If the carry runs off the front (every digit was 9), the number grows by one digit: 999 + 1 = 1000. Prepend a 1. Every other digit is already 0.

Early return is what makes the common case fast. Most numbers do not end in 9, so the loop usually stops after one step.

Why not convert to a number, add 1, and convert back? The digit array may be longer than any built-in integer type can hold, which is the point of storing numbers as digit arrays (big integers). Add Two Numbers and Multiply Strings use the same digit-by-digit carry logic.`,
      complexity: 'O(n) time worst case, O(n) space for the copy',
    },
    {
      title: 'Stock Trading (Unlimited)', fn: 'maxProfitII', args: ['prices'],
      prompt: 'You may buy and sell as many times as you like (holding at most one share at a time). Return the maximum total profit.',
      tests: [[[[7, 1, 5, 3, 6, 4]], 7], [[[1, 2, 3, 4, 5]], 4], [[[7, 6, 4, 3, 1]], 0], [[[]], 0], [[[3, 3, 5, 0, 0, 3, 1, 4]], 8]],
      js: String.raw`function maxProfitII(prices) {
  let profit = 0;
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) profit += prices[i] - prices[i - 1]; // take every rise
  }
  return profit;
}`,
      py: String.raw`def max_profit_ii(prices):
    return sum(max(0, prices[i] - prices[i - 1]) for i in range(1, len(prices)))`,
      explain: `With unlimited transactions, collect every upward move.

Any profitable trade from day a to day b can be split into daily steps: price[b] - price[a] = the sum of the daily changes in between. Holding through a down day only costs money, so the best strategy takes every positive daily change and skips every negative one.

So the answer is the sum of max(0, price[i] - price[i-1]).

[1, 2, 3, 4, 5]: you could buy on day 0 and sell on day 4 for 4, or trade every day for 1 + 1 + 1 + 1 = 4. It is the same total, and the daily view makes the greedy argument obvious.

This is a greedy algorithm whose proof is that decomposition. Compare it with:
- one transaction only (the first challenge here): track the minimum so far;
- a cooldown or a fee (Hard DP II): the state-machine DP, because greed fails once a trade has a fixed cost.

Recognizing when a simple greedy rule is provably optimal, and when constraints break it, is a theme throughout these questions.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Find the Duplicate Number', fn: 'findDuplicate', args: ['nums'],
      prompt: 'nums has n + 1 integers, each in 1..n, so at least one value repeats. Exactly one value is repeated (possibly several times). Return it without modifying the array, using O(1) extra space.',
      tests: [[[[1, 3, 4, 2, 2]], 2], [[[3, 1, 3, 4, 2]], 3], [[[3, 3, 3, 3, 3]], 3], [[[1, 1]], 1], [[[2, 5, 9, 6, 9, 3, 8, 9, 7, 1]], 9]],
      js: String.raw`function findDuplicate(nums) {
  // treat i -> nums[i] as a linked list; the duplicate is where the cycle starts
  let slow = nums[0], fast = nums[nums[0]];
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[nums[fast]];
  }
  slow = 0;
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
  }
  return slow;
}`,
      py: String.raw`def find_duplicate(nums):
    slow, fast = nums[0], nums[nums[0]]
    while slow != fast:
        slow = nums[slow]
        fast = nums[nums[fast]]
    slow = 0
    while slow != fast:
        slow = nums[slow]
        fast = nums[fast]
    return slow`,
      explain: `A brilliant reduction to cycle detection in a linked list.

Treat each index i as a node with an edge to nums[i]. Every value is in 1..n, so starting from index 0 you never leave the array. And because some value v appears twice, two different nodes point to v. In a path made of "next" pointers, that means you enter a cycle, and v is exactly where it begins.

Floyd's tortoise and hare:
1. Phase 1: slow moves one step and fast moves two, until they meet somewhere inside the cycle.
2. Phase 2: reset slow to the start (index 0). Move both one step at a time. They meet at the start of the cycle, the duplicate.

Why does phase 2 work? If the cycle starts μ steps from the start and has length λ, the meeting point in phase 1 is exactly μ steps (modulo λ) before the cycle's start. So walking μ steps from the start and μ steps from the meeting point lands both pointers on the same node.

The constraints (no modification, O(1) space) rule out sorting, hash sets and marking values negative. There is also a binary-search solution on the value range (count how many values are ≤ mid), at O(n log n).

This is a hard-to-find but famous insight. Recognizing "values that point to indices" as a hidden linked list is the key.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Merge Sorted Array In Place', fn: 'mergeInPlace', args: ['nums1', 'm', 'nums2', 'n'],
      prompt: 'nums1 has length m + n: its first m elements are sorted and the last n are zeros (empty space). nums2 has n sorted elements. Merge nums2 into nums1 in place so the result is sorted, and return nums1.',
      tests: [[[[1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3], [1, 2, 2, 3, 5, 6]], [[[1], 1, [], 0], [1]], [[[0], 0, [1], 1], [1]], [[[4, 5, 6, 0, 0, 0], 3, [1, 2, 3], 3], [1, 2, 3, 4, 5, 6]], [[[2, 0], 1, [1], 1], [1, 2]]],
      js: String.raw`function mergeInPlace(nums1, m, nums2, n) {
  let i = m - 1, j = n - 1, k = m + n - 1;
  // fill from the back so we never overwrite unread nums1 values
  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) nums1[k--] = nums1[i--];
    else nums1[k--] = nums2[j--];
  }
  return nums1;
}`,
      py: String.raw`def merge_in_place(nums1, m, nums2, n):
    i, j, k = m - 1, n - 1, m + n - 1
    while j >= 0:
        if i >= 0 and nums1[i] > nums2[j]:
            nums1[k] = nums1[i]
            i -= 1
        else:
            nums1[k] = nums2[j]
            j -= 1
        k -= 1
    return nums1`,
      explain: `Merging from the front would overwrite nums1's values before they are read. The free space is at the back, so merge from the back.

Three pointers:
- i: the last real element of nums1,
- j: the last element of nums2,
- k: the last slot of nums1, where the next largest value goes.

Each step, place the larger of nums1[i] and nums2[j] at k, and move that pointer and k left.

Why is this safe? Slot k is always at or after i, so writing there never destroys an element of nums1 that has not been read yet. At every step the number of free slots, k - i, equals the number of nums2 elements still to place, j + 1.

The loop only needs to run while nums2 has elements. Once j < 0, whatever remains of nums1 is already in place.

This is the merge step from merge sort, with the twist of filling from the end. "Work backwards to avoid overwriting" also appears in string problems like URLify (in this level's strings module).`,
      complexity: 'O(m + n) time, O(1) extra space',
    },
  ],
};

export default m;
