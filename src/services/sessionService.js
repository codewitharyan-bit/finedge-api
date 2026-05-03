/**
 * JWT Session Management Service
 * Handles JWT token validation, refresh, and session lifecycle
 */

const jwt = require('jsonwebtoken');
const apiError = require('../utils/apiError');

class SessionManager {
  /**
   * Verify JWT token and extract claims
   * @param {string} token - JWT token to verify
   * @param {string} secret - JWT secret key
   * @param {string} type - Token type ('access' or 'refresh')
   * @returns {object} Decoded token payload
   */
  static verifyToken(token, secret, type = 'access') {
    try {
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new apiError(401, `${type} token has expired`);
      } else if (error.name === 'JsonWebTokenError') {
        throw new apiError(401, `Invalid ${type} token`);
      }
      throw new apiError(401, `${type} token validation failed`);
    }
  }

  /**
   * Extract token from request (Authorization header or cookie)
   * @param {object} req - Express request object
   * @param {string} source - Token source ('header', 'cookie', or 'both')
   * @returns {string|null} JWT token or null
   */
  static extractToken(req, source = 'both') {
    let token = null;

    // Check Authorization header
    if (['header', 'both'].includes(source)) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    // Check cookies
    if (!token && ['cookie', 'both'].includes(source)) {
      token = req.cookies?.accessToken;
    }

    return token;
  }

  /**
   * Validate session and return user info
   * @param {string} token - JWT token
   * @returns {object} User session data
   */
  static validateSession(token) {
    return this.verifyToken(token, process.env.JWT_SECRET, 'access');
  }

  /**
   * Check if token is close to expiration
   * @param {string} token - JWT token
   * @param {number} warningThreshold - Minutes before expiry to warn (default: 5)
   * @returns {boolean} True if token is expiring soon
   */
  static isTokenExpiringSoon(token, warningThreshold = 5) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return false;

      const expiryTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;
      const warningTimeMs = warningThreshold * 60 * 1000;

      return timeUntilExpiry < warningTimeMs && timeUntilExpiry > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get token expiry time
   * @param {string} token - JWT token
   * @returns {number|null} Milliseconds until expiry, or null if invalid
   */
  static getTokenExpiryTime(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return null;

      const expiryTime = decoded.exp * 1000;
      return Math.max(0, expiryTime - Date.now());
    } catch (error) {
      return null;
    }
  }

  /**
   * Decode token without verification (for inspection)
   * @param {string} token - JWT token
   * @returns {object|null} Decoded payload or null
   */
  static decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Create session response with appropriate headers and cookies
   * @param {object} res - Express response object
   * @param {string} accessToken - Access token
   * @param {string} refreshToken - Refresh token
   * @param {object} options - Additional cookie options
   * @returns {object} Response object for chaining
   */
  static setSessionCookies(res, accessToken, refreshToken, options = {}) {
    const defaultOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      ...options
    };

    const accessTokenExpiry = {
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
      ...defaultOptions
    };

    const refreshTokenExpiry = {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      ...defaultOptions
    };

    res.cookie('accessToken', accessToken, accessTokenExpiry);
    res.cookie('refreshToken', refreshToken, refreshTokenExpiry);

    return res;
  }

  /**
   * Clear session cookies
   * @param {object} res - Express response object
   * @returns {object} Response object for chaining
   */
  static clearSessionCookies(res) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res;
  }
}

module.exports = SessionManager;
