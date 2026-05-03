const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const transactionRoutes = require('../../src/routes/transactionRoutes');
const User = require('../../src/models/usersModels');
const Transaction = require('../../src/models/transactionsModel');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/transactions', transactionRoutes);
  return app;
};

describe('Transaction Endpoints - Core Tests', () => {
  let app;
  let userId;
  let accessToken;

  const testUser = {
    username: 'transactionuser',
    email: 'transactiontest@example.com',
    password: 'TestPassword123!'
  };

  const testTransaction = {
    amount: 100,
    category: 'Food',
    type: 'expense',
    description: 'Lunch'
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

  beforeEach(async () => {
    try {
      await User.deleteMany({ email: testUser.email });
      const user = await User.create(testUser);
      userId = user._id;
      accessToken = user.generateAccessToken();
    } catch (error) {
      console.log('Pre-test setup skipped');
    }
  });

  afterEach(async () => {
    try {
      await Transaction.deleteMany({ user: userId });
      await User.deleteMany({ email: testUser.email });
    } catch (error) {
      console.log('Cleanup skipped');
    }
  });

  describe('Core: Create Transaction', () => {
    it('should create a transaction', async () => {
      const response = await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testTransaction);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('amount', testTransaction.amount);
      expect(response.body.data).toHaveProperty('user', userId.toString());
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/transactions')
        .send(testTransaction);

      expect(response.status).toBe(401);
    });
  });

  describe('Core: Read Transactions', () => {
    beforeEach(async () => {
      try {
        await Transaction.create([
          { ...testTransaction, amount: 50, user: userId },
          { ...testTransaction, amount: 150, user: userId }
        ]);
      } catch (error) {
        console.log('Test data creation skipped');
      }
    });

    it('should get all transactions', async () => {
      const response = await request(app)
        .get('/transactions')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/transactions');

      expect(response.status).toBe(401);
    });
  });

  describe('Core: Update Transaction', () => {
    let transactionId;

    beforeEach(async () => {
      try {
        const transaction = await Transaction.create({
          ...testTransaction,
          user: userId
        });
        transactionId = transaction._id;
      } catch (error) {
        console.log('Test data creation skipped');
      }
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/transactions/${transactionId}`)
        .send({ amount: 200 });

      expect(response.status).toBe(401);
    });
  });

  describe('Core: Delete Transaction', () => {
    let transactionId;

    beforeEach(async () => {
      try {
        const transaction = await Transaction.create({
          ...testTransaction,
          user: userId
        });
        transactionId = transaction._id;
      } catch (error) {
        console.log('Test data creation skipped');
      }
    });

    it('should delete a transaction', async () => {
      const response = await request(app)
        .delete(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete(`/transactions/${transactionId}`);

      expect(response.status).toBe(401);
    });
  });
});
