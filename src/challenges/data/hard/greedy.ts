import type { ModuleDef } from '../../types';

// A small binary heap used by several JS solutions (Python has heapq built in).
const HEAP = String.raw`class Heap {
  constructor(less) { this.a = []; this.less = less; }
  get size() { return this.a.length; }
  peek() { return this.a[0]; }
  push(x) {
    const a = this.a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.less(a[i], a[p])) break;
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = l + 1;
        let s = i;
        if (l < a.length && this.less(a[l], a[s])) s = l;
        if (r < a.length && this.less(a[r], a[s])) s = r;
        if (s === i) break;
        [a[i], a[s]] = [a[s], a[i]];
        i = s;
      }
    }
    return top;
  }
}`;

const m: ModuleDef = {
  id: 'greedy-heaps',
  title: 'Greedy & Heaps',
  description: 'Priority queues for "best next" choices, and greedy proofs that local choices are globally optimal.',
  challenges: [
    {
      title: 'Merge K Sorted Lists', fn: 'mergeKSorted', args: ['lists'],
      prompt: 'lists contains k arrays, each sorted ascending. Merge them into one sorted array in O(N log k), where N is the total number of elements.',
      tests: [[[[[1, 4, 5], [1, 3, 4], [2, 6]]], [1, 1, 2, 3, 4, 4, 5, 6]], [[[]], []], [[[[]]], []], [[[[5], [], [1, 9]]], [1, 5, 9]], [[[[-3, 0], [-2, 7], [-5]]], [-5, -3, -2, 0, 7]]],
      js: HEAP + String.raw`

function mergeKSorted(lists) {
  const heap = new Heap((x, y) => x[0] < y[0]); // [value, listIndex, elementIndex]
  lists.forEach((l, i) => l.length && heap.push([l[0], i, 0]));
  const out = [];
  while (heap.size) {
    const [v, i, j] = heap.pop();
    out.push(v);
    if (j + 1 < lists[i].length) heap.push([lists[i][j + 1], i, j + 1]);
  }
  return out;
}`,
      py: String.raw`import heapq

def merge_k_sorted(lists):
    heap = [(l[0], i, 0) for i, l in enumerate(lists) if l]
    heapq.heapify(heap)
    out = []
    while heap:
        v, i, j = heapq.heappop(heap)
        out.append(v)
        if j + 1 < len(lists[i]):
            heapq.heappush(heap, (lists[i][j + 1], i, j + 1))
    return out`,
      explain: `This generalizes the two-way merge. At every step, the next output is the smallest of the k front elements. A min-heap finds it in O(log k).

1. Push the first element of each non-empty list, along with which list it came from and its position.
2. Pop the minimum and output it.
3. Push the next element from the same list, if there is one.
4. Repeat until the heap is empty.

The heap never holds more than k entries, so each of the N elements costs O(log k), giving O(N log k).

Alternatives:
- Concatenate and sort: O(N log N).
- Merge the lists one at a time: O(N × k).
- Divide and conquer: merge pairs, then pairs of pairs. Also O(N log k), and needs no heap.

JavaScript has no built-in priority queue, so the solution includes a compact binary heap with a comparator. Being able to write one quickly is a valuable interview skill. Python's heapq provides one, and tuples compare element by element, so (value, list, index) works directly.`,
      complexity: 'O(N log k) time, O(k) heap space',
    },
    {
      title: 'Find Median from Data Stream', fn: 'MedianFinder', args: [],
      prompt: 'Design a structure with addNum(num) and findMedian(). findMedian returns the median of all numbers added so far (the average of the two middle values when the count is even). Both operations should be fast.',
      methods: [{ name: 'addNum', args: ['num'] }, { name: 'findMedian', args: [] }],
      tests: [
        [[['MedianFinder', 'addNum', 'addNum', 'findMedian', 'addNum', 'findMedian'], [[], [1], [2], [], [3], []]], [null, null, null, 1.5, null, 2]],
        [[['MedianFinder', 'addNum', 'findMedian', 'addNum', 'findMedian', 'addNum', 'findMedian', 'addNum', 'findMedian'], [[], [5], [], [15], [], [1], [], [3], []]], [null, null, 5, null, 10, null, 5, null, 4]],
        [[['MedianFinder', 'addNum', 'addNum', 'addNum', 'findMedian'], [[], [-1], [-2], [-3], []]], [null, null, null, null, -2]],
      ],
      js: HEAP + String.raw`

class MedianFinder {
  constructor() {
    this.low = new Heap((a, b) => a > b); // max-heap: smaller half
    this.high = new Heap((a, b) => a < b); // min-heap: larger half
  }
  addNum(num) {
    this.low.push(num);
    this.high.push(this.low.pop()); // move the largest of the low half up
    if (this.high.size > this.low.size) this.low.push(this.high.pop()); // keep low >= high
  }
  findMedian() {
    if (this.low.size > this.high.size) return this.low.peek();
    return (this.low.peek() + this.high.peek()) / 2;
  }
}`,
      py: String.raw`import heapq

class MedianFinder:
    def __init__(self):
        self.low = []   # max-heap via negated values
        self.high = []  # min-heap

    def add_num(self, num):
        heapq.heappush(self.low, -num)
        heapq.heappush(self.high, -heapq.heappop(self.low))
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def find_median(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2`,
      explain: `Split the numbers into two halves:
- low: a max-heap holding the smaller half, so its top is the largest of the small numbers.
- high: a min-heap holding the larger half, so its top is the smallest of the large numbers.

Keep two invariants: every value in low is at most every value in high, and low has the same number of elements as high, or one more.

Then the median sits at the tops of the heaps: low's top if low is bigger, otherwise the average of both tops.

addNum in three steps:
1. Push into low.
2. Move low's maximum into high. This keeps the ordering invariant even if num belonged in the upper half.
3. If high is now bigger, move its minimum back to low. This restores the size balance.

Each add costs O(log n), and findMedian is O(1).

In Python, heapq is a min-heap only, so store negated values to simulate a max-heap.

The two-heap technique also solves Sliding Window Median and "balance two groups" scheduling problems.`,
      complexity: 'O(log n) per addNum, O(1) per findMedian, O(n) space',
    },
    {
      title: 'Task Scheduler', fn: 'leastInterval', args: ['tasks', 'n'],
      prompt: 'tasks is a list of task letters; each takes one time unit. The same task needs at least n units between runs (the CPU can idle). Return the minimum total time to finish everything.',
      tests: [[[['A', 'A', 'A', 'B', 'B', 'B'], 2], 8], [[['A', 'A', 'A', 'B', 'B', 'B'], 0], 6], [[['A', 'A', 'A', 'A', 'A', 'A', 'B', 'C', 'D', 'E', 'F', 'G'], 2], 16], [[['A'], 5], 1], [[['A', 'B', 'C', 'D', 'E', 'A', 'B', 'C', 'D', 'E'], 4], 10], [[['A', 'A', 'B'], 3], 5]],
      js: String.raw`function leastInterval(tasks, n) {
  const count = {};
  for (const t of tasks) count[t] = (count[t] || 0) + 1;
  const freqs = Object.values(count);
  const maxF = Math.max(...freqs);
  const numMax = freqs.filter((f) => f === maxF).length; // tasks tied for the max
  // (maxF - 1) full "frames" of length n+1, plus a final row of the most frequent tasks
  return Math.max(tasks.length, (maxF - 1) * (n + 1) + numMax);
}`,
      py: String.raw`def least_interval(tasks, n):
    count = {}
    for t in tasks:
        count[t] = count.get(t, 0) + 1
    max_f = max(count.values())
    num_max = sum(1 for f in count.values() if f == max_f)
    return max(len(tasks), (max_f - 1) * (n + 1) + num_max)`,
      explain: `The most frequent task sets the skeleton of the schedule.

Say task A appears maxF times. Consecutive A's must be at least n apart, so lay them out as maxF - 1 frames, each of length n + 1 (an A, then n slots), followed by a final A:
A _ _ | A _ _ | A

Other tasks fill the empty slots. Tasks tied with A for maxF also need a spot in the final row, so the last row has numMax tasks.

The lower bound from this skeleton is (maxF - 1) × (n + 1) + numMax.

If there are so many distinct tasks that every slot fills and more remain, no idling is needed at all, and the answer is simply the number of tasks. So the answer is the max of the two.

Example: AAABBB with n = 2 gives 2 frames of 3 plus a final row of 2 (A and B), so 8: A B _ A B _ A B.

A greedy simulation with a max-heap (always run the available task with the most remaining copies) also works and produces the actual schedule. The formula only gives its length, but in O(N).`,
      complexity: 'O(N) time, O(1) space (26 letters)',
    },
    {
      title: 'Jump Game', fn: 'canJump', args: ['nums'],
      prompt: 'You start at index 0. nums[i] is the maximum jump length from index i. Return true if you can reach the last index.',
      tests: [[[[2, 3, 1, 1, 4]], true], [[[3, 2, 1, 0, 4]], false], [[[0]], true], [[[0, 1]], false], [[[2, 0, 0]], true], [[[1, 1, 0, 1]], false]],
      js: String.raw`function canJump(nums) {
  let reach = 0; // farthest index reachable so far
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) return false; // stuck before i
    reach = Math.max(reach, i + nums[i]);
  }
  return true;
}`,
      py: String.raw`def can_jump(nums):
    reach = 0
    for i, x in enumerate(nums):
        if i > reach:
            return False
        reach = max(reach, i + x)
    return True`,
      explain: `Track the farthest index you could possibly reach.

Walk left to right:
1. If the current index i is beyond reach, you can never get here, so return false.
2. Otherwise, from i you can reach i + nums[i]. Extend reach if that goes further.

If the loop finishes, the last index was reachable.

Why is this enough? Every index up to reach is reachable, because you could have stopped short on any jump. So the reachable indices always form a contiguous prefix, and one number describes them completely.

[3, 2, 1, 0, 4]: every route lands on index 3, whose value is 0, and reach stays stuck at 3, so index 4 fails.

DP formulations (can[i] = some earlier j that can reach i) are O(n²). This greedy view is O(n) and O(1).

Working backwards also works: keep a "goal" index starting at the end, and move it to i whenever i + nums[i] reaches the goal. You can jump to the end exactly when the goal reaches 0.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Jump Game II', fn: 'jump', args: ['nums'],
      prompt: 'Same rules as Jump Game, but the last index is always reachable. Return the minimum number of jumps needed to reach it.',
      tests: [[[[2, 3, 1, 1, 4]], 2], [[[2, 3, 0, 1, 4]], 2], [[[0]], 0], [[[1, 2]], 1], [[[1, 1, 1, 1]], 3], [[[5, 9, 3, 2, 1, 0, 2, 3, 3, 1, 0, 0]], 3]],
      js: String.raw`function jump(nums) {
  let jumps = 0, end = 0, far = 0; // [.., end] is reachable with "jumps" jumps
  for (let i = 0; i < nums.length - 1; i++) {
    far = Math.max(far, i + nums[i]);
    if (i === end) {
      // must jump now to go any further
      jumps++;
      end = far;
    }
  }
  return jumps;
}`,
      py: String.raw`def jump(nums):
    jumps = end = far = 0
    for i in range(len(nums) - 1):
        far = max(far, i + nums[i])
        if i == end:
            jumps += 1
            end = far
    return jumps`,
      explain: `Think of it as BFS over index ranges, without building a queue.

- Level 0 is just index 0.
- Level 1 is every index reachable with one jump: up to 0 + nums[0].
- Level k + 1 is everything reachable from any index in level k.

Walk through the array, tracking:
- end: the last index of the current level,
- far: the farthest index reachable from anything seen so far.

When i reaches end, the current level is used up, so jump: jumps++, and the next level ends at far.

The loop stops before the last index. Arriving at the end does not need another jump.

[2, 3, 1, 1, 4]: level 1 covers indices 1 to 2, and from index 1 you can reach index 4, so level 2 reaches the end. That is 2 jumps.

Each level is the set of indices reachable in exactly that many jumps, and they are contiguous, so this greedy BFS is optimal in O(n) and O(1) space. DP would be O(n²).`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Gas Station', fn: 'canCompleteCircuit', args: ['gas', 'cost'],
      prompt: 'Stations sit on a circular route. gas[i] is the fuel available at station i and cost[i] the fuel needed to drive to station i+1. Starting with an empty tank, return the index of the station from which you can complete the loop, or -1. The answer is unique if it exists.',
      tests: [[[[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]], 3], [[[2, 3, 4], [3, 4, 3]], -1], [[[5], [4]], 0], [[[3, 1, 1], [1, 2, 2]], 0], [[[5, 1, 2, 3, 4], [4, 4, 1, 5, 1]], 4]],
      js: String.raw`function canCompleteCircuit(gas, cost) {
  let total = 0, tank = 0, start = 0;
  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i];
    total += diff;
    tank += diff;
    if (tank < 0) {
      // cannot reach i+1 from start: every station in [start, i] fails too
      start = i + 1;
      tank = 0;
    }
  }
  return total >= 0 ? start : -1;
}`,
      py: String.raw`def can_complete_circuit(gas, cost):
    total = tank = start = 0
    for i in range(len(gas)):
        diff = gas[i] - cost[i]
        total += diff
        tank += diff
        if tank < 0:
            start = i + 1
            tank = 0
    return start if total >= 0 else -1`,
      explain: `There are two facts behind the single pass.

1. A solution exists exactly when the total fuel is at least the total cost. If the circuit as a whole loses fuel, no starting point can fix that.

2. If you start at s and run dry before reaching i + 1, then no station between s and i can be the start either. You arrived at each of those stations with a tank of zero or more, so starting there with an empty tank can only leave you with less fuel at i.

So scan once with a running tank. Whenever it goes negative, jump the candidate start to i + 1 and reset the tank. At the end, if total ≥ 0, the last candidate is the answer.

The brute force tries every start and simulates the whole loop, which is O(n²).

Why do we not need to simulate the wrap-around from the final candidate? Its run from start to the end never went negative, and the total is non-negative. So the deficit from the earlier part is covered by the surplus collected from start onwards.

The second fact is the key: one failure lets you skip a whole range of candidates.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Candy', fn: 'candy', args: ['ratings'],
      prompt: 'Children stand in a line with ratings. Each child gets at least one candy, and any child with a higher rating than an adjacent child must get more candy than that neighbor. Return the minimum total candies.',
      tests: [[[[1, 0, 2]], 5], [[[1, 2, 2]], 4], [[[5]], 1], [[[1, 2, 3, 4]], 10], [[[4, 3, 2, 1]], 10], [[[1, 3, 2, 2, 1]], 7], [[[1, 2, 87, 87, 87, 2, 1]], 13]],
      js: String.raw`function candy(ratings) {
  const n = ratings.length;
  const c = new Array(n).fill(1);
  for (let i = 1; i < n; i++) if (ratings[i] > ratings[i - 1]) c[i] = c[i - 1] + 1; // left neighbor rule
  for (let i = n - 2; i >= 0; i--) if (ratings[i] > ratings[i + 1]) c[i] = Math.max(c[i], c[i + 1] + 1); // right neighbor rule
  return c.reduce((a, b) => a + b, 0);
}`,
      py: String.raw`def candy(ratings):
    n = len(ratings)
    c = [1] * n
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]:
            c[i] = c[i - 1] + 1
    for i in range(n - 2, -1, -1):
        if ratings[i] > ratings[i + 1]:
            c[i] = max(c[i], c[i + 1] + 1)
    return sum(c)`,
      explain: `Each child has two constraints, one from each neighbor. Satisfy them in two separate passes, then combine.

1. Start everyone at 1.
2. Left to right: if a child's rating beats their left neighbor's, give them one more than that neighbor. Now every left-neighbor rule holds.
3. Right to left: if a child beats their right neighbor, they need at least right + 1. Take the max with what they already have, so the left rule from pass 1 is not broken.

The result is minimal, because each child gets exactly the larger of the two lower bounds (the length of the increasing run ending at them from each side), and both bounds are unavoidable.

Equal ratings impose no constraint, so [1, 2, 2] gives 1, 2, 1, a total of 4.

This "two passes, one per direction" pattern also solves Product of Array Except Self (prefix and suffix products) and Trapping Rain Water (left max and right max).`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Minimum Arrows to Burst Balloons', fn: 'findMinArrowShots', args: ['points'],
      prompt: 'Each balloon spans [start, end] on the x-axis. An arrow shot at x bursts every balloon with start ≤ x ≤ end. Return the minimum number of arrows needed to burst all balloons.',
      tests: [[[[[10, 16], [2, 8], [1, 6], [7, 12]]], 2], [[[[1, 2], [3, 4], [5, 6], [7, 8]]], 4], [[[[1, 2], [2, 3], [3, 4], [4, 5]]], 2], [[[]], 0], [[[[1, 10], [2, 3], [4, 5]]], 2], [[[[-2147483646, -2147483645], [2147483646, 2147483647]]], 2]],
      js: String.raw`function findMinArrowShots(points) {
  if (!points.length) return 0;
  const a = points.slice().sort((x, y) => x[1] - y[1]); // by end
  let arrows = 1, pos = a[0][1]; // shoot at the earliest end
  for (const [s, e] of a) {
    if (s > pos) {
      // this balloon starts after the last arrow: need a new one
      arrows++;
      pos = e;
    }
  }
  return arrows;
}`,
      py: String.raw`def find_min_arrow_shots(points):
    if not points:
        return 0
    a = sorted(points, key=lambda p: p[1])
    arrows, pos = 1, a[0][1]
    for s, e in a:
        if s > pos:
            arrows += 1
            pos = e
    return arrows`,
      explain: `This is the dual of Non-overlapping Intervals, using the same earliest-end greedy.

1. Sort the balloons by their end point.
2. Shoot the first arrow at the end of the first balloon. That is the rightmost spot that still hits it, so it catches as many later balloons as possible.
3. Every balloon starting at or before that spot is burst by the same arrow.
4. The first balloon starting after the spot needs a new arrow, again shot at its end.

Why shoot at the end? Any arrow that bursts the earliest-ending balloon must be at or before its end. Shooting exactly at the end hits everything a shot further left would hit, and possibly more. That is the exchange argument again.

Touching counts: [1, 2] and [2, 3] share x = 2, so one arrow bursts both, which is why the test is s > pos rather than >=.

The last test uses values near the 32-bit limits. In some languages a comparator written as x[1] - y[1] would overflow there. JavaScript and Python numbers handle it, but in Java or C++ you would compare instead of subtracting.`,
      complexity: 'O(n log n) time, O(n) space for sorting',
    },
    {
      title: 'Last Stone Weight', fn: 'lastStoneWeight', args: ['stones'],
      prompt: 'Each turn, smash the two heaviest stones x ≤ y together: if equal both are destroyed, otherwise a stone of weight y − x remains. Return the weight of the final stone, or 0 if none remain.',
      tests: [[[[2, 7, 4, 1, 8, 1]], 1], [[[1]], 1], [[[2, 2]], 0], [[[10, 4, 2, 10]], 2], [[[3, 7, 2]], 2], [[[]], 0]],
      js: HEAP + String.raw`

function lastStoneWeight(stones) {
  const heap = new Heap((a, b) => a > b); // max-heap
  for (const s of stones) heap.push(s);
  while (heap.size > 1) {
    const y = heap.pop(), x = heap.pop();
    if (y !== x) heap.push(y - x);
  }
  return heap.size ? heap.peek() : 0;
}`,
      py: String.raw`import heapq

def last_stone_weight(stones):
    heap = [-s for s in stones]  # max-heap via negation
    heapq.heapify(heap)
    while len(heap) > 1:
        y = -heapq.heappop(heap)
        x = -heapq.heappop(heap)
        if y != x:
            heapq.heappush(heap, -(y - x))
    return -heap[0] if heap else 0`,
      explain: `Repeatedly needing "the largest remaining items" is exactly what a max-heap is for.

1. Put every stone into a max-heap.
2. Pop the two heaviest. If they differ, push back the difference.
3. When at most one stone remains, return its weight, or 0.

Each round is O(log n), and there are at most n rounds, so O(n log n) overall. Re-sorting the array every round would be O(n² log n).

Python's heapq only provides a min-heap, so negate the values going in and coming out. The JavaScript solution reuses the small heap class with a "greater than" comparator.

Heapify (building a heap from an existing array) is O(n), faster than n separate pushes.

A twist on this problem (Last Stone Weight II, where you choose any two stones) turns out to be a partition DP, the same as Partition Equal Subset Sum minimizing the difference. Small rule changes can switch the whole technique.`,
      complexity: 'O(n log n) time, O(n) space',
    },
    {
      title: 'K Closest Points to Origin', fn: 'kClosest', args: ['points', 'k'],
      prompt: 'Return the k points closest to the origin (0, 0) by Euclidean distance, in any order. The answer is unique.',
      compare: 'unordered',
      tests: [[[[[1, 3], [-2, 2]], 1], [[-2, 2]]], [[[[3, 3], [5, -1], [-2, 4]], 2], [[3, 3], [-2, 4]]], [[[[0, 1], [1, 0]], 2], [[0, 1], [1, 0]]], [[[[1, 1], [10, 10], [-1, -1], [5, 5]], 3], [[1, 1], [-1, -1], [5, 5]]]],
      js: HEAP + String.raw`

function kClosest(points, k) {
  const d = (p) => p[0] * p[0] + p[1] * p[1]; // squared distance is enough
  const heap = new Heap((a, b) => d(a) > d(b)); // max-heap of the k best so far
  for (const p of points) {
    heap.push(p);
    if (heap.size > k) heap.pop(); // drop the farthest
  }
  return heap.a;
}`,
      py: String.raw`import heapq

def k_closest(points, k):
    heap = []  # max-heap by distance (negated)
    for x, y in points:
        heapq.heappush(heap, (-(x * x + y * y), x, y))
        if len(heap) > k:
            heapq.heappop(heap)
    return [[x, y] for _, x, y in heap]`,
      explain: `This is top-k selection with a bounded heap.

Keep a max-heap of size k holding the k closest points seen so far. Its top is the farthest of them, the one that gets evicted next.
1. Push each point.
2. If the heap holds more than k points, pop the top, the farthest.
3. At the end, the heap contains exactly the k closest points.

This is O(n log k), better than sorting at O(n log n) when k is small, and it works on a stream of points that is too large to store.

Squared distance: comparing x² + y² gives the same order as the true distance, because the square root is increasing, so skip the floating-point sqrt.

A max-heap for the k smallest feels backwards at first, but you need quick access to the worst element you are keeping, so you can evict it.

Quickselect on the distances solves it in O(n) on average, the same idea as Kth Largest Element.`,
      complexity: 'O(n log k) time, O(k) space',
    },
  ],
};

export default m;
