// backend/src/routes/execute.js
// Proxies code execution to the Piston API (free, no key required)
// Piston supports: python, javascript, java, cpp, c, and 100+ more
const router = require('express').Router();
const axios  = require('axios');
const auth   = require('../middleware/auth');

// ── Language config for Piston API ────────────────────────────────────────────
const PISTON_LANGS = {
  python:     { language: 'python',     version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  java:       { language: 'java',       version: '15.0.2' },
  cpp:        { language: 'cpp',        version: '10.2.0' },
  c:          { language: 'c',          version: '10.2.0' },
};

// ── Simple in-memory throttle: max 10 requests/min per user ──────────────────
const requestCounts = new Map();
const THROTTLE_WINDOW_MS = 60 * 1000; // 1 minute
const THROTTLE_LIMIT     = 10;

function isThrottled(userId) {
  const now  = Date.now();
  const data = requestCounts.get(userId) || { count: 0, resetAt: now + THROTTLE_WINDOW_MS };

  // Reset window if expired
  if (now > data.resetAt) {
    data.count   = 0;
    data.resetAt = now + THROTTLE_WINDOW_MS;
  }

  data.count += 1;
  requestCounts.set(userId, data);

  return data.count > THROTTLE_LIMIT;
}

// ── POST /api/execute ─────────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  const userId = req.user.id;

  // Throttle check
  if (isThrottled(userId)) {
    return res.status(429).json({
      error: 'Rate limit exceeded. You can run up to 10 executions per minute.'
    });
  }

  const { code, language, stdin = '' } = req.body;

  // ── Input validation ──────────────────────────────────────────────────────
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid code field.' });
  }

  if (!language || !PISTON_LANGS[language]) {
    return res.status(400).json({
      error: `Unsupported language. Supported: ${Object.keys(PISTON_LANGS).join(', ')}`
    });
  }

  if (code.length > 50_000) {
    return res.status(400).json({ error: 'Code exceeds maximum length of 50,000 characters.' });
  }

  const pistonLang = PISTON_LANGS[language];

  try {
    // Determine filename based on language
    const filenameMap = {
      python: 'solution.py',
      javascript: 'solution.js',
      java: 'Solution.java',
      cpp: 'solution.cpp',
      c: 'solution.c'
    };

    const pistonPayload = {
      language: pistonLang.language,
      version:  pistonLang.version,
      files: [
        {
          name:    filenameMap[language] || 'solution.txt',
          content: code
        }
      ],
      stdin:            stdin || '',
      args:             [],
      compile_timeout:  10000,  // 10 seconds to compile
      run_timeout:      5000,   // 5 seconds to run
      compile_memory_limit: -1,
      run_memory_limit:     -1
    };

    const pistonRes = await axios.post(
      'https://emkc.org/api/v2/piston/execute',
      pistonPayload,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000  // 20 second total timeout
      }
    );

    const result = pistonRes.data;

    // Normalize response
    const run     = result.run     || {};
    const compile = result.compile || {};

    res.json({
      language,
      version:  pistonLang.version,
      run: {
        stdout:   run.stdout   || '',
        stderr:   run.stderr   || '',
        code:     run.code     ?? null,   // exit code
        signal:   run.signal   || null,
        output:   run.output   || ''      // combined stdout+stderr
      },
      compile: {
        stdout: compile.stdout || '',
        stderr: compile.stderr || '',
        code:   compile.code   ?? null,
        signal: compile.signal || null,
        output: compile.output || ''
      }
    });

  } catch (err) {
    console.error('Piston execution error:', err.response?.data || err.message);

    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Code execution timed out. Check for infinite loops.' });
    }

    res.status(500).json({
      error: err.response?.data?.message || 'Code execution failed. Please try again.'
    });
  }
});

module.exports = router;
