// backend/src/controllers/bill.controller.js
const billService = require('../services/bill.service');

const createBill = async (req, res, next) => {
  try {
    const { name, amount, dueDate, recurrence } = req.body; // Basic required fields
    if (!name || amount === undefined || !dueDate || !recurrence) {
      return res.status(400).json({ message: 'Name, amount, dueDate, and recurrence are required for a bill.' });
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number.'});
    }
    const bill = await billService.addBill(req.user.id, req.body);
    res.status(201).json(bill);
  } catch (error) { next(error); }
};

const getUserBills = async (req, res, next) => {
  try {
    const billsData = await billService.getBillsByUser(req.user.id, req.query);
    res.status(200).json(billsData);
  } catch (error) { next(error); }
};

const getSingleBill = async (req, res, next) => {
    try {
        const bill = await billService.getBillById(req.user.id, req.params.billId);
        res.status(200).json(bill);
    } catch (error) {
        next(error);
    }
};
const patchBill = async (req, res, next) => {
    try {
        const bill = await billService.updateBill(req.user.id, req.params.billId, req.body);
        res.status(200).json(bill);
    } catch (error) {
        next(error);
    }
};
const removeBill = async (req, res, next) => {
    try {
        await billService.deleteBill(req.user.id, req.params.billId);
        res.status(200).json({ message: 'Bill deleted successfully' }); // Or 204 No Content
    } catch (error) {
        next(error);
    }
};
    
const getReminderBillsController = async (req, res, next) => { // Renamed to avoid conflict
    try {
        const bills = await billService.getBillsForReminder(req.user.id);
        res.status(200).json(bills); // Send array, frontend can pick first one for the modal
    } catch (error) {
        next(error);
    }
};

module.exports = { createBill, getUserBills, getSingleBill, patchBill, removeBill, getReminderBillsController };