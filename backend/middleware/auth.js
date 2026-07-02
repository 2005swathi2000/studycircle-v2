const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
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
    return next();
  } catch (err) {
    // Access token is invalid or expired. Let's see if there is a refresh token cookie.
    let refreshToken = null;
    if (req.headers.cookie) {
      const match = req.headers.cookie.match(/(^| )refreshToken=([^;]+)/);
      if (match) {
        refreshToken = match[2];
      }
    }

    if (!refreshToken) {
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }

    try {
      const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret_study_circle_2026');
      if (decodedRefresh.type !== 'refresh') {
        return res.status(401).json({ error: 'Session expired. Please login again.' });
      }

      // Fetch user to verify they still exist and are approved
      const { User } = require('../models');
      const user = await User.findByPk(decodedRefresh.id);
      if (!user) {
        return res.status(401).json({ error: 'User account not found.' });
      }
      if (!user.isApproved) {
        return res.status(403).json({ error: 'Your account is pending administrator approval.' });
      }

      // Generate a new access token
      const remember = !!decodedRefresh.rememberMe;
      const newAccessToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'super_secret_study_circle_token_2026_key_ap_telangana',
        { expiresIn: remember ? '30d' : '7d' }
      );

      // Set new access token cookie
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('token', newAccessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
      });

      // Also set a custom header so the client API wrapper can sync its local fallback token
      res.setHeader('x-new-access-token', newAccessToken);

      req.user = { id: user.id, username: user.username, role: user.role };
      req.newAccessToken = newAccessToken; // Expose to the request
      return next();
    } catch (refreshErr) {
      console.error('[authMiddleware] Refresh token error:', refreshErr);
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }
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
