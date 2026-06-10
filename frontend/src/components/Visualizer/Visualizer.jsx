import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getVisualizerConfig, generateInputFromProblem,
  bubbleSortSteps, selectionSortSteps, insertionSortSteps,
  binarySearchSteps, twoPointersSteps, COMPLEXITY
} from '../../utils/visualizer';

export default function Visualizer({ problem }) {
  const config    = getVisualizerConfig(problem);
  const [array,     setArray]     = useState([]);
  const [comparing, setComparing] = useState([]);
  const [sorted,    setSorted]    = useState([]);
  const [special,   setSpecial]   = useState({});
  const [playing,   setPlaying]   = useState(false);
  const [speed,     setSpeed]     = useState(500);
  const [step,      setStep]      = useState(0);
  const [total,     setTotal]     = useState(0);
  const [algo,      setAlgo]      = useState('bubble');
  const [msg,       setMsg]       = useState('Press Play to start');
  const [done,      setDone]      = useState(false);

  const stepsRef = useRef([]);
  const timerRef = useRef(null);
  const stepRef = useRef(0);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const ALGO_TABS = {
    sorting:      [{id:'bubble',label:'Bubble'},{id:'selection',label:'Selection'},{id:'insertion',label:'Insertion'}],
    binarysearch: [{id:'binarysearch',label:'Binary Search'}],
    twopointers:  [{id:'twopointers',label:'Two Pointers'}],
    default:      [{id:'bubble',label:'Bubble Sort'}],
  };
  const tabs = ALGO_TABS[config.type] || ALGO_TABS.default;

  const build = useCallback(() => {
    clearInterval(timerRef.current);
    const arr = generateInputFromProblem(problem);
    setArray(arr); setComparing([]); setSorted([]); setSpecial({});
    setStep(0); setDone(false); setMsg('Press Play to start');

    const tgt = arr[Math.floor(arr.length/2)];
    let gen;
    switch(algo) {
      case 'selection':    gen = selectionSortSteps(arr);              break;
      case 'insertion':    gen = insertionSortSteps(arr);              break;
      case 'binarysearch': gen = binarySearchSteps(arr, tgt);          break;
      case 'twopointers':  gen = twoPointersSteps(arr, arr[0]+arr[arr.length-1]); break;
      default:             gen = bubbleSortSteps(arr);
    }
    const steps = [...(function*(){ yield* gen; })()];
    stepsRef.current = steps;
    setTotal(steps.length);
  }, [algo, problem]);

  useEffect(() => { build(); }, [build]);

  const applyStep = useCallback((idx) => {
    const st = stepsRef.current[idx];
    if (!st) return;
    if (st.array) setArray(st.array);
    setComparing(st.comparing || []);
    setSorted(st.sorted || []);
    if (st.lo !== undefined) {
      setSpecial({lo:st.lo, hi:st.hi, mid:st.mid});
      setMsg(st.found ? `✓ Found at index ${st.mid}!` : `lo=${st.lo}  mid=${st.mid}  hi=${st.hi}  val=${st.array?.[st.mid]}`);
    } else if (st.sum !== undefined) {
      setSpecial({lo:st.lo, hi:st.hi});
      setMsg(`[${st.lo}]+[${st.hi}]=${st.sum} ${st.found?'✓ Found!':st.sum<st.target?'→ move left ptr':'→ move right ptr'}`);
    } else if (st.comparing?.length) {
      setMsg(`Comparing index ${st.comparing[0]} (${st.array?.[st.comparing[0]]}) ↔ ${st.comparing[1]} (${st.array?.[st.comparing[1]]})`);
    } else {
      setMsg('✓ All done!');
    }
  }, []);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      const next = stepRef.current + 1;
      if (next >= stepsRef.current.length) {
        setPlaying(false); setDone(true);
        clearInterval(timerRef.current);
      } else {
        setStep(next);
        applyStep(next);
      }
    }, speed);
    return () => clearInterval(timerRef.current);
  }, [playing, speed, applyStep]);

  const play     = () => { if(done){build();setTimeout(()=>setPlaying(true),150);}else setPlaying(true); };
  const pause    = () => setPlaying(false);
  const reset    = () => { setPlaying(false); build(); };
  const stepFwd  = () => {
    setPlaying(false);
    const n = Math.min(step+1, stepsRef.current.length-1);
    setStep(n); applyStep(n);
  };

  const maxVal = Math.max(...array, 1);
  const cx = COMPLEXITY[algo] || {time:'O(?)',space:'O(?)'};

  const barColor = (i) => {
    if (sorted.includes(i))                   return '#4caf7d';
    if (comparing.includes(i))                return '#f06060';
    if (special.mid === i)                    return '#f0c060';
    if (special.lo===i || special.hi===i)     return '#38bdf8';
    return '#7c6df0';
  };

  return (
    <div style={s.root}>
      {/* Top bar */}
      <div style={s.topBar}>
        <span style={s.vizLabel}>{config.label}</span>
        <div style={s.tabRow}>
          {tabs.map(t => (
            <button key={t.id}
              onClick={() => { setAlgo(t.id); setPlaying(false); }}
              style={{...s.tab,...(algo===t.id?s.tabOn:{})}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={s.legend}>
        {[{color:'#7c6df0',label:'Default'},{color:'#f06060',label:'Comparing'},{color:'#4caf7d',label:'Sorted'},{color:'#f0c060',label:'Pivot/Mid'},{color:'#38bdf8',label:'Pointer'}].map(l=>(
          <span key={l.label} style={s.legendItem}>
            <span style={{...s.legendDot,background:l.color}}/>
            <span style={s.legendTxt}>{l.label}</span>
          </span>
        ))}
      </div>

      {/* Bars */}
      <div style={s.bars}>
        {array.map((val, i) => (
          <div key={i} style={s.barWrap}>
            <span style={s.barVal}>{val}</span>
            <div style={{
              width:'100%',
              height:`${Math.max((val/maxVal)*160, 6)}px`,
              background:barColor(i),
              borderRadius:'4px 4px 0 0',
              transition:'height 0.12s ease, background 0.1s ease',
              boxShadow: comparing.includes(i) ? '0 0 8px #f0606066' : sorted.includes(i) ? '0 0 8px #4caf7d44' : 'none',
            }}/>
            <span style={s.barIdx}>{i}</span>
          </div>
        ))}
      </div>

      {/* Message */}
      <div style={s.msg}>{msg}</div>

      {/* Controls */}
      <div style={s.controls}>
        <button onClick={reset}   style={s.btn} title="Reset">↺ Reset</button>
        <button onClick={stepFwd} style={s.btn} title="Step">Step ⏭</button>
        {playing
          ? <button onClick={pause} style={{...s.btn,...s.btnPrimary}}>⏸ Pause</button>
          : <button onClick={play}  style={{...s.btn,...s.btnPrimary}}>▶ Play</button>
        }
        <div style={s.speedWrap}>
          <span style={s.speedLbl}>Speed</span>
          <input type="range" min={100} max={1000} step={50}
            value={1100-speed}
            onChange={e=>setSpeed(1100-Number(e.target.value))}
            style={{width:90}}
          />
          <span style={s.speedLbl}>{Math.round((1100-speed)/100)/10}x</span>
        </div>
        <span style={s.stepCount}>{step} / {total} steps</span>
      </div>

      {/* Complexity */}
      <div style={s.complexRow}>
        <div style={s.cBox}>
          <span style={s.cLbl}>Time Complexity</span>
          <span style={s.cVal}>{cx.time}</span>
        </div>
        <div style={s.cBox}>
          <span style={s.cLbl}>Space Complexity</span>
          <span style={s.cVal}>{cx.space}</span>
        </div>
        {done && <span style={s.doneTag}>✓ Visualization complete</span>}
      </div>
    </div>
  );
}

const s = {
  root:        {display:'flex',flexDirection:'column',height:'100%',padding:'12px 16px',gap:10,background:'#0f0f0f',overflow:'hidden'},
  topBar:      {display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8},
  vizLabel:    {color:'#7c6df0',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1.5},
  tabRow:      {display:'flex',gap:4},
  tab:         {padding:'4px 14px',borderRadius:20,border:'1px solid #222',background:'transparent',color:'#555',fontSize:11,cursor:'pointer',transition:'all 0.15s'},
  tabOn:       {background:'#7c6df0',color:'#fff',border:'1px solid #7c6df0'},
  legend:      {display:'flex',gap:12,flexWrap:'wrap'},
  legendItem:  {display:'flex',alignItems:'center',gap:4},
  legendDot:   {width:8,height:8,borderRadius:'50%',display:'inline-block'},
  legendTxt:   {color:'#444',fontSize:10},
  bars:        {flex:1,display:'flex',alignItems:'flex-end',gap:4,padding:'4px 0',minHeight:140,maxHeight:200},
  barWrap:     {flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2},
  barVal:      {fontSize:9,color:'#555',fontWeight:500},
  barIdx:      {fontSize:9,color:'#333'},
  msg:         {textAlign:'center',fontSize:12,color:'#a89df5',minHeight:20,padding:'4px 0',background:'#151515',borderRadius:6,border:'1px solid #1e1e1e'},
  controls:    {display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'},
  btn:         {padding:'5px 12px',borderRadius:8,border:'1px solid #222',background:'#151515',color:'#888',fontSize:12,cursor:'pointer',transition:'all 0.15s'},
  btnPrimary:  {background:'#7c6df0',color:'#fff',border:'none'},
  speedWrap:   {display:'flex',alignItems:'center',gap:6,marginLeft:'auto'},
  speedLbl:    {fontSize:10,color:'#444'},
  stepCount:   {fontSize:11,color:'#444'},
  complexRow:  {display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'},
  cBox:        {display:'flex',flexDirection:'column',background:'#151515',border:'1px solid #1e1e1e',borderRadius:8,padding:'6px 14px',alignItems:'center'},
  cLbl:        {fontSize:9,color:'#444',textTransform:'uppercase',letterSpacing:0.5},
  cVal:        {fontSize:13,color:'#4caf7d',fontWeight:700,marginTop:2},
  doneTag:     {fontSize:12,color:'#4caf7d',marginLeft:'auto',background:'#0d2010',border:'1px solid #1a4020',borderRadius:6,padding:'4px 10px'},
};