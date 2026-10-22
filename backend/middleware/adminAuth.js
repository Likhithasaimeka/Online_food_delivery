// Middleware to verify admin JWT tokens.
const jwt = require('jsonwebtoken');
const adminConfig = require('../config/admin');

const adminAuth = (request, response, next) => {
  const authHeader = request.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return response.status(401).json({ message: 'Missing admin token' });
  }

  try {
    const payload = jwt.verify(token, adminConfig.jwtSecret);
    // Attach admin payload to request for downstream use.
    request.admin = payload;
    return next();
  } catch (error) {
    return response.status(401).json({ message: 'Invalid or expired admin token' });
  }
};

module.exports = adminAuth;
