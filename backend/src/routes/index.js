// backend/src/routes/index.js
const express = require('express');
const authRoutes = require('./auth.routes');
const transactionRoutes = require('./transaction.routes'); // Import

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes); // Mount transaction routes

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to SaveMoney API v1' });
});

// Catch-all for API routes not found (optional, but good practice)
router.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) { // Only for /api routes
    const error = new Error('API Endpoint Not Found');
    error.statusCode = 404;
    next(error);
  } else {
    next(); // Pass to other non-API handlers if any
  }
});

module.exports = router;