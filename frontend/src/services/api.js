// frontend/src/services/api.js
// All backend calls in one place — easy to change base URL later
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api'
});

// Attach JWT token to every request automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ───────────────────────────────────
export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);

// ── Problems ───────────────────────────────
export const getProblems = (topic, difficulty) =>
  api.get('/problems', { params: { topic, difficulty } });

// ── Progress ───────────────────────────────
export const submitAttempt = (data) => api.post('/progress/attempt', data);
export const getProgress   = ()     => api.get('/progress');
export const getReviewQueue = ()    => api.get('/progress/review');

// ── ML ─────────────────────────────────────
export const predictDifficulty = (features)  => api.post('/ml/difficulty', { features });
export const predictMastery    = (user_data) => api.post('/ml/mastery', { user_data });
export const predictSketch     = (strokes)   => api.post('/ml/sketch', { strokes });

// ── AI Coach ───────────────────────────────
export const getHint = (data) => api.post('/ai/hint', data);