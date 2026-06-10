import { useState, useRef, useEffect } from 'react';
import { getHint } from '../../services/api';
import { recordHintUsed } from '../../utils/gamification';

export default function AICoach({ problem, code, language, inline = false }) {
  const [open,     setOpen]     = useState(false);
  const [msgs,     setMsgs]     = useState([
    { role:'ai', text:`👋 Hi! I'm your Socratic coach for "${problem?.name||'this problem'}". I guide — never spoil. What approach are you thinking?` }
  ]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [attempts, setAttempts] = useState(0);
  const endRef = useRef(null);

  useEffect(() => {
    if (open || inline) endRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [msgs, open, inline]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMsgs(p => [...p, {role:'user', text:msg}]);
    setLoading(true);
    const n = attempts + 1;
    setAttempts(n);
    recordHintUsed();
    try {
      const res = await getHint({
        problemName:  problem?.name || 'Unknown',
        topic:        problem?.tags?.[0] || 'general',
        userCode:     code || '',
        attemptCount: n,
      });
      setMsgs(p => [...p, {role:'ai', text:res.data.hint}]);
    } catch {
      setMsgs(p => [...p, {role:'ai', text:'⚠️ Coach unavailable. Check your API key in backend .env.'}]);
    } finally {
      setLoading(false);
    }
  };

  const quick = [
    {label:'💡 Hint',      msg:'Give me a Socratic hint without spoiling the solution.'},
    {label:'🧠 Approach',  msg:'What algorithm or data structure should I think about?'},
    {label:'🔍 My Code',   msg:`Review my code and ask me a guiding question:\n\`\`\`${language||''}\n${code||'// no code yet'}\n\`\`\``},
    {label:'⚡ Optimize',  msg:'How can I improve the time or space complexity?'},
  ];

  return (
    <div style={{
      ...(inline ? st.inlineContainer : st.drawer),
      height: inline ? '100%' : (open ? 340 : 52)
    }}>
      {/* Toggle bar (only show if not inline) */}
      {!inline ? (
        <div style={st.bar} onClick={()=>setOpen(o=>!o)}>
          <div style={st.barLeft}>
            <span style={st.barIcon}>🤖</span>
            <span style={st.barTitle}>AI Coach</span>
            <span style={st.barMode}>Socratic mode</span>
          </div>
          {!open && (
            <span style={st.barHint}>Click to ask for hints or code review — no spoilers</span>
          )}
          <span style={st.chevron}>{open?'▼':'▲'}</span>
        </div>
      ) : (
        <div style={{ ...st.bar, cursor: 'default' }}>
          <div style={st.barLeft}>
            <span style={st.barIcon}>🤖</span>
            <span style={st.barTitle}>AI Coach</span>
            <span style={st.barMode}>Socratic mode</span>
          </div>
        </div>
      )}

      {(open || inline) && (
        <div style={st.body}>
          {/* Quick actions */}
          <div style={st.quickRow}>
            {quick.map(q=>(
              <button key={q.label} onClick={()=>send(q.msg)} disabled={loading} style={st.qBtn}>
                {q.label}
              </button>
            ))}
          </div>

          {/* Chat */}
          <div style={st.chat}>
            {msgs.map((m,i)=>(
              <div key={i} style={{...st.bubble,...(m.role==='user'?st.bUser:st.bAI)}}>
                {m.role==='ai' && <span style={st.coachLbl}>Coach</span>}
                <p style={st.bTxt}>{m.text}</p>
              </div>
            ))}
            {loading && (
              <div style={{...st.bubble,...st.bAI}}>
                <span style={st.coachLbl}>Coach</span>
                <div style={st.dots}>
                  <span className="d"/>
                  <span className="d"/>
                  <span className="d"/>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Input */}
          <div style={st.inputRow}>
            <input
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&!loading&&send()}
              placeholder="Ask anything about this problem…"
              style={st.input}
            />
            <button onClick={()=>send()} disabled={loading||!input.trim()} style={st.sendBtn}>
              {loading ? '…' : 'Ask ↗'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink{0%,80%,100%{opacity:.15}40%{opacity:1}}
        .d{display:inline-block;width:6px;height:6px;border-radius:50%;background:#7c6df0;margin:0 2px;animation:blink 1.3s infinite}
        .d:nth-child(2){animation-delay:.2s}.d:nth-child(3){animation-delay:.4s}
      `}</style>
    </div>
  );
}

const st = {
  drawer:   {position:'fixed',bottom:0,left:0,right:0,background:'#0d0d0d',borderTop:'1px solid #1a1a1a',display:'flex',flexDirection:'column',transition:'height 0.3s ease',overflow:'hidden',zIndex:1000},
  inlineContainer: {background:'#0d0d0d',display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'},
  bar:      {display:'flex',alignItems:'center',gap:12,padding:'0 16px',height:52,cursor:'pointer',userSelect:'none',flexShrink:0},
  barLeft:  {display:'flex',alignItems:'center',gap:8},
  barIcon:  {fontSize:16},
  barTitle: {color:'#7c6df0',fontWeight:700,fontSize:13},
  barMode:  {background:'#1e1e3f',color:'#7c6df0',fontSize:9,padding:'2px 8px',borderRadius:10,border:'1px solid #3a3a6a'},
  barHint:  {color:'#333',fontSize:12,flex:1},
  chevron:  {color:'#333',fontSize:11,marginLeft:'auto'},
  body:     {display:'flex',flexDirection:'column',flex:1,overflow:'hidden',padding:'8px 14px 10px',gap:8},
  quickRow: {display:'flex',gap:6,flexWrap:'wrap',flexShrink:0},
  qBtn:     {padding:'4px 12px',borderRadius:20,border:'1px solid #222',background:'#151515',color:'#777',fontSize:11,cursor:'pointer',transition:'all 0.15s'},
  chat:     {flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:8,paddingRight:4},
  bubble:   {maxWidth:'80%',borderRadius:12,padding:'8px 12px'},
  bAI:      {background:'#151515',border:'1px solid #1e1e1e',alignSelf:'flex-start'},
  bUser:    {background:'#2d2560',alignSelf:'flex-end'},
  coachLbl: {fontSize:10,color:'#7c6df0',display:'block',marginBottom:3,fontWeight:600},
  bTxt:     {fontSize:12,color:'#ccc',margin:0,lineHeight:1.6,whiteSpace:'pre-wrap'},
  dots:     {display:'flex',alignItems:'center',padding:'2px 0'},
  inputRow: {display:'flex',gap:8,flexShrink:0},
  input:    {flex:1,background:'#111',border:'1px solid #1e1e1e',borderRadius:8,color:'#e0e0e0',fontSize:13,padding:'8px 12px',outline:'none'},
  sendBtn:  {padding:'8px 18px',background:'#7c6df0',color:'#fff',border:'none',borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:600},
};