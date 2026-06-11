// frontend/src/utils/problemTemplates.js
// ─────────────────────────────────────────────────────────────────────────────
// Dynamic template generator — produces starter code based on the CURRENT
// problem's detected type (array, string, tree, graph, dp, greedy, etc.)
// rather than hardcoded stubs.
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Problem-type detection ─────────────────────────────────────────────────

/**
 * Returns a normalized problem-type string from tags + title.
 * Order matters: more specific types checked first.
 */
export function detectProblemType(tags = [], title = '') {
  const haystack = [...tags, title].join(' ').toLowerCase();

  if (haystack.includes('tree') && !haystack.includes('segment tree'))   return 'tree';
  if (haystack.includes('segment tree') || haystack.includes('fenwick')) return 'segment-tree';
  if (haystack.includes('graph') || haystack.includes('shortest path') ||
      haystack.includes('bfs')   || haystack.includes('dfs'))            return 'graph';
  if (haystack.includes('trie'))                                          return 'trie';
  if (haystack.includes('binary search'))                                 return 'binary-search';
  if (haystack.includes('two pointers') || haystack.includes('sliding window')) return 'two-pointer';
  if (haystack.includes('dp') || haystack.includes('dynamic programming')) return 'dp';
  if (haystack.includes('greedy') || haystack.includes('sortings'))      return 'greedy';
  if (haystack.includes('string') || haystack.includes('hashing'))       return 'string';
  if (haystack.includes('math') || haystack.includes('number theory') ||
      haystack.includes('combinatorics'))                                 return 'math';
  if (haystack.includes('array') || haystack.includes('data structure')) return 'array';
  return 'generic';
}

/**
 * Returns rich metadata about a problem:
 *  inputType, functionName, returnType, paramNames, description
 */
export function getProblemMeta(problem) {
  if (!problem) return _defaultMeta('unknown');

  const type = problem.inputType || detectProblemType(problem.tags, problem.title);

  // If the problem already has explicit metadata embedded, use it directly
  if (problem.functionName && problem.returnType) {
    return {
      inputType:    type,
      functionName: problem.functionName,
      returnType:   problem.returnType,
      paramNames:   problem.paramNames  || ['input'],
      paramTypes:   problem.paramTypes  || ['int[]'],
      description:  problem.metaDesc    || _typeLabel(type),
    };
  }

  return _defaultMeta(type, problem);
}

function _typeLabel(type) {
  return {
    'array':        'Array / Sequence',
    'string':       'String Manipulation',
    'tree':         'Binary Tree / BST',
    'graph':        'Graph Traversal',
    'dp':           'Dynamic Programming',
    'greedy':       'Greedy Algorithm',
    'binary-search':'Binary Search',
    'two-pointer':  'Two Pointers / Sliding Window',
    'math':         'Math / Number Theory',
    'trie':         'Trie / Prefix Tree',
    'segment-tree': 'Segment Tree / Fenwick Tree',
    'generic':      'Implementation',
  }[type] || 'General';
}

function _defaultMeta(type, problem) {
  const map = {
    'array': {
      functionName: 'solve',
      returnType:   'int',
      paramNames:   ['nums'],
      paramTypes:   ['int[]'],
    },
    'string': {
      functionName: 'solve',
      returnType:   'String',
      paramNames:   ['s'],
      paramTypes:   ['String'],
    },
    'tree': {
      functionName: 'solve',
      returnType:   'int',
      paramNames:   ['root'],
      paramTypes:   ['TreeNode'],
    },
    'graph': {
      functionName: 'solve',
      returnType:   'int',
      paramNames:   ['n', 'edges'],
      paramTypes:   ['int', 'int[][]'],
    },
    'dp': {
      functionName: 'solve',
      returnType:   'int',
      paramNames:   ['nums'],
      paramTypes:   ['int[]'],
    },
    'greedy': {
      functionName: 'solve',
      returnType:   'int',
      paramNames:   ['intervals'],
      paramTypes:   ['int[][]'],
    },
    'binary-search': {
      functionName: 'solve',
      returnType:   'int',
      paramNames:   ['nums', 'k'],
      paramTypes:   ['int[]', 'int'],
    },
    'two-pointer': {
      functionName: 'solve',
      returnType:   'int',
      paramNames:   ['nums', 'target'],
      paramTypes:   ['int[]', 'int'],
    },
    'math': {
      functionName: 'solve',
      returnType:   'long long',
      paramNames:   ['n'],
      paramTypes:   ['long long'],
    },
    'trie': {
      functionName: 'solve',
      returnType:   'boolean',
      paramNames:   ['words'],
      paramTypes:   ['String[]'],
    },
    'segment-tree': {
      functionName: 'solve',
      returnType:   'int',
      paramNames:   ['nums', 'queries'],
      paramTypes:   ['int[]', 'int[][]'],
    },
    'generic': {
      functionName: 'solve',
      returnType:   'void',
      paramNames:   ['input'],
      paramTypes:   ['String'],
    },
  };

  const meta = map[type] || map['generic'];
  return {
    inputType:   type,
    description: _typeLabel(type),
    ...meta,
  };
}


