// backend/src/routes/ml.js
// Proxy between frontend and ML microservice on :5001
const router = require('express').Router();
const axios  = require('axios');
const auth   = require('../middleware/auth');

const ML = process.env.ML_SERVICE_URL;

// POST /api/ml/difficulty
router.post('/difficulty', auth, async (req, res) => {
  const mlRes = await axios.post(`${ML}/predict/difficulty`, req.body);
  res.json(mlRes.data);
});

// POST /api/ml/mastery
router.post('/mastery', auth, async (req, res) => {
  const mlRes = await axios.post(`${ML}/predict/mastery`, req.body);
  res.json(mlRes.data);
});

// POST /api/ml/sketch
router.post('/sketch', auth, async (req, res) => {
  const mlRes = await axios.post(`${ML}/predict/sketch`, req.body);
  res.json(mlRes.data);
});

module.exports = router;