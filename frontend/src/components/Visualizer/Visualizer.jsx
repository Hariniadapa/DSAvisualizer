// frontend/src/components/Visualizer/Visualizer.jsx
// Animates sorting algorithms using D3.js
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const ALGORITHMS = ['bubble', 'selection', 'insertion', 'merge'];

export default function Visualizer() {
  const svgRef                    = useRef();
  const [array, setArray]         = useState([]);
  const [algo, setAlgo]           = useState('bubble');
  const [running, setRunning]     = useState(false);
  const [speed, setSpeed]         = useState(200);
  const stopRef                   = useRef(false);

  useEffect(() => { generateArray(); }, []);

  const generateArray = () => {
    const arr = Array.from({ length: 20 }, () => Math.floor(Math.random() * 280) + 20);
    setArray(arr);
    drawBars(arr, []);
  };

  // ── Draw bars using D3 ──────────────────────────
  const drawBars = (arr, highlighted = []) => {
    const svg    = d3.select(svgRef.current);
    const W      = 560;
    const H      = 300;
    const barW   = W / arr.length - 2;

    svg.selectAll('*').remove();

    svg.selectAll('rect')
      .data(arr)
      .enter()
      .append('rect')
      .attr('x',      (_, i) => i * (barW + 2))
      .attr('y',      d => H - d)
      .attr('width',  barW)
      .attr('height', d => d)
      .attr('fill',   (_, i) =>
        highlighted.includes(i) ? '#f59e0b' : '#6366f1'
      )
      .attr('rx', 3);
  };

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // ── Bubble Sort ─────────────────────────────────
  const bubbleSort = async (arr) => {
    const a = [...arr];
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < a.length - i - 1; j++) {
        if (stopRef.current) return;
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
        }
        drawBars(a, [j, j + 1]);
        await sleep(speed);
      }
    }
    drawBars(a, []);
  };

  // ── Selection Sort ──────────────────────────────
  const selectionSort = async (arr) => {
    const a = [...arr];
    for (let i = 0; i < a.length; i++) {
      let minIdx = i;
      for (let j = i + 1; j < a.length; j++) {
        if (stopRef.current) return;
        if (a[j] < a[minIdx]) minIdx = j;
        drawBars(a, [i, j, minIdx]);
        await sleep(speed);
      }
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
    }
    drawBars(a, []);
  };

  // ── Insertion Sort ──────────────────────────────
  const insertionSort = async (arr) => {
    const a = [...arr];
    for (let i = 1; i < a.length; i++) {
      let key = a[i];
      let j   = i - 1;
      while (j >= 0 && a[j] > key) {
        if (stopRef.current) return;
        a[j + 1] = a[j];
        j--;
        drawBars(a, [j + 1, i]);
        await sleep(speed);
      }
      a[j + 1] = key;
    }
    drawBars(a, []);
  };

  // ── Merge Sort ──────────────────────────────────
  const mergeSort = async (arr) => {
    const a = [...arr];

    const merge = async (arr, l, m, r) => {
      const left  = arr.slice(l, m + 1);
      const right = arr.slice(m + 1, r + 1);
      let i = 0, j = 0, k = l;

      while (i < left.length && j < right.length) {
        if (stopRef.current) return;
        if (left[i] <= right[j]) { arr[k++] = left[i++]; }
        else                     { arr[k++] = right[j++]; }
        drawBars(arr, [k]);
        await sleep(speed);
      }
      while (i < left.length) { arr[k++] = left[i++]; }
      while (j < right.length) { arr[k++] = right[j++]; }
    };

    const sort = async (arr, l, r) => {
      if (l >= r) return;
      const m = Math.floor((l + r) / 2);
      await sort(arr, l, m);
      await sort(arr, m + 1, r);
      await merge(arr, l, m, r);
    };

    await sort(a, 0, a.length - 1);
    drawBars(a, []);
  };

  const runSort = async () => {
    stopRef.current = false;
    setRunning(true);
    const map = { bubble: bubbleSort, selection: selectionSort, insertion: insertionSort, merge: mergeSort };
    await map[algo](array);
    setRunning(false);
  };

  const stopSort = () => {
    stopRef.current = true;
    setRunning(false);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Algorithm Visualizer</h3>

      {/* Controls */}
      <div style={styles.controls}>
        {ALGORITHMS.map(a => (
          <button
            key={a}
            style={{ ...styles.algoBtn, background: algo === a ? '#6366f1' : '#2a2a2a' }}
            onClick={() => setAlgo(a)}
            disabled={running}
          >
            {a.charAt(0).toUpperCase() + a.slice(1)}
          </button>
        ))}
      </div>

      {/* Speed slider */}
      <div style={styles.speedRow}>
        <label style={styles.label}>Speed</label>
        <input
          type="range" min="50" max="500" step="50"
          value={speed}
          onChange={e => setSpeed(Number(e.target.value))}
        />
        <span style={styles.label}>{speed}ms</span>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width="560"
        height="300"
        style={styles.svg}
      />

      {/* Action buttons */}
      <div style={styles.actionRow}>
        <button style={styles.btn} onClick={generateArray} disabled={running}>
          New Array
        </button>
        <button style={styles.btnPrimary} onClick={runSort} disabled={running}>
          ▶ Start
        </button>
        <button style={styles.btnDanger} onClick={stopSort} disabled={!running}>
          ■ Stop
        </button>
      </div>
    </div>
  );
}

const styles = {
  container:  { background:'#1a1a1a', borderRadius:'12px', padding:'1.5rem', border:'1px solid #2a2a2a' },
  title:      { margin:'0 0 1rem', color:'white' },
  controls:   { display:'flex', gap:'0.5rem', marginBottom:'1rem', flexWrap:'wrap' },
  algoBtn:    { padding:'0.4rem 1rem', border:'none', color:'white', borderRadius:'6px', cursor:'pointer' },
  speedRow:   { display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' },
  label:      { color:'#888', fontSize:'0.85rem' },
  svg:        { background:'#111', borderRadius:'8px', display:'block' },
  actionRow:  { display:'flex', gap:'0.8rem', marginTop:'1rem' },
  btn:        { padding:'0.5rem 1.2rem', background:'#2a2a2a', color:'white', border:'none', borderRadius:'8px', cursor:'pointer' },
  btnPrimary: { padding:'0.5rem 1.2rem', background:'#6366f1', color:'white', border:'none', borderRadius:'8px', cursor:'pointer' },
  btnDanger:  { padding:'0.5rem 1.2rem', background:'#dc2626', color:'white', border:'none', borderRadius:'8px', cursor:'pointer' }
};