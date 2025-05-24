// backend/src/routes/auth.routes.js
const express = require('express');
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middleware/verifyToken'); // For protected routes later

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

// Example of a protected route
router.get('/profile', verifyToken, authController.getProfile);


module.exports = router;