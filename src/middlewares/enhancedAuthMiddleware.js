/**
 * Enhanced Authentication Middleware with JWT Session Management
 * Provides token validation, refresh token handling, and session management
 */

const UserModel = require('../models/usersModels');
const apiError = require('../utils/apiError');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const SessionManager = require('../services/sessionService');

/**
 * Main authentication middleware
 * Validates access token and attaches user to request
 */
const authMiddleware = asyncHandler(async (req, _, next) => {
  try {
    // Extract token from header or cookies
    const token = SessionManager.extractToken(req, 'both');

    if (!token) {
      throw new apiError(401, 'No token provided');
    }

    // Verify token
    const decoded = SessionManager.validateSession(token);

    // Fetch user from database
    const user = await UserModel.findById(decoded.id).select('-password -refreshToken');

    if (!user) {
      throw new apiError(404, 'User not found');
    }

    // Attach user and token info to request
    req.user = user;
    req.token = token;
    req.tokenExpiresIn = SessionManager.getTokenExpiryTime(token);
    req.isTokenExpiringSoon = SessionManager.isTokenExpiringSoon(token);

    next();
  } catch (error) {
    if (error instanceof apiError) {
      throw error;
    }
    throw new apiError(401, 'Invalid token');
  }
});

/**
 * Optional authentication middleware
 * Does not fail if token is missing, but attaches user if valid token is present
 */
const optionalAuthMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const token = SessionManager.extractToken(req, 'both');

    if (token) {
      const decoded = SessionManager.validateSession(token);
      const user = await UserModel.findById(decoded.id).select('-password -refreshToken');

      if (user) {
        req.user = user;
        req.token = token;
        req.tokenExpiresIn = SessionManager.getTokenExpiryTime(token);
        req.isTokenExpiringSoon = SessionManager.isTokenExpiringSoon(token);
      }
    }

    next();
  } catch (error) {
    // Silently pass, user will be undefined
    next();
  }
});

/**
 * Token refresh middleware
 * Automatically refreshes token if it's expiring soon
 */
const autoRefreshTokenMiddleware = asyncHandler(async (req, res, next) => {
  try {
    if (req.user && req.isTokenExpiringSoon) {
      // Get refresh token from cookies
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        try {
          // Verify refresh token
          const decoded = SessionManager.verifyToken(
            refreshToken,
            process.env.JWT_REFRESH_SECRET,
            'refresh'
          );

          // Fetch user and generate new tokens
          const user = await UserModel.findById(decoded.id);

          if (user && user.refreshToken === refreshToken) {
            const newAccessToken = user.generateAccessToken();
            const newRefreshToken = user.generateRefreshToken();

            // Update stored refresh token
            user.refreshToken = newRefreshToken;
            await user.save({ validateBeforeSave: true });

            // Set new tokens in cookies
            SessionManager.setSessionCookies(res, newAccessToken, newRefreshToken, {
              secure: process.env.NODE_ENV === 'production'
            });

            // Update request with new token info
            req.token = newAccessToken;
            req.tokenExpiresIn = SessionManager.getTokenExpiryTime(newAccessToken);
            req.isTokenExpiringSoon = false;

            // Add refresh info to response headers
            res.set('X-Token-Refreshed', 'true');
          }
        } catch (error) {
          // Refresh token is invalid or expired, continue without refreshing
          console.log('Token refresh failed:', error.message);
        }
      }
    }

    next();
  } catch (error) {
    // Don't fail the request, just continue
    next();
  }
});

/**
 * Check session validity middleware
 * Useful for checking session status without blocking
 */
const checkSessionMiddleware = asyncHandler(async (req, res, next) => {
  const token = SessionManager.extractToken(req, 'both');

  if (token) {
    try {
      const decoded = SessionManager.validateSession(token);
      req.session = {
        valid: true,
        userId: decoded.id,
        expiresIn: SessionManager.getTokenExpiryTime(token),
        expiringSoon: SessionManager.isTokenExpiringSoon(token)
      };
    } catch (error) {
      req.session = {
        valid: false,
        error: error.message
      };
    }
  } else {
    req.session = {
      valid: false,
      error: 'No token provided'
    };
  }

  next();
});

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  autoRefreshTokenMiddleware,
  checkSessionMiddleware
};
