const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  let token = null;

  // 1. Try to read token from cookies
  if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(^| )token=([^;]+)/);
    if (match) {
      token = match[2];
    }
  }

  // 2. Fallback to Authorization Header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Please login first.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_study_circle_token_2026_key_ap_telangana');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session. Please login again.' });
  }
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied. Insufficient privileges.' });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole
};
