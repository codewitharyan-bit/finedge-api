const express = require('express');
const router = express.Router();
const validator = require('../middlewares/validator');
const authMiddleware = require('../middlewares/authMiddleware');
const transactionController = require('../controllers/transactionController');

router.post('/', authMiddleware, validator, transactionController.createTransaction);
router.get('/', authMiddleware, transactionController.getAllTransactions);
router.get('/summary', authMiddleware, transactionController.getSummary);
router.get('/:id', authMiddleware, transactionController.getTransactionById);
router.put('/:id', authMiddleware, validator, transactionController.updateTransaction);
router.delete('/:id', authMiddleware, transactionController.deleteTransaction);
router.get('/trends', authMiddleware, transactionController.trends);
router.get('/insights', authMiddleware, transactionController.getInsights);

module.exports = router;