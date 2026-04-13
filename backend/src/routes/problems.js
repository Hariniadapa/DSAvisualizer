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
      id:         `${p.contestId}_${p.index}`,
      name:       p.name,
      rating:     p.rating,
      tags:       p.tags,
      url:        `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`
    }));

  res.json(result);
});

module.exports = router;