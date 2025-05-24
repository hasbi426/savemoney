// backend/src/controllers/auth.controller.js
const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const { name, birthday, email, password } = req.body;
    if (!name || !birthday || !email || !password) {
      return res.status(400).json({ message: 'All fields (name, birthday, email, password) are required.' });
    }

    const user = await authService.registerUser({ name, birthday, email, password });
    res.status(201).json({
      message: 'User registered successfully!',
      user,
    });
  } catch (error) {
    next(error); // Pass error to the global error handler
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const result = await authService.loginUser({ email, password });
    res.status(200).json({
      message: 'Login successful!',
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error); // Pass error to the global error handler
  }
};

// Placeholder for future protected route test
const getProfile = async (req, res, next) => {
  // req.user will be populated by verifyToken middleware
  res.status(200).json({ message: "Profile data", user: req.user });
};


module.exports = {
  register,
  login,
  getProfile
};