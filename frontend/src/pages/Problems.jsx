import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProblems } from '../services/api';
import toast from 'react-hot-toast';

const TOPICS = {
  'dp': { label: 'Dynamic Programming', icon: '💡' },
  'graphs': { label: 'Graphs & Networks', icon: '🕸️' },
  'trees': { label: 'Trees & Hierarchies', icon: '🌲' },
  'greedy': { label: 'Greedy Algorithms', icon: '💰' },
  'binary search': { label: 'Binary Search', icon: '🔍' },
  'math': { label: 'Mathematics', icon: '🧮' },
  'sortings': { label: 'Sorting & Ordering', icon: '📊' },
  'strings': { label: 'String Manipulation', icon: '🔤' },
  'implementation': { label: 'Implementation', icon: '💻' },
  'brute force': { label: 'Brute Force', icon: '🔨' },
  'number theory': { label: 'Number Theory', icon: '🔢' }
};

export default function Problems() {
  const navigate = useNavigate();
  const location = useLocation();

  // Read initial filters from route state (Browse Page) or fallback defaults
  const [topic, setTopic] = useState(location.state?.topic || 'dp');
  const [difficulty, setDifficulty] = useState(location.state?.difficulty || 'medium');
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProblems(topic, difficulty);
      setProblems(res.data || []);
    } catch {
      toast.error('Failed to fetch problems');
    } finally {
      setLoading(false);
    }
  }, [topic, difficulty]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const activeTopicInfo = TOPICS[topic] || { label: topic, icon: '📝' };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        
        {/* Header with Topic Badge */}
        <div style={styles.header}>
          <div style={styles.topicBadge}>
            <span style={styles.topicIcon}>{activeTopicInfo.icon}</span>
            <span style={styles.topicName}>{activeTopicInfo.label}</span>
            <span style={styles.difficultyDot} />
            <span style={{
              ...styles.difficultyText,
              color: difficulty === 'easy' ? '#4caf7d' : difficulty === 'medium' ? '#ca8a04' : '#ef4444'
            }}>
              {difficulty.toUpperCase()}
            </span>
          </div>
          <p style={styles.subtitle}>Select a Codeforces problem below to start practicing and coding.</p>
        </div>

        {/* Filter Controls Row */}
        <div style={styles.filterRow}>
          <div style={styles.selectGroup}>
            <label style={styles.label}>Topic</label>
            <select style={styles.select} value={topic} onChange={e => setTopic(e.target.value)}>
              {Object.entries(TOPICS).map(([key, t]) => (
                <option key={key} value={key}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>

          <div style={styles.selectGroup}>
            <label style={styles.label}>Difficulty</label>
            <select style={styles.select} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="easy">🟩 Easy (≤ 1200)</option>
              <option value="medium">🟨 Medium (1201 - 1900)</option>
              <option value="hard">🟥 Hard (&gt; 1900)</option>
            </select>
          </div>

          <button style={styles.refreshBtn} onClick={fetchProblems} disabled={loading}>
            {loading ? 'Fetching...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Problems Grid/List */}
        {loading ? (
          <div style={styles.skeletonList}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={styles.skeletonRow}>
                <div style={styles.skeletonText1} />
                <div style={styles.skeletonText2} />
              </div>
            ))}
          </div>
        ) : problems.length > 0 ? (
          <div style={styles.problemList}>
            {problems.map((p, i) => (
              <div
                key={i}
                style={styles.problemRow}
                onClick={() => {
                  if (p.contestId && p.index) {
                    navigate(`/problem/${p.contestId}/${p.index}`);
                  } else if (p.problemId) {
                    const [contestId, index] = p.problemId.split('-');
                    navigate(`/problem/${contestId}/${index}`);
                  } else {
                    toast.error("Invalid problem data");
                  }
                }}
              >
                <div style={styles.rowLeft}>
                  <span style={styles.rowNumber}>#{i + 1}</span>
                  <span style={styles.problemName}>{p.name}</span>
                  <div style={styles.tagWrapper}>
                    {(p.tags || []).slice(0, 2).map(tag => (
                      <span key={tag} style={styles.tagBadge}>#{tag}</span>
                    ))}
                  </div>
                </div>

                <div style={styles.rowRight}>
                  <span style={{
                    ...styles.ratingBadge,
                    background:
                      p.rating <= 1200 ? '#16a34a'
                      : p.rating <= 1900 ? '#ca8a04'
                      : '#dc2626'
                  }}>
                    {p.rating}
                  </span>
                  <span style={styles.arrow}>→</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.noData}>
            <h3>No problems found</h3>
            <p>Try changing your filters or refreshing the list.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { minHeight: 'calc(100vh - 56px)', background: '#09090b', color: '#e4e4e7' },
  content: { padding: '2rem 1.5rem', maxWidth: '1000px', margin: '0 auto' },
  header: { marginBottom: '2rem' },
  topicBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '20px',
    padding: '0.4rem 1rem',
    marginBottom: '1rem'
  },
  topicIcon: { fontSize: '1.1rem', marginRight: '0.5rem' },
  topicName: { fontSize: '0.95rem', fontWeight: '700', color: '#f4f4f5' },
  difficultyDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#3f3f46', margin: '0 0.8rem' },
  difficultyText: { fontSize: '0.85rem', fontWeight: '800' },
  subtitle: { color: '#a1a1aa', margin: 0, fontSize: '0.9rem' },
  
  filterRow: {
    display: 'flex',
    gap: '1.2rem',
    marginBottom: '2rem',
    alignItems: 'flex-end',
    background: '#18181b',
    padding: '1.2rem',
    borderRadius: '12px',
    border: '1px solid #27272a',
    flexWrap: 'wrap'
  },
  selectGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: '180px' },
  label: { fontSize: '0.75rem', fontWeight: '600', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px' },
  select: {
    padding: '0.6rem 1rem',
    background: '#09090b',
    border: '1px solid #27272a',
    color: '#f4f4f5',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  refreshBtn: {
    padding: '0.6rem 1.5rem',
    background: '#6366f1',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    height: '38px',
    transition: 'background 0.2s'
  },
  
  problemList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  problemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    background: '#18181b',
    borderRadius: '10px',
    cursor: 'pointer',
    border: '1px solid #27272a',
    transition: 'transform 0.15s, border-color 0.15s, background-color 0.15s'
  },
  rowLeft: { display: 'flex', alignItems: 'center', flex: 1, flexWrap: 'wrap', gap: '0.8rem' },
  rowNumber: { fontSize: '0.85rem', color: '#52525b', minWidth: '24px' },
  problemName: { fontWeight: '600', fontSize: '0.95rem', color: '#f4f4f5' },
  tagWrapper: { display: 'flex', gap: '0.4rem', marginLeft: '0.5rem' },
  tagBadge: { fontSize: '0.7rem', color: '#a1a1aa', background: '#09090b', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid #27272a' },
  rowRight: { display: 'flex', gap: '1rem', alignItems: 'center' },
  ratingBadge: {
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#fff',
    minWidth: '36px',
    textAlign: 'center'
  },
  arrow: { color: '#52525b', fontSize: '0.9rem' },
  
  skeletonList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  skeletonRow: {
    height: '60px',
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.25rem',
    animation: 'pulse 1.5s infinite ease-in-out'
  },
  skeletonText1: { width: '40%', height: '12px', background: '#27272a', borderRadius: '4px' },
  skeletonText2: { width: '15%', height: '12px', background: '#27272a', borderRadius: '4px' },
  noData: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#71717a',
    background: '#18181b',
    borderRadius: '12px',
    border: '1px solid #27272a'
  }
};