// ── 2. Template generators per language ────────────────────────────────────────

function _pythonTemplate(type, meta) {
  switch (type) {
    case 'tree':
      return `import sys
from collections import deque
input = sys.stdin.readline

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(vals):
    if not vals or vals[0] == 'null':
        return None
    root = TreeNode(int(vals[0]))
    queue = deque([root])
    i = 1
    while queue and i < len(vals):
        node = queue.popleft()
        if i < len(vals) and vals[i] != 'null':
            node.left = TreeNode(int(vals[i]))
            queue.append(node.left)
        i += 1
        if i < len(vals) and vals[i] != 'null':
            node.right = TreeNode(int(vals[i]))
            queue.append(node.right)
        i += 1
    return root

class Solution:
    def solve(self, root: TreeNode) -> int:
        # Write your tree logic here
        pass

# Driver
vals = input().split()
root = build_tree(vals)
print(Solution().solve(root))
`;

    case 'graph':
      return `import sys
from collections import defaultdict, deque
input = sys.stdin.readline

class Solution:
    def solve(self, n: int, edges: list) -> int:
        # Build adjacency list
        graph = defaultdict(list)
        for u, v in edges:
            graph[u].append(v)
            graph[v].append(u)
        # Write your graph logic here (BFS/DFS/Dijkstra)
        visited = [False] * (n + 1)
        pass

# Driver
n, m = map(int, input().split())
edges = [list(map(int, input().split())) for _ in range(m)]
print(Solution().solve(n, edges))
`;

    case 'dp':
      return `import sys
input = sys.stdin.readline

class Solution:
    def solve(self, nums: list) -> int:
        n = len(nums)
        # DP table — dp[i] = optimal value for subproblem ending at i
        dp = [0] * n
        dp[0] = nums[0]
        for i in range(1, n):
            # Recurrence relation
            dp[i] = max(dp[i-1] + nums[i], nums[i])
        return max(dp)

# Driver
n = int(input())
nums = list(map(int, input().split()))
print(Solution().solve(nums))
`;

    case 'greedy':
      return `import sys
input = sys.stdin.readline

class Solution:
    def solve(self, intervals: list) -> int:
        # Sort by end time (classic greedy)
        intervals.sort(key=lambda x: x[1])
        count = 0
        last_end = float('-inf')
        for start, end in intervals:
            if start >= last_end:
                count += 1
                last_end = end
        return count

# Driver
n = int(input())
intervals = [list(map(int, input().split())) for _ in range(n)]
print(Solution().solve(intervals))
`;

    case 'binary-search':
      return `import sys
input = sys.stdin.readline

class Solution:
    def check(self, nums: list, mid: int, k: int) -> bool:
        # Feasibility function — return True if mid satisfies condition
        pass

    def solve(self, nums: list, k: int) -> int:
        lo, hi = min(nums), max(nums)
        ans = lo
        while lo <= hi:
            mid = (lo + hi) // 2
            if self.check(nums, mid, k):
                ans = mid
                lo = mid + 1
            else:
                hi = mid - 1
        return ans

# Driver
n, k = map(int, input().split())
nums = list(map(int, input().split()))
print(Solution().solve(nums, k))
`;

    case 'two-pointer':
      return `import sys
input = sys.stdin.readline

class Solution:
    def solve(self, nums: list, target: int) -> int:
        left, right = 0, len(nums) - 1
        # Two pointer logic
        while left < right:
            curr = nums[left] + nums[right]
            if curr == target:
                return left  # or whatever result
            elif curr < target:
                left += 1
            else:
                right -= 1
        return -1

# Driver
n, target = map(int, input().split())
nums = list(map(int, input().split()))
print(Solution().solve(nums, target))
`;

    case 'string':
      return `import sys
input = sys.stdin.readline

class Solution:
    def solve(self, s: str) -> str:
        # Write your string logic here
        result = []
        for ch in s:
            result.append(ch)
        return ''.join(result)

# Driver
s = input().strip()
print(Solution().solve(s))
`;

    case 'math':
      return `import sys
input = sys.stdin.readline

class Solution:
    def solve(self, n: int) -> int:
        # Write your math logic here
        pass

# Driver
t = int(input())
for _ in range(t):
    n = int(input().strip())
    print(Solution().solve(n))
`;

    default: // generic / array
      return `import sys
input = sys.stdin.readline

class Solution:
    def solve(self, nums: list) -> int:
        n = len(nums)
        # Write your solution here
        pass

# Driver
n = int(input())
nums = list(map(int, input().split()))
print(Solution().solve(nums))
`;
  }
}

