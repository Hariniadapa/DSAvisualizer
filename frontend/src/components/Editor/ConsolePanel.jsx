// frontend/src/components/Editor/ConsolePanel.jsx
// Reusable multi-tab console panel: Output, Error, Test Cases, Custom Input
import { useState, useRef, useEffect } from 'react';

// ── Strip ANSI escape codes ──────────────────────────────────────────────────
function stripAnsi(str = '') {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*m/g, '');
}

// ── Parse compile errors for line hints ─────────────────────────────────────
function parseErrorLines(stderr = '') {
  const lines = [];
  const patterns = [
    /(\w+\.(?:py|js|java|cpp|c)):(\d+):/g,       // filename:line:
    /line (\d+)/gi,                                // "line N"
    /:(\d+):\d+:/g,                               // :line:col:
  ];
  for (const p of patterns) {
    let m;
    while ((m = p.exec(stderr)) !== null) {
      const n = parseInt(m[m.length - 1], 10);
      if (n > 0 && !lines.includes(n)) lines.push(n);
    }
  }
  return lines;
}

// ── Styles ───────────────────────────────────────────────────────────────────
const S = {
  root: {
    display:       'flex',
    flexDirection: 'column',
    height:        '100%',
    background:    '#0d1117',
    borderTop:     '1px solid #21262d',
  },
  tabBar: {
    display:       'flex',
    alignItems:    'center',
    justifyContent:'space-between',
    background:    '#161b22',
    borderBottom:  '1px solid #21262d',
    padding:       '0 8px',
    flexShrink:    0,
    minHeight:     40,
  },
  tabs: {
    display:    'flex',
    gap:        2,
    alignItems: 'center',
  },
  tab: {
    padding:      '6px 12px',
    background:   'transparent',
    border:       'none',
    color:        '#8b949e',
    cursor:       'pointer',
    borderRadius: 6,
    fontSize:     12,
    fontWeight:   500,
    fontFamily:   "'Inter', sans-serif",
    transition:   'all 0.15s ease',
    whiteSpace:   'nowrap',
  },
  tabOn: {
    color:      '#e6edf3',
    background: '#21262d',
  },
  tabBadgePass: {
    display:      'inline-flex',
    alignItems:   'center',
    justifyContent:'center',
    marginLeft:   5,
    background:   '#1a4731',
    color:        '#3fb950',
    borderRadius: 99,
    fontSize:     10,
    fontWeight:   700,
    padding:      '1px 6px',
  },
  tabBadgeFail: {
    display:      'inline-flex',
    alignItems:   'center',
    justifyContent:'center',
    marginLeft:   5,
    background:   '#4a1e1e',
    color:        '#f85149',
    borderRadius: 99,
    fontSize:     10,
    fontWeight:   700,
    padding:      '1px 6px',
  },
  statusBar: {
    display:     'flex',
    alignItems:  'center',
    gap:         8,
    padding:     '2px 0',
  },
  statusBit: {
    fontSize:    11,
    color:       '#484f58',
    fontFamily:  "'JetBrains Mono', monospace",
  },
  exitBadgeOk: {
    background:   '#1a4731',
    color:        '#3fb950',
    borderRadius: 99,
    padding:      '1px 8px',
    fontSize:     11,
    fontWeight:   700,
    fontFamily:   "'JetBrains Mono', monospace",
  },
  exitBadgeErr: {
    background:   '#4a1e1e',
    color:        '#f85149',
    borderRadius: 99,
    padding:      '1px 8px',
    fontSize:     11,
    fontWeight:   700,
    fontFamily:   "'JetBrains Mono', monospace",
  },
  timeBadge: {
    background:   '#161b22',
    color:        '#79c0ff',
    borderRadius: 99,
    padding:      '1px 8px',
    fontSize:     11,
    fontWeight:   600,
    fontFamily:   "'JetBrains Mono', monospace",
    border:       '1px solid #21262d',
  },
  clearBtn: {
    background:   'transparent',
    border:       '1px solid #30363d',
    color:        '#8b949e',
    borderRadius: 6,
    padding:      '2px 10px',
    fontSize:     11,
    cursor:       'pointer',
    fontFamily:   "'Inter', sans-serif",
    transition:   'all 0.15s',
  },
  body: {
    flex:       1,
    overflowY:  'auto',
    padding:    '12px 16px',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize:   12.5,
  },
  empty: {
    color:       '#484f58',
    fontStyle:   'italic',
    fontSize:    13,
    textAlign:   'center',
    padding:     '32px 16px',
    fontFamily:  "'Inter', sans-serif",
    lineHeight:  1.7,
  },
  label: {
    color:       '#8b949e',
    fontSize:    10,
    fontWeight:  700,
    letterSpacing:'0.05em',
    textTransform:'uppercase',
    marginBottom: 4,
    fontFamily:  "'Inter', sans-serif",
  },
  pre: {
    margin:       '0 0 12px',
    padding:      '10px 14px',
    background:   '#161b22',
    borderRadius: 8,
    border:       '1px solid #21262d',
    overflowX:    'auto',
    fontSize:     12.5,
    lineHeight:   1.65,
    whiteSpace:   'pre-wrap',
    wordBreak:    'break-all',
  },
  errorBlock: {
    background:   '#1a0a0a',
    border:       '1px solid #4a1e1e',
    borderRadius: 8,
    padding:      '12px 14px',
    marginBottom: 12,
  },
  errorTitle: {
    color:       '#f85149',
    fontWeight:  700,
    fontSize:    12,
    marginBottom:6,
    fontFamily:  "'Inter', sans-serif",
    display:     'flex',
    alignItems:  'center',
    gap:         6,
  },
  errorPre: {
    margin:    0,
    color:     '#ffa198',
    fontSize:  12,
    lineHeight:1.65,
    whiteSpace:'pre-wrap',
    wordBreak: 'break-all',
  },
  lineHint: {
    marginTop:    8,
    background:   '#21262d',
    borderRadius: 6,
    padding:      '4px 10px',
    fontSize:     11,
    color:        '#79c0ff',
    fontFamily:   "'Inter', sans-serif",
  },
  testCase: {
    background:   '#161b22',
    borderRadius: 10,
    border:       '1px solid #21262d',
    marginBottom: 10,
    overflow:     'hidden',
  },
  testCaseHeader: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '8px 14px',
    background:     '#0d1117',
    borderBottom:   '1px solid #21262d',
  },
  testGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap:                 1,
    background:          '#21262d',
  },
  testCell: {
    background: '#161b22',
    padding:    '10px 12px',
  },
  customArea: {
    background:  '#161b22',
    border:      '1px solid #21262d',
    borderRadius: 8,
    color:       '#e6edf3',
    fontFamily:  "'JetBrains Mono', monospace",
    fontSize:    12.5,
    padding:     '10px 14px',
    width:       '100%',
    minHeight:   100,
    resize:      'vertical',
    outline:     'none',
    lineHeight:  1.65,
    boxSizing:   'border-box',
  },
  customControls: {
    display:     'flex',
    alignItems:  'center',
    gap:         12,
    marginTop:   10,
    flexWrap:    'wrap',
  },
  checkLabel: {
    display:    'flex',
    alignItems: 'center',
    gap:        6,
    color:      '#8b949e',
    fontSize:   13,
    cursor:     'pointer',
    userSelect: 'none',
    fontFamily: "'Inter', sans-serif",
  },
  runCustomBtn: {
    padding:      '7px 18px',
    background:   'linear-gradient(135deg, #1f6feb, #388bfd)',
    color:        '#fff',
    border:       'none',
    borderRadius: 8,
    fontWeight:   700,
    fontSize:     13,
    cursor:       'pointer',
    fontFamily:   "'Inter', sans-serif",
    transition:   'opacity 0.15s',
  },
};

