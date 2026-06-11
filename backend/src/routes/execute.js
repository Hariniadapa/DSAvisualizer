// backend/src/routes/execute.js
// Proxies code execution to the Piston API (free, no key required)
// Optional fallback to Judge0 if JUDGE0_API_KEY env var is set
const router = require('express').Router();
const axios  = require('axios');
const auth   = require('../middleware/auth');

// ── Language config for Piston API ────────────────────────────────────────────
const PISTON_LANGS = {
  python:     { language: 'python',     version: '3.10.0',  file: 'solution.py'   },
  javascript: { language: 'javascript', version: '18.15.0', file: 'solution.js'   },
  java:       { language: 'java',       version: '15.0.2',  file: 'Solution.java' },
  cpp:        { language: 'cpp',        version: '10.2.0',  file: 'solution.cpp'  },
  c:          { language: 'c',          version: '10.2.0',  file: 'solution.c'    },
};

// ── Language config for Judge0 API (fallback) ─────────────────────────────────
const JUDGE0_LANGS = {
  python:     71,  // Python 3.8.1
  javascript: 63,  // JavaScript (Node.js 12.14.0)
  java:       62,  // Java (OpenJDK 13.0.1)
  cpp:        54,  // C++ (GCC 9.2.0)
  c:          50,  // C (GCC 9.2.0)
};

// ── Simple in-memory throttle: max 20 requests/min per user ──────────────────
const requestCounts = new Map();
const THROTTLE_WINDOW_MS = 60 * 1000; // 1 minute
const THROTTLE_LIMIT     = 20;

function checkThrottle(userId) {
  const now  = Date.now();
  const data = requestCounts.get(userId) || { count: 0, resetAt: now + THROTTLE_WINDOW_MS };

  // Reset window if expired
  if (now > data.resetAt) {
    data.count   = 0;
    data.resetAt = now + THROTTLE_WINDOW_MS;
  }

  data.count += 1;
  requestCounts.set(userId, data);

  return {
    throttled:   data.count > THROTTLE_LIMIT,
    count:       data.count,
    remaining:   Math.max(0, THROTTLE_LIMIT - data.count),
    resetAt:     data.resetAt,
    resetInSecs: Math.ceil((data.resetAt - now) / 1000),
  };
}

// ── Execute via Piston ────────────────────────────────────────────────────────
async function executeWithPiston(language, code, stdin) {
  const lang = PISTON_LANGS[language];

  const payload = {
    language:             lang.language,
    version:              lang.version,
    files:                [{ name: lang.file, content: code }],
    stdin:                stdin || '',
    args:                 [],
    compile_timeout:      10000,
    run_timeout:          5000,
    compile_memory_limit: -1,
    run_memory_limit:     -1,
  };

  const res = await axios.post(
    'https://emkc.org/api/v2/piston/execute',
    payload,
    { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
  );

  return res.data;
}

// ── Execute via Judge0 (optional fallback) ────────────────────────────────────
async function executeWithJudge0(language, code, stdin) {
  const apiKey    = process.env.JUDGE0_API_KEY;
  const apiHost   = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';
  const langId    = JUDGE0_LANGS[language];

  const submitRes = await axios.post(
    `https://${apiHost}/submissions?base64_encoded=false&wait=true`,
    { source_code: code, language_id: langId, stdin: stdin || '' },
    {
      headers: {
        'Content-Type':       'application/json',
        'X-RapidAPI-Key':     apiKey,
        'X-RapidAPI-Host':    apiHost,
      },
      timeout: 20000,
    }
  );

  const d = submitRes.data;
  return {
    run: {
      stdout: d.stdout || '',
      stderr: d.stderr || d.compile_output || '',
      code:   d.status?.id > 3 ? 1 : 0,
      signal: null,
      output: (d.stdout || '') + (d.stderr || ''),
    },
    compile: {
      stdout: '',
      stderr: d.compile_output || '',
      code:   d.compile_output ? 1 : 0,
      signal: null,
      output: d.compile_output || '',
    },
    memory: d.memory,
  };
}

// ── POST /api/execute ─────────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  const userId  = req.user.id;
  const throttle = checkThrottle(userId);

  // Set rate-limit headers on every response
  res.set('X-RateLimit-Limit',     String(THROTTLE_LIMIT));
  res.set('X-RateLimit-Remaining', String(throttle.remaining));
  res.set('X-RateLimit-Reset',     String(throttle.resetAt));

  if (throttle.throttled) {
    return res.status(429).json({
      error:       'Rate limit exceeded. Please wait before running more code.',
      resetInSecs: throttle.resetInSecs,
      remaining:   0,
    });
  }

  const { code, language, stdin = '' } = req.body;

  // ── Input validation ────────────────────────────────────────────────────────
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid code field.' });
  }

  if (!language || !PISTON_LANGS[language]) {
    return res.status(400).json({
      error: `Unsupported language. Supported: ${Object.keys(PISTON_LANGS).join(', ')}`,
    });
  }

  if (code.length > 50_000) {
    return res.status(400).json({ error: 'Code exceeds maximum length of 50,000 characters.' });
  }

  if (typeof stdin === 'string' && stdin.length > 10_000) {
    return res.status(400).json({ error: 'stdin exceeds maximum length of 10,000 characters.' });
  }

  const pistonLang = PISTON_LANGS[language];

  try {
    let result;

    // Try Piston first
    try {
      result = await executeWithPiston(language, code, stdin);
    } catch (pistonErr) {
      console.warn('Piston failed, checking Judge0 fallback:', pistonErr.message);

      // Fallback to Judge0 if configured
      if (process.env.JUDGE0_API_KEY) {
        result = await executeWithJudge0(language, code, stdin);
      } else {
        throw pistonErr;
      }
    }

    const run     = result.run     || {};
    const compile = result.compile || {};

    res.json({
      language,
      version:   pistonLang.version,
      remaining: throttle.remaining,
      run: {
        stdout: run.stdout  || '',
        stderr: run.stderr  || '',
        code:   run.code    ?? null,
        signal: run.signal  || null,
        output: run.output  || '',
      },
      compile: {
        stdout: compile.stdout || '',
        stderr: compile.stderr || '',
        code:   compile.code   ?? null,
        signal: compile.signal || null,
        output: compile.output || '',
      },
    });

  } catch (err) {
    console.error('Code execution error:', err.response?.data || err.message);

    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      return res.status(504).json({ error: 'Code execution timed out. Check for infinite loops.' });
    }

    if (err.response?.status === 429) {
      return res.status(503).json({ error: 'Execution service is busy. Please try again.' });
    }

    res.status(500).json({
      error: err.response?.data?.message || 'Code execution failed. Please try again.',
    });
  }
});

module.exports = router;