function _javascriptTemplate(type) {
  switch (type) {
    case 'tree':
      return `// Read input from stdin
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
let idx = 0;
const rl = () => lines[idx++] || '';

class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val; this.left = left; this.right = right;
  }
}

function buildTree(vals) {
  if (!vals.length || vals[0] === 'null') return null;
  const root = new TreeNode(parseInt(vals[0]));
  const queue = [root];
  let i = 1;
  while (queue.length && i < vals.length) {
    const node = queue.shift();
    if (i < vals.length && vals[i] !== 'null') {
      node.left = new TreeNode(parseInt(vals[i]));
      queue.push(node.left);
    }
    i++;
    if (i < vals.length && vals[i] !== 'null') {
      node.right = new TreeNode(parseInt(vals[i]));
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

class Solution {
  solve(root) {
    // Write your tree logic here
  }
}

const vals = rl().trim().split(/\\s+/);
const root = buildTree(vals);
console.log(new Solution().solve(root));
`;

    case 'graph':
      return `// Read input from stdin
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
let idx = 0;
const rl = () => lines[idx++] || '';

class Solution {
  solve(n, edges) {
    // Build adjacency list
    const graph = Array.from({ length: n + 1 }, () => []);
    for (const [u, v] of edges) {
      graph[u].push(v);
      graph[v].push(u);
    }
    // Write your graph logic here (BFS/DFS/Dijkstra)
    const visited = new Array(n + 1).fill(false);
  }
}

const [n, m] = rl().trim().split(' ').map(Number);
const edges = [];
for (let i = 0; i < m; i++) {
  edges.push(rl().trim().split(' ').map(Number));
}
console.log(new Solution().solve(n, edges));
`;

    case 'dp':
      return `// Read input from stdin
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
let idx = 0;
const rl = () => lines[idx++] || '';

class Solution {
  solve(nums) {
    const n = nums.length;
    // dp[i] = optimal value for subproblem ending at i
    const dp = new Array(n).fill(0);
    dp[0] = nums[0];
    for (let i = 1; i < n; i++) {
      dp[i] = Math.max(dp[i - 1] + nums[i], nums[i]);
    }
    return Math.max(...dp);
  }
}

const n = parseInt(rl());
const nums = rl().trim().split(' ').map(Number);
console.log(new Solution().solve(nums));
`;

    case 'greedy':
      return `// Read input from stdin
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
let idx = 0;
const rl = () => lines[idx++] || '';

class Solution {
  solve(intervals) {
    // Sort by end time
    intervals.sort((a, b) => a[1] - b[1]);
    let count = 0, lastEnd = -Infinity;
    for (const [start, end] of intervals) {
      if (start >= lastEnd) { count++; lastEnd = end; }
    }
    return count;
  }
}

const n = parseInt(rl());
const intervals = [];
for (let i = 0; i < n; i++) {
  intervals.push(rl().trim().split(' ').map(Number));
}
console.log(new Solution().solve(intervals));
`;

    case 'binary-search':
      return `// Read input from stdin
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
let idx = 0;
const rl = () => lines[idx++] || '';

class Solution {
  check(nums, mid, k) {
    // Feasibility function — return true if mid satisfies condition
    return false;
  }

  solve(nums, k) {
    let lo = Math.min(...nums), hi = Math.max(...nums), ans = lo;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (this.check(nums, mid, k)) { ans = mid; lo = mid + 1; }
      else hi = mid - 1;
    }
    return ans;
  }
}

const [n, k] = rl().trim().split(' ').map(Number);
const nums = rl().trim().split(' ').map(Number);
console.log(new Solution().solve(nums, k));
`;

    case 'string':
      return `// Read input from stdin
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
let idx = 0;
const rl = () => lines[idx++] || '';

class Solution {
  solve(s) {
    // Write your string logic here
    return s;
  }
}

const s = rl().trim();
console.log(new Solution().solve(s));
`;

    case 'math':
      return `// Read input from stdin
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
let idx = 0;
const rl = () => lines[idx++] || '';

class Solution {
  solve(n) {
    // Write your math logic here
  }
}

const t = parseInt(rl());
for (let i = 0; i < t; i++) {
  const n = parseInt(rl().trim());
  console.log(new Solution().solve(n));
}
`;

    default:
      return `// Read input from stdin
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
let idx = 0;
const rl = () => lines[idx++] || '';

class Solution {
  solve(nums) {
    const n = nums.length;
    // Write your solution here
  }
}

const n = parseInt(rl());
const nums = rl().trim().split(' ').map(Number);
console.log(new Solution().solve(nums));
`;
  }
}

