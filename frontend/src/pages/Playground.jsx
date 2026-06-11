// frontend/src/pages/Playground.jsx
import { useState, useCallback, useRef, useEffect } from 'react';
import CodeEditor, { DEFAULT_CODE } from '../components/Editor/CodeEditor';
import ConsolePanel from '../components/Editor/ConsolePanel';
import * as api from '../services/api';
import toast from 'react-hot-toast';

// ── Language config ───────────────────────────────────────────────────────────
const LANGS = [
  { id: 'python',     name: 'Python',     version: '3.10',  monacoId: 'python'     },
  { id: 'javascript', name: 'JavaScript', version: 'ES2023', monacoId: 'javascript' },
  { id: 'java',       name: 'Java',       version: '15',    monacoId: 'java'       },
  { id: 'cpp',        name: 'C++',        version: '17',    monacoId: 'cpp'        },
  { id: 'c',          name: 'C',          version: 'C11',   monacoId: 'c'          },
];

const THEMES = [
  { id: 'one-dark',    label: 'One Dark Pro' },
  { id: 'vs-dark',     label: 'VS Dark'      },
  { id: 'github-dark', label: 'GitHub Dark'  },
  { id: 'monokai',     label: 'Monokai'      },
  { id: 'nord',        label: 'Nord'         },
  { id: 'solarized',   label: 'Solarized'    },
];

