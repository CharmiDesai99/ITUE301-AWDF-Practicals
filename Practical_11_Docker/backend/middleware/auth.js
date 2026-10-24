const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_practical7_2026'
      );

      // Attach decoded user info to request (excluding password)
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User belonging to this token no longer exists',
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Not authorized, token failed or expired',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Not authorized, access token missing',
    });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_practical7_2026'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
      return next();
    } catch (error) {
      console.error('JWT Verification Error (optionalAuth):', error.message);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Not authorized, token failed or expired',
      });
    }
  }

  // No token provided; proceed unauthenticated (Practicals 4, 5, 6)
  req.user = null;
  next();
};

module.exports = { protect, optionalAuth };
