import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStats, getLevelInfo } from '../utils/gamification';

export default function Navbar() {
  const { token, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [stats,   setStats] = useState({ xp:0, streak:0, solvedCount:0 });
  const [lvl,     setLvl  ] = useState({ current:{level:1,title:'Novice'}, progress:0 });

  useEffect(() => {
    const s = getStats();
    setStats(s);
    setLvl(getLevelInfo(s.xp));
  }, [location.pathname]);

  const isActive = (p) => location.pathname === p;

  return (
    <nav style={s.nav}>
      <Link to="/dashboard" style={s.logo}>
        <span style={s.logoHex}>⬡</span>
        <span style={s.logoTxt}>DSA<span style={s.logoAccent}>Viz</span></span>
      </Link>

      {token && (
        <div style={s.links}>
          {[
            {to:'/dashboard',label:'Dashboard'},
            {to:'/problems',label:'Problems'},
            {to:'/review',label:'Review'},
            {to:'/sketch',label:'Sketch Canvas'}
          ].map(l=>(
            <Link key={l.to} to={l.to} style={{...s.link,...(isActive(l.to)?s.linkOn:{})}}>
              {l.label}
            </Link>
          ))}
        </div>
      )}

      {token && (
        <div style={s.right}>
          <div style={s.pill}>
            <span style={s.pillGreen}>✓</span>
            <span style={s.pillVal}>{stats.solvedCount}</span>
            <span style={s.pillLbl}>solved</span>
          </div>
          <div style={s.pill}>
            <span>🔥</span>
            <span style={s.pillVal}>{stats.streak}</span>
            <span style={s.pillLbl}>streak</span>
          </div>
          <div style={s.xpWrap}>
            <div style={s.xpTop}>
              <span style={s.lvlBadge}>Lv {lvl.current.level} · {lvl.current.title}</span>
              <span style={s.xpAmt}>{stats.xp} XP</span>
            </div>
            <div style={s.xpBg}>
              <div style={{...s.xpFill, width:`${lvl.progress}%`}} />
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} style={s.logoutBtn}>
            Logout
          </button>
        </div>
      )}

      {!token && (
        <div style={s.right}>
          <Link to="/login"    style={s.link}>Login</Link>
          <Link to="/register" style={{...s.link,...s.regBtn}}>Register</Link>
        </div>
      )}
    </nav>
  );
}

const s = {
  nav:       {display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',height:56,background:'#0d0d0d',borderBottom:'1px solid #1a1a1a',position:'sticky',top:0,zIndex:100},
  logo:      {display:'flex',alignItems:'center',gap:8,textDecoration:'none'},
  logoHex:   {fontSize:22,color:'#7c6df0'},
  logoTxt:   {fontSize:18,fontWeight:700,color:'#e0e0e0',letterSpacing:'-0.5px'},
  logoAccent:{color:'#7c6df0'},
  links:     {display:'flex',gap:4},
  link:      {padding:'6px 14px',borderRadius:8,color:'#666',textDecoration:'none',fontSize:13,transition:'all 0.15s'},
  linkOn:    {color:'#e0e0e0',background:'#1a1a1a'},
  right:     {display:'flex',alignItems:'center',gap:10},
  pill:      {display:'flex',alignItems:'center',gap:4,background:'#151515',border:'1px solid #222',borderRadius:20,padding:'4px 10px'},
  pillGreen: {color:'#4caf7d',fontSize:11,fontWeight:700},
  pillVal:   {color:'#e0e0e0',fontSize:13,fontWeight:600},
  pillLbl:   {color:'#444',fontSize:10},
  xpWrap:    {display:'flex',flexDirection:'column',gap:3,minWidth:140},
  xpTop:     {display:'flex',justifyContent:'space-between'},
  lvlBadge:  {background:'#7c6df0',color:'#fff',fontSize:10,fontWeight:600,padding:'1px 8px',borderRadius:10},
  xpAmt:     {color:'#444',fontSize:10},
  xpBg:      {height:4,background:'#1a1a1a',borderRadius:2,overflow:'hidden'},
  xpFill:    {height:'100%',background:'linear-gradient(90deg,#7c6df0,#a89df5)',borderRadius:2,transition:'width 0.5s ease'},
  logoutBtn: {background:'transparent',border:'1px solid #222',borderRadius:8,color:'#555',fontSize:12,padding:'5px 12px',cursor:'pointer'},
  regBtn:    {background:'#7c6df0',color:'#fff !important',borderRadius:8},
};