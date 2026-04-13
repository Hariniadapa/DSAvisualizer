// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProgress, getReviewQueue, getProblems } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [progress, setProgress]     = useState([]);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [problems, setProblems]     = useState([]);
  const [topic, setTopic]           = useState('dp');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading]       = useState(false);
  const { username, logoutUser }    = useAuth();
  const navigate                    = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
  try {
    const [prog, review] = await Promise.all([
      getProgress(),
      getReviewQueue()
    ]);
    setProgress(prog.data);
    setReviewQueue(review.data);
  } catch (err) {
    // Only show error if it's not a 401 (not logged in yet)
    if (err.response?.status !== 401) {
      toast.error('Failed to load dashboard');
    }
  }
};

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await getProblems(topic, difficulty);
      setProblems(res.data);
    } catch {
      toast.error('Failed to fetch problems');
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const totalSolved  = progress.filter(p => p.solved).length;
  const avgMastery   = progress.length
    ? Math.round(progress.reduce((a, b) => a + b.masteryPercent, 0) / progress.length)
    : 0;

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.logo}>DSA Visualizer</h2>
        <div style={styles.navRight}>
          <span style={styles.welcome}>Hey, {username}!</span>
          <button style={styles.logout} onClick={logoutUser}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>

        {/* Stats Row */}
        <div style={styles.statsRow}>
          <StatCard label="Problems Solved" value={totalSolved} />
          <StatCard label="Avg Mastery"     value={`${avgMastery}%`} />
          <StatCard label="Due for Review"  value={reviewQueue.length} highlight={reviewQueue.length > 0} />
          <StatCard label="Total Attempted" value={progress.length} />
        </div>

        {/* Review Queue */}
        {reviewQueue.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📅 Due for Review Today</h3>
            <div style={styles.reviewGrid}>
              {reviewQueue.slice(0, 6).map(item => (
                <div
                  key={item.problemId}
                  style={styles.reviewCard}
                  onClick={() => navigate(`/problem/${item.problemId}`)}
                >
                  <p style={styles.reviewProblem}>{item.problemId}</p>
                  <p style={styles.reviewTopic}>{item.topic}</p>
                  <p style={styles.reviewMastery}>Mastery: {item.masteryPercent}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Problem Browser */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🔍 Browse Problems</h3>
          <div style={styles.filterRow}>
            {/* REPLACE the <select> for topic with this: */}
        <select
            style={styles.select}
            value={topic}
            onChange={e => setTopic(e.target.value)}
        >
        <option value="dp">Dynamic Programming</option>
        <option value="graphs">Graphs</option>
        <option value="trees">Trees</option>
        <option value="greedy">Greedy</option>
        <option value="binary search">Binary Search</option>
        <option value="math">Math</option>
        <option value="sortings">Sorting</option>        {/* ← was "sorting" */}
        <option value="strings">Strings</option>          {/* ← new */}
        <option value="implementation">Implementation</option>  {/* ← new, most common tag */}
        <option value="brute force">Brute Force</option>  {/* ← new */}
        <option value="number theory">Number Theory</option>
        </select>

            <select
              style={styles.select}
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <button style={styles.button} onClick={fetchProblems} disabled={loading}>
              {loading ? 'Loading...' : 'Fetch Problems'}
            </button>
          </div>

          {/* Problem List */}
          {problems.length > 0 && (
            <div style={styles.problemList}>
              {problems.map(p => (
                <div
                  key={p.id}
                  style={styles.problemRow}
                  onClick={() => navigate(`/problem/${p.id}`, { state: { problem: p } })}
                >
                  <div>
                    <span style={styles.problemName}>{p.name}</span>
                    <span style={styles.problemTags}>{p.tags.slice(0,3).join(', ')}</span>
                  </div>
                  <div style={styles.problemRight}>
                    <span style={{
                      ...styles.ratingBadge,
                      background: p.rating <= 1200 ? '#16a34a' : p.rating <= 1900 ? '#ca8a04' : '#dc2626'
                    }}>
                      {p.rating}
                    </span>
                    <span style={styles.arrow}>→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Small reusable stat card
function StatCard({ label, value, highlight }) {
  return (
    <div style={{ ...styles.statCard, borderColor: highlight ? '#f59e0b' : '#2a2a2a' }}>
      <p style={styles.statValue}>{value}</p>
      <p style={styles.statLabel}>{label}</p>
    </div>
  );
}

const styles = {
  container:     { minHeight:'100vh', background:'#0f0f0f', color:'white' },
  navbar:        { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 2rem', background:'#1a1a1a', borderBottom:'1px solid #2a2a2a' },
  logo:          { margin:0, color:'#6366f1' },
  navRight:      { display:'flex', alignItems:'center', gap:'1rem' },
  welcome:       { color:'#aaa' },
  logout:        { padding:'0.4rem 1rem', background:'transparent', border:'1px solid #444', color:'white', borderRadius:'6px', cursor:'pointer' },
  content:       { padding:'2rem', maxWidth:'1100px', margin:'0 auto' },
  statsRow:      { display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1rem', marginBottom:'2rem' },
  statCard:      { background:'#1a1a1a', padding:'1.2rem', borderRadius:'10px', border:'1px solid #2a2a2a', textAlign:'center' },
  statValue:     { fontSize:'2rem', fontWeight:'bold', margin:0, color:'#6366f1' },
  statLabel:     { color:'#888', margin:'0.3rem 0 0', fontSize:'0.85rem' },
  section:       { background:'#1a1a1a', borderRadius:'12px', padding:'1.5rem', marginBottom:'1.5rem', border:'1px solid #2a2a2a' },
  sectionTitle:  { margin:'0 0 1rem', fontSize:'1.1rem' },
  reviewGrid:    { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'0.8rem' },
  reviewCard:    { background:'#111', padding:'1rem', borderRadius:'8px', cursor:'pointer', border:'1px solid #333' },
  reviewProblem: { margin:0, fontWeight:'bold', fontSize:'0.9rem' },
  reviewTopic:   { margin:'0.2rem 0', color:'#6366f1', fontSize:'0.8rem' },
  reviewMastery: { margin:0, color:'#888', fontSize:'0.8rem' },
  filterRow:     { display:'flex', gap:'1rem', marginBottom:'1rem', flexWrap:'wrap' },
  select:        { padding:'0.6rem 1rem', background:'#111', border:'1px solid #333', color:'white', borderRadius:'8px', cursor:'pointer' },
  button:        { padding:'0.6rem 1.5rem', background:'#6366f1', color:'white', border:'none', borderRadius:'8px', cursor:'pointer' },
  problemList:   { display:'flex', flexDirection:'column', gap:'0.5rem' },
  problemRow:    { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.9rem 1rem', background:'#111', borderRadius:'8px', cursor:'pointer', border:'1px solid #222' },
  problemName:   { fontWeight:'500', marginRight:'1rem' },
  problemTags:   { color:'#666', fontSize:'0.8rem' },
  problemRight:  { display:'flex', alignItems:'center', gap:'0.8rem' },
  ratingBadge:   { padding:'0.2rem 0.6rem', borderRadius:'4px', fontSize:'0.8rem', fontWeight:'bold' },
  arrow:         { color:'#666' }
};