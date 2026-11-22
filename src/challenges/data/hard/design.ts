import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'design',
  title: 'Data Structure Design',
  description: 'Build classes whose operations hit target complexities: caches, tries and clever stacks.',
  challenges: [
    {
      title: 'LRU Cache', fn: 'LRUCache', args: ['capacity'],
      prompt: 'Design a Least Recently Used cache with a fixed capacity. get(key) returns the value or -1. put(key, value) inserts or updates; when over capacity, evict the least recently used key. Both must run in O(1). Using get or put on a key makes it the most recently used.',
      methods: [{ name: 'get', args: ['key'] }, { name: 'put', args: ['key', 'value'] }],
      tests: [
        [[['LRUCache', 'put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get'], [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]], [null, null, null, 1, null, -1, null, -1, 3, 4]],
        [[['LRUCache', 'put', 'get', 'put', 'get', 'get'], [[1], [2, 1], [2], [3, 2], [2], [3]]], [null, null, 1, null, -1, 2]],
        [[['LRUCache', 'put', 'put', 'put', 'get', 'put', 'get', 'get'], [[2], [1, 1], [2, 2], [1, 10], [1], [3, 3], [2], [1]]], [null, null, null, null, 10, null, -1, 10]],
      ],
      js: String.raw`class LRUCache {
  // A JS Map remembers insertion order: the first key is the least recently used.
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const v = this.map.get(key);
    this.map.delete(key); // move to the "most recent" end
    this.map.set(key, v);
    return v;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.cap) this.map.delete(this.map.keys().next().value); // evict oldest
  }
}`,
      py: String.raw`class _Node:
    __slots__ = ("key", "val", "prev", "next")
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    """Hash map + doubly linked list (most recent next to head)."""
    def __init__(self, capacity):
        self.cap = capacity
        self.map = {}
        self.head, self.tail = _Node(), _Node()  # sentinels
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _add_front(self, node):
        node.next, node.prev = self.head.next, self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        node = self.map.get(key)
        if node is None:
            return -1
        self._remove(node)
        self._add_front(node)
        return node.val

    def put(self, key, value):
        if key in self.map:
            self._remove(self.map[key])
        node = _Node(key, value)
        self.map[key] = node
        self._add_front(node)
        if len(self.map) > self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.map[lru.key]`,
      explain: `You need two things in O(1): find a key, and know which key is the oldest. No single structure does both, so combine two.

Classic design (the Python solution): a hash map plus a doubly linked list.
- The map goes from key to list node, for O(1) lookup.
- The list is ordered by recency: most recent at the head, least recent at the tail.
- get: look up the node, unlink it, and move it to the head.
- put: insert or update the node at the head. If over capacity, remove the tail node and delete its key from the map.

The list must be doubly linked so a node can unlink itself in O(1), and each node stores its key so eviction can remove the map entry. Sentinel head and tail nodes remove all the edge cases for empty lists.

JavaScript shortcut: Map preserves insertion order and supports delete in O(1). Deleting and re-inserting a key moves it to the end, and map.keys().next() is the oldest key. That is a perfectly valid LRU, but in an interview you will usually be asked to build the linked-list version.

Python also has collections.OrderedDict with move_to_end and popitem(last=False).

LRU caches are everywhere: CPU caches, databases, CDNs, browser caches and memoization (functools.lru_cache).`,
      complexity: 'O(1) per operation, O(capacity) space',
    },
    {
      title: 'LFU Cache', fn: 'LFUCache', args: ['capacity'],
      prompt: 'Design a Least Frequently Used cache. get(key) returns the value or -1; put(key, value) inserts or updates. When full, evict the key with the lowest use count; break ties by least recently used. Each get or put on a key increases its count. O(1) per operation.',
      methods: [{ name: 'get', args: ['key'] }, { name: 'put', args: ['key', 'value'] }],
      tests: [
        [[['LFUCache', 'put', 'put', 'get', 'put', 'get', 'get', 'put', 'get', 'get', 'get'], [[2], [1, 1], [2, 2], [1], [3, 3], [2], [3], [4, 4], [1], [3], [4]]], [null, null, null, 1, null, -1, 3, null, -1, 3, 4]],
        [[['LFUCache', 'put', 'get'], [[0], [0, 0], [0]]], [null, null, -1]],
        [[['LFUCache', 'put', 'put', 'put', 'put', 'get'], [[2], [3, 1], [2, 1], [2, 2], [4, 4], [2]]], [null, null, null, null, null, 2]],
      ],
      js: String.raw`class LFUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.vals = new Map(); // key -> value
    this.freq = new Map(); // key -> use count
    this.buckets = new Map(); // count -> Map of keys in LRU order (insertion order)
    this.minFreq = 0;
  }
  touch(key) {
    const f = this.freq.get(key);
    this.buckets.get(f).delete(key);
    if (this.buckets.get(f).size === 0) {
      this.buckets.delete(f);
      if (this.minFreq === f) this.minFreq = f + 1;
    }
    this.freq.set(key, f + 1);
    if (!this.buckets.has(f + 1)) this.buckets.set(f + 1, new Map());
    this.buckets.get(f + 1).set(key, true);
  }
  get(key) {
    if (!this.vals.has(key)) return -1;
    this.touch(key);
    return this.vals.get(key);
  }
  put(key, value) {
    if (this.cap === 0) return;
    if (this.vals.has(key)) {
      this.vals.set(key, value);
      this.touch(key);
      return;
    }
    if (this.vals.size >= this.cap) {
      const bucket = this.buckets.get(this.minFreq);
      const evict = bucket.keys().next().value; // least recent among the least frequent
      bucket.delete(evict);
      if (bucket.size === 0) this.buckets.delete(this.minFreq);
      this.vals.delete(evict);
      this.freq.delete(evict);
    }
    this.vals.set(key, value);
    this.freq.set(key, 1);
    if (!this.buckets.has(1)) this.buckets.set(1, new Map());
    this.buckets.get(1).set(key, true);
    this.minFreq = 1;
  }
}`,
      py: String.raw`from collections import OrderedDict, defaultdict

class LFUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.vals = {}
        self.freq = {}
        self.buckets = defaultdict(OrderedDict)  # count -> keys in LRU order
        self.min_freq = 0

    def _touch(self, key):
        f = self.freq[key]
        del self.buckets[f][key]
        if not self.buckets[f]:
            del self.buckets[f]
            if self.min_freq == f:
                self.min_freq = f + 1
        self.freq[key] = f + 1
        self.buckets[f + 1][key] = True

    def get(self, key):
        if key not in self.vals:
            return -1
        self._touch(key)
        return self.vals[key]

    def put(self, key, value):
        if self.cap == 0:
            return
        if key in self.vals:
            self.vals[key] = value
            self._touch(key)
            return
        if len(self.vals) >= self.cap:
            evict, _ = self.buckets[self.min_freq].popitem(last=False)
            if not self.buckets[self.min_freq]:
                del self.buckets[self.min_freq]
            del self.vals[evict]
            del self.freq[evict]
        self.vals[key] = value
        self.freq[key] = 1
        self.buckets[1][key] = True
        self.min_freq = 1`,
      explain: `This is LRU's harder sibling: evict by usage count first, then by recency.

Data:
- vals: key to value.
- freq: key to use count.
- buckets: count to an ordered set of keys with that count, in LRU order (oldest first).
- minFreq: the smallest count currently present.

touch(key), called on every get and update:
1. Remove the key from bucket f.
2. If that bucket is now empty and f was minFreq, the new minimum is f + 1. The touched key just moved there, so that is guaranteed to be right.
3. Add the key to bucket f + 1, at the most-recent end.

put of a new key when full: evict the oldest key in buckets[minFreq]. Then insert the new key with count 1, and set minFreq = 1, since a brand-new key always has the lowest count.

Every step is O(1): hash lookups plus insertion-ordered maps (JavaScript Map, Python OrderedDict) acting as per-count LRU lists.

Why not a heap keyed by (count, time)? That gives O(log n) per operation. The bucket design meets O(1) because counts only ever increase by exactly 1, so minFreq can be maintained without searching.

Capacity 0 is an edge case: nothing can ever be stored.`,
      complexity: 'O(1) per operation, O(capacity) space',
    },
    {
      title: 'Implement a Trie', fn: 'Trie', args: [],
      prompt: 'Implement a prefix tree with insert(word), search(word) (true if the exact word was inserted) and startsWith(prefix) (true if any inserted word starts with prefix).',
      methods: [{ name: 'insert', args: ['word'] }, { name: 'search', args: ['word'] }, { name: 'startsWith', args: ['prefix'] }],
      tests: [
        [[['Trie', 'insert', 'search', 'search', 'startsWith', 'insert', 'search'], [[], ['apple'], ['apple'], ['app'], ['app'], ['app'], ['app']]], [null, null, true, false, true, null, true]],
        [[['Trie', 'insert', 'insert', 'search', 'startsWith', 'startsWith', 'search'], [[], ['car'], ['cart'], ['ca'], ['ca'], ['cb'], ['cart']]], [null, null, null, false, true, false, true]],
        [[['Trie', 'startsWith', 'search'], [[], [''], ['']]], [null, true, false]],
      ],
      js: String.raw`class Trie {
  constructor() {
    this.root = { children: {}, end: false };
  }
  insert(word) {
    let node = this.root;
    for (const c of word) {
      if (!node.children[c]) node.children[c] = { children: {}, end: false };
      node = node.children[c];
    }
    node.end = true;
  }
  walk(s) {
    let node = this.root;
    for (const c of s) {
      node = node.children[c];
      if (!node) return null;
    }
    return node;
  }
  search(word) {
    const node = this.walk(word);
    return !!node && node.end;
  }
  startsWith(prefix) {
    return this.walk(prefix) !== null;
  }
}`,
      py: String.raw`class Trie:
    def __init__(self):
        self.root = {}

    def insert(self, word):
        node = self.root
        for c in word:
            node = node.setdefault(c, {})
        node["$"] = True  # end-of-word marker

    def _walk(self, s):
        node = self.root
        for c in s:
            if c not in node:
                return None
            node = node[c]
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and "$" in node

    def starts_with(self, prefix):
        return self._walk(prefix) is not None`,
      explain: `A trie stores strings by sharing their prefixes. Each edge is a character, and each node represents the prefix spelled on the way from the root.

Operations, all O(L) for a string of length L, however many words are stored:
- insert: walk down, creating missing children, then mark the last node as the end of a word.
- search: walk down. The word exists only if every character is there and the final node is marked as an end. "app" is not a word until it is inserted, even though "apple" passes through it.
- startsWith: just walk down. Reaching the end means some word continues from there.

The shared helper walk(s) returns the node for s, or null, which keeps both queries to one line each.

Node representation trade-offs:
- a map or dictionary of children: flexible and memory-efficient for sparse alphabets;
- a fixed array of 26 children: faster, but uses more memory per node.

Tries power autocomplete, spell checkers, IP routing tables (longest prefix match), word games (Word Search II), and the "*" wildcard search in the last challenge of this module.

Edge case: the empty prefix matches everything (the root), but the empty string is not a word unless it was inserted.`,
      complexity: 'O(L) per operation, O(total characters) space',
    },
    {
      title: 'Time-Based Key-Value Store', fn: 'TimeMap', args: [],
      prompt: 'set(key, value, timestamp) stores a value at a time; timestamps for each key are strictly increasing. get(key, timestamp) returns the value with the largest timestamp ≤ the given one, or "" if none.',
      methods: [{ name: 'set', args: ['key', 'value', 'timestamp'] }, { name: 'get', args: ['key', 'timestamp'] }],
      tests: [
        [[['TimeMap', 'set', 'get', 'get', 'set', 'get', 'get'], [[], ['foo', 'bar', 1], ['foo', 1], ['foo', 3], ['foo', 'bar2', 4], ['foo', 4], ['foo', 5]]], [null, null, 'bar', 'bar', null, 'bar2', 'bar2']],
        [[['TimeMap', 'set', 'set', 'get', 'get', 'get', 'get'], [[], ['love', 'high', 10], ['love', 'low', 20], ['love', 5], ['love', 10], ['love', 15], ['love', 25]]], [null, null, null, '', 'high', 'high', 'low']],
        [[['TimeMap', 'get'], [[], ['missing', 1]]], [null, '']],
      ],
      js: String.raw`class TimeMap {
  constructor() {
    this.store = new Map(); // key -> [[timestamp, value], ...] sorted by timestamp
  }
  set(key, value, timestamp) {
    if (!this.store.has(key)) this.store.set(key, []);
    this.store.get(key).push([timestamp, value]); // timestamps arrive increasing
  }
  get(key, timestamp) {
    const list = this.store.get(key);
    if (!list) return '';
    // last index with time <= timestamp
    let lo = 0, hi = list.length - 1, ans = '';
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (list[mid][0] <= timestamp) {
        ans = list[mid][1];
        lo = mid + 1;
      } else hi = mid - 1;
    }
    return ans;
  }
}`,
      py: String.raw`from bisect import bisect_right

class TimeMap:
    def __init__(self):
        self.times = {}
        self.values = {}

    def set(self, key, value, timestamp):
        self.times.setdefault(key, []).append(timestamp)
        self.values.setdefault(key, []).append(value)

    def get(self, key, timestamp):
        ts = self.times.get(key)
        if not ts:
            return ""
        i = bisect_right(ts, timestamp)
        return self.values[key][i - 1] if i else ""`,
      explain: `Each key keeps its history as a list of (timestamp, value) pairs. Timestamps arrive in increasing order, so appending keeps each list sorted for free.

- set: append to the key's list in O(1).
- get: binary search for the last entry with timestamp at most the requested time, in O(log n).

The search is the "last index where the condition holds" form from the Binary Search module:
- If list[mid] is at or before the time, it is a candidate. Record it and look right for a later one.
- Otherwise look left.

Python's bisect_right(ts, t) returns the first index whose timestamp is greater than t, so index - 1 is the answer, or there is none if the result is 0.

Using the given guarantee (timestamps increase) is what avoids a sorted-map structure. Without it you would need a balanced BST or a skip list.

This "versioned value" structure is the core of time-series databases, multi-version concurrency control (MVCC) in databases, and git-like history.`,
      complexity: 'O(1) set, O(log n) get; O(total entries) space',
    },
    {
      title: 'Queue Using Stacks', fn: 'MyQueue', args: [],
      prompt: 'Implement a FIFO queue using only two stacks (push to top, pop from top, peek, size). Support push(x), pop(), peek() and empty(), with amortized O(1) per operation.',
      methods: [{ name: 'push', args: ['x'] }, { name: 'pop', args: [] }, { name: 'peek', args: [] }, { name: 'empty', args: [] }],
      tests: [
        [[['MyQueue', 'push', 'push', 'peek', 'pop', 'empty'], [[], [1], [2], [], [], []]], [null, null, null, 1, 1, false]],
        [[['MyQueue', 'push', 'push', 'pop', 'push', 'pop', 'pop', 'empty'], [[], [1], [2], [], [3], [], [], []]], [null, null, null, 1, null, 2, 3, true]],
        [[['MyQueue', 'empty'], [[]]], [null, true]],
      ],
      js: String.raw`class MyQueue {
  constructor() {
    this.inbox = []; // receives pushes
    this.outbox = []; // serves pops in FIFO order
  }
  push(x) {
    this.inbox.push(x);
  }
  shift() {
    // refill only when outbox is empty: reverses inbox into FIFO order
    if (this.outbox.length === 0) while (this.inbox.length) this.outbox.push(this.inbox.pop());
  }
  pop() {
    this.shift();
    return this.outbox.pop();
  }
  peek() {
    this.shift();
    return this.outbox[this.outbox.length - 1];
  }
  empty() {
    return this.inbox.length === 0 && this.outbox.length === 0;
  }
}`,
      py: String.raw`class MyQueue:
    def __init__(self):
        self.inbox = []
        self.outbox = []

    def push(self, x):
        self.inbox.append(x)

    def _shift(self):
        if not self.outbox:
            while self.inbox:
                self.outbox.append(self.inbox.pop())

    def pop(self):
        self._shift()
        return self.outbox.pop()

    def peek(self):
        self._shift()
        return self.outbox[-1]

    def empty(self):
        return not self.inbox and not self.outbox`,
      explain: `Pouring one stack into another reverses its order. Reversing LIFO order once gives FIFO order.

Use two stacks:
- inbox: every push goes here.
- outbox: pops and peeks come from here.

When outbox is empty and you need the front element, move everything from inbox to outbox. The oldest element ends up on top of outbox.

Only refill when outbox is empty. If you moved items while outbox still had elements, newer items would sit on top of older ones and break the FIFO order.

Amortized O(1): each element is pushed onto inbox once, moved to outbox once, and popped once, so 3 operations per element in total. A single pop might move n elements, but that cost is spread over the n pushes that came before it.

Amortized analysis is the standard way to justify structures like dynamic arrays (which double their capacity), and this queue. Interviewers like asking "why is it O(1) if one pop can be O(n)?".

The reverse problem, a stack built from queues, rotates the queue after each push.`,
      complexity: 'Amortized O(1) per operation, O(n) space',
    },
    {
      title: 'Design a HashMap', fn: 'MyHashMap', args: [],
      prompt: 'Implement a hash map for integer keys without using built-in hash tables: put(key, value), get(key) (-1 if absent) and remove(key).',
      methods: [{ name: 'put', args: ['key', 'value'] }, { name: 'get', args: ['key'] }, { name: 'remove', args: ['key'] }],
      tests: [
        [[['MyHashMap', 'put', 'put', 'get', 'get', 'put', 'get', 'remove', 'get'], [[], [1, 1], [2, 2], [1], [3], [2, 1], [2], [2], [2]]], [null, null, null, 1, -1, null, 1, null, -1]],
        [[['MyHashMap', 'put', 'put', 'get', 'remove', 'get', 'get'], [[], [7, 70], [1038, 99], [7], [7], [7], [1038]]], [null, null, null, 70, null, -1, 99]],
      ],
      js: String.raw`class MyHashMap {
  constructor() {
    this.size = 1031; // a prime number of buckets spreads keys evenly
    this.buckets = Array.from({ length: this.size }, () => []); // separate chaining
  }
  bucket(key) {
    return this.buckets[key % this.size];
  }
  put(key, value) {
    const b = this.bucket(key);
    for (const pair of b) if (pair[0] === key) { pair[1] = value; return; }
    b.push([key, value]);
  }
  get(key) {
    for (const [k, v] of this.bucket(key)) if (k === key) return v;
    return -1;
  }
  remove(key) {
    const b = this.bucket(key);
    const i = b.findIndex((p) => p[0] === key);
    if (i >= 0) b.splice(i, 1);
  }
}`,
      py: String.raw`class MyHashMap:
    def __init__(self):
        self.size = 1031
        self.buckets = [[] for _ in range(self.size)]

    def _bucket(self, key):
        return self.buckets[key % self.size]

    def put(self, key, value):
        b = self._bucket(key)
        for pair in b:
            if pair[0] == key:
                pair[1] = value
                return
        b.append([key, value])

    def get(self, key):
        for k, v in self._bucket(key):
            if k == key:
                return v
        return -1

    def remove(self, key):
        b = self._bucket(key)
        for i, (k, _) in enumerate(b):
            if k == key:
                b.pop(i)
                return`,
      explain: `Build what every Map and dict is under the hood: an array of buckets plus a hash function.

1. Hash: bucket = key % size, which turns any key into an array index.
2. Collisions: different keys can land in the same bucket. Separate chaining stores a small list of (key, value) pairs in each bucket.
3. Each operation scans only its own bucket.

Choosing the size: a prime number like 1031 spreads keys more evenly when they share patterns (for example, all even numbers). The second test uses keys 7 and 1038, which land in the same bucket (1038 % 1031 = 7), to show that colliding keys still work, including removing one without disturbing the other.

Performance depends on the load factor, elements ÷ buckets. Real hash maps resize (usually doubling) when it passes about 0.75, and rehash every key, keeping the average bucket length constant and operations O(1) on average.

Open addressing is the main alternative: on a collision, probe for the next free slot in the array itself. It is more cache-friendly, but deletion needs care (tombstones). Python's dict uses open addressing.

Knowing these internals explains why hash maps have O(n) worst cases, why keys must be immutable, and why iteration order can look random.`,
      complexity: 'O(1) average per operation (O(n/size) per bucket scan), O(size + n) space',
    },
    {
      title: 'Browser History', fn: 'BrowserHistory', args: ['homepage'],
      prompt: 'Simulate a browser tab: visit(url) goes to url and clears forward history; back(steps) moves back up to steps pages and returns the current url; forward(steps) moves forward up to steps pages and returns the current url.',
      methods: [{ name: 'visit', args: ['url'] }, { name: 'back', args: ['steps'] }, { name: 'forward', args: ['steps'] }],
      tests: [
        [[['BrowserHistory', 'visit', 'visit', 'visit', 'back', 'back', 'forward', 'visit', 'forward', 'back', 'back'], [['leetcode.com'], ['google.com'], ['facebook.com'], ['youtube.com'], [1], [1], [1], ['linkedin.com'], [2], [2], [7]]], [null, null, null, null, 'facebook.com', 'google.com', 'facebook.com', null, 'linkedin.com', 'google.com', 'leetcode.com']],
        [[['BrowserHistory', 'back', 'forward'], [['home'], [3], [3]]], [null, 'home', 'home']],
      ],
      js: String.raw`class BrowserHistory {
  constructor(homepage) {
    this.pages = [homepage];
    this.cur = 0;
    this.last = 0; // last valid index (forward history ends here)
  }
  visit(url) {
    this.cur++;
    this.pages[this.cur] = url;
    this.last = this.cur; // discard forward history
  }
  back(steps) {
    this.cur = Math.max(0, this.cur - steps);
    return this.pages[this.cur];
  }
  forward(steps) {
    this.cur = Math.min(this.last, this.cur + steps);
    return this.pages[this.cur];
  }
}`,
      py: String.raw`class BrowserHistory:
    def __init__(self, homepage):
        self.pages = [homepage]
        self.cur = 0
        self.last = 0

    def visit(self, url):
        self.cur += 1
        if self.cur < len(self.pages):
            self.pages[self.cur] = url
        else:
            self.pages.append(url)
        self.last = self.cur

    def back(self, steps):
        self.cur = max(0, self.cur - steps)
        return self.pages[self.cur]

    def forward(self, steps):
        self.cur = min(self.last, self.cur + steps)
        return self.pages[self.cur]`,
      explain: `An array plus two indices gives O(1) for everything.

- pages: the history list.
- cur: the page currently shown.
- last: the furthest page you can go forward to.

visit(url): move cur forward, write url there, and set last = cur. That one assignment discards all forward history. The stale entries beyond it are simply ignored and get overwritten later, so nothing needs deleting.

back and forward: move cur by steps, clamped to [0, last].

The classic two-stack design also works (a back stack and a forward stack, with visit clearing the forward stack), but back(k) then costs O(k). The array with an index jumps any distance in O(1).

Invalidating data logically, by moving a boundary, instead of physically deleting it is a useful technique. The same idea makes "clear" O(1) in many buffer and pool designs.

The tests check the clamping: going back 7 steps from the second page stops at the homepage.`,
      complexity: 'O(1) per operation, O(n) space',
    },
    {
      title: 'Maximum Frequency Stack', fn: 'FreqStack', args: [],
      prompt: 'push(x) adds x. pop() removes and returns the most frequent element; if several are tied, return the one pushed most recently. O(1) per operation.',
      methods: [{ name: 'push', args: ['x'] }, { name: 'pop', args: [] }],
      tests: [
        [[['FreqStack', 'push', 'push', 'push', 'push', 'push', 'push', 'pop', 'pop', 'pop', 'pop'], [[], [5], [7], [5], [7], [4], [5], [], [], [], []]], [null, null, null, null, null, null, null, 5, 7, 5, 4]],
        [[['FreqStack', 'push', 'push', 'pop', 'push', 'pop', 'pop'], [[], [1], [2], [], [3], [], []]], [null, null, null, 2, null, 3, 1]],
      ],
      js: String.raw`class FreqStack {
  constructor() {
    this.freq = new Map(); // value -> count
    this.groups = new Map(); // count -> stack of values that reached this count
    this.maxFreq = 0;
  }
  push(x) {
    const f = (this.freq.get(x) || 0) + 1;
    this.freq.set(x, f);
    if (f > this.maxFreq) this.maxFreq = f;
    if (!this.groups.has(f)) this.groups.set(f, []);
    this.groups.get(f).push(x);
  }
  pop() {
    const stack = this.groups.get(this.maxFreq);
    const x = stack.pop();
    this.freq.set(x, this.freq.get(x) - 1);
    if (stack.length === 0) this.maxFreq--;
    return x;
  }
}`,
      py: String.raw`class FreqStack:
    def __init__(self):
        self.freq = {}
        self.groups = {}
        self.max_freq = 0

    def push(self, x):
        f = self.freq.get(x, 0) + 1
        self.freq[x] = f
        self.max_freq = max(self.max_freq, f)
        self.groups.setdefault(f, []).append(x)

    def pop(self):
        x = self.groups[self.max_freq].pop()
        self.freq[x] -= 1
        if not self.groups[self.max_freq]:
            self.max_freq -= 1
        return x`,
      explain: `Group the pushes by the frequency level they reach.

- freq[x]: the current count of x.
- groups[f]: a stack of the values in the order they reached count f.
- maxFreq: the highest count present.

push(x): increase its count to f, and push x onto groups[f].

pop(): take the top of groups[maxFreq]. It is a most-frequent element, and the most recent one among the ties, because it is on top of that stack. Decrease its count. If that stack is now empty, maxFreq goes down by 1.

Why can maxFreq simply decrease by 1? When x reached count f, it was previously pushed onto groups[f - 1] too, and it is still there. So if groups[f] empties, groups[f - 1] is certainly not empty.

A value appears in several stacks (one per level it reached). That is intended: popping it from level f leaves its copy at level f - 1 in place, which correctly represents its remaining count.

The design is O(1) with no heap. Compare it with LFU Cache, which uses similar per-frequency buckets.`,
      complexity: 'O(1) per operation, O(n) space',
    },
    {
      title: 'Hit Counter', fn: 'HitCounter', args: [],
      prompt: 'hit(timestamp) records a hit at that second; getHits(timestamp) returns the hits in the past 300 seconds (timestamp − 299 through timestamp). Timestamps are non-decreasing.',
      methods: [{ name: 'hit', args: ['timestamp'] }, { name: 'getHits', args: ['timestamp'] }],
      tests: [
        [[['HitCounter', 'hit', 'hit', 'hit', 'getHits', 'hit', 'getHits', 'getHits'], [[], [1], [2], [3], [4], [300], [300], [301]]], [null, null, null, null, 3, null, 4, 3]],
        [[['HitCounter', 'hit', 'hit', 'hit', 'getHits', 'getHits'], [[], [1], [1], [1], [300], [301]]], [null, null, null, null, 3, 0]],
      ],
      js: String.raw`class HitCounter {
  constructor() {
    this.times = []; // queue of [timestamp, count]
    this.head = 0;
    this.total = 0;
  }
  evict(t) {
    while (this.head < this.times.length && this.times[this.head][0] <= t - 300) {
      this.total -= this.times[this.head][1];
      this.head++;
    }
  }
  hit(t) {
    const last = this.times[this.times.length - 1];
    if (last && last[0] === t && this.head < this.times.length) last[1]++; // compress same-second hits
    else this.times.push([t, 1]);
    this.total++;
  }
  getHits(t) {
    this.evict(t);
    return this.total;
  }
}`,
      py: String.raw`from collections import deque

class HitCounter:
    def __init__(self):
        self.q = deque()  # [timestamp, count]
        self.total = 0

    def hit(self, timestamp):
        if self.q and self.q[-1][0] == timestamp:
            self.q[-1][1] += 1
        else:
            self.q.append([timestamp, 1])
        self.total += 1

    def get_hits(self, timestamp):
        while self.q and self.q[0][0] <= timestamp - 300:
            self.total -= self.q.popleft()[1]
        return self.total`,
      explain: `This is a sliding window over time. Hits arrive in timestamp order, so a queue holds them oldest-first.

- hit(t): append to the back. Compress repeated hits in the same second into one [t, count] entry, which keeps memory bounded by the number of distinct seconds rather than the number of hits.
- getHits(t): drop entries from the front that are older than the window (timestamp ≤ t - 300), subtracting their counts from a running total. Then return the total.

Keeping a running total makes getHits O(1) amortized: each entry is added once and evicted once.

Window boundary: "past 300 seconds" includes t - 299 through t, so an entry at t - 300 is expired. The second test checks that edge: hits at second 1 still count at 300 but not at 301.

Follow-up for heavy traffic: use a fixed circular array of 300 buckets indexed by t % 300, each storing (timestamp, count). That uses O(1) memory however many hits arrive, and it is how rate limiters and monitoring dashboards work.`,
      complexity: 'O(1) amortized per operation, O(distinct seconds in window) space',
    },
    {
      title: 'Add and Search Words', fn: 'WordDictionary', args: [],
      prompt: 'addWord(word) adds a word. search(word) returns true if any added word matches, where "." in the query matches any single letter.',
      methods: [{ name: 'addWord', args: ['word'] }, { name: 'search', args: ['word'] }],
      tests: [
        [[['WordDictionary', 'addWord', 'addWord', 'addWord', 'search', 'search', 'search', 'search'], [[], ['bad'], ['dad'], ['mad'], ['pad'], ['bad'], ['.ad'], ['b..']]], [null, null, null, null, false, true, true, true]],
        [[['WordDictionary', 'addWord', 'search', 'search', 'search'], [[], ['a'], ['.'], ['a.'], ['..']]], [null, null, true, false, false]],
        [[['WordDictionary', 'addWord', 'addWord', 'search', 'search'], [[], ['at'], ['and'], ['a.d'], ['.t']]], [null, null, null, true, true]],
      ],
      js: String.raw`class WordDictionary {
  constructor() {
    this.root = {};
  }
  addWord(word) {
    let node = this.root;
    for (const c of word) node = node[c] || (node[c] = {});
    node.$ = true;
  }
  search(word) {
    const dfs = (node, i) => {
      if (i === word.length) return !!node.$;
      const c = word[i];
      if (c === '.') {
        for (const k in node) if (k !== '$' && dfs(node[k], i + 1)) return true; // try every branch
        return false;
      }
      return !!node[c] && dfs(node[c], i + 1);
    };
    return dfs(this.root, 0);
  }
}`,
      py: String.raw`class WordDictionary:
    def __init__(self):
        self.root = {}

    def add_word(self, word):
        node = self.root
        for c in word:
            node = node.setdefault(c, {})
        node["$"] = True

    def search(self, word):
        def dfs(node, i):
            if i == len(word):
                return "$" in node
            c = word[i]
            if c == ".":
                return any(dfs(child, i + 1) for k, child in node.items() if k != "$")
            return c in node and dfs(node[c], i + 1)
        return dfs(self.root, 0)`,
      explain: `This is the Trie with a twist: "." can match any letter, so at that position the search must branch.

addWord is ordinary trie insertion.

search(word) is a DFS over the trie:
- An ordinary letter follows exactly one child, or fails if it does not exist.
- "." tries every child, succeeding if any branch matches the rest of the query.
- At the end of the query, succeed only if the node marks the end of a word, so "a." does not match "a".

Cost: a query with no dots is O(L), like a normal trie lookup. Each "." can branch up to 26 ways, so the worst case is O(26^(number of dots) × L). In practice the branches die quickly because few prefixes exist.

Skip the end marker key ("$") when iterating children. It is not a letter.

An alternative is to bucket the words by length and regex-match within the bucket. That is simpler, but scans every word of that length on each query. The trie shares work across words with common prefixes.

The same branching-search-in-a-trie idea powers wildcard autocomplete, crossword helpers and Word Search II.`,
      complexity: 'O(L) per addWord; search O(L) without dots, up to O(26^d · L) with d dots',
    },
  ],
};

export default m;
