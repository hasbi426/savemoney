// backend/src/services/auth.service.js
const { User } = require('../models'); // Will use the User model configured by models/index.js
const { comparePassword } = require('../utils/password.util');
const { generateToken } = require('../utils/jwt.util');

const registerUser = async (userData) => {
  const { name, birthday, email, password } = userData;

  try {
    // Check if user already exists (email is unique)
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error('Email address already in use.');
      error.statusCode = 409; // Conflict
      throw error;
    }

    // User model's beforeCreate hook will hash the password
    const newUser = await User.create({
      name,
      birthday,
      email,
      password,
    });

    // Don't send password back, even hashed
    const userJson = newUser.toJSON();
    delete userJson.password;

    return userJson;
  } catch (error) {
    // Catch Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      const validationError = new Error(messages.join(', '));
      validationError.statusCode = 400; // Bad Request
      throw validationError;
    }
    throw error; // Re-throw other errors
  }
};

const loginUser = async (loginData) => {
  const { email, password } = loginData;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401; // Unauthorized
    throw error;
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401; // Unauthorized
    throw error;
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
  };
  const token = generateToken(tokenPayload);

  const userJson = user.toJSON();
  delete userJson.password;

  return { user: userJson, token };
};

module.exports = {
  registerUser,
  loginUser,
};