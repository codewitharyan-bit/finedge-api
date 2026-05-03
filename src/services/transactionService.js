const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const transactionModel = require('../models/transactionsModel');

const genAi = new GoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY
})

const create = (data) => {
    return transactionModel.create(data);
}

const getAll = (UserId, filter = {}) => {
    const query = { user: UserId }

    if (filter.category) {
        query.category = filter.category;
    }
    if (filter.startDate || filter.endDate) {
        query.date = {};
        if (filter.startDate) {
            query.date.$gte = new Date(filter.startDate);
        }
        if (filter.endDate) {
            query.date.$lte = new Date(filter.endDate);
        }
    }

    return transactionModel.find(query).sort({ date: -1 });
}

const getById = (id, UserId) => {
    return transactionModel.findOne({
        _id: id,
        user: UserId
    });
}

const update = (id, data, UserId) => {
    return transactionModel.findOneAndUpdate(
        { _id: id, user: UserId },
        data,
        { new: true }
    );
}

const remove = (id, UserId) => {
    return transactionModel.findOneAndDelete({
        _id: id,
        user: UserId
    });
}

const summary = async (UserId) => {
    const result = await transactionModel.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(UserId) } },
        { $group: { _id: "$type", total: { $sum: "$amount" } } }
    ])
    let income = 0, expense = 0;

    result.forEach(item => {
        if (item._id === 'income') income = item.total;
        else expense = item.total;
    })
    return { income, expense, balance: income - expense };
}

const trends = async (UserId) => {
    return await transactionModel.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(UserId)
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$date" },
                    month: { $month: "$date" },
                    type: "$type"
                },
                total: { $sum: "$amount" }
            }
        },
        {
            $sort: {
                "_id.year": 1,
                "_id.month": 1
            }
        }

    ])
}

const getInsights = async (data) => {
    const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
    Analyze this financial data and:
    - suggest savings tips
    - identify overspending

     Data:
     ${JSON.stringify(data)}
    `;
    const result = await model.generateContent(prompt);
    return result.response.text();
}

module.exports = {
    create,
    getAll,
    getById,
    update,
    remove,
    summary,
    trends,
    getInsights
};