// ── Categorized Snippet Library ───────────────────────────────────────────────
const SNIPPET_CATEGORIES = {
  python: [
    {
      category: 'Templates',
      items: [
        { label: 'Competitive I/O',  code: 'import sys\ninput = sys.stdin.readline\n\ndef solve():\n    pass\n\nt = int(input())\nfor _ in range(t):\n    solve()' },
        { label: 'Array problem',    code: 'import sys\ninput = sys.stdin.readline\n\nclass Solution:\n    def solve(self, nums: list) -> int:\n        n = len(nums)\n        # Your logic here\n        pass\n\nn = int(input())\nnums = list(map(int, input().split()))\nprint(Solution().solve(nums))' },
      ],
    },
    {
      category: 'Loops',
      items: [
        { label: 'For range',        code: 'for i in range(n):\n    pass' },
        { label: 'While loop',       code: 'while condition:\n    pass' },
        { label: 'Enumerate',        code: 'for i, val in enumerate(arr):\n    pass' },
        { label: 'Nested loops',     code: 'for i in range(n):\n    for j in range(m):\n        pass' },
      ],
    },
    {
      category: 'Arrays',
      items: [
        { label: 'Read array',       code: 'nums = list(map(int, input().split()))' },
        { label: 'Prefix sum',       code: 'prefix = [0] * (n + 1)\nfor i in range(n):\n    prefix[i + 1] = prefix[i] + nums[i]' },
        { label: 'Two pointers',     code: 'left, right = 0, len(nums) - 1\nwhile left < right:\n    # process\n    left += 1\n    right -= 1' },
        { label: 'Sliding window',   code: 'window_sum = sum(nums[:k])\nfor i in range(k, n):\n    window_sum += nums[i] - nums[i - k]\n    # process window_sum' },
      ],
    },
    {
      category: 'Strings',
      items: [
        { label: 'Char frequency',   code: 'from collections import Counter\nfreq = Counter(s)' },
        { label: 'Is palindrome',    code: 'def is_palindrome(s):\n    return s == s[::-1]' },
        { label: 'Split & join',     code: 'words = s.split()\nresult = " ".join(words)' },
      ],
    },
    {
      category: 'Patterns',
      items: [
        { label: 'Binary search',    code: 'def binary_search(arr, target):\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1' },
        { label: 'BFS template',     code: 'from collections import deque\nq = deque([start])\nvisited = {start}\nwhile q:\n    node = q.popleft()\n    for nxt in graph[node]:\n        if nxt not in visited:\n            visited.add(nxt)\n            q.append(nxt)' },
        { label: 'DFS recursive',    code: 'def dfs(node, visited):\n    visited.add(node)\n    for nxt in graph[node]:\n        if nxt not in visited:\n            dfs(nxt, visited)\n\nvisited = set()\ndfs(start, visited)' },
        { label: 'DP 1D array',      code: 'dp = [0] * (n + 1)\ndp[0] = base_case\nfor i in range(1, n + 1):\n    dp[i] = # transition\nreturn dp[n]' },
      ],
    },
  ],
  javascript: [
    {
      category: 'Templates',
      items: [
        { label: 'Competitive I/O',  code: "const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nlet idx = 0;\nconst rl = () => lines[idx++];\n\nfunction solve() {\n    // Your logic\n}\n\nconst t = parseInt(rl());\nfor (let i = 0; i < t; i++) solve();" },
        { label: 'Array problem',    code: "const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nlet idx = 0;\nconst rl = () => lines[idx++];\n\nclass Solution {\n    solve(nums) {\n        const n = nums.length;\n        // Your logic\n    }\n}\n\nconst n = parseInt(rl());\nconst nums = rl().split(' ').map(Number);\nconsole.log(new Solution().solve(nums));" },
      ],
    },
    {
      category: 'Loops',
      items: [
        { label: 'For loop',         code: 'for (let i = 0; i < n; i++) {\n    \n}' },
        { label: 'For...of',         code: 'for (const val of arr) {\n    \n}' },
        { label: 'While loop',       code: 'while (condition) {\n    \n}' },
        { label: 'forEach',          code: 'arr.forEach((val, idx) => {\n    \n});' },
      ],
    },
    {
      category: 'Arrays',
      items: [
        { label: 'Read array',       code: "const nums = rl().split(' ').map(Number);" },
        { label: 'Prefix sum',       code: 'const prefix = new Array(n + 1).fill(0);\nfor (let i = 0; i < n; i++) {\n    prefix[i + 1] = prefix[i] + nums[i];\n}' },
        { label: 'Two pointers',     code: 'let left = 0, right = nums.length - 1;\nwhile (left < right) {\n    // process\n    left++;\n    right--;\n}' },
      ],
    },
    {
      category: 'Patterns',
      items: [
        { label: 'Binary search',    code: 'function binarySearch(arr, target) {\n    let lo = 0, hi = arr.length - 1;\n    while (lo <= hi) {\n        const mid = (lo + hi) >> 1;\n        if (arr[mid] === target) return mid;\n        if (arr[mid] < target) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    return -1;\n}' },
        { label: 'BFS template',     code: 'function bfs(start, adj) {\n    const q = [start];\n    const visited = new Set([start]);\n    while (q.length) {\n        const node = q.shift();\n        for (const nxt of adj[node] || []) {\n            if (!visited.has(nxt)) {\n                visited.add(nxt);\n                q.push(nxt);\n            }\n        }\n    }\n}' },
      ],
    },
  ],
  java: [
    {
      category: 'Templates',
      items: [
        { label: 'Main + Scanner',   code: 'import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        int t = Integer.parseInt(br.readLine().trim());\n        while (t-- > 0) {\n            // solve\n        }\n    }\n}' },
        { label: 'Fast I/O class',   code: 'static class FastReader {\n    BufferedReader br;\n    StringTokenizer st;\n    FastReader() { br = new BufferedReader(new InputStreamReader(System.in)); }\n    String next() {\n        while (st == null || !st.hasMoreTokens()) {\n            try { st = new StringTokenizer(br.readLine()); }\n            catch (IOException e) { e.printStackTrace(); }\n        }\n        return st.nextToken();\n    }\n    int nextInt() { return Integer.parseInt(next()); }\n    long nextLong() { return Long.parseLong(next()); }\n}' },
      ],
    },
    {
      category: 'Arrays',
      items: [
        { label: 'Read int array',   code: 'int[] nums = new int[n];\nfor (int i = 0; i < n; i++) nums[i] = sc.nextInt();' },
        { label: 'Sort array',       code: 'Arrays.sort(nums);' },
        { label: 'Print array',      code: 'System.out.println(Arrays.toString(nums));' },
      ],
    },
    {
      category: 'Patterns',
      items: [
        { label: 'Binary search',    code: 'int lo = 0, hi = n - 1;\nwhile (lo <= hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (nums[mid] == target) return mid;\n    if (nums[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n}' },
        { label: 'BFS template',     code: 'Queue<Integer> q = new LinkedList<>();\nboolean[] visited = new boolean[n + 1];\nq.offer(start);\nvisited[start] = true;\nwhile (!q.isEmpty()) {\n    int node = q.poll();\n    for (int nxt : adj.get(node)) {\n        if (!visited[nxt]) {\n            visited[nxt] = true;\n            q.offer(nxt);\n        }\n    }\n}' },
      ],
    },
  ],
  cpp: [
    {
      category: 'Templates',
      items: [
        { label: 'Competitive full', code: '#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solve() {\n    \n}\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int t;\n    cin >> t;\n    while (t--) solve();\n    return 0;\n}' },
        { label: 'Array problem',    code: '#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int solve(vector<int>& nums) {\n        int n = nums.size();\n        // Your logic\n        return 0;\n    }\n};\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n; cin >> n;\n    vector<int> nums(n);\n    for (int& x : nums) cin >> x;\n    cout << Solution().solve(nums) << "\\n";\n    return 0;\n}' },
      ],
    },
    {
      category: 'Loops',
      items: [
        { label: 'For loop',         code: 'for (int i = 0; i < n; i++) {\n    \n}' },
        { label: 'Range-based for',  code: 'for (auto& x : v) {\n    \n}' },
        { label: 'While loop',       code: 'while (condition) {\n    \n}' },
      ],
    },
    {
      category: 'Arrays',
      items: [
        { label: 'Read vector',      code: 'int n; cin >> n;\nvector<int> nums(n);\nfor (int& x : nums) cin >> x;' },
        { label: 'Sort vector',      code: 'sort(v.begin(), v.end());\n// Descending: sort(v.begin(), v.end(), greater<int>());' },
        { label: 'Prefix sum',       code: 'vector<long long> pre(n + 1, 0);\nfor (int i = 0; i < n; i++) pre[i+1] = pre[i] + nums[i];' },
        { label: 'Two pointers',     code: 'int l = 0, r = (int)v.size() - 1;\nwhile (l < r) {\n    // process\n    l++; r--;\n}' },
      ],
    },
    {
      category: 'Strings',
      items: [
        { label: 'Read string',      code: 'string s; cin >> s;' },
        { label: 'String split',     code: 'stringstream ss(line);\nstring token;\nwhile (getline(ss, token, \' \')) {\n    // use token\n}' },
      ],
    },
    {
      category: 'Patterns',
      items: [
        { label: 'Fast I/O',         code: 'ios_base::sync_with_stdio(false);\ncin.tie(NULL);' },
        { label: 'Binary search',    code: 'int lo = 0, hi = n - 1;\nwhile (lo <= hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (check(mid)) { ans = mid; lo = mid + 1; }\n    else hi = mid - 1;\n}' },
        { label: 'BFS template',     code: 'queue<int> q;\nvector<bool> vis(n + 1, false);\nq.push(start);\nvis[start] = true;\nwhile (!q.empty()) {\n    int u = q.front(); q.pop();\n    for (int v : adj[u]) {\n        if (!vis[v]) { vis[v] = true; q.push(v); }\n    }\n}' },
        { label: 'DFS recursive',    code: 'void dfs(int u, vector<bool>& vis) {\n    vis[u] = true;\n    for (int v : adj[u])\n        if (!vis[v]) dfs(v, vis);\n}\n\nvector<bool> vis(n + 1, false);\ndfs(1, vis);' },
        { label: 'Dijkstra',         code: 'vector<long long> dist(n + 1, 1e18);\npriority_queue<pair<ll,int>, vector<pair<ll,int>>, greater<>> pq;\ndist[src] = 0;\npq.push({0, src});\nwhile (!pq.empty()) {\n    auto [d, u] = pq.top(); pq.pop();\n    if (d > dist[u]) continue;\n    for (auto [v, w] : adj[u])\n        if (dist[u] + w < dist[v]) {\n            dist[v] = dist[u] + w;\n            pq.push({dist[v], v});\n        }\n}' },
        { label: 'GCD / LCM',        code: 'long long gcd(long long a, long long b) { return b ? gcd(b, a % b) : a; }\nlong long lcm(long long a, long long b) { return a / gcd(a, b) * b; }' },
      ],
    },
  ],
  c: [
    {
      category: 'Templates',
      items: [
        { label: 'Basic template',   code: '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\nint main() {\n    int t;\n    scanf("%d", &t);\n    while (t--) {\n        // solve\n    }\n    return 0;\n}' },
      ],
    },
    {
      category: 'Arrays',
      items: [
        { label: 'Read int array',   code: 'int nums[MAXN];\nfor (int i = 0; i < n; i++) scanf("%d", &nums[i]);' },
        { label: 'Max/Min in array', code: 'int mx = nums[0], mn = nums[0];\nfor (int i = 1; i < n; i++) {\n    if (nums[i] > mx) mx = nums[i];\n    if (nums[i] < mn) mn = nums[i];\n}' },
      ],
    },
    {
      category: 'Patterns',
      items: [
        { label: 'Binary search',    code: 'int lo = 0, hi = n - 1;\nwhile (lo <= hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (arr[mid] == target) return mid;\n    if (arr[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n}' },
        { label: 'GCD recursive',    code: 'long long gcd(long long a, long long b) {\n    return b == 0 ? a : gcd(b, a % b);\n}' },
      ],
    },
  ],
};

