// backend/src/services/transaction.service.js
const { Transaction, sequelize, Op } = require('../models'); // Op for operators, sequelize for fn/col

const addTransaction = async (userId, transactionData) => {
  const { description, amount, type, date, category } = transactionData;
  try {
    const transaction = await Transaction.create({
      description,
      amount,
      type,
      date,
      category,
      userId, // Sequelize handles the foreign key column name (user_id)
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

  if (sortField === 'date') { // Ensure createdAt is secondary sort for date to maintain order for same-day entries
      orderClause.push(['createdAt', 'DESC']);
  }


  // Date filtering
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
        const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday
        calculatedStartDate = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate());
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6); // Saturday
        calculatedEndDate = new Date(lastDayOfWeek.getFullYear(), lastDayOfWeek.getMonth(), lastDayOfWeek.getDate());
    }
    if (calculatedStartDate && calculatedEndDate) {
        whereClause.date = { [Op.between]: [calculatedStartDate.toISOString().split('T')[0], calculatedEndDate.toISOString().split('T')[0]] };
    }
  }

  if (type) whereClause.type = type;
  if (category) whereClause.category = { [Op.iLike]: `%${category}%` }; // Case-insensitive search for category

  const transactions = await Transaction.findAndCountAll({
    where: whereClause,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    order: orderClause,
  });
  return transactions; // { count, rows }
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

  if (period === 'month') {
    queryStartDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    queryEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  } else if (period === 'year') {
    queryStartDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    queryEndDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
  } else { // Default to current month if period is invalid
    queryStartDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    queryEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
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
    where: { ...whereClause, type: 'expense' },
    group: ['category'],
    order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
    raw: true,
  });

  const recentTransactions = await Transaction.findAll({
    where: { userId }, // Can also filter by period for recent
    limit: 5,
    order: [['date', 'DESC'], ['createdAt', 'DESC']],
  });

  return {
    period: { startDate: queryStartDate, endDate: queryEndDate, display: period },
    totalIncome: parseFloat(totalIncome),
    totalExpenses: parseFloat(totalExpenses),
    netSavings: parseFloat(totalIncome) - parseFloat(totalExpenses),
    expensesByCategory: expensesByCategory.map(item => ({
        category: item.category || 'Uncategorized', // Handle null categories
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