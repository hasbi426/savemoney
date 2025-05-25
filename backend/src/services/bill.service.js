// backend/src/services/bill.service.js
const { Bill, User, Op, sequelize } = require('../models'); // User might not be needed directly, Op and sequelize are
const { parseISO, startOfMonth, endOfMonth, addMonths, format, isBefore, startOfDay, isSameDay } = require('date-fns'); // date-fns for date logic

const addBill = async (userId, billData) => {
  try {
    // Ensure amount is a number
    billData.amount = parseFloat(billData.amount);
    if (isNaN(billData.amount)) {
        const error = new Error('Amount must be a valid number.');
        error.statusCode = 400; throw error;
    }
    const bill = await Bill.create({ ...billData, userId });
    return bill;
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      const validationError = new Error(messages.join(', '));
      validationError.statusCode = 400; throw validationError;
    }
    console.error("Error in addBill service:", error); // Log other errors
    throw error;
  }
};

const getBillsByUser = async (userId, queryParams = {}) => {
  const { /* status, period, etc. for future filtering */ } = queryParams;
  const today = startOfDay(new Date()); // Normalize today to start of day for comparisons

  // Fetch bills that are relevant for the "Tagihan Berjalan" section
  // This includes unpaid, overdue, or upcoming soon, or recently paid.
  const currentBills = await Bill.findAll({
    where: {
      userId,
      [Op.or]: [
        { status: { [Op.in]: ['unpaid', 'overdue'] } },
        { status: 'upcoming', dueDate: { [Op.lte]: format(addMonths(today, 1), 'yyyy-MM-dd') } }, // Upcoming in next month
        { status: 'paid', dueDate: { [Op.gte]: format(startOfMonth(today), 'yyyy-MM-dd') } } // Paid this month
      ]
    },
    order: [['dueDate', 'ASC'], ['name', 'ASC']],
    // limit: 10 // Example limit
  });

  // Fetch bills for "Tagihan Mendatang" (e.g., further out, for planning)
  // This might be bills due next month or specific 'one-time' future bills
  const nextMonthStart = startOfMonth(addMonths(today, 1));
  const twoMonthsFromNext = endOfMonth(addMonths(today, 2)); // Example: bills due next 2 months after current

  const upcomingGroupedBills = await Bill.findAll({
      where: {
          userId,
          dueDate: { [Op.between]: [format(nextMonthStart, 'yyyy-MM-dd'), format(twoMonthsFromNext, 'yyyy-MM-dd')] },
          status: { [Op.in]: ['upcoming', 'unpaid'] } // Not yet paid
      },
      order: [['dueDate', 'ASC']],
      limit: 4, // As per UI design suggestion
  });

  return { currentBills, upcomingGroupedBills };
};

const getBillById = async (userId, billId) => {
    const bill = await Bill.findOne({ where: { id: billId, userId } });
    if (!bill) { const error = new Error('Bill not found or access denied'); error.statusCode = 404; throw error; }
    return bill;
};

const updateBill = async (userId, billId, updateData) => {
    const bill = await Bill.findOne({ where: { id: billId, userId } });
    if (!bill) { const error = new Error('Bill not found or access denied'); error.statusCode = 404; throw error; }
    
    const allowedUpdates = ['name', 'amount', 'dueDate', 'recurrence', 'category', 'status', 'reminderDate', 'notes'];
    const updatesToApply = {};
    for (const key of allowedUpdates) {
        if (updateData[key] !== undefined) {
             if (key === 'amount') updatesToApply[key] = parseFloat(updateData[key]);
             else updatesToApply[key] = updateData[key];
        }
    }

    // If marking as paid, optionally create a corresponding 'expense' transaction
    if (updatesToApply.status === 'paid' && bill.status !== 'paid') {
        const { Transaction } = require('../models'); // Lazy require
        try {
            await Transaction.create({
                description: `Pembayaran tagihan: ${bill.name}`,
                amount: bill.amount,
                type: 'expense',
                date: format(new Date(), 'yyyy-MM-dd'), // Payment date is today
                category: bill.category || 'Tagihan', // Use bill category or default
                userId: userId,
            });
        } catch (transactionError) {
            console.error('Failed to create expense transaction for paid bill:', bill.id, transactionError);
            // Decide if this should prevent the bill status update. For now, it won't.
        }
    }

    await bill.update(updatesToApply);
    return bill.reload(); // Return the updated instance with all fields
};

const deleteBill = async (userId, billId) => {
    const bill = await Bill.findOne({ where: { id: billId, userId } });
    if (!bill) { const error = new Error('Bill not found or access denied'); error.statusCode = 404; throw error; }
    await bill.destroy();
    return { message: 'Bill deleted successfully' };
};

// Service for fetching bills needing reminder (for the modal in your UI)
const getBillsForReminder = async (userId) => {
    const today = startOfDay(new Date());
    // Bills due very soon (e.g., within 7 days) OR whose reminderDate is today/past, and are not paid
    const reminderEndDate = new Date(today);
    reminderEndDate.setDate(today.getDate() + 7); // Due within the next 7 days

    const billsToRemind = await Bill.findAll({
        where: {
            userId,
            status: {[Op.in]: ['unpaid', 'upcoming', 'overdue']}, // Not paid
            [Op.or]: [
                { dueDate: { [Op.between]: [format(today, 'yyyy-MM-dd'), format(reminderEndDate, 'yyyy-MM-dd')] } },
                { reminderDate: { [Op.lte]: format(today, 'yyyy-MM-dd') } } // Reminder date is today or past
            ]
        },
        order: [['dueDate', 'ASC']],
        limit: 1 // For the UI example, the modal shows one main reminder
    });
    return billsToRemind; // Returns an array, could be empty
};

module.exports = { addBill, getBillsByUser, getBillById, updateBill, deleteBill, getBillsForReminder };