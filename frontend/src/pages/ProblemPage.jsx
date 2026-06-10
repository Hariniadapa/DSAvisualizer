import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Visualizer from '../components/Visualizer/Visualizer';
import AICoach from '../components/AICoach/AICoach';
import CodeEditor, { DEFAULT_CODE } from '../components/Editor/CodeEditor';
import * as api from '../services/api';
import { getProblemDetails } from '../utils/problemStatements';
import { recordSolved } from '../utils/gamification';
import toast from 'react-hot-toast';

// ── Constants ────────────────────────────────────────────────────────────────
const LANGS = [
  { id: 'python',     name: 'Python 3.10',    icon: '🐍' },
  { id: 'javascript', name: 'JavaScript ES18', icon: '🟨' },
  { id: 'java',       name: 'Java 15',         icon: '☕' },
  { id: 'cpp',        name: 'C++ 17',          icon: '⚡' },
  { id: 'c',          name: 'C 11',            icon: '🔧' },
];

const EDITOR_THEMES = [
  { id: 'vs-dark',    name: 'VS Dark'      },
  { id: 'one-dark',   name: 'One Dark Pro' },
  { id: 'monokai',    name: 'Monokai'      },
  { id: 'solarized',  name: 'Solarized'    },
  { id: 'nord',       name: 'Nord'         },
  { id: 'github-dark',name: 'GitHub Dark'  },
];

// Piston language runtimes mapping
const PISTON_VERSION = {
  python: '3.10.0', javascript: '18.15.0', java: '15.0.2', cpp: '10.2.0', c: '10.2.0'
};

// ── Ansi-strip helper for console output ────────────────────────────────────
function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*m/g, '');
}

