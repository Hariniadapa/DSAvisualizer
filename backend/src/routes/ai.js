// backend/src/routes/ai.js
// Socratic AI coach using Groq API
const router = require('express').Router();
const axios  = require('axios');
const auth   = require('../middleware/auth');

// POST /api/ai/hint
router.post('/hint', auth, async (req, res) => {
  try {
    const { problemName, topic, userCode, attemptCount } = req.body;

    // Socratic prompt — asks questions instead of giving answers
const prompt = `
You are a Socratic DSA coach. NEVER give the solution directly.
Each time you are called, your question must be DIFFERENT from previous hints.

Problem: ${problemName}
Topic: ${topic}
Student's current code:
\`\`\`
${userCode || 'No code written yet'}
\`\`\`
This is hint number: ${attemptCount}

Rules based on hint number:
- Hint 1: Ask about their overall approach and what data structure they'd use
- Hint 2: Ask specifically about time complexity or edge cases
- Hint 3: Ask about a specific part of their code or algorithm step
- Hint 4+: Ask a very targeted question about the exact bottleneck

Keep response under 3 sentences. Do NOT repeat previous questions.
`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',  // you can change to another Groq model if needed
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type':  'application/json'
          
        },
        timeout: 15000   // ← 15-second timeout added
      }
    );

    // OpenAI-style response
    const hint = response.data.choices[0].message.content;
    res.json({ hint });

  } catch (err) {
    console.error('AI hint error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to generate hint' });
  }
});

module.exports = router;