function _javaTemplate(type) {
  switch (type) {
    case 'tree':
      return `import java.util.*;
import java.io.*;

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

public class Solution {

    public static TreeNode buildTree(String[] vals) {
        if (vals.length == 0 || vals[0].equals("null")) return null;
        TreeNode root = new TreeNode(Integer.parseInt(vals[0]));
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        int i = 1;
        while (!queue.isEmpty() && i < vals.length) {
            TreeNode node = queue.poll();
            if (i < vals.length && !vals[i].equals("null")) {
                node.left = new TreeNode(Integer.parseInt(vals[i]));
                queue.offer(node.left);
            }
            i++;
            if (i < vals.length && !vals[i].equals("null")) {
                node.right = new TreeNode(Integer.parseInt(vals[i]));
                queue.offer(node.right);
            }
            i++;
        }
        return root;
    }

    public int solve(TreeNode root) {
        // Write your tree logic here
        return 0;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String[] vals = br.readLine().trim().split("\\\\s+");
        TreeNode root = buildTree(vals);
        System.out.println(new Solution().solve(root));
    }
}
`;

    case 'graph':
      return `import java.util.*;
import java.io.*;

public class Solution {

    public int solve(int n, int[][] edges) {
        // Build adjacency list
        List<List<int[]>> graph = new ArrayList<>();
        for (int i = 0; i <= n; i++) graph.add(new ArrayList<>());
        for (int[] e : edges) {
            graph.get(e[0]).add(new int[]{e[1], e[2]});
            graph.get(e[1]).add(new int[]{e[0], e[2]});
        }
        // Write your graph logic here (BFS/DFS/Dijkstra)
        boolean[] visited = new boolean[n + 1];
        return 0;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken());
        int m = Integer.parseInt(st.nextToken());
        int[][] edges = new int[m][3];
        for (int i = 0; i < m; i++) {
            st = new StringTokenizer(br.readLine());
            edges[i][0] = Integer.parseInt(st.nextToken());
            edges[i][1] = Integer.parseInt(st.nextToken());
            edges[i][2] = Integer.parseInt(st.nextToken());
        }
        System.out.println(new Solution().solve(n, edges));
    }
}
`;

    case 'dp':
      return `import java.util.*;
import java.io.*;

public class Solution {

    public int solve(int[] nums) {
        int n = nums.length;
        // dp[i] = optimal value for subproblem ending at i
        int[] dp = new int[n];
        dp[0] = nums[0];
        for (int i = 1; i < n; i++) {
            dp[i] = Math.max(dp[i - 1] + nums[i], nums[i]);
        }
        int ans = dp[0];
        for (int v : dp) ans = Math.max(ans, v);
        return ans;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());
        StringTokenizer st = new StringTokenizer(br.readLine());
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = Integer.parseInt(st.nextToken());
        System.out.println(new Solution().solve(nums));
    }
}
`;

    case 'greedy':
      return `import java.util.*;
import java.io.*;

public class Solution {

    public int solve(int[][] intervals) {
        // Sort by end time
        Arrays.sort(intervals, (a, b) -> a[1] - b[1]);
        int count = 0;
        int lastEnd = Integer.MIN_VALUE;
        for (int[] iv : intervals) {
            if (iv[0] >= lastEnd) { count++; lastEnd = iv[1]; }
        }
        return count;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());
        int[][] intervals = new int[n][2];
        for (int i = 0; i < n; i++) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            intervals[i][0] = Integer.parseInt(st.nextToken());
            intervals[i][1] = Integer.parseInt(st.nextToken());
        }
        System.out.println(new Solution().solve(intervals));
    }
}
`;

    case 'binary-search':
      return `import java.util.*;
import java.io.*;

public class Solution {

    boolean check(int[] nums, int mid, int k) {
        // Feasibility function
        return false;
    }

    public int solve(int[] nums, int k) {
        int lo = Arrays.stream(nums).min().getAsInt();
        int hi = Arrays.stream(nums).max().getAsInt();
        int ans = lo;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (check(nums, mid, k)) { ans = mid; lo = mid + 1; }
            else hi = mid - 1;
        }
        return ans;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken());
        int k = Integer.parseInt(st.nextToken());
        st = new StringTokenizer(br.readLine());
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = Integer.parseInt(st.nextToken());
        System.out.println(new Solution().solve(nums, k));
    }
}
`;

    case 'string':
      return `import java.util.*;
import java.io.*;

public class Solution {

    public String solve(String s) {
        // Write your string logic here
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            sb.append(c);
        }
        return sb.toString();
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String s = br.readLine().trim();
        System.out.println(new Solution().solve(s));
    }
}
`;

    case 'math':
      return `import java.util.*;
import java.io.*;

public class Solution {

    public long solve(long n) {
        // Write your math logic here
        return 0L;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int t = Integer.parseInt(br.readLine().trim());
        StringBuilder out = new StringBuilder();
        while (t-- > 0) {
            long n = Long.parseLong(br.readLine().trim());
            out.append(new Solution().solve(n)).append('\\n');
        }
        System.out.print(out);
    }
}
`;

    default:
      return `import java.util.*;
import java.io.*;

public class Solution {

    public int solve(int[] nums) {
        int n = nums.length;
        // Write your solution here
        return 0;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());
        StringTokenizer st = new StringTokenizer(br.readLine());
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = Integer.parseInt(st.nextToken());
        System.out.println(new Solution().solve(nums));
    }
}
`;
  }
}

