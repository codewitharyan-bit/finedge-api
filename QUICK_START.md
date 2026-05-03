# Quick Start Guide - Testing & JWT Sessions

## Installation

```bash
# Install dependencies
npm install

# Install dev dependencies for testing
npm install --save-dev jest supertest
```

## Configuration

1. Copy `.env.test` to your local environment:
```bash
cp .env.test .env.test
```

2. Update environment variables if needed:
```bash
MONGODB_URI=mongodb://localhost:27017/finedge-test
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-key
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (auto-rerun on file changes)
```bash
npm run test:watch
```

### Specific Test Suite
```bash
# User authentication tests
npm test -- userAuth.test.js

# Transaction tests
npm test -- transactions.test.js

# Session management tests
npm test -- session.test.js
```

### With Coverage Report
```bash
npm test -- --coverage
```

## Test Structure

```
__tests__/
├── routes/
│   ├── userAuth.test.js       # 30+ tests for auth endpoints
│   └── transactions.test.js   # 20+ tests for transaction endpoints
└── services/
    └── session.test.js        # 15+ tests for JWT session management
```

## What's Included

### ✅ Test Cases (65+ tests)

**User Authentication (30+ tests)**
- User registration with validation
- User login with JWT tokens
- User logout and token clearing
- Password change functionality
- Token refresh mechanism
- JWT token validation
- Auth middleware testing

**Transaction Management (20+ tests)**
- Create transactions with auth
- Read all transactions with filters
- Read specific transaction by ID
- Update transactions
- Delete transactions
- User authorization checks
- Date range filtering
- Category filtering

**JWT Session Management (15+ tests)**
- Token verification and validation
- Token extraction from headers/cookies
- Token expiry detection
- Token lifetime calculations
- Session cookie management
- Token claims validation
- Session validation

### ✅ JWT Session Implementation

**Core Features:**
- ✅ Stateless JWT authentication
- ✅ Access & Refresh token system
- ✅ Automatic token refresh
- ✅ HTTP-only secure cookies
- ✅ Token expiry management
- ✅ User session tracking

**Files Added:**
- `src/services/sessionService.js` - JWT session management
- `src/middlewares/enhancedAuthMiddleware.js` - Enhanced auth middleware
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Test environment setup

**Files Modified:**
- `package.json` - Added Jest & Supertest
- `src/services/userService.js` - Fixed token refresh bug

**Documentation:**
- `TESTING.md` - Complete testing guide
- `JWT_SESSION_GUIDE.md` - JWT implementation guide
- `API_ENDPOINTS.md` - API reference with examples
- `.env.test` - Test environment template

## Key Features

### 1. Comprehensive Test Coverage

- **User Endpoints**: Register, login, logout, refresh token, change password
- **Transaction Endpoints**: CRUD operations with filtering
- **Auth Middleware**: Token validation, user extraction
- **JWT Session**: Token verification, refresh, expiry
- **Authorization**: User isolation, permission checks

### 2. JWT Session Management

```javascript
// Login - generates tokens
POST /users/login
→ Returns: accessToken (1h) & refreshToken (7d)

// Protected requests
GET /transactions
→ Requires: Authorization header or cookies

// Auto-refresh
Token expiring soon?
→ Automatically renewed
→ New tokens set in cookies

// Logout
POST /users/logout
→ Clears tokens & invalidates session
```

### 3. Security Features

- ✅ HTTP-only cookies (prevents XSS)
- ✅ Secure flag (HTTPS only in production)
- ✅ Token signing with secrets
- ✅ Refresh token validation
- ✅ Token expiry enforcement
- ✅ User isolation per request
- ✅ SameSite cookie attribute (CSRF protection)

## API Examples

### Register User
```bash
curl -X POST http://localhost:5000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Create Transaction (with JWT)
```bash
curl -X POST http://localhost:5000/transactions \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "category": "Food",
    "type": "expense",
    "description": "Lunch"
  }'
```

### Get All Transactions (with JWT)
```bash
curl -X GET http://localhost:5000/transactions \
  -H "Authorization: Bearer <access_token>"
```

See [API_ENDPOINTS.md](./API_ENDPOINTS.md) for complete API reference.

## Using JWT Session in Code