// ── Main Component ───────────────────────────────────────────────────────────
export default function ConsolePanel({
  stdout       = '',
  stderr       = '',
  compileErr   = '',
  exitCode     = null,
  execTime     = null,
  isRunning    = false,
  testResults  = [],
  customInput  = '',
  useCustom    = false,
  onCustomChange,
  onUseCustomChange,
  onRun,
  onClear,
  defaultTab   = 'output',
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Switch to output when a run starts, switch to tests when test results arrive
  const prevRunning = useRef(false);
  useEffect(() => {
    if (isRunning && !prevRunning.current) {
      setActiveTab('output');
    }
    prevRunning.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    if (testResults.length > 0) setActiveTab('tests');
  }, [testResults.length]);

  const passCount = testResults.filter(r => r.passed).length;
  const failCount = testResults.length - passCount;
  const hasError  = !!(compileErr || stderr);

  const tabs = [
    { id: 'output', label: '⬛ Output' },
    { id: 'errors', label: '🔴 Errors', badge: hasError ? '!' : null, badgeStyle: 'fail' },
    { id: 'tests',  label: '✅ Tests',
      badge: testResults.length > 0 ? `${passCount}/${testResults.length}` : null,
      badgeStyle: failCount > 0 ? 'fail' : 'pass',
    },
    { id: 'custom', label: '⌨ Input' },
  ];

  const exitBadge = exitCode === null ? null : exitCode === 0
    ? <span style={S.exitBadgeOk}>✓ Exit 0</span>
    : <span style={S.exitBadgeErr}>✗ Exit {exitCode}</span>;

  return (
    <div style={S.root}>
      {/* Tab Bar */}
      <div style={S.tabBar}>
        <div style={S.tabs}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{ ...S.tab, ...(activeTab === t.id ? S.tabOn : {}) }}
            >
              {t.label}
              {t.badge && (
                <span style={t.badgeStyle === 'pass' ? S.tabBadgePass : S.tabBadgeFail}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        <div style={S.statusBar}>
          {isRunning && <span style={S.statusBit}>⏳ Executing…</span>}
          {!isRunning && execTime && <span style={S.timeBadge}>⚡ {execTime}s</span>}
          {exitBadge}
          {(stdout || stderr || compileErr) && !isRunning && (
            <button onClick={onClear} style={S.clearBtn}>⊘ Clear</button>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={S.body}>

        {/* ── OUTPUT TAB ── */}
        {activeTab === 'output' && (
          <>
            {isRunning && (
              <div style={S.empty}>⏳ Running your code…</div>
            )}
            {!isRunning && !stdout && !compileErr && !stderr && testResults.length === 0 && (
              <div style={S.empty}>
                Click <strong style={{ color: '#e6edf3' }}>▶ Run</strong> to execute your code
                <br />or <strong style={{ color: '#e6edf3' }}>▷ Run Tests</strong> to check sample cases.
              </div>
            )}
            {!isRunning && (compileErr || stderr || stdout || testResults.length > 0) && (() => {
              let verdict = null;
              let color = '';
              let bgColor = '';
              let desc = '';
              let title = '';

              if (compileErr) {
                verdict = 'Compile Error';
                title = '🔴 Compile Error';
                color = '#f85149';
                bgColor = '#4a1e1e22';
                desc = 'Your code failed to compile. Check the compilation logs below.';
              } else if (stderr || (exitCode !== null && exitCode !== 0)) {
                verdict = 'Runtime Error';
                title = '⚠️ Runtime Error';
                color = '#f0883e';
                bgColor = '#4a2d1e22';
                desc = `Your program crashed with exit code ${exitCode ?? 1}. Check stderr output.`;
              } else if (testResults.length > 0) {
                const passed = testResults.every(r => r.passed);
                if (passed) {
                  verdict = 'Accepted';
                  title = '✅ Accepted';
                  color = '#3fb950';
                  bgColor = '#1a473122';
                  desc = `All ${testResults.length} sample test cases passed successfully.`;
                } else {
                  const passedCount = testResults.filter(r => r.passed).length;
                  verdict = 'Wrong Answer';
                  title = '❌ Wrong Answer';
                  color = '#f85149';
                  bgColor = '#4a1e1e22';
                  desc = `${passedCount}/${testResults.length} test cases passed. Compare output differences in the Tests tab.`;
                }
              } else if (stdout) {
                verdict = 'Finished';
                title = '🟢 Finished';
                color = '#3fb950';
                bgColor = '#1a473122';
                desc = 'Your code executed successfully on the input.';
              }

              if (!verdict) return null;

              return (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  marginBottom: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  fontFamily: "'Inter', sans-serif",
                  backgroundColor: bgColor,
                  border: `1px solid ${color}44`
                }}>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    {title}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: '#8b949e',
                  }}>
                    {desc}
                  </div>
                </div>
              );
            })()}
            {stdout && (
              <>
                <div style={S.label}>stdout</div>
                <pre style={{ ...S.pre, color: '#3fb950' }}>{stdout}</pre>
              </>
            )}
            {compileErr && (
              <div style={S.errorBlock}>
                <div style={S.errorTitle}>🔴 Compilation Error</div>
                <pre style={S.errorPre}>{compileErr}</pre>
              </div>
            )}
          </>
        )}

        {/* ── ERRORS TAB ── */}
        {activeTab === 'errors' && (
          <>
            {!hasError && !isRunning && (
              <div style={S.empty}>No errors detected.</div>
            )}
            {compileErr && (
              <div style={S.errorBlock}>
                <div style={S.errorTitle}>
                  <span>🔴 Compilation Error</span>
                </div>
                <pre style={S.errorPre}>{compileErr}</pre>
                {parseErrorLines(compileErr).length > 0 && (
                  <div style={S.lineHint}>
                    💡 Error near line{parseErrorLines(compileErr).length > 1 ? 's' : ''}{' '}
                    {parseErrorLines(compileErr).join(', ')} — jump to line in editor with Ctrl+G
                  </div>
                )}
              </div>
            )}
            {stderr && (
              <div style={S.errorBlock}>
                <div style={S.errorTitle}>⚠ Runtime Error / stderr</div>
                <pre style={S.errorPre}>{stderr}</pre>
                {parseErrorLines(stderr).length > 0 && (
                  <div style={S.lineHint}>
                    💡 Error near line{parseErrorLines(stderr).length > 1 ? 's' : ''}{' '}
                    {parseErrorLines(stderr).join(', ')} — jump to line in editor with Ctrl+G
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── TEST CASES TAB ── */}
        {activeTab === 'tests' && (
          <>
            {testResults.length === 0 && !isRunning && (
              <div style={S.empty}>
                Click <strong style={{ color: '#e6edf3' }}>▷ Run Tests</strong> to execute against sample test cases.
              </div>
            )}
            {isRunning && testResults.length === 0 && (
              <div style={S.empty}>⏳ Running test cases…</div>
            )}
            {testResults.map((r, i) => (
              <div key={i} style={{ ...S.testCase, borderColor: r.passed ? '#1a4731' : '#4a1e1e' }}>
                <div style={S.testCaseHeader}>
                  <span style={{ color: r.passed ? '#3fb950' : '#f85149', fontWeight: 700, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
                    {r.passed ? '✅' : '❌'} Test {r.index}
                  </span>
                  <span style={{ color: '#484f58', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                    ⚡ {r.elapsed}s &nbsp;|&nbsp; Exit: {r.exitCode ?? '?'}
                  </span>
                </div>
                <div style={S.testGrid}>
                  <div style={S.testCell}>
                    <div style={S.label}>Input</div>
                    <pre style={{ ...S.pre, color: '#e6edf3', marginBottom: 0 }}>{r.input}</pre>
                  </div>
                  <div style={S.testCell}>
                    <div style={S.label}>Expected</div>
                    <pre style={{ ...S.pre, color: '#3fb950', marginBottom: 0 }}>{r.expected}</pre>
                  </div>
                  <div style={S.testCell}>
                    <div style={S.label}>Your Output</div>
                    <pre style={{ ...S.pre, color: r.passed ? '#3fb950' : '#f85149', marginBottom: 0 }}>
                      {r.actual || '(empty)'}
                    </pre>
                  </div>
                </div>
                {r.stderr && (
                  <div style={{ padding: '8px 12px', borderTop: '1px solid #21262d' }}>
                    <div style={S.label}>stderr</div>
                    <pre style={{ ...S.pre, color: '#ffa198', marginBottom: 0 }}>{r.stderr}</pre>
                  </div>
                )}
              </div>
            ))}
            {testResults.length > 0 && (
              <div style={{ color: '#8b949e', fontSize: 12, fontFamily: "'Inter', sans-serif", padding: '4px 0' }}>
                {passCount}/{testResults.length} tests passed
              </div>
            )}
          </>
        )}

        {/* ── CUSTOM INPUT TAB ── */}
        {activeTab === 'custom' && (
          <>
            <div style={S.label}>stdin — Custom Input</div>
            <textarea
              style={S.customArea}
              value={customInput}
              onChange={e => onCustomChange?.(e.target.value)}
              placeholder="Enter your custom stdin input here…"
              spellCheck={false}
            />
            <div style={S.customControls}>
              <label style={S.checkLabel}>
                <input
                  type="checkbox"
                  checked={useCustom}
                  onChange={e => onUseCustomChange?.(e.target.checked)}
                  style={{ accentColor: '#1f6feb', width: 15, height: 15 }}
                />
                Use when clicking Run
              </label>
              <button
                onClick={onRun}
                disabled={isRunning}
                style={{ ...S.runCustomBtn, opacity: isRunning ? 0.5 : 1 }}
              >
                {isRunning ? '⏳ Running…' : '▶ Run with this input'}
              </button>
            </div>
            {(stdout || stderr) && (
              <div style={{ marginTop: 16 }}>
                <div style={S.label}>Output</div>
                {stdout && <pre style={{ ...S.pre, color: '#3fb950' }}>{stdout}</pre>}
                {stderr && <pre style={{ ...S.pre, color: '#ffa198' }}>{stderr}</pre>}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
