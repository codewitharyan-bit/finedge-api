# JWT Session Management Guide

## Overview

This guide explains the JWT-based session management system implemented in the FinEdge API. It provides a secure, stateless authentication mechanism using JSON Web Tokens (JWT).

## Architecture

### Token Types

#### Access Token
- **Lifetime**: 1 hour (configurable)
- **Purpose**: Authenticate API requests
- **Storage**: HTTP-only cookie or Authorization header
- **Usage**: Included in every request to protected endpoints

#### Refresh Token
- **Lifetime**: 7 days (configurable)
- **Purpose**: Obtain new access tokens without re-login
- **Storage**: HTTP-only cookie (secure)
- **Usage**: Exchanged for new access token when access token expires

### Token Claims

Both tokens contain:
```javascript
{
  id: "user_mongodb_id",           // User's MongoDB ID
  email: "user@example.com",       // User's email
  username: "username",            // User's username
  role: "user",                    // User's role (future use)
  iat: 1234567890,                 // Issued at (Unix timestamp)
  exp: 1234571490                  // Expires at (Unix timestamp)
}
```

## Implementation

### 1. User Model Methods

File: `src/models/usersModels.js`

```javascript
// Generate access token (1 hour)
user.generateAccessToken()

// Generate refresh token (7 days)
user.generateRefreshToken()
```

### 2. Session Service

File: `src/services/sessionService.js`

Core functionality for session management:

```javascript
// Verify token
SessionManager.verifyToken(token, secret, type)

// Extract token from request
SessionManager.extractToken(req, source)

// Check if token expiring soon
SessionManager.isTokenExpiringSoon(token, warningThreshold)

// Get token expiry time
SessionManager.getTokenExpiryTime(token)

// Decode token without verification
SessionManager.decodeToken(token)

// Set session cookies
SessionManager.setSessionCookies(res, accessToken, refreshToken)

// Clear session cookies
SessionManager.clearSessionCookies(res)
```

### 3. Enhanced Auth Middleware

File: `src/middlewares/enhancedAuthMiddleware.js`

Multiple middleware options for different authentication scenarios:

```javascript
// Required authentication
router.get('/protected', authMiddleware, handler)

// Optional authentication
router.get('/public', optionalAuthMiddleware, handler)

// Auto-refresh tokens
router.use(autoRefreshTokenMiddleware)

// Check session validity
router.get('/session-status', checkSessionMiddleware, handler)
```

## Authentication Flow

### Login Flow

```
1. User sends credentials (email, password)
   ↓
2. Server validates credentials
   ↓
3. Server generates:
   - Access Token (1h)
   - Refresh Token (7d)
   ↓
4. Server saves refresh token to user document
   ↓
5. Server sets both tokens in HTTP-only cookies
   ↓
6. User receives authenticated session
```

### Request Flow

```
1. User makes API request
   ↓
2. Request includes:
   - Authorization header with Bearer token, OR
   - HTTP-only cookies
   ↓
3. Middleware extracts token
   ↓
4. Verify token signature with JWT_SECRET
   ↓
5. Check token expiry
   ├─ Not expired → Continue
   ├─ Expiring soon → Auto-refresh
   └─ Expired → Return 401
   ↓
6. Fetch user from database
   ↓
7. Attach user to req.user
   ↓
8. Process request
```

### Token Refresh Flow

```
1. Access token near expiry (< 5 minutes)
   ↓
2. Auto-refresh middleware triggered
   ↓
3. Validate refresh token
   ↓
4. Check refresh token matches stored value
   ↓
5. Generate new access & refresh tokens
   ↓
6. Update user's refresh token
   ↓
7. Set new tokens in cookies
   ↓
8. Request continues with new tokens
```

### Logout Flow

```
1. User initiates logout
   ↓
2. Server clears refresh token from user document
   ↓
3. Server clears HTTP-only cookies
   ↓
4. Client-side session removed
   ↓
5. User logged out (can't use tokens)
```

## Usage Examples

### 1. Protected Route

```javascript
const { authMiddleware } = require('./middlewares/enhancedAuthMiddleware');

router.get('/profile', authMiddleware, async (req, res) => {
  // req.user contains authenticated user
  res.json({
    user: req.user,
    tokenExpiresIn: req.tokenExpiresIn,
    isTokenExpiringSoon: req.isTokenExpiringSoon
  });
});
```

### 2. Optional Authentication

```javascript
const { optionalAuthMiddleware } = require('./middlewares/enhancedAuthMiddleware');

router.get('/posts', optionalAuthMiddleware, async (req, res) => {
  if (req.user) {
    // Authenticated: show user's personalized posts
    return res.json(await Post.find({ userId: req.user._id }));
  }
  // Not authenticated: show public posts
  res.json(await Post.find({ isPublic: true }));
});
```

### 3. Auto-Refresh Middleware

```javascript
const { autoRefreshTokenMiddleware } = require('./middlewares/enhancedAuthMiddleware');

// Apply globally to auto-refresh expiring tokens
app.use(autoRefreshTokenMiddleware);
```

### 4. Session Status Check

```javascript
const { checkSessionMiddleware } = require('./middlewares/enhancedAuthMiddleware');

router.get('/session-info', checkSessionMiddleware, (req, res) => {
  res.json(req.session);
  // Returns:
  // {
  //   valid: true/false,
  //   userId: "...",
  //   expiresIn: 3600000,
  //   expiringSoon: false,
  //   error: "error message if invalid"
  // }
});
```

