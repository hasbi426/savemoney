// backend/src/routes/bill.routes.js
const express = require('express');
const billController = require('../controllers/bill.controller');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

router.use(verifyToken); // Protect all bill routes

router.post('/', billController.createBill);
router.get('/', billController.getUserBills);
router.get('/reminders', billController.getReminderBillsController); // For the reminder modal
router.get('/:billId', billController.getSingleBill);
router.patch('/:billId', billController.patchBill); // Use PATCH for partial updates
router.delete('/:billId', billController.removeBill);

module.exports = router;