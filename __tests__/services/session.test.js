const jwt = require('jsonwebtoken');
const SessionManager = require('../../src/services/sessionService');

describe('JWT Session Management - Core Tests', () => {
  const testPayload = {
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    username: 'testuser'
  };

  let validToken;

  beforeAll(() => {
    validToken = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  describe('Core: Token Verification', () => {
    it('should verify a valid token', () => {
      const decoded = SessionManager.verifyToken(validToken, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('id', testPayload.id);
      expect(decoded).toHaveProperty('email', testPayload.email);
    });

    it('should reject invalid token', () => {
      expect(() => {
        SessionManager.verifyToken('invalid-token', process.env.JWT_SECRET);
      }).toThrow();
    });
  });

  describe('Core: Token Extraction', () => {
    it('should extract token from Authorization header', () => {
      const req = {
        headers: { authorization: `Bearer ${validToken}` },
        cookies: {}
      };

      const token = SessionManager.extractToken(req, 'header');
      expect(token).toBe(validToken);
    });

    it('should extract token from cookies', () => {
      const req = {
        headers: {},
        cookies: { accessToken: validToken }
      };

      const token = SessionManager.extractToken(req, 'cookie');
      expect(token).toBe(validToken);
    });
  });

  describe('Core: Token Expiry', () => {
    it('should calculate remaining token lifetime', () => {
      const expiryTime = SessionManager.getTokenExpiryTime(validToken);
      expect(expiryTime).toBeGreaterThan(0);
      expect(expiryTime).toBeLessThanOrEqual(60 * 60 * 1000);
    });

    it('should detect token validity', () => {
      const decoded = SessionManager.validateSession(validToken);
      expect(decoded).toHaveProperty('id');
    });
  });

  describe('Core: Token Decoding', () => {
    it('should decode a valid token', () => {
      const decoded = SessionManager.decodeToken(validToken);
      expect(decoded).toHaveProperty('id', testPayload.id);
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
    });
  });

  describe('Core: Session Cookies', () => {
    it('should set session cookies', () => {
      const res = { cookie: jest.fn() };
      SessionManager.setSessionCookies(res, validToken, validToken);
      expect(res.cookie).toHaveBeenCalled();
    });

    it('should clear session cookies', () => {
      const res = { clearCookie: jest.fn() };
      SessionManager.clearSessionCookies(res);
      expect(res.clearCookie).toHaveBeenCalledWith('accessToken');
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
    });
  });
});
