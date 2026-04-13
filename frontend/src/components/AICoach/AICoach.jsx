// frontend/src/components/AICoach/AICoach.jsx
import { useState } from 'react';
import { getHint } from '../../services/api';
import toast from 'react-hot-toast';

export default function AICoach({ problemName, topic, userCode, attemptCount, onAsk }) {
  const [hints, setHints]     = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHint = async () => {
  setLoading(true);
  onAsk && onAsk();   // ← increment BEFORE the call so Claude sees the new count
  try {
    const res = await getHint({ problemName, topic, userCode, attemptCount: attemptCount + 1 });
    setHints(prev => [...prev, res.data.hint]);
  } catch {
    toast.error('AI coach unavailable');
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>🤖 AI Coach</span>
        <span style={styles.subtitle}>Socratic mode — asks questions, not answers</span>
      </div>

      {/* Hints history */}
      <div style={styles.hintsArea}>
        {hints.length === 0 && (
          <p style={styles.empty}>
            Stuck? Click "Ask Coach" and get a guiding question instead of the answer.
          </p>
        )}
        {hints.map((hint, i) => (
          <div key={i} style={styles.hintCard}>
            <span style={styles.hintNum}>Q{i + 1}</span>
            <p style={styles.hintText}>{hint}</p>
          </div>
        ))}
      </div>

      <button
        style={styles.button}
        onClick={fetchHint}
        disabled={loading}
      >
        {loading ? 'Thinking...' : '💡 Ask Coach'}
      </button>
    </div>
  );
}

const styles = {
  container: { background:'#1a1a1a', borderRadius:'12px', padding:'1.2rem', border:'1px solid #2a2a2a', display:'flex', flexDirection:'column', gap:'1rem' },
  header:    { borderBottom:'1px solid #2a2a2a', paddingBottom:'0.8rem' },
  title:     { color:'white', fontWeight:'600', display:'block' },
  subtitle:  { color:'#666', fontSize:'0.8rem', display:'block', marginTop:'0.2rem' },
  hintsArea: { minHeight:'150px', display:'flex', flexDirection:'column', gap:'0.8rem' },
  empty:     { color:'#555', fontSize:'0.85rem', textAlign:'center', marginTop:'2rem' },
  hintCard:  { background:'#111', borderRadius:'8px', padding:'0.9rem', border:'1px solid #2a2a2a', display:'flex', gap:'0.8rem' },
  hintNum:   { color:'#6366f1', fontWeight:'bold', minWidth:'24px' },
  hintText:  { color:'#ccc', margin:0, fontSize:'0.9rem', lineHeight:'1.5' },
  button:    { padding:'0.7rem', background:'#6366f1', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'500' }
};