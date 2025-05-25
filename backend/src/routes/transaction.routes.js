// backend/src/routes/transaction.routes.js
const express = require('express');
const transactionController = require('../controllers/transaction.controller');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// All transaction routes should be protected
router.use(verifyToken);

router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getUserTransactions);
router.get('/summary', transactionController.getSummary); // Must be before /:transactionId
router.get('/:transactionId', transactionController.getSingleTransaction);
router.patch('/:transactionId', transactionController.patchTransaction);
router.delete('/:transactionId', transactionController.removeTransaction);

module.exports = router;