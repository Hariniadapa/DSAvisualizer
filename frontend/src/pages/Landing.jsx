// frontend/src/pages/Landing.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../services/api';
import toast from 'react-hot-toast';

export default function Landing({ initialAuthMode }) {
  const { token, loginUser } = useAuth();
  const navigate = useNavigate();

  // Modal open states
  const [authMode, setAuthMode] = useState(initialAuthMode || null); // null | 'login' | 'register'
  const [modalActive, setModalActive] = useState(false);

  // Forms
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  // Synchronize modal state with initialAuthMode prop changes
  useEffect(() => {
    if (initialAuthMode) {
      setAuthMode(initialAuthMode);
      // Brief timeout for transition scale effect
      const t = setTimeout(() => setModalActive(true), 50);
      return () => clearTimeout(t);
    } else {
      setModalActive(false);
      const t = setTimeout(() => setAuthMode(null), 300);
      return () => clearTimeout(t);
    }
  }, [initialAuthMode]);

  const closeModal = () => {
    setModalActive(false);
    setTimeout(() => {
      setAuthMode(null);
      navigate('/');
    }, 200);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(loginForm);
      loginUser(res.data.token, res.data.username);
      toast.success(`Welcome back, ${res.data.username}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register(registerForm);
      loginUser(res.data.token, res.data.username);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast('Google integration layout active. Please use email/password for full platform credentials.', {
      icon: '🌐',
      style: {
        background: '#161b22',
        color: '#e6edf3',
        border: '1px solid #30363d'
      }
    });
  };

  return (
    <div style={styles.container}>

      {/* ── HERO SECTION ── */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>🚀 Upgraded Striver-Style Platform</div>
          <h1 style={styles.heroHeadline}>
            Master DSA <span style={styles.gradientText}>Step-by-Step</span> with Real-Time Visualization
          </h1>
          <p style={styles.heroSub}>
            An interactive DSA learning system helping you visualize data structures, compile problems dynamically, and get intelligent support through an AI-powered coach.
          </p>
          <div style={styles.ctaGroup}>
            <Link to="/dashboard" style={styles.primaryCta}>
              Start Practicing ⚡
            </Link>
            <a href="#features" style={styles.secondaryCta}>
              Explore Features ↓
            </a>
          </div>
          <div style={styles.heroStats}>
            <div style={styles.statBox}>
              <span style={styles.statVal}>50+</span>
              <span style={styles.statLbl}>Popular Coding Tasks</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statVal}>5</span>
              <span style={styles.statLbl}>Languages Supported</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statVal}>100%</span>
              <span style={styles.statLbl}>Interactive Visualizers</span>
            </div>
          </div>
        </div>

        {/* Mock Visualizer Panel */}
        <div style={styles.heroVisualizerWrap}>
          <div style={styles.mockWindow}>
            <div style={styles.mockHeader}>
              <div style={styles.mockDots}>
                <span style={{ ...styles.mockDot, background: '#ef4444' }} />
                <span style={{ ...styles.mockDot, background: '#eab308' }} />
                <span style={{ ...styles.mockDot, background: '#22c55e' }} />
              </div>
              <div style={styles.mockTitle}>Visualizing: Bubble Sort</div>
            </div>
            <div style={styles.mockVisualizer}>
              <div style={styles.barsContainer}>
                {[40, 75, 55, 90, 60, 85, 30].map((val, idx) => (
                  <div key={idx} style={{ ...styles.bar, height: `${val}%`, background: idx === 3 ? '#ec4899' : idx === 4 ? '#388bfd' : 'linear-gradient(180deg, #7c6df0, #6366f1)' }}>
                    <span style={styles.barLabel}>{val}</span>
                  </div>
                ))}
              </div>
              <div style={styles.controlBox}>
                <button style={styles.mockControlBtn}>◀</button>
                <button style={{ ...styles.mockControlBtn, background: '#238636', color: '#fff' }}>Play ▶</button>
                <button style={styles.mockControlBtn}>▶</button>
                <span style={styles.stepCounter}>Step 4 / 18</span>
              </div>
              <div style={styles.visualizerCodeLine}>
                <code>if (arr[j] &gt; arr[j+1]) <span style={{ color: '#388bfd', fontWeight: 'bold' }}>swap(arr[j], arr[j+1]);</span></code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Engineered for Mastery</h2>
          <p style={styles.sectionSub}>Everything you need to accelerate your problem-solving skills in one unified playground.</p>
        </div>
        <div style={styles.grid}>
          {featuresList.map((f, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.cardIcon}>{f.icon}</div>
              <h3 style={styles.cardTitle}>{f.title}</h3>
              <p style={styles.cardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ ...styles.section, background: '#0d0e14' }}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <p style={styles.sectionSub}>Your streamlined roadmap from visualization to correct logic.</p>
        </div>
        <div style={styles.stepsContainer}>
          {stepsList.map((s, i) => (
            <div key={i} style={styles.stepCard}>
              <div style={styles.stepNum}>{i + 1}</div>
              <h4 style={styles.stepTitle}>{s.title}</h4>
              <p style={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTERVIEW PREP & STUDENT BENEFITS ── */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Tailored For Your Goals</h2>
          <p style={styles.sectionSub}>Helping you prepare for top technical roles or excel in academics.</p>
        </div>
        <div style={styles.benefitsSplit}>
          <div style={styles.benefitCard}>
            <h3 style={{ ...styles.cardTitle, color: '#ec4899', fontSize: '1.4rem' }}>👨‍💻 Interview Preparation</h3>
            <ul style={styles.benefitList}>
              <li>🔥 Track consistency with streaks and solved stats.</li>
              <li>⚡ Category-specific dynamic coding templates (Trees, Graphs, DP).</li>
              <li>🤖 Level up with real-time feedback from the built-in AI Coach.</li>
              <li>🧠 COLLAPSIBLE SNIPPETS side panel to access BFS, DFS, and Fast I/O codes instantly.</li>
            </ul>
          </div>
          <div style={styles.benefitCard}>
            <h3 style={{ ...styles.cardTitle, color: '#388bfd', fontSize: '1.4rem' }}>🎓 Student & Academic Success</h3>
            <ul style={styles.benefitList}>
              <li>📊 Graphically step forward and backward through code states.</li>
              <li>📝 Integrated persistent Notebook for documenting dynamic programming transitions.</li>
              <li>🎨 Hand-drawn Canvas overlay to trace algorithms directly on screen.</li>
              <li>💯 Verify solutions against visible and hidden sample test cases.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerLeft}>
            <span style={styles.footerLogo}>⬡ DSAViz</span>
            <p style={styles.footerCopy}>© 2026 DSAViz. Built for premium visual learning.</p>
          </div>
          <div style={styles.footerRight}>
            <a href="https://github.com" target="_blank" rel="noreferrer" style={styles.footerLink}>GitHub</a>
            <span style={styles.footerSep}>•</span>
            <Link to="/problems" style={styles.footerLink}>Problems</Link>
            <span style={styles.footerSep}>•</span>
            <Link to="/playground" style={styles.footerLink}>Playground</Link>
          </div>
        </div>
      </footer>

      {/* ── AUTH MODAL POPUP ── */}
      {authMode && (
        <div
          onClick={closeModal}
          style={{
            ...styles.modalOverlay,
            opacity: modalActive ? 1 : 0,
            pointerEvents: modalActive ? 'auto' : 'none'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              ...styles.modalCard,
              transform: modalActive ? 'scale(1)' : 'scale(0.92)'
            }}
          >
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {authMode === 'login' ? 'Sign In to DSAViz' : 'Create Account'}
              </h2>
              <button onClick={closeModal} style={styles.modalCloseBtn}>✕</button>
            </div>

            {/* Google Social Login */}
            <button onClick={handleGoogleLogin} style={styles.googleBtn}>
              <svg style={styles.googleIcon} viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.357-2.89-6.357-6.457s2.848-6.458 6.357-6.458c1.554 0 2.977.566 4.093 1.503l3.053-3.09C18.99 1.79 15.82 1 12.24 1 5.922 1 1 5.987 1 12.057 1 18.127 5.922 23 12.24 23c6.037 0 10.74-4.225 10.74-10.457 0-.7-.074-1.385-.213-2.057H12.24z" />
              </svg>
              Continue with Google
            </button>

            <div style={styles.modalDivider}>
              <span style={styles.dividerText}>or</span>
            </div>

            {/* Normal Auth Form */}
            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} style={styles.authForm}>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Email Address</label>
                  <input
                    style={styles.authInput}
                    type="email"
                    placeholder="name@domain.com"
                    value={loginForm.email}
                    onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Password</label>
                  <input
                    style={styles.authInput}
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </div>
                <button style={styles.authSubmitBtn} disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} style={styles.authForm}>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Username</label>
                  <input
                    style={styles.authInput}
                    placeholder="Username"
                    value={registerForm.username}
                    onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Email Address</label>
                  <input
                    style={styles.authInput}
                    type="email"
                    placeholder="name@domain.com"
                    value={registerForm.email}
                    onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Password</label>
                  <input
                    style={styles.authInput}
                    type="password"
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                  />
                </div>
                <button style={styles.authSubmitBtn} disabled={loading}>
                  {loading ? 'Creating...' : 'Register'}
                </button>
              </form>
            )}

            {/* Toggle Switch */}
            <div style={styles.modalFooter}>
              {authMode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <span onClick={() => navigate('/register')} style={styles.authToggleBtn}>
                    Create one
                  </span>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <span onClick={() => navigate('/login')} style={styles.authToggleBtn}>
                    Sign in
                  </span>
                </p>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// ── Static Metadata ──────────────────────────────────────────────────────────

const featuresList = [
  { icon: '📊', title: 'Interactive Visualization', desc: 'Graphic node-by-node updates show precisely what your sorting, graph traversal, or tree traversal logic does step-by-step.' },
  { icon: '💻', title: 'Dynamic Testcase Sandbox', desc: 'Monaco editor integration checks solutions against visible examples (Run) and hidden testcase checks (Submit).' },
  { icon: '☕', title: 'Multi-Language Execution', desc: 'Solve tasks in C, C++, Java, JavaScript, or Python. Runtimes execute instantly via secure sandbox executions.' },
  { icon: '🏆', title: 'Gamified Progress Tracking', desc: 'Gain XP, hit solved goals, build hot streak status badges, and track your ranking profile details.' },
  { icon: '🤖', title: 'AI Coach Assistant', desc: 'Collaborate with a context-aware AI tutor to get approach hints, trace compilation limits, or debug runtime logic.' },
  { icon: '📝', title: 'Persistent Notebooks', desc: 'Write down thoughts, recursive states, dynamic partition bounds, or complex trees directly next to each coding workspace.' }
];

const stepsList = [
  { title: 'Select a Problem', desc: 'Browse curated DSA problems tagged by difficulty rating (Easy, Medium, Hard) or categories.' },
  { title: 'Trace & Visualise', desc: 'Click steps or auto-run graphics to see dynamic representations mapping data states directly.' },
  { title: 'Write & Verify', desc: 'Generate a clean dynamic code template, use autocomplete, and run visible and hidden inputs instantly.' }
];

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  container: {
    background: '#090a0f',
    color: '#e2e8f0',
    fontFamily: "'Inter', sans-serif",
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
  },
  gradientText: {
    background: 'linear-gradient(90deg, #818cf8, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },

  // Hero section
  heroSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '80px 48px',
    maxWidth: 1200,
    margin: '0 auto',
    gap: 48,
    flexWrap: 'wrap',
  },
  heroContent: {
    flex: 1,
    minWidth: 320,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  badge: {
    background: '#1e1b4b',
    color: '#a5b4fc',
    padding: '4px 12px',
    borderRadius: 99,
    fontSize: 12,
    fontWeight: 600,
    border: '1px solid #312e81',
  },
  heroHeadline: {
    fontSize: '3rem',
    fontWeight: 800,
    lineHeight: 1.15,
    margin: 0,
    letterSpacing: '-1.5px',
  },
  heroSub: {
    fontSize: '1.1rem',
    color: '#94a3b8',
    lineHeight: 1.6,
    margin: '8px 0 16px',
    maxWidth: 540,
  },
  ctaGroup: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
  },
  primaryCta: {
    background: 'linear-gradient(135deg, #6366f1, #7c6df0)',
    color: '#fff',
    textDecoration: 'none',
    padding: '12px 24px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 15,
    transition: 'all 0.2s',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
  },
  secondaryCta: {
    background: 'transparent',
    border: '1px solid #334155',
    color: '#cbd5e1',
    textDecoration: 'none',
    padding: '12px 24px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 15,
    transition: 'all 0.2s',
  },
  heroStats: {
    display: 'flex',
    gap: 28,
    marginTop: 24,
    borderTop: '1px solid #1e293b',
    paddingTop: 24,
    width: '100%',
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  statVal: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#fff',
  },
  statLbl: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },

  // Hero Mock Visualizer
  heroVisualizerWrap: {
    flex: 1,
    minWidth: 320,
    display: 'flex',
    justifyContent: 'center',
  },
  mockWindow: {
    width: '100%',
    maxWidth: 480,
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
  },
  mockHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    background: '#0d1117',
    borderBottom: '1px solid #30363d',
  },
  mockDots: {
    display: 'flex',
    gap: 6,
  },
  mockDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
  },
  mockTitle: {
    fontSize: 11,
    color: '#8b949e',
    fontFamily: "'JetBrains Mono', monospace",
  },
  mockVisualizer: {
    padding: '24px 20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  barsContainer: {
    height: 140,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    borderBottom: '1px solid #30363d',
    paddingBottom: 4,
  },
  bar: {
    flex: 1,
    borderRadius: '4px 4px 0 0',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: 6,
    minWidth: 16,
    transition: 'height 0.3s ease',
  },
  barLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 600,
  },
  controlBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mockControlBtn: {
    padding: '4px 10px',
    background: '#21262d',
    border: '1px solid #30363d',
    borderRadius: 6,
    color: '#c9d1d9',
    fontSize: 12,
    cursor: 'pointer',
  },
  stepCounter: {
    fontSize: 12,
    color: '#8b949e',
    marginLeft: 12,
    fontFamily: "'JetBrains Mono', monospace",
  },
  visualizerCodeLine: {
    background: '#0d1117',
    padding: '8px 12px',
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    color: '#c9d1d9',
    borderLeft: '3px solid #7c6df0',
  },

  // Sections
  section: {
    padding: '80px 24px',
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: '2.2rem',
    fontWeight: 700,
    margin: 0,
    color: '#fff',
  },
  sectionSub: {
    fontSize: '1rem',
    color: '#64748b',
    marginTop: 8,
  },

  // Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24,
  },
  card: {
    background: 'rgba(22, 27, 34, 0.4)',
    border: '1px solid #21262d',
    borderRadius: 12,
    padding: 24,
    backdropFilter: 'blur(4px)',
    transition: 'all 0.2s',
  },
  cardIcon: {
    fontSize: '1.8rem',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#fff',
    margin: '0 0 8px',
  },
  cardDesc: {
    fontSize: '0.9rem',
    color: '#8b949e',
    lineHeight: 1.5,
    margin: 0,
  },

  // How it works steps
  stepsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 24,
    flexWrap: 'wrap',
    maxWidth: 900,
    margin: '0 auto',
  },
  stepCard: {
    flex: 1,
    minWidth: 240,
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 12,
    padding: 24,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  stepNum: {
    position: 'absolute',
    top: -16,
    left: 20,
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#7c6df0',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14,
    boxShadow: '0 4px 10px rgba(124, 109, 240, 0.5)',
  },
  stepTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#fff',
    margin: '8px 0 0',
  },
  stepDesc: {
    fontSize: '0.9rem',
    color: '#8b949e',
    lineHeight: 1.5,
    margin: 0,
  },

  // Benefitssplit
  benefitsSplit: {
    display: 'flex',
    gap: 24,
    flexWrap: 'wrap',
  },
  benefitCard: {
    flex: 1,
    minWidth: 320,
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 12,
    padding: 28,
  },
  benefitList: {
    paddingLeft: 20,
    color: '#cbd5e1',
    lineHeight: 1.8,
    fontSize: '0.95rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginTop: 16,
  },

  // Footer
  footer: {
    borderTop: '1px solid #21262d',
    background: '#0d1117',
    padding: '32px 24px',
    marginTop: 'auto',
  },
  footerInner: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  footerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  footerLogo: {
    fontSize: 15,
    fontWeight: 700,
    color: '#fff',
  },
  footerCopy: {
    fontSize: 12,
    color: '#64748b',
    margin: 0,
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  footerLink: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: 13,
    transition: 'color 0.15s',
    ':hover': {
      color: '#c9d1d9',
    }
  },
  footerSep: {
    color: '#30363d',
    fontSize: 12,
  },

  // Auth Modals
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    transition: 'opacity 0.25s ease',
  },
  modalCard: {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    padding: 32,
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
    boxSizing: 'border-box',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
  },
  modalCloseBtn: {
    background: 'transparent',
    border: 'none',
    color: '#8b949e',
    fontSize: 18,
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    padding: '10px',
    borderRadius: 8,
    border: '1px solid #30363d',
    background: '#21262d',
    color: '#c9d1d9',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  googleIcon: {
    width: 16,
    height: 16,
  },
  modalDivider: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    margin: '20px 0',
  },
  dividerText: {
    flex: 1,
    fontSize: 12,
    color: '#484f58',
    padding: '0 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ':before': {
      content: '""',
      borderBottom: '1px solid #30363d',
      flex: 1,
    },
    ':after': {
      content: '""',
      borderBottom: '1px solid #30363d',
      flex: 1,
    }
  },
  authForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#8b949e',
  },
  authInput: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #30363d',
    background: '#0d1117',
    color: '#fff',
    fontSize: 14,
    boxSizing: 'border-box',
    outline: 'none',
  },
  authSubmitBtn: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #6366f1, #7c6df0)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    marginTop: 8,
  },
  modalFooter: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
    color: '#8b949e',
  },
  authToggleBtn: {
    color: '#58a6ff',
    cursor: 'pointer',
    fontWeight: 600,
    textDecoration: 'underline',
  }
};
