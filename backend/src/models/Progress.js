// backend/src/models/Progress.js
// Tracks each user's attempt on each problem
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId:          { type: String, required: true },   // e.g. "1234_A"
  topic:              { type: String, required: true },   // e.g. "dp", "graphs"
  attempts:           { type: Number, default: 0 },
  solved:             { type: Boolean, default: false },
  hintsUsed:          { type: Number, default: 0 },
  avgTimeSecs:        { type: Number, default: 0 },
  consecutiveCorrect: { type: Number, default: 0 },
  lastAttempted:      { type: Date, default: Date.now },
  nextReviewDate:     { type: Date, default: Date.now },
  masteryPercent:     { type: Number, default: 0 }
});

// One record per user per problem
progressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);