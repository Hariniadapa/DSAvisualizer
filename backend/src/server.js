// backend/src/server.js
require('express-async-errors');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/ml',       require('./routes/ml'));
app.use('/api/ai',       require('./routes/ai'));
app.use('/api/execute',  require('./routes/execute'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});

// Connect to MongoDB then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`Backend running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('MongoDB error:', err));