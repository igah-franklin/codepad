import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'intervals',
  title: 'Sorting & Intervals',
  description: 'Merge sort, custom orderings, selection and sweeping over sorted intervals.',
  challenges: [
    {
      title: 'Merge Sort', fn: 'mergeSort', args: ['nums'],
      prompt: 'Return nums sorted ascending using merge sort: split in half, sort each half recursively, then merge the halves.',
      tests: [[[[5, 2, 4, 6, 1, 3]], [1, 2, 3, 4, 5, 6]], [[[]], []], [[[1]], [1]], [[[2, 1]], [1, 2]], [[[3, -1, 3, 0, -1]], [-1, -1, 0, 3, 3]], [[[9, 8, 7, 6, 5, 4, 3, 2, 1]], [1, 2, 3, 4, 5, 6, 7, 8, 9]]],
      js: String.raw`function mergeSort(nums) {
  if (nums.length <= 1) return nums.slice();
  const mid = nums.length >> 1;
  const a = mergeSort(nums.slice(0, mid));
  const b = mergeSort(nums.slice(mid));
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) out.push(a[i] <= b[j] ? a[i++] : b[j++]);
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}`,
      py: String.raw`def merge_sort(nums):
    if len(nums) <= 1:
        return nums[:]
    mid = len(nums) // 2
    a = merge_sort(nums[:mid])
    b = merge_sort(nums[mid:])
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
      explain: `Merge sort is the textbook divide-and-conquer algorithm.

1. Base case: an array with 0 or 1 elements is already sorted.
2. Divide: split it into two halves.
3. Conquer: sort each half recursively.
4. Combine: merge the two sorted halves with the two-pointer merge from Easy (Merge Two Sorted Arrays).

Why O(n log n)? The array is halved again and again, which gives about log n levels of recursion. On each level, the merges handle all n elements in total. So the work is n × log n.

Properties:
- The O(n log n) bound is guaranteed even in the worst case, unlike quicksort, which can degrade to O(n²).
- It is stable, because the merge uses <=.
- It needs O(n) extra memory for merging.
- It is great for linked lists and for sorting data too large for memory (external sorting).

Python's Timsort and modern JavaScript engines' sort are hybrids built around merging.`,
      complexity: 'O(n log n) time, O(n) space',
    },
    {
      title: 'Merge Intervals', fn: 'mergeIntervals', args: ['intervals'],
      prompt: 'Given a list of [start, end] intervals, merge all overlapping ones and return the result sorted by start. Intervals that touch ([1,4] and [4,5]) overlap.',
      tests: [[[[[1, 3], [2, 6], [8, 10], [15, 18]]], [[1, 6], [8, 10], [15, 18]]], [[[[1, 4], [4, 5]]], [[1, 5]]], [[[[1, 4], [0, 4]]], [[0, 4]]], [[[]], []], [[[[1, 10], [2, 3], [4, 5]]], [[1, 10]]], [[[[5, 6], [1, 2]]], [[1, 2], [5, 6]]]],
      js: String.raw`function mergeIntervals(intervals) {
  const sorted = intervals.map((x) => x.slice()).sort((a, b) => a[0] - b[0]);
  const out = [];
  for (const [s, e] of sorted) {
    const last = out[out.length - 1];
    if (last && s <= last[1]) last[1] = Math.max(last[1], e);
    else out.push([s, e]);
  }
  return out;
}`,
      py: String.raw`def merge_intervals(intervals):
    out = []
    for s, e in sorted(intervals, key=lambda x: x[0]):
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out`,
      explain: `Sort first. Once intervals are ordered by start, any interval that overlaps the current group must come right after it, so a single pass is enough.

1. Sort by start time.
2. Walk the intervals, keeping the last merged interval:
- If the next one starts at or before the last one's end, they overlap, so extend the end to the larger of the two ends.
- Otherwise start a new group.

Why max(last end, e)? A long interval can swallow shorter ones: after [1, 10], the interval [2, 3] must not shrink the end to 3.

Why does sorting make one pass enough? After sorting, if the next interval does not overlap the current group, no later interval can either, because they all start even later.

Sorting is the dominant cost. "Sort, then sweep" solves a huge family of interval problems: calendars, booking systems, genome ranges.`,
      complexity: 'O(n log n) time, O(n) space',
    },
    {
      title: 'Insert Interval', fn: 'insertInterval', args: ['intervals', 'newInterval'],
      prompt: 'intervals is sorted by start and non-overlapping. Insert newInterval, merging where needed, and return the sorted, non-overlapping result. Aim for O(n).',
      tests: [[[[[1, 3], [6, 9]], [2, 5]], [[1, 5], [6, 9]]], [[[[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]], [[1, 2], [3, 10], [12, 16]]], [[[], [5, 7]], [[5, 7]]], [[[[1, 5]], [6, 8]], [[1, 5], [6, 8]]], [[[[3, 5]], [1, 2]], [[1, 2], [3, 5]]], [[[[1, 5]], [0, 9]], [[0, 9]]]],
      js: String.raw`function insertInterval(intervals, newInterval) {
  const out = [];
  let [s, e] = newInterval;
  let i = 0;
  while (i < intervals.length && intervals[i][1] < s) out.push(intervals[i++]); // before
  while (i < intervals.length && intervals[i][0] <= e) { // overlapping
    s = Math.min(s, intervals[i][0]);
    e = Math.max(e, intervals[i][1]);
    i++;
  }
  out.push([s, e]);
  while (i < intervals.length) out.push(intervals[i++]); // after
  return out;
}`,
      py: String.raw`def insert_interval(intervals, new_interval):
    out = []
    s, e = new_interval
    i, n = 0, len(intervals)
    while i < n and intervals[i][1] < s:
        out.append(intervals[i]); i += 1
    while i < n and intervals[i][0] <= e:
        s = min(s, intervals[i][0])
        e = max(e, intervals[i][1])
        i += 1
    out.append([s, e])
    out.extend(intervals[i:])
    return out`,
      explain: `The input is already sorted, so there is no need to re-sort. One pass splits the intervals into three phases.

1. Before: intervals that end before the new one starts cannot overlap it. Copy them unchanged.
2. Overlapping: intervals that start at or before the new one's end overlap it. Absorb each one by widening [s, e] to cover it.
3. After: everything left starts after the merged interval ends. Copy it unchanged.

Then push the merged interval between phases 2 and 3.

Each interval is looked at once, so it is O(n). Appending newInterval and calling Merge Intervals would also work, but sorting again makes it O(n log n).

Using the guarantees you are given (here, sorted and non-overlapping) is often the key to the optimal solution, so always ask what structure the input already has.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Meeting Rooms', fn: 'canAttendAll', args: ['intervals'],
      prompt: 'Each interval is a meeting [start, end). Return true if one person could attend all of them, meaning no two overlap. A meeting ending at 10 and another starting at 10 do not overlap.',
      tests: [[[[[0, 30], [5, 10], [15, 20]]], false], [[[[7, 10], [2, 4]]], true], [[[]], true], [[[[1, 5], [5, 10]]], true], [[[[1, 5], [4, 6]]], false]],
      js: String.raw`function canAttendAll(intervals) {
  const a = intervals.slice().sort((x, y) => x[0] - y[0]);
  for (let i = 1; i < a.length; i++) {
    if (a[i][0] < a[i - 1][1]) return false;
  }
  return true;
}`,
      py: String.raw`def can_attend_all(intervals):
    a = sorted(intervals, key=lambda x: x[0])
    for i in range(1, len(a)):
        if a[i][0] < a[i - 1][1]:
            return False
    return True`,
      explain: `After sorting by start time, a conflict can only happen between neighbors, so you only need to compare each meeting with the one just before it.

A meeting overlaps the previous one if it starts strictly before the previous one ends. The intervals are half-open [start, end), so ending at 10 and starting at 10 is fine, which is why the comparison is < and not <=.

Checking every pair would be O(n²). Sorting brings it down to O(n log n) plus a linear check.

This is the "Is Sorted" idea from Easy applied to intervals: sort by one coordinate, and the property you care about becomes local, a check between neighbors.

The real question in calendar apps is the follow-up: how many rooms are needed? That is the next challenge.`,
      complexity: 'O(n log n) time, O(n) space',
    },
    {
      title: 'Meeting Rooms II', fn: 'minMeetingRooms', args: ['intervals'],
      prompt: 'Return the minimum number of rooms needed to hold all the meetings [start, end). A room freed at time t can be reused by a meeting starting at t.',
      tests: [[[[[0, 30], [5, 10], [15, 20]]], 2], [[[[7, 10], [2, 4]]], 1], [[[]], 0], [[[[1, 5], [5, 10], [10, 15]]], 1], [[[[1, 10], [2, 9], [3, 8], [4, 7]]], 4], [[[[1, 3], [2, 4], [3, 5]]], 2]],
      js: String.raw`function minMeetingRooms(intervals) {
  const starts = intervals.map((x) => x[0]).sort((a, b) => a - b);
  const ends = intervals.map((x) => x[1]).sort((a, b) => a - b);
  let rooms = 0, best = 0, j = 0;
  for (let i = 0; i < starts.length; i++) {
    // free every room whose meeting has ended by now
    while (j < ends.length && ends[j] <= starts[i]) {
      rooms--;
      j++;
    }
    rooms++;
    best = Math.max(best, rooms);
  }
  return best;
}`,
      py: String.raw`def min_meeting_rooms(intervals):
    starts = sorted(x[0] for x in intervals)
    ends = sorted(x[1] for x in intervals)
    rooms = best = j = 0
    for s in starts:
        while j < len(ends) and ends[j] <= s:
            rooms -= 1
            j += 1
        rooms += 1
        best = max(best, rooms)
    return best`,
      explain: `The answer is the largest number of meetings happening at the same moment. Find it with a sweep line.

Think of time as a line with two kinds of events: a start (+1 room in use) and an end (-1 room in use). Sort the starts and the ends separately, then walk through the starts in order:
1. Before opening a meeting at time s, release every room whose meeting has ended by s (ends[j] <= s). Using <= lets a room freed at time t be reused at time t.
2. Open a room for the new meeting.
3. Track the maximum number of rooms in use.

Why can starts and ends be sorted independently? We only need to know how many meetings are active at each moment, not which meeting holds which room.

Heap alternative: sort the meetings by start and keep a min-heap of end times for the rooms in use. If the earliest-ending room is free at the new start, reuse it (pop). Then push the new end. The heap's size at the end is the answer. Both approaches are O(n log n).`,
      complexity: 'O(n log n) time, O(n) space',
    },
    {
      title: 'Non-overlapping Intervals', fn: 'eraseOverlapIntervals', args: ['intervals'],
      prompt: 'Return the minimum number of intervals to remove so that the rest do not overlap. Intervals that only touch ([1,2] and [2,3]) do not overlap.',
      tests: [[[[[1, 2], [2, 3], [3, 4], [1, 3]]], 1], [[[[1, 2], [1, 2], [1, 2]]], 2], [[[[1, 2], [2, 3]]], 0], [[[]], 0], [[[[1, 100], [11, 22], [1, 11], [2, 12]]], 2]],
      js: String.raw`function eraseOverlapIntervals(intervals) {
  const a = intervals.slice().sort((x, y) => x[1] - y[1]); // by end time
  let kept = 0, lastEnd = -Infinity;
  for (const [s, e] of a) {
    if (s >= lastEnd) {
      kept++;
      lastEnd = e;
    }
  }
  return intervals.length - kept;
}`,
      py: String.raw`def erase_overlap_intervals(intervals):
    a = sorted(intervals, key=lambda x: x[1])
    kept = 0
    last_end = float("-inf")
    for s, e in a:
        if s >= last_end:
            kept += 1
            last_end = e
    return len(intervals) - kept`,
      explain: `Flip the question: removing the fewest intervals is the same as keeping the most non-overlapping ones. That is the classic activity selection problem.

Greedy rule: always keep the interval that ends earliest among those that fit.

1. Sort by end time.
2. Walk through them, keeping an interval if it starts at or after the end of the last kept one.
3. Answer = total - kept.

Why does "earliest end" work? Picking the interval that finishes first leaves as much room as possible for the rest. If an optimal solution chose a different first interval, you could swap in the earliest-ending one without causing any new overlap. That is an exchange argument, the standard way to prove a greedy algorithm correct.

Sorting by start time does not work. A single long interval that starts first would block many short ones.

Greedy algorithms are fast and simple, but only correct for problems with this kind of structure. The proof matters.`,
      complexity: 'O(n log n) time, O(n) space',
    },
    {
      title: 'Kth Largest Element', fn: 'findKthLargest', args: ['nums', 'k'],
      prompt: 'Return the k-th largest element of nums (k = 1 is the maximum). Duplicates count separately. Try to beat full sorting.',
      tests: [[[[3, 2, 1, 5, 6, 4], 2], 5], [[[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], 4], [[[1], 1], 1], [[[7, 7, 7], 2], 7], [[[-1, -5, 3], 3], -5]],
      js: String.raw`function findKthLargest(nums, k) {
  // Quickselect: partition around a pivot and keep only the side containing the answer.
  const a = nums.slice();
  const target = a.length - k; // index of the answer in ascending order
  let lo = 0, hi = a.length - 1;
  while (true) {
    const pivot = a[lo + Math.floor(Math.random() * (hi - lo + 1))];
    // three-way partition: [< pivot][== pivot][> pivot]
    let lt = lo, i = lo, gt = hi;
    while (i <= gt) {
      if (a[i] < pivot) [a[lt++], a[i++]] = [a[i], a[lt]];
      else if (a[i] > pivot) [a[gt--], a[i]] = [a[i], a[gt]];
      else i++;
    }
    if (target < lt) hi = lt - 1;
    else if (target > gt) lo = gt + 1;
    else return pivot;
  }
}`,
      py: String.raw`import random

def find_kth_largest(nums, k):
    a = nums[:]
    target = len(a) - k
    lo, hi = 0, len(a) - 1
    while True:
        pivot = a[random.randint(lo, hi)]
        lt, i, gt = lo, lo, hi
        while i <= gt:
            if a[i] < pivot:
                a[lt], a[i] = a[i], a[lt]
                lt += 1
                i += 1
            elif a[i] > pivot:
                a[gt], a[i] = a[i], a[gt]
                gt -= 1
            else:
                i += 1
        if target < lt:
            hi = lt - 1
        elif target > gt:
            lo = gt + 1
        else:
            return pivot`,
      explain: `There are three standard approaches:
1. Sort and index: O(n log n). Simple and often fine.
2. Min-heap of size k: push every element and pop whenever the heap holds more than k. The top is the answer. O(n log k), and it works on streams.
3. Quickselect (used here): O(n) on average.

Quickselect is quicksort that only recurses into one side.
- The k-th largest is the element at index n - k in sorted order.
- Pick a random pivot and partition the array into < pivot, == pivot and > pivot, the same three-way partition as Sort Colors.
- If the target index falls inside the "equal" block, the pivot is the answer. Otherwise continue only in the side that contains the target.

Why O(n) on average? Each round throws away a constant fraction of the elements on average, so the work is about n + n/2 + n/4 + ..., which is less than 2n. A random pivot makes the O(n²) worst case extremely unlikely.

The three-way partition matters when there are many duplicates, like [7, 7, 7]. A two-way partition can degrade badly on such input.`,
      complexity: 'O(n) average time (O(n²) worst case), O(n) space for the copy',
    },
    {
      title: 'Largest Number', fn: 'largestNumber', args: ['nums'],
      prompt: 'Arrange the non-negative integers so that, concatenated, they form the largest possible number. Return it as a string. [3, 30, 34, 5, 9] → "9534330".',
      tests: [[[[10, 2]], '210'], [[[3, 30, 34, 5, 9]], '9534330'], [[[0, 0]], '0'], [[[1]], '1'], [[[121, 12]], '12121'], [[[8, 89, 898]], '898988']],
      js: String.raw`function largestNumber(nums) {
  const s = nums.map(String).sort((a, b) => (b + a).localeCompare(a + b));
  return s[0] === '0' ? '0' : s.join('');
}`,
      py: String.raw`from functools import cmp_to_key

def largest_number(nums):
    s = [str(x) for x in nums]
    s.sort(key=cmp_to_key(lambda a, b: (a + b < b + a) - (a + b > b + a)))
    return "0" if s[0] == "0" else "".join(s)`,
      explain: `This needs a custom ordering. Sorting the numbers by value fails: 30 > 3, yet "330" beats "303". Sorting the strings alphabetically also fails: "30" > "3", yet 3 should come first.

The right comparison: put a before b if a + b > b + a as strings. To decide between "3" and "30", compare "330" with "303". "330" is larger, so "3" goes first.

Why is this a valid sort order? It is transitive. If ab ≥ ba and bc ≥ cb, then ac ≥ ca. So sorting with it is well defined, and an exchange argument shows the result is optimal: swapping any adjacent pair that breaks the rule would make the number smaller.

Comparing equal-length strings works like comparing numbers, and a + b and b + a always have the same length, so localeCompare in JavaScript (or < in Python) is safe here.

Edge case: [0, 0] would give "00". If the largest piece is "0", every piece is "0", so return "0".

In Python, cmp_to_key turns a two-argument comparator into the key function that sort expects.`,
      complexity: 'O(n log n · d) time for d-digit numbers, O(n · d) space',
    },
    {
      title: 'Sort Characters by Frequency', fn: 'frequencySort', args: ['s'],
      prompt: 'Return s rearranged so characters appear in decreasing order of frequency, each character\'s copies grouped together. Break ties by character code, smallest first.',
      tests: [[['tree'], 'eert'], [['cccaaa'], 'aaaccc'], [['Aabb'], 'bbAa'], [[''], ''], [['banana'], 'aaannb'], [['zyx'], 'xyz']],
      js: String.raw`function frequencySort(s) {
  const freq = new Map();
  for (const c of s) freq.set(c, (freq.get(c) || 0) + 1);
  const chars = [...freq.keys()].sort((a, b) => freq.get(b) - freq.get(a) || (a < b ? -1 : a > b ? 1 : 0));
  return chars.map((c) => c.repeat(freq.get(c))).join('');
}`,
      py: String.raw`def frequency_sort(s):
    freq = {}
    for c in s:
        freq[c] = freq.get(c, 0) + 1
    chars = sorted(freq, key=lambda c: (-freq[c], c))
    return "".join(c * freq[c] for c in chars)`,
      explain: `Count, sort the distinct characters by count, then expand each one back out.

1. Build a frequency map.
2. Sort the distinct characters: higher count first, ties by character code.
3. Output each character repeated by its count.

Multi-key sorting:
- JavaScript: freq(b) - freq(a) || compare(a, b). When the counts are equal the subtraction gives 0, which is falsy, so || falls through to the tie-breaker.
- Python: a tuple key (-count, char). Negating the count gives descending order by count, while the character stays ascending.

Specifying a tie-break makes the answer unique. Without one, "tree" could be "eert" or "eetr". Always ask about ties in an interview.

Bucket-sort alternative: bucket the characters by count (from 1 to n) and read the buckets from high to low. That is O(n) time, the same trick as Top K Frequent.`,
      complexity: 'O(n + k log k) time for k distinct characters, O(n) space',
    },
    {
      title: 'H-Index', fn: 'hIndex', args: ['citations'],
      prompt: 'citations[i] is the number of citations of paper i. The h-index is the largest h such that the researcher has at least h papers with at least h citations each. Return it.',
      tests: [[[[3, 0, 6, 1, 5]], 3], [[[1, 3, 1]], 1], [[[0, 0]], 0], [[[100]], 1], [[[]], 0], [[[4, 4, 4, 4]], 4], [[[10, 8, 5, 4, 3]], 4]],
      js: String.raw`function hIndex(citations) {
  const n = citations.length;
  const buckets = new Array(n + 1).fill(0); // counts capped at n
  for (const c of citations) buckets[Math.min(c, n)]++;
  let papers = 0;
  for (let h = n; h >= 0; h--) {
    papers += buckets[h]; // papers with at least h citations
    if (papers >= h) return h;
  }
  return 0;
}`,
      py: String.raw`def h_index(citations):
    n = len(citations)
    buckets = [0] * (n + 1)
    for c in citations:
        buckets[min(c, n)] += 1
    papers = 0
    for h in range(n, -1, -1):
        papers += buckets[h]
        if papers >= h:
            return h
    return 0`,
      explain: `Sorting approach: sort the citation counts in descending order. The h-index is the largest h where the h-th paper (1-based) has at least h citations. That is O(n log n).

Counting approach (used here, O(n)):
1. The h-index can never exceed n, the number of papers. So any count above n can be capped at n without changing the answer.
2. Count how many papers fall into each capped citation value, from 0 to n.
3. Walk h downward from n, keeping a running total of papers with at least h citations. The first h where that total is at least h is the answer.

For [3, 0, 6, 1, 5] with n = 5: buckets[5] = 2 (the 6 is capped to 5), so at h = 5 there are 2 papers (not enough), at h = 4 still 2, and at h = 3 there are 3 papers, which is enough. The answer is 3.

Capping large values to bound the range and then counting is a common trick: counting sort becomes practical whenever the range is small.`,
      complexity: 'O(n) time, O(n) space',
    },
  ],
};

export default m;
