import type { ModuleDef } from '../../types';

const SUDOKU_OK = [
  ['5', '3', '.', '.', '7', '.', '.', '.', '.'],
  ['6', '.', '.', '1', '9', '5', '.', '.', '.'],
  ['.', '9', '8', '.', '.', '.', '.', '6', '.'],
  ['8', '.', '.', '.', '6', '.', '.', '.', '3'],
  ['4', '.', '.', '8', '.', '3', '.', '.', '1'],
  ['7', '.', '.', '.', '2', '.', '.', '.', '6'],
  ['.', '6', '.', '.', '.', '.', '2', '8', '.'],
  ['.', '.', '.', '4', '1', '9', '.', '.', '5'],
  ['.', '.', '.', '.', '8', '.', '.', '7', '9'],
];
const SUDOKU_BAD = SUDOKU_OK.map((r, i) => (i === 0 ? ['8', ...r.slice(1)] : r));
const SUDOKU_BOX = SUDOKU_OK.map((r, i) => (i === 1 ? ['6', '5', ...r.slice(2)] : r)); // two 5s in the top-left box

const m: ModuleDef = {
  id: 'matrix',
  title: 'Matrices & Grids',
  description: 'Index arithmetic, in-place transforms and exploring grids with DFS/BFS.',
  challenges: [
    {
      title: 'Transpose a Matrix', fn: 'transpose', args: ['matrix'],
      prompt: 'Return the transpose of matrix: rows become columns, so result[j][i] = matrix[i][j]. The matrix may be rectangular.',
      tests: [[[[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], [[1, 4, 7], [2, 5, 8], [3, 6, 9]]], [[[[1, 2, 3], [4, 5, 6]]], [[1, 4], [2, 5], [3, 6]]], [[[[1]]], [[1]]], [[[[1, 2]]], [[1], [2]]]],
      js: String.raw`function transpose(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const out = Array.from({ length: cols }, () => new Array(rows));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) out[j][i] = matrix[i][j];
  }
  return out;
}`,
      py: String.raw`def transpose(matrix):
    return [list(row) for row in zip(*matrix)]`,
      explain: `Transposing flips a matrix across its main diagonal, so the element at (i, j) moves to (j, i).

For an R × C matrix the result is C × R, so allocate the output with swapped dimensions and copy every element across.

Python's zip(*matrix) is a classic idiom. The * unpacks the rows as separate arguments, and zip groups their first elements, then their second elements, and so on. Those groups are the columns.

In-place transposition only works for square matrices: swap matrix[i][j] with matrix[j][i] for j > i, so each pair is swapped exactly once.

Transposition is the first step of rotating an image (next challenge) and is a core operation in linear algebra and data reshaping (pandas .T, numpy .T).`,
      complexity: 'O(R·C) time and space',
    },
    {
      title: 'Rotate Image', fn: 'rotate', args: ['matrix'],
      prompt: 'Rotate the n × n matrix 90° clockwise in place, then return it.',
      tests: [[[[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], [[7, 4, 1], [8, 5, 2], [9, 6, 3]]], [[[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]], [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]]], [[[[1]]], [[1]]], [[[[1, 2], [3, 4]]], [[3, 1], [4, 2]]]],
      js: String.raw`function rotate(matrix) {
  const n = matrix.length;
  // 1. transpose
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
  }
  // 2. reverse each row
  for (const row of matrix) row.reverse();
  return matrix;
}`,
      py: String.raw`def rotate(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:
        row.reverse()
    return matrix`,
      explain: `A 90° clockwise rotation is the same as a transpose followed by mirroring each row.

1. Transpose: swap (i, j) with (j, i) above the diagonal. The first row becomes the first column.
2. Reverse every row. That puts the first column on the right, which is where a clockwise turn sends it.

Check with the top-left corner: (0, 0) moves to (0, n-1) after the two steps, which is the top-right corner, and that is correct for a clockwise turn.

Other rotations follow the same idea:
- Counter-clockwise: transpose, then reverse each column (or reverse the rows first, then transpose).
- 180°: reverse the row order and reverse each row.

The other in-place method rotates four cells at a time in rings. It is also O(n²) but much easier to get wrong. Breaking a transformation into simpler steps you already trust is a reliable strategy.`,
      complexity: 'O(n²) time, O(1) extra space',
    },
    {
      title: 'Spiral Order', fn: 'spiralOrder', args: ['matrix'],
      prompt: 'Return all elements of the matrix in spiral order: along the top row, down the right column, back along the bottom row, up the left column, then repeat inward.',
      tests: [[[[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], [1, 2, 3, 6, 9, 8, 7, 4, 5]], [[[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]], [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]], [[[[1]]], [1]], [[[[1, 2], [3, 4]]], [1, 2, 4, 3]], [[[[1], [2], [3]]], [1, 2, 3]], [[[]], []]],
      js: String.raw`function spiralOrder(matrix) {
  const out = [];
  if (!matrix.length) return out;
  let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let j = left; j <= right; j++) out.push(matrix[top][j]);
    top++;
    for (let i = top; i <= bottom; i++) out.push(matrix[i][right]);
    right--;
    if (top <= bottom) {
      for (let j = right; j >= left; j--) out.push(matrix[bottom][j]);
      bottom--;
    }
    if (left <= right) {
      for (let i = bottom; i >= top; i--) out.push(matrix[i][left]);
      left++;
    }
  }
  return out;
}`,
      py: String.raw`def spiral_order(matrix):
    out = []
    if not matrix:
        return out
    top, bottom, left, right = 0, len(matrix) - 1, 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for j in range(left, right + 1):
            out.append(matrix[top][j])
        top += 1
        for i in range(top, bottom + 1):
            out.append(matrix[i][right])
        right -= 1
        if top <= bottom:
            for j in range(right, left - 1, -1):
                out.append(matrix[bottom][j])
            bottom -= 1
        if left <= right:
            for i in range(bottom, top - 1, -1):
                out.append(matrix[i][left])
            left += 1
    return out`,
      explain: `Keep four boundaries (top, bottom, left, right) and peel the matrix like an onion, one layer at a time.

Each lap:
1. Read the top row from left to right, then move top down.
2. Read the right column from top to bottom, then move right inward.
3. If rows remain, read the bottom row from right to left, then move bottom up.
4. If columns remain, read the left column from bottom to top, then move left inward.

The two "if" checks are the tricky part. For a single remaining row or column, steps 1 and 2 already read it. Without the checks, steps 3 and 4 would read the same cells again backwards. The 3 × 1 and 3 × 4 tests exist to catch exactly that.

Boundary shrinking is clearer than simulating "turn right when you hit a wall" with a visited matrix, and it needs no extra memory.`,
      complexity: 'O(R·C) time, O(1) extra space',
    },
    {
      title: 'Set Matrix Zeroes', fn: 'setZeroes', args: ['matrix'],
      prompt: 'If an element is 0, set its entire row and column to 0. Do it in place using O(1) extra space and return the matrix.',
      tests: [[[[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], [[1, 0, 1], [0, 0, 0], [1, 0, 1]]], [[[[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]], [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]], [[[[1]]], [[1]]], [[[[0]]], [[0]]], [[[[1, 0], [1, 1]]], [[0, 0], [1, 0]]]],
      js: String.raw`function setZeroes(matrix) {
  const R = matrix.length, C = matrix[0].length;
  const firstRowZero = matrix[0].some((v) => v === 0);
  const firstColZero = matrix.some((row) => row[0] === 0);
  // use the first row/column as markers
  for (let i = 1; i < R; i++)
    for (let j = 1; j < C; j++)
      if (matrix[i][j] === 0) matrix[i][0] = matrix[0][j] = 0;
  for (let i = 1; i < R; i++)
    for (let j = 1; j < C; j++)
      if (matrix[i][0] === 0 || matrix[0][j] === 0) matrix[i][j] = 0;
  if (firstRowZero) matrix[0].fill(0);
  if (firstColZero) for (const row of matrix) row[0] = 0;
  return matrix;
}`,
      py: String.raw`def set_zeroes(matrix):
    R, C = len(matrix), len(matrix[0])
    first_row_zero = any(v == 0 for v in matrix[0])
    first_col_zero = any(row[0] == 0 for row in matrix)
    for i in range(1, R):
        for j in range(1, C):
            if matrix[i][j] == 0:
                matrix[i][0] = 0
                matrix[0][j] = 0
    for i in range(1, R):
        for j in range(1, C):
            if matrix[i][0] == 0 or matrix[0][j] == 0:
                matrix[i][j] = 0
    if first_row_zero:
        for j in range(C):
            matrix[0][j] = 0
    if first_col_zero:
        for row in matrix:
            row[0] = 0
    return matrix`,
      explain: `The trap: if you zero rows and columns the moment you find a 0, the new zeros look like original zeros and spread across the whole matrix. Record first, then apply.

The simple way records the zero rows and zero columns in two sets, using O(R + C) space. To get O(1), store those marks inside the matrix itself:
1. Remember whether row 0 and column 0 originally contained a zero, because they are about to be used as storage.
2. For each zero at (i, j) inside the rest of the matrix, mark matrix[i][0] = 0 and matrix[0][j] = 0.
3. Zero every inner cell whose row marker or column marker is 0.
4. Finally zero row 0 and column 0 if the flags from step 1 say so.

The first row and column are handled last, because they hold the markers the other steps depend on.

Reusing part of the input as scratch space is a common way to meet an O(1) space requirement.`,
      complexity: 'O(R·C) time, O(1) extra space',
    },
    {
      title: 'Number of Islands', fn: 'numIslands', args: ['grid'],
      prompt: 'grid is a 2D map of "1" (land) and "0" (water). An island is land connected horizontally or vertically. Return the number of islands.',
      tests: [[[[['1', '1', '1', '1', '0'], ['1', '1', '0', '1', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '0', '0', '0']]], 1], [[[['1', '1', '0', '0', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '1', '0', '0'], ['0', '0', '0', '1', '1']]], 3], [[[['0']]], 0], [[[['1', '0', '1'], ['0', '1', '0'], ['1', '0', '1']]], 5], [[[]], 0]],
      js: String.raw`function numIslands(grid) {
  if (!grid.length) return 0;
  const R = grid.length, C = grid[0].length;
  let count = 0;
  const sink = (r, c) => {
    const stack = [[r, c]];
    grid[r][c] = '0';
    while (stack.length) {
      const [i, j] = stack.pop();
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const a = i + di, b = j + dj;
        if (a >= 0 && a < R && b >= 0 && b < C && grid[a][b] === '1') {
          grid[a][b] = '0';
          stack.push([a, b]);
        }
      }
    }
  };
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (grid[r][c] === '1') {
        count++;
        sink(r, c);
      }
  return count;
}`,
      py: String.raw`def num_islands(grid):
    if not grid:
        return 0
    R, C = len(grid), len(grid[0])
    count = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] != "1":
                continue
            count += 1
            grid[r][c] = "0"
            stack = [(r, c)]
            while stack:
                i, j = stack.pop()
                for a, b in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
                    if 0 <= a < R and 0 <= b < C and grid[a][b] == "1":
                        grid[a][b] = "0"
                        stack.append((a, b))
    return count`,
      explain: `This is the classic connected-components problem on a grid.

1. Scan every cell.
2. When you find unvisited land, you have found a new island, so count it. Then sink the whole island: flood outward through neighboring land cells, marking each as water.
3. Because the island is now gone, the scan will not count it again.

The flood fill here uses an explicit stack (iterative DFS). A recursive DFS is shorter, but very large islands can overflow the call stack. BFS with a queue works just as well.

Mark a cell when you push it, not when you pop it. Otherwise the same cell can be pushed many times by different neighbors.

Each cell is visited a constant number of times, so the total is O(R × C).

Modifying the grid saves memory. If you must keep the input intact, use a separate visited set instead.

Union-Find is an alternative, and is especially useful when land is added over time (Number of Islands II).`,
      complexity: 'O(R·C) time, O(R·C) worst-case stack space',
    },
    {
      title: 'Flood Fill', fn: 'floodFill', args: ['image', 'sr', 'sc', 'color'],
      prompt: 'Starting from pixel (sr, sc), change it and every pixel connected to it (4-directionally) that has the same original color to the new color. Return the image. This is the paint bucket tool.',
      tests: [[[[[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2], [[2, 2, 2], [2, 2, 0], [2, 0, 1]]], [[[[0, 0, 0], [0, 0, 0]], 0, 0, 0], [[0, 0, 0], [0, 0, 0]]], [[[[0, 0, 0], [0, 1, 1]], 1, 1, 1], [[0, 0, 0], [0, 1, 1]]], [[[[5]], 0, 0, 9], [[9]]]],
      js: String.raw`function floodFill(image, sr, sc, color) {
  const start = image[sr][sc];
  if (start === color) return image; // nothing to do (and avoids looping forever)
  const R = image.length, C = image[0].length;
  const queue = [[sr, sc]];
  image[sr][sc] = color;
  while (queue.length) {
    const [i, j] = queue.shift();
    for (const [a, b] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) {
      if (a >= 0 && a < R && b >= 0 && b < C && image[a][b] === start) {
        image[a][b] = color;
        queue.push([a, b]);
      }
    }
  }
  return image;
}`,
      py: String.raw`from collections import deque

def flood_fill(image, sr, sc, color):
    start = image[sr][sc]
    if start == color:
        return image
    R, C = len(image), len(image[0])
    q = deque([(sr, sc)])
    image[sr][sc] = color
    while q:
        i, j = q.popleft()
        for a, b in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
            if 0 <= a < R and 0 <= b < C and image[a][b] == start:
                image[a][b] = color
                q.append((a, b))
    return image`,
      explain: `This is the same graph traversal as Number of Islands, written as BFS.

1. Remember the original color at the start pixel.
2. Recolor the start and add it to a queue.
3. Repeatedly take a pixel from the queue and recolor each in-bounds neighbor that still has the original color, adding it to the queue.

Recoloring a pixel doubles as marking it visited, because it no longer matches the original color.

The early return matters: if the new color equals the original, recolored pixels would still match, and the fill would revisit the same pixels forever.

BFS or DFS? Both visit the same pixels. BFS spreads out in rings, which is useful when you need distances, such as shortest paths in a maze. In Python use collections.deque, whose popleft is O(1). In JavaScript, shift() is O(n), which is fine for small grids. For large ones, use a head index into the array instead.`,
      complexity: 'O(R·C) time and space',
    },
    {
      title: 'Valid Sudoku', fn: 'isValidSudoku', args: ['board'],
      prompt: 'board is a 9×9 grid of "1"–"9" or ".". Return true if the filled cells are valid: no repeated digit in any row, column or 3×3 box. The puzzle does not need to be solvable.',
      tests: [[[SUDOKU_OK], true], [[SUDOKU_BAD], false], [[SUDOKU_BOX], false], [[Array.from({ length: 9 }, () => new Array(9).fill('.'))], true]],
      js: String.raw`function isValidSudoku(board) {
  const seen = new Set();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = board[r][c];
      if (v === '.') continue;
      const box = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      const keys = ['r' + r + v, 'c' + c + v, 'b' + box + v];
      if (keys.some((k) => seen.has(k))) return false;
      keys.forEach((k) => seen.add(k));
    }
  }
  return true;
}`,
      py: String.raw`def is_valid_sudoku(board):
    seen = set()
    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if v == ".":
                continue
            keys = (("r", r, v), ("c", c, v), ("b", r // 3, c // 3, v))
            if any(k in seen for k in keys):
                return False
            seen.update(keys)
    return True`,
      explain: `Make one pass over the board and check three constraints for every filled cell.

A clean trick: put every fact into a single set, such as "digit 5 is in row 0", "digit 5 is in column 0" and "digit 5 is in box 0". If any of those facts is already in the set, there is a duplicate.

Box index: (r // 3, c // 3) identifies which of the 9 boxes the cell belongs to. As a single number, that is floor(r / 3) × 3 + floor(c / 3), from 0 to 8.

Encoding the keys:
- JavaScript uses strings like "r05", meaning row 0 has a 5.
- Python uses tuples, which can be stored in sets directly.

Alternatives use 27 separate sets, or 27 bitmasks of 9 bits each for speed. They all check the same constraints.

The board here has a fixed size of 81 cells, so it is O(1) in theory. In general it is O(n²) for an n × n Sudoku.`,
      complexity: 'O(81) = O(1) time and space',
    },
    {
      title: "Game of Life", fn: 'gameOfLife', args: ['board'],
      prompt: 'board is a grid of 1 (alive) and 0 (dead). Compute the next generation: a live cell with 2 or 3 live neighbors survives, a dead cell with exactly 3 live neighbors becomes alive, and every other cell dies or stays dead. The 8 surrounding cells are neighbors. Update in place and return the board.',
      tests: [[[[[0, 1, 0], [0, 0, 1], [1, 1, 1], [0, 0, 0]]], [[0, 0, 0], [1, 0, 1], [0, 1, 1], [0, 1, 0]]], [[[[1, 1], [1, 0]]], [[1, 1], [1, 1]]], [[[[1]]], [[0]]], [[[[0, 0, 0], [1, 1, 1], [0, 0, 0]]], [[0, 1, 0], [0, 1, 0], [0, 1, 0]]]],
      js: String.raw`function gameOfLife(board) {
  const R = board.length, C = board[0].length;
  // bit 0 = current state, bit 1 = next state
  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      let live = 0;
      for (let di = -1; di <= 1; di++)
        for (let dj = -1; dj <= 1; dj++) {
          if (!di && !dj) continue;
          const a = i + di, b = j + dj;
          if (a >= 0 && a < R && b >= 0 && b < C) live += board[a][b] & 1;
        }
      const alive = board[i][j] & 1;
      if ((alive && (live === 2 || live === 3)) || (!alive && live === 3)) board[i][j] |= 2;
    }
  }
  for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) board[i][j] >>= 1;
  return board;
}`,
      py: String.raw`def game_of_life(board):
    R, C = len(board), len(board[0])
    for i in range(R):
        for j in range(C):
            live = 0
            for di in (-1, 0, 1):
                for dj in (-1, 0, 1):
                    if di == 0 and dj == 0:
                        continue
                    a, b = i + di, j + dj
                    if 0 <= a < R and 0 <= b < C:
                        live += board[a][b] & 1
            alive = board[i][j] & 1
            if (alive and live in (2, 3)) or (not alive and live == 3):
                board[i][j] |= 2
    for i in range(R):
        for j in range(C):
            board[i][j] >>= 1
    return board`,
      explain: `Every cell must update at the same moment. If you overwrite cells as you go, later cells count neighbors that have already changed.

Copying the board is the easy fix, at O(R × C) extra space. In-place trick: store both generations in each cell using bits.
- Bit 0 holds the current state (what the cell is now).
- Bit 1 holds the next state (what it will become).

Pass 1: count each cell's live neighbors using only bit 0 (value & 1), so the next-state bits never affect the count. If the cell lives in the next generation, set bit 1 (|= 2).
Pass 2: shift every cell right by one (>>= 1), so the next state becomes the current state.

The rules, written compactly: the cell is alive next if it has exactly 3 neighbors, or if it is alive now and has exactly 2.

The 3 × 3 "blinker" test shows a horizontal line of three turning vertical, a classic period-2 oscillator.

Packing extra state into unused bits is a standard low-level technique for meeting O(1) space limits.`,
      complexity: 'O(R·C) time, O(1) extra space',
    },
    {
      title: 'Max Area of Island', fn: 'maxAreaOfIsland', args: ['grid'],
      prompt: 'grid contains 0 (water) and 1 (land). Return the area (number of cells) of the largest island, connected 4-directionally, or 0 if there is no land.',
      tests: [[[[[0, 0, 1, 0, 0], [1, 1, 1, 0, 0], [0, 0, 0, 1, 1], [0, 0, 0, 1, 0]]], 4], [[[[0, 0, 0]]], 0], [[[[1]]], 1], [[[[1, 1], [1, 1]]], 4], [[[[1, 0, 1], [0, 1, 0]]], 1]],
      js: String.raw`function maxAreaOfIsland(grid) {
  const R = grid.length, C = grid[0].length;
  let best = 0;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] !== 1) continue;
      let area = 0;
      const stack = [[r, c]];
      grid[r][c] = 0;
      while (stack.length) {
        const [i, j] = stack.pop();
        area++;
        for (const [a, b] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) {
          if (a >= 0 && a < R && b >= 0 && b < C && grid[a][b] === 1) {
            grid[a][b] = 0;
            stack.push([a, b]);
          }
        }
      }
      best = Math.max(best, area);
    }
  }
  return best;
}`,
      py: String.raw`def max_area_of_island(grid):
    R, C = len(grid), len(grid[0])
    best = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] != 1:
                continue
            area = 0
            grid[r][c] = 0
            stack = [(r, c)]
            while stack:
                i, j = stack.pop()
                area += 1
                for a, b in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
                    if 0 <= a < R and 0 <= b < C and grid[a][b] == 1:
                        grid[a][b] = 0
                        stack.append((a, b))
            best = max(best, area)
    return best`,
      explain: `This is Number of Islands with one change: instead of counting islands, measure each one.

During each flood fill, count the cells you pop. That count is the island's area. Keep the maximum.

1. Scan for land.
2. Flood the island with an iterative DFS, sinking cells as you go and counting each one.
3. Update the best area.

The two diagonal 1s in the last test, (0, 0) and (1, 1), touch only at a corner, so they are separate islands of area 1. The 4-directional connectivity rule matters.

This template, "scan, flood each component, compute something about it", answers many grid questions: perimeter of an island, number of distinct island shapes, the largest island after flipping one 0, and enclosed regions.`,
      complexity: 'O(R·C) time and space',
    },
    {
      title: 'Spiral Matrix II', fn: 'generateMatrix', args: ['n'],
      prompt: 'Return an n × n matrix filled with 1 to n² in spiral order, starting at the top-left and moving clockwise.',
      tests: [[[3], [[1, 2, 3], [8, 9, 4], [7, 6, 5]]], [[1], [[1]]], [[2], [[1, 2], [4, 3]]], [[4], [[1, 2, 3, 4], [12, 13, 14, 5], [11, 16, 15, 6], [10, 9, 8, 7]]]],
      js: String.raw`function generateMatrix(n) {
  const m = Array.from({ length: n }, () => new Array(n).fill(0));
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // right, down, left, up
  let r = 0, c = 0, d = 0;
  for (let v = 1; v <= n * n; v++) {
    m[r][c] = v;
    const nr = r + dirs[d][0], nc = c + dirs[d][1];
    if (nr < 0 || nr >= n || nc < 0 || nc >= n || m[nr][nc] !== 0) d = (d + 1) % 4; // turn right
    r += dirs[d][0];
    c += dirs[d][1];
  }
  return m;
}`,
      py: String.raw`def generate_matrix(n):
    m = [[0] * n for _ in range(n)]
    dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    r = c = d = 0
    for v in range(1, n * n + 1):
        m[r][c] = v
        nr, nc = r + dirs[d][0], c + dirs[d][1]
        if not (0 <= nr < n and 0 <= nc < n) or m[nr][nc] != 0:
            d = (d + 1) % 4
        r += dirs[d][0]
        c += dirs[d][1]
    return m`,
      explain: `This is the reverse of Spiral Order, solved by simulating a walker instead of shrinking boundaries. Seeing both approaches is useful.

1. Keep a direction index into [right, down, left, up].
2. Place the next number, then look one step ahead.
3. If that step would leave the grid or land on a filled cell (non-zero), turn right with d = (d + 1) % 4.
4. Take the step.

The direction array plus % 4 is a compact way to cycle through directions. The same idea controls movement in grid games and in robot simulations.

Using 0 as "empty" works because the numbers we place start at 1.

Boundary shrinking (as in Spiral Order) needs no lookahead check. Simulation is often easier to get right when the path rules are more complicated. Both are O(n²).`,
      complexity: 'O(n²) time, O(n²) space for the output',
    },
  ],
};

export default m;