const SHORTCUTS = [
  { key: 'Ctrl + Enter',    action: 'Run code'           },
  { key: 'Ctrl + Shift+F',  action: 'Format document'    },
  { key: 'Ctrl + /',        action: 'Toggle comment'     },
  { key: 'Ctrl + G',        action: 'Go to line'         },
  { key: 'Ctrl + D',        action: 'Select next match'  },
  { key: 'Ctrl + H',        action: 'Find & replace'     },
  { key: 'Alt + ↑ / ↓',    action: 'Move line up/down'  },
  { key: 'Ctrl + Z',        action: 'Undo'               },
  { key: 'Ctrl + Shift+Z',  action: 'Redo'               },
  { key: 'Tab',             action: 'Indent selection'   },
  { key: 'Shift + Tab',     action: 'Outdent selection'  },
  { key: 'Ctrl + F',        action: 'Find in file'       },
];

// ── Strip ANSI ────────────────────────────────────────────────────────────────
function stripAnsi(str = '') {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*m/g, '');
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Playground() {
  const [language,    setLanguage]    = useState('python');
  const [theme,       setTheme]       = useState('one-dark');
  const [fontSize,    setFontSize]    = useState(14);
  const [codes,       setCodes]       = useState({ ...DEFAULT_CODE });

  const [stdout,      setStdout]      = useState('');
  const [stderr,      setStderr]      = useState('');
  const [compileErr,  setCompileErr]  = useState('');
  const [exitCode,    setExitCode]    = useState(null);
  const [execTime,    setExecTime]    = useState(null);
  const [isRunning,   setIsRunning]   = useState(false);

  const [customInput, setCustomInput] = useState('');
  const [useCustom,   setUseCustom]   = useState(false);

  const [remaining,   setRemaining]   = useState(20);
  const [throttled,   setThrottled]   = useState(false);
  const [resetIn,     setResetIn]     = useState(0);

  // Panel state
  const [panelOpen,   setPanelOpen]   = useState(true);
  const [panelTab,    setPanelTab]    = useState('snippets'); // 'snippets' | 'shortcuts'
  const [openCats,    setOpenCats]    = useState({});          // category accordion

  // Resizable console height
  const [consoleH,    setConsoleH]    = useState(240);
  const draggingRef   = useRef(false);
  const containerRef  = useRef(null);

  // Throttle countdown
  useEffect(() => {
    if (!throttled) return;
    if (resetIn <= 0) { setThrottled(false); return; }
    const t = setTimeout(() => setResetIn(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [throttled, resetIn]);

  // Console vertical resize
  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current) return;
      const el = containerRef.current;
      if (!el) return;
      const fromBottom = el.getBoundingClientRect().bottom - e.clientY;
      setConsoleH(Math.min(Math.max(fromBottom, 120), el.getBoundingClientRect().height * 0.6));
    };
    const onUp = () => { draggingRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',  onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',  onUp);
    };
  }, []);

  const handleClear = useCallback(() => {
    setStdout(''); setStderr(''); setCompileErr('');
    setExitCode(null); setExecTime(null);
  }, []);

  const handleRun = useCallback(async () => {
    if (isRunning || throttled) return;
    setIsRunning(true);
    setStdout(''); setStderr(''); setCompileErr('');
    setExitCode(null); setExecTime(null);

    const code  = codes[language] || '';
    const stdin = useCustom ? customInput : '';
    const start = Date.now();

    try {
      const res     = await api.executeCode(code, language, stdin);
      const elapsed = ((Date.now() - start) / 1000).toFixed(2);
      const data    = res.data;
      const run     = data.run     || {};
      const compile = data.compile || {};

      setExecTime(elapsed);
      setExitCode(run.code ?? null);
      setRemaining(data.remaining ?? remaining - 1);
      if (compile.stderr) setCompileErr(stripAnsi(compile.stderr));
      setStdout(stripAnsi(run.stdout || ''));
      setStderr(stripAnsi(run.stderr  || ''));

      if ((run.code ?? 0) !== 0) {
        toast.error(`Exit code ${run.code}`);
      } else {
        toast.success(`Done in ${elapsed}s`);
      }
    } catch (err) {
      const data = err.response?.data || {};
      if (err.response?.status === 429) {
        setThrottled(true);
        setResetIn(data.resetInSecs || 60);
        toast.error(`Rate limit — wait ${data.resetInSecs || 60}s`);
      } else {
        const msg = data.error || err.message || 'Execution failed';
        setStderr(msg);
        toast.error(msg);
      }
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, throttled, codes, language, useCustom, customInput, remaining]);

  const handleReset = () => {
    setCodes(prev => ({ ...prev, [language]: DEFAULT_CODE[language] }));
    toast('Reset to template', { icon: '↩' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codes[language] || '');
    toast.success('Copied!');
  };

  const insertSnippet = (snippet) => {
    setCodes(prev => ({
      ...prev,
      [language]: (prev[language] || '') + '\n' + snippet.code,
    }));
    toast.success(`Inserted: ${snippet.label}`);
  };

  const toggleCat = (cat) => {
    setOpenCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const categories = SNIPPET_CATEGORIES[language] || [];
  const currentLang = LANGS.find(l => l.id === language);
  const lineCount = (codes[language] || '').split('\n').length;

  return (
    <div style={S.root}>

      {/* ── Top Bar ── */}
      <div style={S.topBar}>

        {/* Left: Title + Language tabs */}
        <div style={S.topLeft}>
          <span style={S.title}>Playground</span>
          <div style={S.separator} />
          <div style={S.langTabs}>
            {LANGS.map(l => (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id)}
                style={{ ...S.langTab, ...(language === l.id ? S.langTabActive : {}) }}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Settings + Actions */}
        <div style={S.topRight}>
          {/* Rate limit or throttle */}
          {throttled ? (
            <span style={S.throttle}>⏸ {resetIn}s</span>
          ) : (
            <span style={{ ...S.rateLabel, color: remaining > 10 ? '#3fb950' : remaining > 5 ? '#d29922' : '#f85149' }}>
              {remaining} runs left
            </span>
          )}

          <select value={theme} onChange={e => setTheme(e.target.value)} style={S.select}>
            {THEMES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>

          <div style={S.fontSizer}>
            <button onClick={() => setFontSize(f => Math.max(f - 1, 10))} style={S.fontBtn}>A−</button>
            <span style={S.fontVal}>{fontSize}</span>
            <button onClick={() => setFontSize(f => Math.min(f + 1, 24))} style={S.fontBtn}>A+</button>
          </div>

          <button onClick={handleCopy}  style={S.ghostBtn}>Copy</button>
          <button onClick={handleReset} style={S.ghostBtn}>Reset</button>

          <button
            onClick={handleRun}
            disabled={isRunning || throttled}
            style={{ ...S.runBtn, opacity: (isRunning || throttled) ? 0.5 : 1 }}
          >
            {isRunning ? 'Running…' : '▶ Run'}
          </button>
        </div>
      </div>

      {/* ── Workspace ── */}
      <div style={S.workspace}>

        {/* ── Editor Column (Left / Main) ── */}
        <div
          ref={containerRef}
          style={{ ...S.editorCol, width: panelOpen ? '65%' : '100%' }}
        >
          {/* Editor sub-bar */}
          <div style={S.editorBar}>
            <span style={S.editorLang}>
              <span style={{ ...S.langDot, background: '#7c6df0' }} />
              {currentLang?.name} · {lineCount} lines
            </span>
            <div style={S.editorBarRight}>
              <span style={S.monoText}>Ctrl+Enter to run</span>
              <button
                onClick={() => setPanelOpen(o => !o)}
                style={S.panelToggle}
                title={panelOpen ? 'Hide panel' : 'Show panel'}
              >
                {panelOpen ? '⊢ Hide Panel' : '⊣ Snippets'}
              </button>
            </div>
          </div>

          {/* Monaco editor */}
          <div style={S.editorWrapper}>
            <CodeEditor
              language={language}
              code={codes[language]}
              onChange={val => setCodes(prev => ({ ...prev, [language]: val }))}
              theme={theme}
              fontSize={fontSize}
              onRun={handleRun}
            />
          </div>

          {/* Console resize handle */}
          <div
            style={S.resizeHandle}
            onMouseDown={() => { draggingRef.current = true; }}
          />

          {/* Console panel */}
          <div style={{ height: consoleH, flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <ConsolePanel
              stdout={stdout}
              stderr={stderr}
              compileErr={compileErr}
              exitCode={exitCode}
              execTime={execTime}
              isRunning={isRunning}
              testResults={[]}
              customInput={customInput}
              useCustom={useCustom}
              onCustomChange={setCustomInput}
              onUseCustomChange={setUseCustom}
              onRun={handleRun}
              onClear={handleClear}
            />
          </div>

          {/* Status bar */}
          <div style={S.statusBar}>
            <span style={S.statusText}>{currentLang?.name} {currentLang?.version}</span>
            <span style={S.statusText}>Theme: {THEMES.find(t => t.id === theme)?.label}</span>
            <span style={S.statusText}>Font: {fontSize}px</span>
          </div>
        </div>

        {/* ── Right Panel ── */}
        {panelOpen && (
          <div style={S.rightPanel}>

            {/* Panel Tab Bar */}
            <div style={S.panelTabBar}>
              {['snippets', 'shortcuts'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setPanelTab(tab)}
                  style={{ ...S.panelTab, ...(panelTab === tab ? S.panelTabActive : {}) }}
                >
                  {tab === 'snippets' ? 'Snippets' : 'Shortcuts'}
                </button>
              ))}
            </div>

            {/* Panel Body */}
            <div style={S.panelBody}>

              {/* ── Snippets Tab ── */}
              {panelTab === 'snippets' && (
                <div>
                  <div style={S.panelLangNote}>
                    Snippets for <strong style={{ color: '#e6edf3' }}>{currentLang?.name}</strong>
                    <br />
                    <span style={{ fontSize: 11, color: '#484f58' }}>Click any snippet to insert at cursor end.</span>
                  </div>
                  {categories.length === 0 ? (
                    <div style={S.emptyNote}>No snippets available for this language yet.</div>
                  ) : (
                    categories.map(cat => (
                      <div key={cat.category} style={S.catBlock}>
                        {/* Category header — accordion toggle */}
                        <button
                          style={S.catHeader}
                          onClick={() => toggleCat(cat.category)}
                        >
                          <span style={S.catName}>{cat.category}</span>
                          <span style={S.catChevron}>
                            {openCats[cat.category] === false ? '▸' : '▾'}
                          </span>
                        </button>
                        {/* Items — show by default (hidden if explicitly closed) */}
                        {openCats[cat.category] !== false && (
                          <div style={S.catItems}>
                            {cat.items.map((item, i) => (
                              <button
                                key={i}
                                style={S.snippetBtn}
                                onClick={() => insertSnippet(item)}
                                title={item.code}
                              >
                                <span style={S.snippetPlus}>+</span>
                                <span style={S.snippetLabel}>{item.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ── Shortcuts Tab ── */}
              {panelTab === 'shortcuts' && (
                <div>
                  <div style={S.panelLangNote}>
                    <strong style={{ color: '#e6edf3' }}>Editor keyboard shortcuts</strong>
                    <br />
                    <span style={{ fontSize: 11, color: '#484f58' }}>Monaco editor keybindings.</span>
                  </div>
                  <div style={S.shortcutList}>
                    {SHORTCUTS.map((s, i) => (
                      <div key={i} style={S.shortcutRow}>
                        <span style={S.shortcutAction}>{s.action}</span>
                        <kbd style={S.kbd}>{s.key}</kbd>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  root: {
    display:       'flex',
    flexDirection: 'column',
    height:        'calc(100vh - 56px)',
    background:    '#0d1117',
    overflow:      'hidden',
    fontFamily:    "'Inter', 'Segoe UI', sans-serif",
    color:         '#e6edf3',
  },

  // Top Bar
  topBar: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '0 16px',
    height:         48,
    background:     '#161b22',
    borderBottom:   '1px solid #21262d',
    flexShrink:     0,
    gap:            12,
  },
  topLeft: {
    display:    'flex',
    alignItems: 'center',
    gap:        12,
    minWidth:   0,
  },
  title: {
    fontSize:    14,
    fontWeight:  700,
    color:       '#e6edf3',
    letterSpacing: '-0.3px',
    whiteSpace:  'nowrap',
  },
  separator: {
    width:      1,
    height:     18,
    background: '#30363d',
    flexShrink: 0,
  },
  langTabs: {
    display:    'flex',
    gap:        2,
    background: '#0d1117',
    borderRadius: 8,
    padding:    3,
  },
  langTab: {
    padding:      '4px 12px',
    borderRadius: 6,
    border:       'none',
    background:   'transparent',
    color:        '#8b949e',
    fontSize:     12,
    fontWeight:   500,
    cursor:       'pointer',
    whiteSpace:   'nowrap',
    fontFamily:   "'Inter', sans-serif",
    transition:   'all 0.12s',
  },
  langTabActive: {
    background: '#21262d',
    color:      '#e6edf3',
  },
  topRight: {
    display:    'flex',
    alignItems: 'center',
    gap:        8,
    flexShrink: 0,
  },
  rateLabel: {
    fontSize:   11,
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace",
  },
  throttle: {
    fontSize:   11,
    fontWeight: 600,
    color:      '#d29922',
    background: '#1a1410',
    border:     '1px solid #9e6a03',
    borderRadius: 6,
    padding:    '3px 8px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  select: {
    background:   '#21262d',
    border:       '1px solid #30363d',
    color:        '#c9d1d9',
    borderRadius: 6,
    padding:      '4px 8px',
    fontSize:     12,
    cursor:       'pointer',
    outline:      'none',
    fontFamily:   "'Inter', sans-serif",
  },
  fontSizer: {
    display:      'flex',
    alignItems:   'center',
    background:   '#21262d',
    border:       '1px solid #30363d',
    borderRadius: 6,
    overflow:     'hidden',
  },
  fontBtn: {
    padding:    '4px 8px',
    background: 'transparent',
    border:     'none',
    color:      '#8b949e',
    cursor:     'pointer',
    fontSize:   11,
    fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
  },
  fontVal: {
    fontSize:   11,
    color:      '#c9d1d9',
    fontWeight: 600,
    padding:    '0 4px',
    fontFamily: "'JetBrains Mono', monospace",
    minWidth:   28,
    textAlign:  'center',
  },
  ghostBtn: {
    padding:      '4px 10px',
    background:   'transparent',
    border:       '1px solid #30363d',
    color:        '#8b949e',
    borderRadius: 6,
    cursor:       'pointer',
    fontSize:     12,
    fontWeight:   500,
    fontFamily:   "'Inter', sans-serif",
    transition:   'all 0.12s',
  },
  runBtn: {
    padding:      '6px 18px',
    background:   '#238636',
    color:        '#ffffff',
    border:       'none',
    borderRadius: 6,
    fontWeight:   700,
    fontSize:     13,
    cursor:       'pointer',
    fontFamily:   "'Inter', sans-serif",
    transition:   'opacity 0.15s',
    whiteSpace:   'nowrap',
  },

  // Workspace
  workspace: {
    display:  'flex',
    flex:     1,
    overflow: 'hidden',
  },

  // Editor Column
  editorCol: {
    display:       'flex',
    flexDirection: 'column',
    overflow:      'hidden',
    transition:    'width 0.2s ease',
    minWidth:      0,
    flex:          1,
  },
  editorBar: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '0 14px',
    height:         34,
    background:     '#0d1117',
    borderBottom:   '1px solid #21262d',
    flexShrink:     0,
  },
  editorLang: {
    display:    'flex',
    alignItems: 'center',
    gap:        8,
    fontSize:   12,
    color:      '#8b949e',
    fontFamily: "'JetBrains Mono', monospace",
  },
  langDot: {
    width:        8,
    height:       8,
    borderRadius: '50%',
    flexShrink:   0,
  },
  editorBarRight: {
    display:    'flex',
    alignItems: 'center',
    gap:        12,
  },
  monoText: {
    fontSize:   11,
    color:      '#484f58',
    fontFamily: "'JetBrains Mono', monospace",
  },
  panelToggle: {
    padding:      '3px 10px',
    background:   'transparent',
    border:       '1px solid #30363d',
    color:        '#8b949e',
    borderRadius: 5,
    cursor:       'pointer',
    fontSize:     11,
    fontFamily:   "'Inter', sans-serif",
    transition:   'all 0.12s',
  },
  editorWrapper: {
    flex:     1,
    overflow: 'hidden',
    minHeight: 0,
  },
  resizeHandle: {
    height:     5,
    background: 'transparent',
    borderTop:  '1px solid #21262d',
    cursor:     'ns-resize',
    flexShrink: 0,
  },
  statusBar: {
    display:    'flex',
    alignItems: 'center',
    gap:        16,
    padding:    '3px 14px',
    background: '#161b22',
    borderTop:  '1px solid #21262d',
    flexShrink: 0,
  },
  statusText: {
    fontSize:   10,
    color:      '#484f58',
    fontFamily: "'JetBrains Mono', monospace",
  },

  // Right Panel
  rightPanel: {
    width:         '35%',
    maxWidth:      420,
    minWidth:      260,
    display:       'flex',
    flexDirection: 'column',
    background:    '#161b22',
    borderLeft:    '1px solid #21262d',
    overflow:      'hidden',
    flexShrink:    0,
  },
  panelTabBar: {
    display:        'flex',
    borderBottom:   '1px solid #21262d',
    background:     '#0d1117',
    flexShrink:     0,
  },
  panelTab: {
    flex:         1,
    padding:      '10px 0',
    background:   'transparent',
    border:       'none',
    borderBottom: '2px solid transparent',
    color:        '#8b949e',
    fontSize:     12,
    fontWeight:   600,
    cursor:       'pointer',
    fontFamily:   "'Inter', sans-serif",
    transition:   'all 0.12s',
  },
  panelTabActive: {
    color:            '#e6edf3',
    borderBottomColor:'#388bfd',
  },
  panelBody: {
    flex:      1,
    overflowY: 'auto',
    padding:   '12px 10px',
    scrollbarWidth: 'thin',
  },
  panelLangNote: {
    fontSize:     12,
    color:        '#8b949e',
    marginBottom: 14,
    lineHeight:   1.6,
    padding:      '8px 10px',
    background:   '#0d1117',
    borderRadius: 6,
    border:       '1px solid #21262d',
  },
  emptyNote: {
    fontSize:  12,
    color:     '#484f58',
    textAlign: 'center',
    padding:   24,
  },

  // Categories (accordion)
  catBlock: {
    marginBottom: 6,
  },
  catHeader: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    width:          '100%',
    padding:        '6px 8px',
    background:     'transparent',
    border:         'none',
    cursor:         'pointer',
    borderRadius:   6,
    transition:     'background 0.12s',
  },
  catName: {
    fontSize:      11,
    fontWeight:    700,
    color:         '#8b949e',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontFamily:    "'Inter', sans-serif",
  },
  catChevron: {
    fontSize: 10,
    color:    '#484f58',
  },
  catItems: {
    paddingLeft: 4,
    paddingBottom: 4,
  },
  snippetBtn: {
    display:      'flex',
    alignItems:   'center',
    gap:          8,
    width:        '100%',
    background:   'transparent',
    border:       '1px solid #21262d',
    borderRadius: 6,
    color:        '#c9d1d9',
    cursor:       'pointer',
    padding:      '7px 10px',
    fontSize:     12,
    fontFamily:   "'Inter', sans-serif",
    marginBottom: 3,
    textAlign:    'left',
    transition:   'all 0.12s',
  },
  snippetPlus: {
    fontSize:   13,
    color:      '#388bfd',
    fontWeight: 700,
    lineHeight: 1,
    flexShrink: 0,
  },
  snippetLabel: {
    color:     '#c9d1d9',
    fontSize:  12,
    lineHeight: 1.3,
  },

  // Shortcuts
  shortcutList: {
    display:       'flex',
    flexDirection: 'column',
    gap:           1,
  },
  shortcutRow: {
    display:         'flex',
    justifyContent:  'space-between',
    alignItems:      'center',
    padding:         '7px 6px',
    borderBottom:    '1px solid #21262d',
    gap:             8,
  },
  shortcutAction: {
    fontSize:   12,
    color:      '#c9d1d9',
    fontFamily: "'Inter', sans-serif",
    flex:       1,
    minWidth:   0,
  },
  kbd: {
    background:   '#0d1117',
    border:       '1px solid #30363d',
    borderRadius: 4,
    padding:      '2px 7px',
    fontSize:     10.5,
    fontFamily:   "'JetBrains Mono', monospace",
    color:        '#8b949e',
    whiteSpace:   'nowrap',
    flexShrink:   0,
  },
};
