// frontend/src/pages/ProblemPage.jsx
// Main workspace — visualizer + editor + AI coach + sketch all in one page
import { useState }        from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { submitAttempt }   from '../services/api';
import Visualizer          from '../components/Visualizer/Visualizer';
import CodeEditor          from '../components/Editor/CodeEditor';
import AICoach             from '../components/AICoach/AICoach';
import SketchCanvas        from '../components/Sketch/SketchCanvas';
import toast               from 'react-hot-toast';

export default function ProblemPage() {
  const { id }                        = useParams();
  const { state }                     = useLocation();
  const navigate                      = useNavigate();
  const problem                       = state?.problem || { name: id, tags: [], rating: 0 };
  const [code, setCode]               = useState('');
  const [attempts, setAttempts]       = useState(0);
  const [coachAttempts, setCoachAttempts] = useState(0);
  const [activeTab, setActiveTab]     = useState('visualizer'); // visualizer | sketch
  const [submitting, setSubmitting]   = useState(false);

  const handleSubmit = async (solved) => {
    setSubmitting(true);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    try {
      await submitAttempt({
        problemId: id,
        topic:     problem.tags?.[0] || 'general',
        solved,
        hintsUsed: 0,
        timeSecs:  60
      });
      toast.success(solved ? '✅ Marked as solved!' : '📝 Attempt recorded');
    } catch {
      toast.error('Failed to save progress');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>

      {/* Top bar */}
      <div style={styles.topBar}>
        <button style={styles.back} onClick={() => navigate('/')}>← Back</button>
        <div style={styles.problemInfo}>
          <span style={styles.problemName}>{problem.name}</span>
          <span style={styles.rating}>Rating: {problem.rating}</span>
          {problem.tags?.slice(0, 3).map(t => (
            <span key={t} style={styles.tag}>{t}</span>
          ))}
        </div>
         <a
          href={problem.url}
          target="_blank"
          rel="noreferrer"
          style={styles.cfLink}
        >
          Open on CF ↗
        </a>
      </div>

      {/* Main layout */}
      <div style={styles.layout}>

        {/* Left panel */}
        <div style={styles.left}>

          {/* Tab switcher */}
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, borderBottom: activeTab === 'visualizer' ? '2px solid #6366f1' : 'none' }}
              onClick={() => setActiveTab('visualizer')}
            >
              Visualizer
            </button>
            <button
              style={{ ...styles.tab, borderBottom: activeTab === 'sketch' ? '2px solid #6366f1' : 'none' }}
              onClick={() => setActiveTab('sketch')}
            >
              Sketch
            </button>
          </div>

          {activeTab === 'visualizer'
            ? <Visualizer />
            : <SketchCanvas />
          }
        </div>

        {/* Right panel */}
        <div style={styles.right}>
          <CodeEditor onCodeChange={setCode} />

          {/* Submit buttons */}
          <div style={styles.submitRow}>
            <button
              style={styles.btnSolved}
              onClick={() => handleSubmit(true)}
              disabled={submitting}
            >
              ✅ Mark Solved
            </button>
            <button
              style={styles.btnAttempt}
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              📝 Save Attempt
            </button>
          </div>

          
        <AICoach
           problemName={problem.name}
           topic={problem.tags?.[0] || 'general'}
           userCode={code}
           attemptCount={coachAttempts}
           onAsk={() => setCoachAttempts(prev => prev + 1)}
        />
        </div>

      </div>
    </div>
  );
}

const styles = {
  container:   { minHeight:'100vh', background:'#0f0f0f', color:'white' },
  topBar:      { display:'flex', alignItems:'center', gap:'1rem', padding:'0.9rem 1.5rem', background:'#1a1a1a', borderBottom:'1px solid #2a2a2a', flexWrap:'wrap' },
  back:        { padding:'0.4rem 0.8rem', background:'transparent', border:'1px solid #444', color:'white', borderRadius:'6px', cursor:'pointer' },
  problemInfo: { display:'flex', alignItems:'center', gap:'0.6rem', flex:1, flexWrap:'wrap' },
  problemName: { fontWeight:'600', fontSize:'1rem' },
  rating:      { color:'#888', fontSize:'0.85rem' },
  tag:         { background:'#2a2a2a', padding:'0.2rem 0.5rem', borderRadius:'4px', fontSize:'0.75rem', color:'#6366f1' },
  cfLink:      { color:'#6366f1', textDecoration:'none', fontSize:'0.85rem' },
  layout:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', padding:'1rem 1.5rem' },
  left:        { display:'flex', flexDirection:'column', gap:'1rem' },
  right:       { display:'flex', flexDirection:'column', gap:'1rem' },
  tabs:        { display:'flex', gap:'0', borderBottom:'1px solid #2a2a2a' },
  tab:         { padding:'0.6rem 1.2rem', background:'transparent', border:'none', color:'white', cursor:'pointer', fontSize:'0.9rem' },
  submitRow:   { display:'flex', gap:'0.8rem' },
  btnSolved:   { flex:1, padding:'0.7rem', background:'#16a34a', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'500' },
  btnAttempt:  { flex:1, padding:'0.7rem', background:'#2a2a2a', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'500' }
};