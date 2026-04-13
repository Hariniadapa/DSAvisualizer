// backend/src/middleware/auth.js
// Protects routes — attach this to any route that needs login
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ error: 'No token, access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // { id, username } now available in all routes
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};