function _cppTemplate(type) {
  switch (type) {
    case 'tree':
      return `#include <bits/stdc++.h>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

TreeNode* buildTree(vector<string>& vals) {
    if (vals.empty() || vals[0] == "null") return nullptr;
    TreeNode* root = new TreeNode(stoi(vals[0]));
    queue<TreeNode*> q;
    q.push(root);
    int i = 1;
    while (!q.empty() && i < (int)vals.size()) {
        auto node = q.front(); q.pop();
        if (i < (int)vals.size() && vals[i] != "null") {
            node->left = new TreeNode(stoi(vals[i]));
            q.push(node->left);
        }
        i++;
        if (i < (int)vals.size() && vals[i] != "null") {
            node->right = new TreeNode(stoi(vals[i]));
            q.push(node->right);
        }
        i++;
    }
    return root;
}

class Solution {
public:
    int solve(TreeNode* root) {
        // Write your tree logic here
        return 0;
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    vector<string> vals;
    string token;
    while (cin >> token) vals.push_back(token);
    TreeNode* root = buildTree(vals);
    cout << Solution().solve(root) << "\\n";
    return 0;
}
`;

    case 'graph':
      return `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int solve(int n, vector<vector<int>>& edges) {
        // Build adjacency list
        vector<vector<pair<int,int>>> graph(n + 1);
        for (auto& e : edges) {
            graph[e[0]].push_back({e[1], e[2]});
            graph[e[1]].push_back({e[0], e[2]});
        }
        // Write your graph logic here
        vector<bool> visited(n + 1, false);
        return 0;
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n, m;
    cin >> n >> m;
    vector<vector<int>> edges(m, vector<int>(3));
    for (int i = 0; i < m; i++) cin >> edges[i][0] >> edges[i][1] >> edges[i][2];
    cout << Solution().solve(n, edges) << "\\n";
    return 0;
}
`;

    case 'dp':
      return `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int solve(vector<int>& nums) {
        int n = nums.size();
        // dp[i] = optimal value for subproblem ending at i
        vector<int> dp(n);
        dp[0] = nums[0];
        for (int i = 1; i < n; i++) {
            dp[i] = max(dp[i-1] + nums[i], nums[i]);
        }
        return *max_element(dp.begin(), dp.end());
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n; cin >> n;
    vector<int> nums(n);
    for (int& x : nums) cin >> x;
    cout << Solution().solve(nums) << "\\n";
    return 0;
}
`;

    case 'greedy':
      return `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int solve(vector<pair<int,int>>& intervals) {
        // Sort by end time
        sort(intervals.begin(), intervals.end(), [](auto& a, auto& b) {
            return a.second < b.second;
        });
        int count = 0, lastEnd = INT_MIN;
        for (auto& [start, end] : intervals) {
            if (start >= lastEnd) { count++; lastEnd = end; }
        }
        return count;
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n; cin >> n;
    vector<pair<int,int>> intervals(n);
    for (auto& [s, e] : intervals) cin >> s >> e;
    cout << Solution().solve(intervals) << "\\n";
    return 0;
}
`;

    case 'binary-search':
      return `#include <bits/stdc++.h>
using namespace std;

class Solution {
    bool check(vector<int>& nums, int mid, int k) {
        // Feasibility function — return true if mid satisfies condition
        return false;
    }

public:
    int solve(vector<int>& nums, int k) {
        int lo = *min_element(nums.begin(), nums.end());
        int hi = *max_element(nums.begin(), nums.end());
        int ans = lo;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (check(nums, mid, k)) { ans = mid; lo = mid + 1; }
            else hi = mid - 1;
        }
        return ans;
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n, k; cin >> n >> k;
    vector<int> nums(n);
    for (int& x : nums) cin >> x;
    cout << Solution().solve(nums, k) << "\\n";
    return 0;
}
`;

    case 'string':
      return `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    string solve(string s) {
        // Write your string logic here
        string result = "";
        for (char c : s) result += c;
        return result;
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string s; cin >> s;
    cout << Solution().solve(s) << "\\n";
    return 0;
}
`;

    case 'math':
      return `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    long long solve(long long n) {
        // Write your math logic here
        return 0LL;
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int t; cin >> t;
    while (t--) {
        long long n; cin >> n;
        cout << Solution().solve(n) << "\\n";
    }
    return 0;
}
`;

    default:
      return `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int solve(vector<int>& nums) {
        int n = nums.size();
        // Write your solution here
        return 0;
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n; cin >> n;
    vector<int> nums(n);
    for (int& x : nums) cin >> x;
    cout << Solution().solve(nums) << "\\n";
    return 0;
}
`;
  }
}

