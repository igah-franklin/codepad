import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'graphs',
  title: 'Graphs',
  description: 'BFS, DFS, topological sort, Dijkstra, Bellman-Ford and Union-Find.',
  challenges: [
    {
      title: 'Course Schedule', fn: 'canFinish', args: ['numCourses', 'prerequisites'],
      prompt: 'There are numCourses courses labelled 0..n-1. prerequisites[i] = [a, b] means you must take b before a. Return true if it is possible to finish every course (no circular dependency).',
      tests: [[[2, [[1, 0]]], true], [[2, [[1, 0], [0, 1]]], false], [[3, []], true], [[4, [[1, 0], [2, 1], [3, 2]]], true], [[3, [[0, 1], [1, 2], [2, 0]]], false], [[1, [[0, 0]]], false]],
      js: String.raw`function canFinish(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    graph[b].push(a);
    indeg[a]++;
  }
  const queue = [];
  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) queue.push(i);
  let taken = 0;
  while (queue.length) {
    const c = queue.shift();
    taken++;
    for (const next of graph[c]) if (--indeg[next] === 0) queue.push(next);
  }
  return taken === numCourses;
}`,
      py: String.raw`from collections import deque

def can_finish(num_courses, prerequisites):
    graph = [[] for _ in range(num_courses)]
    indeg = [0] * num_courses
    for a, b in prerequisites:
        graph[b].append(a)
        indeg[a] += 1
    q = deque(i for i in range(num_courses) if indeg[i] == 0)
    taken = 0
    while q:
        c = q.popleft()
        taken += 1
        for nxt in graph[c]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                q.append(nxt)
    return taken == num_courses`,
      explain: `Courses are nodes and prerequisites are directed edges (b → a). All the courses can be finished exactly when the graph has no cycle, which is when a topological order exists.

Kahn's algorithm (BFS topological sort):
1. Count each node's in-degree, the number of prerequisites still unmet.
2. Put every course with in-degree 0 in a queue. They can be taken right away.
3. Take a course from the queue. Each course that depended on it loses one prerequisite. Any whose count reaches 0 joins the queue.
4. If every course gets taken, there is no cycle. Courses caught in a cycle never reach in-degree 0.

DFS alternative: color the nodes white (unvisited), gray (on the current path) and black (finished). Reaching a gray node means you found a back edge, and that is a cycle.

A self-loop ([0, 0]) is the smallest possible cycle.

Uses include build systems (make), package managers resolving dependencies, spreadsheet recalculation and task scheduling.`,
      complexity: 'O(V + E) time and space',
    },
    {
      title: 'Course Schedule II', fn: 'findOrder', args: ['numCourses', 'prerequisites'],
      prompt: 'Return an order in which to take all courses ([a, b] means b before a). If several orders are valid, return the lexicographically smallest one (always take the lowest-numbered available course). Return [] if impossible.',
      tests: [[[2, [[1, 0]]], [0, 1]], [[4, [[1, 0], [2, 0], [3, 1], [3, 2]]], [0, 1, 2, 3]], [[1, []], [0]], [[2, [[0, 1], [1, 0]]], []], [[3, [[0, 2]]], [1, 2, 0]], [[4, []], [0, 1, 2, 3]]],
      js: String.raw`function findOrder(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    graph[b].push(a);
    indeg[a]++;
  }
  // a tiny min-heap so we always take the smallest available course
  const heap = [];
  const push = (x) => {
    heap.push(x);
    let i = heap.length - 1;
    while (i > 0 && heap[(i - 1) >> 1] > heap[i]) {
      [heap[i], heap[(i - 1) >> 1]] = [heap[(i - 1) >> 1], heap[i]];
      i = (i - 1) >> 1;
    }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      while (true) {
        let s = i;
        const l = 2 * i + 1, r = l + 1;
        if (l < heap.length && heap[l] < heap[s]) s = l;
        if (r < heap.length && heap[r] < heap[s]) s = r;
        if (s === i) break;
        [heap[i], heap[s]] = [heap[s], heap[i]];
        i = s;
      }
    }
    return top;
  };
  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) push(i);
  const order = [];
  while (heap.length) {
    const c = pop();
    order.push(c);
    for (const next of graph[c]) if (--indeg[next] === 0) push(next);
  }
  return order.length === numCourses ? order : [];
}`,
      py: String.raw`import heapq

def find_order(num_courses, prerequisites):
    graph = [[] for _ in range(num_courses)]
    indeg = [0] * num_courses
    for a, b in prerequisites:
        graph[b].append(a)
        indeg[a] += 1
    heap = [i for i in range(num_courses) if indeg[i] == 0]
    heapq.heapify(heap)
    order = []
    while heap:
        c = heapq.heappop(heap)
        order.append(c)
        for nxt in graph[c]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                heapq.heappush(heap, nxt)
    return order if len(order) == num_courses else []`,
      explain: `This is the same Kahn's algorithm as Course Schedule, but now you record the order. To make the answer unique, replace the FIFO queue with a min-heap (priority queue), so you always take the smallest course that is currently available.

1. Build the graph and the in-degrees.
2. Push every course with in-degree 0 onto the min-heap.
3. Pop the smallest course, append it to the order, and release its dependents.
4. If the order contains every course, return it. Otherwise there was a cycle, so return [].

Why does the heap give the lexicographically smallest order? At each step, taking the smallest available course is never worse for the order: any order that starts with a larger available course is lexicographically bigger.

JavaScript has no built-in heap, so the solution includes a minimal binary heap with sift-up and sift-down. That code is worth knowing for interviews. Python provides heapq.

Without the uniqueness requirement, a plain queue (or DFS post-order, reversed) gives some valid order in O(V + E).`,
      complexity: 'O((V + E) log V) time, O(V + E) space',
    },
    {
      title: 'Word Ladder', fn: 'ladderLength', args: ['beginWord', 'endWord', 'wordList'],
      prompt: 'Transform beginWord into endWord by changing one letter at a time, where every intermediate word must be in wordList. Return the number of words in the shortest such sequence (including both ends), or 0 if impossible.',
      tests: [[['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog']], 5], [['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']], 0], [['a', 'c', ['a', 'b', 'c']], 2], [['hot', 'dog', ['hot', 'dog']], 0], [['lost', 'cost', ['most', 'fist', 'lost', 'cost', 'fish']], 2]],
      js: String.raw`function ladderLength(beginWord, endWord, wordList) {
  const words = new Set(wordList);
  if (!words.has(endWord)) return 0;
  let frontier = [beginWord], steps = 1;
  const seen = new Set([beginWord]);
  while (frontier.length) {
    const next = [];
    for (const w of frontier) {
      if (w === endWord) return steps;
      for (let i = 0; i < w.length; i++) {
        for (let c = 97; c <= 122; c++) {
          const cand = w.slice(0, i) + String.fromCharCode(c) + w.slice(i + 1);
          if (words.has(cand) && !seen.has(cand)) {
            seen.add(cand);
            next.push(cand);
          }
        }
      }
    }
    frontier = next;
    steps++;
  }
  return 0;
}`,
      py: String.raw`def ladder_length(begin_word, end_word, word_list):
    words = set(word_list)
    if end_word not in words:
        return 0
    frontier, steps = [begin_word], 1
    seen = {begin_word}
    letters = "abcdefghijklmnopqrstuvwxyz"
    while frontier:
        nxt = []
        for w in frontier:
            if w == end_word:
                return steps
            for i in range(len(w)):
                for c in letters:
                    cand = w[:i] + c + w[i + 1:]
                    if cand in words and cand not in seen:
                        seen.add(cand)
                        nxt.append(cand)
        frontier = nxt
        steps += 1
    return 0`,
      explain: `Words are nodes, and two words are connected if they differ by exactly one letter. You want the shortest path in an unweighted graph, which is BFS.

BFS explores level by level, so the first time it reaches endWord, it has used the fewest steps.

Generating neighbors: comparing a word against every other word costs O(N) per word. Instead, try every position × every letter (26L candidates) and check each one against the word set in O(1). That is much faster when the dictionary is large.

Mark words as seen when you enqueue them, so each word is processed at most once.

Optimizations interviewers like:
- Bidirectional BFS: search from both ends and stop when the two frontiers meet. That explores roughly the square root of the nodes.
- Wildcard buckets: precompute patterns like "h*t" mapped to words, so neighbors come straight from a lookup.

Return 0 early when endWord is not in the list.`,
      complexity: 'O(N · L · 26) time for N words of length L, O(N) space',
    },
    {
      title: 'Network Delay Time', fn: 'networkDelayTime', args: ['times', 'n', 'k'],
      prompt: 'times[i] = [u, v, w] is a directed edge from node u to v taking w time (nodes are 1..n). A signal is sent from node k. Return the time until every node receives it, or -1 if some node never does.',
      tests: [[[[[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2], 2], [[[[1, 2, 1]], 2, 1], 1], [[[[1, 2, 1]], 2, 2], -1], [[[[1, 2, 1], [2, 3, 2], [1, 3, 4]], 3, 1], 3], [[[], 1, 1], 0]],
      js: String.raw`function networkDelayTime(times, n, k) {
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) adj[u].push([v, w]);
  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;
  const done = new Array(n + 1).fill(false);
  // Simple O(V^2) Dijkstra: repeatedly finalize the closest unfinished node.
  for (let iter = 0; iter < n; iter++) {
    let u = -1;
    for (let i = 1; i <= n; i++) if (!done[i] && (u === -1 || dist[i] < dist[u])) u = i;
    if (dist[u] === Infinity) break;
    done[u] = true;
    for (const [v, w] of adj[u]) if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
  }
  const worst = Math.max(...dist.slice(1));
  return worst === Infinity ? -1 : worst;
}`,
      py: String.raw`import heapq

def network_delay_time(times, n, k):
    adj = [[] for _ in range(n + 1)]
    for u, v, w in times:
        adj[u].append((v, w))
    dist = [float("inf")] * (n + 1)
    dist[k] = 0
    heap = [(0, k)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue  # stale entry
        for v, w in adj[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(heap, (dist[v], v))
    worst = max(dist[1:])
    return -1 if worst == float("inf") else worst`,
      explain: `The answer is the shortest-path distance to the farthest node. With non-negative weights, that calls for Dijkstra's algorithm.

Dijkstra in one sentence: repeatedly take the unfinished node with the smallest known distance, lock it in, and relax its outgoing edges (if going through it is shorter, update the neighbor).

Why is locking in safe? Every edge weight is non-negative, so no path discovered later could reach that node more cheaply.

Two implementations are shown:
- JavaScript: the O(V²) array scan, with no heap needed. It is simple and good for dense graphs.
- Python: a heapq priority queue, O((V + E) log V), which is better for sparse graphs. Skip stale heap entries whose distance is outdated ("lazy deletion").

Finally, the maximum distance is the time the last node hears the signal. If any node is unreachable (infinite distance), return -1.

Negative weights break Dijkstra. Use Bellman-Ford instead (next challenge).`,
      complexity: 'O(V² + E) array version, O((V + E) log V) heap version',
    },
    {
      title: 'Cheapest Flights Within K Stops', fn: 'findCheapestPrice', args: ['n', 'flights', 'src', 'dst', 'k'],
      prompt: 'flights[i] = [from, to, price]. Return the cheapest price from src to dst using at most k stops (k + 1 flights), or -1 if there is no such route.',
      tests: [[[4, [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], 0, 3, 1], 700], [[3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 1], 200], [[3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 0], 500], [[2, [[1, 0, 5]], 0, 1, 3], -1], [[3, [[0, 1, 2], [1, 2, 1], [2, 0, 10]], 1, 2, 1], 1]],
      js: String.raw`function findCheapestPrice(n, flights, src, dst, k) {
  let cost = new Array(n).fill(Infinity);
  cost[src] = 0;
  // Bellman-Ford limited to k+1 rounds: round r = best price using at most r flights
  for (let r = 0; r <= k; r++) {
    const next = cost.slice(); // read from the previous round only
    for (const [u, v, p] of flights) {
      if (cost[u] + p < next[v]) next[v] = cost[u] + p;
    }
    cost = next;
  }
  return cost[dst] === Infinity ? -1 : cost[dst];
}`,
      py: String.raw`def find_cheapest_price(n, flights, src, dst, k):
    INF = float("inf")
    cost = [INF] * n
    cost[src] = 0
    for _ in range(k + 1):
        nxt = cost[:]
        for u, v, p in flights:
            if cost[u] + p < nxt[v]:
                nxt[v] = cost[u] + p
        cost = nxt
    return -1 if cost[dst] == INF else cost[dst]`,
      explain: `Plain Dijkstra fails here. The cheapest route may use too many stops, while a slightly pricier route with fewer stops is the valid answer. You need to limit the number of edges, and Bellman-Ford does exactly that.

Bellman-Ford idea: after round r, cost[v] is the cheapest price to reach v using at most r flights. Each round relaxes every edge once.

1. Start with cost[src] = 0 and everything else infinite.
2. Run k + 1 rounds, because k stops means k + 1 flights.
3. In each round, read from the previous round's array (cost) and write into a copy (next).

The copy is what enforces the limit. Without it, one round could chain several flights (u → v, then immediately v → w), quietly using more stops than allowed.

In the second and third tests, the route via 1 costs 200 with 1 stop, but with 0 stops allowed only the direct 500 flight counts.

Full Bellman-Ford (V - 1 rounds) also handles negative edge weights, and one extra round that still improves something reveals a negative cycle.`,
      complexity: 'O(k · E) time, O(V) space',
    },
    {
      title: 'Redundant Connection', fn: 'findRedundantConnection', args: ['edges'],
      prompt: 'A tree with nodes 1..n had one extra edge added, creating exactly one cycle. edges lists all n edges. Return the edge that can be removed to restore a tree; if several qualify, return the one that appears last.',
      tests: [[[[[1, 2], [1, 3], [2, 3]]], [2, 3]], [[[[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]], [1, 4]], [[[[1, 2], [2, 3], [3, 1]]], [3, 1]], [[[[3, 4], [1, 2], [2, 4], [3, 5], [2, 5]]], [2, 5]]],
      js: String.raw`function findRedundantConnection(edges) {
  const parent = Array.from({ length: edges.length + 1 }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]; // path halving
      x = parent[x];
    }
    return x;
  };
  for (const [a, b] of edges) {
    const ra = find(a), rb = find(b);
    if (ra === rb) return [a, b]; // already connected: this edge closes the cycle
    parent[ra] = rb;
  }
  return [];
}`,
      py: String.raw`def find_redundant_connection(edges):
    parent = list(range(len(edges) + 1))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb:
            return [a, b]
        parent[ra] = rb
    return []`,
      explain: `Union-Find (Disjoint Set Union) tracks which nodes are already connected, with nearly O(1) cost per operation.

- find(x): follow parent pointers to the representative (root) of x's group.
- union(a, b): join the two groups by making one root point to the other.

Process the edges in order. If both ends are already in the same group, there is already a path between them, so this edge creates the cycle. Return it. Since we scan in order, the first such edge we find is the last edge of the cycle in the input, which is what the problem asks for.

Path halving (parent[x] = parent[parent[x]]) keeps the trees flat. Combined with union by rank or size, each operation becomes effectively constant: O(α(n)), the inverse Ackermann function, which is below 5 for any realistic n.

Union-Find shines when connections arrive over time: Kruskal's minimum spanning tree, Number of Provinces (next), merging accounts, and percolation.`,
      complexity: 'O(n · α(n)) time, O(n) space',
    },
    {
      title: 'Number of Provinces', fn: 'findCircleNum', args: ['isConnected'],
      prompt: 'isConnected is an n×n matrix where isConnected[i][j] = 1 if cities i and j are directly connected. A province is a group of directly or indirectly connected cities. Return the number of provinces.',
      tests: [[[[[1, 1, 0], [1, 1, 0], [0, 0, 1]]], 2], [[[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], 3], [[[[1]]], 1], [[[[1, 0, 0, 1], [0, 1, 1, 0], [0, 1, 1, 1], [1, 0, 1, 1]]], 1]],
      js: String.raw`function findCircleNum(isConnected) {
  const n = isConnected.length;
  const seen = new Array(n).fill(false);
  let provinces = 0;
  for (let i = 0; i < n; i++) {
    if (seen[i]) continue;
    provinces++;
    const stack = [i];
    seen[i] = true;
    while (stack.length) {
      const c = stack.pop();
      for (let j = 0; j < n; j++) {
        if (isConnected[c][j] && !seen[j]) {
          seen[j] = true;
          stack.push(j);
        }
      }
    }
  }
  return provinces;
}`,
      py: String.raw`def find_circle_num(is_connected):
    n = len(is_connected)
    seen = [False] * n
    provinces = 0
    for i in range(n):
        if seen[i]:
            continue
        provinces += 1
        seen[i] = True
        stack = [i]
        while stack:
            c = stack.pop()
            for j in range(n):
                if is_connected[c][j] and not seen[j]:
                    seen[j] = True
                    stack.append(j)
    return provinces`,
      explain: `Count the connected components of an undirected graph given as an adjacency matrix.

This is the same "scan, then flood" pattern as Number of Islands, on a general graph instead of a grid:
1. For each unvisited city, start a new province.
2. Run DFS from it, marking every reachable city as seen.
3. Cities already seen belong to a province you have counted.

With an adjacency matrix, a node's neighbors are found by scanning its whole row, which makes the total O(n²). That matches the input size, so it cannot be beaten.

The Union-Find version: start with n groups, union i and j for every 1 in the matrix, and count the remaining roots (or decrement a counter on each successful union).

Choose your representation deliberately. An adjacency matrix gives an O(1) edge check but O(n) neighbor iteration. An adjacency list makes iterating a node's neighbors O(degree), which suits sparse graphs.`,
      complexity: 'O(n²) time, O(n) space',
    },
    {
      title: 'Rotting Oranges', fn: 'orangesRotting', args: ['grid'],
      prompt: 'In the grid, 0 = empty, 1 = fresh orange, 2 = rotten orange. Every minute, fresh oranges next to (4-directionally) a rotten one become rotten. Return the minutes until no fresh orange remains, or -1 if that never happens.',
      tests: [[[[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], 4], [[[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], -1], [[[[0, 2]]], 0], [[[[0]]], 0], [[[[1]]], -1], [[[[2, 1, 1, 1, 2]]], 2]],
      js: String.raw`function orangesRotting(grid) {
  const R = grid.length, C = grid[0].length;
  let frontier = [], fresh = 0;
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 2) frontier.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  let minutes = 0;
  while (frontier.length && fresh > 0) {
    const next = [];
    for (const [r, c] of frontier) {
      for (const [a, b] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (a >= 0 && a < R && b >= 0 && b < C && grid[a][b] === 1) {
          grid[a][b] = 2;
          fresh--;
          next.push([a, b]);
        }
      }
    }
    frontier = next;
    minutes++;
  }
  return fresh === 0 ? minutes : -1;
}`,
      py: String.raw`def oranges_rotting(grid):
    R, C = len(grid), len(grid[0])
    frontier, fresh = [], 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == 2:
                frontier.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    while frontier and fresh > 0:
        nxt = []
        for r, c in frontier:
            for a, b in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= a < R and 0 <= b < C and grid[a][b] == 1:
                    grid[a][b] = 2
                    fresh -= 1
                    nxt.append((a, b))
        frontier = nxt
        minutes += 1
    return minutes if fresh == 0 else -1`,
      explain: `This is multi-source BFS. The rot spreads from every rotten orange at the same time, so start BFS with all of them in the first frontier.

1. Collect every rotten orange as the starting frontier and count the fresh ones.
2. Each BFS level is one minute: every orange in the frontier rots its fresh neighbors, and those form the next frontier.
3. Stop when nothing is left to spread, or when no fresh oranges remain.
4. If any fresh orange is left, it was unreachable, so return -1.

Processing whole levels (frontier → next) makes counting minutes easy. Each loop iteration is exactly one minute.

Why multi-source? Running a separate BFS from each rotten orange and combining the results is slower and harder to get right. Seeding the queue with every source computes, for each cell, the distance to its nearest source in one pass.

Checking fresh > 0 in the loop condition avoids counting an extra minute after the last orange rots.

The same technique solves 01 Matrix (distance to the nearest 0), Walls and Gates, and fire-spread simulations.`,
      complexity: 'O(R·C) time and space',
    },
    {
      title: 'Pacific Atlantic Water Flow', fn: 'pacificAtlantic', args: ['heights'],
      prompt: 'heights is an island grid. The Pacific touches the top and left edges; the Atlantic touches the bottom and right edges. Water flows to a neighbor with equal or lower height. Return all cells [r, c] from which water can reach both oceans (any order).',
      compare: 'unordered',
      tests: [[[[[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]]], [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]]], [[[[1]]], [[0, 0]]], [[[[1, 1], [1, 1]]], [[0, 0], [0, 1], [1, 0], [1, 1]]], [[[[3, 1], [1, 3]]], [[0, 0], [0, 1], [1, 0], [1, 1]]], [[[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1], [2, 2]]]],
      js: String.raw`function pacificAtlantic(heights) {
  const R = heights.length, C = heights[0].length;
  // Flood "uphill" from each ocean: which cells can drain into it?
  const reach = (starts) => {
    const seen = Array.from({ length: R }, () => new Array(C).fill(false));
    const stack = [...starts];
    for (const [r, c] of starts) seen[r][c] = true;
    while (stack.length) {
      const [r, c] = stack.pop();
      for (const [a, b] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (a >= 0 && a < R && b >= 0 && b < C && !seen[a][b] && heights[a][b] >= heights[r][c]) {
          seen[a][b] = true;
          stack.push([a, b]);
        }
      }
    }
    return seen;
  };
  const pac = [], atl = [];
  for (let r = 0; r < R; r++) { pac.push([r, 0]); atl.push([r, C - 1]); }
  for (let c = 0; c < C; c++) { pac.push([0, c]); atl.push([R - 1, c]); }
  const P = reach(pac), A = reach(atl);
  const out = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (P[r][c] && A[r][c]) out.push([r, c]);
  return out;
}`,
      py: String.raw`def pacific_atlantic(heights):
    R, C = len(heights), len(heights[0])
    def reach(starts):
        seen = set(starts)
        stack = list(starts)
        while stack:
            r, c = stack.pop()
            for a, b in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= a < R and 0 <= b < C and (a, b) not in seen and heights[a][b] >= heights[r][c]:
                    seen.add((a, b))
                    stack.append((a, b))
        return seen
    pac = [(r, 0) for r in range(R)] + [(0, c) for c in range(C)]
    atl = [(r, C - 1) for r in range(R)] + [(R - 1, c) for c in range(C)]
    both = reach(pac) & reach(atl)
    return [[r, c] for r, c in sorted(both)]`,
      explain: `Simulating the water flowing downhill from every cell means one search per cell, roughly O((R·C)²). Reverse the direction instead: start from each ocean and climb uphill.

A cell can drain into the Pacific if there is a non-increasing path from it to the Pacific edge. Read backwards, that is a non-decreasing path from the edge to the cell.

1. Multi-source DFS from every Pacific edge cell, moving to neighbors with height at least the current one. Everything it reaches can drain into the Pacific.
2. Do the same from the Atlantic edges.
3. The answer is the cells in both sets.

Two searches over the grid give O(R·C) in total.

Reversing the question ("which cells can reach the target?" becomes "what can the target reach, moving backwards?") is a powerful trick. It also solves Surrounded Regions (flood from the border) and many reachability problems with several sources.

Equal heights count as flowing, which is why the comparison is >=.`,
      complexity: 'O(R·C) time and space',
    },
    {
      title: 'Shortest Path in Binary Matrix', fn: 'shortestPathBinaryMatrix', args: ['grid'],
      prompt: 'In an n×n grid of 0 (open) and 1 (blocked), return the length (number of cells) of the shortest path from the top-left to the bottom-right moving in any of 8 directions through open cells, or -1 if none exists.',
      tests: [[[[[0, 1], [1, 0]]], 2], [[[[0, 0, 0], [1, 1, 0], [1, 1, 0]]], 4], [[[[1, 0, 0], [1, 1, 0], [1, 1, 0]]], -1], [[[[0]]], 1], [[[[0, 0, 0], [0, 1, 0], [0, 0, 1]]], -1], [[[[0, 1, 1, 0, 0, 0], [0, 1, 0, 1, 1, 0], [0, 1, 1, 0, 1, 0], [0, 0, 0, 1, 1, 0], [1, 1, 1, 1, 1, 0], [1, 1, 1, 1, 1, 0]]], 14]],
      js: String.raw`function shortestPathBinaryMatrix(grid) {
  const n = grid.length;
  if (grid[0][0] || grid[n - 1][n - 1]) return -1;
  const dist = Array.from({ length: n }, () => new Array(n).fill(0));
  dist[0][0] = 1;
  const queue = [[0, 0]];
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head];
    if (r === n - 1 && c === n - 1) return dist[r][c];
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const a = r + dr, b = c + dc;
        if (a >= 0 && a < n && b >= 0 && b < n && grid[a][b] === 0 && dist[a][b] === 0) {
          dist[a][b] = dist[r][c] + 1;
          queue.push([a, b]);
        }
      }
  }
  return -1;
}`,
      py: String.raw`from collections import deque

def shortest_path_binary_matrix(grid):
    n = len(grid)
    if grid[0][0] or grid[n - 1][n - 1]:
        return -1
    dist = [[0] * n for _ in range(n)]
    dist[0][0] = 1
    q = deque([(0, 0)])
    while q:
        r, c = q.popleft()
        if r == n - 1 and c == n - 1:
            return dist[r][c]
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                a, b = r + dr, c + dc
                if 0 <= a < n and 0 <= b < n and grid[a][b] == 0 and dist[a][b] == 0:
                    dist[a][b] = dist[r][c] + 1
                    q.append((a, b))
    return -1`,
      explain: `Every move costs the same, so BFS finds the shortest path. The only differences from earlier grids are the 8 directions and counting cells rather than moves.

1. If the start or the end is blocked, return -1 immediately.
2. dist[r][c] records the path length on the first visit, and also serves as the visited marker (0 means unvisited).
3. Explore all 8 neighbors, using the double loop over dr and dc in {-1, 0, 1}. The (0, 0) case is the current cell itself, which is already visited, so it is skipped automatically.
4. The first time the bottom-right cell comes off the queue, its dist value is the answer.

Queue efficiency in JavaScript: instead of shift(), which is O(n), keep a head index into the array. That gives an O(1) dequeue and is an easy way to write fast BFS.

When the moves have different costs, switch to Dijkstra. With a good distance estimate (here the Chebyshev distance), A* explores far fewer cells. Game pathfinding uses A* for that reason.`,
      complexity: 'O(n²) time and space',
    },
  ],
};

export default m;
