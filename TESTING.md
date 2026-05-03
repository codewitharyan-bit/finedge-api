# Testing Guide - FinEdge API

## Overview

This document provides a comprehensive guide for running tests in the FinEdge API project. The project uses Jest as the testing framework and Supertest for HTTP testing.

## Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.test` file for test environment variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/finedge-test
   JWT_SECRET=test-jwt-secret-key
   JWT_REFRESH_SECRET=test-jwt-refresh-secret-key
   PORT=5000
   NODE_ENV=test
   ```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test File
```bash
npm test -- __tests__/routes/userAuth.test.js
```

### Run Tests with Coverage Report
```bash
npm test -- --coverage
```

### Run Tests with Verbose Output
```bash
npm test -- --verbose
```

## Test Structure

```
__tests__/
├── routes/
│   ├── userAuth.test.js          # User authentication endpoints
│   └── transactions.test.js       # Transaction CRUD endpoints
```

## Test Suites

### 1. User Authentication Tests (`userAuth.test.js`)

Tests for user-related endpoints:

#### POST /users/register
- ✅ Register new user successfully
- ✅ Fail on duplicate email
- ✅ Fail on missing required fields

#### POST /users/login
- ✅ Login successfully with valid credentials
- ✅ Return JWT tokens in response
- ✅ Fail with invalid email
- ✅ Fail with wrong password

#### POST /users/logout
- ✅ Logout user and clear cookies
- ✅ Fail without authentication token

#### POST /users/change-password
- ✅ Change password successfully
- ✅ Fail with incorrect current password
- ✅ Fail without authentication

#### JWT Token Validation
- ✅ Reject requests without token
- ✅ Reject requests with malformed token

### 2. Transaction Tests (`transactions.test.js`)

Tests for transaction CRUD operations:

#### POST /transactions
- ✅ Create transaction successfully
- ✅ Attach user ID to transaction
- ✅ Fail without authentication
- ✅ Fail with invalid data

#### GET /transactions
- ✅ Retrieve all transactions for user
- ✅ Filter by category
- ✅ Filter by date range
- ✅ Fail without authentication

#### GET /transactions/:id
- ✅ Get specific transaction by ID
- ✅ Fail with invalid transaction ID
- ✅ Fail without authentication

#### PUT /transactions/:id
- ✅ Update transaction successfully
- ✅ Fail without authentication
- ✅ Fail with invalid ID

#### DELETE /transactions/:id
- ✅ Delete transaction successfully
- ✅ Fail without authentication
- ✅ Fail with non-existent transaction

#### Authorization
- ✅ Prevent users from accessing other users' transactions


    └─ Invalidate Refresh Token
```

## Environment Variables

Required environment variables for testing:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/finedge-test

# JWT Secrets (must be >= 32 characters in production)
JWT_SECRET=your-access-token-secret-key-here
JWT_REFRESH_SECRET=your-refresh-token-secret-key-here

# Server
PORT=5000
NODE_ENV=test
```

## Common Issues and Solutions

### Issue: Tests timeout
**Solution**: Increase test timeout in jest.config.js:
```javascript
testTimeout: 15000
```

### Issue: Database connection errors
**Solution**: Ensure MongoDB is running and MONGODB_URI is correct:
```bash
# Start MongoDB
mongod
```

### Issue: Token validation fails
**Solution**: Verify JWT secrets are consistent:
```javascript
expect(process.env.JWT_SECRET).toBeDefined();
expect(process.env.JWT_REFRESH_SECRET).toBeDefined();
```

### Issue: Cookie not being set
**Solution**: Check if secure flag is appropriate:
```javascript
// For development
secure: process.env.NODE_ENV === 'production'

// For testing
secure: false
```

## Best Practices

1. **Always clean up test data**
   ```javascript
   afterEach(async () => {
     await User.deleteMany({ email: testUser.email });
   });
   ```

2. **Use meaningful test descriptions**
   ```javascript
   it('should reject login with invalid email', async () => {
     // Test implementation
   });
   ```

3. **Test both success and failure paths**
   ```javascript
   // Success
   it('should create user', async () => { });
   
   // Failure
   it('should fail with duplicate email', async () => { });
   ```

4. **Mock external dependencies**
   ```javascript
   jest.mock('../external/service');
   ```

5. **Keep tests isolated**
   - Each test should be independent
   - Don't rely on test execution order
   - Clean up after each test

## CI/CD Integration

To integrate with CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test -- --coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Performance Tips

1. Use `--maxWorkers=1` for sequential test execution
2. Run specific test suites in parallel
3. Mock database calls for faster tests
4. Use in-memory database for tests

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [JWT.io](https://jwt.io/)
- [OAuth 2.0 Bearer Token Usage](https://tools.ietf.org/html/rfc6750)

## Contributing Tests

When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure all tests pass: `npm test`
3. Check coverage: `npm test -- --coverage`
4. Update this documentation
5. Submit PR with tests

---

**Last Updated**: 2024
**Test Framework**: Jest 29.7.0
**HTTP Testing**: Supertest 6.3.3
