// frontend/src/components/Sketch/SketchCanvas.jsx
import { useRef, useState, useEffect } from 'react';
import { predictSketch } from '../../services/api';

export default function SketchCanvas() {
  const canvasRef             = useRef();
  const [drawing, setDrawing] = useState(false);
  const [strokes, setStrokes] = useState([]);
  const [current, setCurrent] = useState([]);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { redraw(); }, [strokes]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return [
      Math.round(e.clientX - rect.left),
      Math.round(e.clientY - rect.top)
    ];
  };

  const startDraw = (e) => {
    setDrawing(true);
    setCurrent([getPos(e)]);
  };

  const draw = (e) => {
    if (!drawing) return;
    setCurrent(prev => [...prev, getPos(e)]);
    // Draw current stroke live
    const ctx = canvasRef.current.getContext('2d');
    const pts = [...current, getPos(e)];
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[pts.length - 2][0], pts[pts.length - 2][1]);
    ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth   = 3;
    ctx.lineCap     = 'round';
    ctx.stroke();
  };

  const endDraw = () => {
    if (!drawing) return;
    setDrawing(false);
    if (current.length > 1) {
      setStrokes(prev => [...prev, current]);
    }
    setCurrent([]);
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth   = 3;
    ctx.lineCap     = 'round';
    strokes.forEach(stroke => {
      ctx.beginPath();
      stroke.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.stroke();
    });
  };

  const clearCanvas = () => {
    setStrokes([]);
    setResult(null);
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, 560, 220);
  };

  const recognize = async () => {
    if (strokes.length === 0) return;
    setLoading(true);
    try {
      const res = await predictSketch(strokes);
      setResult(res.data);
    } catch {
      setResult({ dsa_concept: 'ML service offline', confidence: 0 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>✏️ Sketch Recognizer</h3>
      <p style={styles.subtitle}>Draw a DSA structure — array, tree, graph, stack...</p>

      <canvas
        ref={canvasRef}
        width={560}
        height={220}
        style={styles.canvas}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
      />

      <div style={styles.actionRow}>
        <button style={styles.btn} onClick={clearCanvas}>Clear</button>
        <button style={styles.btnPrimary} onClick={recognize} disabled={loading || strokes.length === 0}>
          {loading ? 'Recognizing...' : '🔍 Recognize'}
        </button>
      </div>

      {result && (
        <div style={styles.result}>
          <p style={styles.resultConcept}>{result.dsa_concept}</p>
          <p style={styles.resultConf}>
            Confidence: {Math.round((result.confidence || 0) * 100)}%
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container:     { background:'#1a1a1a', borderRadius:'12px', padding:'1.5rem', border:'1px solid #2a2a2a' },
  title:         { margin:'0 0 0.3rem', color:'white' },
  subtitle:      { color:'#666', fontSize:'0.85rem', margin:'0 0 1rem' },
  canvas:        { background:'#111', borderRadius:'8px', cursor:'crosshair', display:'block' },
  actionRow:     { display:'flex', gap:'0.8rem', marginTop:'1rem' },
  btn:           { padding:'0.5rem 1.2rem', background:'#2a2a2a', color:'white', border:'none', borderRadius:'8px', cursor:'pointer' },
  btnPrimary:    { padding:'0.5rem 1.5rem', background:'#6366f1', color:'white', border:'none', borderRadius:'8px', cursor:'pointer' },
  result:        { marginTop:'1rem', background:'#111', padding:'1rem', borderRadius:'8px', border:'1px solid #2a2a2a' },
  resultConcept: { color:'#6366f1', fontWeight:'bold', fontSize:'1.1rem', margin:'0 0 0.3rem' },
  resultConf:    { color:'#888', margin:0, fontSize:'0.85rem' }
};