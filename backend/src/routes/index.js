// backend/src/routes/index.js
const express = require('express');
const authRoutes = require('./auth.routes');
// Import other route files here as you create them
// const transactionRoutes = require('./transaction.routes');

const router = express.Router();

router.use('/auth', authRoutes);
// router.use('/transactions', transactionRoutes); // Example

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to SaveMoney API v1' });
});


module.exports = router;