### Protected Route
```javascript
const { authMiddleware } = require('./middlewares/enhancedAuthMiddleware');

router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    user: req.user,                  // Authenticated user
    expiresIn: req.tokenExpiresIn,   // Token expiry in ms
    expiringSoon: req.isTokenExpiringSoon  // Needs refresh?
  });
});
```

### Auto-Refresh Tokens
```javascript
const { autoRefreshTokenMiddleware } = require('./middlewares/enhancedAuthMiddleware');

// Apply globally
app.use(autoRefreshTokenMiddleware);
```

### Session Management
```javascript
const SessionManager = require('./services/sessionService');

// Verify token
const decoded = SessionManager.verifyToken(token, process.env.JWT_SECRET);

// Check if expiring
if (SessionManager.isTokenExpiringSoon(token)) {
  // Refresh token
}

// Extract from request
const token = SessionManager.extractToken(req, 'both');
```

See [JWT_SESSION_GUIDE.md](./JWT_SESSION_GUIDE.md) for detailed guide.

## Troubleshooting

### Tests Not Running?
```bash
# Check Node.js version
node --version  # Should be 14+

# Clear cache and reinstall
rm -rf node_modules
npm install

# Run with verbose output
npm test -- --verbose
```

### Database Connection Error?
```bash
# Ensure MongoDB is running
mongod

# Check MONGODB_URI in .env.test
MONGODB_URI=mongodb://localhost:27017/finedge-test
```

### Token Not Working?
```bash
# Verify secrets are set
echo $JWT_SECRET
echo $JWT_REFRESH_SECRET

# Check Authorization header format
# Correct: "Authorization: Bearer <token>"
# Wrong:  "Authorization: <token>"
```

### Cookies Not Persisting?
```javascript
// Ensure credentials included in requests
fetch('/api/endpoint', {
  credentials: 'include'  // Required for cookies
});

// Check secure flag for HTTPS
// Production: secure: true
// Development: secure: false
```

## Next Steps

1. **Run all tests**
   ```bash
   npm test
   ```

2. **Review test results**
   - Check coverage report
   - Verify all tests pass

3. **Review documentation**
   - [TESTING.md](./TESTING.md) - Full testing guide
   - [JWT_SESSION_GUIDE.md](./JWT_SESSION_GUIDE.md) - JWT guide
   - [API_ENDPOINTS.md](./API_ENDPOINTS.md) - API reference

4. **Use in development**
   - Run dev server: `npm run dev`
   - Test endpoints with provided examples
   - Extend with more tests as needed

5. **Production deployment**
   - Use strong JWT secrets
   - Enable HTTPS
   - Set secure flag for cookies
   - Implement rate limiting
   - Monitor authentication events

## File Structure

```
finedge-api/
├── __tests__/                          # Test directory
│   ├── routes/
│   │   ├── userAuth.test.js           # Auth tests
│   │   └── transactions.test.js       # Transaction tests
│   └── services/
│       └── session.test.js             # JWT tests
├── src/
│   ├── middlewares/
│   │   ├── authMiddleware.js          # Original auth
│   │   └── enhancedAuthMiddleware.js  # Enhanced auth (NEW)
│   ├── services/
│   │   ├── userService.js            # User logic (FIXED)
│   │   └── sessionService.js         # JWT session (NEW)
│   └── ... (other files)
├── jest.config.js                     # Jest config (NEW)
├── jest.setup.js                      # Jest setup (NEW)
├── .env.test                          # Test env (NEW)
├── TESTING.md                         # Testing guide (NEW)
├── JWT_SESSION_GUIDE.md               # JWT guide (NEW)
├── API_ENDPOINTS.md                   # API reference (NEW)
└── package.json                       # Updated with test deps
```

## Support

For issues or questions:
1. Check [TESTING.md](./TESTING.md)
2. Review [JWT_SESSION_GUIDE.md](./JWT_SESSION_GUIDE.md)
3. Check [API_ENDPOINTS.md](./API_ENDPOINTS.md)
4. Run tests with `--verbose` flag

---

**Version**: 1.0
**Last Updated**: January 2024
**Test Framework**: Jest 29.7.0
**HTTP Testing**: Supertest 6.3.3
**JWT Library**: jsonwebtoken 9.0.3
