const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const userRoutes = require('../../src/routes/userRoutes');
const User = require('../../src/models/usersModels');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/users', userRoutes);
  return app;
};

describe('User Authentication - Core Tests', () => {
  let app;
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPassword123!'
  };

  beforeAll(async () => {
    app = createTestApp();
    if (mongoose.connection.readyState === 0) {
      try {
        await mongoose.connect(process.env.MONGODB_URI);
      } catch (error) {
        console.log('Database connection skipped');
      }
    }
  });

  afterEach(async () => {
    try {
      await User.deleteMany({ email: testUser.email });
    } catch (error) {
      console.log('Cleanup skipped');
    }
  });

  describe('Core: User Registration & Login', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/users/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('email', testUser.email);
      expect(response.body.data).toHaveProperty('username', testUser.username);
    });

    it('should login successfully', async () => {
      await request(app).post('/users/register').send(testUser);

      const response = await request(app)
        .post('/users/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('email', testUser.email);
    });

    it('should fail login with wrong password', async () => {
      await request(app).post('/users/register').send(testUser);

      const response = await request(app)
        .post('/users/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Core: Authentication Required', () => {
    it('should reject requests without token', async () => {
      const response = await request(app)
        .post('/users/logout');

      expect(response.status).toBe(401);
    });

    it('should reject with invalid token', async () => {
      const response = await request(app)
        .post('/users/logout')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
