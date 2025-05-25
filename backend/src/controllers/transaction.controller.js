// backend/src/controllers/transaction.controller.js
const transactionService = require('../services/transaction.service');

const createTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id; // From verifyToken middleware
    const { description, amount, type, date, category } = req.body;

    // Basic validation
    if (!description || amount === undefined || !type || !date) {
        return res.status(400).json({ message: 'Description, amount, type, and date are required.' });
    }
    if (type !== 'income' && type !== 'expense') {
        return res.status(400).json({ message: 'Type must be either "income" or "expense".' });
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number.' });
    }

    const transaction = await transactionService.addTransaction(userId, {description, amount, type, date, category});
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

const getUserTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactions = await transactionService.getTransactionsByUser(userId, req.query);
    res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};

const getSingleTransaction = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { transactionId } = req.params;
        const transaction = await transactionService.getTransactionById(userId, transactionId);
        res.status(200).json(transaction);
    } catch (error) {
        next(error);
    }
};

const patchTransaction = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { transactionId } = req.params;
        const transaction = await transactionService.updateTransaction(userId, transactionId, req.body);
        res.status(200).json(transaction);
    } catch (error) {
        next(error);
    }
};

const removeTransaction = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { transactionId } = req.params;
        const result = await transactionService.deleteTransaction(userId, transactionId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query; // Default to 'month' if not provided
    const summary = await transactionService.getDashboardSummary(userId, period);
    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getUserTransactions,
  getSingleTransaction,
  patchTransaction,
  removeTransaction,
  getSummary,
};