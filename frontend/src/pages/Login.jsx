// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser }       = useAuth();
  const navigate            = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.username);
      toast.success(`Welcome back, ${res.data.username}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>DSA Visualizer</h2>
        <p style={styles.subtitle}>Login to continue</p>
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          <button style={styles.button} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={styles.link}>
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#0f0f0f' },
  card:      { background:'#1a1a1a', padding:'2rem', borderRadius:'12px', width:'360px', color:'white' },
  title:     { textAlign:'center', fontSize:'1.8rem', marginBottom:'0.2rem' },
  subtitle:  { textAlign:'center', color:'#888', marginBottom:'1.5rem' },
  input:     { width:'100%', padding:'0.75rem', marginBottom:'1rem', borderRadius:'8px', border:'1px solid #333', background:'#111', color:'white', boxSizing:'border-box' },
  button:    { width:'100%', padding:'0.75rem', background:'#6366f1', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'1rem' },
  link:      { textAlign:'center', marginTop:'1rem', color:'#888' }
};