export default function ProblemPage() {
  const params   = useParams();
  const navigate = useNavigate();

  // Extract contestId and index
  let contestId = null;
  let index     = null;

  if (params.contestId && params.index) {
    contestId = params.contestId;
    index     = params.index;
  } else if (params.id) {
    const parts = params.id.split('_');
    if (parts.length === 2) { contestId = parts[0]; index = parts[1]; }
  }

  const problemId = `${contestId}-${index}`;

  // ── State ──────────────────────────────────────────────────────────────────
  const [problem,      setProblem]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [language,     setLanguage]     = useState('python');
  const [editorTheme,  setEditorTheme]  = useState('one-dark');
  const [codes,        setCodes]        = useState({ ...DEFAULT_CODE });
  const [leftTab,      setLeftTab]      = useState('description');
  const [rightTab,     setRightTab]     = useState('console');
  const [prevProblem,  setPrevProblem]  = useState(null);
  const [nextProblem,  setNextProblem]  = useState(null);
  const [attempts,     setAttempts]     = useState(0);
  const [fontSize,     setFontSize]     = useState(14);
  const [consoleTab,   setConsoleTab]   = useState('output'); // output | testcases | custom

  // Console state
  const [stdout,       setStdout]       = useState('');
  const [stderr,       setStderr]       = useState('');
  const [exitCode,     setExitCode]     = useState(null);
  const [compileErr,   setCompileErr]   = useState('');
  const [isRunning,    setIsRunning]    = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [execTime,     setExecTime]     = useState(null);

  // Custom input
  const [customInput,  setCustomInput]  = useState('');
  const [useCustom,    setUseCustom]    = useState(false);

  // Notes
  const [notes, setNotes] = useState(() =>
    localStorage.getItem(`notes-${problemId}`) || ''
  );

  // Test results
  const [testResults, setTestResults] = useState([]);

  // Resizable pane
  const [leftWidth, setLeftWidth] = useState(40);
  const isDragging = useRef(false);

  // ── Load problem ───────────────────────────────────────────────────────────
  const loadProblem = useCallback(async () => {
    if (!contestId || !index) { setLoading(false); return; }
    setLoading(true);
    let rawProblem = null;

    try {
      const res = await api.getProblem(contestId, index);
      if (res.data) rawProblem = res.data;
    } catch {
      // fallback to Codeforces public API
    }

    if (!rawProblem) {
      try {
        const r = await fetch('https://codeforces.com/api/problemset.problems');
        const d = await r.json();
        const p = d.result.problems.find(
          x => String(x.contestId) === String(contestId) && String(x.index) === String(index)
        );
        if (p) rawProblem = { contestId: p.contestId, index: p.index, name: p.name, rating: p.rating, tags: p.tags };
      } catch { /* ignore */ }
    }

    if (rawProblem) {
      const detailed = getProblemDetails(contestId, index, rawProblem.name, rawProblem.tags, rawProblem.rating);
      setProblem(detailed);

      try {
        const listRes = await api.getProblems(rawProblem.tags?.[0] || 'dp', 'medium');
        const pList   = listRes.data || [];
        const currIdx = pList.findIndex(p =>
          String(p.contestId) === String(contestId) && String(p.index) === String(index)
        );
        if (currIdx !== -1) {
          setPrevProblem(pList[currIdx - 1] || null);
          setNextProblem(pList[currIdx + 1] || null);
        }
      } catch { /* nav optional */ }
    } else {
      setProblem(null);
    }
    setLoading(false);
  }, [contestId, index]);

  useEffect(() => {
    loadProblem();
    setLeftTab('description');
    setStdout(''); setStderr(''); setExitCode(null); setCompileErr('');
    setTestResults([]);
    setNotes(localStorage.getItem(`notes-${problemId}`) || '');
  }, [loadProblem, problemId]);

  // ── Resizable splitter ─────────────────────────────────────────────────────
  const handleSplitterMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return;
      const container = document.getElementById('workspace-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct  = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(Math.max(pct, 25), 70));
    };
    const onUp = () => { isDragging.current = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',  onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',  onUp);
    };
  }, []);

  // ── Notes save ─────────────────────────────────────────────────────────────
  const handleNotesChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    localStorage.setItem(`notes-${problemId}`, val);
  };

  // ── Code Reset ─────────────────────────────────────────────────────────────
  const handleReset = () => {
    setCodes(prev => ({ ...prev, [language]: DEFAULT_CODE[language] }));
    toast('Code reset to default template.', { icon: '↩️' });
  };

  // ── Copy code ──────────────────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(codes[language] || '');
    toast.success('Code copied to clipboard!');
  };

  // ── Run against single stdin ───────────────────────────────────────────────
  const runOnce = async (code, lang, stdin) => {
    const start   = Date.now();
    const res     = await api.executeCode(code, lang, stdin);
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    return { ...res.data, elapsed };
  };

  // ── Run Code ───────────────────────────────────────────────────────────────
  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setRightTab('console');
    setConsoleTab('output');
    setStdout(''); setStderr(''); setExitCode(null); setCompileErr('');
    setExecTime(null);

    const code  = codes[language] || '';
    const stdin = useCustom ? customInput : (problem?.examples?.[0]?.input || '');

    try {
      const result = await runOnce(code, language, stdin);
      const run    = result.run    || {};
      const compile = result.compile || {};

      setExecTime(result.elapsed);
      setExitCode(run.code ?? null);

      if (compile.stderr) {
        setCompileErr(stripAnsi(compile.stderr));
      }

      setStdout(stripAnsi(run.stdout || ''));
      setStderr(stripAnsi(run.stderr || ''));

      if ((run.code ?? 0) !== 0) {
        toast.error(`Program exited with code ${run.code}`);
      } else {
        toast.success('Code executed successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Execution failed';
      setStderr(msg);
      toast.error(msg);
    } finally {
      setIsRunning(false);
    }
  };

  // ── Run against all sample test cases ─────────────────────────────────────
  const handleRunTests = async () => {
    if (isRunning || !problem?.examples?.length) return;
    setIsRunning(true);
    setRightTab('console');
    setConsoleTab('testcases');
    setTestResults([]);

    const code = codes[language] || '';

    const results = [];
    for (const [i, ex] of (problem.examples || []).entries()) {
      try {
        const result = await runOnce(code, language, ex.input);
        const run    = result.run || {};
        const actual = stripAnsi(run.stdout || '').trim();
        const expected = (ex.output || '').trim();
        results.push({
          index:    i + 1,
          input:    ex.input,
          expected,
          actual,
          passed:   actual === expected,
          stderr:   stripAnsi(run.stderr || ''),
          exitCode: run.code ?? null,
          elapsed:  result.elapsed,
        });
        setTestResults([...results]);
      } catch (err) {
        results.push({
          index:    i + 1,
          input:    ex.input,
          expected: ex.output,
          actual:   '',
          passed:   false,
          stderr:   err.response?.data?.error || err.message,
          elapsed:  '?',
        });
        setTestResults([...results]);
      }
    }

    const passed = results.filter(r => r.passed).length;
    const total  = results.length;

    if (passed === total) {
      toast.success(`All ${total} sample tests passed! 🎉`);
    } else {
      toast.error(`${passed}/${total} tests passed`);
    }

    setIsRunning(false);
  };

  // ── Submit Solution ────────────────────────────────────────────────────────
  const handleSubmit = async (solved) => {
    setIsSubmitting(true);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    try {
      await api.submitAttempt({
        problemId,
        topic:    problem?.tags?.[0] || 'general',
        solved,
        hintsUsed: 0,
        timeSecs:  60,
      });

      if (solved) {
        const diffKey = (problem?.rating <= 1200) ? 'easy' : (problem?.rating <= 1900) ? 'medium' : 'hard';
        const reward  = recordSolved(problemId, diffKey);
        toast.success(`🏆 Solved! +${reward.xpGained} XP | Streak: ${reward.newStreak} 🔥`);
      } else {
        toast.success('📝 Attempt saved. Keep going!');
      }
    } catch (err) {
      toast.error('Failed to save progress: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render helpers ─────────────────────────────────────────────────────────
  const diffColor = (d) => ({ Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' })[d] || '#888';

  const exitBadge = exitCode === null ? null : exitCode === 0
    ? <span style={S.badge('success')}>✓ Exit 0</span>
    : <span style={S.badge('error')}>✗ Exit {exitCode}</span>;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={S.centered}>
        <div style={S.spinner} />
        <p style={{ color: '#94a3b8', marginTop: 16 }}>Loading workspace…</p>
      </div>
    );
  }

  if (!contestId || !index) {
    return (
      <div style={S.centered}>
        <h3 style={S.errTitle}>Invalid Problem URL</h3>
        <p style={S.errText}>The URL parameters are incorrect.</p>
        <button onClick={() => navigate('/dashboard')} style={S.navBtn}>← Back to Dashboard</button>
      </div>
    );
  }

  if (!problem) {
    return (
      <div style={S.centered}>
        <h3 style={S.errTitle}>Problem Not Found</h3>
        <p style={S.errText}>Could not retrieve problem {contestId}-{index}.</p>
        <button onClick={() => navigate(-1)} style={S.navBtn}>← Go Back</button>
      </div>
    );
  }

  const allTestsPassed = testResults.length > 0 && testResults.every(r => r.passed);

  // ── Main JSX ───────────────────────────────────────────────────────────────
  return (
    <div style={S.root}>

      {/* ── Top Bar ── */}
      <div style={S.topBar}>
        <div style={S.breadcrumbs}>
          <Link to="/dashboard" style={S.crumb}>Dashboard</Link>
          <span style={S.crumbSep}>/</span>
          <Link to="/problems" style={S.crumb}>Problems</Link>
          <span style={S.crumbSep}>/</span>
          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{problem.title}</span>
        </div>

        <div style={S.topCenter}>
          {/* Language selector */}
          <div style={S.langWrap}>
            {LANGS.map(l => (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id)}
                style={{ ...S.langBtn, ...(language === l.id ? S.langBtnOn : {}) }}
                title={l.name}
              >
                {l.icon} {l.id.charAt(0).toUpperCase() + l.id.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={S.topRight}>
          {/* Theme */}
          <select
            value={editorTheme}
            onChange={e => setEditorTheme(e.target.value)}
            style={S.select}
            title="Editor Theme"
          >
            {EDITOR_THEMES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          {/* Font size */}
          <div style={S.fsBtns}>
            <button onClick={() => setFontSize(f => Math.max(f - 1, 10))} style={S.fsBtn}>A-</button>
            <span style={S.fsLabel}>{fontSize}px</span>
            <button onClick={() => setFontSize(f => Math.min(f + 1, 22))} style={S.fsBtn}>A+</button>
          </div>

          {/* Problem navigation */}
          <button
            disabled={!prevProblem}
            onClick={() => navigate(`/problem/${prevProblem.contestId}/${prevProblem.index}`)}
            style={{ ...S.navProbBtn, opacity: prevProblem ? 1 : 0.35 }}
          >◀</button>
          <button
            disabled={!nextProblem}
            onClick={() => navigate(`/problem/${nextProblem.contestId}/${nextProblem.index}`)}
            style={{ ...S.navProbBtn, opacity: nextProblem ? 1 : 0.35 }}
          >▶</button>
        </div>
      </div>

      {/* ── Workspace ── */}
      <div id="workspace-container" style={S.workspace}>

        {/* ═══ LEFT PANE ═══ */}
        <div style={{ ...S.leftPane, width: `${leftWidth}%` }}>
          {/* Left pane tabs */}
          <div style={S.paneTabs}>
            {['description', 'visualizer'].map(tab => (
              <button
                key={tab}
                onClick={() => setLeftTab(tab)}
                style={{ ...S.paneTab, ...(leftTab === tab ? S.paneTabOn : {}) }}
              >
                {tab === 'description' ? '📋 Description' : '📊 Visualizer'}
              </button>
            ))}
          </div>

          <div style={S.paneBody}>
            {leftTab === 'description' ? (
              <div style={S.descBody}>
                {/* Header */}
                <div style={S.problemHeader}>
                  <h1 style={S.problemTitle}>{problem.title}</h1>
                  <div style={S.metaRow}>
                    <span style={{ ...S.diffBadge, background: diffColor(problem.difficulty) }}>
                      {problem.difficulty}
                    </span>
                    {problem.rating && (
                      <span style={S.ratingBadge}>★ {problem.rating}</span>
                    )}
                    <a
                      href={`https://codeforces.com/problemset/problem/${contestId}/${index}`}
                      target="_blank" rel="noreferrer"
                      style={S.cfLink}
                    >
                      Codeforces ↗
                    </a>
                  </div>
                  <div style={S.tagsRow}>
                    {(problem.tags || []).map(t => (
                      <span key={t} style={S.tagBadge}>#{t}</span>
                    ))}
                  </div>
                </div>

                <div style={S.divider} />

                {/* Description */}
                <div style={S.section}>
                  <p style={S.bodyText}>{problem.description}</p>
                </div>

                {/* Input format */}
                {problem.inputFormat && (
                  <div style={S.section}>
                    <h4 style={S.secHeading}>Input Format</h4>
                    <p style={S.bodyText}>{problem.inputFormat}</p>
                  </div>
                )}

                {/* Output format */}
                {problem.outputFormat && (
                  <div style={S.section}>
                    <h4 style={S.secHeading}>Output Format</h4>
                    <p style={S.bodyText}>{problem.outputFormat}</p>
                  </div>
                )}

                {/* Constraints */}
                {problem.constraints?.length > 0 && (
                  <div style={S.section}>
                    <h4 style={S.secHeading}>Constraints</h4>
                    <div style={S.constraintsBox}>
                      {problem.constraints.map((c, i) => (
                        <div key={i} style={S.constraintLine}>
                          <span style={S.bullet}>•</span> {c}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Examples */}
                {problem.examples?.length > 0 && (
                  <div style={S.section}>
                    <h4 style={S.secHeading}>Examples</h4>
                    {problem.examples.map((ex, i) => (
                      <div key={i} style={S.exCard}>
                        <div style={S.exLabel}>Example {i + 1}</div>
                        <div style={S.exGrid}>
                          <div>
                            <div style={S.ioTag}>Input</div>
                            <pre style={S.pre}>{ex.input}</pre>
                          </div>
                          <div>
                            <div style={S.ioTag}>Output</div>
                            <pre style={S.pre}>{ex.output}</pre>
                          </div>
                        </div>
                        {ex.explanation && (
                          <div style={S.exExplain}>
                            <strong style={{ color: '#94a3b8' }}>Explanation: </strong>
                            {ex.explanation}
                          </div>
                        )}
                        {/* "Use as custom input" button */}
                        <button
                          style={S.useInputBtn}
                          onClick={() => { setCustomInput(ex.input); setUseCustom(true); }}
                        >
                          ⌨ Use as custom input
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {problem.notes && (
                  <div style={S.section}>
                    <h4 style={S.secHeading}>Notes</h4>
                    <p style={{ ...S.bodyText, fontStyle: 'italic', color: '#94a3b8' }}>{problem.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ height: '100%' }}>
                <Visualizer problem={problem} />
              </div>
            )}
          </div>
        </div>

        {/* ═══ SPLITTER ═══ */}
        <div
          style={S.splitter}
          onMouseDown={handleSplitterMouseDown}
        >
          <div style={S.splitterHandle} />
        </div>

        {/* ═══ RIGHT PANE ═══ */}
        <div style={{ ...S.rightPane, width: `${100 - leftWidth}%` }}>

          {/* Editor header */}
          <div style={S.editorHeader}>
            <div style={S.editorHeaderLeft}>
              <span style={S.editorTitle}>
                {LANGS.find(l => l.id === language)?.icon} &nbsp;
                {LANGS.find(l => l.id === language)?.name}
              </span>
              <span style={{ color: '#475569', fontSize: 12 }}>v{PISTON_VERSION[language]}</span>
            </div>
            <div style={S.editorHeaderRight}>
              <button onClick={handleCopy}  style={S.iconBtn} title="Copy code">⎘ Copy</button>
              <button onClick={handleReset} style={S.iconBtn} title="Reset to template">↩ Reset</button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div style={S.editorWrapper}>
            <CodeEditor
              language={language}
              code={codes[language]}
              onChange={val => setCodes(prev => ({ ...prev, [language]: val }))}
              theme={editorTheme}
            />
          </div>

          {/* Bottom console + tabs */}
          <div style={S.bottomSection}>

            {/* Bottom tab bar + action buttons */}
            <div style={S.bottomBar}>
              <div style={S.consoleTabs}>
                {['output', 'testcases', 'custom', 'coach', 'notes'].map(t => (
                  <button
                    key={t}
                    onClick={() => { setRightTab('console'); setConsoleTab(t); if (t === 'coach' || t === 'notes') setRightTab(t); }}
                    style={{
                      ...S.consoleTab,
                      ...(((rightTab === 'console' && consoleTab === t) || rightTab === t) ? S.consoleTabOn : {})
                    }}
                  >
                    {t === 'output'    ? '⬛ Output'      :
                     t === 'testcases' ? '✅ Tests'       :
                     t === 'custom'    ? '⌨ Custom Input' :
                     t === 'coach'     ? '🤖 AI Coach'    :
                                        '📝 Notes'}
                  </button>
                ))}
              </div>

              <div style={S.actionBtns}>
                <button
                  onClick={handleRunTests}
                  disabled={isRunning || !problem?.examples?.length}
                  style={{ ...S.runTestsBtn, opacity: (isRunning || !problem?.examples?.length) ? 0.5 : 1 }}
                >
                  {isRunning ? '⏳ Running…' : '▷ Run Tests'}
                </button>
                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  style={{ ...S.runBtn, opacity: isRunning ? 0.5 : 1 }}
                >
                  {isRunning ? '⏳ Running…' : '▶ Run'}
                </button>
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  style={{ ...S.submitBtn, opacity: isSubmitting ? 0.5 : 1 }}
                >
                  {isSubmitting ? '📤 Saving…' : '📤 Submit'}
                </button>
              </div>
            </div>

            {/* Console body */}
            <div style={S.consoleBody}>

              {/* ── OUTPUT TAB ── */}
              {rightTab === 'console' && consoleTab === 'output' && (
                <div style={S.consoleContent}>
                  <div style={S.consoleStatusBar}>
                    <span style={{ color: '#64748b', fontSize: 12 }}>
                      {isRunning ? '⏳ Executing…' : execTime ? `⚡ ${execTime}s` : 'Ready'}
                    </span>
                    {exitBadge}
                    <button
                      onClick={() => { setStdout(''); setStderr(''); setExitCode(null); setCompileErr(''); }}
                      style={S.clearBtn}
                    >⊘ Clear</button>
                  </div>

                  {compileErr && (
                    <div style={S.compileErrBlock}>
                      <div style={S.consoleLabel}>🔴 Compilation Error</div>
                      <pre style={S.consolePre}>{compileErr}</pre>
                    </div>
                  )}

                  {stdout && (
                    <div>
                      <div style={S.consoleLabel}>📤 stdout</div>
                      <pre style={{ ...S.consolePre, color: '#86efac' }}>{stdout}</pre>
                    </div>
                  )}

                  {stderr && (
                    <div>
                      <div style={S.consoleLabel}>🔴 stderr</div>
                      <pre style={{ ...S.consolePre, color: '#fca5a5' }}>{stderr}</pre>
                    </div>
                  )}

                  {!stdout && !stderr && !compileErr && !isRunning && (
                    <div style={S.consoleEmpty}>
                      Click <strong>Run</strong> to execute your code or <strong>Run Tests</strong> to check against sample cases.
                    </div>
                  )}
                </div>
              )}

              {/* ── TEST CASES TAB ── */}
              {rightTab === 'console' && consoleTab === 'testcases' && (
                <div style={S.consoleContent}>
                  {testResults.length === 0 && !isRunning && (
                    <div style={S.consoleEmpty}>
                      Click <strong>Run Tests</strong> to execute against all {problem?.examples?.length || 0} sample cases.
                    </div>
                  )}
                  {isRunning && testResults.length === 0 && (
                    <div style={S.consoleEmpty}>⏳ Running test cases…</div>
                  )}
                  {testResults.map((r, i) => (
                    <div key={i} style={{ ...S.testCase, borderColor: r.passed ? '#16a34a' : '#dc2626' }}>
                      <div style={S.testCaseHeader}>
                        <span style={{ color: r.passed ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                          {r.passed ? '✅' : '❌'} Test {r.index}
                        </span>
                        <span style={{ color: '#64748b', fontSize: 12 }}>⚡ {r.elapsed}s | Exit: {r.exitCode ?? '?'}</span>
                      </div>
                      <div style={S.testCaseGrid}>
                        <div>
                          <div style={S.consoleLabel}>Input</div>
                          <pre style={S.consolePre}>{r.input}</pre>
                        </div>
                        <div>
                          <div style={S.consoleLabel}>Expected</div>
                          <pre style={{ ...S.consolePre, color: '#86efac' }}>{r.expected}</pre>
                        </div>
                        <div>
                          <div style={S.consoleLabel}>Your Output</div>
                          <pre style={{ ...S.consolePre, color: r.passed ? '#86efac' : '#fca5a5' }}>{r.actual || '(empty)'}</pre>
                        </div>
                      </div>
                      {r.stderr && (
                        <div>
                          <div style={S.consoleLabel}>🔴 stderr</div>
                          <pre style={{ ...S.consolePre, color: '#fca5a5' }}>{r.stderr}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                  {testResults.length > 0 && (
                    <div style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 13 }}>
                      {testResults.filter(r => r.passed).length}/{testResults.length} tests passed
                      {allTestsPassed && (
                        <button
                          style={{ ...S.submitBtn, marginLeft: 16, padding: '6px 14px', fontSize: 13 }}
                          onClick={() => handleSubmit(true)}
                        >
                          📤 Mark as Solved
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── CUSTOM INPUT TAB ── */}
              {rightTab === 'console' && consoleTab === 'custom' && (
                <div style={S.consoleContent}>
                  <div style={S.customInputSection}>
                    <div style={S.consoleLabel}>Custom stdin input:</div>
                    <textarea
                      style={S.customInputArea}
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                      placeholder="Enter your custom input here..."
                      spellCheck={false}
                    />
                    <div style={S.customInputControls}>
                      <label style={S.checkLabel}>
                        <input
                          type="checkbox"
                          checked={useCustom}
                          onChange={e => setUseCustom(e.target.checked)}
                          style={{ marginRight: 6 }}
                        />
                        Use custom input when clicking Run
                      </label>
                      <button
                        onClick={handleRun}
                        disabled={isRunning}
                        style={{ ...S.runBtn, opacity: isRunning ? 0.5 : 1 }}
                      >
                        {isRunning ? '⏳ Running…' : '▶ Run with custom input'}
                      </button>
                    </div>

                    {(stdout || stderr) && (
                      <div style={{ marginTop: 12 }}>
                        <div style={S.consoleLabel}>Output:</div>
                        {stdout && <pre style={{ ...S.consolePre, color: '#86efac' }}>{stdout}</pre>}
                        {stderr && <pre style={{ ...S.consolePre, color: '#fca5a5' }}>{stderr}</pre>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── AI COACH TAB ── */}
              {rightTab === 'coach' && (
                <div style={S.coachPanel}>
                  <AICoach
                    problem={problem}
                    userCode={codes[language]}
                    inline
                  />
                </div>
              )}

              {/* ── NOTES TAB ── */}
              {rightTab === 'notes' && (
                <div style={S.notesPanel}>
                  <div style={S.consoleLabel}>📝 Your notes for this problem (auto-saved locally):</div>
                  <textarea
                    style={S.notesArea}
                    value={notes}
                    onChange={handleNotesChange}
                    placeholder="Write your approach, key observations, or pseudocode here..."
                    spellCheck={false}
                  />
                  <div style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>
                    Auto-saved to localStorage · {notes.length} characters
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const S = {
  root: {
    display:    'flex',
    flexDirection: 'column',
    height:     '100vh',
    background: '#0f1117',
    color:      '#e2e8f0',
    fontFamily: "'Inter', sans-serif",
    overflow:   'hidden',
  },

  // Top bar
  topBar: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    background:     '#161b27',
    borderBottom:   '1px solid #1e293b',
    padding:        '0 12px',
    height:         48,
    flexShrink:     0,
    gap:            8,
  },
  breadcrumbs: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', minWidth: 0, flex: 1 },
  crumb:       { color: '#64748b', textDecoration: 'none', ':hover': { color: '#94a3b8' } },
  crumbSep:    { color: '#334155' },
  topCenter:   { display: 'flex', alignItems: 'center', gap: 6, flex: 2, justifyContent: 'center' },
  topRight:    { display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' },

  // Language buttons
  langWrap:  { display: 'flex', gap: 2, background: '#0f1117', borderRadius: 8, padding: 3 },
  langBtn:   {
    padding:      '4px 10px',
    borderRadius: 6,
    border:       'none',
    background:   'transparent',
    color:        '#64748b',
    cursor:       'pointer',
    fontSize:     12,
    fontWeight:   500,
    whiteSpace:   'nowrap',
    transition:   'all 0.15s',
  },
  langBtnOn: { background: '#1e3a5f', color: '#60a5fa' },

  // Theme select
  select: {
    background:   '#1e293b',
    color:        '#94a3b8',
    border:       '1px solid #334155',
    borderRadius: 6,
    padding:      '4px 8px',
    fontSize:     12,
    cursor:       'pointer',
  },

  // Font size
  fsBtns:  { display: 'flex', alignItems: 'center', gap: 2 },
  fsBtn:   {
    padding:      '3px 7px',
    background:   '#1e293b',
    border:       '1px solid #334155',
    borderRadius: 5,
    color:        '#94a3b8',
    cursor:       'pointer',
    fontSize:     11,
  },
  fsLabel: { color: '#64748b', fontSize: 11, minWidth: 36, textAlign: 'center' },

  // Navigation prob buttons
  navProbBtn: {
    padding:      '4px 10px',
    background:   '#1e293b',
    border:       '1px solid #334155',
    borderRadius: 6,
    color:        '#94a3b8',
    cursor:       'pointer',
    fontSize:     14,
    transition:   'all 0.15s',
  },

  // Workspace
  workspace: { display: 'flex', flex: 1, overflow: 'hidden' },

  // Left pane
  leftPane: {
    display:       'flex',
    flexDirection: 'column',
    borderRight:   '1px solid #1e293b',
    minWidth:      280,
    overflow:      'hidden',
  },

  // Pane tabs
  paneTabs: {
    display:     'flex',
    background:  '#161b27',
    borderBottom:'1px solid #1e293b',
    flexShrink:  0,
  },
  paneTab:  {
    padding:    '10px 18px',
    background: 'transparent',
    border:     'none',
    color:      '#64748b',
    cursor:     'pointer',
    fontSize:   13,
    fontWeight: 500,
    borderBottom: '2px solid transparent',
    transition: 'all 0.15s',
  },
  paneTabOn: { color: '#60a5fa', borderBottomColor: '#3b82f6' },

  paneBody: { flex: 1, overflow: 'auto', scrollbarWidth: 'thin' },

  // Description
  descBody: { padding: '20px 20px 40px' },
  problemHeader: { marginBottom: 12 },
  problemTitle: { fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: '0 0 10px' },
  metaRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 },
  diffBadge: {
    padding:      '3px 10px',
    borderRadius: 20,
    fontSize:     12,
    fontWeight:   700,
    color:        '#fff',
  },
  ratingBadge: { background: '#1e293b', padding: '3px 10px', borderRadius: 20, fontSize: 12, color: '#fbbf24' },
  cfLink:      { color: '#60a5fa', fontSize: 12, textDecoration: 'none' },
  tagsRow:     { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tagBadge:    { background: '#1e3a5f', color: '#7dd3fc', padding: '2px 8px', borderRadius: 12, fontSize: 11 },

  divider: { height: 1, background: '#1e293b', margin: '12px 0' },

  section: { marginBottom: 20 },
  secHeading: { fontSize: 13, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 10px' },
  bodyText:   { fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, margin: 0 },

  constraintsBox:  { background: '#161b27', borderRadius: 8, padding: '10px 14px', border: '1px solid #1e293b' },
  constraintLine:  { display: 'flex', gap: 8, padding: '3px 0', fontSize: 13, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" },
  bullet:          { color: '#3b82f6' },

  exCard:    { background: '#161b27', border: '1px solid #1e293b', borderRadius: 8, padding: 14, marginBottom: 12 },
  exLabel:   { fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 10 },
  exGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 },
  ioTag:     { fontSize: 11, color: '#475569', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' },
  pre:       { background: '#0f1117', padding: '8px 10px', borderRadius: 6, fontSize: 12, color: '#a5f3fc', margin: 0, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap', wordBreak: 'break-all' },
  exExplain: { fontSize: 13, color: '#94a3b8', marginTop: 8, lineHeight: 1.6 },
  useInputBtn: {
    marginTop:    8,
    padding:      '4px 12px',
    background:   'transparent',
    border:       '1px solid #334155',
    borderRadius: 6,
    color:        '#64748b',
    cursor:       'pointer',
    fontSize:     12,
    transition:   'all 0.15s',
  },

  // Splitter
  splitter: {
    width:   '4px',
    cursor:  'col-resize',
    background: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 0.2s',
    ':hover': { background: '#3b82f6' },
  },
  splitterHandle: {
    width:        2,
    height:       40,
    borderRadius: 2,
    background:   '#334155',
  },

  // Right pane
  rightPane: {
    display:       'flex',
    flexDirection: 'column',
    overflow:      'hidden',
    minWidth:      320,
  },

  // Editor header
  editorHeader: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    background:     '#161b27',
    padding:        '6px 12px',
    borderBottom:   '1px solid #1e293b',
    flexShrink:     0,
  },
  editorHeaderLeft:  { display: 'flex', alignItems: 'center', gap: 10 },
  editorHeaderRight: { display: 'flex', alignItems: 'center', gap: 6 },
  editorTitle: { fontSize: 13, fontWeight: 600, color: '#94a3b8' },
  iconBtn: {
    padding:      '4px 10px',
    background:   '#1e293b',
    border:       '1px solid #334155',
    borderRadius: 6,
    color:        '#94a3b8',
    cursor:       'pointer',
    fontSize:     12,
    transition:   'all 0.15s',
  },

  editorWrapper: { flex: 1, overflow: 'hidden', minHeight: 0 },

  // Bottom section
  bottomSection: {
    display:       'flex',
    flexDirection: 'column',
    height:        260,
    borderTop:     '1px solid #1e293b',
    background:    '#0f1117',
    flexShrink:    0,
  },

  bottomBar: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '6px 8px',
    background:     '#161b27',
    borderBottom:   '1px solid #1e293b',
    flexShrink:     0,
  },

  consoleTabs: { display: 'flex', gap: 2 },
  consoleTab:  {
    padding:      '5px 12px',
    background:   'transparent',
    border:       'none',
    borderBottom: '2px solid transparent',
    color:        '#475569',
    cursor:       'pointer',
    fontSize:     12,
    fontWeight:   500,
    transition:   'all 0.15s',
    borderRadius: '4px 4px 0 0',
  },
  consoleTabOn: { color: '#60a5fa', borderBottomColor: '#3b82f6', background: '#162032' },

  actionBtns: { display: 'flex', gap: 6, alignItems: 'center' },
  runTestsBtn: {
    padding:      '6px 14px',
    background:   '#1e293b',
    border:       '1px solid #3b82f6',
    borderRadius: 6,
    color:        '#60a5fa',
    cursor:       'pointer',
    fontSize:     13,
    fontWeight:   600,
    transition:   'all 0.15s',
  },
  runBtn: {
    padding:      '6px 16px',
    background:   '#14532d',
    border:       '1px solid #16a34a',
    borderRadius: 6,
    color:        '#4ade80',
    cursor:       'pointer',
    fontSize:     13,
    fontWeight:   700,
    transition:   'all 0.15s',
  },
  submitBtn: {
    padding:      '6px 16px',
    background:   'linear-gradient(135deg, #1e40af, #6d28d9)',
    border:       'none',
    borderRadius: 6,
    color:        '#fff',
    cursor:       'pointer',
    fontSize:     13,
    fontWeight:   700,
    transition:   'all 0.15s',
  },

  consoleBody:    { flex: 1, overflow: 'auto', scrollbarWidth: 'thin' },
  consoleContent: { height: '100%', overflow: 'auto', padding: '8px 12px' },

  consoleStatusBar: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  clearBtn: {
    marginLeft:   'auto',
    padding:      '2px 8px',
    background:   'transparent',
    border:       '1px solid #334155',
    borderRadius: 4,
    color:        '#475569',
    cursor:       'pointer',
    fontSize:     11,
  },

  consoleLabel: { fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4, marginTop: 8 },
  consolePre:   {
    background:   '#161b27',
    padding:      '8px 10px',
    borderRadius: 6,
    fontSize:     12,
    fontFamily:   "'JetBrains Mono', monospace",
    color:        '#e2e8f0',
    margin:       0,
    whiteSpace:   'pre-wrap',
    wordBreak:    'break-all',
    border:       '1px solid #1e293b',
  },
  compileErrBlock: { background: '#1f0a0a', border: '1px solid #7f1d1d', borderRadius: 6, padding: 8, marginBottom: 8 },

  consoleEmpty: { color: '#334155', fontSize: 13, padding: '24px 16px', textAlign: 'center', fontStyle: 'italic' },

  // Test cases
  testCase:       { border: '1px solid', borderRadius: 8, padding: 10, marginBottom: 10 },
  testCaseHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  testCaseGrid:   { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },

  // Custom input
  customInputSection: { padding: 12 },
  customInputArea: {
    width:        '100%',
    minHeight:    80,
    background:   '#161b27',
    border:       '1px solid #334155',
    borderRadius: 6,
    color:        '#e2e8f0',
    fontFamily:   "'JetBrains Mono', monospace",
    fontSize:     12,
    padding:      '8px 10px',
    resize:       'vertical',
    boxSizing:    'border-box',
    marginTop:    6,
  },
  customInputControls: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  checkLabel:          { display: 'flex', alignItems: 'center', color: '#64748b', fontSize: 12, cursor: 'pointer' },

  // Coach & Notes panels
  coachPanel: { height: '100%', overflow: 'auto', padding: 12 },
  notesPanel: { height: '100%', display: 'flex', flexDirection: 'column', padding: 12, gap: 6 },
  notesArea:  {
    flex:         1,
    background:   '#161b27',
    border:       '1px solid #334155',
    borderRadius: 6,
    color:        '#cbd5e1',
    fontFamily:   "'Inter', sans-serif",
    fontSize:     13,
    padding:      '10px 12px',
    resize:       'none',
    lineHeight:   1.6,
  },

  // Badges
  badge: (type) => ({
    padding:      '2px 8px',
    borderRadius: 12,
    fontSize:     11,
    fontWeight:   700,
    background:   type === 'success' ? '#14532d' : '#7f1d1d',
    color:        type === 'success' ? '#4ade80'  : '#f87171',
  }),

  // Loading / error
  centered: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    height:         '100vh',
    background:     '#0f1117',
    color:          '#e2e8f0',
    gap:            12,
  },
  spinner: {
    width:        40,
    height:       40,
    border:       '3px solid #1e293b',
    borderTop:    '3px solid #3b82f6',
    borderRadius: '50%',
    animation:    'spin 0.8s linear infinite',
  },
  errTitle: { fontSize: 22, fontWeight: 700, color: '#f87171', margin: 0 },
  errText:  { color: '#64748b', fontSize: 14 },
  navBtn: {
    padding:      '10px 22px',
    background:   '#1e3a5f',
    border:       'none',
    borderRadius: 8,
    color:        '#60a5fa',
    cursor:       'pointer',
    fontSize:     14,
    fontWeight:   600,
  },
};