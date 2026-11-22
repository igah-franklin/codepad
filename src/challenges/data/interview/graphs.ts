import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'graphs',
  title: 'Graph Classics',
  description: 'Degrees, components, bipartiteness and BFS distances: the graph questions that show up most.',
  challenges: [
    {
      title: 'Find the Town Judge', fn: 'findJudge', args: ['n', 'trust'],
      prompt: 'In a town of n people (1..n), trust[i] = [a, b] means a trusts b. The judge trusts nobody and is trusted by everyone else. Return the judge\'s label, or -1 if there is none.',
      tests: [[[2, [[1, 2]]], 2], [[3, [[1, 3], [2, 3]]], 3], [[3, [[1, 3], [2, 3], [3, 1]]], -1], [[1, []], 1], [[3, [[1, 2], [2, 3]]], -1], [[4, [[1, 3], [1, 4], [2, 3], [2, 4], [4, 3]]], 3]],
      js: String.raw`function findJudge(n, trust) {
  const score = new Array(n + 1).fill(0); // in-degree minus out-degree
  for (const [a, b] of trust) {
    score[a]--;
    score[b]++;
  }
  for (let i = 1; i <= n; i++) if (score[i] === n - 1) return i;
  return -1;
}`,
      py: String.raw`def find_judge(n, trust):
    score = [0] * (n + 1)
    for a, b in trust:
        score[a] -= 1
        score[b] += 1
    for i in range(1, n + 1):
        if score[i] == n - 1:
            return i
    return -1`,
      explain: `Think of it as a directed graph where an edge a → b means "a trusts b". The judge has:
- out-degree 0 (trusts nobody),
- in-degree n - 1 (trusted by everyone else).

Track a single score per person: +1 for each incoming edge and -1 for each outgoing edge. Only someone with in-degree n - 1 and out-degree 0 can reach a score of n - 1, because the most anyone can score is n - 1, and any outgoing trust lowers it.

One pass to score, one pass to find, so O(n + E).

Edge case: with n = 1 and no trust, the single person is the judge. Their score is 0, which equals n - 1.

Many graph questions are really degree-counting questions. Before reaching for BFS or DFS, ask whether the in-degrees and out-degrees already answer it. This one is closely related to the Celebrity Problem, which uses a two-pointer elimination with an O(1)-space knows(a, b) API.`,
      complexity: 'O(n + E) time, O(n) space',
    },
    {
      title: 'Graph Valid Tree', fn: 'validTree', args: ['n', 'edges'],
      prompt: 'Given n nodes (0..n-1) and a list of undirected edges, return true if the edges form a valid tree (connected and without cycles).',
      tests: [[[5, [[0, 1], [0, 2], [0, 3], [1, 4]]], true], [[5, [[0, 1], [1, 2], [2, 3], [1, 3], [1, 4]]], false], [[1, []], true], [[2, []], false], [[4, [[0, 1], [2, 3]]], false], [[3, [[0, 1], [1, 2]]], true]],
      js: String.raw`function validTree(n, edges) {
  if (edges.length !== n - 1) return false; // a tree has exactly n-1 edges
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  for (const [a, b] of edges) {
    const ra = find(a), rb = find(b);
    if (ra === rb) return false; // edge inside a component = cycle
    parent[ra] = rb;
  }
  return true; // n-1 edges and no cycle => connected
}`,
      py: String.raw`def valid_tree(n, edges):
    if len(edges) != n - 1:
        return False
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb:
            return False
        parent[ra] = rb
    return True`,
      explain: `A tree on n nodes satisfies any two of these three properties, and the two then imply the third:
1. it is connected,
2. it has no cycles,
3. it has exactly n - 1 edges.

So check the edge count (O(1)), then check for cycles with Union-Find:
- For each edge, if both ends are already in the same component, adding it creates a cycle.
- Otherwise merge the components.

With exactly n - 1 edges and no cycle, the graph has to be connected. Each acyclic edge reduces the number of components by one, from n down to 1.

The tests cover both failure modes: [[0, 1], [2, 3]] with n = 4 has too few edges (it is disconnected), and the second test has the right count but contains a cycle.

DFS alternative: check the edge count, then DFS from node 0 and confirm that every node is visited.

The recursive find with path compression shown in JavaScript is compact. For very deep chains the iterative path-halving version (Python) avoids stack issues.`,
      complexity: 'O(n · α(n)) time, O(n) space',
    },
    {
      title: 'Number of Connected Components', fn: 'countComponents', args: ['n', 'edges'],
      prompt: 'Given n nodes (0..n-1) and undirected edges, return the number of connected components.',
      tests: [[[5, [[0, 1], [1, 2], [3, 4]]], 2], [[5, [[0, 1], [1, 2], [2, 3], [3, 4]]], 1], [[3, []], 3], [[1, []], 1], [[4, [[0, 1], [1, 0], [2, 3]]], 2], [[6, [[0, 1], [2, 3], [4, 5], [1, 2], [3, 4]]], 1]],
      js: String.raw`function countComponents(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]];
    return x;
  };
  let components = n;
  for (const [a, b] of edges) {
    const ra = find(a), rb = find(b);
    if (ra !== rb) {
      parent[ra] = rb;
      components--; // two groups merged into one
    }
  }
  return components;
}`,
      py: String.raw`def count_components(n, edges):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    components = n
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            components -= 1
    return components`,
      explain: `Start with every node as its own component (n of them). Each edge that joins two different components merges them, so the count goes down by one. Edges inside an existing component (duplicates, cycles) change nothing.

Union-Find does exactly this:
- find(x) returns x's representative;
- if the two ends have different representatives, union them and decrement the count.

This is the same computation as Number of Provinces, given as an edge list instead of an adjacency matrix. DFS or BFS also works: build adjacency lists, then count how many times you start a new search from an unvisited node.

When to prefer Union-Find:
- edges arrive one at a time, or the graph changes (online connectivity);
- you only need "connected or not", not paths.

When to prefer DFS or BFS: you also need distances, paths, or the members of each component.

Duplicate edges like [0, 1] and [1, 0] are harmless. The second one finds both ends already joined.`,
      complexity: 'O(n + E · α(n)) time, O(n) space',
    },
    {
      title: 'All Paths From Source to Target', fn: 'allPathsSourceTarget', args: ['graph'],
      prompt: 'graph is a directed acyclic graph as an adjacency list: graph[i] lists the nodes i points to. Return every path from node 0 to node n-1. Any order.',
      compare: 'unordered',
      tests: [[[[[1, 2], [3], [3], []]], [[0, 1, 3], [0, 2, 3]]], [[[[4, 3, 1], [3, 2, 4], [3], [4], []]], [[0, 4], [0, 3, 4], [0, 1, 3, 4], [0, 1, 2, 3, 4], [0, 1, 4]]], [[[[1], []]], [[0, 1]]], [[[[2], [], []]], [[0, 2]]]],
      js: String.raw`function allPathsSourceTarget(graph) {
  const target = graph.length - 1, out = [], path = [0];
  const dfs = (node) => {
    if (node === target) {
      out.push(path.slice());
      return;
    }
    for (const next of graph[node]) {
      path.push(next);
      dfs(next);
      path.pop();
    }
  };
  dfs(0);
  return out;
}`,
      py: String.raw`def all_paths_source_target(graph):
    target = len(graph) - 1
    out, path = [], [0]
    def dfs(node):
        if node == target:
            out.append(path[:])
            return
        for nxt in graph[node]:
            path.append(nxt)
            dfs(nxt)
            path.pop()
    dfs(0)
    return out`,
      explain: `This is backtracking over a graph. DFS from the source, keeping the current path, and record a copy whenever you reach the target.

1. path starts as [0].
2. For each neighbor: push it, recurse, pop it (choose, explore, un-choose).
3. When the target is reached, save a copy of the path.

No visited set is needed, because the graph is acyclic: no path can revisit a node, so the recursion always ends. In a graph with cycles, you would mark nodes on the current path and skip them.

Also, you must not share a visited set across different paths. The same node can appear on many different paths, and blocking it after the first would lose answers.

The number of paths can be exponential (up to 2^(n-2) in a dense DAG), so the time depends on the output size.

To count paths rather than list them, memoize: count(node) = the sum of count(next). That is O(V + E).`,
      complexity: 'O(2^n · n) worst case (output size), O(n) recursion depth',
    },
    {
      title: 'Keys and Rooms', fn: 'canVisitAllRooms', args: ['rooms'],
      prompt: 'Rooms 0..n-1 are locked except room 0. rooms[i] lists the keys found in room i (each key opens the room with that number). Return true if you can enter every room.',
      tests: [[[[[1], [2], [3], []]], true], [[[[1, 3], [3, 0, 1], [2], [0]]], false], [[[[]]], true], [[[[1], []]], true], [[[[], [0]]], false]],
      js: String.raw`function canVisitAllRooms(rooms) {
  const seen = new Set([0]);
  const stack = [0];
  while (stack.length) {
    for (const key of rooms[stack.pop()]) {
      if (!seen.has(key)) {
        seen.add(key);
        stack.push(key);
      }
    }
  }
  return seen.size === rooms.length;
}`,
      py: String.raw`def can_visit_all_rooms(rooms):
    seen = {0}
    stack = [0]
    while stack:
        for key in rooms[stack.pop()]:
            if key not in seen:
                seen.add(key)
                stack.append(key)
    return len(seen) == len(rooms)`,
      explain: `Rooms are nodes and keys are directed edges. The question is whether every node is reachable from node 0.

Run a DFS (or BFS) from room 0, marking every room you can unlock, then check that the count equals n.

1. seen starts with {0}, the open room.
2. Pop a room and look at its keys. For each key to a room not yet seen, mark it and push it.
3. When the stack empties, there is nothing left you can open.

The order does not matter. You only care about reachability, so DFS and BFS give the same answer.

The story (rooms, keys) hides a plain reachability check. Translating the story into "nodes, edges, and what is being asked" is usually the hardest step.

The final test [[], [0]] shows that the edges are directed: room 1 holds a key to 0, but nothing leads to room 1.`,
      complexity: 'O(rooms + keys) time, O(rooms) space',
    },
    {
      title: 'Is Graph Bipartite?', fn: 'isBipartite', args: ['graph'],
      prompt: 'graph is an undirected graph as an adjacency list. Return true if its nodes can be split into two groups so that every edge connects nodes from different groups. The graph may be disconnected.',
      tests: [[[[[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]]], false], [[[[1, 3], [0, 2], [1, 3], [0, 2]]], true], [[[[]]], true], [[[[1], [0], [3], [2]]], true], [[[[1, 2], [0, 2], [0, 1]]], false], [[[[], [2, 4, 6], [1, 4, 8, 9], [7, 8], [1, 2, 8, 9], [6, 9], [1, 5, 7, 8, 9], [3, 6, 9], [2, 3, 4, 6, 9], [2, 4, 5, 6, 7, 8]]], false]],
      js: String.raw`function isBipartite(graph) {
  const color = new Array(graph.length).fill(0); // 0 = uncolored, 1 / -1 = the two groups
  for (let s = 0; s < graph.length; s++) {
    if (color[s]) continue; // already handled in another component
    color[s] = 1;
    const queue = [s];
    for (let h = 0; h < queue.length; h++) {
      const u = queue[h];
      for (const v of graph[u]) {
        if (color[v] === color[u]) return false; // same color on both ends
        if (!color[v]) {
          color[v] = -color[u];
          queue.push(v);
        }
      }
    }
  }
  return true;
}`,
      py: String.raw`from collections import deque

def is_bipartite(graph):
    color = [0] * len(graph)
    for s in range(len(graph)):
        if color[s]:
            continue
        color[s] = 1
        q = deque([s])
        while q:
            u = q.popleft()
            for v in graph[u]:
                if color[v] == color[u]:
                    return False
                if not color[v]:
                    color[v] = -color[u]
                    q.append(v)
    return True`,
      explain: `This is two-coloring with BFS. Color a node, give all its neighbors the opposite color, and continue outward. If you ever find an edge whose two ends have the same color, it cannot be done.

1. Loop over every node so disconnected components are handled. Start a BFS from each uncolored node, with color 1.
2. For each neighbor:
- the same color as the current node: there is a conflict, so return false;
- uncolored: give it the opposite color and enqueue it.

Why is the first coloring choice safe? Within a connected component, choosing the start's color forces every other color. Swapping the two colors globally gives the only other valid option, so you never need to backtrack.

Theory: a graph is bipartite exactly when it has no odd-length cycle. The triangle test ([[1, 2], [0, 2], [0, 1]]) is the smallest odd cycle.

Uses include scheduling into two shifts, matching problems (job and applicant matchings need a bipartite graph), and "possible bipartition" puzzles where people dislike each other.`,
      complexity: 'O(V + E) time, O(V) space',
    },
    {
      title: 'Nearest Exit from a Maze', fn: 'nearestExit', args: ['maze', 'entrance'],
      prompt: 'maze is a grid of "." (empty) and "+" (wall). Starting at entrance [row, col], move up, down, left or right through empty cells. An exit is an empty cell on the border that is not the entrance. Return the fewest steps to an exit, or -1.',
      tests: [[[[['+', '+', '.', '+'], ['.', '.', '.', '+'], ['+', '+', '+', '.']], [1, 2]], 1], [[[['+', '+', '+'], ['.', '.', '.'], ['+', '+', '+']], [1, 0]], 2], [[[['.', '+']], [0, 0]], -1], [[[['.', '.']], [0, 1]], 1], [[[['+', '.', '+'], ['+', '.', '+'], ['+', '+', '+']], [1, 1]], 1]],
      js: String.raw`function nearestExit(maze, entrance) {
  const R = maze.length, C = maze[0].length;
  const [sr, sc] = entrance;
  const seen = Array.from({ length: R }, () => new Array(C).fill(false));
  seen[sr][sc] = true;
  let level = [[sr, sc]], steps = 0;
  while (level.length) {
    steps++;
    const next = [];
    for (const [r, c] of level) {
      for (const [a, b] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (a < 0 || a >= R || b < 0 || b >= C || maze[a][b] === '+' || seen[a][b]) continue;
        if (a === 0 || a === R - 1 || b === 0 || b === C - 1) return steps; // reached the border
        seen[a][b] = true;
        next.push([a, b]);
      }
    }
    level = next;
  }
  return -1;
}`,
      py: String.raw`def nearest_exit(maze, entrance):
    R, C = len(maze), len(maze[0])
    sr, sc = entrance
    seen = {(sr, sc)}
    level, steps = [(sr, sc)], 0
    while level:
        steps += 1
        nxt = []
        for r, c in level:
            for a, b in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if not (0 <= a < R and 0 <= b < C) or maze[a][b] == "+" or (a, b) in seen:
                    continue
                if a == 0 or a == R - 1 or b == 0 or b == C - 1:
                    return steps
                seen.add((a, b))
                nxt.append((a, b))
        level = nxt
    return -1`,
      explain: `This is shortest path in an unweighted grid, so use BFS from the entrance.

1. Mark the entrance as seen, so it is never counted as an exit, even when it sits on the border.
2. Expand level by level. Each level is one more step.
3. The first time you step onto an empty border cell, return the step count. BFS guarantees it is the nearest.

Checking for exits when a cell is discovered rather than when it is dequeued saves a level of work. The answer is still correct, because every cell in the next level is exactly steps away.

The entrance rule is the trap: in [[".", "+"]], the entrance (0, 0) is on the border, but it does not count, and the only neighbor is a wall, so the answer is -1.

This is the standard "nearest X" BFS. Later variations add keys and doors (the state becomes position plus keys held), multiple starting points (multi-source BFS), or weighted moves (Dijkstra).`,
      complexity: 'O(R·C) time and space',
    },
    {
      title: '01 Matrix', fn: 'updateMatrix', args: ['mat'],
      prompt: 'mat contains 0s and 1s. Return a matrix where each cell holds the distance to the nearest 0 (moving up, down, left or right).',
      tests: [[[[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], [[0, 0, 0], [0, 1, 0], [0, 0, 0]]], [[[[0, 0, 0], [0, 1, 0], [1, 1, 1]]], [[0, 0, 0], [0, 1, 0], [1, 2, 1]]], [[[[0]]], [[0]]], [[[[1, 1, 1], [1, 1, 1], [1, 1, 0]]], [[4, 3, 2], [3, 2, 1], [2, 1, 0]]], [[[[0, 1, 1, 1]]], [[0, 1, 2, 3]]]],
      js: String.raw`function updateMatrix(mat) {
  const R = mat.length, C = mat[0].length;
  const dist = mat.map((row) => row.map((v) => (v === 0 ? 0 : -1)));
  const queue = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (mat[r][c] === 0) queue.push([r, c]);
  // multi-source BFS from every 0 at once
  for (let h = 0; h < queue.length; h++) {
    const [r, c] = queue[h];
    for (const [a, b] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (a >= 0 && a < R && b >= 0 && b < C && dist[a][b] === -1) {
        dist[a][b] = dist[r][c] + 1;
        queue.push([a, b]);
      }
    }
  }
  return dist;
}`,
      py: String.raw`from collections import deque

def update_matrix(mat):
    R, C = len(mat), len(mat[0])
    dist = [[0 if v == 0 else -1 for v in row] for row in mat]
    q = deque((r, c) for r in range(R) for c in range(C) if mat[r][c] == 0)
    while q:
        r, c = q.popleft()
        for a, b in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= a < R and 0 <= b < C and dist[a][b] == -1:
                dist[a][b] = dist[r][c] + 1
                q.append((a, b))
    return dist`,
      explain: `A BFS from every 1 to find its nearest 0 would be O((R·C)²). Turn it around: run one BFS starting from all the 0s at once.

1. Every 0 has distance 0 and goes into the queue.
2. Every 1 starts as unknown (-1).
3. BFS: when a cell is first discovered, its distance is its parent's distance + 1. BFS order guarantees that the first discovery comes from the nearest 0.

Each cell is assigned once, so the total is O(R × C).

This is the same multi-source BFS as Rotting Oranges, used to produce a distance map instead of a time.

DP alternative: two sweeps. Top-left to bottom-right takes min(up, left) + 1, then bottom-right to top-left takes min(down, right) + 1. Two passes cover all four directions, because any shortest path can be split into a part handled by each sweep. It needs no queue.

Distance maps like this are used in image processing (distance transforms) and game AI ("how far is the nearest wall?").`,
      complexity: 'O(R·C) time and space',
    },
    {
      title: 'Surrounded Regions', fn: 'solveRegions', args: ['board'],
      prompt: 'board contains "X" and "O". Capture every region of "O" completely surrounded by "X" (not connected to the border) by flipping it to "X". Return the board.',
      tests: [[[[['X', 'X', 'X', 'X'], ['X', 'O', 'O', 'X'], ['X', 'X', 'O', 'X'], ['X', 'O', 'X', 'X']]], [['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X'], ['X', 'O', 'X', 'X']]], [[[['X']]], [['X']]], [[[['O', 'O'], ['O', 'O']]], [['O', 'O'], ['O', 'O']]], [[[['X', 'O', 'X'], ['X', 'O', 'X'], ['X', 'X', 'X']]], [['X', 'O', 'X'], ['X', 'O', 'X'], ['X', 'X', 'X']]], [[[['X', 'X', 'X'], ['X', 'O', 'X'], ['X', 'X', 'X']]], [['X', 'X', 'X'], ['X', 'X', 'X'], ['X', 'X', 'X']]]],
      js: String.raw`function solveRegions(board) {
  const R = board.length, C = board[0].length;
  const stack = [];
  // 1. every O connected to the border is safe: mark it '#'
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    if ((r === 0 || c === 0 || r === R - 1 || c === C - 1) && board[r][c] === 'O') stack.push([r, c]);
  }
  while (stack.length) {
    const [r, c] = stack.pop();
    if (r < 0 || r >= R || c < 0 || c >= C || board[r][c] !== 'O') continue;
    board[r][c] = '#';
    stack.push([r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]);
  }
  // 2. remaining O are surrounded -> X; restore safe cells
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    if (board[r][c] === 'O') board[r][c] = 'X';
    else if (board[r][c] === '#') board[r][c] = 'O';
  }
  return board;
}`,
      py: String.raw`def solve_regions(board):
    R, C = len(board), len(board[0])
    stack = [(r, c) for r in range(R) for c in range(C)
             if (r in (0, R - 1) or c in (0, C - 1)) and board[r][c] == "O"]
    while stack:
        r, c = stack.pop()
        if not (0 <= r < R and 0 <= c < C) or board[r][c] != "O":
            continue
        board[r][c] = "#"
        stack.extend(((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)))
    for r in range(R):
        for c in range(C):
            if board[r][c] == "O":
                board[r][c] = "X"
            elif board[r][c] == "#":
                board[r][c] = "O"
    return board`,
      explain: `Finding surrounded regions directly is awkward, because you only know a region is enclosed after exploring all of it. Flip the question: find the regions that are not surrounded, and capture everything else.

A region escapes capture exactly when it touches the border. So:
1. Flood-fill from every "O" on the border, marking the connected cells as safe ("#").
2. Sweep the board: any "O" still there was never reached from the border, so it is enclosed. Flip it to "X". Turn "#" back into "O".

This is the same reversal trick as Pacific Atlantic Water Flow: start from the boundary rather than from every cell.

The JavaScript flood pushes neighbors without checking them, and checks validity when popping. That is simpler code, at the cost of a few extra stack entries. Both styles are O(R × C).

Using a temporary marker ("#") keeps it in place with no visited matrix.

Union-Find alternative: connect every border "O" to a virtual "border" node, union adjacent "O"s, then capture every "O" not connected to that node.`,
      complexity: 'O(R·C) time and space',
    },
    {
      title: 'Minimum Knight Moves', fn: 'minKnightMoves', args: ['x', 'y'],
      prompt: 'A knight starts at (0, 0) on an infinite chessboard. Return the minimum number of moves to reach (x, y). A knight moves 2 squares in one direction and 1 in a perpendicular direction.',
      tests: [[[2, 1], 1], [[5, 5], 4], [[0, 0], 0], [[1, 1], 2], [[-1, 0], 3], [[2, 2], 4], [[3, 0], 3], [[-5, -12], 7]],
      js: String.raw`function minKnightMoves(x, y) {
  // symmetry: the answer for (x, y) equals the answer for (|x|, |y|)
  x = Math.abs(x);
  y = Math.abs(y);
  const moves = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
  const seen = new Set(['0,0']);
  let level = [[0, 0]], steps = 0;
  while (level.length) {
    const next = [];
    for (const [a, b] of level) {
      if (a === x && b === y) return steps;
      for (const [dx, dy] of moves) {
        const p = a + dx, q = b + dy;
        // stay near the first quadrant: a small margin is enough for paths near the axes
        if (p < -2 || q < -2 || p > x + 2 || q > y + 2) continue;
        const key = p + ',' + q;
        if (!seen.has(key)) {
          seen.add(key);
          next.push([p, q]);
        }
      }
    }
    level = next;
    steps++;
  }
  return -1;
}`,
      py: String.raw`def min_knight_moves(x, y):
    x, y = abs(x), abs(y)
    moves = ((1, 2), (2, 1), (2, -1), (1, -2), (-1, -2), (-2, -1), (-2, 1), (-1, 2))
    seen = {(0, 0)}
    level, steps = [(0, 0)], 0
    while level:
        nxt = []
        for a, b in level:
            if a == x and b == y:
                return steps
            for dx, dy in moves:
                p, q = a + dx, b + dy
                if p < -2 or q < -2 or p > x + 2 or q > y + 2:
                    continue
                if (p, q) not in seen:
                    seen.add((p, q))
                    nxt.append((p, q))
        level = nxt
        steps += 1
    return -1`,
      explain: `On an unweighted move graph, BFS from the origin gives the minimum number of moves. The board is infinite, though, so the search needs to be bounded.

1. Symmetry: the board looks the same when mirrored across either axis, so solve for (|x|, |y|) in the first quadrant.
2. Bounding box: an optimal path never needs to stray far outside the rectangle from (0, 0) to the target. A margin of 2 squares is enough, because short detours near the axes are sometimes required. Reaching (1, 1) takes 2 moves, through (2, -1) or similar.
3. BFS level by level, with a seen set of coordinates.

Without the box, BFS would spread across the infinite board in every direction and visit far more cells than necessary.

Faster options:
- Bidirectional BFS from both ends.
- A memoized DFS that reduces (x, y) toward (0, 0), with base cases for small values.
- A closed-form formula exists, but nobody expects it in an interview.

Tricky small cases: (1, 1) takes 2 moves and (2, 2) takes 4. Being next to the target does not make it near for a knight.`,
      complexity: 'O(|x|·|y|) time and space with the bounding box',
    },
  ],
};

export default m;
