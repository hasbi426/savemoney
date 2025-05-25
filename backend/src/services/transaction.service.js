// backend/src/services/transaction.service.js
const { Transaction, User, sequelize, Op } = require('../models');

const addTransaction = async (userId, transactionData) => {
  const { description, amount, type, date, category } = transactionData;
  try {
    const transaction = await Transaction.create({
      description,
      amount,
      type,
      date,
      category,
      userId,
    });
    return transaction;
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      const validationError = new Error(messages.join(', '));
      validationError.statusCode = 400;
      throw validationError;
    }
    throw error;
  }
};

const getTransactionsByUser = async (userId, queryParams) => {
  const { period, startDate, endDate, limit = 10, offset = 0, type, category, sortField = 'date', sortOrder = 'DESC' } = queryParams;
  let whereClause = { userId };
  let orderClause = [[sortField, sortOrder.toUpperCase()]];

  if (sortField === 'date') {
      orderClause.push(['createdAt', 'DESC']);
  }

  if (startDate && endDate) {
    whereClause.date = { [Op.between]: [startDate, endDate] };
  } else if (period) {
    const now = new Date();
    let calculatedStartDate, calculatedEndDate;
    if (period === 'month') {
      calculatedStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
      calculatedEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === 'year') {
      calculatedStartDate = new Date(now.getFullYear(), 0, 1);
      calculatedEndDate = new Date(now.getFullYear(), 11, 31);
    } else if (period === 'week') {
        const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1) )); // Monday as first day
        calculatedStartDate = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate());
        const lastDayOfWeek = new Date(calculatedStartDate);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6); // Sunday
        calculatedEndDate = new Date(lastDayOfWeek.getFullYear(), lastDayOfWeek.getMonth(), lastDayOfWeek.getDate());
    }
    if (calculatedStartDate && calculatedEndDate) {
        whereClause.date = { [Op.between]: [calculatedStartDate.toISOString().split('T')[0], calculatedEndDate.toISOString().split('T')[0]] };
    }
  }

  if (type) whereClause.type = type;
  if (category) whereClause.category = { [Op.iLike]: `%${category}%` };

  const transactions = await Transaction.findAndCountAll({
    where: whereClause,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    order: orderClause,
  });
  return transactions;
};

const getTransactionById = async (userId, transactionId) => {
    const transaction = await Transaction.findOne({ where: { id: transactionId, userId } });
    if (!transaction) {
        const error = new Error('Transaction not found or access denied');
        error.statusCode = 404;
        throw error;
    }
    return transaction;
};

const updateTransaction = async (userId, transactionId, updateData) => {
    const transaction = await Transaction.findOne({ where: { id: transactionId, userId } });
    if (!transaction) {
        const error = new Error('Transaction not found or access denied');
        error.statusCode = 404;
        throw error;
    }
    const allowedUpdates = ['description', 'amount', 'type', 'date', 'category'];
    const updates = {};
    for (const key of allowedUpdates) {
        if (updateData[key] !== undefined) {
            updates[key] = updateData[key];
        }
    }
    await transaction.update(updates);
    return transaction;
};

const deleteTransaction = async (userId, transactionId) => {
    const transaction = await Transaction.findOne({ where: { id: transactionId, userId } });
    if (!transaction) {
        const error = new Error('Transaction not found or access denied');
        error.statusCode = 404;
        throw error;
    }
    await transaction.destroy();
    return { message: 'Transaction deleted successfully' };
};

const getDashboardSummary = async (userId, period = 'month') => {
  let queryStartDate, queryEndDate;
  const now = new Date();
  let displayPeriod = period;

  if (period === 'month') {
    queryStartDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    queryEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  } else if (period === 'year') {
    queryStartDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    queryEndDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
  } else if (period === 'week') {
    const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1) )); // Monday
    queryStartDate = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate()).toISOString().split('T')[0];
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6); // Sunday
    queryEndDate = new Date(lastDayOfWeek.getFullYear(), lastDayOfWeek.getMonth(), lastDayOfWeek.getDate()).toISOString().split('T')[0];
  } else {
    // Default to current month if period is invalid or not provided
    queryStartDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    queryEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    displayPeriod = 'month'; // Set display period to the default
  }

  const whereClause = {
    userId,
    date: { [Op.between]: [queryStartDate, queryEndDate] },
  };

  const totalIncome = await Transaction.sum('amount', {
    where: { ...whereClause, type: 'income' },
  }) || 0;

  const totalExpenses = await Transaction.sum('amount', {
    where: { ...whereClause, type: 'expense' },
  }) || 0;

  const expensesByCategory = await Transaction.findAll({
    attributes: [
      'category',
      [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
    ],
    where: { ...whereClause, type: 'expense', category: {[Op.ne]: null} }, // Exclude null categories from chart
    group: ['category'],
    order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
    raw: true,
  });

  const recentTransactions = await Transaction.findAll({
    where: { userId },
    limit: 5,
    order: [['date', 'DESC'], ['createdAt', 'DESC']],
  });

  return {
    period: { startDate: queryStartDate, endDate: queryEndDate, display: displayPeriod },
    totalIncome: parseFloat(totalIncome),
    totalExpenses: parseFloat(totalExpenses),
    netSavings: parseFloat(totalIncome) - parseFloat(totalExpenses),
    expensesByCategory: expensesByCategory.map(item => ({
        category: item.category, // Category will not be null here due to where clause
        total_amount: parseFloat(item.total_amount)
    })),
    recentTransactions,
  };
};

module.exports = {
  addTransaction,
  getTransactionsByUser,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getDashboardSummary,
};