## Security Features

### 1. HTTP-Only Cookies
- Tokens stored in HTTP-only cookies by default
- Prevents XSS attacks (JavaScript can't access)
- Automatically sent with requests

### 2. Secure Flag
- Enabled in production (HTTPS only)
- Disabled in development (HTTP)
- Configurable per environment

### 3. SameSite Attribute
- Set to `strict` by default
- Prevents CSRF attacks
- Only sent with same-site requests

### 4. Token Signing
- All tokens signed with secret key
- Tampering detected on verification
- Server validates signature before trust

### 5. Refresh Token Validation
- Refresh token stored in database
- Verified on every refresh request
- Prevents token reuse after logout

### 6. Token Expiry
- Access tokens short-lived (1 hour)
- Automatic renewal via refresh token
- Expired tokens rejected immediately

## Configuration

### Environment Variables

```bash
# JWT Secrets (use strong, random values)
JWT_SECRET=your-super-secret-access-token-key-minimum-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-minimum-32-chars

# Environment
NODE_ENV=production  # or development/test

# Server
PORT=5000
```

### Token Lifetime Configuration

Modify in `src/models/usersModels.js`:

```javascript
// Access Token (1 hour)
userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { id: this._id, ... },
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }  // ← Change here
  );
}

// Refresh Token (7 days)
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { id: this._id, ... },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }  // ← Change here
  );
}
```

### Cookie Options

Modify in `src/services/sessionService.js`:

```javascript
const defaultOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  // Add more options:
  domain: 'example.com',      // Set cookie domain
  path: '/'                   // Cookie path
};
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | No token provided | Login first |
| 401 Invalid token | Token expired | Refresh token |
| 401 Invalid token | Token tampered | Generate new login |
| 404 User not found | User deleted | Create new account |
| 401 Refresh token mismatch | Logout from another device | Login again |

### Error Responses

```javascript
// No token
{
  statusCode: 401,
  message: "No token provided",
  success: false
}

// Expired token
{
  statusCode: 401,
  message: "access token has expired",
  success: false
}

// Invalid token
{
  statusCode: 401,
  message: "Invalid token",
  success: false
}
```

## Testing

See [TESTING.md](./TESTING.md) for comprehensive testing guide.

### Session Tests

```bash
npm test -- __tests__/services/session.test.js
```

### Auth Tests

```bash
npm test -- __tests__/routes/userAuth.test.js
```

## Best Practices

### 1. Token Storage
```javascript
// ✅ GOOD: HTTP-only cookies (automatic)
// Sent automatically with requests
// Secure: JavaScript can't access

// ❌ AVOID: Local/Session storage
// Vulnerable to XSS attacks
// Must manually include in headers
```

### 2. Token Transmission
```javascript
// ✅ GOOD: Authorization header
res.set('Authorization', `Bearer ${token}`);

// ✅ GOOD: HTTP-only cookies (automatic)
// Sent with every request

// ❌ AVOID: Query parameters
// Visible in logs and browser history
```

### 3. Token Refresh
```javascript
// ✅ GOOD: Auto-refresh before expiry
if (SessionManager.isTokenExpiringSoon(token)) {
  // Refresh automatically
}

// ✅ GOOD: Manual refresh on 401
// Attempt refresh on unauthorized response

// ❌ AVOID: Wait until expired
// Causes request failures
```

### 4. Logout
```javascript
// ✅ GOOD: Invalidate refresh token
// Server-side logout effective

// ✅ GOOD: Clear cookies
// Prevents token replay

// ❌ AVOID: Client-side only
// Tokens can be reused if obtained
```

## Production Considerations

### 1. Secret Keys
- Use strong, random secrets (minimum 32 characters)
- Rotate secrets periodically
- Store in secure environment variables
- Never commit to version control

### 2. HTTPS
- Enable secure flag in production
- Enforce HTTPS everywhere
- Use valid SSL certificates

### 3. Rate Limiting
- Limit login attempts
- Prevent token enumeration
- Implement account lockout

### 4. Monitoring
- Log authentication events
- Track failed login attempts
- Monitor token refresh frequency
- Alert on unusual patterns

### 5. Scaling
- Tokens are stateless (no session storage needed)
- Scale horizontally without session sync
- Use Redis only if needed for revocation

## Troubleshooting

### Token not being refreshed
```javascript
// Check if token expiring soon
console.log(SessionManager.isTokenExpiringSoon(token, 5));

// Verify refresh token exists
console.log(user.refreshToken);

// Check middleware order
app.use(authMiddleware);
app.use(autoRefreshTokenMiddleware);  // After auth
```

### Tokens not in cookies
```javascript
// Verify cookie options
SessionManager.setSessionCookies(res, accessToken, refreshToken, {
  secure: false,  // For development
  httpOnly: true
});

// Check browser cookies
// DevTools → Application → Cookies
```

### Cross-domain issues
```javascript
// Check CORS and credentials
app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000'
}));

// Fetch with credentials
fetch('/api/endpoint', {
  credentials: 'include'  // Include cookies
});
```

---

**Version**: 1.0
**Last Updated**: 2024
**JWT Library**: jsonwebtoken 9.0.3
