// backend/src/routes/problems.js
// Fetches problems from Codeforces API and serves them to the frontend
const router = require('express').Router();
const axios  = require('axios');
const auth   = require('../middleware/auth');

// GET /api/problems?topic=dp&difficulty=medium
router.get('/', auth, async (req, res) => {
  const { topic, difficulty } = req.query;

  // Fetch directly from Codeforces (fresh data always)
  const cfRes = await axios.get('https://codeforces.com/api/problemset.problems');
  let problems = cfRes.data.result.problems;

  // Filter by tag if provided
  if (topic) {
    problems = problems.filter(p =>
      p.tags && p.tags.includes(topic)
    );
  }

  // Filter by difficulty (rating range)
  if (difficulty === 'easy')
    problems = problems.filter(p => p.rating && p.rating <= 1200);
  else if (difficulty === 'medium')
    problems = problems.filter(p => p.rating && p.rating > 1200 && p.rating <= 1900);
  else if (difficulty === 'hard')
    problems = problems.filter(p => p.rating && p.rating > 1900);

  // Return top 20 with rating only
  const result = problems
    .filter(p => p.rating)
    .slice(0, 20)
.map(p => ({
  // ✅ ADD THESE (MAIN FIX)
  contestId: p.contestId,
  index: p.index,

  // ✅ KEEP this (useful)
  problemId: `${p.contestId}-${p.index}`,

  // existing fields
  name: p.name,
  rating: p.rating,
  tags: p.tags,

  url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`
}));

  res.json(result);
});

// GET /api/problems/:contestId/:index
router.get('/:contestId/:index', auth, async (req, res) => {
  const { contestId, index } = req.params;

  if (!contestId || !index) {
    return res.status(400).json({ error: 'contestId and index are required' });
  }

  try {
    const cfRes = await axios.get('https://codeforces.com/api/problemset.problems');
    const problems = cfRes.data.result.problems;

    const problem = problems.find(p =>
      String(p.contestId) === String(contestId) &&
      String(p.index).toUpperCase() === String(index).toUpperCase()
    );

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found on Codeforces' });
    }

    const result = {
      contestId: problem.contestId,
      index: problem.index,
      problemId: `${problem.contestId}-${problem.index}`,
      name: problem.name,
      rating: problem.rating || 1200,
      tags: problem.tags || [],
      url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`
    };

    res.json(result);
  } catch (err) {
    console.error('Error fetching problem details:', err.message);
    res.status(500).json({ error: 'Failed to retrieve problem details' });
  }
});

module.exports = router;