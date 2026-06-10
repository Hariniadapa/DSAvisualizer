import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProgress, getReviewQueue } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TOPICS = [
  { id: 'dp', label: 'Dynamic Programming', icon: '💡', desc: 'Optimal substructure & subproblems' },
  { id: 'graphs', label: 'Graphs & Networks', icon: '🕸️', desc: 'Shortest paths, MST, and flows' },
  { id: 'trees', label: 'Trees & Hierarchies', icon: '🌲', desc: 'Binary trees, BSTs, and heaps' },
  { id: 'greedy', label: 'Greedy Algorithms', icon: '💰', desc: 'Locally optimal choices' },
  { id: 'binary search', label: 'Binary Search', icon: '🔍', desc: 'Logarithmic search spaces' },
  { id: 'math', label: 'Mathematics', icon: '🧮', desc: 'Combinatorics & calculations' },
  { id: 'sortings', label: 'Sorting & Ordering', icon: '📊', desc: 'Arranging arrays efficiently' },
  { id: 'strings', label: 'String Manipulation', icon: '🔤', desc: 'Searching & parsing words' },
  { id: 'implementation', label: 'Implementation', icon: '💻', desc: 'Simulations & Walks' },
  { id: 'brute force', label: 'Brute Force', icon: '🔨', desc: 'Backtracking & Search' },
  { id: 'number theory', label: 'Number Theory', icon: '🔢', desc: 'GCD & modular arithmetic' }
];

