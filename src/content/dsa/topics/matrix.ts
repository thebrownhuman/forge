import type { Topic } from '../../schema';

export const matrix: Topic = {
  id: 'matrix',
  name: 'Matrix & Grid',
  phase: 2,
  estHours: 6,
  prerequisites: ['arrays'],

  whyItMatters:
    'A grid is a graph in disguise — every cell is a node and its four neighbours are its edges. Getting comfortable with grid indexing here means the graph topic in Phase 3 is about the algorithm rather than about bounds checking. The in-place transformation problems are also a favourite because they test whether you can manipulate indices carefully under pressure, with no data structure to hide behind.',

  fundamentals: [
    {
      heading: 'The four-direction loop, written once',
      body:
        'Store the direction deltas in an array and loop over them. It is shorter than four copy-pasted blocks, impossible to get subtly wrong in one of the four, and extends to eight directions by adding four entries. Check bounds BEFORE reading the cell — reversing that order is an out-of-bounds read in C++ and an exception in Java.',
      code: {
        cpp: `const int dr[4] = {-1, 1, 0, 0};
const int dc[4] = {0, 0, -1, 1};

for (int d = 0; d < 4; ++d) {
  int nr = r + dr[d], nc = c + dc[d];
  if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;   // bounds FIRST
  visit(nr, nc);
}`,
        java: `int[][] DIRS = {{-1,0},{1,0},{0,-1},{0,1}};

for (int[] d : DIRS) {
  int nr = r + d[0], nc = c + d[1];
  if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
  visit(nr, nc);
}`,
      },
      costs: [
        { op: 'full traversal', cost: 'O(R·C)', note: 'every cell once' },
        { op: 'flood fill / DFS', cost: 'O(R·C)', note: 'with a visited marker' },
        { op: 'BFS queue', cost: 'O(R·C)', note: 'queue holds up to O(min(R,C)) in a frontier' },
      ],
    },
    {
      heading: 'Flattening a grid into one index',
      body:
        'A cell (r, c) maps to the single index r * C + c, and back via index / C and index % C. This is essential when you need a grid cell as a hash key in C++ (where a pair is not hashable by default), as a union-find element, or when binary searching a fully sorted matrix as if it were one array. Note it is r * C + c — multiply by the number of COLUMNS, not rows. Getting that backwards is a classic silent bug on non-square grids.',
    },
    {
      heading: 'Mark visited in the grid itself',
      body:
        'For flood fill and connected-component problems, overwriting the cell is usually cheaper and simpler than a separate visited array — write a sentinel value and either restore it or leave it, depending on whether the input may be mutated. Always ask whether mutating the input is acceptable; if not, a visited array is the honest answer and costs O(R·C) bits.',
    },
    {
      heading: 'In-place transformations: do it in layers',
      body:
        'Rotating or spiralling a matrix in place is about processing one concentric ring at a time, with four indices moving together. The alternative trick for a 90-degree rotation is far easier to remember: transpose the matrix, then reverse each row. Deriving that on a 3x3 grid by hand takes thirty seconds and is much more reliable than juggling four-way swaps under pressure.',
    },
  ],

  questionTypes: [
    {
      id: 'grid-traversal',
      name: 'Flood fill and connected components',
      signal:
        '"Count the islands", "size of the region", "surrounded areas", "number of distinct shapes". Start a DFS or BFS from each unvisited qualifying cell; each launch is one component.',
      time: 'O(R·C)',
      space: 'O(R·C) worst case',
      googleHeavy: true,
      template: {
        cpp: `void flood(int r, int c) {
  if (r < 0 || r >= R || c < 0 || c >= C) return;
  if (grid[r][c] != '1') return;               // wrong cell type, or already visited

  grid[r][c] = '0';                            // mark BEFORE recursing, or infinite loop
  flood(r + 1, c); flood(r - 1, c);
  flood(r, c + 1); flood(r, c - 1);
}

int components = 0;
for (int r = 0; r < R; ++r)
  for (int c = 0; c < C; ++c)
    if (grid[r][c] == '1') { ++components; flood(r, c); }`,
        java: `void flood(char[][] grid, int r, int c) {
  if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return;
  if (grid[r][c] != '1') return;

  grid[r][c] = '0';
  flood(grid, r + 1, c); flood(grid, r - 1, c);
  flood(grid, r, c + 1); flood(grid, r, c - 1);
}`,
      },
      taught: {
        lc: 200,
        title: 'Number of Islands',
        slug: 'number-of-islands',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'Every time you find unvisited land, that is one new island — then sink the entire connected region so it is never counted again. The count is the number of launches.',
        companies: ['google', 'amazon', 'meta', 'microsoft'],
        whyThisOne:
          'The single most-asked grid problem, and the bridge to graph traversal: it is connected components with the adjacency list left implicit.',
        walkthrough: {
          howToSeeIt: [
            'An island is a connected component of land cells. Counting components means: start a traversal from each unvisited node, and count how many traversals you had to start.',
            'Scan the grid. On hitting a land cell you have not seen, increment the count and launch a flood fill that reaches every cell of that island.',
            'The flood marks each visited cell — here by overwriting land with water, which doubles as the visited set at no memory cost. Ask whether mutating the input is allowed; if not, use a separate visited array.',
            'Mark BEFORE recursing into neighbours. Marking afterwards lets two adjacent cells call into each other endlessly and the stack overflows.',
          ],
          wherePeopleLoseIt:
            'Two things. Marking after the recursion instead of before, giving infinite recursion. And the stack itself: on a 300x300 grid of all land, DFS recurses 90,000 deep and can overflow — the safe answer under that constraint is an explicit BFS queue, and saying so unprompted is a real signal.',
          time: 'O(R·C) — each cell visited at most twice.',
          space: 'O(R·C) worst case for recursion or the queue.',
          code: {
            cpp: `class Solution {
  int R, C;

  void sink(vector<vector<char>>& grid, int r, int c) {
    if (r < 0 || r >= R || c < 0 || c >= C) return;   // bounds first
    if (grid[r][c] != '1') return;                    // water, or already sunk

    grid[r][c] = '0';                                 // mark BEFORE recursing

    sink(grid, r + 1, c);
    sink(grid, r - 1, c);
    sink(grid, r, c + 1);
    sink(grid, r, c - 1);
  }

public:
  int numIslands(vector<vector<char>>& grid) {
    if (grid.empty()) return 0;
    R = (int)grid.size(); C = (int)grid[0].size();

    int islands = 0;
    for (int r = 0; r < R; ++r)
      for (int c = 0; c < C; ++c)
        if (grid[r][c] == '1') { ++islands; sink(grid, r, c); }

    return islands;
  }
};`,
            java: `class Solution {
  public int numIslands(char[][] grid) {
    if (grid.length == 0) return 0;

    int islands = 0;
    for (int r = 0; r < grid.length; r++)
      for (int c = 0; c < grid[0].length; c++)
        if (grid[r][c] == '1') { islands++; sink(grid, r, c); }

    return islands;
  }

  private void sink(char[][] grid, int r, int c) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return;
    if (grid[r][c] != '1') return;

    grid[r][c] = '0';

    sink(grid, r + 1, c);
    sink(grid, r - 1, c);
    sink(grid, r, c + 1);
    sink(grid, r, c - 1);
  }
}`,
          },
          followUp: 'Islands appear one at a time as land is added (LC 305) — re-running the scan is too slow, so that is union-find, which is exactly why the two topics sit next to each other.',
        },
      },
      practice: [
        {
          lc: 695,
          title: 'Max Area of Island',
          slug: 'max-area-of-island',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight: 'Same flood, but it RETURNS a size: 1 plus the four recursive results. The first grid problem where the traversal computes a value.',
        },
        {
          lc: 130,
          title: 'Surrounded Regions',
          slug: 'surrounded-regions',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight:
            'Flipped: rather than finding enclosed regions, flood from the BORDER to mark everything safe. Inverting the search target is the whole trick.',
        },
      ],
    },

    {
      id: 'in-place-transform',
      name: 'In-place transformations',
      signal:
        '"Rotate the image in place", "set zeroes without extra space", "transpose". The constraint is O(1) extra space, so you must encode any bookkeeping inside the matrix itself.',
      time: 'O(R·C)',
      space: 'O(1)',
      template: {
        cpp: `// 90 degrees clockwise = transpose, then reverse each row.
for (int r = 0; r < n; ++r)
  for (int c = r + 1; c < n; ++c)          // c starts at r+1, or you swap back
    swap(m[r][c], m[c][r]);

for (auto& row : m) reverse(row.begin(), row.end());`,
        java: `for (int r = 0; r < n; r++)
  for (int c = r + 1; c < n; c++) {
    int t = m[r][c]; m[r][c] = m[c][r]; m[c][r] = t;
  }

for (int[] row : m) {
  for (int i = 0, j = n - 1; i < j; i++, j--) { int t = row[i]; row[i] = row[j]; row[j] = t; }
}`,
      },
      taught: {
        lc: 48,
        title: 'Rotate Image',
        slug: 'rotate-image',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 30,
        insight:
          'Rotating 90 degrees clockwise equals transposing then reversing each row. Two simple passes beat one confusing four-way ring swap every time.',
        companies: ['google', 'amazon', 'microsoft'],
        whyThisOne:
          'It rewards finding a decomposition instead of brute-forcing index arithmetic, which is a habit worth building — and the transpose-plus-reverse identity is genuinely memorable.',
        walkthrough: {
          howToSeeIt: [
            'The direct approach rotates four cells at a time around each ring, which works but needs four index expressions that are easy to get wrong under pressure. Look for a decomposition first.',
            'Write out a 3x3 grid and apply a transpose — rows become columns. Compare that with the target rotation and you will see each row is reversed. So rotation = transpose then reverse rows.',
            'Transpose in place by swapping m[r][c] with m[c][r], but only for c > r. Looping over all c swaps every pair twice and returns the original matrix — a bug that produces suspiciously correct-looking output on symmetric inputs.',
            'Then reverse each row, which is a single two-pointer pass per row. Both steps are O(R·C) and O(1) space.',
          ],
          wherePeopleLoseIt:
            'Starting the inner loop at c = 0 during the transpose, which undoes every swap. Also, for counter-clockwise the order changes: reverse each row FIRST, then transpose — or transpose and reverse the columns. Derive it rather than guessing.',
          time: 'O(n^2).',
          space: 'O(1).',
          code: {
            cpp: `void rotate(vector<vector<int>>& matrix) {
  int n = (int)matrix.size();

  // 1. Transpose: swap across the main diagonal, each pair ONCE.
  for (int r = 0; r < n; ++r)
    for (int c = r + 1; c < n; ++c)      // c = r + 1, not 0
      swap(matrix[r][c], matrix[c][r]);

  // 2. Reverse each row.
  for (auto& row : matrix)
    reverse(row.begin(), row.end());
}`,
            java: `public void rotate(int[][] matrix) {
  int n = matrix.length;

  for (int r = 0; r < n; r++)
    for (int c = r + 1; c < n; c++) {
      int t = matrix[r][c];
      matrix[r][c] = matrix[c][r];
      matrix[c][r] = t;
    }

  for (int[] row : matrix)
    for (int i = 0, j = n - 1; i < j; i++, j--) {
      int t = row[i]; row[i] = row[j]; row[j] = t;
    }
}`,
          },
          followUp: 'Rotate counter-clockwise, and rotate a non-square matrix — the latter cannot be done in place at all, which is worth being able to explain.',
        },
      },
      practice: [
        {
          lc: 73,
          title: 'Set Matrix Zeroes',
          slug: 'set-matrix-zeroes',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight:
            'O(1) space means storing the marks in the matrix: use row 0 and column 0 as flag arrays, with one extra variable for their overlap. The overlap is the entire difficulty.',
          companies: ['google', 'amazon'],
        },
        {
          lc: 289,
          title: 'Game of Life',
          slug: 'game-of-life',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight:
            'Flipped: all updates must appear simultaneous, so encode old and new state in the same cell using two bits, then shift everything down in a second pass.',
        },
      ],
    },

    {
      id: 'matrix-walk',
      name: 'Directed walks and spiral order',
      signal:
        '"Spiral order", "diagonal traversal", "walk until you hit a wall then turn". Maintain boundaries that shrink, or a direction index that advances modulo 4.',
      time: 'O(R·C)',
      space: 'O(1) beyond the output',
      template: {
        cpp: `int top = 0, bottom = R - 1, left = 0, right = C - 1;

while (top <= bottom && left <= right) {
  for (int c = left; c <= right; ++c) out.push_back(m[top][c]);
  ++top;

  for (int r = top; r <= bottom; ++r) out.push_back(m[r][right]);
  --right;

  if (top <= bottom) {                       // guard: the row may be exhausted
    for (int c = right; c >= left; --c) out.push_back(m[bottom][c]);
    --bottom;
  }
  if (left <= right) {                       // guard: the column may be exhausted
    for (int r = bottom; r >= top; --r) out.push_back(m[r][left]);
    ++left;
  }
}`,
        java: `int top = 0, bottom = R - 1, left = 0, right = C - 1;

while (top <= bottom && left <= right) {
  for (int c = left; c <= right; c++) out.add(m[top][c]);
  top++;

  for (int r = top; r <= bottom; r++) out.add(m[r][right]);
  right--;

  if (top <= bottom) { for (int c = right; c >= left; c--) out.add(m[bottom][c]); bottom--; }
  if (left <= right) { for (int r = bottom; r >= top; r--) out.add(m[r][left]); left++; }
}`,
      },
      taught: {
        lc: 54,
        title: 'Spiral Matrix',
        slug: 'spiral-matrix',
        difficulty: 'medium',
        role: 'taught',
        estMinutes: 35,
        insight:
          'Track four shrinking boundaries rather than a position and a direction. The two guards before the bottom and left passes are what handle single-row and single-column leftovers.',
        companies: ['google', 'amazon', 'microsoft'],
        whyThisOne:
          'It has no algorithmic depth and enormous edge-case depth, which makes it a pure test of careful index reasoning — exactly what some interviewers are probing for.',
        walkthrough: {
          howToSeeIt: [
            'Two workable designs. Boundaries: four variables that shrink after each pass. Direction vector: a position plus a direction index that turns when it would leave the region. Boundaries are easier to reason about, so use them.',
            'One full loop iteration handles four passes: left-to-right along the top, top-to-bottom along the right, right-to-left along the bottom, bottom-to-top along the left. After each pass, retract that boundary.',
            'The subtlety is a non-square leftover. After the first two passes the remaining region may be a single row or a single column, and running the third or fourth pass then re-visits cells already emitted.',
            'So guard the bottom pass with top <= bottom and the left pass with left <= right. Those two ifs are the whole problem; everything else is mechanical.',
          ],
          wherePeopleLoseIt:
            'Omitting the guards. Square matrices pass every test, and a 3x1 or 1x3 input produces duplicated values. Build a 1x4 and a 4x1 by hand before submitting — they are the two cases that catch it.',
          time: 'O(R·C) — each cell emitted once.',
          space: 'O(1) beyond the output.',
          code: {
            cpp: `vector<int> spiralOrder(vector<vector<int>>& matrix) {
  vector<int> out;
  if (matrix.empty()) return out;

  int top = 0, bottom = (int)matrix.size() - 1;
  int left = 0, right = (int)matrix[0].size() - 1;

  while (top <= bottom && left <= right) {
    for (int c = left; c <= right; ++c) out.push_back(matrix[top][c]);
    ++top;

    for (int r = top; r <= bottom; ++r) out.push_back(matrix[r][right]);
    --right;

    if (top <= bottom) {                    // GUARD: only one row may be left
      for (int c = right; c >= left; --c) out.push_back(matrix[bottom][c]);
      --bottom;
    }

    if (left <= right) {                    // GUARD: only one column may be left
      for (int r = bottom; r >= top; --r) out.push_back(matrix[r][left]);
      ++left;
    }
  }
  return out;
}`,
            java: `public List<Integer> spiralOrder(int[][] matrix) {
  List<Integer> out = new ArrayList<>();
  if (matrix.length == 0) return out;

  int top = 0, bottom = matrix.length - 1;
  int left = 0, right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    for (int c = left; c <= right; c++) out.add(matrix[top][c]);
    top++;

    for (int r = top; r <= bottom; r++) out.add(matrix[r][right]);
    right--;

    if (top <= bottom) {
      for (int c = right; c >= left; c--) out.add(matrix[bottom][c]);
      bottom--;
    }

    if (left <= right) {
      for (int r = bottom; r >= top; r--) out.add(matrix[r][left]);
      left++;
    }
  }
  return out;
}`,
          },
          followUp: 'Generate a spiral matrix instead of reading one (LC 59) — same boundary loop, writing values rather than collecting them.',
        },
      },
      practice: [
        {
          lc: 59,
          title: 'Spiral Matrix II',
          slug: 'spiral-matrix-ii',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 25,
          insight: 'The inverse: fill 1..n^2 along the same spiral. Because the matrix is square, the guards become unnecessary — understand why.',
        },
        {
          lc: 498,
          title: 'Diagonal Traverse',
          slug: 'diagonal-traverse',
          difficulty: 'medium',
          role: 'practice',
          estMinutes: 35,
          insight:
            'Flipped to diagonals: cells on one diagonal share r + c, and the direction alternates per diagonal. Grouping by r + c is cleaner than simulating the walk.',
        },
      ],
    },
  ],
};
