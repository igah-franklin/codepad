import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'design',
  title: 'OOP & Class Design',
  description: 'Small object-oriented designs: state, invariants and choosing the right internal structure.',
  challenges: [
    {
      title: 'Moving Average', fn: 'MovingAverage', args: ['size'],
      prompt: 'Given a window size, next(val) adds a value from a stream and returns the average of the last size values (or of all values if fewer have arrived).',
      methods: [{ name: 'next', args: ['val'] }],
      tests: [
        [[['MovingAverage', 'next', 'next', 'next', 'next'], [[3], [1], [10], [3], [5]]], [null, 1, 5.5, 4.666666666666667, 6]],
        [[['MovingAverage', 'next', 'next'], [[1], [4], [7]]], [null, 4, 7]],
      ],
      js: String.raw`class MovingAverage {
  constructor(size) {
    this.size = size;
    this.buf = new Array(size).fill(0); // circular buffer
    this.count = 0;
    this.i = 0;
    this.sum = 0;
  }
  next(val) {
    if (this.count === this.size) this.sum -= this.buf[this.i]; // evict the oldest value
    else this.count++;
    this.buf[this.i] = val;
    this.sum += val;
    this.i = (this.i + 1) % this.size;
    return this.sum / this.count;
  }
}`,
      py: String.raw`class MovingAverage:
    def __init__(self, size):
        self.size = size
        self.buf = [0] * size
        self.count = 0
        self.i = 0
        self.total = 0

    def next(self, val):
        if self.count == self.size:
            self.total -= self.buf[self.i]
        else:
            self.count += 1
        self.buf[self.i] = val
        self.total += val
        self.i = (self.i + 1) % self.size
        return self.total / self.count`,
      explain: `This is a sliding window over a stream: keep a running sum, add the new value, and subtract the value that falls out.

A circular buffer of fixed size stores the window:
- i points at the slot to overwrite next, which is the oldest value once the buffer is full;
- before overwriting, subtract the old value from the sum;
- advance i with % size, so it wraps around.

Each call is O(1), and memory is exactly size slots, however long the stream runs.

Until the window fills up, divide by the number of values seen so far (count), not by size.

A queue (deque) is a simpler alternative: push the new value and pop the oldest when the length exceeds size. A circular buffer is what you would use in embedded systems or audio processing, where memory is fixed.

Watch for floating-point drift: after millions of updates the running sum can accumulate rounding error, so production code sometimes recomputes it periodically.`,
      complexity: 'O(1) per call, O(size) space',
    },
    {
      title: 'Logger Rate Limiter', fn: 'Logger', args: [],
      prompt: 'shouldPrintMessage(timestamp, message) returns true if the message has not been printed in the last 10 seconds (i.e. it was never printed, or last printed at time ≤ timestamp − 10), and records the print when it returns true. Timestamps are non-decreasing.',
      methods: [{ name: 'shouldPrintMessage', args: ['timestamp', 'message'] }],
      tests: [
        [[['Logger', 'shouldPrintMessage', 'shouldPrintMessage', 'shouldPrintMessage', 'shouldPrintMessage', 'shouldPrintMessage', 'shouldPrintMessage'], [[], [1, 'foo'], [2, 'bar'], [3, 'foo'], [8, 'bar'], [10, 'foo'], [11, 'foo']]], [null, true, true, false, false, false, true]],
        [[['Logger', 'shouldPrintMessage', 'shouldPrintMessage', 'shouldPrintMessage'], [[], [0, 'a'], [9, 'a'], [10, 'a']]], [null, true, false, true]],
      ],
      js: String.raw`class Logger {
  constructor() {
    this.next = new Map(); // message -> earliest time it may print again
  }
  shouldPrintMessage(timestamp, message) {
    if (timestamp < (this.next.get(message) ?? -Infinity)) return false;
    this.next.set(message, timestamp + 10);
    return true;
  }
}`,
      py: String.raw`class Logger:
    def __init__(self):
        self.next_ok = {}

    def should_print_message(self, timestamp, message):
        if timestamp < self.next_ok.get(message, float("-inf")):
            return False
        self.next_ok[message] = timestamp + 10
        return True`,
      explain: `For each message, store the earliest time it is allowed to print again.

- If the current timestamp is before that time, suppress the message.
- Otherwise print it and set the next allowed time to timestamp + 10.

Storing "the next allowed time" rather than "the last printed time" makes the check a single comparison, and removes off-by-one confusion. A message printed at 1 may print again at 11, not at 10.

Note that suppressed messages do not reset the timer. Only actual prints update it, which matches the test (foo at 3 and at 10 are suppressed, then foo at 11 prints).

Memory follow-up: the map grows with every distinct message ever seen. Since timestamps increase, you can periodically evict entries whose next-allowed time has passed, or keep a queue of (time, message) pairs for the last 10 seconds and clean up as you go.

This is a simple per-key rate limiter. Real systems use token buckets or sliding-window counters per user or API key, but the shape is the same.`,
      complexity: 'O(1) per call, O(distinct messages) space',
    },
    {
      title: 'Parking System', fn: 'ParkingSystem', args: ['big', 'medium', 'small'],
      prompt: 'A parking lot has a fixed number of big, medium and small spaces. addCar(carType) (1 = big, 2 = medium, 3 = small) parks a car in a space of exactly its size if one is free, returning true; otherwise it returns false.',
      methods: [{ name: 'addCar', args: ['carType'] }],
      tests: [
        [[['ParkingSystem', 'addCar', 'addCar', 'addCar', 'addCar'], [[1, 1, 0], [1], [2], [3], [1]]], [null, true, true, false, false]],
        [[['ParkingSystem', 'addCar', 'addCar', 'addCar'], [[0, 0, 2], [3], [3], [3]]], [null, true, true, false]],
      ],
      js: String.raw`class ParkingSystem {
  constructor(big, medium, small) {
    this.free = [0, big, medium, small]; // index by carType
  }
  addCar(carType) {
    if (this.free[carType] === 0) return false;
    this.free[carType]--;
    return true;
  }
}`,
      py: String.raw`class ParkingSystem:
    def __init__(self, big, medium, small):
        self.free = [0, big, medium, small]

    def add_car(self, car_type):
        if self.free[car_type] == 0:
            return False
        self.free[car_type] -= 1
        return True`,
      explain: `The smallest possible design: an array of counters indexed by car type.

Putting a dummy 0 at index 0 lets you index directly by carType (1 to 3) without subtracting 1. It is a small trick that removes a common off-by-one bug.

addCar checks availability, then decrements.

Why include a problem this simple? Object-oriented interview rounds often start here and then grow:
- "Cars can leave": add removeCar, which increments the counter.
- "Small cars may use bigger spaces": try the exact size first, then larger ones.
- "Track which spot each car is in": store an ID-to-spot map and free lists of spot numbers.
- "Thread safety": two cars arriving at once need atomic check-and-decrement (a lock or a compare-and-swap).

Being ready to evolve a simple design cleanly, with clear state, small methods and stated invariants, is what such rounds actually test.`,
      complexity: 'O(1) per call, O(1) space',
    },
    {
      title: 'Circular Queue', fn: 'MyCircularQueue', args: ['k'],
      prompt: 'Implement a fixed-capacity circular queue: enqueue(value) and dequeue() return true/false for success; front() and rear() return the first/last item or -1 if empty; isEmpty() and isFull().',
      methods: [{ name: 'enqueue', args: ['value'] }, { name: 'dequeue', args: [] }, { name: 'front', args: [] }, { name: 'rear', args: [] }, { name: 'isEmpty', args: [] }, { name: 'isFull', args: [] }],
      tests: [
        [[['MyCircularQueue', 'enqueue', 'enqueue', 'enqueue', 'enqueue', 'rear', 'isFull', 'dequeue', 'enqueue', 'rear'], [[3], [1], [2], [3], [4], [], [], [], [4], []]], [null, true, true, true, false, 3, true, true, true, 4]],
        [[['MyCircularQueue', 'front', 'rear', 'isEmpty', 'dequeue', 'enqueue', 'front', 'rear'], [[2], [], [], [], [], [9], [], []]], [null, -1, -1, true, false, true, 9, 9]],
      ],
      js: String.raw`class MyCircularQueue {
  constructor(k) {
    this.buf = new Array(k);
    this.head = 0; // index of the front item
    this.size = 0;
  }
  enqueue(value) {
    if (this.isFull()) return false;
    this.buf[(this.head + this.size) % this.buf.length] = value;
    this.size++;
    return true;
  }
  dequeue() {
    if (this.isEmpty()) return false;
    this.head = (this.head + 1) % this.buf.length;
    this.size--;
    return true;
  }
  front() {
    return this.isEmpty() ? -1 : this.buf[this.head];
  }
  rear() {
    return this.isEmpty() ? -1 : this.buf[(this.head + this.size - 1) % this.buf.length];
  }
  isEmpty() {
    return this.size === 0;
  }
  isFull() {
    return this.size === this.buf.length;
  }
}`,
      py: String.raw`class MyCircularQueue:
    def __init__(self, k):
        self.buf = [0] * k
        self.head = 0
        self.size = 0

    def enqueue(self, value):
        if self.is_full():
            return False
        self.buf[(self.head + self.size) % len(self.buf)] = value
        self.size += 1
        return True

    def dequeue(self):
        if self.is_empty():
            return False
        self.head = (self.head + 1) % len(self.buf)
        self.size -= 1
        return True

    def front(self):
        return -1 if self.is_empty() else self.buf[self.head]

    def rear(self):
        return -1 if self.is_empty() else self.buf[(self.head + self.size - 1) % len(self.buf)]

    def is_empty(self):
        return self.size == 0

    def is_full(self):
        return self.size == len(self.buf)`,
      explain: `This is a ring buffer: a fixed array whose ends wrap around.

State: head (index of the front item) and size (the number of items). Every position is derived from those two:
- the next free slot: (head + size) % capacity;
- the rear item: (head + size - 1) % capacity.

Operations:
- enqueue: write at the tail slot and increase size.
- dequeue: move head forward (wrapping) and decrease size. The old value is not erased, because it is outside the logical queue.

Why store size? With only head and tail indices, an empty queue and a full queue both have head == tail. The common fixes are storing a count (as here) or always leaving one slot empty. A count is the clearest.

Every operation is O(1), with no shifting, unlike array.shift().

Ring buffers are used in keyboard input buffers, network packet queues, audio streaming, logging (keep the last N entries), and lock-free producer/consumer queues.`,
      complexity: 'O(1) per operation, O(k) space',
    },
    {
      title: 'Online Stock Span', fn: 'StockSpanner', args: [],
      prompt: 'next(price) receives daily prices and returns today\'s span: the number of consecutive days, ending today and going backward, on which the price was ≤ today\'s price.',
      methods: [{ name: 'next', args: ['price'] }],
      tests: [
        [[['StockSpanner', 'next', 'next', 'next', 'next', 'next', 'next', 'next'], [[], [100], [80], [60], [70], [60], [75], [85]]], [null, 1, 1, 1, 2, 1, 4, 6]],
        [[['StockSpanner', 'next', 'next', 'next'], [[], [10], [10], [10]]], [null, 1, 2, 3]],
      ],
      js: String.raw`class StockSpanner {
  constructor() {
    this.stack = []; // [price, span] with strictly decreasing prices
  }
  next(price) {
    let span = 1;
    while (this.stack.length && this.stack[this.stack.length - 1][0] <= price) {
      span += this.stack.pop()[1]; // absorb the spans of smaller-or-equal days
    }
    this.stack.push([price, span]);
    return span;
  }
}`,
      py: String.raw`class StockSpanner:
    def __init__(self):
        self.stack = []

    def next(self, price):
        span = 1
        while self.stack and self.stack[-1][0] <= price:
            span += self.stack.pop()[1]
        self.stack.append((price, span))
        return span`,
      explain: `This is a monotonic stack in streaming form: the "previous greater element" problem, arriving one day at a time.

The stack holds [price, span] pairs with strictly decreasing prices. When a new price arrives:
1. Pop every entry with price ≤ today's. Those days, plus all the days their spans already covered, fall inside today's span, so add their spans.
2. Push [today's price, total span].

Why is collapsing safe? Once a higher (or equal) price arrives, the days it absorbed can never be the stopping point for any future day: a future day would stop at today first, or go past today and past them too. So their individual entries are no longer needed.

Trace [100, 80, 60, 70, 60, 75, 85]: on 75, the stack pops 60 (span 1) and 70 (span 2), so 75's span is 1 + 1 + 2 = 4.

Each price is pushed and popped at most once, so each call is O(1) amortized.

It is the same pattern as Daily Temperatures, in an online, class-based setting.`,
      complexity: 'O(1) amortized per call, O(n) space',
    },
    {
      title: 'Snapshot Array', fn: 'SnapshotArray', args: ['length'],
      prompt: 'An array of the given length starts filled with 0. set(index, val) updates a value; snap() takes a snapshot and returns its id (0, 1, 2, ...); get(index, snapId) returns the value at that index when that snapshot was taken.',
      methods: [{ name: 'set', args: ['index', 'val'] }, { name: 'snap', args: [] }, { name: 'get', args: ['index', 'snapId'] }],
      tests: [
        [[['SnapshotArray', 'set', 'snap', 'set', 'get'], [[3], [0, 5], [], [0, 6], [0, 0]]], [null, null, 0, null, 5]],
        [[['SnapshotArray', 'snap', 'snap', 'set', 'set', 'snap', 'get', 'get', 'get'], [[2], [], [], [1, 4], [1, 7], [], [1, 0], [1, 2], [0, 2]]], [null, 0, 1, null, null, 2, 0, 7, 0]],
      ],
      js: String.raw`class SnapshotArray {
  constructor(length) {
    this.history = Array.from({ length }, () => [[-1, 0]]); // per index: [snapId, value] sorted by snapId
    this.snapId = 0;
  }
  set(index, val) {
    const h = this.history[index];
    if (h[h.length - 1][0] === this.snapId) h[h.length - 1][1] = val; // overwrite within the same snapshot
    else h.push([this.snapId, val]);
  }
  snap() {
    return this.snapId++;
  }
  get(index, snapId) {
    const h = this.history[index];
    // last entry with id <= snapId (changes made during snapshot s are visible in snap s)
    let lo = 0, hi = h.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (h[mid][0] <= snapId) lo = mid;
      else hi = mid - 1;
    }
    return h[lo][1];
  }
}`,
      py: String.raw`from bisect import bisect_right

class SnapshotArray:
    def __init__(self, length):
        self.ids = [[-1] for _ in range(length)]
        self.vals = [[0] for _ in range(length)]
        self.snap_id = 0

    def set(self, index, val):
        if self.ids[index][-1] == self.snap_id:
            self.vals[index][-1] = val
        else:
            self.ids[index].append(self.snap_id)
            self.vals[index].append(val)

    def snap(self):
        self.snap_id += 1
        return self.snap_id - 1

    def get(self, index, snap_id):
        i = bisect_right(self.ids[index], snap_id) - 1
        return self.vals[index][i]`,
      explain: `Copying the whole array on every snap() is O(length) per snapshot, which is far too slow. Record only the changes.

For each index, keep a history list of (snapId, value), sorted by snapId:
- set: record the value under the current snapId. If a set already happened during this same snapshot period, overwrite it instead of appending.
- snap: increment a counter and return the old value. That is O(1), with no copying.
- get(index, s): binary search that index's history for the last entry with snapId ≤ s. That is the value as of snapshot s.

Semantics: changes made after snap() returns s - 1 and before the next snap() belong to snapshot s. A seed entry (-1, 0) represents the initial zeros.

Cost: O(1) for set and snap, and O(log changes) for get. Memory is proportional to the number of changes, not snapshots × length.

This is the TimeMap pattern from Hard Design, applied per index. Copy-on-write, version control systems and database MVCC all use the same idea: store deltas, and binary search them by version.`,
      complexity: 'O(1) set/snap, O(log h) get; O(length + total sets) space',
    },
    {
      title: 'Underground System', fn: 'UndergroundSystem', args: [],
      prompt: 'checkIn(id, station, t) and checkOut(id, station, t) record trips. getAverageTime(start, end) returns the average travel time of all completed trips directly from start to end.',
      methods: [{ name: 'checkIn', args: ['id', 'stationName', 't'] }, { name: 'checkOut', args: ['id', 'stationName', 't'] }, { name: 'getAverageTime', args: ['startStation', 'endStation'] }],
      tests: [
        [[['UndergroundSystem', 'checkIn', 'checkIn', 'checkIn', 'checkOut', 'checkOut', 'checkOut', 'getAverageTime', 'getAverageTime', 'checkIn', 'getAverageTime', 'checkOut', 'getAverageTime'],
          [[], [45, 'Leyton', 3], [32, 'Paradise', 8], [27, 'Leyton', 10], [45, 'Waterloo', 15], [27, 'Waterloo', 20], [32, 'Cambridge', 22], ['Paradise', 'Cambridge'], ['Leyton', 'Waterloo'], [10, 'Leyton', 24], ['Leyton', 'Waterloo'], [10, 'Waterloo', 38], ['Leyton', 'Waterloo']]],
          [null, null, null, null, null, null, null, 14, 11, null, 11, null, 12]],
      ],
      js: String.raw`class UndergroundSystem {
  constructor() {
    this.active = new Map(); // id -> [station, time]
    this.stats = new Map(); // "start->end" -> [totalTime, trips]
  }
  checkIn(id, stationName, t) {
    this.active.set(id, [stationName, t]);
  }
  checkOut(id, stationName, t) {
    const [start, t0] = this.active.get(id);
    this.active.delete(id);
    const key = start + '->' + stationName;
    const s = this.stats.get(key) || [0, 0];
    this.stats.set(key, [s[0] + (t - t0), s[1] + 1]);
  }
  getAverageTime(startStation, endStation) {
    const [total, trips] = this.stats.get(startStation + '->' + endStation);
    return total / trips;
  }
}`,
      py: String.raw`class UndergroundSystem:
    def __init__(self):
        self.active = {}
        self.stats = {}

    def check_in(self, id, station_name, t):
        self.active[id] = (station_name, t)

    def check_out(self, id, station_name, t):
        start, t0 = self.active.pop(id)
        key = (start, station_name)
        total, trips = self.stats.get(key, (0, 0))
        self.stats[key] = (total + t - t0, trips + 1)

    def get_average_time(self, start_station, end_station):
        total, trips = self.stats[(start_station, end_station)]
        return total / trips`,
      explain: `Two maps, each with a single clear responsibility:
1. active: a passenger id maps to (station, time) for trips in progress.
2. stats: a (start, end) pair maps to (total time, number of trips) for completed trips.

checkOut finishes a trip: look up the check-in, remove it, and add the duration to that route's totals.

Store sums and counts, not lists of durations. The average is then O(1) to compute, and memory grows with the number of routes rather than the number of trips. This "keep aggregates, not raw data" idea is how analytics systems stay fast.

Composite keys: Python tuples work directly as dictionary keys. In JavaScript, join the strings with a separator that cannot appear in station names, or use nested maps.

Routes are directional: A to B and B to A are tracked separately.

Questions to ask the interviewer: can a passenger check in twice without checking out? (That is invalid input here.) What should happen when there are no trips on a route? (The problem guarantees there is at least one.) Clarifying edge cases is part of design rounds.`,
      complexity: 'O(1) per operation, O(passengers + routes) space',
    },
    {
      title: 'Leaderboard', fn: 'Leaderboard', args: [],
      prompt: 'addScore(playerId, score) adds score to the player\'s total (creating the player if needed); top(K) returns the sum of the K highest totals; reset(playerId) sets that player\'s total back to 0 (removing them).',
      methods: [{ name: 'addScore', args: ['playerId', 'score'] }, { name: 'top', args: ['K'] }, { name: 'reset', args: ['playerId'] }],
      tests: [
        [[['Leaderboard', 'addScore', 'addScore', 'addScore', 'addScore', 'addScore', 'top', 'reset', 'reset', 'addScore', 'top'], [[], [1, 73], [2, 56], [3, 39], [4, 51], [5, 4], [1], [1], [2], [2, 51], [3]]], [null, null, null, null, null, null, 73, null, null, null, 141]],
        [[['Leaderboard', 'addScore', 'addScore', 'top', 'addScore', 'top'], [[], [1, 10], [1, 5], [1], [2, 20], [2]]], [null, null, null, 15, null, 35]],
      ],
      js: String.raw`class Leaderboard {
  constructor() {
    this.scores = new Map();
  }
  addScore(playerId, score) {
    this.scores.set(playerId, (this.scores.get(playerId) || 0) + score);
  }
  top(K) {
    // sorting the totals: O(n log n); a size-K min-heap would give O(n log K)
    const totals = [...this.scores.values()].sort((a, b) => b - a);
    let sum = 0;
    for (let i = 0; i < K && i < totals.length; i++) sum += totals[i];
    return sum;
  }
  reset(playerId) {
    this.scores.delete(playerId);
  }
}`,
      py: String.raw`import heapq

class Leaderboard:
    def __init__(self):
        self.scores = {}

    def add_score(self, player_id, score):
        self.scores[player_id] = self.scores.get(player_id, 0) + score

    def top(self, K):
        return sum(heapq.nlargest(K, self.scores.values()))

    def reset(self, player_id):
        self.scores.pop(player_id, None)`,
      explain: `The core is a hash map from player to total score, which makes addScore and reset O(1).

top(K) is the interesting operation, and there are several options to compare out loud:
- Sort all the totals and sum the first K: O(n log n) per query, and simple.
- Use a size-K heap (Python's heapq.nlargest): O(n log K), better when K is much smaller than n.
- Use quickselect: O(n) on average.
- Keep an ordered structure (a balanced BST or sorted container from score to count) updated on every addScore and reset: top becomes O(K), but updates cost O(log n).

Which is best depends on the mix of operations. If top is called constantly, maintain the ordered structure. If scores change all the time and top is rare, compute it on demand.

Asking "how often is each operation called?" before choosing a design is exactly what interviewers want to hear.

reset removes the player entirely, which matches "back to 0" because players at 0 should not occupy a top slot.`,
      complexity: 'O(1) addScore/reset, O(n log K) top with a heap',
    },
    {
      title: 'Ordered Stream', fn: 'OrderedStream', args: ['n'],
      prompt: 'There are n (id, value) pairs, ids 1..n, arriving in random order. insert(idKey, value) stores a pair and returns the largest possible chunk of values that can now be emitted in id order, starting from the next id not yet emitted (possibly an empty list).',
      methods: [{ name: 'insert', args: ['idKey', 'value'] }],
      tests: [
        [[['OrderedStream', 'insert', 'insert', 'insert', 'insert', 'insert'], [[5], [3, 'ccccc'], [1, 'aaaaa'], [2, 'bbbbb'], [5, 'eeeee'], [4, 'ddddd']]], [null, [], ['aaaaa'], ['bbbbb', 'ccccc'], [], ['ddddd', 'eeeee']]],
        [[['OrderedStream', 'insert', 'insert'], [[2], [1, 'x'], [2, 'y']]], [null, ['x'], ['y']]],
      ],
      js: String.raw`class OrderedStream {
  constructor(n) {
    this.vals = new Array(n + 1);
    this.ptr = 1; // next id to emit
  }
  insert(idKey, value) {
    this.vals[idKey] = value;
    const out = [];
    while (this.ptr < this.vals.length && this.vals[this.ptr] !== undefined) out.push(this.vals[this.ptr++]);
    return out;
  }
}`,
      py: String.raw`class OrderedStream:
    def __init__(self, n):
        self.vals = [None] * (n + 1)
        self.ptr = 1

    def insert(self, id_key, value):
        self.vals[id_key] = value
        out = []
        while self.ptr < len(self.vals) and self.vals[self.ptr] is not None:
            out.append(self.vals[self.ptr])
            self.ptr += 1
        return out`,
      explain: `This models how TCP reassembles out-of-order packets, or how a video player buffers out-of-order chunks.

- Store each value at its id in an array.
- Keep ptr, the next id that has not been emitted yet.
- After each insert, emit values from ptr onwards while they are present, then stop at the first gap.

If the inserted id is not ptr, nothing new is contiguous yet, so return [].

Amortized cost: each value is emitted exactly once, so the total work over all n inserts is O(n), even though one insert can emit many values.

The 1-based ids map directly to indices by allocating n + 1 slots and ignoring index 0, the same trick as Parking System.

Real-world versions add a window limit (only buffer the next W ids) and timeouts for missing pieces. That is where sliding-window protocols come from.`,
      complexity: 'O(1) amortized per insert, O(n) space',
    },
    {
      title: 'Simple Bank', fn: 'Bank', args: ['balance'],
      prompt: 'Accounts are numbered 1..n with initial balances given by the array balance. transfer(a, b, money), deposit(a, money) and withdraw(a, money) each return true if the transaction is valid (accounts exist and there are enough funds) and apply it; otherwise return false and change nothing.',
      methods: [{ name: 'transfer', args: ['account1', 'account2', 'money'] }, { name: 'deposit', args: ['account', 'money'] }, { name: 'withdraw', args: ['account', 'money'] }],
      tests: [
        [[['Bank', 'withdraw', 'transfer', 'deposit', 'transfer', 'withdraw'], [[[10, 100, 20, 50, 30]], [3, 10], [5, 1, 20], [5, 20], [3, 4, 15], [10, 50]]], [null, true, true, true, false, false]],
        [[['Bank', 'transfer', 'withdraw', 'deposit', 'withdraw'], [[[5]], [1, 1, 5], [1, 6], [2, 1], [1, 5]]], [null, true, false, false, true]],
      ],
      js: String.raw`class Bank {
  constructor(balance) {
    this.bal = [0, ...balance]; // 1-indexed accounts
  }
  valid(a) {
    return a >= 1 && a < this.bal.length;
  }
  transfer(account1, account2, money) {
    if (!this.valid(account1) || !this.valid(account2) || this.bal[account1] < money) return false;
    this.bal[account1] -= money;
    this.bal[account2] += money;
    return true;
  }
  deposit(account, money) {
    if (!this.valid(account)) return false;
    this.bal[account] += money;
    return true;
  }
  withdraw(account, money) {
    if (!this.valid(account) || this.bal[account] < money) return false;
    this.bal[account] -= money;
    return true;
  }
}`,
      py: String.raw`class Bank:
    def __init__(self, balance):
        self.bal = [0] + list(balance)

    def _valid(self, a):
        return 1 <= a < len(self.bal)

    def transfer(self, account1, account2, money):
        if not (self._valid(account1) and self._valid(account2)) or self.bal[account1] < money:
            return False
        self.bal[account1] -= money
        self.bal[account2] += money
        return True

    def deposit(self, account, money):
        if not self._valid(account):
            return False
        self.bal[account] += money
        return True

    def withdraw(self, account, money):
        if not self._valid(account) or self.bal[account] < money:
            return False
        self.bal[account] -= money
        return True`,
      explain: `The main principle is: validate everything first, then mutate.

Each operation checks every precondition (the accounts exist, the funds are enough) before changing any balance. If any check fails, return false with the state untouched, so a transaction is all-or-nothing. That is atomicity, the "A" in ACID.

A transfer to the same account (1 to 1) is valid and leaves the balance unchanged: subtract, then add the same amount.

A small shared helper (valid) keeps the rules in one place, so adding a rule such as "account is frozen" means changing one function.

Things to raise in a design interview:
- Money should be stored as integers (cents), never floats, to avoid rounding errors.
- Concurrency: two transfers touching the same accounts need locks, and the locks must be taken in a consistent order (for example, lower account id first) to avoid deadlock.
- Audit trail: real banks append immutable transaction records and derive balances from them, instead of overwriting balances.

The code is easy. These surrounding design decisions are what such questions are really about.`,
      complexity: 'O(1) per operation, O(n) space',
    },
  ],
};

export default m;