export default function Dashboard() {
  const [progress, setProgress]       = useState([]);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [topic, setTopic]             = useState('dp');
  const [difficulty, setDifficulty]   = useState('medium');

  const { username } = useAuth();
  const navigate     = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [prog, review] = await Promise.all([
        getProgress(),
        getReviewQueue()
      ]);
      setProgress(prog.data || []);
      setReviewQueue(review.data || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.error('Failed to load dashboard');
      }
    }
  };

  const fetchProblems = () => {
    navigate('/problems', { state: { topic, difficulty } });
  };

  // Stats
  const totalSolved = progress.filter(p => p.solved).length;
  const avgMastery  = progress.length
    ? Math.round(progress.reduce((a, b) => a + (b.masteryPercent || 0), 0) / progress.length)
    : 0;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        
        {/* Welcome */}
        <h2 style={styles.welcome}>👋 Hey, {username}</h2>

        {/* Stats */}
        <div style={styles.statsRow}>
          <StatCard label="Solved" value={totalSolved} />
          <StatCard label="Avg Mastery" value={`${avgMastery}%`} />
          <StatCard label="Review Due" value={reviewQueue.length} highlight />
          <StatCard label="Attempted" value={progress.length} />
        </div>

        {/* Review Queue */}
        {reviewQueue.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📅 Review Today</h3>
            <div style={styles.reviewGrid}>
              {reviewQueue.slice(0, 6).map(item => {
                const [contestId, index] = item.problemId.split('-');
                return (
                  <div
                    key={item.problemId}
                    style={styles.reviewCard}
                    onClick={() => navigate(`/problem/${contestId}/${index}`)}
                  >
                    <p style={styles.reviewProblem}>{item.problemId}</p>
                    <p style={styles.reviewTopic}>{item.topic}</p>
                    <p style={styles.reviewMastery}>
                      Mastery: {item.masteryPercent}%
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Problem Browser */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🔍 Browse Topics</h3>
          <p style={styles.sectionSubtitle}>Select a topic card below, choose a difficulty, and fetch problems.</p>

          {/* Topics Grid */}
          <div style={styles.topicsGrid}>
            {TOPICS.map(t => (
              <div
                key={t.id}
                onClick={() => setTopic(t.id)}
                style={{
                  ...styles.topicCard,
                  ...(topic === t.id ? styles.topicCardActive : {})
                }}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon}>{t.icon}</span>
                  <span style={styles.cardLabel}>{t.label}</span>
                </div>
                <p style={styles.cardDesc}>{t.desc}</p>
              </div>
            ))}
          </div>

          {/* Control Row */}
          <div style={styles.controlsRow}>
            <div style={styles.difficultyGroup}>
              <span style={styles.controlsLabel}>Choose Difficulty:</span>
              <div style={styles.diffButtons}>
                {['easy', 'medium', 'hard'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    style={{
                      ...styles.diffBtn,
                      ...(difficulty === diff ? styles.diffBtnActive : {}),
                      ...(difficulty === diff && diff === 'easy' ? { background: '#16a34a', borderColor: '#16a34a' } : {}),
                      ...(difficulty === diff && diff === 'medium' ? { background: '#ca8a04', borderColor: '#ca8a04' } : {}),
                      ...(difficulty === diff && diff === 'hard' ? { background: '#dc2626', borderColor: '#dc2626' } : {})
                    }}
                  >
                    {diff.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button style={styles.fetchBtn} onClick={fetchProblems}>
              Fetch Problems ➔
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Stat Card
function StatCard({ label, value, highlight }) {
  return (
    <div style={{
      ...styles.statCard,
      borderColor: highlight ? '#f59e0b' : '#27272a'
    }}>
      <p style={styles.statValue}>{value}</p>
      <p style={styles.statLabel}>{label}</p>
    </div>
  );
}

const styles = {
  container: { minHeight: 'calc(100vh - 56px)', background: '#09090b', color: '#e4e4e7' },
  content: { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  welcome: { marginBottom: '1.5rem', color: '#f4f4f5', fontWeight: '700' },
  
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2.5rem'
  },
  statCard: {
    background: '#18181b',
    padding: '1.5rem 1rem',
    borderRadius: '12px',
    border: '1px solid #27272a',
    textAlign: 'center',
    transition: 'border-color 0.2s'
  },
  statValue: { fontSize: '2.2rem', fontWeight: '800', margin: 0, color: '#6366f1' },
  statLabel: { color: '#71717a', marginTop: '0.4rem', fontSize: '0.85rem', fontWeight: '500' },
  
  section: {
    background: '#18181b',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '2rem',
    border: '1px solid #27272a'
  },
  sectionTitle: { fontSize: '1.25rem', fontWeight: '700', color: '#f4f4f5', margin: '0 0 0.25rem' },
  sectionSubtitle: { fontSize: '0.85rem', color: '#71717a', margin: '0 0 1.5rem' },
  
  reviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem'
  },
  reviewCard: {
    background: '#09090b',
    padding: '1.2rem',
    borderRadius: '10px',
    cursor: 'pointer',
    border: '1px solid #27272a',
    transition: 'transform 0.15s, border-color 0.15s'
  },
  reviewProblem: { margin: 0, fontWeight: '700', color: '#f4f4f5' },
  reviewTopic: { color: '#6366f1', fontSize: '0.8rem', margin: '0.25rem 0' },
  reviewMastery: { color: '#a1a1aa', fontSize: '0.8rem', margin: 0 },
  
  topicsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  topicCard: {
    background: '#09090b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    padding: '1.2rem',
    cursor: 'pointer',
    transition: 'transform 0.2s, border-color 0.2s, background-color 0.2s'
  },
  topicCardActive: {
    borderColor: '#6366f1',
    background: '#1e1b4b',
    boxShadow: '0 0 12px rgba(99, 102, 241, 0.15)'
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' },
  cardIcon: { fontSize: '1.2rem' },
  cardLabel: { fontWeight: '700', fontSize: '0.9rem', color: '#f4f4f5' },
  cardDesc: { fontSize: '0.75rem', color: '#71717a', margin: 0, lineHeight: '1.4' },
  
  controlsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #27272a',
    paddingTop: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  difficultyGroup: { display: 'flex', alignItems: 'center', gap: '1rem' },
  controlsLabel: { fontSize: '0.85rem', fontWeight: '600', color: '#71717a' },
  diffButtons: { display: 'flex', gap: '0.5rem' },
  diffBtn: {
    padding: '0.5rem 1.2rem',
    background: '#09090b',
    border: '1px solid #27272a',
    color: '#a1a1aa',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '700',
    transition: 'all 0.15s'
  },
  diffBtnActive: {
    color: '#fff'
  },
  fetchBtn: {
    padding: '0.65rem 1.8rem',
    background: '#6366f1',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.9rem',
    transition: 'background 0.2s, transform 0.15s'
  }
};