function _cTemplate(type) {
  switch (type) {
    case 'tree':
      return `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct TreeNode {
    int val;
    struct TreeNode *left, *right;
} TreeNode;

TreeNode* newNode(int val) {
    TreeNode* n = (TreeNode*)malloc(sizeof(TreeNode));
    n->val = val; n->left = n->right = NULL;
    return n;
}

int solve(TreeNode* root) {
    // Write your tree logic here
    if (!root) return 0;
    return 0;
}

int main() {
    // Build tree from input (BFS order)
    // Example: read values and construct tree
    int val;
    if (scanf("%d", &val) != 1) return 0;
    TreeNode* root = newNode(val);
    // Add tree construction logic here
    printf("%d\\n", solve(root));
    return 0;
}
`;

    case 'graph':
      return `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

#define MAXN 100005

int head[MAXN], nxt[MAXN*2], to[MAXN*2], wt[MAXN*2], cnt;
bool visited[MAXN];

void addEdge(int u, int v, int w) {
    to[++cnt] = v; wt[cnt] = w; nxt[cnt] = head[u]; head[u] = cnt;
}

int solve(int n) {
    // Write your graph logic here (DFS/BFS/Dijkstra)
    return 0;
}

int main() {
    int n, m;
    scanf("%d %d", &n, &m);
    for (int i = 0; i < m; i++) {
        int u, v, w;
        scanf("%d %d %d", &u, &v, &w);
        addEdge(u, v, w);
        addEdge(v, u, w);
    }
    printf("%d\\n", solve(n));
    return 0;
}
`;

    case 'dp':
      return `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAXN 200005

int nums[MAXN], dp[MAXN];

int max2(int a, int b) { return a > b ? a : b; }

int solve(int n) {
    dp[0] = nums[0];
    for (int i = 1; i < n; i++) {
        dp[i] = max2(dp[i-1] + nums[i], nums[i]);
    }
    int ans = dp[0];
    for (int i = 1; i < n; i++) ans = max2(ans, dp[i]);
    return ans;
}

int main() {
    int n;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    printf("%d\\n", solve(n));
    return 0;
}
`;

    case 'binary-search':
      return `#include <stdio.h>
#include <stdlib.h>

#define MAXN 100005

int nums[MAXN];
int n, k;

int check(int mid) {
    // Feasibility function — return 1 if mid satisfies condition
    return 0;
}

int solve() {
    int lo = nums[0], hi = nums[0];
    for (int i = 1; i < n; i++) {
        if (nums[i] < lo) lo = nums[i];
        if (nums[i] > hi) hi = nums[i];
    }
    int ans = lo;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (check(mid)) { ans = mid; lo = mid + 1; }
        else hi = mid - 1;
    }
    return ans;
}

int main() {
    scanf("%d %d", &n, &k);
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    printf("%d\\n", solve());
    return 0;
}
`;

    case 'string':
      return `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAXN 100005

char s[MAXN], result[MAXN];

void solve(char* s, char* result) {
    // Write your string logic here
    int n = strlen(s);
    for (int i = 0; i < n; i++) result[i] = s[i];
    result[n] = '\\0';
}

int main() {
    scanf("%s", s);
    solve(s, result);
    printf("%s\\n", result);
    return 0;
}
`;

    case 'math':
      return `#include <stdio.h>
#include <stdlib.h>

long long solve(long long n) {
    // Write your math logic here
    return 0LL;
}

int main() {
    int t;
    scanf("%d", &t);
    while (t--) {
        long long n;
        scanf("%lld", &n);
        printf("%lld\\n", solve(n));
    }
    return 0;
}
`;

    default:
      return `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAXN 200005

int nums[MAXN];

int solve(int n) {
    // Write your solution here
    return 0;
}

int main() {
    int n;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    printf("%d\\n", solve(n));
    return 0;
}
`;
  }
}


