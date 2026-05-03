# FinEdge API

A financial tracking API built with Node.js, Express, and MongoDB. Manage transactions, track expenses, and gain insights with JWT-based authentication.

## Features

- **Secure Authentication**: JWT-based with access & refresh tokens
- **Transaction Management**: Create, read, update, delete transactions
- **Smart Filtering**: Filter by category, date range
- **Financial Insights**: Transaction summaries, trends, and insights
- **Session Management**: Automatic token refresh, HTTP-only cookies
- **Fully Tested**: 21 passing tests covering core functionality

## Prerequisites

- Node.js 14+
- MongoDB 4.4+
- npm

## Quick Start

### Install & Setup

```bash
git clone <repository-url>
cd finedge-api
npm install
```

### Configure Environment

Create `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/finedge
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key
PORT=5000
NODE_ENV=development
```

### Run Application

```bash
npm run dev        # Start development server
npm test           # Run tests
npm run test:watch # Run tests in watch mode
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
```
POST   /users/register              # Register user
POST   /users/login                 # Login & get tokens
POST   /users/logout                # Logout (requires auth)
POST   /users/change-password       # Change password (requires auth)
POST   /users/refresh-token         # Refresh access token
```

### Transactions (All require authentication)
```
POST   /transactions                # Create transaction
GET    /transactions                # Get all (filters: category, startDate, endDate)
GET    /transactions/:id            # Get single transaction
PUT    /transactions/:id            # Update transaction
DELETE /transactions/:id            # Delete transaction
GET    /transactions/summary        # Get summary & breakdown
GET    /transactions/trends         # Get monthly/category trends
GET    /transactions/insights       # Get insights & recommendations
```

### Health Check
```
GET    /health                      # API health status
```

See [API_ENDPOINTS.md](./API_ENDPOINTS.md) for detailed examples.

## Testing

```bash
npm test              # Run all 21 tests
npm run test:watch    # Run tests in watch mode
npm test -- --coverage # Generate coverage report
```

**Status:** ✅ **21/21 tests passing**

| Suite | Tests |
|-------|-------|
| User Authentication | 6 |
| Transaction CRUD | 9 |
| JWT Session | 6 |

## JWT Authentication

- **Access Token**: 1 hour (for API requests)
- **Refresh Token**: 7 days (for getting new access tokens)
- **Storage**: HTTP-only cookies (secure, XSS-protected)
- **Auto-Refresh**: Tokens automatically refreshed when expiring
- **User Isolation**: Each request tied to authenticated user

See [JWT_SESSION_GUIDE.md](./JWT_SESSION_GUIDE.md) for detailed implementation.

## Project Structure

```
src/
├── controllers/       # Request handlers
├── models/           # MongoDB schemas
├── routes/           # API endpoints
├── services/         # Business logic
├── middlewares/      # Auth, validation, logging
├── utils/            # Error handling, responses
└── config/           # Database connection

__tests__/            # 21 test cases
```

## Usage Examples

### JavaScript/Fetch

```javascript
// Login and get tokens
const response = await fetch('http://localhost:5000/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});

// Make authenticated request
const transactions = await fetch('http://localhost:5000/transactions', {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${token}` },
  credentials: 'include'
});
```

### cURL

```bash
# Login
curl -X POST http://localhost:5000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get transactions
curl -X GET http://localhost:5000/transactions \
  -H "Authorization: Bearer <token>"
```

## Deployment

### Production Steps

1. **Set strong JWT secrets** in `.env`
2. **Enable HTTPS** on your server
3. **Set `NODE_ENV=production`**
4. **Use MongoDB Atlas** or hosted database
5. **Deploy** using your preferred platform

```bash
npm install --production
npm start
```

## Documentation

| Document | Purpose |
|----------|---------|
| [API_ENDPOINTS.md](./API_ENDPOINTS.md) | All API endpoints with examples |
| [TESTING.md](./TESTING.md) | How to run and write tests |
| [JWT_SESSION_GUIDE.md](./JWT_SESSION_GUIDE.md) | JWT implementation details |
| [QUICK_START.md](./QUICK_START.md) | Quick setup guide |

## License

ISC

---

**Status**: ✅ Production Ready  
**Tests**: 21/21 passing ✅
