require('dotenv').config({ path: '.env.test' });
const mongoose = require('mongoose');

// Mock database connection for tests
beforeAll(async () => {
  // Tests can use MongoDB in-memory database or mock
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finedge-test';
});

afterAll(async () => {
  // Cleanup connections
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
});

// Mock JWT secrets for testing
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key';
process.env.PORT = process.env.PORT || 5000;
