// backend/src/routes/index.js
const express = require('express');
const authRoutes = require('./auth.routes');
const transactionRoutes = require('./transaction.routes');
const billRoutes = require('./bill.routes'); // <<<--- IMPORT

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/bills', billRoutes); // <<<--- MOUNT

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to SaveMoney API v1' });
});

router.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    const error = new Error('API Endpoint Not Found');
    error.statusCode = 404;
    next(error);
  } else {
    next();
  }
});

module.exports = router;