// ── 3. Public API ─────────────────────────────────────────────────────────────

/**
 * Main entry point.
 * Returns language-specific starter code tailored to the given problem.
 *
 * @param {string} language  - 'python' | 'javascript' | 'java' | 'cpp' | 'c'
 * @param {object} problem   - Problem object (tags, title, inputType, etc.)
 * @returns {string} starter code
 */
export function generateTemplate(language, problem) {
  const meta = getProblemMeta(problem);
  const type = meta.inputType;

  switch (language) {
    case 'python':     return _pythonTemplate(type, meta);
    case 'javascript': return _javascriptTemplate(type, meta);
    case 'java':       return _javaTemplate(type, meta);
    case 'cpp':        return _cppTemplate(type, meta);
    case 'c':          return _cTemplate(type, meta);
    default:           return _pythonTemplate(type, meta);
  }
}

/**
 * Type labels for UI display
 */
export const TYPE_LABELS = {
  'array':         { label: 'Array',          icon: '📊', color: '#3b82f6' },
  'string':        { label: 'String',         icon: '📝', color: '#8b5cf6' },
  'tree':          { label: 'Binary Tree',    icon: '🌳', color: '#10b981' },
  'graph':         { label: 'Graph',          icon: '🕸️', color: '#f59e0b' },
  'dp':            { label: 'Dynamic Prog.', icon: '🧮', color: '#ec4899' },
  'greedy':        { label: 'Greedy',         icon: '⚡', color: '#f97316' },
  'binary-search': { label: 'Binary Search',  icon: '🔍', color: '#06b6d4' },
  'two-pointer':   { label: 'Two Pointers',   icon: '👆', color: '#84cc16' },
  'math':          { label: 'Math',           icon: '∑',  color: '#a78bfa' },
  'trie':          { label: 'Trie',           icon: '🔠',  color: '#fb923c' },
  'segment-tree':  { label: 'Segment Tree',   icon: '🌲',  color: '#34d399' },
  'generic':       { label: 'Implementation', icon: '⚙️', color: '#94a3b8' },
};
