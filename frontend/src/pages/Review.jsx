import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReviewQueue } from '../services/api';
import toast from 'react-hot-toast';

export default function Review() {
  const [reviewQueue, setReviewQueue] = useState([]);
  const [loading, setLoading]         = useState(true);
  const navigate                      = useNavigate();

  useEffect(() => {
    fetchReviewQueue();
  }, []);

  const fetchReviewQueue = async () => {
    setLoading(true);
    try {
      const res = await getReviewQueue();
      setReviewQueue(res.data || []);
    } catch {
      toast.error('Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h2 style={styles.title}>📅 Review Queue</h2>
        <p style={styles.subtitle}>These problems are due for review based on your mastery levels.</p>

        {loading ? (
          <div style={styles.loader}>Loading review queue...</div>
        ) : reviewQueue.length > 0 ? (
          <div style={styles.reviewGrid}>
            {reviewQueue.map(item => {
              const [contestId, index] = item.problemId.split('-');
              return (
                <div
                  key={item.problemId}
                  style={styles.reviewCard}
                  onClick={() => navigate(`/problem/${contestId}/${index}`)}
                >
                  <div style={styles.cardHeader}>
                    <span style={styles.problemId}>{item.problemId}</span>
                    <span style={styles.topicBadge}>{item.topic}</span>
                  </div>
                  <div style={styles.cardBody}>
                    <div style={styles.masteryRow}>
                      <span style={styles.label}>Mastery</span>
                      <span style={styles.value}>{item.masteryPercent}%</span>
                    </div>
                    <div style={styles.progressBg}>
                      <div style={{ ...styles.progressFill, width: `${item.masteryPercent}%` }} />
                    </div>
                  </div>
                  <div style={styles.cardFooter}>
                    <span>Click to Practice →</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.noData}>
            <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>🎉</span>
            <h3>All caught up!</h3>
            <p>You have no problems due for review today.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: 'calc(100vh - 56px)', background: '#0f0f0f', color: 'white' },
  content: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
  title: { marginBottom: '0.2rem', color: '#e0e0e0' },
  subtitle: { color: '#888', marginBottom: '2rem', fontSize: '0.95rem' },
  loader: { textAlign: 'center', padding: '3rem', color: '#888' },
  reviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.2rem'
  },
  reviewCard: {
    background: '#1a1a1a',
    padding: '1.2rem',
    borderRadius: '12px',
    cursor: 'pointer',
    border: '1px solid #2a2a2a',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'transform 0.15s, border-color 0.15s'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  problemId: { fontWeight: 'bold', fontSize: '1.1rem' },
  topicBadge: { background: '#2a2a2a', color: '#6366f1', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '500' },
  cardBody: { marginBottom: '1.5rem' },
  masteryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' },
  label: { color: '#888' },
  value: { fontWeight: 'bold', color: '#6366f1' },
  progressBg: { height: '6px', background: '#0f0f0f', borderRadius: '3px', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #6366f1, #818cf8)', borderRadius: '3px' },
  cardFooter: { color: '#888', fontSize: '0.85rem', textAlign: 'right', fontWeight: '500' },
  noData: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#888',
    background: '#1a1a1a',
    borderRadius: '12px',
    border: '1px solid #2a2a2a',
    maxWidth: '500px',
    margin: '2rem auto'
  }
};
