// backend/src/routes/progress.js
const router   = require('express').Router();
const axios    = require('axios');
const auth     = require('../middleware/auth');
const Progress = require('../models/Progress');

const ML = process.env.ML_SERVICE_URL;

// POST /api/progress/attempt  — called after every submission
router.post('/attempt', auth, async (req, res) => {
  const { problemId, topic, solved, hintsUsed, timeSecs } = req.body;
  const userId = req.user.id;

  // Find or create progress record
  let record = await Progress.findOne({ userId, problemId });

  if (!record) {
    record = new Progress({ userId, problemId, topic });
  }

  // Update stats
  record.attempts += 1;
  record.hintsUsed += hintsUsed || 0;
  record.lastAttempted = new Date();

  // Running average of time
  record.avgTimeSecs = Math.round(
    (record.avgTimeSecs * (record.attempts - 1) + (timeSecs || 60)) / record.attempts
  );

  if (solved) {
    record.solved = true;
    record.consecutiveCorrect += 1;
  } else {
    record.consecutiveCorrect = 0;
  }

  // Call ML mastery predictor
  // REPLACE the ML mastery call block with:
try {
  const mlRes = await axios.post(`${ML}/predict/mastery`, {
    user_data: {
      rating_at_submission: 1200,   // default — later fetch from CF API with user's handle
      cf_rating:            1200,   // problem rating placeholder
      topic_complexity:     1,
      attempts_so_far:      record.attempts,
      avg_time_on_problem:  record.avgTimeSecs,
      hints_used:           record.hintsUsed,
      consecutive_correct:  record.consecutiveCorrect
    }
  });

  record.masteryPercent = mlRes.data.mastery_percent;
  record.nextReviewDate = new Date(
    Date.now() + mlRes.data.next_review_days * 24 * 60 * 60 * 1000
  );
} catch (e) {
  console.log('ML service unavailable, skipping mastery update');
}

  await record.save();
  res.json(record);
});

// GET /api/progress  — get all progress for logged-in user
router.get('/', auth, async (req, res) => {
  const records = await Progress.find({ userId: req.user.id });
  res.json(records);
});

// GET /api/progress/review  — problems due for review today
router.get('/review', auth, async (req, res) => {
  const due = await Progress.find({
    userId:         req.user.id,
    nextReviewDate: { $lte: new Date() },
    solved:         true
  });
  res.json(due);
});

module.exports = router;