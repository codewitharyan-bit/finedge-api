const transactionService = require('../services/transactionService');
const asyncHandler = require('../utils/asyncHandler');
const apiError = require('../utils/apiError');
const apiResponse = require('../utils/apiResponse');

const createTransaction = asyncHandler(async (req, res) => {
      const data  ={
            ...req.body,
            user: req.user._id
      }
      try {
         const transaction = await transactionService.create(data);
             return res.status(201)
            .json(new apiResponse(201, transaction,"Transaction created successfully"));
      } catch (error) {
        throw new apiError(400, error.message);
      }
})

const getAllTransactions = asyncHandler(async (req, res) => {
        const { category, startDate, endDate } = req.query;
        const filter = {
            category,
            startDate,
            endDate
      }
      try {
         const transactions = await transactionService.getAll(req.user._id,filter);
         return res.status(200)
         .json(new apiResponse(200, transactions, "Transactions fetched successfully"));
      } catch (error) {
        throw new apiError(500, error.message);
      }
})

const getTransactionById = asyncHandler(async (req, res) => {
      try {
            const transaction = await transactionService.getById(req.params.id, req.user._id);
            if (!transaction) {
                  throw new apiError(404, "Transaction not found");
            }
            return res.status(200)
            .json(new apiResponse(200, transaction, "Transaction fetched successfully"));

      } catch (error) {
        throw new apiError(500, error.message);
      }
})

const updateTransaction = asyncHandler(async (req, res) => {
      try {
            const transaction = await transactionService.update(req.params.id, req.body, req.user._id);
            if (!transaction) {
                  throw new apiError(404, "Transaction not found");
            }
            return res.status(200)
            .json(new apiResponse(200, transaction, "Transaction updated successfully"));
      } catch (error) {
        throw new apiError(500, error.message);
      }
})

const deleteTransaction = asyncHandler(async (req, res) => {
      try {
            const transaction = await transactionService.remove(req.params.id, req.user._id);
            if (!transaction) {
                  throw new apiError(404, "Transaction not found");
            }
            return res.status(200)
            .json(new apiResponse(200, null, "Transaction deleted successfully"));
      } catch (error) {
        throw new apiError(500, error.message);
      }
})

const getSummary = asyncHandler(async (req, res) => {
      try {
            const summary = await transactionService.summary(req.user._id);
            return res.status(200)
            .json(new apiResponse(200, summary, "Summary fetched successfully"));
      } catch (error) {
        throw new apiError(500, error.message);
      }
})

const trends = asyncHandler(async (req, res) => {
      try {
            const trendsData = await transactionService.trends(req.user._id);
            return res.status(200)
            .json(new apiResponse(200, trendsData, "Trends fetched successfully"));
      } catch (error) {
        throw new apiError(500, error.message);
      }
})


const getInsights = asyncHandler(async (req, res) => {
      try {
            const insights = await transactionService.getInsights(req.user._id);
            return res.status(200)
            .json(new apiResponse(200, insights, "Insights fetched successfully"));
      } catch (error) {
        throw new apiError(500, error.message);
      }
})


module.exports = {
      createTransaction,
      getAllTransactions,
      getTransactionById,
      updateTransaction,
      deleteTransaction,
      getSummary,
      trends,
      getInsights    
}

