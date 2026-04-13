// backend/src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true, trim: true },
  email:        { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  cfHandle:     { type: String, default: '' },  // Codeforces handle (optional)
  createdAt:    { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);